const electron = require("electron");
const { app, BrowserWindow, ipcMain, net, Notification } = electron;
const path = require("path");
const sound = require("sound-play");
const Request = require("request");
let fs;
let config = require("config");

let mainWindow;
var settingWindow;
let kmoniWorker;

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
      settingWindow.loadFile("src/settings.html");
    }
  } else if (response.action == "settingReturn") {
    config = response.data;
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
  mainWindow.setMenuBarVisibility(false);
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
    // replay("2022/11/3 19:04:40"); 深い
    replay("2022/04/19 08:16:10");

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
      is_training: false, //訓練報
      origin_time: new Date(new Date() - Replay - 2000), //発生時刻
      magunitude: 9, //マグニチュード
      report_num: 1, //第n報
      report_id: "20991111111111", //地震ID
      alertflg: "警報", //種別
      condition: "",
      source: "存在しない情報源",
    });*/

    kmoniTimeTmp.forEach(function (elm) {
      mainWindow.webContents.send("message2", {
        action: "kmoniTimeUpdate",
        Updatetime: elm.Updatetime,
        LocalTime: elm.LocalTime,
        type: elm.type,
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
  });

  mainWindow.loadFile("src/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  fs = require("fs");
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
var EEW_new; //最新の速報
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
  } else if (request.action == "Content-script OK") {
    content_script = true;
  }
  //sendResponse({}); // 送り返すものがない場合は空のオブジェクトを送る
  return true;
});

