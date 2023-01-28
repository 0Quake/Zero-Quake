const electron = require("electron");
const { app, BrowserWindow, ipcMain, net, Notification, dialog } = electron;
const path = require("path");
const sound = require("sound-play");
const iconv = require("iconv-lite");
const Request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let fs = require("fs");

const Store = require("electron-store");
const store = new Store();
var config = store.get("config", {
  setting1: true,
  home: {
    name: "自宅",
    latitude: 35.68,
    longitude: 139.767,
    Saibun: "東京都２３区",
  },
  KmoniInterval: 1000,
  LmoniInterval: 1000,
  YmoniInterval: 1000,
  notice: {
    voice: {
      EEW: "緊急地震速報です。強い揺れに警戒してください。",
    },
  },
});
const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];

let mainWindow;
var settingWindow;
var tsunamiWindow;
let kmoniWorker;
var kmoniActive;

var kmoniTimeTmp = [];

//多重起動防止
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

var kmoniPointsDataTmp;
ipcMain.on("message", (_event, response) => {
  if (response.action == "kmoniReturn") {
    kmoniControl(response.data, response.date);
  } else if (response.action == "SnetReturn") {
    SnetControl(response.data, response.date);
  } else if (response.action == "tsunamiReqest") {
    if (tsunamiData) {
      mainWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: tsunamiData,
      });
    }
  } else if (response.action == "EEWReqest") {
    if (EEWNow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
      });
    }
  } else if (response.action == "settingWindowOpen") {
    if (!settingWindow) {
      settingWindow = new BrowserWindow({
        webPreferences: {
          preload: path.join(__dirname, "js/preload.js"),
          title: "設定 - Zero Quake",
          webSecurity: false,
          parent: mainWindow,
          modal: true,
          center: true,
          backgroundColor: "#202227",
          icon: path.join(__dirname, "img/icon.ico"),
        },
      });
      settingWindow.webContents.on("did-finish-load", () => {
        settingWindow.webContents.send("message2", {
          action: "setting",
          data: { config: config, softVersion: process.env.npm_package_version },
        });
      });
      settingWindow.on("closed", () => {
        settingWindow = null;
      });

      settingWindow.setMenuBarVisibility(false);
      settingWindow.webContents.openDevTools();

      settingWindow.loadFile("src/settings.html");
    }
  } else if (response.action == "settingReturn") {
    config = response.data;
    store.set("config", config);

    settingWindow.webContents.send("message2", {
      action: "setting",
      data: { config: config, softVersion: process.env.npm_package_version },
    });
  } else if (response.action == "TsunamiWindowOpen") {
    if (tsunamiWindow) {
      tsunamiWindow.focus();
      return;
    }
    tsunamiWindow = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "Zero Quake",
        webSecurity: false,
        backgroundColor: "#202227",
        icon: path.join(__dirname, "img/icon.ico"),
      },
    });
    //mainWindow.setMenuBarVisibility(false);
    tsunamiWindow.webContents.openDevTools();

    tsunamiWindow.webContents.on("did-finish-load", () => {
      if (tsunamiWindow) {
        tsunamiWindow.webContents.send("message2", {
          action: "tsunamiUpdate",
          data: tsunamiData,
        });
      }
    });
    tsunamiWindow.loadFile("src/TsunamiDetail.html");

    tsunamiWindow.on("closed", () => {
      tsunamiWindow = null;
    });
  } else if (response.action == "EQInfoWindowOpen") {
    var EQInfoWindow = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "地震詳細情報 - Zero Quake",
        webSecurity: false,
        backgroundColor: "#202227",
        icon: path.join(__dirname, "img/icon.ico"),
      },
    });
    //mainWindow.setMenuBarVisibility(false);

    EQInfoWindow.webContents.on("did-finish-load", () => {
      EQInfoWindow.webContents.send("message2", {
        action: "setting",
        data: config,
      });
      EQInfoWindow.webContents.send("message2", {
        action: "metaData",
        eid: response.eid,
        urls: response.urls,
      });
    });

    EQInfoWindow.loadFile(response.url);

    //EQInfoWindow.on("closed", () => {});
  }
});

function createWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }
  mainWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "Zero Quake",
      webSecurity: false,
      backgroundColor: "#202227",
      icon: path.join(__dirname, "img/icon.ico"),
    },
  });
  //mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.on("did-finish-load", () => {
    // replay("2023/01/22 11:13:20");
    //replay("2023/01/27 23:26:00");
    //replay("2023/01/22 10:58:50");
    //replay("2023/01/21 22:41:00");
    //  replay("2023/01/21 14:18:20");
    //replay("2023/01/19 21:24:35");
    // replay("2023/01/19 16:28:35");
    //replay("2023/01/18 21:41:00");
    //replay("2023/01/18 18:54:45");
    //replay("2023/01/15 20:37:45");

    /*
    EEWcontrol({
      alertflg: "予報", //種別
      report_id: "20230115203744", //地震ID
      report_num: 1, //第n報
      report_time: new Date() - Replay, //発表時刻
      magunitude: 9, //マグニチュード
      calcintensity: "5-", //最大深度
      depth: 10, //深さ
      is_cancel: false, //キャンセル
      is_final: false, //最終報
      is_training: true, //訓練報
      latitude: 35.6, //緯度
      longitude: 140.3, //経度
      region_code: "", //震央地域コード
      region_name: "存在しない地名", //震央地域
      origin_time: new Date(new Date() - Replay - 2000), //発生時刻
      isPlum: false,
      userIntensity: "4",
      arrivalTime: new Date() - Replay + 100000,
      intensityAreas: null, //細分区分ごとの予想震度
      warnZones: {
        zone: null,
        Pref: null,
        Regions: null,
      },
    });*/

    //    replay("2022/10/2 0:2:45");
    // replay("2022/11/3 19:04:40");

    //replay("2022/04/19 08:16:15");
    //replay("2022/11/09 17:40:05");

    /*
    EEWcontrol({
      alertflg: "警報", //種別
      report_id: "20991111111111", //地震ID
      report_num: 1, //第n報
      report_time: new Date() - Replay, //発表時刻
      magunitude: 9, //マグニチュード
      calcintensity: "5-", //最大深度
      depth: 10, //深さ
      is_cancel: false, //キャンセル
      is_final: false, //最終報
      is_training: true, //訓練報
      latitude: 35.6, //緯度
      longitude: 140.3, //経度
      region_code: "", //震央地域コード
      region_name: "存在しない地名", //震央地域
      origin_time: new Date(new Date() - Replay - 2000), //発生時刻
      isPlum: false,
      userIntensity: "4",
      intensityAreas: null, //細分区分ごとの予想震度
      warnZones: {
        zone: null,
        Pref: null,
        Regions: null,
      },
    });*/

    /*
    EEWcontrol({
      report_time: new Date() - Replay, //発表時刻
      region_code: "", //震央地域コード
      region_name: "存在しない地名", //震央地域
      latitude: 35.6, //緯度
      longitude: 140.3, //経度
      is_cancel: false, //キャンセル
      depth: 10, //深さ
      calcintensity: 7, //最大深度
      is_final: false, //最終報
      is_training: true, //訓練報
      origin_time: new Date(new Date() - Replay - 2000), //発生時刻
      magunitude: 9, //マグニチュード
      report_num: 1, //第n報
      report_id: "20991111111111", //地震ID
      alertflg: "警報", //種別
      condition: "",
      source: "存在しない情報源",
      intensityAreas: { 4: ["301", "331", "341"] },
    });*/

    /*
    setTimeout(function () {
      EEWcontrol({
        report_time: new Date() - Replay, //発表時刻
        region_code: "", //震央地域コード
        region_name: "存在しない地名", //震央地域
        latitude: 35.6, //緯度
        longitude: 140.3, //経度
        is_cancel: true, //キャンセル
        depth: 10, //深さ
        calcintensity: 7, //最大深度
        is_final: false, //最終報
        is_training: false, //訓練報
        origin_time: new Date(new Date() - Replay - 2000), //発生時刻
        magunitude: 9, //マグニチュード
        report_num: 2, //第n報
        report_id: "20991111111111", //地震ID
        alertflg: "警報", //種別
        condition: "",
        source: "存在しない情報源",
      });
    }, 5000);*/

    kmoniTimeTmp.forEach(function (elm) {
      mainWindow.webContents.send("message2", {
        action: "kmoniTimeUpdate",
        Updatetime: elm.Updatetime,
        LocalTime: elm.LocalTime,
        type: elm.type,
        condition: "success",
      });
    });

    mainWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });

    if (EEWNow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
      });
    }

    mainWindow.webContents.send("message2", {
      action: "EQInfo",
      source: "jma",
      data: eqInfo.jma,
    });

    if (notifications.length > 0) {
      mainWindow.webContents.send("message2", {
        action: "notification_Update",
        data: notifications,
      });
    }
    if (P2P_ConnectData) {
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "kmoniTimeUpdate",
          Updatetime: P2P_ConnectData[0],
          LocalTime: P2P_ConnectData[0],
          type: "P2P_EEW",
          condition: P2P_ConnectData[2],
        });
      }
    }

    if (kmoniPointsDataTmp) {
      mainWindow.webContents.send("message2", kmoniPointsDataTmp);
    }
  });

  mainWindow.loadFile("src/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  kmonicreateWindow();
}

