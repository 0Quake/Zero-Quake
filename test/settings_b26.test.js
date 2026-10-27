import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("Settings Bouyomi-chan port tests (B26)", () => {
  it("settings.js configDataDraw should use configured Boyomi_Port for GetVoiceList instead of hardcoded 50080", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    assert.ok(src.includes("var boyomiPort = config.notice.voice_parameter.Boyomi_Port || 50080;"));
    assert.ok(src.includes("fetch(`http://localhost:${boyomiPort}/GetVoiceList`)"));
    assert.ok(!src.includes("fetch(\"http://localhost:50080/GetVoiceList\")"));
  });

  it("settings.js speak should use configured/input host for GetVoiceList and Talk with fallback catch", () => {
    const src = readFileSync("src/js/settings.js", "utf8");
    assert.ok(src.includes("var port = document.getElementById(\"Boyomi_Port\").value || config.notice.voice_parameter.Boyomi_Port || 50080;"));
    assert.ok(src.includes("var host = `http://localhost:${port}`;"));
    assert.ok(src.includes("fetch(`${host}/Talk?text="));
    assert.ok(src.includes("fetch(`${host}/GetVoiceList`)"));
  });
});
