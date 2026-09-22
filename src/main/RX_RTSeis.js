import path from "path";
import { fileURLToPath } from "url";
import workerThreads from "worker_threads";
import electron from "electron";
const { net } = electron;
import * as turf from "@turf/turf";
import { JSDOM } from "jsdom";
const DomPsr = new (new JSDOM()).window.DOMParser();
import WebSocket from "websocket";
const WebSocketClient = WebSocket.client;

import { throttle, NormalizeDate, KmoniColorTable, Boolean2, FERegion, ConvertJST, ConvertUTC, newDate2, ParseJSON } from "./constants.js";
import { MainWindow, WorkerWindow, messageToMainWindow, messageToWorkerWindow, PlayAudio, CreateMainWindow } from "./windows.js";
import { EarlyEst_Marge, DetectEEW } from "./PROC_EEW.js";

export var worker = null;
export var thresholds;
export function setThresholds(t) { thresholds = t; }
export var EQDetect_List = [];
export function clearEQDetectList() { EQDetect_List = []; }

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let rtCtx = {
  getConfig: () => ({}),
  getReplay: () => 0,
  getKmoniOffset: () => 2500,
  setKmoniOffset: () => { },
  UpdateStatus: () => { },
  GeneralError_handler: () => { },
  IntervalRun: () => { },
  getThresholds: () => null,
};

export function initRTSeisContext(ctx) {
  rtCtx = Object.assign(rtCtx, ctx);
}

export var KmoniOffset = 2500;
export var kmoniPointsDataTmp, SnetPointsDataTmp, TremRtsData_Marged;

const UpdateStatus = (...args) => rtCtx.UpdateStatus(...args);
const GeneralError_handler = (...args) => rtCtx.GeneralError_handler(...args);
const IntervalRun = (...args) => rtCtx.IntervalRun(...args);

export var TremRts_sta;
export var Trem_server = true;
export var Req_TremRts_sta = throttle(function () {
  fetch(
    `https://api-${Trem_server ? 1 : 2}.exptech.dev/api/v1/trem/station?_=${Number(new Date())}`,
    { signal: AbortSignal.timeout(4000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.json();
  }).then((json) => {
    TremRts_sta = json;
    messageToMainWindow({
      action: "TremRts_sta",
      data: TremRts_sta,
    });

  }).catch((err) => {
    GeneralError_handler(err)
    UpdateStatus("TREM-RTS", "Error");
    Trem_server = !Trem_server;
  });
}, 5000);


var TremRTS_server = {
  RT: 0,
  Hi: 0
};
var Trem_URLs = {
  RT: [//リアルタイム
    "https://lb-1.exptech.dev/api/v1/trem/rts",
    "https://lb-2.exptech.dev/api/v1/trem/rts",
    "https://lb-3.exptech.dev/api/v1/trem/rts",
    "https://lb-4.exptech.dev/api/v1/trem/rts",
  ],
  Hi: [//History
    "https://api-1.exptech.dev/api/v1/trem/rts/[UNIXTIME]",
    "https://api-2.exptech.dev/api/v1/trem/rts/[UNIXTIME]"
  ]
}
var TremErrorCounter = 0;
var TremRts_Timer;
export function Req_TremRts() {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  if (TremRts_Timer) clearTimeout(TremRts_Timer);
  TremRts_Timer = setTimeout(Req_TremRts, config.Source.TREMRTS.Interval);

  if (!config.Source.TREMRTS.GetData) return;
  if (!TremRts_sta) Req_TremRts_sta();

  var realtime = Replay == 0;
  if (realtime) var url = Trem_URLs.RT[TremRTS_server.RT] + `?_=${Number(new Date())}`;
  else var url = Trem_URLs.Hi[TremRTS_server.Hi].replace("[UNIXTIME]", Number(new Date() - Replay));

  fetch(url, { signal: AbortSignal.timeout(4000) })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var TremRtsData = {};
      Object.keys(json.station).forEach(function (StID) {
        var st = json.station[StID];
        var stationData = TremRts_sta?.[StID];
        if (stationData) {
          var JPShindo = st.i; //おおむね対応するため、現時点では変換不要と判断
          var rgb = KmoniColorTable[Math.min(7, Math.max(-3, Math.floor(JPShindo * 10) / 10))];
          TremRtsData[StID] = {
            Type: stationData.net,
            shindo: JPShindo,
            PGA: st.pga,
            Code: StID,
            rgb: [rgb.r, rgb.g, rgb.b],
          };
        } else {
          Req_TremRts_sta();
        }
      });
      TremRtsData_Marged = {
        action: "TREM-RTSUpdate",
        LocalTime: new Date(),
        data: TremRtsData,
      };
      messageToMainWindow(TremRtsData_Marged);
      UpdateStatus("TREM-RTS", "success", new Date(json.time));

      TremErrorCounter = 0;
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("TREM-RTS", "Error");

      TremErrorCounter++;
      if (TremErrorCounter >= 3) {
        TremErrorCounter = 0;
        if (realtime) {
          TremRTS_server.RT = (TremRTS_server.RT + 1) % Trem_URLs.RT.length;
        } else {
          TremRTS_server.Hi = (TremRTS_server.Hi + 1) % Trem_URLs.Hi.length;
        }
      }
    });
}

