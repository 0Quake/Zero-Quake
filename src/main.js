//リプレイ
var Replay = 0;
/* eslint-disable */
function replay(ReplayDate) {
  if (ReplayDate) {
    Replay = new Date() - new Date(ReplayDate);
  } else {
    Replay = 0;
  }
}
/* eslint-enable */
//replay("2023/6/2 17:6:40");
//replay("2023/4/19 19:23:10");
//replay("2023/4/6 13:10:40");
//replay("2023/04/04 16:11:00"); //２か所同時
//replay("2023/3/27 0:04:25");
//replay("2023/03/11 05:12:30"); //２か所同時
//replay("2020/06/15 02:28:38");//２か所同時

var EEWSectName = { 135: "宗谷支庁北部", 136: "宗谷支庁南部", 125: "上川支庁北部", 126: "上川支庁中部", 127: "上川支庁南部", 130: "留萌支庁中北部", 131: "留萌支庁南部", 139: "北海道利尻礼文", 150: "日高支庁西部", 151: "日高支庁中部", 152: "日高支庁東部", 145: "胆振支庁西部", 146: "胆振支庁中東部", 110: "檜山支庁", 105: "渡島支庁北部", 106: "渡島支庁東部", 107: "渡島支庁西部", 140: "網走支庁網走", 141: "網走支庁北見", 142: "網走支庁紋別", 165: "根室支庁北部", 166: "根室支庁中部", 167: "根室支庁南部", 160: "釧路支庁北部", 161: "釧路支庁中南部", 155: "十勝支庁北部", 156: "十勝支庁中部", 157: "十勝支庁南部", 119: "北海道奥尻島", 120: "空知支庁北部", 121: "空知支庁中部", 122: "空知支庁南部", 100: "石狩支庁北部", 101: "石狩支庁中部", 102: "石狩支庁南部", 115: "後志支庁北部", 116: "後志支庁東部", 117: "後志支庁西部", 200: "青森県津軽北部", 201: "青森県津軽南部", 202: "青森県三八上北", 203: "青森県下北", 230: "秋田県沿岸北部", 231: "秋田県沿岸南部", 232: "秋田県内陸北部", 233: "秋田県内陸南部", 210: "岩手県沿岸北部", 211: "岩手県沿岸南部", 212: "岩手県内陸北部", 213: "岩手県内陸南部", 220: "宮城県北部", 221: "宮城県南部", 222: "宮城県中部", 240: "山形県庄内", 241: "山形県最上", 242: "山形県村山", 243: "山形県置賜", 250: "福島県中通り", 251: "福島県浜通り", 252: "福島県会津", 300: "茨城県北部", 301: "茨城県南部", 310: "栃木県北部", 311: "栃木県南部", 320: "群馬県北部", 321: "群馬県南部", 330: "埼玉県北部", 331: "埼玉県南部", 332: "埼玉県秩父", 350: "東京都２３区", 351: "東京都多摩東部", 352: "東京都多摩西部", 354: "神津島", 355: "伊豆大島", 356: "新島", 357: "三宅島", 358: "八丈島", 359: "小笠原", 340: "千葉県北東部", 341: "千葉県北西部", 342: "千葉県南部", 360: "神奈川県東部", 361: "神奈川県西部", 420: "長野県北部", 421: "長野県中部", 422: "長野県南部", 410: "山梨県東部", 411: "山梨県中・西部", 412: "山梨県東部・富士五湖", 440: "静岡県伊豆", 441: "静岡県東部", 442: "静岡県中部", 443: "静岡県西部", 450: "愛知県東部", 451: "愛知県西部", 430: "岐阜県飛騨", 431: "岐阜県美濃東部", 432: "岐阜県美濃中西部", 460: "三重県北部", 461: "三重県中部", 462: "三重県南部", 370: "新潟県上越", 371: "新潟県中越", 372: "新潟県下越", 375: "新潟県佐渡", 380: "富山県東部", 381: "富山県西部", 390: "石川県能登", 391: "石川県加賀", 400: "福井県嶺北", 401: "福井県嶺南", 500: "滋賀県北部", 501: "滋賀県南部", 510: "京都府北部", 511: "京都府南部", 520: "大阪府北部", 521: "大阪府南部", 530: "兵庫県北部", 531: "兵庫県南東部", 532: "兵庫県南西部", 535: "兵庫県淡路島", 540: "奈良県", 550: "和歌山県北部", 551: "和歌山県南部", 580: "岡山県北部", 581: "岡山県南部", 590: "広島県北部", 591: "広島県南東部", 592: "広島県南西部", 570: "島根県東部", 571: "島根県西部", 575: "島根県隠岐", 560: "鳥取県東部", 562: "鳥取県中部", 563: "鳥取県西部", 600: "徳島県北部", 601: "徳島県南部", 610: "香川県東部", 611: "香川県西部", 620: "愛媛県東予", 621: "愛媛県中予", 622: "愛媛県南予", 630: "高知県東部", 631: "高知県中部", 632: "高知県西部", 700: "山口県北部", 701: "山口県東部", 702: "山口県西部", 710: "福岡県福岡", 711: "福岡県北九州", 712: "福岡県筑豊", 713: "福岡県筑後", 750: "大分県北部", 751: "大分県中部", 752: "大分県南部", 753: "大分県西部", 730: "長崎県北部", 731: "長崎県南西部", 732: "長崎県島原半島", 735: "長崎県対馬", 736: "長崎県壱岐", 737: "長崎県五島", 720: "佐賀県北部", 721: "佐賀県南部", 740: "熊本県阿蘇", 741: "熊本県熊本", 742: "熊本県球磨", 743: "熊本県天草・芦北", 760: "宮崎県北部平野部", 761: "宮崎県北部山沿い", 762: "宮崎県南部平野部", 763: "宮崎県南部山沿い", 770: "鹿児島県薩摩", 771: "鹿児島県大隅", 774: "鹿児島県十島村", 775: "鹿児島県甑島", 776: "鹿児島県種子島", 777: "鹿児島県屋久島", 778: "鹿児島県奄美北部", 779: "鹿児島県奄美南部", 800: "沖縄県本島北部", 801: "沖縄県本島中南部", 802: "沖縄県久米島", 803: "沖縄県大東島", 804: "沖縄県宮古島", 805: "沖縄県石垣島", 806: "沖縄県与那国島", 807: "沖縄県西表島" };

const electron = require("electron");
const workerThreads = require("worker_threads");
const { app, BrowserWindow, ipcMain, net, Notification, shell, dialog, Menu } = electron;
const path = require("path");
const { JSDOM } = require("jsdom");
const Store = require("electron-store");
var WebSocketClient = require("websocket").client;
const store = new Store();
var defaultConfigVal = {
  system: {
    crashReportAutoSend: "yes",
  },
  home: {
    name: "自宅",
    latitude: 35.68,
    longitude: 139.767,
    Section: "東京都２３区",
  },
  Info: {
    EEW: {},
    EQInfo: {
      ItemCount: 15,
    },
    TsunamiInfo: {},
    RealTimeShake: {
      List: {
        ItemCount: 10,
      },
    },
  },
  Source: {
    kmoni: {
      kmoni: {
        GetData: true,
        Interval: 1000,
      },
      lmoni: {
        GetData: true,
        Interval: 1000,
      },
      ymoni: {
        GetData: true,
        Interval: 1000,
      },
    },
    msil: {
      GetData: true,
      Interval: 10000,
    },
    axis: {
      GetData: false,
      AccessToken: "",
    },
    wolfx: {
      GetData: true,
      Interval: 1000,
    },
  },
  notice: {
    voice_parameter: {
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: "",
    },
    voice: {
      EEW: "緊急地震速報です。強い揺れに警戒してください。",
    },
  },
  color: {
    psWave: {
      PwaveColor: "rgb(48, 148, 255)",
      SwaveColor: "rgb(255, 62, 48)",
    },
    Shindo: {
      0: {
        background: "rgb(80, 86, 102)",
        color: "rgb(204, 204, 204)",
      },
      1: {
        background: "rgb(134, 168, 198)",
        color: "rgb(51, 51, 51)",
      },
      2: {
        background: "rgb(56, 120, 193)",
        color: "rgb(255, 255, 255)",
      },
      3: {
        background: "rgb(80, 186, 84)",
        color: "rgb(34, 34, 34)",
      },
      4: {
        background: "rgb(204, 209, 74)",
        color: "rgb(34, 34, 34)",
      },
      7: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
      "5m": {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
      "5p": {
        background: "rgb(255, 91, 22)",
        color: "rgb(0, 0, 0)",
      },
      "6m": {
        background: "rgb(237, 0, 0)",
        color: "rgb(255, 255, 255)",
      },
      "6p": {
        background: "rgb(128, 9, 9)",
        color: "rgb(255, 255, 255)",
      },
      "7p": {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
    },
    Tsunami: {
      TsunamiMajorWarningColor: "rgb(200, 0, 255)",
      TsunamiWarningColor: "rgb(255, 40, 0)",
      TsunamiWatchColor: "rgb(250, 245, 0)",
      TsunamiYohoColor: "rgb(66, 158, 255)",
    },
  },
};
var config = store.get("config", defaultConfigVal);
config = mergeDeeply(defaultConfigVal, config);
store.set("config", config);

let mainWindow, settingWindow, tsunamiWindow, kmoniWorker;
var kmoniActive = false;
var kmoniTimeTmp = [];
var EEW_Data = []; //地震速報リスト
var EEW_nowList = []; //現在発報中リスト
var EEW_history = []; //起動中に発生したリスト

var Yoyu = 250;
var yoyuY = yoyuK = yoyuL = 2500;
var EEWNow = false;

var errorCountk = errorCountl = errorCountyw = errorCountye = 0;

var EQDetect_List = [];

var YmoniE, YmoniW;
var P2P_ConnectData;
var notifications = [];
//var notification_id = 0;
var Kmoni = Lmoni = 20000;
var TestStartTime;
var monitorVendor = "YE";
var jmaXML_Fetched = [],
  nakn_Fetched = [];
var narikakun_URLs = [],
  narikakun_EIDs = [];
var eqInfo = { jma: [], usgs: [] };
var EQInfoFetchIndex = 0;
var tsunamiData;
var lwaveTmp;
var kmoniLastReportTime = 0,
  lmoniLastReportTime = 0,
  YkmoniLastReportTime = 0;
var kmoniTimeout, lmoniTimeout, ymoniTimeout;
var msil_lastTime = 0;
var kmoniEid, kmoniRNum;
var kmoniPointsDataTmp, SnetPointsDataTmp;
let tray;
var RevocationTimer;
var thresholds;

if (app.isPackaged) {
  //メニューバー非表示
  Menu.setApplicationMenu(false);

  //多重起動防止
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.exit(0);
  }
}

//アプリの更新を確認
var update_data;
function checkUpdate() {
  let request = net.request("https://api.github.com/repos/0quake/Zero-Quake/releases?_=" + Number(new Date()));

  request.on("response", (res) => {
    if (!300 <= res._responseHead.statusCode && !res._responseHead.statusCode < 200) {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        var latest_verTmp = String(json[0].tag_name.replace("v", ""));
        var p = require("../package.json");
        var current_verTmp = p.version;
        var latest_v = latest_verTmp.split(".");
        var current_v = current_verTmp.split(".");
        var dl_page = json[0].html_url;
        var update_detail = json[0].body;

        var update_available = false;
        if (latest_v[0] > current_v[0]) {
          update_available = true;
        } else if (latest_v[0] == current_v[0]) {
          if (latest_v[1] > current_v[1]) {
            update_available = true;
          } else if (latest_v[1] == current_v[1]) {
            if (latest_v[2] > current_v[2]) {
              update_available = true;

              var UpdateNotification = new Notification({
                title: "ZeroQuakeで更新が利用可能です",
                body: "v." + current_verTmp + " > v." + latest_verTmp + "更新内容：" + update_detail,
                icon: path.join(__dirname, "img/icon.ico"),
              });
              UpdateNotification.show();
              UpdateNotification.on("click", function () {
                setting_createWindow();
              });
            }
          }
        }

        update_data = { check_error: false, check_date: new Date(), latest_version: latest_verTmp, current_version: current_verTmp, update_available: update_available, dl_page: dl_page, update_detail: update_detail };
        if (settingWindow) {
          settingWindow.webContents.send("message2", {
            action: "Update_Data",
            data: update_data,
          });
        }
      });
    }
  });
  request.on("error", () => {
    var current_verTmp = process.env.npm_package_version;

    update_data = { check_error: true, check_date: new Date(), latest_version: null, current_version: current_verTmp, update_available: null, dl_page: null };
    if (settingWindow) {
      settingWindow.webContents.send("message2", {
        action: "Update_Data",
        data: update_data,
      });
    }
  });

  // リクエストの送信
  request.end();
}

