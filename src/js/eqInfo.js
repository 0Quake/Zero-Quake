var pointList;
fetch("https://files.nakn.jp/earthquake/code/PointSeismicIntensityLocation.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    pointList = data;
  });

var data_time = document.getElementById("data_time");
var data_maxI = document.getElementById("data_maxI");
var data_M = document.getElementById("data_M");
var data_depth = document.getElementById("data_depth");
var data_center = document.getElementById("data_center");
var data_comment = document.getElementById("data_comment");
var areaLocation = { 100: ["43.23", "141.65"], 101: ["43.12", "141.55"], 102: ["42.99", "141.55"], 105: ["42.49", "140.35"], 106: ["42.12", "140.67"], 107: ["41.68", "140.43"], 110: ["42.42", 139.885], 115: ["43.08", "140.82"], 116: ["42.91", "140.77"], 117: ["43.14", "140.44"], 119: ["42.17", "139.51"], 120: ["43.80", "141.93"], 121: ["43.64", "141.89"], 122: ["43.34", "141.66"], 125: ["44.28", "142.16"], 126: ["43.62", "142.68"], 127: ["42.98", "142.40"], 130: ["44.88", "141.75"], 131: ["44.05", "141.86"], 135: ["45.02", "141.85"], 136: ["44.74", "142.76"], 139: ["45.25", "141.22"], 140: ["43.91", "144.17"], 141: ["44.02", "143.77"], 142: ["44.58", "142.96"], 145: ["42.65", "140.83"], 146: ["42.76", "142.13"], 150: ["42.73", "142.30"], 151: ["42.42", "142.50"], 152: ["41.94", "143.24"], 155: ["43.47", "143.75"], 156: ["42.81", "143.66"], 157: ["42.29", "143.30"], 160: ["43.64", "144.39"], 161: ["42.96", "144.07"], 165: ["44.11", "145.25"], 166: ["43.39", "145.28"], 167: ["43.37", "145.80"], 200: ["40.96", "140.43"], 201: ["40.63", "140.55"], 202: ["40.47", "141.17"], 203: ["41.43", "140.86"], 210: ["40.28", "141.62"], 211: ["39.36", "141.90"], 212: ["40.21", "141.30"], 213: ["38.99", "141.11"], 220: ["38.72", "141.52"], 221: ["37.96", "140.88"], 222: ["38.45", "141.44"], 230: ["40.02", "139.96"], 231: ["39.20", "139.91"], 232: ["40.06", "140.30"], 233: ["39.18", "140.65"], 240: ["39.01", 139.915], 241: ["38.74", "140.14"], 242: ["38.59", "140.37"], 243: ["38.05", "139.99"], 250: ["37.29", "140.63"], 251: ["37.68", "140.74"], 252: ["37.47", "139.83"], 300: ["36.78", "140.36"], 301: ["35.86", "140.14"], 310: ["37.02", "140.12"], 311: ["36.76", "140.13"], 320: ["36.69", "138.93"], 321: ["36.25", "139.46"], 330: ["36.12", "139.19"], 331: ["35.93", "139.82"], 332: ["36.01", "138.97"], 340: ["35.39", "140.24"], 341: ["35.84", "140.24"], 342: ["35.11", "139.84"], 350: ["35.68", "139.87"], 351: ["35.77", "139.35"], 352: ["35.80", "139.09"], 354: ["34.21", "139.13"], 355: ["34.69", "139.44"], 356: ["34.38", "139.26"], 357: ["33.89", "139.59"], 358: ["32.46", "139.76"], 359: ["26.63", "142.18"], 360: ["35.31", "139.25"], 361: ["35.48", "139.28"], 370: ["37.16", "138.09"], 371: ["37.42", "138.62"], 372: ["38.47", "139.25"], 375: ["37.82", "138.28"], 380: ["36.98", "137.63"], 381: ["36.74", "137.15"], 390: ["37.35", "137.24"], 391: ["36.65", "136.65"], 400: ["35.97", "136.13"], 401: ["35.55", "135.91"], 411: ["35.63", "138.53"], 412: ["35.79", "138.92"], 420: ["36.87", "138.63"], 421: ["36.43", "138.02"], 422: ["35.85", "137.70"], 430: ["36.27", "136.90"], 431: ["35.43", "137.13"], 432: ["35.44", "136.68"], 440: ["35.09", "138.95"], 441: ["35.36", "138.87"], 442: ["35.05", "138.08"], 443: ["34.84", "137.93"], 450: ["35.19", "137.81"], 451: ["34.87", "137.16"], 460: ["35.02", "136.67"], 461: ["34.55", "136.62"], 462: ["33.75", "136.01"], 500: ["35.22", "136.29"], 501: ["35.06", "136.12"], 510: ["35.53", "135.10"], 511: ["35.17", "135.42"], 520: ["34.97", "135.41"], 521: ["34.46", "135.62"], 530: ["35.55", "134.49"], 531: ["34.72", "134.87"], 532: ["34.99", "134.44"], 535: ["34.59", "135.02"], 540: ["34.40", "135.97"], 550: ["33.98", "135.37"], 551: ["33.51", "135.83"], 560: ["35.36", "134.36"], 562: ["35.48", "133.82"], 563: ["35.28", "133.49"], 570: ["35.00", "132.71"], 571: ["34.44", "131.87"], 575: ["36.21", "133.31"], 580: ["34.95", "134.06"], 581: ["34.86", "133.69"], 590: ["34.77", "132.46"], 591: ["34.70", "133.25"], 592: ["34.27", "132.92"], 600: ["34.04", "133.94"], 601: ["33.57", "134.30"], 610: ["34.46", "134.00"], 611: ["34.15", "133.84"], 620: ["34.25", "133.15"], 621: ["33.75", "132.79"], 622: ["32.96", "132.58"], 630: ["33.53", "133.81"], 631: ["33.53", "133.37"], 632: ["33.08", "133.10"], 700: ["34.50", "131.47"], 702: ["34.06", "131.16"], 703: ["33.94", "132.07"], 704: ["34.07", "131.75"], 710: ["33.61", "130.48"], 711: ["33.66", "131.06"], 712: ["33.69", "130.79"], 713: ["33.24", "130.55"], 720: ["33.21", "129.85"], 721: ["33.02", "130.18"], 730: ["33.24", "129.65"], 731: ["32.83", "129.85"], 732: ["32.67", "130.30"], 735: ["34.64", "129.40"], 736: ["33.85", "129.69"], 737: ["32.84", "129.06"], 740: ["32.85", "131.02"], 741: ["32.56", "130.68"], 742: ["32.24", "130.87"], 743: ["32.51", "130.05"], 750: ["33.72", "131.65"], 751: ["33.37", "131.53"], 752: ["32.97", "131.47"], 753: ["33.28", "131.15"], 760: ["32.47", "131.65"], 761: ["32.68", "131.20"], 762: ["32.00", "131.25"], 763: ["31.93", "131.01"], 770: ["32.01", "130.74"], 771: ["31.34", "130.95"], 774: ["29.22", "129.33"], 775: ["31.78", "129.79"], 776: ["30.41", "130.90"], 777: ["30.47", 130.195], 778: ["28.32", "129.94"], 779: ["27.05", "128.42"], 800: ["26.93", "127.94"], 801: ["26.16", "127.72"], 802: ["26.34", 126.815], 803: ["25.95", 131.305], 804: ["24.67", "124.70"], 805: ["24.34", "124.18"], 806: ["24.47", "123.00"], 807: ["24.43", "123.78"] };

