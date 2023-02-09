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
var nhkURL;
var narikakunURL;
var config;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "metaData") {
    eid = request.eid;
    jmaURL = request.urls.filter(function (elm) {
      return elm.indexOf("www.jma.go.jp") != -1;
    });
    jmaXMLURL = request.urls.filter(function (elm) {
      return elm.indexOf("www.data.jma.go.jp") != -1;
    });
    nhkURL = request.urls.filter(function (elm) {
      return elm.indexOf("nhk.or.jp") != -1;
    });
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
var nhkURLHis = [];
var narikakunURLHis = [];

var mapLevel = 0; //マップの状況　0:なし/1:NHK/2:JMAXML/3:完全/

function Mapinit() {
  map = L.map("mapcontainer", {
    maxBounds: [
      [90, -180],
      [-90, 180],
    ],
    minZoom: 2,
    maxZoom: 21,
    zoomAnimation: true,
    zoomSnap: 0.1,
    zoomDelta: 0.5,
    preferCanvas: false,
    zoomControl: false,
  });
  map.setView([32.99125, 138.46], 4);

  map.createPane("tsunamiPane").style.zIndex = 201;
  map.createPane("jsonMAPPane").style.zIndex = 210;
  var jsonMAPCanvas = L.canvas({ pane: "jsonMAPPane" });

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
    attribution: '<a href="https://www.data.jma.go.jp/svd/eqdb/data/shindo/" target="_blank">© 気象庁</a>',
  });
  var tile2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var tile3 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
    minZoom: 9,
    minNativeZoom: 9,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var tile4 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 5,
    maxNativeZoom: 14,
    maxZoom: 21,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var tile5 = L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 19,
    maxZoom: 21,
    attribution: '<a href="https://www.openstreetmap.org/" target="_blank">©OpenStreetMap contributors</a>',
  });
  var tile8 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });

  var overlay1 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png", {
    minZoom: 2,
    maxZoom: 16,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var overlay2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png", {
    minZoom: 11,
    maxZoom: 18,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var overlay3 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#tsunami" target="_blank">©国土地理院</a>',
  });
  var overlay4 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#dosekiryukeikaikuiki" target="_blank">©国土地理院</a>',
  });
  var overlay5 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#jisuberikeikaikuiki" target="_blank">©国土地理院</a>',
  });
  var overlay6 = L.tileLayer("https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: '<a href="https://www.jma.go.jp/bosai/map.html#5/28.835/168.548/&elem=int&contents=earthquake_map" target="_blank">©JMA</a>',
  });
  var overlay7 = L.tileLayer("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=", {
    minNativeZoom: 10,
    maxNativeZoom: 10,
    minZoom: 10,
    maxZoom: 21,
    attribution: '<a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#jisuberikeikaikuiki" target="_blank">©国土地理院</a>',
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
          fillColor: "#222",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          interactive: false,
          attribution: '<a href="https://www.naturalearthdata.com/">©Natural Earth</a>',
          renderer: jsonMAPCanvas,
        },
      });

      mapLayer.addLayer(worldmap);
    });

  fetch("./Resource/basemap.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      basemap = L.geoJSON(json, {
        style: {
          color: "#999",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          attribution: '<a href="https://www.data.jma.go.jp/developer/gis.html" target="_blank">©JMA</a>',
          renderer: jsonMAPCanvas,
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
            "地理院 写真": tile3,
            "地理院 白地図": tile4,
            OpenStreetMap: tile5,
          },
          {
            "地理院 陰影起伏図": overlay1,
            "地理院 火山基本図データ": overlay2,
            "地理院 津波浸水想定 ハザードマップ": overlay3,
            "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ": overlay4,
            "地理院 土砂災害警戒区域（地すべり） ハザードマップ": overlay5,
            "気象庁　境界線": overlay6,
            避難所: overlay7,
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
function nhk_ListReq() {
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

    nhkURL.forEach(function (elm) {
      nhkFetch(elm);
    });
    jmaXMLURL.forEach(function (elm) {
      jmaXMLFetch(elm);
    });

    jmaURLHis = jmaURLHis.concat(jmaURL);
    jmaXMLURLHis = jmaXMLURLHis.concat(jmaXMLURL);
    nhkURLHis = nhkURLHis.concat(nhkURL);
    narikakunURLHis = narikakunURLHis.concat(narikakunURL);
    jmaURL = [];
    jmaXMLURL = [];
    nhkURL = [];
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
                  .bindPopup("<h3>細分区分：" + sectionTmp.name + "</h3>最大震度" + elm2.MaxInt);
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
                      newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + elm4.Int + "</span>" + elm4.Name;
                      newDiv.classList.add("ShindoItem", "ShindoItem4");

                      var divIcon = L.divIcon({
                        html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + elm4.Int + "</div>",
                        className: "ShindoIcon",
                        iconSize: [16, 16],
                      });

                      L.marker([elm4.latlon.lat, elm4.latlon.lon], { icon: divIcon, pane: "shadowPane" })
                        .addTo(map)
                        .bindPopup("<h3>観測点：" + elm4.Name + "</h3>震度" + elm4.Int);

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
                  fillColor: color2[0],
                  fillOpacity: 1,
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
                    .bindPopup("<h3>細分区分：" + sectionTmp.name + "</h3>最大震度" + elm2.MaxInt);
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
                        newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + elm4.Int + "</span>" + elm4.Name;
                        newDiv.classList.add("ShindoItem", "ShindoItem4");

                        var divIcon = L.divIcon({
                          html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + elm4.Int + "</div>",
                          className: "ShindoIcon",
                          iconSize: [16, 16],
                        });

                        L.marker([pointList[elm4.Code].location[0], pointList[elm4.Code].location[1]], { icon: divIcon, pane: "shadowPane" })
                          .addTo(map)
                          .bindPopup("<h3>観測点：" + elm4.Name + "</h3>震度" + elm4.Int);

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
              newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + shindoJP + "</span>" + elm2.getAttribute("Name");
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
                  .bindPopup("<h3>細分区分：" + sectionTmp.name + "</h3>最大震度" + elm2.querySelector("MaxInt").textContent);
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
                      newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + elm4.querySelector("Int").textContent + "</span>" + elm4.querySelector("Name").textContent;
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
  if (data.depth && (mostNew || !EQInfo.depth)) EQInfo.depth = data.depth;
  if (data.epiCenter && (mostNew || !EQInfo.epiCenter)) EQInfo.epiCenter = data.epiCenter;

  if (EQInfo.originTime) data_time.innerText = dateEncode(3, EQInfo.originTime);
  if (EQInfo.maxI) data_maxI.innerText = EQInfo.maxI;
  if (EQInfo.mag) data_M.innerText = EQInfo.mag;
  if (EQInfo.depth) data_depth.innerText = Math.round(EQInfo.depth) + "km";
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
function shindoConvert2(num) {
  if (isNaN(num)) num = Number(num);

  if (num < 0.5) {
    return ["#D1D1D1", "#444"];
  } else if (num < 1.5) {
    return ["#54C9E3", "#222"];
  } else if (num < 2.5) {
    return ["#2B8DFC", "#111"];
  } else if (num < 3.5) {
    return ["#32BA37", "#111"];
  } else if (num < 4.5) {
    return ["#DBD21F", "#000"];
  } else if (num < 5) {
    return ["#FF8C00", "#FFF"];
  } else if (num < 5.5) {
    return ["#FF5714", "#FFF"];
  } else if (num < 6) {
    return ["#E60000", "#FFF"];
  } else if (num < 6.5) {
    return ["#8A0A0A", "#FFF"];
  } else if (6.5 <= num) {
    return ["#C400DE", "#FFF"];
  } else {
    return "transparent";
  }
}
function shindoConvert3(num) {
  if (num == "0") {
    return 0;
  } else if (num == "1" || num == "2" || num == "3" || num == "4" || num == "7") {
    return Number(num);
  } else if (num == "5-") {
    return 4.5;
  } else if (num == "5+") {
    return 5;
  } else if (num == "6-") {
    return 5.5;
  } else if (num == "6+") {
    return 6;
  } else {
    return Number(num);
  }
}

function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (!str) {
    ShindoTmp = "?";
  } else if (isNaN(str)) {
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
          "?": ["#BFBFBF", "#444"],
          0: ["#BFBFBF", "#444"],
          1: ["#79A8B3", "#444"],
          2: ["#3685E0", "#FFF"],
          3: ["#4DB051", "#FFF"],
          4: ["#BFB837", "#333"],
          "5-": ["#F09629", "#000"],
          "5+": ["#F5713D", "#000"],
          "6-": ["#E60000", "#FFF"],
          "6+": ["#8A0A0A", "#FFF"],
          7: ["#C400DE", "#FFF"],
          "7+": ["#C400DE", "#FFF"],
        };
        return ConvTable[ShindoTmp];
        break;
      case 3:
        var ConvTable = { "?": null, 0: null, 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5-", "5+": "5p", "6-": "6-", "6+": "6p", 7: "7", "7+": "7p" };
        return ConvTable[ShindoTmp];
        break;
      case 4:
        var ConvTable = { "?": null, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, "5-": 4.5, "5+": 5, "6-": 5.5, "6+": 6, 7: 7, "7+": 7.5 };
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
