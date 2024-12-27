var map;
var points = {};
var Tsunami_MajorWarning, Tsunami_Warning, Tsunami_Watch, Tsunami_Yoho;

var psWaveList = [];
var tsunamiAlertNow = false;
var hinanjoLayers = [];
var knet_already_draw = false;
var now_EEW = [];
var Replay = 0;
var background = false;
var knetMapData;
var snetMapData;
var userPosition = [138.46, 32.99125];
var userZoom = 4;
var userMotion;

document.body.addEventListener("mouseover", function () {
  background = false;
});
var tsunamiStations = [];

fetch("./Resource/TsunamiStations.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    tsunamiStations = data;
  });

var TREMRTS_TMP;
var SeisJS_TMP;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "init") {
    init();
  } else if (request.action == "activate") {
    background = false;
    if (knetMapData) kmoniMapUpdate(knetMapData, "knet");
    if (snetMapData) kmoniMapUpdate(snetMapData, "snet");
    if (TREMRTS_TMP) TREMRTSUpdate(TREMRTS_TMP);
    if (SeisJS_TMP) SeisJSUpdate(SeisJS_TMP);
  } else if (request.action == "unactivate") {
    background = true;
  } else if (request.action == "EEW_AlertUpdate") {
    EEW_AlertUpdate(request.data);
    psWaveEntry();
    JMAEstShindoControl(request.data);
  } else if (request.action == "UpdateStatus") {
    UpdateStatus(request.Updatetime, request.LocalTime, request.type, request.condition, request.vendor);
  } else if (request.action == "kmoniUpdate") {
    UpdateStatus(request.Updatetime, request.LocalTime, "kmoniImg", "success");
    if (!background || !knet_already_draw) kmoniMapUpdate(request.data, "knet");
  } else if (request.action == "SnetUpdate") {
    UpdateStatus(request.Updatetime, request.LocalTime, "msilImg", "success");
    kmoniMapUpdate(request.data, "snet");
  } else if (request.action == "TREM-RTSUpdate") {
    TREMRTS_TMP = request.data;
    TREMRTSUpdate(request.data);
  } else if (request.action == "SeisJSUpdate") {
    SeisJS_TMP = request.data;
    SeisJSUpdate(request.data);
  } else if (request.action == "Replay") {
    Replay = request.data;
    document.getElementById("replayFrame").style.display = Replay == 0 ? "none" : "block";
    Object.keys(points).forEach(function (elm) {
      pointData = points[elm];
      pointData.markerElm.style.background = "rgba(128,128,128,0.5)";
      pointData.markerElm.classList.remove("strongDetectingMarker", "detectingMarker", "marker_Int");
      pointData.popupContent = "<h3 class='PointName' style='border-bottom:solid 2px rgba(128,128,128,0.5)'>" + (elm.Name ? elm.Name : "") + "<span>" + elm.Type + "_" + elm.Code + "</span></h3>";
      if (pointData.popup.isOpen()) pointData.popup.setHTML(pointData.popupContent);
    });
    psWaveEntry();
  } else if (request.action == "EQInfo") eqInfoDraw(request.data, request.source);
  else if (request.action == "notification_Update") show_errorMsg(request.data);
  else if (request.action == "EQDetect") EQDetect(request.data);
  else if (request.action == "EQDetectFinish") EQDetectFinish(request.data);
  else if (request.action == "tsunamiUpdate") tsunamiDataUpdate(request.data);
  else if (request.action == "NankaiTroughInfo") NankaiTroughInfo(request.data);

  document.getElementById("splash").style.display = "none";
  return true;
});

window.addEventListener("load", () => {
  //オフライン警告表示・非表示
  if (navigator.onLine) UpdateStatus(new Date(), new Date(), "Internet", "success");
  else {
    document.getElementById("offline").showModal();
    document.getElementById("offline2").style.display = "block";
    UpdateStatus(new Date(), new Date(), "Internet", "Error");
  }

  //強震モニタお知らせ取得
  fetch("http://www.kmoni.bosai.go.jp/webservice/maintenance/message.json?_=" + Number(new Date()))
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      document.getElementById("kmoni_Message").innerHTML = json.message;
    });

  psWaveAnm(); //予報円描画着火
  setInterval(function () {
    //時計（ローカル時刻）更新
    if (UTDialogShow && !background) document.getElementById("PC_TIME").textContent = NormalizeDate(3, new Date() - Replay);
    document.getElementById("all_UpdateTime").textContent = NormalizeDate(3, new Date() - Replay);
  }, 500);

  var mapSelect = document.getElementsByName("mapSelect");
  mapSelect.forEach(function (elm) {
    elm.addEventListener("change", function () {
      layerSelect(this.value);
    });
  });
  document.getElementsByName("overlaySelect").forEach(function (elm) {
    elm.addEventListener("change", function () {
      overlaySelect(this.value, this.checked);
    });
  });
});
//オフライン警告非表示
window.addEventListener("online", () => {
  document.getElementById("offline").close();
  document.getElementById("offline2").style.display = "none";
  UpdateStatus(new Date(), new Date(), "Internet", "success");
});
//オフライン警告表示
window.addEventListener("offline", () => {
  document.getElementById("offline").showModal();
  document.getElementById("offline2").style.display = "block";
  UpdateStatus(new Date(), new Date(), "Internet", "Error");
});

function replay(date) {
  if (date) date = new Date(date);
  window.electronAPI.messageReturn({
    action: "replay",
    date: date,
  });
}

