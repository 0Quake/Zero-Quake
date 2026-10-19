import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/js/mainWindow.js", import.meta.url), "utf8");

describe("mainWindow.js - Magnitude handling and sorting tests", () => {
  it("sorts 'M8超' as magnitude 10, above M8.2, and parses numeric strings safely", () => {
    // mainWindow.js の data_to_draw.sort 全体を抽出
    const sortSnippet = source.slice(
      source.indexOf("data_to_draw.sort(function (a, b) {"),
      source.indexOf("data_to_draw.forEach(function (elm, index) {")
    );

    const context = vm.createContext({
      sort_key: "m",
      data_to_draw: [
        { id: "normal_4_8", M: "4.8" }, // 数値文字列
        { id: "normal_7_0", M: 7.0 },
        { id: "normal_8_2", M: 8.2 },
        { id: "giant_m8", M: "M8超" }, // M8超 (10扱い)
        { id: "giant_kanji", M: "Ｍ８を超える巨大地震" }, // 10扱い
        { id: "small_2_0", M: 2.0 },
      ],
      NormalizeShindo: () => 0,
    });

    vm.runInContext(sortSnippet, context);

    const sortedIds = context.data_to_draw.map(item => item.id);
    // 降順ソートなので、10扱いのM8超が先頭（M8.2より上位）に来ること
    assert.ok(sortedIds.indexOf("giant_m8") < sortedIds.indexOf("normal_8_2"), "M8超はM8.2より上位にソートされること");
    assert.ok(sortedIds.indexOf("giant_kanji") < sortedIds.indexOf("normal_8_2"), "Ｍ８を超える巨大地震はM8.2より上位にソートされること");
    // 数値文字列 "4.8" は 7.0 より下位（通常数値として比較され、巨大地震扱いされない）こと
    assert.ok(sortedIds.indexOf("normal_7_0") < sortedIds.indexOf("normal_4_8"), "数値7.0は数値文字列'4.8'より上位にソートされること");
    assert.ok(sortedIds.indexOf("normal_4_8") < sortedIds.indexOf("small_2_0"), "数値文字列'4.8'は2.0より上位にソートされること");
  });

  it("formats magnitude display without duplicate 'M' prefix to avoid 'MM8超'", () => {
    const formatSnippet = source.slice(
      source.indexOf('var magDisplay = "不明";'),
      source.indexOf('clone.querySelector(".EQI_magnitude").textContent = magDisplay;')
    );

    const testCases = [
      { input: "M8超", expected: "8超" }, // HTMLの "M" + "8超" で "M8超" となる
      { input: "8超", expected: "8超" },
      { input: "Ｍ８を超える巨大地震", expected: "8超" },
      { input: 5.4, expected: "5.4" },
      { input: 0, expected: "0.0" },
      { input: null, expected: "不明" },
      { input: undefined, expected: "不明" },
    ];

    testCases.forEach(({ input, expected }) => {
      const context = vm.createContext({ elm: { M: input } });
      vm.runInContext(`
        ${formatSnippet}
      `, context);
      assert.equal(context.magDisplay, expected, `M=${input} のときの表示が ${expected} であること`);
    });
  });
});
