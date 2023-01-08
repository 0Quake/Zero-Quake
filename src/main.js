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
let kmoniWorker;

var kmoniTimeTmp = [];

//多重起動防止
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

ipcMain.on("message", (_event, response) => {
  if (response.action == "kmoniReturn") {
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "kmoniUpdate",
        Updatetime: new Date(response.date),
        LocalTime: new Date(),

        data: response.data,
      });
    }
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
  }
});

const createWindow = () => {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "Zero Quake",
      webSecurity: false,
      backgroundColor: "#202227",
      icon: path.join(__dirname, "img/icon.ico"),
    },
  });
  //mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.openDevTools();

  kmoniWorker = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
    },
    backgroundThrottling: false,
    show: false,
  });

  kmoniWorker.loadFile("src/kmoniWorker.html");

  mainWindow.webContents.on("did-finish-load", () => {
    //replay("2022/10/2 0:2:45");
    //replay("2022/11/3 19:04:40");

    //replay("2022/04/19 08:16:15");
    //replay("2022/11/09 17:40:05");

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

    var intColorConv = { "0xFFFFFFFF": "0", "0xFFF2F2FF": "1", "0xFF00AAFF": "2", "0xFF0041FF": "3", "0xFFFAE696": "4", "0xFFFFE600": "5-", "0xFFFF9900": "5+", "0xFFFF2800": "6-", "0xFFA50021": "6+", "0xFFB40068": "7" };

    fs.readFile(path.join(userHome, "/AppData/Roaming/StrategyCorporation/SignalNowX/SignalNowX_01.csl"), function (err, content) {
      if (err) {
        console.error(err);
      }
      var buf = new Buffer(content, "binary");
      let logData = buf.toString();
      let dataTmp = logData.split("MsgType=9");
      dataTmp.forEach(function (elm) {
        var eidTmp;
        var reportnumTmp;
        var origintimeTmp;
        var reporttimeTmp;
        var intTmp;
        elm.split("<BOM>").forEach(function (elm2) {
          if (elm2.indexOf("対象EQ ID") != -1) {
            eidTmp = elm2.split(" = ")[1].substring(2, 16);
            reportnumTmp = elm2.split(" = ")[1].substring(17, 20);
          } else if (elm2.indexOf("地震発生時刻(a)") != -1) {
            origintimeTmp = elm2.split(" = ")[1].substring(0, 19);
          } else if (elm2.indexOf("現在時刻(d)") != -1) {
            reporttimeTmp = elm2.split(" = ")[1].substring(0, 19);
          } else if (elm2.indexOf("震度階級色") != -1) {
            intTmp = intColorConv[elm2.split(" = ")[1].substring(0, 10)];
          }
        });

        if (eidTmp || reportnumTmp || origintimeTmp || intTmp) {
          EEWcontrol({
            alertflg: null,
            report_id: eidTmp,
            report_num: Number(reportnumTmp),
            report_time: new Date(reporttimeTmp),
            condition: null,
            magunitude: null,
            calcintensity: intTmp,
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
            source: "SignalNow X",
          });
        }
      });
    });

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
      data: [...eqInfo.jma].reverse(),
    });
  });

  mainWindow.loadFile("src/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  points = JSON.parse(fs.readFileSync(path.join(__dirname, "Resource/Knet_Points.json"), "utf8"));

  (async function () {
    await yoyuSetY();
    await kmoniServerSelect();
    await start();
  })();

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

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

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

ipcMain.on("message", (event, request) => {
  if (request.action == "monitorSelect") {
    monitorVendor = request.data;
  }
  return true;
});

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
    request.end();
  }

  if (net.online) {
    var ReqTime = new Date() - 2000;
    Request({ method: "GET", url: "http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/acmap_s/" + dateEncode(2, ReqTime /*- Replay*/) + "/" + dateEncode(1, ReqTime /*- Replay*/) + ".acmap_s.gif", encoding: null }, (error, response, body) => {
      // エラーチェック
      if (error !== null) {
        console.error("error:", error);
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
      request.end();
    }
  }
}
function P2P_WS() {
  var WebSocketClient = require("websocket").client;
  var client = new WebSocketClient();

  client.on("connectFailed", function (error) {
    console.log("WS__connectFailed:", error.toString());
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
        console.log("WS_message");
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
  yoyuSetK(function () {
    setInterval(kmoniRequest, 1000);
  });
  yoyuSetL(function () {
    setInterval(lmoniRequest, 1000);
  });
  setInterval(ymoniRequest, 1000);

  P2P_WS();
  //nakn_WS();
  //↑接続処理

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
      EEWNow = true;
      json.hypoInfo.items.forEach(function (elm) {
        var EEWdata = {
          alertflg: null, //種別
          report_id: elm.reportId, //地震ID
          report_num: Number(elm.reportNum), //第n報
          report_time: new Date(json.realTimeData.dataTime), //発表時刻
          magunitude: Number(elm.magnitude), //マグニチュード
          calcintensity: shindoConvert(elm.calcintensity, 0), //最大深度
          depth: Number(elm.depth.replace("km", "")), //深さ
          is_cancel: elm.isCancel, //キャンセル
          is_final: elm.isFinal, //最終報
          is_training: elm.isTraining, //訓練報
          latitude: latitudeConvert(elm.latitude), //緯度
          longitude: latitudeConvert(elm.longitude), //経度
          region_code: elm.regionCode, //震央地域コード
          region_name: elm.regionName, //震央地域
          origin_time: new Date(elm.originTime), //発生時刻
          isPlum: false,
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
    } else {
      EEW_nowList.forEach(function (elm) {
        if (EEWNow) EEWClear("YahooKmoni", elm.report_id); //EEW解除
      });
    }

    if (json.estShindo) {
      console.log(json.estShindo);
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
      EEWNow = true;

      var origin_timeTmp = new Date(json.origin_time.slice(0, 4), json.origin_time.slice(4, 6) - 1, json.origin_time.slice(6, 8), json.origin_time.slice(8, 10), json.origin_time.slice(10, 12), json.origin_time.slice(12, 14));

      var EEWdata = {
        alertflg: json.alertflg, //種別
        report_id: json.report_id, //地震ID
        report_num: Number(json.report_num), //第n報
        report_time: new Date(json.report_time), //発表時刻
        magunitude: Number(json.magunitude), //マグニチュード
        calcintensity: shindoConvert(json.calcintensity, 0), //最大深度
        depth: Number(json.depth.replace("km", "")), //深さ
        is_cancel: json.is_cancel, //キャンセル
        is_final: json.is_final, //最終報
        is_training: json.is_training, //訓練報
        latitude: Number(json.latitude), //緯度
        longitude: Number(json.longitude), //経度
        region_code: json.region_code, //震央地域コード
        region_name: json.region_name, //震央地域
        origin_time: origin_timeTmp, //発生時刻
        isPlum: false,
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
    } else {
      EEW_nowList.forEach(function (elm) {
        if (EEWNow) EEWClear(sourceTmp, elm.report_id); //EEW解除
      });
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

    EEWNow = true;
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
      is_cancel: json.canceled, //キャンセル
      is_final: null, //最終報(P2P→不明)
      is_training: json.test, //訓練報
      latitude: latitudeTmp, //緯度
      longitude: longitudeTmp, //経度
      region_code: "", //震央地域コード
      region_name: region_nameTmp, //震央地域
      origin_time: origin_timeTmp, //発生時刻
      isPlum: conditionTmp == "仮定震源要素", //🔴PLUM法かどうか
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
  if (new Date() - Replay - data.origin_time > 300000) return;
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

    if (!EEWJSON && saishin) {
      //console.log("       EEW!!!", data);
      console.log("AAAAAAAAA", data.report_time, data.report_id, data.report_num);

      EEWAlert(data, false);
      EQJSON.data.push(data);
      if (data.is_cancel) {
        EQJSON.canceled = true;
      }
    }
  } else {
    EEWAlert(data, true);
    console.log("AAAAAAAAA", data.report_time, data.report_id, data.report_num);

    EEW_Data.push({
      EQ_id: data.report_id,
      canceled: false,
      data: [data],
    });
  }
}
function EEWAlert(data, first) {
  EEW_nowList = EEW_nowList.filter(function (elm) {
    return elm.report_id !== data.report_id;
  });
  EEW_nowList.push(data);

  if (mainWindow) {
    mainWindow.webContents.send("message2", {
      action: "EEWAlertUpdate",
      data: EEW_nowList,
    });
  } else {
    var EEWNotification = new Notification({
      title: "緊急地震速報（" + data.alertflg + "）#" + data.report_num,
      body: data.region_name + "\n推定震度：" + data.calcintensity + "  M" + data.magunitude + "  深さ：" + data.depth,
    });
    EEWNotification.show();
    EEWNotification.on("click", function () {
      createWindow();
    });
  }

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
function EEWClear(source, code, reportnum, bypass) {
  if (EEWNow || bypass) {
    if (!bypass && EEW_history[source]) {
      var EEW_detected = EEW_history[source].find(function (elm) {
        return code == elm.report_id;
      });
    }
    if (EEW_detected || bypass) {
      console.log("EEWClear");

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
function eqInfoControl(dataList, type) {
  switch (type) {
    case "jma":
      dataList.forEach(function (data) {
        var EQElm = eqInfo.jma.find(function (elm) {
          return elm.eventId == data.eventId;
        });

        if (EQElm) {
          /*          category: json[i].ttl,    */

          if (data.OriginTime && (!EQElm.OriginTime || EQElm.reportDateTime < data.reportDateTime)) EQElm.OriginTime = data.OriginTime;
          if (data.epiCenter && (!EQElm.epiCenter || EQElm.reportDateTime < data.reportDateTime)) EQElm.epiCenter = data.epiCenter;
          if (data.M && (!EQElm.M || EQElm.reportDateTime < data.reportDateTime)) EQElm.M = data.M;
          if (data.maxI && (!EQElm.maxI || EQElm.reportDateTime < data.reportDateTime)) EQElm.maxI = data.maxI;

          if (data.DetailURL && data.DetailURL[0] !== "" && !EQElm.DetailURL.includes(data.DetailURL[0])) EQElm.DetailURL.push(data.DetailURL[0]);
        } else {
          eqInfo.jma.push(data);
        }
      });

      eqInfo.jma.sort(function (a, b) {
        var r = 0;
        if (a.OriginTime < b.OriginTime) {
          r = -1;
        } else if (a.OriginTime > b.OriginTime) {
          r = 1;
        }
        return r;
      });

      //eqInfoDraw([...eqInfo.jma].reverse(), document.getElementById("JMA_EqInfo"), true);

      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EQInfo",
          source: "jma",
          data: [...eqInfo.jma].reverse(),
        });
      }

      break;

    case "usgs":
      dataList.forEach(function (elm) {
        eqInfo.usgs.push(elm);
      });

      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EQInfo",
          source: "usgs",
          data: dataList,
        });
      }

      break;
    default:
      break;
  }
}

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
        return elm.ttl == "震度速報" || elm.ttl == "震源に関する情報" || elm.ttl == "震源・震度情報" || elm.ttl == "遠地地震に関する情報";
      });
      for (let i = 0; i < 10; i++) {
        //console.log({ "地震ID:": json[i].eid, 情報の種別: json[i].ttl, 発生時刻: new Date(json[i].at), 震源: json[i].anm, M: json[i].mag, 最大震度: json[i].maxi, 詳細JSONURL: json[i].json });

        var maxi = json[i].maxi;
        if (!maxi) maxi = shindoConvert("?", 1);
        dataTmp2.push({
          eventId: json[i].eid,
          category: json[i].ttl,
          OriginTime: new Date(json[i].at),
          epiCenter: json[i].anm,
          M: json[i].mag,
          maxI: maxi,
          reportDateTime: new Date(json[i].rdt),
          DetailURL: [String("https://www.jma.go.jp/bosai/quake/data/" + json[i].json)],
        });
      }
      eqInfoControl(dataTmp2, "jma");
    });
  });
  request.end();
  aaaa++;

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

        if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度情報" || title == "遠地地震に関する情報") {
          //地震情報
          JMAEQInfoFetch(url);
        } else if (/大津波警報|津波警報|津波注意報|津波予報/.test(title)) {
          //津波予報
        }
      });
    });
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
            //console.log({ "地震ID:": eid, 情報の種別: "?", 発生時刻: new Date(xml2.querySelector("OriginTime").textContent), 震源: xml2.querySelector("Earthquake").getAttribute("Epicenter"), M: xml2.querySelector("Earthquake").getAttribute("Magnitude"), 最大震度: xml2.querySelector("Earthquake").getAttribute("Intensity"), 詳細JSONURL: urls[i] });

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
  request.end();

  //narikakunリクエスト～パース
  var request = net.request("https://dev.narikakun.net/webapi/earthquake/post_data.json?_=" + new Date());
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);
      var dataTmp2 = [
        {
          eventId: json.Head.EventID,
          category: json.Head.Title,
          OriginTime: new Date(json.Body.Earthquake.OriginTime),
          epiCenter: json.Body.Earthquake.Hypocenter.Name,
          M: json.Body.Earthquake.Magnitude,
          maxI: json.Body.Intensity.Observation.MaxInt,
          reportDateTime: new Date(json.Head.ReportDateTime),
          DetailURL: ["https://dev.narikakun.net/webapi/earthquake/post_data.json"],
        },
      ];
      eqInfoControl(dataTmp2, "jma");
    });
  });
  request.end();

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
      for (let i = 0; i < Math.min(10, json.features.length); i++) {
        var elm = json.features[i];
        dataTmp2.push({
          eventId: null,
          category: null,
          OriginTime: new Date(elm.properties.time),
          epiCenter: elm.properties.place,
          M: elm.properties.mag,
          maxI: "?",
          DetailURL: [elm.properties.url],
        });
      }
      eqInfoControl(dataTmp2, "usgs");

      //eqInfoDraw(dataTmp2, document.getElementById("USGS_EqInfo"), false, "USGS");
    });
  });
  request.end();
}