//🔴緊急地震速報🔴
var template = document.getElementById("EEWTemplate");
var epiCenter = [];
var EEW_LocalIDs = [];
//EEW追加・更新
function EEW_AlertUpdate(data) {
  data.forEach((elm) => {
    var sameEQ = now_EEW.find(function (elm2) {
      return elm.EventID == elm2.EventID;
    });

    if (!sameEQ) {
      //新しい地震、新しい報
      if (elm.is_cancel) return;

      var clone = template.content.cloneNode(true);

      var alertflgTmp = "(" + elm.alertflg + ")";
      if (elm.alertflg) clone.querySelector(".alertflg").textContent = alertflgTmp;

      if (elm.alertflg == "警報") clone.querySelector(".EEWWrap").classList.add("keihou");
      else if (elm.alertflg == "予報") clone.querySelector(".EEWWrap").classList.add("yohou");
      else if (elm.alertflg == "EarlyEst") clone.querySelector(".EEWWrap").classList.add("EarlyEst");

      EEWID++;
      EEW_LocalIDs[elm.EventID] = EEWID;

      clone.querySelector(".EEWLocalID").textContent = EEWID;
      clone.querySelector(".serial").textContent = elm.serial;
      clone.querySelector(".maxInt").textContent = elm.maxInt ? elm.maxInt : "?";
      clone.querySelector(".maxInt").style.background = NormalizeShindo(elm.maxInt, 2)[0];
      clone.querySelector(".maxInt").style.color = NormalizeShindo(elm.maxInt, 2)[1];
      clone.querySelector(".is_final").style.display = elm.is_final ? "inline" : "none";
      clone.querySelector(".canceled").style.display = elm.is_cancel ? "flex" : "none";
      clone.querySelector(".region_name").textContent = elm.region_name ? elm.region_name : "震源地域不明";
      clone.querySelector(".origin_time").textContent = NormalizeDate(3, elm.origin_time);
      clone.querySelector(".magnitude").textContent = elm.magnitude ? Math.round(elm.magnitude * 10) / 10 : "不明";
      clone.querySelector(".depth").textContent = elm.depth ? Math.round(elm.depth) : "不明";
      clone.querySelector(".training").style.display = elm.is_training ? "block" : "none";
      clone.querySelector(".EpicenterElement").style.display = !elm.isPlum ? "block" : "none";
      clone.querySelector(".NoEpicenterElement").style.display = elm.isPlum ? "block" : "none";
      clone.querySelector(".userIntensity").textContent = elm.userIntensity ? NormalizeShindo(elm.userIntensity) : "?";
      clone.querySelector(".userDataWrap").style.background = NormalizeShindo(elm.userIntensity, 2)[0];
      clone.querySelector(".userDataWrap").style.color = NormalizeShindo(elm.userIntensity, 2)[1];
      if (elm.distance < 10000) distanceTmp = Math.round(elm.distance);
      else distanceTmp = Math.round(elm.distance / 1000) / 10 + "万";
      clone.querySelector(".distance").textContent = elm.distance ? distanceTmp + "km" : "";
      clone.querySelector(".EEWWrap").setAttribute("id", "EEW-" + elm.EventID);

      document.getElementById("EEW-Panel").appendChild(clone);
      document.getElementById("sokuho-Panel").scroll(0, 0);
    } else {
      //既知の地震、新しい報もしくは情報更新
      var EQMenu = document.getElementById("EEW-" + elm.EventID);

      if (EQMenu) {
        alertflgTmp = "(" + elm.alertflg + ")";
        if (!elm.alertflg) alertflgTmp = "";
        EQMenu.querySelector(".alertflg").textContent = alertflgTmp;
        EQMenu.querySelector(".serial").textContent = elm.serial;

        if (elm.alertflg == "警報") {
          EQMenu.classList.add("keihou");
          EQMenu.classList.remove("yohou");
        } else if (elm.alertflg == "予報") {
          EQMenu.classList.add("yohou");
          EQMenu.classList.remove("keihou");
        }

        EQMenu.querySelector(".maxInt").textContent = elm.maxInt ? elm.maxInt : "?";
        EQMenu.querySelector(".maxInt").style.background = NormalizeShindo(elm.maxInt, 2)[0];
        EQMenu.querySelector(".maxInt").style.color = NormalizeShindo(elm.maxInt, 2)[1];
        EQMenu.querySelector(".is_final").style.display = elm.is_final ? "inline" : "none";
        EQMenu.querySelector(".canceled").style.display = elm.is_cancel ? "flex" : "none";
        EQMenu.querySelector(".region_name").textContent = elm.region_name ? elm.region_name : "震源地域不明";
        EQMenu.querySelector(".origin_time").textContent = NormalizeDate(3, elm.origin_time);
        EQMenu.querySelector(".magnitude").textContent = elm.magnitude ? Math.round(elm.magnitude * 10) / 10 : "不明";
        EQMenu.querySelector(".depth").textContent = elm.depth ? Math.round(elm.depth) : "不明";
        EQMenu.querySelector(".EpicenterElement").style.display = !elm.isPlum ? "block" : "none";
        EQMenu.querySelector(".NoEpicenterElement").style.display = elm.isPlum ? "block" : "none";
        EQMenu.querySelector(".userIntensity").textContent = elm.userIntensity ? NormalizeShindo(elm.userIntensity) : "?";
        EQMenu.querySelector(".userDataWrap").style.background = NormalizeShindo(elm.userIntensity, 2)[0];
        EQMenu.querySelector(".userDataWrap").style.color = NormalizeShindo(elm.userIntensity, 2)[1];

        if (elm.distance < 10000) distanceTmp = Math.round(elm.distance);
        else distanceTmp = Math.round(elm.distance / 1000) / 10 + "万";
        EQMenu.querySelector(".distance").textContent = elm.distance ? distanceTmp + "km" : "";
      }
    }
    epiCenterUpdate(elm);

    now_EEW = now_EEW.filter(function (elm2) {
      return elm2.EventID !== elm.EventID;
    });
    now_EEW.push(elm);
  });
  now_EEW = now_EEW.filter(function (elm) {
    var stillEQ = data.find(function (elm2) {
      return elm.EventID == elm2.EventID;
    });
    var EEWItem = document.getElementById("EEW-" + elm.EventID);

    //終わった地震
    if (!stillEQ) {
      epiCenterClear(elm.EventID);
      if (EEWItem) EEWItem.remove();
    } else if (elm.is_cancel) {
      epiCenterClear(elm.EventID);
      setTimeout(function () {
        if (EEWItem) EEWItem.remove();
      }, 10000);
    }
    return stillEQ;
  });
  if (now_EEW.length == 0) EEWID = 0;

  var EEWData = data.filter((elm) => {
    return !elm.is_cancel;
  });
  if (EEWData.length == 0) document.body.classList.remove("EEWMode");
  else document.body.classList.add("EEWMode");

  document.getElementById("noEEW").style.display = now_EEW.length == 0 && !now_tsunami && EQDetectItem.length == 0 ? "block" : "none";
}

var EEWID = 0;
//震源更新
function epiCenterUpdate(elm) {
  eid = Number(elm.EventID);
  latitude = elm.latitude;
  longitude = elm.longitude;

  if (map && latitude && longitude) {
    var epicenterElm = epiCenter.find(function (elm2) {
      return elm2.eid == eid;
    });
    var tooltipContent;
    if (elm.source == "simulation") tooltipContent = "再現";
    else if (elm.is_training) tooltipContent = "訓練";
    else if (elm.isPlum) tooltipContent = "仮定震源";

    if (epicenterElm && epicenterElm.markerElm) {
      //情報更新
      epicenterElm.markerElm.setLngLat([longitude, latitude]);
      epicenterElm.latitude = latitude;
      epicenterElm.longitude = longitude;
      if (tooltipContent) epicenterElm.ESPopup2.setLngLat([longitude, latitude]).setText(tooltipContent).addTo(map);
      else epicenterElm.ESPopup2.remove();
    } else {
      //初報
      var EEWIDTmp = EEW_LocalIDs[eid];

      const img = document.createElement("img");
      img.src = "./img/epicenter.svg";
      img.classList.add("epicenterIcon");

      map.panTo([longitude, latitude], { animate: false });
      map.zoomTo(8, { animate: false });

      var ESPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "epiCenterTooltip", offset: [0, -17] }).setText(EEWIDTmp).setLngLat([longitude, latitude]).addTo(map);
      var ESPopup2 = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "epiCenterTooltip2", offset: [0, 37] }).setLngLat([longitude, latitude]);
      if (tooltipContent) ESPopup2.setText(tooltipContent).addTo(map);

      var ECMarker = new maplibregl.Marker({ element: img }).setLngLat([longitude, latitude]).addTo(map);

      epiCenter.push({ eid: eid, markerElm: ECMarker, latitude: latitude, longitude: longitude, EEWID: Number(EEWIDTmp), ESPopup: ESPopup, ESPopup2: ESPopup2 });
      displayTmp = epiCenter.length > 1 ? "inline-block" : "none";
      document.querySelectorAll(".epiCenterTooltip,.EEWLocalID").forEach(function (elm3) {
        elm3.style.display = displayTmp;
      });
    }
  }

  var pswaveFind = psWaveList.find(function (elm) {
    return elm.id == eid;
  });
  if (pswaveFind) {
    if (latitude) pswaveFind.data.latitude = latitude;
    if (longitude) pswaveFind.data.longitude = longitude;
    if (elm.origin_time) pswaveFind.data.originTime = elm.origin_time;

    if (pswaveFind.SIElm) pswaveFind.SIElm.setLngLat([longitude, latitude]);
  }
  latitudeTmp = latitude;
  longitudeTmp = longitude;
  psWaveList.forEach(function (elm) {
    psWaveCalc(elm.id);
  });
}
//震源クリア
function epiCenterClear(eid) {
  eid = Number(eid);
  if (map) {
    epiCenter = epiCenter.filter(function (elm2) {
      if (elm2.eid == eid) {
        epicenterElm = elm2;
      }
      return elm2.eid !== eid;
    });
    if (epicenterElm) {
      if (epicenterElm.markerElm) epicenterElm.markerElm.remove();
      epicenterElm.markerElm = null;
      if (epicenterElm.ESPopup) epicenterElm.ESPopup.remove();
      epicenterElm.ESPopup = null;
      if (epicenterElm.ESPopup2) epicenterElm.ESPopup2.remove();
      epicenterElm.ESPopup2 = null;
    }

    returnToUserPosition();
  }
}

