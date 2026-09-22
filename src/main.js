// eslint-disable-next-line no-undef
process.env.TZ = "Asia/Tokyo";
// eslint-disable-next-line no-undef
process.title = 'Zero Quake';

import {
  JMA_Int_Points,
  Boolean2,
} from "./main/constants.js";
import {
  MainWindow,
  SettingWindow,
  TsunamiWindow,
  WorkerWindow,
  NankaiWindow,
  EQI_Window,
  initWindowContext,
  messageToMainWindow,
  SystemNotification,
  CreateMainWindow,
  Create_WorkerWindow,
  Create_SettingWindow,
  Create_TsunamiWindow,
  Create_NankaiWindow,
  Create_WepaWindow,
  Create_HokkaidoSanrikuWindow,
  Create_KatsudoJokyoWindow,
  EQInfo_createWindow,
} from "./main/windows.js";
import {
  eqInfo,
  initEQInfoContext,
  EQCount_process,
} from "./main/PROC_EQInfo.js";
import {
  Tsunami_Data,
  Tsunami_data_Marged,
  initTsunamiContext,
  ConvertTsunamiInfo,
  TsunamiValidate_bypass,
} from "./main/PROC_Tsunami.js";
import {
  EEW_Storage,
  EEW_Active,
  clearEEWActive,
  initEEWContext,
  EEW_Marge,
  EEW_Clear,
} from "./main/PROC_EEW.js";
import {
  createWorker,
  worker,
  thresholds,
  EQDetect_List,
  clearEQDetectList,
  ConvertKmoni,
  Req_kmoni,
  SetKmoniOffset,
  ConvertSnet,
  Req_SNet,
  Req_TremRts_sta,
  Req_TremRts,
  Req_JMATide_sta,
  Req_JMATide,
  Req_EarlyEst,
  TremRtsData_Marged,
  TremRts_sta,
  kmoniPointsDataTmp,
  SnetPointsDataTmp,
  SeisjsWS,
  Req_Seisjs_sta,
  Seisjs_sta,
  initRTSeisContext,
} from "./main/RX_RTSeis.js";
import {
  Req_JMAXMLList,
  Req_JMA_gaikyo,
  Req_JMA_wepa,
  NankaiTroughInfo,
  HokkaidoSanrikuInfoAll,
  KatsudoJokyoInfoAll,
  UpdateEQInfo,
  initJMAXMLContext,
} from "./main/RX_JMAXML.js";
import {
  update_data,
  checkUpdate,
  Req_USGS,
  initOtherAPIsContext,
} from "./main/RX_OtherAPIs.js";
import {
  P2P,
  AXIS,
  ProjectBS,
  WolfxWS,
  WolfxConnection,
  ProjectBS_Connection,
  initEEWRxContext,
} from "./main/RX_EEW.js";

import electron from "electron";
const { app, BrowserWindow, ipcMain, dialog, Menu } = electron;
import { fileURLToPath } from "url";
import path from "path";
import Store from "electron-store";
import { readFile } from "fs/promises";
import fs from "fs";
import { exec } from "child_process";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var packageJson = JSON.parse(await readFile(path.join(__dirname, "../package.json")));
var package_ver = packageJson.version;
var EQ_FetchCount = 0;

electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-range-request',
    privileges: {
      supportFetchAPI: true,
      standard: true,
      secure: true,
      corsEnabled: true,
      bypassCSP: true
    }
  }
]);

if (app.isPackaged) {
  //メニューバー非表示
  Menu.setApplicationMenu(false);
  //多重起動防止
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.exit(0);
  }
}

