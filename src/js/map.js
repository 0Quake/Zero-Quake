var map;
var previous_points = [];
var points = {};
var Tsunami_MajorWarning, Tsunami_Warning, Tsunami_Watch, Tsunami_Yoho;
var gjmapT; //津波用geojson
var sections = [];
var basemap, worldmap, prefecturesMap, plateMap, legend, legend2;
var offlineMapActive = true;
var overlayActive = false;

var psWaveList = [];
var tsunamiAlertNow = false;
var overlayTmp = 0;
var epicenterIcon; // eslint-disable-line
var tsunamiElm = [];
var inited = false;
var windowLoaded = false;
var TimeTable_JMA2001;
var tsunamiCanvas, EQDetectCanvas, PointsCanvas, PSWaveCanvas, overlayCanvas; // eslint-disable-line
var mapLayer, hinanjoLayer;
var kmoniMapData, SnetMapData;
var layerControl;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "kmoniUpdate") {
    kmoniMapUpdate(request.data, "knet");
  } else if (request.action == "SnetUpdate") {
    kmoniMapUpdate(request.data, "snet");
  } else if (request.action == "longWaveUpdate") {
    document.getElementById("LWaveWrap").style.display = "block";
    document.getElementById("maxKaikyu").textContent = request.data.avrrank;
    if (Number(request.data.avrrank) > 0) {
      document.getElementById("region_name2").textContent = request.data.avrarea_list.join(" ");
      document.getElementById("region_name2Wrap").style.display = "block";
      /*
      request.data.avrarea_list.forEach(function (elm) {
        var section = sections.find(function (elm2) {
          return elm2.name == elm;
        });
        if (section) {
          //section.item.setStyle({ fill: true, fillColor: "#FFF" });
        }
      });*/
    } else {
      document.getElementById("region_name2Wrap").style.display = "none";
    }
  } else if (request.action == "longWaveClear") {
    document.getElementById("LWaveWrap").style.display = "none";
  } else if (request.action == "EEWAlertUpdate") {
    psWaveEntry();
  } else if (request.action == "tsunamiUpdate") {
    tsunamiDataUpdate(request.data);
  } else if (request.action == "setting") {
    init();
  } else if (request.action == "EstShindoUpdate") {
    EstShindoUpdate(request.data);
  } else if (request.action == "Replay") {
    psWaveEntry();
  }

  document.getElementById("splash").style.display = "none";
});

window.addEventListener("load", function () {
  windowLoaded = true;
  init();
  psWaveAnm();
  setInterval(function () {
    //時計（ローカル時刻）更新
    document.getElementById("PC_TIME").textContent = dateEncode(3, new Date());
  }, 500);
});
function psWaveAnm() {
  if (now_EEW.length > 0) {
    for (elm of now_EEW) {
      psWaveCalc(elm.report_id);
    }
  }
  requestAnimationFrame(psWaveAnm);
}

