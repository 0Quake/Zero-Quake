/* global NormalizeDate NormalizeShindo LgIntConvert maplibregl pmtiles removeChild*/

var pointList = {};

var data_time = document.getElementById("data_time");
var data_maxI = document.getElementById("data_maxI");
var data_M = document.getElementById("data_M");
var data_depth = document.getElementById("data_depth");
var data_center = document.getElementById("data_center");
var data_comment = document.getElementById("data_comment");
var mapContainer = document.getElementById("mapcontainer");
// prettier-ignore
var areaLocation = { "石狩地方北部": [141.54675, 43.43578], "石狩地方中部": [141.23705, 42.98504], "石狩地方南部": [141.52402, 42.85309], "渡島地方北部": [140.18512, 42.32746], "渡島地方東部": [140.693, 41.94338], "渡島地方西部": [140.31204, 41.60581], "檜山地方": [139.9998, 42.3766], "後志地方北部": [140.81871, 43.16516], "後志地方東部": [140.85942, 42.83641], "後志地方西部": [140.53046, 42.91356], "北海道奥尻島": [139.46697, 42.15214], "空知地方北部": [142.01984, 43.84019], "空知地方中部": [142.04045, 43.47655], "空知地方南部": [141.94768, 43.14824], "上川地方北部": [142.42944, 44.40536], "上川地方中部": [142.67244, 43.7236], "上川地方南部": [142.50933, 43.21754], "留萌地方中北部": [141.90835, 44.54206], "留萌地方南部": [141.77079, 43.94982], "宗谷地方北部": [141.94211, 45.20023], "宗谷地方南部": [142.39298, 44.88518], "北海道利尻礼文": [141.23048, 45.17836], "網走地方": [144.48047, 43.90311], "北見地方": [143.79168, 43.84761], "紋別地方": [143.30967, 44.19196], "胆振地方西部": [140.82689, 42.60353], "胆振地方中東部": [141.39009, 42.64401], "日高地方西部": [142.37647, 42.7154], "日高地方中部": [142.59539, 42.47374], "日高地方東部": [142.93003, 42.19558], "十勝地方北部": [143.32314, 43.32573], "十勝地方中部": [143.28856, 42.87941], "十勝地方南部": [143.15465, 42.44626], "釧路地方北部": [144.39781, 43.54639], "釧路地方中南部": [144.51042, 43.20982], "根室地方北部": [145.00385, 43.90127], "根室地方中部": [144.95723, 43.41467], "根室地方南部": [145.34732, 43.27908], "青森県津軽北部": [140.4857, 40.93446], "青森県津軽南部": [140.36289, 40.59874], "青森県三八上北": [141.20052, 40.68776], "青森県下北": [141.11944, 41.32661], "岩手県沿岸北部": [141.75098, 39.92458], "岩手県沿岸南部": [141.71304, 39.23375], "岩手県内陸北部": [141.21093, 39.93023], "岩手県内陸南部": [141.09343, 39.1759], "宮城県北部": [141.08257, 38.72049], "宮城県南部": [140.60006, 38.02044], "宮城県中部": [140.90636, 38.40323], "秋田県沿岸北部": [140.11294, 40.1368], "秋田県沿岸南部": [140.15039, 39.43931], "秋田県内陸北部": [140.56991, 40.15347], "秋田県内陸南部": [140.47855, 39.43633], "山形県庄内": [139.87396, 38.72509], "山形県最上": [140.32742, 38.77739], "山形県村山": [140.24408, 38.38752], "山形県置賜": [139.97007, 38.0049], "福島県中通り": [140.37852, 37.38397], "福島県浜通り": [140.94343, 37.38026], "福島県会津": [139.63988, 37.38346], "茨城県北部": [140.44279, 36.53773], "茨城県南部": [140.21035, 36.07702], "栃木県北部": [139.8116, 36.87802], "栃木県南部": [139.84548, 36.52125], "群馬県北部": [139.01583, 36.72978], "群馬県南部": [139.03612, 36.30946], "埼玉県北部": [139.43115, 36.11991], "埼玉県南部": [139.49001, 35.93128], "埼玉県秩父": [138.94888, 35.99408], "千葉県北東部": [140.44757, 35.63605], "千葉県北西部": [140.16283, 35.66762], "千葉県南部": [140.10234, 35.19097], "東京都２３区": [139.73616, 35.67495], "東京都多摩東部": [139.38037, 35.65425], "東京都多摩西部": [139.1547, 35.7822], "神津島": [139.15228, 34.21408], "伊豆大島": [139.40239, 34.73847], "新島": [139.21407, 34.32634], "三宅島": [139.52125, 34.08539], "八丈島": [139.80768, 33.10241], "小笠原": [141.3198, 24.7791], "神奈川県東部": [139.49668, 35.38991], "神奈川県西部": [139.14266, 35.40645], "新潟県上越": [138.17565, 37.03639], "新潟県中越": [138.83942, 37.23676], "新潟県下越": [139.44225, 38.0003], "新潟県佐渡": [138.35139, 38.0673], "富山県東部": [137.42681, 36.67474], "富山県西部": [136.91921, 36.62078], "石川県能登": [136.79615, 37.14454], "石川県加賀": [136.59766, 36.4297], "福井県嶺北": [136.35588, 35.97698], "福井県嶺南": [135.96354, 35.55479], "山梨県中・西部": [138.5194, 35.57003], "山梨県東部・富士五湖": [138.95487, 35.60847], "長野県北部": [138.139, 36.68361], "長野県中部": [138.08506, 36.16776], "長野県南部": [137.87913, 35.6424], "岐阜県飛騨": [137.19971, 36.04247], "岐阜県美濃東部": [137.30969, 35.51208], "岐阜県美濃中西部": [136.68755, 35.60052], "静岡県伊豆": [138.95185, 34.89169], "静岡県東部": [138.75944, 35.19231], "静岡県中部": [138.30691, 35.13232], "静岡県西部": [137.84768, 34.94967], "愛知県東部": [137.52624, 34.90666], "愛知県西部": [137.16109, 35.05975], "三重県北部": [136.57907, 35.02821], "三重県中部": [136.29628, 34.60764], "三重県南部": [136.19401, 34.1446], "滋賀県北部": [136.15375, 35.41752], "滋賀県南部": [136.11841, 35.03771], "京都府北部": [135.17996, 35.46993], "京都府南部": [135.59642, 35.04177], "大阪府北部": [135.58859, 34.79913], "大阪府南部": [135.50817, 34.44004], "兵庫県北部": [134.70365, 35.40012], "兵庫県南東部": [135.07489, 34.96647], "兵庫県南西部": [134.56049, 35.03026], "兵庫県淡路島": [134.83253, 34.39891], "奈良県": [135.89674, 34.3202], "和歌山県北部": [135.33995, 34.0628], "和歌山県南部": [135.63744, 33.75076], "鳥取県東部": [134.2345, 35.3919], "鳥取県中部": [133.79765, 35.38716], "鳥取県西部": [133.43964, 35.30505], "島根県東部": [132.95331, 35.27622], "島根県西部": [132.08681, 34.78736], "島根県隠岐": [133.2763, 36.25405], "岡山県北部": [133.85634, 35.10442], "岡山県南部": [133.80639, 34.6947], "広島県北部": [132.84361, 34.80103], "広島県南東部": [133.14532, 34.59501], "広島県南西部": [132.49039, 34.40867], "徳島県北部": [134.15068, 34.01571], "徳島県南部": [134.31538, 33.76563], "香川県東部": [134.16606, 34.25569], "香川県西部": [133.82632, 34.20103], "愛媛県東予": [133.44723, 33.94659], "愛媛県中予": [132.91864, 33.74242], "愛媛県南予": [132.64041, 33.27646], "高知県東部": [134.09693, 33.4822], "高知県中部": [133.47726, 33.61205], "高知県西部": [132.90471, 33.10141], "山口県北部": [131.41539, 34.3815], "山口県西部": [130.99428, 34.14127], "山口県東部": [132.10386, 34.15051], "山口県中部": [131.6771, 34.23622], "福岡県福岡": [130.4963, 33.64257], "福岡県北九州": [130.94544, 33.72879], "福岡県筑豊": [130.74432, 33.63414], "福岡県筑後": [130.62192, 33.25556], "佐賀県北部": [129.9974, 33.35641], "佐賀県南部": [130.13544, 33.21836], "長崎県北部": [129.73617, 33.19129], "長崎県南西部": [130.00364, 32.83446], "長崎県島原半島": [130.29003, 32.73602], "長崎県対馬": [129.36201, 34.50103], "長崎県壱岐": [129.70993, 33.78369], "長崎県五島": [128.75554, 32.68612], "熊本県阿蘇": [131.10776, 32.9743], "熊本県熊本": [130.91671, 32.75494], "熊本県球磨": [130.84598, 32.29696], "熊本県天草・芦北": [130.1034, 32.36995], "大分県北部": [131.19514, 33.501], "大分県中部": [131.4288, 33.25512], "大分県南部": [131.70822, 32.92816], "大分県西部": [131.21244, 33.14283], "宮崎県北部平野部": [131.56893, 32.42842], "宮崎県北部山沿い": [131.26067, 32.48259], "宮崎県南部平野部": [131.3663, 31.74618], "宮崎県南部山沿い": [131.0424, 31.89712], "鹿児島県薩摩": [130.4553, 31.67134], "鹿児島県大隅": [130.89609, 31.40053], "鹿児島県十島村": [129.86608, 29.8501], "鹿児島県甑島": [129.88505, 31.84194], "鹿児島県種子島": [130.99595, 30.5918], "鹿児島県屋久島": [130.52448, 30.34791], "鹿児島県奄美北部": [129.39683, 28.31986], "鹿児島県奄美南部": [128.58819, 27.38427], "沖縄県本島北部": [128.16633, 26.64532], "沖縄県本島中南部": [127.74713, 26.26225], "沖縄県久米島": [126.78815, 26.34114], "沖縄県大東島": [131.2429, 25.84249], "沖縄県宮古島": [124.69963, 24.65816], "沖縄県石垣島": [124.23828, 24.47049], "沖縄県与那国島": [122.98771, 24.45599], "沖縄県西表島": [123.83915, 24.34639], "色丹島": [146.70781, 43.79579], "国後島": [145.81289, 44.08527], "択捉島": [147.83756, 44.99076], "鷹島(甑島南方)": [129.73294, 31.44904], "津倉瀬(宇治群島北東方）": [129.74011, 31.30856], "うるま市・金武町境界部地先の埋立地": [127.84314, 26.43409] }
var fetchedURL = [];

var eid;
var ESmarkerElm;
var newInfoDateTime = 0;
var map;
var config;
var EQInfo = {
  originTime: null,
  maxI: null,
  mag: null,
  lat: null,
  lng: null,
  depth: null,
  epiCenter: null,
  comment: null,
};
var hinanjoLayers = [];
var hinanjoCheck = document.getElementById("hinanjo");
var ZoomBounds;
var high_contrast = window.matchMedia("(forced-colors: active)").matches;

fetch("Resource/PointSeismicIntensityLocation.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    pointList = data;
  });

window.addEventListener("scroll", function () {
  document.getElementById("plzScroll").style.opacity = 0;
});

var EEWData;
var axisDatas;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "metaData") {
    eid = request.eid;

    if (document.getElementById("EEWLink").style.display != "inline") {
      var EEWURL = "https://www.data.jma.go.jp/svd/eew/data/nc/fc_hist/" + String(eid).slice(0, 4) + "/" + String(eid).slice(4, 6) + "/" + eid + "/index.html";
      fetch(EEWURL).then(function (res) {
        if (res.status == 200) {
          document.getElementById("EEWLink").style.display = "inline";
          document.getElementById("EEWLink")
            .addEventListener("click", function () {
              window.open(EEWURL);
            });
        }
      });
    }

    if (request.urls && Array.isArray(request.urls)) {
      request.urls.forEach(function (elm) {
        if (elm) {
          if (elm.includes("www.jma.go.jp")) jma_Fetch(elm);
          else if (elm.includes("www.data.jma.go.jp")) jmaXMLFetch(elm);
          else if (elm.includes("dev.narikakun.net")) narikakun_Fetch(elm);
        }
      });
    }
    if (request.axisData && Array.isArray(request.axisData))
      axisDatas = request.axisData;

    if (request.eew && !request.eew.cancelled) {
      var eewItem = request.eew.data[request.eew.data.length - 1];

      EEWData = {
        category: "EEW",
        status: eewItem.is_training ? "訓練" : "通常",
        reportTime: eewItem.report_time,
        originTime: eewItem.origin_time,
        maxI: eewItem.maxInt,
        mag: eewItem.isPlum ? null : eewItem.magnitude,
        lat: eewItem.latitude,
        lng: eewItem.longitude,
        depth: eewItem.isPlum ? null : eewItem.depth,
        epiCenter: eewItem.region_name,
        comment: "",
        cancel: false,
        eew: true,
      };
    }
    Mapinit();
  } else if (request.action == "setting") {
    config = request.data;
    document.getElementById("areaName").textContent = config.home.name || "現在地";
  }
});

