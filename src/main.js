// eslint-disable-next-line no-undef
process.env.TZ = "Asia/Tokyo";
// eslint-disable-next-line no-undef
process.title = 'Zero Quake';

//リプレイ
var Replay = 0;
var MainWindow, SettingWindow, TsunamiWindow, WorkerWindow;
var worker;
function replay(ReplayDate) {
  try {
    if (ReplayDate) {
      Replay = new Date() - new Date(ReplayDate);
    } else {
      Replay = 0;
    }
    EQDetect_List = [];
    EEW_nowList = [];
    if (worker) worker.postMessage({ action: "Replay", data: Replay });
    messageToMainWindow({ action: "Replay", data: Replay });
    if (SettingWindow) {
      SettingWindow.webContents.send("message2", {
        action: "Replay",
        data: Replay,
      });
    }
  } catch (err) {
    throw new Error("リプレイに失敗しました。", { cause: err });
  }
}
// prettier-ignore
var EEWSectName = { 135: "宗谷支庁北部", 136: "宗谷支庁南部", 125: "上川支庁北部", 126: "上川支庁中部", 127: "上川支庁南部", 130: "留萌支庁中北部", 131: "留萌支庁南部", 139: "北海道利尻礼文", 150: "日高支庁西部", 151: "日高支庁中部", 152: "日高支庁東部", 145: "胆振支庁西部", 146: "胆振支庁中東部", 110: "檜山支庁", 105: "渡島支庁北部", 106: "渡島支庁東部", 107: "渡島支庁西部", 140: "網走支庁網走", 141: "網走支庁北見", 142: "網走支庁紋別", 165: "根室支庁北部", 166: "根室支庁中部", 167: "根室支庁南部", 160: "釧路支庁北部", 161: "釧路支庁中南部", 155: "十勝支庁北部", 156: "十勝支庁中部", 157: "十勝支庁南部", 119: "北海道奥尻島", 120: "空知支庁北部", 121: "空知支庁中部", 122: "空知支庁南部", 100: "石狩支庁北部", 101: "石狩支庁中部", 102: "石狩支庁南部", 115: "後志支庁北部", 116: "後志支庁東部", 117: "後志支庁西部", 200: "青森県津軽北部", 201: "青森県津軽南部", 202: "青森県三八上北", 203: "青森県下北", 230: "秋田県沿岸北部", 231: "秋田県沿岸南部", 232: "秋田県内陸北部", 233: "秋田県内陸南部", 210: "岩手県沿岸北部", 211: "岩手県沿岸南部", 212: "岩手県内陸北部", 213: "岩手県内陸南部", 220: "宮城県北部", 221: "宮城県南部", 222: "宮城県中部", 240: "山形県庄内", 241: "山形県最上", 242: "山形県村山", 243: "山形県置賜", 250: "福島県中通り", 251: "福島県浜通り", 252: "福島県会津", 300: "茨城県北部", 301: "茨城県南部", 310: "栃木県北部", 311: "栃木県南部", 320: "群馬県北部", 321: "群馬県南部", 330: "埼玉県北部", 331: "埼玉県南部", 332: "埼玉県秩父", 350: "東京都２３区", 351: "東京都多摩東部", 352: "東京都多摩西部", 354: "神津島", 355: "伊豆大島", 356: "新島", 357: "三宅島", 358: "八丈島", 359: "小笠原", 340: "千葉県北東部", 341: "千葉県北西部", 342: "千葉県南部", 360: "神奈川県東部", 361: "神奈川県西部", 420: "長野県北部", 421: "長野県中部", 422: "長野県南部", 410: "山梨県東部", 411: "山梨県中・西部", 412: "山梨県東部・富士五湖", 440: "静岡県伊豆", 441: "静岡県東部", 442: "静岡県中部", 443: "静岡県西部", 450: "愛知県東部", 451: "愛知県西部", 430: "岐阜県飛騨", 431: "岐阜県美濃東部", 432: "岐阜県美濃中西部", 460: "三重県北部", 461: "三重県中部", 462: "三重県南部", 370: "新潟県上越", 371: "新潟県中越", 372: "新潟県下越", 375: "新潟県佐渡", 380: "富山県東部", 381: "富山県西部", 390: "石川県能登", 391: "石川県加賀", 400: "福井県嶺北", 401: "福井県嶺南", 500: "滋賀県北部", 501: "滋賀県南部", 510: "京都府北部", 511: "京都府南部", 520: "大阪府北部", 521: "大阪府南部", 530: "兵庫県北部", 531: "兵庫県南東部", 532: "兵庫県南西部", 535: "兵庫県淡路島", 540: "奈良県", 550: "和歌山県北部", 551: "和歌山県南部", 580: "岡山県北部", 581: "岡山県南部", 590: "広島県北部", 591: "広島県南東部", 592: "広島県南西部", 570: "島根県東部", 571: "島根県西部", 575: "島根県隠岐", 560: "鳥取県東部", 562: "鳥取県中部", 563: "鳥取県西部", 600: "徳島県北部", 601: "徳島県南部", 610: "香川県東部", 611: "香川県西部", 620: "愛媛県東予", 621: "愛媛県中予", 622: "愛媛県南予", 630: "高知県東部", 631: "高知県中部", 632: "高知県西部", 700: "山口県北部", 701: "山口県東部", 702: "山口県西部", 710: "福岡県福岡", 711: "福岡県北九州", 712: "福岡県筑豊", 713: "福岡県筑後", 750: "大分県北部", 751: "大分県中部", 752: "大分県南部", 753: "大分県西部", 730: "長崎県北部", 731: "長崎県南西部", 732: "長崎県島原半島", 735: "長崎県対馬", 736: "長崎県壱岐", 737: "長崎県五島", 720: "佐賀県北部", 721: "佐賀県南部", 740: "熊本県阿蘇", 741: "熊本県熊本", 742: "熊本県球磨", 743: "熊本県天草・芦北", 760: "宮崎県北部平野部", 761: "宮崎県北部山沿い", 762: "宮崎県南部平野部", 763: "宮崎県南部山沿い", 770: "鹿児島県薩摩", 771: "鹿児島県大隅", 774: "鹿児島県十島村", 775: "鹿児島県甑島", 776: "鹿児島県種子島", 777: "鹿児島県屋久島", 778: "鹿児島県奄美北部", 779: "鹿児島県奄美南部", 800: "沖縄県本島北部", 801: "沖縄県本島中南部", 802: "沖縄県久米島", 803: "沖縄県大東島", 804: "沖縄県宮古島", 805: "沖縄県石垣島", 806: "沖縄県与那国島", 807: "沖縄県西表島" };

import electron from "electron";
const { app, BrowserWindow, ipcMain, net, Notification, shell, dialog, Menu, powerSaveBlocker, } = electron;
import { fileURLToPath } from "url";
import path from "path";
import jsdom from "jsdom";
const JSDOM = jsdom.JSDOM;
import Store from "electron-store";
import WebSocket from "websocket";
var WebSocketClient = WebSocket.client;
import * as turf from "@turf/turf";
import workerThreads from "worker_threads";
import { readFile } from "fs/promises";
import fs from "fs";
import { exec } from "child_process";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var FERegion = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/feRegion.json"))
);
var packageJson = JSON.parse(await readFile(path.join(__dirname, "../package.json")));
var soft_version;
var EQInfoFetchCount = 0;

// prettier-ignore
var shindoColorTable = { "0": { "r": 63, "g": 250, "b": 54 }, "1": { "r": 189, "g": 255, "b": 12 }, "2": { "r": 255, "g": 255, "b": 0 }, "3": { "r": 255, "g": 221, "b": 0 }, "4": { "r": 255, "g": 144, "b": 0 }, "5": { "r": 255, "g": 68, "b": 0 }, "6": { "r": 245, "g": 0, "b": 0 }, "7": { "r": 170, "g": 0, "b": 0 }, "-3": { "r": 0, "g": 0, "b": 205 }, "-2.9": { "r": 0, "g": 7, "b": 209 }, "-2.8": { "r": 0, "g": 14, "b": 214 }, "-2.7": { "r": 0, "g": 21, "b": 218 }, "-2.6": { "r": 0, "g": 28, "b": 223 }, "-2.5": { "r": 0, "g": 36, "b": 227 }, "-2.4": { "r": 0, "g": 43, "b": 231 }, "-2.3": { "r": 0, "g": 50, "b": 236 }, "-2.2": { "r": 0, "g": 57, "b": 240 }, "-2.1": { "r": 0, "g": 64, "b": 245 }, "-2": { "r": 0, "g": 72, "b": 250 }, "-1.9": { "r": 0, "g": 85, "b": 238 }, "-1.8": { "r": 0, "g": 99, "b": 227 }, "-1.7": { "r": 0, "g": 112, "b": 216 }, "-1.6": { "r": 0, "g": 126, "b": 205 }, "-1.5": { "r": 0, "g": 140, "b": 194 }, "-1.4": { "r": 0, "g": 153, "b": 183 }, "-1.3": { "r": 0, "g": 167, "b": 172 }, "-1.2": { "r": 0, "g": 180, "b": 161 }, "-1.1": { "r": 0, "g": 194, "b": 150 }, "-1": { "r": 0, "g": 208, "b": 139 }, "-0.9": { "r": 6, "g": 212, "b": 130 }, "-0.8": { "r": 12, "g": 216, "b": 121 }, "-0.7": { "r": 18, "g": 220, "b": 113 }, "-0.6": { "r": 25, "g": 224, "b": 104 }, "-0.5": { "r": 31, "g": 228, "b": 96 }, "-0.4": { "r": 37, "g": 233, "b": 88 }, "-0.3": { "r": 44, "g": 237, "b": 79 }, "-0.2": { "r": 50, "g": 241, "b": 71 }, "-0.1": { "r": 56, "g": 245, "b": 62 }, "0.1": { "r": 75, "g": 250, "b": 49 }, "0.2": { "r": 88, "g": 250, "b": 45 }, "0.3": { "r": 100, "g": 251, "b": 41 }, "0.4": { "r": 113, "g": 251, "b": 37 }, "0.5": { "r": 125, "g": 252, "b": 33 }, "0.6": { "r": 138, "g": 252, "b": 28 }, "0.7": { "r": 151, "g": 253, "b": 24 }, "0.8": { "r": 163, "g": 253, "b": 20 }, "0.9": { "r": 176, "g": 254, "b": 16 }, "1.1": { "r": 195, "g": 254, "b": 10 }, "1.2": { "r": 202, "g": 254, "b": 9 }, "1.3": { "r": 208, "g": 254, "b": 8 }, "1.4": { "r": 215, "g": 254, "b": 7 }, "1.5": { "r": 222, "g": 255, "b": 5 }, "1.6": { "r": 228, "g": 254, "b": 4 }, "1.7": { "r": 235, "g": 255, "b": 3 }, "1.8": { "r": 241, "g": 254, "b": 2 }, "1.9": { "r": 248, "g": 255, "b": 1 }, "2.1": { "r": 254, "g": 251, "b": 0 }, "2.2": { "r": 254, "g": 248, "b": 0 }, "2.3": { "r": 254, "g": 244, "b": 0 }, "2.4": { "r": 254, "g": 241, "b": 0 }, "2.5": { "r": 255, "g": 238, "b": 0 }, "2.6": { "r": 254, "g": 234, "b": 0 }, "2.7": { "r": 255, "g": 231, "b": 0 }, "2.8": { "r": 254, "g": 227, "b": 0 }, "2.9": { "r": 255, "g": 224, "b": 0 }, "3.1": { "r": 254, "g": 213, "b": 0 }, "3.2": { "r": 254, "g": 205, "b": 0 }, "3.3": { "r": 254, "g": 197, "b": 0 }, "3.4": { "r": 254, "g": 190, "b": 0 }, "3.5": { "r": 255, "g": 182, "b": 0 }, "3.6": { "r": 254, "g": 174, "b": 0 }, "3.7": { "r": 255, "g": 167, "b": 0 }, "3.8": { "r": 254, "g": 159, "b": 0 }, "3.9": { "r": 255, "g": 151, "b": 0 }, "4.1": { "r": 254, "g": 136, "b": 0 }, "4.2": { "r": 254, "g": 128, "b": 0 }, "4.3": { "r": 254, "g": 121, "b": 0 }, "4.4": { "r": 254, "g": 113, "b": 0 }, "4.5": { "r": 255, "g": 106, "b": 0 }, "4.6": { "r": 254, "g": 98, "b": 0 }, "4.7": { "r": 255, "g": 90, "b": 0 }, "4.8": { "r": 254, "g": 83, "b": 0 }, "4.9": { "r": 255, "g": 75, "b": 0 }, "5.1": { "r": 254, "g": 61, "b": 0 }, "5.2": { "r": 253, "g": 54, "b": 0 }, "5.3": { "r": 252, "g": 47, "b": 0 }, "5.4": { "r": 251, "g": 40, "b": 0 }, "5.5": { "r": 250, "g": 33, "b": 0 }, "5.6": { "r": 249, "g": 27, "b": 0 }, "5.7": { "r": 248, "g": 20, "b": 0 }, "5.8": { "r": 247, "g": 13, "b": 0 }, "5.9": { "r": 246, "g": 6, "b": 0 }, "6.1": { "r": 238, "g": 0, "b": 0 }, "6.2": { "r": 230, "g": 0, "b": 0 }, "6.3": { "r": 223, "g": 0, "b": 0 }, "6.4": { "r": 215, "g": 0, "b": 0 }, "6.5": { "r": 208, "g": 0, "b": 0 }, "6.6": { "r": 200, "g": 0, "b": 0 }, "6.7": { "r": 192, "g": 0, "b": 0 }, "6.8": { "r": 185, "g": 0, "b": 0 }, "6.9": { "r": 177, "g": 0, "b": 0 } };

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
  },
  Info: {
    EEW: {
      kodoriyou: true,
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
    IntColorTheme: "0quake_old",
    psWave: { PwaveColor: "rgb(48, 148, 255)", SwaveColor: "rgb(255, 62, 48)" },
    Shindo: {
      "0": { background: "rgb(80, 86, 102)", color: "rgb(204, 204, 204)" },
      "1": { background: "rgb(134, 168, 198)", color: "rgb(51, 51, 51)" },
      "2": { background: "rgb(56, 120, 193)", color: "rgb(255, 255, 255)" },
      "3": { background: "rgb(80, 186, 84)", color: "rgb(34, 34, 34)" },
      "4": { background: "rgb(204, 209, 74)", color: "rgb(34, 34, 34)" },
      "5m": { background: "rgb(231, 150, 21)", color: "rgb(0, 0, 0)" },
      "5p": { background: "rgb(255, 91, 22)", color: "rgb(0, 0, 0)" },
      "6m": { background: "rgb(237, 0, 0)", color: "rgb(255, 255, 255)" },
      "6p": { background: "rgb(128, 9, 9)", color: "rgb(255, 255, 255)" },
      "7": { background: "rgb(196, 0, 222)", color: "rgb(255, 255, 255)" },
      "?": { background: "rgb(191, 191, 191)", color: "rgb(68, 68, 68)" },
      "5p?": { background: "rgb(231, 150, 21)", color: "rgb(0, 0, 0)" },
    },
    LgInt: {
      "1": { background: "rgb(80, 186, 84)", color: "rgb(34, 34, 34)" },
      "2": { background: "rgb(231, 150, 21)", color: "rgb(0, 0, 0)" },
      "3": { background: "rgb(237, 0, 0)", color: "rgb(255, 255, 255)" },
      "4": { background: "rgb(196, 0, 222)", color: "rgb(255, 255, 255)" },
      "?": { background: "rgb(191, 191, 191)", color: "rgb(68, 68, 68)" },
    },
    Tsunami: {
      TsunamiMajorWarningColor: "rgb(200, 0, 255)",
      TsunamiWarningColor: "rgb(255, 40, 0)",
      TsunamiWatchColor: "rgb(250, 245, 0)",
      TsunamiYohoColor: "rgb(66, 158, 255)",
    },
  },
  data: { layer: "", overlay: [], kmoni_points_show: true },
};
var config = store.get("config", defaultConfigVal);
var isFirstRunTmp = !config || config.system.isFirstRun !== false;
config = mergeDeeply(defaultConfigVal, config);
store.set("config", config);

var psBlock;
var kmoniTimeTmp = {};
var EEW_Data = []; //地震速報リスト
var EEW_nowList = []; //現在発報中リスト
var EarlyEst_Data = []; //Earlyest地震速報リスト

var KmoniOffset = 2500;
var EEWNow = false;

var errorCountkI = 0;

var EQDetect_List = [];

var jmaXML_Fetched = [];
var nakn_Fetched = [];
var narikakun_URLs = [];
var narikakun_EIDs = [];
var eqInfo = { jma: [], usgs: [] };
var kmoniTimeout;
var msil_lastTime = 0;
var kmoniPointsDataTmp, SnetPointsDataTmp, TremRtsData_Marged;
let tray;
var thresholds;

if (app.isPackaged) {
  //メニューバー非表示
  Menu.setApplicationMenu(false);
}

//多重起動防止
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.exit(0);
}

var update_data;
var downloadURL;