//🔴地震情報🔴
var template2 = document.getElementById("EQListTemplate");
var template2_2 = document.getElementById("EQListTemplate2");
var EQListWrap;
function eqInfoDraw(data, source) {
  var EQTemplate;
  if (source == "jma") {
    eqInfoDataJMA = data;
    EQTemplate = template2;
    EQListWrap = document.getElementById("JMA_EqInfo");
  } else if (source == "usgs") {
    EQTemplate = template2_2;
    EQListWrap = document.getElementById("USGS_EqInfo");
  }
  removeChild(EQListWrap);

  data.forEach(function (elm, index) {
    var clone = EQTemplate.content.cloneNode(true);

    clone.querySelector(".EQI_epiCenter").textContent = elm.epiCenter ? elm.epiCenter : "震源調査中";
    clone.querySelector(".EQI_datetime").textContent = elm.OriginTime ? NormalizeDate(4, elm.OriginTime) : "発生時刻不明";
    clone.querySelector(".EQI_magnitude").textContent = elm.M !== null ? elm.M.toFixed(1) : "不明";
    if (source == "jma") {
      clone.querySelector(".EQItem").setAttribute("id", "EQItem_" + elm.eventId);
      clone.querySelector(".EQItem").setAttribute("tabindex", Math.max(-1, 0 - index));
      var maxITmp = elm.maxI;
      if (maxITmp == "不明") maxITmp = "?";
      maxITmp = NormalizeShindo(maxITmp, 0);
      var shindoColor = NormalizeShindo(maxITmp, 2);
      var LgIntColor = LgIntConvert(elm.maxLgInt);

      clone.querySelector(".EQI_maxI").textContent = maxITmp;
      clone.querySelector(".EQI_maxI").style.background = shindoColor[0];
      clone.querySelector(".EQI_maxI").style.color = shindoColor[1];
      clone.querySelector(".EQI_LgInt").style.display = Boolean(elm.maxLgInt) ? "block" : "none";
      clone.querySelector(".EQI_LgIntBody").textContent = elm.maxLgInt;
      clone.querySelector(".EQI_LgInt").style.background = LgIntColor[0];
      clone.querySelector(".EQI_LgInt").style.color = LgIntColor[1];
      clone.querySelector(".canceled").style.display = elm.cancel ? "flex" : "none";
      clone.querySelector(".EEWNotes").style.display = elm.category == "EEW" ? "block" : "none";
      clone.querySelector(".TestNotes").style.display = elm.status == "試験" ? "block" : "none";
      clone.querySelector(".trainingNotes").style.display = elm.status == "訓練" ? "block" : "none";

      if (elm.cancel) clone.querySelector(".EQItem").classList.add("EQI_canceled");
      else {
        clone.querySelector(".EQItem").setAttribute("title", "クリックして詳細を表示");
        clone.querySelector(".EQItem").addEventListener("click", function () {
          window.electronAPI.messageReturn({
            action: "EQInfoWindowOpen",
            url: "src/EQDetail.html",
            eid: elm.eventId,
            urls: elm.DetailURL,
            axisData: elm.axisData,
          });
        });
      }
    } else if (source == "usgs") {
      var colorTmp = NormalizeMMI(elm.maxI, 2);
      clone.querySelector(".EQItem").setAttribute("tabindex", Math.max(-1, 0 - index));
      clone.querySelector(".EQI_maxI").textContent = NormalizeMMI(elm.maxI, 1);
      clone.querySelector(".EQI_maxI").style.background = colorTmp[0];
      clone.querySelector(".EQI_maxI").style.color = colorTmp[1];

      clone.querySelector(".EQItem").addEventListener("click", function () {
        window.electronAPI.messageReturn({
          action: "EQInfoWindowOpen_IS_WebURL",
          url: String(elm.DetailURL),
        });
      });
    }
    EQListWrap.appendChild(clone);
  });
}

//🔴地震検知🔴
var EQDetectItem = [];
var EQDetectTemplate = document.getElementById("EQDetectTemplate");
function EQDetect(data) {
  if (!map.loaded()) return;
  var EQD_Item = EQDetectItem.find(function (elm) {
    return elm.id == data.id;
  });

  var DetectRegions = data.Codes.map(function (elm) {
    return elm.Region;
  });
  DetectRegions = Array.from(new Set(DetectRegions));

  if (EQD_Item) {
    //情報更新
    EQD_Item.lat = data.lat;
    EQD_Item.lng = data.lng;

    let _center = turf.point([data.lng, data.lat]);
    let _radius = data.Radius + 5;
    let _options = {
      steps: 80,
      units: "kilometers",
    };

    let _circle = turf.circle(_center, _radius, _options);
    if (map && map.getSource("EQDItem_" + data.id)) map.getSource("EQDItem_" + data.id).setData(_circle);

    EQD_Item.ECMarker.setLngLat([data.lng, data.lat]);

    var EQDItem = document.getElementById("EQDItem_" + data.id);
    EQDItem.classList.remove("lv1", "lv2");
    EQDItem.classList.add("lv" + data.Lv);
    EQDItem.querySelector(".EQD_Regions").innerText = DetectRegions.join(" ");
  } else {
    //初回検知
    var clone = EQDetectTemplate.content.cloneNode(true);
    var EQDItem = clone.querySelector(".EQDItem");
    EQDItem.setAttribute("id", "EQDItem_" + data.id);
    EQDItem.classList.add("lv" + data.Lv);
    EQDItem.querySelector(".EQD_Regions").innerText = DetectRegions.join(" ");
    document.getElementById("EQDetect-Panel").prepend(clone);

    const img = document.createElement("img");
    img.src = "./img/epicenter_EQDetect.svg";
    img.classList.add("epicenterIcon");

    var ECMarker = new maplibregl.Marker({ element: img }).setLngLat([data.lng, data.lat]).addTo(map);

    EQDetectItem.push({
      id: data.id,
      lat: data.lat,
      lng: data.lng,
      ECMarker: ECMarker,
    });

    let _center = turf.point([data.lng, data.lat]);
    let _radius = data.Radius + 5;
    let _options = {
      steps: 80,
      units: "kilometers",
    };

    let _circle = turf.circle(_center, _radius, _options);

    map.addSource("EQDItem_" + data.id, {
      type: "geojson",
      data: _circle,
    });

    map.addLayer({
      id: "EQDItemF_" + data.id,
      type: "fill",
      source: "EQDItem_" + data.id,
      paint: {
        "fill-color": "#FFF",
        "fill-opacity": 0.3,
      },
    });

    map.panTo([data.lng, data.lat], { animate: false });
    map.fitBounds(turf.bbox(_circle), { maxZoom: 7, animate: false, padding: 100 });
  }
  document.getElementById("noEEW").style.display = now_EEW.length == 0 && !now_tsunami && EQDetectItem.length == 0 ? "block" : "none";

  if (EQDetectItem.length != 0) document.body.classList.add("EQDetecting");
}
//地震検知終了
function EQDetectFinish(id) {
  EQDetectItem.find(function (elmA, index) {
    if (elmA.id == id) {
      if (map && map.getLayer("EQDItemF_" + id)) map.removeLayer("EQDItemF_" + id);
      if (map && map.getSource("EQDItem_" + id)) map.removeSource("EQDItem_" + id);
      elmA.ECMarker.remove();

      EQDetectItem.splice(index, 1);
      return true;
    }
  });

  var eqdItem = document.getElementById("EQDItem_" + id);
  if (eqdItem) eqdItem.remove();
  document.getElementById("noEEW").style.display = now_EEW.length == 0 && !now_tsunami && EQDetectItem.length == 0 ? "block" : "none";

  if (EQDetectItem.length == 0) document.body.classList.remove("EQDetecting");

  returnToUserPosition();
}

//🔴UI🔴
var updateTimeDialog = document.getElementById("UpdateTime_detail");

//サイドバー表示・非表示
document.getElementById("SideBarToggle").addEventListener("click", function () {
  document.getElementById("sideBar").classList.toggle("close");
  window.dispatchEvent(new Event("resize"));
});
document.getElementById("sideBar").addEventListener("transitionend", function () {
  window.dispatchEvent(new Event("resize"));
});

//津波情報ウィンドウ表示
document.getElementById("TsunamiDetail").addEventListener("click", function () {
  window.electronAPI.messageReturn({
    action: "TsunamiWindowOpen",
  });
});
//設定ウィンドウ表示
document.getElementById("setting").addEventListener("click", function () {
  window.electronAPI.messageReturn({
    action: "SettingWindowOpen",
  });
});

//情報更新時刻更新
var UpdateTime = [];
function UpdateStatus(updateTime, LocalTime, type, condition, vendor) {
  if (updateTime > new Date() - Replay) return;
  UpdateTime[type] = { type: type, updateTime: updateTime, LocalTime: LocalTime, condition: condition, vendor: vendor };
  if (UTDialogShow && !background) kmoniTimeRedraw(updateTime, LocalTime, type, condition, vendor);
}
function kmoniTimeRedraw(updateTime, LocalTime, type, condition) {
  document.getElementById(type + "_UT").textContent = NormalizeDate(3, updateTime);
  var iconElm = document.getElementById(type + "_ICN");

  switch (condition) {
    case "success":
      iconElm.classList.add("Success");
      iconElm.classList.remove("Error");
      if (!background) {
        iconElm.classList.add("SuccessAnm");
        iconElm.addEventListener("animationend", function () {
          this.classList.remove("SuccessAnm");
        });
      }
      break;
    case "Error":
      iconElm.classList.remove("Success");
      iconElm.classList.add("Error");
      break;
    case "Disconnect":
      iconElm.classList.remove("Success");
      iconElm.classList.remove("Error");
      break;
  }
}

var UTDialogShow = false;
//接続状況ダイアログ表示
document.getElementById("UpdateTimeWrap").addEventListener("click", function () {
  updateTimeDialog.showModal();
  UTDialogShow = true;
  Object.keys(UpdateTime).forEach(function (elm) {
    var utData = UpdateTime[elm];
    kmoniTimeRedraw(utData.updateTime, utData.LocalTime, utData.type, utData.condition, utData.vendor);
  });
});
//接続状況ダイアログ非表示
document.getElementById("UpdateTimeClose").addEventListener("click", function () {
  updateTimeDialog.close();
  UTDialogShow = false;
});

