var map;
var previous_points = [];
var points = {};
var Tsunami_MajorWarning, Tsunami_Warning, Tsunami_Watch, Tsunami_Yoho;
var tsunamiLayer;
var gjmap; //オフライン地図
var gjmapT; //津波用geojson
var sections = [];
var basemap, worldmap, prefecturesMap, plateMap;
var offlineMapActive = true;
var overlayActive = false;
var tsunamiLayerAdded = false;

var psWaveList = [];
var tsunamiAlertNow = false;
var overlayTmp = 0;
var epicenterIcon; // eslint-disable-line
var tsunamiElm = [];
var inited = false;
var windowLoaded = false;
var TimeTable_JMA2001;
var EQDetectCanvas, PointsCanvas, PSWaveCanvas, overlayCanvas; // eslint-disable-line
var mapLayer, hinanjoLayer;
var kmoniMapData, SnetMapData;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "kmoniUpdate") {
    kmoniMapUpdate(request.data, "knet");
  } else if (request.action == "SnetUpdate") {
    kmoniMapUpdate(request.data, "snet");
  } else if (request.action == "longWaveUpdate") {
    document.getElementById("LWaveWrap").style.display = "block";
    document.getElementById("maxKaikyu").textContent = request.data.avrrank;
    if (Number(request.data.avrrank) > 0) {
      document.getElementById("region_name2").textContent = request.data.avrarea_list.join(" ");
      return false;
      /*
      request.data.avrarea_list.forEach(function (elm) {
        var section = sections.find(function (elm2) {
          return elm2.name == elm;
        });
        if (section) {
          //section.item.setStyle({ fill: true, fillColor: "#FFF" });
        }
      });*/
    } else {
      document.getElementById("region_name2").textContent = "";
    }
  } else if (request.action == "longWaveClear") {
    document.getElementById("LWaveWrap").style.display = "none";
  } else if (request.action == "EEWAlertUpdate") {
    psWaveEntry();
  } else if (request.action == "tsunamiUpdate") {
    tsunamiDataUpdate(request.data);
  } else if (request.action == "setting") {
    init();
  } else if (request.action == "EstShindoUpdate") {
    EstShindoUpdate(request.data);
  }

  document.getElementById("splash").style.display = "none";
});

window.addEventListener("load", function () {
  windowLoaded = true;
  setInterval(function () {
    if (now_EEW.length > 0) {
      for (elm of now_EEW) {
        psWaveCalc(elm.report_id);
      }
    }
    //時計（ローカル時刻）更新
    document.getElementById("PC_TIME").textContent = dateEncode(3, new Date());
  }, 100);
});