const store = new Store();
var defaultConfigVal = {
  system: {
    WindowAutoOpen: true,
    alwaysOnTop: false,
    isFirstRun: false, //初回起動時かどうか判定用（自動起動を設定するため）
    powerSaveBlocking: true,
    zoom: 1,
  },
  home: {
    name: "自宅",
    latitude: 35.68,
    longitude: 139.767,
    Section: "東京都２３区",
    TsunamiSect: "東京湾内湾",
    ShowPin: true,
    arv: 1.27,
    initialBounds: [[98, 20], [154, 46]]
  },
  Info: {
    EEW: {
      kodoriyou: true,
      showtraining: false,
      IntThreshold: 0,
      IntQuestion: true,
      userIntThreshold: 0,
      userIntQuestion: false,
      IntType: "max",
    },
    EQInfo: {
      //ItemCount: 15,//廃止済み
      Interval: 60000,
      showtraining: false,
      showTest: false,
      NotificationSound: true,
      maxI_threshold: "0",
      M_threshold: -5,
      Bypass_threshold: true,
    },
    TsunamiInfo: {
      GetData: true,
      showtraining: false,
      showTest: false,
      NotificationSound: true,
      Global_threshold: 0,
      Local_threshold: -1,
      Bypass_threshold: true,
    },
    TideHeight: {
      processing: "median",
    },
    RealTimeShake: {
      DetectEarthquake: false,
      noticeLv: 2,
      notice_BigEvent: true,
    },
  },
  Source: {
    kmoni: { kmoni: { GetData: true, Interval: 1000 } },
    msil: { GetData: true, Interval: 10000 },
    axis: { GetData: false, AccessToken: "" },
    ProjectBS: { GetData: true },
    wolfx: { GetData: true, GetDataFromSeisJS: false },
    TREMRTS: { GetData: true, Interval: 1000 },
    EarlyEst: { GetData: false, Interval: 60000 },
  },
  notice: {
    bell_volume: 1,
    voice_parameter: {
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: "",
      engine: "Default",
      Boyomi_Port: 50080,
      Boyomi_Voice: "auto",
    },
    voice: {
      EEW: "{training2}緊急地震速報です。{region_name}で最大の震度、{maxInt}の地震が発生しました。[{location}の予想震度は{local_Int}です。]",
      EEWUpdate: "緊急地震速報が更新されました。",
      EEWCancel: "緊急地震速報が取り消されました。",
      EQInfo: "{training2}{origin_time2}の地震について、{category}が発表されました。",
      EQInfoCancel: "地震情報が取り消されました。",
      Tsunami:
        "{max_grade}が発表されました。[直ちに逃げてください。直ちに逃げてください。]",
      TsunamiRevocation: "津波情報が解除されました。",
      TsunamiTorikeshi: "津波情報が取り消されました。",
    },
    window: { EEW: "openWindow", EEW_Update: "push" },
  },
  color: {
    "IntColorTheme": "0quake",
    psWave: { PwaveColor: "rgb(48, 148, 255)", SwaveColor: "rgb(255, 62, 48)" },
    "Shindo": {
      "0": { "background": "rgb(80, 81, 83)", "color": "rgb(194, 195, 197)" },
      "1": { "background": "rgb(157, 175, 194)", "color": "rgb(61, 64, 89)" },
      "2": { "background": "rgb(89, 123, 171)", "color": "rgb(0, 1, 6)" },
      "3": { "background": "rgb(69, 72, 130)", "color": "rgb(216, 217, 235)" },
      "4": { "background": "rgb(217, 215, 98)", "color": "rgb(67, 67, 71)" },
      "7": { "background": "rgb(165, 0, 194)", "color": "rgb(255, 255, 255)" },
      "5m": { "background": "rgb(224, 157, 0)", "color": "rgb(38, 38, 38)" },
      "5p": { "background": "rgb(232, 93, 19)", "color": "rgb(0, 0, 0)" },
      "6m": { "background": "rgb(194, 26, 0)", "color": "rgb(255, 255, 255)" },
      "6p": { "background": "rgb(128, 0, 21)", "color": "rgb(255, 255, 255)" },
      "?": { "background": "rgb(191, 191, 191)", "color": "rgb(68, 68, 68)" },
      "5p?": { "background": "rgb(232, 93, 19)", "color": "rgb(0, 0, 0)" }
    }, "LgInt": {
      "1": { "background": "rgb(69, 72, 130)", "color": "rgb(216, 217, 235)" },
      "2": { "background": "rgb(224, 157, 0)", "color": "rgb(38, 38, 38)" },
      "3": { "background": "rgb(194, 26, 0)", "color": "rgb(255, 255, 255)" },
      "4": { "background": "rgb(165, 0, 194)", "color": "rgb(255, 255, 255)" },
      "?": { "background": "rgb(191, 191, 191)", "color": "rgb(68, 68, 68)" }
    },
    Tsunami: {
      TsunamiMajorWarningColor: "rgb(200, 0, 255)",
      TsunamiWarningColor: "rgb(255, 40, 0)",
      TsunamiWatchColor: "rgb(250, 245, 0)",
      TsunamiYohoColor: "rgb(66, 158, 255)",
      AstroHeightColor: "rgb(66, 158, 255)",
    },
  },
  data: { layer: "", overlay: [], kmoni_points_show: true },
};
var config = store.get("config", defaultConfigVal);
var isFirstRun = !config || config.system.isFirstRun !== false;//ここじゃないとダメ
config = mergeDeeply(defaultConfigVal, config);
store.set("config", config);

