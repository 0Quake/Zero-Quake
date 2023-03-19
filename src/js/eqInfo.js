var pointList;

var data_time = document.getElementById("data_time");
var data_maxI = document.getElementById("data_maxI");
var data_M = document.getElementById("data_M");
var data_MT = document.getElementById("data_MT");
var data_depth = document.getElementById("data_depth");
var data_center = document.getElementById("data_center");
var data_comment = document.getElementById("data_comment");
var areaLocation;

var eid;
var markerElm;
var newInfoDateTime = 0;
var sections = [];
var map;
var jmaURL;
var jmaXMLURL;
var narikakunURL;
var config;
var overlayActive;
var overlayTmp = [];
var offlineMapActive = true;
var jmaURLHis = [];
var jmaXMLURLHis = [];
var narikakunURLHis = [];
var EQInfo = { originTime: null, maxI: null, mag: null, lat: null, lng: null, depth: null, epiCenter: null, comment: null };
var shindo_lastUpDate = 0;
var mapLayer;
var basemap;

fetch("https://files.nakn.jp/earthquake/code/PointSeismicIntensityLocation.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    pointList = data;
  });

var EEWData;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "metaData") {
    eid = request.eid;
    if (request.urls && Array.isArray(request.urls)) {
      jmaURL = request.urls.filter(function (elm) {
        return String(elm).indexOf("www.jma.go.jp") != -1;
      });
      jmaXMLURL = request.urls.filter(function (elm) {
        return String(elm).indexOf("www.data.jma.go.jp") != -1;
      });
      narikakunURL = request.urls.filter(function (elm) {
        return String(elm).indexOf("dev.narikakun.net") != -1;
      });
    }
    if (request.eew) {
      if (request.eew.canceled) {
        //EEWキャンセル
      } else {
        var eewItem = request.eew.data[request.eew.data.length - 1];

        EEWData = {
          reportTime: eewItem.report_time,
          originTime: eewItem.origin_time,
          maxI: eewItem.calcintensity,
          mag: eewItem.magunitude,
          lat: eewItem.latitude,
          lng: eewItem.longitude,
          depth: eewItem.depth,
          epiCenter: eewItem.region_name,
          comment: "",
          cancel: false,
          eew: true,
        };
      }
    }
    init();
  } else if (request.action == "setting") {
    config = request.data;
    document.getElementById("areaName").textContent = config.home.name;
  }
});

fetch("./Resource/Section_CenterLocation.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    areaLocation = data;
  });

