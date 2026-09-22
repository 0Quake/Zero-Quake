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
});
