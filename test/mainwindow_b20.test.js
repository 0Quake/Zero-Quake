import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

describe("mainWindow.js - B20 activateWindow & kmoniMapUpdate tests", () => {
  const mainSrc = readFileSync("src/js/mainWindow.js", "utf8");

  it("kmoniMapUpdate should accept points array directly without wrappers (B20)", () => {
    const fnCode = mainSrc.slice(
      mainSrc.indexOf("function kmoniMapUpdate("),
      mainSrc.indexOf("function generatePopupContent_K(")
    );

    const states = [];
    const mockMap = {
      getFeatureState: () => ({ shindo: 0, isTriggered: false, visible: false }),
      setFeatureState: (target, state) => states.push({ target, state }),
    };

    const sandbox = {
      map: mockMap,
      kmoni_popup: {},
      generatePopupContent_K: () => "",
    };
    vm.runInNewContext(fnCode, sandbox);

    // K-NET array
    const knetPoints = [{ Code: "K001", data: true, shindo: 1, isTriggered: false, rgb: [10, 20, 30] }];
    sandbox.kmoniMapUpdate(knetPoints, "knet");
    assert.equal(states.length, 1);
    assert.equal(states[0].target.id, "K001");
    assert.equal(states[0].state.shindo, 1);

    // S-NET array
    states.length = 0;
    const snetPoints = [{ Code: "S001", data: true, shindo: 2 }];
    sandbox.kmoniMapUpdate(snetPoints, "snet");
    assert.equal(states.length, 1);
    assert.equal(states[0].target.id, "S001");
    assert.equal(states[0].state.shindo, 2);

    // Non-array input safely ignored without exceptions
    states.length = 0;
    sandbox.kmoniMapUpdate(null, "knet");
    sandbox.kmoniMapUpdate(undefined, "snet");
    sandbox.kmoniMapUpdate({ not: "an array" }, "knet");
    assert.equal(states.length, 0);
  });

  it("activateWindow should re-render latest knetMapData and snetMapData stored during background (B20)", () => {
    const activateCode = mainSrc.slice(
      mainSrc.indexOf("function activateWindow() {"),
      mainSrc.indexOf("var tsunamiStations = [];")
    );

    const calls = [];
    const sandbox = {
      background: true,
      knetMapData: [{ Code: "K002", shindo: 3 }],
      snetMapData: [{ Code: "S002", shindo: 4 }],
      TREMRTS_TMP: null,
      SeisJS_TMP: null,
      kmoniMapUpdate: (points, type) => calls.push({ points, type }),
      TREMRTSUpdate: () => {},
      SeisJSUpdate: () => {},
    };

    vm.runInNewContext(activateCode, sandbox);
    sandbox.activateWindow();

    assert.equal(sandbox.background, false);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].type, "knet");
    assert.deepEqual(calls[0].points, [{ Code: "K002", shindo: 3 }]);
    assert.equal(calls[1].type, "snet");
    assert.deepEqual(calls[1].points, [{ Code: "S002", shindo: 4 }]);
  });
});