var aaaa = 0;
function JMAEQInfoFetch(url) {
  if (!url) return;
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      if (aaaa == 1) {
        dataTmp =
          '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>津波警報・注意報・予報a</Title><DateTime>2022-01-15T15:15:19Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>津波警報・津波注意報・津波予報</Title><ReportDateTime>2022-01-16T00:15:00+09:00</ReportDateTime><TargetDateTime>2022-01-16T00:15:00+09:00</TargetDateTime><EventID>20220115131000</EventID><InfoType>発表</InfoType><Serial/><InfoKind>津波警報・注意報・予報</InfoKind><InfoKindVersion>1.0_1</InfoKindVersion><Headline><Text>津波警報を発表しました。 ただちに避難してください。</Text><Information type="津波予報領域表現"><Item><Kind><Name>津波警報</Name><Code>51</Code></Kind><Areas codeType="津波予報区"><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area></Areas></Item></Information></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Tsunami><Forecast><CodeDefine><Type xpath="Item/Area/Code">津波予報区</Type><Type xpath="Item/Category/Kind/Code">警報等情報要素／津波警報・注意報・予報</Type><Type xpath="Item/Category/LastKind/Code">警報等情報要素／津波警報・注意報・予報</Type></CodeDefine><Item><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area><Category><Kind><Name>津波警報</Name><Code>51</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="３ｍ">3</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸東部</Name><Code>100</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸中部</Name><Code>101</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸西部</Name><Code>102</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>青森県日本海沿岸</Name><Code>200</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>青森県太平洋沿岸</Name><Code>201</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>岩手県</Name><Code>210</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>宮城県</Name><Code>220</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>福島県</Name><Code>250</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>茨城県</Name><Code>300</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>千葉県九十九里・外房</Name><Code>310</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>千葉県内房</Name><Code>311</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>伊豆諸島</Name><Code>320</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>小笠原諸島</Name><Code>321</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>相模湾・三浦半島</Name><Code>330</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>静岡県</Name><Code>380</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>愛知県外海</Name><Code>390</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>伊勢・三河湾</Name><Code>391</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>三重県南部</Name><Code>400</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>和歌山県</Name><Code>530</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>徳島県</Name><Code>580</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>高知県</Name><Code>610</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>宮崎県</Name><Code>760</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>鹿児島県東部</Name><Code>770</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>種子島・屋久島地方</Name><Code>771</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>沖縄本島地方</Name><Code>800</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>大東島地方</Name><Code>801</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>宮古島・八重山地方</Name><Code>802</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>東京湾内湾</Name><Code>312</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>大分県豊後水道沿岸</Name><Code>751</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>鹿児島県西部</Name><Code>773</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item></Forecast></Tsunami><Earthquake><OriginTime>2022-01-15T13:10:00+09:00</OriginTime><ArrivalTime>2022-01-15T13:10:00+09:00</ArrivalTime><Hypocenter><Area><Name>南太平洋</Name><Code type="震央地名">950</Code><jmx_eb:Coordinate description="南緯２０．３度　西経１７５．２度　深さ不明">-20.3-175.2/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ不明">NaN</jmx_eb:Magnitude></Earthquake><Comments><WarningComment codeType="固定付加文"><Text>ただちに避難してください。 　 ＜津波警報＞ 津波による被害が発生します。 沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 津波は繰り返し襲ってきます。警報が解除されるまで安全な場所から離れないでください。 　 ＜津波注意報＞ 海の中や海岸付近は危険です。 海の中にいる人はただちに海から上がって、海岸から離れてください。 潮の流れが速い状態が続きますので、注意報が解除されるまで海に入ったり海岸に近づいたりしないようにしてください。 　 ＜津波予報（若干の海面変動）＞ 若干の海面変動が予想されますが、被害の心配はありません。 　 警報が発表された沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 到達予想時刻は、予報区のなかで最も早く津波が到達する時刻です。場所によっては、この時刻よりもかなり遅れて津波が襲ってくることがあります。 到達予想時刻から津波が最も高くなるまでに数時間以上かかることがありますので、観測された津波の高さにかかわらず、警報が解除されるまで安全な場所から離れないでください。 　 場所によっては津波の高さが「予想される津波の高さ」より高くなる可能性があります。</Text><Code>0149 0122 0123 0124 0131 0132</Code></WarningComment><FreeFormComment>［予想される津波の高さの解説］ 予想される津波が高いほど、より甚大な被害が生じます。 １０ｍ超　　巨大な津波が襲い壊滅的な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 １０ｍ　　　巨大な津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　５ｍ　　　津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　３ｍ　　　標高の低いところでは津波が襲い被害が生じる。木造家屋で浸水被害が発生し、人は津波による流れに巻き込まれる。 　１ｍ　　　海の中では人は速い流れに巻き込まれる。養殖いかだが流失し小型船舶が転覆する。</FreeFormComment></Comments></Body></Report>';
      } else if (aaaa == 2) {
        dataTmp =
          '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>津波警報・注意報・予報a</Title><DateTime>2022-01-15T17:54:00Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>津波警報・津波注意報・津波予報</Title><ReportDateTime>2022-01-16T02:54:00+09:00</ReportDateTime><TargetDateTime>2022-01-16T02:54:00+09:00</TargetDateTime><EventID>20220115131000</EventID><InfoType>発表</InfoType><Serial/><InfoKind>津波警報・注意報・予報</InfoKind><InfoKindVersion>1.0_1</InfoKindVersion><Headline><Text>津波警報を切り替えました。 ただちに避難してください。</Text><Information type="津波予報領域表現"><Item><Kind><Name>津波警報</Name><Code>51</Code></Kind><Areas codeType="津波予報区"><Area><Name>岩手県</Name><Code>210</Code></Area><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area></Areas></Item></Information></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Tsunami><Forecast><CodeDefine><Type xpath="Item/Area/Code">津波予報区</Type><Type xpath="Item/Category/Kind/Code">警報等情報要素／津波警報・注意報・予報</Type><Type xpath="Item/Category/LastKind/Code">警報等情報要素／津波警報・注意報・予報</Type></CodeDefine><Item><Area><Name>岩手県</Name><Code>210</Code></Area><Category><Kind><Name>津波警報</Name><Code>51</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="３ｍ">3</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area><Category><Kind><Name>津波警報</Name><Code>51</Code></Kind><LastKind><Name>津波警報</Name><Code>51</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="３ｍ">3</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸東部</Name><Code>100</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸中部</Name><Code>101</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸西部</Name><Code>102</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県日本海沿岸</Name><Code>200</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県太平洋沿岸</Name><Code>201</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮城県</Name><Code>220</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福島県</Name><Code>250</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>茨城県</Name><Code>300</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県九十九里・外房</Name><Code>310</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県内房</Name><Code>311</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊豆諸島</Name><Code>320</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>小笠原諸島</Name><Code>321</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>相模湾・三浦半島</Name><Code>330</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>静岡県</Name><Code>380</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛知県外海</Name><Code>390</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊勢・三河湾</Name><Code>391</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>三重県南部</Name><Code>400</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>和歌山県</Name><Code>530</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>徳島県</Name><Code>580</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>高知県</Name><Code>610</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮崎県</Name><Code>760</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県東部</Name><Code>770</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>種子島・屋久島地方</Name><Code>771</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>沖縄本島地方</Name><Code>800</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大東島地方</Name><Code>801</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮古島・八重山地方</Name><Code>802</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>東京湾内湾</Name><Code>312</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大分県豊後水道沿岸</Name><Code>751</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県西部</Name><Code>773</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item></Forecast></Tsunami><Earthquake><OriginTime>2022-01-15T13:10:00+09:00</OriginTime><ArrivalTime>2022-01-15T13:10:00+09:00</ArrivalTime><Hypocenter><Area><Name>南太平洋</Name><Code type="震央地名">950</Code><jmx_eb:Coordinate description="南緯２０．３度　西経１７５．２度　深さ不明">-20.3-175.2/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ不明">NaN</jmx_eb:Magnitude></Earthquake><Comments><WarningComment codeType="固定付加文"><Text>ただちに避難してください。 　 ＜津波警報＞ 津波による被害が発生します。 沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 津波は繰り返し襲ってきます。警報が解除されるまで安全な場所から離れないでください。 　 ＜津波注意報＞ 海の中や海岸付近は危険です。 海の中にいる人はただちに海から上がって、海岸から離れてください。 潮の流れが速い状態が続きますので、注意報が解除されるまで海に入ったり海岸に近づいたりしないようにしてください。 　 ＜津波予報（若干の海面変動）＞ 若干の海面変動が予想されますが、被害の心配はありません。 　 警報が発表された沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 到達予想時刻は、予報区のなかで最も早く津波が到達する時刻です。場所によっては、この時刻よりもかなり遅れて津波が襲ってくることがあります。 到達予想時刻から津波が最も高くなるまでに数時間以上かかることがありますので、観測された津波の高さにかかわらず、警報が解除されるまで安全な場所から離れないでください。 　 場所によっては津波の高さが「予想される津波の高さ」より高くなる可能性があります。</Text><Code>0149 0122 0123 0124 0131 0132</Code></WarningComment><FreeFormComment>［予想される津波の高さの解説］ 予想される津波が高いほど、より甚大な被害が生じます。 １０ｍ超　　巨大な津波が襲い壊滅的な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 １０ｍ　　　巨大な津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　５ｍ　　　津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　３ｍ　　　標高の低いところでは津波が襲い被害が生じる。木造家屋で浸水被害が発生し、人は津波による流れに巻き込まれる。 　１ｍ　　　海の中では人は速い流れに巻き込まれる。養殖いかだが流失し小型船舶が転覆する。</FreeFormComment></Comments>';
      } else if (aaaa == 3) {
        dataTmp =
          '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>津波警報・注意報・予報a</Title><DateTime>2022-01-15T19:07:11Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>津波警報・津波注意報・津波予報</Title><ReportDateTime>2022-01-16T04:07:00+09:00</ReportDateTime><TargetDateTime>2022-01-16T04:07:00+09:00</TargetDateTime><EventID>20220115131000</EventID><InfoType>発表</InfoType><Serial/><InfoKind>津波警報・注意報・予報</InfoKind><InfoKindVersion>1.0_1</InfoKindVersion><Headline><Text>津波警報を切り替えました。</Text><Information type="津波予報領域表現"><Item><Kind><Name>津波警報</Name><Code>51</Code></Kind><Areas codeType="津波予報区"><Area><Name>岩手県</Name><Code>210</Code></Area><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area></Areas></Item></Information></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Tsunami><Forecast><CodeDefine><Type xpath="Item/Area/Code">津波予報区</Type><Type xpath="Item/Category/Kind/Code">警報等情報要素／津波警報・注意報・予報</Type><Type xpath="Item/Category/LastKind/Code">警報等情報要素／津波警報・注意報・予報</Type></CodeDefine><Item><Area><Name>岩手県</Name><Code>210</Code></Area><Category><Kind><Name>津波警報</Name><Code>51</Code></Kind><LastKind><Name>津波警報</Name><Code>51</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="３ｍ">3</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area><Category><Kind><Name>津波警報</Name><Code>51</Code></Kind><LastKind><Name>津波警報</Name><Code>51</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="３ｍ">3</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸東部</Name><Code>100</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸中部</Name><Code>101</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸西部</Name><Code>102</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県日本海沿岸</Name><Code>200</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県太平洋沿岸</Name><Code>201</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮城県</Name><Code>220</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福島県</Name><Code>250</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>茨城県</Name><Code>300</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県九十九里・外房</Name><Code>310</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県内房</Name><Code>311</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊豆諸島</Name><Code>320</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>小笠原諸島</Name><Code>321</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>相模湾・三浦半島</Name><Code>330</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>静岡県</Name><Code>380</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛知県外海</Name><Code>390</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊勢・三河湾</Name><Code>391</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>三重県南部</Name><Code>400</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>和歌山県</Name><Code>530</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>徳島県</Name><Code>580</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>高知県</Name><Code>610</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>長崎県西方</Name><Code>730</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>宮崎県</Name><Code>760</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県東部</Name><Code>770</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>種子島・屋久島地方</Name><Code>771</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県西部</Name><Code>773</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition><Revise>追加</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>沖縄本島地方</Name><Code>800</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大東島地方</Name><Code>801</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮古島・八重山地方</Name><Code>802</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道日本海沿岸北部</Name><Code>110</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>北海道日本海沿岸南部</Name><Code>111</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>オホーツク海沿岸</Name><Code>120</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>陸奥湾</Name><Code>202</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>秋田県</Name><Code>230</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>山形県</Name><Code>240</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>東京湾内湾</Name><Code>312</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>新潟県上中下越</Name><Code>340</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>佐渡</Name><Code>341</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>富山県</Name><Code>350</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>石川県能登</Name><Code>360</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>石川県加賀</Name><Code>361</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>福井県</Name><Code>370</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>京都府</Name><Code>500</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>大阪府</Name><Code>510</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>兵庫県北部</Name><Code>520</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>兵庫県瀬戸内海沿岸</Name><Code>521</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>淡路島南部</Name><Code>522</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>鳥取県</Name><Code>540</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>島根県出雲・石見</Name><Code>550</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>隠岐</Name><Code>551</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>岡山県</Name><Code>560</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>広島県</Name><Code>570</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>香川県</Name><Code>590</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>愛媛県宇和海沿岸</Name><Code>600</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>愛媛県瀬戸内海沿岸</Name><Code>601</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>山口県日本海沿岸</Name><Code>700</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>山口県瀬戸内海沿岸</Name><Code>701</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>福岡県瀬戸内海沿岸</Name><Code>710</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>福岡県日本海沿岸</Name><Code>711</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>有明・八代海</Name><Code>712</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>佐賀県北部</Name><Code>720</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>壱岐・対馬</Name><Code>731</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>熊本県天草灘沿岸</Name><Code>740</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>大分県瀬戸内海沿岸</Name><Code>750</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波なし</Name><Code>00</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight><Revise>追加</Revise></MaxHeight></Item><Item><Area><Name>大分県豊後水道沿岸</Name><Code>751</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item></Forecast></Tsunami><Earthquake><OriginTime>2022-01-15T13:10:00+09:00</OriginTime><ArrivalTime>2022-01-15T13:10:00+09:00</ArrivalTime><Hypocenter><Area><Name>南太平洋</Name><Code type="震央地名">950</Code><jmx_eb:Coordinate description="南緯２０．３度　西経１７５．２度　深さ不明">-20.3-175.2/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ不明">NaN</jmx_eb:Magnitude></Earthquake><Comments><WarningComment codeType="固定付加文"><Text>＜津波警報＞ 津波による被害が発生します。 沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 津波は繰り返し襲ってきます。警報が解除されるまで安全な場所から離れないでください。 　 ＜津波注意報＞ 海の中や海岸付近は危険です。 海の中にいる人はただちに海から上がって、海岸から離れてください。 潮の流れが速い状態が続きますので、注意報が解除されるまで海に入ったり海岸に近づいたりしないようにしてください。 　 ＜津波予報（若干の海面変動）＞ 若干の海面変動が予想されますが、被害の心配はありません。 　 警報が発表された沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 到達予想時刻は、予報区のなかで最も早く津波が到達する時刻です。場所によっては、この時刻よりもかなり遅れて津波が襲ってくることがあります。 到達予想時刻から津波が最も高くなるまでに数時間以上かかることがありますので、観測された津波の高さにかかわらず、警報が解除されるまで安全な場所から離れないでください。 　 場所によっては津波の高さが「予想される津波の高さ」より高くなる可能性があります。</Text><Code>0122 0123 0124 0131 0132</Code></WarningComment><FreeFormComment>［予想される津波の高さの解説］ 予想される津波が高いほど、より甚大な被害が生じます。 １０ｍ超　　巨大な津波が襲い壊滅的な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 １０ｍ　　　巨大な津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　５ｍ　　　津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　３ｍ　　　標高の低いところでは津波が襲い被害が生じる。木造家屋で浸水被害が発生し、人は津波による流れに巻き込まれる。 　１ｍ　　　海の中では人は速い流れに巻き込まれる。養殖いかだが流失し小型船舶が転覆する。</FreeFormComment></Comments></Body></Report>';
      } else if (aaaa == 4) {
        dataTmp =
          '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>津波警報・注意報・予報a</Title><DateTime>2022-01-15T22:30:19Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>津波警報・津波注意報・津波予報</Title><ReportDateTime>2022-01-16T07:30:00+09:00</ReportDateTime><TargetDateTime>2022-01-16T07:30:00+09:00</TargetDateTime><EventID>20220115131000</EventID><InfoType>発表</InfoType><Serial/><InfoKind>津波警報・注意報・予報</InfoKind><InfoKindVersion>1.0_1</InfoKindVersion><Headline><Text>津波警報を切り替えました。</Text><Information type="津波予報領域表現"><Item><Kind><Name>津波警報</Name><Code>51</Code></Kind><Areas codeType="津波予報区"><Area><Name>岩手県</Name><Code>210</Code></Area></Areas></Item></Information></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Tsunami><Forecast><CodeDefine><Type xpath="Item/Area/Code">津波予報区</Type><Type xpath="Item/Category/Kind/Code">警報等情報要素／津波警報・注意報・予報</Type><Type xpath="Item/Category/LastKind/Code">警報等情報要素／津波警報・注意報・予報</Type></CodeDefine><Item><Area><Name>岩手県</Name><Code>210</Code></Area><Category><Kind><Name>津波警報</Name><Code>51</Code></Kind><LastKind><Name>津波警報</Name><Code>51</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="３ｍ">3</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸東部</Name><Code>100</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸中部</Name><Code>101</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸西部</Name><Code>102</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県日本海沿岸</Name><Code>200</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県太平洋沿岸</Name><Code>201</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮城県</Name><Code>220</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福島県</Name><Code>250</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>茨城県</Name><Code>300</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県九十九里・外房</Name><Code>310</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県内房</Name><Code>311</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊豆諸島</Name><Code>320</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>小笠原諸島</Name><Code>321</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>相模湾・三浦半島</Name><Code>330</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>静岡県</Name><Code>380</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛知県外海</Name><Code>390</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊勢・三河湾</Name><Code>391</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>三重県南部</Name><Code>400</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>和歌山県</Name><Code>530</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>徳島県</Name><Code>580</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>高知県</Name><Code>610</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>長崎県西方</Name><Code>730</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮崎県</Name><Code>760</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県東部</Name><Code>770</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>種子島・屋久島地方</Name><Code>771</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波警報</Name><Code>51</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>鹿児島県西部</Name><Code>773</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition><Revise>更新</Revise></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>沖縄本島地方</Name><Code>800</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大東島地方</Name><Code>801</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮古島・八重山地方</Name><Code>802</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道日本海沿岸北部</Name><Code>110</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道日本海沿岸南部</Name><Code>111</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>オホーツク海沿岸</Name><Code>120</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>陸奥湾</Name><Code>202</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>秋田県</Name><Code>230</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>山形県</Name><Code>240</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>東京湾内湾</Name><Code>312</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>新潟県上中下越</Name><Code>340</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>佐渡</Name><Code>341</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>富山県</Name><Code>350</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>石川県能登</Name><Code>360</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>石川県加賀</Name><Code>361</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福井県</Name><Code>370</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>京都府</Name><Code>500</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大阪府</Name><Code>510</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>兵庫県北部</Name><Code>520</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>兵庫県瀬戸内海沿岸</Name><Code>521</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>淡路島南部</Name><Code>522</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鳥取県</Name><Code>540</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>島根県出雲・石見</Name><Code>550</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>隠岐</Name><Code>551</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>岡山県</Name><Code>560</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>広島県</Name><Code>570</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>香川県</Name><Code>590</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛媛県宇和海沿岸</Name><Code>600</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛媛県瀬戸内海沿岸</Name><Code>601</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>山口県日本海沿岸</Name><Code>700</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>山口県瀬戸内海沿岸</Name><Code>701</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福岡県瀬戸内海沿岸</Name><Code>710</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福岡県日本海沿岸</Name><Code>711</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>有明・八代海</Name><Code>712</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>佐賀県北部</Name><Code>720</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>壱岐・対馬</Name><Code>731</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>熊本県天草灘沿岸</Name><Code>740</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大分県瀬戸内海沿岸</Name><Code>750</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大分県豊後水道沿岸</Name><Code>751</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item></Forecast></Tsunami><Earthquake><OriginTime>2022-01-15T13:10:00+09:00</OriginTime><ArrivalTime>2022-01-15T13:10:00+09:00</ArrivalTime><Hypocenter><Area><Name>南太平洋</Name><Code type="震央地名">950</Code><jmx_eb:Coordinate description="南緯２０．３度　西経１７５．２度　深さ不明">-20.3-175.2/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ不明">NaN</jmx_eb:Magnitude></Earthquake><Comments><WarningComment codeType="固定付加文"><Text>＜津波警報＞ 津波による被害が発生します。 沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 津波は繰り返し襲ってきます。警報が解除されるまで安全な場所から離れないでください。 　 ＜津波注意報＞ 海の中や海岸付近は危険です。 海の中にいる人はただちに海から上がって、海岸から離れてください。 潮の流れが速い状態が続きますので、注意報が解除されるまで海に入ったり海岸に近づいたりしないようにしてください。 　 ＜津波予報（若干の海面変動）＞ 若干の海面変動が予想されますが、被害の心配はありません。 　 警報が発表された沿岸部や川沿いにいる人はただちに高台や避難ビルなど安全な場所へ避難してください。 到達予想時刻は、予報区のなかで最も早く津波が到達する時刻です。場所によっては、この時刻よりもかなり遅れて津波が襲ってくることがあります。 到達予想時刻から津波が最も高くなるまでに数時間以上かかることがありますので、観測された津波の高さにかかわらず、警報が解除されるまで安全な場所から離れないでください。 　 場所によっては津波の高さが「予想される津波の高さ」より高くなる可能性があります。</Text><Code>0122 0123 0124 0131 0132</Code></WarningComment><FreeFormComment>［予想される津波の高さの解説］ 予想される津波が高いほど、より甚大な被害が生じます。 １０ｍ超　　巨大な津波が襲い壊滅的な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 １０ｍ　　　巨大な津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　５ｍ　　　津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　３ｍ　　　標高の低いところでは津波が襲い被害が生じる。木造家屋で浸水被害が発生し、人は津波による流れに巻き込まれる。 　１ｍ　　　海の中では人は速い流れに巻き込まれる。養殖いかだが流失し小型船舶が転覆する。</FreeFormComment></Comments>';
      } else if (aaaa == 5) {
        dataTmp =
          '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>津波警報・注意報・予報a</Title><DateTime>2022-01-16T02:20:09Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>津波注意報・津波予報</Title><ReportDateTime>2022-01-16T11:20:00+09:00</ReportDateTime><TargetDateTime>2022-01-16T11:20:00+09:00</TargetDateTime><EventID>20220115131000</EventID><InfoType>発表</InfoType><Serial/><InfoKind>津波警報・注意報・予報</InfoKind><InfoKindVersion>1.0_1</InfoKindVersion><Headline><Text>津波注意報に切り替えました。</Text></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Tsunami><Forecast><CodeDefine><Type xpath="Item/Area/Code">津波予報区</Type><Type xpath="Item/Category/Kind/Code">警報等情報要素／津波警報・注意報・予報</Type><Type xpath="Item/Category/LastKind/Code">警報等情報要素／津波警報・注意報・予報</Type></CodeDefine><Item><Area><Name>北海道太平洋沿岸東部</Name><Code>100</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸中部</Name><Code>101</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道太平洋沿岸西部</Name><Code>102</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県日本海沿岸</Name><Code>200</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>津波到達中と推測</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>青森県太平洋沿岸</Name><Code>201</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>岩手県</Name><Code>210</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波警報</Name><Code>51</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight><Revise>更新</Revise></MaxHeight></Item><Item><Area><Name>宮城県</Name><Code>220</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福島県</Name><Code>250</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>茨城県</Name><Code>300</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県九十九里・外房</Name><Code>310</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>千葉県内房</Name><Code>311</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊豆諸島</Name><Code>320</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>小笠原諸島</Name><Code>321</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>相模湾・三浦半島</Name><Code>330</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>静岡県</Name><Code>380</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛知県外海</Name><Code>390</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>伊勢・三河湾</Name><Code>391</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>三重県南部</Name><Code>400</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>和歌山県</Name><Code>530</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>徳島県</Name><Code>580</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>高知県</Name><Code>610</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>長崎県西方</Name><Code>730</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮崎県</Name><Code>760</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県東部</Name><Code>770</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>種子島・屋久島地方</Name><Code>771</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鹿児島県西部</Name><Code>773</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>沖縄本島地方</Name><Code>800</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大東島地方</Name><Code>801</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>宮古島・八重山地方</Name><Code>802</Code></Area><Category><Kind><Name>津波注意報</Name><Code>62</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category><FirstHeight><Condition>第１波の到達を確認</Condition></FirstHeight><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="１ｍ">1</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道日本海沿岸北部</Name><Code>110</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>北海道日本海沿岸南部</Name><Code>111</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>オホーツク海沿岸</Name><Code>120</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>陸奥湾</Name><Code>202</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>秋田県</Name><Code>230</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>山形県</Name><Code>240</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>東京湾内湾</Name><Code>312</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>新潟県上中下越</Name><Code>340</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>佐渡</Name><Code>341</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>富山県</Name><Code>350</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>石川県能登</Name><Code>360</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>石川県加賀</Name><Code>361</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福井県</Name><Code>370</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>京都府</Name><Code>500</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大阪府</Name><Code>510</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>兵庫県北部</Name><Code>520</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>兵庫県瀬戸内海沿岸</Name><Code>521</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>淡路島南部</Name><Code>522</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>鳥取県</Name><Code>540</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>島根県出雲・石見</Name><Code>550</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>隠岐</Name><Code>551</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>岡山県</Name><Code>560</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>広島県</Name><Code>570</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>香川県</Name><Code>590</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛媛県宇和海沿岸</Name><Code>600</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>愛媛県瀬戸内海沿岸</Name><Code>601</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>山口県日本海沿岸</Name><Code>700</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>山口県瀬戸内海沿岸</Name><Code>701</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福岡県瀬戸内海沿岸</Name><Code>710</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>福岡県日本海沿岸</Name><Code>711</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>有明・八代海</Name><Code>712</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>佐賀県北部</Name><Code>720</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>壱岐・対馬</Name><Code>731</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>熊本県天草灘沿岸</Name><Code>740</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大分県瀬戸内海沿岸</Name><Code>750</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item><Item><Area><Name>大分県豊後水道沿岸</Name><Code>751</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category><MaxHeight><jmx_eb:TsunamiHeight type="津波の高さ" unit="m" description="０．２ｍ未満">0.2</jmx_eb:TsunamiHeight></MaxHeight></Item></Forecast></Tsunami><Earthquake><OriginTime>2022-01-15T13:10:00+09:00</OriginTime><ArrivalTime>2022-01-15T13:10:00+09:00</ArrivalTime><Hypocenter><Area><Name>南太平洋</Name><Code type="震央地名">950</Code><jmx_eb:Coordinate description="南緯２０．３度　西経１７５．２度　深さ不明">-20.3-175.2/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ不明">NaN</jmx_eb:Magnitude></Earthquake><Comments><WarningComment codeType="固定付加文"><Text>＜津波注意報＞ 海の中や海岸付近は危険です。 海の中にいる人はただちに海から上がって、海岸から離れてください。 潮の流れが速い状態が続きますので、注意報が解除されるまで海に入ったり海岸に近づいたりしないようにしてください。 　 ＜津波予報（若干の海面変動）＞ 若干の海面変動が予想されますが、被害の心配はありません。 　 場所によっては津波の高さが「予想される津波の高さ」より高くなる可能性があります。</Text><Code>0123 0124 0132</Code></WarningComment><FreeFormComment>［予想される津波の高さの解説］ 予想される津波が高いほど、より甚大な被害が生じます。 １０ｍ超　　巨大な津波が襲い壊滅的な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 １０ｍ　　　巨大な津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　５ｍ　　　津波が襲い甚大な被害が生じる。木造家屋が全壊・流失し、人は津波による流れに巻き込まれる。 　３ｍ　　　標高の低いところでは津波が襲い被害が生じる。木造家屋で浸水被害が発生し、人は津波による流れに巻き込まれる。 　１ｍ　　　海の中では人は速い流れに巻き込まれる。養殖いかだが流失し小型船舶が転覆する。</FreeFormComment>';
      } else if (aaaa == 6) {
        dataTmp =
          '<Report xmlns="http://xml.kishou.go.jp/jmaxml1/" xmlns:jmx="http://xml.kishou.go.jp/jmaxml1/"><Control><Title>津波警報・注意報・予報a</Title><DateTime>2022-01-16T05:00:09Z</DateTime><Status>通常</Status><EditorialOffice>気象庁本庁</EditorialOffice><PublishingOffice>気象庁</PublishingOffice></Control><Head xmlns="http://xml.kishou.go.jp/jmaxml1/informationBasis1/"><Title>津波予報</Title><ReportDateTime>2022-01-16T14:00:00+09:00</ReportDateTime><TargetDateTime>2022-01-16T14:00:00+09:00</TargetDateTime><ValidDateTime>2022-01-17T14:00:00+09:00</ValidDateTime><EventID>20220115131000</EventID><InfoType>発表</InfoType><Serial/><InfoKind>津波警報・注意報・予報</InfoKind><InfoKindVersion>1.0_1</InfoKindVersion><Headline><Text>津波注意報を解除しました。</Text></Headline></Head><Body xmlns="http://xml.kishou.go.jp/jmaxml1/body/seismology1/" xmlns:jmx_eb="http://xml.kishou.go.jp/jmaxml1/elementBasis1/"><Tsunami><Forecast><CodeDefine><Type xpath="Item/Area/Code">津波予報区</Type><Type xpath="Item/Category/Kind/Code">警報等情報要素／津波警報・注意報・予報</Type><Type xpath="Item/Category/LastKind/Code">警報等情報要素／津波警報・注意報・予報</Type></CodeDefine><Item><Area><Name>北海道太平洋沿岸東部</Name><Code>100</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>北海道太平洋沿岸中部</Name><Code>101</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>北海道太平洋沿岸西部</Name><Code>102</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>北海道日本海沿岸北部</Name><Code>110</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>北海道日本海沿岸南部</Name><Code>111</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>オホーツク海沿岸</Name><Code>120</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>青森県日本海沿岸</Name><Code>200</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>青森県太平洋沿岸</Name><Code>201</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>陸奥湾</Name><Code>202</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>岩手県</Name><Code>210</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>宮城県</Name><Code>220</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>秋田県</Name><Code>230</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>山形県</Name><Code>240</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>福島県</Name><Code>250</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>茨城県</Name><Code>300</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>千葉県九十九里・外房</Name><Code>310</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>千葉県内房</Name><Code>311</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>東京湾内湾</Name><Code>312</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>伊豆諸島</Name><Code>320</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>小笠原諸島</Name><Code>321</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>相模湾・三浦半島</Name><Code>330</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>新潟県上中下越</Name><Code>340</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>佐渡</Name><Code>341</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>富山県</Name><Code>350</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>石川県能登</Name><Code>360</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>石川県加賀</Name><Code>361</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>福井県</Name><Code>370</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>静岡県</Name><Code>380</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>愛知県外海</Name><Code>390</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>伊勢・三河湾</Name><Code>391</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>三重県南部</Name><Code>400</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>京都府</Name><Code>500</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>大阪府</Name><Code>510</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>兵庫県北部</Name><Code>520</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>兵庫県瀬戸内海沿岸</Name><Code>521</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>淡路島南部</Name><Code>522</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>和歌山県</Name><Code>530</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>鳥取県</Name><Code>540</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>島根県出雲・石見</Name><Code>550</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>隠岐</Name><Code>551</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>岡山県</Name><Code>560</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>広島県</Name><Code>570</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>徳島県</Name><Code>580</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>香川県</Name><Code>590</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>愛媛県宇和海沿岸</Name><Code>600</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>愛媛県瀬戸内海沿岸</Name><Code>601</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>高知県</Name><Code>610</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>山口県日本海沿岸</Name><Code>700</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>山口県瀬戸内海沿岸</Name><Code>701</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>福岡県瀬戸内海沿岸</Name><Code>710</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>福岡県日本海沿岸</Name><Code>711</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>有明・八代海</Name><Code>712</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>佐賀県北部</Name><Code>720</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>長崎県西方</Name><Code>730</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>壱岐・対馬</Name><Code>731</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>熊本県天草灘沿岸</Name><Code>740</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>大分県瀬戸内海沿岸</Name><Code>750</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>大分県豊後水道沿岸</Name><Code>751</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></Kind><LastKind><Name>津波予報（若干の海面変動）</Name><Code>71</Code></LastKind></Category></Item><Item><Area><Name>宮崎県</Name><Code>760</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>鹿児島県東部</Name><Code>770</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>種子島・屋久島地方</Name><Code>771</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>奄美群島・トカラ列島</Name><Code>772</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>鹿児島県西部</Name><Code>773</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>沖縄本島地方</Name><Code>800</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>大東島地方</Name><Code>801</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item><Item><Area><Name>宮古島・八重山地方</Name><Code>802</Code></Area><Category><Kind><Name>津波予報（若干の海面変動）</Name><Code>72</Code></Kind><LastKind><Name>津波注意報</Name><Code>62</Code></LastKind></Category></Item></Forecast></Tsunami><Earthquake><OriginTime>2022-01-15T13:10:00+09:00</OriginTime><ArrivalTime>2022-01-15T13:10:00+09:00</ArrivalTime><Hypocenter><Area><Name>南太平洋</Name><Code type="震央地名">950</Code><jmx_eb:Coordinate description="南緯２０．３度　西経１７５．２度　深さ不明">-20.3-175.2/</jmx_eb:Coordinate></Area></Hypocenter><jmx_eb:Magnitude type="Mj" condition="不明" description="Ｍ不明">NaN</jmx_eb:Magnitude></Earthquake><Text>［海面変動の見通し］ 　１５日１３時１０分に発生した南太平洋を震源とする地震の津波注意報は、これ以上津波が大きくならないと判断し、１４時００分に全て解除しました。 　これらの沿岸では津波に伴う海面変動が観測されておりますので、今後１日程度は継続する可能性が高いと考えられます。 ［留意事項］ 　津波注意報が発表されていたことや、津波が観測されていることについては、これまでの情報等により十分に認識されていると考えられます。 また、これ以上津波が高くなる可能性は小さくなったと見られます。 今後１日程度は海面変動が継続すると考えられますが、そのことを十分認識した上で行動頂ければ、津波による災害のおそれはないと見られることから津波注意報を解除しました。 　海に入っての作業や釣り、海水浴などに際しては十分な留意が必要です。 </Text><Comments><WarningComment codeType="固定付加文"><Text>＜津波予報（若干の海面変動）＞ 若干の海面変動が予想されますが、被害の心配はありません。 　 今後もしばらく海面変動が続くと思われますので、海水浴や磯釣り等を行う際は注意してください。 　 現在、大津波警報・津波警報・津波注意報を発表している沿岸はありません。</Text><Code>0124 0104 0107</Code></WarningComment></Comments></Body></Report>';
      }

      const parser = new new JSDOM().window.DOMParser();
      const xml = parser.parseFromString(dataTmp, "text/html");
      console.log("atama" + xml.querySelector("Head") + xml.title);
      var title = xml.title;

      if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度情報" || title == "遠地地震に関する情報") {
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
              reportDateTime: new Date(xml.querySelector("ReportDateTime").textContent),
              DetailURL: [url],
            },
          ],
          "jma"
        );
      } else if (/大津波警報|津波警報|津波注意報|津波予報/.test(title)) {
        //津波予報

        if (xml.querySelector("InfoType").textContent == "取消") {
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
                  maxHeightTmp = elm.querySelector("FirstHeight Condition").textContent;
                  maxHeightTmp = firstHeightConditionTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
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

  request.end();
}
setInterval(function () {
  JMAEQInfoFetch("https://www.google.com");
}, 5000);

function TsunamiInfoControl(data) {
  console.log("aaaaaaaaaaaaaaaaaaaa");
  if (tsunamiData) console.log(tsunamiData.issue.time, data.issue.time, tsunamiData.issue.time < data.issue.time);
  if (!tsunamiData || tsunamiData.issue.time < data.issue.time || (tsunamiData.issue.time == data.issue.time && data.source == "jmaXML" && tsunamiData.source == "P2P")) {
    console.log("津波更新");

    tsunamiData = data;
    createWindow();
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: data,
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
    console.log({ 応答速度: "ms", "YE(Yahoo強震モニタEast)": YmoniE, "YE(Yahoo強震モニタWest)": YmoniW, "K(強震モニタ)": Kmoni, "L(長周期地震動モニタ)": Lmoni });
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
  var resTimeTmp;
  while (!yoyuKOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var request = net.request("http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=" + Number(new Date()));
          request.on("response", (res) => {
            var dataTmp = "";
            if (Math.floor(res._responseHead.statusCode / 100) == 2) {
            }
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });

            res.on("end", function () {
              var json = jsonParse(dataTmp);
              if (resTimeTmp !== new Date(json.latest_time) && 0 < loopCount) {
                yoyuKOK = true;
                yoyuK = new Date() - new Date(json.latest_time) + Yoyu;
              }
              resTimeTmp = new Date(json.latest_time);
            });
            setTimeout(resolve, 10);
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
  console.log(yoyuK, yoyuL);
  func();
  return true;
}
async function yoyuSetL(func) {
  var yoyuLOK = false;
  var loopCount2 = 0;
  var resTimeTmp2;
  while (!yoyuLOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var request = net.request("https://smi.lmoniexp.bosai.go.jp/webservice/server/pros/latest.json?___=" + Number(new Date()));
          request.on("response", (res) => {
            var dataTmp = "";
            if (Math.floor(res._responseHead.statusCode / 100) == 2) {
            }
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });

            res.on("end", function () {
              var json = jsonParse(dataTmp);
              if (resTimeTmp2 !== new Date(json.latest_time) && 0 < loopCount2) {
                yoyuLOK = true;
                yoyuL = new Date() - new Date(json.latest_time) + Yoyu;
                console.log("aaabbb", yoyuL, loopCount2, new Date(json.latest_time), new Date() - new Date(json.latest_time));
              }
              resTimeTmp2 = new Date(json.latest_time);
            });
            setTimeout(resolve, 10);
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
  if (isNaN(str)) {
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