//定期実行
function ScheduledExecution() {
  checkUpdate();

  //axisのアクセストークン確認
  if (config.Source.axis.GetData) {
    var request = net.request("https://axis.prioris.jp/api/token/refresh/?token=" + config.Source.axis.AccessToken);
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        if (json.status == "generate a new token") {
          //トークン更新
          if (json.token) {
            config.Source.axis.AccessToken = String(json.token);
            store.set("config", config);
            Window_notification("Axisのアクセストークンを更新しました。", "info");
          }
        } else if (json.status == "contract has expired") {
          //トークン期限切れ
          config.Source.axis.GetData = false;
          store.set("config", config);
          Window_notification("Axisのアクセストークンの期限が切れました。手動でトークンを更新しください。", "warn");
        } else if (json.status == "invalid header authorization") {
          config.Source.axis.GetData = false;
          store.set("config", config);
          Window_notification("Axisのアクセストークンが不正です。", "error");
        }
      });
    });

    request.end();
  }
  setTimeout(ScheduledExecution, 1800000);
}

//準備完了イベント
app.whenReady().then(() => {
  //ウィンドウ作成
  worker_createWindow();
  kmoniServerSelect();
  createWindow();

  //定期実行着火
  ScheduledExecution();

  app.on("activate", () => {
    // メインウィンドウが消えている場合は再度メインウィンドウを作成する
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  //初期化処理
  start();
});

let options = {
  type: "error",
  title: "エラー",
  message: "予期しないエラーが発生しました",
  detail: "動作を選択してください。\n10秒で自動的に再起動します。",
  buttons: ["今すぐ再起動", "終了", "キャンセル"],
  noLink: true,
};
const options2 = {
  type: "question",
  title: "エラー情報の送信",
  message: "エラー情報を送信しますか",
  detail: "情報は今後のバグ改善に活用します。個人を特定できる情報を送信することはありません。\nご協力をお願いします。",
  buttons: ["送信", "送信しない"],
  checkboxLabel: "選択を記憶",
  noLink: true,
};
const options3 = {
  type: "error",
  title: "エラー",
  message: "エラーログ送信に失敗しました。",
  detail: "",
  buttons: ["OK"],
};
var relaunchTimer;
var errorMsgBox = false;
//エラーイベント
process.on("uncaughtException", function (err) {
  if (!errorMsgBox && app.isReady()) {
    if (String(err.stack).startsWith("Error: net::ERR_")) return false;
    errorMsgBox = true;
    options.detail = "動作を選択してください。\n10秒で自動的に再起動します。\nエラーコードは以下の通りです。\n" + err.stack;

    dialog.showMessageBox(mainWindow, options).then(function (result) {
      if (config.system.crashReportAutoSend == "yes") {
        crashReportSend(err.stack, result);
        errorMsgBox = false;
      } else if (config.system.crashReportAutoSend == "no") {
        errorMsgBox = false;
      } else {
        dialog.showMessageBox(mainWindow, options2).then(function (result2) {
          if (result2.checkboxChecked) {
            config.system.crashReportAutoSend = result2.response == 0 ? "yes" : "no";
            store.set("config", config);
          }
          if (result2.response == 0) {
            crashReportSend(err.stack, result);
            errorMsgBox = false;
          }
        });
      }
    });
    clearTimeout(relaunchTimer);
    relaunchTimer = setTimeout(function () {
      app.relaunch();
      app.exit(0);
    }, 10000);

    Window_notification("予期しないエラーが発生しました。", "error");
  }
});
//エラー処理
function errorResolve(response) {
  switch (response) {
    case 0:
      app.relaunch();
      app.exit(0);
      break;
    case 1:
      app.exit(0);
      break;
    case 2:
      clearTimeout(relaunchTimer);
      break;
    default:
      break;
  }
}
//クラッシュレポートの送信
function crashReportSend(errMsg, result) {
  let request = net.request({
    url: "https://zeroquake.wwww.jp/crashReport/?errorMsg=" + encodeURI(errMsg) + "&soft_version=" + encodeURI(process.env.npm_package_version),
  });

  request.on("error", () => {
    dialog.showMessageBox(mainWindow, options3).then(function () {
      errorResolve(result.response);
    });
  });
  request.on("response", (res) => {
    if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
      dialog.showMessageBox(mainWindow, options3).then(function () {
        errorResolve(result.response);
      });
    } else {
      errorResolve(result.response);
    }
  });
  // リクエストの送信
  request.end();
}

//アプリのロード完了イベント
electron.app.on("ready", () => {
  //タスクトレイアイコン
  tray = new electron.Tray(`${__dirname}/img/icon.${process.platform === "win32" ? "ico" : "png"}`);
  tray.setToolTip("Zero Quake");
  tray.setContextMenu(
    electron.Menu.buildFromTemplate([
      {
        label: "画面の表示",
        click: () => {
          createWindow();
        },
      },
      {
        label: "設定画面標準",
        click: () => {
          setting_createWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "終了",
        click: () => {
          app.exit(0);
        },
      },
    ])
  );
  tray.on("double-click", function () {
    createWindow();
  });
});

//レンダラープロセスからのメッセージ
ipcMain.on("message", (_event, response) => {
  if (response.action == "kmoniReturn") {
    kmoniControl(response.data, response.date);
  } else if (response.action == "SnetReturn") {
    SnetControl(response.data, response.date);
  } else if (response.action == "kmoniEstShindoReturn") {
    estShindoControl(response);
  } else if (response.action == "settingWindowOpen") {
    setting_createWindow();
  } else if (response.action == "TsunamiWindowOpen") {
    tsunami_createWindow();
  } else if (response.action == "EQInfoWindowOpen") {
    EQInfo_createWindow(response);
  } else if (response.action == "settingReturn") {
    config = response.data;
    store.set("config", config);

    settingWindow.webContents.send("message2", {
      action: "setting",
      data: { config: config, softVersion: process.env.npm_package_version },
    });
  } else if (response.action == "checkForUpdate") {
    checkUpdate();
  } else if (response.action == "tsunamiReqest") {
    if (tsunamiData) {
      mainWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: tsunamiData,
      });
    }
  } else if (response.action == "mapLoaded") {
    if (kmoniPointsDataTmp) {
      mainWindow.webContents.send("message2", kmoniPointsDataTmp);
    }
    if (SnetPointsDataTmp) {
      mainWindow.webContents.send("message2", SnetPointsDataTmp);
    }
    if (P2P_ConnectData) {
      mainWindow.webContents.send("message2", P2P_ConnectData);
    }
  }
});