//アップデートの確認
function checkUpdate(userAction) {
  try {
    if (net.online) {
      var UpdateError = function () {
        var current_verTmp = soft_version;

        update_data = {
          check_error: true,
          check_date: new Date(),
          latest_version: null,
          current_version: current_verTmp,
          update_available: null,
          dl_page: null,
        };
        if (SettingWindow) {
          SettingWindow.webContents.send("message2", {
            action: "Update_Data",
            data: update_data,
          });
        }
      };
      let request = net.request(
        "https://api.github.com/repos/0quake/Zero-Quake/releases?_=" + Number(new Date())
      );
      request.on("response", (res) => {
        if (!300 <= res._responseHead.statusCode && !res._responseHead.statusCode < 200) {
          var dataTmp = "";
          res.on("data", (chunk) => {
            dataTmp += chunk;
          });
          res.on("end", function () {
            try {
              var json = ParseJSON(dataTmp);
              var latest_verTmp = String(json[0].tag_name.replace("v", ""));

              var current_verTmp = packageJson.version;
              var latest_v = String(latest_verTmp).split(".").map(Number);
              var current_v = String(current_verTmp).split(".").map(Number);
              var dl_page = json[0].html_url;
              var update_detail = json[0].body;
              downloadURL = json[0].assets[0];
              if (downloadURL && downloadURL.browser_download_url)
                downloadURL = downloadURL.browser_download_url;
              else {
                update_data = { check_error: true, check_date: new Date() };
                if (SettingWindow) {
                  SettingWindow.webContents.send("message2", {
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

                    if (!userAction) {
                      var options4 = {
                        type: "question",
                        title: "アプリケーションの更新",
                        message: "Zero Quake で更新が利用可能です。",
                        detail: "v." + current_verTmp + " > v." + latest_verTmp + "\n操作を選択してください。",
                        buttons: ["後で確認", "詳細を確認"],
                        noLink: true,
                      };

                      dialog.showMessageBox(MainWindow, options4).then(function (result) {
                        if (result.response == 1) {
                          Create_SettingWindow(true);
                        }
                      });
                    }
                  }
                }
              }

              update_data = {
                check_error: false,
                check_date: new Date(),
                latest_version: latest_verTmp,
                current_version: current_verTmp,
                update_available: update_available,
                dl_page: dl_page,
                update_detail: update_detail,
              };
              if (SettingWindow) {
                SettingWindow.webContents.send("message2", {
                  action: "Update_Data",
                  data: update_data,
                });
              }
            } catch {
              UpdateError();
            }
          });
        }
      });
      request.on("error", UpdateError);
      request.end();
    }
  } catch (err) {
    throw new Error("アップデートの確認に失敗しました。", { cause: err });
  }
}

//定期実行
function ScheduledExecution() {
  //axisのアクセストークン確認
  if (config.Source.axis.GetData) {
    if (net.online) {
      var request = net.request(
        "https://axis.prioris.jp/api/token/refresh/?token=" +
        config.Source.axis.AccessToken
      );
      request.on("response", (res) => {
        var dataTmp = "";
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          try {
            var json = ParseJSON(dataTmp);
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
          } catch {
            UpdateStatus(new Date() - Replay, "axis", "Error");
          }
        });
      });
      request.end();
    }
  }
}

