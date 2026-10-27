import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

describe("ESMap_Worker.js - Unit Tests", () => {
  it("should reset pixel color per iteration and not bleed shindo color into subsequent non-matching pixels (B19)", () => {
    const workerSrc = readFileSync("src/js/ESMap_Worker.js", "utf8");

    const intColor = {
      "4": [250, 230, 150],
      "5-": [255, 230, 0],
      "5+": [255, 153, 0],
      "6-": [255, 40, 0],
      "6+": [165, 0, 33],
      "7": [180, 0, 104],
    };

    const loopCode = workerSrc.slice(
      workerSrc.indexOf("var y = 1;"),
      workerSrc.indexOf("ESMap_context_out.putImageData")
    );

    const imgData = new Uint8ClampedArray(800 * 800 * 4);
    // Pixel 1 at y=1, x=1: shindo 4
    imgData[1 * 3200 + 1 * 4] = 250;
    imgData[1 * 3200 + 1 * 4 + 1] = 230;
    imgData[1 * 3200 + 1 * 4 + 2] = 150;
    imgData[1 * 3200 + 1 * 4 + 3] = 255;

    // Pixel 2 at y=1, x=4: pure white background (255, 255, 255, 255)
    imgData[1 * 3200 + 4 * 4] = 255;
    imgData[1 * 3200 + 4 * 4 + 1] = 255;
    imgData[1 * 3200 + 4 * 4 + 2] = 255;
    imgData[1 * 3200 + 4 * 4 + 3] = 255;

    const imgData_out = { data: new Uint8ClampedArray(320 * 320 * 4) };
    const sandbox = { imgData, imgData_out, intColor };
    vm.runInNewContext(loopCode, sandbox);

    // Pixel 1: should have intColor["4"]
    assert.equal(imgData_out.data[0], intColor["4"][0]);
    assert.equal(imgData_out.data[1], intColor["4"][1]);
    assert.equal(imgData_out.data[2], intColor["4"][2]);
    assert.equal(imgData_out.data[3], 255);

    // Pixel 2: should be completely transparent, NOT inheriting intColor["4"]
    assert.equal(imgData_out.data[4], 0, "Red should be 0");
    assert.equal(imgData_out.data[5], 0, "Green should be 0");
    assert.equal(imgData_out.data[6], 0, "Blue should be 0");
    assert.equal(imgData_out.data[7], 0, "Alpha should be 0");
  });
});