//メインウィンドウ表示処理
function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isFocused()) mainWindow.focus();
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  } else {
    mainWindow = new BrowserWindow({
      minWidth: 450,
      minHeight: 300,
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "Zero Quake",
        icon: path.join(__dirname, "img/icon.ico"),
        backgroundThrottling: false,
      },
      backgroundColor: "#202227",
    });
    if (Replay !== 0) {
      mainWindow.webContents.send("message2", {
        action: "Replay",
        data: Replay,
      });
    }

    mainWindow.webContents.on("did-finish-load", () => {
      if (notifyData) {
        mainWindow.webContents.send("message2", notifyData);
      }

      if (Replay !== 0) {
        mainWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }

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
        if (estShindoTmp) {
          mainWindow.webContents.send("message2", estShindoTmp);
        }
      }

      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: "jma",
        data: eqInfo.jma.slice(0, config.Info.EQInfo.ItemCount),
      });

      if (notifications.length > 0) {
        mainWindow.webContents.send("message2", {
          action: "notification_Update",
          data: notifications,
        });
      }
      var threshold01Tmp;
      EQDetect_List.forEach(function (elm) {
        if (elm.isCity) {
          threshold01Tmp = thresholds.threshold01C;
        } else {
          threshold01Tmp = thresholds.threshold01;
        }

        if (elm.Codes.length >= threshold01Tmp) {
          mainWindow.webContents.send("message2", {
            action: "EQDetect",
            data: elm,
          });
        }
      });

      if (P2P_ConnectData) {
        mainWindow.webContents.send("message2", P2P_ConnectData);
      }

      if (kmoniPointsDataTmp) {
        mainWindow.webContents.send("message2", kmoniPointsDataTmp);
      }
      if (SnetPointsDataTmp) {
        mainWindow.webContents.send("message2", SnetPointsDataTmp);
      }
      if (Replay !== 0) {
        mainWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }
    });

    mainWindow.loadFile("src/index.html");

    mainWindow.on("close", (event) => {
      event.preventDefault();
      mainWindow.hide();
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
}
//ワーカーウィンドウ表示処理
function worker_createWindow() {
  if (kmoniWorker) {
    kmoniWorker.close();
  }
  kmoniWorker = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
    },
    backgroundThrottling: false,
    show: false,
  });
  kmoniWorker.on("close", () => {
    kmoniWorker = null;
  });
  kmoniWorker.webContents.on("did-finish-load", () => {
    kmoniWorker.webContents.send("message2", {
      action: "setting",
      data: config,
    });
  });
  kmoniWorker.loadFile("src/kmoniWorker.html");
  kmoniActive = new Date();
}
//ワーカーウィンドウ表示処理
function setting_createWindow() {
  if (settingWindow) {
    if (settingWindow.isMinimized()) settingWindow.restore();
    if (!settingWindow.isFocused()) settingWindow.focus();
    return false;
  }

  settingWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "設定 - Zero Quake",
      parent: mainWindow,
      center: true,
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#202227",
  });
  settingWindow.webContents.on("did-finish-load", () => {
    settingWindow.webContents.send("message2", {
      action: "setting",
      data: { config: config, softVersion: process.env.npm_package_version },
    });
    if (update_data) {
      settingWindow.webContents.send("message2", {
        action: "Update_Data",
        data: update_data,
      });
    }
  });
  settingWindow.on("closed", () => {
    settingWindow = null;
  });

  settingWindow.loadFile("src/settings.html");
  const handleUrlOpen = (e, url) => {
    if (url.match(/^http/)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };
  settingWindow.webContents.on("will-navigate", handleUrlOpen);
  settingWindow.webContents.on("new-window", handleUrlOpen);
}
//津波情報ウィンドウ表示処理
function tsunami_createWindow() {
  if (tsunamiWindow) {
    if (tsunamiWindow.isMinimized()) tsunamiWindow.restore();
    if (!tsunamiWindow.isFocused()) tsunamiWindow.focus();
    return false;
  }
  tsunamiWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "津波詳細情報 - Zero Quake",
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#202227",
  });

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
}
//地震情報ウィンドウ表示処理
function EQInfo_createWindow(response) {
  var EQInfoWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "地震詳細情報 - Zero Quake",
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#202227",
  });

  EQInfoWindow.webContents.on("did-finish-load", () => {
    EQInfoWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });
    var EEWDataItem = EEW_Data.find(function (elm) {
      return elm.EQ_id == response.eid;
    });

    EQInfoWindow.webContents.send("message2", {
      action: "metaData",
      eid: response.eid,
      urls: response.urls,
      eew: EEWDataItem,
    });
  });

  EQInfoWindow.loadFile(response.url);
  const handleUrlOpen = (e, url) => {
    if (url.match(/^http/)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };
  EQInfoWindow.webContents.on("will-navigate", handleUrlOpen);
  EQInfoWindow.webContents.on("new-window", handleUrlOpen);
}

//開始処理
function start() {
  //↓接続処理
  P2P_WS();
  AXIS_WS();

  SnetRequest();

  kmoniRequest();
  wolfxRequest();
  lmoniRequest();
  ymoniRequest();
  yoyuSetK(function () {
    kmoniRequest();
  });
  yoyuSetY(function () {
    ymoniRequest();
  });
  yoyuSetL(function () {
    lmoniRequest();
  });
  //↑接続処理

  //地震情報
  eqInfoUpdate();

  //定期実行発火
  RegularExecution();
}

const worker = new workerThreads.Worker(path.join(__dirname, "js/EQDetectWorker.js"), {
  workerData: "From Main", // Worker に初期値を渡せる
});
worker.on("message", (message) => {
  switch (message.action) {
    case "EQDetectAdd":
      var EQD_ItemTmp = message.data;

      if (EQD_ItemTmp.maxPGA > 1.3) {
        var LvTmp = 2;
      } else {
        var LvTmp = 1;
      }

      if (EQD_ItemTmp.showed) {
        if (LvTmp == 2) {
          if (EQD_ItemTmp.Lv == 1) soundPlay("EQDetectLv2");
        }
      } else {
        if (LvTmp == 2) {
          soundPlay("EQDetectLv2");
        } else {
          soundPlay("EQDetectLv1");
        }
        createWindow();
      }
      EQD_ItemTmp.Lv = LvTmp;
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EQDetect",
          data: message.data,
        });
      }

      break;
    case "sendDataToMainWindow":
      if (mainWindow) {
        mainWindow.webContents.send("message2", message.data);
      }
      break;
    case "sendDataToKmoniWorker":
      if (kmoniWorker) {
        kmoniWorker.webContents.send("message2", message.data);
      }
      break;
    case "EQDetect_List_Update":
      EQDetect_List = message.data;
      break;
    case "thresholds":
      thresholds = message.data;
      break;
    case "PointsData_Update":
      kmoniPointsDataTmp = {
        action: "kmoniUpdate",
        Updatetime: new Date(message.date),
        LocalTime: new Date(),
        data: message,
      };
      if (mainWindow) {
        mainWindow.webContents.send("message2", kmoniPointsDataTmp);
      }
      break;

    default:
      break;
  }
});
worker.on("error", (error) => {
  throw new Error("地震検知ワーカーでエラー発生:\n" + error);
});

//強震モニタリアルタイム揺れ情報処理（地震検知など）
function kmoniControl(data, date) {
  kmoniActive = new Date();

  worker.postMessage({ action: "EEWDetect", data: data, date: date });
}

//海しるリアルタイム揺れ情報処理
function SnetControl(data, date) {
  SnetPointsDataTmp = {
    action: "SnetUpdate",
    Updatetime: new Date(date),
    LocalTime: new Date(),
    data: { data: data, changedData: data },
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", SnetPointsDataTmp);
  }
}

var estShindoTmp;
var estShindoTmp;
//強震モニタ予想震度処理
function estShindoControl(response) {
  if (!estShindoTmp || estShindoTmp.eid !== response.eid || estShindoTmp.serial !== response.serial) {
    estShindoTmp = {
      action: "EstShindoUpdate",
      data: response.data,
      //date: response.date,
      eid: response.eid,
      serial: response.serial,
      //nodata: response.nodata,
    };
    if (mainWindow) {
      mainWindow.webContents.send("message2", estShindoTmp);
    }
  }
}

var kmoniEstShindoData;
//強震モニタへのHTTPリクエスト
function kmoniRequest() {
  if (net.online && config.Source.kmoni.kmoni.GetData) {
    var ReqTime = new Date() - yoyuK - Replay;

    var request = net.request("http://www.kmoni.bosai.go.jp/webservice/hypo/eew/" + dateEncode(1, ReqTime) + ".json");
    request.on("response", (res) => {
      var dataTmp = "";
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        errorCountk++;
        if (errorCountk > 3) {
          kmoniServerSelect();
          errorCountk = 0;
        }
        NetworkError(res._responseHead.statusCode, "強震モニタ");
        kmoniTimeUpdate(new Date(), "kmoni", "Error");
      } else {
        errorCountk = 0;
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          var json = jsonParse(dataTmp);
          if (json) {
            EEWdetect(2, json, 1);
          }
        });
      }
    });
    request.on("error", (error) => {
      NetworkError(error, "強震モニタ");
      kmoniTimeUpdate(new Date(), "kmoni", "Error");
    });

    request.end();

    var request = net.request("http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/acmap_s/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".acmap_s.gif");
    request.on("response", (res) => {
      var dataTmp = [];
      res.on("data", (chunk) => {
        dataTmp.push(chunk);
      });
      res.on("end", () => {
        var bufTmp = Buffer.concat(dataTmp);
        if (kmoniWorker) {
          kmoniWorker.webContents.send("message2", {
            action: "KmoniImgUpdate",
            data: "data:image/gif;base64," + bufTmp.toString("base64"),
            date: ReqTime,
          });
        }
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "強震モニタ(画像)");
    });
    request.end();

    if (kmoniEid) {
      var request = net.request("http://www.kmoni.bosai.go.jp/data/map_img/EstShindoImg/eew/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".eew.gif");
      request.on("response", (res) => {
        var dataTmp = [];
        res.on("data", (chunk) => {
          dataTmp.push(chunk);
        });
        res.on("end", () => {
          var bufTmp = Buffer.concat(dataTmp);
          if (kmoniWorker) {
            var kmoniEstShindoDataTmp = "data:image/gif;base64," + bufTmp.toString("base64");
            if (kmoniEstShindoDataTmp !== kmoniEstShindoData) {
              kmoniEstShindoData = kmoniEstShindoDataTmp;
              kmoniWorker.webContents.send("message2", {
                action: "KmoniEstShindoImgUpdate",
                data: kmoniEstShindoData,
                eid: kmoniEid,
                serial: kmoniRNum,
                date: ReqTime,
              });
            }
          }
        });
      });
      request.on("error", (error) => {
        NetworkError(error, "強震モニタ(画像)");
      });
      request.end();
    }
  }
  if (kmoniTimeout) clearTimeout(kmoniTimeout);
  kmoniTimeout = setTimeout(kmoniRequest, config.Source.kmoni.kmoni.Interval);
}

//長周期地震動モニタへのHTTPリクエスト
function lmoniRequest() {
  if (net.online && config.Source.kmoni.lmoni.GetData) {
    var request = net.request("https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/" + dateEncode(1, new Date() - yoyuL - Replay) + ".json");
    request.on("response", (res) => {
      var dataTmp = "";
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        errorCountl++;
        if (errorCountl > 3) {
          kmoniServerSelect();
          errorCountl = 0;
        }
        NetworkError(res._responseHead.statusCode, "長周期地震動モニタ");
        kmoniTimeUpdate(new Date(), "Lmoni", "Error");
      } else {
        errorCountl = 0;
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          var json = jsonParse(dataTmp);
          if (json) EEWdetect(2, json, 2);
        });
      }
    });
    request.on("error", (error) => {
      NetworkError(error, "長周期地震動モニタ");
      kmoniTimeUpdate(new Date(), "Lmoni", "Error");
    });

    request.end();
  }
  if (lmoniTimeout) clearTimeout(lmoniTimeout);
  lmoniTimeout = setTimeout(lmoniRequest, config.Source.kmoni.lmoni.Interval);
}