function kmonicreateWindow() {
  if (kmoniWorker) {
    kmoniWorker.close();
  }
  kmoniWorker = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
    },
    backgroundThrottling: false,
    show: false,
  });

  kmoniWorker.loadFile("src/kmoniWorker.html");
}

app.whenReady().then(() => {
  createWindow();
  kmonicreateWindow();

  points = JSON.parse(fs.readFileSync(path.join(__dirname, "Resource/Knet_Points.json"), "utf8"));

  (async function () {
    await yoyuSetY();
    await kmoniServerSelect();
    await start();
  })();

  /*
  setTimeout(function () {
    start();
  }, 10000);
*/
  // アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
  app.on("activate", () => {
    // メインウィンドウが消えている場合は再度メインウィンドウを作成する
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 全てのウィンドウが閉じたときの処理
app.on("window-all-closed", () => {});

let tray = null;

electron.app.on("ready", () => {
  // Mac のみ Dock は非表示にする
  if (process.platform === "darwin") electron.app.dock.hide();

  // ビルド後にパスが狂わないよう `__dirname` を使う
  tray = new electron.Tray(`${__dirname}/img/icon.${process.platform === "win32" ? "ico" : "png"}`);
  tray.setContextMenu(
    electron.Menu.buildFromTemplate([
      {
        label: "画面の表示",
        click: () => {
          createWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "終了",
        role: "quit",
      },
    ])
  );
  tray.on("double-click", function () {
    createWindow();
  });
});

var EEW_Data = []; //地震速報リスト
var EEW_nowList = []; //現在発報中リスト
var EEW_history = []; //起動中に発生したリスト

var Yoyu = 100;
var yoyuY = 0;
var yoyuK = 0;
var yoyuL = 0;
var yoyuYOK = false;
var Replay = 0;
var EEWNow = false;

var errorCount = 0;

var kmoniDataHistory = [];
var EQDetect_List = [];
/*{
  id:0,
  lat:0,
  lng:0,
  Codes:[]
}*/
var EQDetectID = 0;

var historyCount = 10; //比較する件数
var threshold01 = 3; //検出とする観測点数
var threshold02 = 0.02; //1次フラグ条件のPGA増加量[gal]
var threshold03 = 0.1; //2次フラグ条件のPGA増加量[gal]
var threshold04 = 0.5; //フラグ条件の震度
var MargeRange = 50; //地震の同定範囲[km]
var time00 = 300000; //最初の検出~解除
var time01 = 10000; //最後の検出~解除
function kmoniControl(data, date) {
  kmoniActive = true;

  if (kmoniDataHistory.length > historyCount) kmoniDataHistory = kmoniDataHistory.slice(kmoniDataHistory.length - historyCount);

  data.forEach(function (elm, index) {
    var dataItemHistory = kmoniDataHistory.map(function (elm2) {
      return elm2[index].pga;
    });
    var pgaMax = Math.max.apply(null, dataItemHistory);
    var pgaMin = Math.min.apply(null, dataItemHistory);
    var detect = (pgaMax - pgaMin >= threshold02 || elm.pga > threshold03 || elm.shindo > threshold04 || elm.detectCount > 2) && elm.pga > 0.01;

    elm.detect = detect;
    elm.detect2 = pgaMax - pgaMin >= threshold03 || elm.shindo >= threshold04;

    if (detect) {
      if (!elm.detectCount) elm.detectCount = 0;
      elm.detectCount++;

      var already = EQDetect_List.find(function (elm2) {
        return elm2.Codes.find(function (elm3) {
          return elm3.Name == elm.Name;
        });
      });

      var EQD_ItemTmp = EQDetect_List.find(function (elm2) {
        if (geosailing(elm.Location.Latitude, elm.Location.Longitude, elm2.lat, elm2.lng) - elm2.Radius <= MargeRange) {
          if (!already) {
            elm2.Codes.push(elm);
            if (elm2.detect2) elm2.detect2Count++;
            var radiusTmp = geosailing(elm.Location.Latitude, elm.Location.Longitude, elm2.lat, elm2.lng);
            if (elm2.Radius < radiusTmp) elm2.Radius = radiusTmp;
          }
          return true;
        }

        /*
        var CodesTmp = elm2.Codes.find(function (elm3) {
          return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm3.Location.Latitude, elm3.Location.Longitude) <= MargeRange;
        });
        if (CodesTmp) {
          var already2 = elm2.Codes.find(function (elm3) {
            return elm3.Name == elm.Name;
          });

          if (!already2) {
            elm2.Codes.push(elm);
            if (elm2.detect2) elm2.detect2Count++;
            var radiusTmp = geosailing(elm.Location.Latitude, elm.Location.Longitude, elm2.lat, elm2.lng);
            if (elm2.Radius < radiusTmp) elm2.Radius = radiusTmp;
          }

          return !already2;
        }*/
      });

      if (EQD_ItemTmp) {
        EQD_ItemTmp.last_Detect = new Date();

        var detectPoint2 = EQD_ItemTmp.Codes.filter(function (elm2) {
          return elm2.detectCount >= 2;
        });

        if (detectPoint2.length >= threshold01) {
          if (mainWindow) {
            mainWindow.webContents.send("message2", {
              action: "EQDetect",
              data: EQD_ItemTmp,
            });
          }
        }
      } else if (elm.detect2) {
        EQDetect_List.push({ id: EQDetectID, lat: elm.Location.Latitude, lng: elm.Location.Longitude, Codes: [elm], Radius: 0, detectCount: 1, detect2Count: 1, last_Detect: new Date(), origin_Time: new Date() });
        EQDetectID++;
      }
    } else {
      elm.detectCount = 0;

      /*
    var DetectedEQ = EQDetect_List.find(function (elm2) {
      return elm2.Codes.find(function (elm3) {
        return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm3.Location.Latitude, elm3.Location.Longitude) <= MargeRange;
      });
    });*/

      var DetectedEQ = EQDetect_List.find(function (elm2) {
        return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm2.lat, elm2.lng) - elm2.Radius <= MargeRange;
      });

      if (DetectedEQ) {
        if (
          !DetectedEQ.Codes.find(function (elm2) {
            return elm2.Code == elm.Code;
          })
        ) {
          DetectedEQ.Codes = DetectedEQ.Codes.filter(function (elm2) {
            return elm2.Code !== elm.Code;
          });
        }
      }
    }
  });

  kmoniPointsDataTmp = {
    action: "kmoniUpdate",
    Updatetime: new Date(date),
    LocalTime: new Date(),
    data: data,
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", kmoniPointsDataTmp);
  }

  kmoniDataHistory.push(data);
}
function SnetControl(data, date) {
  kmoniPointsDataTmp = {
    action: "SnetUpdate",
    Updatetime: new Date(date),
    LocalTime: new Date(),
    data: data,
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", kmoniPointsDataTmp);
  }
}

setInterval(function () {
  EQDetect_List.forEach(function (elm, index) {
    if (new Date() - elm.origin_Time > time00 || new Date() - elm.last_Detect > time01) {
      EQDetect_List.splice(index, 1);
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EQDetectFinish",
          data: elm.id,
        });
      }
    }
  });
}, 1000);

function kmoniRequest() {
  if (net.online) {
    var request = net.request("http://www.kmoni.bosai.go.jp/webservice/hypo/eew/" + dateEncode(1, new Date() - yoyuK - Replay) + ".json");
    request.on("response", (res) => {
      var dataTmp = "";
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        yoyuY += 100;
        errorCount++;
        if (errorCount > 3) {
          kmoniServerSelect();
        }
      } else {
        errorCount = 0;
      }
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        EEWdetect(2, json, 1);
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "強震モニタ");
      kmoniTimeUpdate(new Date(), "kmoni", "Error");
    });

    request.end();
  }

  if (net.online) {
    var ReqTime = new Date() - yoyuK;
    Request({ method: "GET", url: "http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/acmap_s/" + dateEncode(2, ReqTime - Replay) + "/" + dateEncode(1, ReqTime - Replay) + ".acmap_s.gif", encoding: null }, (error, response, body) => {
      // エラーチェック
      if (error !== null) {
        NetworkError(error, "強震モニタ");
        return false;
      }
      if (kmoniWorker) {
        kmoniWorker.webContents.send("message2", {
          action: "KmoniImgUpdate",
          data: "data:image/gif;base64," + body.toString("base64"),
          date: ReqTime,
        });
      }
    });
  }
}
function lmoniRequest() {
  if (net.online) {
    var request = net.request("https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/" + dateEncode(1, new Date() - yoyuL - Replay) + ".json");
    request.on("response", (res) => {
      var dataTmp = "";
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        yoyuY += 100;
        errorCount++;
        if (errorCount > 3) {
          kmoniServerSelect();
        }
      } else {
        errorCount = 0;
      }
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        EEWdetect(2, json, 2);
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "長周期地震動モニタ");
      kmoniTimeUpdate(new Date(), "Lmoni", "Error");
    });

    request.end();
  }
}
function ymoniRequest() {
  if (net.online) {
    if (monitorVendor == "YE") {
      var request = net.request("https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        var dataTmp = "";
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          yoyuY += 100;
          errorCount++;
          if (errorCount > 3) {
            kmoniServerSelect();
          }
        } else {
          errorCount = 0;
        }
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });

        res.on("end", function () {
          var json = jsonParse(dataTmp);
          EEWdetect(1, json);
        });
      });
      request.on("error", (error) => {
        NetworkError(error, "Yahoo強震モニタ(East)");

        kmoniTimeUpdate(new Date(), "YahooKmoni", "Error", "East");
      });

      request.end();
    } else if (monitorVendor == "YW") {
      var request = net.request("https://weather-kyoshin.west.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        var dataTmp = "";
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          yoyuY += 100;
          errorCount++;
          if (errorCount > 3) {
            kmoniServerSelect();
          }
        } else {
          errorCount = 0;
        }
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          var json = jsonParse(dataTmp);
          EEWdetect(1, json);
        });
      });
      request.on("error", (error) => {
        NetworkError(error, "Yahoo強震モニタ(West)");
        kmoniTimeUpdate(new Date(), "YahooKmoni", "Error", "West");
      });

      request.end();
    }
  }
}
function SnetRequest() {
  if (net.online) {
    var request = net.request("https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer/query?f=json&returnGeometry=false&outFields=msilstarttime%2Cmsilendtime&_=" + new Date());
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        //json.features[json.features.length - 1].attributes.msilstarttime;

        var dateTime = json.features.sort((a, b) => b.attributes.msilstarttime - a.attributes.msilstarttime)[0].attributes.msilstarttime;

        Request({ method: "GET", url: "https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer//exportImage?f=image&time=" + dateTime + "%2C" + dateTime + "&bbox=13409547.546603577%2C2713376.239114911%2C16907305.960932314%2C5966536.162931148&size=400%2C400", encoding: null }, (error, response, body) => {
          // エラーチェック
          if (error !== null) {
            NetworkError(error, "海しる");
            return false;
          }
          if (kmoniWorker) {
            var ReqTime = new Date();
            kmoniWorker.webContents.send("message2", {
              action: "SnetImgUpdate",
              data: "data:image/png;base64," + body.toString("base64"),
              date: ReqTime,
            });
          }
        });
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "海しる");
      kmoniTimeUpdate(new Date(), "Lmoni", "Error");
    });

    request.end();
  }
}
function P2P_WS() {
  var WebSocketClient = require("websocket").client;
  var client = new WebSocketClient();

  client.on("connectFailed", function (error) {
    kmoniTimeUpdate(new Date(), "P2P_EEW", "Error");
  });

  client.on("connect", function (connection) {
    connection.on("error", function (error) {
      kmoniTimeUpdate(new Date(), "P2P_EEW", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date(), "P2P_EEW", "Disconnect");
      P2P_WS();
    });
    connection.on("message", function (message) {
      if (message.type === "utf8") {
        var data = message.utf8Data;
        switch (data.code) {
          case 551:
            //地震情報

            /*
            eqInfoControl(
              [
                {
                  eventId: data,
                  category: "?",
                  OriginTime: new Date(xml2.querySelector("Earthquake").getAttribute("Time")),
                  epiCenter: xml2.querySelector("Earthquake").getAttribute("Epicenter"),
                  M: xml2.querySelector("Earthquake").getAttribute("Magnitude"),
                  maxI: xml2.querySelector("Earthquake").getAttribute("Intensity"),
                  reportDateTime: new Date(xml2.querySelector("OriginTime").textContent),
                  DetailURL: [],
                },
              ],
              "jma"
            );*/

            break;
          case 552:
            //津波予報
            if (data.canceled) {
              data.forEach(function (elm) {
                elm.canceled = true;
              });
              data.revocation = false;
              data.source = "P2P";
            }
            TsunamiInfoControl(data);
            break;
          case 554:
            break;
          case 556:
            //緊急地震速報（警報）
            EEWdetect(3, data);
            break;

          default:
            break;
        }
        if (data.time) {
          kmoniTimeUpdate(new Date(data.time), "P2P_EEW", "success");
        }
      }
    });
    kmoniTimeUpdate(new Date(), "P2P_EEW", "success");
  });

  client.connect("wss://api.p2pquake.net/v2/ws");
}

