import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/js/tsunamiDetail.js", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../src/js/mainWindow.js", import.meta.url), "utf8");

describe("tsunamiDetail.js - Compound Condition formatting tests", () => {
  const omaxHeightSnippet = source.slice(
    source.indexOf("if (elm2.omaxHeight) {"),
    source.indexOf("if (elm2.maxHeightRising) {")
  );

  function formatMaxHeight(elm2) {
    const context = vm.createContext({ elm2, omaxHeight: "" });
    vm.runInContext(omaxHeightSnippet, context);
    return context.omaxHeight;
  }

  it("preserves '欠測' in compound condition '微弱　欠測'", () => {
    assert.equal(formatMaxHeight({ omaxHeight: null, maxHeightCondition: "微弱　欠測" }), "微弱　欠測");
  });

  it("preserves '欠測' in compound condition '観測中　欠測'", () => {
    assert.equal(formatMaxHeight({ omaxHeight: null, maxHeightCondition: "観測中　欠測" }), "観測中　欠測");
  });

  it("formats single conditions correctly", () => {
    assert.equal(formatMaxHeight({ omaxHeight: null, maxHeightCondition: "観測中" }), "観測中");
    assert.equal(formatMaxHeight({ omaxHeight: null, maxHeightCondition: "微弱" }), "微弱");
    assert.equal(formatMaxHeight({ omaxHeight: null, maxHeightCondition: "欠測" }), "欠測");
  });

  it("preserves numeric omaxHeight as-is without appending conditions", () => {
    assert.equal(formatMaxHeight({ omaxHeight: "0.5m", maxHeightCondition: null }), "0.5m");
    assert.equal(formatMaxHeight({ omaxHeight: "3.2m以上", maxHeightCondition: "重要　欠測" }), "3.2m以上");
    assert.equal(formatMaxHeight({ omaxHeight: "5.5m以上", maxHeightCondition: "重要" }), "5.5m以上");
  });

  it("applies identical logic in mainWindow.js", () => {
    const mainSnippet = mainSource.slice(
      mainSource.lastIndexOf("if (elm2.omaxHeight) {"),
      mainSource.indexOf("if (elm2.maxHeightTime) {")
    );

    function formatMainMaxHeight(elm2) {
      const context = vm.createContext({ elm2, omaxHeight: "" });
      vm.runInContext(mainSnippet, context);
      return context.omaxHeight;
    }

    assert.equal(formatMainMaxHeight({ omaxHeight: null, maxHeightCondition: "微弱　欠測" }), "微弱　欠測");
    assert.equal(formatMainMaxHeight({ omaxHeight: null, maxHeightCondition: "観測中　欠測" }), "観測中　欠測");
    assert.equal(formatMainMaxHeight({ omaxHeight: "3.2m以上", maxHeightCondition: "重要　欠測" }), "3.2m以上");
  });
});