//Yahoo強震モニタへのHTTPリクエスト処理
function ymoniRequest() {
  if (net.online && config.Source.kmoni.ymoni.GetData) {
    if (monitorVendor == "YE") {
      var request = net.request("https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        var dataTmp = "";
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          errorCountye++;
          if (errorCountye > 3) {
            kmoniServerSelect();
            errorCountye = 0;
          }
          NetworkError(res._responseHead.statusCode, "Yahoo強震モニタ(East)");

          kmoniTimeUpdate(new Date(), "YahooKmoni", "Error", "East");
        } else {
          errorCountye = 0;
          res.on("data", (chunk) => {
            dataTmp += chunk;
          });

          res.on("end", function () {
            var json = jsonParse(dataTmp);
            if (json) EEWdetect(1, json);
          });
        }
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
          errorCountyw++;
          if (errorCountyw > 3) {
            kmoniServerSelect();
            errorCountyw = 0;
          }
          NetworkError(res._responseHead.statusCode, "Yahoo強震モニタ(West)");
          kmoniTimeUpdate(new Date(), "YahooKmoni", "Error", "West");
        } else {
          errorCountyw = 0;
          res.on("data", (chunk) => {
            dataTmp += chunk;
          });
          res.on("end", function () {
            var json = jsonParse(dataTmp);
            if (json) EEWdetect(1, json);
          });
        }
      });
      request.on("error", (error) => {
        NetworkError(error, "Yahoo強震モニタ(West)");
        kmoniTimeUpdate(new Date(), "YahooKmoni", "Error", "West");
      });

      request.end();
    }
  }

  if (ymoniTimeout) clearTimeout(ymoniTimeout);
  ymoniTimeout = setTimeout(ymoniRequest, config.Source.kmoni.ymoni.Interval);
}

//海しるへのHTTPリクエスト処理
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
        if (!json || !json.features || !Array.isArray(json.features)) return false;
        var dateTime = 0;
        var NowDateTime = Number(new Date() - Replay);
        json.features.forEach(function (elm) {
          if (NowDateTime - dateTime > NowDateTime - elm.attributes.msilstarttime && NowDateTime >= elm.attributes.msilstarttime) {
            dateTime = Number(elm.attributes.msilstarttime);
          }
        });
        if (msil_lastTime < dateTime) {
          var request = net.request("https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer//exportImage?f=image&time=" + dateTime + "%2C" + dateTime + "&bbox=13409547.546603577%2C2713376.239114911%2C16907305.960932314%2C5966536.162931148&size=400%2C400");
          request.on("response", (res) => {
            var dataTmp = [];
            res.on("data", (chunk) => {
              dataTmp.push(chunk);
            });
            res.on("end", () => {
              var bufTmp = Buffer.concat(dataTmp);
              if (kmoniWorker) {
                var ReqTime = new Date(dateTime);
                kmoniWorker.webContents.send("message2", {
                  action: "SnetImgUpdate",
                  data: "data:image/png;base64," + bufTmp.toString("base64"),
                  date: ReqTime,
                });
              }
            });
          });
          request.on("error", (error) => {
            NetworkError(error, "海しる");
          });
          request.end();

          msil_lastTime = dateTime;
        }
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "海しる");
      kmoniTimeUpdate(new Date(), "Lmoni", "Error");
    });

    request.end();
  }
  setTimeout(function () {
    SnetRequest();
  }, config.Source.msil.Interval);
}

//wolfxへのHTTPリクエスト処理
var wolfx_lastUpdate = 0;
function wolfxRequest() {
  if (config.Source.wolfx.GetData && net.online) {
    var request = net.request("https://api.wolfx.jp/jma_eew.json?_=" + new Date());
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        if (wolfx_lastUpdate < new Date(json.AnnouncedTime)) {
          wolfx_lastUpdate = json.AnnouncedTime;
          var EBIData = [];
          EBIStr = json.OriginalText.split("EBI ")[1];
          if (EBIStr) {
            EBIStr = EBIStr.split("ECI")[0].split("EII")[0].split(" 9999=")[0];
            EBIStr = EBIStr.split(" ");
            if (EBIStr.length % 4 == 0) {
              for (let i = 0; i < EBIStr.length; i += 4) {
                var sectName = EEWSectName[EBIStr[i]];
                var maxInt = EBIStr[i + 1].substring(1, 3);
                var minInt = EBIStr[i + 1].substring(3, 5);
                minInt = minInt == "//" ? null : shindoConvert(minInt, 0);
                var arrivalTime = EBIStr[i + 2];
                arrivalTime = arrivalTime.substring(0, 2) + ":" + arrivalTime.substring(2, 4) + ":" + arrivalTime.substring(4, 6);
                arrivalTime = new Date(dateEncode(4, null) + " " + arrivalTime);

                var alertFlg = EBIStr[i + 3].substring(0, 1) == "1";
                var arrived = EBIStr[i + 3].substring(1, 2) == "1";

                EBIData.push({
                  Code: Number(EBIStr[i]),
                  Name: sectName,
                  Alert: alertFlg,
                  IntTo: maxInt,
                  IntFrom: minInt,
                  ArrivalTime: arrivalTime,
                  Arrived: arrived,
                });
              }
            } else throw new Error("予想震度等のでコードでエラー");
          }
          var EEWdata = {
            alertflg: json.isWarn ? "警報" : "予報",
            EventID: Number(json.EventID),
            serial: json.Serial,
            report_time: new Date(json.AnnouncedTime),
            magnitude: json.Magunitude,
            maxInt: shindoConvert(json.MaxIntensity, 0),
            depth: json.Depth,
            is_cancel: json.isCancel,
            is_final: json.isFinal,
            is_training: json.isTraining,
            latitude: json.Latitude,
            longitude: json.Longitude,
            region_code: null,
            region_name: json.Hypocenter,
            origin_time: new Date(json.OriginTime),
            isPlum: json.isAssumption,
            userIntensity: null,
            arrivalTime: null,
            intensityAreas: null,
            warnZones: EBIData,
            source: "wolfx",
          };
          EEWcontrol(EEWdata);
        }
        kmoniTimeUpdate(new Date(), "wolfx", "success");
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "wolfx");
      kmoniTimeUpdate(new Date(), "wolfx", "Error");
    });

    request.end();
  }
  setTimeout(function () {
    wolfxRequest();
  }, config.Source.wolfx.Interval);
}

//P2P地震情報API WebSocket接続・受信処理
var P2PWSclient;

function P2P_WS() {
  P2PWSclient = new WebSocketClient();

  P2PWSclient.on("connectFailed", function () {
    kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
    setTimeout(P2P_WS_TryConnect, 5000);
  });

  P2PWSclient.on("connect", function (connection) {
    connection.on("error", function () {
      kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Disconnect");
      setTimeout(P2P_WS_TryConnect, 5000);
    });
    connection.on("message", function (message) {
      if (message.type === "utf8") {
        var data = message.utf8Data;
        switch (data.code) {
          case 551:
            eqInfoUpdate(true);
            setTimeout(function () {
              eqInfoUpdate(true);
            }, 3000);
            //地震情報
            break;
          case 552:
            //津波情報
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
            EEWdetect(4, data);
            break;
          default:
            return false;
        }
        if (data.time) {
          kmoniTimeUpdate(new Date(data.time), "P2P_EEW", "success");
        }
      }
    });
    kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "success");
  });

  P2P_WS_Connect();
}
var P2PReconnectTimeout = 500;
function P2P_WS_TryConnect() {
  P2PReconnectTimeout *= 2;
  setTimeout(P2P_WS_Connect, P2PReconnectTimeout);
}
function P2P_WS_Connect() {
  if (P2PWSclient) P2PWSclient.connect("wss://api.p2pquake.net/v2/ws");
}

//AXIS WebSocket接続・受信処理
var AXISWSclient;
const AXIS_headers = {
  Authorization: `Bearer ${config.Source.axis.AccessToken}`,
};
function AXIS_WS() {
  if (!config.Source.axis.GetData) return;
  AXISWSclient = new WebSocketClient();

  AXISWSclient.on("connectFailed", function () {
    kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
    AXIS_WS_TryConnect();
  });

  AXISWSclient.on("connect", function (connection) {
    connection.on("error", function () {
      kmoniTimeUpdate(new Date(), "axis", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date(), "axis", "Disconnect");
      AXIS_WS_TryConnect();
    });
    connection.on("message", function (message) {
      var dataStr = message.utf8Data;
      kmoniTimeUpdate(new Date(), "axis", "success");

      if (dataStr == "hello") return;
      console.log(dataStr);

      var data = JSON.parse(dataStr);
      if (data.channel == "eew") {
        //eew
        EEWdetect(3, data.message);
      } else if (data.channel == "jmx-seismology") {
        //地震情報
        var EarthquakeElm = {
          Hypocenter: { Area: { Name: null } },
          Magnitude: null,
        };
        if (data.message.Body.Earthquake[0]) EarthquakeElm = data.message.Body.Earthquake[0];
        var IntensityElm = {
          Observation: { MaxInt: null },
        };
        if (data.message.Body.Intensity) IntensityElm = data.message.Body.Intensity;

        eqInfoControl(
          [
            {
              eventId: data.message.Head.EventID,
              category: data.message.Head.Title,
              reportDateTime: data.message.Head.ReportDateTime,
              OriginTime: data.message.Head.TargetDateTime,
              epiCenter: EarthquakeElm.Hypocenter.Area.Name,
              M: EarthquakeElm.Magnitude,
              maxI: IntensityElm.Observation.MaxInt,
              cancel: null,
              DetailURL: [],
            },
          ],
          "jma"
        );
      }
    });
    kmoniTimeUpdate(new Date(), "axis", "success");
  });

  AXIS_WS_Connect();
}
var lastConnectDate = new Date();
function AXIS_WS_TryConnect() {
  var timeoutTmp = Math.max(30000 - (new Date() - lastConnectDate), 100);
  setTimeout(AXIS_WS_Connect, timeoutTmp);
}
function AXIS_WS_Connect() {
  if (AXISWSclient) AXISWSclient.connect("wss://ws.axis.prioris.jp/socket", null, null, AXIS_headers);
  lastConnectDate = new Date();
}

