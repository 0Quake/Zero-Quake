//リプレイ
var Replay = 0;
var mainWindow, settingWindow, tsunamiWindow, kmoniWorker, nankaiWindow;
var worker;
function replay(ReplayDate) {
  if (ReplayDate) {
    Replay = new Date() - new Date(ReplayDate);
  } else {
    Replay = 0;
  }
  EQDetect_List = [];
  EEW_nowList = [];
  if (worker) worker.postMessage({ action: "Replay", data: Replay });
  messageToMainWindow({
    action: "Replay",
    data: Replay,
  });
  if (settingWindow) {
    settingWindow.webContents.send("message2", {
      action: "Replay",
      data: Replay,
    });
  }
}
// prettier-ignore
var EEWSectName = { 135: "宗谷支庁北部", 136: "宗谷支庁南部", 125: "上川支庁北部", 126: "上川支庁中部", 127: "上川支庁南部", 130: "留萌支庁中北部", 131: "留萌支庁南部", 139: "北海道利尻礼文", 150: "日高支庁西部", 151: "日高支庁中部", 152: "日高支庁東部", 145: "胆振支庁西部", 146: "胆振支庁中東部", 110: "檜山支庁", 105: "渡島支庁北部", 106: "渡島支庁東部", 107: "渡島支庁西部", 140: "網走支庁網走", 141: "網走支庁北見", 142: "網走支庁紋別", 165: "根室支庁北部", 166: "根室支庁中部", 167: "根室支庁南部", 160: "釧路支庁北部", 161: "釧路支庁中南部", 155: "十勝支庁北部", 156: "十勝支庁中部", 157: "十勝支庁南部", 119: "北海道奥尻島", 120: "空知支庁北部", 121: "空知支庁中部", 122: "空知支庁南部", 100: "石狩支庁北部", 101: "石狩支庁中部", 102: "石狩支庁南部", 115: "後志支庁北部", 116: "後志支庁東部", 117: "後志支庁西部", 200: "青森県津軽北部", 201: "青森県津軽南部", 202: "青森県三八上北", 203: "青森県下北", 230: "秋田県沿岸北部", 231: "秋田県沿岸南部", 232: "秋田県内陸北部", 233: "秋田県内陸南部", 210: "岩手県沿岸北部", 211: "岩手県沿岸南部", 212: "岩手県内陸北部", 213: "岩手県内陸南部", 220: "宮城県北部", 221: "宮城県南部", 222: "宮城県中部", 240: "山形県庄内", 241: "山形県最上", 242: "山形県村山", 243: "山形県置賜", 250: "福島県中通り", 251: "福島県浜通り", 252: "福島県会津", 300: "茨城県北部", 301: "茨城県南部", 310: "栃木県北部", 311: "栃木県南部", 320: "群馬県北部", 321: "群馬県南部", 330: "埼玉県北部", 331: "埼玉県南部", 332: "埼玉県秩父", 350: "東京都２３区", 351: "東京都多摩東部", 352: "東京都多摩西部", 354: "神津島", 355: "伊豆大島", 356: "新島", 357: "三宅島", 358: "八丈島", 359: "小笠原", 340: "千葉県北東部", 341: "千葉県北西部", 342: "千葉県南部", 360: "神奈川県東部", 361: "神奈川県西部", 420: "長野県北部", 421: "長野県中部", 422: "長野県南部", 410: "山梨県東部", 411: "山梨県中・西部", 412: "山梨県東部・富士五湖", 440: "静岡県伊豆", 441: "静岡県東部", 442: "静岡県中部", 443: "静岡県西部", 450: "愛知県東部", 451: "愛知県西部", 430: "岐阜県飛騨", 431: "岐阜県美濃東部", 432: "岐阜県美濃中西部", 460: "三重県北部", 461: "三重県中部", 462: "三重県南部", 370: "新潟県上越", 371: "新潟県中越", 372: "新潟県下越", 375: "新潟県佐渡", 380: "富山県東部", 381: "富山県西部", 390: "石川県能登", 391: "石川県加賀", 400: "福井県嶺北", 401: "福井県嶺南", 500: "滋賀県北部", 501: "滋賀県南部", 510: "京都府北部", 511: "京都府南部", 520: "大阪府北部", 521: "大阪府南部", 530: "兵庫県北部", 531: "兵庫県南東部", 532: "兵庫県南西部", 535: "兵庫県淡路島", 540: "奈良県", 550: "和歌山県北部", 551: "和歌山県南部", 580: "岡山県北部", 581: "岡山県南部", 590: "広島県北部", 591: "広島県南東部", 592: "広島県南西部", 570: "島根県東部", 571: "島根県西部", 575: "島根県隠岐", 560: "鳥取県東部", 562: "鳥取県中部", 563: "鳥取県西部", 600: "徳島県北部", 601: "徳島県南部", 610: "香川県東部", 611: "香川県西部", 620: "愛媛県東予", 621: "愛媛県中予", 622: "愛媛県南予", 630: "高知県東部", 631: "高知県中部", 632: "高知県西部", 700: "山口県北部", 701: "山口県東部", 702: "山口県西部", 710: "福岡県福岡", 711: "福岡県北九州", 712: "福岡県筑豊", 713: "福岡県筑後", 750: "大分県北部", 751: "大分県中部", 752: "大分県南部", 753: "大分県西部", 730: "長崎県北部", 731: "長崎県南西部", 732: "長崎県島原半島", 735: "長崎県対馬", 736: "長崎県壱岐", 737: "長崎県五島", 720: "佐賀県北部", 721: "佐賀県南部", 740: "熊本県阿蘇", 741: "熊本県熊本", 742: "熊本県球磨", 743: "熊本県天草・芦北", 760: "宮崎県北部平野部", 761: "宮崎県北部山沿い", 762: "宮崎県南部平野部", 763: "宮崎県南部山沿い", 770: "鹿児島県薩摩", 771: "鹿児島県大隅", 774: "鹿児島県十島村", 775: "鹿児島県甑島", 776: "鹿児島県種子島", 777: "鹿児島県屋久島", 778: "鹿児島県奄美北部", 779: "鹿児島県奄美南部", 800: "沖縄県本島北部", 801: "沖縄県本島中南部", 802: "沖縄県久米島", 803: "沖縄県大東島", 804: "沖縄県宮古島", 805: "沖縄県石垣島", 806: "沖縄県与那国島", 807: "沖縄県西表島" };

const electron = require("electron");
const { app, BrowserWindow, ipcMain, net, Notification, shell, dialog, Menu, powerSaveBlocker } = electron;
const path = require("path");
var fs;
var JSDOM = require("jsdom").JSDOM;
const Store = require("electron-store");
var WebSocketClient = require("websocket").client;
var turf = require("@turf/turf");
var FERegion = require("./Resource/feRegion.json");
var sesmicPoints;
var TimeTable_JMA2001;
var soft_version;
var EQInfoFetchCount = 0;

