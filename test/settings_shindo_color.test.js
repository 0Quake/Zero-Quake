import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

describe("Settings shindoColor change listener tests", () => {
  it("should update Shindo and LgInt sample background and text colors correctly", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    const listenerMatch = src.match(/document\.getElementById\("shindoColor"\)\.addEventListener\("change", function \(\) \{[\s\S]*?\n\}\);/);
    assert.ok(listenerMatch, "listener should exist");

    const elements = {};
    const shindoKeys = ["Q", "0", "1", "2", "3", "4", "5m", "5p", "6m", "6p", "7"];
    shindoKeys.forEach(k => {
      elements[`ShindoSample${k}`] = { style: {} };
    });
    const lgKeys = ["Q", "1", "2", "3", "4"];
    lgKeys.forEach(k => {
      elements[`LngIntSample${k}`] = { style: {} };
    });

    const mockIntColor = {
      testTheme: {
        Shindo: {
          "?": { background: "bg_q", color: "fg_q" },
          "0": { background: "bg_0", color: "fg_0" },
          "1": { background: "bg_1", color: "fg_1" },
          "2": { background: "bg_2", color: "fg_2" },
          "3": { background: "bg_3", color: "fg_3" },
          "4": { background: "bg_4", color: "fg_4" },
          "5m": { background: "bg_5m", color: "fg_5m" },
          "5p": { background: "bg_5p", color: "fg_5p" },
          "6m": { background: "bg_6m", color: "fg_6m" },
          "6p": { background: "bg_6p", color: "fg_6p" },
          "7": { background: "bg_7", color: "fg_7" },
        },
        LgInt: {
          "?": { background: "bg_lg_q", color: "fg_lg_q" },
          "1": { background: "bg_lg_1", color: "fg_lg_1" },
          "2": { background: "bg_lg_2", color: "fg_lg_2" },
          "3": { background: "bg_lg_3", color: "fg_lg_3" },
          "4": { background: "bg_lg_4", color: "fg_lg_4" },
        },
      },
    };

    let handler;
    const ctx = {
      intColor: mockIntColor,
      document: {
        getElementById: (id) => {
          if (id === "shindoColor") {
            return {
              addEventListener: (evt, fn) => {
                handler = fn;
              },
            };
          }
          return elements[id] || null;
        },
      },
    };

    vm.runInNewContext(listenerMatch[0], ctx);
    assert.ok(handler, "handler was registered");

    // Invoke handler as if shindoColor changed to 'testTheme'
    handler.call({ value: "testTheme" });

    // Assert Shindo samples
    assert.equal(elements.ShindoSampleQ.style.background, "bg_q");
    assert.equal(elements.ShindoSampleQ.style.color, "fg_q");
    assert.equal(elements.ShindoSample4.style.background, "bg_4");
    assert.equal(elements.ShindoSample4.style.color, "fg_4");
    assert.equal(elements.ShindoSample7.style.background, "bg_7");
    assert.equal(elements.ShindoSample7.style.color, "fg_7");

    // Assert LgInt samples
    assert.equal(elements.LngIntSampleQ.style.background, "bg_lg_q");
    assert.equal(elements.LngIntSampleQ.style.color, "fg_lg_q");
    assert.equal(elements.LngIntSample2.style.background, "bg_lg_2");
    assert.equal(elements.LngIntSample2.style.color, "fg_lg_2");
  });
});