export function sort_by_dist_TIDE(data) {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  return data.sort((a, b) => {
    var a_dist = turf.distance([a.lon, a.lat], [config.home.longitude, config.home.latitude]);
    var b_dist = turf.distance([b.lon, b.lat], [config.home.longitude, config.home.latitude]);
    return a_dist - b_dist
  })
}

export var JMATide_sta;
export function Req_JMATide_sta() {
  fetch(
    `https://www.jma.go.jp/bosai/tidelevel/const/tide_area.json?_=${Number(new Date())}`,
    { signal: AbortSignal.timeout(4000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.json();
  }).then((json) => {
    var stations = []
    Object.keys(json).forEach(function (key) {
      var el = json[key]
      el.class30s.forEach(function (cl) {
        if (Array.isArray(cl.stations)) {
          cl.stations.forEach(function (st) {
            if (st.code && st.lat && st.lon && st.name) {//データ有効性チェック
              st.threshold_warn = cl.standard.level5
              st.threshold_advisory = cl.standard.level4
              stations.push(st);
            }
          });
        }
      });
    });

    //↓近い順10件
    stations = sort_by_dist_TIDE(stations);
    JMATide_sta = stations.slice(0, 10)
    //↑近い順10件
  }).catch((err) => {
    GeneralError_handler(err)
    messageToMainWindow({ action: "Return_tide", data: [] });
  });
}

export var JMATide_astro = {};
export var JMATide_obs = {};
export function Req_JMATide() {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  if (!JMATide_sta) return Req_JMATide_sta();
  JMATide_sta.forEach(function (st) {

    if (!JMATide_astro[st.code]) {
      fetch(`https://www.jma.go.jp/bosai/tidelevel/const/tide_astro/tide_astro_${NormalizeDate("YYYY", new Date() - Replay)}_${st.code}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
          return r.json();
        }).then((json) => {
          var tide = json.tide;
          if (tide && st.code) {
            JMATide_astro[st.code] = tide

            if (JMATide_obs[st.code]) {//★1と同じ
              JMATide_obs[st.code].astro = tide[NormalizeDate("MMDD", new Date() - Replay)][NormalizeDate("h", new Date() - Replay)]
              messageToMainWindow({ action: "Return_tide", data: sort_by_dist_TIDE(Object.values(JMATide_obs)) });
            }
          }
        }).catch((err) => {
          GeneralError_handler(err)
          messageToMainWindow({ action: "Return_tide", data: [] });
        });
    }

    fetch(`https://www.jma.go.jp/bosai/tidelevel/data/tide/tide_obs_${NormalizeDate(2, new Date() - Replay)}_${st.code}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
        return r.json();
      }).then((json) => {
        if (json.tide && json.tide.length >= 4) {
          var obsdata = {
            code: st.code,
            name: st.name,
            by: st.typeName ? String(st.typeName).replaceAll("（地図では自治体等）", "") : "-",
            date: new Date(Number(new Date(json.time)) + (json.interval * json.tide.length * 1000)),
            threshold_warn: st.threshold_warn,
            threshold_advisory: st.threshold_advisory
          };

          var part = json.tide.slice(-4);
          var height;
          switch (config.Info.TideHeight.processing) {
            case "median":
              var sorted = part.sort((a, b) => a - b);
              height = (sorted[1] + sorted[2]) / 2
              break;
            default:
            case "latest":
              height = json.tide[json.tide.length - 1]
              break;
          }
          obsdata.height = height;

          if (JMATide_astro[st.code]) {//★1と同じ処理
            obsdata.astro = JMATide_astro[st.code]?.[NormalizeDate("MMDD", new Date() - Replay)]?.[NormalizeDate("h", new Date() - Replay)];
          }

          JMATide_obs[st.code] = obsdata
          messageToMainWindow({ action: "Return_tide", data: sort_by_dist_TIDE(Object.values(JMATide_obs)) });
        }
      }).catch((err) => {
        GeneralError_handler(err)
        messageToMainWindow({ action: "Return_tide", data: [] });
      });
  })
}


export var EarlyEst_Timer;
export function Req_EarlyEst() {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  if (EarlyEst_Timer) clearTimeout(EarlyEst_Timer);
  EarlyEst_Timer = setTimeout(Req_EarlyEst, config.Source.EarlyEst.Interval);

  if (!config.Source.EarlyEst.GetData) return;

  fetch(
    "http://early-est.rm.ingv.it/monitor.xml",
    { signal: AbortSignal.timeout(4000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.text();
  }).then((text) => {
    UpdateStatus("Early-est", "success");
    let doc = DomPsr.parseFromString(text, "text/xml");
    Array.prototype.forEach.call(
      doc.getElementsByTagName("eventParameters"),
      function (parent) {
        var elm = parent.getElementsByTagName("event")[0];
        if (!elm) return;
        var latitude = Number(elm?.querySelector("origin latitude value")?.textContent) || null;
        var longitude = Number(elm?.querySelector("origin longitude value")?.textContent) || null;
        if (!Boolean2(latitude) || !Boolean2(longitude)) return;

        var FECode = FERegion.features.find(function (elm2) {
          return turf.booleanPointInPolygon([longitude, latitude], elm2);
        });
        if (!FECode) return;

        var data = {
          alertflg: "EarlyEst",
          EventID: Number(String(elm.getAttribute("publicID")).slice(-12)) || 1,
          serial: Number((elm.querySelector("origin quality")?.getElementsByTagName("ee:report_count")?.[0]?.textContent) || 0) + 1,
          report_time: ConvertJST(newDate2(elm.querySelector("creationInfo creationTime")?.textContent)) || null,
          magnitude: Number(elm.querySelector("magnitude mag value")?.textContent) || null,
          depth: (Number(elm.querySelector("origin depth value")?.textContent) / 1000) || null,
          latitude: latitude,
          longitude: longitude,
          region_name: FECode.properties.nameJA,
          origin_time: ConvertJST(newDate2(elm.querySelector("origin time value")?.textContent)) || null,
          source: "EarlyEst",
        };
        EarlyEst_Marge(data);
      }
    );
  }).catch((err) => {
    GeneralError_handler(err)
    UpdateStatus("Early-est", "Error");
  });
}

export function createWorker() {
  const config = rtCtx.getConfig();
  worker = new workerThreads.Worker(path.join(__dirname, "../js/EQDetectWorker.js"));
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
          timestamp: new Date(message.date),
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
export function ConvertKmoni(data, date) {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  worker.postMessage({
    action: "EQDetect",
    data: data,
    date: date,
    detect: config.Info.RealTimeShake.DetectEarthquake,
  });
}

//海しるリアルタイム揺れ情報処理
export var msil_latest = { 11: null, 12: null };
export function ConvertSnet(data, date, y, uid) {
  msil_latest[y] = [uid, data]
  var another = ((y == 11) ? 12 : 11)
  if (msil_latest[another] && msil_latest[another][0] == uid) {
    SnetPointsDataTmp = {
      action: "SnetUpdate",
      timestamp: new Date(date),
      LocalTime: new Date(),
      data: {
        data: [...data, ...msil_latest[another][1]]
      },
    };
    messageToMainWindow(SnetPointsDataTmp);
  }
}

export var Kmoni_URLIndex = 0;
export var Kmoni_ErrorCount = 0;
export var Kmoni_Timer;
export var Kmoni_URLs = [
  `http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/jma_s/[YYYYMMDD]/[YYYYMMDDhhmmss].jma_s.gif`,
  `https://www.lmoni.bosai.go.jp/img_svr/data/map_img/RealTimeImg/jma_s/[YYYYMMDD]/[YYYYMMDDhhmmss].jma_s.gif`,
];

//強震モニタへのHTTPリクエスト
export function Req_kmoni() {//済
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  //タイマー処理
  if (Kmoni_Timer) clearTimeout(Kmoni_Timer);
  Kmoni_Timer = setTimeout(Req_kmoni, config.Source.kmoni.kmoni.Interval);

  if (!config.Source.kmoni.kmoni.GetData) return;

  var ReqTime = new Date() - KmoniOffset - Replay;
  var url = Kmoni_URLs[Kmoni_URLIndex]
    .replace("[YYYYMMDD]", NormalizeDate(2, ReqTime))
    .replace("[YYYYMMDDhhmmss]", NormalizeDate(1, ReqTime));
  fetch(
    url,
    { signal: AbortSignal.timeout(5000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.arrayBuffer();
  }).then((buffer) => {
    Kmoni_ErrorCount = 0;
    if (WorkerWindow) {
      WorkerWindow.webContents.send("message2", {
        action: "KmoniImgUpdate",
        data: Buffer.from(buffer),
        date: ReqTime,
      });
    }
  }).catch((err) => {
    GeneralError_handler(err)
    Kmoni_ErrorCount++;
    if (Kmoni_ErrorCount > 3) {//エラー回数が溜まったらURLを替える
      Kmoni_ErrorCount = 0;
      Kmoni_URLIndex = (Kmoni_URLIndex + 1) % Kmoni_URLs.length//モニタURLをローリングで選択
      SetKmoniOffset(Req_kmoni);
    }
    UpdateStatus("kmoniImg", "Error");
  });
}

export var Msil_Timer;
export var Msil_LastRecv = 0;

//海しるへのHTTPリクエスト処理
export function Req_SNet() {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();

  if (Msil_Timer) clearTimeout(Msil_Timer);
  Msil_Timer = setTimeout(Req_SNet, config.Source.msil.Interval);

  if (!config.Source.msil.GetData) return;
  if (!net.online) return UpdateStatus("msilImg", "Error");

  fetch(
    `https://www.msil.go.jp/data/tiles/smoni/targetTimes.json?${Number(new Date())}`
    , { signal: AbortSignal.timeout(4000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.text();
  }).then((text) => {
    var json = JSON.parse(text.replace(/\s+/g, ''));

    if (!Array.isArray(json)) throw new Error("msil.go.jpが不正なフォーマットのJSONを返しました。");
    var basetime = 0;
    var NowUTC = Number(NormalizeDate(1, ConvertUTC(new Date(new Date() - Replay))));
    json.forEach(function (elm) {
      if (basetime < elm.basetime && NowUTC >= elm.basetime)
        basetime = Number(elm.basetime);
    });
    if (Msil_LastRecv < basetime) {

      function Req_SNet_core(y, unique_id) {
        fetch(
          `https://www.msil.go.jp/data/tiles/smoni/tileimage/${basetime}/${basetime}/5/28/${y}.png`
          , { signal: AbortSignal.timeout(4000) }
        ).then((r) => {
          if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
          return r.arrayBuffer();
        }).then((buffer) => {
          if (WorkerWindow) {
            WorkerWindow.webContents.send("message2", {
              action: "SnetImgUpdate",
              y: y,
              unique_id: unique_id,
              data: Buffer.from(buffer),
              date: new Date(),
            });
          }
          UpdateStatus("msilImg", "success");

        }).catch((err) => {
          GeneralError_handler(err)
          UpdateStatus("msilImg", "Error");
        });
      }
      var unique_id = String(Number(new Date())) + String(Math.floor(Math.random() * 100));
      Req_SNet_core(11, unique_id);
      Req_SNet_core(12, unique_id);
      Msil_LastRecv = basetime;
    }

  }).catch((err) => {
    GeneralError_handler(err)
    UpdateStatus("msilImg", "Error");
  });
}

export var Seisjs_sta = {};
export function Req_Seisjs_sta() {
  fetch(
    `https://api.wolfx.jp/seis_list.json?_=${Number(new Date())}`
    , { signal: AbortSignal.timeout(4000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.json();
  }).then((json) => {
    Seisjs_sta = json;
    messageToMainWindow({
      action: "Seisjs_sta",
      data: Seisjs_sta,
    });
  }).catch((err) => {
    GeneralError_handler(err);
    UpdateStatus("wolfx", "Error");
  });
}

export var SeisjsWS_Client;
export var SeisjsWS_timer;
export function SeisjsWS() {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  if (!config.Source.wolfx.GetDataFromSeisJS) return;
  SeisjsWS_Client = new WebSocketClient();

  SeisjsWS_Client.on("connectFailed", function () {
    UpdateStatus("wolfx", "Error");
    TryConnect_SeisjsWS();
  });

  SeisjsWS_Client.on("connect", function (SeisjsConnection) {
    SeisjsConnection.on("error", function () {
      UpdateStatus("wolfx", "Error");
    });
    SeisjsConnection.on("close", function () {
      UpdateStatus("wolfx", "Disconnect");
      TryConnect_SeisjsWS();
    });
    SeisjsConnection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("wolfx", "success");
      try {
        var json = ParseJSON(message.utf8Data);
        if (!json || json.type == "pong" || json.type == "heartbeat") return;
        MargeSeisJS(json);
      } catch {
        UpdateStatus("wolfx", "Error");
      }
      if (SeisjsWS_timer) {
        clearInterval(SeisjsWS_timer);
        SeisjsWS_timer = null;
      }
      SeisjsWS_timer = setInterval(function () {
        SeisjsConnection.sendUTF("ping");
      }, 60000);
    });
    UpdateStatus("wolfx", "success");
  });

  Connect_SeisjsWS();
}
export var Seisjs_ConnectedDate = new Date();
export function TryConnect_SeisjsWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Seisjs_ConnectedDate), 100);
  setTimeout(Connect_SeisjsWS, timeoutTmp);
}
export function Connect_SeisjsWS() {
  if (SeisjsWS_Client) SeisjsWS_Client.connect("wss://seisjs.wolfx.jp/all_seis");
  Seisjs_ConnectedDate = new Date();
}

export var SeisJSData = {};
export function MargeSeisJS(json) {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  var rgb = KmoniColorTable[Math.min(7, Math.max(-3, Math.floor(json.CalcShindo * 10) / 10))];
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

  if (!Seisjs_sta[json.type]) {
    Seisjs_sta[json.type] = {
      "enable": true,
      "name": json.type,
      "location": json.region,
      "latitude": json.latitude,
      "longitude": json.longitude,
    };
    messageToMainWindow({
      action: "Seisjs_sta",
      data: Seisjs_sta,
    });
  }


  Object.keys(SeisJSData).forEach(function (elm) {
    var dif = Number(new Date() - new Date(Number(new Date(SeisJSData[elm].update_at))));
    if (dif > (15000 + 3600000)) delete SeisJSData[elm];//中国標準時のことがあるので1h分余裕とる
  });

  IntervalRun(500, function () {
    messageToMainWindow({
      action: "SeisJSUpdate",
      LocalTime: new Date(),
      data: SeisJSData,
    });
  });
}


export async function SetKmoniOffset(func) {
  const config = rtCtx.getConfig();
  const Replay = rtCtx.getReplay();
  let KmoniOffset = rtCtx.getKmoniOffset();
  const thresholds = rtCtx.getThresholds();
  try {
    if (!net.online) throw new Error();

    var index = 0;
    var resTimeTmp;
    KmoniOffset = null;
    while (!KmoniOffset && index < 10) {
      await new Promise((resolve) => {
        var reqTime = new Date();

        fetch(
          `http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=${Number(new Date())}`
          , { signal: AbortSignal.timeout(4000) }
        ).then((r) => {
          if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
          return r.json();
        }).then((json) => {
          var resTime = new Date(json.latest_time);
          if (Number(resTimeTmp) !== Number(resTime)) KmoniOffset = new Date() - resTime - (new Date() - reqTime) / 2;
          resTimeTmp = resTime;
        }).catch((err) => {
          GeneralError_handler(err)
          UpdateStatus("kmoniImg", "Error");
        });

        setTimeout(resolve, 100);
      });

      index++;
    }

    if (!KmoniOffset) throw new Error();
    KmoniOffset += 200;
  } catch (err) {
    KmoniOffset = 2500;
    GeneralError_handler(err)
  }
  if (func) setTimeout(func, 200);
}

//情報最終更新時刻を更新
