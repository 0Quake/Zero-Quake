import electron from "electron";
const { app, BrowserWindow, dialog, shell, Notification } = electron;
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { throttle } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export var MainWindow = null;
export var SettingWindow = null;
export var TsunamiWindow = null;
export var WorkerWindow = null;

export function messageToSettingWindow(message) {
  if (SettingWindow && !SettingWindow.isDestroyed()) {
    SettingWindow.webContents.send("message2", message);
  }
}

export function messageToTsunamiWindow(message) {
  if (TsunamiWindow && !TsunamiWindow.isDestroyed()) {
    TsunamiWindow.webContents.send("message2", message);
  }
}

export function messageToWorkerWindow(message) {
  if (WorkerWindow && !WorkerWindow.isDestroyed()) {
    try {
      WorkerWindow.webContents.send("message2", message);
    } catch { }
  }
}

export const playAudio = PlayAudio;

const unresponsiveMsg = {
  type: "question",
  title: "ウィンドウが応答しません。",
  message: "動作を選択してください。",
  buttons: ["画面を再表示", "アプリを再起動", "待機"],
  noLink: true,
};

let winCtx = {
  getStore: () => null,
  getConfig: () => ({}),
  getDefaultConfigVal: () => ({}),
  getPackageVer: () => "",
  getReplay: () => 0,
  getUpdateData: () => null,
  getTremRts_sta: () => null,
  getSeisjs_sta: () => null,
  getEEWActive: () => [],
  getEqInfo: () => ({ jma: [], usgs: [] }),
  getEQDetectList: () => [],
  getJMAIntPoints: () => null,
  getJMAInfoNumber: () => 20,
  getUSGSInfoNumber: () => 20,
  getKmoniTimeTmp: () => ({}),
  getEQCountProcess: () => (() => { }),
  getTsunamiDataMarged: () => null,
  getNankaiTroughInfo: () => null,
  getHokkaidoSanrikuInfoAll: () => [],
  getKatsudoJokyoInfoAll: () => [],
  getKmoniPointsDataTmp: () => null,
  getSnetPointsDataTmp: () => null,
  getThresholds: () => null,
  getEEWStorage: () => [],
};

export function initWindowContext(ctx) {
  winCtx = Object.assign(winCtx, ctx);
}

