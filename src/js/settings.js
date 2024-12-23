var map;
var config;
var markerElm;
var Replay;
var openAtLogin = false;
var tsunamiSect;
var tsunamiFeatures;
var EQSectFeatures;
var defaultConfigVal;
window.addEventListener("load", function () {
  this.document.getElementById("replay").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
  this.document.getElementById("EEWE_EventID").value = NormalizeDate(1, new Date()).replaceAll("/", "-");
  this.document.getElementById("EEWE_report_time").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
  this.document.getElementById("EEWE_origin_time").value = NormalizeDate(3, new Date()).replaceAll("/", "-");
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
      document.querySelector(".active_tabcontent").classList.remove("active_tabcontent");
      document.querySelector(".active_tabmenu").classList.remove("active_tabmenu");
      document.getElementById("tab1_content2").classList.add("active_tabcontent");
      document.getElementById("tab1_menu2").classList.add("active_tabmenu");
    }

    config = request.config;
    defaultConfigVal = request.defaultConfigVal;

    configDataDraw();
    mapInit();
  } else if (request.action == "Update_Data") UpdateDataDraw(request.data);
});

var updateWrap = document.getElementById("update-wrap");
var updateStatus = document.getElementById("update-status");
var updateVersion = document.getElementById("update-version");
var updateBtnWrap = document.getElementById("update_BtnWrap");
var downloadLink = document.getElementById("downloadLink");
var update_detail = document.getElementById("update-detail");
document.getele;
downloadLink.addEventListener("click", function () {
  var lnk = document.createElement("a");
  lnk.href = "https://0quake.github.io/ZeroQuake_Website/download.html#download-section";
  lnk.click();
});

