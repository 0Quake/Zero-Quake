//var { ipcRenderer } = require("electron");

var now_EEW = [];
var EEWDetectionTimeout;
var Replay;
var ICT_JST = 0;
var setting;
//ipcRenderer.on("message2", (event, request) => {
window.electronAPI.messageSend((event, request) => {
  if (request.action == "EEWAlertUpdate") {
    EEWAlertUpdate(request.data);
  } else if (request.action == "kmoniTimeUpdate") {
    kmoniTimeUpdate(request.Updatetime, request.LocalTime, request.type, request.vendor);
  } else if (request.action == "kmoniUpdate") {
    kmoniTimeUpdate(request.Updatetime, request.LocalTime, "kmoniImg");
  } else if (request.action == "MSSelect") {
    document.getElementById(request.str).selected = true;

    /*} else if (request.action == "EEW_Detection") {
    document.getElementById("EEWDetection").style.display = "block";
    clearTimeout(EEWDetectionTimeout);
    EEWDetectionTimeout = setTimeout(function () {
      document.getElementById("EEWDetection").style.display = "none";
    }, 300000);*/
  } else if (request.action == "PSWaveUpdate") {
    epiCenterUpdate(request.data.report_id, request.data.latitude, request.data.longitude);
  } else if (request.action == "PSWaveClear") {
    epiCenterClear(request.data);
  } else if (request.action == "setting") {
    setting = request.data;
  } else if (request.action == "Replay") {
    Replay = request.data;
  }
  return true;
});
//ipcRenderer.send("message", { action: "windowOpen" });
window.addEventListener("load", function () {
  fetch("https://67495dde3b39c2991829589f0101ab7a035eecf5.nict.go.jp/cgi-bin/json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      NICT_JST = new Date(json.st * 1000) - new Date();
      console.log(NICT_JST);
    });
  fetch("http://www.kmoni.bosai.go.jp/webservice/maintenance/message.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      document.getElementById("kmoni_Message").innerHTML = json.message;
    });
  setInterval(function () {
    document.getElementById("NICT_JST").innerText = dateEncode(3, new Date() + NICT_JST);
    document.getElementById("PC_TIME").innerText = dateEncode(3, new Date());
  }, 200);
});

window.addEventListener("online", (e) => {
  document.getElementById("offline").close();
  document.getElementById("offline2").style.display = "none";
});

window.addEventListener("offline", (e) => {
  document.getElementById("offline").showModal();
  document.getElementById("offline2").style.display = "block";
});
window.addEventListener("load", (e) => {
  if (!navigator.onLine) {
    document.getElementById("offline").showModal();
    document.getElementById("offline2").style.display = "block";
  }
});

