import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  timeDifference,
  GenerateEQInfoText,
} from "../src/main/PROC_EQInfo.js";
import {
  setConfig,
  setReplay,
  setJMAInfoNumber,
  setUSGSInfoNumber,
} from "../src/main/state.js";

describe("PROC_EQInfo.js - Unit Tests", () => {
  beforeEach(() => {
    setConfig({
      Info: {
        EQInfo: {
          showtraining: false,
          showTest: false,
        },
      },
      notice: {
        voice: {
          EQInfo_VoiceIntro: "地震情報",
          EQInfo_Detail_Domestic: "{time}頃、{epicenter}で地震がありました。最大震度は{shindo}、マグニチュードは{magnitude}、深さは{depth}と推定されます。",
          EQInfo_VoiceOutro: "",
        },
      },
    });
    setReplay(0);
    setJMAInfoNumber(10);
    setUSGSInfoNumber(10);
  });

  describe("timeDifference", () => {
    it("should return correct units for seconds", () => {
      const res = timeDifference(15000);
      assert.deepEqual(res, { num: 15, unit: "秒" });
    });

    it("should return correct units for minutes", () => {
      const res = timeDifference(120000);
      assert.deepEqual(res, { num: 2, unit: "分" });
    });

    it("should return correct units for hours", () => {
      const res = timeDifference(3600000 * 3);
      assert.deepEqual(res, { num: 3, unit: "時間" });
    });

    it("should return correct units for days", () => {
      const res = timeDifference(86400000 * 5);
      assert.deepEqual(res, { num: 5, unit: "日" });
    });
  });

  describe("GenerateEQInfoText", () => {
    it("should return empty string for EEW category (handled separately)", () => {
      const text = GenerateEQInfoText({ category: "EEW" });
      assert.equal(text, "");
    });

    it("should return undefined if both epiCenter and maxI are missing", () => {
      const text = GenerateEQInfoText({ category: "震源・震度に関する情報" });
      assert.equal(text, undefined);
    });
  });

  describe("MargeEQInfo", () => {
    it("should process and update EEW reports when an update arrives", async () => {
      const { MargeEQInfo, eqInfo } = await import("../src/main/PROC_EQInfo.js");
      const eventId = "20260923999999";
      const now = Date.now();
      const initialReport = {
        eventId,
        category: "EEW",
        status: "通常",
        reportDateTime: new Date(now - 60000),
        OriginTime: new Date(now - 120000),
        epiCenter: "東京湾",
        M: 4.5,
        maxI: "3",
        cancel: false,
        DetailURL: [],
        axisData: null,
      };

      MargeEQInfo([initialReport], 1);
      const found = eqInfo.jma.find((e) => e.eventId === eventId);
      assert.ok(found);
      assert.equal(found.maxI, "3");

      // Send update with same M and maxI but new reportDateTime
      const updateReport = {
        eventId,
        category: "EEW",
        status: "通常",
        reportDateTime: new Date(now - 30000),
        OriginTime: new Date(now - 120000),
        epiCenter: "東京湾",
        M: 4.5,
        maxI: "3",
        cancel: false,
        DetailURL: [],
        axisData: null,
      };

      MargeEQInfo([updateReport], 2);
      const updated = eqInfo.jma.find((e) => e.eventId === eventId);
      assert.equal(Number(updated.reportDateTime), Number(updateReport.reportDateTime));
    });
  });
});
