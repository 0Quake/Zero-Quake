import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { NormalizeShindo, Boolean2, newDate2 } from "../src/main/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplesDir = path.join(__dirname, "fixtures", "jmaxml");

const DomPsr = new (new JSDOM()).window.DOMParser();

// JMA観測点マスター
const pointsRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/Resource/JMA_Int_Points.json"), "utf-8")
);
const JMA_Int_Points = {};
pointsRaw.forEach((p) => {
  JMA_Int_Points[p.c] = p;
});

// eqdetail.js 同等の座標パーサー
function parse_LatLngDepth(str) {
  try {
    if (str) {
      return String(str)
        .replaceAll("+", "｜+")
        .replaceAll("-", "｜-")
        .replaceAll("/", "")
        .split("｜");
    }
  } catch {
    return null;
  }
}

// RX_JMAXML.js:305-366 同等の抽出ロジック（地震情報）
function extractRXJMAXML_Earthquake(xml) {
  const titleElm = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("Title")?.[0];
  const title = titleElm?.textContent;
  const cancel = (xml.getElementsByTagName("InfoType")[0]?.textContent || "").trim() === "取消";

  const EarthquakeElm = xml.getElementsByTagName("Body")?.[0]?.getElementsByTagName("Earthquake")?.[0];
  let originTime;
  let epiCenterTmp;
  let magnitudeTmp;
  if (EarthquakeElm) {
    const OTimeStr = EarthquakeElm.getElementsByTagName("OriginTime")?.[0]?.textContent;
    if (OTimeStr) originTime = new Date(OTimeStr);
    epiCenterTmp = EarthquakeElm.getElementsByTagName("Name")?.[0]?.textContent;
    const magElm = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")?.[0];
    const magStr = magElm?.textContent;
    const magDesc = magElm?.getAttribute?.("description") || "";
    if (magStr) magnitudeTmp = Number(magStr);
    if (!Boolean2(magnitudeTmp)) {
      if (magDesc.includes("８を超える巨大地震") || magDesc.includes("8を超える巨大地震")) {
        magnitudeTmp = "M8超";
      } else {
        magnitudeTmp = null;
      }
    }
  }

  const TgDateStr = xml.getElementsByTagName("TargetDateTime")?.[0]?.textContent;
  if (TgDateStr && !originTime) originTime = new Date(TgDateStr);

  const IntElm = xml.getElementsByTagName("Body")?.[0]?.getElementsByTagName("Intensity")?.[0];
  let maxInt;
  let maxLgInt;
  if (IntElm) {
    const ObsElm = IntElm.getElementsByTagName("Observation")?.[0];
    maxInt = ObsElm?.getElementsByTagName("MaxInt")?.[0]?.textContent;
    maxLgInt = ObsElm?.getElementsByTagName("MaxLgInt")?.[0]?.textContent;
    if (maxInt === "[objectHTMLUnknownElement]") maxInt = null;
  }

  const headline = xml?.getElementsByTagName("Head")?.[0]?.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent;
  const cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;
  const rdtStr = xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent;

  return {
    status: xml.getElementsByTagName("Status")?.[0]?.textContent,
    eventId: xml.getElementsByTagName("EventID")?.[0]?.textContent,
    category: xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("Title")?.[0]?.textContent,
    ControlDateTime: cdtStr ? new Date(cdtStr) : null,
    OriginTime: originTime,
    epiCenter: epiCenterTmp,
    M: magnitudeTmp,
    maxI: IntElm ? NormalizeShindo(maxInt) : undefined,
    maxLgInt: IntElm ? maxLgInt : undefined,
    cancel: Boolean(cancel),
    reportDateTime: rdtStr ? new Date(rdtStr) : null,
    headline: headline,
  };
}