var errorMsgBox = document.getElementById("errorMsg");
function show_errorMsg(data) {
  errorMsgBox.style.display = "block";
  errorMsgBox.className = data.type + "Msg";
  document.getElementById("errorContent").innerText = data.message;
}
document.getElementById("errorMsg_close").addEventListener("click", function () {
  errorMsgBox.style.display = "none";
});

document.getElementById("CloseTsunamiCancel").addEventListener("click", function () {
  document.getElementById("tsunamiCancel").style.display = "none";
});
document.getElementById("CloseTsunamiRevocation").addEventListener("click", function () {
  document.getElementById("tsunamiRevocation").style.display = "none";
});

function psWaveAnm() {
  if (now_EEW.length > 0) {
    for (elm of now_EEW) {
      if (!elm.is_cancel) psWaveCalc(elm.EventID);
    }
  }
  if (background) setTimeout(psWaveAnm, 1000);
  else {
    setTimeout(function () {
      requestAnimationFrame(psWaveAnm);
    }, 250);
  }
}

document.getElementById("layerSwitch_close").addEventListener("click", function () {
  document.getElementById("menu_wrap").classList.remove("menu_show");
});
document.getElementById("menu").addEventListener("click", function (e) {
  e.stopPropagation();
});

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

function overlaySelect(layerName, checked) {
  var visibility = checked ? "visible" : "none";
  if (layerName == "kmoni_points") {
    overlaySelect("knet_points", checked);
    overlaySelect("snet_points", checked);
    overlaySelect("TREMRTS_points", checked);
    overlaySelect("SEISJS_points", checked);

    config.data.kmoni_points_show = checked;
    window.electronAPI.messageReturn({
      action: "ChangeConfig",
      from: "Other",
      data: config,
    });
    return;
  }
  if (layerName == "hinanjo") {
    map.setLayoutProperty("hinanjo", "visibility", checked ? "visible" : "none");
    hinanjoLayers.forEach(function (elm) {
      map.setLayoutProperty(elm, "visibility", checked ? "visible" : "none");
    });
  } else {
    if (layerName == "gsi_vector") {
      try {
        ["河川中心線", "水涯線", "道路中心線ZL4-10国道・高速", "道路中心線色0", "鉄道中心線", "建築物0", "道路中心線色1", "道路中心線色橋1", "道路縁", "行政区画界線25000市区町村界", "注記シンボル付きソート順100以上", "注記シンボル付きソート順100未満"].forEach(function (elm) {
          map.setLayoutProperty(elm, "visibility", visibility);
        });
      } catch (e) {}
    } else {
      map.setLayoutProperty(layerName, "visibility", visibility);
    }

    if (layerName == "over2") document.getElementById("legend1").style.display = checked ? "inline-block" : "none";
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

var over3_visiblity = false;
var over4_visiblity = false;

//マップ初期化など
function init() {
  if (map) return;
  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [138.46, 32.99125],
    zoom: 4,
    attributionControl: true,
    pitchWithRotate: false,
    dragRotate: false,
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
        tsunami: {
          type: "geojson",
          data: "./Resource/tsunami.json",
          tolerance: 1.6,
          attribution: "気象庁",
        },
        plate: {
          type: "geojson",
          data: "./Resource/plate.json",
          tolerance: 2,
        },
        submarine: {
          type: "raster",
          tiles: ["./Resource/Submarine/{z}/{x}/{y}.jpg"],
          tileSize: 256,
          attribution: "NOAA, Peter Bird",
          minzoom: 0,
          maxzoom: 5,
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
        knet_points: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        },
        snet_points: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        },
        TREMRTS_points: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        },
        SEISJS_points: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        },
      },
      layers: [
        {
          id: "submarine",
          type: "raster",
          source: "submarine",
          paint: {
            "raster-fade-duration": 500,
          },
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
          id: "tsunami_Yoho",
          type: "line",
          source: "tsunami",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": config.color.Tsunami.TsunamiYohoColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
          },
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
            "line-color": config.color.Tsunami.TsunamiWatchColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
          },
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
            "line-color": config.color.Tsunami.TsunamiWarningColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
          },
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
            "line-color": config.color.Tsunami.TsunamiMajorWarningColor,
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 10, 80, 18, 300],
          },
          filter: ["==", "name", ""],
        },

        {
          id: "prefmap_fill",
          type: "fill",
          source: "prefmap",
          paint: {
            "fill-color": "#333",
            "fill-opacity": 1,
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
          id: "basemap_LINE",
          type: "line",
          source: "basemap",
          minzoom: 6,
          paint: {
            "line-color": "#666",
            "line-width": 1,
          },
        },
        { id: "Int1", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["1"].background }, filter: ["==", "name", ""] },
        { id: "Int2", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["2"].background }, filter: ["==", "name", ""] },
        { id: "Int3", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["3"].background }, filter: ["==", "name", ""] },
        { id: "Int4", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["4"].background }, filter: ["==", "name", ""] },
        { id: "Int5-", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["5m"].background }, filter: ["==", "name", ""] },
        { id: "Int5+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["5p"].background }, filter: ["==", "name", ""] },
        { id: "Int6-", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["6m"].background }, filter: ["==", "name", ""] },
        { id: "Int6+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["6p"].background }, filter: ["==", "name", ""] },
        { id: "Int7", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["7"].background }, filter: ["==", "name", ""] },
        {
          id: "prefmap_LINE",
          type: "line",
          source: "prefmap",
          paint: {
            "line-color": "#999",
            "line-width": 1,
          },
        },
        {
          id: "worldmap_fill",
          type: "fill",
          source: "worldmap",
          paint: {
            "fill-color": "#333",
            "fill-opacity": 1,
          },
        },
        {
          id: "worldmap_LINE",
          type: "line",
          source: "worldmap",
          paint: {
            "line-color": "#666",
            "line-width": 1,
          },
        },
        {
          id: "lake_fill",
          type: "fill",
          source: "lake",
          paint: {
            "fill-color": "#325385",
            "fill-opacity": 0.5,
          },
          minzoom: 6,
        },
        { id: "河川中心線", type: "line", source: "v", "source-layer": "RvrCL", filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]], paint: { "line-color": "#2468cb66", "line-width": 2 }, layout: { visibility: "none" } },
        { id: "水涯線", type: "line", source: "v", "source-layer": "WL", paint: { "line-color": "#2468cb66", "line-width": 2 }, layout: { visibility: "none" } },
        { id: "道路中心線ZL4-10国道・高速", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["any", ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]]], ["==", ["get", "vt_rdctg"], "高速自動車国道等"]], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "#80808066", "line-width": 3 } },
        { id: "道路中心線色0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["any", ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], 17, ["all", ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]]]], ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "#80808066", "line-width": 2 } },
        { id: "鉄道中心線", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["any", ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 0]], ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0]], ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 1]]], paint: { "line-color": "#80808066", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "建築物0", type: "fill", source: "v", "source-layer": "BldA", filter: ["==", ["get", "vt_lvorder"], 0], paint: { "fill-color": "#80808033" }, layout: { visibility: "none" } },
        { id: "道路中心線色1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], layout: { visibility: "none", "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "#80808066", "line-width": 4, "line-dasharray": [1, 1] } },
        { id: "道路中心線色橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "#80808066", "line-width": 1.5 } },
        { id: "道路縁", minzoom: 17, type: "line", source: "v", "source-layer": "RdEdg", layout: { "line-cap": "square", "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "#80808066", "line-width": 1.5 } },
        { id: "行政区画界線25000市区町村界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1212], layout: { "line-cap": "square", visibility: "none" }, paint: { "line-color": "#666666", "line-width": 1 } },
        // prettier-ignore
        {
          id: "hinanjo",
          type: "raster",
          source: "hinanjo",
          layout: { visibility: "none" },
          minzoom: 10,
        },
        {
          id: "knet_points",
          type: "circle",
          source: "knet_points",
          layout: { visibility: config.data.kmoni_points_show ? "visible" : "none" },
          paint: {
            "circle-color": ["rgb", ["at", 0, ["get", "rgb"]], ["at", 1, ["get", "rgb"]], ["at", 2, ["get", "rgb"]]],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 1, 5, 3.75, 15, 33.75],
            "circle-stroke-width": 2,
            "circle-stroke-color": ["match", ["get", "detectLv"], 0, "transparent", 1, "#cb732b", 2, "#cb2b2b", "#0000"],
          },
        },
        {
          id: "snet_points",
          type: "circle",
          source: "snet_points",
          layout: { visibility: config.data.kmoni_points_show ? "visible" : "none" },
          paint: {
            "circle-color": ["rgb", ["at", 0, ["get", "rgb"]], ["at", 1, ["get", "rgb"]], ["at", 2, ["get", "rgb"]]],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 1, 5, 3.75, 15, 33.75],
          },
        },
        {
          id: "TREMRTS_points",
          type: "circle",
          source: "TREMRTS_points",
          layout: { visibility: config.data.kmoni_points_show ? "visible" : "none" },
          paint: {
            "circle-color": ["rgb", ["at", 0, ["get", "rgb"]], ["at", 1, ["get", "rgb"]], ["at", 2, ["get", "rgb"]]],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 1, 5, 3.75, 15, 33.75],
          },
        },
        {
          id: "SEISJS_points",
          type: "circle",
          source: "SEISJS_points",
          layout: { visibility: config.data.kmoni_points_show ? "visible" : "none" },
          paint: {
            "circle-color": ["rgb", ["at", 0, ["get", "rgb"]], ["at", 1, ["get", "rgb"]], ["at", 2, ["get", "rgb"]]],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 1, 5, 3.75, 15, 33.75],
          },
        },
        {
          id: "注記シンボル付きソート順100以上",
          type: "symbol",
          source: "v",
          "source-layer": "Anno",
          filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]]],
          layout: {
            visibility: "none",
            "text-allow-overlap": false,
            "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]],
            "text-justify": "auto",
            "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]],
            "text-field": ["get", "vt_text"],
            "text-max-width": 100,
            "text-radial-offset": 0.5,
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-writing-mode": ["horizontal"],
          },
          paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 },
        },
        {
          id: "注記シンボル付きソート順100未満",
          type: "symbol",
          source: "v",
          "source-layer": "Anno",
          filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]]],
          layout: {
            visibility: "none",
            "text-allow-overlap": false,
            "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]],
            "text-justify": "auto",
            "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [2941, 2942], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]],
            "text-field": ["get", "vt_text"],
            "text-max-width": 100,
            "text-radial-offset": 0.5,
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-writing-mode": ["horizontal"],
          },
          paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 },
        },
      ],
    },
  });
  map.touchZoomRotate.disableRotation();

  map.on("click", "prefmap_fill", function (e) {
    e.originalEvent.cancelBubble = true;
  });
  var nied_popup = function (e) {
    elm = e.features[0].properties;
    if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) return;
    var popupContent = generatePopupContent_K(elm);
    if (kmoni_popup[elm.Code]) {
      kmoni_popup[elm.Code].setHTML(popupContent).addTo(map);
    } else {
      kmoni_popup[elm.Code] = new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML(popupContent).addTo(map);
    }
  };
  map.on("click", "knet_points", nied_popup);
  map.on("click", "snet_points", nied_popup);
  map.on("click", "TREMRTS_points", function (e) {
    console.log("aaaaaaaaaa", e.features[0]);
    elm = e.features[0].properties;
    if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) return;
    var popupContent = generatePopupContent_TREM(elm);
    if (kmoni_popup[elm.Code]) {
      kmoni_popup[elm.Code].setHTML(popupContent).addTo(map);
    } else {
      kmoni_popup[elm.Code] = new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML(popupContent).addTo(map);
    }
  });
  map.on("click", "SEISJS_points", function (e) {
    elm = e.features[0].properties;
    if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) return;
    var popupContent = generatePopupContent_SEISJS(elm);
    if (kmoni_popup[elm.Code]) {
      kmoni_popup[elm.Code].setHTML(popupContent).addTo(map);
    } else {
      kmoni_popup[elm.Code] = new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML(popupContent).addTo(map);
    }
  });

  map.on("sourcedataloading", (e) => {
    var hinanjoCheck = config.data.overlay.includes("hinanjo");
    if (e.sourceId == "hinanjo" && hinanjoCheck && e.tile != undefined) {
      var ca = e.tile.tileID.canonical;
      if (map.getLayer("hinanjo_eq_" + ca.x + ca.y + ca.z)) map.removeLayer("hinanjo_eq_" + ca.x + ca.y + ca.z);
      if (map && map.getSource("hinanjo_eq_" + ca.x + ca.y + ca.z)) map.removeSource("hinanjo_eq_" + ca.x + ca.y + ca.z);
      if (map.getLayer("hinanjo_ts_" + ca.x + ca.y + ca.z)) map.removeLayer("hinanjo_ts_" + ca.x + ca.y + ca.z);
      if (map && map.getSource("hinanjo_ts_" + ca.x + ca.y + ca.z)) map.removeSource("hinanjo_ts_" + ca.x + ca.y + ca.z);

      map.addSource("hinanjo_eq_" + ca.x + ca.y + ca.z, {
        type: "geojson",
        data: "https://cyberjapandata.gsi.go.jp/xyz/skhb04/" + ca.z + "/" + ca.x + "/" + ca.y + ".geojson",
      });

      map.addLayer({
        id: "hinanjo_eq_" + ca.x + ca.y + ca.z,
        type: "circle",
        source: "hinanjo_eq_" + ca.x + ca.y + ca.z,
        layout: { visibility: hinanjoCheck ? "visible" : "none" },
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
        layout: { visibility: hinanjoCheck ? "visible" : "none" },
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
  });

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

  var homeButton = document.createElement("button");
  homeButton.innerText = "home";
  homeButton.title = "初期位置に戻る";
  homeButton.className = "material-icons-round";
  homeButton.addEventListener("click", function () {
    userMotion = true;
    map.panTo([138.46, 32.99125], { animate: false });
    map.zoomTo(4, { animate: false });
    userMotion = false;
    userPosition = map.getCenter().toArray();
    userZoom = map.getZoom();
  });

  var returnButton = document.createElement("button");
  returnButton.innerText = "undo";
  returnButton.title = "直前の操作位置に戻る";
  returnButton.className = "material-icons-round";
  returnButton.addEventListener("click", function () {
    userMotion = true;
    returnToUserPosition();
    userMotion = false;
  });
  returnButton.setAttribute("id", "returnToUserPosition");
  returnButton.style.display = "none";

  var cbWrapper = document.createElement("div");
  cbWrapper.className = "maplibregl-ctrl maplibregl-ctrl-group";
  cbWrapper.appendChild(homeButton);
  cbWrapper.appendChild(returnButton);

  map.addControl({
    onAdd: function () {
      return cbWrapper;
    },
    onRemove: function () {},
  });

  map.on("click", "tsunami_Yoho", tsunamiPopup);
  map.on("click", "tsunami_Watch", tsunamiPopup);
  map.on("click", "tsunami_Warn", tsunamiPopup);
  map.on("click", "tsunami_MajorWarn", tsunamiPopup);

  setInterval(function () {
    if (tsunamiData) {
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
    }
  }, 2500);

  var zoomLevelContinue = function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 4.3) {
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
  map.on("load", async () => {
    var image = await map.loadImage("./img/AlertOverlay.png");
    map.addImage("pattern", image.data);
    map.addLayer({ id: "Alert", type: "fill", source: "basemap", paint: { "fill-pattern": "pattern" }, filter: ["==", "name", ""] }, "lake_fill");

    window.electronAPI.messageReturn({
      action: "tsunamiReqest",
    });
    zoomLevelContinue();
    JMAEstShindoDraw();
    layerSelect(config.data.layer);
    radioSet("mapSelect", config.data.layer);
    config.data.overlay.forEach(function (elm) {
      if (document.getElementById(elm)) document.getElementById(elm).checked = true;
      overlaySelect(elm, true);
    });
    overlaySelect("kmoni_points", config.data.kmoni_points_show);
    document.getElementById("kmoni_points").checked = config.data.kmoni_points_show;

    now_EEW.forEach(function (elm) {
      epiCenterUpdate(elm);
    });

    window.electronAPI.messageReturn({
      action: "mapLoaded",
    });
  });

  map.on("zoom", function (e) {
    zoomLevelContinue();
    if (e.originalEvent) userZoom = map.getZoom();
  });
  map.on("move", function (e) {
    var nowAtUserPosition;
    if (e.originalEvent || userMotion) {
      userPosition = map.getCenter().toArray();
      nowAtUserPosition = true;
    }

    document.getElementById("returnToUserPosition").style.display = nowAtUserPosition ? "none" : "block";
  });

  if (config.home.ShowPin) {
    const img = document.createElement("img");
    img.src = "./img/homePin.svg";
    img.classList.add("homeIcon");
    new maplibregl.Marker({ element: img }).setLngLat([config.home.longitude, config.home.latitude]).addTo(map);
  }
}

function returnToUserPosition() {
  if (userPosition) map.panTo(userPosition, { animate: false });
  if (userZoom) map.zoomTo(userZoom, { animate: false });
}

//観測点情報更新
var pointData;
var kmoni_popup = {};
function kmoniMapUpdate(dataTmp, type) {
  if (!dataTmp.data || background) return;
  var geojson = {
    type: "FeatureCollection",
    features: [],
  };

  if (type == "knet") {
    knetMapData = dataTmp;
    dataTmp.data.forEach(function (elm) {
      if (elm.data) {
        geojson.features.push({
          type: "Feature",
          properties: {
            Code: elm.Code,
            IsSuspended: elm.IsSuspended,
            Name: elm.Name,
            Region: elm.Region,
            Type: elm.Type,
            checked: elm.checked,
            data: elm.data,
            detect: elm.detect,
            detect2: elm.detect2,
            detectLv: elm.detect2 ? 2 : elm.detect ? 1 : 0,
            pga: elm.pga,
            rgb: elm.rgb,
            shindo: elm.shindo,
          },
          geometry: {
            type: "Point",
            coordinates: [elm.Location.Longitude, elm.Location.Latitude],
          },
        });
      }
      if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) {
        kmoni_popup[elm.Code].setHTML(generatePopupContent_K(elm));
      }
    });
    if (map) map.getSource("knet_points").setData(geojson);

    return;
  } else {
    snetMapData = dataTmp;

    dataTmp.data.forEach(function (elm) {
      if (elm.data) {
        geojson.features.push({
          type: "Feature",
          properties: {
            Code: elm.Code,
            IsSuspended: elm.IsSuspended,
            Name: elm.Name,
            Region: elm.Region,
            Type: elm.Type,
            data: elm.data,
            pga: elm.pga,
            rgb: elm.rgb,
            shindo: elm.shindo,
          },
          geometry: {
            type: "Point",
            coordinates: [elm.Location.Longitude, elm.Location.Latitude],
          },
        });
      }
      if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) {
        kmoni_popup[elm.Code].setHTML(generatePopupContent_K(elm));
      }
    });
    if (map) map.getSource("snet_points").setData(geojson);
  }
}
function generatePopupContent_K(params) {
  if (params.data) {
    if (!Array.isArray(params.rgb)) params.rgb = JSON.parse(params.rgb);
    return "<h3 class='PointName' style='border-bottom-color:rgb(" + params.rgb.join(",") + ")'>" + (params.Name ? params.Name : "") + "<span>" + params.Type + "_" + params.Code + "</span></h3>" + (params.detect ? "<h4 class='detecting'>地震検知中</h4>" : "");
  } else {
    return "<h3 class='PointName' style='border-bottom:solid 2px rgba(128,128,128,0.5)'>" + (params.Name ? params.Name : "") + "<span>" + params.Type + "_" + params.Code + "</span></h3>";
  }
}

