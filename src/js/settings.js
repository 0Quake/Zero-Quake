var setting;
var markerElm;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "setting") {
    document.getElementById("splash").style.display = "none";

    setting = request.data.config;
    document.getElementById("softVersion").innerText = request.data.softVersion;

    document.getElementById("latitude").value = setting.home.latitude;
    document.getElementById("longitude").value = setting.home.longitude;
    document.getElementById("EEW_Voice").value = setting.notice.voice.EEW;
    document.getElementById("EEW2_Voice").value = setting.notice.voice.EEWUpdate;
    document.getElementById("EQInfo_ItemCount").value = setting.Info.EQInfo.ItemCount;
    document.getElementById("RealTimeShake_ItemCount").value = setting.Info.RealTimeShake.List.ItemCount;

    TTSvolumeSet(setting.notice.voice_parameter.volume);
    TTSpitchSet(setting.notice.voice_parameter.pitch);
    TTSspeedSet(setting.notice.voice_parameter.rate);

    selectBoxSet(document.getElementById("TTSvoiceSelect"), setting.notice.voice_parameter.voice)


    selectBoxSet(document.getElementById("BugReportAutoSend"), setting.system.crashReportAutoSend)
    document.getElementById("Axis_GetData").checked = setting.Source.axis.GetData;
    document.getElementById("Wolfx_GetData").checked = setting.Source.wolfx.GetData;
    document.getElementById("msil_GetData").checked = setting.Source.msil.GetData;
    document.getElementById("kmoni_GetData").checked = setting.Source.kmoni.kmoni.GetData;
    document.getElementById("lmoni_GetData").checked = setting.Source.kmoni.lmoni.GetData;
    document.getElementById("ymoni_GetData").checked = setting.Source.kmoni.ymoni.GetData;
    document.getElementById("WolfxInterval").value = setting.Source.wolfx.Interval / 1000;
    document.getElementById("kmoniInterval").value = setting.Source.kmoni.kmoni.Interval / 1000;
    document.getElementById("lmoniInterval").value = setting.Source.kmoni.lmoni.Interval / 1000;
    document.getElementById("ymoniInterval").value = setting.Source.kmoni.ymoni.Interval / 1000;
    document.getElementById("msilInterval").value = setting.Source.msil.Interval / 1000;
    if (setting.Source.axis.AccessToken) document.getElementById("Axis_AccessToken").value = setting.Source.axis.AccessToken;

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
  setting.system.crashReportAutoSend = document.getElementById("BugReportAutoSend").value;
  setting.home.latitude = document.getElementById("latitude").value;
  setting.home.longitude = document.getElementById("longitude").value;
  setting.home.Section = document.getElementById("saibun").value;
  setting.notice.voice.EEW = document.getElementById("EEW_Voice").value;
  setting.notice.voice.EEWUpdate = document.getElementById("EEW2_Voice").value;
  setting.Info.EQInfo.ItemCount = Number(document.getElementById("EQInfo_ItemCount").value);
  setting.Info.RealTimeShake.List.ItemCount = Number(document.getElementById("RealTimeShake_ItemCount").value);
  setting.Source.axis.GetData = document.getElementById("Axis_GetData").checked;
  setting.Source.axis.AccessToken = document.getElementById("Axis_AccessToken").value;
  setting.Source.wolfx.GetData = document.getElementById("Wolfx_GetData").checked;
  setting.Source.msil.GetData = document.getElementById("msil_GetData").checked;
  setting.Source.kmoni.kmoni.GetData = document.getElementById("kmoni_GetData").checked;
  setting.Source.kmoni.lmoni.GetData = document.getElementById("lmoni_GetData").checked;
  setting.Source.kmoni.ymoni.GetData = document.getElementById("ymoni_GetData").checked;
  setting.Source.wolfx.Interval = Number(document.getElementById("WolfxInterval").value) * 1000;
  setting.Source.kmoni.kmoni.Interval = Number(document.getElementById("kmoniInterval").value) * 1000;
  setting.Source.kmoni.lmoni.Interval = Number(document.getElementById("lmoniInterval").value) * 1000;
  setting.Source.kmoni.ymoni.Interval = Number(document.getElementById("ymoniInterval").value) * 1000;
  setting.Source.msil.Interval = Number(document.getElementById("msilInterval").value) * 1000;

  setting.notice.voice_parameter.rate = TTSspeed;
  setting.notice.voice_parameter.pitch = TTSpitch;
  setting.notice.voice_parameter.volume = TTSvolume;
  setting.notice.voice_parameter.voice = TTSVoiceSelect.value;

  window.electronAPI.messageReturn({
    action: "settingReturn",
    data: setting,
  });
  window.close();
});

document.getElementById("cancel").addEventListener("click", function () {
  window.close();
});

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
        if (elm == setting.home.Section) saibunElm.selected = true;
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

  markerElm = new maplibregl.Marker(img).setLngLat([setting.home.longitude, setting.home.latitude]).addTo(map);
}

//eslint-disable-next-line
function MapReDraw() {
  gjmap.setStyle({
    fillColor: "#333",
  });
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
    if (setting && elm.name == setting.notice.voice_parameter.voice) {
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
function selectBoxSet(selectElm,TargetValue){
  selectElm.querySelectorAll("option").forEach(function(elm){
    if(elm.value==TargetValue){
      elm.setAttribute("selected",true)
      return true
    }
  })
}