var now_EEW = [];
/* eslint-disable */
var Replay = 0;
var background = false;
var background;
var becomeForeground = false;
/* eslint-enable */
document.addEventListener("visibilitychange", () => {
  background = document.visibilityState == "visible";
  if (document.visibilityState == "visible") {
    background = false;
  } else {
    background = true;
    becomeForeground = true;
  }
});

window.electronAPI.messageSend((event, request) => {
  if (request.action == "EEWAlertUpdate") {
    EEWAlertUpdate(request.data);
  } else if (request.action == "kmoniTimeUpdate") {
    kmoniTimeUpdate(request.Updatetime, request.LocalTime, request.type, request.condition, request.vendor);
  } else if (request.action == "kmoniUpdate") {
    kmoniTimeUpdate(request.Updatetime, request.LocalTime, "kmoniImg", "success");
  } else if (request.action == "SnetUpdate") {
    kmoniTimeUpdate(request.Updatetime, request.LocalTime, "msilImg", "success");
  } else if (request.action == "MSSelect") {
    document.getElementById(request.str).selected = true;
  } else if (request.action == "setting") {
    config = request.data;
  } else if (request.action == "Replay") {
    Replay = request.data;
  } else if (request.action == "EQInfo") {
    eqInfoDraw(request.data, request.source);
  } else if (request.action == "notification_Update") {
    show_errorMsg(request.data);
  } else if (request.action == "EQDetect") {
    EQDetect(request.data);
  } else if (request.action == "EQDetectFinish") {
    EQDetectFinish(request.data);
  }
  return true;
});

window.addEventListener("load", () => {
  //オフライン警告表示・非表示
  if (navigator.onLine) {
    kmoniTimeUpdate(new Date(), new Date(), "Internet", "success");
  } else {
    document.getElementById("offline").showModal();
    document.getElementById("offline2").style.display = "block";
    kmoniTimeUpdate(new Date(), new Date(), "Internet", "Error");
  }

  //強震モニタお知らせ取得
  fetch("http://www.kmoni.bosai.go.jp/webservice/maintenance/message.json?_=" + Number(new Date()))
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      document.getElementById("kmoni_Message").innerHTML = json.message;
    });
});
//オフライン警告非表示
window.addEventListener("online", () => {
  document.getElementById("offline").close();
  document.getElementById("offline2").style.display = "none";
  kmoniTimeUpdate(new Date(), new Date(), "Internet", "success");
});
//オフライン警告表示
window.addEventListener("offline", () => {
  document.getElementById("offline").showModal();
  document.getElementById("offline2").style.display = "block";
  kmoniTimeUpdate(new Date(), new Date(), "Internet", "Error");
});