var template = document.getElementById("EEWTemplate");
var epiCenter = [];

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
      clone.querySelector(".alertflg").innerText = elm.alertflg;

      if (elm.alertflg == "警報") {
        clone.querySelector(".EEWWrap").classList.add("keihou");
      } else if (elm.alertflg == "予報") {
        clone.querySelector(".EEWWrap").classList.add("yohou");
      }

      clone.querySelector(".report_num").innerText = elm.report_num;
      var isFinalTmp = elm.is_final;
      if (!isFinalTmp) isFinalTmp = "";
      isFinalTmp = String(isFinalTmp).replace("false", "");
      isFinalTmp = Boolean(isFinalTmp);
      var isCancelTmp = elm.is_cancel;
      if (!isCancelTmp) isCancelTmp = "";
      isCancelTmp = String(isCancelTmp).replace("false", "");
      isCancelTmp = Boolean(isCancelTmp);
      clone.querySelector(".is_final").style.display = isFinalTmp ? "inline" : "none";
      clone.querySelector(".canceled").style.display = isCancelTmp ? "block" : "none";
      clone.querySelector(".region_name").innerText = elm.region_name;
      clone.querySelector(".origin_time").innerText = dateEncode(3, elm.origin_time);
      clone.querySelector(".calcintensity").innerText = elm.calcintensity;
      clone.querySelector(".magunitude").innerText = elm.magunitude;
      clone.querySelector(".depth").innerText = elm.depth;
      if (elm.distance) {
        clone.querySelector(".Wave_progress").style.display = "block";
        clone.querySelector(".distance").innerText = Math.round(elm.distance);
      }

      clone.querySelector(".EEWWrap").setAttribute("id", "EEW-" + elm.report_id);

      document.getElementById("EEW-Panel").appendChild(clone);
      document.getElementById("sokuho-Panel").scroll(0, 0);
    } else if (!same) {
      //既知の地震、新しい報
      var EQMenu = document.getElementById("EEW-" + elm.report_id);

      EQMenu.querySelector(".alertflg").innerText = elm.alertflg;
      EQMenu.querySelector(".report_num").innerText = elm.report_num;
      var isFinalTmp = elm.is_final;
      if (!isFinalTmp) isFinalTmp = "";
      isFinalTmp = String(isFinalTmp).replace("false", "");
      isFinalTmp = Boolean(isFinalTmp);
      var isCancelTmp = elm.is_cancel;
      if (!isCancelTmp) isCancelTmp = "";
      isCancelTmp = String(isCancelTmp).replace("false", "");
      isCancelTmp = Boolean(isCancelTmp);

      EQMenu.querySelector(".is_final").style.display = isFinalTmp ? "inline" : "none";
      EQMenu.querySelector(".canceled").style.display = isCancelTmp ? "block" : "none";
      EQMenu.querySelector(".region_name").innerText = elm.region_name;

      EQMenu.querySelector(".origin_time").innerText = dateEncode(3, elm.origin_time);
      EQMenu.querySelector(".calcintensity").innerText = elm.calcintensity;
      EQMenu.querySelector(".magunitude").innerText = elm.magunitude;
      EQMenu.querySelector(".depth").innerText = elm.depth;

      if (elm.distance) {
        EQMenu.querySelector(".Wave_progress").style.display = "block";
        EQMenu.querySelector(".distance").innerText = Math.round(elm.distance);
      }
    }

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
    if (!stillEQ) {
      //終わった地震
      document.getElementById("EEW-" + elm.report_id).remove();
      epiCenterClear(elm.report_id);
    }

    return stillEQ;
  });

  if (data.length == 0) {
    document.body.classList.remove("EEWMode");
  } else {
    document.body.classList.add("EEWMode");
  }
}

var latitudeTmp = 0;
var longitudeTmp = 0;
function epiCenterUpdate(eid, latitude, longitude) {
  latitude = latitudeConvert(latitude);
  longitude = latitudeConvert(longitude);
  if (latitude !== latitudeTmp || longitude !== longitudeTmp) {
    eid = Number(eid);

    if (map) {
      var epicenterElm = epiCenter.find(function (elm2) {
        return elm2.eid == eid;
      });
      if (epicenterElm && epicenterElm.markerElm) {
        epicenterElm.markerElm.setLatLng([latitude, longitude]);
        epicenterElm.latitude = latitude;
        epicenterElm.longitude = longitude;
      } else {
        var ESMarker = L.marker([latitude, longitude], {
          icon: epicenterIcon,
          pane: "pane700",
        }).addTo(map);

        epiCenter.push({ eid: eid, markerElm: ESMarker, latitude: latitude, longitude: longitude });
      }
    }

    var EQElm = psWaveList.find(function (elm) {
      return elm.id == eid;
    });
    if (EQElm) {
      document.querySelectorAll(".SWave,.PWave").forEach(function (elm) {
        elm.classList.remove("SWaveAnm");
        elm.classList.remove("PWaveAnm");
      });
      setTimeout(function () {
        document.querySelectorAll(".SWave").forEach(function (elm) {
          elm.classList.add("SWaveAnm");
        });
        document.querySelectorAll(".PWave").forEach(function (elm) {
          elm.classList.add("PWaveAnm");
        });
      }, 100);

      if (EQElm.PCircleElm) EQElm.PCircleElm.setLatLng([latitude, longitude]);
      if (EQElm.SCircleElm) EQElm.SCircleElm.setLatLng([latitude, longitude]);
      if (EQElm.SIElm) EQElm.SIElm.setLatLng([latitude, longitude]);
    }
    latitudeTmp = latitude;
    longitudeTmp = longitude;
  }
}
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
/*地震情報*/
//
//
//
//
//
//
//