//マップ初期化など
var inited = false;
function init() {
  if (!config || !windowLoaded || inited) return;
  inited = true;
  const root = document.querySelector(":root");
  const rootStyle = getComputedStyle(root);

  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [138.46, 32.99125],
    zoom: 4,
    attributionControl: true,
    style: {
      version: 8,
      sources: {
        v: {
          type: "vector",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/{z}/{x}/{y}.pbf"],
          attribution: "国土地理院",
          minzoom: 4,
          maxzoom: 16,
        },
        basemap: {
          type: "geojson",
          data: "./Resource/basemap.json",
          attribution: "気象庁",
        },
        worldmap: {
          type: "geojson",
          data: "./Resource/World.json",
          attribution: "Natural Earth",
        },
        prefmap: {
          type: "geojson",
          data: "./Resource/prefectures.json",
          attribution: "気象庁",
        },
        lake: {
          type: "geojson",
          data: "./Resource/lake.json",
          attribution: "国土数値情報",
        },
        tsunami: {
          type: "geojson",
          data: "./Resource/tsunami.json",
          attribution: "気象庁",
        },
        plate: {
          type: "geojson",
          data: "./Resource/plate.json",
          attribution: "気象庁",
        },
      },
      layers: [
        {
          id: "tsunami_Yoho",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": rootStyle.getPropertyValue("--TsunamiYohoColor"),
            "line-width": 30,
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },

        {
          id: "tsunami_Watch",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": rootStyle.getPropertyValue("--TsunamiWatchColor"),
            "line-width": 30,
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },
        {
          id: "tsunami_Warn",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": rootStyle.getPropertyValue("--TsunamiWarningColor"),
            "line-width": 30,
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },

        {
          id: "tsunami_MajorWarn",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": rootStyle.getPropertyValue("--TsunamiMajorWarningColor"),
            "line-width": 30,
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },

        {
          id: "basemap_fill",
          type: "fill",
          source: "basemap",
          paint: {
            "fill-color": "#333",
            "fill-opacity": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "basemap_LINE",
          type: "line",
          source: "basemap",
          paint: {
            "line-color": "#666",
            "line-width": 1,
          },
          minzoom: 6,
          maxzoom: 22,
        },
        {
          id: "prefmap_LINE",
          type: "line",
          source: "prefmap",
          paint: {
            "line-color": "#999",
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "worldmap_fill",
          type: "fill",
          source: "worldmap",
          paint: {
            "fill-color": "#333",
            "fill-opacity": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "worldmap_LINE",
          type: "line",
          source: "worldmap",
          paint: {
            "line-color": "#444",
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "lake_fill",
          type: "fill",
          source: "lake",
          paint: {
            "fill-color": "#325385",
            "fill-opacity": 0.5,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "lake_LINE",
          type: "line",
          source: "lake",
          paint: {
            "line-color": "#325385",
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        { id: "Int0", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_0_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int1", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_1_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int2", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_2_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int3", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_3_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int4", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_4_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int5-", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_5m_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int5+", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_5p_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int6-", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_6m_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int6+", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_6p_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int7", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_7_BgColor") }, filter: ["==", "name", ""] },
        { id: "Int7+", type: "fill", source: "basemap", paint: { "fill-color": rootStyle.getPropertyValue("--IntTheme_7p_BgColor") }, filter: ["==", "name", ""] },
        {
          id: "plate",
          type: "line",
          source: "plate",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#C88",
            "line-opacity": 0.4,
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        { id: "海岸線", type: "line", source: "v", "source-layer": "Cstline", filter: ["in", ["get", "vt_code"], ["literal", [5101, 5103]]], paint: { "line-color": "#999999", "line-offset": 0, "line-width": 1 } },
        { id: "河川中心線人工水路地下", type: "line", source: "v", "source-layer": "RvrCL", filter: ["==", ["get", "vt_code"], 5322], paint: { "line-color": "rgba(50,83,132,0.5)", "line-width": 2 } },
        { id: "河川中心線枯れ川部", type: "line", source: "v", "source-layer": "RvrCL", filter: ["==", ["get", "vt_code"], 5302], paint: { "line-color": "rgba(50,83,132,0.5)", "line-width": 2 } },
        { id: "河川中心線", type: "line", source: "v", "source-layer": "RvrCL", filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]], paint: { "line-color": "rgba(50,83,132,0.5)", "line-width": 2 } },
        { id: "海岸線堤防等に接する部分破線", type: "line", source: "v", "source-layer": "Cstline", filter: ["==", ["get", "vt_code"], 5103], layout: { "line-cap": "round" }, paint: { "line-color": "rgba(50,83,132,0.5)", "line-width": 2 } },
        { id: "水涯線", type: "line", source: "v", "source-layer": "WL", paint: { "line-color": "rgba(50,83,132,0.5)", "line-width": 2 } },
        { id: "水涯線堤防等に接する部分破線", type: "line", source: "v", "source-layer": "WL", filter: ["in", ["get", "vt_code"], ["literal", [5203, 5233]]], layout: { "line-cap": "round" }, paint: { "line-color": "rgba(50,83,132,0.5)", "line-width": 2 } },
        { id: "水部表記線polygon", type: "fill", source: "v", "source-layer": "WRltLine", filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "rgba(50,83,132,0.2)", "fill-outline-color": "rgba(50,83,132,0.5)" } },
        { id: "行政区画界線国の所属界", maxzoom: 8, type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1221], layout: { "line-cap": "square" }, paint: { "line-color": "#999", "line-width": 1 } },
        { id: "道路中心線ZL4-10国道", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]]], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 3 } },
        { id: "道路中心線ZL4-10高速", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["==", ["get", "vt_rdctg"], "高速自動車国道等"], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 3 } },
        { id: "道路中心線色0", minzoom: 11, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], 17, ["all", ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 1.5 } },
        { id: "鉄道中心線0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "#444", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線旗竿0", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "#444", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線ククリ橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]], ["!", ["all", ["in", ["get", "vt_rdctg"], ["literal", ["市区町村道等", "その他", "不明"]]], ["==", ["get", "vt_rnkwidth"], "3m-5.5m未満"]]]], 14, ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 1.5 } },
        { id: "道路中心線色橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 1.5 } },
        { id: "建築物0", type: "fill", source: "v", "source-layer": "BldA", filter: ["==", ["get", "vt_lvorder"], 0], paint: { "fill-color": "#3d3d3d" } },
        { id: "鉄道中心線橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "#444", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線旗竿橋0", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["in", ["get", "vt_railstate"], "橋・高架"], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "#444", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線色1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 4, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "#444", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線旗竿1", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "#444", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線ククリ橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]], ["!", ["all", ["in", ["get", "vt_rdctg"], ["literal", ["市区町村道等", "その他", "不明"]]], ["==", ["get", "vt_rnkwidth"], "3m-5.5m未満"]]]], 14, ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 1.5 } },
        { id: "道路中心線色橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 1.5 } },
        { id: "道路縁", minzoom: 17, type: "line", source: "v", "source-layer": "RdEdg", layout: { "line-cap": "square", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#444", "line-width": 1.5 } },
        { id: "行政区画界線25000市区町村界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1212], layout: { "line-cap": "square" }, paint: { "line-color": "#666666", "line-width": 1 } },
        { id: "行政区画界線25000都府県界及び北海道総合振興局・振興局界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1211], layout: { "line-cap": "round" }, paint: { "line-color": "#999999", "line-width": 1 } },
      ],
    },
  });
  map.addControl(new maplibregl.NavigationControl(), "top-left");

  var zoomLevelContinue = function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 5.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_1");
      //gjmapT.setStyle({ weight: 20 });
    } else if (currentZoom < 7) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_2");
      //gjmapT.setStyle({ weight: 25 });
    } else if (currentZoom < 8.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_3");
      //gjmapT.setStyle({ weight: 35 });
    } else {
      document.getElementById("mapcontainer").classList.add("zoomLevel_4");
      //gjmapT.setStyle({ weight: 65 });
    }
    if (currentZoom > 11) {
      document.getElementById("mapcontainer").classList.add("popup_show");
    }
  };
  zoomLevelContinue();
  map.on("zoom", zoomLevelContinue);
  map.on("load", zoomLevelContinue);
  map.on("load", function () {
    window.electronAPI.messageReturn({
      action: "tsunamiReqest",
    });
  });

  const img = document.createElement("img");
  img.src = "./img/homePin.svg";
  img.classList.add("homeIcon");

  new maplibregl.Marker(img).setLngLat([config.home.longitude, config.home.latitude]).addTo(map);
}
function init2() {
  if (inited || !config || !windowLoaded) return;
  inited = true;
  map = L.map("mapcontainer", {
    center: [32.99125, 138.46],
    zoom: 4,
    minZoom: 3.5,
    maxZoom: 21,
    zoomAnimation: true,
    zoomSnap: 0.1,
    zoomDelta: 0.5,
    preferCanvas: false,
    zoomControl: false,
    worldCopyJump: true,
    inertia: false,
    maxBoundsViscosity: 1,
    enableHighAccuracy: true,
  });

  map.createPane("tsunamiPane").style.zIndex = 201;
  map.createPane("jsonMAP1Pane").style.zIndex = 210;
  map.createPane("jsonMAP2Pane").style.zIndex = 211;
  map.createPane("PointsPane").style.zIndex = 221;
  map.createPane("PSWavePane").style.zIndex = 300;
  map.createPane("EQDetectPane").style.zIndex = 250;
  map.createPane("EQDetectPane").style.pointerEvents = "none";
  map.createPane("HinanjoPane").style.zIndex = 220;

  tsunamiCanvas = L.canvas({ pane: "tsunamiPane" });
  var jsonMAP1Canvas = L.canvas({ pane: "jsonMAP1Pane" });
  var jsonMAP2Canvas = L.canvas({ pane: "jsonMAP2Pane" });
  PointsCanvas = L.canvas({ pane: "PointsPane" });
  PSWaveCanvas = L.canvas({ pane: "PSWavePane" });
  EQDetectCanvas = L.canvas({ pane: "EQDetectPane" });
  HinanjoCanvas = L.canvas({ pane: "HinanjoPane" });
  overlayCanvas = L.canvas({ pane: "overlayCanvas" });

  //L.control.scale({ imperial: false }).addTo(map);←縮尺

  mapLayer = new L.LayerGroup();
  mapLayer.id = "mapLayer";
  mapLayer.addTo(map);

  fetch("./Resource/basemap.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      basemap = L.geoJSON(json, {
        style: {
          stroke: false,
          color: "#666",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          //interactive: false,
          attribution: "JMA",
          renderer: jsonMAP1Canvas,
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            sections.push({ name: feature.properties.name, item: layer });
            // layer.bindPopup("<h3>地震情報/細分区域</h3>" + feature.properties.name);
          }
        },
      });
      layerControl.addBaseLayer(basemap, "オフライン地図");
      mapLayer.addLayer(basemap);

      document.getElementById("splash").style.display = "none";
      if (estShindoTmp) EstShindoUpdate(estShindoTmp);
    });

  fetch("./Resource/World.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      worldmap = L.geoJSON(json, {
        style: {
          color: "#444",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          interactive: false,
          attribution: "Natural Earth",
          renderer: jsonMAP1Canvas,
        },
      });

      mapLayer.addLayer(worldmap);
    });

  fetch("./Resource/prefectures.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      prefecturesMap = L.geoJSON(json, {
        style: {
          color: "#999",
          fill: false,
          weight: 1,
          interactive: false,
          attribution: "JMA",
          renderer: jsonMAP2Canvas,
        },
      });

      mapLayer.addLayer(prefecturesMap);
    });
  fetch("./Resource/tsunami.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      gjmapT = L.geoJSON(json, {
        style: {
          stroke: false,
          fill: false,
          pane: "tsunamiPane",
          className: "tsunamiElm",
          attribution: "JMA",
          interactive: true,
          renderer: tsunamiCanvas,
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            tsunamiElm.push({
              name: feature.properties.name,
              item: layer,
              feature: feature,
            });

            layer.bindPopup({ content: "<h3>津波予報区</h3>" + feature.properties.name, keepInView: false, autoPan: false });
          }
        },
      });
    });
  fetch("./Resource/lake.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      L.geoJSON(json, {
        style: {
          stroke: false,
          color: "#0449b8",
          weight: 1,
          fill: true,
          fillColor: "#325385",
          fillOpacity: 0.5,
          attribution: "国土地理院",
          renderer: jsonMAP1Canvas,
        },
      }).addTo(map);
    });

  fetch("./Resource/plate.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      plateMap = L.geoJSON(json, {
        style: {
          color: "#C88",
          opacity: 0.3,
          fill: false,
          weight: 1,
          interactive: false,
          attribution: "",
          renderer: jsonMAP2Canvas,
        },
      });

      mapLayer.addLayer(plateMap);
    });
  fetch("./Resource/Snet_LINE.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      plateMap = L.geoJSON(json, {
        style: {
          color: "#666",
          fill: false,
          weight: 1,
          interactive: false,
          attribution: "",
          renderer: jsonMAP2Canvas,
        },
      });

      mapLayer.addLayer(plateMap);
    });

  hinanjoLayer = new L.LayerGroup();
  hinanjoLayer.id = "hinanjoLayer";

  var tile1 = L.tileLayer("https://www.data.jma.go.jp/svd/eqdb/data/shindo/map/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: "JMA",
  });
  var tile2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: "国土地理院",
  });
  var tile3 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: "国土地理院",
  });
  var tile4 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 5,
    maxNativeZoom: 14,
    maxZoom: 21,
    attribution: "国土地理院",
  });
  var tile5 = L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 19,
    maxZoom: 21,
    attribution: "OpenStreetMap contributors",
  });
  var tile8 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
  });

  var overlay1 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png", {
    minNativeZoom: 2,
    maxNativeZoom: 16,
    minZoom: 0,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png", {
    minNativeZoom: 11,
    maxNativeZoom: 18,
    minZoom: 7,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay3 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png", {
    minNativeZoom: 7,
    maxNativeZoom: 12,
    minZoom: 7,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay4 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", {
    minNativeZoom: 7,
    maxNativeZoom: 12,
    minZoom: 7,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay5 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png", {
    minNativeZoom: 7,
    maxNativeZoom: 12,
    minZoom: 7,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay6 = L.tileLayer("https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: "JMA",
  });
  var overlay7 = L.tileLayer("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=", {
    minNativeZoom: 10,
    maxNativeZoom: 10,
    minZoom: 10,
    maxZoom: 21,
    attribution: "国土地理院",
  })
    .on("tileloadstart", function (event) {
      var tilePath = event.coords;
      var tileX = tilePath.x;
      var tileY = tilePath.y;

      var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb04/10/" + tileX + "/" + tileY + ".geojson";
      fetch(url)
        .then((a) => (a.ok ? a.json() : null))
        .then((geojson) => {
          if (!geojson) return;
          event.tile.geojson = L.geoJSON(geojson, {
            pointToLayer: function (feature, cordinate) {
              return L.circleMarker(cordinate, {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                renderer: HinanjoCanvas,
              });
            },
          }).bindPopup({ content: "指定緊急避難場所（地震）", keepInView: false, autoPan: false });
          hinanjoLayer.addLayer(event.tile.geojson);
        })
        .catch(function () {});
      var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb05/10/" + tileX + "/" + tileY + ".geojson";

      fetch(url)
        .then((a) => (a.ok ? a.json() : null))
        .then((geojson) => {
          if (!geojson) return;
          event.tile.geojson2 = L.geoJSON(geojson, {
            pointToLayer: function (feature, cordinate) {
              return L.circleMarker(cordinate, {
                radius: 8,
                fillColor: "#0078ff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                renderer: HinanjoCanvas,
              });
            },
          }).bindPopup({ content: "指定緊急避難場所（津波）", keepInView: false, autoPan: false });
          hinanjoLayer.addLayer(event.tile.geojson2);
        })
        .catch(function () {});
      //     this._map.removeLayer(event.tile.geojson);
    })
    .on("tileunload", function (event) {
      if (event.tile.geojson && this._map) this._map.removeLayer(event.tile.geojson);
      if (event.tile.geojson2 && this._map) this._map.removeLayer(event.tile.geojson2);
    });

  layerControl = L.control
    .layers(
      {
        気象庁: tile1,
        "地理院 標準地図": tile8,

        "地理院 淡色地図": tile2,
        衛星写真: tile3,
        白地図: tile4,
        OpenStreetMap: tile5,
      },
      {
        陰影起伏図: overlay1,
        火山基本図データ: overlay2,
        "津波浸水想定 ハザードマップ": overlay3,
        "土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ": overlay4,
        "土砂災害警戒区域（地すべり） ハザードマップ": overlay5,
        境界線: overlay6,
        指定緊急避難場所: overlay7,
      },
      {
        position: "topleft",
      }
    )
    .addTo(map);

  map.on("baselayerchange", function (layer) {
    offlineMapActive = layer.name == "オフライン地図";

    if (basemap) basemap.setStyle({ fill: offlineMapActive && !overlayActive });
    if (worldmap) worldmap.setStyle({ fill: offlineMapActive && !overlayActive });
  });
  map.on("locationerror", function (e) {
    e.preventDefault();
  });
  map.on("overlayadd", function (eventLayer) {
    overlayTmp++;
    overlayActive = true;
    basemap.setStyle({ fill: offlineMapActive && !overlayActive });
    worldmap.setStyle({ fill: offlineMapActive && !overlayActive });

    if (eventLayer.name === "津波浸水想定 ハザードマップ") {
      legend.addTo(map);
    } else if (eventLayer.name === "指定緊急避難場所") {
      hinanjoLayer.addTo(map);
    } else if (eventLayer.name === "土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      legend2.addTo(map);
    }
  });
  map.on("overlayremove", function (eventLayer) {
    overlayTmp -= 1;

    if (eventLayer.name === "津波浸水想定 ハザードマップ") {
      map.removeControl(legend);
    } else if (eventLayer.name === "指定緊急避難場所") {
      map.removeLayer(hinanjoLayer);
    } else if (eventLayer.name === "土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      map.removeControl(legend2);
    }
    if (overlayTmp == 0) {
      overlayActive = false;
      basemap.setStyle({ fill: offlineMapActive && !overlayActive });
      worldmap.setStyle({ fill: offlineMapActive && !overlayActive });
    }
  });

  tsunamiLayer = L.featureGroup();

  var legend0 = L.control({ position: "bottomright" });
  legend0.onAdd = function () {
    var div = L.DomUtil.create("div");
    div.classList.add("legend");
    div.innerHTML = "<img src='./img/nied_acmap_s_w_scale.svg'>";
    return div;
  };
  legend0.addTo(map);
  legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div");
    div.classList.add("legend");
    div.innerHTML = "<img src='https://disaportal.gsi.go.jp/hazardmap/copyright/img/tsunami_newlegend.png'>";
    return div;
  };
  legend2 = L.control({ position: "bottomright" });
  legend2.onAdd = function () {
    var div = L.DomUtil.create("div");
    div.classList.add("legend");
    div.innerHTML = "<img src='https://disaportal.gsi.go.jp/hazardmap/copyright/img/dosha_keikai.png'>";
    return div;
  };
  /*
  map.createPane("background");
  var imageUrl = "./img/mapbase.png"; //size 5616 x 3744
  var imageBounds = [
    [90, 0],
    [-90, 360],
  ]; //初期表示範囲

  L.imageOverlay(imageUrl, imageBounds, {
    pane: "background",
  }).addTo(map);*/

  /*
  map.on("zoomstart", function () {
    if (psWaveList.length > 0) {
      document.querySelectorAll(".PWave,.SWave").forEach(function (elm) {
        elm.style.transitionTimingFunction = "step-start";
      });
    }
  });
  */ /*
  map.on("zoomend", function () {
    if (psWaveList.length > 0) {
      psWaveList.forEach(function (elm) {
        psWaveCalc(elm.id);
      });
    }
  });*/
  map.on("zoom", function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 5.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_1");
      gjmapT.setStyle({ weight: 20 });
    } else if (currentZoom < 7) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_2");
      gjmapT.setStyle({ weight: 25 });
    } else if (currentZoom < 8.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_3");
      gjmapT.setStyle({ weight: 35 });
    } else {
      document.getElementById("mapcontainer").classList.add("zoomLevel_4");
      gjmapT.setStyle({ weight: 65 });
    }
    if (currentZoom > 11) {
      document.getElementById("mapcontainer").classList.add("popup_show");
    }
    if (basemap) {
      if (currentZoom >= 7) {
        basemap.setStyle({ stroke: true });
      } else {
        basemap.setStyle({ stroke: false });
      }
    }
  });

  map.on("load", function () {
    if (kmoniMapData) kmoniMapUpdate(kmoniMapData);
    if (SnetMapData) kmoniMapUpdate(SnetMapData);
  });
  epicenterIcon = L.icon({
    iconUrl: "../src/img/epicenter.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });

  var currentZoom = map.getZoom();

  if (currentZoom < 5.5) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_1");
  } else if (currentZoom < 7) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_2");
  } else if (currentZoom < 8.5) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_3");
  } else {
    document.getElementById("mapcontainer").classList.add("zoomLevel_4");
  }
  if (currentZoom > 11) {
    document.getElementById("mapcontainer").classList.add("popup_show");
  }

  var homeIcon = L.icon({
    iconUrl: "img/homePin.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  markerElm = L.marker([config.home.latitude, config.home.longitude], { keyboard: false, icon: homeIcon }).addTo(map).bindPopup({ content: config.home.name, keepInView: false, autoPan: false });
}
fetch("./Resource/TimeTable_JMA2001.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (json) {
    TimeTable_JMA2001 = json;

    psWaveEntry();
  });

