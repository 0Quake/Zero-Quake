/* global NormalizeDate maplibregl turf pmtiles SetShindoColor*/
var map;
var config;
var markerElm;
var Replay;
var openAtLogin = false;
var tsunamiSect;
var EQSect;
var defaultConfigVal;
window.addEventListener("load", function () {
  this.document.getElementById("replay").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
  this.document.getElementById("EEWE_EventID").value = NormalizeDate(1, new Date()).replaceAll("/", "-");
  this.document.getElementById("EEWE_report_time").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
  this.document.getElementById("EEWE_origin_time").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
});

var confirm_edit = false;
document.querySelectorAll("input,select,textarea").forEach(function (el) {
  el.addEventListener("input", function () {
    confirm_edit = true;
  });
});
window.addEventListener("beforeunload", function (e) {
  if (confirm_edit) e.preventDefault();
});

var origin_time_edited = false;
document
  .getElementById("EEWE_origin_time")
  .addEventListener("input", function () {
    origin_time_edited = true;
  });

document.getElementById("tab1_menu13").addEventListener("click", function () {
  //シミュレーションタブを開いたとき、発生時刻が未編集なら現在時刻を設定
  if (!origin_time_edited)
    document.getElementById("EEWE_origin_time").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
});

window.electronAPI.messageSend((event, request) => {
  if (request.action == "Replay") {
    Replay = request.data;
    offsetCalc();
  } else if (request.action == "initialData") {
    document.getElementById("splash").style.display = "none";
    document.getElementById("softVersion").innerText = request.softVersion;
    openAtLogin = request.openAtLogin;
    document.getElementById("startup").checked = openAtLogin;
    if (request.updatePanelMode) {
      document
        .querySelector(".active_tabcontent")
        .classList.remove("active_tabcontent");
      document
        .querySelector(".active_tabmenu")
        .classList.remove("active_tabmenu");
      document
        .getElementById("tab1_content2")
        .classList.add("active_tabcontent");
      document.getElementById("tab1_menu2").classList.add("active_tabmenu");
    }

    config = request.config;
    defaultConfigVal = request.defaultConfigVal;

    configDataDraw();
    mapInit();
    SetShindoColor();
  } else if (request.action == "Update_Data") UpdateDataDraw(request.data);
});

var updateWrap = document.getElementById("update-wrap");
var updateStatus = document.getElementById("update-status");
var updateVersion = document.getElementById("update-version");
var updateBtnWrap = document.getElementById("update_BtnWrap");
var downloadLink = document.getElementById("downloadLink");
var update_detail = document.getElementById("update-detail");
downloadLink.addEventListener("click", function () {
  var lnk = document.createElement("a");
  lnk.href =
    "https://0quake.github.io/ZeroQuake_Website/download.html#download-section";
  lnk.click();
});

function prop(objGetter, key) {
  return {
    get: function () {
      return objGetter()?.[key];
    },
    set: function (v) {
      var obj = objGetter();
      if (obj) obj[key] = v;
    }
  };
}

function getElement(el) {
  return typeof el === "string" ? document.getElementById(el) : el;
}

function applyConfigToUI(pair) {
  var el = getElement(pair.element);
  if (!el || !pair.target || typeof pair.target.get !== "function") return;

  var val = pair.target.get();
  if (typeof pair.loadFunc === "function") {
    val = pair.loadFunc(val);
  }

  if (el.type === "checkbox") {
    el.checked = Boolean(val);
  } else if (el.tagName === "SELECT") {
    selectBoxSet(el, val);
  } else {
    el.value = (val !== undefined && val !== null) ? val : "";
  }
}

function applyUIToConfig(pair) {
  var el = getElement(pair.element);
  if (!el || !pair.target || typeof pair.target.set !== "function") return;

  var val;
  if (el.type === "checkbox") {
    val = el.checked;
  } else {
    val = el.value;
  }

  if (typeof pair.saveFunc === "function") {
    val = pair.saveFunc(val);
  }

  pair.target.set(val);
}

