import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  messageToSettingWindow,
  messageToTsunamiWindow,
  messageToWorkerWindow,
  SettingWindow,
  TsunamiWindow,
  WorkerWindow,
} from "../src/main/windows.js";
import { setConfig, setPackageVer } from "../src/main/state.js";

describe("windows.js - Unit Tests", () => {
  it("should initialize windows state safely", () => {
    assert.doesNotThrow(() => {
      setConfig({});
      setPackageVer("0.9.9");
    });
  });

  it("should safely handle messaging functions when windows are null or destroyed", () => {
    assert.equal(SettingWindow, null);
    assert.equal(TsunamiWindow, null);
    assert.equal(WorkerWindow, null);

    // None of these should throw when windows are not created
    assert.doesNotThrow(() => {
      messageToSettingWindow({ test: true });
      messageToTsunamiWindow({ test: true });
      messageToWorkerWindow({ test: true });
    });
  });
});
