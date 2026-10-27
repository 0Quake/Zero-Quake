import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";
import * as turf from "@turf/turf";

describe("Map standard API refactoring tests", () => {
  it("settings.js set_map_range uses public getNorthEast and getSouthWest methods", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    assert.ok(src.includes("var ne = b.getNorthEast();"));
    assert.ok(src.includes("var sw = b.getSouthWest();"));
    assert.ok(!src.includes("b._ne"));
    assert.ok(!src.includes("b._sw"));
  });

  it("settings.js getMinLineDistance uses turf.flatten and pointToLineDistance without custom lineString wrapper", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    assert.ok(src.includes("function getMinLineDistance(pt, geojson)"));
    assert.ok(src.includes("var lines = turf.flatten(geojson);"));
    assert.ok(!src.includes("function lineString(arr)"));

    const fnSnippet = src.slice(
      src.indexOf("function getMinLineDistance(pt, geojson) {"),
      src.indexOf("function MapReDraw() {")
    );

    const ctx = { turf };
    vm.runInNewContext(fnSnippet, ctx);

    const pt = turf.point([139.7, 35.6]);
    // Test with MultiLineString
    const mls = turf.multiLineString([
      [[139.0, 35.0], [139.5, 35.5]],
      [[140.0, 35.0], [140.5, 35.5]],
    ]);
    const distMls = ctx.getMinLineDistance(pt, mls);
    assert.ok(distMls > 0 && distMls < 100);

    // Test with Polygon
    const poly = turf.polygon([[
      [139.0, 35.0], [139.5, 35.0], [139.5, 35.5], [139.0, 35.5], [139.0, 35.0],
    ]]);
    const line = turf.polygonToLine(poly);
    const distPoly = ctx.getMinLineDistance(pt, line);
    assert.ok(distPoly > 0 && distPoly < 100);
  });

  it("mainWindow.js psWaveReDraw calculates limitOfRadius directly via meridian turf.distance", () => {
    const src = readFileSync("src/js/mainWindow.js", "utf8");
    assert.ok(src.includes("turf.distance(_center, [longitude, 83], { units: \"kilometers\" })"));
    assert.ok(src.includes("turf.distance(_center, [longitude, -83], { units: \"kilometers\" })"));
    assert.ok(!src.includes("limit_n = turf.lineString"));
  });

  it("mainWindow.js ZoomBounds uses turf.bbox on FeatureCollection directly for fitBounds", () => {
    const src = readFileSync("src/js/mainWindow.js", "utf8");
    assert.ok(src.includes("var ZoomBounds = turf.bbox(turf.featureCollection([_center, p_geometry, s_geometry]));"));
  });
});