//🔴緊急地震速報🔴
var template = document.getElementById("EEWTemplate");
var epiCenter = [];
var EEW_LocalIDs = [];
//EEW追加・更新
function EEWAlertUpdate(data) {
  data.forEach((elm) => {
    var sameEQ = now_EEW.find(function (elm2) {
      return elm.EventID == elm2.EventID;
    });

    if (!sameEQ) {
      //新しい地震、新しい報
      var clone = template.content.cloneNode(true);

      var alertflgTmp = "(" + elm.alertflg + ")";
      if (elm.alertflg) clone.querySelector(".alertflg").textContent = alertflgTmp;

      if (elm.alertflg == "警報") {
        clone.querySelector(".EEWWrap").classList.add("keihou");
      } else if (elm.alertflg == "予報") {
        clone.querySelector(".EEWWrap").classList.add("yohou");
      }

      EEWID++;
      EEW_LocalIDs[elm.EventID] = EEWID;

      clone.querySelector(".EEWLocalID").textContent = EEWID;
      clone.querySelector(".serial").textContent = elm.serial;
      clone.querySelector(".maxInt").textContent = elm.maxInt ? elm.maxInt : "?";
      clone.querySelector(".maxInt").style.background = shindoConvert(elm.maxInt, 2)[0];
      clone.querySelector(".maxInt").style.color = shindoConvert(elm.maxInt, 2)[1];

      clone.querySelector(".is_final").style.display = elm.is_final ? "inline" : "none";
      clone.querySelector(".canceled").style.display = elm.is_cancel ? "flex" : "none";
      clone.querySelector(".region_name").textContent = elm.region_name ? elm.region_name : "震源地域不明";
      clone.querySelector(".origin_time").textContent = dateEncode(3, elm.origin_time);
      clone.querySelector(".magnitude").textContent = elm.magnitude ? elm.magnitude : "不明";
      clone.querySelector(".depth").textContent = elm.depth ? elm.depth : "不明";
      clone.querySelector(".traning").style.display = elm.is_training ? "block" : "none";
      clone.querySelector(".EpicenterElement").style.display = !elm.isPlum ? "block" : "none";
      clone.querySelector(".NoEpicenterElement").style.display = elm.isPlum ? "block" : "none";

      clone.querySelector(".userIntensity").textContent = elm.userIntensity ? elm.userIntensity : "?";
      clone.querySelector(".userDataWrap").style.background = shindoConvert(elm.userIntensity, 2)[0];
      clone.querySelector(".userDataWrap").style.color = shindoConvert(elm.userIntensity, 2)[1];

      clone.querySelector(".distance").textContent = elm.distance ? Math.round(elm.distance) + "km" : "";

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
        EQMenu.querySelector(".maxInt").style.background = shindoConvert(elm.maxInt, 2)[0];
        EQMenu.querySelector(".maxInt").style.color = shindoConvert(elm.maxInt, 2)[1];

        EQMenu.querySelector(".is_final").style.display = elm.is_final ? "inline" : "none";
        EQMenu.querySelector(".canceled").style.display = elm.is_cancel ? "flex" : "none";
        EQMenu.querySelector(".region_name").textContent = elm.region_name ? elm.region_name : "震源地域不明";
        EQMenu.querySelector(".origin_time").textContent = dateEncode(3, elm.origin_time);
        EQMenu.querySelector(".magnitude").textContent = elm.magnitude ? elm.magnitude : "不明";
        EQMenu.querySelector(".depth").textContent = elm.depth ? elm.depth : "不明";

        EQMenu.querySelector(".EpicenterElement").style.display = !elm.isPlum ? "block" : "none";
        EQMenu.querySelector(".NoEpicenterElement").style.display = elm.isPlum ? "block" : "none";

        EQMenu.querySelector(".userIntensity").textContent = elm.userIntensity ? elm.userIntensity : "?";
        EQMenu.querySelector(".userDataWrap").style.background = shindoConvert(elm.userIntensity, 2)[0];
        EQMenu.querySelector(".userDataWrap").style.color = shindoConvert(elm.userIntensity, 2)[1];

        EQMenu.querySelector(".distance").textContent = elm.distance ? Math.round(elm.distance) + "km" : "";
      }
    }
    epiCenterUpdate(elm.EventID, elm.latitude, elm.longitude);

    now_EEW = now_EEW.filter(function (elm2) {
      return elm2.EventID !== elm.EventID;
    });
    now_EEW.push(elm);
  });
  now_EEW = now_EEW.filter(function (elm) {
    var stillEQ = data.find(function (elm2) {
      return elm.EventID == elm2.EventID;
    });
    //終わった地震
    if (!stillEQ) {
      document.getElementById("EEW-" + elm.EventID).remove();
      epiCenterClear(elm.EventID);
    } else if (elm.is_cancel) {
      epiCenterClear(elm.EventID);
      document.getElementById("EEW-" + elm.EventID).remove();
    }
    return stillEQ;
  });
  if (now_EEW.length == 0) EEWID = 0;

  if (data.length == 0) {
    document.body.classList.remove("EEWMode");
  } else {
    document.body.classList.add("EEWMode");
  }
}

