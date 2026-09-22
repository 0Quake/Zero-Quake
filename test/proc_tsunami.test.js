import { test, describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  ConvertTsunamiInfo,
  initTsunamiContext,
  resetTsunamiData,
  Tsunami_Data,
} from "../src/main/PROC_Tsunami.js";

describe("PROC_Tsunami.js - ConvertTsunamiInfo", () => {
  beforeEach(() => {
    resetTsunamiData();
    initTsunamiContext({
      getConfig: () => ({
        home: {
          TsunamiSect: "オホーツク海沿岸",
        },
        Info: {
          TsunamiInfo: {
            GetData: true,
            showtraining: false,
            showTest: false,
            NotificationSound: false,
            Global_threshold: 1,
            Local_threshold: 1,
          },
        },
        notice: {
          voice: {
            TsunamiTorikeshi: "津波警報等は解除されました。",
          },
        },
      }),
      getReplay: () => 0,
    });
  });

  it("should discard future tsunami data compared to Date.now()", () => {
    const futureTime = new Date(Date.now() + 100000).toISOString();
    const futureData = {
      status: "通常",
      issue: {
        time: futureTime,
        EventID: ["202609230001"],
      },
      areas: [],
    };

    ConvertTsunamiInfo(futureData);
    assert.equal(Tsunami_Data.length, 0);
  });

  it("should accept valid past tsunami data", () => {
    const pastTime = new Date(Date.now() - 5000).toISOString();
    const sampleData = {
      status: "通常",
      issue: {
        time: pastTime,
        EventID: ["202609230001"],
      },
      areas: [
        {
          name: "オホーツク海沿岸",
          code: "100",
          grade: "MajorWarning",
        },
      ],
    };

    ConvertTsunamiInfo(sampleData);
    assert.equal(Tsunami_Data.length, 1);
    assert.equal(Tsunami_Data[0].issue.EventID[0], "202609230001");
  });

  it("should ignore training data when showtraining is false", () => {
    const pastTime = new Date(Date.now() - 5000).toISOString();
    const trainingData = {
      status: "訓練",
      issue: {
        time: pastTime,
        EventID: ["202609230002"],
      },
      areas: [],
    };

    ConvertTsunamiInfo(trainingData);
    assert.equal(Tsunami_Data.length, 0);
  });
});
