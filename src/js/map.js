var map;
var previous_points = [];
var previous_Spoints = [];
var points = {};
var Spoints = [];
var Tsunami_MajorWarning, Tsunami_Warning, Tsunami_Watch, Tsunami_Yoho;
var tsunamiLayer;
var gjmap; //オフライン地図
var gjmapT; //津波用geojson
var sections = [];
var basemap;
var worldmap;
var prefecturesMap;
var offlineMapActive = true;
var overlayActive = false;

var psWaveList = [];
var tsunamiAlertNow = false;

window.electronAPI.messageSend((event, request) => {
  if (request.action == "kmoniUpdate") {
    kmoniMapUpdate(request.data, "knet");
  } else if (request.action == "SnetUpdate") {
    kmoniMapUpdate(request.data, "snet");
  } else if (request.action == "longWaveUpdate") {
    document.getElementById("LWaveWrap").style.display = "block";
    document.getElementById("maxKaikyu").textContent = request.data.avrrank;
    //document.getElementById("region_name2").textContent = request.data.avrarea_list.join(" ");
    request.data.avrarea_list.forEach(function (elm) {
      var section = sections.find(function (elm2) {
        return elm2.name == elm;
      });
      if (section) {
        //section.item.setStyle({ fill: true, fillColor: "#FFF" });
      }
    });
  } else if (request.action == "longWaveClear") {
    document.getElementById("LWaveWrap").style.display = "none";
  } else if (request.action == "EEWAlertUpdate") {
    psWaveEntry();
  } else if (request.action == "tsunamiUpdate") {
    if (gjmapT) {
      gjmapT.setStyle({
        stroke: false,
      });
    }

    Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false;

    if (request.data.cancelled) {
      document.getElementById("tsunamiWrap").style.display = "none";

      document.body.classList.remove("TsunamiMode");
    } else {
      map.addLayer(tsunamiLayer);

      document.getElementById("tsunamiWrap").style.display = "block";

      document.body.classList.add("TsunamiMode");
      var alertNowTmp = false;
      request.data.areas.forEach(function (elm) {
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

      if (request.data.revocation) {
        document.getElementById("tsunamiWrap").style.display = "none";
        document.body.classList.remove("TsunamiMode");
        map.removeLayer(tsunamiLayer);
        Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
        document.getElementById("tsunamiRevocation").style.display = "block";
      } else if (!alertNowTmp && tsunamiAlertNow) {
        document.getElementById("tsunamiWrap").style.display = "none";
        document.body.classList.remove("TsunamiMode");
        map.removeLayer(tsunamiLayer);
        Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
        document.getElementById("tsunamiCancel").style.display = "block";
      } else {
        document.getElementById("tsunamiRevocation").style.display = "none";
        document.getElementById("tsunamiCancel").style.display = "none";
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
  } else if (request.action == "setting") {
    init();
  }

  document.getElementById("splash").style.display = "none";
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
var overlayTmp = [];
var epicenterIcon;
var tsunamiElm = [];
var inited = false;
var windowLoaded = false;
var TimeTable_JMA2001;

window.addEventListener("load", function () {
  windowLoaded = true;
});
var EQDetectCanvas;
var mapLayer;

function init() {
  if (inited || !config || !windowLoaded) return;
  inited = true;
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
  map.createPane("jsonMAP1Pane").style.zIndex = 210;
  map.createPane("jsonMAP2Pane").style.zIndex = 211;
  var jsonMAP1Canvas = L.canvas({ pane: "jsonMAP1Pane" });
  var jsonMAP2Canvas = L.canvas({ pane: "jsonMAP2Pane" });

  map.createPane("PointsPane").style.zIndex = 221;
  map.createPane("PSWavePane").style.zIndex = 300;
  map.createPane("EQDetectPane").style.zIndex = 250;
  map.createPane("EQDetectPane").style.pointerEvents = "none";
  map.createPane("HinanjoPane").style.zIndex = 220;

  EQDetectCanvas = L.canvas({ pane: "EQDetectPane" });
  EQDetectCanvas = L.canvas({ pane: "EQDetectPane" });
  PointsCanvas = L.canvas({ pane: "PointsPane" });

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
  })
    .on("tileloadstart", function (event) {
      var tilePath = event.coords;
      var tileX = tilePath.x;
      var tileY = tilePath.y;

      var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb04/10/" + tileX + "/" + tileY + ".geojson";
      fetch(url)
        .then((a) => (a.ok ? a.json() : null))
        .then((geojson) => {
          if (!geojson || !this._map) return;
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
          })
            .addTo(this._map)
            .bindPopup("指定緊急避難場所（地震）");
        })
        .catch(function (err) {});
      var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb05/10/" + tileX + "/" + tileY + ".geojson";

      fetch(url)
        .then((a) => (a.ok ? a.json() : null))
        .then((geojson) => {
          if (!geojson || !this._map) return;
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
          })
            .addTo(this._map)
            .bindPopup("指定緊急避難場所（津波）");
        })
        .catch(function (err) {});
      //     this._map.removeLayer(event.tile.geojson);
    })
    .on("tileunload", function (event) {
      if (event.tile.geojson && this._map) this._map.removeLayer(event.tile.geojson);
      if (event.tile.geojson2 && this._map) this._map.removeLayer(event.tile.geojson2);
    });

  /*
  fetch("./Resource/Knet_Points.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      //points = json;
      
      //points.forEach(function (elm, index) {
      //  if (elm.Name && elm.Point && !elm.IsSuspended) {
      //    addPointMarker(elm);
      //  }
      //});
      //if (kmoniMapData) {
      //  kmoniMapUpdate(kmoniMapData);
      //}
    });*/

  /*
  fetch("./Resource/Snet_Points.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      //Spoints = json;

      
      Spoints.forEach(function (elm) {
        if (elm.Code && elm.Point) {
          var popup_content = "<h3 class='PointName' style='border-bottom:solid 2px transparent'>S-net " + elm.Code + "</h3><h4 class='detecting'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'></td></tr><tr><td>PGA</td><td class='PointPGA'></td></tr></table>";
          var kmoniPointMarker = L.divIcon({
            html: "<div class='marker-circle' style='background:rgba(128,128,128,0.2)'></div><div class='PointPopup'>" + popup_content + "</div>",
            className: "SnetPointMarker SnetPoint_" + elm.Code.replace(".", "-"),
            iconSize: 25,
          });

          elm.marker = L.marker([elm.Location.Latitude, elm.Location.Longitude], {
            icon: kmoniPointMarker,
            pane: "PointsPane",
          })
            .bindPopup("", { className: "hidePopup" })
            .on("popupopen", function (e) {
              L.DomUtil.addClass(e.target._icon, "popupOpen");
            })
            .on("popupclose", function (e) {
              L.DomUtil.removeClass(e.target._icon, "popupOpen");
            })
            .addTo(map);
        }
      });
      if (SnetMapData) {
        SnetMapUpdate(SnetMapData);
      }
    });*/

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
          stroke: false,
          color: "#666",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "jsonMAPPane",
          interactive: false,
          attribution: '<a href="https://www.data.jma.go.jp/developer/gis.html" target="_blank">©JMA</a>',
          renderer: jsonMAP1Canvas,
        } /*
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            sections.push({ name: feature.properties.name, item: layer });
            layer.bindPopup("<h3>地震情報/細分区域</h3>" + feature.properties.name);
          }
        },*/,
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
          attribution: '<a href="https://www.data.jma.go.jp/developer/gis.html" target="_blank">©JMA</a>',
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            tsunamiElm.push({
              name: feature.properties.name,
              item: layer,
              feature: feature,
            });

            layer.bindPopup("<h3>津波予報区</h3>" + feature.properties.name);
          }
        },
      });

      tsunamiLayer.addLayer(gjmapT);
      window.electronAPI.messageReturn({
        action: "tsunamiReqest",
      });
    });

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var img = L.DomUtil.create("img");
    img.src = "./img/nied_acmap_s_w_scale.svg";
    return img;
  };
  legend.addTo(map);
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var img = L.DomUtil.create("img");
    img.src = "https://disaportal.gsi.go.jp/hazardmap/copyright/img/tsunami_newlegend.png";
    return img;
  };
  var legend2 = L.control({ position: "bottomright" });
  legend2.onAdd = function (map) {
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

  map.on("zoom", function () {
    if (psWaveList.length > 0) {
      document.querySelectorAll(".PWave,.SWave").forEach(function (elm) {
        elm.style.transitionTimingFunction = "step-start";
      });
      psWaveList.forEach(function (elm) {
        psWaveCalc(elm.id);
      });
    }

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
    if (currentZoom >= 7) {
      basemap.setStyle({ stroke: true });
    } else {
      basemap.setStyle({ stroke: false });
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
    iconAnchor: [15, 30],
  });

  markerElm = L.marker([config.home.latitude, config.home.longitude], { keyboard: false, icon: homeIcon }).addTo(map).bindPopup(config.home.name);

  fetch("./Resource/TimeTable_JMA2001.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      TimeTable_JMA2001 = json;

      psWaveEntry();
    });
}
function addPointMarker(elm) {
  //var popup_content = "<h3 class='PointName'>" + elm.Name + "<span>" + elm.Code + "</span></h3><h4 class='detecting'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'></td></tr><tr><td>PGA</td><td class='PointPGA'></td></tr></table>";

  var codeEscaped = elm.Code.replace(".", "_");
  var kmoniPointMarker = L.divIcon({
    html: "<div class='marker-circle'></div>" /*<div class='PointPopup'>" + popup_content + "</div>"*/,
    className: "kmoniPointMarker KmoniPoint_" + codeEscaped,
    iconSize: 35,
  });
  if (PointsCanvas) {
    elm.marker = L.marker([elm.Location.Latitude, elm.Location.Longitude], {
      icon: kmoniPointMarker,
      pane: "PointsPane",
      renderer: PointsCanvas,
    })
      .bindPopup("", { offset: [0, -20], className: "PointPopup" })
      .addTo(map);
  }
  return elm;
}
var kmoniMapData;
var SnetMapData;
function kmoniMapUpdate(dataTmp, type) {
  if (!dataTmp) return;
  if (type == "knet") {
    kmoniMapData = dataTmp;
  } else if (type == "snet") {
    SnetMapData = dataTmp;
  }

  var dataTmp2 = dataTmp.filter(function (elm) {
    return elm.shindo;
  });

  if (type == "knet") {
    //リアルタイム震度タブ
    var shindoList = dataTmp2.sort(function (a, b) {
      return b.shindo - a.shindo;
    });
    //removeChild(document.getElementById("pointList"));
    var htmlTmp = "";
    for (let a = 0; a < 10; a++) {
      var shindoElm = shindoList[a];
      var shindoColor = shindoConvert(shindoElm.shindo, 2);
      var IntDetail = "";
      if (a == 0) IntDetail = "<div class='intDetail'>" + Math.round(shindoElm.shindo * 10) / 10 + "</div>";

      htmlTmp += "<li><div class='int' style='color:" + shindoColor[1] + ";background:" + shindoColor[0] + "'>" + shindoConvert(shindoElm.shindo, 0) + IntDetail + "</div><div class='Pointname'>" + shindoElm.Region + " " + shindoElm.Name + "</div><div class='PGA'>PGA" + Math.round(shindoElm.pga * 100) / 100 + "</div></li>";
    }
    document.getElementById("pointList").innerHTML = htmlTmp;
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
        if (pga0) changed = pga0 !== elm.pga;
      }

      if (changed || marker_add) {
        var markerCircleElm = markerElement.querySelector(".marker-circle");
        markerCircleElm.style.background = "rgb(" + elm.rgb.join(",") + ")";

        markerElement.style.display = "block";
        var PNameTmp = elm.Name ? elm.Name : "";
        var detecting = elm.detect || elm.detect2 ? "block" : "none";
        var shindoStr = Math.round(elm.shindo * 10) / 10;
        var pgaStr = Math.round(elm.pga * 100) / 100;
        var popup_content = "<h3 class='PointName' style='border-bottom:solid 2px rgb(" + elm.rgb.join(",") + ")'>" + PNameTmp + "<span>" + elm.Code + "</span></h3><h4 class='detecting' style='display:" + detecting + "'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'>" + shindoStr + "</td></tr><tr><td>PGA</td><td class='PointPGA'>" + pgaStr + "</td></tr></table>";
        points[elm.Code].marker.setPopupContent(popup_content);

        if (elm.detect2) {
          markerCircleElm.classList.remove("detectingMarker");
          markerCircleElm.classList.add("strongDetectingMarker");
        } else if (elm.detect) {
          markerCircleElm.classList.remove("strongDetectingMarker");
          markerCircleElm.classList.add("detectingMarker");
        } else {
          markerCircleElm.classList.remove("strongDetectingMarker");
          markerCircleElm.classList.remove("detectingMarker");
        }

        markerCircleElm.classList.remove("marker_Int", "marker_Int1", "marker_Int2", "marker_Int3", "marker_Int4", "marker_Int5-", "marker_Int5p", "marker_Int6-", "marker_Int6p", "marker_Int7", "marker_Int7p");

        var IntTmp = shindoConvert(elm.shindo, 3);
        if (IntTmp) {
          points[elm.Code].marker.setZIndexOffset(3000);
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

        var popup_content = "<h3 class='PointName' style='border-bottom:solid 2px rgba(128,128,128,0.5)'>" + elm.Name + "<span>" + elm.Code + "</span></h3><h4 class='detecting' style='display:none'>地震検知中</h4><table><tr><td>震度</td><td class='PointInt'>?</td></tr><tr><td>PGA</td><td class='PointPGA'>?</td></tr></table>";
        points[elm.Code].marker.setPopupContent(popup_content);
      }
    }

    if (index == points.length - 1) previous_points = dataTmp;
  });
}
/*
function SnetMapUpdate(dataTmp) {
  SnetMapData = dataTmp;

  //地図上マーカー
  dataTmp.forEach(function (elm, index) {
    if (elm.Code && elm.Point && elm.data && !elm.IsSuspended) {
      var changed;

      if (previous_Spoints.length == 0) {
        changed = true;
      } else {
        var pga0 = previous_Spoints[index].pga;
        if (pga0) changed = pga0 !== elm.pga;
      }

      if (changed) {
        var markerElement = document.querySelector(".SnetPoint_" + elm.Code.replace(".", "-"));
        if (markerElement) {
          markerElement.querySelector(".PointName").style.borderBottom = "solid 2px rgb(" + elm.rgb.join(",") + ")";
          markerElement.querySelector(".PointInt").textContent = Math.round(elm.shindo * 10) / 10;
          markerElement.querySelector(".PointPGA").textContent = Math.round(elm.pga * 100) / 100;
          markerElement.querySelector(".marker-circle").style.background = "rgb(" + elm.rgb.join(",") + ")";
          if (elm.detect2) {
            markerElement.querySelector(".marker-circle").classList.remove("detectingMarker");
            markerElement.querySelector(".marker-circle").classList.add("strongDetectingMarker");
          } else if (elm.detect) {
            markerElement.querySelector(".marker-circle").classList.remove("strongDetectingMarker");
            markerElement.querySelector(".marker-circle").classList.add("detectingMarker");
          } else {
            markerElement.querySelector(".marker-circle").classList.remove("strongDetectingMarker");
            markerElement.querySelector(".marker-circle").classList.remove("detectingMarker");
          }
          markerElement.querySelector(".detecting").textContent = elm.detect ? "block" : "none";
          markerElement.style.display = "block";

          markerElement.classList.remove("marker_Int1");
          markerElement.classList.remove("marker_Int2");
          markerElement.classList.remove("marker_Int3");
          markerElement.classList.remove("marker_Int4");
          markerElement.classList.remove("marker_Int5-");
          markerElement.classList.remove("marker_Int5p");
          markerElement.classList.remove("marker_Int6-");
          markerElement.classList.remove("marker_Int6p");
          markerElement.classList.remove("marker_Int7");
          markerElement.classList.remove("marker_Int7p");

          var IntTmp = shindoConvert(elm.shindo, 3);
          if (IntTmp) {
            markerElement.classList.add("marker_Int" + IntTmp);
            markerElement.querySelector(".marker-circle").style.background = "";
          }
        }
      }
    } else {
      //if (Spoints[index].marker) map.removeLayer(Spoints[index].marker);
      
      //var markerElement = document.querySelector(".SnetPoint_" + elm.Code.replace(".", "-"));
      //if (markerElement) {
      //  markerElement.style.display = "none";
     // }
    }

    if (index == points.length - 1) previous_Spoints = dataTmp;
  });
}*/