//リプレイ
var Replay = 0;
function replay(ReplayDate) {
  try {
    if (ReplayDate) {
      Replay = new Date() - new Date(ReplayDate);
    } else {
      Replay = 0;
    }
    clearEQDetectList();
    clearEEWActive();
    if (worker) worker.postMessage({ action: "Replay", data: Replay });
    messageToMainWindow({ action: "Replay", data: Replay });
    if (SettingWindow) {
      SettingWindow.webContents.send("message2", {
        action: "Replay",
        data: Replay,
      });
    }
    Req_JMAXMLList(0, true);
  } catch (err) {
    throw new Error("リプレイに失敗しました。", { cause: err });
  }
}

var kmoniTimeTmp = {};
var kmoniOffset = 2500;
let tray;

initWindowContext({
  getStore: () => store,
  getConfig: () => config,
  getDefaultConfigVal: () => defaultConfigVal,
  getPackageVer: () => package_ver,
  getReplay: () => Replay,
  getUpdateData: () => update_data,
  getTremRts_sta: () => TremRts_sta,
  getSeisjs_sta: () => Seisjs_sta,
  getEEWActive: () => EEW_Active,
  getEqInfo: () => eqInfo,
  getEQDetectList: () => EQDetect_List,
  getJMAIntPoints: () => JMA_Int_Points,
  getJMAInfoNumber: () => JMA_CurrentInfoNumber,
  getUSGSInfoNumber: () => USGS_CurrentInfoNumber,
  getKmoniTimeTmp: () => kmoniTimeTmp,
  getEQCountProcess: () => EQCount_process,
  getTsunamiDataMarged: () => Tsunami_data_Marged,
  getNankaiTroughInfo: () => NankaiTroughInfo,
  getHokkaidoSanrikuInfoAll: () => HokkaidoSanrikuInfoAll,
  getKatsudoJokyoInfoAll: () => KatsudoJokyoInfoAll,
  getKmoniPointsDataTmp: () => kmoniPointsDataTmp,
  getSnetPointsDataTmp: () => SnetPointsDataTmp,
  getThresholds: () => thresholds,
  getEEWStorage: () => EEW_Storage,
});

initEQInfoContext({
  getConfig: () => config,
  getReplay: () => Replay,
  getEEWStorage: () => EEW_Storage,
  getJMAInfoNumber: () => JMA_CurrentInfoNumber,
  getUSGSInfoNumber: () => USGS_CurrentInfoNumber,
});

initTsunamiContext({
  getConfig: () => config,
  getReplay: () => Replay,
});

initEEWContext({
  getConfig: () => config,
  getReplay: () => Replay,
  getKmoniTimeTmp: () => kmoniTimeTmp,
  UpdateStatus: (type, condition, timeStamp) => UpdateStatus(type, condition, timeStamp),
});

initRTSeisContext({
  getConfig: () => config,
  getReplay: () => Replay,
  getKmoniOffset: () => kmoniOffset,
  setKmoniOffset: (val) => { kmoniOffset = val; },
  UpdateStatus: (type, condition, timeStamp) => UpdateStatus(type, condition, timeStamp),
  GeneralError_handler: (err) => GeneralError_handler(err),
  IntervalRun: (msec, func) => IntervalRun(msec, func),
  getThresholds: () => thresholds,
});

