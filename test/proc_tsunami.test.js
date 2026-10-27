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

  it("should generate correct cancellation voice text when Torikeshi is true", async () => {
    const { GenerateTsunamiText } = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const cancelData = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120030"] },
      areas: [],
      Torikeshi: true,
      cancelled: true,
      revocation: false,
    };

    const text = GenerateTsunamiText(cancelData);
    assert.ok(text.includes("解除されました") || text.includes("取り消"));
  });

  it("should preserve distinct stations within the same area without mismerging", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const data = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120040"] },
      areas: [
        {
          name: "予報区A",
          code: "210",
          grade: "Warning",
          cancelled: false,
          stations: [
            { name: "S1", code: "S101", omaxHeight: "1.0m" },
            { name: "S2", code: "S102", omaxHeight: "2.0m" },
          ],
        },
      ],
      revocation: false,
    };

    ConvertTsunamiInfo(data);
    // 再受信（同一報または更新）
    ConvertTsunamiInfo(data);

    const area = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区A");
    assert.ok(area);
    assert.equal(area.stations.length, 2);
    const s1 = area.stations.find(s => s.name === "S1");
    const s2 = area.stations.find(s => s.name === "S2");
    assert.equal(s1.omaxHeight, "1.0m");
    assert.equal(s2.omaxHeight, "2.0m");
  });

  it("should clear maxHeightTime when station transitions to observing condition", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const mhTime = new Date(Date.now() - 3000);
    // 第1報: 1.0m, 上昇中, 時刻あり
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120050"] },
      areas: [
        {
          name: "予報区B",
          code: "220",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S3",
              code: "S103",
              omaxHeight: "1.0m",
              maxHeightRising: true,
              maxHeightTime: mhTime,
              maxHeight_obs: { height: "1.0m", rising: true, time: mhTime },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    const sBefore = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区B")?.stations.find(s => s.name === "S3");
    assert.equal(sBefore.omaxHeight, "1.0m");
    assert.equal(sBefore.maxHeightRising, true);
    assert.ok(sBefore.maxHeightTime);

    // 第2報: 「観測中」に切り替え (hasMaxHeight: true, omaxHeight: null)
    const t2 = new Date(Date.now() - 2000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120050"] },
      areas: [
        {
          name: "予報区B",
          code: "220",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S3",
              code: "S103",
              omaxHeight: null,
              maxHeightCondition: "観測中",
              maxHeight_obs: { height: null, condition: "観測中" },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data2);

    const sAfter = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区B")?.stations.find(s => s.name === "S3");
    assert.equal(sAfter.omaxHeight, null);
    assert.equal(sAfter.maxHeightRising, false);
    assert.equal(sAfter.maxHeightTime, null);
  });

  it("should retain observation time for '微弱' condition without numeric height", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const mhTime = new Date("2009-08-11T05:25:00+09:00");

    // 「微弱」報: 数値波高なし、観測時刻あり (PDF Ⅱ.12-4 事例2)
    const data = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120060"] },
      areas: [
        {
          name: "予報区C",
          code: "230",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S4",
              code: "S104",
              omaxHeight: null,
              maxHeightCondition: "微弱",
              maxHeightTime: mhTime,
              maxHeight_obs: { height: null, condition: "微弱", time: mhTime },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data);
    // 同一報の再受信
    ConvertTsunamiInfo(data);

    const s = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区C")?.stations.find(st => st.name === "S4");
    assert.ok(s);
    assert.equal(s.omaxHeight, null);
    assert.equal(s.maxHeightCondition, "微弱");
    assert.equal(Number(s.maxHeightTime), Number(mhTime));
  });

  it("should clear ArrivedTime and firstHeightInitial when station transitions to '欠測', while preserving forecast ArrivalTime", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const forecastTime = new Date("2010-02-28T15:00:00+09:00");
    const obsTime = new Date("2010-02-28T15:05:00+09:00");

    // 第1報: 予報（予想到達時刻 ArrivalTime あり）
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120070"] },
      areas: [
        {
          name: "予報区D",
          code: "240",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S5",
              code: "S105",
              ArrivalTime: forecastTime, // 予想到達時刻
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    // 第2報: 観測（第1波観測時刻 ArrivedTime・極性あり）
    const t2 = new Date(Date.now() - 3000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120070"] },
      areas: [
        {
          name: "予報区D",
          code: "240",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S5",
              code: "S105",
              ArrivedTime: obsTime, // 観測時刻
              firstHeightInitial: "押し",
              firstHeightCondition: null,
              firstHeight_obs: { arrivedTime: obsTime, initial: "押し" },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data2);

    const sBefore = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区D")?.stations.find(st => st.name === "S5");
    assert.equal(Number(sBefore.ArrivalTime), Number(forecastTime)); // 予想到達時刻は消えない
    assert.equal(Number(sBefore.ArrivedTime), Number(obsTime)); // 観測時刻がセットされる
    assert.equal(sBefore.firstHeightInitial, "押し");

    // 第3報: 観測が「欠測」に切り替え (hasFirstHeight: true, ArrivedTime: null, firstHeightInitial: null, firstHeightCondition: "欠測")
    const t3 = new Date(Date.now() - 1000).toISOString();
    const data3 = {
      status: "通常",
      issue: { time: t3, EventID: ["202610120070"] },
      areas: [
        {
          name: "予報区D",
          code: "240",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S5",
              code: "S105",
              ArrivedTime: null,
              firstHeightInitial: null,
              firstHeightCondition: "欠測",
              firstHeight_obs: { arrivedTime: null, initial: null, condition: "欠測" },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data3);

    const sAfter = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区D")?.stations.find(st => st.name === "S5");
    assert.equal(Number(sAfter.ArrivalTime), Number(forecastTime)); // 予想到達時刻は保持される
    assert.equal(sAfter.ArrivedTime, null); // 観測時刻はクリアされる
    assert.equal(sAfter.firstHeightInitial, null); // 極性もクリアされる
    assert.equal(sAfter.firstHeightCondition, "欠測");
  });

  it("should clear maxHeightRising when subsequent report has no rising condition", async () => {
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const t1 = new Date(Date.now() - 5000).toISOString();
    const mhTime1 = new Date("2009-08-11T05:26:00+09:00");
    const mhTime2 = new Date("2009-08-11T05:30:00+09:00");

    // 第1報: 0.3m, 上昇中 (maxHeightRising: true)
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120080"] },
      areas: [
        {
          name: "予報区E",
          code: "250",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S6",
              code: "S106",
              omaxHeight: "0.3m",
              maxHeightRising: true,
              maxHeightTime: mhTime1,
              maxHeight_obs: { height: "0.3m", rising: true, time: mhTime1 },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    const sBefore = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区E")?.stations.find(st => st.name === "S6");
    assert.equal(sBefore.omaxHeight, "0.3m");
    assert.equal(sBefore.maxHeightRising, true);

    // 第2報: 0.4m, 上昇中なし (maxHeightRising: false)
    const t2 = new Date(Date.now() - 2000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120080"] },
      areas: [
        {
          name: "予報区E",
          code: "250",
          grade: "Warning",
          cancelled: false,
          stations: [
            {
              name: "S6",
              code: "S106",
              omaxHeight: "0.4m",
              maxHeightRising: false,
              maxHeightTime: mhTime2,
              maxHeight_obs: { height: "0.4m", rising: false, time: mhTime2 },
            },
          ],
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data2);

    const sAfter = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区E")?.stations.find(st => st.name === "S6");
    assert.equal(sAfter.omaxHeight, "0.4m");
    assert.equal(sAfter.maxHeightRising, false); // 上昇中フラグがfalseに更新されること
    assert.equal(Number(sAfter.maxHeightTime), Number(mhTime2));
  });

  it("should clear old arrival prediction when condition transitions to '第１波の到達を確認', and read out arrival confirmation", async () => {
    const { ConvertTsunamiInfo, GenerateTsunamiText } = await import("../src/main/PROC_Tsunami.js");
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const { config } = await import("../src/main/state.js");

    config.home = config.home || {};
    config.home.TsunamiSect = "予報区F";
    config.notice = config.notice || {};
    config.notice.voice = config.notice.voice || {};
    config.notice.voice.Tsunami = "{home_area}では{first_height1}{first_height2}。{max_height1}。";

    const t1 = new Date(Date.now() - 5000).toISOString();
    const forecastTime = new Date(Date.now() + 600000);
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120090"] },
      areas: [
        {
          name: "予報区F",
          code: "260",
          grade: "Warning",
          cancelled: false,
          firstHeight: forecastTime,
          firstHeightCondition: null,
          maxHeight: "3m",
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    const areaBefore = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区F");
    assert.ok(areaBefore.firstHeight);

    // 第2報: 「第１波の到達を確認」
    const t2 = new Date(Date.now() - 2000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120090"] },
      areas: [
        {
          name: "予報区F",
          code: "260",
          grade: "Warning",
          cancelled: false,
          firstHeightCondition: "第１波の到達を確認",
          maxHeight: "3m",
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data2);

    const areaAfter = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区F");
    assert.equal(areaAfter.firstHeight, null, "第１波到達確認で旧予想時刻がクリアされること");
    assert.equal(areaAfter.firstHeightCondition, "第１波の到達を確認");

    const voice = GenerateTsunamiText(procTsunami.Tsunami_data_Marged);
    assert.ok(voice.includes("既に第１波が到達し"), "到達確認の音声が出力されること");
    assert.ok(voice.includes("第１波の到達を確認"), "到達予想時刻ではなく到達確認が出力されること");
    assert.ok(!voice.includes("に予想され"), "過去の予想時刻を誤読しないこと");
  });

  it("should clear old maxHeight and prediction when downgraded to Yoho, reading out '若干の海面変動'", async () => {
    const { ConvertTsunamiInfo, GenerateTsunamiText } = await import("../src/main/PROC_Tsunami.js");
    const procTsunami = await import("../src/main/PROC_Tsunami.js");
    const { config } = await import("../src/main/state.js");

    config.home = config.home || {};
    config.home.TsunamiSect = "予報区G";
    config.notice = config.notice || {};
    config.notice.voice = config.notice.voice || {};
    config.notice.voice.Tsunami = "{home_area}では{first_height1}。{max_height1}。";

    // 第1報: 注意報 1m
    const t1 = new Date(Date.now() - 5000).toISOString();
    const forecastTime = new Date(Date.now() + 600000);
    const data1 = {
      status: "通常",
      issue: { time: t1, EventID: ["202610120095"] },
      areas: [
        {
          name: "予報区G",
          code: "270",
          grade: "Watch",
          cancelled: false,
          firstHeight: forecastTime,
          maxHeight: "1m",
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data1);

    // 第2報: 津波予報（Yoho）へ格下げ
    const t2 = new Date(Date.now() - 2000).toISOString();
    const data2 = {
      status: "通常",
      issue: { time: t2, EventID: ["202610120095"] },
      areas: [
        {
          name: "予報区G",
          code: "270",
          grade: "Yoho",
          cancelled: false,
        },
      ],
      revocation: false,
    };
    ConvertTsunamiInfo(data2);

    const areaAfter = procTsunami.Tsunami_data_Marged.areas.find(a => a.name === "予報区G");
    assert.equal(areaAfter.maxHeight, null, "Yoho格下げで旧maxHeightがクリアされること");
    assert.equal(areaAfter.firstHeight, null, "Yoho格下げで旧firstHeightがクリアされること");

    const voice = GenerateTsunamiText(procTsunami.Tsunami_data_Marged);
    assert.ok(voice.includes("若干の海面変動"), "Yoho格下げで'若干の海面変動'が読み上げられること");
    assert.ok(!voice.includes("1メートル"), "旧maxHeightの1mが読まれないこと");
  });
});