function generatePopupContent_TREM(params) {
  var shindoColor = NormalizeShindo(params.shindo, 2);
  if (!Array.isArray(params.rgb)) params.rgb = JSON.parse(params.rgb);
  return `<h3 class='PointName' style='border-bottom-color:rgb(${params.rgb.join(",")})'><span>${params.Type + "_" + params.Code}</span></h3><div class='popupContentWrap'><div class='obsShindoWrap' style='background:${shindoColor[0]};color:${shindoColor[1]};'>震度 ${NormalizeShindo(params.shindo, 1)}<span>${params.shindo.toFixed(2)}</span></div><div class='obsPGAWrap'>PGA ${(Math.floor(params.PGA * 100) / 100).toFixed(2)}</div></div>`;
}

var TREMRTS_points = {};
function TREMRTSUpdate(dataTmp) {
  if (!background) {
    var geojson = {
      type: "FeatureCollection",
      features: [],
    };
    Object.keys(dataTmp).forEach(function (key) {
      elm = dataTmp[key];
      geojson.features.push({
        type: "Feature",
        properties: {
          Code: elm.Code,
          IsSuspended: elm.IsSuspended,
          Name: elm.Name,
          Region: elm.Region,
          Type: elm.Type,
          PGA: elm.PGA,
          rgb: elm.rgb,
          shindo: elm.shindo,
        },
        geometry: {
          type: "Point",
          coordinates: [elm.Location.Longitude, elm.Location.Latitude],
        },
      });
      if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) {
        kmoni_popup[elm.Code].setHTML(generatePopupContent_TREM(elm));
      }
    });
    if (map) map.getSource("TREMRTS_points").setData(geojson);
  }
}