function psWaveEntry() {
  now_EEW.forEach(function (elm) {
    if (!elm.is_cancel && elm.arrivalTime) {
      var countDownElm = document.getElementById("EEW-" + elm.report_id).querySelector(".countDown");
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

        /*
        var PRadius = 0;
        var SRadius = 0;
        distance += 1;
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

        TimeTableTmp;
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
          var result;
          var result2;
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
          psWaveReDraw(
            elm.report_id,
            elm.latitude,
            elm.longitude,
            PRadius * 1000,
            0,
            true, //S波未到達
            ArriveTime, //発生からの到達時間
            distance //現在の経過時間
          );
        } else {
          SRadius = linear([TimeElmTmpS[0].S, TimeElmTmpS[1].S], [TimeElmTmpS[0].R, TimeElmTmpS[1].R])(distance);
          psWaveReDraw(elm.report_id, elm.latitude, elm.longitude, PRadius * 1000, SRadius * 1000);
        }
        */
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
function psWaveCalc(eid) {
  var pswaveFind = psWaveList.find(function (elm2) {
    return elm2.id == eid;
  });
  if (pswaveFind) {
    var TimeTableTmp = pswaveFind.TimeTable;
    var SWmin;
    var distance = Math.floor((new Date() - Replay - pswaveFind.data.originTime) / 1000);
    distance += 1;

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
      var result;
      var result2;
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
    if (EQElm.PCircleElm && EQElm.SCircleElm) {
      //EQElm.markerElm.setLatLng([data.latitude, data.longitude]);

      setTimeout(function () {
        document.querySelector(".PWave_" + report_id).style.transitionTimingFunction = "linear";
        document.querySelector(".SWave_" + report_id).style.transitionTimingFunction = "linear";

        EQElm.PCircleElm.setRadius(pRadius).setLatLng([latitude, longitude]);
        EQElm.SCircleElm.setRadius(sRadius).setLatLng([latitude, longitude]).setStyle({ stroke: !SnotArrived });
      }, 10);

      /*
    var overflow1 = map.getBounds()._northEast.lat < EQElm.PCircleElm.getBounds()._northEast.lat;
    var overflow2 = map.getBounds()._northEast.lng < EQElm.PCircleElm.getBounds()._northEast.lng;
    var overflow3 = map.getBounds()._southWest.lat > EQElm.PCircleElm.getBounds()._southWest.lat;
    var overflow4 = map.getBounds()._southWest.lng > EQElm.PCircleElm.getBounds()._southWest.lng;
    if (overflow1 || overflow2 || overflow3 || overflow4) {
      map.fitBounds(EQElm.PCircleElm.getBounds());
    }*/

      //EQElm.data = { latitude: latitude, longitude: longitude, pRadius: pRadius, sRadius: sRadius };
    } else {
      var PCElm = L.circle([latitude, longitude], {
        radius: pRadius,
        color: "#3094ff",
        stroke: true,
        fill: false,
        weight: 2,
        className: "PWave PWave_" + report_id,
        pane: "PSWavePane",
        interactive: false,
      }).addTo(map);

      document.querySelector(".PWave_" + report_id).addEventListener("transitionend", function () {
        psWaveCalc(report_id, true);
      });

      var SCElm = L.circle([latitude, longitude], {
        radius: sRadius,
        color: "#ff3e30",
        stroke: !SnotArrived,
        fill: true,
        fillColor: "#F00",
        fillOpacity: 0.15,
        weight: 2,
        className: "SWave SWave_" + report_id,
        pane: "PSWavePane",
        interactive: false,
      }).addTo(map);

      map.fitBounds(PCElm.getBounds());
      map.setView([latitude, longitude, 10]);

      EQElm.PCircleElm = PCElm;
      EQElm.SCircleElm = SCElm;
      EQElm = psWaveList[psWaveList.length - 1];
    }
  }

  if (EQElm.SIElm) {
    if (SnotArrived) {
      var SWprogressValue = document.getElementById("SWprogressValue_" + report_id);
      if (SWprogressValue) {
        SWprogressValue.setAttribute("stroke-dashoffset", Number(157 - 157 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))));
      } else {
        var SIcon = L.divIcon({
          html: '<svg width="50" height="50"><circle id="SWprogressValue_' + report_id + '" class="SWprogressValue" cx="25" cy="25" r="22.5" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="' + Number(157 - 157 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '" transform="rotate(270 25 25)"/></svg>',
          className: "SWaveProgress",
          iconSize: 50,
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
      html: '<svg width="50" height="50"><circle id="SWprogressValue_' + report_id + '" class="SWprogressValue" cx="25" cy="25" r="23.5" fill="none" stroke-width="5px" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="' + Number(157 - 157 * ((nowDistance - EQElm.firstDetect) / (SArriveTime - EQElm.firstDetect))) + '"/></path></svg>',
      className: "SWaveProgress",
      iconSize: 50,
    });

    SIElm = L.marker([latitude, longitude], {
      icon: SIcon,
    }).addTo(map);

    EQElm.SIElm = SIElm;
  }

  var EEWPanelElm = document.getElementById("EEW-" + report_id);
  if (EQElm2.distance && EEWPanelElm) {
    EEWPanelElm.querySelector(".PWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(pRadius / 1000 / EQElm2.distance, 1));
    EEWPanelElm.querySelector(".SWave_value").setAttribute("stroke-dashoffset", 125.66 - 125.66 * Math.min(sRadius / 1000 / EQElm2.distance, 1));
  }
}

function tsunamiColorConv(str) {
  switch (str) {
    case "MajorWarning":
      return "rgb(200,0,255)";
      break;
    case "Warning":
      return "rgb(255,40,0)";
      break;
    case "Watch":
      return "rgb(250,245,0)";
      break;
    case "Yoho":
      return "rgb(66, 158, 255)";
      break;
    default:
      return "#FFF";
      break;
  }
}

const linear = (x, y) => {
  return (x0) => {
    const index = x.reduce((pre, current, i) => (current <= x0 ? i : pre), 0); //数値が何番目の配列の間かを探す
    const i = index === x.length - 1 ? x.length - 2 : index; //配列の最後の値より大きい場合は、外挿のために、最後から2番目をindexにする

    return ((y[i + 1] - y[i]) / (x[i + 1] - x[i])) * (x0 - x[i]) + y[i]; //線形補間の関数を返す
  };
};

function forEach2(array, func) {
  for (let i = 0; i < array.length; i++) {
    func(array[i], i);
  }
}