//マップ初期化など
function init() {
  if (inited || !config || !windowLoaded) return;
  inited = true;
  map = L.map("mapcontainer", {
    maxBounds: [
      [90, -180],
      [-90, 180],
    ],
    center: [32.99125, 138.46],
    zoom: 4,
    minZoom: 3.5,
    maxZoom: 21,
    zoomAnimation: true,
    zoomSnap: 0.1,
    zoomDelta: 0.5,
    preferCanvas: false,
    zoomControl: false,
    worldCopyJump: true,
    inertia: false,
    maxBoundsViscosity: 1,
    enableHighAccuracy: true,
  });

  map.createPane("tsunamiPane").style.zIndex = 201;
  map.createPane("jsonMAP1Pane").style.zIndex = 210;
  map.createPane("jsonMAP2Pane").style.zIndex = 211;
  map.createPane("PointsPane").style.zIndex = 221;
  map.createPane("PSWavePane").style.zIndex = 300;
  map.createPane("EQDetectPane").style.zIndex = 250;
  map.createPane("EQDetectPane").style.pointerEvents = "none";
  map.createPane("HinanjoPane").style.zIndex = 220;

  var jsonMAP1Canvas = L.canvas({ pane: "jsonMAP1Pane" });
  var jsonMAP2Canvas = L.canvas({ pane: "jsonMAP2Pane" });
  EQDetectCanvas = L.canvas({ pane: "EQDetectPane" });
  PointsCanvas = L.canvas({ pane: "PointsPane" });
  HinanjoCanvas = L.canvas({ pane: "HinanjoPane" });
  PSWaveCanvas = L.canvas({ pane: "PSWavePane" });
  overlayCanvas = L.canvas({ pane: "overlayCanvas" });

  //L.control.scale({ imperial: false }).addTo(map);←縮尺

  mapLayer = new L.LayerGroup();
  mapLayer.id = "mapLayer";
  mapLayer.addTo(map);

  hinanjoLayer = new L.LayerGroup();
  hinanjoLayer.id = "hinanjoLayer";

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
    minZoom: 0,
    minNativeZoom: 2,
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
    minNativeZoom: 2,
    maxNativeZoom: 16,
    minZoom: 0,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png", {
    minNativeZoom: 11,
    maxNativeZoom: 18,
    minZoom: 0,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay3 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png", {
    minNativeZoom: 7,
    maxNativeZoom: 12,
    minZoom: 0,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay4 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", {
    minNativeZoom: 7,
    maxNativeZoom: 12,
    minZoom: 0,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay5 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png", {
    minNativeZoom: 7,
    maxNativeZoom: 12,
    minZoom: 0,
    maxZoom: 21,

    attribution: "国土地理院",
  });
  var overlay6 = L.tileLayer("https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: "JMA",
  });
  var overlay7 = L.tileLayer("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=", {
    minNativeZoom: 10,
    maxNativeZoom: 10,
    minZoom: 11,
    maxZoom: 21,
    attribution: "国土地理院",
  })
    .on("tileloadstart", function (event) {
      var tilePath = event.coords;
      var tileX = tilePath.x;
      var tileY = tilePath.y;

      var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb04/10/" + tileX + "/" + tileY + ".geojson";
      fetch(url)
        .then((a) => (a.ok ? a.json() : null))
        .then((geojson) => {
          if (!geojson) return;
          event.tile.geojson = L.geoJSON(geojson, {
            pointToLayer: function (feature, cordinate) {
              return L.circleMarker(cordinate, {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                renderer: HinanjoCanvas,
              });
            },
          }).bindPopup({ content: "指定緊急避難場所（地震）", keepInView: false, autoPan: false });
          hinanjoLayer.addLayer(event.tile.geojson);
        })
        .catch(function () {});
      var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb05/10/" + tileX + "/" + tileY + ".geojson";

      fetch(url)
        .then((a) => (a.ok ? a.json() : null))
        .then((geojson) => {
          if (!geojson) return;
          event.tile.geojson2 = L.geoJSON(geojson, {
            pointToLayer: function (feature, cordinate) {
              return L.circleMarker(cordinate, {
                radius: 8,
                fillColor: "#0078ff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                renderer: HinanjoCanvas,
              });
            },
          }).bindPopup({ content: "指定緊急避難場所（津波）", keepInView: false, autoPan: false });
          hinanjoLayer.addLayer(event.tile.geojson2);
        })
        .catch(function () {});
      //     this._map.removeLayer(event.tile.geojson);
    })
    .on("tileunload", function (event) {
      if (event.tile.geojson && this._map) this._map.removeLayer(event.tile.geojson);
      if (event.tile.geojson2 && this._map) this._map.removeLayer(event.tile.geojson2);
    });

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

  fetch("./Resource/plate.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      plateMap = L.geoJSON(json, {
        style: {
          color: "#C88",
          opacity: 0.3,
          fill: false,
          weight: 1,
          interactive: false,
          attribution: "",
          renderer: jsonMAP2Canvas,
        },
      });

      mapLayer.addLayer(plateMap);
    });
  fetch("./Resource/Snet_LINE.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      plateMap = L.geoJSON(json, {
        style: {
          color: "#666",
          fill: false,
          weight: 1,
          interactive: false,
          attribution: "",
          renderer: jsonMAP2Canvas,
        },
      });

      mapLayer.addLayer(plateMap);
    });

  fetch("./Resource/basemap.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      basemap = L.geoJSON(json, {
        style: {
          stroke: false,
          color: "#666",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          //interactive: false,
          attribution: "JMA",
          renderer: jsonMAP1Canvas,
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            sections.push({ name: feature.properties.name, item: layer });
            // layer.bindPopup("<h3>地震情報/細分区域</h3>" + feature.properties.name);
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
            避難所: overlay7,
          },
          {
            position: "topleft",
          }
        )
        .addTo(map);
      document.getElementById("splash").style.display = "none";
      if (estShindoTmp) EstShindoUpdate(estShindoTmp);
    });
  map.on("baselayerchange", function (layer) {
    offlineMapActive = layer.name == "オフライン地図";

    basemap.setStyle({ fill: offlineMapActive && !overlayActive });
    worldmap.setStyle({ fill: offlineMapActive && !overlayActive });
  });
  map.on("locationerror", function (e) {
    e.preventDefault();
  });
  map.on("overlayadd", function (eventLayer) {
    overlayTmp++;
    overlayActive = true;
    basemap.setStyle({ fill: offlineMapActive && !overlayActive });
    worldmap.setStyle({ fill: offlineMapActive && !overlayActive });

    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      legend.addTo(map);
    } else if (eventLayer.name === "避難所") {
      hinanjoLayer.addTo(map);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      legend2.addTo(map);
    }
  });
  map.on("overlayremove", function (eventLayer) {
    overlayTmp -= 1;

    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      map.removeControl(legend);
    } else if (eventLayer.name === "避難所") {
      map.removeLayer(hinanjoLayer);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      map.removeControl(legend2);
    }
    if (overlayTmp == 0) {
      overlayActive = false;
      basemap.setStyle({ fill: offlineMapActive && !overlayActive });
      worldmap.setStyle({ fill: offlineMapActive && !overlayActive });
    }
  });

  tsunamiLayer = L.featureGroup();

  fetch("./Resource/tsunami.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      gjmapT = L.geoJSON(json, {
        style: {
          stroke: false,
          fill: false,
          pane: "tsunamiPane",
          className: "tsunamiElm",
          attribution: "JMA",
          interactive: true,
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            tsunamiElm.push({
              name: feature.properties.name,
              item: layer,
              feature: feature,
            });

            layer.bindPopup({ content: "<h3>津波予報区</h3>" + feature.properties.name, keepInView: false, autoPan: false });
          }
        },
      });

      window.electronAPI.messageReturn({
        action: "tsunamiReqest",
      });
    });
  fetch("./Resource/lake.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      L.geoJSON(json, {
        style: {
          stroke: false,
          color: "#0449b8",
          weight: 1,
          fill: true,
          fillColor: "#78acff",
          fillOpacity: 0.5,
          attribution: "国土地理院",
          renderer: jsonMAP1Canvas,
        },
      }).addTo(map);
    });

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var img = L.DomUtil.create("img");
    img.src = "./img/nied_acmap_s_w_scale.svg";
    return img;
  };
  legend.addTo(map);
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var img = L.DomUtil.create("img");
    img.src = "https://disaportal.gsi.go.jp/hazardmap/copyright/img/tsunami_newlegend.png";
    return img;
  };
  var legend2 = L.control({ position: "bottomright" });
  legend2.onAdd = function () {
    var img = L.DomUtil.create("img");
    img.src = "https://disaportal.gsi.go.jp/hazardmap/copyright/img/dosha_keikai.png";
    return img;
  };
  /*
  map.createPane("background");
  var imageUrl = "./img/mapbase.png"; //size 5616 x 3744
  var imageBounds = [
    [90, 0],
    [-90, 360],
  ]; //初期表示範囲

  L.imageOverlay(imageUrl, imageBounds, {
    pane: "background",
  }).addTo(map);*/

  /*
  map.on("zoomstart", function () {
    if (psWaveList.length > 0) {
      document.querySelectorAll(".PWave,.SWave").forEach(function (elm) {
        elm.style.transitionTimingFunction = "step-start";
      });
    }
  });
  */ /*
  map.on("zoomend", function () {
    if (psWaveList.length > 0) {
      psWaveList.forEach(function (elm) {
        psWaveCalc(elm.id);
      });
    }
  });*/
  map.on("zoom", function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 5.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_1");
    } else if (currentZoom < 7) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_2");
    } else if (currentZoom < 8.5) {
      document.getElementById("mapcontainer").classList.add("zoomLevel_3");
    } else {
      document.getElementById("mapcontainer").classList.add("zoomLevel_4");
    }
    if (currentZoom > 11) {
      document.getElementById("mapcontainer").classList.add("popup_show");
    }
    if (basemap) {
      if (currentZoom >= 7) {
        basemap.setStyle({ stroke: true });
      } else {
        basemap.setStyle({ stroke: false });
      }
    }
  });

  map.on("load", function () {
    if (kmoniMapData) kmoniMapUpdate(kmoniMapData);
    if (SnetMapData) kmoniMapUpdate(SnetMapData);
  });
  epicenterIcon = L.icon({
    iconUrl: "../src/img/epicenter.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });

  var currentZoom = map.getZoom();

  if (currentZoom < 5.5) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_1");
  } else if (currentZoom < 7) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_2");
  } else if (currentZoom < 8.5) {
    document.getElementById("mapcontainer").classList.add("zoomLevel_3");
  } else {
    document.getElementById("mapcontainer").classList.add("zoomLevel_4");
  }
  if (currentZoom > 11) {
    document.getElementById("mapcontainer").classList.add("popup_show");
  }

  var homeIcon = L.icon({
    iconUrl: "img/homePin.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  markerElm = L.marker([config.home.latitude, config.home.longitude], { keyboard: false, icon: homeIcon }).addTo(map).bindPopup({ content: config.home.name, keepInView: false, autoPan: false });

  fetch("./Resource/TimeTable_JMA2001.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      TimeTable_JMA2001 = json;

      psWaveEntry();
    });
}