//定期実行
function RegularExecution() {
  //EEW解除
  EEW_nowList.forEach(function (elm) {
    if (new Date() - Replay - new Date(dateEncode(3, Number(elm.origin_time), 1)) > 300000) {
      EEWClear(null, elm.EventID, null, true);
    }
  });

  //kmoniWorker監視
  if (new Date() - kmoniActive > 5000) {
    worker_createWindow();
  }

  setTimeout(RegularExecution, 1000);
}

//Yahoo強震モニタのサーバーを選択
async function kmoniServerSelect() {
  await new Promise((resolve) => {
    TestStartTime = new Date();
    if (net.online) {
      var request = net.request("https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          YmoniE = 25000;
        } else {
          YmoniE = new Date() - TestStartTime;
        }

        if (YmoniE && YmoniW) {
          var minTime = Math.min(YmoniE, YmoniW, Kmoni, Lmoni);

          if (minTime == Infinity || minTime == YmoniE) {
            monitorVendor = "YE";
          } else if (minTime == Infinity || minTime == YmoniW) {
            monitorVendor = "YW";
          }
          resolve();
        }
      });

      request.end();
      var request = net.request("https://weather-kyoshin.west.edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, new Date() - yoyuY - Replay) + "/" + dateEncode(1, new Date() - yoyuY - Replay) + ".json");
      request.on("response", (res) => {
        res.on("end", function () {
          if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
            YmoniW = 2500;
          } else {
            YmoniW = new Date() - TestStartTime;
          }
          if (YmoniE && YmoniW) {
            var minTime = Math.min(YmoniE, YmoniW, Kmoni, Lmoni);

            if (minTime == Infinity || minTime == YmoniE) {
              monitorVendor = "YE";
            } else if (minTime == Infinity || minTime == YmoniW) {
              monitorVendor = "YW";
            }
            resolve();
          }
        });
      });
      request.on("error", (error) => {
        NetworkError(error, "Yahoo強震モニタ(West)");
      });

      request.end();
    }
  });
}

//Yahoo強震モニタの取得オフセット設定
async function yoyuSetY(func) {
  var yoyuYOK = false;
  var loopCount = 0;
  var ReqTimeTmp2 = new Date();
  if (net.online) {
    while (!yoyuYOK) {
      await new Promise((resolve) => {
        var urlTmp;
        if (monitorVendor == "YW") urlTmp = "west";
        else urlTmp = "east";
        var request = net.request("https://weather-kyoshin." + urlTmp + ".edge.storage-yahoo.jp/RealTimeData/" + dateEncode(2, ReqTimeTmp2 - Replay) + "/" + dateEncode(1, ReqTimeTmp2 - Replay) + ".json");
        request.on("response", (res) => {
          if (!(300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200)) {
            yoyuY = new Date() - ReqTimeTmp2 + Yoyu;
            yoyuYOK = true;
          }
          resolve();
        });
        request.end();
      });
      if (loopCount > 25) {
        yoyuY = 2500 + Yoyu;
        break;
      }
      loopCount++;
    }
  }
  return func();
}

//強震モニタの取得オフセット設定
async function yoyuSetK(func) {
  var yoyuKOK = false;
  var loopCount = 0;
  var resTimeTmp;
  while (!yoyuKOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var dataTmp = "";
          var request = net.request("http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=" + Number(new Date()));
          request.on("response", (res) => {
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });
            res.on("end", function () {
              var json = jsonParse(dataTmp);
              if (json) {
                var resTime = new Date(json.latest_time);

                if (resTimeTmp !== resTime && 0 < loopCount) {
                  yoyuKOK = true;
                  yoyuK = new Date() - resTime;
                }
                resTimeTmp = resTime;
              }
              resolve();
            });
          });

          request.end();
        }
      } catch (err) {
        return;
      }
    });
    if (loopCount > 25) {
      yoyuK = 2500;
      break;
    }

    loopCount++;
  }
  func();
  return true;
}

//長周期地震動モニタの取得オフセット設定
async function yoyuSetL(func) {
  var yoyuLOK = false;
  var loopCount = 0;
  var resTimeTmp;
  while (!yoyuLOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var dataTmp = "";
          var request = net.request("https://smi.lmoniexp.bosai.go.jp/webservice/server/pros/latest.json?_" + Number(new Date()));
          request.on("response", (res) => {
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });
            res.on("end", function () {
              var json = JSON.parse(dataTmp);
              var resTime = new Date(json.latest_time);

              if (resTimeTmp !== resTime && 0 < loopCount) {
                yoyuLOK = true;
                yoyuL = new Date() - resTime;
              }
              resTimeTmp = resTime;
              resolve();
            });
          });

          request.end();
        }
      } catch (err) {
        return;
      }
    });
    if (loopCount > 25) {
      yoyuL = 2500 + Yoyu;
      break;
    }

    loopCount++;
  }

  func();
  return true;
}

