import { it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { JSDOM } from "jsdom";

const source = readFileSync(new URL("../src/js/EQDetail.js", import.meta.url), "utf8");

function renderer() {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { style: {}, innerText: "", innerHTML: "" });
    return elements.get(id);
  };
  const context = vm.createContext({
    mapReady: false, pendingEQInfo: [], EQInfoData: [], EQInfo: {},
    EQInfoMarged: {}, ESmarkerElm: null, ZoomBounds: null,
    config: { Info: { EQInfo: {} }, data: { overlay: [] } },
    document: { getElementById: element },
    Boolean2: (value) => Boolean(value !== null && value !== undefined && value !== "" && !Number.isNaN(value) && (value || value === 0)),
    NormalizeDate: (_, value) => String(value),
    NormalizeShindo: (value, mode) => mode === 2 ? ["red"] : value,
    InfoType_add() {}, InfoType_remove() {}, mapZoomReset() {},
    DrawIntensity() { context.drawnIntensity = context.WaitingToDraw; },
    DrawLgIntensity(value) { context.drawnLg = value; },
    mapFillSwitch() {}, layerSelect() {}, radioSet() {}, InfoFetch() {},
  });
  for (const id of ["data_time", "data_maxI", "data_M", "data_depth", "data_center", "data_comment"]) context[id] = element(id);
  vm.runInContext(source.slice(source.indexOf("function ConvertEQInfo(data)"), source.indexOf("//↓震度情報タブUI↓")), context);
  vm.runInContext(source.slice(source.indexOf("function drawData()"), source.indexOf("var current_Popup;")), context);
  return { context, element };
}

it("buffers reports arriving during map initialization and applies the newest report on load", () => {
  const { context, element } = renderer();
  for (const [reportTime, mag] of [[1000, 4], [2000, 5]]) {
    context.ConvertEQInfo({ category: "震源・震度情報", reportTime, mag, maxI: "3" });
  }
  assert.equal(context.pendingEQInfo.length, 2);
  assert.equal(context.EQInfoData.length, 0);
  context.drawData();
  assert.equal(context.pendingEQInfo.length, 0);
  assert.equal(context.EQInfo.mag, 5);
  assert.equal(element("data_M").innerText, "M 5");
  // 遅れて旧報が届いても新報の表示を維持する。
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 500, mag: 3 });
  assert.equal(context.EQInfo.mag, 5);
});

it("clears previously drawn intensity data when a correction removes it", () => {
  const { context } = renderer();
  context.mapReady = true;
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, IntData: [{ name: "旧震度" }] });
  assert.equal(context.drawnIntensity.length, 1);
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, IntData: null });
  assert.equal(context.drawnIntensity.length, 0);
  assert.equal(context.drawnLg.length, 0);
});

it("correctly displays '700km以上' for depth -700, 700, or deeper", () => {
  const { context, element } = renderer();
  context.mapReady = true;

  // XMLパース結果の深さ -700 (Coordinate: -700000/)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, depth: -700 });
  assert.equal(element("data_depth").innerText, "700km以上");

  // 正の値 700
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, depth: 700 });
  assert.equal(element("data_depth").innerText, "700km以上");

  // 通常の深さ 10km (depth: -10)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 3000, depth: -10 });
  assert.equal(element("data_depth").innerText, "10km");

  // 深さ 0km (ごく浅い)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 4000, depth: 0 });
  assert.equal(element("data_depth").innerText, "ごく浅い");

  // 深さ不明 (depth: null)
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 5000, depth: null });
  assert.equal(element("data_depth").innerText, "不明");
});

it("correctly sets epicenter marker when lat or lng is 0 degrees", () => {
  const { context } = renderer();
  context.mapReady = true;
  context.map = {};
  const setLngLatCalls = [];
  context.maplibregl = {
    Popup: function() { return { setHTML() { return this; } }; },
    Marker: function() {
      return {
        setLngLat(lnglat) { setLngLatCalls.push(lnglat); return this; },
        setPopup() { return this; },
        addTo() { return this; },
        getElement() { return { removeAttribute() {}, setAttribute() {} }; },
      };
    },
  };
  context.document.createElement = () => ({ classList: { add() {} } });

  // 緯度0度、経度140度（赤道直下）
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, lat: 0, lng: 140, epiCenter: "赤道付近" });
  assert.equal(setLngLatCalls[0]?.[0], 140, "lngが140");
  assert.equal(setLngLatCalls[0]?.[1], 0, "latが0度でもマーカーが作成・配置されること");

  // 緯度10度、経度0度（本初子午線上）
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, lat: 10, lng: 0, epiCenter: "経度0度" });
  assert.equal(setLngLatCalls[1]?.[0], 0, "lngが0度でもマーカーが更新されること");
  assert.equal(setLngLatCalls[1]?.[1], 10, "latが10");
});

it("correctly displays 'Ｍ８を超える巨大地震' when magnitude indicates M8+", () => {
  const { context, element } = renderer();
  context.mapReady = true;

  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, mag: "M8超" });
  assert.equal(element("data_M").innerText, "Ｍ８を超える巨大地震");

  // 通常の数値M
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, mag: 7.2, magType: "Mj" });
  assert.equal(element("data_M").innerText, "Mj 7.2");

  // 通常の文字列M（"4.8", "5.8" など8を含むもの）が誤って巨大地震と判定されないこと
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2500, mag: "4.8", magType: "M" });
  assert.equal(element("data_M").innerText, "M 4.8");
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2600, mag: "5.8", magType: "M" });
  assert.equal(element("data_M").innerText, "M 5.8");

  // M不明
  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 3000, mag: null });
  assert.equal(element("data_M").innerText, "不明");
});