function configDataDraw() {
  document.getElementById("arv").value = config.home.arv;
  document.getElementById("HomeName").value = config.home.name;
  document.getElementById("latitude").value = config.home.latitude;
  document.getElementById("longitude").value = config.home.longitude;
  beforeCordinates = [config.home.longitude, config.home.latitude];
  document.getElementById("EEW_Voice").value = config.notice.voice.EEW;
  document.getElementById("EEW2_Voice").value = config.notice.voice.EEWUpdate;
  document.getElementById("EEW3_Voice").value = config.notice.voice.EEWCancel;
  document.getElementById("Tsunami_Voice").value = config.notice.voice.Tsunami;
  document.getElementById("Tsunami_Voice2").value = config.notice.voice.TsunamiRevocation;
  document.getElementById("Tsunami_Voice3").value = config.notice.voice.TsunamiTorikeshi;

  document.getElementById("EQInfo_Voice1").value = config.notice.voice.EQInfo;
  document.getElementById("EQInfo_Voice2").value = config.notice.voice.EQInfoCancel;
  document.getElementById("EQInfo_ItemCount").value = config.Info.EQInfo.ItemCount;
  document.getElementById("EEW_training").checked = config.Info.EEW.showtraining;
  document.getElementById("EEW_IntQ").checked = config.Info.EEW.IntQuestion;
  document.getElementById("EEW_userIntQ").checked = config.Info.EEW.userIntQuestion;
  document.getElementById("EQInfoInterval").value = config.Info.EQInfo.Interval / 1000;

  selectBoxSet(document.getElementById("EEW_Window"), config.notice.window.EEW);
  selectBoxSet(document.getElementById("EEW_Window_Update"), config.notice.window.EEW_Update);
  selectBoxSet(document.getElementById("EEW_IntFilter"), config.Info.EEW.IntThreshold);
  selectBoxSet(document.getElementById("EEW_userIntFilter"), config.Info.EEW.userIntThreshold);
  selectBoxSet(document.getElementById("saibun"), config.home.Section);
  tsunamiSect = config.home.TsunamiSect;
  selectBoxSet(document.getElementById("tsunamiSect"), tsunamiSect);
  if (map) map.setFilter("tsunami_LINE_selected", ["==", "name", tsunamiSect]);

  TTSvolumeSet(config.notice.voice_parameter.volume);
  TTSpitchSet(config.notice.voice_parameter.pitch);
  TTSspeedSet(config.notice.voice_parameter.rate);

  selectBoxSet(document.getElementById("TTSvoiceSelect"), config.notice.voice_parameter.voice);

  selectBoxSet(document.getElementById("intType"), config.Info.EEW.IntType);
  document.getElementById("EarthquakeDetect").checked = config.Info.RealTimeShake.DetectEarthquake;
  document.getElementById("WindowAutoOpen").checked = config.system.WindowAutoOpen;
  document.getElementById("alwaysOnTop").checked = config.system.alwaysOnTop;
  document.getElementById("HomePinShow").checked = config.home.ShowPin;
  document.getElementById("Tsunami_GetData").checked = config.Info.TsunamiInfo.GetData;
  document.getElementById("Axis_GetData").checked = config.Source.axis.GetData;
  document.getElementById("Wolfx_GetData").checked = config.Source.wolfx.GetData;
  document.getElementById("Wolfx_SeisJS_GetData").checked = config.Source.wolfx.GetDataFromSeisJS;
  document.getElementById("ProjectBS_GetData").checked = config.Source.ProjectBS.GetData;
  document.getElementById("EarlyEst_GetData").checked = config.Source.EarlyEst.GetData;
  document.getElementById("msil_GetData").checked = config.Source.msil.GetData;
  document.getElementById("kmoni_GetData").checked = config.Source.kmoni.kmoni.GetData;
  document.getElementById("EarlyEstInterval").value = config.Source.EarlyEst.Interval / 1000;
  document.getElementById("kmoniInterval").value = config.Source.kmoni.kmoni.Interval / 1000;
  document.getElementById("msilInterval").value = config.Source.msil.Interval / 1000;
  if (config.Source.axis.AccessToken) document.getElementById("Axis_AccessToken").value = config.Source.axis.AccessToken;

  document.getElementById("Tsunami_Test").checked = config.Info.TsunamiInfo.showTest;
  document.getElementById("Tsunami_training").checked = config.Info.TsunamiInfo.showtraining;

  document.getElementById("EQInfo_Test").checked = config.Info.EQInfo.showTest;
  document.getElementById("EQInfo_training").checked = config.Info.EQInfo.showtraining;

  document.getElementById("TREM-RTS_GetData").checked = config.Source.TREMRTS.GetData;
  document.getElementById("TREM-RTS_Interval").value = config.Source.TREMRTS.Interval / 1000;

  document.getElementById("VoiceEngine_" + config.notice.voice_parameter.engine).checked = true;
  document.getElementById("Boyomi_Port").value = config.notice.voice_parameter.Boyomi_Port;

  document.getElementById("NotificationSound").checked = config.Info.EQInfo.NotificationSound;
  selectBoxSet(document.getElementById("maxI_threshold"), config.Info.EQInfo.maxI_threshold);
  document.getElementById("M_threshold").value = config.Info.EQInfo.M_threshold;
  document.getElementById("Bypass_threshold").checked = config.Info.EQInfo.Bypass_threshold;

  document.getElementById("Tsunami_NotificationSound").checked = config.Info.TsunamiInfo.NotificationSound;
  selectBoxSet(document.getElementById("Tsunami_threshold"), config.Info.TsunamiInfo.Global_threshold);
  selectBoxSet(document.getElementById("Tsunami_L_threshold"), config.Info.TsunamiInfo.Local_threshold);
  document.getElementById("Tsunami_Bypass_threshold").checked = config.Info.TsunamiInfo.Bypass_threshold;

  fetch("http://localhost:50080/GetVoiceList")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      json.voiceList.forEach(function (elm) {
        var VoiceOption = document.createElement("option");
        VoiceOption.textContent = elm.name;
        VoiceOption.value = elm.id;
        if (elm.id == config.notice.voice_parameter.Boyomi_Voice) VoiceOption.selected = true;
        document.getElementById("BoyomiVoiceSelect").appendChild(VoiceOption);
      });
    });
}

