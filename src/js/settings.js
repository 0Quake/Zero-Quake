var config;
var markerElm;
var Replay;
var openAtLogin = false;
window.addEventListener("load", function () {
  this.document.getElementById("replay").value = dateEncode(3, new Date()).replaceAll("/", "-");
});
window.electronAPI.messageSend((event, request) => {
  if (request.action == "softVersion") {
    document.getElementById("softVersion").innerText = request.data;
  } else if (request.action == "openAtLogin") {
    openAtLogin = request.data;
    document.getElementById("startup").checked = openAtLogin;
  } else if (request.action == "Replay") {
    Replay = request.data;
    offsetCalc();
  } else if (request.action == "setting") {
    document.getElementById("splash").style.display = "none";

    config = request.data;

    document.getElementById("latitude").value = config.home.latitude;
    document.getElementById("longitude").value = config.home.longitude;
    document.getElementById("EEW_Voice").value = config.notice.voice.EEW;
    document.getElementById("EEW2_Voice").value = config.notice.voice.EEWUpdate;
    document.getElementById("EQInfo_ItemCount").value = config.Info.EQInfo.ItemCount;
    document.getElementById("RealTimeShake_ItemCount").value = config.Info.RealTimeShake.List.ItemCount;

    TTSvolumeSet(config.notice.voice_parameter.volume);
    TTSpitchSet(config.notice.voice_parameter.pitch);
    TTSspeedSet(config.notice.voice_parameter.rate);

    selectBoxSet(document.getElementById("TTSvoiceSelect"), config.notice.voice_parameter.voice);

    selectBoxSet(document.getElementById("BugReportAutoSend"), config.system.crashReportAutoSend);
    document.getElementById("Axis_GetData").checked = config.Source.axis.GetData;
    document.getElementById("Wolfx_GetData").checked = config.Source.wolfx.GetData;
    document.getElementById("msil_GetData").checked = config.Source.msil.GetData;
    document.getElementById("kmoni_GetData").checked = config.Source.kmoni.kmoni.GetData;
    document.getElementById("lmoni_GetData").checked = config.Source.kmoni.lmoni.GetData;
    document.getElementById("ymoni_GetData").checked = config.Source.kmoni.ymoni.GetData;
    document.getElementById("WolfxInterval").value = config.Source.wolfx.Interval / 1000;
    document.getElementById("kmoniInterval").value = config.Source.kmoni.kmoni.Interval / 1000;
    document.getElementById("lmoniInterval").value = config.Source.kmoni.lmoni.Interval / 1000;
    document.getElementById("ymoniInterval").value = config.Source.kmoni.ymoni.Interval / 1000;
    document.getElementById("msilInterval").value = config.Source.msil.Interval / 1000;
    if (config.Source.axis.AccessToken) document.getElementById("Axis_AccessToken").value = config.Source.axis.AccessToken;

    init();
  } else if (request.action == "Update_Data") {
    UpdateDataDraw(request.data);
  }
});