function start() {
  //↓接続処理
  ymoniRequest();
  kmoniRequest();
  lmoniRequest();

  P2P_WS();
  //nakn_WS();
  yoyuSetK(function () {
    setInterval(kmoniRequest, 1000);
  });
  yoyuSetL(function () {
    setInterval(lmoniRequest, 1000);
  });
  setInterval(ymoniRequest, 1000);
  //↑接続処理

  SnetRequest();
  setInterval(function () {
    SnetRequest();
  }, 60000);

  setInterval(function () {
    if (!kmoniActive) {
      kmonicreateWindow();
    }
  }, 10000);

  //EEW解除
  setInterval(function () {
    EEW_nowList.forEach(function (elm) {
      if (new Date() - Replay - new Date(dateEncode(3, Number(elm.origin_time), 1)) > 300000) {
        EEWClear(null, elm.report_id, null, true);
      }
    });
  }, 1000);

  //地震情報
  setInterval(eqInfoUpdate, 10000);
  eqInfoUpdate();

  SNXWatch();
}

function SNXWatch() {
  for (let i = 1; i <= 10; i++) {
    filenameTmp = "SignalNowX_" + String(i).padStart(2, "0") + ".csl";
    var pathTmp = path.join(userHome, "/AppData/Roaming/StrategyCorporation/SignalNowX/" + filenameTmp);
    if (fs.existsSync(pathTmp)) {
      fs.watch(pathTmp, function (eventType, filename) {
        SNXLogRead(filename);
      });
    }
    SNXLogRead(filenameTmp);
  }
}