//準備完了イベント
app.whenReady().then(() => {
  //ウィンドウ作成
  Create_WorkerWindow();
  //定期実行
  ScheduledExecution();
  setInterval(ScheduledExecution, 600000);

  //↓ 「!== false」必須
  if (isFirstRunTmp) {
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

  //初期化処理
  start();

  checkUpdate();
});

let options = {
  type: "error",
  title: "エラー",
  message: "予期しないエラーが発生しました",
  detail: "動作を選択してください。",
  buttons: ["今すぐ再起動", "終了", "無視"],
  noLink: true,
};
var errorMsgBox = false;
//エラーイベント
// eslint-disable-next-line no-undef
process.on("uncaughtException", function (err) {
  try {
    if (!errorMsgBox && app.isReady()) {
      if (String(err.stack).startsWith("Error: net::ERR_")) return false;
      errorMsgBox = true;
      options.detail = "動作を選択してください。エラーメッセージは以下の通りです。\n************\n" + causeTree(err);

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
    return;
  }
});

//エラーメッセージの作成。エラー原因のツリー
function causeTree(err) {
  try {
    var ErrString = err.stack;
    var i = 0;
    while (err.cause && i < 10) {
      ErrString += "\n[cause]:" + err.cause.stack;
      i++;
      err = err.cause;
    }
    return ErrString;
  } catch {
    return "";
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
      ConvertSnet(response.data, response.date);
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
        if (MainWindow) {
          MainWindow.reload();
          MainWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (WorkerWindow) {
          WorkerWindow.reload();
          WorkerWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (TsunamiWindow) {
          TsunamiWindow.reload();
          TsunamiWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (NankaiWindow.window) {
          NankaiWindow.window.reload();
          NankaiWindow.window.webContents.setZoomFactor(config.system.zoom);
        }
        if (SettingWindow) {
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
      MargeEEW(response.data);
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
      }
      break;
    case "Request_gaikyo":
      Req_JMA_gaikyo();
      break;
    case "Request_wepa":
      Req_JMA_wepa();
      break;
    case "wepa_window":
      Create_WepaWindow(response.fname);
      break;
  }
});

function setOpenAtLogin(openAtLogin) {
  // eslint-disable-next-line no-undef
  if (process.platform != "win32") {
    app.setLoginItemSettings({ openAtLogin: openAtLogin });
  } else {
    app.setLoginItemSettings({ openAtLogin: false });

    const homePath = String(app.getPath("home")).replace("\\\\", "/");
    const dist = `${homePath}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/ZeroQuake.lnk`;
    if (openAtLogin) {
      const source = String(app.getPath("exe")).replace("\\\\", "/");
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

const unresponsiveMsg = {
  type: "question",
  title: "ウィンドウが応答しません。",
  message: "動作を選択してください。",
  buttons: ["画面を再表示", "アプリを再起動", "待機"],
  noLink: true,
};
//メインウィンドウ表示処理
function CreateMainWindow() {
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

        minWidth: 650,
        minHeight: 400,
        icon: path.join(__dirname, "img/icon.ico"),
        webPreferences: {
          preload: path.join(__dirname, "js/preload.js"),
          title: "Zero Quake",
          backgroundThrottling: false,
        },
        backgroundColor: "#222225",
        alwaysOnTop: config.system.alwaysOnTop,
      });
      if (store.get("Maximized", null)) MainWindow.maximize()
      else MainWindow.unmaximize()

      if (Replay !== 0) {
        messageToMainWindow({ action: "Replay", data: Replay });
      }

      MainWindow.webContents.on("did-finish-load", () => {
        MainWindow.webContents.setZoomFactor(config.system.zoom);

        if (notifyData) messageToMainWindow(notifyData);

        if (Replay !== 0) {
          messageToMainWindow({ action: "Replay", data: Replay });
        }

        Object.keys(kmoniTimeTmp).forEach(function (key) {
          var elm = kmoniTimeTmp[key];
          messageToMainWindow({
            action: "UpdateStatus",
            Updatetime: elm.Updatetime,
            LocalTime: elm.LocalTime,
            type: elm.type,
            condition: elm.condition,
          });
        });

        messageToMainWindow({ action: "setting", data: config });

        if (EEWNow) {
          messageToMainWindow({ action: "EEW_AlertUpdate", data: EEW_nowList });
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
        EQCount_process(null)

        EQDetect_List.forEach(function (elm) {
          var threshold01Tmp = elm.isCity ? thresholds.threshold01C : thresholds.threshold01;
          if (elm.Codes.length >= threshold01Tmp) {
            messageToMainWindow({ action: "EQDetect", data: elm });
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
        if (HokkaidoSanrikuInfoAll[0]) {
          messageToMainWindow({
            action: "HokkaidoSanrikuInfo",
            data: HokkaidoSanrikuInfoAll[0],
          });
        }
        if (KatsudoJokyoInfoAll[0]) {
          messageToMainWindow({
            action: "KatsudoJokyoInfo",
            data: KatsudoJokyoInfoAll[0],
          });
        }

        messageToMainWindow({ action: "init" });
      });

      MainWindow.loadFile("src/index.html");

      function savePosition() {
        const { x, y, width, height } = MainWindow.getBounds();
        store.set({ x, y, width, height });
        store.set("Maximized", MainWindow.isMaximized());
      }
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
function Create_WorkerWindow() {
  if (WorkerWindow) WorkerWindow.close();
  WorkerWindow = new BrowserWindow({
    webPreferences: { preload: path.join(__dirname, "js/preload.js") },
    backgroundThrottling: false,
    show: false,
  });
  WorkerWindow.on("close", () => {
    WorkerWindow = null;
    setTimeout(Create_WorkerWindow, 2000)
  });
  WorkerWindow.webContents.on("did-finish-load", () => {
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
function Create_SettingWindow(update) {
  try {
    if (SettingWindow) {
      if (SettingWindow.isMinimized()) SettingWindow.restore();
      if (!SettingWindow.isFocused()) SettingWindow.focus();
      return false;
    }

    SettingWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "設定 - Zero Quake",
        parent: MainWindow ? MainWindow : null,
        center: true,
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    SettingWindow.webContents.on("did-finish-load", () => {
      SettingWindow.webContents.setZoomFactor(config.system.zoom);

      if (Replay !== 0) {
        SettingWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }

      const homePath = String(app.getPath("home")).replace("\\\\", "/");
      SettingWindow.webContents.send("message2", {
        action: "initialData",
        config: config,
        defaultConfigVal: defaultConfigVal,
        softVersion: soft_version,
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
    SettingWindow.on("closed", () => {
      SettingWindow = null;
    });

    SettingWindow.loadFile("src/settings.html");
    SettingWindow.webContents.on("will-navigate", handleUrlOpen);
    SettingWindow.webContents.on("new-window", handleUrlOpen);
  } catch (err) {
    throw new Error("設定ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//津波情報ウィンドウ表示処理
function Create_TsunamiWindow() {
  try {
    if (TsunamiWindow) {
      if (TsunamiWindow.isMinimized()) TsunamiWindow.restore();
      if (!TsunamiWindow.isFocused()) TsunamiWindow.focus();
      return false;
    }
    TsunamiWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "津波詳細情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    TsunamiWindow.webContents.on("did-finish-load", () => {
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
var NankaiWindow = { type: null, window: null };
function Create_NankaiWindow(type) {
  try {
    if (NankaiWindow.window && NankaiWindow.window.isMinimized())
      NankaiWindow.window.restore();
    if (NankaiWindow.window && !NankaiWindow.window.isFocused())
      NankaiWindow.window.focus();

    if (NankaiWindow.window) {
      if (NankaiWindow.type == type) {
        //同じ情報について表示していたならおわる
        return false;
      } else NankaiWindow.type = type;
    } else {
      NankaiWindow.type = type;
      NankaiWindow.window = new BrowserWindow({
        minWidth: 650,
        minHeight: 400,
        icon: path.join(__dirname, "img/icon.ico"),
        webPreferences: {
          preload: path.join(__dirname, "js/preload.js"),
          title: "南海トラフ地震に関連する情報 - Zero Quake",
        },
        backgroundColor: "#222225",
        alwaysOnTop: config.system.alwaysOnTop,
      });

      NankaiWindow.window.webContents.on("did-finish-load", () => {
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
        NankaiWindow = {};
      });
    }

    NankaiWindow.window.loadFile("src/NankaiTrough.html");
  } catch (err) {
    throw new Error("南海トラフ関連情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//WEPA40 国際津波関連情報ウィンドウ
var WepaWindow = {}
function Create_WepaWindow(fname) {
  try {
    if (WepaWindow[fname]) {
      if (WepaWindow[fname].isMinimized()) WepaWindow[fname].restore();
      if (!WepaWindow[fname].isFocused()) WepaWindow[fname].focus();
      return false;
    }

    WepaWindow[fname] = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "国際津波関連情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    WepaWindow[fname].webContents.on("did-finish-load", () => {
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
      WepaWindow[fname] = null;
    });

    WepaWindow[fname].loadFile("src/WEPA.html");
  } catch (err) {
    throw new Error("国際津波関連情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//北海道・三陸沖後発地震注意情報ウィンドウ
var HokkaidoSanrikuWindow;
function Create_HokkaidoSanrikuWindow() {
  try {
    if (HokkaidoSanrikuWindow) {
      if (HokkaidoSanrikuWindow.isMinimized()) HokkaidoSanrikuWindow.restore();
      if (!HokkaidoSanrikuWindow.isFocused()) HokkaidoSanrikuWindow.focus();
      return false;
    }

    HokkaidoSanrikuWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "北海道・三陸沖後発地震注意情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    HokkaidoSanrikuWindow.webContents.on("did-finish-load", () => {
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
var KatsudoJokyoWindow
function Create_KatsudoJokyoWindow() {
  try {
    if (KatsudoJokyoWindow) {
      if (KatsudoJokyoWindow.isMinimized()) KatsudoJokyoWindow.restore();
      if (!KatsudoJokyoWindow.isFocused()) KatsudoJokyoWindow.focus();
      return false;
    }

    KatsudoJokyoWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "地震の活動状況等に関する情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    KatsudoJokyoWindow.webContents.on("did-finish-load", () => {
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

function messageToMainWindow(message) {
  if (MainWindow) MainWindow.webContents.send("message2", message);
}

//地震情報ウィンドウ表示処理
var EQI_Window = {};
function handleUrlOpen(e, url) {
  if (url.match(/^http/)) {
    e.preventDefault();
    shell.openExternal(url);
  }
}
function EQInfo_createWindow(response, IS_WebURL) {
  try {
    var EQInfoWindowT = EQI_Window[response.eid];
    if (EQInfoWindowT) {
      if (EQInfoWindowT.window.isMinimized()) EQInfoWindowT.window.restore();
      if (!EQInfoWindowT.window.isFocused()) EQInfoWindowT.window.focus();
      return;
    }

    var EQInfoWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "地震詳細情報 - Zero Quake",
      },
      backgroundColor: IS_WebURL ? null : "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    if (!IS_WebURL) {
      var EEWDataItem = EEW_Data.find(function (elm) {
        return elm.EQ_id == response.eid;
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
    EQInfoWindow.webContents.on("new-window", handleUrlOpen);
  } catch (err) {
    throw new Error("地震情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

var TimeTable_JMA2001 = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/TimeTable_JMA2001.json"))
);

//開始処理
function start() {
  soft_version = packageJson.version;

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
}

function Req_JMA_gaikyo() {
  if (net.online) {
    var request = net.request("https://www.data.jma.go.jp/svd/eqev/data/gaikyo/?_=" + Number(new Date()));
    request.on("response", (res) => {
      var text = "";
      res.on("data", (chunk) => {
        text += chunk;
      });
      res.on("end", function () {
        try {
          const parser = new new JSDOM().window.DOMParser();
          const doc = parser.parseFromString(text, "text/html");
          var data = [];
          doc.querySelectorAll("ul.subMenu li a").forEach(function (elm) {
            var href = elm.getAttribute("href");
            if (href.includes("monthly/")) {
              var date = new Date(elm.textContent.substring(0, 4), elm.textContent.substring(5, 7) - 1 + 1, 0); //月の最終日を取得
              data.push({
                date: date,
                dateStr: `${elm.textContent.substring(0, 4)}/${elm.textContent.substring(5, 7)}`,
                title: "地震・火山月報（防災編）",
                headline: "地震・火山月報（防災編）",
                url: "https://www.data.jma.go.jp/svd/eqev/data/gaikyo/" + href,
              });
            } else if (href.includes("press/") || href.includes("oshirase/")) {
              data.push({
                date: new Date(
                  elm.textContent.substring(0, 4), elm.textContent.substring(5, 7) - 1, elm.textContent.substring(8, 10),
                  elm.textContent.substring(11, 13), elm.textContent.substring(14, 16)),
                dateStr: `${elm.textContent.substring(0, 4)}/${elm.textContent.substring(5, 7)}/${elm.textContent.substring(8, 10)} ${elm.textContent.substring(11, 13)}:${elm.textContent.substring(14, 16)}`,
                title: "地震解説資料",
                headline: "地震解説資料\n" + elm.textContent.substring(17).trim(),
                url: "https:" + href,
              });
            } else if (href.includes("weekly/zenkoku/")) {
              var year = Number(elm.textContent.substring(0, 4));
              var year2 = Number(year);
              var number = Number(elm.textContent.substring(8, 10));
              if (number == 1 && Number(elm.textContent.substring(19, 21)) == 12) year -= 1;
              data.push({
                date0: new Date(year, elm.textContent.substring(19, 21) - 1, elm.textContent.substring(22, 24)),
                date: new Date(year2, elm.textContent.substring(31, 33) - 1, elm.textContent.substring(34, 36)),
                dateStr: `${year}/${elm.textContent.substring(19, 21)}/${elm.textContent.substring(22, 24)}～${elm.textContent.substring(31, 33)}/${elm.textContent.substring(34, 36)}`,
                title: "週間地震概況（全国）",
                headline: "週間地震概況（全国）No." + number,
                url: "https://www.data.jma.go.jp/svd/eqev/data/gaikyo/" + href,
              });
            } else if (href.includes("weekly/nt/")) {
              var year = Number(elm.textContent.substring(0, 4));
              var year2 = Number(year);
              var number = Number(elm.textContent.substring(8, 10));
              if (number == 1 && Number(elm.textContent.substring(19, 21)) == 12)
                year -= 1;
              data.push({
                date0: new Date(year, elm.textContent.substring(19, 21) - 1, elm.textContent.substring(22, 24)),
                date: new Date(year2, elm.textContent.substring(31, 33) - 1, elm.textContent.substring(34, 36)),
                dateStr: `${year}/${elm.textContent.substring(19, 21)}/${elm.textContent.substring(22, 24)}～${elm.textContent.substring(31, 33)}/${elm.textContent.substring(34, 36)}`,
                title: "週間地震活動概況（南海トラフ周辺）",
                headline: "週間地震活動概況（南海トラフ周辺）No." + number,
                url: "https://www.data.jma.go.jp/svd/eqev/data/gaikyo/" + href,
              });
            }
          });
          data.sort(function (a, b) {
            return a.date < b.date ? 1 : -1;
          });
          messageToMainWindow({ action: "Return_gaikyo", data: data });
        } catch {
          messageToMainWindow({ action: "Return_gaikyo", data: [] });
        }
      });
    });
    request.on("error", () => {
      messageToMainWindow({ action: "Return_gaikyo", data: [] });
    });
    request.end();
  }
}

function Req_JMA_wepa() {
  if (net.online) {
    var request = net.request("https://www.jma.go.jp/bosai/pacifictsunami/data/list.json?_=" + Number(new Date()));
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = ParseJSON(dataTmp);
          messageToMainWindow({ action: "Return_wepa", data: json });
        } catch {
          messageToMainWindow({ action: "Return_wepa", data: [] });
        }
      });
    });
    request.on("error", () => {
      messageToMainWindow({ action: "Return_wepa", data: [] });
    });
    request.end();
  }
}

var TremRts_sta;
var Trem_server = true;
function Req_TremRts_sta() {
  if (net.online) {
    var request = net.request("https://api-" + (Trem_server ? 1 : 2) + ".exptech.dev/api/v1/trem/station?_=" + Number(new Date()));
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = ParseJSON(dataTmp);
          if (json) TremRts_sta = json;
        } catch {
          UpdateStatus(new Date() - Replay, "TREM-RTS", "Error");
          Trem_server = !Trem_server;
        }
      });
    });
    request.on("error", () => {
      Trem_server = !Trem_server;
    });
    request.end();
  }
}

var TremRTS_server = true;
function Req_TremRts() {
  if (config.Source.TREMRTS.GetData) {
    if (net.online) {
      if (!TremRts_sta) Req_TremRts_sta();

      if (Replay !== 0) var url = "https://api-" + (TremRTS_server ? 1 : 2) + ".exptech.dev/api/v1/trem/rts/" + Number(new Date() - Replay);
      else var url = "https://lb-" + (TremRTS_server ? 1 : 2) + ".exptech.dev/api/v1/trem/rts?_=" + Number(new Date());

      var request = net.request(url);
      request.on("response", (res) => {
        var dataTmp = "";
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          try {
            var json = ParseJSON(dataTmp);
            var TremRtsData = {};
            Object.keys(json.station).forEach(function (StID) {
              var st = json.station[StID];
              var stationData = TremRts_sta ? TremRts_sta[StID] : null;
              if (stationData) {
                var JPShindo = st.i; //おおむね対応するため、現時点では変換不要と判断
                var rgb = shindoColorTable[Math.max(-3, Math.floor(JPShindo * 10) / 10)];
                TremRtsData[StID] = {
                  Type: "TREMRTS",
                  shindo: JPShindo,
                  PGA: st.pga,
                  Code: StID,
                  Name: "",
                  Location: {
                    Longitude: stationData.info[0].lon,
                    Latitude: stationData.info[0].lat,
                  },
                  rgb: [rgb.r, rgb.g, rgb.b],
                };
              }
            });
            TremRtsData_Marged = {
              action: "TREM-RTSUpdate",
              LocalTime: new Date(),
              data: TremRtsData,
            };
            messageToMainWindow(TremRtsData_Marged);
            UpdateStatus(new Date(json.time), "TREM-RTS", "success");
          } catch {
            UpdateStatus(new Date() - Replay, "TREM-RTS", "Error");
            TremRTS_server = !TremRTS_server;
          }
        });
      });
      request.on("error", () => {
        UpdateStatus(new Date() - Replay, "TREM-RTS", "Error");
        TremRTS_server = !TremRTS_server;
      });
      request.end();
    } else UpdateStatus(new Date() - Replay, "TREM-RTS", "Error");
  }

  setTimeout(Req_TremRts, config.Source.TREMRTS.Interval);
}

function Req_EarlyEst() {
  if (config.Source.EarlyEst.GetData) {
    if (net.online) {
      var request = net.request("http://early-est.rm.ingv.it/monitor.xml");
      request.on("response", (res) => {
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          UpdateStatus(new Date() - Replay, "Early-est", "Error");
        } else {
          var dataTmp = "";
          res.on("data", (chunk) => {
            dataTmp += chunk;
          });
          res.on("end", function () {
            try {
              UpdateStatus(new Date() - Replay, "Early-est", "success");
              let parser = new new JSDOM().window.DOMParser();
              let doc = parser.parseFromString(dataTmp, "text/xml");
              Array.prototype.forEach.call(
                doc.getElementsByTagName("eventParameters"),
                function (parent) {
                  var elm = parent.getElementsByTagName("event")[0];
                  if (elm) {
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
                        serial:
                          Number(elm.querySelector("origin quality").getElementsByTagName("ee:report_count")[0].textContent) + 1,
                        report_time: elm.querySelector("creationInfo creationTime")
                          ? ConvertJST(new Date(elm.querySelector("creationInfo creationTime").textContent)) : null,
                        magnitude: elm.querySelector("magnitude mag value")
                          ? Number(elm.querySelector("magnitude mag value").textContent) : null,
                        depth: elm.querySelector("origin depth value")
                          ? Number(elm.querySelector("origin depth value").textContent) / 1000 : null,
                        latitude: latitude,
                        longitude: longitude,
                        region_name: FECode.properties.nameJA,
                        origin_time: elm.querySelector("origin time value")
                          ? ConvertJST(new Date(elm.querySelector("origin time value").textContent)) : null,
                        source: "EarlyEst",
                      };
                      MargeEarlyEst(data);
                    }
                  }
                }
              );
            } catch {
              UpdateStatus(new Date() - Replay, "Early-est", "Error");
            }
          });
        }
      });
      request.on("error", () => {
        UpdateStatus(new Date() - Replay, "Early-est", "Error");
      });

      request.end();
    } else UpdateStatus(new Date() - Replay, "Early-est", "Error");
  }
  setTimeout(Req_EarlyEst, config.Source.EarlyEst.Interval);
}

function createWorker() {
  worker = new workerThreads.Worker(path.join(__dirname, "js/EQDetectWorker.js"));
  worker.on("message", (message) => {
    switch (message.action) {
      case "EQDetectAdd":
        var EQD_ItemTmp = message.data;
        var LvTmp = EQD_ItemTmp.maxPGA > 1.3 ? 2 : 1;

        if (config.Info.RealTimeShake.noticeLv <= LvTmp) {
          if (EQD_ItemTmp.showed) {//続報時
            if (LvTmp == 2 && EQD_ItemTmp.Lv == 1) {
              //既存イベントのレベルが上がったときの通知音
              PlayAudio("EQDetectLv2");
            }
          } else if (LvTmp == 2) {//初報時・大
            PlayAudio("EQDetectLv2");
            CreateMainWindow();
          } else if (LvTmp == 1) {//初報時・小
            PlayAudio("EQDetectLv1");
            CreateMainWindow();
          }
        }
        EQD_ItemTmp.Lv = LvTmp;
        messageToMainWindow({ action: "EQDetect", data: message.data });
        break;
      case "sendDataToMainWindow":
        messageToMainWindow(message.data);
        break;
      case "sendDataToWorkerWindow":
        if (WorkerWindow) WorkerWindow.webContents.send("message2", message.data);
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
    throw new Error("地震検知処理でエラーが発生しました。", { cause: error });
  });
}

//強震モニタリアルタイム揺れ情報処理（地震検知など）
function ConvertKmoni(data, date) {
  worker.postMessage({
    action: "EQDetect",
    data: data,
    date: date,
    detect: config.Info.RealTimeShake.DetectEarthquake,
  });
}

//海しるリアルタイム揺れ情報処理
function ConvertSnet(data, date) {
  SnetPointsDataTmp = {
    action: "SnetUpdate",
    Updatetime: new Date(date),
    LocalTime: new Date(),
    data: { data: data },
  };
  messageToMainWindow(SnetPointsDataTmp);
}

var kmoniI_url = 0;
//強震モニタへのHTTPリクエスト
function Req_kmoni() {
  if (config.Source.kmoni.kmoni.GetData) {
    if (net.online) {
      var ReqTime = new Date() - KmoniOffset - Replay;
      var urlTmp = [
        "https://smi.lmoniexp.bosai.go.jp/data/map_img/RealTimeImg/jma_s/" + NormalizeDate(2, ReqTime) + "/" + NormalizeDate(1, ReqTime) + ".jma_s.gif",
        "http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/jma_s/" + NormalizeDate(2, ReqTime) + "/" + NormalizeDate(1, ReqTime) + ".jma_s.gif",
      ][kmoniI_url];

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
                if (kmoniI_url >= urlTmp.length - 1) kmoniI_url = 0;
                SetKmoniOffset(Req_kmoni);
              }
              UpdateStatus(new Date() - Replay, "kmoniImg", "Error");
            } else {
              errorCountkI = 0;
              // eslint-disable-next-line no-undef
              var bufTmp = Buffer.concat(dataTmp);
              if (WorkerWindow) {
                WorkerWindow.webContents.send("message2", {
                  action: "KmoniImgUpdate",
                  data: "data:image/gif;base64," + bufTmp.toString("base64"),
                  date: ReqTime,
                });
              }
            }
          } catch {
            UpdateStatus(new Date() - Replay, "kmoniImg", "Error");
          }
        });
      });
      request.end();
    } else UpdateStatus(new Date() - Replay, "kmoniImg", "Error");
  }

  if (kmoniTimeout) clearTimeout(kmoniTimeout);
  kmoniTimeout = setTimeout(Req_kmoni, config.Source.kmoni.kmoni.Interval);
}

//海しるへのHTTPリクエスト処理
function Req_SNet() {
  if (config.Source.msil.GetData) {
    if (net.online) {
      var request = net.request("https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer/query?f=json&returnGeometry=false&outFields=msilstarttime%2Cmsilendtime&_=" + new Date());
      request.on("response", (res) => {
        var dataTmp = "";
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          try {
            var json = ParseJSON(dataTmp);
            if (!json || !json.features || !Array.isArray(json.features)) return false;
            var dateTime = 0;
            var NowDateTime = Number(new Date() - Replay);
            json.features.forEach(function (elm) {
              if (
                NowDateTime - dateTime > NowDateTime - elm.attributes.msilstarttime &&
                NowDateTime >= elm.attributes.msilstarttime
              )
                dateTime = Number(elm.attributes.msilstarttime);
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
                    if (WorkerWindow) {
                      // eslint-disable-next-line no-undef
                      var bufTmp = Buffer.concat(dataTmp);
                      var ReqTime = new Date(dateTime);
                      WorkerWindow.webContents.send("message2", {
                        action: "SnetImgUpdate",
                        data: "data:image/png;base64," + bufTmp.toString("base64"),
                        date: ReqTime,
                      });
                    }
                    UpdateStatus(new Date() - Replay, "msilImg", "success");
                  } catch {
                    UpdateStatus(new Date() - Replay, "msilImg", "Error");
                  }
                });
              });
              request.end();
              msil_lastTime = dateTime;
            }
          } catch {
            UpdateStatus(new Date() - Replay, "msilImg", "Error");
          }
        });
      });
      request.on("error", () => {
        UpdateStatus(new Date() - Replay, "msilImg", "Error");
      });

      request.end();
    } else UpdateStatus(new Date() - Replay, "msilImg", "Error");
  }
  setTimeout(Req_SNet, config.Source.msil.Interval);
}

//P2P地震情報API WebSocket接続・受信処理
var P2P_Client;
function P2P() {
  P2P_Client = new WebSocketClient();
  P2P_Client.on("connectFailed", function () {
    UpdateStatus(new Date() - Replay, "P2P_EEW", "Error");
    setTimeout(TryConnect_P2P, 5000);
  });
  P2P_Client.on("connect", function (connection) {
    connection.on("error", function () {
      UpdateStatus(new Date() - Replay, "P2P_EEW", "Error");
    });
    connection.on("close", function () {
      UpdateStatus(new Date() - Replay, "P2P_EEW", "Disconnect");
      setTimeout(TryConnect_P2P, 5000);
    });
    connection.on("message", function (message) {
      try {
        if (Replay == 0 && message.type === "utf8") {
          var data = JSON.parse(message.utf8Data);
          if (data.time) UpdateStatus(new Date(data.time), "P2P_EEW", "success");
          else UpdateStatus(new Date(), "P2P_EEW", "success");

          switch (data.code) {
            case 551:
              setTimeout(UpdateEQInfo, 10000);
              break;
            case 552:
              //津波情報
              data.issue.time = new Date(data.issue.time);
              data.cancelled = false;
              data.revocation = false;
              data.source = "P2P";

              data.areas.forEach((elm) => {
                if (elm.firstHeight) {
                  if (elm.firstHeight.condition)
                    elm.firstHeightCondition = elm.firstHeight.condition;
                  if (elm.firstHeight.arrivalTime)
                    elm.firstHeight = new Date(elm.firstHeight.arrivalTime);
                  else elm.firstHeight = null;
                }
                if (elm.maxHeight && elm.maxHeight.description)
                  elm.maxHeight = elm.maxHeight.description;
              });
              ConvertTsunamiInfo(data);
              break;
            case 556:
              //緊急地震速報（警報）
              DetectEEW(4, data);
              break;
          }
        }
      } catch {
        UpdateStatus(new Date() - Replay, "P2P_EEW", "Error");
      }
    });
    UpdateStatus(new Date() - Replay, "P2P_EEW", "success");
  });
  Connect_P2P();
}
var P2PReconnectTimeout = 500;
function TryConnect_P2P() {
  P2PReconnectTimeout *= 2;
  setTimeout(Connect_P2P, P2PReconnectTimeout);
}
function Connect_P2P() {
  if (P2P_Client) P2P_Client.connect("wss://api.p2pquake.net/v2/ws");
}

//AXIS WebSocket接続・受信処理
var AXIS_Client;
function AXIS() {
  if (!config.Source.axis.GetData) return;
  AXIS_Client = new WebSocketClient();

  AXIS_Client.on("connectFailed", function () {
    UpdateStatus(new Date() - Replay, "axis", "Error");
    TryConnect_AXIS();
  });

  AXIS_Client.on("connect", function (connection) {
    connection.on("error", function () {
      UpdateStatus(new Date() - Replay, "axis", "Error");
    });
    connection.on("close", function () {
      UpdateStatus(new Date() - Replay, "axis", "Disconnect");
      TryConnect_AXIS();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus(new Date() - Replay, "axis", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr == "hello") return;
        var data = ParseJSON(dataStr);
        if (data && data.channel) {
          switch (data.channel) {
            case "eew":
              DetectEEW(3, data.message);
              break;
            case "jmx-seismology":
              //地震情報
              var EarthquakeElm = {
                Hypocenter: { Area: { Name: null } },
                Magnitude: [{ valueOf_: null }],
              };
              var IntensityElm = { Observation: { MaxInt: null } };
              var OriginTimeTmp;
              if (data.message.Body.Earthquake[0]) {
                EarthquakeElm = data.message.Body.Earthquake[0];
                OriginTimeTmp = new Date(EarthquakeElm.OriginTime);
              }
              if (!OriginTimeTmp)
                OriginTimeTmp = new Date(data.message.Head.TargetDateTime);
              if (data.message.Body.Intensity) IntensityElm = data.message.Body.Intensity;

              ConvertEQInfo(
                [
                  {
                    status: data.message.Control.Status,
                    eventId: data.message.Head.EventID,
                    category: data.message.Head.Title,
                    reportDateTime: new Date(data.message.Head.ReportDateTime),
                    OriginTime: OriginTimeTmp,
                    epiCenter: EarthquakeElm.Hypocenter.Area.Name,
                    M: Number(EarthquakeElm.Magnitude[0].valueOf_),
                    maxI: NormalizeShindo(IntensityElm.Observation.MaxInt),
                    cancel: data.message.Head.InfoType == "取消",
                    DetailURL: [],
                    headline: data.message.Head.Headline.Text,
                    axisData: data,
                  },
                ],
                "jma"
              );
              break;
          }
        }
      } catch {
        UpdateStatus(new Date() - Replay, "axis", "Error");
      }
    });
    UpdateStatus(new Date() - Replay, "axis", "success");
  });

  Connect_AXIS();
}
var AXIS_ConnectedDate = new Date();
function TryConnect_AXIS() {
  var timeoutTmp = Math.max(30000 - (new Date() - AXIS_ConnectedDate), 100);
  setTimeout(Connect_AXIS, timeoutTmp);
}
function Connect_AXIS() {
  if (AXIS_Client)
    AXIS_Client.connect("wss://ws.axis.prioris.jp/socket", null, null, {
      Authorization: `Bearer ${config.Source.axis.AccessToken}`,
    });
  AXIS_ConnectedDate = new Date();
}

//ProjectBS WebSocket接続・受信処理
var ProjectBS_Client;
var ProjectBS_Connection;
function ProjectBS() {
  if (!config.Source.ProjectBS.GetData) return;
  ProjectBS_Client = new WebSocketClient();

  ProjectBS_Client.on("connectFailed", function () {
    UpdateStatus(new Date() - Replay, "ProjectBS", "Error");
    TryConnect_ProjectBS();
  });

  ProjectBS_Client.on("connect", function (connection) {
    ProjectBS_Connection = connection;
    connection.on("error", function () {
      UpdateStatus(new Date() - Replay, "ProjectBS", "Error");
    });
    connection.on("close", function () {
      UpdateStatus(new Date() - Replay, "ProjectBS", "Disconnect");
      TryConnect_ProjectBS();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus(new Date() - Replay, "ProjectBS", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr !== "pong") DetectEEW(1, ParseJSON(dataStr));
      } catch {
        UpdateStatus(new Date() - Replay, "ProjectBS", "Error");
      }
    });
    connection.sendUTF("queryjson");

    UpdateStatus(new Date() - Replay, "ProjectBS", "success");
    setInterval(function () {
      connection.sendUTF("ping");
    }, 600000);
  });

  Connect_ProjectBS();
}
var ProjectBS_ConnectedDate = new Date();
function TryConnect_ProjectBS() {
  var timeout = Math.max(30000 - (new Date() - ProjectBS_ConnectedDate), 100);
  setTimeout(Connect_ProjectBS, timeout);
}
function Connect_ProjectBS() {
  if (ProjectBS_Client) ProjectBS_Client.connect("wss://telegram-cf.projectbs.cn/jmaeewws/");
  ProjectBS_ConnectedDate = new Date();
}

//Wolfx WebSocket接続・受信処理
var WolfxWS_Client;
var WolfxConnection;
function WolfxWS() {
  if (!config.Source.wolfx.GetData) return;
  WolfxWS_Client = new WebSocketClient();

  WolfxWS_Client.on("connectFailed", function () {
    UpdateStatus(new Date() - Replay, "wolfx", "Error");
    TryConnect_WolfxWS();
  });

  WolfxWS_Client.on("connect", function (WolfxConnection) {
    WolfxConnection.on("error", function () {
      UpdateStatus(new Date() - Replay, "wolfx", "Error");
    });
    WolfxConnection.on("close", function () {
      UpdateStatus(new Date() - Replay, "wolfx", "Disconnect");
      TryConnect_WolfxWS();
    });
    WolfxConnection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus(new Date() - Replay, "wolfx", "success");
      try {
        var json = ParseJSON(message.utf8Data);
        if (json.type == "heartbeat") {
          WolfxConnection.sendUTF("ping");
        } else if (json.type == "jma_eew") {
          DetectEEW(2, json);
        } else if (json.type == "jma_eqlist") {
          UpdateEQInfo();
        }
      } catch {
        UpdateStatus(new Date() - Replay, "wolfx", "Error");
      }
      setInterval(function () {
        WolfxConnection.sendUTF("ping");
      }, 60000);
    });
    WolfxConnection.sendUTF("query_jmaeew");
    UpdateStatus(new Date() - Replay, "wolfx", "success");
  });

  Connect_WolfxWS();
}
var Wolfx_ConnectedDate = new Date();
function TryConnect_WolfxWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Wolfx_ConnectedDate), 100);
  setTimeout(Connect_WolfxWS, timeoutTmp);
}
function Connect_WolfxWS() {
  if (WolfxWS_Client) WolfxWS_Client.connect("wss://ws-api.wolfx.jp/all_eew");
  Wolfx_ConnectedDate = new Date();
}