var eqInfo = [];
function eqInfoControl(dataList) {
  dataList.forEach(function (data) {
    var EQElm = eqInfo.find(function (elm) {
      return elm.eventId == data.eventId;
    });

    if (EQElm) {
      /*          category: json[i].ttl,    */

      if (data.Timestamp && (!EQElm.Timestamp || EQElm.reportDateTime < data.reportDateTime)) EQElm.Timestamp = data.Timestamp;
      if (data.epiCenter && (!EQElm.epiCenter || EQElm.reportDateTime < data.reportDateTime)) EQElm.epiCenter = data.epiCenter;
      if (data.M && (!EQElm.M || EQElm.reportDateTime < data.reportDateTime)) EQElm.M = data.M;
      if (data.maxI && (!EQElm.maxI || EQElm.reportDateTime < data.reportDateTime)) EQElm.maxI = data.maxI;

      if (data.DetailURL && data.DetailURL[0] !== "" && !EQElm.DetailURL.includes(data.DetailURL[0])) EQElm.DetailURL.push(data.DetailURL[0]);
    } else {
      eqInfo.push(data);
    }
  });

  eqInfo.sort(function (a, b) {
    var r = 0;
    if (a.Timestamp < b.Timestamp) {
      r = -1;
    } else if (a.Timestamp > b.Timestamp) {
      r = 1;
    }
    return r;
  });

  eqInfoDraw([...eqInfo].reverse(), document.getElementById("JMA_EqInfo"), true);
}