function UpdateDataDraw(data) {
  document.getElementById("update-check-date").innerText = NormalizeDate(3, data.check_date);
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
      updateVersion.innerText = "ver." + data.current_version + " > ver." + data.latest_version;
      update_detail.innerText = data.update_detail;
      updateBtnWrap.style.display = "block";
      update_detail.style.display = "block";
    } else {
      updateWrap.classList.add("U-not_available");
      updateStatus.innerText = "お使いのアプリケーションは最新の状態です。";
      updateVersion.innerText = "ver." + data.current_version;
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

function apply() {
  config.Info.EEW.IntType = document.getElementById("intType").value;

  config.Info.RealTimeShake.DetectEarthquake = document.getElementById("EarthquakeDetect").checked;
  config.system.WindowAutoOpen = document.getElementById("WindowAutoOpen").checked;
  config.system.alwaysOnTop = document.getElementById("alwaysOnTop").checked;
  config.home.ShowPin = document.getElementById("HomePinShow").checked;
  config.Info.TsunamiInfo.GetData = document.getElementById("Tsunami_GetData").checked;
  config.home.arv = Number(document.getElementById("arv").value);
  config.home.name = document.getElementById("HomeName").value;
  config.home.latitude = document.getElementById("latitude").value;
  config.home.longitude = document.getElementById("longitude").value;
  config.home.Section = document.getElementById("saibun").value;
  config.home.TsunamiSect = document.getElementById("tsunamiSect").value;
  config.notice.voice.EEW = document.getElementById("EEW_Voice").value;
  config.notice.voice.EEWUpdate = document.getElementById("EEW2_Voice").value;
  config.notice.voice.EEWCancel = document.getElementById("EEW3_Voice").value;
  config.notice.voice.Tsunami = document.getElementById("Tsunami_Voice").value;
  config.notice.voice.TsunamiRevocation = document.getElementById("Tsunami_Voice2").value;
  config.notice.voice.TsunamiTorikeshi = document.getElementById("Tsunami_Voice3").value;
  config.notice.voice.EQInfo = document.getElementById("EQInfo_Voice1").value;
  config.notice.voice.EQInfoCancel = document.getElementById("EQInfo_Voice2").value;
  config.Info.EQInfo.ItemCount = Number(document.getElementById("EQInfo_ItemCount").value);
  config.Info.EEW.showtraining = document.getElementById("EEW_training").checked;
  config.Info.EEW.IntQuestion = document.getElementById("EEW_IntQ").checked;
  config.Info.EEW.userIntQuestion = document.getElementById("EEW_userIntQ").checked;
  config.Info.EEW.IntThreshold = document.getElementById("EEW_IntFilter").value;
  config.Info.EEW.userIntThreshold = document.getElementById("EEW_userIntFilter").value;
  config.notice.window.EEW = document.getElementById("EEW_Window").value;
  config.notice.window.EEW_Update = document.getElementById("EEW_Window_Update").value;

  config.Info.EQInfo.Interval = Number(document.getElementById("EQInfoInterval").value) * 1000;
  config.Source.axis.GetData = document.getElementById("Axis_GetData").checked;
  config.Source.axis.AccessToken = document.getElementById("Axis_AccessToken").value;
  config.Source.wolfx.GetData = document.getElementById("Wolfx_GetData").checked;
  config.Source.wolfx.GetDataFromSeisJS = document.getElementById("Wolfx_SeisJS_GetData").checked;
  config.Source.ProjectBS.GetData = document.getElementById("ProjectBS_GetData").checked;
  config.Source.EarlyEst.GetData = document.getElementById("EarlyEst_GetData").checked;
  config.Source.msil.GetData = document.getElementById("msil_GetData").checked;
  config.Source.kmoni.kmoni.GetData = document.getElementById("kmoni_GetData").checked;
  config.Source.EarlyEst.Interval = Number(document.getElementById("EarlyEstInterval").value) * 1000;
  config.Source.kmoni.kmoni.Interval = Number(document.getElementById("kmoniInterval").value) * 1000;
  config.Source.msil.Interval = Number(document.getElementById("msilInterval").value) * 1000;

  config.notice.voice_parameter.rate = TTSspeed;
  config.notice.voice_parameter.pitch = TTSpitch;
  config.notice.voice_parameter.volume = TTSvolume;
  config.notice.voice_parameter.voice = TTSVoiceSelect.value;

  config.Info.TsunamiInfo.showTest = document.getElementById("Tsunami_Test").checked;
  config.Info.TsunamiInfo.showtraining = document.getElementById("Tsunami_training").checked;

  config.Info.EQInfo.showTest = document.getElementById("EQInfo_Test").checked;
  config.Info.EQInfo.showtraining = document.getElementById("EQInfo_training").checked;

  config.Source.TREMRTS.GetData = document.getElementById("TREM-RTS_GetData").checked;
  config.Source.TREMRTS.Interval = Number(document.getElementById("TREM-RTS_Interval").value) * 1000;

  let VoiceEngine_Elm = document.getElementsByName("VoiceEngine");
  for (let i = 0; i < VoiceEngine_Elm.length; i++) {
    if (VoiceEngine_Elm.item(i).checked) config.notice.voice_parameter.engine = VoiceEngine_Elm.item(i).value;
  }
  config.notice.voice_parameter.Boyomi_Port = Math.floor(Number(document.getElementById("Boyomi_Port").value));
  config.notice.voice_parameter.Boyomi_Voice = document.getElementById("BoyomiVoiceSelect").value;

  config.Info.EQInfo.NotificationSound = document.getElementById("NotificationSound").checked;
  config.Info.EQInfo.maxI_threshold = document.getElementById("maxI_threshold").value;
  config.Info.EQInfo.M_threshold = document.getElementById("M_threshold").value;
  config.Info.EQInfo.Bypass_threshold = document.getElementById("Bypass_threshold").checked;

  config.Info.TsunamiInfo.NotificationSound = document.getElementById("Tsunami_NotificationSound").checked;
  config.Info.TsunamiInfo.Global_threshold = document.getElementById("Tsunami_threshold").value;
  config.Info.TsunamiInfo.Local_threshold = document.getElementById("Tsunami_L_threshold").value;
  config.Info.TsunamiInfo.Bypass_threshold = document.getElementById("Tsunami_Bypass_threshold").checked;

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
  repVal = new Date(document.getElementById("replay").value);
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
    document.getElementById("replayOffset").innerText = "- " + day + "日 " + hours + "時間" + minutes + "分" + seconds + "秒";
  }
}