const store = new Store();
var defaultConfigVal = {
  system: {
    crashReportAutoSend: "yes",
    WindowAutoOpen: true,
    alwaysOnTop: false,
  },
  home: {
    name: "自宅",
    latitude: 35.68,
    longitude: 139.767,
    Section: "東京都２３区",
    TsunamiSect: "東京湾内湾",
    ShowPin: true,
    arv: 1.27,
  },
  Info: {
    EEW: {
      showtraining: false,
      IntThreshold: 0,
      IntQuestion: true,
      userIntThreshold: 0,
      userIntQuestion: true,
      IntType: "max",
    },
    EQInfo: {
      ItemCount: 15,
      Interval: 60000,
      showtraining: false,
      showTest: false,
    },
    TsunamiInfo: {
      GetData: true,
      showtraining: false,
      showTest: false,
    },
    RealTimeShake: {
      List: {
        ItemCount: 10,
      },
      DetectEarthquake: false,
    },
  },
  Source: {
    kmoni: {
      kmoni: {
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
    ProjectBS: {
      GetData: true,
    },
    wolfx: {
      GetData: true,
    },
    EarlyEst: {
      GetData: true,
      Interval: 60000,
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
      EEWUpdate: "緊急地震速報が更新されました。",
      EEWCancel: "緊急地震速報が取り消されました。",
    },
    window: {
      EEW: "openWindow",
      EEW_Update: "openWindow",
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
      7: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "7p": {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
      "5p?": {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
    },
    LgInt: {
      1: {
        background: "rgb(80, 186, 84)",
        color: "rgb(34, 34, 34)",
      },
      2: {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
      3: {
        background: "rgb(237, 0, 0)",
        color: "rgb(255, 255, 255)",
      },
      4: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
    },
    Tsunami: {
      TsunamiMajorWarningColor: "rgb(200, 0, 255)",
      TsunamiWarningColor: "rgb(255, 40, 0)",
      TsunamiWatchColor: "rgb(250, 245, 0)",
      TsunamiYohoColor: "rgb(66, 158, 255)",
    },
  },
  data: {
    layer: "",
    overlay: [],
  },
};
var config = store.get("config", defaultConfigVal);
config = mergeDeeply(defaultConfigVal, config);
store.set("config", config);

var psBlock;
var kmoniTimeTmp = {};
var EEW_Data = []; //地震速報リスト
var EEW_nowList = []; //現在発報中リスト
var EarlyEst_Data = []; //Earlyest地震速報リスト

var yoyuK = 2500;
var EEWNow = false;

var errorCountkI = 0;

var EQDetect_List = [];

var jmaXML_Fetched = [];
var nakn_Fetched = [];
var narikakun_URLs = [];
var narikakun_EIDs = [];
var eqInfo = { jma: [], usgs: [] };
var tsunamiData;
var kmoniTimeout;
var msil_lastTime = 0;
var kmoniPointsDataTmp, SnetPointsDataTmp;
let tray;
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

var update_data;
var downloadURL;

//アップデートの確認
function checkUpdate() {
  let request = net.request("https://api.github.com/repos/0quake/Zero-Quake/releases?_=" + Number(new Date()));

  request.on("response", (res) => {
    if (!300 <= res._responseHead.statusCode && !res._responseHead.statusCode < 200) {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = jsonParse(dataTmp);
          var latest_verTmp = String(json[0].tag_name.replace("v", ""));
          var p = require("../package.json");
          var current_verTmp = p.version;
          var latest_v = String(latest_verTmp).split(".").map(Number);
          var current_v = String(current_verTmp).split(".").map(Number);
          var dl_page = json[0].html_url;
          var update_detail = json[0].body;
          downloadURL = json[0].assets[0];
          if (downloadURL && downloadURL.browser_download_url) downloadURL = downloadURL.browser_download_url;
          else {
            update_data = { check_error: true, check_date: new Date() };
            if (settingWindow) {
              settingWindow.webContents.send("message2", {
                action: "Update_Data",
                data: update_data,
              });
            }
          }
          var update_available = false;
          if (latest_v[0] > current_v[0]) {
            update_available = true;
          } else if (latest_v[0] == current_v[0]) {
            if (latest_v[1] > current_v[1]) {
              update_available = true;
            } else if (latest_v[1] == current_v[1]) {
              if (latest_v[2] > current_v[2]) {
                update_available = true;

                var options4 = {
                  type: "question",
                  title: "アプリケーションの更新",
                  message: "Zero Quake で更新が利用可能です。",
                  detail: "v." + current_verTmp + " > v." + latest_verTmp + "\n操作を選択してください。[今すぐ更新]をすることをお勧めします。",
                  buttons: ["今すぐ更新", "詳細", "後で確認"],
                  noLink: true,
                };

                dialog.showMessageBox(mainWindow, options4).then(function (result) {
                  if (result.response == 0) {
                    if (downloadURL) doUpdate(downloadURL);
                  } else if (result.response == 1) {
                    setting_createWindow(true);
                  }
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
        } catch (err) {
          return;
        }
      });
    }
  });
  request.on("error", () => {
    var current_verTmp = soft_version;

    update_data = { check_error: true, check_date: new Date(), latest_version: null, current_version: current_verTmp, update_available: null, dl_page: null };
    if (settingWindow) {
      settingWindow.webContents.send("message2", {
        action: "Update_Data",
        data: update_data,
      });
    }
  });
  request.end();
}

//アップデートの実行
function doUpdate(url) {
  var request = net.request(url);
  request.on("response", (res) => {
    try {
      if (!fs) fs = require("fs");
      res.pipe(fs.createWriteStream("ZeroQuakeInstaller.exe")).on("close", function () {
        var COMMAND = "start ZeroQuakeInstaller.exe";
        var spawn = require("child_process").spawn;
        var Installer = spawn(COMMAND, [], { shell: true, detached: true, stdio: "inherit" });
        Installer.unref();
        app.exit(0);
      });
    } catch (err) {
      throw new Error("インストーラーの起動に失敗しました。エラーメッセージは以下の通りです。\n" + err);
    }
  });
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
        try {
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
        } catch (err) {
          return;
        }
      });
    });

    request.end();
  }
}

//準備完了イベント
app.whenReady().then(() => {
  //ウィンドウ作成
  worker_createWindow();
  //定期実行
  ScheduledExecution();
  setInterval(ScheduledExecution, 600000);

  if (config.system.WindowAutoOpen) {
    createWindow();
    app.on("activate", () => {
      // メインウィンドウが消えている場合は再度メインウィンドウを作成する
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }

  //初期化処理
  start();
});

let options = {
  type: "error",
  title: "エラー",
  message: "予期しないエラーが発生しました",
  detail: "動作を選択してください。",
  buttons: ["今すぐ再起動", "終了", "無視"],
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
  message: "エラー情報の送信に失敗しました。",
  detail: "",
  buttons: ["OK"],
};
var errorMsgBox = false;
//エラーイベント
process.on("uncaughtException", function (err) {
  try {
    if (!errorMsgBox && app.isReady()) {
      if (String(err.stack).startsWith("Error: net::ERR_")) return false;
      errorMsgBox = true;
      options.detail = "動作を選択してください。\nエラーコードは以下の通りです。\n" + err.stack;

      dialog.showMessageBox(mainWindow, options).then(function (result) {
        if (config.system.crashReportAutoSend == "yes") {
          crashReportSend(err.stack, result);
          errorMsgBox = false;
        } else if (config.system.crashReportAutoSend == "no") {
          errorResolve(result.response);
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
            } else {
              errorResolve(result.response);
            }
          });
        }
      });

      Window_notification("予期しないエラーが発生しました。", "error");
    }
  } catch (err) {
    return;
  }
});
//エラー処理
function errorResolve(response) {
  try {
    switch (response) {
      case 0:
        app.relaunch();
        app.exit(0);
        break;
      case 1:
        app.exit(0);
        break;
    }
  } catch (err) {
    return;
  }
}
//クラッシュレポートの送信
function crashReportSend(errMsg, result) {
  try {
    let request = net.request("https://zeroquake.wwww.jp/crashReport/?errorMsg=" + encodeURI(errMsg) + "&soft_version=" + encodeURI(soft_version));

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
  } catch (err) {
    return;
  }
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
        label: "設定画面表示",
        click: () => {
          setting_createWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "再起動",
        click: () => {
          app.relaunch();
          app.exit(0);
        },
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

  electron.powerMonitor.on("resume", () => {
    eqInfoUpdate();
    RegularExecution();
    if (wolfxConnection) wolfxConnection.sendUTF("query_jmaeew");
    if (PBSConnection) PBSConnection.sendUTF("queryjson");
  });
});

//レンダラープロセスからのメッセージ
ipcMain.on("message", (_event, response) => {
  switch (response.action) {
    case "kmoniReturn":
      kmoniControl(response.data, response.date);
      break;
    case "SnetReturn":
      SnetControl(response.data, response.date);
      break;
    case "settingWindowOpen":
      setting_createWindow();
      break;
    case "TsunamiWindowOpen":
      tsunami_createWindow();
      break;
    case "EQInfoWindowOpen":
      EQInfo_createWindow(response);
      break;
    case "EQInfoWindowOpen_website":
      EQInfo_createWindow(response, true);
      break;
    case "openAtLogin":
      app.setLoginItemSettings({
        openAtLogin: response.data,
      });
      break;
    case "settingReturn":
      config = response.data;
      store.set("config", config);

      if (settingWindow) {
        settingWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
      break;
    case "EEWSimulation":
      EEWcontrol(response.data);
      break;
    case "checkForUpdate":
      checkUpdate();
      break;
    case "tsunamiReqest":
      if (tsunamiData) {
        messageToMainWindow({
          action: "tsunamiUpdate",
          data: tsunamiData,
        });
      }
      break;
    case "mapLoaded":
      if (kmoniPointsDataTmp) messageToMainWindow(kmoniPointsDataTmp);
      if (SnetPointsDataTmp) messageToMainWindow(SnetPointsDataTmp);
      break;
    case "replay":
      replay(response.date);
      break;
    case "startInstall":
      if (downloadURL) doUpdate(downloadURL);
      break;
    case "nankaiWIndowOpen":
      nankai_createWindow();
      break;
  }
});

const unresponsiveMsg = {
  type: "question",
  title: "ウィンドウが応答しません。",
  message: "動作を選択してください。",
  buttons: ["画面を再表示", "アプリを再起動", "待機"],
  noLink: true,
};
//メインウィンドウ表示処理
function createWindow() {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isFocused()) mainWindow.focus();
      if (!mainWindow.isVisible()) mainWindow.show();
    } else {
      mainWindow = new BrowserWindow({
        minWidth: 450,
        minHeight: 400,
        webPreferences: {
          preload: path.join(__dirname, "js/preload.js"),
          title: "Zero Quake",
          icon: path.join(__dirname, "img/icon.ico"),
          backgroundThrottling: false,
        },
        backgroundColor: "#202227",
        alwaysOnTop: config.system.alwaysOnTop,
      });
      if (Replay !== 0) {
        messageToMainWindow({
          action: "Replay",
          data: Replay,
        });
      }

      mainWindow.webContents.on("did-finish-load", () => {
        if (notifyData) messageToMainWindow(notifyData);

        if (Replay !== 0) {
          messageToMainWindow({
            action: "Replay",
            data: Replay,
          });
        }

        Object.keys(kmoniTimeTmp).forEach(function (key) {
          var elm = kmoniTimeTmp[key];
          messageToMainWindow({
            action: "kmoniTimeUpdate",
            Updatetime: elm.Updatetime,
            LocalTime: elm.LocalTime,
            type: elm.type,
            condition: elm.condition,
          });
        });

        messageToMainWindow({
          action: "setting",
          data: config,
        });

        if (EEWNow) {
          messageToMainWindow({
            action: "EEWAlertUpdate",
            data: EEW_nowList,
          });
        }

        messageToMainWindow({
          action: "EQInfo",
          source: "jma",
          data: eqInfo.jma.slice(0, config.Info.EQInfo.ItemCount),
        });
        messageToMainWindow({
          action: "EQInfo",
          source: "usgs",
          data: eqInfo.usgs.slice(0, config.Info.EQInfo.ItemCount),
        });

        EQDetect_List.forEach(function (elm) {
          var threshold01Tmp = elm.isCity ? thresholds.threshold01C : thresholds.threshold01;
          if (elm.Codes.length >= threshold01Tmp) {
            messageToMainWindow({
              action: "EQDetect",
              data: elm,
            });
          }
        });

        if (kmoniPointsDataTmp) messageToMainWindow(kmoniPointsDataTmp);
        if (SnetPointsDataTmp) messageToMainWindow(SnetPointsDataTmp);
        if (NankaiTroughInfo) {
          messageToMainWindow({
            action: "NankaiTroughInfo",
            data: NankaiTroughInfo,
          });
        }
      });

      mainWindow.loadFile("src/index.html");

      mainWindow.on("unresponsive", () => {
        mainWindow.responsive = true;
        setTimeout(function () {
          if (mainWindow.responsive) {
            dialog.showMessageBox(mainWindow, unresponsiveMsg).then(function (result) {
              switch (result.response) {
                case 0:
                  mainWindow.loadFile("src/index.html");
                  break;
                case 1:
                  app.relaunch();
                  app.exit(0);
                  break;
              }
            });
          }
        }, 5000);
      });
      mainWindow.on("focus", () => {
        messageToMainWindow({
          action: "activate",
        });
      });
      mainWindow.on("show", () => {
        messageToMainWindow({
          action: "activate",
        });
      });
      mainWindow.on("hide", () => {
        messageToMainWindow({
          action: "unactivate",
        });
      });
      mainWindow.on("restore", () => {
        messageToMainWindow({
          action: "activate",
        });
      });
      mainWindow.on("minimize", () => {
        messageToMainWindow({
          action: "unactivate",
        });
      });
      mainWindow.on("responsive", () => {
        mainWindow.responsive = false;
      });

      mainWindow.on("close", (event) => {
        if (!mainWindow.isDestroyed()) {
          event.preventDefault();
          mainWindow.hide();
        }
      });

      mainWindow.on("closed", () => {
        mainWindow = null;
      });
    }
  } catch (err) {
    throw new Error("メインウィンドウの作成でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}
//ワーカーウィンドウ表示処理
function worker_createWindow() {
  if (kmoniWorker) kmoniWorker.close();
  kmoniWorker = new BrowserWindow({
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
  kmoniWorker.on("unresponsive", () => {
    kmoniWorker.responsive = true;
    setTimeout(function () {
      if (kmoniWorker.responsive) worker_createWindow();
    }, 5000);
  });
  kmoniWorker.on("responsive", () => {
    kmoniWorker.responsive = false;
  });
}
//設定ウィンドウ表示処理
function setting_createWindow(update) {
  try {
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
        parent: mainWindow ? mainWindow : null,
        center: true,
        icon: path.join(__dirname, "img/icon.ico"),
      },
      backgroundColor: "#202227",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    settingWindow.webContents.on("did-finish-load", () => {
      if (Replay !== 0) {
        settingWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }

      settingWindow.webContents.send("message2", {
        action: "initialData",
        config: config,
        defaultConfigVal: defaultConfigVal,
        softVersion: soft_version,
        openAtLogin: app.getLoginItemSettings().openAtLogin,
        updatePanelMode: update,
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
    settingWindow.webContents.on("will-navigate", handleUrlOpen);
    settingWindow.webContents.on("new-window", handleUrlOpen);
  } catch (err) {
    throw new Error("設定ウィンドウの作成でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}
//津波情報ウィンドウ表示処理
function tsunami_createWindow() {
  try {
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
      alwaysOnTop: config.system.alwaysOnTop,
    });

    tsunamiWindow.webContents.on("did-finish-load", () => {
      tsunamiWindow.webContents.send("message2", {
        action: "setting",
        data: config,
      });
      tsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: tsunamiData,
      });
    });
    tsunamiWindow.loadFile("src/TsunamiDetail.html");

    tsunamiWindow.on("closed", () => {
      tsunamiWindow = null;
    });
  } catch (err) {
    throw new Error("津波情報ウィンドウの作成でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}
//南海トラフ関連情報ウィンドウの作成
function nankai_createWindow() {
  try {
    if (nankaiWindow) {
      if (nankaiWindow.isMinimized()) nankaiWindow.restore();
      if (!nankaiWindow.isFocused()) nankaiWindow.focus();
      return false;
    }
    nankaiWindow = new BrowserWindow({
      minWidth: 600,
      minHeight: 300,
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "南海トラフ地震に関連する情報 - Zero Quake",
        icon: path.join(__dirname, "img/icon.ico"),
      },
      backgroundColor: "#202227",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    nankaiWindow.webContents.on("did-finish-load", () => {
      if (NankaiTroughInfo) {
        nankaiWindow.webContents.send("message2", {
          action: "NankaiTroughInfo",
          data: NankaiTroughInfo,
        });
      }
    });
    nankaiWindow.loadFile("src/NankaiTrough.html");

    nankaiWindow.on("closed", () => {
      nankaiWindow = null;
    });
  } catch (err) {
    throw new Error("南海トラフ関連情報ウィンドウの作成でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}
function messageToMainWindow(message) {
  if (mainWindow) mainWindow.webContents.send("message2", message);
}

//地震情報ウィンドウ表示処理
var EQI_Window = {};
const handleUrlOpen = (e, url) => {
  if (url.match(/^http/)) {
    e.preventDefault();
    shell.openExternal(url);
  }
};
function EQInfo_createWindow(response, webSite) {
  try {
    var EQInfoWindowT = EQI_Window[response.eid];
    if (EQInfoWindowT) {
      if (EQInfoWindowT.window.isMinimized()) EQInfoWindowT.window.restore();
      if (!EQInfoWindowT.window.isFocused()) EQInfoWindowT.window.focus();
      return;
    }

    var EQInfoWindow = new BrowserWindow({
      minWidth: 600,
      minHeight: 300,
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "地震詳細情報 - Zero Quake",
        icon: path.join(__dirname, "img/icon.ico"),
      },
      backgroundColor: webSite ? null : "#202227",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    if (!webSite) {
      var EEWDataItem = EEW_Data.find(function (elm) {
        return elm.EQ_id == response.eid;
      });
      var metadata = {
        action: "metaData",
        eid: response.eid,
        urls: response.urls,
        eew: EEWDataItem,
        axisData: response.axisData,
      };
      EQI_Window[response.eid] = { window: EQInfoWindow, metadata: metadata };

      EQInfoWindow.webContents.on("did-finish-load", () => {
        EQInfoWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });

        EQInfoWindow.webContents.send("message2", metadata);
      });

      EQInfoWindow.on("closed", () => {
        EQI_Window[response.eid] = null;
      });
    }

    if (webSite) EQInfoWindow.loadURL(response.url);
    else EQInfoWindow.loadFile(response.url);
    EQInfoWindow.webContents.on("will-navigate", handleUrlOpen);
    EQInfoWindow.webContents.on("new-window", handleUrlOpen);
  } catch (err) {
    throw new Error("地震情報ウィンドウの作成でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//開始処理
function start() {
  soft_version = require("../package.json").version;
  TimeTable_JMA2001 = require("./Resource/TimeTable_JMA2001.json");

  //↓WebSocket接続処理
  P2P_WS();
  AXIS_WS();
  ProjectBS_WS();
  Wolfx_WS();

  //HTTP定期GET着火
  SnetRequest();
  kmoniRequest();
  yoyuSetK(kmoniRequest);
  eqInfoUpdate(true); //地震情報定期取得 着火
  earlyEstReq();

  //定期実行 着火
  RegularExecution(true);

  //地震検知ワーカー作成
  createWorker();
}

function earlyEstReq() {
  if (config.Source.EarlyEst.GetData) {
    var request = net.request("http://early-est.rm.ingv.it/monitor.xml");
    request.on("response", (res) => {
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        kmoniTimeUpdate(new Date() - Replay, "Early-est", "Error");
      } else {
        var dataTmp = "";
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          try {
            kmoniTimeUpdate(new Date() - Replay, "Early-est", "success");
            let parser = new new JSDOM().window.DOMParser();
            let doc = parser.parseFromString(dataTmp, "text/xml");
            doc.querySelectorAll("eventParameters event").forEach(function (elm) {
              var latitude = elm.querySelector("origin latitude value") ? Number(elm.querySelector("origin latitude value").textContent) : null;
              var longitude = elm.querySelector("origin longitude value") ? Number(elm.querySelector("origin longitude value").textContent) : null;
              if (!latitude || !longitude) return;

              var FECode = FERegion.features.find(function (elm2) {
                return turf.booleanPointInPolygon([longitude, latitude], elm2);
              });

              if (FECode) {
                var data = {
                  alertflg: "EarlyEst",
                  EventID: 901471985000000000000 + Number(String(elm.getAttribute("publicID")).slice(-12)), //気象庁EIDと確実に区別するため、EarlyEstのIPアドレスと連結,
                  serial: Number(elm.querySelector("origin quality").getElementsByTagName("ee:report_count")[0].textContent) + 1,
                  report_time: elm.querySelector("creationInfo creationTime") ? ConvertJST(new Date(elm.querySelector("creationInfo creationTime").textContent)) : null,
                  magnitude: elm.querySelector("magnitude mag value") ? Number(elm.querySelector("magnitude mag value").textContent) : null,
                  depth: elm.querySelector("origin depth value") ? Number(elm.querySelector("origin depth value").textContent) / 1000 : null,
                  latitude: latitude,
                  longitude: longitude,
                  region_name: FECode.properties.nameJA,
                  origin_time: elm.querySelector("origin time value") ? ConvertJST(new Date(elm.querySelector("origin time value").textContent)) : null,
                  source: "EarlyEst",
                };
                EarlyEstControl(data);
              }
            });
          } catch (err) {
            kmoniTimeUpdate(new Date() - Replay, "Early-est", "Error");
          }
        });
      }
    });
    request.on("error", () => {
      kmoniTimeUpdate(new Date() - Replay, "Early-est", "Error");
    });

    request.end();
  }
  setTimeout(earlyEstReq, config.Source.EarlyEst.Interval);
}

function createWorker() {
  const workerThreads = require("worker_threads");
  worker = new workerThreads.Worker(path.join(__dirname, "js/EQDetectWorker.js"), {
    workerData: "From Main", // Worker に初期値を渡せる
  });
  worker.on("message", (message) => {
    switch (message.action) {
      case "EQDetectAdd":
        var EQD_ItemTmp = message.data;
        var LvTmp = EQD_ItemTmp.maxPGA > 1.3 ? 2 : 1;

        if (EQD_ItemTmp.showed) {
          if (LvTmp == 2 && EQD_ItemTmp.Lv == 1) soundPlay("EQDetectLv2"); //既存イベントのレベルが上がったときの通知音
        } else {
          soundPlay(LvTmp == 2 ? "EQDetectLv2" : "EQDetectLv1");
          createWindow();
        }
        EQD_ItemTmp.Lv = LvTmp;
        messageToMainWindow({
          action: "EQDetect",
          data: message.data,
        });
        break;
      case "sendDataToMainWindow":
        messageToMainWindow(message.data);
        break;
      case "sendDataToKmoniWorker":
        if (kmoniWorker) {
          kmoniWorker.webContents.send("message2", message.data);
        }
        break;
      case "thresholds":
        thresholds = message.data;
        break;
      case "PointsData_Update":
        EQDetect_List = message.EQDetect_List;
        kmoniPointsDataTmp = {
          action: "kmoniUpdate",
          Updatetime: new Date(message.date),
          LocalTime: new Date(),
          data: message,
        };
        messageToMainWindow(kmoniPointsDataTmp);
        break;
    }
  });
  worker.on("error", (error) => {
    throw new Error("地震検知処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + error);
  });
}

//強震モニタリアルタイム揺れ情報処理（地震検知など）
function kmoniControl(data, date) {
  worker.postMessage({ action: "EQDetect", data: data, date: date, detect: config.Info.RealTimeShake.DetectEarthquake });
}

//海しるリアルタイム揺れ情報処理
function SnetControl(data, date) {
  SnetPointsDataTmp = {
    action: "SnetUpdate",
    Updatetime: new Date(date),
    LocalTime: new Date(),
    data: { data: data, changedData: data },
  };
  messageToMainWindow(SnetPointsDataTmp);
}

var kmoniI_url = 0;
//強震モニタへのHTTPリクエスト
function kmoniRequest() {
  if (net.online && config.Source.kmoni.kmoni.GetData) {
    var ReqTime = new Date() - yoyuK - Replay;

    var urlTmp = ["https://smi.lmoniexp.bosai.go.jp/data/map_img/RealTimeImg/jma_s/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".jma_s.gif", "http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/jma_s/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".jma_s.gif"][kmoniI_url];

    var request = net.request(urlTmp);
    request.on("response", (res) => {
      var dataTmp = [];
      res.on("data", (chunk) => {
        dataTmp.push(chunk);
      });
      res.on("end", () => {
        try {
          if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
            errorCountkI++;
            if (errorCountkI > 3) {
              errorCountkI = 0;
              kmoniI_url++;
              if (kmoniI_url > urlTmp.length) kmoniI_url = 0;
            }
            kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
          } else {
            errorCountkI = 0;
            var bufTmp = Buffer.concat(dataTmp);
            if (kmoniWorker) {
              kmoniWorker.webContents.send("message2", {
                action: "KmoniImgUpdate",
                data: "data:image/gif;base64," + bufTmp.toString("base64"),
                date: ReqTime,
              });
            }
          }
        } catch (err) {
          kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
        }
      });
    });
    request.end();
  }

  if (kmoniTimeout) clearTimeout(kmoniTimeout);
  kmoniTimeout = setTimeout(kmoniRequest, config.Source.kmoni.kmoni.Interval);
}

//海しるへのHTTPリクエスト処理
function SnetRequest() {
  if (net.online && config.Source.msil.GetData) {
    var request = net.request("https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer/query?f=json&returnGeometry=false&outFields=msilstarttime%2Cmsilendtime&_=" + new Date());
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
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
                try {
                  if (kmoniWorker) {
                    var bufTmp = Buffer.concat(dataTmp);
                    var ReqTime = new Date(dateTime);
                    kmoniWorker.webContents.send("message2", {
                      action: "SnetImgUpdate",
                      data: "data:image/png;base64," + bufTmp.toString("base64"),
                      date: ReqTime,
                    });
                  }
                  kmoniTimeUpdate(new Date() - Replay, "msilImg", "success");
                } catch (err) {
                  kmoniTimeUpdate(new Date() - Replay, "msilImg", "Error");
                }
              });
            });
            request.end();
            msil_lastTime = dateTime;
          }
        } catch (err) {
          kmoniTimeUpdate(new Date() - Replay, "msilImg", "Error");
        }
      });
    });
    request.on("error", () => {
      kmoniTimeUpdate(new Date() - Replay, "msilImg", "Error");
    });

    request.end();
  }
  setTimeout(SnetRequest, config.Source.msil.Interval);
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
      try {
        if (Replay == 0 && message.type === "utf8") {
          var data = JSON.parse(message.utf8Data);
          if (data.time) kmoniTimeUpdate(new Date(data.time), "P2P_EEW", "success");
          else kmoniTimeUpdate(new Date(), "P2P_EEW", "success");

          switch (data.code) {
            case 551:
              setTimeout(eqInfoUpdate, 10000);
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
              data.areas.forEach((elm) => {
                if (elm.firstHeight) {
                  if (elm.firstHeight.condition) elm.firstHeightCondition = elm.firstHeight.condition;
                  if (elm.firstHeight.arrivalTime) elm.firstHeight = new Date(elm.firstHeight.arrivalTime);
                  else elm.firstHeight = null;
                }
                if (elm.maxHeight && elm.maxHeight.description) {
                  elm.maxHeight = elm.maxHeight.description;
                }
              });
              TsunamiInfoControl(data);
              break;
            case 556:
              //緊急地震速報（警報）
              EEWdetect(4, data);
              break;
          }
        }
      } catch (e) {
        kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
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
      kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date() - Replay, "axis", "Disconnect");
      AXIS_WS_TryConnect();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      kmoniTimeUpdate(new Date() - Replay, "axis", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr == "hello") return;
        var data = jsonParse(dataStr);
        if (data && data.channel) {
          switch (data.channel) {
            case "eew":
              EEWdetect(3, data.message);
              break;
            case "jmx-seismology":
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
                    status: data.message.Control.Status,
                    eventId: data.message.Head.EventID,
                    category: data.message.Head.Title,
                    reportDateTime: new Date(data.message.Head.ReportDateTime),
                    OriginTime: new Date(data.message.Body.Earthquake[0].OriginTime),
                    epiCenter: EarthquakeElm.Hypocenter.Area.Name,
                    M: Number(EarthquakeElm.Magnitude[0].valueOf_),
                    maxI: shindoConvert(IntensityElm.Observation.MaxInt),
                    cancel: data.message.Head.InfoType == "取消",
                    DetailURL: [],
                    axisData: data,
                  },
                ],
                "jma"
              );
              break;
          }
        }
      } catch (e) {
        kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
      }
    });
    kmoniTimeUpdate(new Date() - Replay, "axis", "success");
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