var intColorConv = { "0xFFFFFFFF": "0", "0xFFF2F2FF": "1", "0xFF00AAFF": "2", "0xFF0041FF": "3", "0xFFFAE696": "4", "0xFFFFE600": "5-", "0xFFFF9900": "5+", "0xFFFF2800": "6-", "0xFFA50021": "6+", "0xFFB40068": "7" };
function SNXLogRead(str) {
  var pathTmp = path.join(userHome, "/AppData/Roaming/StrategyCorporation/SignalNowX/" + str);
  if (fs.existsSync(pathTmp)) {
    fs.readFile(pathTmp, function (err, content) {
      if (err) {
        console.error(err);
      }

      var buffer = Buffer.from(content);
      let logData = buffer.toString();

      var SNXDataTmp = [];

      let dataTmp = logData.split("MsgType=9");
      dataTmp.forEach(function (elm) {
        var eidTmp;
        var reportnumTmp;
        var origintimeTmp;
        var reporttimeTmp;
        var arrivaltimeTmp;
        var intTmp;
        elm.split("<BOM>").forEach(function (elm2) {
          if (elm2.indexOf("対象EQ ID") != -1) {
            eidTmp = elm2.split(" = ")[1].substring(2, 16);
            reportnumTmp = elm2.split(" = ")[1].substring(17, 20);
          } else if (elm2.indexOf("地震発生時刻(a)") != -1) {
            origintimeTmp = elm2.split(" = ")[1].substring(0, 19);
          } else if (elm2.indexOf("地震到達予測時刻(c)") != -1) {
            arrivaltimeTmp = elm2.split(" = ")[1].substring(0, 19);
          } else if (elm2.indexOf("現在時刻(d)") != -1) {
            reporttimeTmp = elm2.split(" = ")[1].substring(0, 19);
          } else if (elm2.indexOf("震度階級色") != -1) {
            intTmp = intColorConv[elm2.split(" = ")[1].substring(0, 10)];
          }
        });

        if (origintimeTmp && (eidTmp || reportnumTmp || intTmp)) {
          SNXDataTmp.push({
            alertflg: null,
            report_id: eidTmp,
            report_num: Number(reportnumTmp),
            report_time: new Date(reporttimeTmp),
            condition: null,
            magunitude: null,
            calcintensity: null,
            depth: null,
            is_cancel: null,
            is_final: null,
            is_training: null,
            latitude: null,
            longitude: null,
            region_code: null,
            region_name: null,
            origin_time: new Date(origintimeTmp),
            isPlum: null,
            userIntensity: intTmp,
            arrivalTime: new Date(arrivaltimeTmp),
            intensityAreas: null, //細分区分ごとの予想震度
            warnZones: {
              zone: null,
              Pref: null,
              Regions: null,
            },
            source: "SignalNow X",
          });
        }
      });

      let dataTmp2 = logData.split("<BOM>");
      var eidTmp;
      dataTmp2.forEach(function (elm) {
        if (elm.indexOf("[OnEq01Queued]() Objective EqId =") != -1) {
          eidTmp = elm.split("[OnEq01Queued]() Objective EqId = ")[1].split('"')[0].replace("ND", "");
        } else if (eidTmp && elm.indexOf("[CalculateEqEffect()]()") != -1) {
          var item = elm.split("[CalculateEqEffect()]()")[1].split("|")[0].split(",");
          if (item.length == 11) {
            var latTmp = Number(item[0].split(": ")[1]);
            var lngTmp = Number(item[1].split(": ")[1]);
            var depthTmp = Number(item[2].split(": ")[1]);
            var magTmp = Number(item[3].split(": ")[1]);

            var SNXDataItem = SNXDataTmp.find(function (elm) {
              return elm.report_id == eidTmp;
            });
            if (SNXDataItem) {
              SNXDataItem.magunitude = magTmp;
              SNXDataItem.latitude = latTmp;
              SNXDataItem.longitude = lngTmp;
              SNXDataItem.depth = depthTmp;
            }
          }
        }
      });

      SNXDataTmp.forEach(function (elm) {
        EEWcontrol(elm);
      });
    });
  }
}

var tsunamiData;
var lwaveTmp;