var EEWID = 0;
//震源更新
function epiCenterUpdate(eid, latitude, longitude) {
  eid = Number(eid);

  if (map && latitude && longitude) {
    var epicenterElm = epiCenter.find(function (elm2) {
      return elm2.eid == eid;
    });
    if (epicenterElm && epicenterElm.markerElm) {
      //情報更新
      epicenterElm.markerElm.setLngLat([longitude, latitude]);
      epicenterElm.popupElm.setLngLat([longitude, latitude]);
      epicenterElm.latitude = latitude;
      epicenterElm.longitude = longitude;
    } else {
      //初報
      var EEWIDTmp = EEW_LocalIDs[eid];

      const img = document.createElement("img");
      img.src = "./img/epicenter.svg";
      img.classList.add("epicenterIcon");

      map.panTo([longitude, latitude], { animate: false });
      map.zoomTo(8, { animate: false });
      var ESPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "epiCenterTooltip", offset: [0, -17] }).setText(EEWIDTmp).setLngLat([longitude, latitude]).addTo(map);
      var ESMarker = new maplibregl.Marker(img).setLngLat([longitude, latitude]).addTo(map);

      epiCenter.push({ eid: eid, markerElm: ESMarker, popupElm: ESPopup, latitude: latitude, longitude: longitude, EEWID: Number(EEWIDTmp) });
      displayTmp = epiCenter.length > 1 ? "inline-block" : "none";
      document.querySelectorAll(".epiCenterTooltip,.EEWLocalID").forEach(function (elm3) {
        elm3.style.display = displayTmp;
      });
    }
  }

  var EQElm = psWaveList.find(function (elm) {
    return elm.id == eid;
  });
  if (EQElm) {
    if (EQElm.PCircleElm) {
      var pswaveFind = psWaveList.find(function (elm2) {
        return elm2.id == eid;
      });

      pswaveFind.data.latitude = latitude;
      pswaveFind.data.longitude = longitude;
    }
    if (EQElm.SIElm) EQElm.SIElm.setLngLat([longitude, latitude]);
  }
  latitudeTmp = latitude;
  longitudeTmp = longitude;
  if (psWaveList.length > 0) {
    document.querySelectorAll(".PWave,.SWave").forEach(function (elm) {
      elm.style.transitionTimingFunction = "step-start";
    });
    psWaveList.forEach(function (elm) {
      psWaveCalc(elm.id);
    });
  }
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
    if (epicenterElm && epicenterElm.markerElm) {
      epicenterElm.markerElm.remove();
      epicenterElm.markerElm = null;
      epicenterElm.popupElm.remove();
      epicenterElm.popupElm = null;
    }
  }
}

//🔴地震情報🔴
var template2 = document.getElementById("EQListTemplate");
var template2_2 = document.getElementById("EQListTemplate2");
var EQListWrap;
function eqInfoDraw(data, source) {
  var EQTemplate;
  if (source == "jma") {
    EQTemplate = template2;
    EQListWrap = document.getElementById("JMA_EqInfo");
  } else if (source == "usgs") {
    EQTemplate = template2_2;
    EQListWrap = document.getElementById("USGS_EqInfo");
  }
  removeChild(EQListWrap);

  data.forEach(function (elm) {
    var clone = EQTemplate.content.cloneNode(true);

    clone.querySelector(".EQI_epiCenter").textContent = elm.epiCenter ? elm.epiCenter : "震源調査中";
    clone.querySelector(".EQI_datetime").textContent = elm.OriginTime ? dateEncode(4, elm.OriginTime) : "発生時刻不明";
    clone.querySelector(".EQI_magnitude").textContent = "M" + (elm.M ? elm.M : "不明");
    if (source == "jma") {
      clone.querySelector(".EQItem").setAttribute("id", "EQItem_" + elm.eventId);
      var maxITmp = elm.maxI;
      if (maxITmp == "不明") maxITmp = "?";
      maxITmp = shindoConvert(maxITmp, 0);
      var shindoColor = shindoConvert(maxITmp, 2);

      clone.querySelector(".EQI_maxI").textContent = maxITmp;
      clone.querySelector(".EQI_maxI").style.background = shindoColor[0];
      clone.querySelector(".EQI_maxI").style.color = shindoColor[1];
      clone.querySelector(".canceled").style.display = elm.cancel ? "flex" : "none";
      clone.querySelector(".EEWNotes").style.display = elm.category == "EEW" ? "block" : "none";

      clone.querySelector(".EQDetailButton").addEventListener("click", function () {
        window.electronAPI.messageReturn({
          action: "EQInfoWindowOpen",
          url: "src/EQDetail.html",
          eid: elm.eventId,
          urls: elm.DetailURL,
        });
      });
    } else if (source == "usgs") {
      clone.querySelector(".EQDetailButton").addEventListener("click", function () {
        window.open(elm.DetailURL);
      });
    }
    EQListWrap.appendChild(clone);
  });
}

