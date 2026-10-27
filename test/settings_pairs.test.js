import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

describe("Settings pairs refactoring tests", () => {
  it("settings.js defines prop, applyConfigToUI, applyUIToConfig and pairs array", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    assert.ok(src.includes("function prop(objGetter, key)"));
    assert.ok(src.includes("function applyConfigToUI(pair)"));
    assert.ok(src.includes("function applyUIToConfig(pair)"));
    assert.ok(src.includes("var pairs = ["));
    assert.ok(src.includes("pairs.forEach(applyConfigToUI);"));
    assert.ok(src.includes("pairs.forEach(applyUIToConfig);"));
  });

  it("applyConfigToUI and applyUIToConfig handle checkbox, select, and input with loadFunc/saveFunc", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    // Extract prop, getElement, applyConfigToUI, applyUIToConfig
    const helperCode = src.slice(
      src.indexOf("function prop(objGetter, key) {"),
      src.indexOf("var pairs = [")
    );

    let selectedValue = null;
    const ctx = {
      document: {
        getElementById: (id) => ctx.elements[id] || null,
      },
      selectBoxSet: (el, val) => {
        el.value = val;
      },
      elements: {
        testCheckbox: { type: "checkbox", checked: false },
        testSelect: { tagName: "SELECT", value: "" },
        testInput: { type: "text", value: "" },
        testInterval: { type: "number", value: "" },
      },
      config: {
        sub: {
          flag: true,
          choice: "optB",
          text: "hello",
          interval: 5000,
        },
      },
    };

    vm.runInNewContext(helperCode, ctx);

    const testPairs = [
      {
        target: ctx.prop(() => ctx.config.sub, "flag"),
        element: ctx.elements.testCheckbox,
      },
      {
        target: ctx.prop(() => ctx.config.sub, "choice"),
        element: ctx.elements.testSelect,
      },
      {
        target: ctx.prop(() => ctx.config.sub, "text"),
        element: ctx.elements.testInput,
      },
      {
        target: ctx.prop(() => ctx.config.sub, "interval"),
        element: ctx.elements.testInterval,
        loadFunc: (v) => v / 1000,
        saveFunc: (v) => Number(v) * 1000,
      },
    ];

    // 1. Config -> UI (applyConfigToUI)
    testPairs.forEach(ctx.applyConfigToUI);

    assert.equal(ctx.elements.testCheckbox.checked, true);
    assert.equal(ctx.elements.testSelect.value, "optB");
    assert.equal(ctx.elements.testInput.value, "hello");
    assert.equal(ctx.elements.testInterval.value, 5);

    // 2. Modify UI and test UI -> Config (applyUIToConfig)
    ctx.elements.testCheckbox.checked = false;
    ctx.elements.testSelect.value = "optC";
    ctx.elements.testInput.value = "world";
    ctx.elements.testInterval.value = 10;

    testPairs.forEach(ctx.applyUIToConfig);

    assert.equal(ctx.config.sub.flag, false);
    assert.equal(ctx.config.sub.choice, "optC");
    assert.equal(ctx.config.sub.text, "world");
    assert.equal(ctx.config.sub.interval, 10000);
  });
});