//観測点マーカー追加
function addPointMarker(elm) {
  var codeEscaped = elm.Code.replace(".", "_");

  const el = document.createElement("div");
  el.classList.add("kmoniPointMarker", "KmoniPoint_" + codeEscaped);
  el.innerHTML = "<div class='marker-circle marker-circle-" + elm.Type + "'></div>";

  elm.popup = new maplibregl.Popup({ offset: 10 });
  elm.marker = new maplibregl.Marker(el).setLngLat([elm.Location.Longitude, elm.Location.Latitude]).setPopup(elm.popup).addTo(map);
  return elm;
}
//観測点情報更新
function kmoniMapUpdate(dataTmp, type) {
  if (!dataTmp) return;
  if (type == "knet") {
    kmoniMapData = dataTmp;
    if (config && document.getElementById("tab1_content2").classList.contains("active_tabcontent")) {
      //リアルタイム震度タブ
      kmoniListDraw(dataTmp);
    }
  } else if (type == "snet") {
    SnetMapData = dataTmp;
  }

  //地図上マーカー
  var codeEscaped;
  var markerElement;
  var popup_content;
  var marker_add;
  var changed;
  for (elm of dataTmp) {
    if (elm.Point && !elm.IsSuspended) {
      codeEscaped = elm.Code.replace(".", "_");
      markerElement = document.querySelector(".KmoniPoint_" + codeEscaped);

      if (elm.data) {
        changed = false;
        marker_add = false;

        if (!markerElement) {
          marker_add = true;
          points[elm.Code] = addPointMarker(elm);
          markerElement = document.querySelector(".KmoniPoint_" + codeEscaped);
        }

        if (previous_points.length == 0) {
          changed = true;
        } else {
          var pga0 = previous_points[elm.Code].pga;
          changed = pga0 && pga0 !== elm.pga;
        }

        if (changed || marker_add) {
          var markerCircleElm = markerElement.querySelector(".marker-circle");
          markerCircleElm.style.background = "rgb(" + elm.rgb.join(",") + ")";

          //markerElement.style.display = "block";
          var PNameTmp = elm.Name ? elm.Name : "";
          var detecting = elm.detect || elm.detect2 ? "block" : "none";
          var shindoStr = Math.round(elm.shindo * 10) / 10;
          var pgaStr = Math.round(elm.pga * 100) / 100;
          var connectStr = "";
          if (elm.Type == "S-net") connectStr = "_";
          popup_content = "<h3 class='PointName' style='border-bottom:solid 2px rgb(" + elm.rgb.join(",") + ")'>" + PNameTmp + "<span>" + elm.Type + connectStr + elm.Code + "</span></h3><h4 class='detecting' style='display:" + detecting + "'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'>" + shindoStr + "</td></tr><tr><td>PGA</td><td class='PointPGA'>" + pgaStr + "</td></tr></table>";
          points[elm.Code].popup.setHTML(popup_content);
          markerCircleElm.classList.remove("strongDetectingMarker", "detectingMarker", "marker_Int", "marker_Int1", "marker_Int2", "marker_Int3", "marker_Int4", "marker_Int5m", "marker_Int5p", "marker_Int6m", "marker_Int6p", "marker_Int7", "marker_Int7p");

          if (elm.detect2) {
            markerCircleElm.classList.add("strongDetectingMarker");
          } else if (elm.detect) {
            markerCircleElm.classList.add("detectingMarker");
          }

          var IntTmp = shindoConvert(elm.shindo, 3);
          if (IntTmp) {
            markerCircleElm.classList.add("marker_Int", "marker_Int" + IntTmp);
          }
        }
      } else {
        if (markerElement) {
          var markerCircleElm = markerElement.querySelector(".marker-circle");
          markerCircleElm.style.background = "rgba(128,128,128,0.5)";
          markerCircleElm.classList.remove("strongDetectingMarker");
          markerCircleElm.classList.remove("detectingMarker");
          var PNameTmp = elm.Name ? elm.Name : "";

          popup_content = "<h3 class='PointName' style='border-bottom:solid 2px rgba(128,128,128,0.5)'>" + PNameTmp + "<span>" + elm.Code + "</span></h3><h4 class='detecting' style='display:none'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'>?</td></tr><tr><td>PGA</td><td class='PointPGA'>?</td></tr></table>";
          points[elm.Code].popup.setHTML(popup_content);
        }
      }
      previous_points[elm.Code] = elm;
    }
  }
}