export function CreateMainWindow() {
  const store = winCtx.getStore();
  const config = winCtx.getConfig();
  try {
    if (MainWindow && !MainWindow.isDestroyed()) {
      if (MainWindow.isMinimized()) MainWindow.restore();
      if (!MainWindow.isFocused()) MainWindow.focus();
      if (!MainWindow.isVisible()) MainWindow.show();
    } else {
      MainWindow = new BrowserWindow({
        x: store.get("x", null),
        y: store.get("y", null),
        width: store.get("width", 800),
        height: store.get("height", 640),

        title: "Zero Quake",
        minWidth: 650,
        minHeight: 400,
        icon: path.join(__dirname, "../img/icon.ico"),
        webPreferences: {
          preload: path.join(__dirname, "../js/preload.js"),
          backgroundThrottling: false,
        },
        backgroundColor: "#222225",
        alwaysOnTop: config.system.alwaysOnTop,
      });
      if (store.get("Maximized", null)) MainWindow.maximize()
      else MainWindow.unmaximize()

      MainWindow.webContents.on("did-finish-load", () => {
        const config = winCtx.getConfig();
        const Replay = winCtx.getReplay();
        const TremRts_sta = winCtx.getTremRts_sta();
        const Seisjs_sta = winCtx.getSeisjs_sta();
        const EEW_Active = winCtx.getEEWActive();
        const eqInfo = winCtx.getEqInfo();
        const EQDetect_List = winCtx.getEQDetectList();
        const JMA_CurrentInfoNumber = winCtx.getJMAInfoNumber();
        const USGS_CurrentInfoNumber = winCtx.getUSGSInfoNumber();
        const kmoniTimeTmp = winCtx.getKmoniTimeTmp();
        const EQCount_process = winCtx.getEQCountProcess();
        const kmoniPointsDataTmp = winCtx.getKmoniPointsDataTmp();
        const SnetPointsDataTmp = winCtx.getSnetPointsDataTmp();
        const NankaiTroughInfo = winCtx.getNankaiTroughInfo();
        const HokkaidoSanrikuInfoAll = winCtx.getHokkaidoSanrikuInfoAll();
        const KatsudoJokyoInfoAll = winCtx.getKatsudoJokyoInfoAll();
        const thresholds = winCtx.getThresholds();

        MainWindow.webContents.setZoomFactor(config.system.zoom);

        if (notifyData) messageToMainWindow(notifyData);

        if (Replay !== 0) {
          messageToMainWindow({ action: "Replay", data: Replay });
        }

        if (kmoniTimeTmp) {
          Object.keys(kmoniTimeTmp).forEach(function (key) {
            var elm = kmoniTimeTmp[key];
            messageToMainWindow({
              action: "UpdateStatus",
              timestamp: elm.timestamp,
              LocalTime: elm.LocalTime,
              type: elm.type,
              condition: elm.condition,
            });
          });
        }

        messageToMainWindow({ action: "setting", data: config });

        if (TremRts_sta) {
          messageToMainWindow({
            action: "TremRts_sta",
            data: TremRts_sta,
          });
        }
        if (Seisjs_sta && Object.keys(Seisjs_sta).length > 0) {
          messageToMainWindow({
            action: "Seisjs_sta",
            data: Seisjs_sta,
          });
        }

        if (EEW_Active && EEW_Active.length > 0) {
          messageToMainWindow({ action: "EEW_AlertUpdate", data: EEW_Active });
        }

        if (eqInfo?.jma?.length > 0) {
          messageToMainWindow({
            action: "EQInfo",
            source: "jma",
            data: eqInfo.jma.slice(0, JMA_CurrentInfoNumber),
          });
        }
        if (eqInfo?.usgs?.length > 0) {
          messageToMainWindow({
            action: "EQInfo",
            source: "usgs",
            data: eqInfo.usgs.slice(0, USGS_CurrentInfoNumber),
          });
        }
        if (typeof EQCount_process === "function") {
          EQCount_process(null);
        }

        if (Array.isArray(EQDetect_List) && thresholds) {
          EQDetect_List.forEach(function (elm) {
            var threshold01Tmp = elm.isCity ? thresholds.threshold01C : thresholds.threshold01;
            if (elm.Codes.length >= threshold01Tmp) {
              messageToMainWindow({ action: "EQDetect", data: elm });
            }
          });
        }

        if (kmoniPointsDataTmp) messageToMainWindow(kmoniPointsDataTmp);
        if (SnetPointsDataTmp) messageToMainWindow(SnetPointsDataTmp);
        if (NankaiTroughInfo) {
          messageToMainWindow({
            action: "NankaiTroughInfo",
            data: NankaiTroughInfo,
          });
        }
        if (HokkaidoSanrikuInfoAll?.[0]) {
          messageToMainWindow({
            action: "HokkaidoSanrikuInfo",
            data: HokkaidoSanrikuInfoAll[0],
          });
        }
        if (KatsudoJokyoInfoAll?.[0]) {
          messageToMainWindow({
            action: "KatsudoJokyoInfo",
            data: KatsudoJokyoInfoAll[0],
          });
        }

        messageToMainWindow({ action: "init" });
      });

      MainWindow.loadFile("src/index.html");

      var savePosition = throttle(function () {
        const { x, y, width, height } = MainWindow.getBounds();
        store.set({ x, y, width, height });
        store.set("Maximized", MainWindow.isMaximized());
      }, 300);
      MainWindow.on('maximize', savePosition)
        .on('unmaximize', savePosition)
        .on('resize', savePosition)
        .on('move', savePosition);

      MainWindow.on("unresponsive", () => {
        MainWindow.responsive = true;
        setTimeout(function () {
          if (MainWindow.responsive) {
            dialog.showMessageBox(MainWindow, unresponsiveMsg).then(function (result) {
              switch (result.response) {
                case 0:
                  MainWindow.loadFile("src/index.html");
                  break;
                case 1:
                  app.relaunch();
                  app.exit(0);
                  break;
              }
            });
          }
        }, 5000);
      }).on("responsive", () => {
        MainWindow.responsive = false;
      });

      MainWindow.on("focus", () => {
        messageToMainWindow({ action: "activate" });
      }).on("show", () => {
        messageToMainWindow({ action: "activate" });
      }).on("hide", () => {
        messageToMainWindow({ action: "deactivate" });
      }).on("restore", () => {
        messageToMainWindow({ action: "activate" });
      }).on("minimize", () => {
        messageToMainWindow({ action: "deactivate" });
      });

      MainWindow.on("close", (event) => {
        if (!MainWindow.isDestroyed()) {
          event.preventDefault();
          MainWindow.hide();
        }
      }).on("closed", () => {
        MainWindow = null;
      });
    }
  } catch (err) {
    throw new Error("メインウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//ワーカーウィンドウ表示処理
export function Create_WorkerWindow() {
  if (WorkerWindow) WorkerWindow.close();
  WorkerWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "../js/preload.js"),
      backgroundThrottling: false,
    },
    show: false,
  });
  WorkerWindow.on("close", () => {
    WorkerWindow = null;
    setTimeout(Create_WorkerWindow, 2000)
  });
  WorkerWindow.webContents.on("did-finish-load", () => {
    const config = winCtx.getConfig();
    WorkerWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });
  });
  WorkerWindow.loadFile("src/WorkerWindow.html");
  WorkerWindow.on("unresponsive", () => {
    WorkerWindow.responsive = true;
    setTimeout(function () {
      if (WorkerWindow.responsive) Create_WorkerWindow();
    }, 5000);
  });
  WorkerWindow.on("responsive", () => {
    WorkerWindow.responsive = false;
  });
}
//設定ウィンドウ表示処理
export function Create_SettingWindow(update) {
  const config = winCtx.getConfig();
  try {
    if (SettingWindow) {
      if (SettingWindow.isMinimized()) SettingWindow.restore();
      if (!SettingWindow.isFocused()) SettingWindow.focus();
      return false;
    }

    SettingWindow = new BrowserWindow({
      title: "設定 - Zero Quake",
      parent: MainWindow ? MainWindow : null,
      center: true,
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "../img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "../js/preload.js"),
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    SettingWindow.webContents.on("did-finish-load", () => {
      const config = winCtx.getConfig();
      const Replay = winCtx.getReplay();
      const defaultConfigVal = winCtx.getDefaultConfigVal();
      const package_ver = winCtx.getPackageVer();
      const update_data = winCtx.getUpdateData();

      SettingWindow.webContents.setZoomFactor(config.system.zoom);

      if (Replay !== 0) {
        SettingWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }

      const homePath = String(app.getPath("home")).replace(/\\/g, "/");
      SettingWindow.webContents.send("message2", {
        action: "initialData",
        config: config,
        defaultConfigVal: defaultConfigVal,
        softVersion: package_ver,
        openAtLogin: app.getLoginItemSettings().openAtLogin
          || fs.existsSync(`${homePath}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/ZeroQuake.lnk`),
        updatePanelMode: update,
      });
      if (update_data) {
        SettingWindow.webContents.send("message2", {
          action: "Update_Data",
          data: update_data,
        });
      }
    });
    SettingWindow.on("closed", () => {
      SettingWindow = null;
    });

    SettingWindow.loadFile("src/settings.html");
    SettingWindow.webContents.on("will-navigate", handleUrlOpen);
    SettingWindow.webContents.on("new-window", handleUrlOpen);
    SettingWindow.webContents.on("will-prevent-unload", (event) => {

      const choice = dialog.showMessageBoxSync(SettingWindow, {
        type: "question",
        title: "確認",
        message: "変更した設定を保存していません。\n設定を破棄して設定画面を閉じますか？",
        buttons: ["閉じる", "画面に戻る"],
        noLink: true,
        defaultId: 1,
        cancelId: 1,
      });
      if (choice == 0) event.preventDefault();
    });
  } catch (err) {
    throw new Error("設定ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//津波情報ウィンドウ表示処理
export function Create_TsunamiWindow() {
  const config = winCtx.getConfig();
  const Tsunami_data_Marged = winCtx.getTsunamiDataMarged();
  try {
    if (TsunamiWindow) {
      if (TsunamiWindow.isMinimized()) TsunamiWindow.restore();
      if (!TsunamiWindow.isFocused()) TsunamiWindow.focus();
      return false;
    }
    TsunamiWindow = new BrowserWindow({
      title: "津波詳細情報 - Zero Quake",
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "../img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "../js/preload.js"),
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    TsunamiWindow.webContents.on("did-finish-load", () => {
      const config = winCtx.getConfig();
      TsunamiWindow.webContents.setZoomFactor(config.system.zoom);

      TsunamiWindow.webContents.send("message2", {
        action: "setting",
        data: config,
      });
      TsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: Tsunami_data_Marged,
      });
    });
    TsunamiWindow.loadFile("src/TsunamiDetail.html");

    TsunamiWindow.on("closed", () => {
      TsunamiWindow = null;
    });
  } catch (err) {
    throw new Error("津波情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//南海トラフ関連情報ウィンドウの作成
export var NankaiWindow = { type: null, window: null };
export function Create_NankaiWindow(type) {
  const config = winCtx.getConfig();
  const NankaiTroughInfo = winCtx.getNankaiTroughInfo();
  try {
    var win = NankaiWindow.window;
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isFocused()) win.focus();
    }

    if (win) {
      if (NankaiWindow.type == type) {
        //同じ情報について表示していたならおわる
        return false;
      } else NankaiWindow.type = type;
    } else {
      NankaiWindow.type = type;
      NankaiWindow.window = new BrowserWindow({
        title: "南海トラフ地震に関連する情報 - Zero Quake",
        minWidth: 650,
        minHeight: 400,
        icon: path.join(__dirname, "../img/icon.ico"),
        webPreferences: {
          preload: path.join(__dirname, "../js/preload.js"),
        },
        backgroundColor: "#222225",
        alwaysOnTop: config.system.alwaysOnTop,
      });

      NankaiWindow.window.webContents.on("did-finish-load", () => {
        const config = winCtx.getConfig();
        NankaiWindow.window.webContents.setZoomFactor(config.system.zoom);

        var data =
          NankaiWindow.type == "rinji" ? NankaiTroughInfo.rinji : NankaiTroughInfo.teirei;
        if (data) {
          NankaiWindow.window.webContents.send("message2", {
            action: "NankaiTroughInfo",
            data: data,
          });
          NankaiWindow.window.webContents.send("message2", {
            action: "setting",
            data: config,
          });
        }
      });

      NankaiWindow.window.on("closed", () => {
        NankaiWindow.window = null;
      });
    }

    NankaiWindow.window.loadFile("src/NankaiTrough.html");
  } catch (err) {
    throw new Error("南海トラフ関連情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//WEPA40 国際津波関連情報ウィンドウ
export var WepaWindow = {};
export function Create_WepaWindow(fname) {
  const config = winCtx.getConfig();
  try {
    if (WepaWindow[fname]) {
      if (WepaWindow[fname].isMinimized()) WepaWindow[fname].restore();
      if (!WepaWindow[fname].isFocused()) WepaWindow[fname].focus();
      return false;
    }

    WepaWindow[fname] = new BrowserWindow({
      title: "国際津波関連情報 - Zero Quake",
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "../img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "../js/preload.js"),
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    WepaWindow[fname].webContents.on("did-finish-load", () => {
      const config = winCtx.getConfig();
      WepaWindow[fname].webContents.setZoomFactor(config.system.zoom);

      if (fname) {
        WepaWindow[fname].webContents.send("message2", {
          action: "metadata",
          fname: fname,
        });
        WepaWindow[fname].webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
    });

    WepaWindow[fname].on("closed", () => {
      delete WepaWindow[fname];
    });

    WepaWindow[fname].loadFile("src/WEPA.html");
  } catch (err) {
    throw new Error("国際津波関連情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//北海道・三陸沖後発地震注意情報ウィンドウ
export var HokkaidoSanrikuWindow;
export function Create_HokkaidoSanrikuWindow() {
  const config = winCtx.getConfig();
  const HokkaidoSanrikuInfoAll = winCtx.getHokkaidoSanrikuInfoAll();
  try {
    if (HokkaidoSanrikuWindow) {
      if (HokkaidoSanrikuWindow.isMinimized()) HokkaidoSanrikuWindow.restore();
      if (!HokkaidoSanrikuWindow.isFocused()) HokkaidoSanrikuWindow.focus();
      return false;
    }

    HokkaidoSanrikuWindow = new BrowserWindow({
      title: "北海道・三陸沖後発地震注意情報 - Zero Quake",
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "../img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "../js/preload.js"),
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    HokkaidoSanrikuWindow.webContents.on("did-finish-load", () => {
      const config = winCtx.getConfig();
      HokkaidoSanrikuWindow.webContents.setZoomFactor(config.system.zoom);

      if (HokkaidoSanrikuInfoAll[0]) {
        HokkaidoSanrikuWindow.webContents.send("message2", {
          action: "HokkaidoSanrikuInfo",
          data: HokkaidoSanrikuInfoAll[0],
        });
        HokkaidoSanrikuWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
    });

    HokkaidoSanrikuWindow.on("closed", () => {
      HokkaidoSanrikuWindow = null;
    });

    HokkaidoSanrikuWindow.loadFile("src/HokkaidoSanriku.html");
  } catch (err) {
    throw new Error("北海道・三陸沖後発地震注意情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//地震の活動状況等に関する情報ウィンドウ
export var KatsudoJokyoWindow;
export function Create_KatsudoJokyoWindow() {
  const config = winCtx.getConfig();
  const KatsudoJokyoInfoAll = winCtx.getKatsudoJokyoInfoAll();
  try {
    if (KatsudoJokyoWindow) {
      if (KatsudoJokyoWindow.isMinimized()) KatsudoJokyoWindow.restore();
      if (!KatsudoJokyoWindow.isFocused()) KatsudoJokyoWindow.focus();
      return false;
    }

    KatsudoJokyoWindow = new BrowserWindow({
      title: "地震の活動状況等に関する情報 - Zero Quake",
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "../img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "../js/preload.js"),
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    KatsudoJokyoWindow.webContents.on("did-finish-load", () => {
      const config = winCtx.getConfig();
      KatsudoJokyoWindow.webContents.setZoomFactor(config.system.zoom);

      if (KatsudoJokyoInfoAll[0]) {
        KatsudoJokyoWindow.webContents.send("message2", {
          action: "KatsudoJokyoInfo",
          data: KatsudoJokyoInfoAll[0],
        });
        KatsudoJokyoWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
    });

    KatsudoJokyoWindow.on("closed", () => {
      KatsudoJokyoWindow = null;
    });

    KatsudoJokyoWindow.loadFile("src/KatsudoJokyo.html");
  } catch (err) {
    throw new Error("地震の活動状況等に関する情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

export function messageToMainWindow(message) {
  if (MainWindow) MainWindow.webContents.send("message2", message);
}

//地震情報ウィンドウ表示処理
export var EQI_Window = {};
export function handleUrlOpen(e, url) {
  if (url.startsWith("http")) {
    setTimeout(function () {
    }, 5)
    e.preventDefault();
    shell.openExternal(url);
  }
}
export function EQInfo_createWindow(response, IS_WebURL) {
  const config = winCtx.getConfig();
  const EEW_Storage = winCtx.getEEWStorage();
  try {
    var EQInfoWindowT = EQI_Window[response.eid];
    if (EQInfoWindowT) {
      if (EQInfoWindowT.window.isMinimized()) EQInfoWindowT.window.restore();
      if (!EQInfoWindowT.window.isFocused()) EQInfoWindowT.window.focus();
      return;
    }

    var EQInfoWindow = new BrowserWindow({
      title: "地震詳細情報 - Zero Quake",
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "../img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "../js/preload.js"),
      },
      backgroundColor: IS_WebURL ? null : "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    if (!IS_WebURL) {
      var EEWDataItem = EEW_Storage.find(function (elm) {
        return elm.EventID == response.eid;
      });
      var metadata = {
        action: "metaData",
        eid: response.eid,
        urls: response.urls,
        data: response.data,
        eew: EEWDataItem,
        axisData: response.axisData,
      };
      EQI_Window[response.eid] = { window: EQInfoWindow, metadata: metadata };

      EQInfoWindow.webContents.on("did-finish-load", () => {
        const config = winCtx.getConfig();
        EQInfoWindow.webContents.setZoomFactor(config.system.zoom);

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

    if (IS_WebURL) EQInfoWindow.loadURL(response.url);
    else EQInfoWindow.loadFile(response.url);
    EQInfoWindow.webContents.on("will-navigate", handleUrlOpen);
    EQInfoWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("http")) {
        shell.openExternal(url);
      }
      return { action: "deny" };
    });
  } catch (err) {
    throw new Error("地震情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}


export function speak(str) {
  if (str && WorkerWindow) {
    WorkerWindow.webContents.send("message2", { action: "speak", data: str });
  }
}

//EEW時読み上げ文章 生成

export function PlayAudio(name) {
  if (WorkerWindow) {
    WorkerWindow.webContents.send("message2", {
      action: "PlayAudio",
      data: name,
    });
  }
}

//メインウィンドウ内通知
export var notifyData = null;
export function SystemNotification(message) {
  var Push = new Notification({
    title: "Zero Quake システム通知",
    body: message,
    icon: path.join(__dirname, "../img/icon.ico"),
  });

  Push.show();
}

//JSONパース（拡張）