//開始処理
function init() {
  Mapinit();

  if (EEWData) EQInfoControl(EEWData);
  jma_ListReq();
  //jma_B_ListReq();
  narikakun_ListReq(new Date().getFullYear(), new Date().getMonth() + 1);
}
//地図初期化rootS
function Mapinit() {
  map = L.map("mapcontainer", {
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
            //layer.bindPopup("<h3>地震情報/細分区域</h3>" + feature.properties.name);
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
          fillColor: "#325385",
          fillOpacity: 0.5,
          attribution: "国土地理院",
          renderer: jsonMAP1Canvas,
        },
      }).addTo(map);
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
    } else if (eventLayer.name === "推計震度分布図") {
      estimated_intensity_map_legend.addTo(map);
    }
  });
  map.on("overlayremove", function (eventLayer) {
    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      map.removeControl(legend);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || eventLayer.name === "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      overlayTmp = overlayTmp.filter(function (elm) {
        return elm !== eventLayer.name;
      });
    } else if (eventLayer.name === "推計震度分布図") {
      map.removeControl(estimated_intensity_map_legend);
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
  legend2.onAdd = function () {
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
    if (basemap) {
      if (currentZoom >= 7) {
        basemap.setStyle({ stroke: true });
      } else {
        basemap.setStyle({ stroke: false });
      }
    }
  });

  var homeIcon = L.icon({
    iconUrl: "img/homePin.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  L.marker([config.home.latitude, config.home.longitude], { keyboard: false, icon: homeIcon })
    .addTo(map)
    .bindPopup("<h3>登録地点</h3><div>" + config.home.name + "</div>");

  estimated_intensity_mapReq();
}
var estimated_intensity_map_legend;
var estimated_intensity_map_canvas = document.getElementById("estimated_intensity_map_canvas");
const ctx = estimated_intensity_map_canvas.getContext("2d");
var rootElm = document.querySelector(":root");
var rStyle = getComputedStyle(rootElm);

shindo4C = rStyle.getPropertyValue("--IntTheme_4_BgColor").match(/\d+/g);
shindo4C = { r: Number(shindo4C[0]), g: Number(shindo4C[1]), b: Number(shindo4C[2]) };
shindo5mC = rStyle.getPropertyValue("--IntTheme_5m_BgColor").match(/\d+/g);
shindo5mC = { r: Number(shindo5mC[0]), g: Number(shindo5mC[1]), b: Number(shindo5mC[2]) };
shindo5pC = rStyle.getPropertyValue("--IntTheme_5p_BgColor").match(/\d+/g);
shindo5pC = { r: Number(shindo5pC[0]), g: Number(shindo5pC[1]), b: Number(shindo5pC[2]) };
shindo6mC = rStyle.getPropertyValue("--IntTheme_6m_BgColor").match(/\d+/g);
shindo6mC = { r: Number(shindo6mC[0]), g: Number(shindo6mC[1]), b: Number(shindo6mC[2]) };
shindo6pC = rStyle.getPropertyValue("--IntTheme_6p_BgColor").match(/\d+/g);
shindo6pC = { r: Number(shindo6pC[0]), g: Number(shindo6pC[1]), b: Number(shindo6pC[2]) };
shindo7C = rStyle.getPropertyValue("--IntTheme_7_BgColor").match(/\d+/g);
shindo7C = { r: Number(shindo7C[0]), g: Number(shindo7C[1]), b: Number(shindo7C[2]) };

//推計震度分布リスト取得→描画
function estimated_intensity_mapReq() {
  fetch("https://www.jma.go.jp/bosai/estimated_intensity_map/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      ItemTmp = json.find(function (elm) {
        return elm.url.split("_")[0] == String(eid).substring(0, 12);
      });
      if (ItemTmp) {
        InfoType_add("type-6");
        estimated_intensity_map_legend = L.control({ position: "bottomright" });
        estimated_intensity_map_legend.onAdd = function () {
          var div = L.DomUtil.create("div");
          div.classList.add("legend");
          div.innerHTML = "<img src='./img/estimated_intensity_map_scale.svg'>";
          return div;
        };

        idTmp = ItemTmp.url;
        var estimated_intensity_map_layer = L.layerGroup();

        ItemTmp.mesh_num.forEach(function (elm) {
          var latTmp = Number(elm.substring(0, 2)) / 1.5;
          var lngTmp = Number(elm.substring(2, 4)) + 100;
          var lat2Tmp = latTmp + 2 / 3;
          var lng2Tmp = lngTmp + 1;

          let mapImg = new Image();
          mapImg.src = "https://www.jma.go.jp/bosai/estimated_intensity_map/data/" + idTmp + "/" + elm + ".png"; // 画像のURLを指定
          mapImg.onload = () => {
            estimated_intensity_map_canvas.width = mapImg.width;
            estimated_intensity_map_canvas.height = mapImg.height;
            ctx.clearRect(0, 0, estimated_intensity_map_canvas.width, estimated_intensity_map_canvas.height);
            ctx.drawImage(mapImg, 0, 0);

            //色の変換
            /*
            const imageData = ctx.getImageData(0, 0, estimated_intensity_map_canvas.width, estimated_intensity_map_canvas.height);
            const data = imageData.data;
            function difference(a, b) {
              return Math.abs(a - b);
            }
            var len = Number(data.length);
            var r;
            var g;
            var b;
            for (var i = 0; i < len; i += 4) {
              if (data[i + 3] > 127) {
                data[i + 3] = 255;
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                if (difference(r, 250) < 20 && difference(g, 230) < 20 && difference(b, 150) < 20) {
                  int = "4";
                } else if (difference(r, 255) < 20 && difference(g, 230) < 20 && difference(b, 0) < 20) {
                  int = "5-";
                } else if (difference(r, 255) < 20 && difference(g, 153) < 20 && difference(b, 0) < 20) {
                  int = "5+";
                } else if (difference(r, 255) < 20 && difference(g, 40) < 20 && difference(b, 0) < 20) {
                  int = "6-";
                } else if (difference(r, 165) < 20 && difference(g, 0) < 20 && difference(b, 33) < 20) {
                  int = "6+";
                } else if (difference(r, 180) < 20 && difference(g, 0) < 20 && difference(b, 104) < 20) {
                  int = "7";
                } else {
                  var s4d = difference(r, 250) * difference(g, 230) * difference(b, 150);
                  var s5md = difference(r, 255) * difference(g, 230) * difference(b, 0);
                  var s5pd = difference(r, 255) * difference(g, 153) * difference(b, 0);
                  var s6md = difference(r, 255) * difference(g, 40) * difference(b, 0);
                  var s6pd = difference(r, 165) * difference(g, 0) * difference(b, 33);
                  var s7d = difference(r, 180) * difference(g, 0) * difference(b, 104);
                  var smin = Math.min(s4d, s5md, s5pd, s6md, s6pd, s7d);
                  if (smin == s4d) {
                    data[i] = shindo4C.r;
                    data[i + 1] = shindo4C.g;
                    data[i + 2] = shindo4C.b;
                  } else if (smin == s5md) {
                    data[i] = shindo5mC.r;
                    data[i + 1] = shindo5mC.g;
                    data[i + 2] = shindo5mC.b;
                  } else if (smin == s5pd) {
                    data[i] = shindo5pC.r;
                    data[i + 1] = shindo5pC.g;
                    data[i + 2] = shindo5pC.b;
                  } else if (smin == s6md) {
                    data[i] = shindo6mC.r;
                    data[i + 1] = shindo6mC.g;
                    data[i + 2] = shindo6mC.b;
                  } else if (smin == s6pd) {
                    data[i] = shindo6pC.r;
                    data[i + 1] = shindo6pC.g;
                    data[i + 2] = shindo6pC.b;
                  } else if (smin == s7d) {
                    data[i] = shindo7C.r;
                    data[i + 1] = shindo7C.g;
                    data[i + 2] = shindo7C.b;
                  }
                }
                if (int == "4") {
                  data[i] = shindo4C.r;
                  data[i + 1] = shindo4C.g;
                  data[i + 2] = shindo4C.b;
                } else if (int == "5-") {
                  data[i] = shindo5mC.r;
                  data[i + 1] = shindo5mC.g;
                  data[i + 2] = shindo5mC.b;
                } else if (int == "5+") {
                  data[i] = shindo5pC.r;
                  data[i + 1] = shindo5pC.g;
                  data[i + 2] = shindo5pC.b;
                } else if (int == "6-") {
                  data[i] = shindo6mC.r;
                  data[i + 1] = shindo6mC.g;
                  data[i + 2] = shindo6mC.b;
                } else if (int == "6+") {
                  data[i] = shindo6pC.r;
                  data[i + 1] = shindo6pC.g;
                  data[i + 2] = shindo6pC.b;
                } else if (int == "7") {
                  data[i] = shindo7C.r;
                  data[i + 1] = shindo7C.g;
                  data[i + 2] = shindo7C.b;
                }
              } else {
                data[i + 3] = 0;
              }
            }

            // ImageDataオブジェクトに、変更済みのRGBAデータ（変数data）を代入する
            imageData.data = data;

            // canvasに変更済みのImageDataオブジェクトを描画する
            ctx.clearRect(0, 0, estimated_intensity_map_canvas.width, estimated_intensity_map_canvas.height);

            ctx.putImageData(imageData, 0, 0);
            */

            var dataURL = estimated_intensity_map_canvas.toDataURL("image/png");
            estimated_intensity_map_layer.addLayer(
              L.imageOverlay(
                dataURL,
                [
                  [latTmp, lngTmp],
                  [lat2Tmp, lng2Tmp],
                ],
                { className: "estimated_intensity_map_img" }
              )
            );
          };
        });
        L.control
          .layers(
            {},
            {
              推計震度分布図: estimated_intensity_map_layer,
            },
            {
              position: "topright",
              collapsed: false,
            }
          )
          .addTo(map);
      }
    });
}