function generatePopupContent_SEISJS(params) {
  var shindoColor = NormalizeShindo(params.shindo, 2);
  if (!Array.isArray(params.rgb)) params.rgb = JSON.parse(params.rgb);
  return `<h3 class='PointName' style='border-bottom-color:rgb(${params.rgb.join(",")})'>${params.Name}<span>${params.Code}</span></h3><div class='popupContentWrap'><div class='obsShindoWrap' style='background:${shindoColor[0]};color:${shindoColor[1]};'>震度 ${NormalizeShindo(params.shindo, 1)}<span>${params.shindo.toFixed(2)}</span></div><div class='obsPGAWrap'>PGA ${(Math.floor(params.PGA * 100) / 100).toFixed(2)}</div></div>`;
}

var SeisJS_points = {};
function SeisJSUpdate(dataTmp) {
  SeisJS_points = dataTmp;
  if (!background) {
    var geojson = {
      type: "FeatureCollection",
      features: [],
    };
    Object.keys(dataTmp).forEach(function (key) {
      elm = dataTmp[key];
      geojson.features.push({
        type: "Feature",
        properties: {
          Code: elm.Code,
          IsSuspended: elm.IsSuspended,
          Name: elm.Name,
          Region: elm.Region,
          Type: elm.Type,
          PGA: elm.PGA,
          rgb: elm.rgb,
          shindo: elm.shindo,
        },
        geometry: {
          type: "Point",
          coordinates: [elm.Location.Longitude, elm.Location.Latitude],
        },
      });
      if (kmoni_popup[elm.Code] && kmoni_popup[elm.Code].isOpen()) {
        kmoni_popup[elm.Code].setHTML(generatePopupContent_SEISJS(elm));
      }
    });
    if (map) map.getSource("SEISJS_points").setData(geojson);
  }
}

var Int0T = (Int1T = Int2T = Int3T = Int4T = Int5mT = Int5pT = Int6mT = Int6pT = Int7T = AlertT = ["any"]);

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
  AlertT = ["any"];

  data.forEach(function (elm) {
    if (elm.warnZones && Array.isArray(elm.warnZones)) {
      elm.warnZones.forEach(function (elm2) {
        var old_int;
        if (JMAEstShindoData[elm2.Name]) old_int = config.Info.EEW.IntType == "max" ? JMAEstShindoData[elm2.Name].IntTo : JMAEstShindoData[elm2.Name].IntFrom;
        var new_int = config.Info.EEW.IntType == "max" ? elm2.IntTo : elm2EEW.IntFrom;
        if (!old_int || old_int < new_int) {
          JMAEstShindoData[elm2.Name] = elm2;
        }
      });
    }
  });

  Object.keys(JMAEstShindoData).forEach(function (elm) {
    var sectData = JMAEstShindoData[elm];
    if (sectData.Alert) AlertT.push(["==", "name", elm]);

    IntData = config.Info.EEW.IntType == "max" ? sectData.IntTo : sectData.IntFrom;
    switch (NormalizeShindo(IntData)) {
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
      default:
        break;
    }
  });
  document.getElementById("fillLegend").style.display = Object.keys(JMAEstShindoData) == 0 ? "none" : "inline-block";
  JMAEstShindoDraw();
}