function EEWdetect(type, json, KorL) {
  if (!json) return;
  if (type == 1) {
    //yahookmoni
    const request_time = new Date(json.realTimeData.dataTime); //monthは0オリジン

    kmoniTimeUpdate(request_time, "YahooKmoni", "success", monitorVendor);

    if (json.hypoInfo) {
      json.hypoInfo.items.forEach(function (elm) {
        var EEWdata = {
          alertflg: null, //種別
          report_id: elm.reportId, //地震ID
          report_num: Number(elm.reportNum), //第n報
          report_time: new Date(json.realTimeData.dataTime), //発表時刻
          magunitude: Number(elm.magnitude), //マグニチュード
          calcintensity: shindoConvert(elm.calcintensity, 0), //最大深度
          depth: Number(elm.depth.replace("km", "")), //深さ
          is_cancel: Boolean2(elm.isCancel), //キャンセル
          is_final: Boolean2(elm.isFinal), //最終報
          is_training: Boolean2(elm.isTraining), //訓練報
          latitude: latitudeConvert(elm.latitude), //緯度
          longitude: latitudeConvert(elm.longitude), //経度
          region_code: elm.regionCode, //震央地域コード
          region_name: elm.regionName, //震央地域
          origin_time: new Date(elm.originTime), //発生時刻
          isPlum: false,
          userIntensity: null,
          arrivalTime: null,
          intensityAreas: null, //細分区分ごとの予想震度
          warnZones: {
            zone: null,
            Pref: null,
            Regions: null,
          },
          source: "YahooKmoni",
        };

        EEWcontrol(EEWdata);
      });
    }
  } else if (type == 2) {
    //kmoni/lmoni
    const year = parseInt(json.request_time.substring(0, 4));
    const month = parseInt(json.request_time.substring(4, 6));
    const day = parseInt(json.request_time.substring(6, 8));
    const hour = parseInt(json.request_time.substring(8, 10));
    const min = parseInt(json.request_time.substring(10, 12));
    const sec = parseInt(json.request_time.substring(12, 15));
    const request_time = new Date(year, month - 1, day, hour, min, sec); //monthは0オリジン

    var sourceTmp;
    if (KorL == 1) sourceTmp = "kmoni";
    else if (KorL == 2) sourceTmp = "Lmoni";

    kmoniTimeUpdate(request_time, sourceTmp, "success");

    if (json.result.message == "") {
      var origin_timeTmp = new Date(json.origin_time.slice(0, 4), json.origin_time.slice(4, 6) - 1, json.origin_time.slice(6, 8), json.origin_time.slice(8, 10), json.origin_time.slice(10, 12), json.origin_time.slice(12, 14));

      var EEWdata = {
        alertflg: json.alertflg, //種別
        report_id: json.report_id, //地震ID
        report_num: Number(json.report_num), //第n報
        report_time: new Date(json.report_time), //発表時刻
        magunitude: Number(json.magunitude), //マグニチュード
        calcintensity: shindoConvert(json.calcintensity, 0), //最大深度
        depth: Number(json.depth.replace("km", "")), //深さ
        is_cancel: Boolean2(json.is_cancel), //キャンセル
        is_final: Boolean2(json.is_final), //最終報
        is_training: Boolean2(json.is_training), //訓練報
        latitude: Number(json.latitude), //緯度
        longitude: Number(json.longitude), //経度
        region_code: json.region_code, //震央地域コード
        region_name: json.region_name, //震央地域
        origin_time: origin_timeTmp, //発生時刻
        isPlum: false,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null, //細分区分ごとの予想震度
        warnZones: {
          zone: null,
          Pref: null,
          Regions: null,
        },
        source: sourceTmp,
      };

      EEWcontrol(EEWdata);

      sourceTmp;
    }

    if (json.avrarea) {
      EEWdata = Object.assign(EEWdata, {
        avrarea: json.avrarea, //長周期地震動観測地域
        avrarea_list: json.avrarea_list, //長周期地震動観測地域リスト
        avrval: json.avrval, //sva?
        avrrank: json.avrrank, //最大予想長周期地震動階級
      });

      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "longWaveUpdate",
          data: {
            avrarea: json.avrarea, //最大予想長周期地震動階級
            avrarea_list: json.avrarea_list, //長周期地震動観測地域リスト 階級は1~4
            avrval: json.avrval,
            avrrank: json.avrrank,
          },
        });
      }
    } else if (KorL == 2 && lwaveTmp) {
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "longWaveClear",
        });
      }
    }
    if (KorL == 2) lwaveTmp = json.avrarea;
  } else if (type == 3) {
    //P2P
    const reception_time = new Date(json.time); //monthは0オリジン

    var maxIntTmp = Math.floor(
      Math.max.apply(
        null,
        json.areas.map(function (p) {
          return p.scaleTo;
        })
      )
    );

    var latitudeTmp;
    var longitudeTmp;
    var depthTmp;
    var magnitudeTmp;
    var region_nameTmp;
    var origin_timeTmp;
    if (json.earthquake) {
      if (latitudeTmp !== 200) latitudeTmp = json.earthquake.hypocenter.latitude;
      if (longitudeTmp !== 200) longitudeTmp = json.earthquake.hypocenter.longitude;
      if (depthTmp !== -1) depthTmp = json.earthquake.hypocenter.depth;
      if (magnitudeTmp !== -1) magnitudeTmp = json.earthquake.hypocenter.magnitude;
      region_nameTmp = json.earthquake.hypocenter.name;
      origin_timeTmp = new Date(json.earthquake.originTime);
    }
    var EEWdata = {
      alertflg: "警報", //種別
      report_id: json.issue.eventId, //地震ID
      report_num: Number(json.issue.serial), //第n報
      report_time: new Date(json.issue.time), //発表時刻
      magunitude: magnitudeTmp, //マグニチュード
      calcintensity: shindoConvert(maxIntTmp), //最大震度
      depth: depthTmp, //深さ
      is_cancel: Boolean(json.canceled), //キャンセル
      is_final: null, //最終報(P2P→不明)
      is_training: Boolean(json.test), //訓練報
      latitude: latitudeTmp, //緯度
      longitude: longitudeTmp, //経度
      region_code: "", //震央地域コード
      region_name: region_nameTmp, //震央地域
      origin_time: origin_timeTmp, //発生時刻
      isPlum: conditionTmp == "仮定震源要素", //🔴PLUM法かどうか
      userIntensity: null,
      arrivalTime: null,
      intensityAreas: null, //細分区分ごとの予想震度
      warnZones: {
        zone: null,
        Pref: null,
        Regions: null,
      },
      source: "P2P_EEW",
    };

    kmoniTimeUpdate(new Date(json.issue.time), "P2P_EEW", "success");

    var areaTmp = [];
    json.areas.forEach(function (elm) {
      areaTmp.push({
        pref: elm.pref, //府県予報区
        name: elm.name, //地域名（細分区域名）
        scaleFrom: shindoConvert(lm.scaleFrom), //最大予測震度の下限
        scaleTo: shindoConvert(elm.scaleTo), //最大予測震度の上限
        kindCode: elm.kindCode, //警報コード( 10 (緊急地震速報（警報） 主要動について、未到達と予測), 11 (緊急地震速報（警報） 主要動について、既に到達と予測), 19 (緊急地震速報（警報） 主要動の到達予想なし（PLUM法による予想）) )
        arrivalTime: new Date(elm.arrivalTime), //主要動の到達予測時刻
      });
    });
    EEWdata.intensityAreas = areaTmp;

    EEWcontrol(EEWdata);
  }
}
function EEWcontrol(data) {
  /*
  if (!data.origin_time) {
    var eqj = EEW_Data.find(function (elm) {
      return elm.EQ_id == data.report_id;
    });
    if (eqj) {
      data.origin_time = eqj.data[eqj.data.length - 1].origin_time;
    }
  }*/
  var pastTime = new Date() - Replay - data.origin_time;
  if (pastTime > 300000 || pastTime < 0) return;
  if (!EEW_history[data.source]) EEW_history[data.source] = [];
  if (
    !EEW_history[data.source].find(function (elm) {
      return data.report_id == elm.report_id && data.report_num == elm.report_num;
    })
  ) {
    EEW_history[data.source].push(data);
  }

  if (data.latitude && data.longitude) {
    data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);
  }

  var EQJSON = EEW_Data.find(function (elm) {
    return elm.EQ_id == data.report_id;
  });
  if (EQJSON) {
    //ID・報の両方一致した情報が存在するか
    var EEWJSON = EQJSON.data.find(function (elm2) {
      return elm2.report_num == data.report_num;
    });

    //最新の報かどうか
    var saishin =
      data.report_num >
      Math.max.apply(
        null,
        EQJSON.data.map(function (o) {
          return o.report_num;
        })
      );
    var oneBefore =
      data.report_num ==
      Math.max.apply(
        null,
        EQJSON.data.map(function (o) {
          return o.report_num;
        })
      );

    if (!EEWJSON && saishin) {
      //第２報以降

      var EQJSON = EEW_Data.find(function (elm) {
        return elm.EQ_id == data.report_id;
      });

      if (!data.arrivalTime) {
        var oneBeforeData = EQJSON.data.filter(function (elm) {
          return elm.arrivalTime;
        });
        var newEstID = Math.max.apply(
          null,
          oneBeforeData.map(function (o) {
            return o.report_num;
          })
        );

        oneBeforeData = oneBeforeData.find(function (elm) {
          return elm.report_num == newEstID;
        });
        if (oneBeforeData) {
          data.arrivalTime = oneBeforeData.arrivalTime;
        }
      }

      EEWAlert(data, false);
      EQJSON.data.push(data);
      if (data.is_cancel) {
        EQJSON.canceled = true;
      }
    } else if (EEWJSON && oneBefore) {
      //既知／情報更新
      var changed = false;
      oneBeforeData = EQJSON.data.find(function (elm) {
        return elm.report_num == data.report_num;
      });
      if (!oneBeforeData.alertflg && data.alertflg) {
        oneBeforeData.alertflg = data.alertflg;
        changed = true;
      }
      if (!oneBeforeData.magunitude && data.magunitude) {
        oneBeforeData.magunitude = data.magunitude;
        changed = true;
      }
      if (!oneBeforeData.calcintensity && data.calcintensity) {
        oneBeforeData.calcintensity = data.calcintensity;
        changed = true;
      }
      if (!oneBeforeData.depth && data.depth) {
        oneBeforeData.depth = data.depth;
        changed = true;
      }
      if (!oneBeforeData.is_cancel && data.is_cancel) {
        oneBeforeData.is_cancel = data.is_cancel;
        changed = true;
      }
      if (!oneBeforeData.is_final && data.is_final) {
        oneBeforeData.is_final = data.is_final;
        changed = true;
      }
      if (!oneBeforeData.is_training && data.is_training) {
        oneBeforeData.is_training = data.is_training;
        changed = true;
      }
      if (!oneBeforeData.latitude && data.latitude) {
        oneBeforeData.latitude = data.latitude;
        changed = true;
      }
      if (!oneBeforeData.longitude && data.longitude) {
        oneBeforeData.longitude = data.longitude;
        changed = true;
      }
      if (!oneBeforeData.region_code && data.region_code) {
        oneBeforeData.region_code = data.region_code;
        changed = true;
      }
      if (!oneBeforeData.region_name && data.region_name) {
        oneBeforeData.region_name = data.region_name;
        changed = true;
      }
      if (!oneBeforeData.origin_time && data.origin_time) {
        oneBeforeData.origin_time = data.origin_time;
        changed = true;
      }
      if (!oneBeforeData.isPlum && data.isPlum) {
        oneBeforeData.isPlum = data.isPlum;
        changed = true;
      }
      if (!oneBeforeData.intensityAreas && data.intensityAreas) {
        oneBeforeData.intensityAreas = data.intensityAreas;
        changed = true;
      }
      if (!oneBeforeData.warnZone && data.warnZone) {
        oneBeforeData.warnZone = data.warnZone;
        changed = true;
      }
      if (!oneBeforeData.userIntensity && data.userIntensity) {
        oneBeforeData.userIntensity = data.userIntensity;
        changed = true;
      }
      if (data.arrivalTime && !oneBeforeData.arrivalTime) {
        oneBeforeData.arrivalTime = data.arrivalTime;
        changed = true;
      }

      if (changed) {
        EEWAlert(oneBeforeData, false, true);
      }
    }
  } else {
    //第１報
    EEWAlert(data, true);
    EEW_Data.push({
      EQ_id: data.report_id,
      canceled: false,
      data: [data],
    });
  }
}
function EEWAlert(data, first, update) {
  EEWNow = true;

  EEW_nowList = EEW_nowList.filter(function (elm) {
    return elm.report_id !== data.report_id;
  });
  EEW_nowList.push(data);

  if (mainWindow) {
    mainWindow.webContents.send("message2", {
      action: "EEWAlertUpdate",
      data: EEW_nowList,
      update: Boolean(update),
    });
  } else {
    if (!update) {
      var EEWNotification = new Notification({
        title: "緊急地震速報（" + data.alertflg + "）#" + data.report_num,
        body: data.region_name + "\n推定震度：" + data.calcintensity + "  M" + data.magunitude + "  深さ：" + data.depth,
      });
      EEWNotification.show();
      EEWNotification.on("click", function () {
        createWindow();
      });
    }
  }

  if (!update) {
    if (kmoniWorker) {
      kmoniWorker.webContents.send("message2", {
        action: "speak",
        data: "緊急地震速報です。",
      });
    }

    if (first) {
      if (data.alertflg == "警報") {
        sound.play(path.join(__dirname, "audio/EEW1.mp3"));
      } else if (data.alertflg == "予報") {
        sound.play(path.join(__dirname, "audio/EEW2.mp3"));
      }
      createWindow();
    }
  }
}
function EEWClear(source, code, reportnum, bypass) {
  if (EEWNow || bypass) {
    if (!bypass && EEW_history[source]) {
      var EEW_detected = EEW_history[source].find(function (elm) {
        return code == elm.report_id;
      });
    }
    if (EEW_detected || bypass) {
      EEW_nowList = EEW_nowList.filter(function (elm) {
        return elm.report_id !== code;
      });
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EEWAlertUpdate",
          data: EEW_nowList,
        });
      }

      if (EEW_nowList.length == 0) {
        EEWNow = false;
      }
    }
  }
}