let url = new URL(window.location.href);
let params = url.searchParams;
var eid;
var markerElm;
var newInfoDateTime = 0;
var sections = [];
var map_drawed = false;
var map;
var jmaURL;
var jmaXMLURL;
//var nhkURL;
var narikakunURL;
var config;
var overlayActive;
var overlayTmp = [];
var offlineMapActive = true;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "metaData") {
    eid = request.eid;
    jmaURL = request.urls.filter(function (elm) {
      return elm.indexOf("www.jma.go.jp") != -1;
    });
    jmaXMLURL = request.urls.filter(function (elm) {
      return elm.indexOf("www.data.jma.go.jp") != -1;
    });
    /*
        nhkURL = request.urls.filter(function (elm) {
          return elm.indexOf("nhk.or.jp") != -1;
        });*/
    narikakunURL = request.urls.filter(function (elm) {
      return elm.indexOf("dev.narikakun.net") != -1;
    });
    init();
  } else if (request.action == "setting") {
    config = request.data;
  }
});

var jmaURLHis = [];
var jmaXMLURLHis = [];
///var nhkURLHis = [];
var narikakunURLHis = [];

var mapLevel = 0; //マップの状況　0:なし/1:NHK/2:JMAXML/3:完全/

function Mapinit() {
  map = L.map("mapcontainer", {
    maxBounds: [
      [90, -180],
      [-90, 180],
    ],
    center: [32.99125, 138.46],
    zoom: 4,
    minZoom: 3.5,
    maxZoom: 21,
    zoomAnimation: false,
    zoomSnap: 0.1,
    zoomDelta: 0.5,
    preferCanvas: false,
    zoomControl: false,
    worldCopyJump: true,
    inertia: false,
    maxBoundsViscosity: 1,
  });
  map.setView([32.99125, 138.46], 4);

  map.createPane("tsunamiPane").style.zIndex = 201;
  map.createPane("jsonMAP1Pane").style.zIndex = 210;
  map.createPane("jsonMAP2Pane").style.zIndex = 211;
  var jsonMAP1Canvas = L.canvas({ pane: "jsonMAP1Pane" });
  var jsonMAP2Canvas = L.canvas({ pane: "jsonMAP2Pane" });

  map.createPane("PointsPane").style.zIndex = 220;

  //L.control.scale({ imperial: false }).addTo(map);←縮尺

  mapLayer = new L.LayerGroup();
  mapLayer.id = "mapLayer";
  mapLayer.addTo(map);

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
    minZoom: 9,
    minNativeZoom: 9,
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
    minZoom: 2,
    maxZoom: 16,
    attribution: "国土地理院",
  });
  var overlay2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png", {
    minZoom: 11,
    maxZoom: 18,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
  });
  var overlay3 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: "国土地理院",
  });
  var overlay4 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: "国土地理院",
  });
  var overlay5 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: "国土地理院",
  });
  var overlay6 = L.tileLayer("https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: "JMA",
  });
  map.createPane("pane300").style.zIndex = 300;
  map.createPane("jsonMAPPane").style.zIndex = 210;

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

  fetch("./Resource/basemap.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      basemap = L.geoJSON(json, {
        style: {
          color: "#666",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          attribution: "JMA",
          renderer: jsonMAP1Canvas,
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            sections.push({ name: feature.properties.name, item: layer });
            layer.bindPopup("<h3>地震情報/細分区域</h3>" + feature.properties.name);
          }
          if (config.home.Saibun == feature.properties.name) {
            layer.setStyle({ color: "#fff", weight: 2 });
          }
        },
      });
      mapLayer.addLayer(basemap);

      gjmap = L.geoJSON({ type: "FeatureCollection", features: [] });
      mapLayer.addLayer(gjmap);
      L.control
        .layers(
          {
            オフライン地図: gjmap,
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
          },
          {
            position: "topleft",
          }
        )
        .addTo(map);
      document.getElementById("splash").style.display = "none";
    });
  map.on("baselayerchange", function (layer) {
    offlineMapActive = layer.name == "オフライン地図";

    basemap.setStyle({ fill: offlineMapActive && !overlayActive });
    worldmap.setStyle({ fill: offlineMapActive && !overlayActive });
  });
  map.on("overlayadd", function (eventLayer) {
    overlayActive = true;
    basemap.setStyle({ fill: offlineMapActive && !overlayActive });
    worldmap.setStyle({ fill: offlineMapActive && !overlayActive });

    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      legend.addTo(map);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      legend2.addTo(map);
      overlayTmp.push(eventLayer.name);
    }
  });
  map.on("overlayremove", function (eventLayer) {
    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      map.removeControl(legend);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      overlayTmp = overlayTmp.filter(function (elm) {
        return elm !== eventLayer.name;
      });
    }
    if (overlayTmp.length == 0) {
      overlayActive = false;
      map.removeControl(legend2);
      basemap.setStyle({ fill: offlineMapActive && !overlayActive });
      worldmap.setStyle({ fill: offlineMapActive && !overlayActive });
    }
  });

  var currentZoom = map.getZoom();
  if (currentZoom < 6) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_1");
  } else if (currentZoom < 8) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_2");
  } else if (currentZoom < 9) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_3");
  } else {
    document.getElementById("mapcontainer").classList.add("zoomLevel_4");
  }
  var legend2 = L.control({ position: "bottomright" });
  legend2.onAdd = function (map) {
    var img = L.DomUtil.create("img");
    img.src = "https://disaportal.gsi.go.jp/hazardmap/copyright/img/dosha_keikai.png";
    return img;
  };

  map.on("zoom", function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1");
    document.getElementById("mapcontainer").classList.remove("zoomLevel_2");
    document.getElementById("mapcontainer").classList.remove("zoomLevel_3");
    document.getElementById("mapcontainer").classList.remove("zoomLevel_4");

    if (currentZoom < 6) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_1");
    } else if (currentZoom < 8) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_2");
    } else if (currentZoom < 9) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_3");
    } else {
      document.getElementById("mapcontainer").classList.add("zoomLevel_4");
    }
    if (currentZoom >= 7) {
      basemap.setStyle({ stroke: true });
    } else {
      basemap.setStyle({ stroke: false });
    }
  });

  var homeIcon = L.icon({
    iconUrl: "img/homePin.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  L.marker([config.home.latitude, config.home.longitude], { keyboard: false, icon: homeIcon }).addTo(map).bindPopup(config.home.name);
}

function jma_ListReq() {
  fetch("https://www.jma.go.jp/bosai/quake/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      data.forEach(function (elm) {
        var urlTmp = "https://www.jma.go.jp/bosai/quake/data/" + elm.json;
        if (elm.eid == eid && !jmaURL.includes(urlTmp)) {
          jmaURL.push(urlTmp);
        }
      });

      mapDraw();
    })
    .catch(function (err) {});
}