initJMAXMLContext({
  getConfig: () => config,
  getReplay: () => Replay,
  getEQFetchCount: () => EQ_FetchCount,
  incEQFetchCount: () => { EQ_FetchCount++; },
  getJMAInfoNumber: () => JMA_CurrentInfoNumber,
  UpdateStatus: (type, condition, timeStamp) => UpdateStatus(type, condition, timeStamp),
  GeneralError_handler: (err) => GeneralError_handler(err),
});

initOtherAPIsContext({
  getConfig: () => config,
  getReplay: () => Replay,
  getPackageVer: () => package_ver,
  getPackageJson: () => packageJson,
  getJMAInfoNumber: () => JMA_CurrentInfoNumber,
  getUSGSInfoNumber: () => USGS_CurrentInfoNumber,
  UpdateStatus: (type, condition, timeStamp) => UpdateStatus(type, condition, timeStamp),
  GeneralError_handler: (err) => GeneralError_handler(err),
});

initEEWRxContext({
  getConfig: () => config,
  getReplay: () => Replay,
  UpdateStatus: (type, condition, timeStamp) => UpdateStatus(type, condition, timeStamp),
});

function ScheduledExecution() {
  //axisのアクセストークン確認
  if (!config.Source.axis.GetData) return;

  fetch(`https://axis.prioris.jp/api/token/refresh/?token=${config.Source.axis.AccessToken}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      if (json.status == "generate a new token") {
        //トークン更新
        if (json.token) {
          config.Source.axis.AccessToken = String(json.token);
          store.set("config", config);
          SystemNotification("Axisのアクセストークンを自動で更新しました。");
        }
      } else if (json.status == "contract has expired") {
        //トークン期限切れ
        config.Source.axis.GetData = false;
        store.set("config", config);
        SystemNotification("Axisのアクセストークンの期限が切れました。手動でトークンを更新しください。");
      } else if (json.status == "invalid header authorization") {
        config.Source.axis.GetData = false;
        store.set("config", config);
        SystemNotification("Axisのアクセストークンが不正です。設定を修正してください。");
      }
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("axis", "Error");
    });
}
//準備完了イベント
app.whenReady().then(() => {
  //ウィンドウ作成
  Create_WorkerWindow();
  //定期実行
  ScheduledExecution();
  setInterval(ScheduledExecution, 1200000);

  //↓ 「!== false」必須
  if (isFirstRun) {
    dialog
      .showMessageBox({
        type: "question",
        detail: "PCの起動時に自動実行する様に設定しますか？",
        normalizeAccessKeys: true,
        buttons: ["いいえ", "はい"],
        defaultId: 1,
        noLink: true,
        cancelId: 0,
      })
      .then(function (result) {
        if (result.response == 1) setOpenAtLogin(true);
      });
  }

  if (config.system.WindowAutoOpen) {
    CreateMainWindow();
    app.on("activate", () => {
      // メインウィンドウが消えている場合は再度メインウィンドウを作成する
      if (BrowserWindow.getAllWindows().length === 0) {
        CreateMainWindow();
      }
    });
  }

  //各種のためカスタムリファラーを送信
  const filter = { urls: ['https://*/*'] };
  electron.session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Referer'] = 'https://0quake.github.io/ZeroQuake_Website/';
    details.requestHeaders['User-Agent'] = `ZeroQuake/${package_ver} contact:(https://0quake.github.io/ZeroQuake_Website/contact.html)`;
    callback({ requestHeaders: details.requestHeaders });
  });

  electron.protocol.handle('local-range-request', (request) => {
    try {
      let rawPath = decodeURI(request.url.slice('local-range-request://'.length));
      // ビルド後も正しくファイルパスを生成するためapp.getAppPath()を使用
      let filePath = path.isAbsolute(rawPath) ? rawPath : path.join(app.getAppPath(), rawPath);

      var rangeHeader = request.headers.get("Range");
      var stat = fs.statSync(filePath);
      var totalSize = stat.size;

      if (rangeHeader && rangeHeader.startsWith("bytes=")) {
        var header_value = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        var start = Number(header_value[1]);
        var end = Number(header_value[2]) || totalSize - 1;
        var ContentLength = end - start + 1;

        var buffer = Buffer.alloc(ContentLength);
        var fd = fs.openSync(filePath, "r");
        try {
          fs.readSync(fd, buffer, 0, ContentLength, start);
        } finally {
          fs.closeSync(fd);
        }

        return new Response(buffer, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Content-Length": String(ContentLength),
            "Content-Type": "binary/octet-stream",
          },
        });
      } else {
        throw new Error(`local-range-requestプロトコルにてRangeヘッダーなしのリクエスト。URL:${request.url}`);
      }
    } catch (err) {
      return new Response(`500 error:${err}`, {
        status: 500,
      });
    }
  });

  //初期化処理
  start();

  checkUpdate();
});