function eqInfoUpdate() {
  fetch("https://www.jma.go.jp/bosai/quake/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      var dataTmp = [];
      json = json.filter(function (elm) {
        return elm.ttl == "震度速報" || elm.ttl == "震源に関する情報" || elm.ttl == "震源・震度情報" || elm.ttl == "遠地地震に関する情報";
      });
      for (let i = 0; i < 10; i++) {
        //console.log({ "地震ID:": json[i].eid, 情報の種別: json[i].ttl, 発生時刻: new Date(json[i].at), 震源: json[i].anm, M: json[i].mag, 最大震度: json[i].maxi, 詳細JSONURL: json[i].json });

        var maxi = json[i].maxi;
        if (!maxi) maxi = shindoConvert("?", 1);
        dataTmp.push({
          eventId: json[i].eid,
          category: json[i].ttl,
          Timestamp: new Date(json[i].at),
          epiCenter: json[i].anm,
          M: json[i].mag,
          maxI: maxi,
          reportDateTime: new Date(json[i].rdt),
          DetailURL: [String("https://www.jma.go.jp/bosai/quake/data/" + json[i].json)],
        });
      }
      eqInfoControl(dataTmp);
    });

  fetch("https://www3.nhk.or.jp/sokuho/jishin/data/JishinReport.xml")
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      var items = xml.querySelectorAll("item");
      var urls = [];

      var dataTmp = [];

      for (let i = 0; i < 10; i++) {
        var url = items[i].getAttribute("url");
        urls.push(url);
        fetch(url)
          .then((response) => {
            return response.arrayBuffer();
          }) // (2) レスポンスデータを取得
          .then((data) => {
            data = new TextDecoder("shift-jis").decode(data);
            var parser2 = new DOMParser();
            var xml2 = parser2.parseFromString(data, "application/xml");
            var eid = "20" + urls[i].split("data/")[1].split("_")[0].slice(-12);
            //console.log({ "地震ID:": eid, 情報の種別: "?", 発生時刻: new Date(xml2.querySelector("Timestamp").textContent), 震源: xml2.querySelector("Earthquake").getAttribute("Epicenter"), M: xml2.querySelector("Earthquake").getAttribute("Magnitude"), 最大震度: xml2.querySelector("Earthquake").getAttribute("Intensity"), 詳細JSONURL: urls[i] });
            eqInfoControl([
              {
                eventId: eid,
                category: "?",
                Timestamp: new Date(xml2.querySelector("Earthquake").getAttribute("Time")),
                epiCenter: xml2.querySelector("Earthquake").getAttribute("Epicenter"),
                M: xml2.querySelector("Earthquake").getAttribute("Magnitude"),
                maxI: xml2.querySelector("Earthquake").getAttribute("Intensity"),
                reportDateTime: new Date(xml2.querySelector("Timestamp").textContent),
                DetailURL: [urls[i]],
              },
            ]);
          });
      }
    });

  fetch("https://dev.narikakun.net/webapi/earthquake/post_data.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      //console.log({ "地震ID:": json[i].eid, 情報の種別: json[i].ttl, 発生時刻: new Date(json[i].at), 震源: json[i].anm, M: json[i].mag, 最大震度: json[i].maxi, 詳細JSONURL: json[i].json });
      var dataTmp = [
        {
          eventId: json.Head.EventID,
          category: json.Head.Title,
          Timestamp: new Date(json.Body.Earthquake.OriginTime),
          epiCenter: json.Body.Earthquake.Hypocenter.Name,
          M: json.Body.Earthquake.Magnitude,
          maxI: json.Body.Intensity.Observation.MaxInt,
          reportDateTime: new Date(json.Head.ReportDateTime),
          DetailURL: ["https://dev.narikakun.net/webapi/earthquake/post_data.json"],
        },
      ];
      eqInfoControl(dataTmp);
    });
  var dataTmp = [];

  fetch("https://www.hinet.bosai.go.jp/AQUA/aqua_catalogue.php?y=" + new Date().getFullYear() + "&m=" + (new Date().getMonth() + 1) + "&LANG=ja")
    .then((response) => response.arrayBuffer())
    .then((data) => {
      data = new TextDecoder("EUC-JP").decode(data);

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "text/html");
      var table = xml.querySelector(".aqua_catalogue");
      dataTmp = [];
      var elms = [].map
        .call(table.querySelectorAll("tr"), (element) => {
          return element;
        })
        .filter(function (elm) {
          return elm.classList.contains("off");
        });

      for (let i = 0; i < Math.min(10, elms.length); i++) {
        var td = elms[i].querySelectorAll("td");
        var URLStr = elms[i].getAttribute("onmouseover").split("aquaPreview(")[1].split(",");
        var url1 = URLStr[1].replaceAll("'", "").replace("../", "https://www.hinet.bosai.go.jp/");
        var url2 = URLStr[2].split(")")[0].replaceAll("'", "").replace("../", "https://www.hinet.bosai.go.jp/");
        var Datas = {
          date: new Date(td[0].textContent),
          center: td[1].textContent,
          lat: latitudeConvert(td[2].textContent),
          lng: latitudeConvert(td[3].textContent),
          depth: Number(td[4].textContent.replace("km", "")),
          M: Number(td[5].textContent),
          souko: td[6].textContent,
          keisha: td[7].textContent,
          suberikaku: td[8].textContent,
          quality: Number(td[9].textContent),
          pointCount: Number(td[10].textContent),
          date: td[11].textContent.replace("C", "AQUA-CMT").replace("M", "AQUA-MT"),
        };

        dataTmp.push({
          eventId: null,
          category: null,
          Timestamp: new Date(td[0].textContent),
          epiCenter: td[1].textContent,
          M: td[5].textContent,
          maxI: "?",
          DetailURL: encodeURIComponent(JSON.stringify({ url1: url1, url2: url2, data: Datas })),
        });
      }

      if (elms.length < 10) {
        fetch("https://www.hinet.bosai.go.jp/AQUA/aqua_catalogue.php?y=" + new Date().getFullYear() + "&m=" + new Date().getMonth() + "&LANG=ja")
          .then((response) => response.arrayBuffer())
          .then((data) => {
            data = new TextDecoder("EUC-JP").decode(data);

            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/html");
            var table = xml.querySelector(".aqua_catalogue");
            var elms2 = [].map
              .call(table.querySelectorAll("tr"), (element) => {
                return element;
              })
              .filter(function (elm) {
                return elm.classList.contains("off");
              });

            for (let i = 0; i < 10 - elms.length; i++) {
              var URLStr = elms0[i].getAttribute("onmouseover").split("aquaPreview(")[1].split(",");
              var url1 = URLStr[1].replaceAll("'", "").replace("../", "https://www.hinet.bosai.go.jp/");
              var url2 = URLStr[2].split(")")[0].replaceAll("'", "").replace("../", "https://www.hinet.bosai.go.jp/");

              var td = elms2[i].querySelectorAll("td");
              var Datas = {
                date: new Date(td[0].textContent),
                center: td[1].textContent,
                lat: latitudeConvert(td[2].textContent),
                lng: latitudeConvert(td[3].textContent),
                depth: Number(td[4].textContent.replace("km", "")),
                M: Number(td[5].textContent),
                souko: td[6].textContent,
                keisha: td[7].textContent,
                suberikaku: td[8].textContent,
                quality: Number(td[9].textContent),
                pointCount: Number(td[10].textContent),
                date: td[11].textContent.replace("C", "AQUA-CMT").replace("M", "AQUA-MT"),
              };

              dataTmp.push({
                eventId: null,
                category: null,
                Timestamp: new Date(Datas[0]),
                epiCenter: Datas[1],
                M: Datas[5],
                maxI: "?",
                DetailURL: encodeURIComponent(JSON.stringify({ url1: url1, url2: url2, data: Datas })),
              });
            }

            eqInfoDraw(dataTmp, document.getElementById("AQUA_EqInfo"), false, "AQUA");
          });
      } else {
        eqInfoDraw(dataTmp, document.getElementById("AQUA_EqInfo"), false, "AQUA");
      }
    });

  fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=10")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      var dataTmp = [];
      for (let i = 0; i < Math.min(10, json.features.length); i++) {
        var elm = json.features[i];
        dataTmp.push({
          eventId: null,
          category: null,
          Timestamp: new Date(elm.properties.time),
          epiCenter: elm.properties.place,
          M: elm.properties.mag,
          maxI: "?",
          DetailURL: [elm.properties.url],
        });
      }
      eqInfoDraw(dataTmp, document.getElementById("USGS_EqInfo"), false, "USGS");
      //eqInfoControl(dataTmp);
    });
}

