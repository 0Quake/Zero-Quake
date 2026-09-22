import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NormalizeShindo,
  NormalizeDate,
  Boolean2,
  newDate2,
  IncludesDuplicates,
  ParseJSON,
  ConvertJST,
  ConvertUTC,
} from "../src/main/constants.js";

describe("constants.js - Unit Tests", () => {
  describe("NormalizeShindo", () => {
    it("should correctly normalize basic shindo numbers", () => {
      assert.equal(NormalizeShindo(1, 0), "1");
      assert.equal(NormalizeShindo(2, 0), "2");
      assert.equal(NormalizeShindo(3, 0), "3");
      assert.equal(NormalizeShindo(4, 0), "4");
      assert.equal(NormalizeShindo(7, 0), "7");
    });

    it("should correctly normalize shindo 5弱 / 5強 / 6弱 / 6強 to mode 1 (Japanese text)", () => {
      assert.equal(NormalizeShindo("5-", 1), "5弱");
      assert.equal(NormalizeShindo("5+", 1), "5強");
      assert.equal(NormalizeShindo("6-", 1), "6弱");
      assert.equal(NormalizeShindo("6+", 1), "6強");
    });

    it("should normalize responseType 5 (comparable integer)", () => {
      // responseType 5: 5弱 -> 5, 5強 -> 6
      const res5Minus = NormalizeShindo("5-", 5);
      const res5Plus = NormalizeShindo("5+", 5);
      assert.equal(Number(res5Minus), 5);
      assert.equal(Number(res5Plus), 6);
      assert.ok(Number(res5Plus) > Number(res5Minus));
    });

    it("should handle null, undefined, or invalid inputs gracefully", () => {
      assert.equal(NormalizeShindo(null, 0), "?");
      assert.equal(NormalizeShindo(undefined, 0), "?");
      assert.equal(NormalizeShindo("invalid", 0), "?");
    });
  });

  describe("Boolean2", () => {
    it("should identify truthy values per custom business rules", () => {
      assert.equal(Boolean2(true), true);
      assert.equal(Boolean2("true"), true);
      assert.equal(Boolean2(1), true);
      assert.equal(Boolean2("1"), true);
      assert.equal(Boolean2(0), true); // 0 is explicitly treated as valid (elm === 0)
      assert.equal(Boolean2([1]), true);
    });

    it("should identify falsy/empty values", () => {
      assert.equal(Boolean2(false), false);
      assert.equal(Boolean2(""), false);
      assert.equal(Boolean2(null), false);
      assert.equal(Boolean2(undefined), false);
      assert.equal(Boolean2([]), false);
      assert.equal(Boolean2("Invalid Date"), false);
    });
  });

  describe("newDate2", () => {
    it("should return valid Date object for parsable date strings", () => {
      const dt = newDate2("2026-09-23T00:00:00Z");
      assert.ok(dt instanceof Date);
      assert.equal(Number.isNaN(dt.getTime()), false);
    });

    it("should return null for invalid date strings, undefined, null, or empty string", () => {
      assert.equal(newDate2("not-a-date"), null);
      assert.equal(newDate2(undefined), null);
      assert.equal(newDate2(null), null);
      assert.equal(newDate2(""), null);
    });
  });

  describe("IncludesDuplicates", () => {
    it("should detect overlapping elements between arrays", () => {
      assert.equal(IncludesDuplicates([1, 2, 3], [3, 4, 5]), true);
      assert.equal(IncludesDuplicates(["a", "b"], ["b", "c"]), true);
      assert.equal(IncludesDuplicates([1, 2], [3, 4]), false);
      assert.equal(IncludesDuplicates([], [1]), false);
      assert.equal(IncludesDuplicates(null, [1]), false);
    });
  });

  describe("NormalizeDate", () => {
    it("should format dates according to specified type codes", () => {
      const fixedDate = new Date("2026-09-23T04:15:30");
      // Format 2: YYYYMMDD
      const formatted2 = NormalizeDate(2, fixedDate);
      assert.match(formatted2, /^\d{8}$/);

      // Custom pattern string
      const custom = NormalizeDate("YYYY-MM-DD hh:mm:ss", fixedDate);
      assert.match(custom, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it("should handle invalid dates without throwing", () => {
      assert.doesNotThrow(() => {
        NormalizeDate(1, "invalid-date-string");
      });
    });
  });

  describe("ConvertJST and ConvertUTC", () => {
    it("should shift time by 9 hours accurately", () => {
      const base = new Date("2026-01-01T00:00:00Z");
      const jst = ConvertJST(base);
      assert.equal(jst.getTime() - base.getTime(), 9 * 60 * 60 * 1000);

      const utc = ConvertUTC(jst);
      assert.equal(utc.getTime(), base.getTime());
    });
  });

  describe("ParseJSON", () => {
    it("should parse valid JSON string", () => {
      assert.deepEqual(ParseJSON('{"key":"value"}'), { key: "value" });
    });

    it("should return null on invalid JSON string without throwing", () => {
      assert.equal(ParseJSON("invalid json {[["), null);
    });
  });
});