// RX_JMAXML.js:367-426 同等の抽出ロジック（地震回数に関する情報）
function extractRXJMAXML_EarthquakeCount(xml) {
  const cancel = (xml.getElementsByTagName("InfoType")[0]?.textContent || "").trim() === "取消";
  const hourly = [];
  const std = [];
  let sum = null;

  if (xml.getElementsByTagName("EarthquakeCount")[0]) {
    xml.querySelectorAll("EarthquakeCount Item").forEach((el) => {
      const type = el?.getAttribute("type");
      const StTimeStr = el?.getElementsByTagName("StartTime")?.[0]?.textContent;
      const EnTimeStr = el?.getElementsByTagName("EndTime")?.[0]?.textContent;
      const NumStr = el?.getElementsByTagName("Number")?.[0]?.textContent;
      const FNumStr = el?.getElementsByTagName("FeltNumber")?.[0]?.textContent;
      const StartTime = StTimeStr ? new Date(StTimeStr) : null;
      const EndTime = EnTimeStr ? new Date(EnTimeStr) : null;
      const _Number = NumStr && Number(NumStr) !== -1 ? Number(NumStr) : null;
      const FeltNumber = FNumStr && Number(FNumStr) !== -1 ? Number(FNumStr) : null;

      const data = {
        StartTime: StartTime,
        EndTime: EndTime,
        Number: _Number,
        FeltNumber: FeltNumber,
      };

      if (type === "１時間地震回数") {
        hourly.push(data);
      } else if (type === "累積地震回数") {
        sum = data;
      } else if (type === "地震回数") {
        std.push(data);
      }
    });
  }

  const headline = xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent;
  const Text = xml.querySelector("Body Text")?.textContent || "";
  const NextAdvisory = xml.querySelector("NextAdvisory")?.textContent || "";
  const FreeFormComment = xml.querySelector("Comments FreeFormComment")?.textContent || "";
  const rdtStr = xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent;
  const isCancel = cancel || xml.getElementsByTagName("Status")?.[0]?.textContent === "取消";
  const cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;

  return {
    ControlDateTime: cdtStr ? newDate2(cdtStr) : null,
    status: xml.getElementsByTagName("Status")?.[0]?.textContent,
    eventId: xml.getElementsByTagName("EventID")?.[0]?.textContent,
    category: xml.getElementsByTagName("Title")?.[0]?.textContent,
    cancel: Boolean(isCancel),
    reportDateTime: newDate2(rdtStr),
    headline: headline || "",
    hourly: hourly,
    sum: sum,
    std: std,
    Text: Text,
    NextAdvisory: NextAdvisory,
    FreeFormComment: FreeFormComment,
  };
}

