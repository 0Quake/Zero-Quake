import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { initEEWRxContext } from "../src/main/RX_EEW.js";
import { initOtherAPIsContext, checkUpdate } from "../src/main/RX_OtherAPIs.js";

describe("RX_EEW.js and RX_OtherAPIs.js - Unit Tests", () => {
  it("should initialize EEW Rx context correctly", () => {
    let statusUpdated = false;
    initEEWRxContext({
      getConfig: () => ({}),
      getReplay: () => 0,
      UpdateStatus: () => {
        statusUpdated = true;
      },
    });
    assert.doesNotThrow(() => {
      initEEWRxContext({ getReplay: () => 100 });
    });
  });

  it("should initialize OtherAPIs context and expose checkUpdate function", () => {
    initOtherAPIsContext({
      getConfig: () => ({}),
      getPackageVer: () => "0.9.9",
      getPackageJson: () => ({ version: "0.9.9" }),
      UpdateStatus: () => {},
      GeneralError_handler: () => {},
    });
    assert.equal(typeof checkUpdate, "function");
  });
});
