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

    it("should clear cancelled category values while preserving valid info", async () => {
      const { MargeEQInfo, EQInfoData } = await import("../src/main/PROC_EQInfo.js");
      const eventId = "20261018999991";
      const now = Date.now();

      // 1. 震度速報（震度4）
      MargeEQInfo([{
        eventId,
        category: "震度速報",
        status: "通常",
        reportDateTime: new Date(now - 40000),
        maxI: "4",
        cancel: false,
      }], 1);
      assert.equal(EQInfoData[eventId].maxI, "4");
      assert.equal(EQInfoData[eventId].cancel, false);

      // 2. 震源情報（M5.0, 駿河湾）
      MargeEQInfo([{
        eventId,
        category: "震源情報",
        status: "通常",
        reportDateTime: new Date(now - 30000),
        epiCenter: "駿河湾",
        M: "5.0",
        cancel: false,
      }], 2);
      assert.equal(EQInfoData[eventId].maxI, "4");
      assert.equal(EQInfoData[eventId].M, "5.0");

      // 3. 震度速報の取消報
      MargeEQInfo([{
        eventId,
        category: "震度速報",
        status: "通常",
        reportDateTime: new Date(now - 20000),
        cancel: true,
      }], 3);
      assert.equal(EQInfoData[eventId].maxI, null, "取消された速報のmaxIはクリアされる");
      assert.equal(EQInfoData[eventId].M, "5.0", "有効な震源情報は残る");
      assert.equal(EQInfoData[eventId].cancel, false, "他種別が有効ならcancel=false");

      // 4. 震源情報の取消報（全取消）
      MargeEQInfo([{
        eventId,
        category: "震源情報",
        status: "通常",
        reportDateTime: new Date(now - 10000),
        cancel: true,
      }], 4);
      assert.equal(EQInfoData[eventId].cancel, true, "全取消時はcancel=true");
    });

    it("should clear M when corrected report explicitly specifies unknown M, while retaining intensity", async () => {
      const { MargeEQInfo, EQInfoData } = await import("../src/main/PROC_EQInfo.js");
      const eventId = "20261018999992";
      const now = Date.now();

      // 第1報: 震源・震度情報 (M: 5.0, 震度4)
      MargeEQInfo([{
        eventId,
        category: "震源・震度に関する情報",
        status: "通常",
        reportDateTime: new Date(now - 30000),
        epiCenter: "三陸沖",
        M: 5.0,
        maxI: "4",
        cancel: false,
      }], 1);
      assert.equal(EQInfoData[eventId].M, 5.0);
      assert.equal(EQInfoData[eventId].maxI, "4");

      // 第2報: 訂正報 (M: null / "NaN" / "Ｍ不明", 震度4)
      MargeEQInfo([{
        eventId,
        category: "震源・震度に関する情報",
        status: "通常",
        reportDateTime: new Date(now - 10000),
        epiCenter: "三陸沖",
        M: null,
        maxI: "4",
        cancel: false,
      }], 2);
      assert.equal(EQInfoData[eventId].M, null, "訂正報のM不明が反映され、旧M5.0が消去されること");
      assert.equal(EQInfoData[eventId].maxI, "4", "震度4は保持されること");
    });

    it("should clear intensity when corrected report removes domestic intensity (e.g. far quake)", async () => {
      const { MargeEQInfo, EQInfoData } = await import("../src/main/PROC_EQInfo.js");
      const eventId = "20261018999993";
      const now = Date.now();

      // 第1報: 震源・震度情報 (M: 5.0, 震度4)
      MargeEQInfo([{
        eventId,
        category: "震源・震度に関する情報",
        status: "通常",
        reportDateTime: new Date(now - 30000),
        epiCenter: "南太平洋",
        M: 5.0,
        maxI: "4",
        cancel: false,
      }], 1);
      assert.equal(EQInfoData[eventId].maxI, "4");

      // 第2報: 訂正報 (遠地地震への訂正、Control/Titleは震源・震度情報、国内震度なし maxI: null)
      MargeEQInfo([{
        eventId,
        category: "震源・震度に関する情報",
        status: "通常",
        reportDateTime: new Date(now - 10000),
        epiCenter: "南太平洋",
        M: 7.0,
        maxI: null,
        cancel: false,
      }], 2);
      assert.equal(EQInfoData[eventId].M, 7.0);
      assert.equal(EQInfoData[eventId].maxI, null, "訂正報で国内震度が無くなった場合、旧震度4が消去されること");
    });

    it("should correctly complete information across different categories", async () => {
      const { MargeEQInfo, EQInfoData } = await import("../src/main/PROC_EQInfo.js");
      const eventId = "20261018999994";
      const now = Date.now();

      // 第1報: 震度速報 (震度4、震源・Mなし)
      MargeEQInfo([{
        eventId,
        category: "震度速報",
        status: "通常",
        reportDateTime: new Date(now - 30000),
        maxI: "4",
        cancel: false,
      }], 1);
      assert.equal(EQInfoData[eventId].maxI, "4");
      assert.ok(!EQInfoData[eventId].M, "震度速報ではMは未設定/null");

      // 第2報: 震源に関する情報 (M: 5.2、震源地名あり、震度なし)
      MargeEQInfo([{
        eventId,
        category: "震源に関する情報",
        status: "通常",
        reportDateTime: new Date(now - 10000),
        epiCenter: "千葉県北東部",
        M: 5.2,
        cancel: false,
      }], 2);
      assert.equal(EQInfoData[eventId].maxI, "4", "震度速報の震度4が保持されること");
      assert.equal(EQInfoData[eventId].M, 5.2, "震源に関する情報のM5.2が補完されること");
      assert.equal(EQInfoData[eventId].epiCenter, "千葉県北東部");
    });
  });
});