//Seisjs WebSocket接続・受信処理
var SeisjsWS_Client;
function SeisjsWS() {
  if (!config.Source.wolfx.GetDataFromSeisJS) return;
  SeisjsWS_Client = new WebSocketClient();

  SeisjsWS_Client.on("connectFailed", function () {
    UpdateStatus(new Date() - Replay, "wolfx", "Error");
    TryConnect_SeisjsWS();
  });

  SeisjsWS_Client.on("connect", function (SeisjsConnection) {
    SeisjsConnection.on("error", function () {
      UpdateStatus(new Date() - Replay, "wolfx", "Error");
    });
    SeisjsConnection.on("close", function () {
      UpdateStatus(new Date() - Replay, "wolfx", "Disconnect");
      TryConnect_SeisjsWS();
    });
    SeisjsConnection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus(new Date() - Replay, "wolfx", "success");
      try {
        var json = ParseJSON(message.utf8Data);
        if (!json || json.type == "pong" || json.type == "heartbeat") return;
        MargeSeisJS(json);
      } catch {
        UpdateStatus(new Date() - Replay, "wolfx", "Error");
      }
      setInterval(function () {
        SeisjsConnection.sendUTF("ping");
      }, 60000);
    });
    UpdateStatus(new Date() - Replay, "wolfx", "success");
  });

  Connect_SeisjsWS();
}
var Seisjs_ConnectedDate = new Date();
function TryConnect_SeisjsWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Seisjs_ConnectedDate), 100);
  setTimeout(Connect_SeisjsWS, timeoutTmp);
}
function Connect_SeisjsWS() {
  if (SeisjsWS_Client) SeisjsWS_Client.connect("wss://seisjs.wolfx.jp/all_seis");
  Seisjs_ConnectedDate = new Date();
}

var SeisJSData = {};
function MargeSeisJS(json) {
  var rgb = shindoColorTable[Math.max(-3, Math.floor(json.CalcShindo * 10) / 10)];
  SeisJSData[json.type] = {
    Type: "Wolfx_SeisJS",
    shindo: json.CalcShindo,
    PGA: json.PGA,
    Code: json.type,
    Name: json.region,
    Location: { Longitude: json.longitude, Latitude: json.latitude },
    rgb: [rgb.r, rgb.g, rgb.b],
    update_at: json.update_at,
  };

  Object.keys(SeisJSData).forEach(function (elm) {
    var dif = Number(new Date() - new Date(Number(new Date(SeisJSData[elm].update_at)) + 3600000));
    if (dif > 15 * 1000) delete SeisJSData[elm];
  });

  IntervalRun(500, function () {
    messageToMainWindow({
      action: "SeisJSUpdate",
      LocalTime: new Date(),
      data: SeisJSData,
    });
  });
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
function RegularExecution(roop) {
  try {
    //EEW解除
    EEW_nowList.forEach(function (elm) {
      if (new Date() - Replay - new Date(elm.origin_time) > 300000)
        EEW_Clear(elm.EventID);
    });

    //津波情報解除
    Tsunami_Data.forEach(function (elm) {
      if (elm.ValidDateTime <= new Date() && !elm.revocation) {
        elm.revocation = true;
        ConvertTsunamiInfo(elm); //ダミーデータを送信、再度マージ処理
      }
    });

    if (roop) {
      setTimeout(function () {
        RegularExecution(true);
      }, 1000);
    }
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。", { cause: err });
  }
}

//強震モニタの取得オフセット設定
async function SetKmoniOffset(func) {
  try {
    if (net.online) {
      var index = 0;
      var resTimeTmp;
      KmoniOffset = null;
      while (!KmoniOffset && index < 10) {
        await new Promise((resolve) => {
          var dataTmp = "";
          var reqTime = new Date();
          var request = net.request("http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=" + Number(new Date()));
          request.on("response", (res) => {
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });
            res.on("end", function () {
              try {
                var json = ParseJSON(dataTmp);
                if (json) {
                  var resTime = new Date(json.latest_time);
                  if (resTimeTmp !== resTime) KmoniOffset = new Date() - resTime - (new Date() - reqTime) / 2;
                  resTimeTmp = resTime;
                }
              } catch {
                UpdateStatus(new Date() - Replay, "kmoniImg", "Error");
              }
            });
          });
          request.end();
          setTimeout(resolve, 100);
        });

        index++;
      }
    }
    if (!KmoniOffset) KmoniOffset = 2500;
    else KmoniOffset += 200;
    if (func) setTimeout(func, 200);
  } catch {
    KmoniOffset = 2500;
  }
}

//情報最終更新時刻を更新
function UpdateStatus(Updatetime, type, condition, vendor) {
  messageToMainWindow({
    action: "UpdateStatus",
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

//情報フォーマット変更・新報検知→MargeEEW
function DetectEEW(type, json) {
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
            minInt = minInt == "//" ? null : NormalizeShindo(minInt);
            maxInt = maxInt == "//" ? null : NormalizeShindo(maxInt);
            var arrivalTime = EBIStr[i + 2];
            arrivalTime = arrivalTime.substring(0, 2) + ":" + arrivalTime.substring(2, 4) + ":" + arrivalTime.substring(4, 6);
            arrivalTime = new Date(NormalizeDate(4) + " " + arrivalTime);

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
        maxInt: NormalizeShindo(json.maxIntensity, 0),
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
      MargeEEW(EEWdata);
    } catch {
      UpdateStatus(new Date() - Replay, "ProjectBS", "Error");
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
            arrivalTime =
              arrivalTime.substring(0, 2) +
              ":" +
              arrivalTime.substring(2, 4) +
              ":" +
              arrivalTime.substring(4, 6);
            arrivalTime = new Date(NormalizeDate(4) + " " + arrivalTime);

            var alertFlg = EBIStr[i + 3].substring(0, 1) == "1";
            var arrived = EBIStr[i + 3].substring(1, 2) == "1";

            EBIData.push({
              Code: Number(EBIStr[i]),
              Name: sectName,
              Alert: alertFlg,
              IntTo: NormalizeShindo(maxInt),
              IntFrom: NormalizeShindo(minInt),
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
        maxInt: NormalizeShindo(json.MaxIntensity, 0),
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

      MargeEEW(EEWdata, json);
    } catch {
      UpdateStatus(new Date() - Replay, "wolfx", "Error");
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
          IntTo: NormalizeShindo(elm.Intensity.To),
          IntFrom: NormalizeShindo(elm.Intensity.From),
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
        maxInt: NormalizeShindo(json.Intensity),
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
      MargeEEW(EEWdata);
    } catch {
      UpdateStatus(new Date() - Replay, "axis", "Error");
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
          IntTo: NormalizeShindo(elm.scaleTo),
          IntFrom: NormalizeShindo(elm.scaleFrom),
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
        maxInt: NormalizeShindo(maxIntTmp, 0),
        depth: depthTmp,
        is_cancel: Boolean(json.cancelled),
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

      MargeEEW(EEWdata);
    } catch {
      UpdateStatus(new Date() - Replay, "P2P_EEW", "Error");
    }
  }
}

var sesmicPoints = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/PointSeismicIntensityLocation.json"))
);

//EEW情報マージ
function MargeEEW(data) {
  if (!data) return; //データがない場合、処理終了
  try {
    if (!config.Info.EEW.showtraining && data.is_training) return; //訓練法を受信するかどうか（設定に準拠）
    if (!config.Info.EEW.kodoriyou && data.alertflg == "予報") return; //高度利用者向けを受信するかどうか（設定に準拠）
    if (!data.origin_time || !data.EventID || !data.serial || !data.latitude || !data.longitude) return;

    //現在地との距離
    if (data.latitude && data.longitude) data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);

    var EQJSON = EEW_Data.find(function (elm) {
      return elm.EQ_id == data.EventID;
    });

    //５分以上前の地震／未来の地震（リプレイ時）を除外
    var pastTime = new Date() - Replay - data.origin_time;
    if (!EQJSON && (pastTime > 300000 || pastTime < 0)) return;

    data.TimeTable = TimeTable_JMA2001[depthFilter(data.depth)];
    if (data.source == "simulation") {
      var EEWdataTmp = EEW_nowList.find(function (elm) {
        return elm.source !== "simulation";
      });
      if (EEWdataTmp) return;
    } else {
      EEW_nowList.forEach(function (elm) {
        if (elm.source == "simulation") EEW_Clear(elm.EventID);
      });
    }
    if (data.source == "simulation" && !data.isPlum) {
      var estIntTmp = {};
      if (!data.is_cancel) {
        if (!data.userIntensity)
          data.userIntensity = calcInt(
            data.magnitude,
            data.depth,
            data.latitude,
            data.longitude,
            config.home.latitude,
            config.home.longitude,
            config.home.arv,
            config.Info.EEW.IntType == "max"
          );
        if (!data.arrivalTime) {
          for (let index = 0; index < data.TimeTable.length; index++) {
            var elm = data.TimeTable[index];
            if (elm.R > data.distance) {
              if (index > 0) {
                var elm2 = data.TimeTable[index - 1];
                var SSec =
                  elm2.S +
                  ((elm.S - elm2.S) * (data.distance - elm2.R)) / (elm2.S - elm2.R);
              } else SSec = 0;
              break;
            }
          }
          data.arrivalTime = new Date(Number(data.origin_time) + SSec * 1000);
        }
        if (data.depth <= 150) {
          var maxShindo = 0;
          Object.keys(sesmicPoints).forEach(function (key) {
            elm = sesmicPoints[key];
            if (elm.arv && elm.sect) {
              var estInt = calcInt(
                data.magnitude,
                data.depth,
                data.latitude,
                data.longitude,
                elm.location[0],
                elm.location[1],
                elm.arv,
                config.home.arv,
                config.Info.EEW.IntType == "max"
              );
              if (maxShindo < estInt) maxShindo = estInt;
              if (!estIntTmp[elm.sect] || estInt > estIntTmp[elm.sect])
                estIntTmp[elm.sect] = estInt;
            }
          });

          if (NormalizeShindo(data.maxInt, 4) === null)
            data.maxInt = NormalizeShindo(maxShindo);
          Object.keys(estIntTmp).forEach(function (elm) {
            var shindo = NormalizeShindo(estIntTmp[elm]);
            var sectData;
            if (data.warnZones) {
              var sectData = data.warnZones.find(function (elm2) {
                return elm2.Name == elm;
              });
            } else data.warnZones = [];
            if (!sectData) {
              data.warnZones.push({
                Name: elm,
                IntTo: shindo, //通常レンダラープロセスの方で下限・上限選択するが、シミュレーションではこの時点で選択済みのため同値を代入
                IntFrom: shindo,
                Alert: data.source == "simulation" ? NormalizeShindo(shindo, 5) >= 5 : null,
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
        if (!data.userIntensity) data.userIntensity = config.Info.EEW.IntType == "max" ? userSect.IntTo : userSect.IntFrom;
        if (userSect.ArrivalTime) data.arrivalTime = userSect.ArrivalTime;
      }
    }

    if (EQJSON) {
      //同一地震のデータが既に存在する場合
      var EEWJSON = EQJSON.data.find(function (elm2) {
        return elm2.serial == data.serial;
      });
      if (EEWJSON) {
        //同じ報数の情報が既に存在する（マージ処理へ）
        // prettier-ignore
        var oneBefore = data.serial == Math.max.apply(null, EQJSON.data.map(function (o) { return o.serial; }));
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
                Object.keys(SectData).forEach((key) => {
                  if (SectData[key] === null) delete SectData[key];
                });
                Object.keys(elm).forEach((key) => {
                  if (elm[key] === null) delete elm[key];
                });
                elm = Object.assign(SectData, elm); //データをマージ
                changed = true;
              }
            });
          }
          //データに変化があれば、警報処理へ
          if (changed) EEW_Alert(oneBeforeData, false, true);
        }
      } else {
        //同じ報数の情報がない場合（データ登録）
        var newest = data.serial >
          Math.max.apply(null, EQJSON.data.map(function (o) { return o.serial; }));
        if (newest) {
          //最新の報である
          var EQJSON = EEW_Data.find(function (elm) {
            return elm.EQ_id == data.EventID;
          });
          EQJSON.data.push(data); //データ追加
          if (data.is_cancel) EQJSON.cancelled = true;
          EEW_Alert(data, false); //警報処理
        }
      }
    } else {
      //第１報
      if (!data.maxInt) {
        if (!config.Info.EEW.IntQuestion) return; //予想最大震度不明を無視するか（設定に準拠）
      } else if (NormalizeShindo(config.Info.EEW.IntThreshold, 5) > NormalizeShindo(data.maxInt, 5) && NormalizeShindo(data.maxInt) !== "?")
        return; //予想最大震度通知条件（設定に準拠）

      if (!data.userIntensity) {
        if (!config.Info.EEW.userIntQuestion) return; //予想震度不明を無視するか（設定に準拠）
      } else if (NormalizeShindo(config.Info.EEW.userIntThreshold, 5) > NormalizeShindo(data.userIntensity, 5) && NormalizeShindo(data.userIntensity) !== "?")
        return; //予想震度（細分区域）通知条件（設定に準拠）

      //データ追加
      EEW_Data.push({
        EQ_id: data.EventID,
        cancelled: false,
        simulation: data.source == "simulation",
        data: [data],
      });

      EEW_Alert(data, true); //警報処理
    }
  } catch (err) {
    throw new Error("緊急地震速報データの処理（マージ）に失敗しました。", { cause: err });
  }
}

function calcInt(magJMA, depth, epiLat, epiLng, pointLat, pointLng, arv, max) {
  const magW = magJMA - 0.171;
  const long = 10 ** (0.5 * magW - 1.85) / 2;
  const epicenterDistance = geosailing(epiLat, epiLng, pointLat, pointLng);
  const hypocenterDistance = (depth ** 2 + epicenterDistance ** 2) ** 0.5 - (max ? long : 0); //上限なら断層長を引かない
  const x = Math.max(hypocenterDistance, 3);
  const gpv600 = 10 ** (0.58 * magW + 0.0038 * depth - 1.29 - Math.log10(x + 0.0028 * 10 ** (0.5 * magW)) - 0.002 * x);

  // 最大速度を工学的基盤（Vs=600m/s）から工学的基盤（Vs=400m/s）へ変換を行う
  const pgv400 = gpv600 * 1.31;
  const pgv = pgv400 * arv;
  return 2.68 + 1.72 * Math.log10(pgv);
}

//EarlyEst地震情報マージ
function MargeEarlyEst(data) {
  try {
    if (!data) return;
    if (!data.origin_time) return;

    var pastTime = new Date() - Replay - data.origin_time;
    if (pastTime > 300000 || pastTime < 0) return;

    if (data.latitude && data.longitude)
      data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);

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
        var newest = data.serial >
          Math.max.apply(null, EQJSON.data.map(function (o) { return o.serial; }));

        if (newest) {
          //第２報以降
          var EQJSON = EarlyEst_Data.find(function (elm) {
            return elm.EQ_id == data.EventID;
          });
          EarlyEst_Alert(data, false);
          EQJSON.data.push(data);
          if (data.is_cancel) {
            EQJSON.cancelled = true;
          }
        }
      }
    } else {
      //第１報
      EarlyEst_Alert(data, true);
      EarlyEst_Data.push({
        EQ_id: data.EventID,
        cancelled: false,
        data: [data],
      });
    }
  } catch (err) {
    throw new Error("Early-Est データの処理（マージ）に失敗しました。", { cause: err });
  }
}

