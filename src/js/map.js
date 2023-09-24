var map;
var points = {};
var Tsunami_MajorWarning, Tsunami_Warning, Tsunami_Watch, Tsunami_Yoho;

var psWaveList = [];
var tsunamiAlertNow = false;
var inited = false;
var windowLoaded = false;
var TimeTable_JMA2001;
var hinanjoLayers = [];
var hinanjoCheck = document.getElementById("hinanjo");
window.electronAPI.messageSend((event, request) => {
  switch (request.action) {
    case "kmoniUpdate":
      if (!background) kmoniMapUpdate(request.data, "knet");
      break;
    case "SnetUpdate":
      kmoniMapUpdate(request.data, "snet");
      break;
    case "longWaveUpdate":
      document.getElementById("LWaveWrap").style.display = "block";
      document.getElementById("maxKaikyu").textContent = request.data.avrrank;
      document.getElementById("Sva").textContent = request.data.avrval;
      if (Number(request.data.avrrank) > 0) {
        document.getElementById("region_name2").textContent = request.data.avrarea_list.join(" ");
        document.getElementById("region_name2Wrap").style.display = "block";
      } else {
        document.getElementById("region_name2Wrap").style.display = "none";
      }
      break;
    case "longWaveClear":
      document.getElementById("LWaveWrap").style.display = "none";
      break;
    case "EEWAlertUpdate":
      psWaveEntry();
      JMAEstShindoControl(request.data);
      break;
    case "tsunamiUpdate":
      tsunamiDataUpdate(request.data);
      break;
    case "setting":
      init();
      break;
    case "EstShindoUpdate":
      EstShindoUpdate(request);
      break;
    case "Replay":
      psWaveEntry();
      break;
    default:
      break;
  }

  document.getElementById("splash").style.display = "none";
});

window.addEventListener("load", function () {
  windowLoaded = true;
  init();
  psWaveAnm();
  setInterval(function () {
    //時計（ローカル時刻）更新
    if (UTDialogShow && !background) document.getElementById("PC_TIME").textContent = dateEncode(3, new Date());
    document.getElementById("all_UpdateTime").textContent = dateEncode(3, new Date());
  }, 500);
});
function psWaveAnm() {
  if (now_EEW.length > 0) {
    for (elm of now_EEW) {
      psWaveCalc(elm.EventID);
    }
  }
  if (background) {
    setTimeout(psWaveAnm, 1000);
  } else {
    setTimeout(function () {
      requestAnimationFrame(psWaveAnm);
    }, 200);
  }
}

document.getElementById("layerSwitch_close").addEventListener("click", function () {
  document.getElementById("menu_wrap").classList.remove("menu_show");
});
document.getElementById("menu").addEventListener("click", function (e) {
  e.stopPropagation();
});

var mapSelect = document.getElementsByName("mapSelect");
var tilemapActive = false;
mapSelect.forEach(function (elm) {
  elm.addEventListener("change", function () {
    for (let i = 0; i < mapSelect.length - 1; i++) {
      map.setLayoutProperty("tile" + i, "visibility", "none");
    }

    if (this.value) {
      tilemapActive = true;
      map.setLayoutProperty(this.value, "visibility", "visible");
    } else {
      tilemapActive = false;
    }
    if (!tilemapActive && overlayCount == 0) {
      map.setLayoutProperty("basemap_fill", "visibility", "visible");
      map.setLayoutProperty("worldmap_fill", "visibility", "visible");
    } else {
      map.setLayoutProperty("basemap_fill", "visibility", "none");
      map.setLayoutProperty("worldmap_fill", "visibility", "none");
    }
  });
});
var overlayCount = 0;
document.getElementsByName("overlaySelect").forEach(function (elm) {
  elm.addEventListener("change", function () {
    var visibility = this.checked ? "visible" : "none";
    if (this.value == "gsi_vector") {
      ["海岸線", "河川中心線人工水路地下", "河川中心線枯れ川部", "河川中心線", "海岸線堤防等に接する部分破線", "水涯線", "水涯線堤防等に接する部分破線", "水部表記線polygon", "行政区画界線国の所属界", "道路中心線ZL4-10国道", "道路中心線ZL4-10高速", "道路中心線色0", "鉄道中心線0", "鉄道中心線旗竿0", "道路中心線ククリ橋0", "道路中心線色橋0", "建築物0", "鉄道中心線橋0", "鉄道中心線旗竿橋0", "道路中心線色1", "鉄道中心線1", "鉄道中心線旗竿1", "道路中心線ククリ橋1", "道路中心線色橋1", "道路縁", "行政区画界線25000市区町村界", "行政区画界線25000都府県界及び北海道総合振興局・振興局界", "注記シンボル付きソート順100以上", "注記シンボルなし縦ソート順100以上", "注記シンボルなし横ソート順100以上", "注記角度付き線", "注記シンボル付きソート順100未満", "注記シンボルなし縦ソート順100未満", "注記シンボルなし横ソート順100未満"].forEach(function (elm) {
        map.setLayoutProperty(elm, "visibility", visibility);
      });
    } else {
      if (this.checked) {
        overlayCount++;
      } else {
        overlayCount--;
      }

      map.setLayoutProperty(this.value, "visibility", visibility);
    }
    if (!tilemapActive && overlayCount == 0) {
      map.setLayoutProperty("basemap_fill", "visibility", "visible");
      map.setLayoutProperty("worldmap_fill", "visibility", "visible");
    } else {
      map.setLayoutProperty("basemap_fill", "visibility", "none");
      map.setLayoutProperty("worldmap_fill", "visibility", "none");
    }
  });
});
document.getElementById("over2").addEventListener("change", function () {
  document.getElementById("legend1").style.display = this.checked ? "inline-block" : "none";
});
var over3_visiblity = false;
var over4_visiblity = false;
document.getElementById("over3").addEventListener("change", function () {
  over3_visiblity = this.checked;
  document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
});
document.getElementById("over4").addEventListener("change", function () {
  over4_visiblity = this.checked;
  document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
});