function mapInit() {
  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [config.home.longitude, config.home.latitude],
    zoom: 4,
    attributionControl: true,
    maxBounds: [
      [115, 15],
      [155, 52],
    ],
    pitchWithRotate: false,
    dragRotate: false,
    style: {
      version: 8,
      glyphs: "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",

      sources: {
        v: {
          type: "vector",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/{z}/{x}/{y}.pbf"],
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
        tsunami: {
          type: "geojson",
          data: "./Resource/tsunami.json",
          tolerance: 1.6,
          attribution: "気象庁",
        },
        basemap: {
          type: "geojson",
          data: "./Resource/basemap.json",
          tolerance: 0.7,
          attribution: "気象庁",
        },
        prefmap: {
          type: "geojson",
          data: "./Resource/prefectures.json",
          tolerance: 0.7,
          attribution: "気象庁",
        },
      },
      layers: [
        {
          id: "tsunami_LINE",
          type: "line",
          source: "tsunami",
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "tsunami_LINE_selected",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "butt",
          },
          paint: {
            "line-color": "#FFF",
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
          minzoom: 0,
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
        { id: "海岸線", type: "line", source: "v", "source-layer": "Cstline", filter: ["in", ["get", "vt_code"], ["literal", [5101, 5103]]], paint: { "line-color": "#999999", "line-offset": 0, "line-width": 1 } },
        { id: "河川中心線", type: "line", source: "v", "source-layer": "RvrCL", filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]], paint: { "line-color": "#2468cb66", "line-width": 2 } },
        { id: "水涯線", type: "line", source: "v", "source-layer": "WL", paint: { "line-color": "#2468cb66", "line-width": 2 } },
        { id: "道路中心線ZL4-10国道", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]]], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 3 } },
        { id: "道路中心線ZL4-10高速", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["==", ["get", "vt_rdctg"], "高速自動車国道等"], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 3 } },
        { id: "道路中心線色0", minzoom: 11, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], 17, ["all", ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 2 } },
        { id: "鉄道中心線0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "#80808066", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線色橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 2 } },
        { id: "建築物0", type: "fill", source: "v", "source-layer": "BldA", filter: ["==", ["get", "vt_lvorder"], 0], paint: { "fill-color": "#80808033" } },
        { id: "鉄道中心線橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "#80808066", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線色1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 4, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "#80808066", "line-width": 2.5, "line-dasharray": [1, 1] } },
        { id: "道路中心線色橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 1.5 } },
        { id: "道路縁", minzoom: 17, type: "line", source: "v", "source-layer": "RdEdg", layout: { "line-cap": "square", "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 1.5 } },
        { id: "行政区画界線25000市区町村界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1212], layout: { "line-cap": "square" }, paint: { "line-color": "#666666", "line-width": 1 } },
        // prettier-ignore
        {id: "注記シンボル付きソート順100以上",type: "symbol",source: "v","source-layer": "Anno",filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]]],layout: { "icon-allow-overlap": false, "icon-image": ["step", ["zoom"], ["match", ["get", "vt_code"], [1301, 1302, 1303], "人口50万人未満-500", ""], 6, ["match", ["get", "vt_code"], 1301, "人口100万人以上-500", 1302, "人口50万-100万人未満-500", 1303, "人口50万人未満-500", 6368, "主要な港-500", 6376, "主要な空港-500", 7201, "標高点（測点）", ""], 8, ["match", ["get", "vt_code"], 1401, "都道府県所在地-100", 1402, "市役所・東京都の区役所（都道府県所在都市以外）-20", 1403, "町・村-20", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 2941, "インターチェンジ-20", 2942, "ジャンクション-20", 2945, "スマートインターチェンジ-20", 3221, "灯台-20", 6351, "採鉱地", 6367, "特定重要港-20", 6368, "重要港-20", 6375, "国際空港-20", 6376, "国際空港以外の拠点空港等-20", 7102, "標高点（測点）", 7201, "標高点（測点）", 7221, "火山-20", ""], 11, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3212, "高等学校・中等教育学校", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3243, "病院", 3261, "工場-20", 4102, "風車", 4103, "油井・ガス井", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 6367, "特定重要港-20", 6371, "国際空港-20", 6373, "自衛隊等の飛行場-20", 6375, "国際空港-20", 6381, "自衛隊-20", 7101, "電子基準点", 7102, "三角点", 7201, "標高点（測点）", 8103, "発電所等", ""], 14, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 2901, "国道番号-20", 3201, "官公署", 3202, "裁判所", 3203, "税務署", 3204, "外国公館", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3211, "交番", 3212, "高等学校・中等教育学校", [3213, 3214], "小学校", 3215, "老人ホーム", 3216, "博物館法の登録博物館・博物館相当施設", 3217, "図書館", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3242, "消防署", 3243, "病院", 3244, "保健所", 4101, "煙突", 4102, "風車", 4103, "油井・ガス井", 4104, "記念碑", 4105, "自然災害伝承碑", 6301, "墓地", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6323, "竹林", 6324, "ヤシ科樹林", 6325, "ハイマツ地", 6326, "笹地", 6327, "荒地", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 7101, "電子基準点", 7102, "三角点", 7103, "水準点", 7201, "標高点（測点）", 7711, "水深-20", 8103, "発電所等", 8105, "電波塔", ""]], "icon-size": ["let", "size", ["match", ["get", "vt_code"], [7221, 8103], 0.4, [631, 632, 633, 653, 661, 662, 1301, 1302, 1303, 1401, 1402, 1403, 2903, 2904, 2941, 2942, 2945, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244, 4101, 4102, 4103, 4104, 4105, 6301, 6367, 6368, 6371, 6375, 6376, 6331, 6332, 6342, 6351, 6361, 6362, 6381, 7101, 7102, 7103, 8105], 0.5, [6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 7201], 0.6, 621, 1, 1], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, ["var", "size"]], 8, ["*", 0.75, ["var", "size"]], 11, ["var", "size"], 14, ["var", "size"], 16, ["*", 1.5, ["var", "size"]]]], "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["top", "bottom", "left", "right"], "text-writing-mode": ["horizontal"] },paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 },},
        { id: "注記シンボル付きソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]]], layout: { "icon-allow-overlap": false, "icon-image": ["step", ["zoom"], ["match", ["get", "vt_code"], [1301, 1302, 1303], "人口50万人未満-500", ""], 6, ["match", ["get", "vt_code"], 1301, "人口100万人以上-500", 1302, "人口50万-100万人未満-500", 1303, "人口50万人未満-500", 6368, "主要な港-500", 6376, "主要な空港-500", 7201, "標高点（測点）", ""], 8, ["match", ["get", "vt_code"], 1401, "都道府県所在地-100", 1402, "市役所・東京都の区役所（都道府県所在都市以外）-20", 1403, "町・村-20", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 2941, "インターチェンジ-20", 2942, "ジャンクション-20", 2945, "スマートインターチェンジ-20", 3221, "灯台-20", 6351, "採鉱地", 6367, "特定重要港-20", 6368, "重要港-20", 6375, "国際空港-20", 6376, "国際空港以外の拠点空港等-20", 7102, "標高点（測点）", 7201, "標高点（測点）", 7221, "火山-20", ""], 11, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3212, "高等学校・中等教育学校", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3243, "病院", 3261, "工場-20", 4102, "風車", 4103, "油井・ガス井", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 6367, "特定重要港-20", 6371, "国際空港-20", 6373, "自衛隊等の飛行場-20", 6375, "国際空港-20", 6381, "自衛隊-20", 7101, "電子基準点", 7102, "三角点", 7201, "標高点（測点）", 8103, "発電所等", ""], 14, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 3201, "官公署", 3202, "裁判所", 3203, "税務署", 3204, "外国公館", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3211, "交番", 3212, "高等学校・中等教育学校", [3213, 3214], "小学校", 3215, "老人ホーム", 3216, "博物館法の登録博物館・博物館相当施設", 3217, "図書館", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3242, "消防署", 3243, "病院", 3244, "保健所", 4101, "煙突", 4102, "風車", 4103, "油井・ガス井", 4104, "記念碑", 4105, "自然災害伝承碑", 6301, "墓地", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6323, "竹林", 6324, "ヤシ科樹林", 6325, "ハイマツ地", 6326, "笹地", 6327, "荒地", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 7101, "電子基準点", 7102, "三角点", 7103, "水準点", 7201, "標高点（測点）", 7711, "水深-20", 8103, "発電所等", 8105, "電波塔", ""]], "icon-size": ["let", "size", ["match", ["get", "vt_code"], [7221, 8103], 0.4, [631, 632, 633, 653, 661, 662, 1301, 1302, 1303, 1401, 1402, 1403, 2903, 2904, 2941, 2942, 2945, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244, 4101, 4102, 4103, 4104, 4105, 6301, 6367, 6368, 6371, 6375, 6376, 6331, 6332, 6342, 6351, 6361, 6362, 6381, 7101, 7102, 7103, 8105], 0.5, [6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 7201], 0.6, 621, 1, 1], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, ["var", "size"]], 8, ["*", 0.75, ["var", "size"]], 11, ["var", "size"], 14, ["var", "size"], 16, ["*", 1.5, ["var", "size"]]]], "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [2941, 2942], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["top", "bottom", "left", "right"], "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 } },
      ],
    },
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  map.on("click", "basemap_fill", (e) => {
    document.getElementById("latitude").value = e.lngLat.lat;
    document.getElementById("longitude").value = e.lngLat.lng;
    MapReDraw();
  });

  const img = document.createElement("img");
  img.src = "./img/homePin.svg";
  img.classList.add("homeIcon");

  markerElm = new maplibregl.Marker({ element: img }).setLngLat([config.home.longitude, config.home.latitude]).addTo(map);
  map.on("load", function () {
    if (tsunamiSect) map.setFilter("tsunami_LINE_selected", ["==", "name", tsunamiSect]);
    tsunamiFeatures = map.querySourceFeatures("tsunami");
    EQSectFeatures = map.querySourceFeatures("basemap");
  });
}