var pairs = [
  // 拠点設定
  { target: prop(() => config.home, "arv"), element: document.getElementById("arv"), saveFunc: Number },
  { target: prop(() => config.home, "name"), element: document.getElementById("HomeName") },
  { target: prop(() => config.home, "latitude"), element: document.getElementById("latitude") },
  { target: prop(() => config.home, "longitude"), element: document.getElementById("longitude") },
  { target: prop(() => config.home, "ShowPin"), element: document.getElementById("HomePinShow") },
  { target: prop(() => config.home, "Section"), element: document.getElementById("saibun") },
  { target: prop(() => config.home, "TsunamiSect"), element: document.getElementById("tsunamiSect") },

  // EEW 設定
  { target: prop(() => config.Info.EEW, "IntType"), element: document.getElementById("intType") },
  { target: prop(() => config.Info.EEW, "showtraining"), element: document.getElementById("EEW_training") },
  { target: prop(() => config.Info.EEW, "IntQuestion"), element: document.getElementById("EEW_IntQ") },
  { target: prop(() => config.Info.EEW, "IntTerm1"), element: document.getElementById("EEW_IntI") },
  { target: prop(() => config.Info.EEW, "userIntQuestion"), element: document.getElementById("EEW_userIntQ") },
  { target: prop(() => config.Info.EEW, "kodoriyou"), element: document.getElementById("EEW_kodoriyou") },
  { target: prop(() => config.Info.EEW, "IntThreshold"), element: document.getElementById("EEW_IntFilter") },
  { target: prop(() => config.Info.EEW, "userIntThreshold"), element: document.getElementById("EEW_userIntFilter") },
  { target: prop(() => config.notice.window, "EEW"), element: document.getElementById("EEW_Window") },
  { target: prop(() => config.notice.window, "EEW_Update"), element: document.getElementById("EEW_Window_Update") },

  // 音声文言
  { target: prop(() => config.notice.voice, "EEW"), element: document.getElementById("EEW_Voice") },
  { target: prop(() => config.notice.voice, "EEWUpdate"), element: document.getElementById("EEW2_Voice") },
  { target: prop(() => config.notice.voice, "EEWCancel"), element: document.getElementById("EEW3_Voice") },
  { target: prop(() => config.notice.voice, "Tsunami"), element: document.getElementById("Tsunami_Voice") },
  { target: prop(() => config.notice.voice, "TsunamiRevocation"), element: document.getElementById("Tsunami_Voice2") },
  { target: prop(() => config.notice.voice, "TsunamiTorikeshi"), element: document.getElementById("Tsunami_Voice3") },
  { target: prop(() => config.notice.voice, "EQInfo"), element: document.getElementById("EQInfo_Voice1") },
  { target: prop(() => config.notice.voice, "EQInfoCancel"), element: document.getElementById("EQInfo_Voice2") },

  // 潮位
  { target: prop(() => config.Info.TideHeight, "processing"), element: document.getElementById("tide_processing") },

  // 地震検知・システム
  { target: prop(() => config.Info.RealTimeShake, "DetectEarthquake"), element: document.getElementById("EarthquakeDetect") },
  { target: prop(() => config.Info.RealTimeShake, "noticeLv"), element: document.getElementById("EQDetect_threshold") },
  { target: prop(() => config.system, "WindowAutoOpen"), element: document.getElementById("WindowAutoOpen") },
  { target: prop(() => config.system, "alwaysOnTop"), element: document.getElementById("alwaysOnTop") },
  { target: prop(() => config.system, "powerSaveBlocking"), element: document.getElementById("powerSaveBlocking") },
  { target: prop(() => config.system, "zoom"), element: document.getElementById("zoom"), loadFunc: (v) => 100 * v, saveFunc: (v) => Number(v) / 100 },

  // 津波
  { target: prop(() => config.Info.TsunamiInfo, "GetData"), element: document.getElementById("Tsunami_GetData") },
  { target: prop(() => config.Info.TsunamiInfo, "showTest"), element: document.getElementById("Tsunami_Test") },
  { target: prop(() => config.Info.TsunamiInfo, "showtraining"), element: document.getElementById("Tsunami_training") },
  { target: prop(() => config.Info.TsunamiInfo, "NotificationSound"), element: document.getElementById("Tsunami_NotificationSound") },
  { target: prop(() => config.Info.TsunamiInfo, "Global_threshold"), element: document.getElementById("Tsunami_threshold") },
  { target: prop(() => config.Info.TsunamiInfo, "Local_threshold"), element: document.getElementById("Tsunami_L_threshold") },
  { target: prop(() => config.Info.TsunamiInfo, "Bypass_threshold"), element: document.getElementById("Tsunami_Bypass_threshold") },

  // 地震情報
  { target: prop(() => config.Info.EQInfo, "showTest"), element: document.getElementById("EQInfo_Test") },
  { target: prop(() => config.Info.EQInfo, "showtraining"), element: document.getElementById("EQInfo_training") },
  { target: prop(() => config.Info.EQInfo, "NotificationSound"), element: document.getElementById("NotificationSound") },
  { target: prop(() => config.Info.EQInfo, "maxI_threshold"), element: document.getElementById("maxI_threshold") },
  { target: prop(() => config.Info.EQInfo, "M_threshold"), element: document.getElementById("M_threshold") },
  { target: prop(() => config.Info.EQInfo, "Bypass_threshold"), element: document.getElementById("Bypass_threshold") },

  // データソース
  { target: prop(() => config.Source.axis, "GetData"), element: document.getElementById("Axis_GetData") },
  { target: prop(() => config.Source.axis, "AccessToken"), element: document.getElementById("Axis_AccessToken") },
  { target: prop(() => config.Source.wolfx, "GetData"), element: document.getElementById("Wolfx_GetData") },
  { target: prop(() => config.Source.wolfx, "GetDataFromSeisJS"), element: document.getElementById("Wolfx_SeisJS_GetData") },
  { target: prop(() => config.Source.ProjectBS, "GetData"), element: document.getElementById("ProjectBS_GetData") },
  { target: prop(() => config.Source.EarlyEst, "GetData"), element: document.getElementById("EarlyEst_GetData") },
  { target: prop(() => config.Source.msil, "GetData"), element: document.getElementById("msil_GetData") },
  { target: prop(() => config.Source.kmoni.kmoni, "GetData"), element: document.getElementById("kmoni_GetData") },
  { target: prop(() => config.Source.TREMRTS, "GetData"), element: document.getElementById("TREM-RTS_GetData") },

  // インターバル（秒 ⇄ ミリ秒）
  { target: prop(() => config.Info.EQInfo, "Interval"), element: document.getElementById("EQInfoInterval"), loadFunc: (v) => v / 1000, saveFunc: (v) => Number(v) * 1000 },
  { target: prop(() => config.Source.EarlyEst, "Interval"), element: document.getElementById("EarlyEstInterval"), loadFunc: (v) => v / 1000, saveFunc: (v) => Number(v) * 1000 },
  { target: prop(() => config.Source.kmoni.kmoni, "Interval"), element: document.getElementById("kmoniInterval"), loadFunc: (v) => v / 1000, saveFunc: (v) => Number(v) * 1000 },
  { target: prop(() => config.Source.msil, "Interval"), element: document.getElementById("msilInterval"), loadFunc: (v) => v / 1000, saveFunc: (v) => Number(v) * 1000 },
  { target: prop(() => config.Source.TREMRTS, "Interval"), element: document.getElementById("TREM-RTS_Interval"), loadFunc: (v) => v / 1000, saveFunc: (v) => Number(v) * 1000 },

  // 棒読みちゃん & 配色
  { target: prop(() => config.notice.voice_parameter, "Boyomi_Port"), element: document.getElementById("Boyomi_Port"), saveFunc: (v) => Math.floor(Number(v)) },
  { target: prop(() => config.notice.voice_parameter, "Boyomi_Voice"), element: document.getElementById("BoyomiVoiceSelect") },
  { target: prop(() => config.color, "IntColorTheme"), element: document.getElementById("shindoColor") },
];