//EEW解除処理
function EEW_Clear(EventID) {
  try {
    EEW_nowList = EEW_nowList.filter(function (elm) {
      return elm.EventID !== EventID;
    });
    messageToMainWindow({ action: "EEW_AlertUpdate", data: EEW_nowList });

    if (EEW_nowList.length == 0) {
      EEWNow = false;
      //パワーセーブ再開
      if (psBlock && powerSaveBlocker.isStarted(psBlock)) {
        powerSaveBlocker.stop(psBlock);
      }
      worker.postMessage({ action: "EEWNow", data: EEWNow });
    }
  } catch (err) {
    throw new Error("緊急地震速報の解除処理でエラーが発生しました。", { cause: err });
  }
}

//EEW通知（音声・画面表示等）
function EEW_Alert(data, first, update) {
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
        action: "EEW_AlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    } else {
      //第１報

      PlayAudio(data.alertflg == "警報" ? "EEW1" : "EEW2");
      speak(GenerateEEWText(data, !first));

      messageToMainWindow({
        action: "EEW_AlertUpdate",
        data: EEW_nowList,
        update: false,
      });

      var notice_setting = first ? config.notice.window.EEW : config.notice.window.EEW_Update;
      if (notice_setting == "push" && (!MainWindow || MainWindow.isMinimized() || !MainWindow.isFocused() || !MainWindow.isVisible())) {
        var EEWNotification = new Notification({
          title: (data.is_training ? "【訓練報】 " : "") + "緊急地震速報 " + data.alertflg + " #" + data.serial,
          body:
            data.region_name +
            "\n予想最大震度：" + NormalizeShindo(data.maxInt, 1) +
            " ／ M" + (data.magnitude ? data.magnitude : "不明") +
            " ／ 深さ：" + (data.depth ? data.depth + "km" : "不明") +
            (data.userIntensity ? "\n現在地の予想震度：" + NormalizeShindo(data.userIntensity, 1) : ""),
          icon: path.join(__dirname, "img/icon.ico"),
        });
        EEWNotification.show();
        EEWNotification.on("click", CreateMainWindow);
      } else if (notice_setting == "openWindow") CreateMainWindow();
    }

    ConvertEQInfo(
      [
        {
          status: data.is_training ? "訓練" : "通常",
          eventId: data.EventID,
          category: "EEW",
          reportDateTime: new Date(data.report_time),
          OriginTime: new Date(data.origin_time),
          epiCenter: data.region_name,
          M: data.isPlum ? null : Number(data.magnitude),
          maxI: NormalizeShindo(data.maxInt),
          cancel: Boolean(data.is_cancel),
          DetailURL: [],
          axisData: null,
        },
      ], "jma", true, 999
    );

    //スリープ回避開始
    if (config.system.powerSaveBlocking && (!psBlock || !powerSaveBlocker.isStarted(psBlock))) {
      psBlock = powerSaveBlocker.start("prevent-display-sleep");
    }
  } catch (err) {
    throw new Error("緊急地震速報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//EarlyEst通知（音声・画面表示等）
function EarlyEst_Alert(data, first, update) {
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
        CreateMainWindow();
        PlayAudio("EEW2");
      }
      messageToMainWindow({
        action: "EEW_AlertUpdate",
        data: EEW_nowList,
        update: false,
      });
      if (!MainWindow) {
        var EEWNotification = new Notification({
          title: "Early-Est 地震情報" + " #" + data.serial,
          body: data.region_name + "\n M" + data.magnitude + "  深さ：" + data.depth,
          icon: path.join(__dirname, "img/icon.ico"),
        });
        EEWNotification.show();
        EEWNotification.on("click", function () {
          CreateMainWindow();
        });
      }
    } else {
      messageToMainWindow({
        action: "EEW_AlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    }

    //スリープ回避開始
    if (config.system.powerSaveBlocking && (!psBlock || !powerSaveBlocker.isStarted(psBlock))) {
      psBlock = powerSaveBlocker.start("prevent-display-sleep");
    }
  } catch (err) {
    throw new Error("Early-Est地震情報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//🔴地震情報🔴

//地震情報更新処理
function UpdateEQInfo(roop) {
  if (roop)
    setTimeout(function () {
      UpdateEQInfo(true);
    }, config.Info.EQInfo.Interval);
  try {
    Req_JMAXMLList(EQInfoFetchCount == 0, EQInfoFetchCount);
    Req_NarikakunList("https://ntool.online/api/earthquakeList?year=" + new Date().getFullYear() + "&month=" + (new Date().getMonth() + 1), 10, true, EQInfoFetchCount);
    Req_USGS();
  } catch (err) {
    throw new Error("地震情報の処理でエラーが発生しました。", { cause: err });
  }
  EQInfoFetchCount++;
}

//気象庁XMLリスト取得→Req_JMAXML
function Req_JMAXMLList(LongPeriodFeed, count) {
  if (net.online) {
    var request = net.request(LongPeriodFeed ? "https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml" : "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml");
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          const parser = new new JSDOM().window.DOMParser();
          const xml = parser.parseFromString(dataTmp, "text/xml");
          if (!xml) return;
          var EQInfoCount = 0;
          Array.prototype.forEach.call(xml.getElementsByTagName("entry"), function (elm) {
            var url;
            var urlElm = elm.getElementsByTagName("id");
            if (urlElm) url = urlElm[0].textContent;
            if (!url) return;
            var title = elm.getElementsByTagName("title")[0].textContent;
            if (
              title == "震度速報" ||
              title == "震源に関する情報" ||
              title == "震源・震度に関する情報" ||
              title == "長周期地震動に関する観測情報" ||
              title == "遠地地震に関する情報" ||
              title == "顕著な地震の震源要素更新のお知らせ"
            ) {
              if (EQInfoCount <= config.Info.EQInfo.ItemCount) Req_JMAXML(url, count);
              if (title == "震源・震度に関する情報") EQInfoCount++; //「震源・震度に関する情報」の件数≒地震の数 のためカウント
            } else if (
              title == "津波情報a" ||
              title == "津波警報・注意報・予報a" ||
              title == "沖合の津波観測に関する情報" ||
              title == "北海道・三陸沖後発地震注意情報" ||
              title == "地震の活動状況等に関する情報"
            )
              Req_JMAXML(url, count);
          });

          var nankai = Array.from(xml.getElementsByTagName("entry")).find(function (elm) {
            var ttl = elm.getElementsByTagName("title")[0];
            return ttl && ttl.textContent.startsWith("南海トラフ地震関連解説情報");
          });

          if (nankai) Req_JMAXML(nankai.getElementsByTagName("link")[0].getAttribute("href"));

          var nankai = Array.from(xml.getElementsByTagName("entry")).forEach(
            function (elm) {
              var ttl = elm.getElementsByTagName("title")[0];

              if (ttl && ttl.textContent.startsWith("南海トラフ地震臨時情報") && Number(new Date() - new Date(elm.getElementsByTagName("updated")[0].textContent)) <= 1209600000) {
                Req_JMAXML(elm.getElementsByTagName("link")[0].getAttribute("href"));
              }
            }
          );

          UpdateStatus(new Date() - Replay, "JMAXML", "success");
        } catch {
          UpdateStatus(new Date() - Replay, "JMAXML", "Error");
        }
      });
    });
    request.on("error", () => {
      UpdateStatus(new Date() - Replay, "JMAXML", "Error");
    });
    request.end();
  } else UpdateStatus(new Date() - Replay, "JMAXML", "Error");
}