//🔴地震検知🔴
var EQDetectItem = [];
var EQDetectTemplate = document.getElementById("EQDetectTemplate");
function EQDetect(data) {
  var EQD_Item = EQDetectItem.find(function (elm) {
    return elm.id == data.id;
  });
  var regions = [];
  data.Codes.forEach(function (elm) {
    if (!regions.includes(elm.Region)) regions.push(elm.Region);
  });

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
    map.getSource("EQDItem_" + data.id).setData(_circle);

    var EQDItem = document.getElementById("EQDItem_" + data.id);
    EQDItem.classList.remove("lv1", "lv2");
    EQDItem.classList.add("lv" + data.Lv);
    EQDItem.querySelector(".EQD_Regions").innerText = regions.join(" ");
  } else {
    //初回検知
    EQDetectItem.push({
      id: data.id,
      lat: data.lat,
      lng: data.lng,
    });

    var clone = EQDetectTemplate.content.cloneNode(true);
    var EQDItem = clone.querySelector(".EQDItem");
    EQDItem.setAttribute("id", "EQDItem_" + data.id);
    EQDItem.classList.add("lv" + data.Lv);
    EQDItem.querySelector(".EQD_Regions").innerText = regions.join(" ");
    document.getElementById("EQDetect-Panel").prepend(clone);

    map.panTo([data.lng, data.lat], { animate: false });
    map.zoomTo(8, { animate: false });
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
      id: "EQDItem_" + data.id,
      type: "line",
      source: "EQDItem_" + data.id,
      paint: {
        "line-color": "#FFF",
        "line-width": 3,
      },
      minzoom: 0,
      maxzoom: 22,
    });
  }
}
//地震検知情報更新
function EQDetectFinish(id) {
  EQDetectItem.forEach(function (elmA, index) {
    if (elmA.id == id) {
      map.setLayoutProperty("EQDItem_" + id, "visibility", "none");
      EQDetectItem.splice(index, 1);
    }
  });
  var eqdItem = document.getElementById("EQDItem_" + id);
  if (eqdItem) eqdItem.remove();
}

//🔴UI🔴
var updateTimeTmp = 0;
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
    action: "settingWindowOpen",
  });
});

//地震情報[JMA/USGS]選択
document.getElementById("EQInfoSelect").addEventListener("change", function () {
  document.querySelectorAll(".activeEQInfo").forEach(function (elm) {
    elm.classList.remove("activeEQInfo");
  });
  document.getElementById(this.value).classList.add("activeEQInfo");
});

//情報更新時刻更新
function kmoniTimeUpdate(updateTime, LocalTime, type, condition, vendor) {
  if (updateTimeTmp < updateTime) {
    updateTimeTmp = updateTime;
    document.getElementById("all_UpdateTime").textContent = dateEncode(3, updateTime);
  }

  if (vendor) {
    document.getElementById("ymoniVendor").textContent = vendor == "YE" ? "East" : "West";
  }
  document.getElementById(type + "_UT").textContent = dateEncode(3, updateTime);

  var iconElm = document.getElementById(type + "_ICN");

  if (condition == "success") {
    iconElm.classList.add("Success");
    iconElm.classList.remove("Error");
    if (!background) {
      iconElm.classList.add("SuccessAnm");
      iconElm.addEventListener("animationend", function () {
        this.classList.remove("SuccessAnm");
      });
    }
  } else if (condition == "Error") {
    iconElm.classList.remove("Success");
    iconElm.classList.add("Error");
  } else if (condition == "Disconnect") {
    iconElm.classList.remove("Success");
    iconElm.classList.remove("Error");
  }
}

//接続状況ダイアログ表示
document.getElementById("UpdateTimeWrap").addEventListener("click", function () {
  updateTimeDialog.showModal();
});
//接続状況ダイアログ非表示
document.getElementById("UpdateTimeClose").addEventListener("click", function () {
  updateTimeDialog.close();
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

