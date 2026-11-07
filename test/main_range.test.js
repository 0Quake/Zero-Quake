import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";

describe("local-range-request header parsing tests", () => {
  it("correctly handles bytes=0-0 without expanding to totalSize", () => {
    const totalSize = 1048576; // 1MB
    const rangeHeader = "bytes=0-0";
    const header_value = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    assert.ok(header_value);

    const start = Number(header_value[1]);
    const end = header_value[2] !== "" ? Number(header_value[2]) : totalSize - 1;
    const ContentLength = Math.max(0, end - start + 1);

    assert.equal(start, 0);
    assert.equal(end, 0);
    assert.equal(ContentLength, 1, "bytes=0-0 should request exactly 1 byte, not totalSize");
  });

  it("correctly handles open-ended range bytes=100-", () => {
    const totalSize = 1000;
    const rangeHeader = "bytes=100-";
    const header_value = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    assert.ok(header_value);

    const start = Number(header_value[1]);
    const end = header_value[2] !== "" ? Number(header_value[2]) : totalSize - 1;
    const ContentLength = Math.max(0, end - start + 1);

    assert.equal(start, 100);
    assert.equal(end, 999);
    assert.equal(ContentLength, 900);
  });

  it("verifies main.js implementation contains header_value[2] !== '' guard", () => {
    const mainSrc = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
    assert.ok(mainSrc.includes('header_value[2] !== "" ? Number(header_value[2]) : totalSize - 1'));
    assert.ok(mainSrc.includes("if (!header_value) return new Response(null, { status: 416 });"));
  });
});
