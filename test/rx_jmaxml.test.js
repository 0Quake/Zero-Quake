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
});
