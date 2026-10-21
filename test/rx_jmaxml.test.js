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

  describe("Req_JMAXML - NankaiTroughInfo", () => {
    it("should select Nankai Trough Rinji info even when InfoSerial is omitted", async () => {
      const rx = await import("../src/main/RX_JMAXML.js");

      const nowIso = new Date().toISOString();
      const rinjiWithoutSerialXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control>
    <Title>南海トラフ地震臨時情報</Title>
    <DateTime>${nowIso}</DateTime>
    <Status>通常</Status>
  </Control>
  <Head>
    <Title>南海トラフ地震臨時情報</Title>
    <ReportDateTime>${nowIso}</ReportDateTime>
    <InfoType>発表</InfoType>
    <Headline>
      <Text>南海トラフ地震臨時情報を発表しました。</Text>
    </Headline>
  </Head>
  <Body>
    <EarthquakeInfo>
      <InfoKind>南海トラフ地震臨時情報</InfoKind>
      <Text>現在、南海トラフ沿いで発生した地震についての調査を行っています。</Text>
    </EarthquakeInfo>
  </Body>
</Report>`;

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => ({
          ok: true,
          text: async () => rinjiWithoutSerialXml,
        });

        rx.Req_JMAXML("https://www.data.jma.go.jp/nankai_no_serial_" + Date.now() + ".xml", 1);
        await new Promise((resolve) => setTimeout(resolve, 150));

        assert.ok(rx.NankaiTroughInfo.rinji, "InfoSerialが省略されていてもrinjiとして選択されること");
        assert.equal(rx.NankaiTroughInfo.rinji.kind, "臨時", "kindに'臨時'が設定されること");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("Req_JMAXML - Body & Headline guards (Items 29, 31, 39)", () => {
    it("should safely process earthquake XML without Body or Earthquake", async () => {
      const rx = await import("../src/main/RX_JMAXML.js");
      const nowIso = new Date().toISOString();
      const noBodyXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control><Title>震源・震度に関する情報</Title><DateTime>${nowIso}</DateTime><Status>通常</Status></Control>
  <Head><Title>震源・震度に関する情報</Title><ReportDateTime>${nowIso}</ReportDateTime></Head>
</Report>`;

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => ({ ok: true, text: async () => noBodyXml });
        assert.doesNotThrow(() => {
          rx.Req_JMAXML("https://www.data.jma.go.jp/no_body_" + Date.now() + ".xml", 1);
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should safely handle KatsudoJokyo info with missing Headline or with normal Headline mentioning Nankai Trough", async () => {
      const rx = await import("../src/main/RX_JMAXML.js");
      const nowIso = new Date().toISOString();

      const originalFetch = globalThis.fetch;
      try {
        // 1. Headline 欠落
        const noHeadlineXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control><Title>地震の活動状況等に関する情報</Title><DateTime>${nowIso}</DateTime><Status>通常</Status></Control>
  <Head><Title>地震の活動状況等に関する情報</Title><ReportDateTime>${nowIso}</ReportDateTime></Head>
  <Body><Text>伊豆東部の活動状況です。</Text></Body>
</Report>`;
        globalThis.fetch = async () => ({ ok: true, text: async () => noHeadlineXml });
        assert.doesNotThrow(() => {
          rx.Req_JMAXML("https://www.data.jma.go.jp/no_headline_" + Date.now() + ".xml", 1);
        });
        await new Promise((resolve) => setTimeout(resolve, 50));

        // 2. 南海トラフの語句を含む通常の自由文見出し（破棄されないこと）
        const prevCount = rx.KatsudoJokyoInfoAll.length;
        const normalMentionXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control><Title>地震の活動状況等に関する情報</Title><DateTime>${nowIso}</DateTime><Status>通常</Status></Control>
  <Head>
    <Title>地震の活動状況等に関する情報</Title>
    <ReportDateTime>${nowIso}</ReportDateTime>
    <Headline><Text>南海トラフ地震に関連する情報についても引き続きご留意ください。</Text></Headline>
  </Head>
  <Body><Text>伊豆東部の地震活動状況について説明します。</Text></Body>
</Report>`;
        globalThis.fetch = async () => ({ ok: true, text: async () => normalMentionXml });
        rx.Req_JMAXML("https://www.data.jma.go.jp/mention_" + Date.now() + ".xml", 1);
        await new Promise((resolve) => setTimeout(resolve, 80));
        assert.equal(rx.KatsudoJokyoInfoAll.length, prevCount + 1, "通常の自由文見出しが破棄されず登録されること");

        // 3. 移行措置電文の見出し（正しく破棄・スキップされること）
        const transitionalXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control><Title>地震の活動状況等に関する情報</Title><DateTime>${nowIso}</DateTime><Status>通常</Status></Control>
  <Head>
    <Title>地震の活動状況等に関する情報</Title>
    <ReportDateTime>${nowIso}</ReportDateTime>
    <Headline><Text>南海トラフ地震に関連する情報（臨時）を発表します。</Text></Headline>
  </Head>
  <Body><Text>移行措置本文</Text></Body>
</Report>`;
        globalThis.fetch = async () => ({ ok: true, text: async () => transitionalXml });
        rx.Req_JMAXML("https://www.data.jma.go.jp/transitional_" + Date.now() + ".xml", 1);
        await new Promise((resolve) => setTimeout(resolve, 80));
        assert.equal(rx.KatsudoJokyoInfoAll.length, prevCount + 1, "移行措置見出しは除外されて件数が増えないこと");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