var template2 = document.getElementById("EQListTemplate");
var template2_2 = document.getElementById("EQListTemplate2");
function eqInfoDraw(data, EQListWrap, jma, type) {
  var EQTemplate;
  if (jma) {
    EQTemplate = template2;
  } else {
    EQTemplate = template2_2;
  }
  //var EQListWrap = document.getElementById("JMA_EqInfo");
  removeChild(EQListWrap);
  data.forEach(function (elm) {
    var clone = EQTemplate.content.cloneNode(true);

    var shindoColor = shindoConvert(elm.maxI, 2);
    if (jma) {
      clone.querySelector(".EQI_maxI").innerText = shindoConvert(elm.maxI, 0);
      clone.querySelector(".EQI_maxI").style.background = shindoColor[0];
      clone.querySelector(".EQI_maxI").style.color = shindoColor[1];
    }
    clone.querySelector(".EQI_epiCenter").innerText = elm.epiCenter;
    clone.querySelector(".EQI_datetime").innerText = dateEncode(3, elm.Timestamp);
    clone.querySelector(".EQI_magnitude").innerText = "M" + elm.M;

    if (elm.eventId) {
      clone.querySelector(".EQDetailButton").addEventListener("click", function () {
        window.open("EQDetail.html?eid=" + elm.eventId + "&detailURL=" + encodeURIComponent(elm.DetailURL.join("[ZQ_URLSEPARATE]")), "地震情報 - Zero Quake");
      });
    } else if (type == "USGS") {
      clone.querySelector(".EQDetailButton").addEventListener("click", function () {
        window.open(elm.DetailURL, "地震情報 - Zero Quake");
      });
    } else if (type == "AQUA") {
      clone.querySelector(".EQDetailButton").addEventListener("click", function () {
        window.open("EQDetail.html?dataAQUA=" + elm.DetailURL, "地震情報 - Zero Quake");
      });
    }
    EQListWrap.appendChild(clone);
  });
}
setInterval(eqInfoUpdate, 10000);
eqInfoUpdate();

//
//
//
//UI

document.getElementById("EQInfoSelect").addEventListener("change", function () {
  document.querySelectorAll(".activeEQInfo").forEach(function (elm) {
    elm.classList.remove("activeEQInfo");
  });
  document.getElementById(this.value).classList.add("activeEQInfo");
});

var updateTimeTmp = 0;
function kmoniTimeUpdate(updateTime, LocalTime, type, vendor) {
  /*
  Updatetime: new Date(data.time),
  LocalTime: new Date(),
  type: "P2P_EEW",
*/
  if (Math.floor(updateTimeTmp / 1000) < Math.floor(updateTime / 1000)) {
    updateTimeTmp = updateTime;
    document.getElementById("all_UpdateTime").innerText = dateEncode(3, updateTime);
  }

  if (vendor) {
    document.getElementById("ymoniVendor").innerText = vendor == "YE" ? "East" : "West";
  }
  document.getElementById(type + "_UT").innerText = dateEncode(3, updateTime);
  var iconElm = document.getElementById(type + "_ICN");

  iconElm.classList.add("SuccessAnm");
  iconElm.classList.add("Success");
  iconElm.classList.remove("Error");

  iconElm.addEventListener("animationend", function () {
    this.classList.remove("SuccessAnm");
  });
}

//
//
//
//汎用関数

