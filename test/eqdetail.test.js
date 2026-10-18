import { it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/js/EQDetail.js", import.meta.url), "utf8");

function renderer() {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { style: {}, innerText: "", innerHTML: "" });
    return elements.get(id);
  };
  const context = vm.createContext({
    mapReady: false, pendingEQInfo: [], EQInfoData: [], EQInfo: {},
    EQInfoMarged: {}, ESmarkerElm: null, ZoomBounds: null,
    config: { Info: { EQInfo: {} }, data: { overlay: [] } },
    document: { getElementById: element },
    Boolean2: (value) => value !== null && value !== undefined && value !== "",
    NormalizeDate: (_, value) => String(value),
    NormalizeShindo: (value, mode) => mode === 2 ? ["red"] : value,
    InfoType_add() {}, InfoType_remove() {}, mapZoomReset() {},
    DrawIntensity() { context.drawnIntensity = context.WaitingToDraw; },
    DrawLgIntensity(value) { context.drawnLg = value; },
    mapFillSwitch() {}, layerSelect() {}, radioSet() {}, InfoFetch() {},
  });
  for (const id of ["data_time", "data_maxI", "data_M", "data_depth", "data_center", "data_comment"]) context[id] = element(id);
  vm.runInContext(source.slice(source.indexOf("function ConvertEQInfo(data)"), source.indexOf("//↓震度情報タブUI↓")), context);
  vm.runInContext(source.slice(source.indexOf("function drawData()"), source.indexOf("var current_Popup;")), context);
  return { context, element };
}

it("buffers reports arriving during map initialization and applies the newest report on load", () => {
  const { context, element } = renderer();
  for (const [reportTime, mag] of [[1000, 4], [2000, 5]]) {
    context.ConvertEQInfo({ category: "震源・震度情報", reportTime, mag, maxI: "3" });
  }
  assert.equal(context.pendingEQInfo.length, 2);
  assert.equal(context.EQInfoData.length, 0);
  context.drawData();
  assert.equal(context.pendingEQInfo.length, 0);
  assert.equal(context.EQInfo.mag, 5);
  assert.equal(element("data_M").innerText, "M 5");
  // 遅れて旧報が届いても新報の表示を維持する。
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 500, mag: 3 });
  assert.equal(context.EQInfo.mag, 5);
});

it("clears previously drawn intensity data when a correction removes it", () => {
  const { context } = renderer();
  context.mapReady = true;
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, IntData: [{ name: "旧震度" }] });
  assert.equal(context.drawnIntensity.length, 1);
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, IntData: null });
  assert.equal(context.drawnIntensity.length, 0);
  assert.equal(context.drawnLg.length, 0);
});

it("correctly displays '700km以上' for depth -700, 700, or deeper", () => {
  const { context, element } = renderer();
  context.mapReady = true;

  // XMLパース結果の深さ -700 (Coordinate: -700000/)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, depth: -700 });
  assert.equal(element("data_depth").innerText, "700km以上");

  // 正の値 700
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, depth: 700 });
  assert.equal(element("data_depth").innerText, "700km以上");

  // 通常の深さ 10km (depth: -10)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 3000, depth: -10 });
  assert.equal(element("data_depth").innerText, "10km");

  // 深さ 0km (ごく浅い)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 4000, depth: 0 });
  assert.equal(element("data_depth").innerText, "ごく浅い");

  // 深さ不明 (depth: null)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 5000, depth: null });
  assert.equal(element("data_depth").innerText, "不明");
});
