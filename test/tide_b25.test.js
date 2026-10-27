import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("Tide astronomical cache year tests (B25)", () => {
  it("RX_RTSeis.js should cache astronomical tide using key that includes year", () => {
    const rtSrc = readFileSync("src/main/RX_RTSeis.js", "utf8");
    assert.ok(rtSrc.includes("var astroKey = `${year}_${st.code}`;"));
    assert.ok(rtSrc.includes("if (!JMATide_astro[astroKey])"));
    assert.ok(rtSrc.includes("JMATide_astro[astroKey] = tide"));
    assert.ok(rtSrc.includes("if (JMATide_astro[astroKey])"));
    assert.ok(rtSrc.includes("obsdata.astro = JMATide_astro[astroKey]"));
  });
});