//気象庁XML 取得・フォーマット変更→ConvertEQInfo
function Req_JMAXML(url, count,) {
  if (!url || jmaXML_Fetched.includes(url)) return;

  if (net.online) {
    var request = net.request(url);
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          const parser = new new JSDOM().window.DOMParser();
          const xml = parser.parseFromString(dataTmp, "text/xml");
          if (!xml) return false;

          var title = xml.getElementsByTagName("Control")[0].getElementsByTagName("Title")[0].textContent;
          var cancel = xml.getElementsByTagName("InfoType")[0].textContent == "取消";

          if (
            title == "震度速報" ||
            title == "震源に関する情報" ||
            title == "震源・震度に関する情報" ||
            title == "長周期地震動に関する観測情報" ||
            title == "遠地地震に関する情報" ||
            title == "顕著な地震の震源要素更新のお知らせ"
          ) {
            //地震情報
            var EarthquakeElm = xml.getElementsByTagName("Body")[0].getElementsByTagName("Earthquake")[0];
            var originTimeTmp;
            var epiCenterTmp;
            var magnitudeTmp;
            if (EarthquakeElm) {
              originTimeTmp = new Date(
                EarthquakeElm.getElementsByTagName("OriginTime")[0].textContent
              );
              epiCenterTmp = EarthquakeElm.getElementsByTagName("Name")[0].textContent;
              var magElm = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0];
              if (magElm) magnitudeTmp = Number(magElm.textContent);
              if (!Boolean2(magnitudeTmp)) magnitudeTmp = null;
            }

            if (!originTimeTmp) originTimeTmp = new Date(xml.getElementsByTagName("TargetDateTime")[0].textContent);
            var IntensityElm = xml.getElementsByTagName("Body")[0].getElementsByTagName("Intensity")[0];
            var maxIntTmp;
            var maxLgInt;
            if (IntensityElm) {
              maxIntTmp = NormalizeShindo(
                IntensityElm.getElementsByTagName("Observation")[0].getElementsByTagName("MaxInt")[0].textContent
              );
              if (IntensityElm.getElementsByTagName("Observation")[0].getElementsByTagName("MaxLgInt")[0])
                maxLgInt = IntensityElm.getElementsByTagName("Observation")[0]
                  .getElementsByTagName("MaxLgInt")[0].textContent;
            }
            if (maxIntTmp == "[objectHTMLUnknownElement]") maxIntTmp = null;
            var headline = xml.getElementsByTagName("Head")[0].getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent;

            ConvertEQInfo(
              [
                {
                  status: xml.getElementsByTagName("Status")[0].textContent,
                  eventId: xml.getElementsByTagName("EventID")[0].textContent,
                  category: xml.getElementsByTagName("Title")[0].textContent,
                  OriginTime: originTimeTmp,
                  epiCenter: epiCenterTmp,
                  M: magnitudeTmp,
                  maxI: NormalizeShindo(maxIntTmp),
                  maxLgInt: maxLgInt,
                  cancel: Boolean(cancel),
                  reportDateTime: new Date(
                    xml.getElementsByTagName("ReportDateTime")[0].textContent
                  ),
                  DetailURL: [url],
                  headline: headline,
                  axisData: null,
                },
              ], "jma", false, count
            );
          } else if (title == "地震回数に関する情報") {
            if (xml.getElementsByTagName("EarthquakeCount")[0]) {
              var hourly = []
              var sum, std;
              xml.querySelectorAll("EarthquakeCount Item").forEach(function (el) {
                var type = el.getAttribute("type")

                if (el.getElementsByTagName("StartTime")[0]) var StartTime = new Date(el.getElementsByTagName("StartTime")[0].textContent)
                if (el.getElementsByTagName("EndTime")[0]) var EndTime = new Date(el.getElementsByTagName("EndTime")[0].textContent)
                if (el.getElementsByTagName("Number")[0] && Number(el.getElementsByTagName("Number")[0].textContent) !== -1) var _Number = Number(el.getElementsByTagName("Number")[0].textContent)
                if (el.getElementsByTagName("FeltNumber")[0] && Number(el.getElementsByTagName("FeltNumber")[0].textContent) !== -1) var FeltNumber = Number(el.getElementsByTagName("FeltNumber")[0].textContent)

                var data = {
                  StartTime: StartTime,
                  EndTime: EndTime,
                  Number: _Number,
                  FeltNumber: FeltNumber
                }

                if (type == "１時間地震回数") {
                  hourly.push(data)
                } else if (type == "累積地震回数") {
                  sum = data
                } else if (type == "地震回数") {
                  std = data
                }
              })

              var headline = xml.getElementsByTagName("Head")[0].getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent;
              var Text = xml.querySelector("Body Text") ? xml.querySelector("Body Text").textContent : ""
              var NextAdvisory = xml.querySelector("NextAdvisory") ? xml.querySelector("NextAdvisory").textContent : ""
              var FreeFormComment = xml.querySelector("Comments FreeFormComment") ? xml.querySelector("Comments FreeFormComment").textContent : ""


              EQCount_process({
                status: xml.getElementsByTagName("Status")[0].textContent,
                eventId: xml.getElementsByTagName("EventID")[0].textContent,
                category: xml.getElementsByTagName("Title")[0].textContent,
                cancel: Boolean(cancel),
                reportDateTime: new Date(
                  xml.getElementsByTagName("ReportDateTime")[0].textContent
                ),
                headline: headline ? headline : "",
                hourly: hourly,
                sum: sum,
                std: std,
                Text: Text,
                NextAdvisory: NextAdvisory,
                FreeFormComment: FreeFormComment
              })
            }

          } else if (title == "南海トラフ地震関連解説情報" || title == "南海トラフ地震臨時情報") {
            var data = {
              title: title, //南海トラフ地震関連解説情報など
              kind: null, //定例など
              reportKind: xml.getElementsByTagName("Head")[0].getElementsByTagName("InfoType")[0].textContent, //発表/取消
              reportDate: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent), //時刻
              Serial: null,
              HeadLine: xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent, //要約
              Text: "",
              Appendix: "",
              NextAdvisory: "",
              Text2: "",
            };

            if (xml.getElementsByTagName("Serial")[0] && xml.getElementsByTagName("Serial")[0].textContent)
              data.Serial = Number(xml.getElementsByTagName("Serial")[0].textContent);
            var Body = xml.getElementsByTagName("Body")[0];
            var EarthQuakeInfo = Body.getElementsByTagName("EarthquakeInfo")[0];
            if (EarthQuakeInfo) {
              if (EarthQuakeInfo.getElementsByTagName("InfoSerial")[0])
                data.kind = EarthQuakeInfo.getElementsByTagName("InfoSerial")[0].getElementsByTagName("Name")[0].textContent;

              data.Text = EarthQuakeInfo.getElementsByTagName("Text")[0].textContent;

              if (EarthQuakeInfo.getElementsByTagName("Appendix")[0])
                data.Appendix = EarthQuakeInfo.getElementsByTagName("Appendix")[0].textContent;
            }

            if (Body.getElementsByTagName("NextAdvisory")[0])
              data.NextAdvisory = Body.getElementsByTagName("NextAdvisory")[0].textContent;

            var Text2Elm = Array.from(xml.getElementsByTagName("Body")[0].children)
              .find(function (elm) { return elm.tagName == "Text"; });

            if (Text2Elm) data.Text2 = Text2Elm.textContent;

            NankaiTroughInfoAll.push(data);
            NankaiTroughInfoAll = NankaiTroughInfoAll.sort(function (a, b) {
              return a.reportDate > b.reportDate ? -1 : 1;
            });

            var teirei;
            var rinji = NankaiTroughInfoAll.find(function (elm) {
              var offset = Number(new Date() - new Date(elm.reportDate));
              return (
                elm.title.startsWith("南海トラフ地震臨時情報") &&
                ((elm.kind == "巨大地震警戒" && offset <= 1209600000) || elm.kind == "巨大地震注意" || elm.kind == "調査中" || (elm.kind == "調査終了" && offset <= 604800000))
              );
            });
            if (rinji) {
              teirei = NankaiTroughInfoAll.find(function (elm) {
                return (
                  elm.title.startsWith("南海トラフ地震関連解説情報") &&
                  new Date(rinji.reportDate) <= new Date(elm.reportDate)
                );
              });
            } else {
              teirei = NankaiTroughInfoAll.find(function (elm) {
                return elm.title.startsWith("南海トラフ地震関連解説情報");
              });
            }

            NankaiTroughInfo = { rinji: rinji, teirei: teirei };

            messageToMainWindow({
              action: "NankaiTroughInfo",
              data: NankaiTroughInfo,
            });

            if (NankaiWindow.window) {
              var data = NankaiWindow.type == "rinji" ? NankaiTroughInfo.rinji : NankaiTroughInfo.teirei;
              if (data) {
                NankaiWindow.window.webContents.send("message2", {
                  action: "NankaiTroughInfo",
                  data: data,
                });
              }
            }
          } else if (
            title == "津波情報a" ||
            title == "津波警報・注意報・予報a" ||
            title == "沖合の津波観測に関する情報"
          ) {
            //津波予報
            var tsunamiDataTmp;
            var EventID = xml.getElementsByTagName("EventID")[0].textContent.split(" ").map(Number);
            var EQData = [];
            Array.prototype.forEach.call(
              xml.getElementsByTagName("Earthquake"),
              function (elm, index) {
                var magTmp = elm.getElementsByTagName("jmx_eb:Magnitude")[0];
                magTmp = magTmp !== "NaN" && magTmp ? magTmp.textContent : null;
                var ECTmp = elm.getElementsByTagName("Name")[0];
                ECTmp = ECTmp ? ECTmp.textContent : null;

                EQData.push({
                  status: xml.getElementsByTagName("Status")[0].textContent,
                  eventId: EventID[index],
                  category: "Tsunami",
                  OriginTime: elm.getElementsByTagName("OriginTime")[0] ? new Date(elm.getElementsByTagName("OriginTime")[0].textContent) : new Date(),
                  epiCenter: ECTmp,
                  M: Number(magTmp),
                  maxI: null,
                  cancel: Boolean(cancel),
                  reportDateTime: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent),
                  DetailURL: [url],
                  Headline: "",
                  axisData: null,
                });
              }
            );
            ConvertEQInfo(EQData, "jma", false, count);

            if (cancel) {
              tsunamiDataTmp = {
                status: xml.getElementsByTagName("Status")[0].textContent,
                issue: {
                  time: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent),
                  EventID: null,
                  EarthQuake: null,
                },
                areas: [],
                revocation: true,
                source: "jmaXML",
                ValidDateTime: null,
              };
            } else {
              var ValidDateTimeElm = xml.getElementsByTagName("ValidDateTime")[0];
              if (ValidDateTimeElm) var ValidDateTimeTmp = new Date(ValidDateTimeElm.textContent);
              else {
                var ValidDateTimeTmp = new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent);
                ValidDateTimeTmp.setHours(ValidDateTimeTmp.getHours() + 12);
              }
              if (ValidDateTimeTmp < new Date()) return;

              var headline = "";
              var headlineElm = xml.getElementsByTagName("Headline")[0];
              if (headlineElm && headlineElm.getElementsByTagName("Text")[0])
                headline = headlineElm.getElementsByTagName("Text")[0].textContent;

              var Text1 = "";
              var WarningComment = "";
              var FreeFormComment = "";
              //付加文取得の不具合による処理停止を回避
              try {
                if (xml.querySelector("Body  > Text")) {
                  Text1 = xml.querySelector("Body  > Text").textContent + "\n\n";
                }

                var comments_elm = xml.getElementsByTagName("Comments")[0];
                if (comments_elm) {
                  var WarningComment_elm =
                    comments_elm.getElementsByTagName("WarningComment")[0];
                  if (WarningComment_elm)
                    WarningComment = WarningComment_elm.getElementsByTagName("Text")[0].textContent + "\n\n";

                  var FreeFormComment_elm =
                    comments_elm.getElementsByTagName("FreeFormComment")[0];
                  if (FreeFormComment_elm)
                    FreeFormComment = FreeFormComment_elm.textContent;
                }
                // eslint-disable-next-line no-empty
              } catch { }

              //P2PのAPIとの整合性のため、津波情報においてのみ、Control > DateTimeを発表時刻として扱う
              var dateTime = new Date(
                xml.getElementsByTagName("Control")[0].getElementsByTagName("DateTime")[0].textContent
              );

              tsunamiDataTmp = {
                status: xml.getElementsByTagName("Status")[0].textContent,
                issue: {
                  time: dateTime,
                  EventID: EventID,
                  EarthQuake: EQData,
                },
                areas: [],
                revocation: false,
                headline: headline,
                comment: Text1 + WarningComment + FreeFormComment,
                source: "jmaXML",
                ValidDateTime: ValidDateTimeTmp,
              };

              var tsunamiElm = xml.getElementsByTagName("Body")[0].getElementsByTagName("Tsunami")[0];
              if (tsunamiElm) {
                var forecastElm;
                if (tsunamiElm.getElementsByTagName("Forecast")[0])
                  forecastElm = tsunamiElm.getElementsByTagName("Forecast")[0];
                if (tsunamiElm.getElementsByTagName("Estimation")[0])
                  forecastElm = tsunamiElm.getElementsByTagName("Estimation")[0];
                if (forecastElm) {
                  Array.prototype.forEach.call(
                    forecastElm.getElementsByTagName("Item"),
                    function (elm) {
                      var gradeTmp;
                      var cancelledTmp = false;
                      if (elm.getElementsByTagName("Category")[0]) {
                        switch (
                        Number(
                          elm.getElementsByTagName("Category")[0].getElementsByTagName("Kind")[0].getElementsByTagName("Code")[0].textContent
                        )
                        ) {
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
                            cancelledTmp = true;
                            break;
                        }
                      }
                      var firstHeightTmp;
                      var firstHeightConditionTmp;
                      var maxHeightTmp;
                      if (elm.getElementsByTagName("FirstHeight")[0]) {
                        if (elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0]) {
                          firstHeightTmp = new Date(elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0].textContent);
                        }
                        if (elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("Condition")[0]) {
                          firstHeightConditionTmp = elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("Condition")[0].textContent;
                        }
                      }
                      if (elm.getElementsByTagName("MaxHeight")[0]) {
                        var maxHeightElm = elm.getElementsByTagName("MaxHeight")[0].getElementsByTagName("jmx_eb:TsunamiHeight");
                        if (maxHeightElm[0]) {
                          maxHeightTmp = maxHeightElm[0].getAttribute("description")
                            .replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                              return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                            });
                        } else if (elm.getElementsByTagName("MaxHeight")[0].getElementsByTagName("Condition")[0]) {
                          maxHeightTmp = elm.getElementsByTagName("MaxHeight")[0].getElementsByTagName("Condition")[0].textContent;
                        }
                      }

                      var stations = [];
                      if (elm.getElementsByTagName("Station")[0]) {
                        Array.prototype.forEach.call(
                          elm.getElementsByTagName("Station"),
                          function (elm2) {
                            var ArrivalTimeTmp;
                            var ConditionTmp;
                            var nameTmp = elm2.getElementsByTagName("Name")[0].textContent;
                            var codeTmp = elm2.getElementsByTagName("Code")[0].textContent;
                            var highTideTimeTmp = new Date(elm2.getElementsByTagName("HighTideDateTime")[0].textContent);
                            if (elm2.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0])
                              ArrivalTimeTmp = new Date(elm2.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0].textContent);
                            if (elm2.getElementsByTagName("Condition")[0])
                              ConditionTmp = elm2.getElementsByTagName("Condition")[0].textContent;
                            stations.push({
                              name: nameTmp,
                              code: codeTmp,
                              HighTideDateTime: highTideTimeTmp,
                              ArrivalTime: ArrivalTimeTmp,
                              Condition: ConditionTmp,
                            });
                          }
                        );
                      }

                      var codeTmp;
                      if (elm.getElementsByTagName("Category")[0])
                        codeTmp = Number(elm.getElementsByTagName("Category")[0].getElementsByTagName("Kind")[0].getElementsByTagName("Code")[0].textContent);

                      tsunamiDataTmp.areas.push({
                        code: codeTmp,
                        grade: gradeTmp,
                        name: elm.getElementsByTagName("Name")[0].textContent,
                        cancelled: cancelledTmp,
                        firstHeight: firstHeightTmp,
                        firstHeightCondition: firstHeightConditionTmp,
                        stations: stations,
                        maxHeight: maxHeightTmp,
                      });
                    }
                  );
                }

                if (tsunamiElm.getElementsByTagName("Observation")[0]) {
                  Array.prototype.forEach.call(
                    tsunamiElm.getElementsByTagName("Observation")[0].getElementsByTagName("Item"),
                    function (elm) {
                      var stations = [];
                      if (elm.getElementsByTagName("Station")[0]) {
                        Array.prototype.forEach.call(
                          elm.getElementsByTagName("Station"),
                          function (elm2) {
                            var ArrivalTimeTmp;
                            var firstHeightConditionTmp;
                            var firstHeightInitialTmp;
                            var maxHeightTime;
                            var maxHeightCondition;
                            var oMaxHeightTmp;
                            var maxHeightRising = false;
                            var nameTmp = elm2.getElementsByTagName("Name")[0].textContent;

                            if (elm2.getElementsByTagName("FirstHeight")[0]) {
                              var firstHeightTag = elm2.getElementsByTagName("FirstHeight")[0];
                              if (firstHeightTag.getElementsByTagName("ArrivalTime")[0])
                                ArrivalTimeTmp = new Date(firstHeightTag.getElementsByTagName("ArrivalTime")[0].textContent);
                              if (firstHeightTag.getElementsByTagName("Condition")[0])
                                firstHeightConditionTmp = firstHeightTag.getElementsByTagName("Condition")[0].textContent;
                              if (firstHeightTag.getElementsByTagName("Initial")[0])
                                firstHeightInitialTmp = firstHeightTag.getElementsByTagName("Initial")[0].textContent;
                            }
                            if (elm2.getElementsByTagName("MaxHeight")[0]) {
                              var maxHeightElm = elm2.getElementsByTagName("MaxHeight")[0].getElementsByTagName("jmx_eb:TsunamiHeight")[0];
                              if (maxHeightElm) {
                                oMaxHeightTmp = maxHeightElm.getAttribute("description");
                                oMaxHeightTmp = oMaxHeightTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                                  return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                                });
                                if (maxHeightElm.getAttribute("condition"))
                                  maxHeightRising = maxHeightElm.getAttribute("condition") == "上昇中";
                              }

                              var maxHeightTimeElm = elm2.getElementsByTagName("MaxHeight")[0].getElementsByTagName("DateTime")[0];
                              if (maxHeightTimeElm) maxHeightTime = new Date(maxHeightTimeElm.textContent);

                              var maxHeightConditionElm = elm2.getElementsByTagName("MaxHeight")[0].getElementsByTagName("Condition")[0];
                              if (maxHeightConditionElm) maxHeightCondition = maxHeightConditionElm.textContent;
                            }

                            var codeTmp = elm2.getElementsByTagName("Code")[0].textContent;

                            stations.push({
                              name: nameTmp,
                              code: codeTmp,
                              ArrivedTime: ArrivalTimeTmp,
                              firstHeightCondition: firstHeightConditionTmp,
                              firstHeightInitial: firstHeightInitialTmp,
                              omaxHeight: oMaxHeightTmp,
                              maxHeightRising: maxHeightRising,
                              maxHeightTime: maxHeightTime,
                              maxHeightCondition: maxHeightCondition,
                            });
                          }
                        );
                      }

                      var areaName = title == "沖合の津波観測に関する情報" ? "（海上）" : elm.getElementsByTagName("Name")[0].textContent;
                      var tsunamiItem = tsunamiDataTmp.areas.find(function (elm2) {
                        return elm2.name == areaName;
                      });
                      if (tsunamiItem) {
                        stations.forEach(function (elm2) {
                          var stationElm = tsunamiItem.stations.findIndex(function (elm3) {
                            return elm3.name == elm2.name;
                          });
                          if (stationElm > -1) tsunamiItem.stations[stationElm] = Object.assign(elm2, tsunamiItem.stations[stationElm]);
                          else tsunamiItem.stations.push(elm2);
                        });
                      } else {
                        tsunamiDataTmp.areas.push({
                          name: areaName,
                          stations: stations,
                        });
                      }
                    }
                  );
                }
              }
            }
            ConvertTsunamiInfo(tsunamiDataTmp);
          } else if (title == "北海道・三陸沖後発地震注意情報") {
            var data = {
              title: title, //北海道・三陸沖後発地震注意情報
              kind: xml.getElementsByTagName("Head")[0].getElementsByTagName("InfoType")[0].textContent,//発表/取消
              reportDate: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent), //時刻
              HeadLine: xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent, //要約
              Text: "",
              Appendix: "",
              Text2: "",
            };

            var Body = xml.getElementsByTagName("Body")[0];
            var EarthQuakeInfo = Body.getElementsByTagName("EarthquakeInfo")[0];
            if (EarthQuakeInfo) {
              data.Text = EarthQuakeInfo.getElementsByTagName("Text")[0].textContent;
              if (EarthQuakeInfo.getElementsByTagName("Appendix")[0])
                data.Appendix = EarthQuakeInfo.getElementsByTagName("Appendix")[0].textContent;
            }

            var Text2Elm = Array.from(xml.getElementsByTagName("Body")[0].children)
              .find(function (elm) { return elm.tagName == "Text"; });
            if (Text2Elm) data.Text2 = Text2Elm.textContent;

            HokkaidoSanrikuInfoAll.push(data);
            HokkaidoSanrikuInfoAll = HokkaidoSanrikuInfoAll.sort(function (a, b) {
              return a.reportDate > b.reportDate ? -1 : 1;
            });

            messageToMainWindow({
              action: "HokkaidoSanrikuInfo",
              data: HokkaidoSanrikuInfoAll[0],
            });
            if (HokkaidoSanrikuWindow && HokkaidoSanrikuInfoAll[0]) {
              if (data) {
                HokkaidoSanrikuWindow.webContents.send("message2", {
                  action: "HokkaidoSanrikuInfo",
                  data: HokkaidoSanrikuInfoAll[0],
                });
              }
            }
          } else if (title == "地震の活動状況等に関する情報") {
            var headline = xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent
            if (headline.includes("南海トラフ地震に関連する情報")) return;//南海トラフ地震関連解説情報（移行措置電文）の重複をはじく

            var data = {
              title: title, //地震の活動状況等に関する情報
              kind: xml.getElementsByTagName("Head")[0].getElementsByTagName("InfoType")[0].textContent,//発表/取消
              reportDate: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent), //時刻
              HeadLine: xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent, //要約
              Naming: null,
              NamingEn: null,
              Text: "",
              Comments: "",
            };

            var Body = xml.getElementsByTagName("Body")[0];
            data.Text = Body.getElementsByTagName("Text")[0].textContent;

            var commentsEl = Body.getElementsByTagName("Comments")[0];
            if (commentsEl && commentsEl.getElementsByTagName("FreeFormComment")[0])
              data.Comments = commentsEl.getElementsByTagName("FreeFormComment")[0].textContent;

            var NamingElm = Body.getElementsByTagName("Naming")[0]
            if (NamingElm) {
              data.Naming = NamingElm.textContent
              if (NamingElm.getAttribute("english")) data.NamingEn = NamingElm.getAttribute("english")
            }



            KatsudoJokyoInfoAll.push(data);
            KatsudoJokyoInfoAll = KatsudoJokyoInfoAll.sort(function (a, b) {
              return a.reportDate > b.reportDate ? -1 : 1;
            });

            messageToMainWindow({
              action: "KatsudoJokyoInfo",
              data: KatsudoJokyoInfoAll[0],
            });

            if (KatsudoJokyoWindow && KatsudoJokyoInfoAll[0]) {
              if (data) {
                KatsudoJokyoWindow.webContents.send("message2", {
                  action: "KatsudoJokyoInfo",
                  data: KatsudoJokyoInfoAll[0],
                });
              }
            }

          }
          UpdateStatus(new Date() - Replay, "JMAXML", "success");
          jmaXML_Fetched.push(url);
        } catch {
          UpdateStatus(new Date() - Replay, "JMAXML", "Error");
        }
      });
    });
    request.on("error", () => {
      UpdateStatus(new Date() - Replay, "JMAXML", "Error");
    });
    request.end();
  } else UpdateStatus(new Date() - Replay, "JMAXML", "Error");
}

var NankaiTroughInfo = { rinji: null, teirei: null };
var NankaiTroughInfoAll = [];
var HokkaidoSanrikuInfoAll = [];
var KatsudoJokyoInfoAll = [];

//USGS 取得・フォーマット変更→ConvertEQInfo
var usgsLastGenerated = 0;
function Req_USGS() {
  if (net.online) {
    var request = net.request("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=" + config.Info.EQInfo.ItemCount);
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = ParseJSON(dataTmp);
          if (!json) return false;
          if (json.features[0].properties && json.features[0].properties.updated && usgsLastGenerated < json.features[0].properties.updated) {
            usgsLastGenerated = json.features[0].properties.updated;

            var dataTmp2 = [];
            json.features.forEach(function (elm) {
              var FECode = FERegion.features.find(function (elm2) {
                return turf.booleanPointInPolygon(elm.geometry.coordinates, elm2);
              });

              var maxi;
              if (elm.properties.mmi !== null) maxi = elm.properties.mmi;

              dataTmp2.push({
                eventId: elm.id,
                category: null,
                OriginTime: new Date(elm.properties.time),
                epiCenter: FECode.properties.nameJA,
                M: Math.round(elm.properties.mag * 10) / 10,
                maxI: maxi,
                DetailURL: [elm.properties.url],
              });
            });
            ConvertEQInfo(dataTmp2, "usgs");
          }
          UpdateStatus(new Date() - Replay, "USGS", "success");
        } catch {
          UpdateStatus(new Date() - Replay, "USGS", "Error");
        }
      });
    });
    request.on("error", () => {
      UpdateStatus(new Date() - Replay, "USGS", "Error");
    });

    request.end();
  } else UpdateStatus(new Date() - Replay, "USGS", "Error");
}