//情報取得
function InfoFetch() {
  jma_ListReq();
  estimated_intensity_mapReq();

  narikakun_ListReq(new Date().getFullYear(), new Date().getMonth() + 1);
  if (EEWData) ConvertEQInfo(EEWData);

  if (axisDatas) {
    axisDatas.forEach(function (elm) {
      axisInfoCtrl(elm.message);
    });
  }
}

//地図初期化
function Mapinit() {
  if (map) return;
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  const PMTILES_URL = "https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/optimal_bvmap-v1.pmtiles";
  const p = new pmtiles.PMTiles(PMTILES_URL);
  protocol.add(p);

  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [138.46, 32.99125],
    zoom: 4,
    attributionControl: false,
    pitchWithRotate: false,
    dragRotate: false,
    style: {
      version: 8,
      projection: { type: config.data.globeView ? "globe" : "mercator" },
      glyphs: "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",
      sources: {
        submarine: {
          type: "raster",
          tiles: ["./Resource/Submarine/{z}/{x}/{y}.jpg"],
          tileSize: 256,
          attribution: "GEBCO, Peter Bird",
          minzoom: 0,
          maxzoom: 5,
        },
        v: {
          type: "vector",
          url: `pmtiles://${PMTILES_URL}`,
          attribution: "国土地理院",
          minzoom: 4,
          maxzoom: 16,
        },
        worldmap: {
          type: "geojson",
          data: "./Resource/World.json",
          tolerance: 2,
          attribution: "Natural Earth",
        },
        basemap: {
          type: "geojson",
          data: "./Resource/basemap.json",
          tolerance: 0.9,
          attribution: "気象庁",
        },
        prefmap: {
          type: "geojson",
          data: "./Resource/prefectures.json",
          tolerance: 0.9,
          attribution: "気象庁",
        },
        lake: {
          type: "geojson",
          data: "./Resource/lake.json",
          tolerance: 1.7,
          attribution: "国土数値情報",
        },
        estimated_intensity_map: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          tolerance: 0,
        },
        tile0: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile1: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile2: {
          type: "raster",
          tiles: [
            "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
          ],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile4: {
          type: "raster",
          tiles: ["http://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "OpenStreetMap contributors",
          minzoom: 0,
          maxzoom: 19,
        },
        over0: {
          type: "raster",
          tiles: [
            "https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 16,
        },
        over1: {
          type: "raster",
          tiles: [
            "https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 11,
          maxzoom: 18,
        },
        over2: {
          type: "raster",
          tiles: [
            "https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 12,
        },
        over3: {
          type: "raster",
          tiles: [
            "https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 12,
        },
        over4: {
          type: "raster",
          tiles: [
            "https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 11,
        },
        over5: {
          type: "raster",
          tiles: [
            "https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "気象庁",
          minzoom: 2,
          maxzoom: 11,
        },
        hinanjo: {
          type: "raster",
          tiles: [
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=",
          ],
          attribution: "国土地理院",
          minzoom: 10,
          maxzoom: 10,
        },
      },
      layers: [
        {
          id: "submarine",
          type: "raster",
          source: "submarine",
          layout: { visibility: high_contrast ? "none" : "visible" },
        },
        {
          id: "tile0",
          type: "raster",
          source: "tile0",
          layout: { visibility: "none" },
        },
        {
          id: "tile1",
          type: "raster",
          source: "tile1",
          layout: { visibility: "none" },
        },
        {
          id: "tile2",
          type: "raster",
          source: "tile2",
          layout: { visibility: "none" },
        },
        {
          id: "tile4",
          type: "raster",
          source: "tile4",
          layout: { visibility: "none" },
        },
        {
          id: "prefmap_fill",
          type: "fill",
          source: "prefmap",
          paint: {
            "fill-color": high_contrast ? "#000" : "#333",
            "fill-opacity": 1,
          },
        },
        {
          id: "basemap_LINE",
          type: "line",
          source: "basemap",
          minzoom: 6,
          paint: {
            "line-color": high_contrast ? "#FFF" : "#666",
            "line-width": 1,
          },
        },
        {
          id: "over0",
          type: "raster",
          source: "over0",
          layout: { visibility: "none" },
        },
        {
          id: "over1",
          type: "raster",
          source: "over1",
          layout: { visibility: "none" },
        },
        {
          id: "over2",
          type: "raster",
          source: "over2",
          layout: { visibility: "none" },
        },
        {
          id: "over3",
          type: "raster",
          source: "over3",
          layout: { visibility: "none" },
        },
        {
          id: "over4",
          type: "raster",
          source: "over4",
          layout: { visibility: "none" },
        },
        {
          id: "over5",
          type: "raster",
          source: "over5",
          layout: { visibility: "none" },
        },
        {
          id: "Int0",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["0"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int1",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["1"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int2",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["2"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int3",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["3"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int4",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["4"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int5-",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["5m"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int5+",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["5p"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int6-",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["6m"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int6+",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["6p"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "Int7",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.Shindo["7"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "LgInt1",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.LgInt["1"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "LgInt2",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.LgInt["2"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "LgInt3",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.LgInt["3"].background },
          filter: ["==", "name", ""],
        },
        {
          id: "LgInt4",
          type: "fill",
          source: "basemap",
          paint: { "fill-color": config.color.LgInt["4"].background },
          filter: ["==", "name", ""],
        },

        {
          id: "prefmap_LINE",
          type: "line",
          source: "prefmap",
          paint: {
            "line-color": high_contrast ? "#FFF" : "#999",
            "line-width": 1,
          },
        },
        {
          id: "worldmap_fill",
          type: "fill",
          source: "worldmap",
          paint: {
            "fill-color": high_contrast ? "#000" : "#333",
            "fill-opacity": 1,
          },
        },
        {
          id: "worldmap_LINE",
          type: "line",
          source: "worldmap",
          paint: {
            "line-color": high_contrast ? "#FFF" : "#999",
            "line-width": 1,
          },
        },
        {
          id: "lake_fill",
          type: "fill",
          source: "lake",
          paint: {
            "fill-color": high_contrast ? "#FFF" : "#325385",
            "fill-opacity": high_contrast ? 1 : 0.5,
          },
          minzoom: 6,
        },
        {
          id: "河川中心線",
          type: "line",
          source: "v",
          "source-layer": "RvrCL",
          filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]],
          paint: { "line-color": "#2468cb66", "line-width": 2 },
          layout: { visibility: "none" },
        },
        {
          id: "水涯線",
          type: "line",
          source: "v",
          "source-layer": "WL",
          paint: { "line-color": "#2468cb66", "line-width": 2 },
          layout: { visibility: "none" },
        },
        {
          id: "道路中心線ZL4-10国道・高速",
          maxzoom: 11,
          minzoom: 9,
          type: "line",
          source: "v",
          "source-layer": "RdCL",
          filter: ["any", ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]],], ["==", ["get", "vt_rdctg"], "高速自動車国道等"],],
          layout: {
            "line-cap": "round",
            "line-join": "round",
            "line-sort-key": ["get", "vt_drworder"],
            visibility: "none",
          },
          paint: { "line-color": "#80808066", "line-width": 3 },
        },
        {
          id: "道路中心線色0",
          minzoom: 11,
          maxzoom: 17,
          type: "line",
          source: "v",
          "source-layer": "RdCL",
          filter: ["any", ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]],],],], 17, ["all", ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]],],], ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]],],],
          layout: {
            "line-join": "round",
            "line-round-limit": 1.57,
            "line-sort-key": ["get", "vt_drworder"],
            visibility: "none",
          },
          paint: { "line-color": "#80808066", "line-width": 2 },
        },
        {
          id: "鉄道中心線",
          minzoom: 11,
          maxzoom: 17,
          type: "line",
          source: "v",
          "source-layer": "RailCL",
          filter: ["any", ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]],],], ["==", ["get", "vt_lvorder"], 0],], ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0],], ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]],],], ["==", ["get", "vt_lvorder"], 1],],],
          paint: {
            "line-color": "#80808066",
            "line-width": 2.5,
            "line-dasharray": [1, 1],
          },
          layout: { visibility: "none" },
        },
        {
          id: "建築物0",
          type: "fill",
          source: "v",
          "source-layer": "BldA",
          filter: ["==", ["get", "vt_lvorder"], 0],
          paint: { "fill-color": "#80808033" },
          layout: { visibility: "none" },
        },
        {
          id: "道路中心線色1",
          minzoom: 11,
          maxzoom: 17,
          type: "line",
          source: "v",
          "source-layer": "RdCL",
          filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]],],],],
          layout: {
            visibility: "none",
            "line-join": "round",
            "line-round-limit": 1.57,
            "line-sort-key": ["get", "vt_drworder"],
          },
          paint: {
            "line-color": "#80808066",
            "line-width": 4,
            "line-dasharray": [1, 1],
          },
        },
        {
          id: "道路中心線色橋1",
          minzoom: 11,
          maxzoom: 17,
          type: "line",
          source: "v",
          "source-layer": "RdCL",
          filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]],],
          layout: {
            "line-join": "round",
            "line-round-limit": 1.57,
            "line-sort-key": ["get", "vt_drworder"],
            visibility: "none",
          },
          paint: { "line-color": "#80808066", "line-width": 1.5 },
        },
        {
          id: "道路縁",
          minzoom: 17,
          type: "line",
          source: "v",
          "source-layer": "RdEdg",
          layout: {
            "line-cap": "square",
            "line-sort-key": ["get", "vt_drworder"],
            visibility: "none",
          },
          paint: { "line-color": "#80808066", "line-width": 1.5 },
        },
        {
          id: "行政区画界線25000市区町村界",
          type: "line",
          source: "v",
          "source-layer": "AdmBdry",
          filter: ["==", ["get", "vt_code"], 1212],
          layout: { "line-cap": "square", visibility: "none" },
          paint: { "line-color": "#666666", "line-width": 1 },
        },
        {
          id: "hinanjo",
          type: "raster",
          source: "hinanjo",
          layout: { visibility: "none" },
          minzoom: 10,
        },
        {
          id: "注記シンボル付きソート順100以上",
          type: "symbol",
          source: "v",
          "source-layer": "Anno",
          filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105,],],],], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105,],],],], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105,],],],],],
          layout: {
            visibility: "none",
            "text-allow-overlap": false,
            "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]],],
            "text-justify": "auto",
            "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945,], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302,], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899,], 24, 10,], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"],], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"],],],],
            "text-field": ["get", "vt_text"],
            "text-max-width": 100,
            "text-radial-offset": 0.5,
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-writing-mode": ["horizontal"],
          },
          paint: {
            "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945,], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244,], "rgba(150,150,150,1)", "rgba(200,200,200,1)",], ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(200,200,200,0)", ["var", "color"],], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(200,200,200,0)", ["var", "color"],],],],
            "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(50,50,50,0)", "rgba(50,50,50,1)",], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(50,50,50,0)", "rgba(50,50,50,1)",],],
            "text-halo-width": 1,
          },
        },
        {
          id: "注記シンボル付きソート順100未満",
          type: "symbol",
          source: "v",
          "source-layer": "Anno",
          filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221,],],],], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221,],],],], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221,],],],],],
          layout: {
            visibility: "none",
            "text-allow-overlap": false,
            "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]],],
            "text-justify": "auto",
            "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945,], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302,], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899,], 24, 10,], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"],], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [2941, 2942], ["*", 1.3, ["var", "size"]], ["var", "size"],], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"],],],],
            "text-field": ["get", "vt_text"],
            "text-max-width": 100,
            "text-radial-offset": 0.5,
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-writing-mode": ["horizontal"],
          },
          paint: {
            "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945,], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244,], "rgba(150,150,150,1)", "rgba(200,200,200,1)",], ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(200,200,200,0)", ["var", "color"],], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(200,200,200,0)", ["var", "color"],],],],
            "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(50,50,50,0)", "rgba(50,50,50,1)",], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(50,50,50,0)", "rgba(50,50,50,1)",],],
            "text-halo-width": 1,
          },
        },
      ],
    },
  });
  map.addControl(
    new maplibregl.AttributionControl({ compact: true, }),
    "bottom-right"
  );
  map.getCanvas().setAttribute("aria-label", "地図表現による地震情報");
  map.touchZoomRotate.disableRotation();
  ZoomBounds = new maplibregl.LngLatBounds();

  map.on("sourcedataloading", (e) => {
    var hinanjoShow = config.data.overlay.includes("hinanjo");
    if (e.sourceId == "hinanjo" && hinanjoShow && e.tile != undefined) {
      var ca = e.tile.tileID.canonical;
      if (map.getLayer("hinanjo_eq_" + ca.x + ca.y + ca.z)) map.removeLayer("hinanjo_eq_" + ca.x + ca.y + ca.z);
      if (map.getSource("hinanjo_eq_" + ca.x + ca.y + ca.z)) map.removeSource("hinanjo_eq_" + ca.x + ca.y + ca.z);
      if (map.getLayer("hinanjo_ts_" + ca.x + ca.y + ca.z)) map.removeLayer("hinanjo_ts_" + ca.x + ca.y + ca.z);
      if (map.getSource("hinanjo_ts_" + ca.x + ca.y + ca.z)) map.removeSource("hinanjo_ts_" + ca.x + ca.y + ca.z);

      map.addSource("hinanjo_eq_" + ca.x + ca.y + ca.z, {
        type: "geojson",
        data: "https://cyberjapandata.gsi.go.jp/xyz/skhb04/" + ca.z + "/" + ca.x + "/" + ca.y + ".geojson",
      });

      map.addLayer({
        id: "hinanjo_eq_" + ca.x + ca.y + ca.z,
        type: "circle",
        source: "hinanjo_eq_" + ca.x + ca.y + ca.z,
        layout: { visibility: hinanjoShow ? "visible" : "none" },
        paint: {
          "circle-color": "#bf8715",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#222",
        },
        minzoom: 10,
        maxzoom: 22,
      });

      map.addSource("hinanjo_ts_" + ca.x + ca.y + ca.z, {
        type: "geojson",
        data: "https://cyberjapandata.gsi.go.jp/xyz/skhb05/" + ca.z + "/" + ca.x + "/" + ca.y + ".geojson",
      });

      map.addLayer({
        id: "hinanjo_ts_" + ca.x + ca.y + ca.z,
        type: "circle",
        source: "hinanjo_ts_" + ca.x + ca.y + ca.z,
        layout: { visibility: hinanjoShow ? "visible" : "none" },
        paint: {
          "circle-color": "#2488c7",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#222",
        },
        minzoom: 10,
        maxzoom: 22,
      });

      map.on("click", "hinanjo_eq_" + ca.x + ca.y + ca.z, hinanjoPopup);
      map.on("click", "hinanjo_ts_" + ca.x + ca.y + ca.z, hinanjoPopup);
      hinanjoLayers.push(
        "hinanjo_eq_" + ca.x + ca.y + ca.z,
        "hinanjo_ts_" + ca.x + ca.y + ca.z
      );
    }
  });

  hinanjoCheck.addEventListener("change", function () {
    map.setLayoutProperty(
      "hinanjo",
      "visibility", hinanjoCheck.checked ? "visible" : "none"
    );
    hinanjoLayers.forEach(function (elm) {
      map.setLayoutProperty(
        elm,
        "visibility", hinanjoCheck.checked ? "visible" : "none"
      );
    });
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  var layerButton = document.createElement("button");
  layerButton.innerText = "layers";
  layerButton.setAttribute("title", "レイヤーの切り替え");
  layerButton.setAttribute("aria-label", "地図レイヤー切り替え画面を開く");
  layerButton.setAttribute("id", "layerSwitch_toggle");
  layerButton.addEventListener("click", function () {
    document.getElementById("menu_wrap").classList.add("menu_show");
    document.getElementById("menu").show();
  });

  var layerMenu = document.createElement("nav");
  layerMenu.setAttribute("id", "estimated_intensity_map_toggle");
  layerMenu.setAttribute("aria-label", "地図に表示する地震情報を選択");
  layerMenu.classList.add("menu");
  layerMenu.innerHTML = "<h3>地震情報選択</h3>";
  var radioWrap = document.createElement("div");
  radioWrap.classList.add("radio");
  radioWrap.innerHTML = '<label id="estshindomap_radioWrap"><input type="radio" name="mapFillSelect" value="fill1" id="estshindomap_radio">推計震度分布図</label>';
  radioWrap.innerHTML += '<label><input type="radio" name="mapFillSelect" value="fill2" checked>各地の震度</label>';
  radioWrap.innerHTML += '<label id="LgInt_radioWrap"><input type="radio" name="mapFillSelect" value="fill4">各地の長周期地震動階級</label>';

  var checkWrap = document.createElement("div");
  checkWrap.classList.add("check");
  checkWrap.innerHTML = '<label><input type="checkbox" id="mapFillToggle" value="fill3" checked>地図の塗りつぶし</label>';

  layerMenu.appendChild(radioWrap);
  layerMenu.appendChild(checkWrap);

  map.addControl({ onAdd: function () { return layerButton; }, }, "top-left");
  map.addControl({ onAdd: function () { return layerMenu; }, }, "top-left");
  document.getElementById("mapFillToggle")
    .addEventListener("change", function () {
      MapFill = this.checked;
      mapFillDraw();
    });

  document.getElementsByName("mapFillSelect").forEach(function (elm) {
    elm.addEventListener("change", function () {
      mapFillSwitch(elm.value);
    });
  });

  var continueButton = document.createElement("button");
  continueButton.innerText = "sync";
  continueButton.setAttribute("title", "情報を再取得");
  continueButton.setAttribute("aria-label", "情報を再取得");
  continueButton.className = "material-icons-round";
  continueButton.addEventListener("click", function () {
    location.reload();
  });

  var homeButton = document.createElement("button");
  homeButton.innerText = "home";
  homeButton.setAttribute("title", "ズーム範囲をリセット");
  homeButton.setAttribute("aria-label", "地図のズーム範囲をリセット");

  homeButton.className = "material-icons-round";
  homeButton.addEventListener("click", mapZoomReset);

  var cbWrapper = document.createElement("div");
  cbWrapper.className = "maplibregl-ctrl maplibregl-ctrl-group";
  cbWrapper.appendChild(continueButton);
  cbWrapper.appendChild(homeButton);
  map.addControl({ onAdd: function () { return cbWrapper; }, });

  var zoomLevelContinue = function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer")
      .classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 4.5) mapContainer.classList.add("zoomLevel_1");
    else if (currentZoom < 6) mapContainer.classList.add("zoomLevel_2");
    else if (currentZoom < 8) mapContainer.classList.add("zoomLevel_3");
    else mapContainer.classList.add("zoomLevel_4");
  };
  zoomLevelContinue();
  map.on("zoom", zoomLevelContinue);
  map.on("load", function () {
    zoomLevelContinue();
    mapFillSwitch();
    layerSelect(config.data.layer);
    radioSet("mapSelect", config.data.layer);
    document.getElementById("globeView").checked = config.data.globeView;

    InfoFetch();

    config.data.overlay.forEach(function (elm) {
      if (document.getElementById(elm)) document.getElementById(elm).checked = true;
      overlaySelect(elm, true);
    });
  });

  if (config.home.ShowPin) {
    const img = document.createElement("img");
    img.src = "./img/homePin.svg";
    img.classList.add("homeIcon");

    var mkr = new maplibregl.Marker({ element: img })
      .setLngLat([config.home.longitude, config.home.latitude])
      .addTo(map);
    mkr.getElement().removeAttribute("tabindex");
    mkr.getElement().setAttribute("aria-hidden", true);
  }
}