function configDataDraw() {
  pairs.forEach(applyConfigToUI);

  var iBounds = config.home.initialBounds;
  document.getElementById("b_NELat").value = iBounds[1][1];
  document.getElementById("b_NELng").value = iBounds[1][0];
  document.getElementById("b_SWLat").value = iBounds[0][1];
  document.getElementById("b_SWLng").value = iBounds[0][0];

  tsunamiSect = config.home.TsunamiSect;
  EQSect = config.home.Section;
  if (map) {
    map.setFilter("tsunami_LINE_selected", ["==", "name", tsunamiSect]);
    map.setFilter("tsunami_LINE_selected_2", ["==", "name", tsunamiSect]);
    map.setFilter("selected_sect", ["==", "name", EQSect]);
  }

  TTSvolumeSet(config.notice.voice_parameter.volume);
  TTSpitchSet(config.notice.voice_parameter.pitch);
  TTSspeedSet(config.notice.voice_parameter.rate);
  volumeSet(config.notice.bell_volume, true);

  selectBoxSet(document.getElementById("TTSvoiceSelect"), config.notice.voice_parameter.voice);

  document.getElementById(`VoiceEngine_${config.notice.voice_parameter.engine}`).checked = true;

  var boyomiPort = config.notice.voice_parameter.Boyomi_Port || 50080;
  fetch(`http://localhost:${boyomiPort}/GetVoiceList`).then(function (res) { return res.json(); })
    .then(function (json) {
      (json?.voiceList || []).forEach(function (elm) {
        var VoiceOption = document.createElement("option");
        VoiceOption.textContent = elm.name;
        VoiceOption.value = elm.id;
        if (elm.id == config.notice.voice_parameter.Boyomi_Voice) VoiceOption.selected = true;
        document.getElementById("BoyomiVoiceSelect").appendChild(VoiceOption);
      });
    }).catch(function (err) {
      console.warn("Boyomichan GetVoiceList failed:", err);
    });

  disabled_control();
}

function disabled_control() {
  var a = document.getElementById("NotificationSound").checked;
  var b = document.getElementById("Bypass_threshold").checked;
  document.getElementById("M_threshold").disabled = !a || b;
  document.getElementById("maxI_threshold").disabled = !a || b;
  document.getElementById("Bypass_threshold").disabled = !a;

  var a = document.getElementById("Tsunami_NotificationSound").checked;
  var b = document.getElementById("Tsunami_Bypass_threshold").checked;
  document.getElementById("Tsunami_L_threshold").disabled = !a || b;
  document.getElementById("Tsunami_threshold").disabled = !a || b;
  document.getElementById("Tsunami_Bypass_threshold").disabled = !a;
}
document.getElementById("NotificationSound")
  .addEventListener("change", disabled_control);
document.getElementById("Bypass_threshold")
  .addEventListener("change", disabled_control);
document.getElementById("Tsunami_NotificationSound")
  .addEventListener("change", disabled_control);
document.getElementById("Tsunami_Bypass_threshold")
  .addEventListener("change", disabled_control);