function jma_B_ListReq() {
  fetch("https://www.jma.go.jp/bosai/estimated_intensity_map/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      data.forEach(function (elm) {
        if (elm.url.substring(0, 12) == eid) {
          var urlTmp = "https://www.jma.go.jp/bosai/estimated_intensity_map/data/" + elm.url + "/{x}{y}.png";
          jmaURL.push(urlTmp);

          L.tileLayer(urlTmp, {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
            variant: "toner-lite",
          }).addTo(map_102);
        }
      });

      mapDraw();
    })
    .catch(function (err) {});
}

function nhk_ListReq() {
  return false;
  fetch("https://www3.nhk.or.jp/sokuho/jishin/data/JishinReport.xml")
    .then(function (res) {
      return res.arrayBuffer();
    })
    .then(function (data) {
      const td = new TextDecoder("Shift_JIS");
      data = td.decode(data);

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "text/xml");

      var items = xml.querySelectorAll("item");

      items.forEach(function (elm) {
        var eidTmp = "20" + elm.attributes.url.nodeValue.split("data/")[1].split("_")[0].slice(-12);
        if (eidTmp == eid && !nhkURL.includes(elm.attributes.url.nodeValue)) {
          nhkURL.push(elm.attributes.url.nodeValue);
        }
      });
      mapDraw();
    })
    .catch(function (err) {});
}

function narikakun_ListReq(year, month, retry) {
  fetch("https://ntool.online/api/earthquakeList?year=" + year + "&month=" + month)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var nakn_detected = false;
      data.lists.forEach(function (elm) {
        var eidTmp = elm.split("/");
        eidTmp = eidTmp[eidTmp.length - 1];
        if (eidTmp.indexOf(eid) !== -1 && !narikakunURL.includes(elm)) {
          narikakunURL.push(elm);
          nakn_detected = true;
        }
      });

      if (!nakn_detected && !retry) {
        var yearTmp = new Date().getFullYear();
        var monthTmp = new Date().getMonth();
        if (monthTmp == 0) {
          yearTmp = new Date().getFullYear() - 1;
          monthTmp = 1;
        }

        narikakun_ListReq(yearTmp, monthTmp, true);
      }
      mapDraw();
    })
    .catch(function (err) {});
}

