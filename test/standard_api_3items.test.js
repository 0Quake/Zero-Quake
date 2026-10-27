import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NormalizeShindo } from "../src/main/constants.js";

describe("Standard API replacements tests", () => {
  describe("str.normalize('NFKC') in NormalizeShindo", () => {
    it("should correctly normalize full-width digits and signs using NFKC", () => {
      assert.equal(NormalizeShindo("５弱", 0), "5-");
      assert.equal(NormalizeShindo("５強", 0), "5+");
      assert.equal(NormalizeShindo("６弱", 0), "6-");
      assert.equal(NormalizeShindo("６強", 0), "6+");
      assert.equal(NormalizeShindo("５＋", 0), "5+");
      assert.equal(NormalizeShindo("５－", 0), "5-");
      assert.equal(NormalizeShindo("７", 0), "7");
    });
  });
});
