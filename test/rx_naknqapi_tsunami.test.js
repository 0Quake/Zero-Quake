import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Req_NaknQAPI_Rep } from "../src/main/RX_OtherAPIs.js";
import { DetectEEW, resetEEWStorage, clearEEWActive, EEW_Storage } from "../src/main/PROC_EEW.js";
import { MargeEQInfo, EQInfoData } from "../src/main/PROC_EQInfo.js";
import { ConvertTsunamiInfo, resetTsunamiData, Tsunami_Data, Tsunami_data_Marged } from "../src/main/PROC_Tsunami.js";
import { setConfig, setReplay } from "../src/main/state.js";

const originalFetch = globalThis.fetch;

function mockFetchJson(payload) {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(payload),
  });
}

describe("NaknQAPI Integration & Merge Consistency Tests", () => {
  beforeEach(() => {
    resetTsunamiData();
    resetEEWStorage();
    clearEEWActive();
    setReplay(0);
    setConfig({
      home: {
        latitude: 35.68,
        longitude: 139.76,
        Section: "東京都２３区",
        TsunamiSect: "東京湾内湾",
      },
      Info: {
        EQInfo: { showtraining: false, showTest: false, NotificationSound: false },
        EEW: { showtraining: false, kodoriyou: true, IntType: "max", NotificationSound: false },
        TsunamiInfo: {
          GetData: true,
          showtraining: false,
          showTest: false,
          NotificationSound: false,
          Global_threshold: 1,
          Local_threshold: 1,
        },
      },
      notice: { voice: {} },
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("Earthquake (MargeEQInfo)", () => {
    it("should preserve existing hypocenter/M when NaknQAPI sends Shindo Sokuhou without body.earthquake", async () => {
      const eventId = "202611220001";
      const now = Date.now();
      const originTime = new Date(now - 60000);

      MargeEQInfo([{
        status: "通常",
        eventId,
        category: "震源・震度に関する情報",
        reportDateTime: new Date(now - 30000),
        OriginTime: originTime,
        epiCenter: "茨城県沖",
        M: 5.2,
        maxI: "4",
        cancel: false,
        DetailURL: [],
      }], 1);

      mockFetchJson({
        kind: "earthquake",
        eventId,
        title: "震度速報",
        reportedAt: new Date(now - 10000).toISOString(),
        infoType: "publication",
        headline: "震度速報",
        body: {
          intensity: { maxIntensity: "4" },
        },
      });

      await Req_NaknQAPI_Rep("rep-eq-sokuhou-1");

      assert.equal(EQInfoData[eventId].epiCenter, "茨城県沖");
      assert.equal(EQInfoData[eventId].M, 5.2);
      assert.equal(EQInfoData[eventId].OriginTime.getTime(), originTime.getTime());
      assert.equal(EQInfoData[eventId].maxI, "4");
    });

    it("should clear M when NaknQAPI sends body.earthquake with magnitude.value=null", async () => {
      const eventId = "202611220002";
      const now = Date.now();

      MargeEQInfo([{
        status: "通常",
        eventId,
        category: "震源・震度に関する情報",
        reportDateTime: new Date(now - 30000),
        OriginTime: new Date(now - 60000),
        epiCenter: "三陸沖",
        M: 5.0,
        maxI: "3",
        cancel: false,
        DetailURL: [],
      }], 1);

      mockFetchJson({
        kind: "earthquake",
        eventId,
        title: "震源・震度に関する情報",
        reportedAt: new Date(now - 10000).toISOString(),
        infoType: "correction",
        body: {
          earthquake: {
            originTime: new Date(now - 60000).toISOString(),
            hypocenter: { name: "三陸沖" },
            magnitude: { value: null },
          },
          intensity: { maxIntensity: "3" },
        },
      });

      await Req_NaknQAPI_Rep("rep-eq-corr-1");

      assert.equal(EQInfoData[eventId].M, null);
      assert.equal(EQInfoData[eventId].maxI, "3");
    });

    it("should preserve existing maxI when NaknQAPI sends hypocenter-only report without body.intensity", async () => {
      const eventId = "202611220003";
      const now = Date.now();

      MargeEQInfo([{
        status: "通常",
        eventId,
        category: "震度速報",
        reportDateTime: new Date(now - 30000),
        maxI: "4",
        cancel: false,
        DetailURL: [],
      }], 1);

      mockFetchJson({
        kind: "earthquake",
        eventId,
        title: "震源に関する情報",
        reportedAt: new Date(now - 10000).toISOString(),
        infoType: "publication",
        body: {
          earthquake: {
            originTime: new Date(now - 60000).toISOString(),
            hypocenter: { name: "千葉県東方沖" },
            magnitude: { value: 4.8 },
          },
        },
      });

      await Req_NaknQAPI_Rep("rep-eq-hypo-1");

      assert.equal(EQInfoData[eventId].epiCenter, "千葉県東方沖");
      assert.equal(EQInfoData[eventId].M, 4.8);
      assert.equal(EQInfoData[eventId].maxI, "4");
    });
  });

  describe("Tsunami (ConvertTsunamiInfo)", () => {
    it("should emit numeric EventIDs so SameData merges cleanly with JMAXML", async () => {
      const issueTime = new Date(Date.now() - 10000);
      const numericEid = 202611220010;

      // JMAXML 相当の先行データ
      ConvertTsunamiInfo({
        title: "津波警報・注意報・予報a",
        status: "通常",
        issue: {
          time: issueTime,
          EventID: [numericEid],
          EarthQuake: [],
        },
        areas: [{
          code: 310,
          grade: "Warning",
          name: "東京湾内湾",
          cancelled: false,
          firstHeight: null,
          firstHeightCondition: null,
          stations: [],
          maxHeight: "3m",
        }],
        revocation: false,
        source: "jmaXML",
      });

      assert.equal(Tsunami_Data.length, 1);

      mockFetchJson({
        kind: "tsunami",
        title: "津波警報・注意報・予報a",
        reportedAt: issueTime.toISOString(),
        infoType: "publication",
        eventIds: [String(numericEid)],
        headline: "津波警報を発表しました。",
        body: {
          forecasts: [{
            category: "warning",
            area: { code: "310", name: "東京湾内湾" },
            maxHeight: { label: "３ｍ" },
          }],
        },
      });

      await Req_NaknQAPI_Rep("rep-tsunami-merge-1");

      // 同一報としてマージされ、Tsunami_Data が重複増加しないこと
      assert.equal(Tsunami_Data.length, 1);
      assert.deepEqual(Tsunami_Data[0].issue.EventID, [numericEid]);
      assert.equal(Tsunami_data_Marged.areas[0].maxHeight, "3m");
    });

    it("should allow NaknQAPI cancellation (Torikeshi) to cancel prior JMAXML tsunami report", async () => {
      const t1 = new Date(Date.now() - 30000);
      const t2 = new Date(Date.now() - 10000);
      const numericEid = 202611220011;

      ConvertTsunamiInfo({
        title: "津波警報・注意報・予報a",
        status: "通常",
        issue: { time: t1, EventID: [numericEid], EarthQuake: [] },
        areas: [{ code: 310, grade: "Watch", name: "東京湾内湾", cancelled: false, stations: [], maxHeight: "1m" }],
        revocation: false,
        source: "jmaXML",
      });

      mockFetchJson({
        kind: "tsunami",
        title: "津波警報・注意報・予報a",
        reportedAt: t2.toISOString(),
        infoType: "canceled",
        eventIds: [String(numericEid)],
      });

      await Req_NaknQAPI_Rep("rep-tsunami-cancel-1");

      assert.equal(Tsunami_data_Marged.Torikeshi, true);
      assert.equal(Tsunami_data_Marged.areas.length, 0);
    });

    it("should discard expired non-canceled tsunami reports older than 12 hours", async () => {
      const expiredTime = new Date(Date.now() - 13 * 3600 * 1000);

      mockFetchJson({
        kind: "tsunami",
        title: "津波警報・注意報・予報a",
        reportedAt: expiredTime.toISOString(),
        infoType: "publication",
        eventIds: ["202611210001"],
        body: {
          forecasts: [{ category: "warning", area: { code: "310", name: "東京湾内湾" }, maxHeight: { label: "3m" } }],
        },
      });

      await Req_NaknQAPI_Rep("rep-tsunami-expired-1");

      assert.equal(Tsunami_Data.length, 0);
    });

    it("should map observation initial push/pull and maxHeight condition/NFKC label accurately", async () => {
      const now = new Date(Date.now() - 5000);

      mockFetchJson({
        kind: "tsunami",
        title: "津波情報a",
        reportedAt: now.toISOString(),
        infoType: "publication",
        eventIds: ["202611220012"],
        body: {
          forecasts: [{ category: "advisory", area: { code: "310", name: "東京湾内湾" }, maxHeight: { label: "１ｍ" } }],
          observations: [{
            area: { name: "東京湾内湾" },
            station: { code: "31001", name: "東京" },
            firstArrival: { time: now.toISOString(), conditionLabel: "第１波の到達を確認", initial: "push" },
            maxHeight: { time: now.toISOString(), heightM: 0.4, label: "０．４ｍ", rising: true },
          }],
        },
      });

      await Req_NaknQAPI_Rep("rep-tsunami-obs-1");

      assert.equal(Tsunami_data_Marged.areas.length, 1);
      const area = Tsunami_data_Marged.areas[0];
      assert.equal(area.grade, "Watch");
      assert.equal(area.maxHeight, "1m");
      assert.equal(area.stations.length, 1);
      assert.equal(area.stations[0].firstHeightInitial, "押し");
      assert.equal(area.stations[0].omaxHeight, "0.4m");
      assert.equal(area.stations[0].maxHeightRising, true);
    });
  });

  describe("EEW (DetectEEW type 5)", () => {
    it("should preserve Alert flag from other sources when merged on same serial", () => {
      const now = new Date();
      const eventId = 202611220020;

      // 先に NaknQAPI (Alert: null)
      DetectEEW(5, {
        eventId: String(eventId),
        serial: 1,
        reportedAt: now.toISOString(),
        originTime: now.toISOString(),
        isWarning: true,
        isFinal: false,
        isAssumption: false,
        magnitude: 6.5,
        maxIntensity: "6-",
        hypocenter: { name: "千葉県北西部", latitude: 35.6, longitude: 140.1, depthKm: 70 },
        areas: [{ name: "東京都２３区", intensityTo: "5+", intensityFrom: "5-", arrived: false }],
      });

      // 後から ProjectBS (Alert: true)
      DetectEEW(1, {
        eventID: String(eventId),
        serial: 1,
        isWarn: true,
        issue: { time: now.toISOString() },
        originTime: now.toISOString(),
        isCancel: false,
        isFinal: false,
        maxIntensity: "6弱",
        hypocenter: {
          name: "千葉県北西部",
          magnitude: 6.5,
          location: { lat: 35.6, lng: 140.1, depth: 70 },
          isEstimate: false,
        },
        originalTelegram: "EBI 350 S5550 ////// 10",
      });

      assert.equal(EEW_Storage.length, 1);
      const latest = EEW_Storage[0].data[0];
      assert.equal(latest.warnZones[0].Name, "東京都２３区");
      assert.equal(latest.warnZones[0].Alert, true);
    });
  });
});