//
//
//
//
//地震情報
var eqInfo = { jma: [], usgs: [] };
var aaa = 0;

function eqInfoUpdate() {
  //気象庁JSONリクエスト～パース
  var request = net.request("https://www.jma.go.jp/bosai/quake/data/list.json");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);
      var dataTmp2 = [];
      json = json.filter(function (elm) {
        return elm.ttl == "震度速報" || elm.ttl == "震源に関する情報" || elm.ttl == "震源・震度情報" || elm.ttl == "遠地地震に関する情報" || elm.ttl == "顕著な地震の震源要素更新のお知らせ";
      });
      for (let i = 0; i < 10; i++) {
        var elm = json[i];
        var maxi = elm.maxi;
        if (!maxi) maxi = shindoConvert("?", 1);
        dataTmp2.push({
          eventId: elm.eid,
          category: elm.ttl,
          OriginTime: new Date(elm.at),
          epiCenter: elm.anm,
          M: elm.mag,
          maxI: maxi,
          cancel: elm.ift == "取消",

          reportDateTime: new Date(elm.rdt),
          DetailURL: [String("https://www.jma.go.jp/bosai/quake/data/" + elm.json)],
        });
      }
      eqInfoControl(dataTmp2, "jma");
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁ホームページ");
  });

  request.end();

  //気象庁XMLリクエスト～パース
  var request = net.request("https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      const parser = new new JSDOM().window.DOMParser();
      const xml = parser.parseFromString(dataTmp, "text/html");
      xml.querySelectorAll("entry").forEach(function (elm) {
        //" || elm.ttl == "震源に関する情報" || elm.ttl == "震源・震度情報" || elm.ttl == "遠地地震に関する情報
        var title = elm.querySelector("title").textContent;
        var url = elm.querySelector("id").textContent;
        if (!url) return;

        if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度情報" || title == "遠地地震に関する情報" || title == "顕著な地震の震源要素更新のお知らせ") {
          //地震情報
          JMAEQInfoFetch(url);
        } else if (/大津波警報|津波警報|津波注意報|津波予報/.test(title)) {
          //津波予報
        }
      });
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁防災情報XML");
  });

  request.end();

  //NHKリクエスト～パース
  var request = net.request("https://www3.nhk.or.jp/sokuho/jishin/data/JishinReport.xml");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += iconv.decode(chunk, "shift_jis").toString();
    });
    res.on("end", function () {
      const parser = new new JSDOM().window.DOMParser();
      const xml = parser.parseFromString(dataTmp, "text/html");

      var items = xml.getElementsByTagName("item");
      var urls = [];

      for (let i = 0; i < 10; i++) {
        var url = items[i].getAttribute("url");

        urls.push(url);

        var request = net.request({ url: url, encoding: null });
        request.on("response", (res) => {
          var dataTmp2 = "";
          res.on("data", (chunk) => {
            dataTmp2 += iconv.decode(chunk, "shift_jis").toString();
          });
          res.on("end", function () {
            const parser2 = new new JSDOM().window.DOMParser();
            const xml2 = parser.parseFromString(dataTmp2, "text/html");

            var eid = "20" + urls[i].split("data/")[1].split("_")[0].slice(-12);

            var OriginTime;
            var epiCenter;
            var magnitude;
            var maxI;
            if (xml2.querySelector("Earthquake")) {
              OriginTime = new Date(xml2.querySelector("Earthquake").getAttribute("Time"));
              epiCenter = xml2.querySelector("Earthquake").getAttribute("Epicenter");
              magnitude = xml2.querySelector("Earthquake").getAttribute("Magnitude");
              maxI = xml2.querySelector("Earthquake").getAttribute("Intensity");
            }

            var OriginTime;
            if (xml2.querySelector("OriginTime")) {
              OriginTime = new Date(xml2.querySelector("OriginTime").textContent);
            }
            eqInfoControl(
              [
                {
                  eventId: eid,
                  category: "?",
                  OriginTime: OriginTime,
                  epiCenter: epiCenter,
                  M: magnitude,
                  maxI: maxI,
                  reportDateTime: OriginTime,
                  DetailURL: [urls[i]],
                },
              ],
              "jma"
            );
          });
        });
        request.end();
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "NHKホームページ");
  });
  request.end();

  EQI_narikakunList_Req("https://ntool.online/api/earthquakeList?year=" + new Date().getFullYear() + "&month=" + (new Date().getMonth() + 1), 10, true);

  //USGSリクエスト～パース
  var request = net.request("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=10");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);
      var dataTmp2 = [];
      json.features.forEach(function (elm) {
        dataTmp2.push({
          eventId: elm.id,
          category: null,
          OriginTime: new Date(elm.properties.time),
          epiCenter: elm.properties.place,
          M: elm.properties.mag,
          maxI: null,
          DetailURL: [elm.properties.url],
        });
      });

      eqInfoControl(dataTmp2, "usgs");

      //eqInfoDraw(dataTmp2, document.getElementById("USGS_EqInfo"), false, "USGS");
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "USGS");
  });

  request.end();
}

var narikakun_URLs = [];
function EQI_narikakunList_Req(url, num, first) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);

      narikakun_URLs = narikakun_URLs.concat(json.lists);

      if (narikakun_URLs.length < num && first) {
        var yearTmp = new Date().getFullYear();
        var monthTmp = new Date().getMonth();
        if (monthTmp == 0) {
          yearTmp = new Date().getFullYear() - 1;
          monthTmp = 1;
        }
        EQI_narikakun_Req("ntool.online/api/earthquakeList?year=" + yearTmp + "&month=" + monthTmp, num - json.lists.length, false);
      } else {
        narikakun_URLs.slice(0, 10).forEach(function (elm) {
          EQI_narikakun_Req(elm);
        });
        narikakun_URLs = [];
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "narikakun 地震情報API");
  });
  request.end();
}

function EQI_narikakun_Req(url) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);

      var originTimeTmp = json.Body.Earthquake ? new Date(json.Body.Earthquake.OriginTime) : null;
      var epiCenterTmp = json.Body.Earthquake ? json.Body.Earthquake.Hypocenter.Name : null;
      var MagnitudeTmp = json.Body.Earthquake ? json.Body.Earthquake.Magnitude : null;
      var MaxITmp = json.Body.Intensity ? json.Body.Intensity.Observation.MaxInt : null;
      var cancel = json.Head.InfoType == "取消";

      var dataTmp2 = [
        {
          eventId: json.Head.EventID,
          category: json.Head.Title,
          OriginTime: originTimeTmp,
          epiCenter: epiCenterTmp,
          M: MagnitudeTmp,
          maxI: MaxITmp,
          cancel: cancel,
          reportDateTime: new Date(json.Head.ReportDateTime),
          DetailURL: [url],
        },
      ];
      eqInfoControl(dataTmp2, "jma");
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "narikakun 地震情報API");
  });
  request.end();
}

