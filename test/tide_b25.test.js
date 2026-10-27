import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("Tide astronomical cache year tests (B25)", () => {
  it("RX_RTSeis.js should cache astronomical tide using key that includes year", () => {
    const rtSrc = readFileSync("src/main/RX_RTSeis.js", "utf8");
    assert.ok(rtSrc.includes("var year = NormalizeDate(\"YYYY\", new Date() - Replay);"));
    assert.ok(rtSrc.includes("const filename = `tide_astro_${year}_${st.code}.json`;"));
    assert.ok(rtSrc.includes("if (!JMATide_astro[filename])"));
    assert.ok(rtSrc.includes("JMATide_astro[filename] = tide"));
    assert.ok(rtSrc.includes("if (JMATide_astro[filename])"));
    assert.ok(rtSrc.includes("obsdata.astro = JMATide_astro[filename]"));
  });
});