//強震モニタリストの描画
var pointListLoading = document.getElementById("pointListLoading");
var pointList = document.getElementById("pointList");

function kmoniListDraw(dataTmp) {
  if (!dataTmp) {
    pointListLoading.style.display = "block";
    pointList.innerHTML = "";
    return false;
  }
  pointListLoading.style.display = "none";
  var shindoList = dataTmp
    .filter(function (elm) {
      return elm.shindo;
    })
    .sort(function (a, b) {
      return b.shindo - a.shindo;
    });
  var htmlTmp = "";
  for (let a = 0; a < config.Info.RealTimeShake.List.ItemCount; a++) {
    var shindoElm = shindoList[a];
    if (shindoElm.shindo) {
      var shindoColor = shindoConvert(shindoElm.shindo, 2);
      var IntDetail = "";
      if (a == 0) IntDetail = "<div class='intDetail'>" + Math.round(shindoElm.shindo * 10) / 10 + "</div>";

      htmlTmp += "<li><div class='int' style='color:" + shindoColor[1] + ";background:" + shindoColor[0] + "'>" + shindoConvert(shindoElm.shindo, 0) + IntDetail + "</div><div class='Pointname'>" + shindoElm.Region + " " + shindoElm.Name + "</div><div class='PGA'>PGA" + Math.round(shindoElm.pga * 100) / 100 + "</div></li>";
    }
  }
  pointList.innerHTML = htmlTmp;
}

