import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  GenerateEEWText,
  EEW_Clear,
  EEW_Storage,
  EEW_Active,
} from "../src/main/PROC_EEW.js";
import { setConfig, setReplay } from "../src/main/state.js";

describe("PROC_EEW.js - Unit Tests", () => {
  beforeEach(() => {
    setConfig({
      home: {
        name: "東京",
        Section: "東京都２３区",
      },
      Info: {
        EEW: {
          showtraining: false,
          IntType: "max",
        },
      },
      notice: {
        voice: {
          EEW: "緊急地震速報。{region_name}で地震。最大震度{maxInt}。",
          EEWUpdate: "緊急地震速報更新。{region_name}で地震。最大震度{maxInt}。",
          EEWCancel: "先ほどの緊急地震速報は取り消されました。",
        },
      },
    });
    setReplay(0);
  });

  describe("GenerateEEWText", () => {
    it("should generate cancel announcement text when is_cancel is true", () => {
      const text = GenerateEEWText({ is_cancel: true }, false);
      assert.equal(text, "先ほどの緊急地震速報は取り消されました。");
    });

    it("should generate initial EEW text with placeholders replaced", () => {
      const eewData = {
        is_cancel: false,
        region_name: "茨城県南部",
        maxInt: "5-",
      };
      const text = GenerateEEWText(eewData, false);
      assert.equal(text, "緊急地震速報。茨城県南部で地震。最大震度5弱。");
    });

    it("should generate update EEW text when update is true", () => {
      const eewData = {
        is_cancel: false,
        region_name: "茨城県南部",
        maxInt: "5+",
      };
      const text = GenerateEEWText(eewData, true);
      assert.equal(text, "緊急地震速報更新。茨城県南部で地震。最大震度5強。");
    });
  });

  describe("EEW_Clear", () => {
    it("should remove target event from EEW_Active while preserving EEW_Storage", () => {
      EEW_Active.push({ EventID: "20260923001" });
      EEW_Storage.push({ EventID: "20260923001" });

      EEW_Clear("20260923001");

      assert.equal(EEW_Active.some((e) => e.EventID === "20260923001"), false);
      assert.equal(EEW_Storage.some((e) => e.EventID === "20260923001"), true);
    });
  });

  describe("EEW_Marge - Cancellation", () => {
    it("should remove cancelled event from EEW_Active and propagate is_cancel to all previous reports", async () => {
      const { EEW_Marge, resetEEWStorage, clearEEWActive } = await import("../src/main/PROC_EEW.js");
      resetEEWStorage();
      clearEEWActive();

      const eventId = 20261018999988;

      // 第1報
      EEW_Marge({
        alertflg: "警報",
        EventID: eventId,
        serial: 1,
        report_time: new Date(),
        origin_time: new Date(),
        magnitude: 5.0,
        maxInt: "4",
        depth: 10,
        latitude: 35.0,
        longitude: 139.0,
        region_name: "伊豆半島",
        is_cancel: false,
        is_final: false,
        is_training: false,
        warnZones: [],
        source: "test",
      });

      assert.equal(EEW_Active.some((e) => e.EventID === eventId), true);
      assert.equal(EEW_Storage.find((e) => e.EventID === eventId)?.cancelled, false);

      // 取消報（座標・発生時刻なし）
      EEW_Marge({
        alertflg: "予報",
        EventID: eventId,
        serial: 2,
        report_time: new Date(),
        origin_time: null,
        latitude: null,
        longitude: null,
        magnitude: null,
        maxInt: null,
        depth: null,
        region_name: null,
        is_cancel: true,
        is_final: true,
        is_training: false,
        warnZones: [],
        source: "test",
      });

      // EEW_Active から即時消去されていること
      assert.equal(EEW_Active.some((e) => e.EventID === eventId), false);

      // EEW_Storage の cancelled が true かつ過去報の is_cancel も true であること
      const stored = EEW_Storage.find((e) => e.EventID === eventId);
      assert.ok(stored);
      assert.equal(stored.cancelled, true);
      assert.equal(stored.data.every((d) => d.is_cancel === true), true);
    });
  });
});