//気象庁リスト取得→jma_Fetch
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
    .catch(function () {});
}

//narikakun地震情報APIリスト取得→narikakun_Fetch
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
    .catch(function () {});
}

//気象庁 取得・フォーマット変更→ EQInfoControl
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
        if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text) commentText += json.Body.Comments.ForecastComment.Text;
        if (json.Body.Comments.FreeFormComment) commentText += json.Body.Comments.FreeFormComment;
      }
      EQInfoControl({
        infoType: json.Head.Title,
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

      if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
        var newestshindo = shindo_lastUpDate < new Date(json.Head.ReportDateTime);
        if (newestshindo) shindo_lastUpDate = new Date(json.Head.ReportDateTime);
        else return;
        removeChild(document.getElementById("Shindo"));

        document.getElementById("ShindoWrap").style.display = "inline-block";
        json.Body.Intensity.Observation.Pref.forEach(function (elm) {
          add_Pref_info(elm.Name, elm.MaxInt);
          if (elm.Area) {
            elm.Area.forEach(function (elm2) {
              add_Area_info(elm2.Name, elm2.MaxInt);
              if (elm2.City) {
                elm2.City.forEach(function (elm3) {
                  add_City_info(elm3.Name, elm3.MaxInt);
                  if (elm3.IntensityStation) {
                    elm3.IntensityStation.forEach(function (elm4) {
                      add_IntensityStation_info(elm4.latlon.lat, elm4.latlon.lon, elm4.Name, elm4.Int);
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
//気象庁防災XML 取得・フォーマット変更→ EQInfoControl
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

      if (!newInfoDateTime || newInfoDateTime <= ReportTime) {
        newInfoDateTime = ReportTime;
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
        magnitudeTypeTmp = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].getAttribute("type");
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

      if (xml.querySelector("Body Comments")) {
        var commentText = "";
        if (xml.querySelector("Body Comments ForecastComment")) commentText += xml.querySelector("Body Comments ForecastComment Text").textContent;
        if (xml.querySelector("Body Comments FreeFormComment")) commentText += xml.querySelector("Body Comments FreeFormComment").textContent;
      }

      EQInfoControl({
        infoType: xml.querySelector("Head Title").textContent,
        reportTime: new Date(xml.querySelector("Head ReportDateTime").textContent),
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        magType: magnitudeTypeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: DepthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
      });

      if (xml.querySelector("Body Intensity") && xml.querySelector("Body Intensity Observation Pref")) {
        var newestshindo = shindo_lastUpDate < new Date(xml.querySelector("Head ReportDateTime").textContent);
        if (newestshindo) shindo_lastUpDate = new Date(xml.querySelector("Head ReportDateTime").textContent);
        else return;
        document.getElementById("ShindoWrap").style.display = "inline-block";
        removeChild(document.getElementById("Shindo"));

        xml.querySelectorAll("Body Intensity Observation Pref").forEach(function (elm) {
          add_Pref_info(elm.querySelector("Name").textContent, elm.querySelector("MaxInt").textContent);
          if (elm.querySelectorAll("Area")) {
            elm.querySelectorAll("Area").forEach(function (elm2) {
              add_Area_info(elm2.querySelector("Name").textContent, elm2.querySelector("MaxInt").textContent);
              if (elm2.querySelectorAll("City")) {
                elm2.querySelectorAll("City").forEach(function (elm3) {
                  add_City_info(elm3.querySelector("Name").textContent, elm3.querySelector("MaxInt").textContent);

                  if (elm3.querySelectorAll("IntensityStation")) {
                    elm3.querySelectorAll("IntensityStation").forEach(function (elm4) {
                      var latlng = pointList[elm4.querySelector("Code").textContent].location;
                      add_IntensityStation_info(latlng[0], latlng[1], elm4.querySelector("Name").textContent, elm4.querySelector("Int").textContent);
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
//narikakun地震情報API 取得・フォーマット変更→ EQInfoControl
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
          infoType: json.Head.Title,
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

        if (json.Body.Intensity && json.Body.Intensity.Observation.Pref && json.Body.Intensity.Observation.Pref.length > 0) {
          var newestshindo = shindo_lastUpDate < new Date(json.Head.ReportDateTime);
          if (newestshindo) shindo_lastUpDate = new Date(json.Head.ReportDateTime);
          else return;

          document.getElementById("ShindoWrap").style.display = "inline-block";
          removeChild(document.getElementById("Shindo"));

          json.Body.Intensity.Observation.Pref.forEach(function (elm) {
            add_Pref_info(elm.Name, elm.MaxInt);

            if (elm.Area) {
              elm.Area.forEach(function (elm2) {
                add_Area_info(elm2.Name, elm2.MaxInt);
                if (elm2.City) {
                  elm2.City.forEach(function (elm3) {
                    add_City_info(elm3.Name, elm3.MaxInt);
                    if (elm3.IntensityStation) {
                      elm3.IntensityStation.forEach(function (elm4) {
                        add_IntensityStation_info(pointList[elm4.Code].location[0], pointList[elm4.Code].location[1], elm4.Name, elm4.Int);
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

//都道府県ごとの情報描画（リスト）
function add_Pref_info(name, maxInt) {
  var newDiv = document.createElement("div");
  var color1 = shindoConvert(maxInt, 2);
  newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + maxInt + "</span>" + name;
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
}
//細分区域ごとの情報描画（リスト・地図塗りつぶし・地図プロット）
function add_Area_info(name, maxInt) {
  var wrap = document.querySelectorAll(".WrapLevel1");

  var newDiv = document.createElement("div");
  var color = shindoConvert(maxInt, 2);
  newDiv.innerHTML = "<span style='background:" + color[0] + ";color:" + color[1] + ";'>" + maxInt + "</span>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem2");
  wrap[wrap.length - 1].appendChild(newDiv);
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel2", "close");
  wrap[wrap.length - 1].appendChild(newDiv2);

  if (name == config.home.Saibun) {
    var newDiv3 = document.createElement("div");
    newDiv3.innerHTML = "<span style='background:" + color[0] + ";color:" + color[1] + ";'>" + maxInt + "</span>" + name;
    newDiv3.classList.add("ShindoItem", "ShindoItem2");

    removeChild(document.getElementById("homeShindo"));
    document.getElementById("homeShindoWrap").style.display = "block";
    document.getElementById("homeShindo").appendChild(newDiv3);
  }

  var pointLocation = areaLocation[name];
  if (pointLocation) {
    var divIcon = L.divIcon({
      html: '<div style="background:' + color[0] + ";color:" + color[1] + '">' + maxInt + "</div>",
      className: "MaxShindoIcon",
      iconSize: [22, 22],
    });
    L.marker(pointLocation, { icon: divIcon, pane: "shadowPane" })
      .bindPopup("<h3>細分区域</h3><div>" + name + "</div><div>震度" + maxInt + "</div>")
      .addTo(map);
  }

  gjmap.setStyle({
    fill: false,
  });

  var sectionTmp = sections.find(function (elmA) {
    return elmA.name == name;
  });
  if (sectionTmp) {
    sectionTmp.item
      .setStyle({
        fill: true,
        fillColor: color[0],
        className: "FilledPath",
      })
      .setPopupContent("<h3>細分区分：" + name + "</h3>最大震度" + maxInt);
  }
}
//町ごとの情報描画（リスト）
function add_City_info(name, maxInt) {
  var wrap2 = document.querySelectorAll(".WrapLevel2");

  var newDiv = document.createElement("div");
  var color3 = shindoConvert(maxInt, 2);
  newDiv.innerHTML = "<span style='background:" + color3[0] + ";color:" + color3[1] + ";'>" + maxInt + "</span>" + name;
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
}
//観測点ごとの情報描画（リスト・地図プロット）
function add_IntensityStation_info(lat, lng, name, int) {
  name = name.replace("＊", "");

  var wrap3 = document.querySelectorAll(".WrapLevel3");

  var newDiv = document.createElement("div");
  var color4 = shindoConvert(int, 2);
  newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + int + "</span>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem4");

  var divIcon = L.divIcon({
    html: '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + int + "</div>",
    className: "ShindoIcon",
    iconSize: [23, 23],
  });

  L.marker([lat, lng], { icon: divIcon, pane: "shadowPane" })
    .addTo(map)
    .bindPopup("<h3>観測点</h3><div>" + name + "</div><div>震度" + int + "</div>");

  wrap3[wrap3.length - 1].appendChild(newDiv);
}

//地震情報マージ
function EQInfoControl(data) {
  var mostNew = false;

  if (!newInfoDateTime || newInfoDateTime <= data.reportTime || (EQInfo.eew && !data.eew)) {
    newInfoDateTime = data.reportTime;
    mostNew = true;
  }
  if (data.eew) {
    InfoType_add("type-1");
  }
  EQInfo.eew = data.eew;
  if (data.cancel) document.getElementById("canceled").style.display = "flex";

  if (data.originTime && (mostNew || !EQInfo.originTime)) EQInfo.originTime = data.originTime;
  if (data.maxI && (mostNew || !EQInfo.maxI)) EQInfo.maxI = data.maxI;
  if (data.mag && (mostNew || !EQInfo.mag)) EQInfo.mag = data.mag;
  if (data.mag && mostNew) data_MT.innerText = "M";
  if ((data.depth || data.depth === 0) && (mostNew || !EQInfo.depth)) EQInfo.depth = data.depth;
  if (data.epiCenter && (mostNew || !EQInfo.epiCenter)) EQInfo.epiCenter = data.epiCenter;
  if (data.comment) {
    if (!EQInfo.comment) EQInfo.comment = [];
    var commentTmp = "<li><time>" + dateEncode(4, data.reportTime) + "</time>" + data.comment + "</li>";
    if (!EQInfo.comment.includes(commentTmp)) {
      EQInfo.comment.push(commentTmp);
    }
  }

  if (EQInfo.originTime) data_time.innerText = dateEncode(4, EQInfo.originTime);
  if (EQInfo.maxI) data_maxI.innerText = shindoConvert(EQInfo.maxI, 1);
  if (EQInfo.maxI) data_maxI.style.borderBottom = "solid 2px " + shindoConvert(EQInfo.maxI, 2)[0];
  if (EQInfo.mag) data_M.innerText = EQInfo.mag;
  if (data.magType) data_MT.innerText = data.magType;

  if (EQInfo.depth) {
    data_depth.innerText = Math.round(EQInfo.depth) + "km";
  } else if (EQInfo.depth == 0) {
    data_depth.innerText = "ごく浅い";
  }

  if (EQInfo.epiCenter) data_center.innerText = EQInfo.epiCenter;

  if (EQInfo.comment) data_comment.innerHTML = EQInfo.comment.join("\n");

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
        .bindPopup("<h3>震央</h3><div>" + EQInfo.epiCenter + "</div>");
    } else {
      markerElm.setLatLng([data.lat, data.lng]);
    }

    map.setView([data.lat, data.lng], 6);
  }

  switch (data.infoType) {
    case "震度速報":
      InfoType_add("type-2");
      break;
    case "震源に関する情報":
      InfoType_add("type-3");
      break;
    case "震源・震度情報":
      InfoType_add("type-4-1");
      break;
    case "遠地地震に関する情報":
      InfoType_add("type-4-2");
      break;
    case "顕著な地震の震源要素更新のお知らせ":
      InfoType_add("type-5");
      break;
    default:
      break;
  }

  //  {originTime:,maxI:,mag:,lat:,lng:,depth:,epiCenter:,comment:,}
}

//地図（再）描画
function mapDraw() {
  if (eid) {
    jmaURL.forEach(function (elm) {
      jma_Fetch(elm);
    });

    narikakunURL.forEach(function (elm) {
      narikakun_Fetch(elm);
    });

    jmaXMLURL.forEach(function (elm) {
      jmaXMLFetch(elm);
    });

    jmaURLHis = jmaURLHis.concat(jmaURL);
    jmaXMLURLHis = jmaXMLURLHis.concat(jmaXMLURL);
    narikakunURLHis = narikakunURLHis.concat(narikakunURL);
    jmaURL = [];
    jmaXMLURL = [];
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

//↓震度情報タブUI↓
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

function InfoType_add(type) {
  document.getElementById(type).style.display = "inline-block";
  switch (type) {
    case "type-4-1":
    case "type-4-2":
      document.getElementById("type-2").classList.add("disabled");
      document.getElementById("type-3").classList.add("disabled");
      break;
    case "type-5":
      document.getElementById("type-3").classList.add("disabled");
      break;

    /* eslint-disable no-duplicate-case */
    case "type-2":
    case "type-3":
    case "type-4-1":
    case "type-4-2":
    case "type-5":
      /* eslint-enable */
      document.getElementById("type-1").classList.add("disabled");
      break;

    default:
      break;
  }
}