//narikakun地震情報API リスト取得→Req_Narikakun
function Req_NarikakunList(url, num, first, count) {
  if (net.online) {
    var request = net.request(url);
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = ParseJSON(dataTmp);
          if (!json || !json.lists) return false;
          narikakun_URLs = narikakun_URLs.concat(json.lists.reverse());

          if (narikakun_URLs.length < config.Info.EQInfo.ItemCount && first) {
            var yearTmp = new Date().getFullYear();
            var monthTmp = new Date().getMonth();
            if (monthTmp == 0) {
              yearTmp = new Date().getFullYear() - 1;
              monthTmp = 11;
            }
            Req_NarikakunList("https://ntool.online/api/earthquakeList?year=" + yearTmp + "&month=" + (monthTmp + 1),
              (config.Info.EQInfo.ItemCount - json.lists.length), false, count
            );
          }
          for (let elm of narikakun_URLs) {
            var eidTmp = String(elm).split("_")[2];
            Req_Narikakun(elm, count);

            if (!narikakun_EIDs.includes(eidTmp)) {
              narikakun_EIDs.push(eidTmp);
              if (narikakun_EIDs.length == config.Info.EQInfo.ItemCount) break;
            }
          }

          if (narikakun_URLs.length > config.Info.EQInfo.ItemCount) {
            narikakun_URLs = [];
            narikakun_EIDs = [];
          }
          UpdateStatus(new Date() - Replay, "ntool", "success");
        } catch {
          UpdateStatus(new Date() - Replay, "ntool", "Error");
        }
      });
    });
    request.on("error", () => {
      UpdateStatus(new Date() - Replay, "ntool", "Error");
    });
    request.end();
  } else UpdateStatus(new Date() - Replay, "ntool", "Error");
}

//narikakun地震情報API 取得・フォーマット変更→ConvertEQInfo
function Req_Narikakun(url, count) {
  if (!url || nakn_Fetched.includes(url)) return;

  if (net.online) {
    var request = net.request(url);
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = ParseJSON(dataTmp);
          if (!json) return;

          var originTimeTmp = json.Body.Earthquake ? new Date(json.Body.Earthquake.OriginTime) : null;
          if (!originTimeTmp) originTimeTmp = new Date(json.Head.TargetDateTime);

          var epiCenterTmp = json.Body.Earthquake ? json.Body.Earthquake.Hypocenter.Name : null;
          var MagnitudeTmp = json.Body.Earthquake && json.Body.Earthquake.Magnitude ? Number(json.Body.Earthquake.Magnitude) : null;
          var MaxITmp = json.Body.Intensity ? json.Body.Intensity.Observation.MaxInt : null;
          var cancel = json.Head.InfoType == "取消";
          var dataTmp2 = [
            {
              status: json.Control.Status,
              eventId: json.Head.EventID,
              category: json.Head.Title,
              OriginTime: new Date(originTimeTmp),
              epiCenter: epiCenterTmp,
              M: MagnitudeTmp,
              maxI: NormalizeShindo(MaxITmp),
              cancel: Boolean(cancel),
              reportDateTime: new Date(json.Head.ReportDateTime),
              DetailURL: [url],
              headline: json.Head.Headline,
              axisData: null,
            },
          ];
          ConvertEQInfo(dataTmp2, "jma", false, count);
          UpdateStatus(new Date() - Replay, "ntool", "success");
          nakn_Fetched.push(url);
        } catch {
          UpdateStatus(new Date() - Replay, "ntool", "Error");
        }
      });
    });
    request.on("error", () => {
      UpdateStatus(new Date() - Replay, "ntool", "Error");
    });
    request.end();
  } else UpdateStatus(new Date() - Replay, "ntool", "Error");
}

var EQInfoData = {};
//地震情報マージ→AlertEQInfo
function ConvertEQInfo(dataList, type, EEW, count) {
  try {
    switch (type) {
      case "jma":
        var eqInfoTmp = [];
        var UpdateEQInfoTmp = [];

        var playAudio = false;
        var changed = false;

        dataList.forEach(function (data) {
          if (!data.eventId) return;
          var EQElm = EQInfoData[data.eventId];
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
              maxLgInt: null,
              DetailURL: [],
              headline: null,
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

              //EEW以外の情報が既に入っているとき、EEWによる情報を破棄
              if (elm.category == "EEW" && EQElm.EEW === false) return;
              else if (elm.category == "EEW") EQElm.EEW = true;
              else if (elm.category != "EEW" && EQElm.EEW == true) {
                //EEW以外の情報が入ってきたとき、EEWによる情報を破棄
                EQElm.EEW = false;
                EQInfo_Item = {
                  eventId: EQElm.eventId,
                  category: null,
                  EEW: false,
                  reportDateTime: null,
                  OriginTime: null,
                  epiCenter: null,
                  M: null,
                  maxI: null,
                  maxLgInt: null,
                  DetailURL: [],
                  headline: null,
                  axisData: [],
                };
              }

              EQInfo_Item.category = elm.category;
              if (Boolean2(elm.OriginTime)) EQInfo_Item.OriginTime = elm.OriginTime;
              if (Boolean2(elm.epiCenter)) EQInfo_Item.epiCenter = elm.epiCenter;
              if (Boolean2(elm.M) && elm.M != "Ｍ不明" && elm.M != "NaN") EQInfo_Item.M = elm.M;
              if (Boolean2(elm.maxI) && elm.maxI !== "?") EQInfo_Item.maxI = elm.maxI;
              if (Boolean2(elm.maxLgInt) && elm.maxLgInt !== "?") EQInfo_Item.maxLgInt = elm.maxLgInt;
              if (Boolean2(elm.headline)) EQInfo_Item.headline = elm.headline;
              EQInfo_Item.cancel = elm.cancel;

              if (Array.isArray(elm.DetailURL)) {
                elm.DetailURL.forEach(function (elm2) {
                  if (elm2 && !EQInfo_Item.DetailURL.includes(elm2) && !EQElm.DetailURL.includes(elm2)) {
                    EQInfo_Item.DetailURL.push(elm2);
                  }
                });
              }
              if (elm.axisData) EQInfo_Item.axisData.push(elm.axisData);
            });

            if (EQElm.cancel !== EQInfo_Item.cancel) changed = true;
            if (EQElm.category !== EQInfo_Item.category) changed = true;
            if (EQElm.EEW !== EQInfo_Item.EEW) changed = true;
            if (EQElm.OriginTime !== EQInfo_Item.OriginTime) changed = true;
            if (EQElm.epiCenter !== EQInfo_Item.epiCenter) changed = true;
            if (EQElm.M !== EQInfo_Item.M) changed = true;
            if (EQElm.maxI !== EQInfo_Item.maxI) changed = true;
            if (EQElm.maxLgInt !== EQInfo_Item.maxLgInt) changed = true;
            if (EQElm.headline !== EQInfo_Item.headline) changed = true;
            if (EQElm.DetailURL.length !== EQInfo_Item.DetailURL.length) changed = true;
            if (EQInfo_Item.axisData) changed = true;

            if (EQElm.category == "EEW" && EQInfo_Item.category != "EEW") playAudio = true;

            EQElm.cancel = EQInfo_Item.cancel;
            EQElm.category = EQInfo_Item.category;
            EQElm.EEW = EQInfo_Item.EEW;
            EQElm.reportDateTime = EQInfo_Item.reportDateTime;
            EQElm.OriginTime = EQInfo_Item.OriginTime;
            EQElm.epiCenter = EQInfo_Item.epiCenter;
            EQElm.M = EQInfo_Item.M;
            EQElm.maxI = EQInfo_Item.maxI;
            EQElm.maxLgInt = EQInfo_Item.maxLgInt;
            EQElm.headline = EQInfo_Item.headline;
            EQElm.DetailURL = EQElm.DetailURL.concat(EQInfo_Item.DetailURL);
            if (EQInfo_Item.axisData) EQElm.axisData = EQInfo_Item.axisData;

            if (changed) {
              UpdateEQInfoTmp.push(EQElm);
              var i = eqInfo.jma.findIndex(function (elm2) {
                return elm2.eventId == EQElm.eventId;
              });
              eqInfo.jma[i] = EQElm;
            }
          } else {
            data.EEW = data.category == "EEW"

            EQInfoData[data.eventId] = Object.assign({}, data);
            EQInfoData[data.eventId].raw_data = [Object.assign({}, data)];

            eqInfoTmp.push(data);
            eqInfo.jma.push(data);
            if (count !== 0 && data.category !== "EEW") playAudio = true;
          }
        });

        if (eqInfoTmp.length > 0) AlertEQInfo(eqInfoTmp, "jma", false, playAudio);
        if (UpdateEQInfoTmp.length > 0) AlertEQInfo(UpdateEQInfoTmp, "jma", true, playAudio);
        break;
      case "usgs":
        dataList = dataList.sort(function (a, b) {
          return a.OriginTime > b.OriginTime ? -1 : 1;
        });
        AlertEQInfo(dataList, "usgs");
        break;
    }
  } catch (err) {
    throw new Error("地震情報データの処理（マージ）に失敗しました。", { cause: err });
  }
}


var EQCount_data = {};
function EQCount_process(data) {
  if (data) EQCount_data[data.eventId] = data
  var EQCount_data_array = [];
  Object.keys(EQCount_data).forEach(function (key) {
    EQCount_data_array.push(EQCount_data[key])
  })

  EQCount_data_array = EQCount_data_array.sort(function (a, b) { return Number(a.reportDateTime) - Number(b.reportDateTime) })

  messageToMainWindow({
    action: "EQCount",
    source: "jma",
    data: EQCount_data_array,
  });
}

//時間(ms)を「～分[秒,分,時間,日]」の形にする
function timeDifference(miliseconds) {
  if (isNaN(miliseconds)) return "";
  if (miliseconds < 60000) return { num: Math.round(miliseconds / 1000), unit: "秒" };
  else if (miliseconds < 3600000) return { num: Math.round(miliseconds / 60000), unit: "分" };
  else if (miliseconds < 86400000) return { num: Math.round(miliseconds / 3600000), unit: "時間" };
  else return { num: Math.round(miliseconds / 86400000), unit: "日" };
}