document.getElementById("layerSwitch_close")
  .addEventListener("click", function () {
    document.getElementById("menu_wrap").classList.remove("menu_show");
    document.getElementById("menu").close();
  });

var mapSelect = document.getElementsByName("mapSelect");
var tilemapActive = false;
function layerSelect(layerName) {
  map.setLayoutProperty("tile0", "visibility", "none");
  map.setLayoutProperty("tile1", "visibility", "none");
  map.setLayoutProperty("tile2", "visibility", "none");
  map.setLayoutProperty("tile4", "visibility", "none");

  if (layerName) {
    tilemapActive = true;
    map.setLayoutProperty(layerName, "visibility", "visible");
  } else tilemapActive = false;
  if (!tilemapActive) {
    map.setLayoutProperty("prefmap_fill", "visibility", "visible");
    map.setLayoutProperty("worldmap_fill", "visibility", "visible");
  } else {
    map.setLayoutProperty("prefmap_fill", "visibility", "none");
    map.setLayoutProperty("worldmap_fill", "visibility", "none");
  }
  config.data.layer = layerName;
  window.electronAPI.messageReturn({
    action: "ChangeConfig",
    from: "Other",
    data: config,
  });
}

mapSelect.forEach(function (elm) {
  elm.addEventListener("change", function () {
    layerSelect(this.value);
  });
});
document.getElementById("globeView").addEventListener("change", function () {
  config.data.globeView = this.checked;
  map.setProjection({ type: config.data.globeView ? "globe" : "mercator" });
  window.electronAPI.messageReturn({
    action: "ChangeConfig",
    from: "Other",
    data: config,
  });
});

function overlaySelect(layerName, checked) {
  if (layerName == "kmoni_points") return;
  var visibility = checked ? "visible" : "none";
  if (layerName !== "hinanjo" && layerName !== "kmoni_points") {
    if (layerName == "gsi_vector") {
      ["河川中心線", "水涯線", "道路中心線ZL4-10国道・高速", "道路中心線色0", "鉄道中心線", "建築物0", "道路中心線色1", "道路中心線色橋1", "道路縁", "行政区画界線25000市区町村界", "注記シンボル付きソート順100以上", "注記シンボル付きソート順100未満",]
        .forEach(function (elm) {
          map.setLayoutProperty(elm, "visibility", visibility);
        });
    } else {
      map.setLayoutProperty(layerName, "visibility", visibility);
    }

    if (layerName == "over2")
      document.getElementById("legend1").style.display = checked ? "inline-block" : "none";
    else if (layerName == "over3") {
      over3_visiblity = checked;
      document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
    } else if (layerName == "over4") {
      over4_visiblity = checked;
      document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
    }
  }
  var selectedLayer = [];
  document.getElementsByName("overlaySelect").forEach(function (elm) {
    if (elm.checked) selectedLayer.push(elm.value);
  });

  config.data.overlay = selectedLayer;
  window.electronAPI.messageReturn({
    action: "ChangeConfig",
    from: "Other",
    data: config,
  });
}
document.getElementsByName("overlaySelect").forEach(function (elm) {
  elm.addEventListener("change", function () {
    overlaySelect(this.value, this.checked);
  });
});
var estShindoMapDraw = false;
var ShindoMapDraw = true;
var LgIntMapDraw = false;
var MapFill = true;
function mapFillSwitch(val) {
  if (val) {
    estShindoMapDraw = val == "fill1";
    ShindoMapDraw = val == "fill2";
    LgIntMapDraw = val == "fill4";
  }

  if (LgIntMapDraw) {
    document.querySelectorAll(".ShindoIcon,.MaxShindoIcon")
      .forEach(function (elm) {
        elm.style.display = "none";
      });
    document.querySelectorAll(".LgIntIcon,.MaxLgIntIcon")
      .forEach(function (elm) {
        elm.style.display = "block";
      });
  } else {
    document.querySelectorAll(".ShindoIcon,.MaxShindoIcon")
      .forEach(function (elm) {
        elm.style.display = "block";
      });
    document.querySelectorAll(".LgIntIcon,.MaxLgIntIcon")
      .forEach(function (elm) {
        elm.style.display = "none";
      });
  }
  mapFillDraw();
}