function JMAEQInfoFetch(url) {
  if (!url) return;
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      if (aaa == 0) dataTmp = '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>顕著な地震の震源要素更新のお知らせ</Title><DateTime>2022-11-09T10:40:13Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>顕著な地震の震源要素更新のお知らせ</Title><ReportDateTime>2022-11-09T19:40:00+09:00</ReportDateTime><TargetDateTime>2022-11-09T19:40:00+09:00</TargetDateTime><EventID>20221109174020</EventID><InfoType>発表</InfoType><Serial/><InfoKind>震源要素更新のお知らせ</InfoKind><InfoKindVersion>1.0_0</InfoKindVersion><Headline><Text>令和　４年１１月　９日１９時４０分をもって、地震の発生場所と規模を更新します。</Text></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Earthquake><OriginTime>2022-11-09T17:40:00+09:00</OriginTime><ArrivalTime>2022-11-09T17:40:00+09:00</ArrivalTime><Hypocenter><Area><Name>茨城県南部</Name><Code type="震央地名">301</Code><jmx_eb:Coordinate description="北緯３６．２度　東経１４０．０度　深さ　５０ｋｍ" datum="日本測地系">+36.2+140.0-50000/</jmx_eb:Coordinate><jmx_eb:Coordinate type="震源位置（度分）" description="北緯３６度１１．１分　東経１４０度０１．６分　深さ　５１ｋｍ">+3611.1+14001.6-51000/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" description="Ｍ４．９">4.9</jmx_eb:Magnitude></Earthquake><Comments><FreeFormComment>度単位の震源要素は、津波情報等を引き続き発表する場合に使用されます。</FreeFormComment></Comments></Body></Report>';
      aaa++;

      const parser = new new JSDOM().window.DOMParser();
      const xml = parser.parseFromString(dataTmp, "text/html");
      var title = xml.title;
      var cancel = xml.querySelector("InfoType").textContent == "取り消し";

      if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度情報" || title == "遠地地震に関する情報" || title == "顕著な地震の震源要素更新のお知らせ") {
        //地震情報

        var EarthquakeElm = xml.querySelector("Body Earthquake");
        var originTimeTmp;
        var epiCenterTmp;
        var magnitudeTmp;
        if (EarthquakeElm) {
          originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
          epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
          magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude").textContent);
        }

        var IntensityElm = xml.querySelector("Body Intensity");
        var maxIntTmp;
        if (IntensityElm) {
          maxIntTmp = shindoConvert(IntensityElm.querySelector("MaxInt"));
        }
        eqInfoControl(
          [
            {
              eventId: xml.querySelector("EventID").textContent,
              category: xml.title,
              OriginTime: originTimeTmp,
              epiCenter: epiCenterTmp,
              M: magnitudeTmp,
              maxI: maxIntTmp,
              cancel: cancel,
              reportDateTime: new Date(xml.querySelector("ReportDateTime").textContent),
              DetailURL: [url],
            },
          ],
          "jma"
        );
      } else if (/大津波警報|津波警報|津波注意報|津波予報/.test(title)) {
        //津波予報

        if (cancel) {
          var tsunamiDataTmp = {
            issue: { time: new Date(xml.querySelector("ReportDateTime").textContent) },
            areas: [],
            revocation: true,
          };
          TsunamiInfoControl(tsunamiDataTmp);
        } else {
          var tsunamiDataTmp = {
            issue: { time: new Date(xml.querySelector("ReportDateTime").textContent) },
            areas: [],
            revocation: false,
            source: "jmaXML",
          };

          if (xml.querySelector("Body Tsunami")) {
            xml.querySelectorAll("Body Tsunami Forecast Item").forEach(function (elm) {
              var gradeTmp;
              var canceledTmp = false;
              switch (Number(elm.querySelector("Category Kind Code").textContent)) {
                case 52:
                case 53:
                  gradeTmp = "MajorWarning";
                  break;
                case 51:
                  gradeTmp = "Warning";
                  break;
                case 62:
                  gradeTmp = "Watch";
                  break;
                case 71:
                case 72:
                case 73:
                  gradeTmp = "Yoho";
                  break;
                case 50:
                case 60:
                  canceledTmp = true;
                  break;
                default:
                  break;
              }
              var firstHeightTmp;
              var firstHeightConditionTmp;
              var maxHeightTmp;
              if (elm.querySelector("FirstHeight")) {
                if (elm.querySelector("FirstHeight ArrivalTime")) {
                  firstHeightTmp = new Date(elm.querySelector("FirstHeight ArrivalTime").textContent);
                }
                if (elm.querySelector("FirstHeight Condition")) {
                  firstHeightConditionTmp = elm.querySelector("FirstHeight Condition").textContent;
                }
                if (elm.querySelector("MaxHeight").getElementsByTagName("jmx_eb:TsunamiHeight")) {
                  maxHeightTmp = elm.querySelector("MaxHeight").getElementsByTagName("jmx_eb:TsunamiHeight")[0].getAttribute("description");
                  maxHeightTmp = maxHeightTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                  });
                }
              }

              tsunamiDataTmp.areas.push({
                code: Number(elm.querySelector("Category Kind Code").textContent),
                grade: gradeTmp,
                name: elm.querySelector("Name").textContent,
                canceled: canceledTmp,
                firstHeight: firstHeightTmp,
                firstHeightCondition: firstHeightConditionTmp,
                maxHeight: maxHeightTmp,
              });
            });
          }

          TsunamiInfoControl(tsunamiDataTmp);
        }
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁防災情報XML");
  });

  request.end();
}

function eqInfoControl(dataList, type) {
  switch (type) {
    case "jma":
      var eqInfoTmp = [];
      dataList.forEach(function (data, index) {
        var EQElm = eqInfo.jma.concat(eqInfoTmp).find(function (elm) {
          return elm.eventId == data.eventId;
        });

        if (EQElm) {
          if (data.OriginTime && (!EQElm.OriginTime || EQElm.reportDateTime < data.reportDateTime)) EQElm.OriginTime = data.OriginTime;
          if (data.epiCenter && (!EQElm.epiCenter || EQElm.reportDateTime < data.reportDateTime)) EQElm.epiCenter = data.epiCenter;
          if (data.M && (!EQElm.M || EQElm.reportDateTime < data.reportDateTime)) EQElm.M = data.M;
          if (data.maxI && (!EQElm.maxI || EQElm.reportDateTime < data.reportDateTime)) EQElm.maxI = data.maxI;
          if (data.cancel && (!EQElm.cancel || EQElm.reportDateTime < data.reportDateTime)) EQElm.cancel = data.cancel;

          if (data.DetailURL && data.DetailURL[0] !== "" && !EQElm.DetailURL.includes(data.DetailURL[0])) EQElm.DetailURL.push(data.DetailURL[0]);
          eqInfoAlert(EQElm, "jma", true);
        } else {
          eqInfoTmp.push(data);
        }

        if (index == dataList.length - 1) {
          eqInfoAlert(eqInfoTmp, "jma");
        }
      });

      break;

    case "usgs":
      dataList.forEach(function (elm) {
        eqInfoAlert(elm, "usgs");
      });

      break;
    default:
      break;
  }
}

function eqInfoAlert(data, source, update) {
  if (source == "jma") {
    if (update) {
      var EQInfoTmp = eqInfo.jma.find(function (elm) {
        return elm.eventId == data.eventId;
      });
      EQInfoTmp = data;
    } else {
      eqInfo.jma = eqInfo.jma.concat(data);
    }
    eqInfo.jma = eqInfo.jma.sort(function (a, b) {
      var r = 0;
      if (a.OriginTime > b.OriginTime) {
        r = -1;
      } else if (a.OriginTime < b.OriginTime) {
        r = 1;
      }
      return r;
    });
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: source,
        data: eqInfo.jma,
      });
    }
  } else if (source == "usgs") {
    eqInfo.usgs = eqInfo.usgs.filter((item) => {
      return item.eventId !== data.eventId;
    });
    eqInfo.usgs = eqInfo.usgs.concat(data);

    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: source,
        data: eqInfo.usgs,
      });
    }
  }
}