//ProjectBS WebSocket接続・受信処理
var PBSWSclient;
var PBSConnection;
function ProjectBS_WS() {
  if (!config.Source.ProjectBS.GetData) return;
  PBSWSclient = new WebSocketClient();

  PBSWSclient.on("connectFailed", function () {
    kmoniTimeUpdate(new Date() - Replay, "ProjectBS", "Error");
    PBS_WS_TryConnect();
  });

  PBSWSclient.on("connect", function (connection) {
    PBSConnection = connection;
    connection.on("error", function () {
      kmoniTimeUpdate(new Date() - Replay, "ProjectBS", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date() - Replay, "ProjectBS", "Disconnect");
      PBS_WS_TryConnect();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      kmoniTimeUpdate(new Date() - Replay, "ProjectBS", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr !== "pong") EEWdetect(1, jsonParse(dataStr));
      } catch (e) {
        kmoniTimeUpdate(new Date() - Replay, "ProjectBS", "Error");
      }
    });
    connection.sendUTF("queryjson");

    kmoniTimeUpdate(new Date() - Replay, "ProjectBS", "success");
    setInterval(function () {
      connection.sendUTF("ping");
    }, 600000);
  });

  PBS_WS_Connect();
}
var PBSlastConnectDate = new Date();
function PBS_WS_TryConnect() {
  var timeoutTmp = Math.max(30000 - (new Date() - PBSlastConnectDate), 100);
  setTimeout(PBS_WS_Connect, timeoutTmp);
}
function PBS_WS_Connect() {
  if (PBSWSclient) PBSWSclient.connect("wss://telegram.projectbs.cn/jmaeewws");
  PBSlastConnectDate = new Date();
}