//観測点マーカー追加
function addPointMarker(elm) {
  var codeEscaped = elm.Code.replace(".", "_");
  var kmoniPointMarker = L.divIcon({
    html: "<div class='marker-circle marker-circle-" + elm.Type + "'></div>",
    className: "kmoniPointMarker KmoniPoint_" + codeEscaped,
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
  });
  if (PointsCanvas) {
    elm.marker = L.marker([elm.Location.Latitude, elm.Location.Longitude], {
      icon: kmoniPointMarker,
      pane: "PointsPane",
      //renderer: PointsCanvas,
      keyboard: false,
    })
      .bindPopup("", { offset: [0, -20], className: "PointPopup", keepInView: false, autoPan: false })
      .addTo(map);
  }
  return elm;
}
//観測点情報更新
function kmoniMapUpdate(dataTmp, type) {
  if (!dataTmp) return;
  if (type == "knet") {
    kmoniMapData = dataTmp;
  } else if (type == "snet") {
    SnetMapData = dataTmp;
  }

  if (type == "knet") {
    //リアルタイム震度タブ
    var shindoList = dataTmp
      .filter(function (elm) {
        return elm.shindo;
      })
      .sort(function (a, b) {
        return b.shindo - a.shindo;
      });
    if (config) {
      var htmlTmp = "";
      for (let a = 0; a < config.Info.RealTimeShake.List.ItemCount; a++) {
        var shindoElm = shindoList[a];
        if (shindoElm.shindo) {
          var shindoColor = shindoConvert(shindoElm.shindo, 2);
          var IntDetail = "";
          if (a == 0) IntDetail = "<div class='intDetail'>" + Math.round(shindoElm.shindo * 10) / 10 + "</div>";

          htmlTmp += "<li><div class='int' style='color:" + shindoColor[1] + ";background:" + shindoColor[0] + "'>" + shindoConvert(shindoElm.shindo, 0) + IntDetail + "</div><div class='Pointname'>" + shindoElm.Region + " " + shindoElm.Name + "</div><div class='PGA'>PGA" + Math.round(shindoElm.pga * 100) / 100 + "</div></li>";
        }
      }
      document.getElementById("pointList").innerHTML = htmlTmp;
    }
  }
  //地図上マーカー

  dataTmp.forEach(function (elm, index) {
    var codeEscaped = elm.Code.replace(".", "_");
    if (elm.Point && elm.data && !elm.IsSuspended) {
      var changed;
      var marker_add = false;

      var markerElement = document.querySelector(".KmoniPoint_" + codeEscaped);
      if (!markerElement) {
        marker_add = true;
        points[elm.Code] = addPointMarker(elm);
        markerElement = document.querySelector(".KmoniPoint_" + codeEscaped);
      }

      if (previous_points.length == 0) {
        changed = true;
      } else {
        var pga0 = previous_points[elm.Code].pga;
        changed = pga0 && pga0 !== elm.pga;
      }

      if (changed || marker_add) {
        var markerCircleElm = markerElement.querySelector(".marker-circle");
        markerCircleElm.style.background = "rgb(" + elm.rgb.join(",") + ")";

        //markerElement.style.display = "block";
        var PNameTmp = elm.Name ? elm.Name : "";
        var detecting = elm.detect || elm.detect2 ? "block" : "none";
        var shindoStr = Math.round(elm.shindo * 10) / 10;
        var pgaStr = Math.round(elm.pga * 100) / 100;
        var connectStr = "";
        if (elm.Type == "S-net") connectStr = "_";
        var popup_content = "<h3 class='PointName' style='border-bottom:solid 2px rgb(" + elm.rgb.join(",") + ")'>" + PNameTmp + "<span>" + elm.Type + connectStr + elm.Code + "</span></h3><h4 class='detecting' style='display:" + detecting + "'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'>" + shindoStr + "</td></tr><tr><td>PGA</td><td class='PointPGA'>" + pgaStr + "</td></tr></table>";
        points[elm.Code].marker.setPopupContent(popup_content);

        markerCircleElm.classList.remove("strongDetectingMarker", "detectingMarker", "marker_Int", "marker_Int1", "marker_Int2", "marker_Int3", "marker_Int4", "marker_Int5m", "marker_Int5p", "marker_Int6m", "marker_Int6p", "marker_Int7", "marker_Int7p");

        if (elm.detect2) {
          markerCircleElm.classList.add("strongDetectingMarker");
        } else if (elm.detect) {
          markerCircleElm.classList.add("detectingMarker");
        }

        var IntTmp = shindoConvert(elm.shindo, 3);
        if (IntTmp) {
          points[elm.Code].marker.setZIndexOffset(shindoConvert(elm.shindo, 5) * 1000);
          markerCircleElm.classList.add("marker_Int", "marker_Int" + IntTmp);
        } else {
          points[elm.Code].marker.setZIndexOffset(0);
        }
      }
    } else {
      var markerElement = document.querySelector(".KmoniPoint_" + codeEscaped);
      if (markerElement) {
        var markerCircleElm = markerElement.querySelector(".marker-circle");
        markerCircleElm.style.background = "rgba(128,128,128,0.5)";
        markerCircleElm.classList.remove("strongDetectingMarker");
        markerCircleElm.classList.remove("detectingMarker");
        var PNameTmp = elm.Name ? elm.Name : "";

        var popup_content = "<h3 class='PointName' style='border-bottom:solid 2px rgba(128,128,128,0.5)'>" + PNameTmp + "<span>" + elm.Code + "</span></h3><h4 class='detecting' style='display:none'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'>?</td></tr><tr><td>PGA</td><td class='PointPGA'>?</td></tr></table>";
        points[elm.Code].marker.setPopupContent(popup_content);
      }
    }

    if (index == points.length - 1) previous_points = dataTmp;
  });
}

