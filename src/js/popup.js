var now_EEW = [];
/* eslint-disable */
var Replay = 0;
var config;
/* eslint-enable */

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
    Show_notification(request.data);
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
    var same = now_EEW.find(function (elm2) {
      return elm.report_id == elm2.report_id && elm.report_num == elm2.report_num;
    });
    var sameEQ = now_EEW.find(function (elm2) {
      return elm.report_id == elm2.report_id;
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
      EEW_LocalIDs[elm.report_id] = EEWID;

      clone.querySelector(".EEWLocalID").textContent = EEWID;
      clone.querySelector(".report_num").textContent = elm.report_num;
      clone.querySelector(".calcintensity").textContent = elm.calcintensity ? elm.calcintensity : "?";
      clone.querySelector(".calcintensity").style.background = shindoConvert(elm.calcintensity, 2)[0];
      clone.querySelector(".calcintensity").style.color = shindoConvert(elm.calcintensity, 2)[1];

      clone.querySelector(".is_final").style.display = elm.is_final ? "inline" : "none";
      clone.querySelector(".canceled").style.display = elm.is_cancel ? "flex" : "none";
      clone.querySelector(".region_name").textContent = elm.region_name ? elm.region_name : "震源地域不明";
      clone.querySelector(".origin_time").textContent = dateEncode(3, elm.origin_time);
      clone.querySelector(".magunitude").textContent = elm.magunitude ? elm.magunitude : "不明";
      clone.querySelector(".depth").textContent = elm.depth ? elm.depth : "不明";
      clone.querySelector(".traning").style.display = elm.is_training ? "block" : "none";

      clone.querySelector(".userIntensity").textContent = elm.userIntensity ? elm.userIntensity : "?";
      clone.querySelector(".userDataWrap").style.background = shindoConvert(elm.userIntensity, 2)[0];
      clone.querySelector(".userDataWrap").style.color = shindoConvert(elm.userIntensity, 2)[1];

      clone.querySelector(".distance").textContent = elm.distance ? Math.round(elm.distance) + "km" : "";

      clone.querySelector(".EEWWrap").setAttribute("id", "EEW-" + elm.report_id);

      document.getElementById("EEW-Panel").appendChild(clone);
      document.getElementById("sokuho-Panel").scroll(0, 0);
    } else {
      //既知の地震、新しい報もしくは情報更新
      if (!same) {
        //既知の地震、新しい報
      }
      var EQMenu = document.getElementById("EEW-" + elm.report_id);

      if (EQMenu) {
        alertflgTmp = "(" + elm.alertflg + ")";
        if (!elm.alertflg) alertflgTmp = "";
        EQMenu.querySelector(".alertflg").textContent = alertflgTmp;
        EQMenu.querySelector(".report_num").textContent = elm.report_num;

        if (elm.alertflg == "警報") {
          EQMenu.classList.add("keihou");
          EQMenu.classList.remove("yohou");
        } else if (elm.alertflg == "予報") {
          EQMenu.classList.add("yohou");
          EQMenu.classList.remove("keihou");
        }

        EQMenu.querySelector(".calcintensity").textContent = elm.calcintensity ? elm.calcintensity : "?";
        EQMenu.querySelector(".calcintensity").style.background = shindoConvert(elm.calcintensity, 2)[0];
        EQMenu.querySelector(".calcintensity").style.color = shindoConvert(elm.calcintensity, 2)[1];

        EQMenu.querySelector(".is_final").style.display = elm.is_final ? "inline" : "none";
        EQMenu.querySelector(".canceled").style.display = elm.is_cancel ? "flex" : "none";
        EQMenu.querySelector(".region_name").textContent = elm.region_name ? elm.region_name : "震源地域不明";
        EQMenu.querySelector(".origin_time").textContent = dateEncode(3, elm.origin_time);
        EQMenu.querySelector(".magunitude").textContent = elm.magunitude ? elm.magunitude : "不明";
        EQMenu.querySelector(".depth").textContent = elm.depth ? elm.depth : "不明";

        EQMenu.querySelector(".userIntensity").textContent = elm.userIntensity ? elm.userIntensity : "?";
        EQMenu.querySelector(".userDataWrap").style.background = shindoConvert(elm.userIntensity, 2)[0];
        EQMenu.querySelector(".userDataWrap").style.color = shindoConvert(elm.userIntensity, 2)[1];

        EQMenu.querySelector(".distance").textContent = elm.distance ? Math.round(elm.distance) + "km" : "";
      }
    }
    /*
    if (elm.intensityAreas) {
      var intAreaTmp = [];
      if (elm.intensityAreas["0"]) {
        elm.intensityAreas["0"].forEach(function (elm2) {
          intAreaTmp.push({ int: "0", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["1"]) {
        elm.intensityAreas["1"].forEach(function (elm2) {
          intAreaTmp.push({ int: "1", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["2"]) {
        elm.intensityAreas["2"].forEach(function (elm2) {
          intAreaTmp.push({ int: "2", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["3"]) {
        elm.intensityAreas["3"].forEach(function (elm2) {
          intAreaTmp.push({ int: "3", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["4"]) {
        elm.intensityAreas["4"].forEach(function (elm2) {
          intAreaTmp.push({ int: "4", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["5-"]) {
        elm.intensityAreas["5-"].forEach(function (elm2) {
          intAreaTmp.push({ int: "5-", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["5+"]) {
        elm.intensityAreas["5+"].forEach(function (elm2) {
          intAreaTmp.push({ int: "5+", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["6-"]) {
        elm.intensityAreas["6-"].forEach(function (elm2) {
          intAreaTmp.push({ int: "6-", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["6+"]) {
        elm.intensityAreas["6+"].forEach(function (elm2) {
          intAreaTmp.push({ int: "6+", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["7"]) {
        elm.intensityAreas["7"].forEach(function (elm2) {
          intAreaTmp.push({ int: "7", areaCode: elm2 });
        });
      }
      if (elm.intensityAreas["?"]) {
        elm.intensityAreas["不明"].forEach(function (elm2) {
          intAreaTmp.push({ int: "?", areaCode: elm2 });
        });
      }

      if (sections.length !== 0) {
        intAreaTmp.forEach(function (elm2) {
          var sectTmp = sections.find(function (elm3) {
            return elm3.name == AreaForecastLocalE[elm2.areaCode].name;
          });
          if (sectTmp && sectTmp.item) sectTmp.item.setStyle({ fillColor: shindoConvert(elm2.int, 2)[0] });
        });
      }
    }
*/
    epiCenterUpdate(elm.report_id, elm.latitude, elm.longitude);

    now_EEW = now_EEW.filter(function (elm2) {
      return elm2.report_id !== elm.report_id;
    });
    now_EEW.push(elm);
  });
  now_EEW = now_EEW.filter(function (elm) {
    var stillEQ = data.find(function (elm2) {
      return elm.report_id == elm2.report_id;
    });
    //終わった地震
    if (!stillEQ) {
      document.getElementById("EEW-" + elm.report_id).remove();
      epiCenterClear(elm.report_id);
    } else if (elm.is_cancel) {
      epiCenterClear(elm.report_id);
      //setTimeout(function () {
      document.getElementById("EEW-" + elm.report_id).remove();
      // }, 1000);
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
      epicenterElm.markerElm.setLatLng([latitude, longitude]);
      epicenterElm.latitude = latitude;
      epicenterElm.longitude = longitude;
    } else {
      var EEWIDTmp = EEW_LocalIDs[eid];

      var ESMarker = L.marker([latitude, longitude], {
        icon: epicenterIcon,
        pane: "overlayPane",
        renderer: overlayCanvas,
        interactive: false,
      })
        .addTo(map)
        .bindTooltip(String(EEWIDTmp), { permanent: true, direction: "top", className: "epiCenterTooltip", offset: [0, -10] });

      epiCenter.push({ eid: eid, markerElm: ESMarker, latitude: latitude, longitude: longitude, EEWID: Number(EEWIDTmp) });
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
    if (EQElm.PCircleElm) EQElm.PCircleElm.setLatLng([latitude, longitude]);
    if (EQElm.SCircleElm) EQElm.SCircleElm.setLatLng([latitude, longitude]);
    if (EQElm.SIElm) EQElm.SIElm.setLatLng([latitude, longitude]);
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
    var epicenterElm = epiCenter.find(function (elm2) {
      return elm2.eid == eid;
    });
    if (epicenterElm && epicenterElm.markerElm) {
      map.removeLayer(epicenterElm.markerElm);
      epicenterElm.markerElm = null;
    }
  }
}

//🔴地震情報🔴
var template2 = document.getElementById("EQListTemplate");
var template2_2 = document.getElementById("EQListTemplate2");
var EQListWrap;
var EQDetectItem = [];
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
          url: "src/EQDetail.html", //?eid=" + elm.eventId + "&detailURL=" + encodeURIComponent(elm.DetailURL.join("[ZQ_URLSEPARATE]")),
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
function EQDetect(data) {
  var EQD_Item = EQDetectItem.find(function (elm) {
    return elm.id == data.id;
  });
  if (EQD_Item) {
    EQD_Item.lat = data.lat;
    EQD_Item.lng = data.lng;
    EQD_Item.marker.setRadius(data.Radius * 1000);
  } else {
    //var EQmarker = L.marker([data.lat, data.lng]).addTo(map);
    var EQmarker = L.circle([data.lat, data.lng], {
      radius: data.Radius * 1000 + 5000,
      color: "#ffffff",
      fill: false,
      // fillColor: "#ffffff",
      // fillOpacity: 0.5,
      // className: "EQDetectCircle",
      renderer: EQDetectCanvas,
      interactive: false,
    }).addTo(map);
    map.setView([data.lat, data.lng], 9);

    EQDetectItem.push({
      id: data.id,
      lat: data.lat,
      lng: data.lng,
      marker: EQmarker,
    });
  }
}
//地震検知情報更新
function EQDetectFinish(id) {
  EQDetectItem.forEach(function (elmA, index) {
    if (elmA.id == id) {
      map.removeLayer(elmA.marker);
      EQDetectItem.splice(index, 1);
    }
  });
}

//🔴UI🔴
var updateTimeTmp = 0;
var updateTimeDialog = document.getElementById("UpdateTime_detail");

//通知更新
function Show_notification(data) {
  document.getElementById("notification_Area").classList.remove("no_notification");
  notifications = notifications.concat(data);

  var notifyNum = notifications.length;
  if (notifyNum > 9) notifyNum = "9+";
  document.getElementById("plus_badge").textContent = notifyNum;

  var notificationsTmp = notifications.reverse();
  removeChild(document.getElementById("notification_wrap"));
  notificationsTmp.forEach(function (elm) {
    var clone = templateN.content.cloneNode(true);
    clone.querySelector(".notification_title").textContent = elm.title;
    clone.querySelector(".notification_content").textContent = elm.detail;
    clone.querySelector(".notification_time").textContent = dateEncode(3, elm.time);

    var keyColor = "transparent";
    switch (elm.type) {
      case "error":
        keyColor = "rgb(255, 62, 48)";
        break;
      case "warn":
        keyColor = "rgb(231, 239, 77)";
        break;
      case "info":
        keyColor = "rgb(48, 148, 255)";
        break;
      default:
        break;
    }

    clone.querySelector(".notification_item").style.borderColor = keyColor;

    document.getElementById("notification_wrap").appendChild(clone);
  });
}

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
    iconElm.classList.add("SuccessAnm");
    iconElm.classList.add("Success");
    iconElm.classList.remove("Error");
  } else if (condition == "Error") {
    iconElm.classList.remove("Success");
    iconElm.classList.add("Error");
  } else if (condition == "Disconnect") {
    iconElm.classList.remove("Success");
    iconElm.classList.remove("Error");
  }

  iconElm.addEventListener("animationend", function () {
    this.classList.remove("SuccessAnm");
  });
}

//接続状況ダイアログ表示
document.getElementById("UpdateTimeWrap").addEventListener("click", function () {
  updateTimeDialog.showModal();
});
//接続状況ダイアログ非表示
document.getElementById("UpdateTimeClose").addEventListener("click", function () {
  updateTimeDialog.close();
});

//🔴汎用関数 map.js共用🔴

var notifications = [];
var templateN = document.getElementById("notificationTemplate");

document.getElementById("notification_more").addEventListener("click", function () {
  document.getElementById("notification_Area").classList.toggle("open");
});