//情報最終更新時刻を更新
function kmoniTimeUpdate(Updatetime, type, condition, vendor) {
  var sendData = {
    action: "kmoniTimeUpdate",
    Updatetime: Updatetime,
    LocalTime: new Date(),
    vendor: vendor,
    type: type,
    condition: condition,
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", sendData);
  }

  if (type == "P2P_EEW") {
    P2P_ConnectData = sendData;
  }
  var kmoniTimeTmpElm = kmoniTimeTmp.find(function (elm) {
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

//情報フォーマット変更・新報検知→EEWcontrol
function EEWdetect(type, json, KorL) {
  if (!json) return;
  if (type == 1) {
    //yahookmoni
    const request_time = new Date(json.realTimeData.dataTime);

    kmoniTimeUpdate(request_time, "YahooKmoni", "success", monitorVendor);

    if (json.hypoInfo) {
      var elm;
      elm = json.hypoInfo.items[0];

      var YkmoniLastReportTimeTmp = new Date(elm.reportTime);
      if (YkmoniLastReportTime < YkmoniLastReportTimeTmp) {
        var EEWdata = {
          alertflg: null,
          EventID: Number(elm.reportId),
          serial: Number(elm.reportNum),
          report_time: new Date(json.realTimeData.dataTime),
          magnitude: Number(elm.magnitude),
          maxInt: shindoConvert(elm.calcintensity, 0), //最大深度
          depth: Number(elm.depth.replace("km", "")),
          is_cancel: Boolean2(elm.isCancel),
          is_final: Boolean2(elm.isFinal), //最終報
          is_training: Boolean2(elm.isTraining),
          latitude: LatLngConvert(elm.latitude),
          longitude: LatLngConvert(elm.longitude),
          region_code: elm.regionCode,
          region_name: elm.regionName,
          origin_time: new Date(elm.originTime),
          isPlum: false,
          userIntensity: null,
          arrivalTime: null,
          intensityAreas: null,
          warnZones: [],
          source: "YahooKmoni",
        };

        EEWcontrol(EEWdata);
        YkmoniLastReportTime = YkmoniLastReportTimeTmp;
      }
    }
  } else if (type == 2) {
    //kmoni/lmoni
    var year = parseInt(json.request_time.substring(0, 4));
    var month = parseInt(json.request_time.substring(4, 6));
    var day = parseInt(json.request_time.substring(6, 8));
    var hour = parseInt(json.request_time.substring(8, 10));
    var min = parseInt(json.request_time.substring(10, 12));
    var sec = parseInt(json.request_time.substring(12, 15));
    var request_time = new Date(year, month - 1, day, hour, min, sec);

    var year = parseInt(json.origin_time.substring(0, 4));
    var month = parseInt(json.origin_time.substring(4, 6));
    var day = parseInt(json.origin_time.substring(6, 8));
    var hour = parseInt(json.origin_time.substring(8, 10));
    var min = parseInt(json.origin_time.substring(10, 12));
    var sec = parseInt(json.origin_time.substring(12, 15));
    var origin_timeTmp = new Date(year, month - 1, day, hour, min, sec);

    var sourceTmp;
    if (KorL == 1) sourceTmp = "kmoni";
    else sourceTmp = "Lmoni";

    kmoniTimeUpdate(request_time, sourceTmp, "success");

    if (json.result.message == "") {
      kmoniEid = json.report_id;
      kmoniRNum = json.report_num;

      var EEWdata = {
        alertflg: json.alertflg,
        EventID: Number(json.report_id),
        serial: Number(json.report_num),
        report_time: new Date(json.report_time),
        magnitude: Number(json.magnitude),
        maxInt: shindoConvert(json.calcintensity, 0),
        depth: Number(json.depth.replace("km", "")),
        is_cancel: Boolean2(json.is_cancel),
        is_final: Boolean2(json.is_final),
        is_training: Boolean2(json.is_training),
        latitude: Number(json.latitude),
        longitude: Number(json.longitude),
        region_code: json.region_code,
        region_name: json.region_name,
        origin_time: origin_timeTmp,
        isPlum: false,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: [],
        source: sourceTmp,
      };
      if (KorL == 1) {
        var kmoniLastReportTimeTmp = new Date(json.report_time);
        if (kmoniLastReportTime < kmoniLastReportTimeTmp) EEWcontrol(EEWdata);
        kmoniLastReportTime = kmoniLastReportTimeTmp;
      } else {
        var lmoniLastReportTimeTmp = new Date(json.report_time);
        if (lmoniLastReportTime < lmoniLastReportTimeTmp) EEWcontrol(EEWdata);
        lmoniLastReportTime = lmoniLastReportTimeTmp;
      }
    } else {
      kmoniEid = null;
      kmoniRNum = null;
    }

    if (json.avrarea) {
      EEWdata = Object.assign(EEWdata, {
        avrarea: json.avrarea, //主な予想地域
        avrarea_list: json.avrarea_list, //長周期地震動予想地域リスト
        avrval: json.avrval, //sva
        avrrank: json.avrrank, //最大予想長周期地震動階級
      });

      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "longWaveUpdate",
          data: {
            avrarea: json.avrarea,
            avrarea_list: json.avrarea_list,
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
    //axis

    var alertflgTmp = json.Title == "緊急地震速報（予報）" ? "予報" : "警報";
    var EBIData = [];
    json.Forecast.forEach(function (elm) {
      EBIData.push({
        Code: elm.Code,
        Name: elm.Name,
        Alert: null,
        IntTo: elm.Intensity.To,
        IntFrom: elm.Intensity.From,
        ArrivalTime: null,
        Arrived: null,
      });
    });
    var EEWdata = {
      alertflg: alertflgTmp,
      EventID: Number(json.EventID),
      serial: json.Serial,
      report_time: new Date(json.ReportDateTime),
      magnitude: Number(json.Magnitude),
      maxInt: shindoConvert(json.Intensity),
      depth: Number(json.Hypocenter.Depth.replace("km", "")),
      is_cancel: json.Flag.is_cancel,
      is_final: json.Flag.is_final,
      is_training: json.Flag.is_training,
      latitude: json.Hypocenter.Coordinate[1],
      longitude: json.Hypocenter.Coordinate[0],
      region_code: json.Hypocenter.Code,
      region_name: json.Hypocenter.Name,
      origin_time: new Date(json.OriginDateTime),
      isPlum: null,
      userIntensity: null,
      arrivalTime: null,
      intensityAreas: null,
      warnZones: EBIData,
      source: "axis",
    };
    EEWcontrol(EEWdata);
  } else if (type == 4) {
    //P2P
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
    var conditionTmp = false;
    if (json.earthquake) {
      latitudeTmp = json.earthquake.hypocenter.latitude;
      longitudeTmp = json.earthquake.hypocenter.longitude;
      depthTmp = json.earthquake.hypocenter.depth;
      magnitudeTmp = json.earthquake.hypocenter.magnitude;
      region_nameTmp = json.earthquake.hypocenter.name;
      origin_timeTmp = new Date(json.earthquake.originTime);
      conditionTmp = json.earthquake.condition == "仮定震源要素";
    }
    var EBIData = [];
    json.areas.forEach(function (elm) {
      EBIData.push({
        Code: null,
        Name: elm.name,
        Alert: alertFlg,
        IntTo: shindoConvert(elm.scaleTo, 0, true),
        IntFrom: shindoConvert(elm.scaleFrom, 0, true),
        ArrivalTime: elm.arrivalTime,
        Arrived: elm.kindCode == 11,
      });
    });
    var EEWdata = {
      alertflg: "警報",
      EventID: Number(json.issue.eventId),
      serial: Number(json.issue.serial),
      report_time: new Date(json.issue.time),
      magnitude: magnitudeTmp,
      maxInt: shindoConvert(maxIntTmp, 0, true),
      depth: depthTmp,
      is_cancel: Boolean(json.canceled),
      is_final: null,
      is_training: Boolean(json.test),
      latitude: latitudeTmp,
      longitude: longitudeTmp,
      region_code: "",
      region_name: region_nameTmp,
      origin_time: origin_timeTmp,
      isPlum: conditionTmp,
      userIntensity: null,
      arrivalTime: null,
      intensityAreas: null,
      warnZones: [],
      source: "P2P_EEW",
    };

    var areaTmp = [];
    json.areas.forEach(function (elm) {
      areaTmp.push({
        pref: elm.pref, //府県予報区
        name: elm.name, //地域名（細分区域名）
        scaleFrom: shindoConvert(elm.scaleFrom), //最大予測震度の下限
        scaleTo: shindoConvert(elm.scaleTo), //最大予測震度の上限
        kindCode: elm.kindCode, //警報コード( 10 (緊急地震速報（警報） 主要動について、未到達と予測), 11 (緊急地震速報（警報） 主要動について、既に到達と予測), 19 (緊急地震速報（警報） 主要動の到達予想なし（PLUM法による予想）) )
        arrivalTime: new Date(elm.arrivalTime), //主要動の到達予測時刻
      });
    });
    EEWdata.intensityAreas = areaTmp;

    EEWcontrol(EEWdata);
  }
}

//EEW情報マージ→EEWAlert
function EEWcontrol(data) {
  if (!data) return;
  if (data.origin_time) {
    var origin_timeTmp = data.origin_time;
  } else {
    var eqj = EEW_Data.find(function (elm) {
      return elm.EQ_id == data.EventID;
    });
    if (eqj) {
      origin_timeTmp = eqj.data[eqj.data.length - 1].origin_time;
    } else {
      origin_timeTmp = new Date() - Replay;
    }
  }
  var pastTime = new Date() - Replay - origin_timeTmp;
  if (pastTime > 300000 || pastTime < 0) return;

  if (data.latitude && data.longitude) {
    data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);
  }

  if (data.warnZones.length) {
    var userSect = data.warnZones.find(function (elm2) {
      return elm2.Name == config.home.Section;
    });
    if (userSect) {
      data.userIntensity = userSect.IntTo;
      data.arrivalTime = userSect.ArrivalTime;
    }
  }

  var EQJSON = EEW_Data.find(function (elm) {
    return elm.EQ_id == data.EventID;
  });
  if (EQJSON) {
    //ID・報の両方一致した情報が存在するか
    var EEWJSON = EQJSON.data.find(function (elm2) {
      return elm2.serial == data.serial;
    });
    if (EEWJSON) {
      var oneBefore =
        data.serial ==
        Math.max.apply(
          null,
          EQJSON.data.map(function (o) {
            return o.serial;
          })
        );

      if (oneBefore) {
        //既知／情報更新
        var changed = false;
        oneBeforeData = EQJSON.data.find(function (elm) {
          return elm.serial == data.serial;
        });
        var keys = ["alertflg", "EventID", "serial", "report_time", "magnitude", "maxInt", "depth", "is_cancel", "is_final", "is_training", "latitude", "longitude", "region_code", "region_name", "origin_time", "isPlum", "userIntensity", "arrivalTime", "intensityAreas", "warnZones"];

        keys.forEach(function (elm) {
          if ((!oneBeforeData[elm] || oneBeforeData[elm].length == 0) && data[elm]) {
            oneBeforeData[elm] = data[elm];
            changed = true;
          }
        });

        if (changed) {
          EEWAlert(oneBeforeData, false, true);
        }
      }
    } else {
      //最新の報かどうか
      var saishin =
        data.serial >
        Math.max.apply(
          null,
          EQJSON.data.map(function (o) {
            return o.serial;
          })
        );

      if (saishin) {
        //第２報以降

        var EQJSON = EEW_Data.find(function (elm) {
          return elm.EQ_id == data.EventID;
        });

        EEWAlert(data, false);
        EQJSON.data.push(data);
        if (data.is_cancel) {
          EQJSON.canceled = true;
        }
      }
    }
  } else {
    //第１報
    EEWAlert(data, true);
    EEW_Data.push({
      EQ_id: data.EventID,
      canceled: false,
      data: [data],
    });
  }
  //EEW履歴に追加
  if (!EEW_history[data.source]) EEW_history[data.source] = [];
  if (
    !EEW_history[data.source].find(function (elm) {
      return data.EventID == elm.EventID && data.serial == elm.serial;
    })
  ) {
    EEW_history[data.source].push(data);
  }
}

//EEW解除処理
function EEWClear(source, code, reportnum, bypass) {
  if (EEWNow || bypass) {
    if (!bypass && EEW_history[source]) {
      var EEW_detected = EEW_history[source].find(function (elm) {
        return code == elm.EventID;
      });
    }
    if (EEW_detected || bypass) {
      EEW_nowList = EEW_nowList.filter(function (elm) {
        return elm.EventID !== code;
      });
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EEWAlertUpdate",
          data: EEW_nowList,
        });
      }

      if (estShindoTmp && estShindoTmp.eid == code) estShindoTmp = null;

      if (EEW_nowList.length == 0) {
        EEWNow = false;
        worker.postMessage({ action: "EEWNow", data: EEWNow });
      }
    }
  }
}

//EEW通知（音声・画面表示等）
function EEWAlert(data, first, update) {
  EEWNow = true;
  worker.postMessage({ action: "EEWNow", data: EEWNow });

  if (!update) {
    if (first) {
      createWindow();
      if (data.alertflg == "警報") {
        soundPlay("EEW1");
      } else {
        soundPlay("EEW2");
      }
      speak(config.notice.voice.EEW);
    } else {
      speak(config.notice.voice.EEWUpdate);
    }
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: false,
      });
    } else {
      var alertFlg = "";
      if (data.alertflg) alertFlg = "（" + data.alertflg + "）";
      var EEWNotification = new Notification({
        title: "緊急地震速報" + alertFlg + "#" + data.serial,
        body: data.region_name + "\n推定震度：" + data.maxInt + "  M" + data.magnitude + "  深さ：" + data.depth,
        icon: path.join(__dirname, "img/icon.ico"),
      });
      EEWNotification.show();
      EEWNotification.on("click", function () {
        createWindow();
      });
    }
  } else {
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    }
  }

  eqInfoControl(
    [
      {
        eventId: data.EventID,
        category: "EEW",
        reportDateTime: data.report_time,
        OriginTime: data.origin_time,
        epiCenter: data.region_name,
        M: data.magnitude,
        maxI: data.maxInt,
        cancel: data.is_cancel,
        DetailURL: [],
      },
    ],
    "jma",
    true
  );

  //【現在のEEW】から同一地震、古い報を削除
  EEW_nowList = EEW_nowList.filter(function (elm) {
    return elm.EventID !== data.EventID;
  });
  //【現在のEEW】配列に追加
  EEW_nowList.push(data);
}

