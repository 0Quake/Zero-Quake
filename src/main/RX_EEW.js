import { DetectEEW } from "./PROC_EEW.js";
import { ParseJSON, newDate2, NormalizeShindo } from "./constants.js";
import { UpdateEQInfo } from "./RX_JMAXML.js";
import { ConvertTsunamiInfo } from "./PROC_Tsunami.js";
import { MargeEQInfo } from "./PROC_EQInfo.js";

import { config, Replay, UpdateStatus } from "./state.js";

var P2P_WS;
var P2PReconnectTimeout = 500;
export function P2P() {
  Connect_P2P();
}
function TryConnect_P2P() {
  P2PReconnectTimeout = Math.min(30000, P2PReconnectTimeout * 2);
  setTimeout(Connect_P2P, P2PReconnectTimeout);
}
function Connect_P2P() {
  try {
    if (P2P_WS) {
      P2P_WS.onclose = null;
      P2P_WS.close();
    }
    P2P_WS = new WebSocket("wss://api.p2pquake.net/v2/ws");

    P2P_WS.onopen = function () {
      UpdateStatus("P2P_EEW", "success");
      P2PReconnectTimeout = 500;
    };
    P2P_WS.onerror = function () {
      UpdateStatus("P2P_EEW", "Error");
    };
    P2P_WS.onclose = function () {
      UpdateStatus("P2P_EEW", "Disconnect");
      TryConnect_P2P();
    };
    P2P_WS.onmessage = function (event) {
      try {
        if (Replay == 0 && typeof event.data === "string") {
          var data = JSON.parse(event.data);
          if (data.time) UpdateStatus("P2P_EEW", "success", new Date(data.time));
          else UpdateStatus("P2P_EEW", "success");

          switch (data.code) {
            case 551:
              setTimeout(UpdateEQInfo, 10000);
              break;
            case 552:
              //津波情報
              data.issue.time = new Date(data.issue?.time);
              data.cancelled = false;
              data.revocation = false;
              data.source = "P2P";

              data.areas.forEach((elm) => {
                elm.firstHeightCondition = elm.firstHeight?.condition;
                elm.firstHeight = newDate2(elm.firstHeight?.arrivalTime) || null;
                elm.maxHeight = elm.maxHeight?.description;
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
        UpdateStatus("P2P_EEW", "Error");
      }
    };
  } catch {
    UpdateStatus("P2P_EEW", "Error");
    TryConnect_P2P();
  }
}

//AXIS WebSocket接続・受信処理
var AXIS_WS;
var AXIS_ConnectedDate = new Date();
export function AXIS() {
  if (!config.Source.axis.GetData) return;
  Connect_AXIS();
}
function TryConnect_AXIS() {
  var timeoutTmp = Math.max(30000 - (new Date() - AXIS_ConnectedDate), 100);
  setTimeout(Connect_AXIS, timeoutTmp);
}
function Connect_AXIS() {
  if (!config.Source.axis.GetData) return;
  try {
    if (AXIS_WS) {
      AXIS_WS.onclose = null;
      AXIS_WS.close();
    }
    AXIS_WS = new WebSocket("wss://ws.axis.prioris.jp/socket", {
      headers: {
        Authorization: `Bearer ${config.Source.axis.AccessToken}`,
      },
    });

    AXIS_WS.onopen = function () {
      UpdateStatus("axis", "success");
      AXIS_ConnectedDate = new Date();
    };
    AXIS_WS.onerror = function () {
      UpdateStatus("axis", "Error");
    };
    AXIS_WS.onclose = function () {
      UpdateStatus("axis", "Disconnect");
      TryConnect_AXIS();
    };
    AXIS_WS.onmessage = function (event) {
      if (Replay !== 0) return;
      UpdateStatus("axis", "success");
      try {
        var dataStr = event.data;
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

              EarthquakeElm = data.message?.Body?.Earthquake?.[0];

              OriginTimeTmp = newDate2(EarthquakeElm?.OriginTime);
              if (!OriginTimeTmp) OriginTimeTmp = new Date(data.message?.Head?.TargetDateTime);

              IntensityElm = data.message?.Body?.Intensity;

              MargeEQInfo([{
                status: data.message?.Control?.Status,
                eventId: data.message?.Head?.EventID,
                category: data.message?.Head?.Title,
                reportDateTime: newDate2(data.message?.Head?.ReportDateTime),
                OriginTime: OriginTimeTmp,
                epiCenter: EarthquakeElm?.Hypocenter?.Area?.Name,
                M: Number(EarthquakeElm?.Magnitude?.[0]?.valueOf_) || null,
                maxI: NormalizeShindo(IntensityElm?.Observation?.MaxInt),
                cancel: data.message?.Head?.InfoType == "取消",
                DetailURL: [],
                headline: data.message?.Head?.Headline?.Text,
                axisData: data,
              }]);
              break;
          }
        }
      } catch {
        UpdateStatus("axis", "Error");
      }
    };
  } catch {
    UpdateStatus("axis", "Error");
    TryConnect_AXIS();
  }
}

//ProjectBS WebSocket接続・受信処理
export var ProjectBS_Connection = null;
var ProjectBS_Ping_Timer;
var ProjectBS_ConnectedDate = new Date();
export function ProjectBS() {
  if (!config.Source.ProjectBS.GetData) return;
  Connect_ProjectBS();
}
function TryConnect_ProjectBS() {
  var timeout = Math.max(30000 - (new Date() - ProjectBS_ConnectedDate), 100);
  setTimeout(Connect_ProjectBS, timeout);
}
function Connect_ProjectBS() {
  if (!config.Source.ProjectBS.GetData) return;
  try {
    if (ProjectBS_Connection) {
      ProjectBS_Connection.onclose = null;
      ProjectBS_Connection.close();
    }
    const ws = new WebSocket("wss://telegram-cf.projectbs.cn/jmaeewws/");
    ws.sendUTF = ws.send.bind(ws);
    ProjectBS_Connection = ws;
    ProjectBS_ConnectedDate = new Date();

    ws.onopen = function () {
      ws.send("queryjson");
      UpdateStatus("ProjectBS", "success");
      if (ProjectBS_Ping_Timer) {
        clearInterval(ProjectBS_Ping_Timer);
        ProjectBS_Ping_Timer = null;
      }
      ProjectBS_Ping_Timer = setInterval(function () {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 1200000);
    };
    ws.onerror = function () {
      UpdateStatus("ProjectBS", "Error");
    };
    ws.onclose = function () {
      UpdateStatus("ProjectBS", "Disconnect");
      TryConnect_ProjectBS();
      clearInterval(ProjectBS_Ping_Timer);
    };
    ws.onmessage = function (event) {
      if (Replay !== 0) return;
      UpdateStatus("ProjectBS", "success");
      try {
        var dataStr = event.data;
        if (dataStr !== "pong") DetectEEW(1, ParseJSON(dataStr));
      } catch {
        UpdateStatus("ProjectBS", "Error");
      }
    };
  } catch {
    UpdateStatus("ProjectBS", "Error");
    TryConnect_ProjectBS();
  }
}

//Wolfx WebSocket接続・受信処理
export var WolfxConnection = null;
var Wolfx_Timer;
var Wolfx_ConnectedDate = new Date();
export function WolfxWS() {
  if (!config.Source.wolfx.GetData) return;
  Connect_WolfxWS();
}
function TryConnect_WolfxWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Wolfx_ConnectedDate), 100);
  setTimeout(Connect_WolfxWS, timeoutTmp);
}
function Connect_WolfxWS() {
  if (!config.Source.wolfx.GetData) return;
  try {
    if (WolfxConnection) {
      WolfxConnection.onclose = null;
      WolfxConnection.close();
    }
    const ws = new WebSocket("wss://ws-api.wolfx.jp/all_eew");
    ws.sendUTF = ws.send.bind(ws);
    WolfxConnection = ws;
    Wolfx_ConnectedDate = new Date();

    ws.onopen = function () {
      ws.send("query_jmaeew");
      UpdateStatus("wolfx", "success");
      if (Wolfx_Timer) {
        clearInterval(Wolfx_Timer);
        Wolfx_Timer = null;
      }
      Wolfx_Timer = setInterval(function () {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 60000);
    };
    ws.onerror = function () {
      UpdateStatus("wolfx", "Error");
    };
    ws.onclose = function () {
      UpdateStatus("wolfx", "Disconnect");
      TryConnect_WolfxWS();
      clearInterval(Wolfx_Timer);
    };
    ws.onmessage = function (event) {
      if (Replay !== 0) return;
      UpdateStatus("wolfx", "success");
      try {
        var json = ParseJSON(event.data);
        if (json.type == "heartbeat") {
          ws.send("ping");
        } else if (json.type == "jma_eew") {
          DetectEEW(2, json);
        } else if (json.type == "jma_eqlist") {
          UpdateEQInfo();
        }
      } catch {
        UpdateStatus("wolfx", "Error");
      }
    };
  } catch {
    UpdateStatus("wolfx", "Error");
    TryConnect_WolfxWS();
  }
}

//Seisjs WebSocket接続・受信処理