function TsunamiInfoControl(data) {
  var newInfo = tsunamiData.issue.time < data.issue.time;
  var stilANDjma = tsunamiData.issue.time == data.issue.time && data.source == "jmaXML" && tsunamiData.source == "P2P";
  if (!tsunamiData || newInfo || stilANDjma) {
    tsunamiData = data;

    if (newInfo) {
      //アラート
      createWindow();
    }

    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: data,
        new: newInfo,
      });
    }
    if (tsunamiWindow) {
      tsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: data,
        new: newInfo,
      });
    }
  }
}

//
//
//
//支援関数
var Ymoni = 20000;
var Kmoni = 20000;
var Lmoni = 20000;
var TestStartTime;
var monitorVendor = "YE";

function NetworkError(error, type) {
  Window_notification(type + "との通信でエラーが発生しました。", "エラーコードは以下の通りです。\n" + String(error), "error");
}

var notifications = [];
var notification_id = 0;
function Window_notification(title, detail, type) {
  notifications.push({
    id: notification_id,
    type: type,
    title: title,
    detail: detail,
    time: new Date(),
  });
  notification_id++;

  if (mainWindow) {
    mainWindow.webContents.send("message2", {
      action: "notification_Update",
      data: notifications,
    });
  }
}

async function kmoniServerSelect() {
  await new Promise((resolve) => {
    YmoniE = Infinity;
    YmoniW = Infinity;
    Kmoni = Infinity;
    Lmoni = Infinity;

    TestStartTime = new Date();
    if (net.online) {
      var request = net.request("https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          YmoniE = 10000000;
        } else {
          YmoniE = new Date() - TestStartTime;
          if (YmoniE + YmoniW /*+ Kmoni + Lmoni*/ < Infinity) {
            resolve();
          }
        }
      });
      request.on("error", (error) => {
        NetworkError(error, "Yahoo強震モニタ(East)");
      });

      request.end();
    }

    if (net.online) {
      var request = net.request("https://weather-kyoshin.west.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          YmoniW = 10000000;
        } else {
          YmoniW = new Date() - TestStartTime;
          if (YmoniE + YmoniW /*+ Kmoni + Lmoni*/ < Infinity) {
            resolve();
          }
        }
      });
      request.on("error", (error) => {
        NetworkError(error, "Yahoo強震モニタ(West)");
      });

      request.end();
    }
  });
  await (function () {
    var minTime = Math.min(YmoniE, YmoniW, Kmoni, Lmoni);

    if (minTime == Infinity || minTime == YmoniE) {
      monitorVendor = "YE";
      //document.getElementById("MS-YE").selected = true;
    } else if (minTime == Infinity || minTime == YmoniW) {
      monitorVendor = "YW";
    } /* else if (minTime == Kmoni) {
      monitorVendor = "K";
      MSSelect("MS-K");
    } else if (minTime == Lmoni) {
      monitorVendor = "L";
      MSSelect("MS-L");
    }*/
    console.log({ "YE(Yahoo強震モニタEast)": YmoniE, "YE(Yahoo強震モニタWest)": YmoniW, "K(強震モニタ)": yoyuK, "L(長周期地震動モニタ)": yoyuL });
    console.log("選択結果：" + monitorVendor);
  })();
}

async function yoyuSetY() {
  var yoyuRes;

  //Yahoo
  await (function () {
    yoyuRes = yoyuSetYCore(500);
  })();
  if (yoyuRes) {
    await (function () {
      yoyuY -= 500;
    })();
    await yoyuSetYCore(50);
  }
  yoyuY += Yoyu;
}
async function yoyuSetYCore(delay) {
  yoyuYOK = false;
  var loopCount = 0;
  while (!yoyuYOK) {
    loopCount++;
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var request = net.request("https://weather-kyoshin.west.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
          request.on("response", (res) => {
            if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
              yoyuY += delay;
              setTimeout(resolve, 10);
            } else {
              yoyuYOK = true;
              setTimeout(resolve, 10);
            }
          });
          request.on("error", (error) => {
            NetworkError(error, "Yahoo強震モニタ(West)");
          });

          request.end();
        }
      } catch (err) {}
    });
    if (loopCount > 10) {
      yoyuY = 2500;
      break;
    }
  }
  return true;
}
async function yoyuSetK(func) {
  var yoyuKOK = false;
  var loopCount = 0;
  var reqTimeTmp;
  while (!yoyuKOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var reqTime = new Date();
          var request = net.request("http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=" + Number(new Date()));
          request.on("response", (res) => {
            res.on("end", function () {
              if (reqTimeTmp !== reqTime && 0 < loopCount) {
                yoyuKOK = true;
                yoyuK = new Date() - reqTime + Yoyu;
              }
              reqTimeTmp = new Date(reqTime);
            });
            setTimeout(resolve, 10);
          });
          request.on("error", (error) => {
            NetworkError(error, "強震モニタ");
          });

          request.end();
        }
      } catch (err) {}
    });
    if (loopCount > 25) {
      yoyuK = 2500 + Yoyu;
      break;
    }

    loopCount++;
  }
  func();
  return true;
}
async function yoyuSetL(func) {
  var yoyuLOK = false;
  var loopCount2 = 0;
  var reqTimeTmp2;
  while (!yoyuLOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var reqTime2 = new Date();
          var request = net.request("https://smi.lmoniexp.bosai.go.jp/webservice/server/pros/latest.json?_" + Number(new Date()));
          request.on("response", (res) => {
            res.on("end", function () {
              if (reqTimeTmp2 !== reqTime2 && 0 < loopCount2) {
                yoyuLOK = true;
                yoyuL = new Date() - reqTime2 + Yoyu;
              }
              reqTimeTmp2 = new Date(reqTime2);
            });
            setTimeout(resolve, 10);
          });
          request.on("error", (error) => {
            NetworkError(error, "長周期地震動モニタ");
          });

          request.end();
        }
      } catch (err) {}
    });
    if (loopCount2 > 25) {
      yoyuL = 2500 + Yoyu;
      break;
    }

    loopCount2++;
  }

  func();
  return true;
}

function Boolean2(str) {
  switch (str) {
    case "true":
      return true;
      break;
    case "false":
      return false;
      break;
    default:
      break;
  }
}

var P2P_ConnectData;
function kmoniTimeUpdate(Updatetime, type, condition, vendor) {
  if (mainWindow) {
    mainWindow.webContents.send("message2", {
      action: "kmoniTimeUpdate",
      Updatetime: Updatetime,
      LocalTime: new Date(),
      vendor: vendor,
      type: type,
      condition: condition,
    });
  }

  if (type == "P2P_EEW") {
    P2P_ConnectData = [Updatetime, type, condition, vendor];
  }
  kmoniTimeTmpElm = kmoniTimeTmp.find(function (elm) {
    return elm.type == type;
  });
  if (kmoniTimeTmpElm) {
    kmoniTimeTmpElm = {
      type: type,
      Updatetime: Updatetime,
      LocalTime: new Date(),
    };
  } else {
    kmoniTimeTmp.push({
      type: type,
      Updatetime: Updatetime,
      LocalTime: new Date(),
    });
  }
}

function replay(ReplayDate) {
  if (ReplayDate) {
    Replay = new Date() - new Date(ReplayDate);
    mainWindow.webContents.send("message2", {
      action: "Replay",
      data: Replay,
    });
  } else {
    Replay = 0;
  }
}

function dateEncode(type, dateTmp) {
  dateTmp = new Date(dateTmp);
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
    //YYYYMMDDHHMMSS
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
function jsonParse(str) {
  var json;
  str = String(str);
  try {
    json = JSON.parse(str);
  } catch (error) {
    json = null;
  }
  return json;
}

function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (!str) {
    ShindoTmp = "?";
  } else if (isNaN(str)) {
    str = String(str);
    str = str.replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
    str = str.replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-");
    str = str.replace(/\s+/g, "");
    switch (str) {
      case "-1":
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
function geosailing(a, b, c, d) {
  with (Math) return acos(sin(a * (i = PI / 180)) * sin(c * i) + cos(a * i) * cos(c * i) * cos(b * i - d * i)) * 6371.008;
}
