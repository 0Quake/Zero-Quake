import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  Process_Hokkaidosanriku,
  HokkaidoSanrikuInfoAll,
} from "../src/main/RX_JMAXML.js";

describe("RX_JMAXML.js - Unit Tests", () => {
  describe("Process_Hokkaidosanriku", () => {
    it("should register new info and ignore duplicates with same reportDate", () => {
      const initialCount = HokkaidoSanrikuInfoAll.length;
      const sampleItem = {
        reportDate: "2026-09-23T04:00:00Z",
        title: "北海道・三陸沖後発地震注意情報",
      };

      Process_Hokkaidosanriku(sampleItem);
      assert.equal(HokkaidoSanrikuInfoAll.length, initialCount + 1);

      // Attempt to push duplicate reportDate
      Process_Hokkaidosanriku(sampleItem);
      assert.equal(HokkaidoSanrikuInfoAll.length, initialCount + 1);
    });
  });

  describe("Req_JMAXMLList", () => {
    it("should process valid entries even when preceded by corrupt entries missing title, id, or updated", async () => {
      const { Req_JMAXMLList } = await import("../src/main/RX_JMAXML.js");
      const { kmoniTimeTmp } = await import("../src/main/state.js");

      // title欠落、id欠落、updated欠落の不正entryと正常entryを含むフィードXML
      const feedXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <!-- title要素欠落 -->
    <id>https://www.data.jma.go.jp/corrupt1.xml</id>
  </entry>
  <entry>
    <!-- id要素欠落 -->
    <title>震度速報</title>
  </entry>
  <entry>
    <!-- updated要素欠落の南海臨時情報 -->
    <title>南海トラフ地震臨時情報（巨大地震注意）</title>
    <link href="https://www.data.jma.go.jp/nankai.xml"/>
  </entry>
  <entry>
    <title>震度速報</title>
    <id>https://www.data.jma.go.jp/valid.xml</id>
    <updated>2026-10-18T12:00:00Z</updated>
  </entry>
</feed>`;

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url) => {
          if (url.includes("feed")) {
            return {
              ok: true,
              text: async () => feedXml,
            };
          }
          return {
            ok: true,
            text: async () => `<Report xmlns="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>震度速報</Title><DateTime>2026-10-18T12:00:00Z</DateTime></Control><Head><ReportDateTime>2026-10-18T12:00:00Z</ReportDateTime></Head><Body><Intensity><Observation><MaxInt>3</MaxInt></Observation></Intensity></Body></Report>`,
          };
        };

        Req_JMAXMLList(1);
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.equal(kmoniTimeTmp.JMAXML?.condition, "success", "不正なentryがあっても全体がErrorにならずsuccessになること");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