function UpdateDataDraw(data) {
  document.getElementById("update-check-date").innerText = NormalizeDate(4, data.check_date);
  updateWrap.classList.remove("U-error", "U-available", "U-not_available");
  updateBtnWrap.style.display = "none";
  update_detail.style.display = "none";

  if (data.check_error) {
    updateWrap.classList.add("U-error");
    updateStatus.innerText = "更新の確認中にエラーが発生しました。";
    updateVersion.innerText = "---";
  } else {
    if (data.update_available) {
      updateWrap.classList.add("U-available");
      updateStatus.innerText = "更新が利用可能です。";
      updateVersion.innerText =
        `ver.${data.current_version} > ver.${data.latest_version}`;
      update_detail.innerText = data.update_detail;
      updateBtnWrap.style.display = "block";
      update_detail.style.display = "block";
    } else {
      updateWrap.classList.add("U-not_available");
      updateStatus.innerText = "アプリケーションは最新の状態です。";
      updateVersion.innerText = `ver.${data.current_version}`;
    }
  }
}

document.getElementById("check_update").addEventListener("click", function () {
  updateStatus.innerText = "更新を確認中...";
  window.electronAPI.messageReturn({
    action: "checkForUpdate",
  });
});

document.getElementById("apply").addEventListener("click", function () {
  apply();
});
document.getElementById("apply2").addEventListener("click", function () {
  apply();
  window.close();
});
document.getElementById("resetConfig").addEventListener("click", function () {
  var conf = confirm("本当に設定を初期化しますか？");
  if (conf) {
    window.electronAPI.messageReturn({
      action: "ChangeConfig",
      from: "ConfigWindow",
      data: defaultConfigVal,
    });
    window.electronAPI.messageReturn({
      action: "openAtLogin",
      data: false,
    });
    location.reload();
  }
});

document.getElementById("set_map_range").addEventListener("click", function () {
  var b = map.getBounds();
  var ne = b.getNorthEast();
  var sw = b.getSouthWest();
  document.getElementById("b_NELng").value = ne.lng.toFixed(6);
  document.getElementById("b_NELat").value = ne.lat.toFixed(6);
  document.getElementById("b_SWLng").value = sw.lng.toFixed(6);
  document.getElementById("b_SWLat").value = sw.lat.toFixed(6);
});

function apply() {
  pairs.forEach(applyUIToConfig);

  var iBounds = config.home.initialBounds = [
    [document.getElementById("b_SWLng").value,
    document.getElementById("b_SWLat").value],
    [document.getElementById("b_NELng").value,
    document.getElementById("b_NELat").value]
  ];

  //面積ゼロ回避
  if (iBounds[0][0] == iBounds[1][0]) {
    iBounds[0][0] = Number(iBounds[0][0]) - 0.5;
    iBounds[1][0] = Number(iBounds[1][0]) + 0.5;
  }
  if (iBounds[0][1] == iBounds[1][1]) {
    iBounds[0][1] = Number(iBounds[0][1]) - 0.5;
    iBounds[1][1] = Number(iBounds[1][1]) + 0.5;
  }

  config.notice.voice_parameter.rate = TTSspeed;
  config.notice.voice_parameter.pitch = TTSpitch;
  config.notice.voice_parameter.volume = TTSvolume;
  config.notice.voice_parameter.voice = TTSVoiceSelect.value;

  config.notice.bell_volume = master_volume;

  let VoiceEngine_Elm = document.getElementsByName("VoiceEngine");
  for (let i = 0; i < VoiceEngine_Elm.length; i++) {
    if (VoiceEngine_Elm.item(i).checked) config.notice.voice_parameter.engine = VoiceEngine_Elm.item(i).value;
  }

  config.color.Shindo = intColor[document.getElementById("shindoColor").value].Shindo;
  config.color.LgInt = intColor[document.getElementById("shindoColor").value].LgInt;

  window.electronAPI.messageReturn({
    action: "ChangeConfig",
    from: "ConfigWindow",
    data: config,
  });

  if (document.getElementById("startup").checked !== openAtLogin) {
    window.electronAPI.messageReturn({
      action: "openAtLogin",
      data: document.getElementById("startup").checked,
    });
  }

  confirm_edit = false;
}

document.getElementById("cancel").addEventListener("click", function () {
  window.close();
});
document.getElementById("replayReset").addEventListener("click", function () {
  document.getElementById("replay").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
  window.electronAPI.messageReturn({
    action: "replay",
    date: null,
  });
  document.getElementById("replayOffset").innerText = "-";
});

document.getElementById("replayJump").addEventListener("click", function () {
  var repVal = new Date(document.getElementById("replay").value);
  if (repVal > new Date()) {
    repVal = new Date();
    document.getElementById("replay").value = NormalizeDate(3, repVal).replaceAll("/", "-");
  }
  window.electronAPI.messageReturn({
    action: "replay",
    date: repVal,
  });
  offsetCalc();
});

function offsetCalc() {
  if (Replay == 0) document.getElementById("replayOffset").innerText = "-";
  else {
    var day = Math.floor(Replay / 1000 / 60 / 60 / 24);
    var hours = Math.floor((Replay / 1000 / 60 / 60) % 24);
    var minutes = Math.floor((Replay / 1000 / 60) % 60);
    var seconds = Math.floor((((Replay / 1000) % 24) % 60) % 60);
    document.getElementById("replayOffset").innerText = `- ${day}日 ${hours}時間${minutes}分${seconds}秒`;
  }
}