// eqdetail.js:1150-1320 同等の詳細抽出ロジック
function extractEQDetail(xml, eid) {
  const cancelTmp = (xml.querySelector("InfoType")?.textContent || "").trim() === "取消";
  const ReportTime = new Date(xml.querySelector("Head ReportDateTime")?.textContent);
  const eventIds = (xml.querySelector("EventID")?.textContent || "").trim().split(/\s+/);
  const eqIndex = Math.max(0, eventIds.indexOf(String(eid)));
  const EarthquakeElm = xml.getElementsByTagName("Earthquake")?.[eqIndex];

  let originTimeTmp;
  let epiCenterTmp;
  let magnitudeTmp;
  let LatTmp = null;
  let LngTmp = null;
  let DepthTmp = null;
  let maxIntTmp;

  if (EarthquakeElm) {
    const originTimeStr = EarthquakeElm.querySelector("OriginTime")?.textContent;
    if (originTimeStr) originTimeTmp = new Date(originTimeStr);
    epiCenterTmp = EarthquakeElm.querySelector("Name")?.textContent;
    const magElm = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")?.[0];
    magnitudeTmp = Number(magElm?.textContent);
    const magDesc = magElm?.getAttribute?.("description") || "";
    if (!Boolean2(magnitudeTmp)) {
      if (magDesc.includes("８を超える巨大地震") || magDesc.includes("8を超える巨大地震")) {
        magnitudeTmp = "M8超";
      } else {
        magnitudeTmp = null;
      }
    }
    const LatLngDepth = parse_LatLngDepth(EarthquakeElm.getElementsByTagName("jmx_eb:Coordinate")?.[0]?.textContent);
    if (LatLngDepth && LatLngDepth.length) {
      const parsedLat = Number(LatLngDepth[1]);
      const parsedLng = Number(LatLngDepth[2]);
      if (
        !isNaN(parsedLat) &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        !isNaN(parsedLng) &&
        parsedLng >= -180 &&
        parsedLng <= 180
      ) {
        LatTmp = parsedLat;
        LngTmp = parsedLng;
        DepthTmp = LatLngDepth[3] ? Number(LatLngDepth[3] / 1000) : null;
      }
    }
  } else {
    const tgDateStr = xml.querySelector("Head TargetDateTime")?.textContent;
    if (tgDateStr) originTimeTmp = new Date(tgDateStr);
  }

  const IntensityElm = xml.querySelector("Body Intensity");
  if (IntensityElm) {
    maxIntTmp = NormalizeShindo(IntensityElm.querySelector("MaxInt")?.textContent, 4);
  }

  const IntData = [];
  if (xml.querySelector("Body Intensity") && xml.querySelector("Body Intensity Observation Pref")) {
    xml.querySelectorAll("Body Intensity Observation Pref").forEach((elm) => {
      const areaData = [];
      if (elm.querySelectorAll("Area")[0]) {
        elm.querySelectorAll("Area").forEach((elm2) => {
          const cityData = [];
          if (elm2.querySelectorAll("City")[0]) {
            elm2.querySelectorAll("City").forEach((elm3) => {
              const stData = [];
              if (elm3.querySelectorAll("IntensityStation")[0]) {
                elm3.querySelectorAll("IntensityStation").forEach((elm4) => {
                  const codeVal = Number(elm4.querySelector("Code")?.textContent);
                  const pointT = JMA_Int_Points[codeVal];
                  if (elm4.querySelector("Int")) {
                    stData.push({
                      code: codeVal,
                      lat: pointT ? pointT.y : null,
                      lng: pointT ? pointT.x : null,
                      name: elm4.querySelector("Name")?.textContent || "",
                      int: elm4.querySelector("Int")?.textContent || "",
                    });
                  }
                });
              }
              const cityInt = elm3.querySelector(":scope > MaxInt")?.textContent || elm3.querySelector(":scope > Condition")?.textContent || null;
              cityData.push({
                name: elm3.querySelector(":scope > Name")?.textContent || "",
                int: NormalizeShindo(cityInt),
                condition: elm3.querySelector(":scope > Condition")?.textContent || null,
                station: stData,
              });
            });
          }
          const areaInt = elm2.querySelector(":scope > MaxInt")?.textContent || elm2.querySelector(":scope > Condition")?.textContent || null;
          areaData.push({
            name: elm2.querySelector(":scope > Name")?.textContent || "",
            int: NormalizeShindo(areaInt),
            condition: elm2.querySelector(":scope > Condition")?.textContent || null,
            city: cityData,
          });
        });
      }
      IntData.push({
        name: elm.querySelector("Name")?.textContent || "",
        int: NormalizeShindo(elm.querySelector("MaxInt")?.textContent),
        area: areaData,
      });
    });
  }

  return {
    cancel: cancelTmp,
    reportTime: ReportTime,
    originTime: originTimeTmp,
    epiCenter: epiCenterTmp,
    mag: magnitudeTmp,
    lat: LatTmp,
    lng: LngTmp,
    depth: DepthTmp,
    maxI: maxIntTmp,
    IntData: IntData,
  };
}