function removeChild(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function dateEncode(type, dateTmp, inputtype) {
  if (inputtype == 1) {
    var str = String(dateTmp);
    const year = Number(str.substring(0, 4)); //2022
    const month = Number(str.substring(4, 6)); //2
    const day = Number(str.substring(6, 8)); //5
    const hour = Number(str.substring(8, 10)); //21
    const min = Number(str.substring(10, 12)); //0
    const sec = Number(str.substring(12, 14)); //0
    dateTmp = new Date(year, month - 1, day, hour, min, sec); //monthは0オリジン
  } else {
    dateTmp = new Date(dateTmp);
  }
  if (type == 1) {
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");
    return YYYY + MM + DD + hh + mm + ss;
  } else if (type == 2) {
    //YYYYMMDD
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    return YYYY + MM + DD;
  } else if (type == 3) {
    //YYYY/MM/DD HH:MM:SS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss;
  } else {
    //free
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");

    type.replaceAll("YYYY", YYYY);
    type.replaceAll("MM", MM);
    type.replaceAll("DD", DD);
    type.replaceAll("hh", hh);
    type.replaceAll("mm", mm);
    type.replaceAll("ss", ss);

    return type;
  }
}

function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (isNaN(str)) {
    ShindoTmp = String(str);
    ShindoTmp = ShindoTmp.replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
    ShindoTmp = ShindoTmp.replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-");
    ShindoTmp = ShindoTmp.replace(/\s+/g, "");
    switch (str) {
      case "-1":
      case "不明":
        ShindoTmp = "?";
        break;
      case "1":
      case "10":
        ShindoTmp = "1";
        break;
      case "2":
      case "20":
        ShindoTmp = "2";
        break;
      case "3":
      case "30":
        ShindoTmp = "3";
        break;
      case "4":
      case "40":
        ShindoTmp = "4";
        break;
      case "5-":
      case "45":
        ShindoTmp = "5-";
        break;
      case "5+":
      case "50":
        ShindoTmp = "5+";
        break;
      case "6-":
      case "55":
        ShindoTmp = "6-";
        break;
      case "6+":
      case "60":
        ShindoTmp = "6+";
        break;
      case "7":
      case "70":
        ShindoTmp = "7";
        break;
      case "99":
        ShindoTmp = "7+";
        break;
    }
  } else {
    if (str < 0.5) {
      ShindoTmp = "0";
    } else if (str < 1.5) {
      ShindoTmp = "1";
    } else if (str < 2.5) {
      ShindoTmp = "2";
    } else if (str < 3.5) {
      ShindoTmp = "3";
    } else if (str < 4.5) {
      ShindoTmp = "4";
    } else if (str < 5) {
      ShindoTmp = "5-";
    } else if (str < 5.5) {
      ShindoTmp = "5+";
    } else if (str < 6) {
      ShindoTmp = "6-";
    } else if (str < 6.5) {
      ShindoTmp = "6+";
    } else if (6.5 <= str) {
      ShindoTmp = "7";
    } else if (7.5 <= str) {
      ShindoTmp = "7+";
    } else {
      ShindoTmp = "?";
    }
  }
  if (["?", "0", "1", "2", "3", "4", "5-", "5+", "6-", "6+", "7", "7+"].includes(ShindoTmp)) {
    switch (responseType) {
      case 1:
        var ConvTable = { "?": "不明", 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5弱", "5+": "5強", "6-": "6弱", "6+": "6強", 7: "7", "7+": "7以上" };
        return ConvTable[ShindoTmp];
        break;
      case 2:
        var ConvTable = {
          "?": ["#D1D1D1", "#444"],
          0: ["#D1D1D1", "#444"],
          1: ["#54C9E3", "#222"],
          2: ["#2B8DFC", "#111"],
          3: ["#32BA37", "#111"],
          4: ["#DBD21F", "#000"],
          "5-": ["#FF8C00", "#FFF"],
          "5+": ["#FF5714", "#FFF"],
          "6-": ["#E60000", "#FFF"],
          "6+": ["#8A0A0A", "#FFF"],
          7: ["#C400DE", "#FFF"],
          "7+": ["#C400DE", "#FFF"],
        };
        return ConvTable[ShindoTmp];
        break;

      case 0:
      default:
        return ShindoTmp;
        break;
    }
  } else {
    return str;
  }
}

document.getElementById("setting").addEventListener("click", function () {
  window.electronAPI.messageReturn({
    action: "settingWindowOpen",
  });
});
function latitudeConvert(data) {
  if (!isNaN(data)) {
    return Number(data);
  } else if (data.match(/N/)) {
    return Number(data.replace("N", ""));
  } else if (data.match(/S/)) {
    return 0 - Number(data.replace("S", ""));
  } else if (data.match(/E/)) {
    return Number(data.replace("E", ""));
  } else if (data.match(/W/)) {
    return 0 - Number(data.replace("W", ""));
  } else {
    return data;
  }
}