it("correctly displays epicenter name in EQDetail UI", () => {
  const { context, element } = renderer();
  context.mapReady = true;

  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 1000, epiCenter: "三陸沖" });
  assert.equal(element("data_center").innerText, "三陸沖");

  context.ConvertEQInfo({ category: "震源・震度情報", reportTime: 2000, epiCenter: "" });
  assert.equal(element("data_center").innerText, "不明");
});

it("correctly extracts epicenter and M8+ from XML and renders them in EQDetail", () => {
  const { context, element } = renderer();
  context.mapReady = true;

  const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control><Title>震源・震度に関する情報</Title><Status>通常</Status><DateTime>2026-10-18T12:00:00Z</DateTime></Control>
  <Head><Title>震源・震度に関する情報</Title><ReportDateTime>2026-10-18T12:00:00Z</ReportDateTime><EventID>20261018120000</EventID><InfoType>発表</InfoType></Head>
  <Body xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/">
    <Earthquake>
      <OriginTime>2026-10-18T11:58:00Z</OriginTime>
      <Name>三陸沖</Name>
      <jmx_eb:Coordinate>+38.0+143.0-10000/</jmx_eb:Coordinate>
      <jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ８を超える巨大地震">NaN</jmx_eb:Magnitude>
    </Earthquake>
  </Body>
</Report>`;

  const dom = new JSDOM(sampleXml, { contentType: "text/xml" });
  const xml = dom.window.document;

  context.xml = xml;
  context.eid = "20261018120000";
  context.fetchedURL = [];
  context.jmaL_json_fetched = false;
  context.parse_LatLngDepth = () => [null, "38.0", "143.0", "10000"];
  context.document.createElement = () => ({ classList: { add() {} } });
  context.map = {};
  context.maplibregl = {
    Popup: function() { return { setHTML() { return this; } }; },
    Marker: function() {
      return {
        setLngLat() { return this; },
        setPopup() { return this; },
        addTo() { return this; },
        getElement() { return { removeAttribute() {}, setAttribute() {} }; },
      };
    },
  };

  const parseSnippet = source.slice(
    source.indexOf('var EarthquakeElm = xml.getElementsByTagName("Earthquake")?.[eqIndex];'),
    source.indexOf('var IntensityElm = xml.querySelector("Body Intensity");')
  );

  vm.runInContext(`
    var eqIndex = 0;
    ${parseSnippet}
    ConvertEQInfo({
      category: "震源・震度に関する情報",
      status: "通常",
      reportTime: new Date("2026-10-18T12:00:00Z"),
      originTime: originTimeTmp,
      mag: magnitudeTmp,
      magType: magnitudeTypeTmp,
      lat: LatTmp,
      lng: LngTmp,
      depth: DepthTmp,
      epiCenter: epiCenterTmp,
    });
  `, context);

  assert.equal(element("data_center").innerText, "三陸沖", "XML解析から抽出された震源名が表示されること");
  assert.equal(element("data_M").innerText, "Ｍ８を超える巨大地震", "XML解析のdescriptionからM8超が反映されること");
});

it("handles XML with missing header/intensity elements without throwing unhandled exceptions", () => {
  const { context } = renderer();

  // Head/Title, Control/Status, Pref/Name, Station/Name, MaxInt 等が欠落したXML
  const incompleteXml = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://xml.kishou.go.jp/jmaxml1/">
  <Control>
    <!-- Title欠落, Status欠落 -->
    <DateTime>2026-10-18T12:00:00Z</DateTime>
  </Control>
  <Head>
    <!-- Title欠落 -->
    <ReportDateTime>2026-10-18T12:00:00Z</ReportDateTime>
  </Head>
  <Body>
    <Earthquake>
      <!-- OriginTime欠落, Name欠落 -->
    </Earthquake>
    <Intensity>
      <!-- MaxInt欠落 -->
      <Observation>
        <Pref>
          <!-- Name欠落 -->
          <Area>
            <City>
              <IntensityStation>
                <Code>12345</Code>
                <!-- Name欠落 -->
                <Int>3</Int>
              </IntensityStation>
            </City>
          </Area>
        </Pref>
      </Observation>
    </Intensity>
  </Body>
</Report>`;

  const dom = new JSDOM(incompleteXml, { contentType: "application/xml" });
  context.xml = dom.window.document;
  context.eid = "20261018120000";
  context.JMA_Int_Points = { 12345: { x: 139.7, y: 35.6 } };
  context.jmaL_json_fetched = false;
  context.parse_LatLngDepth = () => null;

  const jmaFetchIdx = source.indexOf("function jmaXMLFetch");
  const parseSnippet = source.slice(
    source.indexOf('var cancelTmp =', jmaFetchIdx),
    source.indexOf('ConvertEQInfo({', jmaFetchIdx)
  );

  assert.doesNotThrow(() => {
    vm.runInContext(`
      var newInfoDateTime = null;
      ${parseSnippet}
      var cdtStr = xml.querySelector("Control DateTime")?.textContent;
      ConvertEQInfo({
        category: infoType,
        ControlDateTime: cdtStr ? new Date(cdtStr) : null,
        status: xml.querySelector("Control Status")?.textContent || "通常",
        reportTime: ReportTime || new Date(xml.querySelector("Head ReportDateTime")?.textContent || 0),
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        magType: magnitudeTypeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: DepthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
        LngIntData: jmaL_json_fetched ? null : LngIntData,
        IntData: IntData,
      });
    `, context);
  }, "欠落要素があるXMLでも未catch例外が発生しないこと");

  assert.equal(context.pendingEQInfo.length, 1);
});