//🔴地震情報🔴

//地震情報更新処理
function eqInfoUpdate(disableRepeat) {
  EQInfoFetchIndex++;
  EQI_JMA_Req();
  EQI_JMAXMLList_Req();
  EQI_narikakunList_Req("https://ntool.online/api/earthquakeList?year=" + new Date().getFullYear() + "&month=" + (new Date().getMonth() + 1), 10, true);
  EQI_USGS_Req();

  if (!disableRepeat) setTimeout(eqInfoUpdate, 10000);
}

//気象庁JSON 取得・フォーマット変更→eqInfoControl
function EQI_JMA_Req() {
  var request = net.request("https://www.jma.go.jp/bosai/quake/data/list.json");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);
      if (!json) return false;
      var dataTmp2 = [];
      json = json.filter(function (elm) {
        return elm.ttl == "震度速報" || elm.ttl == "震源に関する情報" || elm.ttl == "震源・震度情報" || elm.ttl == "遠地地震に関する情報" || elm.ttl == "顕著な地震の震源要素更新のお知らせ";
      });
      json = json.sort(function (a, b) {
        var r = 0;
        if (a.at > b.at) {
          r = -1;
        } else if (a.at < b.at) {
          r = 1;
        }
        return r;
      });

      var jmaJsonEIDs = [];
      for (let elm of json) {
        var eidTmp = elm.eid;
        if (!jmaJsonEIDs.includes(eidTmp)) {
          jmaJsonEIDs.push(eidTmp);
          if (jmaJsonEIDs.length == config.Info.EQInfo.ItemCount) break;
        }
      }
      json.forEach(function (elm) {
        if (jmaJsonEIDs.includes(elm.eid)) {
          var maxi = elm.maxi;
          if (!maxi || maxi == "") maxi = null;
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
      });

      eqInfoControl(dataTmp2, "jma");
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁ホームページ");
  });
  request.end();
}

//気象庁XMLリスト取得→EQI_JMAXML_Req
function EQI_JMAXMLList_Req() {
  var request = net.request("https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      const parser = new new JSDOM().window.DOMParser();
      const xml = parser.parseFromString(dataTmp, "text/html");
      if (!xml) return;
      xml.querySelectorAll("entry").forEach(function (elm) {
        var url;
        var urlElm = elm.querySelector("id");
        if (urlElm) url = urlElm.textContent;
        if (!url) return;
        EQI_JMAXML_Req(url);
      });
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁防災情報XML");
  });

  request.end();
}

//気象庁XML 取得・フォーマット変更→eqInfoControl
function EQI_JMAXML_Req(url) {
  if (!url) return;
  if (jmaXML_Fetched.includes(url)) return;
  jmaXML_Fetched.push(url);
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      const parser = new new JSDOM().window.DOMParser();
      const xml = parser.parseFromString(dataTmp, "text/html");
      if (!xml) return false;

      var title = xml.title;
      var cancel = false;
      var cancelElm = xml.querySelector("InfoType");
      if (cancelElm) cancel = cancelElm.textContent == "取り消し";

      if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度に関する情報" || title == "遠地地震に関する情報" || title == "顕著な地震の震源要素更新のお知らせ") {
        //地震情報
        var EarthquakeElm = xml.querySelector("Body Earthquake");
        var originTimeTmp;
        var epiCenterTmp;
        var magnitudeTmp;
        if (EarthquakeElm) {
          originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
          epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
          magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].textContent);
        }

        var IntensityElm = xml.querySelector("Body Intensity");
        var maxIntTmp;
        if (IntensityElm) {
          maxIntTmp = shindoConvert(IntensityElm.querySelector("Observation > MaxInt").textContent);
        }
        if (maxIntTmp == "[objectHTMLUnknownElement]") maxIntTmp = null;
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
      } else if (title == "津波情報a" || /大津波警報|津波警報|津波注意報|津波予報/.test(title)) {
        //津波予報
        var tsunamiDataTmp;
        if (cancel) {
          tsunamiDataTmp = {
            issue: { time: new Date(xml.querySelector("ReportDateTime").textContent) },
            areas: [],
            revocation: true,
          };
        } else {
          var ValidDateTimeElm = xml.querySelector("ValidDateTime");
          var ValidDateTimeTmp;
          if (ValidDateTimeElm) {
            ValidDateTimeTmp = new Date(ValidDateTimeElm.textContent);
          }
          tsunamiDataTmp = {
            issue: { time: new Date(xml.querySelector("ReportDateTime").textContent), EventID: Number(xml.querySelector("EventID").textContent) },
            areas: [],
            revocation: false,
            source: "jmaXML",
            ValidDateTime: ValidDateTimeTmp,
          };

          if (xml.querySelector("Body").querySelector("Tsunami")) {
            var tsunamiElm = xml.querySelector("Body").querySelector("Tsunami");
            if (tsunamiElm.querySelector("Forecast")) {
              tsunamiElm
                .querySelector("Forecast")
                .querySelectorAll("Item")
                .forEach(function (elm) {
                  var gradeTmp;
                  var canceledTmp = false;
                  switch (Number(elm.querySelector("Category").querySelector("Kind").querySelector("Code").textContent)) {
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
                    if (elm.querySelector("FirstHeight").querySelector("ArrivalTime")) {
                      firstHeightTmp = new Date(elm.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                    }
                    if (elm.querySelector("FirstHeight").querySelector("Condition")) {
                      firstHeightConditionTmp = elm.querySelector("FirstHeight").querySelector("Condition").textContent;
                    }
                  }
                  if (elm.querySelector("MaxHeight")) {
                    var maxheightElm = elm.querySelector("MaxHeight").getElementsByTagName("jmx_eb:TsunamiHeight");
                    if (maxheightElm) {
                      maxHeightTmp = maxheightElm[0].getAttribute("description");
                      maxHeightTmp = maxHeightTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                      });
                    }
                  }
                  var stations = [];
                  if (elm.querySelector("Station")) {
                    elm.querySelectorAll("Station").forEach(function (elm2) {
                      var nameTmp;
                      var highTideTimeTmp;
                      var ArrivalTimeTmp;
                      var ConditionTmp;
                      nameTmp = elm2.querySelector("Name").textContent;
                      highTideTimeTmp = new Date(elm2.querySelector("HighTideDateTime").textContent);
                      if (elm2.querySelector("FirstHeight").querySelector("ArrivalTime")) ArrivalTimeTmp = new Date(elm2.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                      if (elm2.querySelector("Condition")) ConditionTmp = elm2.querySelector("Condition").textContent;
                      stations.push({
                        name: nameTmp,
                        HighTideDateTime: highTideTimeTmp,
                        ArrivalTime: ArrivalTimeTmp,
                        Condition: ConditionTmp,
                      });
                    });
                  }

                  tsunamiDataTmp.areas.push({
                    code: Number(elm.querySelector("Category").querySelector("Kind").querySelector("Code").textContent),
                    grade: gradeTmp,
                    name: elm.querySelector("Name").textContent,
                    canceled: canceledTmp,
                    firstHeight: firstHeightTmp,
                    firstHeightCondition: firstHeightConditionTmp,
                    stations: stations,
                    maxHeight: maxHeightTmp,
                  });
                });
            }
            if (tsunamiElm.querySelector("Observation")) {
              tsunamiElm
                .querySelector("Observation")
                .querySelectorAll("Item")
                .forEach(function (elm) {
                  var stations = [];
                  if (elm.querySelector("Station")) {
                    elm.querySelectorAll("Station").forEach(function (elm2) {
                      var nameTmp;
                      var ArrivalTimeTmp;
                      var firstHeightConditionTmp;
                      var firstHeightInitialTmp;
                      var maxheightTime;
                      var maxHeightCondition;
                      var oMaxHeightTmp;
                      nameTmp = elm2.querySelector("Name").textContent;
                      if (elm2.querySelector("FirstHeight")) {
                        if (elm2.querySelector("FirstHeight").querySelector("ArrivalTime")) ArrivalTimeTmp = new Date(elm2.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                        if (elm2.querySelector("FirstHeight").querySelector("Condition")) firstHeightConditionTmp = elm2.querySelector("FirstHeight").querySelector("Condition").textContent;
                        if (elm2.querySelector("FirstHeight").querySelector("Initial")) firstHeightInitialTmp = elm2.querySelector("FirstHeight").querySelector("Initial").textContent;
                      }
                      if (elm2.querySelector("MaxHeight")) {
                        var maxheightElm = elm2.querySelector("MaxHeight").getElementsByTagName("jmx_eb:TsunamiHeight")[0];
                        if (maxheightElm) {
                          oMaxHeightTmp = maxheightElm.getAttribute("description");
                          oMaxHeightTmp = oMaxHeightTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                            return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                          });
                        }

                        var maxheightTimeElm = elm2.querySelector("MaxHeight").getElementsByTagName("DateTime");
                        if (maxheightTimeElm) {
                          maxheightTime = new Date(maxheightTimeElm.textContent);
                        }
                        var maxheightConditionElm = elm2.querySelector("MaxHeight").getElementsByTagName("Condition");
                        if (maxheightConditionElm) {
                          maxHeightCondition = elm2.querySelector("MaxHeight").getElementsByTagName("Condition").textContent;
                        }
                      }

                      stations.push({
                        name: nameTmp,
                        ArrivedTime: ArrivalTimeTmp,
                        firstHeightCondition: firstHeightConditionTmp,
                        firstHeightInitial: firstHeightInitialTmp,
                        omaxHeight: oMaxHeightTmp,
                        maxHeightTime: maxheightTime,
                        maxHeightCondition: maxHeightCondition,
                      });
                    });
                  }

                  var tsunamiItem = tsunamiDataTmp.areas.find(function (elm2) {
                    return elm2.name == elm.querySelector("Name").textContent;
                  });

                  if (tsunamiItem) {
                    stations.forEach(function (elm2) {
                      var stationElm = tsunamiItem.stations.find(function (elm3) {
                        return elm3.name == elm2.name;
                      });
                      if (stationElm) {
                        stationElm.ArrivedTime = elm2.ArrivedTime;
                        stationElm.firstHeightCondition = elm2.firstHeightCondition;
                        stationElm.firstHeightInitial = elm2.firstHeightInitial;
                        stationElm.omaxHeight = elm2.omaxHeight;
                        stationElm.maxheightTime = elm2.ArrivedTime;
                        stationElm.maxHeightCondition = elm2.maxHeightCondition;
                      }
                    });
                  } else {
                    tsunamiDataTmp.areas.push({
                      name: elm.querySelector("Name").textContent,
                      stations: stations,
                    });
                  }
                });
            }
          }
        }
        TsunamiInfoControl(tsunamiDataTmp);
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁防災情報XML");
  });

  request.end();
}