//マップ初期化など
var inited = false;

function init() {
  if (!config || !windowLoaded || inited) return;
  inited = true;
  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [138.46, 32.99125],
    zoom: 4,
    attributionControl: true,
    style: {
      version: 8,
      glyphs: "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",
      transition: {
        duration: 0,
        delay: 0,
      },
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
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile3: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 5,
          maxzoom: 14,
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
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 16,
        },
        over1: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 11,
          maxzoom: 18,
        },
        over2: {
          type: "raster",
          tiles: ["https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 12,
        },
        over3: {
          type: "raster",
          tiles: ["https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 12,
        },
        over4: {
          type: "raster",
          tiles: ["https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 11,
        },
        over5: {
          type: "raster",
          tiles: ["https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "気象庁",
          minzoom: 2,
          maxzoom: 11,
        },
        hinanjo: {
          type: "raster",
          tiles: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII="],
          attribution: "国土地理院",
          minzoom: 10,
          maxzoom: 10,
        },
      },
      layers: [
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
          id: "tile3",
          type: "raster",
          source: "tile3",
          layout: { visibility: "none" },
        },
        {
          id: "tile4",
          type: "raster",
          source: "tile4",
          layout: { visibility: "none" },
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
          id: "tsunami_Yoho",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "butt",
          },
          paint: {
            "line-color": config.color.Tsunami.TsunamiYohoColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
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
            "line-cap": "butt",
          },
          paint: {
            "line-color": config.color.Tsunami.TsunamiWatchColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
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
            "line-cap": "butt",
          },
          paint: {
            "line-color": config.color.Tsunami.TsunamiWarningColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
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
            "line-cap": "butt",
          },
          paint: {
            "line-color": config.color.Tsunami.TsunamiMajorWarningColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
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
        { id: "Int0", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["0"].background }, filter: ["==", "name", ""] },
        { id: "Int1", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["1"].background }, filter: ["==", "name", ""] },
        { id: "Int2", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["2"].background }, filter: ["==", "name", ""] },
        { id: "Int3", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["3"].background }, filter: ["==", "name", ""] },
        { id: "Int4", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["4"].background }, filter: ["==", "name", ""] },
        { id: "Int5-", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["5m"].background }, filter: ["==", "name", ""] },
        { id: "Int5+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["5p"].background }, filter: ["==", "name", ""] },
        { id: "Int6-", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["6m"].background }, filter: ["==", "name", ""] },
        { id: "Int6+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["6p"].background }, filter: ["==", "name", ""] },
        { id: "Int7", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["7"].background }, filter: ["==", "name", ""] },
        { id: "Int7+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["7p"].background }, filter: ["==", "name", ""] },
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
        { id: "河川中心線人工水路地下", type: "line", source: "v", "source-layer": "RvrCL", filter: ["==", ["get", "vt_code"], 5322], paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "河川中心線枯れ川部", type: "line", source: "v", "source-layer": "RvrCL", filter: ["==", ["get", "vt_code"], 5302], paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "河川中心線", type: "line", source: "v", "source-layer": "RvrCL", filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]], paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "海岸線堤防等に接する部分破線", type: "line", source: "v", "source-layer": "Cstline", filter: ["==", ["get", "vt_code"], 5103], layout: { "line-cap": "round" }, paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "水涯線", type: "line", source: "v", "source-layer": "WL", paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "水涯線堤防等に接する部分破線", type: "line", source: "v", "source-layer": "WL", filter: ["in", ["get", "vt_code"], ["literal", [5203, 5233]]], layout: { "line-cap": "round" }, paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "水部表記線polygon", type: "fill", source: "v", "source-layer": "WRltLine", filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "rgba(50,83,132,0.2)", "fill-outline-color": "rgba(36,104,203,0.25)" } },
        { id: "行政区画界線国の所属界", maxzoom: 8, type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1221], layout: { "line-cap": "square" }, paint: { "line-color": "#999", "line-width": 1 } },
        { id: "道路中心線ZL4-10国道", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]]], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 3 } },
        { id: "道路中心線ZL4-10高速", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["==", ["get", "vt_rdctg"], "高速自動車国道等"], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 3 } },
        { id: "道路中心線色0", minzoom: 11, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], 17, ["all", ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "鉄道中心線0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線旗竿0", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線ククリ橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]], ["!", ["all", ["in", ["get", "vt_rdctg"], ["literal", ["市区町村道等", "その他", "不明"]]], ["==", ["get", "vt_rnkwidth"], "3m-5.5m未満"]]]], 14, ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "道路中心線色橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "建築物0", type: "fill", source: "v", "source-layer": "BldA", filter: ["==", ["get", "vt_lvorder"], 0], paint: { "fill-color": "rgba(127.5,127.5,127.5,0.15)" } },
        { id: "鉄道中心線橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線旗竿橋0", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["in", ["get", "vt_railstate"], "橋・高架"], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線色1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 4, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線旗竿1", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線ククリ橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]], ["!", ["all", ["in", ["get", "vt_rdctg"], ["literal", ["市区町村道等", "その他", "不明"]]], ["==", ["get", "vt_rnkwidth"], "3m-5.5m未満"]]]], 14, ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "道路中心線色橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "道路縁", minzoom: 17, type: "line", source: "v", "source-layer": "RdEdg", layout: { "line-cap": "square", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "行政区画界線25000市区町村界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1212], layout: { "line-cap": "square" }, paint: { "line-color": "#666666", "line-width": 1 } },
        { id: "行政区画界線25000都府県界及び北海道総合振興局・振興局界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1211], layout: { "line-cap": "round" }, paint: { "line-color": "#999999", "line-width": 1 } },
        // prettier-ignore
        {id: "注記シンボル付きソート順100以上",type: "symbol",source: "v","source-layer": "Anno",filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]]],layout: { "icon-allow-overlap": false, "icon-image": ["step", ["zoom"], ["match", ["get", "vt_code"], [1301, 1302, 1303], "人口50万人未満-500", ""], 6, ["match", ["get", "vt_code"], 1301, "人口100万人以上-500", 1302, "人口50万-100万人未満-500", 1303, "人口50万人未満-500", 6368, "主要な港-500", 6376, "主要な空港-500", 7201, "標高点（測点）", ""], 8, ["match", ["get", "vt_code"], 1401, "都道府県所在地-100", 1402, "市役所・東京都の区役所（都道府県所在都市以外）-20", 1403, "町・村-20", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 2941, "インターチェンジ-20", 2942, "ジャンクション-20", 2945, "スマートインターチェンジ-20", 3221, "灯台-20", 6351, "採鉱地", 6367, "特定重要港-20", 6368, "重要港-20", 6375, "国際空港-20", 6376, "国際空港以外の拠点空港等-20", 7102, "標高点（測点）", 7201, "標高点（測点）", 7221, "火山-20", ""], 11, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3212, "高等学校・中等教育学校", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3243, "病院", 3261, "工場-20", 4102, "風車", 4103, "油井・ガス井", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 6367, "特定重要港-20", 6371, "国際空港-20", 6373, "自衛隊等の飛行場-20", 6375, "国際空港-20", 6381, "自衛隊-20", 7101, "電子基準点", 7102, "三角点", 7201, "標高点（測点）", 8103, "発電所等", ""], 14, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 2901, "国道番号-20", 3201, "官公署", 3202, "裁判所", 3203, "税務署", 3204, "外国公館", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3211, "交番", 3212, "高等学校・中等教育学校", [3213, 3214], "小学校", 3215, "老人ホーム", 3216, "博物館法の登録博物館・博物館相当施設", 3217, "図書館", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3242, "消防署", 3243, "病院", 3244, "保健所", 4101, "煙突", 4102, "風車", 4103, "油井・ガス井", 4104, "記念碑", 4105, "自然災害伝承碑", 6301, "墓地", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6323, "竹林", 6324, "ヤシ科樹林", 6325, "ハイマツ地", 6326, "笹地", 6327, "荒地", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 7101, "電子基準点", 7102, "三角点", 7103, "水準点", 7201, "標高点（測点）", 7711, "水深-20", 8103, "発電所等", 8105, "電波塔", ""]], "icon-size": ["let", "size", ["match", ["get", "vt_code"], [7221, 8103], 0.4, [631, 632, 633, 653, 661, 662, 1301, 1302, 1303, 1401, 1402, 1403, 2903, 2904, 2941, 2942, 2945, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244, 4101, 4102, 4103, 4104, 4105, 6301, 6367, 6368, 6371, 6375, 6376, 6331, 6332, 6342, 6351, 6361, 6362, 6381, 7101, 7102, 7103, 8105], 0.5, [6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 7201], 0.6, 621, 1, 1], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, ["var", "size"]], 8, ["*", 0.75, ["var", "size"]], 11, ["var", "size"], 14, ["var", "size"], 16, ["*", 1.5, ["var", "size"]]]], "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["top", "bottom", "left", "right"], "text-writing-mode": ["horizontal"] },paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 },},
        { id: "注記シンボルなし縦ソート順100以上", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["==", ["get", "vt_arrng"], 2]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["==", ["get", "vt_arrng"], 2]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["==", ["get", "vt_arrng"], 2]]], layout: { "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["vertical"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記シンボルなし横ソート順100以上", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]]], layout: { "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記角度付き線", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "LineString"], ["!", ["in", ["get", "vt_code"], ["literal", [2901, 2903, 2904, 7701]]]]], 16, ["all", ["==", ["geometry-type"], "LineString"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["!", ["in", ["get", "vt_code"], ["literal", [2901, 2903, 2904, 7701]]]]], 17, ["all", ["==", ["geometry-type"], "LineString"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2901, 2903, 2904, 7701]]]]]], layout: { "icon-allow-overlap": false, "symbol-placement": "line-center", "text-pitch-alignment": "viewport", "text-rotation-alignment": "map", "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 521, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, [422, 531], ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["center"], "text-writing-mode": ["horizontal", "vertical"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記シンボル付きソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]]], layout: { "icon-allow-overlap": false, "icon-image": ["step", ["zoom"], ["match", ["get", "vt_code"], [1301, 1302, 1303], "人口50万人未満-500", ""], 6, ["match", ["get", "vt_code"], 1301, "人口100万人以上-500", 1302, "人口50万-100万人未満-500", 1303, "人口50万人未満-500", 6368, "主要な港-500", 6376, "主要な空港-500", 7201, "標高点（測点）", ""], 8, ["match", ["get", "vt_code"], 1401, "都道府県所在地-100", 1402, "市役所・東京都の区役所（都道府県所在都市以外）-20", 1403, "町・村-20", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 2941, "インターチェンジ-20", 2942, "ジャンクション-20", 2945, "スマートインターチェンジ-20", 3221, "灯台-20", 6351, "採鉱地", 6367, "特定重要港-20", 6368, "重要港-20", 6375, "国際空港-20", 6376, "国際空港以外の拠点空港等-20", 7102, "標高点（測点）", 7201, "標高点（測点）", 7221, "火山-20", ""], 11, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3212, "高等学校・中等教育学校", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3243, "病院", 3261, "工場-20", 4102, "風車", 4103, "油井・ガス井", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 6367, "特定重要港-20", 6371, "国際空港-20", 6373, "自衛隊等の飛行場-20", 6375, "国際空港-20", 6381, "自衛隊-20", 7101, "電子基準点", 7102, "三角点", 7201, "標高点（測点）", 8103, "発電所等", ""], 14, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 3201, "官公署", 3202, "裁判所", 3203, "税務署", 3204, "外国公館", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3211, "交番", 3212, "高等学校・中等教育学校", [3213, 3214], "小学校", 3215, "老人ホーム", 3216, "博物館法の登録博物館・博物館相当施設", 3217, "図書館", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3242, "消防署", 3243, "病院", 3244, "保健所", 4101, "煙突", 4102, "風車", 4103, "油井・ガス井", 4104, "記念碑", 4105, "自然災害伝承碑", 6301, "墓地", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6323, "竹林", 6324, "ヤシ科樹林", 6325, "ハイマツ地", 6326, "笹地", 6327, "荒地", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 7101, "電子基準点", 7102, "三角点", 7103, "水準点", 7201, "標高点（測点）", 7711, "水深-20", 8103, "発電所等", 8105, "電波塔", ""]], "icon-size": ["let", "size", ["match", ["get", "vt_code"], [7221, 8103], 0.4, [631, 632, 633, 653, 661, 662, 1301, 1302, 1303, 1401, 1402, 1403, 2903, 2904, 2941, 2942, 2945, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244, 4101, 4102, 4103, 4104, 4105, 6301, 6367, 6368, 6371, 6375, 6376, 6331, 6332, 6342, 6351, 6361, 6362, 6381, 7101, 7102, 7103, 8105], 0.5, [6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 7201], 0.6, 621, 1, 1], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, ["var", "size"]], 8, ["*", 0.75, ["var", "size"]], 11, ["var", "size"], 14, ["var", "size"], 16, ["*", 1.5, ["var", "size"]]]], "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [2941, 2942], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["top", "bottom", "left", "right"], "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 } },
        { id: "注記シンボルなし縦ソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["==", ["get", "vt_arrng"], 2]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["==", ["get", "vt_arrng"], 2]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["==", ["get", "vt_arrng"], 2]]], layout: { "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 521, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["match", ["get", "vt_code"], [343, 352], ["*", 0.9, ["var", "size"]], ["var", "size"]], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, [422, 531], ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [412], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["vertical"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記シンボルなし横ソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]]], layout: { "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 521, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["match", ["get", "vt_code"], [343, 352], ["*", 0.9, ["var", "size"]], ["var", "size"]], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, [422, 531], ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [412], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        {
          id: "hinanjo",
          type: "raster",
          source: "hinanjo",
          layout: { visibility: "none" },
          minzoom: 10,
          maxzoom: 22,
        },
      ],
    },
  });

  map.on("sourcedataloading", (e) => {
    if (e.sourceId == "hinanjo" && hinanjoCheck.checked) {
      if (e.tile != undefined) {
        var ca = e.tile.tileID.canonical;
        console.log("a");
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
          layout: { visibility: hinanjoCheck.checked ? "visible" : "none" },
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
          layout: { visibility: hinanjoCheck.checked ? "visible" : "none" },
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
        hinanjoLayers.push("hinanjo_eq_" + ca.x + ca.y + ca.z, "hinanjo_ts_" + ca.x + ca.y + ca.z);
      }
    }
  });

  hinanjoCheck.addEventListener("change", function () {
    map.setLayoutProperty("hinanjo", "visibility", hinanjoCheck.checked ? "visible" : "none");
    hinanjoLayers.forEach(function (elm) {
      map.setLayoutProperty(elm, "visibility", hinanjoCheck.checked ? "visible" : "none");
    });
  });

  map.on("click", "tsunami_Yoho", tsunamiPopup);
  map.on("click", "tsunami_Watch", tsunamiPopup);
  map.on("click", "tsunami_Warn", tsunamiPopup);
  map.on("click", "tsunami_MajorWarn", tsunamiPopup);

  setInterval(function () {
    map.setPaintProperty("tsunami_Yoho", "line-opacity", 0);
    map.setPaintProperty("tsunami_Watch", "line-opacity", 0);
    map.setPaintProperty("tsunami_Warn", "line-opacity", 0);
    map.setPaintProperty("tsunami_MajorWarn", "line-opacity", 0);
    setTimeout(function () {
      map.setPaintProperty("tsunami_Yoho", "line-opacity", 1);
      map.setPaintProperty("tsunami_Watch", "line-opacity", 1);
      map.setPaintProperty("tsunami_Warn", "line-opacity", 1);
      map.setPaintProperty("tsunami_MajorWarn", "line-opacity", 1);
    }, 300);
  }, 2500);

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  var layerButton = document.createElement("button");
  layerButton.innerText = "layers";
  layerButton.title = "レイヤーの切り替え";
  layerButton.setAttribute("id", "layerSwitch_toggle");
  layerButton.addEventListener("click", function () {
    document.getElementById("menu_wrap").classList.toggle("menu_show");
  });

  var TLControlWrapper = document.createElement("div");
  TLControlWrapper.className = "maplibregl-ctrl maplibregl-ctrl-group transparent-ctrl";
  TLControlWrapper.appendChild(layerButton);
  map.addControl(
    {
      onAdd: function () {
        return TLControlWrapper;
      },
      onRemove: function () {},
    },
    "top-left"
  );

  var zoomLevelContinue = function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 4.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_1");
    } else if (currentZoom < 6) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_2");
    } else if (currentZoom < 8) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_3");
    } else {
      document.getElementById("mapcontainer").classList.add("zoomLevel_4");
    }
    if (currentZoom > 11) {
      document.getElementById("mapcontainer").classList.add("popup_show");
    }
  };
  zoomLevelContinue();
  map.on("zoom", zoomLevelContinue);
  map.on("load", function () {
    window.electronAPI.messageReturn({
      action: "tsunamiReqest",
    });
    zoomLevelContinue();
    JMAEstShindoDraw();
  });

  if (config.home.ShowPin) {
    const img = document.createElement("img");
    img.src = "./img/homePin.svg";
    img.classList.add("homeIcon");

    new maplibregl.Marker(img).setLngLat([config.home.longitude, config.home.latitude]).addTo(map);
  }
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
  el.classList.add("marker-circle", "KmoniPoint_" + codeEscaped);
  if (elm.Type == "S-net") el.classList.add("marker-circle-S-net");
  elm.popupContent = "";
  elm.popup = new maplibregl.Popup({ offset: 10 }).on("open", () => {
    elm.popup.setHTML(elm.popupContent);
  });
  elm.marker = new maplibregl.Marker(el).setLngLat([elm.Location.Longitude, elm.Location.Latitude]).setPopup(elm.popup).addTo(map);
  elm.markerElm = el;
  return elm;
}
//観測点情報更新
var pointData;
var changed_bypass = false;
function kmoniMapUpdate(dataTmp, type) {
  if (!dataTmp.data) return;
  if (type == "knet") {
    kmoniMapData = dataTmp.data;
  }
  //地図上マーカー
  if (becomeForeground || now_EEW.length !== 0 || Object.keys(points).length == 0) {
    changed_bypass = true;
    becomeForeground = false;
  } else {
    changed_bypass = false;
  }

  if (changed_bypass) {
    dataTmp = dataTmp.data;
  } else {
    dataTmp = dataTmp.changedData;
  }
  for (elm of dataTmp) {
    pointData = points[elm.Code];

    if (elm.data) {
      if (!pointData) pointData = points[elm.Code] = addPointMarker(elm);

      pointData.markerElm.style.background = "rgb(" + elm.rgb.join(",") + ")";

      if (elm.detect) {
        pointData.markerElm.classList.add("detectingMarker");
        if (elm.detect2) pointData.markerElm.classList.add("strongDetectingMarker");
      } else {
        pointData.markerElm.classList.remove("strongDetectingMarker", "detectingMarker");
      }

      pointData.popupContent = "<h3 class='PointName' style='border-bottom-color:rgb(" + elm.rgb.join(",") + ")'>" + (elm.Name ? elm.Name : "") + "<span>" + elm.Type + "_" + elm.Code + "</span></h3>" + (elm.detect ? "<h4 class='detecting'>地震検知中</h4>" : "");
      if (pointData.popup.isOpen()) pointData.popup.setHTML(pointData.popupContent);
    } else if (pointData) {
      pointData.markerElm.style.background = "rgba(128,128,128,0.5)";
      pointData.markerElm.classList.remove("strongDetectingMarker", "detectingMarker");

      pointData.popupContent = "<h3 class='PointName' style='border-bottom:solid 2px rgba(128,128,128,0.5)'>" + (elm.Name ? elm.Name : "") + "<span>" + elm.Type + "_" + elm.Code + "</span></h3>";
      if (pointData.popup.isOpen()) pointData.popup.setHTML(pointData.popupContent);
    }
  }
}

