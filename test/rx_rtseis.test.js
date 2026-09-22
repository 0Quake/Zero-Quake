import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initRTSeisContext,
  SetKmoniOffset,
  KmoniOffset,
  ConvertSnet,
  SnetPointsDataTmp,
} from "../src/main/RX_RTSeis.js";

describe("RX_RTSeis.js - Unit Tests", () => {
  it("should handle SetKmoniOffset error gracefully and fallback to 2500ms", async () => {
    let savedOffset = null;
    initRTSeisContext({
      getConfig: () => ({}),
      getReplay: () => 0,
      getKmoniOffset: () => 2500,
      setKmoniOffset: (val) => {
        savedOffset = val;
      },
      UpdateStatus: () => {},
      GeneralError_handler: () => {},
    });

    // In non-electron testing environment without electron.net, it will catch and fallback to 2500
    await SetKmoniOffset();
    assert.equal(KmoniOffset, 2500);
    assert.equal(savedOffset, 2500);
  });

  it("should correctly merge Snet pair data when uid matches", () => {
    const uid = "uid_test_123";
    const date = new Date().toISOString();

    ConvertSnet([{ id: 1 }], date, 11, uid);
    ConvertSnet([{ id: 2 }], date, 12, uid);

    assert.ok(SnetPointsDataTmp);
    assert.equal(SnetPointsDataTmp.data.data.length, 2);
  });
});