function mapInit() {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  const PMTILES_URL = "https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/optimal_bvmap-v1.pmtiles";
  const p = new pmtiles.PMTiles(PMTILES_URL);
  protocol.add(p);

  var high_contrast = window.matchMedia("(forced-colors: active)").matches;
  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [config.home.longitude, config.home.latitude],
    zoom: 6,
    attributionControl: false,
    pitchWithRotate: false,
    dragRotate: false,
    style: {
      version: 8,
      glyphs:
        "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",

      sources: {
        v: {
          type: "vector",
          url: `pmtiles://${PMTILES_URL}`,
          attribution: "国土地理院",
          minzoom: 4,
          maxzoom: 16,
        },
        worldmap: {
          type: "vector",
          url: "pmtiles://local-range-request://src/Resource/world.pmtiles",
          attribution: "Natural Earth",
        },
        tsunami: {
          type: "vector",
          url: "pmtiles://local-range-request://src/Resource/jp_tsunami.pmtiles",
          tolerance: 1.6,
          attribution: "気象庁",
        },
        basemap: {
          type: "vector",
          url: "pmtiles://local-range-request://src/Resource/jp_sect.pmtiles",
          attribution: "気象庁",
        },
        prefmap: {
          type: "vector",
          url: "pmtiles://local-range-request://src/Resource/jp_pref.pmtiles",
          attribution: "気象庁",
        },
      },
      layers: [
        {
          id: "tsunami_LINE",
          type: "line",
          source: "tsunami",
          "source-layer": "jp_tsunami",
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "tsunami_LINE_selected",
          type: "line",
          source: "tsunami",
          "source-layer": "jp_tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "butt",
          },
          paint: {
            "line-color": "#ff9292",
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300,],
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },
        {
          id: "prefmap_fill",
          type: "fill",
          source: "prefmap",
          "source-layer": "jp_pref",
          paint: {
            "fill-color": high_contrast ? "#000" : "#333",
            "fill-opacity": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "selected_sect",
          type: "fill",
          source: "basemap",
          "source-layer": "jp_sect",
          paint: {
            "fill-color": "rgba(255, 146, 146, 0.5)",
            "fill-opacity": 1,
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },

        {
          id: "basemap_LINE",
          type: "line",
          source: "basemap",
          "source-layer": "jp_sect",
          paint: {
            "line-color": high_contrast ? "#FFF" : "#666",
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "prefmap_LINE",
          type: "line",
          source: "prefmap",
          "source-layer": "jp_pref",
          paint: {
            "line-color": high_contrast ? "#FFF" : "#999",
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "tsunami_LINE_selected_2",
          type: "line",
          source: "tsunami",
          "source-layer": "jp_tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "butt",
          },
          paint: {
            "line-color": "#952e2e",
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 1, 5, 2, 10, 8, 18, 30,],
          },
          minzoom: 0,
          maxzoom: 22,
          filter: ["==", "name", ""],
        },
        {
          id: "worldmap_fill",
          type: "fill",
          source: "worldmap",
          "source-layer": "world",
          paint: {
            "fill-color": high_contrast ? "#000" : "#333",
            "fill-opacity": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "worldmap_LINE",
          type: "line",
          source: "worldmap",
          "source-layer": "world",
          paint: {
            "line-color": high_contrast ? "#FFF" : "#999",
            "line-width": 1,
          },
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "河川中心線",
          type: "line",
          source: "v",
          "source-layer": "RvrCL",
          filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]],
          paint: { "line-color": "#2468cb66", "line-width": 2 },
        },
        {
          id: "水涯線",
          type: "line",
          source: "v",
          "source-layer": "WL",
          paint: { "line-color": "#2468cb66", "line-width": 2 },
        },
        {
          id: "道路中心線ZL4-10国道・高速",
          maxzoom: 11,
          minzoom: 9,
          type: "line",
          source: "v",
          "source-layer": "RdCL",
          filter: [
            "any",
            [
              "in",
              ["get", "vt_rdctg"],
              ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]],
            ],
            ["==", ["get", "vt_rdctg"], "高速自動車国道等"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
            "line-sort-key": ["get", "vt_drworder"],
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
        },
        {
          id: "建築物0",
          type: "fill",
          source: "v",
          "source-layer": "BldA",
          filter: ["==", ["get", "vt_lvorder"], 0],
          paint: { "fill-color": "#80808033" },
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
          },
          paint: { "line-color": "#80808066", "line-width": 1.5 },
        },
        {
          id: "行政区画界線25000市区町村界",
          type: "line",
          source: "v",
          "source-layer": "AdmBdry",
          filter: ["==", ["get", "vt_code"], 1212],
          layout: { "line-cap": "square" },
          paint: { "line-color": "#666666", "line-width": 1 },
        },
        {
          id: "注記シンボル付きソート順100以上",
          type: "symbol",
          source: "v",
          "source-layer": "Anno",
          filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105,],],],], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105,],],],], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105,],],],],],
          layout: {
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
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  map.on("click", (e) => {
    document.getElementById("latitude").value = e.lngLat.lat;
    document.getElementById("longitude").value = e.lngLat.lng;
    MapReDraw();
  });

  const img = document.createElement("img");
  img.src = "./img/homePin.svg";
  img.classList.add("homeIcon");

  markerElm = new maplibregl.Marker({ element: img })
    .setLngLat([config.home.longitude, config.home.latitude])
    .addTo(map);
  map.on("load", function () {
    if (tsunamiSect) {
      map.setFilter("tsunami_LINE_selected", ["==", "name", tsunamiSect]);
      map.setFilter("tsunami_LINE_selected_2", ["==", "name", tsunamiSect]);
    }
    if (EQSect) map.setFilter("selected_sect", ["==", "name", EQSect]);
  });
}