document.getElementById("over2").addEventListener("change", function () {
  document.getElementById("legend1").style.display = this.checked ? "inline-block" : "none";
});
var over3_visiblity = false;
var over4_visiblity = false;
document.getElementById("over3").addEventListener("change", function () {
  over3_visiblity = this.checked;
  document.getElementById("legend2").style.display =
    over3_visiblity || over4_visiblity ? "inline-block" : "none";
});
document.getElementById("over4").addEventListener("change", function () {
  over4_visiblity = this.checked;
  document.getElementById("legend2").style.display =
    over3_visiblity || over4_visiblity ? "inline-block" : "none";
});

//推計震度分布リスト取得→描画
var estimated_intensity_map_layers = [];
var ESMap_Worker;
function estimated_intensity_mapReq() {
  ESMap_Worker = new Worker("js/ESMap_Worker.js");
  ESMap_Worker.addEventListener("message", (e) => {
    if (map.getSource("estimated_intensity_map_" + e.data.index)) {
      map.removeLayer("estimated_intensity_map_layer_" + e.data.index);
      map.removeSource("estimated_intensity_map_" + e.data.index);
    }
    map.addSource("estimated_intensity_map_" + e.data.index, {
      type: "image",
      url: e.data.data,
      coordinates: [
        [e.data.lng, e.data.lat2],
        [e.data.lng2, e.data.lat2],
        [e.data.lng2, e.data.lat],
        [e.data.lng, e.data.lat],
      ],
    });
    map.addLayer(
      {
        id: "estimated_intensity_map_layer_" + e.data.index,
        type: "raster",
        source: "estimated_intensity_map_" + e.data.index,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
    estimated_intensity_map_layers.push(
      "estimated_intensity_map_layer_" + e.data.index
    );
  });

  ESMap_Worker.postMessage({
    action: "config",
    config: config,
  });

  var ESMap_canvas = document.createElement("canvas");
  ESMap_canvas.width = ESMap_canvas.height = 800;
  var ESMap_offscreen = ESMap_canvas.transferControlToOffscreen();
  var ESMap_canvas_out = document.createElement("canvas");
  ESMap_canvas_out.width = ESMap_canvas_out.height = 320;
  var ESMapO_offscreen = ESMap_canvas_out.transferControlToOffscreen();
  ESMap_Worker.postMessage({
    action: "ESMap_canvas",
    canvas: ESMap_offscreen,
  }, [ESMap_offscreen]);
  ESMap_Worker.postMessage({
    action: "ESMapO_canvas",
    canvas: ESMapO_offscreen,
  }, [ESMapO_offscreen]);

  fetch("https://www.jma.go.jp/bosai/estimated_intensity_map/data/list.json")
    .then(function (res) { return res.json(); })
    .then(function (json) {
      var ItemTmp = json.find(function (elm) {
        return elm.url.split("_")[0] == String(eid).substring(0, 12);
      });
      if (ItemTmp) {
        ConvertEQInfo({
          category: "推計震度分布",
          status: "通常",
          reportTime: ItemTmp.hypo.it,
          originTime: ItemTmp.hypo.at,
          maxI: ItemTmp.hypo.maxi,
          mag: ItemTmp.hypo.mag,
          lat: ItemTmp.hypo.lat,
          lng: ItemTmp.hypo.lon,
          depth: ItemTmp.hypo.dep,
          epiCenter: ItemTmp.hypo.epi,
          comment: ItemTmp.comment,
          cancel: null,
        });

        InfoType_add("type-6");
        var idTmp = ItemTmp.url;

        ItemTmp.mesh_num.forEach(function (elm, index) {
          var lat = Number(elm.substring(0, 2)) / 1.5;
          var lng = Number(elm.substring(2, 4)) + 100;
          var lat2 = lat + 2 / 3;
          var lng2 = lng + 1;

          ZoomBounds.extend([lng, lat2]);
          ZoomBounds.extend([lng2, lat]);

          ESMap_Worker.postMessage({
            action: "URL",
            url: "https://www.jma.go.jp/bosai/estimated_intensity_map/data/" + idTmp + "/" + elm + ".png",
            index: index,
            lat: lat,
            lng: lng,
            lat2: lat2,
            lng2: lng2,
          });
        });

        document.getElementById("estshindomap_radio")
          .setAttribute("checked", true);
        estShindoMapDraw = true;
        ShindoMapDraw = false;
        LgIntMapDraw = false;
        mapFillDraw();
        document.getElementById("estshindomap_radioWrap").style.display = "block";
      }
    });
}

//気象庁リスト取得→jma_Fetch
function jma_ListReq() {
  fetch("https://www.jma.go.jp/bosai/quake/data/list.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      data.forEach(function (elm) {
        var urlTmp = "https://www.jma.go.jp/bosai/quake/data/" + elm.json;
        if (elm.eid == eid) jma_Fetch(urlTmp);
      });
    })
    .catch(function () { });
  fetch("https://www.jma.go.jp/bosai/ltpgm/data/list.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      data.forEach(function (elm) {
        var urlTmp = "https://www.jma.go.jp/bosai/ltpgm/data/" + elm.json;
        if (elm.eid == eid) jmaL_Fetch(urlTmp);
      });
    })
    .catch(function () { });
}
//narikakun地震情報APIリスト取得→narikakun_Fetch
function narikakun_ListReq(year, month, retry) {
  fetch("https://ntool.online/api/earthquakeList?year=" + year + "&month=" + month)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var nakn_detected = false;
      data.lists.forEach(function (elm) {
        if (elm.includes(eid)) {
          narikakun_Fetch(elm);
          nakn_detected = true;
        }
      });

      if (!nakn_detected && !retry) {
        var yearTmp = new Date().getFullYear();
        var monthTmp = new Date().getMonth();
        if (monthTmp == 0) {
          yearTmp = new Date().getFullYear() - 1;
          monthTmp = 1;
        }
        narikakun_ListReq(yearTmp, monthTmp, true);
      }
    });
}

//気象庁 取得・フォーマット変更→ ConvertEQInfo
function jma_Fetch(url) {
  if (fetchedURL.includes(url)) return;
  fetchedURL.push(url);
  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      var LatLngDepth, originTimeTmp, epiCenterTmp, magnitudeTmp, maxIntTmp, LatTmp, LngTmp, depthTmp;

      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.Hypocenter.Area.Coordinate_WGS) {
          LatLngDepth = parse_LatLngDepth(json.Body.Earthquake.Hypocenter.Area.Coordinate_WGS);
          LatLngDepth[0] /= 100
          LatLngDepth[1] /= 100
        } else {
          LatLngDepth = parse_LatLngDepth(json.Body.Earthquake.Hypocenter.Area.Coordinate);
        }
      }
      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.OriginTime) originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
        if (json.Body.Earthquake.Hypocenter.Area.Name) epiCenterTmp = json.Body.Earthquake.Hypocenter.Area.Name;
        if (json.Body.Earthquake.Magnitude) magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
      }
      if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt)
        maxIntTmp = json.Body.Intensity.Observation.MaxInt;
      if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1]) LatTmp = Number(LatLngDepth[1]);
      if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2]) LngTmp = Number(LatLngDepth[2]);
      if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3]) depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

      var cancelTmp = json.Head.InfoType == "取消";

      var commentText = {
        ForecastComment: "",
        VarComment: "",
        FreeFormComment: "",
      };
      if (json.Body.Comments) {
        if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text)
          commentText.ForecastComment = json.Body.Comments.ForecastComment.Text;
        if (json.Body.Comments.VarComment && json.Body.Comments.VarComment.Text)
          commentText.VarComment = json.Body.Comments.VarComment.Text;
        if (json.Body.Comments.FreeFormComment)
          commentText.FreeFormComment = json.Body.Comments.FreeFormComment;
      }

      var IntData = [];
      if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
        json.Body.Intensity.Observation.Pref.forEach(function (elm) {
          var areaData = [];
          if (elm.Area) {
            elm.Area.forEach(function (elm2) {
              var cityData = [];
              if (elm2.City) {
                elm2.City.forEach(function (elm3) {
                  var stData = [];
                  if (elm3.IntensityStation) {
                    elm3.IntensityStation.forEach(function (elm4) {
                      stData.push({
                        lat: elm4.latlon.lat,
                        lng: elm4.latlon.lon,
                        name: elm4.Name,
                        int: elm4.Int,
                      });
                    });
                  }
                  cityData.push({
                    name: elm3.Name,
                    int: elm3.MaxInt,
                    station: stData,
                  });
                });
              }
              areaData.push({
                name: elm2.Name,
                int: elm2.MaxInt,
                city: cityData,
              });
            });
          }
          IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
        });
      }

      ConvertEQInfo({
        category: json.Head.Title,
        status: json.Control.Status,
        reportTime: json.Head.ReportDateTime,
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: depthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
        IntData: IntData,
      });
    });
}