var EEWDetectionTimeout;
function start() {
  setInterval(function () {
    if (monitorVendor == "YE") {
      if (net.online) {
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
      }
    } else if (monitorVendor == "YW") {
      if (net.online) {
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
    } // else if (monitorVendor == "K") {
  }, 1000);
  yoyuSetK(function () {
    setInterval(function () {
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
    }, 1000);
  });
  yoyuSetL(function () {
    setInterval(function () {
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
    }, 1000);
  });

  //} else if (monitorVendor == "L") {

  //
  //
  //
  //
  //WebSocket接続
  P2P_WS();
  nakn_WS();

  setInterval(function () {
    EEW_nowList.forEach(function (elm) {
      if (new Date() - Replay - new Date(dateEncode(3, Number(elm.origin_time), 1)) > 300000) {
        EEWClear(null, elm.report_id, null, true);
      }
    });
  }, 1000);
}

var tsunamiData;
function P2P_WS() {
  var WebSocketClient = require("websocket").client;
  var client = new WebSocketClient();

  client.on("connectFailed", function (error) {
    console.log("WS__connectFailed:", error.toString());
  });

  client.on("connect", function (connection) {
    console.log("WS__conect");

    connection.on("error", function (error) {
      console.log("WS_error", error.toString());
    });
    connection.on("close", function () {
      console.log("WS_close");
      P2P_WS();
    });
    connection.on("message", function (message) {
      if (message.type === "utf8") {
        console.log("WS_message");
        var data = message.utf8Data;
        switch (data.code) {
          case 551:
            //地震情報
            break;
          case 552:
            //津波予報
            tsunamiData = data;
            createWindow();
            if (mainWindow) {
              mainWindow.webContents.send("message2", {
                action: "tsunamiUpdate",
                data: tsunamiData,
              });
            }
            break;
          case 554:
            //	緊急地震速報の発表検出
            /*
            if (EEWNow) {
              if (
                !EEW_nowList.find(function (elm) {
                  return elm.alertflg == "警報";
                })
              ) {
                createWindow();
                if (mainWindow) {
                  mainWindow.webContents.send("message2", {
                    action: "EEW_Detection",
                  });
                }
              }
            } else {
              createWindow();
              if (mainWindow) {
                mainWindow.webContents.send("message2", {
                  action: "EEW_Detection",
                });
              }
            }*/
            break;
          case 556:
            //緊急地震速報（警報）
            EEWdetect(3, data);
            break;

          default:
            break;
        }
        if (data.time) {
          kmoniTimeUpdate(new Date(data.time), "P2P_EEW");
        }
      }
    });
    kmoniTimeUpdate(new Date(), "P2P_EEW");
  });

  client.connect("wss://api.p2pquake.net/v2/ws");
}
function nakn_WS() {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  var WebSocketClient = require("websocket").client;
  var client = new WebSocketClient();

  client.on("connectFailed", function (error) {
    console.log("WS__connectFailed:", error.toString());
  });

  client.on("connect", function (connection) {
    console.log("WS__conect");

    connection.on("error", function (error) {
      console.log("WS_error", error.toString());
    });
    connection.on("close", function () {
      console.log("WS_close");
      nakn_WS();
    });
    connection.on("message", function (message) {
      if (message.type === "utf8") {
        var data = JSON.parse(message.utf8Data);

        console.log("WS_message");

        if (new Date() - origin_timeTmp > 300000) {
          var calcintensityTmp;
          var isFinalTmp;
          var latitudeTmp;
          var longitudeTmp;
          var region_codeTmp;
          var region_nameTmp;
          var origin_timeTmp;
          if (data.intensity) calcintensityTmp = data.intensity;
          if (data.isFinal) isFinalTmp = data.isFinal;
          if (data.hypocenter && data.hypocenter.latitude) latitudeTmp = Number(data.hypocenter.latitude);
          if (data.hypocenter && data.hypocenter.longitude) longitudeTmp = Number(data.hypocenter.longitude);
          if (data.hypocenter && data.hypocenter.code) region_codeTmp = Number(data.hypocenter.code);
          if (data.hypocenter && data.hypocenter.name) region_nameTmp = data.hypocenter.name;
          if (data.originTime) origin_timeTmp = new Date(data.originTime);
          var EEWdata = {
            alertflg: data.alertFlg ? "警報" : "予報", //種別
            report_id: data.eventId, //地震ID
            report_num: data.eventSerial, //第n報
            report_time: new Date(data.reportTime), //発表時刻
            condition: "", //仮定震源要素か
            magunitude: Number(data.magnitude), //マグニチュード
            calcintensity: calcintensityTmp, //最大深度
            depth: Number(data.hypocenter.depth.replace("km", "")), //深さ
            is_cancel: data.isCancel, //キャンセル
            is_final: isFinalTmp, //最終報
            is_training: data.isTraining, //訓練報
            latitude: latitudeTmp, //緯度
            longitude: longitudeTmp, //経度
            region_code: region_codeTmp, //震央地域コード
            region_name: region_nameTmp, //震央地域
            origin_time: origin_timeTmp, //発生時刻
            source: "narikakun",
          };

          EEWcontrol(EEWdata);
        }
      }
    });
    kmoniTimeUpdate(new Date(), "narikakun");
  });

  client.connect("wss://eew.ws.nakn.jp:8080/eew");
}

var lwaveTmp;
function EEWdetect(type, json, KorL) {
  if (!json) return;
  if (type == 1) {
    const request_time = new Date(json.realTimeData.dataTime); //monthは0オリジン

    kmoniTimeUpdate(request_time, "YahooKmoni");

    /*
    if (json.psWave) {
      json.psWave.items.forEach(function (elm) {
        var psDataTmp = {
          report_id: Number(json.hypoInfo.items[0].reportId),
          latitude: elm.latitude,
          longitude: elm.longitude,
          pRadius: elm.pRadius,
          sRadius: elm.sRadius,
        };
        if (JSON.stringify(psDataTmp) !== JSON.stringify(psData)) {
          json.psWave.items.forEach(function (elm) {
            if (mainWindow) {
              mainWindow.webContents.send("message2", {
                action: "PSWaveUpdate",
                data: psDataTmp,
              });
            }
          });
        }
        psData = psDataTmp;
      });
    } else if (psData) {
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "PSWaveClear",
          data: psData.report_id,
        });
      }
      psData = null;
    }*/

    if (json.hypoInfo) {
      //console.log(json.hypoInfo.items);
      EEWNow = true;
      json.hypoInfo.items.forEach(function (elm) {
        var EEWdata = {
          alertflg: "", //種別
          report_id: elm.reportId, //地震ID
          report_num: Number(elm.reportNum), //第n報
          report_time: new Date(json.realTimeData.dataTime), //発表時刻
          condition: "",
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
          source: "YahooKmoni",
        };

        var past_keihou = EEW_Data.find(function (elm2) {
          return elm2.EQ_id == EEWdata.report_id;
        });
        if (past_keihou) {
          past_keihou = past_keihou.data.find(function (elm3) {
            return elm3.alertflg == "警報";
          });
        }
        if ((EEWdata.calcintensity == "00" || EEWdata.calcintensity == "01" || EEWdata.calcintensity == "02" || EEWdata.calcintensity == "03" || EEWdata.calcintensity == "04") && !past_keihou) {
          EEWdata.alertflg = "予報";
        } else {
          EEWdata.alertflg = "警報";
        }

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

    kmoniTimeUpdate(request_time, sourceTmp);

    if (json.result.message == "") {
      EEWNow = true;

      var origin_timeTmp = new Date(json.origin_time.slice(0, 4), json.origin_time.slice(4, 6) - 1, json.origin_time.slice(6, 8), json.origin_time.slice(8, 10), json.origin_time.slice(10, 12), json.origin_time.slice(12, 14));

      var EEWdata = {
        alertflg: json.alertflg, //種別
        report_id: json.report_id, //地震ID
        report_num: Number(json.report_num), //第n報
        report_time: new Date(json.report_time), //発表時刻
        condition: "",
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
    var conditionTmp;
    var region_nameTmp;
    var origin_timeTmp;
    if (json.earthquake) {
      if (latitudeTmp !== 200) latitudeTmp = json.earthquake.hypocenter.latitude;
      if (longitudeTmp !== 200) longitudeTmp = json.earthquake.hypocenter.longitude;
      if (depthTmp !== -1) depthTmp = json.earthquake.hypocenter.depth;
      if (magnitudeTmp !== -1) magnitudeTmp = json.earthquake.hypocenter.magnitude;
      conditionTmp = json.earthquake.condition;
      region_nameTmp = json.earthquake.hypocenter.name;
      origin_timeTmp = new Date(json.earthquake.originTime);
    }
    var EEWdata = {
      alertflg: "警報", //種別
      report_id: json.issue.eventId, //地震ID
      report_num: Number(json.issue.serial), //第n報
      report_time: new Date(json.issue.time), //発表時刻
      condition: conditionTmp, //仮定震源要素か（""もしくは"仮定震源要素"）
      magunitude: magnitudeTmp, //マグニチュード
      calcintensity: shindoConvert(maxIntTmp), //最大震度
      depth: depthTmp, //深さ
      is_cancel: json.canceled, //キャンセル
      is_final: false, //最終報(P2P→不明)
      is_training: json.test, //訓練報
      latitude: latitudeTmp, //緯度
      longitude: longitudeTmp, //経度
      region_code: "", //震央地域コード
      region_name: region_nameTmp, //震央地域
      origin_time: origin_timeTmp, //発生時刻
      areas: null, //地域ごとの情報
      source: "P2P_EEW",
    };

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
    EEWdata.areas = areaTmp;

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

      EEWAlert(data, false);
      EQJSON.data.push(data);
      if (data.is_cancel) {
        EQJSON.canceled = true;
      }
    }
  } else {
    EEWAlert(data, true);

    EEW_Data.push({
      EQ_id: data.report_id,
      canceled: false,
      data: [data],
    });
  }
  /*
  if (EEW_history[EEWdata.source]) {
    EEW_history[EEWdata.source]
      .filter(function (elm) {
        return elm.code !== data.report_id;
      })
      .forEach(function (elm2) {
        EEWClear(EEWdata.source, elm2.code);
      });
  }*/

  /*
  if (!EEW_history[data.source]) EEW_history[data.source] = [];
  EEW_history[data.source].push({ code: data.report_id, reportnum: data.report_num });*/
}
function EEWAlert(data, first) {
  EEW_new = data;
  EEW_nowList = EEW_nowList.filter(function (elm) {
    return elm.report_id !== data.report_id;
  });
  EEW_nowList.push(data);

  if (mainWindow) {
    /*
    if (data.longitude && data.latitude) {
      mainWindow.webContents.send("message2", {
        action: "EpiCenterUpdate",
        data: {
          
        },
      });
    }*/

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

var kmoniTimeTmp = [];
function kmoniTimeUpdate(Updatetime, type) {
  if (mainWindow) {
    mainWindow.webContents.send("message2", {
      action: "kmoniTimeUpdate",
      Updatetime: Updatetime,
      LocalTime: new Date(),
      type: type,
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