let options = {
  type: "error",
  title: "エラー",
  message: "予期しないエラーが発生しました",
  detail: "動作を選択してください。",
  buttons: ["アプリを再起動", "終了", "無視"],
  noLink: true,
};
var errorMsgBox = false;
//エラーイベント
// eslint-disable-next-line no-undef
process.on("uncaughtException", function (err) {
  try {
    if (!errorMsgBox && app.isReady()) {
      GeneralError_handler(causeTree(err))
      if (String(err.stack).startsWith("Error: net::ERR_")) return false;
      errorMsgBox = true;
      options.detail = `よろしければ、以下のエラーメッセージのスクリーンショット等を開発者へご報告ください。\n=================\nZeroQuake v${package_ver ? package_ver : "?.?.?"}\n\n${causeTree(err)}\n=================\n\n動作を選択してください。`;

      if (MainWindow) {
        dialog.showMessageBox(MainWindow, options).then(function (result) {
          errorMsgBox = false;
          errorResolve(result.response);
        });
      } else {
        dialog.showMessageBox(options).then(function (result) {
          errorMsgBox = false;
          errorResolve(result.response);
        });
      }

      SystemNotification("予期しないエラーが発生しました。");
    }
  } catch {
    return;//ここでエラーだすとループするので何が何でもreturnだけ
  }
});

function GeneralError_handler(err) {
  console.error(new Date().toLocaleString(), err)
}

//エラーメッセージの作成。エラー原因のツリー
function causeTree(err) {
  try {
    var ErrString = err.stack;
    var i = 0;

    try {
      while (err.cause && i < 10) {
        ErrString += `\n[cause]:${err.cause.stack}`;
        i++;
        err = err.cause;
      }
    } catch { }

    try {
      //ユーザーのフォルダ構成を秘匿
      var homeDir = app.getAppPath();
      homeDir = homeDir.replaceAll("\\", "/");//バックスラッシュ対策
      ErrString = ErrString.replace(homeDir, '<0quake_root>');
    } catch { }

    return ErrString;
  } catch {
    return "エラーログツリーの作成に失敗";
  }
}

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
  } catch {
    return;
  }
}

