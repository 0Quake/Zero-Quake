import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkUpdate } from "../src/main/RX_OtherAPIs.js";
import {
  setConfig,
  setReplay,
  setPackageVer,
  setPackageJson,
  UpdateStatus,
} from "../src/main/state.js";

describe("RX_EEW.js and RX_OtherAPIs.js - Unit Tests", () => {
  it("should configure state and UpdateStatus correctly", () => {
    setConfig({ test: 1 });
    setReplay(0);
    assert.doesNotThrow(() => {
      UpdateStatus("test_type", "ok");
    });
  });

  it("should configure OtherAPIs state and expose checkUpdate function", () => {
    setPackageVer("0.9.9");
    setPackageJson({ version: "0.9.9" });
    assert.equal(typeof checkUpdate, "function");
  });
});