//タブ有効化時 即時に描画
document.getElementById("tab1_menu2").addEventListener("click", function () {
  kmoniListDraw(kmoniMapData);
});

var estShindoTmp;
//予想震度更新
function EstShindoUpdate(data) {
  estShindoTmp = data;
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
  map.setFilter("Int7+", ["==", "name", ""]);
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
  var Int7pT = ["any"];

  data.forEach(function (elm) {
    if (!elm.Section) return;
    var shindo = String(shindoConvert(elm.estShindo, 0));
    switch (shindo) {
      case "0":
        Int0T.push(["==", "name", elm.Section]);
        break;
      case "1":
        Int1T.push(["==", "name", elm.Section]);
        break;
      case "2":
        Int2T.push(["==", "name", elm.Section]);
        break;
      case "3":
        Int3T.push(["==", "name", elm.Section]);
        break;
      case "4":
        Int4T.push(["==", "name", elm.Section]);
        break;
      case "5-":
        Int5mT.push(["==", "name", elm.Section]);
        break;
      case "5+":
        Int5pT.push(["==", "name", elm.Section]);
        break;
      case "6-":
        Int6mT.push(["==", "name", elm.Section]);
        break;
      case "6+":
        Int6pT.push(["==", "name", elm.Section]);
        break;
      case "7":
        Int7T.push(["==", "name", elm.Section]);
        break;
      case "7+":
        Int7pT.push(["==", "name", elm.Section]);
        break;
      default:
        break;
    }
  });
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
  map.setFilter("Int7+", Int7pT);
}