var beforeCordinates = [0, 0];
function MapReDraw() {
  lat = Number(document.getElementById("latitude").value);
  lng = Number(document.getElementById("longitude").value);
  if (!lat) lat = 0;
  if (!lng) lng = 0;

  var inside_sect = EQSectFeatures.find(function (elm) {
    return turf.booleanPointInPolygon([lng, lat], elm);
  });

  if (inside_sect) selectBoxSet(document.getElementById("saibun"), inside_sect.properties.name);
  else {
    document.getElementById("longitude").value = lng = beforeCordinates[0];
    document.getElementById("latitude").value = lat = beforeCordinates[1];
    return;
  }

  beforeCordinates = [lng, lat];

  var tsunamiSect;
  var minDistance = Infinity;
  tsunamiFeatures.forEach(function (elm) {
    coordinates = turf.centroid(elm).geometry.coordinates;
    // 距離を求める
    var distance = turf.distance(turf.point([lng, lat]), coordinates);
    if (minDistance > distance) {
      minDistance = distance;
      tsunamiSect = elm.properties.name;
    }
  });

  map.setFilter("tsunami_LINE_selected", ["==", "name", tsunamiSect]);
  selectBoxSet(document.getElementById("tsunamiSect"), tsunamiSect);

  map.flyTo({
    center: [lng, lat],
  });

  markerElm.setLngLat([lng, lat]);
  fetch("https://www.j-shis.bosai.go.jp/map/api/sstrct/V4/meshinfo.geojson?position=" + lng + "," + lat + "&epsg=4612&attr=ARV")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      document.getElementById("arv").value = json.features[0].properties.ARV;
    });
}
document.getElementById("tsunamiSect").addEventListener("change", function () {
  tsunamiSect = this.value;
  map.setFilter("tsunami_LINE_selected", ["==", "name", this.value]);
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
    if (config && elm.name == config.notice.voice_parameter.voice) selectedT = " selected";

    opts += "<option" + selectedT + " value='" + elm.name + "'>" + elm.name + "</option>";
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
      if (VoiceEngine_Elm.item(i).checked) engine = VoiceEngine_Elm.item(i).value;
    }
  }
  if (engine == "Boyomichan") {
    if (document.getElementById("BoyomiVoiceSelect").value == "auto") {
      fetch(`http://localhost:${document.getElementById("Boyomi_Port").value}/Talk?text=${text}&speed=${TTSspeed * 100}&volume=${TTSvolume * 100}&tone=${TTSpitch * 100}`).catch(function (err) {
        speak(text, "Default");
      });
    } else {
      fetch("http://localhost:50080/GetVoiceList")
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          var voice_parameter = "";
          var voiceElm = json.voiceList.find(function (elm) {
            return elm.id == document.getElementById("BoyomiVoiceSelect").value;
          });
          if (voiceElm) voice_parameter = "&voice=" + document.getElementById("BoyomiVoiceSelect").value;

          fetch(`http://localhost:${document.getElementById("Boyomi_Port").value}/Talk?text=${text}${voice_parameter}&speed=${TTSspeed * 100}&volume=${TTSvolume * 100}&tone=${TTSpitch * 100}`).catch(function (err) {
            speak(text, "Default");
          });
        })
        .catch(function (err) {});
    }
  } else if (engine == "Default") {
    speechSynthesis.cancel();
    // 発言を作成
    const uttr = new SpeechSynthesisUtterance();

    if (TTSVoiceSelect.value) {
      Svoice = voices.find(function (elm) {
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
function selectBoxSet(selectElm, TargetValue) {
  selectElm.querySelectorAll("option").forEach(function (elm) {
    if (elm.value == TargetValue) {
      elm.setAttribute("selected", true);
      return true;
    }
  });
}

document.getElementById("Start_simulation").addEventListener("click", function () {
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
    is_training: true,
    latitude: Number(document.getElementById("EEWE_latitude").value),
    longitude: Number(document.getElementById("EEWE_longitude").value),
    region_code: "",
    region_name: document.getElementById("EEWE_region_name").value,
    origin_time: new Date(document.getElementById("EEWE_origin_time").value),
    isPlum: document.getElementById("EEWE_isPlum").checked,
    source: "simulation",
  };

  document.getElementById("EEWE_serial").value = EEWData.serial + 1;
  document.getElementById("EEWE_serial").min = EEWData.serial + 1;

  window.electronAPI.messageReturn({
    action: "EEWSimulation",
    data: EEWData,
  });
});