function getMinLineDistance(pt, geojson) {
  try {
    var lines = turf.flatten(geojson);
    var minDist = Infinity;
    lines.features.forEach(function (f) {
      var d = turf.pointToLineDistance(pt, f, { units: "kilometers" });
      if (d < minDist) minDist = d;
    });
    return minDist;
  } catch {
    return Infinity;
  }
}

function MapReDraw() {
  var lat = Number(document.getElementById("latitude").value);
  var lng = Number(document.getElementById("longitude").value);
  if (!lat) lat = 0;
  if (!lng) lng = 0;

  var pt = turf.point([lng, lat]);
  var EQSectFeatures = map.querySourceFeatures("basemap", { sourceLayer: 'jp_sect' });

  var selected_sect = EQSectFeatures.find(function (elm) {
    return turf.booleanPointInPolygon([lng, lat], elm);
  });

  if (!selected_sect) {
    var minDistance = Infinity;
    EQSectFeatures.forEach(function (poly) {
      var line = turf.polygonToLine(poly);
      var distance = getMinLineDistance(pt, line);
      if (minDistance > distance) {
        minDistance = distance;
        selected_sect = line;
      }
    });
  }

  if (selected_sect) {
    if (selected_sect.type == "FeatureCollection")
      EQSect = selected_sect.features[0].properties.name;
    else EQSect = selected_sect.properties.name;
    map.setFilter("selected_sect", ["==", "name", EQSect]);
    selectBoxSet(document.getElementById("saibun"), EQSect);
  }

  var minDistance = Infinity;
  var tsunamiFeatures = map.querySourceFeatures("tsunami", { sourceLayer: 'jp_tsunami' });

  tsunamiFeatures.forEach(function (elm) {
    var distance = getMinLineDistance(pt, elm);
    if (minDistance > distance) {
      minDistance = distance;
      tsunamiSect = elm.properties.name;
    }
  });

  map.setFilter("tsunami_LINE_selected", ["==", "name", tsunamiSect]);
  map.setFilter("tsunami_LINE_selected_2", ["==", "name", tsunamiSect]);
  selectBoxSet(document.getElementById("tsunamiSect"), tsunamiSect);

  map.flyTo({
    center: [lng, lat],
  });

  markerElm.setLngLat([lng, lat]);
  fetch(`https://www.j-shis.bosai.go.jp/map/api/sstrct/V4/meshinfo.geojson?position=${lng},${lat}&epsg=4612&attr=ARV`)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (json.features?.[0]?.properties)
        document.getElementById("arv").value = json.features[0].properties.ARV;
      else document.getElementById("arv").value = 1;
    })
    .catch(function () {
      document.getElementById("arv").value = 1;
    });
}
document.getElementById("tsunamiSect").addEventListener("change", function () {
  tsunamiSect = this.value;
  map.setFilter("tsunami_LINE_selected", ["==", "name", this.value]);
  map.setFilter("tsunami_LINE_selected_2", ["==", "name", this.value]);
});

document.getElementById("saibun").addEventListener("change", function () {
  EQSect = this.value;
  map.setFilter("selected_sect", ["==", "name", EQSect]);
});

var TTSspeed = 1;
var TTSpitch = 1;
var TTSvolume = 1;
var TTSVoiceSelect = document.getElementById("TTSvoiceSelect");
var opts = "<option value=''>自動</option>";
var voices;
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
  voices.forEach(function (elm) {
    var selectedT = "";
    if (config && elm.name == config.notice.voice_parameter.voice)
      selectedT = " selected";

    opts += `<option${selectedT} value='${elm.name}'>${elm.name}</option>`;
  });
  TTSVoiceSelect.innerHTML = opts;
};

document.getElementById("BoyomiVoiceSelect");