//予想震度更新
function EstShindoUpdate(req) {
  if (map.getSource("kmoni-estShindo1" + req.eid)) {
    map.getSource("kmoni-estShindo1" + req.eid).updateImage({
      url: req.data[0],
    });
    map.getSource("kmoni-estShindo2" + req.eid).updateImage({
      url: req.data[1],
    });
    map.getSource("kmoni-estShindo3" + req.eid).updateImage({
      url: req.data[2],
    });
    map.getSource("kmoni-estShindo4" + req.eid).updateImage({
      url: req.data[3],
    });
    map.getSource("kmoni-estShindo5" + req.eid).updateImage({
      url: req.data[4],
    });
  } else {
    i1 = [req.data[4], req.eid];
    map.addSource("kmoni-estShindo1" + req.eid, {
      type: "image",
      url: req.data.a,
      coordinates: [
        [129, 46],
        [145.8, 46.2],
        [145.8, 42.2],
        [128.8, 42.5],
      ],
    });
    map.addLayer(
      {
        id: "kmoni-estShindo1" + req.eid,
        type: "raster",
        source: "kmoni-estShindo1" + req.eid,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
    map.addSource("kmoni-estShindo2" + req.eid, {
      type: "image",
      url: req.data.b,
      coordinates: [
        [128.8, 42.5],
        [145.8, 42.2],
        [145.75, 38.1],
        [128.75, 38.2],
      ],
    });
    map.addLayer(
      {
        id: "kmoni-estShindo2" + req.eid,
        type: "raster",
        source: "kmoni-estShindo2" + req.eid,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
    map.addSource("kmoni-estShindo3" + req.eid, {
      type: "image",
      url: req.data.c,
      coordinates: [
        [128.75, 38.2],
        [145.75, 38.1],
        [146, 34.1],
        [128.6, 34.1],
      ],
    });
    map.addLayer(
      {
        id: "kmoni-estShindo3" + req.eid,
        type: "raster",
        source: "kmoni-estShindo3" + req.eid,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
    map.addSource("kmoni-estShindo4" + req.eid, {
      type: "image",
      url: req.data.d,
      coordinates: [
        [128.6, 34.1],
        [146, 34.1],
        [145.5, 30],
        [128.55, 30],
      ],
    });
    map.addLayer(
      {
        id: "kmoni-estShindo4" + req.eid,
        type: "raster",
        source: "kmoni-estShindo4" + req.eid,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
    map.addSource("kmoni-estShindo5" + req.eid, {
      type: "image",
      url: req.data.e,
      coordinates: [
        [122.5, 32],
        [131.2, 31.8],
        [131, 23.9],
        [122.45, 23.9],
      ],
    });
    map.addLayer(
      {
        id: "kmoni-estShindo5" + req.eid,
        type: "raster",
        source: "kmoni-estShindo5" + req.eid,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
  }
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
var Int7pT = ["any"];

function JMAEstShindoControl(data) {
  JMAEstShindoData = {};
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
  Int7pT = ["any"];

  data.forEach(function (elm) {
    elm.warnZones.forEach(function (elm2) {
      JMAEstShindoData[elm2.Name] = elm2;
    });
  });

  Object.keys(JMAEstShindoData).forEach(function (elm) {
    var sectData = JMAEstShindoData[elm];
    IntData = config.Info.EEW.IntType == "max" ? sectData.IntTo : sectData.IntFrom;
    switch (IntData) {
      case "0":
        Int0T.push(["==", "name", elm]);
        break;
      case "1":
        Int1T.push(["==", "name", elm]);
        break;
      case "2":
        Int2T.push(["==", "name", elm]);
        break;
      case "3":
        Int3T.push(["==", "name", elm]);
        break;
      case "4":
        Int4T.push(["==", "name", elm]);
        break;
      case "5-":
        Int5mT.push(["==", "name", elm]);
        break;
      case "5+":
        Int5pT.push(["==", "name", elm]);
        break;
      case "6-":
        Int6mT.push(["==", "name", elm]);
        break;
      case "6+":
        Int6pT.push(["==", "name", elm]);
        break;
      case "7":
        Int7T.push(["==", "name", elm]);
        break;
      case "7+":
        Int7pT.push(["==", "name", elm]);
        break;
      default:
        break;
    }
  });
  JMAEstShindoDraw();
}

function JMAEstShindoDraw() {
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
      var countDownElm = document.getElementById("EEW-" + elm.EventID);
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

    if (!elm.is_cancel && elm.origin_time && elm.depth && elm.latitude && elm.longitude && elm.depth <= 700 && TimeTable_JMA2001) {
      var TimeTableTmp = TimeTable_JMA2001[depthFilter(elm.depth)];
      var pswaveFind = psWaveList.find(function (elm2) {
        return elm2.id == elm.EventID;
      });

      if (pswaveFind) {
        pswaveFind.data.longitude = elm.longitude;
        pswaveFind.data.latitude = elm.latitude;
        pswaveFind.TimeTable = TimeTableTmp;
      } else {
        psWaveList.push({
          id: elm.EventID,
          PCircleElm: null,
          SCircleElm: null,
          data: { latitude: elm.latitude, longitude: elm.longitude, originTime: elm.origin_time },
          TimeTable: TimeTableTmp,
        });
      }
      psWaveCalc(elm.EventID);
    }
  });

  //終わった地震の予報円削除 予想震度画像削除
  psWaveList = psWaveList.filter(function (elm) {
    var stillEEW = now_EEW.find(function (elm2) {
      return elm2.EventID == elm.id;
    });
    if (!stillEEW || stillEEW.is_cancel) {
      if (elm.PCircleElm) {
        map.setLayoutProperty("PCircle_" + elm.id, "visibility", "none");
        map.setLayoutProperty("SCircle_" + elm.id, "visibility", "none");
        map.setLayoutProperty("SCircle_" + elm.id + "_FILL", "visibility", "none");
        if (map.getLayer("kmoni-estShindo1" + elm.id)) {
          map.removeLayer("kmoni-estShindo1" + elm.id);
          map.removeLayer("kmoni-estShindo2" + elm.id);
          map.removeLayer("kmoni-estShindo3" + elm.id);
          map.removeLayer("kmoni-estShindo4" + elm.id);
          map.removeLayer("kmoni-estShindo5" + elm.id);
        }
        if (map.getSource("kmoni-estShindo1" + elm.id)) {
          map.removeSource("kmoni-estShindo1" + elm.id);
          map.removeSource("kmoni-estShindo2" + elm.id);
          map.removeSource("kmoni-estShindo3" + elm.id);
          map.removeSource("kmoni-estShindo4" + elm.id);
          map.removeSource("kmoni-estShindo5" + elm.id);
        }
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
    var distance = (new Date() - Replay - pswaveFind.data.originTime) / 1000;

    var PRadius = null;
    var SRadius = null;

    var i = 0;
    for (const elm of TimeTableTmp) {
      if (i == 0) {
        SWmin = elm.S;
      }
      if (!PRadius) {
        if (elm.P == distance) {
          PRadius = elm.R;
          if (SRadius || SWmin > distance) break;
        } else if (elm.P > distance) {
          elm2 = TimeTableTmp[i - 1];
          PRadius = elm.R + ((elm2.R - elm.R) * (distance - elm.P)) / (elm2.P - elm.P);
          psWaveList;
          if (SRadius || SWmin > distance) break;
        }
      }
      if (!SRadius && SWmin < distance) {
        if (elm.S == distance) {
          SRadius = elm.R;
          if (PRadius) break;
        } else if (elm.S > distance) {
          elm2 = TimeTableTmp[i - 1];
          SRadius = elm.R + ((elm2.R - elm.R) * (distance - elm.S)) / (elm2.S - elm.S);
          if (PRadius) break;
        }
      }
      i++;
    }
    if (SWmin > distance) {
      window.requestAnimationFrame(function () {
        psWaveReDraw(
          pswaveFind.id,
          pswaveFind.data.latitude,
          pswaveFind.data.longitude,
          PRadius * 1000,
          0,
          true, //S波未到達
          SWmin, //発生からの到達時間
          distance //現在の経過時間
        );
      });
    } else {
      window.requestAnimationFrame(function () {
        psWaveReDraw(pswaveFind.id, pswaveFind.data.latitude, pswaveFind.data.longitude, PRadius * 1000, SRadius * 1000);
      });
    }
  }
}

let circle_options = {
  steps: 80,
  units: "kilometers",
};
//予報円描画
function psWaveReDraw(EventID, latitude, longitude, pRadius, sRadius, SnotArrived, SArriveTime, nowDistance) {
  var EQElm = psWaveList.find(function (elm) {
    return elm.id == EventID;
  });
  var EQElm2 = now_EEW.find(function (elm) {
    return elm.EventID == EventID;
  });
  if (EQElm) {
    let _center = turf.point([longitude, latitude]);

    if (EQElm.PCircleElm) {
      if (pRadius) {
        var pcircle = turf.circle(_center, pRadius / 1000, circle_options);
        map.getSource("PCircle_" + EventID).setData(pcircle);
      }
      if (sRadius) {
        var scircle = turf.circle(_center, sRadius / 1000, circle_options);
        map.getSource("SCircle_" + EventID).setData(scircle);
        map.setPaintProperty("SCircle_" + EventID, "line-width", SnotArrived ? 0 : 2);
      }
    } else {
      map.addSource("PCircle_" + EventID, {
        type: "geojson",
        data: turf.circle(_center, pRadius / 1000, circle_options),
      });

      map.addLayer({
        id: "PCircle_" + EventID,
        type: "line",
        source: "PCircle_" + EventID,
        paint: {
          "line-color": config.color.psWave.PwaveColor,
          "line-width": 2,
        },
      });

      sRadTmp = sRadius ? sRadius / 1000 : 0;
      map.addSource("SCircle_" + EventID, {
        type: "geojson",
        data: turf.circle(_center, sRadTmp, circle_options),
      });

      map.addLayer({
        id: "SCircle_" + EventID,
        type: "line",
        source: "SCircle_" + EventID,
        paint: {
          "line-color": config.color.psWave.SwaveColor,
          "line-width": 2,
        },
      });
      map.addLayer({
        id: "SCircle_" + EventID + "_FILL",
        type: "fill",
        source: "SCircle_" + EventID,
        paint: {
          "fill-color": config.color.psWave.SwaveColor,
          "fill-opacity": 0.15,
        },
      });

      EQElm.PCircleElm = true;
      EQElm.SCircleElm = true;
      EQElm = psWaveList[psWaveList.length - 1];

      psWaveCalc(EventID);
    }

    if (EQElm.SIElm) {
      if (SnotArrived) {
        var SWprogressValue = document.getElementById("SWprogressValue_" + EventID);
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
      el.innerHTML = '<svg width="50" height="50"><circle cx="25" cy="25" r="22" fill="none" stroke-width="5px" stroke="#777"/><circle id="SWprogressValue_' + EventID + '" class="SWprogressValue" cx="25" cy="25" r="22" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="138" stroke-dashoffset="' + Number(138 - 138 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '"/></svg>';

      SIElm = new maplibregl.Marker(el).setLngLat([longitude, latitude]).addTo(map);

      EQElm.SIElm = SIElm;
    }
  }

  var EEWPanelElm = document.getElementById("EEW-" + EventID);

  if (EQElm2 && EQElm2.distance && EEWPanelElm) {
    EEWPanelElm.querySelector(".PWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(pRadius / 1000 / EQElm2.distance, 1));
    EEWPanelElm.querySelector(".SWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(sRadius / 1000 / EQElm2.distance, 1));

    var countDownElm = EEWPanelElm.querySelector(".countDown");
    if (EQElm2.arrivalTime) {
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
        countDownElm.textContent = "到達";
      }
      EEWPanelElm.querySelector(".arrived").style.display = "none";
      countDownElm.style.display = "block";
    } else {
      EEWPanelElm.querySelector(".arrived").textContent = sRadius / 1000 >= EQElm2.distance ? "到達" : "未到達";
      EEWPanelElm.querySelector(".arrived").style.display = "block";
      countDownElm.style.display = "none";
    }
  }
}

//🔴津波情報🔴
//津波情報更新
var EQInfoLink = document.getElementById("EQInfoLink");
var tsunamiData;
function tsunamiDataUpdate(data) {
  tsunamiData = data;
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
    EQInfoLink.style.display = "none";
    if (data.issue.EventID) {
      var EQdata = eqInfoDataJMA.find(function (elm) {
        return elm.eventId == data.issue.EventID;
      });
      if (EQdata) {
        EQInfoLink.style.display = "inline-block";
        EQInfoLink.dataset.eventid = "#EQItem_" + data.issue.EventID;
      }
    }
    if (config.home.TsunamiSect) {
      var sectData = data.areas.find(function (elm) {
        return elm.name == config.home.TsunamiSect;
      });
      if (sectData) {
        switch (sectData.grade) {
          case "MajorWarning":
            gradeJa = "大津波警報";
            break;
          case "Warning":
            gradeJa = "津波警報";
            break;
          case "Watch":
            gradeJa = "津波注意報";
            break;
          case "Yoho":
            gradeJa = "津波予報";
            break;
          default:
            gradeJa = "";
            break;
        }

        var firstWave = "";
        var maxWave = "";
        if (sectData.firstHeight) {
          firstWave = "第1波予想<span>" + dateEncode(5, sectData.firstHeight) + "</span>";
        } else {
          switch (sectData.firstHeightCondition) {
            case "津波到達中と推測":
              firstWave = "第1波予想<span>到達中</span>";
              break;
            case "第１波の到達を確認":
              firstWave = "第1波<span>到達</span>";
              break;
            default:
              break;
          }
        }
        if (sectData.maxHeight) {
          maxWave = " 最大波<span>" + sectData.maxHeight + "</span>";
        } else if (sectData.grade == "Yoho") {
          maxWave = " 若干の海面変動";
        }

        document.getElementById("tsunamiSectTitle").innerText = sectData.name + " " + gradeJa;
        document.getElementById("firstHeightData").innerHTML = firstWave;
        document.getElementById("maxHeightData").innerHTML = maxWave;
        document.getElementById("firstHeightCondition").style.display = sectData.firstHeightCondition == "ただちに津波来襲と予測" ? "block" : "none";

        document.getElementById("TsunamiMySectData").style.border = "solid 1px " + tsunamiColorConv(sectData.grade);
        document.getElementById("TsunamiMySectData").style.display = "block";
      } else {
        document.getElementById("TsunamiMySectData").style.display = "none";
      }
    }
    document.getElementById("tsunamiWrap").style.display = "block";

    document.body.classList.add("TsunamiMode");
    var alertNowTmp = false;

    var MajorWarningList = ["any"];
    var WarningList = ["any"];
    var WatchList = ["any"];
    var YohoList = ["any"];
    data.areas.forEach(function (elm) {
      if (!elm.cancelled) {
        alertNowTmp = true;
        switch (elm.grade) {
          case "MajorWarning":
            MajorWarningList.push(["==", "name", elm.name]);
            Tsunami_MajorWarning = true;
            break;
          case "Warning":
            WarningList.push(["==", "name", elm.name]);
            Tsunami_Warning = true;
            break;
          case "Watch":
            WatchList.push(["==", "name", elm.name]);
            Tsunami_Watch = true;
            break;
          case "Yoho":
            YohoList.push(["==", "name", elm.name]);
            Tsunami_Yoho = true;
            break;
          default:
            break;
        }
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

    document.getElementById("tsunami_MajorWarning").style.display = Tsunami_MajorWarning ? "inline-block" : "none";
    document.getElementById("tsunami_Warning").style.display = Tsunami_Warning ? "inline-block" : "none";
    document.getElementById("tsunami_Watch").style.display = Tsunami_Watch ? "inline-block" : "none";
    document.getElementById("tsunami_Yoho").style.display = Tsunami_Yoho ? "inline-block" : "none";

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
EQInfoLink.addEventListener("click", function (e) {
  e.preventDefault();
  var EQItemElm = document.querySelector(EQInfoLink.dataset.eventid);
  if (EQItemElm) {
    EQItemElm.scrollIntoView({
      block: "center",
    });
    EQItemElm.animate(
      {
        boxShadow: ["0 0 0 0 rgba(203, 27, 27, 1)", "0 0 0 15px rgba(203, 27, 27, 0)"],
      },
      500
    );
  }
});

//津波情報色変換
function tsunamiColorConv(str) {
  var color;
  switch (str) {
    case "MajorWarning":
      color = config.color.Tsunami.TsunamiMajorWarningColor;
      break;
    case "Warning":
      color = config.color.Tsunami.TsunamiWarningColor;
      break;
    case "Watch":
      color = config.color.Tsunami.TsunamiWatchColor;
      break;
    case "Yoho":
      color = config.color.Tsunami.TsunamiYohoColor;
      break;
    default:
      color = "transparent";
      break;
  }
  return color;
}

function depthFilter(depth) {
  if (!isFinite(depth) || depth < 0) {
    return 0;
  } else if (depth > 700) {
    return 700;
  } else if (200 <= depth) {
    return Math.floor(depth / 10) * 10;
  } else if (50 <= depth) {
    return Math.floor(depth / 5) * 5;
  } else {
    return Math.floor(depth / 2) * 2;
  }
}

function tsunamiPopup(e) {
  if (tsunamiData.areas) {
    elm = tsunamiData.areas.find(function (elm) {
      return elm.name == e.features[0].properties.name;
    });
    if (elm) {
      if (!elm.cancelled) {
        switch (elm.grade) {
          case "MajorWarning":
            gradeJa = "大津波警報";
            break;
          case "Warning":
            gradeJa = "津波警報";
            break;
          case "Watch":
            gradeJa = "津波注意報";
            break;
          case "Yoho":
            gradeJa = "津波予報";
            break;
          default:
            break;
        }

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
        var popupContent = "<h3 style='border-bottom:solid 2px " + tsunamiColorConv(elm.grade) + "'>" + elm.name + "</h3><p> " + gradeJa + " 発令中</p>" + firstWave + maxWave + firstCondition;
        new maplibregl.Popup().setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
      }
    }
  }
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
    .setHTML("<h3>指定緊急避難場所</h3><p>" + DataTmp.name + "</p>対応：" + supportType + (DataTmp.remarks ? "<div>" + DataTmp.remarks + "</div>" : ""))
    .addTo(map);
}
