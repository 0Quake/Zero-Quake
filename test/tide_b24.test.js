import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";
import * as turf from "@turf/turf";

describe("Tide station sorting tests (B24)", () => {
  it("RX_RTSeis.js should store lat and lon in obsdata", () => {
    const rtSrc = readFileSync("src/main/RX_RTSeis.js", "utf8");
    assert.ok(rtSrc.includes("lat: st.lat,"));
    assert.ok(rtSrc.includes("lon: st.lon,"));
  });

  it("sort_by_dist_TIDE sorts stations correctly by distance from home", () => {
    const rtSrc = readFileSync("src/main/RX_RTSeis.js", "utf8");
    const funcMatch = rtSrc.match(/function sort_by_dist_TIDE\(data\) \{[\s\S]*?\n\}/);
    assert.ok(funcMatch, "sort_by_dist_TIDE should exist");

    const ctx = {
      turf,
      config: {
        home: {
          latitude: 35.681236, // Tokyo
          longitude: 139.767125,
        },
      },
    };

    vm.runInNewContext(funcMatch[0], ctx);

    // Three stations with differing distances:
    // St1: Yokohama (close to Tokyo, ~28km)
    const st1 = { code: "1", name: "Yokohama", lat: 35.4437, lon: 139.6380 };
    // St2: Osaka (~400km)
    const st2 = { code: "2", name: "Osaka", lat: 34.6937, lon: 135.5023 };
    // St3: Chiba (~35km)
    const st3 = { code: "3", name: "Chiba", lat: 35.6074, lon: 140.1065 };

    const unsorted = [st2, st3, st1];
    const sorted = ctx.sort_by_dist_TIDE(unsorted);

    assert.equal(sorted[0].code, "1", "Nearest should be Yokohama");
    assert.equal(sorted[1].code, "3", "Second nearest should be Chiba");
    assert.equal(sorted[2].code, "2", "Furthest should be Osaka");
  });
});
