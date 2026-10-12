import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  ConvertTsunamiInfo,
  resetTsunamiData,
  Tsunami_Data,
} from "../src/main/PROC_Tsunami.js";
import { setConfig, setReplay } from "../src/main/state.js";

describe("PROC_Tsunami.js - ConvertTsunamiInfo", () => {
  beforeEach(() => {
    resetTsunamiData();
    setConfig({
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
    });
    setReplay(0);
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

  it("should clear merged areas when latest report is revoked", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const data = {
      status: "通常",
      issue: {
        time: t1,
        EventID: ["202610120001"],
      },
      areas: [
        {
          name: "東京湾内湾",
          code: "320",
          grade: "Yoho",
          cancelled: false,
        },
      ],
      revocation: false,
      ValidDateTime: new Date(Date.now() - 1000),
    };

    ConvertTsunamiInfo(data);
    assert.equal(procTsunami.Tsunami_data_Marged.areas.length, 1);
    assert.equal(procTsunami.Tsunami_data_Marged.revocation, false);

    // 失効シミュレート
    data.revocation = true;
    if (Array.isArray(data.areas)) {
      data.areas.forEach((a) => { a.cancelled = true; });
    }
    ConvertTsunamiInfo(data);

    assert.equal(procTsunami.Tsunami_data_Marged.revocation, true);
    assert.equal(procTsunami.Tsunami_data_Marged.areas.length, 0);
  });

  it("should not duplicate areas without stations when merged", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 10000).toISOString();
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120002"] },
      areas: [
        { name: "東京湾内湾", code: "320", grade: "Yoho", cancelled: false },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    const t2 = new Date(Date.now() - 5000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120002"] },
      areas: [
        { name: "東京湾内湾", code: "320", grade: "Yoho", cancelled: false },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data2);

    assert.equal(procTsunami.Tsunami_data_Marged.areas.length, 1);
  });

  it("should preserve earlier valid report when a later report expires", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    // 先に出た情報: 地震1の津波警報 (10:00)
    const t1 = new Date(Date.now() - 10000).toISOString();
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120010"] },
      areas: [
        { name: "オホーツク海沿岸", code: "100", grade: "Warning", cancelled: false },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    // 後に出た情報: 地震2の津波予報 (11:00)
    const t2 = new Date(Date.now() - 5000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120020"] },
      areas: [
        { name: "東京湾内湾", code: "320", grade: "Yoho", cancelled: false },
      ],
      revocation: false,
      ValidDateTime: new Date(Date.now() - 1000),
    };
    ConvertTsunamiInfo(data2);

    // 両方登録された状態
    assert.equal(procTsunami.Tsunami_data_Marged.areas.length, 2);
    assert.equal(procTsunami.Tsunami_data_Marged.revocation, false);

    // 後に出た情報(data2)のみ失効
    data2.revocation = true;
    if (Array.isArray(data2.areas)) {
      data2.areas.forEach((a) => { a.cancelled = true; });
    }
    ConvertTsunamiInfo(data2);

    // 先に出た情報(data1)は依然として有効
    assert.equal(procTsunami.Tsunami_data_Marged.revocation, false);
    const activeAreas = procTsunami.Tsunami_data_Marged.areas.filter((a) => !a.cancelled);
    assert.equal(activeAreas.length, 1);
    assert.equal(activeAreas[0].name, "オホーツク海沿岸");
    assert.equal(activeAreas[0].grade, "Warning");
  });

  it("should distinguish Torikeshi (cancel) from revocation (expiration)", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const cancelData = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120030"] },
      areas: [],
      Torikeshi: true,
      cancelled: true,
      revocation: false,
    };

    ConvertTsunamiInfo(cancelData);
    assert.equal(procTsunami.Tsunami_data_Marged.Torikeshi, true);
    assert.equal(procTsunami.Tsunami_data_Marged.revocation, false);
  });
});