//地震情報通知（音声・画面表示等）
function AlertEQInfo(data, source, update, audioPlay) {
  try {
    if (source == "jma") {
      if (audioPlay) {
        data = data.sort(function (a, b) {
          return a.OriginTime > b.OriginTime ? -1 : 1;
        });

        if (config.Info.EQInfo.NotificationSound &&
          (config.Info.EQInfo.Bypass_threshold || NormalizeShindo(config.Info.EQInfo.maxI_threshold, 5) <= NormalizeShindo(data[0].maxI, 5) ||
            config.Info.EQInfo.M_threshold <= data[0].M)) {
          PlayAudio("EQInfo");
          speak(GenerateEQInfoText(data[0]));
        }
      }

      eqInfo.jma = eqInfo.jma
        .filter(function (elm) {
          return elm.OriginTime;
        }).sort(function (a, b) {
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
    throw new Error("地震情報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//🔴津波情報🔴
var Tsunami_Data = [];
var Tsunami_data_Marged;
function ConvertTsunamiInfo(data) {
  try {
    if (!config.Info.TsunamiInfo.GetData) return;
    if (!config.Info.TsunamiInfo.showtraining && data.status == "訓練") return;
    if (!config.Info.TsunamiInfo.showTest && data.status == "試験") return;

    let tsunamiItem = Tsunami_Data.find(function (elm) {
      return (Number(new Date(elm.issue.time)) == Number(new Date(data.issue.time)) &&
        (!elm.issue.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue.EventID, data.issue.EventID)));
    });

    if (tsunamiItem) {
      if (!tsunamiItem.headline) tsunamiItem.headline = data.headline;
      if (!tsunamiItem.comment) tsunamiItem.comment = data.comment;
      if (!tsunamiItem.status) tsunamiItem.status = data.status;
      if (!tsunamiItem.issue) tsunamiItem.issue = {};
      if (data.issue.EventID) tsunamiItem.issue.EventID = data.issue.EventID;
      if (data.issue.EarthQuake) tsunamiItem.issue.EarthQuake = data.issue.EarthQuake;
      tsunamiItem.revocation = data.revocation;
      if (data.cancelled) tsunamiItem.cancelled = data.cancelled;
      if (data.ValidDateTime) tsunamiItem.ValidDateTime = data.ValidDateTime;
      data.areas.forEach(function (elm) {
        var areaItem;
        if (tsunamiItem.areas) {
          areaItem = tsunamiItem.areas.find(function (elm2) {
            return elm2.name == elm.name;
          });
        }

        if (areaItem) {
          if (elm.code) areaItem.code = elm.code;
          if (elm.grade) areaItem.grade = elm.grade;
          if (elm.cancelled) areaItem.cancelled = elm.cancelled;
          if (elm.firstHeight) areaItem.firstHeight = elm.firstHeight;
          if (elm.firstHeightCondition) areaItem.firstHeightCondition = elm.firstHeightCondition;
          if (elm.maxHeight) areaItem.maxHeight = elm.maxHeight;

          if (elm.stations) {
            elm.stations.forEach(function (elm2) {
              var stItem
              if (Array.isArray(areaItem.stations)) {
                stItem = areaItem.stations.find(function (elm3) {
                  return elm3.name == elm2.name;
                });
              }
              if (stItem) {
                if (elm2.code) stItem.code = elm2.code;
                if (elm2.ArrivedTime) stItem.ArrivedTime = elm2.ArrivedTime;
                if (elm2.firstHeightCondition) stItem.firstHeightCondition = elm2.firstHeightCondition;
                if (elm2.firstHeightInitial) stItem.firstHeightInitial = elm2.firstHeightInitial;
                if (elm2.omaxHeight) stItem.omaxHeight = elm2.omaxHeight;
                if (elm2.maxHeightRising) stItem.maxHeightRising = elm2.maxHeightRising;
                if (elm2.maxHeightTime) stItem.maxHeightTime = elm2.maxHeightTime;
                if (elm2.maxHeightCondition) stItem.maxHeightCondition = elm2.maxHeightCondition;
              } else elm.stations.push(elm2);
            });
          }
        } else {
          tsunamiItem.areas.push(elm);
        }
      });
    } else {
      Tsunami_Data.push(data);
      //アラート
      CreateMainWindow();

      var grade_num = { MajorWarning: 3, Warning: 2, Watch: 1, Yoho: 0 };

      var home_grade = 0;
      var grades = data.areas.map(function (elm) {
        if (config.home.TsunamiSect && elm.name == config.home.TsunamiSect)
          home_grade = grade_num[elm.grade];
        return grade_num[elm.grade] ? grade_num[elm.grade] : 0;
      });

      var max_grade = Math.max(...grades);

      if (config.Info.TsunamiInfo.NotificationSound) {
        let NOTnewest = Tsunami_Data.find(function (elm) {
          return (Number(new Date(elm.issue.time)) > Number(new Date(data.issue.time)) &&
            (!elm.issue.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue.EventID, data.issue.EventID)));
        });
        if (
          !NOTnewest && (
            max_grade >= config.Info.TsunamiInfo.Global_threshold ||
            home_grade >= config.Info.TsunamiInfo.Local_threshold ||
            config.Info.TsunamiInfo.Bypass_threshold
          )
        ) {
          PlayAudio("TsunamiInfo");
          speak(GenerateTsunamiText(data));
        }
      }
    }

    Tsunami_data_Marged = { issue: {}, areas: [] };
    Tsunami_Data = Tsunami_Data.sort((a, b) =>
      Number(new Date(a.issue.time)) > Number(new Date(b.issue.time)) ? 1 : -1
    );

    Tsunami_Data.forEach(function (elm0) {
      Tsunami_data_Marged.revocation = elm0.revocation;
      Tsunami_data_Marged.cancelled = elm0.cancelled;
      if (elm0.revocation || elm0.cancelled) return;

      if (elm0.headline) Tsunami_data_Marged.headline = elm0.headline;
      if (elm0.comment) Tsunami_data_Marged.comment = elm0.comment;
      if (elm0.status) Tsunami_data_Marged.status = elm0.status;

      if (elm0.issue.EventID) Tsunami_data_Marged.issue.EventID = elm0.issue.EventID;
      if (elm0.issue.EarthQuake) Tsunami_data_Marged.issue.EarthQuake = elm0.issue.EarthQuake;
      if (elm0.cancelled) Tsunami_data_Marged.cancelled = elm0.cancelled;
      if (elm0.ValidDateTime) Tsunami_data_Marged.ValidDateTime = elm0.ValidDateTime;
      if (elm0.issue.time) Tsunami_data_Marged.issue.time = elm0.issue.time;

      elm0.areas.forEach(function (elm) {
        var areaItem;
        if (Array.isArray(Tsunami_data_Marged.areas)) {
          areaItem = Tsunami_data_Marged.areas.find(function (elm2) {
            return elm2.name == elm.name;
          });
        }
        if (areaItem) {
          if (elm.code) areaItem.code = elm.code;
          if (elm.grade) areaItem.grade = elm.grade;
          if (elm.cancelled) areaItem.cancelled = elm.cancelled;
          if (elm.firstHeight) areaItem.firstHeight = elm.firstHeight;
          if (elm.firstHeightCondition) areaItem.firstHeightCondition = elm.firstHeightCondition;
          if (elm.maxHeight) areaItem.maxHeight = elm.maxHeight;

          if (elm.stations) {
            elm.stations.forEach(function (elm2) {
              var stItem;
              if (Array.isArray(areaItem.stations)) {
                stItem = areaItem.stations.find(function (elm3) {
                  return elm3.name == elm2.name;
                });
              }

              if (stItem) {
                if (elm2.code) stItem.code = elm2.code;
                if (elm2.ArrivedTime) stItem.ArrivedTime = elm2.ArrivedTime;
                if (elm2.firstHeightCondition) stItem.firstHeightCondition = elm2.firstHeightCondition;
                if (elm2.firstHeightInitial) stItem.firstHeightInitial = elm2.firstHeightInitial;
                if (elm2.omaxHeight) stItem.omaxHeight = elm2.omaxHeight;
                if (elm2.maxHeightRising) stItem.maxHeightRising = elm2.maxHeightRising;
                if (elm2.maxHeightTime) stItem.maxHeightTime = elm2.maxHeightTime;
                if (elm2.maxHeightCondition) stItem.maxHeightCondition = elm2.maxHeightCondition;
              } else areaItem.stations.push(elm2);
            });
          }
        } else {
          Tsunami_data_Marged.areas.push(elm);
        }
      });
    });

    messageToMainWindow({ action: "tsunamiUpdate", data: Tsunami_data_Marged });
    if (TsunamiWindow) {
      TsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: Tsunami_data_Marged,
      });
    }
  } catch (err) {
    throw new Error("津波情報の処理（マージ）でエラーが発生しました。", { cause: err });
  }
}

//🔴支援関数🔴

//音声合成
function speak(str) {
  if (str && WorkerWindow) {
    WorkerWindow.webContents.send("message2", { action: "speak", data: str });
  }
}

//EEW時読み上げ文章 生成
function GenerateEEWText(EEWData, update) {
  try {
    if (EEWData.is_cancel) var text = config.notice.voice.EEWCancel;
    else if (update) var text = config.notice.voice.EEWUpdate;
    else var text = config.notice.voice.EEW;

    text = text.replaceAll("{grade}", EEWData.alertflg ? EEWData.alertflg : "");
    text = text.replaceAll("{serial}", EEWData.serial ? EEWData.serial : "");
    text = text.replaceAll("{final}", EEWData.is_final ? "最終報" : "");
    text = text.replaceAll("{location}", config.home.name ? config.home.name : "現在地");
    text = text.replaceAll("{magnitude}", EEWData.magnitude ? EEWData.magnitude : "");
    text = text.replaceAll("{maxInt}", EEWData.maxInt ? NormalizeShindo(EEWData.maxInt, 1) : "");
    text = text.replaceAll("{depth}", EEWData.depth ? EEWData.depth : "");
    text = text.replaceAll("{training}", EEWData.is_training ? "訓練報。" : "");
    text = text.replaceAll("{training2}", EEWData.is_training ? "これは訓練報です。" : "");
    text = text.replaceAll("{region_name}", EEWData.region_name ? EEWData.region_name : "");
    text = text.replaceAll("{report_time}", EEWData.report_time ? NormalizeDate(8, EEWData.report_time) : "");
    text = text.replaceAll("{origin_time}", EEWData.origin_time ? NormalizeDate(8, EEWData.origin_time) : "");
    if (EEWData.source == "simulation") text = "シミュレーションです。" + text;

    var userInt;
    if (EEWData.userIntensity) {
      userInt = EEWData.userIntensity;
    } else if (EEWData.warnZones && EEWData.warnZones.length) {
      var userSect = EEWData.warnZones.find(function (elm2) {
        return elm2.Name == config.home.Section;
      });

      if (userSect) userInt = config.Info.EEW.IntType == "max" ? userSect.IntTo : userSect.IntFrom;
    }

    text = text.replaceAll("{local_Int}", userInt ? NormalizeShindo(userInt, 1) : "不明");

    if (!userInt) text = text.replace(/\[.*?\]/g, "");
    text = text.replace(/\[|\]/g, "");

    return text;
  } catch {
    return "";
  }
}
//津波情報時読み上げ文章 生成
function GenerateEQInfoText(EQData) {
  try {
    if (EQData.category == "EEW") return ""; //EEWは専用の読み上げシステムに任せる
    if (!EQData.epiCenter && !EQData.maxI) return; //震度も震源もわからない（壊れたデータ）をはねる

    if (EQData.cancel) var text = config.notice.voice.EQInfoCancel;
    else var text = config.notice.voice.EQInfo;

    var category = EQData.category;
    if (category == "Tsunami") category = "津波情報に付帯する地震情報";

    var dif = timeDifference(Number(new Date() - new Date(EQData.OriginTime)));
    text = text.replaceAll("{category}", category ? category : "");
    text = text.replaceAll("{training}", EQData.status == "訓練" ? "訓練報。" : "");
    text = text.replaceAll("{training2}", EQData.status == "訓練" ? "これは訓練報です。" : "");
    text = text.replaceAll("{report_time}", EQData.reportDateTime ? NormalizeDate(9, EQData.reportDateTime) : "");
    text = text.replaceAll("{origin_time}", EQData.OriginTime ? NormalizeDate(9, EQData.OriginTime) : "");
    text = text.replaceAll("{origin_time2}", EQData.OriginTime ? dif.num + dif.unit + "前" : "先ほど");
    text = text.replaceAll("{region_name}", EQData.epiCenter ? EQData.epiCenter : "");
    text = text.replaceAll("{magnitude}", EQData.M ? EQData.M : "");
    text = text.replaceAll("{maxInt}", EQData.maxI ? NormalizeShindo(EQData.maxI, 1) : "");
    text = text.replaceAll("{headline}", EQData.headline ? EQData.headline : "");

    if (!EQData.epiCenter) text = text.replace(/\[.*?\]/g, "");
    if (!EQData.maxI) text = text.replace(/<.*?>/g, "");
    text = text.replace(/\[|\]|<|>/g, "");

    return text;
  } catch {
    return "";
  }
}
//津波情報時読み上げ文章 生成
function GenerateTsunamiText(data) {
  try {
    if (data.Torikeshi) var text = config.notice.voice.TsunamiTorikeshi;
    else if (data.revocation || data.cancelled)
      var text = config.notice.voice.TsunamiRevocation;
    else var text = config.notice.voice.Tsunami;
    var grades = { MajorWarning: false, Warning: false, Watch: false, Yoho: false, };
    var grades_JA = {
      MajorWarning: "大津波警報",
      Warning: "津波警報",
      Watch: "津波注意報",
      Yoho: "津波予報",
    };

    //自地域（カッコで） 最大波高さ
    var grade_arr = [];
    var homeArea;
    data.areas.forEach(function (area) {
      if (area.grade) grades[area.grade] = true;
      if (config.home.TsunamiSect && area.name == config.home.TsunamiSect)
        homeArea = area;
    });

    Object.keys(grades).forEach(function (key) {
      if (grades[key]) grade_arr.push(grades_JA[key]);
    });

    text = text.replaceAll("{max_grade}", grade_arr[0] ? grade_arr[0] : "津波情報");
    text = text.replaceAll("{all_grade}", grade_arr[0] ? grade_arr.join("、") : "津波情報");
    text = text.replaceAll("{report_time}", data.issue.time ? NormalizeDate(9, data.issue.time) : "不明な時刻");
    text = text.replaceAll("{headline}", data.headline ? data.headline : "");

    if (homeArea && !homeArea.cancelled) {
      text = text.replaceAll("{home_area}", homeArea.name ? homeArea.name : "設定地点");
      text = text.replaceAll("{home_grade}", homeArea.grade ? grades_JA[homeArea.grade] : "津波情報");

      var firstHeightTmp = "";
      if (homeArea.firstHeight)
        firstHeightTmp = "第１波が" + NormalizeDate(9, homeArea.firstHeight) + "に予想され、";
      else if (homeArea.firstHeightCondition == "津波到達中と推測")
        firstHeightTmp = "津波が到達中とみられ、";
      else if (homeArea.firstHeightCondition == "第１波の到達を確認")
        firstHeightTmp = "既に第１波が到達し、";
      else firstHeightTmp = "";
      text = text.replaceAll("{first_height1}", firstHeightTmp);

      var firstHeightTmp2 = "";
      if (homeArea.firstHeight)
        firstHeightTmp2 = "到達予想時刻は" + NormalizeDate(9, homeArea.firstHeight);
      else if (homeArea.firstHeightCondition == "津波到達中と推測")
        firstHeightTmp2 = "津波到達中と推測";
      else if (homeArea.firstHeightCondition == "第１波の到達を確認")
        firstHeightTmp2 = "第１波の到達を確認";
      else firstHeightTmp2 = "到達時刻は不明";
      text = text.replaceAll("{first_height2}", firstHeightTmp2);

      var immediately = "";
      if (homeArea.firstHeightCondition == "ただちに津波来襲と予測")
        immediately = "ただちに津波が来襲すると予測されます。";
      text = text.replaceAll("{immediately}", immediately);

      var MaxHeightTmp = "";
      if (homeArea.maxHeight == "巨大") MaxHeightTmp = "巨大な津波";
      else if (homeArea.maxHeight == "高い") MaxHeightTmp = "高い津波";
      else if (homeArea.maxHeight)
        MaxHeightTmp = "今後最大" + homeArea.maxHeight.replace("m", "メートル") + "の津波";
      else if (!homeArea.maxHeight && homeArea.grade == "Yoho")
        MaxHeightTmp = "若干の海面変動";
      else MaxHeightTmp = "高さ不明の津波";
      text = text.replaceAll("{max_height1}", MaxHeightTmp);

      var MaxHeightTmp2 = "";
      if (homeArea.maxHeight == "巨大") MaxHeightTmp2 = "巨大";
      else if (homeArea.maxHeight == "高い") MaxHeightTmp2 = "高い";
      else if (homeArea.maxHeight)
        MaxHeightTmp2 = homeArea.maxHeight.replace("m", "メートル");
      else if (!homeArea.maxHeight && homeArea.grade == "Yoho")
        MaxHeightTmp2 = "若干の海面変動";
      else MaxHeightTmp2 = "不明";
      text = text.replaceAll("{max_height2}", MaxHeightTmp2);
    } else text = text.replace(/\[.*?\]/g, "");

    text = text.replace(/\[|\]/g, "");
    return text;
  } catch {
    return "";
  }
}

//音声再生(WorkerWindow連携)
function PlayAudio(name) {
  if (WorkerWindow) {
    WorkerWindow.webContents.send("message2", {
      action: "PlayAudio",
      data: name,
    });
  }
}

//メインウィンドウ内通知
var notifyData;
function SystemNotification(message) {
  var Push = new Notification({
    title: "Zero Quake システム通知",
    body: message,
    icon: path.join(__dirname, "img/icon.ico"),
  });

  Push.show();
}

//JSONパース（拡張）
function ParseJSON(str) {
  try {
    str = String(str);
    var json = JSON.parse(str);
  } catch {
    return null;
  }
  return json;
}

//日時フォーマット
function NormalizeDate(type, date) {
  try {
    if (!date) date = new Date();
    else date = new Date(date);
    if (Number.isNaN(date.getTime())) return "";

    var YYYY = String(date.getFullYear());
    var YY = String(date.getFullYear()).slice(-2);
    var MM = String(date.getMonth() + 1).padStart(2, "0");
    var DD = String(date.getDate()).padStart(2, "0");
    var hh = String(date.getHours()).padStart(2, "0");
    var mm = String(date.getMinutes()).padStart(2, "0");
    var ss = String(date.getSeconds()).padStart(2, "0");
    var M = String(date.getMonth() + 1);
    var D = String(date.getDate());
    var h = String(date.getHours());
    var m = String(date.getMinutes());
    var s = String(date.getSeconds());
    var isToday = date.toDateString() == new Date().toDateString();
    if (typeof type === "string" || type instanceof String) {
      return type.replaceAll("YYYY", YYYY).replaceAll("YY", YY).replaceAll("MM", MM).replaceAll("DD", DD).replaceAll("hh", hh).replaceAll("mm", mm).replaceAll("ss", ss).replaceAll("M", M).replaceAll("D", D).replaceAll("h", h).replaceAll("m", m).replaceAll("s", s);
    }
    switch (type) {
      case 1:
        return YYYY + MM + DD + hh + mm + ss;
      case 2:
        return YYYY + MM + DD;
      case 3:
        return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss;
      case 4:
        return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm;
      case 5:
        return D + "日 " + hh + ":" + mm;
      case 6:
        return hh + ":" + mm;
      case 7:
        return hh + "時" + mm + "分" + ss + "秒";
      case 8:
        return h + "時" + m + "分" + s + "秒";
      case 9:
        var date_str = "";
        if (!isToday) date_str = D + "日 ";
        return date_str + h + "時" + m + "分";
      case 10:
        var date_str = "";
        if (!isToday) date_str = D + "日 ";
        return date_str + hh + ":" + mm;
      default:
        return new Date().toLocaleString("ja-jp");
    }
  } catch {
    return "";
  }
}
//震度の形式変換
function NormalizeShindo(str, responseType) {
  try {
    var ShindoTmp;
    if (str === null || str === undefined) ShindoTmp = 11;
    else if (isNaN(str)) {
      str = String(str)
        .replace(/[０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        }).replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-").replace(/\s+/g, "");
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
          ShindoTmp = 10;
          break;
        case "-1":
        case "?":
        case "不明":
        default:
          ShindoTmp = 11;
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
      else ShindoTmp = 11;
    }
    switch (responseType) {
      case 1:
        var ConvTable = ["0", "1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7", "５弱以上未入電", "不明",];
        break;
      case 2:
        var ConvTable = [
          [config.color.Shindo["0"].background, config.color.Shindo["0"].color],
          [config.color.Shindo["1"].background, config.color.Shindo["1"].color],
          [config.color.Shindo["2"].background, config.color.Shindo["2"].color],
          [config.color.Shindo["3"].background, config.color.Shindo["3"].color],
          [config.color.Shindo["4"].background, config.color.Shindo["4"].color],
          [config.color.Shindo["5m"].background, config.color.Shindo["5m"].color],
          [config.color.Shindo["5p"].background, config.color.Shindo["5p"].color],
          [config.color.Shindo["6m"].background, config.color.Shindo["6m"].color],
          [config.color.Shindo["6p"].background, config.color.Shindo["6p"].color],
          [config.color.Shindo["7"].background, config.color.Shindo["7"].color],
          [config.color.Shindo["5p?"].background, config.color.Shindo["5p?"].color],
          [config.color.Shindo["?"].background, config.color.Shindo["?"].color],
        ];
        break;
      case 3:
        var ConvTable = [null, "1", "2", "3", "4", "5m", "5p", "6m", "6p", "7", "5p?", null,
        ];
        break;
      case 4:
        var ConvTable = [0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 7, 4.5, null];
        break;
      case 5:
        var ConvTable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4.5, 0];
        break;
      case 0:
      default:
        var ConvTable = ["0", "1", "2", "3", "4", "5-", "5+", "6-", "6+", "7", "未", "?"];
        break;
    }
    return ConvTable[ShindoTmp];
  } catch {
    return "";
  }
}

//２地点の緯度経度から距離（km）を算出
function geosailing(lat1, lon1, lat2, lon2) {
  try {
    var a = Math.pow(Math.sin((lon2 - lon1) * Math.PI / 360), 2) + Math.pow(Math.sin((lat2 - lat1) * Math.PI / 360), 2) * Math.cos(lon1 * Math.PI / 180) * Math.cos(lon2 * Math.PI / 180);
    return 12746 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  } catch { return 0 }
};

//連想配列オブジェクトのマージ
function mergeDeeply(target, source, opts) {
  try {
    const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
    const isConcatArray = opts && opts.concatArray;
    let result = Object.assign({}, target);
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
function ConvertJST(time) {
  try {
    return new Date(time.setHours(time.getHours() + 9));
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。(タイムゾーンの変換)", { cause: err });
  }
}
function depthFilter(depth) {
  if (!isFinite(depth) || depth < 0) return 0;
  else if (depth > 700) return 700;
  else if (200 <= depth) return Math.floor(depth / 10) * 10;
  else if (50 <= depth) return Math.floor(depth / 5) * 5;
  else return Math.floor(depth / 2) * 2;
}
function Boolean2(elm) {
  return Boolean(elm !== null && elm !== undefined && elm !== "" && !Number.isNaN(elm) && elm != "Invalid Date" && (!Array.isArray(elm) || elm.length > 0) && elm);
}

function IncludesDuplicates(arr1, arr2) {
  return [...arr1, ...arr2].filter(item => arr1.includes(item) && arr2.includes(item)).length > 0
}