//🔴予報円🔴
//予報円追加
function psWaveEntry() {
  now_EEW.forEach(function (elm) {
    if (!elm.is_cancel && elm.arrivalTime) {
      var countDownElm = document.getElementById("EEW-" + elm.report_id);
      if (countDownElm) {
        countDownElm = countDownElm.querySelector(".countDown");
        if (countDownElm) {
          var countDown = (elm.arrivalTime - (new Date() - Replay)) / 1000;

          if (countDown > 0) {
            var countDown_min = Math.floor(countDown / 60);
            var countDown_sec = Math.floor(countDown % 60);

            if (countDown_min == 0) {
              countDownElm.textContent = countDown_sec;
            } else {
              countDownElm.textContent = countDown_min + ":" + String(countDown_sec).padStart(2, "0");
            }
          } else {
            countDownElm.textContent = "0";
          }
        }
      }
    }

    if (!elm.is_cancel && elm.origin_time && elm.depth && elm.latitude && elm.longitude) {
      var distance = Math.floor((new Date() - Replay - elm.origin_time) / 1000);

      if (elm.depth <= 700 && distance <= 2000 && TimeTable_JMA2001) {
        var TimeTableTmp = TimeTable_JMA2001[elm.depth];
        var pswaveFind = psWaveList.find(function (elm2) {
          return elm2.id == elm.report_id;
        });

        if (pswaveFind) {
          pswaveFind.data.longitude = elm.longitude;
          pswaveFind.data.latitude = elm.latitude;
        } else {
          psWaveList.push({
            id: elm.report_id,
            PCircleElm: null,
            SCircleElm: null,
            data: { latitude: elm.latitude, longitude: elm.longitude, originTime: elm.origin_time, pRadius: 0, sRadius: 0 },
            TimeTable: TimeTableTmp,
          });
        }
        psWaveCalc(elm.report_id);
      }
    }
  });

  //終わった地震の予報円削除
  psWaveList = psWaveList.filter(function (elm) {
    var stillEEW = now_EEW.find(function (elm2) {
      return elm2.report_id == elm.id;
    });
    if (!stillEEW || stillEEW.is_cancel) {
      if (elm.PCircleElm) {
        map.setLayoutProperty("PCircle_" + elm.id, "visibility", "none");
        map.setLayoutProperty("SCircle_" + elm.id, "visibility", "none");
        map.setLayoutProperty("SCircle_" + elm.id + "_FILL", "visibility", "none");
      }
    }
    return stillEEW;
  });
}
//予報円半径計算
function psWaveCalc(eid) {
  var pswaveFind = psWaveList.find(function (elm2) {
    return elm2.id == eid;
  });
  if (pswaveFind) {
    var TimeTableTmp = pswaveFind.TimeTable;
    var SWmin;
    /*var EQElm = psWaveList.find(function (elm) {
      return elm.id == eid;
    });*/

    var distance = (new Date() - Replay - pswaveFind.data.originTime) / 1000;

    //if (EQElm) distance += 1;

    var PRadius = 0;
    var SRadius = 0;

    var TimeElmTmpP;
    var TimeElmTmpS;

    var Pfind = TimeTableTmp.find(function (elm2) {
      return elm2.P == distance;
    });

    if (Pfind) {
      TimeElmTmpP = [Pfind, Pfind];
    } else {
      var result = [Infinity, 0];
      var result2 = [Infinity, 0];
      TimeTableTmp.forEach((a) => {
        var b = Math.abs(a.P - distance);
        if (result[0] > b) {
          result2 = result;
          result = [b, a];
        }
      });
      TimeElmTmpP = [result[1], result2[1]];
    }

    var Sfind = TimeTableTmp.find(function (elm2) {
      return elm2.S == distance;
    });

    var SWmin = Math.min.apply(
      null,
      TimeTableTmp.map(function (elm2) {
        return elm2.S;
      })
    );
    if (Sfind) {
      TimeElmTmpS = [Sfind, Sfind];
    } else {
      var loopI = 0;
      var result = [Infinity, 0];
      var result2 = [Infinity, 0];
      TimeTableTmp.forEach((a) => {
        var b = Math.abs(a.S - distance);
        if (result[0] >= b || loopI == 0) {
          if (loopI == 0) {
            result2 = [null, TimeTableTmp[1]];
          } else {
            result2 = result;
          }
          result = [b, a];
        }
        loopI++;
      });
      TimeElmTmpS = [result[1], result2[1]];
    }

    PRadius = TimeElmTmpP[0].R + ((TimeElmTmpP[1].R - TimeElmTmpP[0].R) * (distance - TimeElmTmpP[0].P)) / (TimeElmTmpP[1].P - TimeElmTmpP[0].P);

    if (SWmin > distance) {
      var ArriveTime = TimeTableTmp.find(function (elm2) {
        return elm2.R == 0;
      }).S;
      window.requestAnimationFrame(function () {
        psWaveReDraw(
          pswaveFind.id,
          pswaveFind.data.latitude,
          pswaveFind.data.longitude,
          PRadius * 1000,
          0,
          true, //S波未到達
          ArriveTime, //発生からの到達時間
          distance //現在の経過時間
        );
      });
    } else {
      SRadius = linear([TimeElmTmpS[0].S, TimeElmTmpS[1].S], [TimeElmTmpS[0].R, TimeElmTmpS[1].R])(distance);
      window.requestAnimationFrame(function () {
        psWaveReDraw(pswaveFind.id, pswaveFind.data.latitude, pswaveFind.data.longitude, PRadius * 1000, SRadius * 1000);
      });

      /*
        id: elm.report_id,
            PCircleElm: null,
            SCircleElm: null,
            data: [{ latitude: elm.latitude, longitude: elm.longitude, originTime: elm.origin_time, pRadius: 0, sRadius: 0 }],
            TimeTable: TimeTableTmp,*/
    }
  }
}
//予報円描画
function psWaveReDraw(report_id, latitude, longitude, pRadius, sRadius, SnotArrived, SArriveTime, nowDistance) {
  if (!pRadius || (!sRadius && !SnotArrived)) return;
  var EQElm = psWaveList.find(function (elm) {
    return elm.id == report_id;
  });
  var EQElm2 = now_EEW.find(function (elm) {
    return elm.report_id == report_id;
  });

  latitude = latitudeConvert(latitude);
  longitude = latitudeConvert(longitude);

  if (EQElm) {
    let _center = turf.point([longitude, latitude]);
    let _options = {
      steps: 80,
      units: "kilometers",
    };

    if (EQElm.PCircleElm) {
      var pcircle = turf.circle(_center, pRadius / 1000, _options);
      map.getSource("PCircle_" + report_id).setData(pcircle);

      var scircle = turf.circle(_center, sRadius / 1000, _options);
      map.getSource("SCircle_" + report_id).setData(scircle);
      map.setPaintProperty("SCircle_" + report_id, "line-width", SnotArrived ? 0 : 2);
    } else {
      map.addSource("PCircle_" + report_id, {
        type: "geojson",
        data: turf.circle(_center, pRadius / 1000, _options),
      });

      map.addLayer({
        id: "PCircle_" + report_id,
        type: "line",
        source: "PCircle_" + report_id,
        paint: {
          "line-color": config.color.psWave.PwaveColor,
          "line-width": 2,
        },
      });

      map.addSource("SCircle_" + report_id, {
        type: "geojson",
        data: turf.circle(_center, sRadius / 1000, _options),
      });

      map.addLayer({
        id: "SCircle_" + report_id,
        type: "line",
        source: "SCircle_" + report_id,
        paint: {
          "line-color": config.color.psWave.SwaveColor,
          "line-width": 2,
        },
      });
      map.addLayer({
        id: "SCircle_" + report_id + "_FILL",
        type: "fill",
        source: "SCircle_" + report_id,
        paint: {
          "fill-color": config.color.psWave.SwaveColor,
          "fill-opacity": 0.15,
        },
      });

      EQElm.PCircleElm = true;
      EQElm.SCircleElm = true;
      EQElm = psWaveList[psWaveList.length - 1];

      psWaveCalc(report_id);
    }

    if (EQElm.SIElm) {
      if (SnotArrived) {
        var SWprogressValue = document.getElementById("SWprogressValue_" + report_id);
        if (SWprogressValue) {
          SWprogressValue.setAttribute("stroke-dashoffset", Number(138 - 138 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))));
        }
      } else {
        EQElm.SIElm.remove();
      }
    } else if (SnotArrived) {
      var SIElm;

      EQElm.firstDetect = nowDistance;

      const el = document.createElement("div");
      el.classList.add("SWaveProgress");
      el.innerHTML = '<svg width="50" height="50"><circle cx="25" cy="25" r="22" fill="none" stroke-width="5px" stroke="#777"/><circle id="SWprogressValue_' + report_id + '" class="SWprogressValue" cx="25" cy="25" r="22" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="138" stroke-dashoffset="' + Number(138 - 138 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '"/></svg>';

      SIElm = new maplibregl.Marker(el).setLngLat([longitude, latitude]).addTo(map);

      EQElm.SIElm = SIElm;
    }
  }

  var EEWPanelElm = document.getElementById("EEW-" + report_id);

  if (EQElm2 && EQElm2.distance && EEWPanelElm) {
    EEWPanelElm.querySelector(".PWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(pRadius / 1000 / EQElm2.distance, 1));
    EEWPanelElm.querySelector(".SWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(sRadius / 1000 / EQElm2.distance, 1));

    if (EQElm2.arrivalTime) {
      var countDownElm = EEWPanelElm.querySelector(".countDown");
      var countDown = (EQElm2.arrivalTime - (new Date() - Replay)) / 1000;
      if (countDown > 0) {
        var countDown_min = Math.floor(countDown / 60);
        var countDown_sec = Math.floor(countDown % 60);

        if (countDown_min == 0) {
          countDownElm.textContent = countDown_sec;
        } else {
          countDownElm.textContent = countDown_min + ":" + String(countDown_sec).padStart(2, "0");
        }
      } else {
        countDownElm.textContent = "0";
      }
    }
  }
}

//🔴津波情報🔴
//津波情報更新
function tsunamiDataUpdate(data) {
  map.setFilter("tsunami_MajorWarn", ["==", "name", ""]);
  map.setFilter("tsunami_Warn", ["==", "name", ""]);
  map.setFilter("tsunami_Watch", ["==", "name", ""]);
  map.setFilter("tsunami_Yoho", ["==", "name", ""]);
  Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false;

  document.getElementById("tsunamiCancel").style.display = data.cancelled ? "block" : "none";
  document.getElementById("tsunamiRevocation").style.display = data.revocation ? "block" : "none";

  if (data.cancelled) {
    document.getElementById("tsunamiWrap").style.display = "none";

    document.body.classList.remove("TsunamiMode");
  } else {
    //    map.addLayer(tsunamiLayer);

    document.getElementById("tsunamiWrap").style.display = "block";

    document.body.classList.add("TsunamiMode");
    var alertNowTmp = false;

    var MajorWarningList = ["any"];
    var WarningList = ["any"];
    var WatchList = ["any"];
    var YohoList = ["any"];
    data.areas.forEach(function (elm) {
      /*var tsunamiItem = tsunamiElm.find(function (elm2) {
        return elm2.name == elm.name;
      });*/

      if (!elm.cancelled) {
        alertNowTmp = true;
        //var gradeJa;
        switch (elm.grade) {
          case "MajorWarning":
            MajorWarningList.push(["==", "name", elm.name]);
            Tsunami_MajorWarning = true;
            //gradeJa = "大津波警報";
            break;
          case "Warning":
            WarningList.push(["==", "name", elm.name]);
            Tsunami_Warning = true;
            //gradeJa = "津波警報";
            break;
          case "Watch":
            WatchList.push(["==", "name", elm.name]);
            Tsunami_Watch = true;
            //gradeJa = "津波注意報";
            break;
          case "Yoho":
            YohoList.push(["==", "name", elm.name]);
            Tsunami_Yoho = true;
            //gradeJa = "津波予報";
            break;
          default:
            break;
        }

        /*
        if (tsunamiItem && tsunamiItem.item) {
          var firstWave = "";
          var maxWave = "";
          var firstCondition = "";
          if (elm.firstHeight) {
            firstWave = "<div>第１波 予想到達時刻:" + dateEncode(5, elm.firstHeight) + "</div>";
          }
          if (elm.maxHeight) {
            maxWave = "<div>最大波 予想高さ:" + elm.maxHeight + "</div>";
          } else if (elm.grade == "Yoho") {
            maxWave = "<div>予想される津波の高さ:若干の海面変動</div>";
          }
          if (elm.firstHeightCondition) {
            firstCondition = "<div>" + elm.firstHeightCondition + "</div>";
          }
          tsunamiItem.item
            .setStyle({
              stroke: true,
              color: tsunamiColorConv(elm.grade),
              weight: 5,
            })
            .setPopupContent("<h3 style='border-bottom:solid 2px " + tsunamiColorConv(elm.grade) + "'>" + tsunamiItem.feature.properties.name + "</h3><p> " + gradeJa + " 発令中</p>" + firstWave + maxWave + firstCondition);
        }*/
      }
    });

    map.setFilter("tsunami_MajorWarn", MajorWarningList);
    map.setFilter("tsunami_Warn", WarningList);
    map.setFilter("tsunami_Watch", WatchList);
    map.setFilter("tsunami_Yoho", YohoList);

    if (data.revocation) {
      document.getElementById("tsunamiWrap").style.display = "none";
      document.body.classList.remove("TsunamiMode");
      Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
    } else if (!alertNowTmp && tsunamiAlertNow) {
      document.getElementById("tsunamiWrap").style.display = "none";
      document.body.classList.remove("TsunamiMode");
      Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
    }
    tsunamiAlertNow = alertNowTmp;

    document.getElementById("tsunami_MajorWarning").style.display = Tsunami_MajorWarning ? "block" : "none";
    document.getElementById("tsunami_Warning").style.display = Tsunami_Warning ? "block" : "none";
    document.getElementById("tsunami_Watch").style.display = Tsunami_Watch ? "block" : "none";
    document.getElementById("tsunami_Yoho").style.display = Tsunami_Yoho ? "block" : "none";

    if (Tsunami_MajorWarning) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("MajorWarning");
    } else if (Tsunami_Warning) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Warning");
    } else if (Tsunami_Watch) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Watch");
    } else if (Tsunami_Yoho) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Yoho");
    }
  }
}

//津波情報色変換
function tsunamiColorConv(str) {
  var color;
  switch (str) {
    case "MajorWarning":
      color = "rgb(200,0,255)";
      break;
    case "Warning":
      color = "rgb(255,40,0)";
      break;
    case "Watch":
      color = "rgb(250,245,0)";
      break;
    case "Yoho":
      color = "rgb(66, 158, 255)";
      break;
    default:
      color = "#FFF";
      break;
  }
  return color;
}

//線形補完
function linear(x, y) {
  return (x0) => {
    const index = x.reduce((pre, current, i) => (current <= x0 ? i : pre), 0);
    const i = index === x.length - 1 ? x.length - 2 : index;

    return ((y[i + 1] - y[i]) / (x[i + 1] - x[i])) * (x0 - x[i]) + y[i];
  };
}
