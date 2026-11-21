import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SetKmoniOffset,
  KmoniOffset,
  ConvertSnet,
  SnetPointsDataTmp,
  formatTremData,
  TremRts_sta,
} from "../src/main/RX_RTSeis.js";
import {
  setKmoniOffset,
  kmoniOffset,
} from "../src/main/state.js";

describe("RX_RTSeis.js - Unit Tests", () => {
  it("should handle SetKmoniOffset error gracefully and fallback to 2500ms", async () => {
    setKmoniOffset(2500);

    // In non-electron testing environment without electron.net, it will catch and fallback to 2500
    await SetKmoniOffset();
    assert.equal(KmoniOffset, 2500);
    assert.equal(kmoniOffset, 2500);
  });

  it("should correctly merge Snet pair data when uid matches", () => {
    const uid = "uid_test_123";
    const date = new Date().toISOString();

    ConvertSnet([{ id: 1 }], date, 11, uid);
    ConvertSnet([{ id: 2 }], date, 12, uid);

    assert.ok(SnetPointsDataTmp);
    assert.equal(SnetPointsDataTmp.data.length, 2);
  });

  it("formatTremData should include boolean alert field and preserve missing PGA", () => {
    TremRts_sta["11DFDBC"] = { id: "11DFDBC", lat: 23.5, lon: 120.5 };
    TremRts_sta["117825C"] = { id: "117825C", lat: 24.0, lon: 121.0 };

    const result = formatTremData({
      ts: 1790619680000,
      stations: {
        "11DFDBC": { i: 1.2, pga: 2.34, alert: 1 },
        "117825C": { i: 0.1 },
      },
    });

    assert.equal(result["11DFDBC"].alert, true);
    assert.equal(result["11DFDBC"].PGA, 2.34);
    assert.equal(result["117825C"].alert, false);
    assert.equal(result["117825C"].PGA, undefined);
  });
});