function jmaL_Fetch(url) {
  if (fetchedURL.includes(url)) return;
  fetchedURL.push(url);
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      document.getElementById("LgInt_radioWrap").style.display = "block";
      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.Hypocenter.Area.Coordinate_WGS) {
          LatLngDepth = parse_LatLngDepth(json.Body.Earthquake.Hypocenter.Area.Coordinate_WGS);
          LatLngDepth[0] /= 100
          LatLngDepth[1] /= 100
        } else {
          var LatLngDepth = parse_LatLngDepth(json.Body.Earthquake.Hypocenter.Area.Coordinate);
        }
      }
      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.OriginTime) var originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
        if (json.Body.Earthquake.Hypocenter.Area.Name) var epiCenterTmp = json.Body.Earthquake.Hypocenter.Area.Name;
        if (json.Body.Earthquake.Magnitude) var magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
      }
      if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt)
        var maxIntTmp = json.Body.Intensity.Observation.MaxInt;
      if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1])
        var LatTmp = Number(LatLngDepth[1]);
      if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2])
        var LngTmp = Number(LatLngDepth[2]);
      if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3])
        var depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

      var cancelTmp = json.Head.InfoType == "取消";

      if (json.Body.Comments) {
        var commentText = {
          ForecastComment: "",
          VarComment: "",
          FreeFormComment: "",
        };
        if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text)
          commentText.ForecastComment = json.Body.Comments.ForecastComment.Text;
        if (json.Body.Comments.VarComment && json.Body.Comments.VarComment.Text)
          commentText.VarComment = json.Body.Comments.VarComment.Text;
        if (json.Body.Comments.FreeFormComment && json.Body.Comments.FreeFormComment)
          commentText.FreeFormComment = json.Body.Comments.FreeFormComment;
      }

      var LngIntData = [];
      var IntData = [];
      if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
        json.Body.Intensity.Observation.Pref.forEach(function (elm) {
          var areaDataL = [];
          var areaData = [];
          if (elm.Area) {
            elm.Area.forEach(function (elm2) {
              var stDataL = [];
              var stData = [];
              if (elm2.IntensityStation) {
                elm2.IntensityStation.forEach(function (elm4) {
                  stDataL.push({
                    lat: elm4.latlon.lat,
                    lng: elm4.latlon.lon,
                    name: elm4.Name,
                    lgint: elm4.LgInt,
                  });
                  stData.push({
                    lat: elm4.latlon.lat,
                    lng: elm4.latlon.lon,
                    name: elm4.Name,
                    int: elm4.Int,
                  });
                });
              }
              areaDataL.push({
                name: elm2.Name,
                lgint: elm2.MaxLgInt,
                station: stDataL,
              });
              areaData.push({
                name: elm2.Name,
                int: elm2.MaxInt,
                station: stData,
              });
            });
          }
          LngIntData.push({
            name: elm.Name,
            lgint: elm.MaxLgInt,
            area: areaDataL,
          });
          IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
        });
      }

      ConvertEQInfo({
        category: json.Head.Title,
        status: json.Control.Status,
        reportTime: 0,
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: depthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
        LngIntData: LngIntData,
        IntData: IntData,
      });
    });
}
//気象庁防災XML 取得・フォーマット変更→ ConvertEQInfo
function jmaXMLFetch(url) {
  if (fetchedURL.includes(url)) return;
  fetchedURL.push(url);
  fetch(url)
    .then((response) => { return response.text(); })
    .then((data) => {
      var parser = new DOMParser();
      var xml = parser.parseFromString(data, "application/xml");
      var cancelTmp = xml.querySelector("InfoType").textContent == "取消";
      var ReportTime = new Date(xml.querySelector("Head ReportDateTime").textContent);
      if (!newInfoDateTime || newInfoDateTime <= ReportTime) {
        newInfoDateTime = ReportTime;
      }
      var EarthquakeElm = xml.querySelector("Body Earthquake");
      var originTimeTmp,
        epiCenterTmp,
        magnitudeTmp,
        LatLngDepth,
        magnitudeTypeTmp,
        LatTmp,
        LngTmp,
        DepthTmp,
        maxIntTmp;

      if (EarthquakeElm) {
        originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
        epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
        magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].textContent);
        magnitudeTypeTmp = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].getAttribute("type");
        LatLngDepth = parse_LatLngDepth(xml.querySelector("Body Earthquake Hypocenter").getElementsByTagName("jmx_eb:Coordinate")[0].textContent)
        LatTmp = Number(LatLngDepth[1]);
        LngTmp = Number(LatLngDepth[2]);
        DepthTmp = Number(LatLngDepth[3] / 1000);
      }

      var IntensityElm = xml.querySelector("Body Intensity");
      if (IntensityElm)
        maxIntTmp = NormalizeShindo(IntensityElm.querySelector("MaxInt").textContent, 4);

      var commentText = {
        ForecastComment: "",
        VarComment: "",
        FreeFormComment: "",
      };
      if (xml.querySelector("Body Comments")) {
        if (xml.querySelector("Body Comments ForecastComment"))
          commentText.ForecastComment = xml.querySelector("Body Comments ForecastComment Text").textContent;
        if (xml.querySelector("Body Comments VarComment"))
          commentText.VarComment = xml.querySelector("Body Comments VarComment Text").textContent;
        if (xml.querySelector("Body Comments FreeFormComment"))
          commentText.FreeFormComment = xml.querySelector("Body Comments FreeFormComment").textContent;
      }

      var infoType = xml.querySelector("Head Title").textContent;
      if (xml.querySelector("Control Title").textContent == "津波情報a" || xml.querySelector("Control Title").textContent == "津波警報・注意報・予報a")
        infoType = "津波";

      var LngIntData = [];
      var IntData = [];
      if (xml.querySelector("Body Intensity") && xml.querySelector("Body Intensity Observation Pref")) {
        xml.querySelectorAll("Body Intensity Observation Pref")
          .forEach(function (elm) {
            var areaData = [];
            var areaDataL = [];
            if (elm.querySelectorAll("Area")[0]) {
              elm.querySelectorAll("Area").forEach(function (elm2) {
                var cityData = [];
                if (elm2.querySelectorAll("City")[0]) {
                  elm2.querySelectorAll("City").forEach(function (elm3) {
                    var stData = [];
                    var stDataL = [];
                    if (elm3.querySelectorAll("IntensityStation")[0]) {
                      elm3.querySelectorAll("IntensityStation")
                        .forEach(function (elm4) {
                          var pointT =
                            pointList[elm4.querySelector("Code").textContent];
                          if (pointT) {
                            stData.push({
                              lat: pointT.location[0],
                              lng: pointT.location[1],
                              name: elm4.querySelector("Name").textContent,
                              int: elm4.querySelector("Int").textContent,
                            });
                            if (elm4.querySelector("LgInt")) {
                              stDataL.push({
                                lat: pointT.location[0],
                                lng: pointT.location[1],
                                name: elm4.querySelector("Name").textContent,
                                lgint: elm4.querySelector("LgInt").textContent,
                              });
                            }
                          }
                        });
                    }
                    cityData.push({
                      name: elm3.querySelector("Name").textContent,
                      int: elm3.querySelector("MaxInt").textContent,
                      station: stData,
                    });
                  });
                } else if (elm2.querySelectorAll("IntensityStation")[0]) {
                  var stData = [];
                  var stDataL = [];
                  elm2.querySelectorAll("IntensityStation")
                    .forEach(function (elm4) {
                      var pointT =
                        pointList[elm4.querySelector("Code").textContent];
                      if (pointT) {
                        stData.push({
                          lat: pointT.location[0],
                          lng: pointT.location[1],
                          name: elm4.querySelector("Name").textContent,
                          int: elm4.querySelector("Int").textContent,
                        });
                        if (elm4.querySelector("LgInt")) {
                          stDataL.push({
                            lat: pointT.location[0],
                            lng: pointT.location[1],
                            name: elm4.querySelector("Name").textContent,
                            lgint: elm4.querySelector("LgInt").textContent,
                          });
                        }
                      }
                    });
                }
                areaData.push({
                  name: elm2.querySelector("Name").textContent,
                  int: elm2.querySelector("MaxInt").textContent,
                  city: cityData,
                  station: stData,
                });
                if (elm2.querySelector("MaxLgInt"))
                  areaDataL.push({
                    name: elm2.querySelector("Name").textContent,
                    lgint: elm2.querySelector("MaxLgInt").textContent,
                    station: stDataL,
                  });
              });
            }
            IntData.push({
              name: elm.querySelector("Name").textContent,
              int: elm.querySelector("MaxInt").textContent,
              area: areaData,
            });
            if (elm.querySelector("MaxLgInt"))
              LngIntData.push({
                name: elm.querySelector("Name").textContent,
                lgint: elm.querySelector("MaxLgInt").textContent,
                area: areaDataL,
              });
          });
      }

      ConvertEQInfo({
        category: infoType,
        status: xml.querySelector("Control Status").textContent,
        reportTime: new Date(xml.querySelector("Head ReportDateTime").textContent),
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
        LngIntData: LngIntData,
        IntData: IntData,
      });
    });
}
//narikakun地震情報API 取得・フォーマット変更→ ConvertEQInfo
function narikakun_Fetch(url) {
  if (fetchedURL.includes(url)) return;
  fetchedURL.push(url);

  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (json.Head.EventID == eid) {
        var originTimeTmp, magnitudeTmp, depthTmp, epiCenterTmp, LatTmp, LngTmp, maxIntTmp, commentTmp;
        if (json.Body.Earthquake) {
          if (json.Body.Earthquake.OriginTime) originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
          if (json.Body.Earthquake.Magnitude) magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
          if (json.Body.Earthquake.Hypocenter.Depth) depthTmp = Number(json.Body.Earthquake.Hypocenter.Depth);
          if (json.Body.Earthquake.Hypocenter.Name) epiCenterTmp = json.Body.Earthquake.Hypocenter.Name;
          if (json.Body.Earthquake.Hypocenter.Latitude) LatTmp = json.Body.Earthquake.Hypocenter.Latitude;
          if (json.Body.Earthquake.Hypocenter.Longitude) LngTmp = json.Body.Earthquake.Hypocenter.Longitude;
        }
        if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt)
          maxIntTmp = json.Body.Intensity.Observation.MaxInt;
        if (json.Body.Comments && json.Body.Comments.Observation)
          commentTmp = {
            ForecastComment: json.Body.Comments.Observation,
            VarComment: "",
            FreeFormComment: "",
          };

        var cancelTmp = json.Head.InfoType == "取消";

        var IntData = [];
        if (
          json.Body.Intensity &&
          json.Body.Intensity.Observation.Pref &&
          json.Body.Intensity.Observation.Pref.length > 0
        ) {
          json.Body.Intensity.Observation.Pref.forEach(function (elm) {
            var areaData = [];
            if (elm.Area) {
              elm.Area.forEach(function (elm2) {
                var cityData = [];
                if (elm2.City) {
                  elm2.City.forEach(function (elm3) {
                    var stData = [];
                    if (elm3.IntensityStation) {
                      elm3.IntensityStation.forEach(function (elm4) {
                        var pointT = pointList[elm4.Code];
                        if (pointT)
                          stData.push({
                            lat: pointT.location[0],
                            lng: pointT.location[1],
                            name: elm4.Name,
                            int: elm4.Int,
                          });
                      });
                    }
                    cityData.push({
                      name: elm3.Name,
                      int: elm3.MaxInt,
                      station: stData,
                    });
                  });
                }
                areaData.push({
                  name: elm2.Name,
                  int: elm2.MaxInt,
                  city: cityData,
                });
              });
            }
            IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
          });
        }

        ConvertEQInfo({
          category: json.Head.Title,
          status: json.Control.Status,
          reportTime: json.Head.ReportDateTime,
          originTime: originTimeTmp,
          maxI: maxIntTmp,
          mag: magnitudeTmp,
          lat: LatTmp,
          lng: LngTmp,
          depth: depthTmp,
          epiCenter: epiCenterTmp,
          comment: commentTmp,
          cancel: cancelTmp,
          IntData: IntData,
        });
      }
    });
}

function axisInfoCtrl(json) {
  var Earthquake = json.Body.Earthquake[0];
  var LatLngDepth = parse_LatLngDepth(Earthquake.Hypocenter.Area.Coordinate[0].valueOf_)

  var originTimeTmp, epiCenterTmp, magnitudeTmp, maxIntTmp, LatTmp, LngTmp, depthTmp;

  if (Earthquake.OriginTime) originTimeTmp = new Date(Earthquake.OriginTime);
  if (Earthquake.Hypocenter.Area.Name)
    epiCenterTmp = Earthquake.Hypocenter.Area.Name;
  if (Earthquake.Magnitude) magnitudeTmp = Number(Earthquake.Magnitude);
  if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt)
    maxIntTmp = json.Body.Intensity.Observation.MaxInt;

  if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1]) LatTmp = Number(LatLngDepth[1]);
  if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2]) LngTmp = Number(LatLngDepth[2]);
  if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3]) depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

  var cancelTmp = json.Head.InfoType == "取消";

  var commentText = {
    ForecastComment: "",
    VarComment: "",
    FreeFormComment: "",
  };
  if (json.Body.Comments) {
    if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text)
      commentText.ForecastComment = json.Body.Comments.ForecastComment.Text;
    if (json.Body.Comments.VarComment && json.Body.Comments.VarComment.Text)
      commentText.VarComment = json.Body.Comments.VarComment.Text;
    if (json.Body.Comments.FreeFormComment)
      commentText.FreeFormComment = json.Body.Comments.FreeFormComment;
  }

  var IntData = [];
  if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
    json.Body.Intensity.Observation.Pref.forEach(function (elm) {
      var areaData = [];
      if (elm.Area) {
        elm.Area.forEach(function (elm2) {
          var cityData = [];
          if (elm2.City) {
            elm2.City.forEach(function (elm3) {
              var stData = [];
              if (elm3.IntensityStation) {
                elm3.IntensityStation.forEach(function (elm4) {
                  var pointT = pointList[elm4.Code];
                  if (pointT)
                    stData.push({
                      lat: pointT.location[0],
                      lng: pointT.location[1],
                      name: elm4.Name,
                      int: elm4.Int,
                    });
                });
              }
              cityData.push({
                name: elm3.Name,
                int: elm3.MaxInt,
                station: stData,
              });
            });
          }
          areaData.push({ name: elm2.Name, int: elm2.MaxInt, city: cityData });
        });
      }
      IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
    });
  }

  ConvertEQInfo({
    category: json.Head.Title,
    status: json.Control.Status,
    reportTime: json.Head.ReportDateTime,
    originTime: originTimeTmp,
    maxI: maxIntTmp,
    mag: magnitudeTmp,
    lat: LatTmp,
    lng: LngTmp,
    depth: depthTmp,
    epiCenter: epiCenterTmp,
    comment: commentText,
    cancel: cancelTmp,
    IntData: IntData,
  });
}