//アプリのロード完了イベント
electron.app.on("ready", () => {
  //タスクトレイアイコン
  tray = new electron.Tray(
    // eslint-disable-next-line no-undef
    `${__dirname}/img/icon.${process.platform === "win32" ? "ico" : "png"}`
  );
  tray.setToolTip("Zero Quake");
  tray.setContextMenu(
    electron.Menu.buildFromTemplate([
      {
        label: "メイン画面の表示",
        click: () => {
          CreateMainWindow();
        },
      },
      {
        label: "設定",
        click: () => {
          Create_SettingWindow();
        },
      },
      { type: "separator" },
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
    CreateMainWindow();
  });

  electron.powerMonitor.on("resume", () => {
    UpdateEQInfo();
    RegularExecution();
    if (WolfxConnection) WolfxConnection.sendUTF("query_jmaeew");
    if (ProjectBS_Connection) ProjectBS_Connection.sendUTF("queryjson");
  });
});

app.on("second-instance", CreateMainWindow);

//レンダラープロセスからのメッセージ
ipcMain.on("message", (_event, response) => {
  switch (response.action) {
    case "kmoniReturn":
      ConvertKmoni(response.data, response.date);
      break;
    case "SnetReturn":
      ConvertSnet(response.data, response.date, response.y, response.uid);
      break;
    case "SettingWindowOpen":
      Create_SettingWindow();
      break;
    case "TsunamiWindowOpen":
      Create_TsunamiWindow();
      break;
    case "EQInfoWindowOpen":
      EQInfo_createWindow(response);
      break;
    case "EQInfoWindowOpen_IS_WebURL":
      EQInfo_createWindow(response, true);
      break;
    case "openAtLogin":
      setOpenAtLogin(response.data);
      break;
    case "ChangeConfig":
      config = response.data;
      store.set("config", config);

      if (SettingWindow) {
        SettingWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }

      if (response.from == "ConfigWindow") {
        if (MainWindow && !MainWindow.isDestroyed()) {
          MainWindow.reload();
          MainWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (WorkerWindow && !WorkerWindow.isDestroyed()) {
          WorkerWindow.reload();
          WorkerWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (TsunamiWindow && !TsunamiWindow.isDestroyed()) {
          TsunamiWindow.reload();
          TsunamiWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (NankaiWindow.window && !NankaiWindow.window.isDestroyed()) {
          NankaiWindow.window.reload();
          NankaiWindow.window.webContents.setZoomFactor(config.system.zoom);
        }
        if (SettingWindow && !SettingWindow.isDestroyed()) {
          SettingWindow.reload();
          SettingWindow.webContents.setZoomFactor(config.system.zoom);
        }
        Object.keys(EQI_Window).forEach(function (key) {
          if (EQI_Window[key] && EQI_Window[key].window) {
            EQI_Window[key].window.reload();
            EQI_Window[key].window.webContents.setZoomFactor(config.system.zoom);
          }
        });
      }
      break;
    case "EEWSimulation":
      EEW_Marge(response.data);
      break;
    case "checkForUpdate":
      checkUpdate(true);
      break;
    case "tsunamiReqest":
      if (Tsunami_data_Marged) {
        messageToMainWindow({
          action: "tsunamiUpdate",
          data: Tsunami_data_Marged,
        });
      }
      break;
    case "mapLoaded":
      if (kmoniPointsDataTmp) messageToMainWindow(kmoniPointsDataTmp);
      if (SnetPointsDataTmp) messageToMainWindow(SnetPointsDataTmp);
      if (TremRtsData_Marged) messageToMainWindow(TremRtsData_Marged);
      break;
    case "replay":
      replay(response.date);
      break;
    case "NankaiWindowOpen":
      Create_NankaiWindow(response.type);
      break;
    case "HokkaidoSanrikuWindowOpen":
      Create_HokkaidoSanrikuWindow();
      break;
    case "KatsudoJokyoInfoWindowOpen":
      Create_KatsudoJokyoWindow()
      break;
    case "internetConnection":
      if (response.internetConnection) {
        UpdateEQInfo();
        RegularExecution();
        if (WolfxConnection) WolfxConnection.sendUTF("query_jmaeew");
        if (ProjectBS_Connection) ProjectBS_Connection.sendUTF("queryjson");
        Req_TremRts_sta();
        Req_Seisjs_sta();
      }
      break;
    case "Request_gaikyo":
      Req_JMA_gaikyo();
      break;
    case "Request_tide":
      Req_JMATide();
      break;
    case "Request_wepa":
      Req_JMA_wepa();
      break;
    case "Request_usgs":
      Req_USGS();
      break;
    case "wepa_window":
      Create_WepaWindow(response.fname);
      break;
    case "Req_additionalEQInfo_JMA":
      if (JMA_CurrentInfoNumber < 1000) {//naknのMAX3000件以下にすべし
        JMA_CurrentInfoNumber += 5;
        UpdateEQInfo();
      } else {
        messageToMainWindow({ action: "Deny_additionalEQInfo_JMA" });
      }
      break;
    case "Req_additionalEQInfo_USGS":
      if (USGS_CurrentInfoNumber < 1000) {
        USGS_CurrentInfoNumber += 25;
        Req_USGS();
      } else {
        messageToMainWindow({ action: "Deny_additionalEQInfo_USGS" });
      }
      break;
  }
});

function setOpenAtLogin(openAtLogin) {
  // eslint-disable-next-line no-undef
  if (process.platform != "win32") {
    app.setLoginItemSettings({ openAtLogin: openAtLogin });
  } else {
    app.setLoginItemSettings({ openAtLogin: false });

    const homePath = String(app.getPath("home")).replace(/\\/g, "/");
    const dist = `${homePath}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/ZeroQuake.lnk`;
    if (openAtLogin) {
      const source = String(app.getPath("exe")).replace(/\\/g, "/");
      let command = `
  $WshShell = New-Object -ComObject WScript.Shell;
  $ShortCut = $WshShell.CreateShortcut("${dist}");
  $ShortCut.TargetPath = "${source}";
  $ShortCut.Save();
  `;
      exec(command, { shell: "powershell.exe" });
    } else {
      if (fs.existsSync(dist))
        fs.unlink(dist, () => {
          return;
        });
    }
  }
}


var JMA_CurrentInfoNumber = 20;
var USGS_CurrentInfoNumber = 20;

//開始処理
function start() {
  //replay("2026/4/20 16:55:40")
  //地震検知ワーカー作成
  createWorker();

  //↓WebSocket接続処理
  P2P();
  AXIS();
  ProjectBS();
  WolfxWS();
  SeisjsWS();

  //HTTP定期GET着火
  Req_SNet();
  Req_kmoni();
  SetKmoniOffset(Req_kmoni);
  UpdateEQInfo(true); //地震情報定期取得 着火
  Req_EarlyEst();
  Req_TremRts();

  //定期実行 着火
  RegularExecution(true);

  //一回限り
  Req_TremRts_sta();
  Req_Seisjs_sta();
  Req_JMATide_sta();
}

var LastRunTime = 0;
var RunnningTimer;
function IntervalRun(msec, func) {
  if (RunnningTimer) {
    clearInterval(RunnningTimer);
    RunnningTimer = null;
  }
  var dif = new Date() - LastRunTime;
  if (dif > msec) {
    func();
    LastRunTime = new Date();
  } else {
    RunnningTimer = setTimeout(function () {
      func();
      LastRunTime = new Date();
    }, msec - dif);
  }
}

//定期実行
var RegularExecution_Timer;
function RegularExecution(loop) {
  try {
    //EEW解除
    EEW_Active.forEach(function (elm) {
      if (new Date() - Replay - new Date(elm.origin_time) > 300000)
        EEW_Clear(elm.EventID);
    });

    //津波情報解除
    if (!TsunamiValidate_bypass) {
      Tsunami_Data.forEach(function (elm) {
        if (elm.ValidDateTime <= new Date() - Replay && !elm.revocation) {
          elm.revocation = true;
          elm.issue.time = new Date() - Replay;
          ConvertTsunamiInfo(elm); //ダミーデータを送信、再度マージ処理
        }
      });
    }

    if (loop) {
      if (RegularExecution_Timer) clearTimeout(RegularExecution_Timer);
      RegularExecution_Timer = setTimeout(function () {
        RegularExecution(true);
      }, 1000);
    }
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。", { cause: err });
  }
}

//情報最終更新時刻を更新
function UpdateStatus(type, condition, timeStamp) {
  if (!timeStamp || !Boolean2(new Date(timeStamp))) timeStamp = new Date(new Date() - Replay)
  else timeStamp = new Date(timeStamp)
  messageToMainWindow({
    action: "UpdateStatus",
    timestamp: timeStamp,
    LocalTime: new Date(),
    type: type,
    condition: condition,
  });

  kmoniTimeTmp[type] = {
    type: type,
    timestamp: timeStamp,
    LocalTime: new Date(),
    condition: condition,
  };
}


//連想配列オブジェクトのマージ
function mergeDeeply(target, source, opts) {
  try {
    const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
    const isConcatArray = opts && opts.concatArray;
    let result = { ...target };//参照渡しを切る
    if (isObject(target) && isObject(source)) {
      for (const [sourceKey, sourceValue] of Object.entries(source)) {
        const targetValue = target[sourceKey];
        if (isConcatArray && Array.isArray(sourceValue) && Array.isArray(targetValue))
          result[sourceKey] = targetValue.concat(...sourceValue);
        else if (isObject(sourceValue) && Object.prototype.hasOwnProperty.call(target, sourceKey))
          result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
        else Object.assign(result, { [sourceKey]: sourceValue });
      }
    }
    return result;
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。(JSONのマージ)", { cause: err });
  }
}