function JMAEstShindoDraw() {
  if (map) {
    map.setFilter("Int1", Int1T);
    map.setFilter("Int2", Int2T);
    map.setFilter("Int3", Int3T);
    map.setFilter("Int4", Int4T);
    map.setFilter("Int5-", Int5mT);
    map.setFilter("Int5+", Int5pT);
    map.setFilter("Int6-", Int6mT);
    map.setFilter("Int6+", Int6pT);
    map.setFilter("Int7", Int7T);
    map.setFilter("Alert", AlertT);
  }
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
            if (countDown_min == 0) countDownElm.textContent = countDown_sec;
            else countDownElm.textContent = countDown_min + ":" + String(countDown_sec).padStart(2, "0");
          } else countDownElm.textContent = "0";
        }
      }
    }

    if (!elm.is_cancel && elm.origin_time && elm.depth && elm.latitude && elm.longitude && elm.depth <= 700) {
      var pswaveFind = psWaveList.find(function (elm2) {
        return elm2.id == elm.EventID;
      });

      if (pswaveFind) {
        pswaveFind.data.longitude = elm.longitude;
        pswaveFind.data.latitude = elm.latitude;
        pswaveFind.TimeTable = elm.TimeTable;
      } else {
        psWaveList.push({
          id: elm.EventID,
          data: { latitude: elm.latitude, longitude: elm.longitude, originTime: elm.origin_time },
          TimeTable: elm.TimeTable,
        });
      }
      psWaveCalc(elm.EventID);
    }
  });

  //終わった地震の予報円削除
  psWaveList = psWaveList.filter(function (elm) {
    var stillEEW = now_EEW.find(function (elm2) {
      return elm2.EventID == elm.id;
    });
    if (!stillEEW || stillEEW.is_cancel) {
      if (map.getLayer("PCircle_" + elm.id)) {
        map.removeLayer("PCircle_" + elm.id);
        map.removeLayer("SCircle_" + elm.id);
        map.removeLayer("SCircle_" + elm.id + "_FILL");
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
    var distance = (new Date() - Replay - new Date(pswaveFind.data.originTime)) / 1000;

    var PRadius = null;
    var SRadius = null;

    var i = 0;
    SWmin = TimeTableTmp[0].S;
    for (const elm of TimeTableTmp) {
      if (!PRadius) {
        if (elm.P == distance) {
          PRadius = elm.R;
          if (SRadius || SWmin > distance) break;
        } else if (elm.P > distance) {
          elm2 = TimeTableTmp[Math.max(i - 1, 0)];
          PRadius = elm.R + ((elm2.R - elm.R) * (distance - elm.P)) / (elm2.P - elm.P);
          if (SRadius || SWmin > distance) break;
        }
      }
      if (!SRadius && SWmin < distance) {
        if (elm.S == distance) {
          SRadius = elm.R;
          if (PRadius) break;
        } else if (elm.S > distance) {
          elm2 = TimeTableTmp[Math.max(i - 1, 0)];
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
  steps: 60,
  units: "kilometers",
};
//予報円描画
function psWaveReDraw(EventID, latitude, longitude, pRadius, sRadius, SnotArrived, SArriveTime, nowDistance) {
  if (!map) return;
  var EQElm = psWaveList.find(function (elm) {
    return elm.id == EventID;
  });
  var EQElm2 = now_EEW.find(function (elm) {
    return elm.EventID == EventID;
  });
  if (EQElm) {
    let _center = turf.point([longitude, latitude]);

    if (map && map.getSource("PCircle_" + EventID)) {
      var PCircleElm = map.getSource("PCircle_" + EventID);
      if (PCircleElm) {
        if (pRadius) {
          var pcircle = turf.circle(_center, pRadius / 1000, circle_options);
          PCircleElm.setData(pcircle);
          map.setPaintProperty("PCircle_" + EventID, "line-width", 2);
        } else map.setPaintProperty("PCircle_" + EventID, "line-width", 0);
      }

      var SCircleElm = map.getSource("SCircle_" + EventID);
      if (SCircleElm) {
        if (sRadius) {
          var scircle = turf.circle(_center, sRadius / 1000, circle_options);
          SCircleElm.setData(scircle);
          map.setPaintProperty("SCircle_" + EventID, "line-width", SnotArrived ? 0 : 2);
        } else map.setPaintProperty("SCircle_" + EventID, "line-width", 0);
      }
    } else {
      map.addSource("PCircle_" + EventID, {
        type: "geojson",
        data: turf.circle(_center, pRadius / 1000, circle_options),
        tolerance: 0.6,
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
        tolerance: 0.6,
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

      EQElm = psWaveList[psWaveList.length - 1];

      psWaveCalc(EventID);
    }

    if (EQElm.SIElm) {
      if (SnotArrived) {
        var SWprogressValue = document.getElementById("SWprogressValue_" + EventID);
        if (SWprogressValue) SWprogressValue.setAttribute("stroke-dashoffset", Number(138 - 138 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))));
      } else EQElm.SIElm.remove();
    } else if (SnotArrived) {
      var SIElm;

      EQElm.firstDetect = nowDistance;

      const el = document.createElement("div");
      el.classList.add("SWaveProgress");
      el.innerHTML = '<svg width="50" height="50"><circle cx="25" cy="25" r="22" fill="none" stroke-width="5px" stroke="#777"/><circle id="SWprogressValue_' + EventID + '" class="SWprogressValue" cx="25" cy="25" r="22" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="138" stroke-dashoffset="' + Number(138 - 138 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '"/></svg>';

      SIElm = new maplibregl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map);

      EQElm.SIElm = SIElm;

      if (map) {
        var SCircleElm = map.getSource("SCircle_" + EventID);
        if (SCircleElm) {
          var scircle = turf.circle(_center, 0, circle_options);
          SCircleElm.setData(scircle);
          map.setPaintProperty("SCircle_" + EventID, "line-width", SnotArrived ? 0 : 2);
        }
      }
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

        if (countDown_min == 0) countDownElm.textContent = countDown_sec;
        else countDownElm.textContent = countDown_min + ":" + String(countDown_sec).padStart(2, "0");
      } else countDownElm.textContent = "到達";
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
var now_tsunami = false;
var tsunamiSTMarkers = [];
function tsunamiDataUpdate(data) {
  tsunamiData = data;
  map.setFilter("tsunami_MajorWarn", ["==", "name", ""]);
  map.setFilter("tsunami_Warn", ["==", "name", ""]);
  map.setFilter("tsunami_Watch", ["==", "name", ""]);
  map.setFilter("tsunami_Yoho", ["==", "name", ""]);
  Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false;

  document.getElementById("tsunamiCancel").style.display = data.Torikeshi ? "block" : "none";
  document.getElementById("tsunamiRevocation").style.display = data.revocation || data.cancelled ? "block" : "none";

  document.querySelector("#tsunamiWrap .TestNotes").style.display = data.status == "試験" ? "block" : "none";
  document.querySelector("#tsunamiWrap .trainingNotes").style.display = data.status == "訓練" ? "block" : "none";

  now_tsunami = true;

  tsunamiSTMarkers.forEach(function (elm) {
    elm.remove();
  });

  if (data.cancelled) {
    document.getElementById("tsunamiWrap").style.display = "none";
    document.body.classList.remove("TsunamiMode");
    now_tsunami = false;
  } else {
    EQInfoLink.style.display = "none";
    if (Array.isArray(data.issue.EventID) && data.issue.EventID.length) {
      var link = [];
      EQinfo_Index = 0;
      document.getElementById("EQCount").innerText = data.issue.EventID.length > 1 ? "(" + data.issue.EventID.length + ")" : "";
      eqInfoDataJMA.forEach(function (elm) {
        if (data.issue.EventID.includes(Number(elm.eventId))) {
          link.push("#EQItem_" + elm.eventId);
        }
      });
      if (link.length) {
        EQInfoLink.style.display = "inline-block";
        EQInfoLink.dataset.eventid = link.join(",");
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
        if (sectData.firstHeight) firstWave = "第1波予想<span>" + NormalizeDate(10, sectData.firstHeight) + "</span>";
        else {
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

        if (sectData.maxHeight) maxWave = "<div>最大波予想<span>" + sectData.maxHeight + "</span></div>";
        else if (sectData.grade == "Yoho") maxWave = "<div>最大波予想<span>若干の海面変動</span></div>";

        document.getElementById("tsunamiSectTitle").innerText = sectData.name + " " + gradeJa;
        document.getElementById("firstHeightData").innerHTML = firstWave;
        document.getElementById("maxHeightData").innerHTML = maxWave;
        document.getElementById("firstHeightCondition").style.display = sectData.firstHeightCondition == "ただちに津波来襲と予測" ? "block" : "none";

        document.getElementById("TsunamiMySectData").style.border = "solid 1px " + tsunamiColorConv(sectData.grade);
        document.getElementById("TsunamiMySectData").style.display = "block";
      } else document.getElementById("TsunamiMySectData").style.display = "none";
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
        }
      }

      if (elm.stations) {
        elm.stations.forEach(function (elm2) {
          var st = tsunamiStations[elm2.code];
          if (st) {
            if (elm2.omaxHeight) {
              var omaxHeight = Number(elm2.omaxHeight.replace("m", "").replace("以上", ""));

              if (omaxHeight < 0.2) {
                classname = "TsunamiST02";
                color = config.color.Tsunami.TsunamiYohoColor;
              } else if (omaxHeight <= 1) {
                classname = "TsunamiST10";
                color = config.color.Tsunami.TsunamiWatchColor;
              } else if (omaxHeight <= 3) {
                classname = "TsunamiST30";
                color = config.color.Tsunami.TsunamiWarningColor;
              } else {
                classname = "TsunamiST99";
                color = config.color.Tsunami.TsunamiMajorWarningColor;
              }

              var tsunamiST = document.createElement("div");
              tsunamiST.classList.add("tsunami_st", classname);

              var tsunamiSTCap = document.createElement("span");
              tsunamiSTCap.innerText = elm2.omaxHeight;
              if (elm2.omaxHeight.includes("以上")) tsunamiSTCap.innerText = ">" + elm2.omaxHeight.replace("以上", "");
              if (elm2.maxHeightRising) tsunamiSTCap.innerText = elm2.omaxHeight + "↗";
              tsunamiST.appendChild(tsunamiSTCap);

              var tsunamiSTMarker = document.createElement("div");
              tsunamiST.appendChild(tsunamiSTMarker);

              var condition = "";
              var arrivalTime = "";
              var ArrivedTime = "";
              var HighTideDateTime = "";
              var omaxHeight = "";

              if (elm2.Conditions) condition = elm2.Conditions;

              if (elm2.HighTideDateTime) HighTideDateTime = "満潮：" + NormalizeDate(6, elm2.HighTideDateTime);

              if (elm2.omaxHeight) {
                omaxHeight = elm2.omaxHeight;
                if (elm2.firstHeightInitial) omaxHeight = elm2.omaxHeight + " " + elm2.firstHeightInitial;
              } else if (elm2.maxHeightCondition) omaxHeight = elm2.maxHeightCondition;

              if (elm2.maxHeightTime) omaxHeight += " " + NormalizeDate(10, elm2.maxHeightTime);

              if (omaxHeight) omaxHeight = "観測最大波：" + omaxHeight;
              if (elm2.maxHeightRising) omaxHeight += " （上昇中）";

              if (elm2.ArrivedTime) ArrivedTime = "第１波観測時刻：" + NormalizeDate(10, elm2.ArrivedTime);
              else if (elm2.Condition == "第１波の到達を確認") ArrivedTime = "第1波到達";
              else if (elm2.Condition == "津波到達中と推測") ArrivedTime = "津波到達中と推測";
              else if (elm2.firstHeightCondition == "第１波識別不能") ArrivedTime = "第1波識別不能";
              if (elm2.firstHeightInitial) ArrivedTime += " " + elm2.firstHeightInitial;
              if (elm2.ArrivalTime) arrivalTime = "第1波予想：" + NormalizeDate(10, elm2.ArrivalTime);

              var content = [arrivalTime, omaxHeight, ArrivedTime, HighTideDateTime, condition].filter(Boolean).join("<br>");
              var popupContent = "<h3 style='border-bottom:solid 2px " + color + "'>" + elm2.name + "</h3><div class='tsunamidetailwrap'>" + content + "</div>";

              var TsunamiPopup = new maplibregl.Popup().setHTML(popupContent);
              tsunamiSTMarkers.push(new maplibregl.Marker({ element: tsunamiST }).setLngLat([st.lng, st.lat]).setPopup(TsunamiPopup).addTo(map));
            }
          }
        });
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
      now_tsunami = false;
    } else if (!alertNowTmp && tsunamiAlertNow) {
      document.getElementById("tsunamiWrap").style.display = "none";
      document.body.classList.remove("TsunamiMode");
      now_tsunami = false;
      Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
    }
    tsunamiAlertNow = alertNowTmp;

    document.getElementById("tsunamiHeadline").innerText = (data.headline ? data.headline : "") + (data.issue.time ? ` (${NormalizeDate(10, data.issue.time)})` : "");
    document.getElementById("tsunami_MajorWarning").style.display = Tsunami_MajorWarning ? "inline-block" : "none";
    document.getElementById("tsunami_Warning").style.display = Tsunami_Warning ? "inline-block" : "none";
    document.getElementById("tsunami_Watch").style.display = Tsunami_Watch ? "inline-block" : "none";
    document.getElementById("tsunami_Yoho").style.display = Tsunami_Yoho ? "inline-block" : "none";

    if (Tsunami_MajorWarning) document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("MajorWarning");
    else if (Tsunami_Warning) document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Warning");
    else if (Tsunami_Watch) document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Watch");
    else if (Tsunami_Yoho) document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Yoho");
  }
  document.getElementById("noEEW").style.display = now_EEW.length == 0 && !now_tsunami && EQDetectItem.length == 0 ? "block" : "none";
}

var EQinfo_Index = 0;
EQInfoLink.addEventListener("click", function (e) {
  e.preventDefault();
  var EIDs = EQInfoLink.dataset.eventid.split(",");
  EIDs.forEach(function (elm, index) {
    var EQItemElm = document.querySelector(elm);
    if (EQItemElm) {
      if (index == EQinfo_Index) {
        EQItemElm.scrollIntoView({
          block: "center",
        });
      }
      EQItemElm.animate(
        {
          boxShadow: ["0 0 0 0 rgba(203, 27, 27, 1)", "0 0 0 15px rgba(203, 27, 27, 0)"],
        },
        500
      );
    }
  });
  EQinfo_Index++;
  if (EQinfo_Index >= EIDs.length) EQinfo_Index = 0;
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

function tsunamiPopup(e) {
  if (e.originalEvent.cancelBubble) return;

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
        if (elm.firstHeight) firstWave = "<div>第１波予想:" + NormalizeDate(10, elm.firstHeight) + "</div>";

        if (elm.maxHeight) maxWave = "<div>最大波予想:" + elm.maxHeight + "</div>";
        else if (elm.grade == "Yoho") maxWave = "<div>最大波予想:若干の海面変動</div>";

        if (elm.firstHeightCondition) firstCondition = "<div>" + elm.firstHeightCondition + "</div>";
        var popupContent = "<h3 style='border-bottom:solid 2px " + tsunamiColorConv(elm.grade) + "'>" + elm.name + "</h3><div class='tsunamidetailwrap'><p> " + gradeJa + " 発令中</p>" + firstWave + maxWave + firstCondition + "</div>";
        new maplibregl.Popup().setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
      }
    }
  }
}

//🔴南海トラフ情報🔴
function NankaiTroughInfo(data) {
  if (data.rinji) {
    document.getElementById("NankaiTroughInfo_Rinji").addEventListener("click", function () {
      window.electronAPI.messageReturn({
        action: "NankaiWindowOpen",
        type: "rinji",
      });
    });
    document.getElementById("NankaiTroughInfo_Rinji").style.display = "block";
    document.getElementById("NankaiTroughInfo_Rinji").setAttribute("title", "クリックして詳細を表示\n" + data.rinji.HeadLine);
    var serialStr = data.rinji.Serial ? "<span class='nankai_serial'>#" + data.rinji.Serial + "</span>" : "";
    document.getElementById("Nankai_Title_Rinji").innerHTML = data.rinji.title + " (" + data.rinji.kind + ") " + serialStr;
    document.getElementById("NankaiTroughInfo_Rinji").classList.remove("nankaiAlert", "nankaiWarn", "nankaiInfo");
    switch (data.rinji.kind) {
      case "巨大地震警戒":
        document.getElementById("NankaiTroughInfo_Rinji").classList.add("nankaiAlert");
        break;
      case "巨大地震注意":
        document.getElementById("NankaiTroughInfo_Rinji").classList.add("nankaiWarn");
        break;
      case "調査終了":
      case "調査中":
        document.getElementById("NankaiTroughInfo_Rinji").classList.add("nankaiInfo");
        break;
    }
  } else document.getElementById("NankaiTroughInfo_Rinji").style.display = "none";

  if (data.teirei) {
    document.getElementById("NankaiTroughInfo_Teirei").addEventListener("click", function () {
      window.electronAPI.messageReturn({
        action: "NankaiWindowOpen",
        type: "teirei",
      });
    });
    document.getElementById("NankaiTroughInfo_Teirei").style.display = "block";
    document.getElementById("NankaiTroughInfo_Teirei").setAttribute("title", "クリックして詳細を表示\n" + data.teirei.HeadLine);
    var serialStr = data.teirei.Serial ? "<span class='nankai_serial'>#" + data.teirei.Serial + "</span>" : "";
    document.getElementById("Nankai_Title_Teirei").innerHTML = data.teirei.title + " (" + data.teirei.kind + ")" + serialStr;
    document.getElementById("NankaiTroughInfo_Teirei").classList.remove("nankaiAlert", "nankaiWarn", "nankaiInfo");

    if (data.teirei.kind == "臨時解説") document.getElementById("NankaiTroughInfo_Teirei").classList.add("nankaiWarn");
  } else document.getElementById("NankaiTroughInfo_Teirei").style.display = "none";
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
    .setHTML(`<div class='popupContent'><div class='hinanjoTitle'>指定緊急避難場所</div><div class="pointName">${DataTmp.name}</div><div class='popupContent'>対応：${supportType + (DataTmp.remarks ? "<div>" + DataTmp.remarks + "</div>" : "")}</div></div>`)
    .addTo(map);
}

function radioSet(name, val) {
  document.getElementsByName(name).forEach(function (elm) {
    if (elm.value == val) elm.checked = true;
  });
}