var Int0T = ["any"];
var Int1T = ["any"];
var Int2T = ["any"];
var Int3T = ["any"];
var Int4T = ["any"];
var Int5mT = ["any"];
var Int5pT = ["any"];
var Int6mT = ["any"];
var Int6pT = ["any"];
var Int7T = ["any"];

var LgInt1T = ["any"];
var LgInt2T = ["any"];
var LgInt3T = ["any"];
var LgInt4T = ["any"];

function mapFillReset() {
  Int0T = ["any"];
  Int1T = ["any"];
  Int2T = ["any"];
  Int3T = ["any"];
  Int4T = ["any"];
  Int5mT = ["any"];
  Int5pT = ["any"];
  Int6mT = ["any"];
  Int6pT = ["any"];
  Int7T = ["any"];
  if (!map.loaded()) return;
  map.setFilter("Int0", ["==", "name", ""]);
  map.setFilter("Int1", ["==", "name", ""]);
  map.setFilter("Int2", ["==", "name", ""]);
  map.setFilter("Int3", ["==", "name", ""]);
  map.setFilter("Int4", ["==", "name", ""]);
  map.setFilter("Int5-", ["==", "name", ""]);
  map.setFilter("Int5+", ["==", "name", ""]);
  map.setFilter("Int6-", ["==", "name", ""]);
  map.setFilter("Int6+", ["==", "name", ""]);
  map.setFilter("Int7", ["==", "name", ""]);
}
function mapFillResetL() {
  LgInt1T = ["any"];
  LgInt2T = ["any"];
  LgInt3T = ["any"];
  LgInt4T = ["any"];
  if (!map.loaded()) return;
  map.setFilter("LgInt1", ["==", "name", ""]);
  map.setFilter("LgInt2", ["==", "name", ""]);
  map.setFilter("LgInt3", ["==", "name", ""]);
  map.setFilter("LgInt4", ["==", "name", ""]);
}

function mapFillDraw() {
  map.setFilter("Int0", Int0T);
  map.setFilter("Int1", Int1T);
  map.setFilter("Int2", Int2T);
  map.setFilter("Int3", Int3T);
  map.setFilter("Int4", Int4T);
  map.setFilter("Int5-", Int5mT);
  map.setFilter("Int5+", Int5pT);
  map.setFilter("Int6-", Int6mT);
  map.setFilter("Int6+", Int6pT);
  map.setFilter("Int7", Int7T);

  map.setFilter("LgInt1", LgInt1T);
  map.setFilter("LgInt2", LgInt2T);
  map.setFilter("LgInt3", LgInt3T);
  map.setFilter("LgInt4", LgInt4T);

  estimated_intensity_map_layers.forEach(function (elm2) {
    if (map.getLayer(elm2))
      map.setLayoutProperty(
        elm2,
        "visibility", estShindoMapDraw && MapFill ? "visible" : "none"
      );
  });

  ["Int0", "Int1", "Int2", "Int3", "Int4", "Int5-", "Int5+", "Int6-", "Int6+", "Int7",].forEach(function (elm2) {
    map.setLayoutProperty(
      elm2,
      "visibility", ShindoMapDraw && MapFill ? "visible" : "none"
    );
  });
  ["LgInt1", "LgInt2", "LgInt3", "LgInt4"].forEach(function (elm2) {
    map.setLayoutProperty(
      elm2,
      "visibility", LgIntMapDraw && MapFill ? "visible" : "none"
    );
  });
}

function mapZoomReset() {
  try {
    map.fitBounds(ZoomBounds, { padding: 60, maxZoom: 7, animate: false });
  } catch {
    return;
  }
}

var intensityIcons = [];
//都道府県ごとの情報描画（リスト）
var ShindoFragment;
function add_Pref_info(name, maxInt) {
  var newDiv = document.createElement("div");
  var color1 = NormalizeShindo(maxInt, 2);
  newDiv.innerHTML =
    "<span aria-hidden='true'></span><div style='background:" + color1[0] + ";color:" + color1[1] + ";' aria-hidden='true'>" + maxInt +
    "</div>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem1");
  newDiv.setAttribute("tabindex", 0);
  newDiv.setAttribute("aria-label", `${name}、震度${NormalizeShindo(maxInt, 1)}`);
  newDiv.setAttribute("aria-expanded", "false");
  newDiv.setAttribute("role", "treeitem");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
    this.setAttribute("aria-expanded", String(this.nextElementSibling.classList.contains("open")));
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel1", "close");
  newDiv2.setAttribute("id", "WrapLevel1_" + name);
  newDiv2.setAttribute("role", "group");
  newDiv.setAttribute("aria-controls", "WrapLevel1_" + name);
  ShindoFragment.append(newDiv, newDiv2);

  document.getElementById("splash").style.display = "none";
}
//細分区域ごとの情報描画（リスト・地図塗りつぶし・地図プロット）
function add_Area_info(name, maxInt) {
  var wrap = ShindoFragment.querySelectorAll(".WrapLevel1");

  var newDiv = document.createElement("div");
  var color = NormalizeShindo(maxInt, 2);
  newDiv.innerHTML =
    "<span aria-hidden='true'></span><div style='background:" + color[0] + ";color:" + color[1] + ";' aria-hidden='true'>" +
    maxInt + "</div>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem2");
  newDiv.setAttribute("tabindex", 0);
  newDiv.setAttribute("aria-label", `細分区域 ${name}、震度${NormalizeShindo(maxInt, 1)}`);
  newDiv.setAttribute("title", `細分区域：${name}`);
  newDiv.setAttribute("aria-expanded", "false");
  newDiv.setAttribute("role", "treeitem");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
    this.setAttribute("aria-expanded", String(this.nextElementSibling.classList.contains("open")));
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel2", "close");
  newDiv2.setAttribute("id", "WrapLevel2_" + name);
  newDiv2.setAttribute("role", "group");
  newDiv.setAttribute("aria-controls", "WrapLevel2_" + name);

  wrap[wrap.length - 1].append(newDiv, newDiv2);

  if (name == config.home.Section) {
    var newDiv3 = document.createElement("div");
    newDiv3.innerHTML =
      "<span aria-hidden='true'></span><div style='background:" + color[0] + ";color:" + color[1] + ";' aria-hidden='true'>" +
      maxInt + "</div>" +
      name;
    newDiv3.classList.add("ShindoItem", "ShindoItem2");
    newDiv3.setAttribute("tabindex", 0);

    var homeName = config.home.name ? config.home.name : "現在地";
    newDiv3.setAttribute("aria-label", `${homeName}エリアの ${name}、震度${NormalizeShindo(maxInt, 1)}`);
    newDiv3.setAttribute("title", `細分区域（${homeName}周辺）：${name}`);

    removeChild(document.getElementById("homeShindo"));
    document.getElementById("homeShindoWrap").style.display = "block";
    document.getElementById("homeShindo").appendChild(newDiv3);
  }

  var pointLocation = areaLocation[name];
  if (pointLocation) {
    const icon = document.createElement("div");
    icon.classList.add("MaxShindoIcon");
    icon.innerHTML = '<div style="background:' + color[0] + ";color:" + color[1] + '">' +
      NormalizeShindo(maxInt) + "</div>";

    var maxIntStr = NormalizeShindo(maxInt, 1);
    var AreaPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML(
      "<div class='popupContent'><div class='shindoItem_S' style='background:" + color[0] + ";color:" + color[1] + "'>震度 "
      + maxIntStr + "</div><div class='pointName'>" + name + "</div><div class='pointHead'>細分区域</div></div><div></div>"
    );
    var markerElm = new maplibregl.Marker({ element: icon, opacityWhenCovered: 0 })
      .setLngLat(pointLocation)
      .setPopup(AreaPopup);
    markerElm.getElement().removeAttribute("tabindex");
    markerElm.getElement().setAttribute("aria-hidden", true);
    intensityIcons.push(markerElm);
    ZoomBounds.extend(pointLocation);
  }

  switch (maxInt) {
    case "0":
      Int0T.push(["==", "name", name]);
      break;
    case "1":
      Int1T.push(["==", "name", name]);
      break;
    case "2":
      Int2T.push(["==", "name", name]);
      break;
    case "3":
      Int3T.push(["==", "name", name]);
      break;
    case "4":
      Int4T.push(["==", "name", name]);
      break;
    case "5-":
      Int5mT.push(["==", "name", name]);
      break;
    case "5+":
      Int5pT.push(["==", "name", name]);
      break;
    case "6-":
      Int6mT.push(["==", "name", name]);
      break;
    case "6+":
      Int6pT.push(["==", "name", name]);
      break;
    case "7":
      Int7T.push(["==", "name", name]);
      break;
    default:
      break;
  }
}
//町ごとの情報描画（リスト）
function add_City_info(name, maxInt) {
  var wrap2 = ShindoFragment.querySelectorAll(".WrapLevel2");

  var newDiv = document.createElement("div");
  if (name) {
    var color3 = NormalizeShindo(maxInt, 2);
    newDiv.innerHTML = "<span aria-hidden='true'></span><div style='background:" + color3[0] + ";color:" + color3[1] + ";' aria-hidden='true'>" +
      maxInt + "</div>" + name;
    newDiv.classList.add("ShindoItem", "ShindoItem3");
    newDiv.setAttribute("tabindex", 0);
    newDiv.setAttribute("aria-label", `市区町村 ${name}、震度${NormalizeShindo(maxInt, 1)}`);
    newDiv.setAttribute("title", `市区町村：${name}`);
    newDiv.setAttribute("aria-expanded", "false");
    newDiv.setAttribute("role", "treeitem");
    newDiv.addEventListener("click", function () {
      this.classList.toggle("has-open");
      this.nextElementSibling.classList.toggle("open");
      this.setAttribute("aria-expanded", String(this.nextElementSibling.classList.contains("open")));
    });
  }

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel3");
  if (name) {
    newDiv2.classList.add("close");
    newDiv2.setAttribute("id", "WrapLevel2_" + name);
    newDiv2.setAttribute("role", "group");
    newDiv.setAttribute("aria-controls", "WrapLevel2_" + name);
  }
  wrap2[wrap2.length - 1].append(newDiv, newDiv2);
}
//観測点ごとの情報描画（リスト・地図プロット）
function add_IntensityStation_info(lat, lng, name, int) {
  var wrap3 = ShindoFragment.querySelectorAll(".WrapLevel3");

  var intStr = NormalizeShindo(int);
  var intStrLong = NormalizeShindo(int, 1);

  var newDiv = document.createElement("div");
  var color4 = NormalizeShindo(int, 2);
  newDiv.innerHTML = "<span aria-hidden='true'></span><div style='background:" + color4[0] + ";color:" + color4[1] + ";' aria-hidden='true'>" +
    intStr + "</div>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem4");
  newDiv.setAttribute("tabindex", 0);
  newDiv.setAttribute("aria-label", `観測点 ${name}、震度${NormalizeShindo(int, 1)}`);
  newDiv.setAttribute("title", `観測点：${name}`);
  newDiv.setAttribute("role", "treeitem");

  const icon = document.createElement("div");
  icon.classList.add("ShindoIcon");
  icon.innerHTML = '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' +
    intStr + "</div>";

  var mi_description = intStr == "未" ? "<div class = 'description'>震度5弱以上と考えられるが<br>現在震度を入手していない。</div>" : "";
  var PtPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML(
    "<div class='popupContent'><div class='shindoItem' style='background:" + color4[0] + ";color:" + color4[1] + "'>震度 "
    + intStrLong + "</div><div class='pointName'>" + name + "</div>" + mi_description + "<div class='pointHead'>震度観測点</div></div><div></div>"
  );
  var markerElm = new maplibregl.Marker({ element: icon, opacityWhenCovered: 0 })
    .setLngLat([lng, lat])
    .setPopup(PtPopup)
    .addTo(map);
  markerElm.getElement().removeAttribute("tabindex");
  markerElm.getElement().setAttribute("aria-hidden", true);
  intensityIcons.push(markerElm);

  wrap3[wrap3.length - 1].append(newDiv);
  ZoomBounds.extend([lng, lat]);
}

var lastDrawDate;
var drawTimeout;
var DataToDraw;
function DrawIntensity(data) {
  DataToDraw = data;
  if (lastDrawDate && new Date() - lastDrawDate < 500) {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
      DrawIntensity(DataToDraw);
    }, 500);
  } else {
    DrawIntensityCORE(DataToDraw);
    lastDrawDate = new Date();
  }
}