describe("JMA XML Real Samples & Integrity Verification", () => {
  const sampleFiles = fs
    .readdirSync(samplesDir)
    .filter((f) => f.startsWith("32-35") && f.endsWith(".xml"));

  it("should have all 33 sample XML files available in test fixtures", () => {
    assert.equal(sampleFiles.length, 33, "全33件のサンプルXMLが正しく配置されていること");
  });

  describe("Real Sample Files - Full Parsing & Field Integrity", () => {
    sampleFiles.forEach((filename) => {
      it(`parses and validates field integrity of ${filename}`, () => {
        const fullPath = path.join(samplesDir, filename);
        const xmlText = fs.readFileSync(fullPath, "utf-8");

        const xml = DomPsr.parseFromString(xmlText, "text/xml");
        assert.equal(xml.getElementsByTagName("parsererror").length, 0, "XML構文エラーがないこと");

        const controlTitle = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("Title")?.[0]?.textContent;
        assert.ok(controlTitle, "Control/Titleが存在すること");

        const eventId = xml.getElementsByTagName("EventID")?.[0]?.textContent;
        assert.ok(eventId && /^\d{14}$/.test(eventId), `EventID (${eventId}) が14桁の形式であること`);

        const rdtStr = xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent;
        assert.ok(rdtStr, "ReportDateTimeが存在すること");
        const rdt = new Date(rdtStr);
        assert.ok(!isNaN(rdt.getTime()), "ReportDateTimeが有効な日時であること");

        if (controlTitle === "地震回数に関する情報") {
          const res = extractRXJMAXML_EarthquakeCount(xml);
          assert.equal(res.eventId, eventId);
          assert.ok(Array.isArray(res.hourly), "hourlyが配列であること");
          assert.ok(res.sum && typeof res.sum.Number === "number", "累積地震回数が抽出されていること");
          assert.ok(res.NextAdvisory.length > 0, "NextAdvisoryが存在すること");
          assert.ok(res.FreeFormComment.length > 0, "FreeFormCommentが存在すること");
        } else {
          // 地震情報 (VXSE51, 52, 53, 61)
          const rxRes = extractRXJMAXML_Earthquake(xml);

          assert.equal(rxRes.eventId, eventId);
          assert.ok(["通常", "訓練", "試験"].includes(rxRes.status), "Statusが有効な種別であること");
          assert.equal(typeof rxRes.cancel, "boolean");

          const isCancel = xml.querySelector("InfoType")?.textContent?.trim() === "取消";
          if (isCancel) {
            assert.equal(rxRes.cancel, true, "取消報ではcancelがtrueであること");
            assert.equal(rxRes.epiCenter, undefined, "取消報では震央名がundefinedであること");
            assert.ok(rxRes.M == null, "取消報ではMがnullまたはundefinedであること");
            assert.equal(rxRes.maxI, undefined, "取消報ではmaxIがundefinedであること");
          } else if (controlTitle === "震度速報") {
            assert.equal(rxRes.category, "震度速報");
            assert.ok(rxRes.maxI, "震度速報にmaxIが存在すること");
            assert.equal(rxRes.epiCenter, undefined, "震度速報では震央名が未決定(undefined)であること");
          } else if (controlTitle === "震源に関する情報") {
            assert.equal(rxRes.category, "震源に関する情報");
            assert.ok(rxRes.epiCenter, "震源情報に震央名が存在すること");
            assert.ok(typeof rxRes.M === "number" && !isNaN(rxRes.M), "震源情報に有効なMが存在すること");
            assert.equal(rxRes.maxI, undefined, "震源情報には震度データがないこと");
          } else if (controlTitle === "震源・震度に関する情報" || controlTitle === "顕著な地震の震源要素更新のお知らせ") {
            assert.ok(rxRes.epiCenter, "震央名が存在すること");
            assert.ok(typeof rxRes.M === "number" && !isNaN(rxRes.M), "有効なMが存在すること");

            // eqdetail 詳細パース検証
            const detail = extractEQDetail(xml, eventId);
            assert.equal(detail.epiCenter, rxRes.epiCenter);
            assert.equal(detail.mag, rxRes.M);

            if (detail.lat !== null) {
              assert.ok(detail.lat >= -90 && detail.lat <= 90, `緯度(${detail.lat})が有効範囲内であること`);
              assert.ok(detail.lng >= -180 && detail.lng <= 180, `経度(${detail.lng})が有効範囲内であること`);
              assert.ok(typeof detail.depth === "number", "深さが数値であること");
            }

            // 観測点リストがある場合
            if (detail.IntData.length > 0) {
              assert.ok(detail.maxI, "震度観測点がある場合はmaxIが存在すること");
              detail.IntData.forEach((pref) => {
                assert.ok(pref.name, "都道府県名が存在すること");
                pref.area.forEach((ar) => {
                  assert.ok(ar.name, "地域名が存在すること");
                  ar.city.forEach((ct) => {
                    assert.ok(ct.name, "市町村名が存在すること");
                    ct.station.forEach((st) => {
                      assert.ok(st.name, "観測点名が存在すること");
                      assert.ok(st.int, "観測点震度が存在すること");
                      // JMA_Int_Points.json にある場合は緯度経度が数値、未登録の場合はnull
                      if (JMA_Int_Points[st.code]) {
                        assert.ok(typeof st.lat === "number" && typeof st.lng === "number", "登録済観測点のlat/lngが数値であること");
                      } else {
                        assert.equal(st.lat, null, "未登録観測点のlatがnullであること");
                        assert.equal(st.lng, null, "未登録観測点のlngがnullであること");
                      }
                    });
                  });
                });
              });
            }
          }
        }
      });
    });
  });

  describe("Tag Omission and Mutation Robustness", () => {
    // 駿河湾 地震情報 (震源・震度・観測点フルセット)
    const baseXmlText = fs.readFileSync(path.join(samplesDir, "32-35_04_04_240613_VXSE53.xml"), "utf-8");

    it("should safely fall back to TargetDateTime when OriginTime is missing", () => {
      const mutated = baseXmlText.replace(/<OriginTime>[^<]*<\/OriginTime>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);

      assert.ok(res.OriginTime instanceof Date, "OriginTimeがTargetDateTimeから補完されること");
      assert.ok(!isNaN(res.OriginTime.getTime()), "補完された日時が有効であること");
    });

    it("should return undefined OriginTime without throwing when both OriginTime and TargetDateTime are missing", () => {
      const mutated = baseXmlText
        .replace(/<OriginTime>[^<]*<\/OriginTime>/g, "")
        .replace(/<TargetDateTime>[^<]*<\/TargetDateTime>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);

      assert.equal(res.OriginTime, undefined, "日時タグ全欠損時にクラッシュせずundefinedを返すこと");
    });

    it("should safely handle complete missing of Earthquake element", () => {
      const mutated = baseXmlText.replace(/<Earthquake>[\s\S]*?<\/Earthquake>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);

      assert.equal(res.epiCenter, undefined);
      assert.ok(res.M == null, "Earthquakeタグ欠損時にMがnullまたはundefinedであること");
      assert.ok(res.maxI, "震度データ自体は維持されること");
    });

    it("should cleanly return M: null when Magnitude tag is empty or '不明'", () => {
      const mutated1 = baseXmlText.replace(
        /<jmx_eb:Magnitude[^>]*>[^<]*<\/jmx_eb:Magnitude>/g,
        '<jmx_eb:Magnitude condition="不明"/>'
      );
      const xml1 = DomPsr.parseFromString(mutated1, "text/xml");
      const res1 = extractRXJMAXML_Earthquake(xml1);
      assert.equal(res1.M, null, "不明時にNaNではなくnullになること");

      const mutated2 = baseXmlText.replace(
        /<jmx_eb:Magnitude[^>]*>[^<]*<\/jmx_eb:Magnitude>/g,
        "<jmx_eb:Magnitude></jmx_eb:Magnitude>"
      );
      const xml2 = DomPsr.parseFromString(mutated2, "text/xml");
      const res2 = extractRXJMAXML_Earthquake(xml2);
      assert.equal(res2.M, null, "空タグ時にNaNではなくnullになること");
    });

    it("should extract M8超 when Magnitude description indicates M8+", () => {
      const mutated = baseXmlText.replace(
        /<jmx_eb:Magnitude[^>]*>[^<]*<\/jmx_eb:Magnitude>/g,
        '<jmx_eb:Magnitude condition="不明" description="Ｍ８を超える巨大地震">NaN</jmx_eb:Magnitude>'
      );
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);
      assert.equal(res.M, "M8超", "M8超巨大地震が正しく検出されること");
    });

    it("should safely handle missing Coordinate in eqdetail", () => {
      const mutated = baseXmlText.replace(/<jmx_eb:Coordinate[^>]*>[^<]*<\/jmx_eb:Coordinate>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const detail = extractEQDetail(xml, "20100125161517");

      assert.equal(detail.lat, null);
      assert.equal(detail.lng, null);
      assert.equal(detail.depth, null);
    });

    it("should safely handle completely missing Intensity block", () => {
      const mutated = baseXmlText.replace(/<Intensity>[\s\S]*?<\/Intensity>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);
      assert.equal(res.maxI, undefined);

      const detail = extractEQDetail(xml, "20100125161517");
      assert.equal(detail.maxI, undefined);
      assert.deepEqual(detail.IntData, []);
    });

    it("should handle Observation with missing MaxInt gracefully", () => {
      const mutated = baseXmlText.replace(/<MaxInt>[^<]*<\/MaxInt>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);
      assert.equal(res.maxI, "?", "MaxInt欠損時にクラッシュせず不明(?)になること");
    });

    it("should handle missing Headline cleanly", () => {
      const mutated = baseXmlText.replace(/<Headline>[\s\S]*?<\/Headline>/g, "");
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const res = extractRXJMAXML_Earthquake(xml);
      assert.equal(res.headline, undefined, "Headline欠損時にクラッシュしないこと");
    });

    it("should handle Condition (震度５弱以上未入電) at city level in eqdetail", () => {
      const mutated = baseXmlText.replace(
        /<City>\s*<Name>([^<]+)<\/Name>\s*<Code>[^<]+<\/Code>\s*<MaxInt>[^<]+<\/MaxInt>/,
        "<City><Name>$1</Name><Code>9999999</Code><Condition>震度５弱以上未入電</Condition>"
      );
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const detail = extractEQDetail(xml, "20100125161517");

      const targetCity = detail.IntData[0]?.area[0]?.city?.find((c) => c.condition === "震度５弱以上未入電");
      assert.ok(targetCity, "Conditionから５弱以上未入電が拾われること");
      assert.equal(targetCity.int, "未", "震度５弱以上未入電が正規化されて'未'になること");
    });

    it("should safely handle unknown station codes with lat: null, lng: null", () => {
      const mutated = baseXmlText.replace(
        /<IntensityStation>\s*<Name>([^<]+)<\/Name>\s*<Code>[^<]+<\/Code>/,
        "<IntensityStation><Name>未知観測点</Name><Code>9999999</Code>"
      );
      const xml = DomPsr.parseFromString(mutated, "text/xml");
      const detail = extractEQDetail(xml, "20100125161517");

      let foundUnknown = false;
      detail.IntData.forEach((pref) => {
        pref.area.forEach((ar) => {
          ar.city.forEach((ct) => {
            const st = ct.station.find((s) => s.code === 9999999);
            if (st) {
              foundUnknown = true;
              assert.equal(st.lat, null);
              assert.equal(st.lng, null);
              assert.equal(st.name, "未知観測点");
            }
          });
        });
      });
      assert.ok(foundUnknown, "未知観測点がlat/lng=nullとして安全に格納されること");
    });
  });
});
