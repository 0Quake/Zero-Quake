import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";
import { NormalizeDate } from "../src/main/constants.js";

describe("Tide observation time tests (B23)", () => {
  it("RX_RTSeis.js should store observation time under 'time' key matching mainWindow.js", () => {
    const rtSrc = readFileSync("src/main/RX_RTSeis.js", "utf8");
    assert.ok(rtSrc.includes("time: new Date(Number(new Date(json.time))"));
    assert.ok(!rtSrc.includes("date: new Date(Number(new Date(json.time))"));
  });

  it("mainWindow.js should format elm.time, and display placeholder if missing without substituting current time", () => {
    const mainSrc = readFileSync("src/js/mainWindow.js", "utf8");
    const snippet = mainSrc.slice(
      mainSrc.indexOf("var dateToSpeak = elm.time ?"),
      mainSrc.indexOf("clone.querySelector(\".EQI_datetime\").textContent = dateStr;")
    );

    // Case 1: Past observation time (e.g. 2026-10-27 10:30)
    const pastTime = new Date("2026-10-27T10:30:00+09:00");
    const ctx1 = {
      elm: { time: pastTime },
      NormalizeDate,
      dateToSpeak: null,
      dateStr: null,
    };
    vm.runInNewContext(snippet, ctx1);
    assert.equal(ctx1.dateStr, "10/27 10:30");
    assert.equal(ctx1.dateToSpeak, "10月27日10時30分");

    // Case 2: Missing time (null/undefined)
    const ctx2 = {
      elm: { time: null },
      NormalizeDate,
      dateToSpeak: null,
      dateStr: null,
    };
    vm.runInNewContext(snippet, ctx2);
    assert.equal(ctx2.dateStr, "--/-- --:--");
    assert.equal(ctx2.dateToSpeak, "不明な時刻");
  });
});