function init() {
  mapLevel = 0;

  nhk_ListReq();
  jma_ListReq();
  narikakun_ListReq(new Date().getFullYear(), new Date().getMonth() + 1);
  /*
  document.getElementById("ShindoSample0").style.background = shindoConvert(0, 2)[0];
  document.getElementById("ShindoSample0").style.color = shindoConvert(0, 2)[1];
  document.getElementById("ShindoSample1").style.background = shindoConvert(1, 2)[0];
  document.getElementById("ShindoSample1").style.color = shindoConvert(1, 2)[1];
  document.getElementById("ShindoSample2").style.background = shindoConvert(2, 2)[0];
  document.getElementById("ShindoSample2").style.color = shindoConvert(2, 2)[1];
  document.getElementById("ShindoSample3").style.background = shindoConvert(3, 2)[0];
  document.getElementById("ShindoSample3").style.color = shindoConvert(3, 2)[1];
  document.getElementById("ShindoSample4").style.background = shindoConvert(4, 2)[0];
  document.getElementById("ShindoSample4").style.color = shindoConvert(4, 2)[1];
  document.getElementById("ShindoSample5-").style.background = shindoConvert(4.5, 2)[0];
  document.getElementById("ShindoSample5-").style.color = shindoConvert(4.5, 2)[1];
  document.getElementById("ShindoSample5+").style.background = shindoConvert(5, 2)[0];
  document.getElementById("ShindoSample5+").style.color = shindoConvert(5, 2)[1];
  document.getElementById("ShindoSample6-").style.background = shindoConvert(5.5, 2)[0];
  document.getElementById("ShindoSample6-").style.color = shindoConvert(5.5, 2)[1];
  document.getElementById("ShindoSample6+").style.background = shindoConvert(6, 2)[0];
  document.getElementById("ShindoSample6+").style.color = shindoConvert(6, 2)[1];
  document.getElementById("ShindoSample7").style.background = shindoConvert(7, 2)[0];
  document.getElementById("ShindoSample7").style.color = shindoConvert(7, 2)[1];
*/
  Mapinit();
}

function mapDraw() {
  if (eid) {
    jmaURL.forEach(function (elm) {
      jma_Fetch(elm);
    });

    narikakunURL.forEach(function (elm) {
      narikakun_Fetch(elm);
    });

    /*
        nhkURL.forEach(function (elm) {
          nhkFetch(elm);
        });*/
    jmaXMLURL.forEach(function (elm) {
      jmaXMLFetch(elm);
    });

    jmaURLHis = jmaURLHis.concat(jmaURL);
    jmaXMLURLHis = jmaXMLURLHis.concat(jmaXMLURL);
    //nhkURLHis = nhkURLHis.concat(nhkURL);
    narikakunURLHis = narikakunURLHis.concat(narikakunURL);
    jmaURL = [];
    jmaXMLURL = [];
    //nhkURL = [];
    narikakunURL = [];

    const year = eid.substring(0, 4); //2022
    const month = eid.substring(4, 6); //2
    const day = eid.substring(6, 8); //5
    const hour = eid.substring(8, 10); //21
    const min = eid.substring(10, 12); //0
    const sec = eid.substring(12, 14); //0

    document.getElementById("yahooLink").setAttribute("href", "https://typhoon.yahoo.co.jp/weather/jp/earthquake/" + eid + ".html");
    document.getElementById("yahooLink").style.display = "block";
    document.getElementById("tenkijpLink").setAttribute("href", "https://earthquake.tenki.jp/bousai/earthquake/detail/" + year + "/" + month + "/" + day + "/" + year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec + ".html");
    document.getElementById("tenkijpLink").style.display = "block";
    document.getElementById("gooLink").setAttribute("href", "https://weather.goo.ne.jp/earthquake/id/" + eid + "/");
    document.getElementById("gooLink").style.display = "block";
  }
}

