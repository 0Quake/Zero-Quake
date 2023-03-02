var setting;
var sections = [];
var markerElm;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "setting") {
    setting = request.data.config;
    document.getElementById("softVersion").innerText = request.data.softVersion;

    document.getElementById("latitude").value = setting.home.latitude;
    document.getElementById("longitude").value = setting.home.longitude;
    document.getElementById("EEW_Voice").value = setting.notice.voice.EEW;
    var SaibunElm = Array.from(document.querySelectorAll("#saibun option")).find(function (elm) {
      return elm.innerText == setting.home.Saibun;
    });
    if (SaibunElm) SaibunElm.selected = true;

    document.getElementById("setting1").checked = setting.setting1;
    init();
  }
});

document.getElementById("apply").addEventListener("click", function () {
  setting.setting1 = document.getElementById("setting1").checked;
  setting.home.latitude = document.getElementById("latitude").value;
  setting.home.longitude = document.getElementById("longitude").value;
  setting.home.Saibun = document.getElementById("saibun").value;
  setting.notice.voice.EEW = document.getElementById("EEW_Voice").value;

  window.electronAPI.messageReturn({
    action: "settingReturn",
    data: setting,
  });
  window.close();
});
document.getElementById("cancel").addEventListener("click", function () {
  window.close();
});

function init() {
  map = L.map("mapcontainer", {
    maxBounds: [
      [90, 0],
      [-90, 360],
    ],

    zoomAnimation: true, //←オフにするとずれて不自然
    //preferCanvas: true,←かるくなる？
  });
  //L.control.scale({ imperial: false }).addTo(map);←縮尺

  map.setView([32.99125, 138.46], 4);
  map.createPane("jsonMAPPane").style.zIndex = 210;
  var jsonMAPCanvas = L.canvas({
    pane: "jsonMAPPane",
  });

  var tile1 = L.tileLayer("https://www.data.jma.go.jp/svd/eqdb/data/shindo/map/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.data.jma.go.jp/svd/eqdb/data/shindo/" target="_blank">&copy; 気象庁</a>',
  });
  var tile2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">&copy;国土地理院</a>',
  }); //最初に表示させるタイルに addTo() をつける
  var tile3 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
    minZoom: 9,
    minNativeZoom: 9,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">&copy;国土地理院</a>',
  });
  var tile4 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 5,
    maxNativeZoom: 14,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">&copy;国土地理院</a>',
  });
  var tile5 = L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 19,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.openstreetmap.org/" target="_blank">&copy;OpenStreetMap contributors</a>',
  });
  var tile6 = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 21,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.google.com/maps" target="_blank">&copy;google</a>',
  });
  var tile7 = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 21,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.google.com/maps" target="_blank">&copy;google</a>',
  });
  var tile8 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 0,
    maxNativeZoom: 18,
    maxZoom: 21,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">&copy;国土地理院</a>',
  });

  var tile9 = L.tileLayer("https://www.jma.go.jp/tile/gsi/pale2/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.jma.go.jp/bosai/map.html#5/28.835/168.548/&elem=int&contents=earthquake_map" target="_blank">&copy;気象庁</a>',
  });

  //
  //
  var overlay1 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png", {
    minZoom: 2,
    maxZoom: 16,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">&copy;国土地理院</a>',
  });
  var overlay2 = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png", {
    minZoom: 11,
    maxZoom: 18,
    attribution: 'Map data <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">&copy;国土地理院</a>',
  });
  var overlay3 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: 'Map data <a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#tsunami" target="_blank">&copy;国土地理院</a>',
  });
  var overlay4 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: 'Map data <a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#dosekiryukeikaikuiki" target="_blank">&copy;国土地理院</a>',
  });
  var overlay5 = L.tileLayer("https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png", {
    minZoom: 7,
    maxZoom: 12,
    attribution: 'Map data <a href="https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html#jisuberikeikaikuiki" target="_blank">&copy;国土地理院</a>',
  });
  var overlay6 = L.tileLayer("https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png", {
    minZoom: 0,
    minNativeZoom: 2,
    maxNativeZoom: 11,
    maxZoom: 21,
    attribution: 'Map data <a href="https://www.jma.go.jp/bosai/map.html#5/28.835/168.548/&elem=int&contents=earthquake_map" target="_blank">&copy;JMA</a>',
  });

  map.createPane("pane300").style.zIndex = 300;
  var homeIcon = L.icon({
    iconUrl: "img/homePin.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  markerElm = L.marker([setting.home.latitude, setting.home.longitude], {
    keyboard: false,
    icon: homeIcon,
  }).addTo(map);

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
          attribution: 'Map data <a href="https://www.naturalearthdata.com/">&copy;Natural Earth</a> / <a href="https://www.data.jma.go.jp/developer/gis.html" target="_blank">&copy;JMA</a>',
          renderer: L.svg(),
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.name) {
            sections.push({
              name: feature.properties.name,
              item: layer,
            });
            var saibunElm = document.createElement("option");
            saibunElm.innerText = feature.properties.name;

            if (setting && setting.home.Saibun == feature.properties.name) {
              saibunElm.selected = true;
              layer.setStyle({
                fillColor: "#FFF",
              });
            }
            document.getElementById("saibun").appendChild(saibunElm);

            layer.on("click", function (e) {
              gjmap.setStyle({
                fillColor: "#333",
              });
              lat = e.latlng.lat;
              lng = e.latlng.lng;
              markerElm.setLatLng(e.latlng);

              layer.setStyle({
                fillColor: "#FFF",
              });
              document.getElementById("latitude").value = lat;
              document.getElementById("longitude").value = lng;
              var optionElm = Array.from(document.querySelectorAll("#saibun option")).find(function (elm) {
                return elm.innerText == feature.properties.name;
              });
              optionElm.selected = true;
            });
          }
        },
      }).addTo(map);
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
              attribution: '<a href="https://www.naturalearthdata.com/">&copy;Natural Earth</a>',
              renderer: jsonMAPCanvas,
            },
          });

          worldmap.addTo(map);
        });
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
  map.on("click", function (e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;
  });
}

function MapReDraw() {
  gjmap.setStyle({
    fillColor: "#333",
  });
  lat = document.getElementById("latitude").value;
  lng = document.getElementById("longitude").value;
  markerElm.setLatLng([lat, lng]);
  sections
    .find(function (elm) {
      return elm.name == document.getElementById("saibun").value;
    })
    .item.setStyle({
      fillColor: "#FFF",
    });
}