//Wolfx WebSocket接続・受信処理
var WolfxWSclient;
var wolfxConnection;
function Wolfx_WS() {
  if (!config.Source.wolfx.GetData) return;
  WolfxWSclient = new WebSocketClient();

  WolfxWSclient.on("connectFailed", function () {
    kmoniTimeUpdate(new Date() - Replay, "wolfx", "Error");
    Wolfx_WS_TryConnect();
  });

  WolfxWSclient.on("connect", function (connection) {
    wolfxConnection = connection;
    connection.on("error", function () {
      kmoniTimeUpdate(new Date() - Replay, "wolfx", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date() - Replay, "wolfx", "Disconnect");
      Wolfx_WS_TryConnect();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      kmoniTimeUpdate(new Date() - Replay, "wolfx", "success");
      try {
        var json = jsonParse(message.utf8Data);
        switch (json.type) {
          case "jma_eew":
            EEWdetect(2, json);
            break;
          case "jma_eqlist":
            eqInfoUpdate();
            break;
        }
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "wolfx", "Error");
      }
    });
    connection.sendUTF("query_jmaeew");
    kmoniTimeUpdate(new Date() - Replay, "wolfx", "success");
  });

  Wolfx_WS_Connect();
}
var WolfxlastConnectDate = new Date();
function Wolfx_WS_TryConnect() {
  var timeoutTmp = Math.max(30000 - (new Date() - WolfxlastConnectDate), 100);
  setTimeout(Wolfx_WS_Connect, timeoutTmp);
}
function Wolfx_WS_Connect() {
  if (WolfxWSclient) WolfxWSclient.connect("wss://ws-api.wolfx.jp/all_eew");
  WolfxlastConnectDate = new Date();
}