document.getElementById("speak_test").addEventListener("click", function () {
  speak("音声合成のテストです");
});
function speak(text, engine) {
  if (!engine) {
    let VoiceEngine_Elm = document.getElementsByName("VoiceEngine");
    for (let i = 0; i < VoiceEngine_Elm.length; i++) {
      if (VoiceEngine_Elm.item(i).checked)
        engine = VoiceEngine_Elm.item(i).value;
    }
  }
  if (engine == "Boyomichan") {
    var port = document.getElementById("Boyomi_Port").value || config.notice.voice_parameter.Boyomi_Port || 50080;
    var host = `http://localhost:${port}`;
    if (document.getElementById("BoyomiVoiceSelect").value == "auto") {
      fetch(`${host}/Talk?text=${text}&speed=${TTSspeed * 100}&volume=${TTSvolume * 100}&tone=${TTSpitch * 100}`)
        .catch(function () {
          speak(text, "Default");
        });
    } else {
      fetch(`${host}/GetVoiceList`)
        .then(function (res) { return res.json(); })
        .then(function (json) {
          var voice_parameter = "";
          var voiceElm = json?.voiceList?.find(function (elm) {
            return elm.id == document.getElementById("BoyomiVoiceSelect").value;
          });
          if (voiceElm) voice_parameter = `&voice=${document.getElementById("BoyomiVoiceSelect").value}`;

          fetch(`${host}/Talk?text=${text}${voice_parameter}&speed=${TTSspeed * 100}&volume=${TTSvolume * 100}&tone=${TTSpitch * 100}`)
            .catch(function () {
              speak(text, "Default");
            });
        }).catch(function () {
          speak(text, "Default");
        });
    }
  } else if (engine == "Default") {
    speechSynthesis.cancel();
    // 発言を作成
    const uttr = new SpeechSynthesisUtterance();

    if (TTSVoiceSelect.value) {
      var Svoice = voices.find(function (elm) {
        return elm.name == TTSVoiceSelect.value;
      });
      uttr.voice = Svoice;
    }

    uttr.text = text;
    uttr.lang = "ja-JP";

    uttr.voice = Svoice;
    uttr.rate = TTSspeed;
    uttr.pitch = TTSpitch;
    uttr.volume = TTSvolume;
    speechSynthesis.speak(uttr);
  }
}

function TTSspeedSet(val) {
  val = Number(val);
  document.getElementById("TTSSpeedN").value = val;
  document.getElementById("TTSSpeedR").value = val;
  TTSspeed = val;
}
function TTSpitchSet(val) {
  val = Number(val);
  document.getElementById("TTSPitchN").value = val;
  document.getElementById("TTSPitchR").value = val;
  TTSpitch = val;
}
function TTSvolumeSet(val) {
  val = Number(val);
  document.getElementById("TTSVolumeN").value = val;
  document.getElementById("TTSVolumeR").value = val;
  TTSvolume = val;
}
var master_volume = 1;
var audio_delay;
function volumeSet(val, bypass_preview) {
  val = Number(val);
  document.getElementById("NotificationVolumeN").value = val;
  document.getElementById("NotificationVolumeR").value = val;
  master_volume = val;

  if (!bypass_preview) {
    if (audio_delay) {
      clearTimeout(audio_delay);
      audio_delay = null;
    }
    audio_delay = setTimeout(function () {
      audio_preview(val)
    }, 300);
  }
}

var AudioElm = new Audio("audio/EQInfo.mp3")
function audio_preview(volume) {
  AudioElm.currentTime = 0;
  AudioElm.volume = volume;
  if (AudioElm.paused) AudioElm.play();
}

function selectBoxSet(selectElm, TargetValue) {
  selectElm.querySelectorAll("option").forEach(function (elm) {
    if (elm.value == TargetValue) elm.setAttribute("selected", "");
    else if (elm.hasAttribute("selected")) elm.removeAttribute("selected");
  });
}

document
  .getElementById("Start_simulation")
  .addEventListener("click", function () {
    var EEWData = {
      alertflg: document.getElementById("EEWE_alertflg").value,
      EventID: Number(document.getElementById("EEWE_EventID").value),
      serial: Number(document.getElementById("EEWE_serial").value),
      report_time: new Date(document.getElementById("EEWE_report_time").value),
      magnitude: Number(document.getElementById("EEWE_magnitude").value),
      maxInt: document.getElementById("EEWE_maxInt").value,
      depth: Number(document.getElementById("EEWE_depth").value),
      is_cancel: document.getElementById("EEWE_is_cancel").checked,
      is_final: document.getElementById("EEWE_is_final").checked,
      is_training: document.getElementById("EEWE_is_training").checked,
      latitude: Number(document.getElementById("EEWE_latitude").value),
      longitude: Number(document.getElementById("EEWE_longitude").value),
      region_code: "",
      region_name: document.getElementById("EEWE_region_name").value,
      origin_time: new Date(document.getElementById("EEWE_origin_time").value),
      isPlum: document.getElementById("EEWE_isPlum").checked,
      source: "simulation",
    };

    document.getElementById("EEWE_serial").value = EEWData.serial + 1;

    window.electronAPI.messageReturn({
      action: "EEWSimulation",
      data: EEWData,
    });
  });