function jma_Fetch(url) {
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      if (json.Body.Earthquake) {
        var LatLngDepth = json.Body.Earthquake.Hypocenter.Area.Coordinate.replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");
      }

      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.OriginTime) var originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
        if (json.Body.Earthquake.Hypocenter.Area.Name) var epiCenterTmp = json.Body.Earthquake.Hypocenter.Area.Name;
        if (json.Body.Earthquake.Magnitude) var magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
      }
      if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt) var maxIntTmp = json.Body.Intensity.Observation.MaxInt;
      if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1]) var LatTmp = Number(LatLngDepth[1]);
      if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2]) var LngTmp = Number(LatLngDepth[2]);
      if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3]) var depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

      var cancelTmp = json.Head.InfoType == "取消";

      if (json.Body.Comments) {
        var commentText = "";
        if (json.Body.Comments.ForecastComment.Text) commentText += json.Body.Comments.ForecastComment.Text;
        if (json.Body.Comments.FreeFormComment) commentText += json.Body.Comments.FreeFormComment;
      }
      EQInfoControl({
        reportTime: json.Head.ReportDateTime,
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: depthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
      });

      if (json.Body.Intensity && json.Body.Intensity.Observation.Pref && mapLevel < 3) {
        mapLevel = 3;
        removeChild(document.getElementById("Shindo"));
        document.getElementById("ShindoWrap").style.display = "inline-block";
        map_drawed = true;
        json.Body.Intensity.Observation.Pref.forEach(function (elm) {
          var newDiv = document.createElement("div");
          var color1 = shindoConvert(elm.MaxInt, 2);
          newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + elm.MaxInt + "</span>" + elm.Name;
          newDiv.classList.add("ShindoItem", "ShindoItem1");
          document.getElementById("Shindo").appendChild(newDiv);
          newDiv.addEventListener("click", function () {
            this.classList.toggle("has-open");
            this.nextElementSibling.classList.toggle("open");
          });

          var newDiv = document.createElement("div");
          newDiv.innerHTML = "<div></div>";
          newDiv.classList.add("WrapLevel1", "close");
          document.getElementById("Shindo").appendChild(newDiv);

          if (elm.Area) {
            elm.Area.forEach(function (elm2) {
              var wrap = document.querySelectorAll(".WrapLevel1");

              var newDiv = document.createElement("div");
              var color2 = shindoConvert(elm2.MaxInt, 2);
              newDiv.innerHTML = "<span style='background:" + color2[0] + ";color:" + color2[1] + ";'>" + elm2.MaxInt + "</span>" + elm2.Name;
              newDiv.classList.add("ShindoItem", "ShindoItem2");
              wrap[wrap.length - 1].appendChild(newDiv);
              newDiv.addEventListener("click", function () {
                this.classList.toggle("has-open");
                this.nextElementSibling.classList.toggle("open");
              });

              var newDiv = document.createElement("div");
              newDiv.innerHTML = "<div></div>";
              newDiv.classList.add("WrapLevel2", "close");
              wrap[wrap.length - 1].appendChild(newDiv);

              var pointLocation = areaLocation[String(elm2.Code)];
              if (pointLocation) {
                var color4 = shindoConvert(elm2.MaxInt, 2);

                var divIcon = L.divIcon({
                  html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + elm2.MaxInt + "</div>",
                  className: "MaxShindoIcon",
                  iconSize: [22, 22],
                });

                L.marker([Number(pointLocation[0]), Number(pointLocation[1])], { icon: divIcon, pane: "shadowPane" }).addTo(map);
              }

              gjmap.setStyle({
                fill: false,
              });
              var sectionTmp = sections.find(function (elmA) {
                return elmA.name == elm2.Name;
              });
              if (sectionTmp) {
                sectionTmp.item
                  .setStyle({
                    fill: true,
                    fillColor: color2[0],
                    fillOpacity: 1,
                  })
                  .setPopupContent("<h3>細分区分：" + sectionTmp.name + "</h3>最大震度" + elm2.MaxInt);
              }
              if (elm2.City) {
                elm2.City.forEach(function (elm3) {
                  var wrap2 = document.querySelectorAll(".WrapLevel2");

                  var newDiv = document.createElement("div");
                  var color3 = shindoConvert(elm3.MaxInt, 2);
                  newDiv.innerHTML = "<span style='background:" + color3[0] + ";color:" + color3[1] + ";'>" + elm3.MaxInt + "</span>" + elm3.Name;
                  newDiv.classList.add("ShindoItem", "ShindoItem3");
                  wrap2[wrap2.length - 1].appendChild(newDiv);
                  newDiv.addEventListener("click", function () {
                    this.classList.toggle("has-open");
                    this.nextElementSibling.classList.toggle("open");
                  });

                  var newDiv = document.createElement("div");
                  newDiv.innerHTML = "<div></div>";
                  newDiv.classList.add("WrapLevel3", "close");
                  wrap2[wrap2.length - 1].appendChild(newDiv);

                  if (elm3.IntensityStation) {
                    elm3.IntensityStation.forEach(function (elm4) {
                      var wrap3 = document.querySelectorAll(".WrapLevel3");

                      var newDiv = document.createElement("div");
                      var color4 = shindoConvert(elm4.Int, 2);
                      newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + elm4.Int + "</span>" + elm4.Name.replace("＊", "");
                      newDiv.classList.add("ShindoItem", "ShindoItem4");

                      var divIcon = L.divIcon({
                        html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + elm4.Int + "</div>",
                        className: "ShindoIcon",
                        iconSize: [16, 16],
                      });

                      L.marker([elm4.latlon.lat, elm4.latlon.lon], { icon: divIcon, pane: "shadowPane" })
                        .addTo(map)
                        .bindPopup("<h3>観測点：" + elm4.Name.replace("＊", "") + "</h3>震度" + elm4.Int);

                      wrap3[wrap3.length - 1].appendChild(newDiv);
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
}

function narikakun_Fetch(url) {
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      if (json.Head.EventID == eid) {
        if (json.Body.Earthquake) {
          if (json.Body.Earthquake.OriginTime) var originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
          if (json.Body.Earthquake.Magnitude) var magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
          if (json.Body.Earthquake.Hypocenter.Depth) var depthTmp = Number(json.Body.Earthquake.Hypocenter.Depth);
          if (json.Body.Earthquake.Hypocenter.Name) var epiCenterTmp = json.Body.Earthquake.Hypocenter.Name;
          if (json.Body.Earthquake.Hypocenter.Latitude) var LatTmp = json.Body.Earthquake.Hypocenter.Latitude;
          if (json.Body.Earthquake.Hypocenter.Longitude) var LngTmp = json.Body.Earthquake.Hypocenter.Longitude;
        }
        if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt) var maxIntTmp = json.Body.Intensity.Observation.MaxInt;
        if (json.Body.Comments && json.Body.Comments.Observation) commentTmp = json.Body.Comments.Observation;

        var cancelTmp = json.Head.InfoType == "取消";

        EQInfoControl({
          reportTime: json.Head.ReportDateTime,
          originTime: originTimeTmp,
          maxI: maxIntTmp,
          mag: magnitudeTmp,
          lat: LatTmp,
          lng: LngTmp,
          depth: depthTmp,
          epiCenter: epiCenterTmp,
          comment: commentTmp,
          cancel: cancelTmp,
        });

        if (json.Body.Intensity && json.Body.Intensity.Observation.Pref && mapLevel < 3) {
          mapLevel = 3;
          removeChild(document.getElementById("Shindo"));
          document.getElementById("ShindoWrap").style.display = "inline-block";

          map_drawed = true;
          json.Body.Intensity.Observation.Pref.forEach(function (elm) {
            var newDiv = document.createElement("div");
            var color1 = shindoConvert(elm.MaxInt, 2);
            newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + elm.MaxInt + "</span>" + elm.Name;
            newDiv.classList.add("ShindoItem", "ShindoItem1");
            document.getElementById("Shindo").appendChild(newDiv);
            newDiv.addEventListener("click", function () {
              this.classList.toggle("has-open");
              this.nextElementSibling.classList.toggle("open");
            });

            var newDiv = document.createElement("div");
            newDiv.innerHTML = "<div></div>";
            newDiv.classList.add("WrapLevel1", "close");
            document.getElementById("Shindo").appendChild(newDiv);

            if (elm.Area) {
              elm.Area.forEach(function (elm2) {
                var wrap = document.querySelectorAll(".WrapLevel1");

                var newDiv = document.createElement("div");
                var color2 = shindoConvert(elm2.MaxInt, 2);
                newDiv.innerHTML = "<span style='background:" + color2[0] + ";color:" + color2[1] + ";'>" + elm2.MaxInt + "</span>" + elm2.Name;
                newDiv.classList.add("ShindoItem", "ShindoItem2");
                wrap[wrap.length - 1].appendChild(newDiv);
                newDiv.addEventListener("click", function () {
                  this.classList.toggle("has-open");
                  this.nextElementSibling.classList.toggle("open");
                });

                var newDiv = document.createElement("div");
                newDiv.innerHTML = "<div></div>";
                newDiv.classList.add("WrapLevel2", "close");
                wrap[wrap.length - 1].appendChild(newDiv);

                gjmap.setStyle({
                  fill: false,
                });

                var sectionTmp = sections.find(function (elmA) {
                  return elmA.name == elm2.Name;
                }).item;
                if (sectionTmp) {
                  sectionTmp
                    .setStyle({
                      fill: true,
                      fillColor: color2[0],
                      fillOpacity: 1,
                    })
                    .setPopupContent("<h3>細分区分：" + sectionTmp.name + "</h3>最大震度" + elm2.MaxInt);
                }

                if (elm2.City) {
                  elm2.City.forEach(function (elm3) {
                    var wrap2 = document.querySelectorAll(".WrapLevel2");

                    var newDiv = document.createElement("div");
                    var color3 = shindoConvert(elm3.MaxInt, 2);
                    newDiv.innerHTML = "<span style='background:" + color3[0] + ";color:" + color3[1] + ";'>" + elm3.MaxInt + "</span>" + elm3.Name;
                    newDiv.classList.add("ShindoItem", "ShindoItem3");
                    wrap2[wrap2.length - 1].appendChild(newDiv);
                    newDiv.addEventListener("click", function () {
                      this.classList.toggle("has-open");
                      this.nextElementSibling.classList.toggle("open");
                    });

                    var newDiv = document.createElement("div");
                    newDiv.innerHTML = "<div></div>";
                    newDiv.classList.add("WrapLevel3", "close");
                    wrap2[wrap2.length - 1].appendChild(newDiv);

                    if (elm3.IntensityStation) {
                      elm3.IntensityStation.forEach(function (elm4) {
                        var wrap3 = document.querySelectorAll(".WrapLevel3");

                        var newDiv = document.createElement("div");
                        var color4 = shindoConvert(elm4.Int, 2);
                        newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + elm4.Int + "</span>" + elm4.Name.replace("＊", "");
                        newDiv.classList.add("ShindoItem", "ShindoItem4");

                        var divIcon = L.divIcon({
                          html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + elm4.Int + "</div>",
                          className: "ShindoIcon",
                          iconSize: [16, 16],
                        });

                        L.marker([pointList[elm4.Code].location[0], pointList[elm4.Code].location[1]], { icon: divIcon, pane: "shadowPane" })
                          .addTo(map)
                          .bindPopup("<h3>観測点：" + elm4.Name.replace("＊", "") + "</h3>震度" + elm4.Int);

                        wrap3[wrap3.length - 1].appendChild(newDiv);
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
}

function nhkFetch(url) {
  fetch(url)
    .then((response) => {
      return response.arrayBuffer();
    }) // (2) レスポンスデータを取得
    .then((data) => {
      data = new TextDecoder("shift-jis").decode(data);
      var parser2 = new DOMParser();
      var xml2 = parser2.parseFromString(data, "application/xml");
      var eid = "20" + url.split("data/")[1].split("_")[0].slice(-12);
      //console.log({ "地震ID:": eid, 情報の種別: "?", 発生時刻: new Date(xml2.querySelector("OriginTime").textContent), 震源: xml2.querySelector("Earthquake").getAttribute("Epicenter"), M: xml2.querySelector("Earthquake").getAttribute("Magnitude"), 最大震度: xml2.querySelector("Earthquake").getAttribute("Intensity"), 詳細JSONURL: urls[i] });

      var mostNew = false;

      if (!newInfoDateTime || (xml2.querySelector("OriginTime") && newInfoDateTime < new Date(new Date(xml2.querySelector("OriginTime").textContent)))) {
        newInfoDateTime = new Date(new Date(xml2.querySelector("Earthquake").getAttribute("Time")));
        mostNew = true;
      }

      if (xml2.querySelector("Earthquake").getAttribute("Time")) var originTimeTmp = new Date(xml2.querySelector("Earthquake").getAttribute("Time"));
      if (xml2.querySelector("Earthquake").getAttribute("Intensity")) var maxIntTmp = xml2.querySelector("Earthquake").getAttribute("Intensity");
      if (xml2.querySelector("Earthquake").getAttribute("Magnitude")) var magnitudeTmp = Number(xml2.querySelector("Earthquake").getAttribute("Magnitude"));
      if (xml2.querySelector("Earthquake").getAttribute("Depth") && !isNaN(xml2.querySelector("Earthquake").getAttribute("Depth"))) var depthTmp = Number(xml2.querySelector("Earthquake").getAttribute("Depth").replace("km", ""));
      if (xml2.querySelector("Earthquake").getAttribute("Epicenter")) var epiCenterTmp = xml2.querySelector("Earthquake").getAttribute("Epicenter");
      if (xml2.querySelector("Earthquake").getAttribute("Latitude")) var LatTmp = Number(xml2.querySelector("Earthquake").getAttribute("Latitude").replace("北緯 ", "+").replace("南緯 ", "-").replace("度", ""));
      if (xml2.querySelector("Earthquake").getAttribute("Epicenter")) var LngTmp = Number(xml2.querySelector("Earthquake").getAttribute("Longitude").replace("東経 ", "+").replace("西経 ", "-").replace("度", ""));
      if (xml2.querySelector("Timestamp")) var reportTimeTmp = new Date(xml2.querySelector("Timestamp").textContent).setSeconds(0);

      EQInfoControl({
        reportTime: reportTimeTmp,

        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: depthTmp,
        epiCenter: epiCenterTmp,
        comment: null,
        cancel: null,
      });

      if (xml2.querySelector("Earthquake").querySelectorAll("Group") && mapLevel < 1) {
        removeChild(document.getElementById("Shindo"));
        document.getElementById("ShindoWrap").style.display = "inline-block";

        xml2
          .querySelector("Earthquake")
          .querySelectorAll("Group")
          .forEach(function (elm) {
            var newDiv = document.createElement("div");
            var color1 = shindoConvert(elm.getAttribute("Intensity"), 2);
            var shindoJP = elm.getAttribute("Intensity").replace("-", "弱").replace("+", "強");
            newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + shindoJP + "</span>震度" + shindoJP + "を観測した地域";
            newDiv.classList.add("ShindoItem", "ShindoItem1");
            document.getElementById("Shindo").appendChild(newDiv);
            newDiv.addEventListener("click", function () {
              this.classList.toggle("has-open");
              this.nextElementSibling.classList.toggle("open");
            });

            var newDiv = document.createElement("div");
            newDiv.innerHTML = "<div></div>";
            newDiv.classList.add("WrapLevel1", "close");
            document.getElementById("Shindo").appendChild(newDiv);
            elm.querySelectorAll("Area").forEach(function (elm2) {
              var wrap = document.querySelectorAll(".WrapLevel1");

              var newDiv = document.createElement("div");
              newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + shindoJP + "</span>" + elm2.getAttribute("Name").replace("＊", "");
              newDiv.classList.add("ShindoItem", "ShindoItem4");
              wrap[wrap.length - 1].appendChild(newDiv);
            });
          });
      }
    });
}

function jmaXMLFetch(url) {
  fetch(url)
    .then((response) => {
      return response.text();
    }) // (2) レスポンスデータを取得
    .then((data) => {
      var parser = new DOMParser();
      var xml = parser.parseFromString(data, "application/xml");

      var cancelTmp = xml.querySelector("InfoType").textContent == "取消";

      var ReportTime = new Date(xml.querySelector("Head ReportDateTime").textContent);
      var mostNew = false;

      if (!newInfoDateTime || newInfoDateTime <= ReportTime) {
        newInfoDateTime = ReportTime;
        mostNew = true;
      }
      var EarthquakeElm = xml.querySelector("Body Earthquake");

      var originTimeTmp;
      var epiCenterTmp;
      var magnitudeTmp;
      var LatLngDepth;
      if (EarthquakeElm) {
        originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
        epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
        magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].textContent);
        LatLngDepth = xml.querySelector("Body Earthquake Hypocenter").getElementsByTagName("jmx_eb:Coordinate")[0].textContent.replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");
        var LatTmp = Number(LatLngDepth[1]);
        var LngTmp = Number(LatLngDepth[2]);
        var DepthTmp = Number(LatLngDepth[3] / 1000);
      }

      var IntensityElm = xml.querySelector("Body Intensity");
      var maxIntTmp;
      if (IntensityElm) {
        maxIntTmp = shindoConvert(IntensityElm.querySelector("MaxInt").textContent, 4);
      }

      /*
      if (originTimeTmp && (mostNew || data_time.innerText == "不明")) data_time.innerText = dateEncode(3, originTimeTmp);
      if (maxIntTmp && (mostNew || data_maxI.innerText == "不明")) data_maxI.innerText = maxIntTmp;
      if (magnitudeTmp && (mostNew || data_M.innerText == "不明")) data_M.innerText = magnitudeTmp;
      if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3] && (mostNew || data_depth.innerText == "不明")) data_depth.innerText = Math.abs(Number(LatLngDepth[3]) / 1000) + "km";
      if (epiCenterTmp && (mostNew || data_center.innerText == "不明")) data_center.innerText = epiCenterTmp;
*/
      if (xml.querySelector("Body Comments")) {
        var commentText = "";
        if (xml.querySelector("Body Comments ForecastComment")) commentText += xml.querySelector("Body Comments ForecastComment Text").textContent;
        if (xml.querySelector("Body Comments FreeFormComment")) commentText += xml.querySelector("Body Comments FreeFormComment Text").textContent;
      }

      EQInfoControl({
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: DepthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
      });

      if (xml.querySelector("Body Intensity") && xml.querySelector("Body Intensity Observation Pref") && mapLevel < 3) {
        mapLevel = 3;
        removeChild(document.getElementById("Shindo"));
        document.getElementById("ShindoWrap").style.display = "inline-block";
        map_drawed = true;

        xml.querySelectorAll("Body Intensity Observation Pref").forEach(function (elm) {
          var newDiv = document.createElement("div");
          var color1 = shindoConvert(elm.querySelector("MaxInt").textContent, 3);
          newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + elm.querySelector("MaxInt").textContent + "</span>" + elm.querySelector("Name").textContent;
          newDiv.classList.add("ShindoItem", "ShindoItem1");
          document.getElementById("Shindo").appendChild(newDiv);
          newDiv.addEventListener("click", function () {
            this.classList.toggle("has-open");
            this.nextElementSibling.classList.toggle("open");
          });

          var newDiv = document.createElement("div");
          newDiv.innerHTML = "<div></div>";
          newDiv.classList.add("WrapLevel1", "close");
          document.getElementById("Shindo").appendChild(newDiv);

          if (elm.querySelectorAll("Area")) {
            elm.querySelectorAll("Area").forEach(function (elm2) {
              var wrap = document.querySelectorAll(".WrapLevel1");

              var newDiv = document.createElement("div");
              var color2 = shindoConvert(elm2.querySelector("MaxInt").textContent, 3);
              newDiv.innerHTML = "<span style='background:" + color2[0] + ";color:" + color2[1] + ";'>" + elm2.querySelector("MaxInt").textContent + "</span>" + elm2.querySelector("Name").textContent;
              newDiv.classList.add("ShindoItem", "ShindoItem2");
              wrap[wrap.length - 1].appendChild(newDiv);
              newDiv.addEventListener("click", function () {
                this.classList.toggle("has-open");
                this.nextElementSibling.classList.toggle("open");
              });

              var newDiv = document.createElement("div");
              newDiv.innerHTML = "<div></div>";
              newDiv.classList.add("WrapLevel2", "close");
              wrap[wrap.length - 1].appendChild(newDiv);

              var sectionTmp = sections.find(function (elmA) {
                return elmA.name == elm2.querySelector("Name").textContent;
              });
              if (sectionTmp) {
                sectionTmp.item
                  .setStyle({
                    fill: true,
                    fillColor: color2[0],
                    className: "FilledPath",
                  })
                  .setPopupContent("<h3>細分区分：" + sectionTmp.name + "</h3>最大震度" + elm2.querySelector("MaxInt").textContent);
              }
              if (elm2.querySelectorAll("City")) {
                elm2.querySelectorAll("City").forEach(function (elm3) {
                  var wrap2 = document.querySelectorAll(".WrapLevel2");

                  var newDiv = document.createElement("div");
                  var color3 = shindoConvert(elm3.querySelector("MaxInt").textContent, 3);
                  newDiv.innerHTML = "<span style='background:" + color3[0] + ";color:" + color3[1] + ";'>" + elm3.querySelector("MaxInt").textContent + "</span>" + elm3.querySelector("Name").textContent;
                  newDiv.classList.add("ShindoItem", "ShindoItem3");
                  wrap2[wrap2.length - 1].appendChild(newDiv);
                  newDiv.addEventListener("click", function () {
                    this.classList.toggle("has-open");
                    this.nextElementSibling.classList.toggle("open");
                  });

                  var newDiv = document.createElement("div");
                  newDiv.innerHTML = "<div></div>";
                  newDiv.classList.add("WrapLevel3", "close");
                  wrap2[wrap2.length - 1].appendChild(newDiv);

                  if (elm3.querySelectorAll("IntensityStation")) {
                    elm3.querySelectorAll("IntensityStation").forEach(function (elm4) {
                      var wrap3 = document.querySelectorAll(".WrapLevel3");

                      var newDiv = document.createElement("div");
                      var color4 = shindoConvert(elm4.querySelector("Int").textContent, 3);
                      newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + elm4.querySelector("Int").textContent + "</span>" + elm4.querySelector("Name").textContent.replace("＊", "");
                      newDiv.classList.add("ShindoItem", "ShindoItem4");

                      var divIcon = L.divIcon({
                        html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + elm4.querySelector("Int").textContent + "</div>",
                        className: "ShindoIcon",
                        iconSize: [16, 16],
                      });

                      L.marker([pointList[elm4.querySelector("Code").textContent].location[0], pointList[elm4.querySelector("Code").textContent].location[1]], { icon: divIcon, pane: "shadowPane" })
                        .addTo(map)
                        .bindPopup("<h3>観測点：" + elm4.querySelector("Name").textContent + "</h3>震度" + elm4.querySelector("Int").textContent);

                      wrap3[wrap3.length - 1].appendChild(newDiv);
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
}

var EQInfo = { originTime: null, maxI: null, mag: null, lat: null, lng: null, depth: null, epiCenter: null, comment: null };

function EQInfoControl(data) {
  var mostNew = false;

  if (!newInfoDateTime || newInfoDateTime <= data.reportTime) {
    newInfoDateTime = data.reportTime;
    mostNew = true;
  }
  if (data.cancel) document.getElementById("canceled").style.display = "flex";

  if (data.originTime && (mostNew || !EQInfo.originTime)) EQInfo.originTime = data.originTime;
  if (data.maxI && (mostNew || !EQInfo.maxI)) EQInfo.maxI = data.maxI;
  if (data.mag && (mostNew || !EQInfo.mag)) EQInfo.mag = data.mag;
  if ((data.depth || data.depth === 0) && (mostNew || !EQInfo.depth)) EQInfo.depth = data.depth;
  if (data.epiCenter && (mostNew || !EQInfo.epiCenter)) EQInfo.epiCenter = data.epiCenter;

  if (EQInfo.originTime) data_time.innerText = dateEncode(3, EQInfo.originTime);
  if (EQInfo.maxI) data_maxI.innerText = EQInfo.maxI;
  if (EQInfo.mag) data_M.innerText = EQInfo.mag;
  if (EQInfo.depth) {
    data_depth.innerText = Math.round(EQInfo.depth) + "km";
  } else if (EQInfo.depth == 0) {
    data_depth.innerText = "ごく浅い";
  }
  console.log(EQInfo.depth == 0, EQInfo.depth);

  if (EQInfo.epiCenter) data_center.innerText = EQInfo.epiCenter;

  if (data.lat && data.lng) {
    if (!markerElm) {
      epicenterIcon = L.icon({
        iconUrl: "./img/epicenter.svg",
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -20], // point from which the popup should open relative to the iconAnchor
      });

      markerElm = L.marker([data.lat, data.lng], {
        icon: epicenterIcon,
        pane: "markerPane",
      })
        .addTo(map)
        .bindPopup("震央：" + EQInfo.epiCenter);
    } else {
      markerElm.setLatLng([data.lat, data.lng]);
    }

    map.setView([data.lat, data.lng], 6);
  }

  //  {originTime:,maxI:,mag:,lat:,lng:,depth:,epiCenter:,comment:,}
}

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
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss;
  } else {
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

document.getElementById("AllOpen").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1,.ShindoItem2,.ShindoItem3").forEach(function (elm) {
    elm.classList.add("has-open");
  });
  document.querySelectorAll(".WrapLevel1,.WrapLevel2,.WrapLevel3").forEach(function (elm) {
    elm.classList.add("open");
  });
});
document.getElementById("AllClose").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1,.ShindoItem2,.ShindoItem3").forEach(function (elm) {
    elm.classList.remove("has-open");
  });
  document.querySelectorAll(".WrapLevel1,.WrapLevel2,.WrapLevel3").forEach(function (elm) {
    elm.classList.remove("open");
  });
});