var updateWrap = document.getElementById("update-wrap");
var updateStatus = document.getElementById("update-status");
var updateVersion = document.getElementById("update-version");
var downloadLink = document.getElementById("downloadLink");
var update_detail = document.getElementById("update-detail");
function UpdateDataDraw(data) {
  document.getElementById("update-check-date").innerText = dateEncode(3, data.check_date);
  updateWrap.classList.remove("U-error", "U-available", "U-not_available");
  downloadLink.style.display = "none";
  update_detail.style.display = "none";

  if (data.check_error) {
    updateWrap.classList.add("U-error");
    updateStatus.innerText = "更新の確認中にエラーが発生しました。";
    updateVersion.innerText = "---";
  } else {
    if (data.update_available) {
      updateWrap.classList.add("U-available");
      updateStatus.innerText = "更新が利用可能です。";
      downloadLink.setAttribute("href", data.dl_page);
      updateVersion.innerText = "ver." + data.current_version + " > ver." + data.latest_version;
      update_detail.innerText = "更新内容：" + data.update_detail.replace(/\r?\n/g, "");
      downloadLink.style.display = "block";
      update_detail.style.display = "inline";
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
  config.system.crashReportAutoSend = document.getElementById("BugReportAutoSend").value;
  config.home.latitude = document.getElementById("latitude").value;
  config.home.longitude = document.getElementById("longitude").value;
  config.home.Section = document.getElementById("saibun").value;
  config.notice.voice.EEW = document.getElementById("EEW_Voice").value;
  config.notice.voice.EEWUpdate = document.getElementById("EEW2_Voice").value;
  config.Info.EQInfo.ItemCount = Number(document.getElementById("EQInfo_ItemCount").value);
  config.Info.RealTimeShake.List.ItemCount = Number(document.getElementById("RealTimeShake_ItemCount").value);
  config.Source.axis.GetData = document.getElementById("Axis_GetData").checked;
  config.Source.axis.AccessToken = document.getElementById("Axis_AccessToken").value;
  config.Source.wolfx.GetData = document.getElementById("Wolfx_GetData").checked;
  config.Source.msil.GetData = document.getElementById("msil_GetData").checked;
  config.Source.kmoni.kmoni.GetData = document.getElementById("kmoni_GetData").checked;
  config.Source.kmoni.lmoni.GetData = document.getElementById("lmoni_GetData").checked;
  config.Source.kmoni.ymoni.GetData = document.getElementById("ymoni_GetData").checked;
  config.Source.wolfx.Interval = Number(document.getElementById("WolfxInterval").value) * 1000;
  config.Source.kmoni.kmoni.Interval = Number(document.getElementById("kmoniInterval").value) * 1000;
  config.Source.kmoni.lmoni.Interval = Number(document.getElementById("lmoniInterval").value) * 1000;
  config.Source.kmoni.ymoni.Interval = Number(document.getElementById("ymoniInterval").value) * 1000;
  config.Source.msil.Interval = Number(document.getElementById("msilInterval").value) * 1000;

  config.notice.voice_parameter.rate = TTSspeed;
  config.notice.voice_parameter.pitch = TTSpitch;
  config.notice.voice_parameter.volume = TTSvolume;
  config.notice.voice_parameter.voice = TTSVoiceSelect.value;

  window.electronAPI.messageReturn({
    action: "settingReturn",
    data: config,
  });

  if (document.getElementById("startup").checked !== openAtLogin) {
    window.electronAPI.messageReturn({
      action: "openAtLogin",
      data: document.getElementById("startup").checked,
    });
  }

  window.close();
});

document.getElementById("cancel").addEventListener("click", function () {
  window.close();
});
document.getElementById("replayReset").addEventListener("click", function () {
  document.getElementById("replay").value = dateEncode(3, new Date()).replaceAll("/", "-");
  window.electronAPI.messageReturn({
    action: "replay",
    date: new Date(),
  });
  document.getElementById("replayOffset").innerText = "-";
});

document.getElementById("replayJump").addEventListener("click", function () {
  repVal = new Date(document.getElementById("replay").value);
  if (repVal > new Date()) {
    repVal = new Date();
    document.getElementById("replay").value = dateEncode(3, repVal).replaceAll("/", "-");
  }
  window.electronAPI.messageReturn({
    action: "replay",
    date: repVal,
  });
  offsetCalc();
});

function offsetCalc() {
  if (Replay == 0) {
    document.getElementById("replayOffset").innerText = "-";
  } else {
    var day = Math.floor(Replay / 1000 / 60 / 60 / 24);
    var hours = Math.floor((Replay / 1000 / 60 / 60) % 24);
    var minutes = Math.floor(((Replay / 1000 / 60) % 24) % 60);
    var seconds = Math.floor((((Replay / 1000) % 24) % 60) % 60);
    document.getElementById("replayOffset").innerText = "- " + day + "日 " + hours + "時間" + minutes + "分" + seconds + "秒";
  }
}

function init() {
  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [138.46, 32.99125],
    zoom: 4,
    attributionControl: true,
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
      },
      layers: [
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
      ],
    },
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  fetch("./Resource/Section_CenterLocation.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      Object.keys(json).forEach(function (elm) {
        var saibunElm = document.createElement("option");
        saibunElm.innerText = elm;
        document.getElementById("saibun").appendChild(saibunElm);
        if (elm == config.home.Section) saibunElm.selected = true;
      });
    });
  map.on("click", "basemap_fill", (e) => {
    document.getElementById("latitude").value = e.lngLat.lat;
    document.getElementById("longitude").value = e.lngLat.lng;
    markerElm.setLngLat(e.lngLat);

    var optionElm = Array.from(document.querySelectorAll("#saibun option")).find(function (elm) {
      return elm.innerText == e.features[0].properties.name;
    });
    if (optionElm) optionElm.selected = true;
  });

  /*
  map = L.map("mapcontainer", {
    maxBounds: [
      [90, 0],
      [-90, 360],
    ],

    zoomAnimation: true, //←オフにするとずれて不自然
    //preferCanvas: true,←かるくなる？
  });*/
  //L.control.scale({ imperial: false }).addTo(map);←縮尺

  const img = document.createElement("img");
  img.src = "./img/homePin.svg";
  img.classList.add("homeIcon");

  markerElm = new maplibregl.Marker(img).setLngLat([config.home.longitude, config.home.latitude]).addTo(map);
}

//eslint-disable-next-line
function MapReDraw() {
  lat = document.getElementById("latitude").value;
  lng = document.getElementById("longitude").value;
  markerElm.setLngLat([lng, lat]);
}

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
    if (config && elm.name == config.notice.voice_parameter.voice) {
      selectedT = " selected";
    }

    opts += "<option" + selectedT + " value='" + elm.name + "'>" + elm.name + "</option>";
  });
  TTSVoiceSelect.innerHTML = opts;
};
document.getElementById("speak_test").addEventListener("click", function () {
  speechSynthesis.cancel();

  const uttr = new SpeechSynthesisUtterance();
  uttr.text = "音声合成のテストです";

  uttr.lang = "ja-JP";
  if (TTSVoiceSelect.value) {
    Svoice = voices.find(function (elm) {
      return elm.name == TTSVoiceSelect.value;
    });
    uttr.voice = Svoice;
  }
  uttr.rate = TTSspeed;
  uttr.pitch = TTSpitch;
  uttr.volume = TTSvolume;
  speechSynthesis.speak(uttr);
});
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