//USGS 取得・フォーマット変更→eqInfoControl
function EQI_USGS_Req() {
  var request = net.request("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=" + config.Info.EQInfo.ItemCount);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);
      if (!json) return false;
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
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "USGS");
  });

  request.end();
}

//narikakun地震情報API リスト取得→EQI_narikakun_Req
function EQI_narikakunList_Req(url, num, first) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);
      if (!json || !json.lists) return false;
      narikakun_URLs = narikakun_URLs.concat(json.lists.reverse());

      if (narikakun_URLs.length < config.Info.EQInfo.ItemCount && first) {
        var yearTmp = new Date().getFullYear();
        var monthTmp = new Date().getMonth();
        if (monthTmp == 0) {
          yearTmp = new Date().getFullYear() - 1;
          monthTmp = 1;
        }
        EQI_narikakunList_Req("https://ntool.online/api/earthquakeList?year=" + yearTmp + "&month=" + monthTmp, config.Info.EQInfo.ItemCount - json.lists.length, false);
      } else {
        for (let elm of narikakun_URLs) {
          var eidTmp = elm.split("_")[2];
          if (nakn_Fetched.indexOf(url) === -1) {
            nakn_Fetched.push(elm);
            EQI_narikakun_Req(elm);
          }
          if (!narikakun_EIDs.includes(eidTmp)) {
            narikakun_EIDs.push(eidTmp);
            if (narikakun_EIDs.length == config.Info.EQInfo.ItemCount) break;
          }
        }
        narikakun_URLs = [];
        narikakun_EIDs = [];
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "narikakun 地震情報API");
  });
  request.end();
}

//narikakun地震情報API 取得・フォーマット変更→eqInfoControl
function EQI_narikakun_Req(url) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      var json = jsonParse(dataTmp);

      if (!json) return;

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

//地震情報マージ→eqInfoAlert
function eqInfoControl(dataList, type, EEW) {
  switch (type) {
    case "jma":
      var eqInfoTmp = [];
      var eqInfoUpdateTmp = [];
      dataList.forEach(function (data) {
        var EQElm = eqInfo.jma.concat(eqInfoTmp).find(function (elm) {
          return elm.eventId == data.eventId;
        });

        if (!data.maxI) data.maxI = null;
        if (EQElm) {
          var newer = EQElm.reportDateTime < data.reportDateTime;
          var changed = false;
          if (EEW && EQElm.category !== "EEW") return; //EEW以外の情報が入っているとき、EEWによる情報を破棄
          if (!EEW && EQElm.category == "EEW") {
            //EEWによらない情報が入ったら、EEWによる情報をクリアー
            newer = true;
            EQElm = {
              eventId: EQElm.eventId,
              category: null,
              reportDateTime: null,
              OriginTime: null,
              epiCenter: null,
              M: null,
              maxI: null,
              DetailURL: [],
            };
            changed = true;
          }

          if (data.OriginTime && (!EQElm.OriginTime || newer)) {
            EQElm.OriginTime = data.OriginTime;
            changed = true;
          }
          if (data.epiCenter && (!EQElm.epiCenter || newer)) {
            EQElm.epiCenter = data.epiCenter;
            changed = true;
          }
          if (data.M == "Ｍ不明" || data.M == "NaN") data.M = null;
          if (data.M && (!EQElm.M || newer)) {
            EQElm.M = data.M;
            changed = true;
          }
          if (data.maxI && (!EQElm.maxI || newer)) {
            EQElm.maxI = data.maxI;
            changed = true;
          }

          if (data.cancel && (!EEW || EQElm.category == "EEW")) {
            //EEWによるキャンセル報の場合、EEWによる情報以外取り消さない
            if (data.cancel && (!EQElm.cancel || newer)) {
              EQElm.cancel = data.cancel;
              changed = true;
            }
          }
          EQElm.category = data.category;

          if (data.DetailURL && data.DetailURL[0] !== "" && !EQElm.DetailURL.includes(data.DetailURL[0])) {
            EQElm.DetailURL.push(data.DetailURL[0]);
            changed = true;
          }
          if (changed) {
            eqInfoUpdateTmp.push(EQElm);
            var EQElm2 = eqInfo.jma.findIndex(function (elm) {
              return elm.eventId == data.eventId;
            });
            if (EQElm2 !== -1) {
              eqInfo.jma[EQElm2] = EQElm;
            }
          }
        } else {
          eqInfoTmp.push(data);
        }
      });
      if (eqInfoTmp.length > 0) {
        eqInfoAlert(eqInfoTmp, "jma");
      }
      if (eqInfoUpdateTmp.length > 0) {
        eqInfoAlert(eqInfoUpdateTmp, "jma", true);
      }

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

//地震情報通知（音声・画面表示等）
function eqInfoAlert(data, source, update) {
  if (source == "jma") {
    if (!update) {
      if (EQInfoFetchIndex > 1) {
        soundPlay("EQInfo");
      }
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
        data: eqInfo.jma.slice(0, config.Info.EQInfo.ItemCount),
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
        data: eqInfo.usgs.slice(0, config.Info.EQInfo.ItemCount),
      });
    }
  }
}

//🔴津波情報🔴
function TsunamiInfoControl(data) {
  var newInfo = !tsunamiData || !tsunamiData.issue || tsunamiData.issue.time < data.issue.time;
  if (newInfo) {
    //情報の有効期限
    if (data.ValidDateTime) {
      if (data.ValidDateTime - new Date() < 0) {
        return;
      }
      clearTimeout(RevocationTimer);
      RevocationTimer = setTimeout(function () {
        TsunamiInfoControl({
          issue: { time: tsunamiData.ValidDateTime },
          revocation: true,
          cancelled: false,
          areas: [],
        });
      }, data.ValidDateTime - new Date());
    }

    soundPlay("TsunamiInfo");

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

//🔴支援関数🔴

//音声合成
function speak(str) {
  if (kmoniWorker) {
    kmoniWorker.webContents.send("message2", {
      action: "speak",
      data: str,
    });
  }
}
//音声再生(kmoniWorker連携)
function soundPlay(name) {
  if (kmoniWorker) {
    kmoniWorker.webContents.send("message2", {
      action: "soundPlay",
      data: name,
    });
  }
}

//ネットワークエラー処理
function NetworkError(/*error, type*/) {
  return false;
}
//メインウィンドウ内通知
var notifyData;
function Window_notification(message, type) {
  notifyData = {
    action: "notification_Update",
    data: {
      type: type,
      message: message,
      time: new Date(),
    },
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", notifyData);
  }
}

//真偽地判定（拡張）
function Boolean2(str) {
  switch (str) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return Boolean(str);
  }
}
//JSONパース（拡張）
function jsonParse(str) {
  try {
    str = String(str);
    var json = JSON.parse(str);
  } catch (error) {
    return {};
  }
  return json;
}

//日時フォーマット
function dateEncode(type, dateTmp) {
  if (!dateTmp) dateTmp = new Date();
  else dateTmp = new Date(dateTmp);
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
  } else if (type == 4) {
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD;
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
//震度の形式変換
function shindoConvert(str, responseType, p2p) {
  var ShindoTmp;
  if (!str || str == "不明") {
    ShindoTmp = "?";
  } else if (isNaN(str) || p2p) {
    str = String(str);
    str = str.replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
    str = str.replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-");
    str = str.replace(/\s+/g, "");
    switch (str) {
      case "-1":
      case "?":
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
      case "Over":
        ShindoTmp = "+";
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
    var ConvTable;
    switch (responseType) {
      case 1:
        ConvTable = { "?": "?", 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5弱", "5+": "5強", "6-": "6弱", "6+": "6強", 7: "7", "7+": "7以上" };
        break;
      case 2:
        ConvTable = {
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
        break;
      case 3:
        ConvTable = { "?": null, 0: null, 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5-", "5+": "5p", "6-": "6-", "6+": "6p", 7: "7", "7+": "7p" };
        break;
      case 4:
        ConvTable = { "?": null, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, "5-": 4.5, "5+": 5, "6-": 5.5, "6+": 6, 7: 7, "7+": 7.5 };
        break;
      case 5:
        ConvTable = { "?": 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, "5-": 6, "5+": 7, "6-": 8, "6+": 9, 7: 10, "7+": 11 };
        break;
      case 0:
      default:
        ConvTable = { "?": "?", 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5-", "5+": "5+", "6-": "6-", "6+": "6+", 7: "7", "7+": "7+" };
        break;
    }
    return ConvTable[ShindoTmp];
  } else {
    return str;
  }
}
//緯度・経度のフォーマット統一
function LatLngConvert(data) {
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

//２地点の緯度経度から距離（km）を算出
function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}

//連想配列オブジェクトのマージ
function mergeDeeply(target, source, opts) {
  const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
  const isConcatArray = opts && opts.concatArray;
  let result = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    for (const [sourceKey, sourceValue] of Object.entries(source)) {
      const targetValue = target[sourceKey];
      if (isConcatArray && Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        result[sourceKey] = targetValue.concat(...sourceValue);
        //eslint-disable-next-line
      } else if (isObject(sourceValue) && target.hasOwnProperty(sourceKey)) {
        result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
      } else {
        Object.assign(result, { [sourceKey]: sourceValue });
      }
    }
  }
  return result;
}