function DrawIntensityCORE(data) {
  var has_StaShindo = false;
  intensityIcons.forEach(function (elm) {
    elm.remove();
  });
  intensityIcons = [];
  removeChild(document.getElementById("Shindo"));
  document.getElementById("ShindoWrap").style.display = "inline-block";
  document.getElementById("Shindo").style.display = "block";
  mapFillReset();

  ShindoFragment = document.createDocumentFragment();
  data.forEach(function (elm) {
    add_Pref_info(elm.name, elm.int);
    if (elm.area) {
      elm.area.forEach(function (elm2) {
        add_Area_info(elm2.name, elm2.int);
        if (elm2.city && elm2.city.length) {
          elm2.city.forEach(function (elm3) {
            add_City_info(elm3.name, elm3.int);
            if (elm3.station) {
              elm3.station.forEach(function (elm4) {
                has_StaShindo = true;
                add_IntensityStation_info(elm4.lat, elm4.lng, elm4.name, elm4.int);
              });
            }
          });
        } else if (elm2.station) {
          add_City_info("", "");
          elm2.station.forEach(function (elm4) {
            has_StaShindo = true;
            add_IntensityStation_info(elm4.lat, elm4.lng, elm4.name, elm4.int);
          });
        }
      });
    }
  });

  intensityIcons.forEach(function (icon) {
    icon.addTo(map);
  });

  document.getElementById("Shindo").appendChild(ShindoFragment);

  if (has_StaShindo) mapContainer.classList.add("has_StaShindo");
  else mapContainer.classList.remove("has_StaShindo");

  mapFillDraw();
  mapZoomReset();
}

function DrawLgIntensity(data) {
  LgIntIcons.forEach(function (elm) {
    elm.remove();
  });
  removeChild(document.getElementById("LngInt"));
  document.getElementById("ShindoWrap").style.display = "inline-block";
  document.getElementById("lngintListWrap").style.display = "block";
  mapFillResetL();

  LgIntFragment = document.createDocumentFragment();
  data.forEach(function (elm) {
    add_Pref_infoL(elm.name, elm.lgint);
    if (elm.area) {
      elm.area.forEach(function (elm2) {
        add_Area_infoL(elm2.name, elm2.lgint);
        if (elm2.station) {
          elm2.station.forEach(function (elm4) {
            add_IntensityStation_infoL(elm4.lat, elm4.lng, elm4.name, elm4.lgint);
          });
        }
      });
    }
  });
  document.getElementById("LngInt").appendChild(LgIntFragment);
  mapFillDraw();
  mapZoomReset();
}

var LgIntIcons = [];
//都道府県ごとの情報描画（リスト）
var LgIntFragment;
function add_Pref_infoL(name, lngInt) {
  var newDiv = document.createElement("div");
  var color1 = LgIntConvert(lngInt);

  newDiv.innerHTML =
    "<span aria-hidden='true'></span><div style='background:" + color1[0] + ";color:" + color1[1] + ";' aria-hidden='true'>" +
    lngInt + "</div>" + name;
  newDiv.classList.add("ShindoItemL", "ShindoItem1L");
  newDiv.setAttribute("tabindex", 0);
  newDiv.setAttribute("aria-label", `${name}、長周期地震動階級${lngInt}`);
  newDiv.setAttribute("aria-expanded", "false");
  newDiv.setAttribute("role", "treeitem");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
    this.setAttribute("aria-expanded", String(this.nextElementSibling.classList.contains("open")));
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel1L", "close");
  newDiv2.setAttribute("id", "WrapLevel1L_" + name);
  newDiv2.setAttribute("role", "group");
  newDiv.setAttribute("aria-controls", "WrapLevel1L_" + name);
  LgIntFragment.append(newDiv, newDiv2);

  document.getElementById("splash").style.display = "none";
}
//細分区域ごとの情報描画（リスト・地図塗りつぶし・地図プロット）
function add_Area_infoL(name, maxInt) {
  var wrap = LgIntFragment.querySelectorAll(".WrapLevel1L");
  var color = LgIntConvert(maxInt);

  var newDiv = document.createElement("div");
  newDiv.innerHTML = "<span aria-hidden='true'></span><div style='background:" + color[0] + ";color:" + color[1] + ";' aria-hidden='true'>" +
    maxInt + "</div>" + name;
  newDiv.classList.add("ShindoItemL", "ShindoItem2L");
  newDiv.setAttribute("tabindex", 0);
  newDiv.setAttribute("aria-label", `細分区域 ${name}、長周期地震動階級${maxInt}`);
  newDiv.setAttribute("title", `細分区域：${name}`);
  newDiv.setAttribute("aria-expanded", "false");
  newDiv.setAttribute("role", "treeitem");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
    this.setAttribute("aria-expanded", String(this.nextElementSibling.classList.contains("open")));
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel2L", "close");
  newDiv2.setAttribute("id", "WrapLevel2L_" + name);
  newDiv2.setAttribute("role", "group");
  newDiv.setAttribute("aria-controls", "WrapLevel2L_" + name);

  wrap[wrap.length - 1].append(newDiv, newDiv2);

  if (name == config.home.Section) {
    var newDiv3 = document.createElement("div");
    newDiv3.innerHTML = "<span aria-hidden='true'></span><div style='background:" + color[0] + ";color:" + color[1] + ";' aria-hidden='true'>" +
      maxInt + "</div>" + name;
    newDiv3.classList.add("ShindoItemL", "ShindoItem2L");
    newDiv3.setAttribute("tabindex", 0);
    var homeName = config.home.name ? config.home.name : "現在地";
    newDiv3.setAttribute("aria-label", `${homeName}エリアの ${name}、長周期地震動階級${maxInt}`);
    newDiv3.setAttribute("title", `細分区域（${homeName}周辺）：${name}`);

    removeChild(document.getElementById("homeShindoL"));
    document.getElementById("homeShindoWrap").style.display = "block";
    document.getElementById("homeShindoL").appendChild(newDiv3);
  }

  var pointLocation = areaLocation[name];
  if (pointLocation) {
    const icon = document.createElement("div");
    icon.classList.add("MaxLgIntIcon");
    icon.innerHTML = '<div style="background:' + color[0] + ";color:" + color[1] + '">' +
      maxInt + "</div>";

    var AreaPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML(
      "<div class='popupContent'><div class='shindoItem_S' style='background:" + color[0] + ";color:" + color[1] + "'>長周期地震動階級 "
      + maxInt + "</div><div class='pointName'>" + name + "</div><div class='pointHead'>細分区域</div></div><div></div>"
    );
    var markerElm = new maplibregl.Marker({ element: icon, opacityWhenCovered: 0 })
      .setLngLat(pointLocation)
      .setPopup(AreaPopup)
      .addTo(map);
    markerElm.getElement().removeAttribute("tabindex");
    markerElm.getElement().setAttribute("aria-hidden", true);
    LgIntIcons.push(markerElm);
    ZoomBounds.extend(pointLocation);
  }

  switch (maxInt) {
    case "1":
      LgInt1T.push(["==", "name", name]);
      break;
    case "2":
      LgInt2T.push(["==", "name", name]);
      break;
    case "3":
      LgInt3T.push(["==", "name", name]);
      break;
    case "4":
      LgInt4T.push(["==", "name", name]);
      break;
    default:
      break;
  }
}
//観測点ごとの情報描画（リスト・地図プロット）
function add_IntensityStation_infoL(lat, lng, name, int) {
  var wrap3 = LgIntFragment.querySelectorAll(".WrapLevel2L");

  var color4 = LgIntConvert(int, 2);
  var intStr = int;

  var newDiv = document.createElement("div");
  newDiv.innerHTML =
    "<span aria-hidden='true'></span><div style='background:" + color4[0] + ";color:" + color4[1] + ";' aria-hidden='true'>"
    + int + "</div>" + name;
  newDiv.classList.add("ShindoItemL", "ShindoItem4L");
  newDiv.setAttribute("tabindex", 0);
  newDiv.setAttribute("aria-label", `観測点 ${name}、長周期地震動階級${int}`);
  newDiv.setAttribute("title", `観測点：${name}`);
  newDiv.setAttribute("aria-expanded", "false");
  newDiv.setAttribute("role", "treeitem");
  wrap3[wrap3.length - 1].append(newDiv);

  const icon = document.createElement("div");
  icon.classList.add("LgIntIcon");
  icon.innerHTML = '<div style="background:' + color4[0] + ";color:" + color4[1] + '">'
    + int + "</div>";

  var PtPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML(
    "<div class='popupContent'><div class='shindoItem' style='background:" + color4[0] + ";color:" + color4[1] + "'>長周期地震動階級 "
    + intStr + "</div><div class='pointName'>" + name + "</div><div class='pointHead'>震度観測点</div></div><div></div>"
  );
  var markerElm = new maplibregl.Marker({ element: icon, opacityWhenCovered: 0 })
    .setLngLat([lng, lat])
    .setPopup(PtPopup)
    .addTo(map);
  markerElm.getElement().removeAttribute("tabindex");
  markerElm.getElement().setAttribute("aria-hidden", true);
  LgIntIcons.push(markerElm);

  ZoomBounds.extend([lng, lat]);
}