//定期実行
function RegularExecution(roop) {
  if (roop)
    setTimeout(function () {
      RegularExecution(true);
    }, 1000);
  try {
    //EEW解除
    EEW_nowList.forEach(function (elm) {
      if (new Date() - Replay - new Date(elm.origin_time) > 300000) {
        EEWClear(elm.EventID);
      }
    });

    //津波情報解除
    if (tsunamiData && tsunamiData.ValidDateTime <= new Date()) {
      TsunamiInfoControl({
        issue: { time: tsunamiData.ValidDateTime, EventID: null, EarthQuake: null },
        revocation: true,
        cancelled: false,
        areas: [],
        source: null,
        ValidDateTime: null,
      });
    }
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//強震モニタの取得オフセット設定
async function yoyuSetK(func) {
  try {
    var index = 0;
    var resTimeTmp;
    while (!yoyuK) {
      await new Promise((resolve) => {
        if (net.online) {
          var dataTmp = "";
          var request = net.request("http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=" + Number(new Date()));
          request.on("response", (res) => {
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });
            res.on("end", function () {
              try {
                var json = jsonParse(dataTmp);
                if (json) {
                  var resTime = new Date(json.latest_time);
                  if (resTimeTmp !== resTime && 0 < index) yoyuK = new Date() - resTime;
                  resTimeTmp = resTime;
                }
                resolve();
              } catch (err) {
                return;
              }
            });
          });
          request.end();
        }
      });
      if (index > 25) {
        yoyuK = 2500;
        break;
      }
    }
    func();
    return true;
  } catch (err) {
    throw new Error("強震モニタの遅延量の取得でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//情報最終更新時刻を更新
function kmoniTimeUpdate(Updatetime, type, condition, vendor) {
  messageToMainWindow({
    action: "kmoniTimeUpdate",
    Updatetime: Updatetime,
    LocalTime: new Date(),
    vendor: vendor,
    type: type,
    condition: condition,
  });

  kmoniTimeTmp[type] = {
    type: type,
    Updatetime: Updatetime,
    LocalTime: new Date(),
    condition: condition,
  };
}

//情報フォーマット変更・新報検知→EEWcontrol
function EEWdetect(type, json) {
  if (!json) return;
  if (type == 1) {
    //ProjectBS
    try {
      var EBIData = [];
      var EBIStr = String(json.originalTelegram).split("EBI ")[1];
      var codeData = String(json.originalTelegram).split(" ");
      if (EBIStr) {
        EBIStr = EBIStr.split("ECI")[0].split("EII")[0].split(" 9999=")[0];
        EBIStr = EBIStr.split(" ");
        if (EBIStr.length % 4 == 0) {
          for (let i = 0; i < EBIStr.length; i += 4) {
            var sectName = EEWSectName[EBIStr[i]];
            var maxInt = EBIStr[i + 1].substring(1, 3);
            var minInt = EBIStr[i + 1].substring(3, 5);
            minInt = minInt == "//" ? null : shindoConvert(minInt);
            maxInt = maxInt == "//" ? null : shindoConvert(maxInt);
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
        }
      }

      var EEWdata = {
        alertflg: json.isWarn ? "警報" : "予報",
        EventID: Number(json.eventID),
        serial: json.serial,
        report_time: new Date(json.issue.time),
        magnitude: json.hypocenter.magnitude,
        maxInt: shindoConvert(json.maxIntensity, 0),
        depth: json.hypocenter.location.depth,
        is_cancel: json.isCancel,
        is_final: json.isFinal,
        is_training: codeData[2] == "01" || codeData[2] == "30",
        latitude: json.hypocenter.location.lat,
        longitude: json.hypocenter.location.lng,
        region_name: json.hypocenter.name,
        origin_time: new Date(json.originTime),
        isPlum: json.hypocenter.isEstimate,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "ProjectBS",
      };
      EEWcontrol(EEWdata);
    } catch (err) {
      return;
    }
  } else if (type == 2) {
    //wolfx
    try {
      var EBIData = [];
      var EBIStr = String(json.OriginalText).split("EBI ")[1];
      if (EBIStr) {
        EBIStr = EBIStr.split("ECI")[0].split("EII")[0].split(" 9999=")[0];
        EBIStr = EBIStr.split(" ");
        if (EBIStr.length % 4 == 0) {
          for (let i = 0; i < EBIStr.length; i += 4) {
            var sectName = EEWSectName[EBIStr[i]];
            var maxInt = EBIStr[i + 1].substring(1, 3);
            var minInt = EBIStr[i + 1].substring(3, 5);
            minInt = minInt == "//" ? null : minInt;
            maxInt = maxInt == "//" ? null : maxInt;
            if (maxInt == 99) maxInt = minInt;
            var arrivalTime = EBIStr[i + 2];
            arrivalTime = arrivalTime.substring(0, 2) + ":" + arrivalTime.substring(2, 4) + ":" + arrivalTime.substring(4, 6);
            arrivalTime = new Date(dateEncode(4, null) + " " + arrivalTime);

            var alertFlg = EBIStr[i + 3].substring(0, 1) == "1";
            var arrived = EBIStr[i + 3].substring(1, 2) == "1";

            EBIData.push({
              Code: Number(EBIStr[i]),
              Name: sectName,
              Alert: alertFlg,
              IntTo: shindoConvert(maxInt),
              IntFrom: shindoConvert(minInt),
              ArrivalTime: arrivalTime,
              Arrived: arrived,
            });
          }
        }
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
        region_name: json.Hypocenter,
        origin_time: new Date(json.OriginTime),
        isPlum: json.isAssumption,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "wolfx",
      };

      EEWcontrol(EEWdata, json);
    } catch (err) {
      return;
    }
  } else if (type == 3) {
    //axis
    try {
      var alertflgTmp = json.Title == "緊急地震速報（予報）" ? "予報" : "警報";
      var EBIData = [];
      json.Forecast.forEach(function (elm) {
        EBIData.push({
          Code: elm.Code,
          Name: elm.Name,
          Alert: null,
          IntTo: shindoConvert(elm.Intensity.To),
          IntFrom: shindoConvert(elm.Intensity.From),
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
    } catch (err) {
      kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
    }
  } else if (type == 4) {
    //P2P
    try {
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
          Alert: elm.kindCode == 10 || elm.kindCode == 11 || elm.kindCode == 19,
          IntTo: shindoConvert(elm.scaleTo),
          IntFrom: shindoConvert(elm.scaleFrom),
          ArrivalTime: new Date(elm.arrivalTime),
          Arrived: elm.kindCode == 11,
        });
      });
      if (!json.issue) return;
      var EEWdata = {
        alertflg: "警報",
        EventID: Number(json.issue.eventId),
        serial: Number(json.issue.serial),
        report_time: new Date(json.issue.time),
        magnitude: magnitudeTmp,
        maxInt: shindoConvert(maxIntTmp, 0),
        depth: depthTmp,
        is_cancel: Boolean(json.canceled),
        is_final: null,
        is_training: Boolean(json.test),
        latitude: latitudeTmp,
        longitude: longitudeTmp,
        region_name: region_nameTmp,
        origin_time: origin_timeTmp,
        isPlum: conditionTmp,
        warnZones: EBIData,
        source: "P2P_EEW",
      };

      EEWcontrol(EEWdata);
    } catch (err) {
      kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
    }
  }
}

//EEW情報マージ
function EEWcontrol(data) {
  if (!data) return; //データがない場合、処理終了
  try {
    if (!config.Info.EEW.showtraining && data.is_training) return; //訓練法を受信するかどうか（設定に準拠）
    if (!data.origin_time || !data.EventID || !data.serial || !data.latitude || !data.longitude) return;

    //５分以上前の地震／未来の地震（リプレイ時）を除外
    var pastTime = new Date() - Replay - data.origin_time;
    if (pastTime > 300000 || pastTime < 0) return;

    //現在地との距離
    if (data.latitude && data.longitude) data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);

    data.TimeTable = TimeTable_JMA2001[depthFilter(data.depth)];
    if (data.source == "simulation") {
      var EEWdataTmp = EEW_Data.find(function (elm) {
        return !elm.simulation;
      });
      if (EEWdataTmp) return;
    } else {
      var EEWdataTmp = EEW_Data.forEach(function (elm) {
        if (elm.simulation) EEWClear(elm.EQ_id);
      });
    }
    if (data.source == "simulation" && !data.isPlum) {
      var estIntTmp = {};
      if (!data.is_cancel) {
        if (!data.userIntensity) data.userIntensity = calcInt(data.magnitude, data.depth, data.latitude, data.longitude, config.home.latitude, config.home.longitude, config.home.arv);
        if (!data.arrivalTime) {
          for (let index = 0; index < data.TimeTable.length; index++) {
            var elm = data.TimeTable[index];
            if (elm.R > data.distance) {
              if (index > 0) {
                var elm2 = data.TimeTable[index - 1];
                var SSec = elm2.S + ((elm.S - elm2.S) * (data.distance - elm2.R)) / (elm2.S - elm2.R);
              } else SSec = 0;
              break;
            }
          }
          data.arrivalTime = new Date(Number(data.origin_time) + SSec * 1000);
        }
        if (data.depth <= 150) {
          if (!sesmicPoints) sesmicPoints = require("./Resource/PointSeismicIntensityLocation.json");
          Object.keys(sesmicPoints).forEach(function (key) {
            elm = sesmicPoints[key];
            if (elm.arv && elm.sect) {
              var estInt = calcInt(data.magnitude, data.depth, data.latitude, data.longitude, elm.location[0], elm.location[1], elm.arv);
              if (!estIntTmp[elm.sect] || estInt > estIntTmp[elm.sect]) estIntTmp[elm.sect] = estInt;
            }
          });
          Object.keys(estIntTmp).forEach(function (elm) {
            var shindo = shindoConvert(estIntTmp[elm]);
            var sectData;
            if (data.warnZones) {
              var sectData = data.warnZones.find(function (elm2) {
                return elm2.Name == elm;
              });
            } else data.warnZones = [];
            if (!sectData) {
              data.warnZones.push({
                Name: elm,
                IntTo: shindo,
                IntFrom: shindo,
                Alert: data.source == "simulation" ? shindoConvert(shindo, 5) >= 4 : null,
              });
            }
          });
        }
      }
    }

    if (data.warnZones && data.warnZones.length) {
      //設定された細分区域のデータ参照
      var userSect = data.warnZones.find(function (elm2) {
        return elm2.Name == config.home.Section;
      });

      //現在地の予想震度・到達予想時刻
      if (userSect) {
        data.userIntensity = config.Info.EEW.IntType == "max" ? userSect.IntTo : userSect.IntFrom;
        if (userSect.ArrivalTime) data.arrivalTime = userSect.ArrivalTime;
      }
    }

    var EQJSON = EEW_Data.find(function (elm) {
      return elm.EQ_id == data.EventID;
    });
    if (EQJSON) {
      //同一地震のデータが既に存在する場合
      var EEWJSON = EQJSON.data.find(function (elm2) {
        return elm2.serial == data.serial;
      });
      if (EEWJSON) {
        //同じ報数の情報が既に存在する（マージ処理へ）
        // prettier-ignore
        var oneBefore = data.serial == Math.max.apply(null, EQJSON.data.map(function(o){ return o.serial;}));
        if (oneBefore) {
          //最新報である場合
          var changed = false;
          //マージ元のデータ
          var oneBeforeData = EQJSON.data.find(function (elm) {
            return elm.serial == data.serial;
          });

          //キーごとにマージ
          Object.keys(oneBeforeData).forEach(function (elm) {
            if (data[elm] && (!oneBeforeData[elm] || oneBeforeData[elm].length == 0)) {
              oneBeforeData[elm] = data[elm];
              changed = true;
            }
          });

          if (Array.isArray(data.warnZones)) {
            data.warnZones.forEach(function (elm) {
              //一致する細分区域のデータを検索
              var SectData = oneBeforeData.warnZones.find(function (elm2) {
                return elm.Name == elm2.Name;
              });
              if (SectData) {
                elm = Object.assign(SectData, elm); //データをマージ
                changed = true;
              }
            });
          }
          //データに変化があれば、警報処理へ
          if (changed) EEWAlert(oneBeforeData, false, true);
        }
      } else {
        //同じ報数の情報がない場合（データ登録）
        var newest =
          data.serial >
          Math.max.apply(
            null,
            EQJSON.data.map(function (o) {
              return o.serial;
            })
          );
        if (newest) {
          //最新の報である
          var EQJSON = EEW_Data.find(function (elm) {
            return elm.EQ_id == data.EventID;
          });
          EQJSON.data.push(data); //データ追加
          if (data.is_cancel) EQJSON.canceled = true;
          EEWAlert(data, false); //警報処理
        }
      }
    } else {
      //第１報
      if (!data.maxInt) {
        if (!config.Info.EEW.IntQuestion) return; //予想最大震度不明を無視するか（設定に準拠）
      } else if (shindoConvert(config.Info.EEW.IntThreshold, 5) > shindoConvert(data.maxInt, 5) && shindoConvert(data.maxInt) !== "?") {
        return; //予想最大震度通知条件（設定に準拠）
      }

      if (!data.userIntensity) {
        if (!config.Info.EEW.userIntQuestion) return; //予想震度不明を無視するか（設定に準拠）
      } else if (shindoConvert(config.Info.EEW.userIntThreshold, 5) > shindoConvert(data.userIntensity, 5) && shindoConvert(data.userIntensity) !== "?") {
        return; //予想震度（細分区域）通知条件（設定に準拠）
      }

      //データ追加
      EEW_Data.push({
        EQ_id: data.EventID,
        canceled: false,
        simulation: data.source == "simulation",
        data: [data],
      });

      EEWAlert(data, true); //警報処理
    }
  } catch (err) {
    throw new Error("緊急地震速報データの処理（マージ）に失敗しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

function calcInt(magJMA, depth, epiLat, epiLng, pointLat, pointLng, arv) {
  const magW = magJMA - 0.171;
  const long = 10 ** (0.5 * magW - 1.85) / 2;
  const epicenterDistance = geosailing(epiLat, epiLng, pointLat, pointLng);
  const hypocenterDistance = (depth ** 2 + epicenterDistance ** 2) ** 0.5 - long;
  const x = Math.max(hypocenterDistance, 3);
  const gpv600 = 10 ** (0.58 * magW + 0.0038 * depth - 1.29 - Math.log10(x + 0.0028 * 10 ** (0.5 * magW)) - 0.002 * x);

  // 最大速度を工学的基盤（Vs=600m/s）から工学的基盤（Vs=400m/s）へ変換を行う
  const pgv400 = gpv600 * 1.31;
  const pgv = pgv400 * arv;
  return 2.68 + 1.72 * Math.log10(pgv);
}

//EarlyEst地震情報マージ
function EarlyEstControl(data) {
  try {
    if (!data) return;
    if (!data.origin_time) return;

    var pastTime = new Date() - Replay - data.origin_time;
    if (pastTime > 300000 || pastTime < 0) return;

    if (data.latitude && data.longitude) data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);

    data.TimeTable = TimeTable_JMA2001[depthFilter(data.depth)];

    var EQJSON = EarlyEst_Data.find(function (elm) {
      return elm.EQ_id == data.EventID;
    });
    if (EQJSON) {
      //ID・報の両方一致した情報が存在するか
      var EEWJSON = EQJSON.data.find(function (elm2) {
        return elm2.serial == data.serial;
      });
      if (!EEWJSON) {
        //最新の報かどうか
        var newest =
          data.serial >
          Math.max.apply(
            null,
            EQJSON.data.map(function (o) {
              return o.serial;
            })
          );

        if (newest) {
          //第２報以降
          var EQJSON = EarlyEst_Data.find(function (elm) {
            return elm.EQ_id == data.EventID;
          });
          EarlyEstAlert(data, false);
          EQJSON.data.push(data);
          if (data.is_cancel) {
            EQJSON.canceled = true;
          }
        }
      }
    } else {
      //第１報
      EarlyEstAlert(data, true);
      EarlyEst_Data.push({
        EQ_id: data.EventID,
        canceled: false,
        data: [data],
      });
    }
  } catch (err) {
    throw new Error("Early-Est データの処理（マージ）に失敗しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//EEW解除処理
function EEWClear(EventID) {
  try {
    EEW_nowList = EEW_nowList.filter(function (elm) {
      return elm.EventID !== EventID;
    });
    messageToMainWindow({
      action: "EEWAlertUpdate",
      data: EEW_nowList,
    });

    if (EEW_nowList.length == 0) {
      EEWNow = false;
      //パワーセーブ再開
      if (psBlock && powerSaveBlocker.isStarted(psBlock)) powerSaveBlocker.stop(psBlock);
      worker.postMessage({ action: "EEWNow", data: EEWNow });
    }
  } catch (err) {
    throw new Error("緊急地震速報の解除処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//EEW通知（音声・画面表示等）
function EEWAlert(data, first, update) {
  try {
    EEWNow = true;
    worker.postMessage({ action: "EEWNow", data: EEWNow });

    //【現在のEEW】から同一地震、古い報を削除
    EEW_nowList = EEW_nowList.filter(function (elm) {
      return elm.EventID !== data.EventID;
    });
    //【現在のEEW】配列に追加
    EEW_nowList.push(data);

    if (update) {
      //第２報以降
      messageToMainWindow({
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    } else {
      //第１報

      soundPlay(data.alertflg == "警報" ? "EEW1" : "EEW2");
      speak(EEWTextGenerate(data), !first);

      messageToMainWindow({
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: false,
      });

      var notice_setting = first ? config.notice.window.EEW : config.notice.window.EEW_Update;
      if (notice_setting == "push" && (!mainWindow || mainWindow.isMinimized() || !mainWindow.isFocused() || !mainWindow.isVisible())) {
        var EEWNotification = new Notification({
          title: "緊急地震速報" + data.alertflg + "#" + data.serial,
          body: data.region_name + "\n予想最大震度：" + shindoConvert(data.maxInt, 1) + "  M" + (data.magnitude ? data.magnitude : "不明") + "  深さ：" + (data.depth ? data.depth + "km" : "不明") + (data.userIntensity ? "\n現在地の予想震度：" + data.userIntensity : ""),
          icon: path.join(__dirname, "img/icon.ico"),
        });
        EEWNotification.show();
        EEWNotification.on("click", function () {
          createWindow();
        });
      } else if (notice_setting == "openWindow") createWindow();
    }

    eqInfoControl(
      [
        {
          status: data.is_training ? "訓練" : "発表",
          eventId: data.EventID,
          category: "EEW",
          reportDateTime: new Date(data.report_time),
          OriginTime: new Date(data.origin_time),
          epiCenter: data.region_name,
          M: data.isPlum ? null : Number(data.magnitude),
          maxI: shindoConvert(data.maxInt),
          cancel: Boolean(data.is_cancel),
          DetailURL: [],
          axisData: null,
        },
      ],
      "jma",
      true
    );

    //スリープ回避開始
    if (!psBlock || !powerSaveBlocker.isStarted(psBlock)) psBlock = powerSaveBlocker.start("prevent-display-sleep");
  } catch (err) {
    throw new Error("緊急地震速報の通知処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//EarlyEst通知（音声・画面表示等）
function EarlyEstAlert(data, first, update) {
  try {
    EEWNow = true;

    //【現在のEEW】から同一地震、古い報を削除
    EEW_nowList = EEW_nowList.filter(function (elm) {
      return elm.EventID !== data.EventID;
    });
    //【現在のEEW】配列に追加
    EEW_nowList.push(data);

    if (!update) {
      if (first) {
        createWindow();
        soundPlay("EEW2");
      }
      messageToMainWindow({
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: false,
      });
      if (!mainWindow) {
        var EEWNotification = new Notification({
          title: "Early-Est 地震情報" + " #" + data.serial,
          body: data.region_name + "\n M" + data.magnitude + "  深さ：" + data.depth,
          icon: path.join(__dirname, "img/icon.ico"),
        });
        EEWNotification.show();
        EEWNotification.on("click", function () {
          createWindow();
        });
      }
    } else {
      messageToMainWindow({
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    }

    //スリープ回避開始
    if (!psBlock || !powerSaveBlocker.isStarted(psBlock)) psBlock = powerSaveBlocker.start("prevent-display-sleep");
  } catch (err) {
    throw new Error("Early-Est地震情報の通知処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//🔴地震情報🔴

//地震情報更新処理
function eqInfoUpdate(roop) {
  if (roop)
    setTimeout(function () {
      eqInfoUpdate(true);
    }, config.Info.EQInfo.Interval);
  try {
    EQI_JMAXMLList_Req(EQInfoFetchCount == 0, EQInfoFetchCount);
    EQI_narikakunList_Req("https://ntool.online/api/earthquakeList?year=" + new Date().getFullYear() + "&month=" + (new Date().getMonth() + 1), 10, true, EQInfoFetchCount);
    EQI_USGS_Req();
    EQI_JMAHPList_Req();
  } catch (err) {
    throw new Error("地震情報の処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
  EQInfoFetchCount++;
}

//気象庁XMLリスト取得→EQI_JMAXML_Req
function EQI_JMAXMLList_Req(LongPeriodFeed, count) {
  var request = net.request(LongPeriodFeed ? "https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml" : "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        const parser = new new JSDOM().window.DOMParser();
        const xml = parser.parseFromString(dataTmp, "text/html");
        if (!xml) return;
        var EQInfoCount = 0;
        xml.querySelectorAll("entry").forEach(function (elm) {
          var url;
          var urlElm = elm.querySelector("id");
          if (urlElm) url = urlElm.textContent;
          if (!url) return;
          var title = elm.querySelector("title").textContent;
          if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度に関する情報" || title == "遠地地震に関する情報" || title == "顕著な地震の震源要素更新のお知らせ") {
            if (EQInfoCount <= config.Info.EQInfo.ItemCount) EQI_JMAXML_Req(url, count);
            EQInfoCount++;
          } else if (title == "津波情報a" || title == "津波警報・注意報・予報a") EQI_JMAXML_Req(url, count);
        });
        kmoniTimeUpdate(new Date() - Replay, "JMAXML", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "JMAXML", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "JMAXML", "Error");
  });
  request.end();
}

//気象庁XML 取得・フォーマット変更→eqInfoControl
function EQI_JMAXML_Req(url, count) {
  if (!url || jmaXML_Fetched.includes(url)) return;
  jmaXML_Fetched.push(url);
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        const parser = new new JSDOM().window.DOMParser();
        const xml = parser.parseFromString(dataTmp, "text/html");
        if (!xml) return false;

        var title = xml.title;
        cancel = xml.querySelector("InfoType").textContent == "取消";

        if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度に関する情報" || title == "遠地地震に関する情報" || title == "顕著な地震の震源要素更新のお知らせ") {
          //地震情報
          var EarthquakeElm = xml.querySelector("Body").querySelector("Earthquake");
          var originTimeTmp;
          var epiCenterTmp;
          var magnitudeTmp;
          if (EarthquakeElm) {
            originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
            epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
            magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].textContent);
          }

          var IntensityElm = xml.querySelector("Body").querySelector("Intensity");
          var maxIntTmp;
          if (IntensityElm) maxIntTmp = shindoConvert(IntensityElm.querySelector("Observation").querySelector("MaxInt").textContent);
          if (maxIntTmp == "[objectHTMLUnknownElement]") maxIntTmp = null;
          eqInfoControl(
            [
              {
                status: xml.querySelector("Status").textContent,
                eventId: xml.querySelector("EventID").textContent,
                category: xml.title,
                OriginTime: originTimeTmp,
                epiCenter: epiCenterTmp,
                M: Number(magnitudeTmp),
                maxI: shindoConvert(maxIntTmp),
                cancel: Boolean(cancel),
                reportDateTime: new Date(xml.querySelector("ReportDateTime").textContent),
                DetailURL: [url],
                axisData: null,
              },
            ],
            "jma",
            false,
            count
          );
        } else if (title == "津波情報a" || title == "津波警報・注意報・予報a") {
          //津波予報
          var tsunamiDataTmp;
          var EventID = xml.querySelector("EventID").textContent.split(" ").map(Number);
          var EQData = [];
          xml.querySelectorAll("Earthquake").forEach(function (elm, index) {
            var magTmp = elm.getElementsByTagName("jmx_eb:Magnitude")[0];
            magTmp = magTmp !== "NaN" && magTmp ? magTmp.textContent : null;
            var ECTmp = elm.querySelector("Name");
            ECTmp = ECTmp ? ECTmp.textContent : null;

            EQData.push({
              status: xml.querySelector("Status").textContent,
              eventId: EventID[index],
              category: "Tsunami",
              OriginTime: elm.querySelector("OriginTime") ? new Date(elm.querySelector("OriginTime").textContent) : new Date(),
              epiCenter: ECTmp,
              M: Number(magTmp),
              maxI: null,
              cancel: Boolean(cancel),
              DetailURL: [url],
              axisData: null,
            });
          });
          eqInfoControl(EQData, "jma", false, count);

          if (cancel) {
            tsunamiDataTmp = {
              status: xml.querySelector("Status").textContent,
              issue: { time: new Date(xml.querySelector("ReportDateTime").textContent), EventID: null, EarthQuake: null },
              areas: [],
              revocation: true,
              source: "jmaXML",
              ValidDateTime: null,
            };
          } else {
            var ValidDateTimeElm = xml.querySelector("ValidDateTime");
            if (ValidDateTimeElm) var ValidDateTimeTmp = new Date(ValidDateTimeElm.textContent);
            else {
              var ValidDateTimeTmp = new Date(xml.querySelector("ReportDateTime").textContent);
              ValidDateTimeTmp.setHours(ValidDateTimeTmp.getHours() + 12);
            }
            if (ValidDateTimeTmp < new Date()) return;

            tsunamiDataTmp = {
              status: xml.querySelector("Status").textContent,
              issue: { time: new Date(xml.querySelector("ReportDateTime").textContent), EventID: EventID, EarthQuake: EQData },
              areas: [],
              revocation: false,
              source: "jmaXML",
              ValidDateTime: ValidDateTimeTmp,
            };

            var tsunamiElm = xml.querySelector("Body").querySelector("Tsunami");
            if (tsunamiElm) {
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
                        maxHeightTmp = maxheightElm[0].getAttribute("description").replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                        });
                      }
                    }
                    var stations = [];
                    if (elm.querySelector("Station")) {
                      elm.querySelectorAll("Station").forEach(function (elm2) {
                        var ArrivalTimeTmp;
                        var ConditionTmp;
                        var nameTmp = elm2.querySelector("Name").textContent;
                        var codeTmp = elm2.querySelector("Code").textContent;
                        var highTideTimeTmp = new Date(elm2.querySelector("HighTideDateTime").textContent);
                        if (elm2.querySelector("FirstHeight").querySelector("ArrivalTime")) ArrivalTimeTmp = new Date(elm2.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                        if (elm2.querySelector("Condition")) ConditionTmp = elm2.querySelector("Condition").textContent;
                        stations.push({
                          name: nameTmp,
                          code: codeTmp,
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
                        var ArrivalTimeTmp;
                        var firstHeightConditionTmp;
                        var firstHeightInitialTmp;
                        var maxheightTime;
                        var maxHeightCondition;
                        var oMaxHeightTmp;
                        var nameTmp = elm2.querySelector("Name").textContent;
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

                          var maxheightTimeElm = elm2.querySelector("MaxHeight").querySelector("DateTime");
                          if (maxheightTimeElm) maxheightTime = new Date(maxheightTimeElm.textContent);

                          var maxheightConditionElm = elm2.querySelector("MaxHeight").querySelector("Condition");
                          if (maxheightConditionElm) maxHeightCondition = elm2.querySelector("MaxHeight").querySelector("Condition").textContent;
                        }

                        var codeTmp = elm2.querySelector("Code").textContent;

                        stations.push({
                          name: nameTmp,
                          code: codeTmp,
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
                        } else {
                          tsunamiItem.stations.push(elm2);
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
        kmoniTimeUpdate(new Date() - Replay, "JMAXML", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "JMAXML", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "JMAXML", "Error");
  });
  request.end();
}

var NankaiTroughInfo;

//気象庁HPリクエスト
function EQI_JMAHPList_Req() {
  var request = net.request("https://www.jma.go.jp/bosai/quake/data/list.json");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json) return false;
        var nankai = json.find(function (elm) {
          return elm.ttl == "南海トラフ地震関連解説情報";
        });
        if (nankai) EQI_JMAHP_Req("https://www.jma.go.jp/bosai/quake/data/" + nankai.json);

        kmoniTimeUpdate(new Date() - Replay, "JMAHP", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "JMAHP", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "JMAHP", "Error");
  });
  request.end();
}

//気象庁HPリクエスト
function EQI_JMAHP_Req(url) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json) return false;

        var data = {
          title: json.Control.Title, //南海トラフ地震関連解説情報など
          kind: null, //定例など
          reportDate: new Date(json.Head.ReportDateTime), //時刻
          HeadLine: json.Head.Headline.Text, //要約
          Text: "",
          Appendix: "",
          NextAdvisory: "",
          Text2: "",
        };
        if (json.Body.EarthquakeInfo) {
          if (json.Body.EarthquakeInfo.InfoSerial) data.kind = json.Body.EarthquakeInfo.InfoSerial.Name;
          data.Text = json.Body.EarthquakeInfo.Text;
          if (json.Body.EarthquakeInfo.Appendix) data.Appendix = json.Body.EarthquakeInfo.Appendix;
        }
        if (json.Body.NextAdvisory) data.NextAdvisory = json.Body.NextAdvisory;
        if (json.Body.Text) data.Text2 = json.Body.Text.reportDate;

        if (!NankaiTroughInfo || NankaiTroughInfo.reportDate < data.reportDate) {
          NankaiTroughInfo = data;

          messageToMainWindow({
            action: "NankaiTroughInfo",
            data: NankaiTroughInfo,
          });

          if (nankaiWindow) {
            nankaiWindow.webContents.send("message2", {
              action: "NankaiTroughInfo",
              data: NankaiTroughInfo,
            });
          }
        }
        kmoniTimeUpdate(new Date() - Replay, "JMAHP", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "JMAHP", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "JMAHP", "Error");
  });
  request.end();
}

//USGS 取得・フォーマット変更→eqInfoControl
var usgsLastGenerated = 0;
function EQI_USGS_Req() {
  var request = net.request("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=" + config.Info.EQInfo.ItemCount);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json) return false;
        if (json.features[0].properties && json.features[0].properties.updated && usgsLastGenerated < json.features[0].properties.updated) {
          usgsLastGenerated = json.features[0].properties.updated;

          var dataTmp2 = [];
          json.features.forEach(function (elm) {
            var FECode = FERegion.features.find(function (elm2) {
              return turf.booleanPointInPolygon(elm.geometry.coordinates, elm2);
            });

            dataTmp2.push({
              eventId: elm.id,
              category: null,
              OriginTime: new Date(elm.properties.time),
              epiCenter: FECode.properties.nameJA,
              M: Math.round(elm.properties.mag * 10) / 10,
              maxI: null,
              DetailURL: [elm.properties.url],
            });
          });
          eqInfoControl(dataTmp2, "usgs");
        }
        kmoniTimeUpdate(new Date() - Replay, "USGS", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "USGS", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "USGS", "Error");
  });

  request.end();
}

//narikakun地震情報API リスト取得→EQI_narikakun_Req
function EQI_narikakunList_Req(url, num, first, count) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
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
        }
        for (let elm of narikakun_URLs) {
          var eidTmp = String(elm).split("_")[2];
          if (nakn_Fetched.indexOf(url) === -1) {
            nakn_Fetched.push(elm);
            EQI_narikakun_Req(elm, count);
          }
          if (!narikakun_EIDs.includes(eidTmp)) {
            narikakun_EIDs.push(eidTmp);
            if (narikakun_EIDs.length == config.Info.EQInfo.ItemCount) break;
          }
        }

        if (narikakun_URLs.length > config.Info.EQInfo.ItemCount) {
          narikakun_URLs = [];
          narikakun_EIDs = [];
        }
        kmoniTimeUpdate(new Date() - Replay, "ntool", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "ntool", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "ntool", "Error");
  });
  request.end();
}

//narikakun地震情報API 取得・フォーマット変更→eqInfoControl
function EQI_narikakun_Req(url, count) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json) return;

        var originTimeTmp = json.Body.Earthquake ? new Date(json.Body.Earthquake.OriginTime) : null;
        var epiCenterTmp = json.Body.Earthquake ? json.Body.Earthquake.Hypocenter.Name : null;
        var MagnitudeTmp = json.Body.Earthquake ? json.Body.Earthquake.Magnitude : null;
        var MaxITmp = json.Body.Intensity ? json.Body.Intensity.Observation.MaxInt : null;
        var cancel = json.Head.InfoType == "取消";
        var dataTmp2 = [
          {
            status: json.Control.Status,
            eventId: json.Head.EventID,
            category: json.Head.Title,
            OriginTime: new Date(originTimeTmp),
            epiCenter: epiCenterTmp,
            M: Number(MagnitudeTmp),
            maxI: shindoConvert(MaxITmp),
            cancel: Boolean(cancel),
            reportDateTime: new Date(json.Head.ReportDateTime),
            DetailURL: [url],
            axisData: null,
          },
        ];
        eqInfoControl(dataTmp2, "jma", false, count);
        kmoniTimeUpdate(new Date() - Replay, "ntool", "success");
      } catch (err) {
        kmoniTimeUpdate(new Date() - Replay, "ntool", "Error");
      }
    });
  });
  request.on("error", () => {
    kmoniTimeUpdate(new Date() - Replay, "ntool", "Error");
  });
  request.end();
}

var EQInfoData = {};
//地震情報マージ→eqInfoAlert
function eqInfoControl(dataList, type, EEW, count) {
  switch (type) {
    case "jma":
      var eqInfoTmp = [];
      var eqInfoUpdateTmp = [];

      var playAudio = false;
      var changed = false;

      dataList.forEach(function (data) {
        if (!data.eventId) return;
        EQElm = EQInfoData[data.eventId];
        if (EQElm) {
          var EQInfo_Item = {
            eventId: EQElm.eventId,
            category: null,
            EEW: null,
            reportDateTime: null,
            OriginTime: null,
            epiCenter: null,
            M: null,
            maxI: null,
            DetailURL: [],
            axisData: [],
          };
          EQElm.raw_data.push(data);
          var rawData = EQElm.raw_data.sort(function (a, b) {
            return a.reportDateTime < b.reportDateTime ? -1 : 1;
          });
          rawData.forEach(function (elm, index) {
            if (elm.cancel) {
              rawData.slice(0, index).forEach(function (elm2, index2) {
                if (elm2.category == elm.category) rawData[index2].cancel = true;
              });
            }
          });
          rawData.forEach(function (elm) {
            if (!config.Info.EQInfo.showtraining && elm.status == "訓練") return;
            if (!config.Info.EQInfo.showTest && elm.status == "試験") return;
            if (new Date(elm.reportDateTime) > new Date() - Replay) return;

            if (elm.category == "EEW" && EQElm.EEW == false) return; //EEW以外の情報が既に入っているとき、EEWによる情報を破棄
            else if (elm.category == "EEW") EQElm.EEW = true;
            else if (elm.category != "EEW" && EQElm.EEW == true) {
              //EEW以外の情報が入ってきたとき、EEWによる情報を破棄
              EQElm.EEW == false;
              EQInfo_Item = {
                eventId: EQElm.eventId,
                category: null,
                EEW: false,
                reportDateTime: null,
                OriginTime: null,
                epiCenter: null,
                M: null,
                maxI: null,
                DetailURL: [],
                axisData: [],
              };
            }

            EQInfo_Item.category = elm.category;
            if (!elm.maxI) elm.maxI = null;
            if (Boolean2(elm.OriginTime)) EQInfo_Item.OriginTime = elm.OriginTime;
            if (Boolean2(elm.epiCenter)) EQInfo_Item.epiCenter = elm.epiCenter;
            if (Boolean2(elm.M) && elm.M != "Ｍ不明" && elm.M != "NaN") EQInfo_Item.M = elm.M;
            if (Boolean2(elm.maxI) && elm.maxI !== "?") EQInfo_Item.maxI = elm.maxI;

            if (Array.isArray(elm.DetailURL)) {
              elm.DetailURL.forEach(function (elm2) {
                if (elm2 && !EQInfo_Item.DetailURL.includes(elm2)) {
                  EQInfo_Item.DetailURL.push(elm2);
                }
              });
            }
            if (elm.axisData) EQInfo_Item.axisData.push(elm.axisData);
          });

          EQElm.cancel = !rawData.find(function (elm) {
            return !elm.cancel;
          });

          if (EQElm.category !== EQInfo_Item.category) changed = true;
          if (EQElm.EEW !== EQInfo_Item.EEW) changed = true;
          if (EQElm.OriginTime !== EQInfo_Item.OriginTime) changed = true;
          if (EQElm.epiCenter !== EQInfo_Item.epiCenter) changed = true;
          if (EQElm.M !== EQInfo_Item.M) changed = true;
          if (EQElm.maxI !== EQInfo_Item.maxI) changed = true;
          if (EQElm.DetailURL.length !== EQInfo_Item.DetailURL.length) changed = true;
          if (EQInfo_Item.axisData) changed = true;

          EQElm.category = EQInfo_Item.category;
          EQElm.EEW = EQInfo_Item.EEW;
          EQElm.reportDateTime = EQInfo_Item.reportDateTime;
          EQElm.OriginTime = EQInfo_Item.OriginTime;
          EQElm.epiCenter = EQInfo_Item.epiCenter;
          EQElm.M = EQInfo_Item.M;
          EQElm.maxI = EQInfo_Item.maxI;
          EQElm.DetailURL = EQElm.DetailURL.concat(EQInfo_Item.DetailURL);
          if (EQInfo_Item.axisData) EQElm.axisData = EQInfo_Item.axisData;

          if (EQElm.category == "EEW" && EQInfo_Item.category != "EEW") playAudio = true;

          if (changed) {
            eqInfoUpdateTmp.push(EQElm);
            var i = eqInfo.jma.findIndex(function (elm2) {
              return elm2.eventId == EQElm.eventId;
            });
            eqInfo.jma[i] = EQElm;
          }
        } else {
          EQInfoData[data.eventId] = Object.assign({}, data);
          EQInfoData[data.eventId].raw_data = [Object.assign({}, data)];

          eqInfoTmp.push(data);
          eqInfo.jma.push(data);
          if ((!Boolean2(count) || count > 0) && data.category !== "EEW") playAudio = true;
        }
      });
      if (eqInfoTmp.length > 0) eqInfoAlert(eqInfoTmp, "jma", false, playAudio);
      if (eqInfoUpdateTmp.length > 0) eqInfoAlert(eqInfoUpdateTmp, "jma", true, playAudio);
      break;
    case "usgs":
      dataList = dataList.sort(function (a, b) {
        return a.OriginTime > b.OriginTime ? -1 : 1;
      });
      eqInfoAlert(dataList, "usgs");
      break;
  }
}

//地震情報通知（音声・画面表示等）
function eqInfoAlert(data, source, update, audioPlay) {
  try {
    if (source == "jma") {
      if (audioPlay) soundPlay("EQInfo");

      eqInfo.jma = eqInfo.jma
        .filter(function (elm) {
          return elm.OriginTime;
        })
        .sort(function (a, b) {
          return a.OriginTime > b.OriginTime ? -1 : 1;
        });

      messageToMainWindow({
        action: "EQInfo",
        source: "jma",
        data: eqInfo.jma.slice(0, config.Info.EQInfo.ItemCount),
      });
      data.forEach(function (elm) {
        if (EQI_Window[elm.eventId]) {
          var metadata = EQI_Window[elm.eventId].metadata;
          var EEWDataItem = EEW_Data.find(function (elm2) {
            return elm2.EQ_id == elm.eventId;
          });

          metadata.urls = elm.urls;
          metadata.eew = EEWDataItem;
          metadata.axisData = elm.axisData;
          EQI_Window[elm.eventId].window.webContents.send("message2", metadata);
        }
      });
    } else if (source == "usgs") {
      eqInfo.usgs = data;

      messageToMainWindow({
        action: "EQInfo",
        source: "usgs",
        data: eqInfo.usgs.slice(0, config.Info.EQInfo.ItemCount),
      });
    }
  } catch (err) {
    throw new Error("地震情報の通知処理でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}

//🔴津波情報🔴
function TsunamiInfoControl(data) {
  try {
    if (!config.Info.TsunamiInfo.GetData) return;
    if (!config.Info.TsunamiInfo.showtraining && data.status == "訓練") return;
    if (!config.Info.TsunamiInfo.showTest && data.status == "試験") return;

    var newInfo = !tsunamiData || !tsunamiData.issue || tsunamiData.issue.time < data.issue.time;
    if (newInfo) {
      //情報の有効期限
      if (data.ValidDateTime && data.ValidDateTime < new Date()) return;
      soundPlay("TsunamiInfo");
      tsunamiData = data;

      createWindow(); //アラート
      messageToMainWindow({
        action: "tsunamiUpdate",
        data: data,
        new: newInfo,
      });
      if (tsunamiWindow) {
        tsunamiWindow.webContents.send("message2", {
          action: "tsunamiUpdate",
          data: data,
          new: newInfo,
        });
      }
    }
  } catch (err) {
    throw new Error("津波情報の処理（マージ）でエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
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

//EEW時読み上げ文章 生成
function EEWTextGenerate(EEWData, update) {
  if (EEWData.is_cancel) var text = config.notice.voice.EEWCancel;
  else if (update) var text = config.notice.voice.EEWUpdate;
  else var text = config.notice.voice.EEW;

  text = update ? config.notice.voice.EEWUpdate : config.notice.voice.EEW;
  text = text.replaceAll("{grade}", EEWData.alertflg ? EEWData.alertflg : "");
  text = text.replaceAll("{serial}", EEWData.serial ? EEWData.serial : "");
  text = text.replaceAll("{final}", EEWData.is_final ? "最終報" : "");
  text = text.replaceAll("{magnitude}", EEWData.magnitude ? EEWData.magnitude : "");
  text = text.replaceAll("{maxInt}", EEWData.maxInt ? shindoConvert(EEWData.maxInt, 1) : "");
  text = text.replaceAll("{depth}", EEWData.depth ? EEWData.depth : "");
  text = text.replaceAll("{training}", EEWData.is_training ? "テスト報" : "");
  text = text.replaceAll("{training2}", EEWData.is_training ? "これは訓練報です。" : "");
  text = text.replaceAll("{region_name}", EEWData.region_name ? EEWData.region_name : "");
  text = text.replaceAll("{report_time}", EEWData.report_time ? dateEncode(5, EEWData.report_time) : "");
  text = text.replaceAll("{origin_time}", EEWData.origin_time ? dateEncode(5, EEWData.origin_time) : "");
  if (EEWData.warnZones && EEWData.warnZones.length) {
    var userSect = EEWData.warnZones.find(function (elm2) {
      return elm2.Name == config.home.Section;
    });

    if (userSect) {
      var userInt = config.Info.EEW.IntType == "max" ? userSect.IntTo : userSect.IntFrom;
      text = text.replaceAll("{local_Int}", shindoConvert(userInt, 1));
    } else text = text.replaceAll("{local_Int}", "不明");
  } else text = text.replaceAll("{local_Int}", "不明");

  return text;
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
  messageToMainWindow(notifyData);
}

//JSONパース（拡張）
function jsonParse(str) {
  try {
    str = String(str);
    var json = JSON.parse(str);
  } catch (error) {
    return null;
  }
  return json;
}

//日時フォーマット
function dateEncode(type, dateTmp) {
  if (!dateTmp) dateTmp = new Date();
  else dateTmp = new Date(dateTmp);

  var YYYY = String(dateTmp.getFullYear());
  var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
  var DD = String(dateTmp.getDate()).padStart(2, "0");
  var hh = String(dateTmp.getHours()).padStart(2, "0");
  var mm = String(dateTmp.getMinutes()).padStart(2, "0");
  var ss = String(dateTmp.getSeconds()).padStart(2, "0");
  switch (type) {
    case 1:
      return YYYY + MM + DD + hh + mm + ss;
    case 2:
      return YYYY + MM + DD;
    case 4:
      return YYYY + "/" + MM + "/" + DD;
    case 5:
      return hh + "時" + mm + "分" + ss + "秒";
    default:
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
function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (str === null || str === undefined) ShindoTmp = 12;
  else if (isNaN(str)) {
    str = String(str)
      .replace(/[０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      })
      .replaceAll("＋", "+")
      .replaceAll("－", "-")
      .replaceAll("強", "+")
      .replaceAll("弱", "-")
      .replace(/\s+/g, "");
    switch (str) {
      case "1":
      case "10":
        ShindoTmp = 1;
        break;
      case "2":
      case "20":
        ShindoTmp = 2;
        break;
      case "3":
      case "30":
        ShindoTmp = 3;
        break;
      case "4":
      case "40":
        ShindoTmp = 4;
        break;
      case "5-":
      case "45":
        ShindoTmp = 5;
        break;
      case "5+":
      case "50":
        ShindoTmp = 6;
        break;
      case "6-":
      case "55":
        ShindoTmp = 7;
        break;
      case "6+":
      case "60":
        ShindoTmp = 8;
        break;
      case "7":
      case "70":
        ShindoTmp = 9;
        break;
      case "震度5-以上未入電":
      case "5+?":
        ShindoTmp = 11;
        break;
      case "-1":
      case "?":
      case "不明":
      default:
        ShindoTmp = 12;
    }
  } else {
    if (str < 0.5) ShindoTmp = 0;
    else if (str < 1.5) ShindoTmp = 1;
    else if (str < 2.5) ShindoTmp = 2;
    else if (str < 3.5) ShindoTmp = 3;
    else if (str < 4.5) ShindoTmp = 4;
    else if (str < 5) ShindoTmp = 5;
    else if (str < 5.5) ShindoTmp = 6;
    else if (str < 6) ShindoTmp = 7;
    else if (str < 6.5) ShindoTmp = 8;
    else if (6.5 <= str) ShindoTmp = 9;
    else ShindoTmp = 12;
  }
  switch (responseType) {
    case 1:
      var ConvTable = ["0", "1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7", undefined, "５弱以上未入電", "不明"];
      break;
    case 2:
      var ConvTable = [[config.color.Shindo["0"].background, config.color.Shindo["0"].color], [config.color.Shindo["1"].background, config.color.Shindo["1"].color], [config.color.Shindo["2"].background, config.color.Shindo["2"].color], [config.color.Shindo["3"].background, config.color.Shindo["3"].color], [config.color.Shindo["4"].background, config.color.Shindo["4"].color], [config.color.Shindo["5m"].background, config.color.Shindo["5m"].color], [config.color.Shindo["5p"].background, config.color.Shindo["5p"].color], [config.color.Shindo["6m"].background, config.color.Shindo["6m"].color], [config.color.Shindo["6p"].background, config.color.Shindo["6p"].color], [config.color.Shindo["7"].background, config.color.Shindo["7"].color], undefined, [config.color.Shindo["5p?"].background, config.color.Shindo["5p?"].color], [config.color.Shindo["?"].background, config.color.Shindo["?"].color]];
      break;
    case 3:
      var ConvTable = [null, "1", "2", "3", "4", "5m", "5p", "6m", "6p", "7", undefined, "5p?", null];
      break;
    case 4:
      var ConvTable = [0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 7, undefined, 4.5, null];
      break;
    case 5:
      var ConvTable = [0, 1, 2, 3, 4, 5, 6, 7, 8, undefined, 10, null, 11];
      break;
    case 0:
    default:
      var ConvTable = ["0", "1", "2", "3", "4", "5-", "5+", "6-", "6+", "7", undefined, "未", "?"];
      break;
  }
  return ConvTable[ShindoTmp];
}

//２地点の緯度経度から距離（km）を算出
function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}

//連想配列オブジェクトのマージ
function mergeDeeply(target, source, opts) {
  try {
    const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
    const isConcatArray = opts && opts.concatArray;
    let result = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      for (const [sourceKey, sourceValue] of Object.entries(source)) {
        const targetValue = target[sourceKey];
        if (isConcatArray && Array.isArray(sourceValue) && Array.isArray(targetValue)) {
          result[sourceKey] = targetValue.concat(...sourceValue);
        } else if (isObject(sourceValue) && Object.prototype.hasOwnProperty.call(target, sourceKey)) {
          result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
        } else {
          Object.assign(result, { [sourceKey]: sourceValue });
        }
      }
    }
    return result;
  } catch (err) {
    throw new Error("JSONのマージでエラーが発生しました。エラーメッセージは以下の通りです。\n" + err);
  }
}
function ConvertJST(time) {
  return new Date(time.setHours(time.getHours() + 9));
}
function depthFilter(depth) {
  if (!isFinite(depth) || depth < 0) return 0;
  else if (depth > 700) return 700;
  else if (200 <= depth) return Math.floor(depth / 10) * 10;
  else if (50 <= depth) return Math.floor(depth / 5) * 5;
  else return Math.floor(depth / 2) * 2;
}
function Boolean2(elm) {
  return (elm !== null) & (elm !== undefined) && elm !== "" && elm !== false && !Number.isNaN(elm) && elm !== "Invalid Date";
}