document.getElementById("shindoColor").addEventListener("change", function () {
  var colorTmp = intColor[this.value];
  if (!colorTmp) return;

  var shindoMap = { Q: "?", 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", "5m": "5m", "5p": "5p", "6m": "6m", "6p": "6p", 7: "7" };
  Object.keys(shindoMap).forEach(function (idKey) {
    var el = document.getElementById("ShindoSample" + idKey);
    var color = colorTmp.Shindo[shindoMap[idKey]];
    if (el && color) {
      el.style.background = color.background;
      el.style.color = color.color;
    }
  });

  var lgMap = { Q: "?", 1: "1", 2: "2", 3: "3", 4: "4" };
  Object.keys(lgMap).forEach(function (idKey) {
    var el = document.getElementById("LngIntSample" + idKey);
    var color = colorTmp.LgInt[lgMap[idKey]];
    if (el && color) {
      el.style.background = color.background;
      el.style.color = color.color;
    }
  });
});

var intColor = {
  "0quake": {
    Shindo: {
      0: {
        background: "rgb(80, 81, 83)",
        color: "rgb(194, 195, 197)",
      },
      1: {
        background: "rgb(157, 175, 194)",
        color: "rgb(61, 64, 89)",
      },
      2: {
        background: "rgb(89, 123, 171)",
        color: "rgb(0, 1, 6)",
      },
      3: {
        background: "rgb(69, 72, 130)",
        color: "rgb(216, 217, 235)",
      },
      4: {
        background: "rgb(217, 215, 98)",
        color: "rgb(67, 67, 71)",
      },
      7: {
        background: "rgb(165, 0, 194)",
        color: "rgb(255, 255, 255)",
      },
      "5m": {
        background: "rgb(224, 157, 0)",
        color: "rgb(38, 38, 38)",
      },
      "5p": {
        background: "rgb(232, 93, 19)",
        color: "rgb(0, 0, 0)",
      },
      "6m": {
        background: "rgb(194, 26, 0)",
        color: "rgb(255, 255, 255)",
      },
      "6p": {
        background: "rgb(128, 0, 21)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
      "5p?": {
        background: "rgb(232, 93, 19)",
        color: "rgb(0, 0, 0)",
      },
    },
    LgInt: {
      1: {
        background: "rgb(69, 72, 130)",
        color: "rgb(216, 217, 235)",
      },
      2: {
        background: "rgb(224, 157, 0)",
        color: "rgb(38, 38, 38)",
      },
      3: {
        background: "rgb(194, 26, 0)",
        color: "rgb(255, 255, 255)",
      },
      4: {
        background: "rgb(165, 0, 194)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
    },
  },
  "0quake_old": {
    Shindo: {
      0: {
        background: "rgb(80, 86, 102)",
        color: "rgb(204, 204, 204)",
      },
      1: {
        background: "rgb(134, 168, 198)",
        color: "rgb(51, 51, 51)",
      },
      2: {
        background: "rgb(56, 120, 193)",
        color: "rgb(255, 255, 255)",
      },
      3: {
        background: "rgb(80, 186, 84)",
        color: "rgb(34, 34, 34)",
      },
      4: {
        background: "rgb(204, 209, 74)",
        color: "rgb(34, 34, 34)",
      },
      "5m": {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
      "5p": {
        background: "rgb(255, 91, 22)",
        color: "rgb(0, 0, 0)",
      },
      "6m": {
        background: "rgb(237, 0, 0)",
        color: "rgb(255, 255, 255)",
      },
      "6p": {
        background: "rgb(128, 9, 9)",
        color: "rgb(255, 255, 255)",
      },
      7: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
      "5p?": {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
    },
    LgInt: {
      1: {
        background: "rgb(80, 186, 84)",
        color: "rgb(34, 34, 34)",
      },
      2: {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
      3: {
        background: "rgb(237, 0, 0)",
        color: "rgb(255, 255, 255)",
      },
      4: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
    },
  },
  jma: {
    Shindo: {
      0: {
        background: "rgb(255, 255, 255)",
        color: "rgb(0, 0, 0)",
      },
      1: {
        background: "rgb(242, 242, 255)",
        color: "rgb(0, 0, 0)",
      },
      2: {
        background: "rgb(0, 170, 255)",
        color: "rgb(0, 0, 0)",
      },
      3: {
        background: "rgb(0, 65, 255)",
        color: "rgb(255, 255, 255)",
      },
      4: {
        background: "rgb(250, 230, 150)",
        color: "rgb(0, 0, 0)",
      },
      7: {
        background: "rgb(180, 0, 104)",
        color: "rgb(255, 255, 255)",
      },
      "5m": {
        background: "rgb(255, 230, 0)",
        color: "rgb(0, 0, 0)",
      },
      "5p": {
        background: "rgb(255, 153, 0)",
        color: "rgb(0, 0, 0)",
      },
      "6m": {
        background: "rgb(255, 40, 0)",
        color: "rgb(255, 255, 255)",
      },
      "6p": {
        background: "rgb(165, 0, 33)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(200, 200, 203)",
        color: "rgb(0, 0, 0)",
      },
      "5p?": {
        background: "rgb(255, 230, 0)",
        color: "rgb(0, 0, 0)",
      },
    },
    LgInt: {
      1: {
        background: "rgb(0, 65, 255)",
        color: "rgb(255, 255, 255)",
      },
      2: {
        background: "rgb(255, 230, 0)",
        color: "rgb(0, 0, 0)",
      },
      3: {
        background: "rgb(255, 40, 0)",
        color: "rgb(255, 255, 255)",
      },
      4: {
        background: "rgb(165, 0, 33)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(200, 200, 203)",
        color: "rgb(0, 0, 0)",
      },
    },
  },
};