var estShindoTmp;
//予想震度更新
function EstShindoUpdate(data) {
  estShindoTmp = data;
  if (sections.length == 0) return;
  sections.forEach(function (elm) {
    elm.item.setStyle({ fillColor: "#333" });
  });

  data.forEach(function (elm) {
    var section = sections.find(function (elm3) {
      return elm3.name == elm.Section;
    });

    if (section && section.item) {
      var colorTmp = shindoConvert(elm.estShindo, 2)[0];
      section.item.setStyle({ fill: true, fillColor: colorTmp });
    }
  });
}

//🔴予報円🔴
//予報円追加
function psWaveEntry() {
  now_EEW.forEach(function (elm) {
    if (!elm.is_cancel && elm.arrivalTime) {
      var countDownElm = document.getElementById("EEW-" + elm.report_id);
      if (countDownElm) {
        countDownElm = countDownElm.querySelector(".countDown");
        if (countDownElm) {
          var countDown = (elm.arrivalTime - (new Date() - Replay)) / 1000;

          if (countDown > 0) {
            var countDown_min = Math.floor(countDown / 60);
            var countDown_sec = Math.floor(countDown % 60);

            if (countDown_min == 0) {
              countDownElm.textContent = countDown_sec;
            } else {
              countDownElm.textContent = countDown_min + ":" + String(countDown_sec).padStart(2, "0");
            }
          } else {
            countDownElm.textContent = "0";
          }
        }
      }
    }
    if (!elm.is_cancel && elm.origin_time && elm.depth && elm.latitude && elm.longitude) {
      var distance = Math.floor((new Date() - Replay - elm.origin_time) / 1000);

      if (elm.depth <= 700 && distance <= 2000 && TimeTable_JMA2001) {
        var TimeTableTmp = TimeTable_JMA2001[elm.depth];
        var pswaveFind = psWaveList.find(function (elm2) {
          return elm2.id == elm.report_id;
        });

        if (pswaveFind) {
          pswaveFind.data.longitude = elm.longitude;
          pswaveFind.data.latitude = elm.latitude;
        } else {
          psWaveList.push({
            id: elm.report_id,
            PCircleElm: null,
            SCircleElm: null,
            data: { latitude: elm.latitude, longitude: elm.longitude, originTime: elm.origin_time, pRadius: 0, sRadius: 0 },
            TimeTable: TimeTableTmp,
          });
        }
        psWaveCalc(elm.report_id);
      }
    }
  });

  //終わった地震の予報円削除
  psWaveList = psWaveList.filter(function (elm) {
    var stillEEW = now_EEW.find(function (elm2) {
      return elm2.report_id;
    });
    if (!stillEEW || stillEEW.is_cancel) {
      if (elm.PCircleElm) map.removeLayer(elm.PCircleElm);
      if (elm.SCircleElm) map.removeLayer(elm.SCircleElm);
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
    /*var EQElm = psWaveList.find(function (elm) {
      return elm.id == eid;
    });*/

    var distance = (new Date() - Replay - pswaveFind.data.originTime) / 1000;

    //if (EQElm) distance += 1;

    var PRadius = 0;
    var SRadius = 0;

    var TimeElmTmpP;
    var TimeElmTmpS;

    var Pfind = TimeTableTmp.find(function (elm2) {
      return elm2.P == distance;
    });

    if (Pfind) {
      TimeElmTmpP = [Pfind, Pfind];
    } else {
      var result = [Infinity, 0];
      var result2 = [Infinity, 0];
      TimeTableTmp.forEach((a) => {
        var b = Math.abs(a.P - distance);
        if (result[0] > b) {
          result2 = result;
          result = [b, a];
        }
      });
      TimeElmTmpP = [result[1], result2[1]];
    }

    var Sfind = TimeTableTmp.find(function (elm2) {
      return elm2.S == distance;
    });

    var SWmin = Math.min.apply(
      null,
      TimeTableTmp.map(function (elm2) {
        return elm2.S;
      })
    );
    if (Sfind) {
      TimeElmTmpS = [Sfind, Sfind];
    } else {
      var loopI = 0;
      var result = [Infinity, 0];
      var result2 = [Infinity, 0];
      TimeTableTmp.forEach((a) => {
        var b = Math.abs(a.S - distance);
        if (result[0] >= b || loopI == 0) {
          if (loopI == 0) {
            result2 = [null, TimeTableTmp[1]];
          } else {
            result2 = result;
          }
          result = [b, a];
        }
        loopI++;
      });
      TimeElmTmpS = [result[1], result2[1]];
    }

    PRadius = TimeElmTmpP[0].R + ((TimeElmTmpP[1].R - TimeElmTmpP[0].R) * (distance - TimeElmTmpP[0].P)) / (TimeElmTmpP[1].P - TimeElmTmpP[0].P);

    if (SWmin > distance) {
      var ArriveTime = TimeTableTmp.find(function (elm2) {
        return elm2.R == 0;
      }).S;
      window.requestAnimationFrame(function () {
        psWaveReDraw(
          pswaveFind.id,
          pswaveFind.data.latitude,
          pswaveFind.data.longitude,
          PRadius * 1000,
          0,
          true, //S波未到達
          ArriveTime, //発生からの到達時間
          distance //現在の経過時間
        );
      });
    } else {
      SRadius = linear([TimeElmTmpS[0].S, TimeElmTmpS[1].S], [TimeElmTmpS[0].R, TimeElmTmpS[1].R])(distance);
      window.requestAnimationFrame(function () {
        psWaveReDraw(pswaveFind.id, pswaveFind.data.latitude, pswaveFind.data.longitude, PRadius * 1000, SRadius * 1000);
      });

      /*
        id: elm.report_id,
            PCircleElm: null,
            SCircleElm: null,
            data: [{ latitude: elm.latitude, longitude: elm.longitude, originTime: elm.origin_time, pRadius: 0, sRadius: 0 }],
            TimeTable: TimeTableTmp,*/
    }
  }
}
//予報円描画
function psWaveReDraw(report_id, latitude, longitude, pRadius, sRadius, SnotArrived, SArriveTime, nowDistance) {
  if (!pRadius || (!sRadius && !SnotArrived)) return;
  var EQElm = psWaveList.find(function (elm) {
    return elm.id == report_id;
  });
  var EQElm2 = now_EEW.find(function (elm) {
    return elm.report_id == report_id;
  });

  latitude = latitudeConvert(latitude);
  longitude = latitudeConvert(longitude);
  if (EQElm) {
    if (EQElm.PCircleElm) {
      EQElm.PCircleElm.setRadius(pRadius).setLatLng([latitude, longitude]);
      EQElm.SCircleElm.setRadius(sRadius).setLatLng([latitude, longitude]).setStyle({ stroke: !SnotArrived });
    } else {
      var PCElm = L.circle([latitude, longitude], {
        radius: pRadius,
        color: "#3094ff",
        stroke: true,
        fill: false,
        weight: 2,
        pane: "PSWavePane",
        renderer: PSWaveCanvas,
        interactive: false,
      }).addTo(map);

      var SCElm = L.circle([latitude, longitude], {
        radius: sRadius,
        color: "#ff3e30",
        stroke: !SnotArrived,
        fill: true,
        fillColor: "#F00",
        fillOpacity: 0.15,
        weight: 2,
        pane: "PSWavePane",
        renderer: PSWaveCanvas,
        interactive: false,
      }).addTo(map);

      map.setView([latitude, longitude, 9]);

      EQElm.PCircleElm = PCElm;
      EQElm.SCircleElm = SCElm;
      EQElm = psWaveList[psWaveList.length - 1];

      psWaveCalc(report_id);
    }

    if (EQElm.SIElm) {
      if (SnotArrived) {
        var SWprogressValue = document.getElementById("SWprogressValue_" + report_id);
        if (SWprogressValue) {
          SWprogressValue.setAttribute("stroke-dashoffset", Number(157 - 157 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))));
        } else {
          var SIcon = L.divIcon({
            html: '<svg width="50" height="50"><circle cx="25" cy="25" r="23.5" fill="none" stroke-width="5px" stroke="#777"/><circle id="SWprogressValue_' + report_id + '" class="SWprogressValue" cx="25" cy="25" r="23.5" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="' + Number(157 - 157 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '"/></path></svg>',
            className: "SWaveProgress",
            iconSize: [50, 50],
            iconAnchor: [25, 25],
          });
          EQElm.SIElm.setIcon(SIcon);
        }
      } else {
        map.removeLayer(EQElm.SIElm);
      }
    } else if (SnotArrived) {
      var SIElm;

      EQElm.firstDetect = nowDistance;
      var SIcon = L.divIcon({
        html: '<svg width="50" height="50"><circle cx="25" cy="25" r="23.5" fill="none" stroke-width="5px" stroke="#777"/><circle id="SWprogressValue_' + report_id + '" class="SWprogressValue" cx="25" cy="25" r="23.5" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="' + Number(157 - 157 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '"/></path></svg>',
        className: "SWaveProgress",
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });

      SIElm = L.marker([latitude, longitude], {
        icon: SIcon,
        pane: "PointsPane",
        //renderer: PointsCanvas,
        keyboard: false,
      }).addTo(map);

      EQElm.SIElm = SIElm;
    }
  }

  var EEWPanelElm = document.getElementById("EEW-" + report_id);

  if (EQElm2 && EQElm2.distance && EEWPanelElm) {
    EEWPanelElm.querySelector(".PWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(pRadius / 1000 / EQElm2.distance, 1));
    EEWPanelElm.querySelector(".SWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(sRadius / 1000 / EQElm2.distance, 1));

    if (EQElm2.arrivalTime) {
      var countDownElm = EEWPanelElm.querySelector(".countDown");
      var countDown = (EQElm2.arrivalTime - (new Date() - Replay)) / 1000;
      if (countDown > 0) {
        var countDown_min = Math.floor(countDown / 60);
        var countDown_sec = Math.floor(countDown % 60);

        if (countDown_min == 0) {
          countDownElm.textContent = countDown_sec;
        } else {
          countDownElm.textContent = countDown_min + ":" + String(countDown_sec).padStart(2, "0");
        }
      } else {
        countDownElm.textContent = "0";
      }
    }
  }
}

//🔴津波情報🔴
//津波情報更新
function tsunamiDataUpdate(data) {
  if (gjmapT) {
    if (!tsunamiLayerAdded) tsunamiLayer.addLayer(gjmapT);
    tsunamiLayerAdded = true;

    gjmapT.setStyle({
      stroke: false,
    });
  }

  Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false;

  document.getElementById("tsunamiCancel").style.display = data.cancelled ? "block" : "none";
  document.getElementById("tsunamiRevocation").style.display = data.revocation ? "block" : "none";

  if (data.cancelled) {
    document.getElementById("tsunamiWrap").style.display = "none";

    document.body.classList.remove("TsunamiMode");
  } else {
    map.addLayer(tsunamiLayer);

    document.getElementById("tsunamiWrap").style.display = "block";

    document.body.classList.add("TsunamiMode");
    var alertNowTmp = false;
    data.areas.forEach(function (elm) {
      var tsunamiItem = tsunamiElm.find(function (elm2) {
        return elm2.name == elm.name;
      });

      if (elm.cancelled) {
        if (tsunamiItem) {
          tsunamiItem.item
            .setStyle({
              stroke: false,
              className: "tsunamiElm",
            })
            .setPopupContent("<h3>津波予報区</h3>" + tsunamiItem.feature.properties.name);
        }
      } else {
        alertNowTmp = true;
        var gradeJa;
        switch (elm.grade) {
          case "MajorWarning":
            Tsunami_MajorWarning = true;
            gradeJa = "大津波警報";
            break;
          case "Warning":
            Tsunami_Warning = true;
            gradeJa = "津波警報";
            break;
          case "Watch":
            Tsunami_Watch = true;
            gradeJa = "津波注意報";
            break;
          case "Yoho":
            Tsunami_Yoho = true;
            gradeJa = "津波予報";
            break;
          default:
            break;
        }

        if (tsunamiItem && tsunamiItem.item) {
          var firstWave = "";
          var maxWave = "";
          var firstCondition = "";
          if (elm.firstHeight) {
            firstWave = "<div>第１波 予想到達時刻:" + dateEncode(5, elm.firstHeight) + "</div>";
          }
          if (elm.maxHeight) {
            maxWave = "<div>予想される津波の高さ:" + elm.maxHeight + "</div>";
          } else if (elm.grade == "Yoho") {
            maxWave = "<div>予想される津波の高さ:若干の海面変動</div>";
          }
          if (elm.firstHeightCondition) {
            firstCondition = "<div>" + elm.firstHeightCondition + "</div>";
          }
          tsunamiItem.item
            .setStyle({
              stroke: true,
              color: tsunamiColorConv(elm.grade),
              weight: 5,
            })
            .setPopupContent("<h3 style='border-bottom:solid 2px " + tsunamiColorConv(elm.grade) + "'>" + gradeJa + " 発令中</h3><p>津波予報区:" + tsunamiItem.feature.properties.name + "</p>" + firstWave + maxWave + firstCondition);
        }
      }
    });

    if (data.revocation) {
      document.getElementById("tsunamiWrap").style.display = "none";
      document.body.classList.remove("TsunamiMode");
      map.removeLayer(tsunamiLayer);
      Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
    } else if (!alertNowTmp && tsunamiAlertNow) {
      document.getElementById("tsunamiWrap").style.display = "none";
      document.body.classList.remove("TsunamiMode");
      map.removeLayer(tsunamiLayer);
      Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
    }
    tsunamiAlertNow = alertNowTmp;

    document.getElementById("tsunami_MajorWarning").style.display = Tsunami_MajorWarning ? "block" : "none";
    document.getElementById("tsunami_Warning").style.display = Tsunami_Warning ? "block" : "none";
    document.getElementById("tsunami_Watch").style.display = Tsunami_Watch ? "block" : "none";
    document.getElementById("tsunami_Yoho").style.display = Tsunami_Yoho ? "block" : "none";

    if (Tsunami_MajorWarning) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("MajorWarning");
    } else if (Tsunami_Warning) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Warning");
    } else if (Tsunami_Watch) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Watch");
    } else if (Tsunami_Yoho) {
      document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Yoho");
    }
  }
}

//津波情報色変換
function tsunamiColorConv(str) {
  var color;
  switch (str) {
    case "MajorWarning":
      color = "rgb(200,0,255)";
      break;
    case "Warning":
      color = "rgb(255,40,0)";
      break;
    case "Watch":
      color = "rgb(250,245,0)";
      break;
    case "Yoho":
      color = "rgb(66, 158, 255)";
      break;
    default:
      color = "#FFF";
      break;
  }
  return color;
}

//線形補完
function linear(x, y) {
  return (x0) => {
    const index = x.reduce((pre, current, i) => (current <= x0 ? i : pre), 0);
    const i = index === x.length - 1 ? x.length - 2 : index;

    return ((y[i + 1] - y[i]) / (x[i + 1] - x[i])) * (x0 - x[i]) + y[i];
  };
}
