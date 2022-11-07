var map;
var points;
var Tsunami_MajorWarning, Tsunami_Warning, Tsunami_Watch;
var tsunamiLayer;
var gjmap; //オフライン地図
var gjmapT; //津波用geojson
window.addEventListener("load", function () {
  fetch("./Resource/Knet_Points.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      points = json;

      init();

      points.forEach(function (elm) {
        if (!elm.IsSuspended && elm.Name && elm.Point) {
          var kmoniPointMarker = L.divIcon({
            html: "<div class='marker-circle' style='background:rgba(128,128,128,0.2)'></div><div class='PointPopup PointPopup2'>読み込み中</div>",
            className: "kmoniPointMarker",
            iconSize: 25,
          });
          elm.marker = L.marker([elm.Location.Latitude, elm.Location.Longitude], {
            icon: kmoniPointMarker,
          }).addTo(map);
        }
      });
    });
});
window.addEventListener("load", function () {
  this.setTimeout(function () {
    document.getElementById("splash").style.display = "none";
  }, 2000);
});

var psWaveList = [];

window.electronAPI.messageSend((event, request) => {
  //ipcRenderer.on("message2", (event, request) => {

  /*
  if (request.action == "PSWaveUpdate" && false) {
    var data = request.data;
    var EQElm = psWaveList.find(function (elm) {
      return elm.id == data.report_id;
    });

    data.latitude = latitudeConvert(data.latitude);
    data.longitude = latitudeConvert(data.longitude);

    if (EQElm && EQElm.PCircleElm && EQElm.SCircleElm) {
      if (EQElm.data.latitude !== data.latitude || EQElm.data.longitude !== data.longitude) {
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
      }
      //EQElm.markerElm.setLatLng([data.latitude, data.longitude]);

      EQElm.PCircleElm.setRadius(data.pRadius * 1000 + 6000).setLatLng([data.latitude, data.longitude]);
      EQElm.SCircleElm.setRadius(data.sRadius * 1000 + 3500).setLatLng([data.latitude, data.longitude]);

      var overflow1 = map.getBounds()._northEast.lat < EQElm.PCircleElm.getBounds()._northEast.lat;
      var overflow2 = map.getBounds()._northEast.lng < EQElm.PCircleElm.getBounds()._northEast.lng;
      var overflow3 = map.getBounds()._southWest.lat > EQElm.PCircleElm.getBounds()._southWest.lat;
      var overflow4 = map.getBounds()._southWest.lng > EQElm.PCircleElm.getBounds()._southWest.lng;
      if (overflow1 || overflow2 || overflow3 || overflow4) {
        map.fitBounds(EQElm.PCircleElm.getBounds());
      }

      EQElm.data = { latitude: data.latitude, longitude: data.longitude, pRadius: data.pRadius, sRadius: data.sRadius };
    } else {
      /*
      var markerElm = L.marker([data.latitude, data.longitude], {
        icon: epicenterIcon,
        pane: "pane700",
      }).addTo(map);*/
  /*
      var PCElm = L.circle([data.latitude, data.longitude], {
        radius: data.pRadius * 1000,
        color: "#3094ff",
        fill: false,
        weight: 2,
        className: "PWave PWaveAnm",
        pane: "pane700",
      }).addTo(map);
      var SCElm = L.circle([data.latitude, data.longitude], {
        radius: data.sRadius * 1000,
        color: "#ff3e30",
        fill: true,
        fillColor: "#F00",
        fillOpacity: 0.15,
        weight: 2,
        className: "SWave SWaveAnm",
        pane: "pane700",
      }).addTo(map);

      map.fitBounds(PCElm.getBounds());
      map.setView([data.latitude, data.longitude]);

      psWaveList.push({ id: data.report_id, PCircleElm: PCElm, SCircleElm: SCElm, data: [{ latitude: data.latitude, longitude: data.longitude, pRadius: data.pRadius, sRadius: data.sRadius }] });
    }
    // {report_id }
    /*
  } else if (request.action == "EpiCenterUpdate") {
    return;
    var data = request.data;
    var EQElm = psWaveList.find(function (elm) {
      return elm.id == data.report_id;
    });

    data.latitude = latitudeConvert(data.latitude);
    data.longitude = latitudeConvert(data.longitude);

    if (EQElm && EQElm.PCircleElm && EQElm.SCircleElm) {
      if (EQElm.data.latitude !== data.latitude || EQElm.data.longitude !== data.longitude) {
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
      }
      //EQElm.markerElm.setLatLng([data.latitude, data.longitude]);

      EQElm.PCircleElm.setRadius(data.pRadius).setLatLng([data.latitude, data.longitude]);
      EQElm.SCircleElm.setRadius(data.sRadius).setLatLng([data.latitude, data.longitude]);

      var overflow1 = map.getBounds()._northEast.lat < EQElm.PCircleElm.getBounds()._northEast.lat;
      var overflow2 = map.getBounds()._northEast.lng < EQElm.PCircleElm.getBounds()._northEast.lng;
      var overflow3 = map.getBounds()._southWest.lat > EQElm.PCircleElm.getBounds()._southWest.lat;
      var overflow4 = map.getBounds()._southWest.lng > EQElm.PCircleElm.getBounds()._southWest.lng;
      if (overflow1 || overflow2 || overflow3 || overflow4) {
        map.fitBounds(EQElm.PCircleElm.getBounds());
      }

      EQElm.data.push({ latitude: data.latitude, longitude: data.longitude, pRadius: data.pRadius, sRadius: data.sRadius });
    } else {
      /*var markerElm = L.marker([data.latitude, data.longitude], {
        icon: epicenterIcon,
        pane: "pane700",
      }).addTo(map);*/
  /*
      var PCElm = L.circle([data.latitude, data.longitude], {
        radius: data.pRadius,
        color: "#3094ff",
        fill: false,
        weight: 2,
        className: "PWave PWaveAnm",
        pane: "pane700",
      }).addTo(map);
      var SCElm = L.circle([data.latitude, data.longitude], {
        radius: data.sRadius,
        color: "#ff3e30",
        fill: true,
        fillColor: "#F00",
        fillOpacity: 0.15,
        weight: 2,
        className: "SWave SWaveAnm",
        pane: "pane700",
      }).addTo(map);

      map.fitBounds(PCElm.getBounds());
      map.setView([data.latitude, data.longitude]);

      psWaveList.push({ id: data.report_id, PCircleElm: PCElm, SCircleElm: SCElm, data: { latitude: data.latitude, longitude: data.longitude, pRadius: data.pRadius, sRadius: data.sRadius } });
    }
    // {report_id }
    /*} else if (request.action == "PSWaveClear") {
    var pswaveTmp = psWaveList.find(function (elm) {
      return elm.id == request.data;
    });
    if (pswaveTmp) {
      // map.removeLayer(pswaveTmp.markerElm);
      console.log(pswaveTmp.PCircleElm);
      console.log(pswaveTmp.SCircleElm);
      map.removeLayer(pswaveTmp.PCircleElm);
      map.removeLayer(pswaveTmp.SCircleElm);
    }*/
  if (request.action == "kmoniUpdate") {
    var i = 0;

    var dataTmp = request.data;
    var dataTmp2 = dataTmp.filter(function (elm) {
      return elm.shindo;
    });

    var maxShindo = dataTmp2.reduce((a, b) => (a.shindo > b.shindo ? a : b)).shindo;
    document.getElementById("kmoniMax").innerText = Math.round(maxShindo * 10) / 10;

    var shindoList = dataTmp2.sort(function (a, b) {
      return b.shindo - a.shindo;
    });
    removeChild(document.getElementById("pointList"));
    for (let a = 0; a < 10; a++) {
      var shindoElm = shindoList[a];
      var newElm = document.createElement("li");
      var shindoColor = shindoConvert2(shindoElm.shindo);
      newElm.innerHTML = "<span style='color:" + shindoColor[1] + ";background:" + shindoColor[0] + "'>" + shindoConvert(shindoElm.shindo, true) + "</span>" + shindoElm.Name;
      document.getElementById("pointList").appendChild(newElm);
    }

    points.forEach(function (elm) {
      elm2 = dataTmp[i];

      if (!elm.IsSuspended && elm.Name && elm.Point && elm2.rgb) {
        if (elm.marker) {
          var popup_content = "<h3>" + elm.Name + "</h3><table><tr><td>震度</td><td>" + Math.round(elm2.shindo * 10) / 10 + " </td></tr><tr><td>PGA</td><td>" + Math.round(elm2.pga * 100) / 100 + "</td></tr></table>";

          var kmoniPointMarker = L.divIcon({
            html: "<div class='marker-circle' style='background:rgb(" + elm2.rgb.join(",") + ")'></div><div class='PointPopup PointPopup2'><h3>" + elm.Name + "</h3><table><tr><td>震度</td><td>" + Math.round(elm2.shindo * 10) / 10 + " </td></tr><tr><td>PGA</td><td>" + Math.round(elm2.pga * 100) / 100 + "</td></tr></table></div>",
            className: "kmoniPointMarker",
            iconSize: 25,
          });

          elm.marker.setIcon(kmoniPointMarker).bindPopup(popup_content, { className: "PointPopup" });
        }
      } else if (elm.marker) {
        elm.marker.setOpacity(0);
      }

      i++;
    });
  } else if (request.action == "longWaveUpdate") {
    document.getElementById("LWaveWrap").style.display = "block";
    document.getElementById("region_name2").innerText = request.data.avrarea_list.join(" ");
    document.getElementById("maxKaikyu").innerText = request.data.avrrank;
  } else if (request.action == "longWaveClear") {
    document.getElementById("LWaveWrap").style.display = "none";
  } else if (request.action == "tsunamiUpdate") {
    gjmapT.setStyle({
      stroke: false,
    });

    if (request.data.cancelled) {
      document.getElementById("tsunamiWrap").style.display = "none";

      document.body.classList.remove("TsunamiMode");
      Tsunami_MajorWarning = Tsunami_Warning = Tsunami_Watch = false;
    } else {
      map.addLayer(tsunamiLayer);

      document.getElementById("tsunamiWrap").style.display = "block";

      document.body.classList.add("TsunamiMode");
      request.data.areas.forEach(function (elm) {
        var tsunamiItem = tsunamiElm.find(function (elm2) {
          return elm2.name == elm.name;
        });
        if (tsunamiItem && tsunamiItem.item) {
          tsunamiItem.item.setStyle({
            stroke: true,
            color: tsunamiColorConv(elm.grade),
          });
        }

        switch (elm.grade) {
          case "MajorWarning":
            Tsunami_MajorWarning = true;
            break;
          case "Warning":
            Tsunami_Warning = true;
            break;
          case "Watch":
            Tsunami_Watch = true;
            break;
          default:
            break;
        }
      });

      document.getElementById("tsunami_MajorWarning").style.display = Tsunami_MajorWarning ? "block" : "none";
      document.getElementById("tsunami_Warning").style.display = Tsunami_Warning ? "block" : "none";
      document.getElementById("tsunami_Watch").style.display = Tsunami_Watch ? "block" : "none";

      if (Tsunami_MajorWarning) {
        document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("MajorWarning");
      } else if (Tsunami_Warning) {
        document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Warning");
      } else if (Tsunami_Watch) {
        document.getElementById("tsunamiTitle").style.borderColor = tsunamiColorConv("Watch");
      }
    }
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
let geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
};
let geojsonMarkerOptions2 = {
  radius: 8,
  fillColor: "#0078ff",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
};
var overlayTmp = [];
var epicenterIcon;
var tsunamiElm = [];

function init() {
  map = L.map("mapcontainer", {
    maxBounds: [
      [90, 0],
      [-90, 360],
    ],
    //preferCanvas: true,
    zoomAnimation: false, //←オフにするとずれて不自然
    //preferCanvas: true,←かるくなる？
  });
  //L.control.scale({ imperial: false }).addTo(map);←縮尺
  map.setView([32.99125, 138.46], 4);

  var tile1 = L.tileLayer("https://www.data.jma.go.jp/svd/eqdb/data/shindo/map/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.data.jma.go.jp/svd/eqdb/data/shindo/" target="_blank">© 気象庁</a>',
  })
    .on("tileload", function (event) {
      if (document.getElementById("hinanjo").checked) {
        const L = 85.05112878; // 最大緯度

        lat = parseFloat(map.getCenter().lat); // 緯度
        lon = parseFloat(map.getCenter().lng); // 経度
        zoom = 10; // 尺度

        var pixelX = parseInt(Math.pow(2, zoom + 7) * (lon / 180 + 1));
        var tileX = parseInt(pixelX / 256);

        var pixelY = parseInt((Math.pow(2, zoom + 7) / Math.PI) * (-1 * Math.atanh(Math.sin((Math.PI / 180) * lat)) + Math.atanh(Math.sin((Math.PI / 180) * L))));
        var tileY = parseInt(pixelY / 256);

        var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb04/10/" + tileX + "/" + tileY + ".geojson";
        fetch(url)
          .then((a) => (a.ok ? a.json() : null))
          .then((geojson) => {
            if (!geojson || !this._map) return;
            event.tile.geojson = L.geoJSON(geojson, {
              pointToLayer: function (feature, cordinate) {
                return L.circleMarker(cordinate, geojsonMarkerOptions);
              },
            })
              .addTo(this._map)
              .bindPopup("指定緊急避難場所（地震）");
          });
        var url = "https://cyberjapandata.gsi.go.jp/xyz/skhb05/10/" + tileX + "/" + tileY + ".geojson";

        fetch(url)
          .then((a) => (a.ok ? a.json() : null))
          .then((geojson) => {
            if (!geojson || !this._map) return;
            event.tile.geojson2 = L.geoJSON(geojson, {
              pointToLayer: function (feature, cordinate) {
                return L.circleMarker(cordinate, geojsonMarkerOptions2);
              },
            })
              .addTo(this._map)
              .bindPopup("指定緊急避難場所（津波）");
          });
      } else if (event.tile.geojson) {
        this._map.removeLayer(event.tile.geojson);
      }
    })
    .on("tileunload", function (event) {
      if (event.tile.geojson && this._map) this._map.removeLayer(event.tile.geojson);
      if (event.tile.geojson2 && this._map) this._map.removeLayer(event.tile.geojson2);
    });

  var tile2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var tile3 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
    minZoom: 9,
    minNativeZoom: 9,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var tile4 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 5,
    maxNativeZoom: 14,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var tile5 = L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 19,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.openstreetmap.org/" target="_blank">©OpenStreetMap contributors</a>',
  });
  var tile6 = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 21,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.google.com/maps" target="_blank">©google</a>',
  });
  var tile7 = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 21,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.google.com/maps" target="_blank">©google</a>',
  });
  var tile8 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });

  var tile9 = L.tileLayer("https://www.jma.go.jp/tile/gsi/pale2/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.jma.go.jp/bosai/map.html#5/28.835/168.548/&elem=int&contents=earthquake_map" target="_blank">©気象庁</a>',
  });

  var overlay1 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png", {
    minZoom: 2,
    maxZoom: 16,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var overlay2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png", {
    minZoom: 11,
    maxZoom: 18,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">©国土地理院</a>',
  });
  var overlay3 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: 'Map data <a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#tsunami" target="_blank">©国土地理院</a>',
  });
  var overlay4 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: 'Map data <a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#dosekiryukeikaikuiki" target="_blank">©国土地理院</a>',
  });
  var overlay5 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: 'Map data <a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#jisuberikeikaikuiki" target="_blank">©国土地理院</a>',
  });
  var overlay6 = L.tileLayer("https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.jma.go.jp/bosai/map.html#5/28.835/168.548/&elem=int&contents=earthquake_map" target="_blank">©JMA</a>',
  });

  fetch("./Resource/basemap.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      gjmap = L.geoJSON(json, {
        style: {
          color: "#999",
          fill: true,
          fillColor: "#333",
          fillOpacity: 1,
          weight: 1,
          pane: "tilePane",
          attribution: 'Map data <a href="https://www.naturalearthdata.com/">©Natural Earth</a> / <a href="https://www.data.jma.go.jp/developer/gis.html" target="_blank">©JMA</a>',
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
          }
        },
      }).addTo(map);

      L.control
        .layers(
          {
            オフライン地図: gjmap,
            気象庁: tile1,
            気象庁2: tile9,
            "地理院 標準地図": tile8,

            "地理院 淡色地図": tile2,
            "地理院 写真": tile3,
            "地理院 白地図": tile4,
            OpenStreetMap: tile5,
            "Google Map": tile6,
            "Google Map 写真": tile7,
          },
          {
            "地理院 陰影起伏図": overlay1,
            "地理院 火山基本図データ": overlay2,
            "地理院 津波浸水想定 ハザードマップ": overlay3,
            "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ": overlay4,
            "地理院 土砂災害警戒区域（地すべり） ハザードマップ": overlay5,
            "気象庁　境界線": overlay6,
          },
          {
            position: "topleft",
          }
        )
        .addTo(map);
    });

  tsunamiLayer = L.featureGroup();

  fetch("./Resource/tsunami.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      gjmapT = L.geoJSON(json, {
        style: {
          color: "#999",
          stroke: false,
          fill: false,
          weight: 5,
          pane: "pane700",
          //pane: "tilePane",
          className: "tsunamiElm",
          attribution: 'Map data <a href="https://www.data.jma.go.jp/developer/gis.html" target="_blank">©JMA</a>',
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            tsunamiElm.push({
              name: feature.properties.name,
              item: layer,
            });

            layer.bindPopup("津波予報区:" + feature.properties.name);
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
    img.src = "./img/nied_acmap_s_w_scale.gif";
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
  map.createPane("pane700").style.zIndex = 700;
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
    if (currentZoom > 11) {
      document.getElementById("mapcontainer").classList.add("popup_show");
    } else {
      document.getElementById("mapcontainer").classList.remove("popup_show");
    }
  });

  map.on("overlayadd", function (eventLayer) {
    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      legend.addTo(map);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      legend2.addTo(map);
      overlayTmp.push(eventLayer.name);
    }
  });
  map.on("overlayremove", function (eventLayer) {
    if (eventLayer.name === "地理院 津波浸水想定 ハザードマップ") {
      map.removeControl(legend);
    } else if (eventLayer.name === "地理院 土砂災害警戒区域（地すべり） ハザードマップ" || "地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ") {
      overlayTmp = overlayTmp.filter(function (elm) {
        return elm !== eventLayer.name;
      });
      if (overlayTmp.length == 0) {
        map.removeControl(legend2);
      }
    }
  });

  epicenterIcon = L.icon({
    iconUrl: "../src/img/epicenter.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });

  window.electronAPI.messageReturn({
    action: "EEWReqest",
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
  if (currentZoom > 11) {
    document.getElementById("mapcontainer").classList.add("popup_show");
  } else {
    document.getElementById("mapcontainer").classList.remove("popup_show");
  }

  var TimeTable_JMA2001;

  fetch("./Resource/TimeTable_JMA2001.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      TimeTable_JMA2001 = json;

      this.setInterval(function () {
        now_EEW.forEach(function (elm) {
          if (elm.origin_time && elm.depth && elm.latitude && elm.longitude) {
            var distance = Math.floor((new Date() - Replay - elm.origin_time) / 1000);

            if (elm.depth <= 700 && distance <= 2000) {
              var TimeTableTmp = TimeTable_JMA2001[elm.depth];
              var PRadius = 0;
              var SRadius = 0;
              distance += 1;
              var TimeElmTmpP;
              var TimeElmTmpS;

              /*
            TimeTableTmp.find(function (elm2) {
              return elm2.T == distance;
            });
            TimeTableTmp.find(function (elm2) {
              return elm2.T == distance;
            });

            var TimeTableTmpP = TimeTableTmp.filter(function (elm2) {
              return elm2.P > distance;
            });
            var TimeTableTmpS = TimeTableTmp.filter(function (elm2) {
              return elm2.S > distance;
            });*/

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
                console.log(distance, result, result2);
              }

              PRadius = TimeElmTmpP[0].R + ((TimeElmTmpP[1].R - TimeElmTmpP[0].R) * (distance - TimeElmTmpP[0].P)) / (TimeElmTmpP[1].P - TimeElmTmpP[0].P);

              SRadius = linear([TimeElmTmpS[0].S, TimeElmTmpS[1].S], [TimeElmTmpS[0].R, TimeElmTmpS[1].R])(distance);

              console.log("ほかん", PRadius, SRadius, TimeElmTmpS, TimeTableTmp);

              console.log(PRadius, SRadius, TimeElmTmpS, TimeTableTmp);
            }
            psWaveReDraw(elm.report_id, elm.latitude, elm.longitude, PRadius * 1000, SRadius * 1000);
          }
        });

        //終わった地震の予報円削除
        psWaveList = psWaveList.filter(function (elm) {
          var stillEEW = now_EEW.some(function (elm2) {
            return elm2.report_id;
          });
          if (!stillEEW) {
            if (elm.PCircleElm) map.removeLayer(elm.PCircleElm);
            if (elm.SCircleElm) map.removeLayer(elm.SCircleElm);
          }
          return stillEEW;
        });
      }, 1000);
    });
}

function psWaveReDraw(report_id, latitude, longitude, pRadius, sRadius) {
  if (!pRadius || !sRadius) return;
  var EQElm = psWaveList.find(function (elm) {
    return elm.id == report_id;
  });
  var EQElm2 = now_EEW.find(function (elm) {
    return elm.report_id == report_id;
  });
  console.log(report_id);

  latitude = latitudeConvert(latitude);
  longitude = latitudeConvert(longitude);

  if (EQElm && EQElm.PCircleElm && EQElm.SCircleElm) {
    //EQElm.markerElm.setLatLng([data.latitude, data.longitude]);

    EQElm.PCircleElm.setRadius(pRadius).setLatLng([latitude, longitude]);
    EQElm.SCircleElm.setRadius(sRadius).setLatLng([latitude, longitude]);

    /*
    var overflow1 = map.getBounds()._northEast.lat < EQElm.PCircleElm.getBounds()._northEast.lat;
    var overflow2 = map.getBounds()._northEast.lng < EQElm.PCircleElm.getBounds()._northEast.lng;
    var overflow3 = map.getBounds()._southWest.lat > EQElm.PCircleElm.getBounds()._southWest.lat;
    var overflow4 = map.getBounds()._southWest.lng > EQElm.PCircleElm.getBounds()._southWest.lng;
    if (overflow1 || overflow2 || overflow3 || overflow4) {
      map.fitBounds(EQElm.PCircleElm.getBounds());
    }*/

    EQElm.data = { latitude: latitude, longitude: longitude, pRadius: pRadius, sRadius: sRadius };
  } else {
    /*
    var markerElm = L.marker([data.latitude, data.longitude], {
      icon: epicenterIcon,
      pane: "pane700",
    }).addTo(map);*/

    var PCElm = L.circle([latitude, longitude], {
      radius: pRadius,
      color: "#3094ff",
      fill: false,
      weight: 2,
      className: "PWave PWaveAnm",
      pane: "pane700",
    }).addTo(map);
    var SCElm = L.circle([latitude, longitude], {
      radius: sRadius,
      color: "#ff3e30",
      fill: true,
      fillColor: "#F00",
      fillOpacity: 0.15,
      weight: 2,
      className: "SWave SWaveAnm",
      pane: "pane700",
    }).addTo(map);

    map.fitBounds(PCElm.getBounds());
    map.setView([latitude, longitude, 10]);

    psWaveList.push({ id: report_id, PCircleElm: PCElm, SCircleElm: SCElm, data: [{ latitude: latitude, longitude: longitude, pRadius: pRadius, sRadius: sRadius }] });
  }

  var EEWPanelElm = document.getElementById("EEW-" + report_id);
  if (EQElm2.distance && EEWPanelElm) {
    EEWPanelElm.querySelector(".Wave_progress .PWave_value").style.width = Math.min(pRadius / 1000 / EQElm2.distance, 1) * 100 + "%";
    EEWPanelElm.querySelector(".Wave_progress .SWave_value").style.width = Math.min(sRadius / 1000 / EQElm2.distance, 1) * 100 + "%";
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

function shindoConvert(num, type) {
  if (isNaN(num) || Number.isInteger(Number(num))) {
    num = String(num).replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    num = num.replace("-", "弱");
    num = num.replace("+", "強");

    if (num == "0") {
      return type ? "0" : false;
    } else if (num == "1" || num == "2" || num == "3" || num == "4" || num == "7") {
      return num;
    } else if (num == "5弱") {
      return "5-";
    } else if (num == "5強") {
      return "5+";
    } else if (num == "6弱") {
      return "6-";
    } else if (num == "6強") {
      return "6+";
    } else {
      return num;
    }
  } else {
    if (num < -0.5) {
      return type ? "0" : false;
    } else if (num < 0.5) {
      return "0";
    } else if (num < 1.5) {
      return "1";
    } else if (num < 2.5) {
      return "2";
    } else if (num < 3.5) {
      return "3";
    } else if (num < 4.5) {
      return "4";
    } else if (num < 5) {
      return "5-";
    } else if (num < 5.5) {
      return "5+";
    } else if (num < 6) {
      return "6-";
    } else if (num < 6.5) {
      return "6+";
    } else if (6.5 <= num) {
      return "7";
    } else {
      return num;
    }
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
function removeChild(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
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
