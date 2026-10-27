import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

describe("mapCommon.js - B22 setupHinanjoLoader tests", () => {
  const source = readFileSync("src/js/mapCommon.js", "utf8");

  it("should not re-register click listeners or duplicate hinanjoLayers when same tile loads multiple times (B22)", () => {
    const events = [];
    const layers = new Set();
    const sources = new Set();
    const hinanjoLayers = [];

    const map = {
      on: (...args) => events.push(args),
      off: (type, id, fn) => {
        const idx = events.findIndex(e => e[0] === type && e[1] === id && e[2] === fn);
        if (idx !== -1) events.splice(idx, 1);
      },
      getLayer: id => layers.has(id),
      getSource: id => sources.has(id),
      removeLayer: id => layers.delete(id),
      removeSource: id => sources.delete(id),
      addSource: id => sources.add(id),
      addLayer: layer => layers.add(layer.id),
    };

    let popupCalls = 0;
    const popupFunc = () => popupCalls++;

    const context = vm.createContext({
      map,
      config: { data: { overlay: ["hinanjo"] } },
      hinanjoLayers,
      popupFunc,
    });

    vm.runInContext(source.slice(source.indexOf("function setupHinanjoLoader(")), context);
    vm.runInContext("setupHinanjoLoader(map, config, hinanjoLayers, popupFunc)", context);

    // Get the sourcedataloading handler
    const loadHandler = events.find(e => e[0] === "sourcedataloading")?.[1];
    assert.ok(loadHandler, "sourcedataloading handler should be registered");

    const tile = {
      sourceId: "hinanjo",
      tile: { tileID: { canonical: { x: 910, y: 405, z: 10 } } },
    };

    // Load same tile 3 times (simulating map pan/zoom/reload)
    loadHandler(tile);
    loadHandler(tile);
    loadHandler(tile);

    // Exactly 1 click listener per layer (eq and ts)
    const eqClicks = events.filter(e => e[0] === "click" && e[1] === "hinanjo_eq_91040510");
    const tsClicks = events.filter(e => e[0] === "click" && e[1] === "hinanjo_ts_91040510");

    assert.equal(eqClicks.length, 1, "Exactly 1 click listener should be registered for eq layer");
    assert.equal(tsClicks.length, 1, "Exactly 1 click listener should be registered for ts layer");

    // hinanjoLayers should contain each layer name only once (length 2, not 6)
    assert.deepEqual(hinanjoLayers, ["hinanjo_eq_91040510", "hinanjo_ts_91040510"]);

    // Firing the click event should call popupFunc exactly once
    eqClicks[0][2]();
    assert.equal(popupCalls, 1, "Popup should be called exactly once per click");
  });
});