var EQInfoMarged = {};
var EQInfoData = [];
//地震情報マージ
function ConvertEQInfo(data) {
  var sameData = EQInfoData.find(function (elm) {
    return (elm.category == data.category && Number(new Date(elm.reportTime)) == Number(new Date(data.reportTime)));
  });
  if (sameData) return;

  EQInfoData.push(data);

  var sortByReportDT = function (a, b) {
    return new Date(a.reportTime) < new Date(b.reportTime) ? -1 : 1;
  }
  var EQI_EEW = EQInfoData.filter((e) => { return e.category == "EEW" }).sort(sortByReportDT);
  var EQI_NOT_EEW = EQInfoData.filter((e) => { return e.category != "EEW" }).sort(sortByReportDT);
  EQInfoData = EQI_EEW.concat(EQI_NOT_EEW)

  EQInfoData.forEach(function (elm, index) {
    if (elm.cancel) {
      EQInfoData.slice(0, index).forEach(function (elm2, index2) {
        if (elm2.category == elm.category) EQInfoData[index2].cancel = true;
      });
    }
  });

  var EQInfoTmp = {};
  EQInfoData.forEach(function (elm) {
    var infoTypeTmp;
    if (elm.category == "EEW") infoTypeTmp = "type-1";
    else if (elm.category == "震度速報") infoTypeTmp = "type-2";
    else if (elm.category == "震源に関する情報") infoTypeTmp = "type-3";
    else if (elm.category == "震源・震度情報") infoTypeTmp = "type-4-1";
    else if (elm.category == "遠地地震に関する情報") infoTypeTmp = "type-4-2";
    else if (elm.category == "顕著な地震の震源要素更新のお知らせ") infoTypeTmp = "type-5";
    else if (elm.category == "津波") infoTypeTmp = "type-8";

    if (elm.cancel) InfoType_remove(infoTypeTmp);
    else InfoType_add(infoTypeTmp);


    if (!config.Info.EQInfo.showtraining && elm.status == "訓練") return;
    if (!config.Info.EQInfo.showTest && elm.status == "試験") return;

    //EEW以外の情報が既に入っているとき、EEWによる情報を破棄
    if (elm.category == "EEW" && EQInfoTmp.EEW == false) return;
    else if (elm.category == "EEW") EQInfoTmp.EEW = true;
    else if (elm.category != "EEW" && EQInfoTmp.EEW == true) {
      //EEW以外の情報が入ってきたとき、EEWによる情報を破棄
      EQInfoTmp.EEW == false;
      EQInfoTmp = {};
    }

    if (!elm.cancel) {
      if (Boolean2(elm.category)) EQInfoTmp.category = elm.category;
      if (Boolean2(elm.status)) EQInfoTmp.status = elm.status;
      if (Boolean2(elm.reportTime)) EQInfoTmp.reportTime = elm.reportTime;
      if (Boolean2(elm.originTime)) EQInfoTmp.originTime = elm.originTime;
      if (Boolean2(elm.maxI) && elm.maxI !== "?") EQInfoTmp.maxI = elm.maxI;
      if (Boolean2(elm.mag) && elm.M != "Ｍ不明" && elm.M != "NaN") EQInfoTmp.mag = elm.mag;
      if (Boolean2(elm.magType)) EQInfoTmp.magType = elm.magType;
      if (Boolean2(elm.lat)) EQInfoTmp.lat = elm.lat;
      if (Boolean2(elm.lng)) EQInfoTmp.lng = elm.lng;
      if (Boolean2(elm.depth)) EQInfoTmp.depth = elm.depth;
      if (Boolean2(elm.epiCenter)) EQInfoTmp.epiCenter = elm.epiCenter;
      if (Boolean2(elm.comment) && (Boolean2(elm.comment.ForecastComment) || Boolean2(elm.comment.VarComment) || Boolean2(elm.comment.FreeFormComment))) {
        if (!EQInfoTmp.comment) EQInfoTmp.comment = elm.comment;
      }

      if (Boolean2(elm.LngIntData)) EQInfoTmp.LngIntData = elm.LngIntData;
    }
  });

  EQInfoData.filter(function (elm) { return elm.category == "長周期地震動に関する観測情報"; }).forEach(function (elm) {
    if (Boolean2(elm.IntData)) EQInfoTmp.IntData = elm.IntData;

  });

  EQInfoData.filter(function (elm) { return elm.category !== "長周期地震動に関する観測情報"; }).forEach(function (elm) {
    if (Boolean2(elm.IntData)) EQInfoTmp.IntData = elm.IntData;
  });

  EQInfoTmp.cancel = !EQInfoData.find(function (elm) {
    return !elm.cancel;
  });

  EQInfoMarged = EQInfoTmp;

  if (EQInfoMarged.IntData) DrawIntensity(EQInfoMarged.IntData);
  if (EQInfoMarged.LngIntData) {
    InfoType_add("type-7");
    DrawLgIntensity(EQInfoMarged.LngIntData);
  }

  document.getElementById("cancelled").style.display = EQInfoMarged.cancel ? "flex" : "none";

  if (EQInfoMarged.originTime) EQInfo.originTime = EQInfoMarged.originTime;
  if (EQInfoMarged.maxI) EQInfo.maxI = EQInfoMarged.maxI;
  if (EQInfoMarged.mag) EQInfo.mag = EQInfoMarged.mag;

  if (EQInfoMarged.depth || EQInfoMarged.depth === 0) EQInfo.depth = Math.abs(EQInfoMarged.depth);
  if (EQInfoMarged.epiCenter) EQInfo.epiCenter = EQInfoMarged.epiCenter;

  if (EQInfo.originTime) data_time.innerText = NormalizeDate(4, EQInfo.originTime);
  if (EQInfo.maxI) data_maxI.innerText = NormalizeShindo(EQInfo.maxI, 1);
  if (EQInfo.maxI) data_maxI.style.borderBottom = "solid 2px " + NormalizeShindo(EQInfo.maxI, 2)[0];
  if (EQInfoMarged.magType) EQInfo.magType = EQInfoMarged.magType;
  else if (!EQInfo.magType) EQInfo.magType = "M";
  if (EQInfo.mag) data_M.innerText = EQInfo.magType + " " + EQInfo.mag;

  if (EQInfo.depth == 0) data_depth.innerText = "ごく浅い";
  else if (EQInfo.depth == 700) data_depth.innerText = "700km以上";
  else if (EQInfo.depth) data_depth.innerText = Math.round(EQInfo.depth) + "km";

  if (EQInfo.epiCenter) data_center.innerText = EQInfo.epiCenter;

  if (EQInfoMarged.comment) {
    EQInfo.comment = EQInfoMarged.comment;

    data_comment.innerHTML = (EQInfoMarged.comment.ForecastComment + "\n" + EQInfoMarged.comment.VarComment + "\n" + EQInfoMarged.comment.FreeFormComment)
      .replaceAll("\n", "<br>")
      .replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi, "<a href='$1'>$1</a>");

    var comments = EQInfoMarged.comment.ForecastComment.split("\n").concat(
      EQInfoMarged.comment.VarComment.split("\n"),
      EQInfoMarged.comment.FreeFormComment.split("\n")
    );

    var TsunamiShortMsg;
    var TsunamiColor;

    for (let elm of comments) {
      switch (elm) {
        case "この地震による津波の心配はありません。":
        case "震源の近傍で小さな津波発生の可能性がありますが、被害をもたらす津波の心配はありません。":
        case "この地震により、日本の沿岸では若干の海面変動があるかもしれませんが、被害の心配はありません。":
          TsunamiShortMsg = "津波の心配 なし";
          TsunamiColor = "";
          break;
        case "この地震による日本への津波の影響はありません。":
          TsunamiShortMsg = "日本への津波 なし";
          TsunamiColor = "";
          break;
        case "津波警報等（大津波警報・津波警報あるいは津波注意報）を発表中です。":
          TsunamiShortMsg = "津波警報等 発表";
          TsunamiColor = config.color.Tsunami.TsunamiWarningColor;
          break;
        case "震源が海底の場合、津波が発生するおそれがあります。":
        case "一般的に、この規模の地震が海域の浅い領域で発生すると、津波が発生することがあります。":
          TsunamiShortMsg = "場合により津波の恐れ";
          TsunamiColor = config.color.Tsunami.TsunamiWatchColor;
          break;
        case "震源の近傍で津波発生の可能性があります。":
          TsunamiShortMsg = "震源付近で津波の恐れ";
          TsunamiColor = config.color.Tsunami.TsunamiWatchColor;
          break;
        case "今後の情報に注意してください。":
        case "日本への津波の有無については現在調査中です。":
          TsunamiShortMsg = "今後の情報に注意";
          TsunamiColor = config.color.Tsunami.TsunamiWatchColor;
          break;
        case "太平洋の広域に津波発生の可能性があります。":
        case "太平洋で津波発生の可能性があります。":
        case "北西太平洋で津波発生の可能性があります。":
          TsunamiShortMsg = "太平洋で津波の恐れ";
          TsunamiColor = config.color.Tsunami.TsunamiWatchColor;
          break;
        case "インド洋の広域に津波発生の可能性があります。":
        case "インド洋で津波発生の可能性があります。":
          TsunamiShortMsg = "インド洋で津波の恐れ";
          TsunamiColor = config.color.Tsunami.TsunamiWatchColor;
          break;
      }
    }
    if (TsunamiShortMsg) {
      document.getElementById("TsunamiShortMsg_Wrap").style.display = "block";
      document.getElementById("TsunamiShortMsg_Wrap").style.borderColor = TsunamiColor;
      document.getElementById("TsunamiShortMsg_Wrap").style.borderWidth = TsunamiColor ? "2px" : "";
      document.getElementById("TsunamiShortMsg_Wrap").style.color = TsunamiColor ? "#FFF" : "";
      document.getElementById("TsunamiShortMsg").innerText = TsunamiShortMsg;
    }
  }

  if (EQInfoMarged.lat && EQInfoMarged.lng) {
    ZoomBounds.extend([EQInfoMarged.lng, EQInfoMarged.lat]);

    if (!ESmarkerElm) {
      const img = document.createElement("img");
      img.src = "./img/epicenter.svg";
      img.classList.add("epicenterIcon");

      var ESPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML(
        "<div class='popupContent'><div class='epicenterTitle'>震央</div><div class='pointName'>" +
        EQInfo.epiCenter + "</div></div>"
      );
      ESmarkerElm = new maplibregl.Marker({ element: img })
        .setLngLat([EQInfoMarged.lng, EQInfoMarged.lat])
        .setPopup(ESPopup)
        .addTo(map);
      ESmarkerElm.getElement().removeAttribute("tabindex");
      ESmarkerElm.getElement().setAttribute("aria-hidden", true);
    } else ESmarkerElm.setLngLat([EQInfoMarged.lng, EQInfoMarged.lat]);
  }

  document.getElementById("splash").style.display = "none";
}

//↓震度情報タブUI↓
document.getElementById("AllOpen").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1,.ShindoItem2,.ShindoItem3")
    .forEach(function (elm) {
      elm.classList.add("has-open");
    });
  document.querySelectorAll(".WrapLevel1,.WrapLevel2,.WrapLevel3")
    .forEach(function (elm) {
      elm.classList.add("open");
    });
});
document.getElementById("AllClose").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1,.ShindoItem2,.ShindoItem3")
    .forEach(function (elm) {
      elm.classList.remove("has-open");
    });
  document.querySelectorAll(".WrapLevel1,.WrapLevel2,.WrapLevel3")
    .forEach(function (elm) {
      elm.classList.remove("open");
    });
});

document.getElementById("AllOpenL").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1L,.ShindoItem2L,.ShindoItem3L")
    .forEach(function (elm) {
      elm.classList.add("has-open");
    });
  document.querySelectorAll(".WrapLevel1L,.WrapLevel2L,.WrapLevel3L")
    .forEach(function (elm) {
      elm.classList.add("open");
    });
});
document.getElementById("AllCloseL").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1L,.ShindoItem2L,.ShindoItem3L")
    .forEach(function (elm) {
      elm.classList.remove("has-open");
    });
  document.querySelectorAll(".WrapLevel1L,.WrapLevel2L,.WrapLevel3L")
    .forEach(function (elm) {
      elm.classList.remove("open");
    });
});

function InfoType_add(type) {
  var card = document.getElementById(type);
  if (card) {
    card.style.display = "inline-block";
    card.classList.remove("disabled");
  }
  if (type == "type-1") document.getElementById("EEWCaption").style.display = "block";
  else document.getElementById("EEWCaption").style.display = "none";

  switch (type) {
    case "type-4-1":
      InfoType_remove("type-1");
      InfoType_remove("type-2");
      InfoType_remove("type-3");
      break;
    case "type-4-2":
      InfoType_remove("type-1");
      InfoType_remove("type-2");
      InfoType_remove("type-3");
      if (map) {
        mapZoomReset();
        map.setZoom(2);
      }
      break;
    case "type-5":
      InfoType_remove("type-1");
      InfoType_remove("type-3");
      break;
    case "type-2":
    case "type-3":
      InfoType_remove("type-1");
      break;
    default:
      break;
  }
}

function InfoType_remove(type) {
  var card = document.getElementById(type)
  if (card) card.classList.add("disabled");
}

function hinanjoPopup(e) {
  var DataTmp = e.features[0].properties;
  var supportType = [];
  if (e.features[0].properties.disaster1 == 1) supportType.push("洪水");
  if (e.features[0].properties.disaster2 == 1) supportType.push("崖崩れ・土石流・地滑り");
  if (e.features[0].properties.disaster3 == 1) supportType.push("高潮");
  if (e.features[0].properties.disaster4 == 1) supportType.push("地震");
  if (e.features[0].properties.disaster5 == 1) supportType.push("津波");
  if (e.features[0].properties.disaster6 == 1) supportType.push("大規模な火事");
  if (e.features[0].properties.disaster7 == 1) supportType.push("内水氾濫");
  if (e.features[0].properties.disaster8 == 1) supportType.push("火山現象");
  supportType = supportType.join(", ");
  new maplibregl.Popup({ offset: 20 })
    .setLngLat(e.lngLat)
    .setHTML(
      `<div class='popupContent'><div class='hinanjoTitle'>指定緊急避難場所</div><div class="pointName">${DataTmp.name}
      </div><div class='popupContent'>対応：${supportType + (DataTmp.remarks ? "<div>" + DataTmp.remarks + "</div>" : "")}</div></div>`
    ).addTo(map);
}

function radioSet(name, val) {
  document.getElementsByName(name).forEach(function (elm) {
    if (elm.value == val) elm.checked = true;
  });
}

function Boolean2(elm) {
  return Boolean(elm !== null && elm !== undefined && elm !== "" && !Number.isNaN(elm) && elm != "Invalid Date" &&
    (!Array.isArray(elm) || elm.length > 0) && elm);
}

function parse_LatLngDepth(str) {
  try {
    if (str) {
      return String(str).replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");
    }
  } catch {
    return []
  }
}