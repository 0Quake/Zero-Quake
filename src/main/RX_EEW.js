import WebSocket from "websocket";
const WebSocketClient = WebSocket.client;

import { DetectEEW } from "./PROC_EEW.js";
import { ParseJSON, newDate2, NormalizeShindo } from "./constants.js";
import { UpdateEQInfo } from "./RX_JMAXML.js";
import { ConvertTsunamiInfo } from "./PROC_Tsunami.js";
import { MargeEQInfo } from "./PROC_EQInfo.js";

let eewRxCtx = {
  getConfig: () => ({}),
  getReplay: () => 0,
  UpdateStatus: () => {},
};

export function initEEWRxContext(ctx) {
  eewRxCtx = Object.assign(eewRxCtx, ctx);
}

const UpdateStatus = (...args) => eewRxCtx.UpdateStatus(...args);

export var P2P_Client;
export function P2P() {
  const config = eewRxCtx.getConfig();
  const Replay = eewRxCtx.getReplay();
  P2P_Client = new WebSocketClient();
  P2P_Client.on("connectFailed", function () {
    UpdateStatus("P2P_EEW", "Error");
    TryConnect_P2P();
  });
  P2P_Client.on("connect", function (connection) {
    connection.on("error", function () {
      UpdateStatus("P2P_EEW", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("P2P_EEW", "Disconnect");
      TryConnect_P2P();
    });
    connection.on("message", function (message) {
      try {
        if (Replay == 0 && message.type === "utf8") {
          var data = JSON.parse(message.utf8Data);
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
    });
    UpdateStatus("P2P_EEW", "success");
    P2PReconnectTimeout = 500;
  });
  Connect_P2P();
}
export var P2PReconnectTimeout = 500;
export function TryConnect_P2P() {
  P2PReconnectTimeout = Math.min(30000, P2PReconnectTimeout * 2);
  setTimeout(Connect_P2P, P2PReconnectTimeout);
}
export function Connect_P2P() {
  if (P2P_Client) P2P_Client.connect("wss://api.p2pquake.net/v2/ws");
}

//AXIS WebSocket接続・受信処理
export var AXIS_Client;
export function AXIS() {
  const config = eewRxCtx.getConfig();
  const Replay = eewRxCtx.getReplay();
  if (!config.Source.axis.GetData) return;
  AXIS_Client = new WebSocketClient();

  AXIS_Client.on("connectFailed", function () {
    UpdateStatus("axis", "Error");
    TryConnect_AXIS();
  });

  AXIS_Client.on("connect", function (connection) {
    connection.on("error", function () {
      UpdateStatus("axis", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("axis", "Disconnect");
      TryConnect_AXIS();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("axis", "success");
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
    });
    UpdateStatus("axis", "success");
  });

  Connect_AXIS();
}
export var AXIS_ConnectedDate = new Date();
export function TryConnect_AXIS() {
  var timeoutTmp = Math.max(30000 - (new Date() - AXIS_ConnectedDate), 100);
  setTimeout(Connect_AXIS, timeoutTmp);
}
export function Connect_AXIS() {
  const config = eewRxCtx.getConfig();
  const Replay = eewRxCtx.getReplay();
  if (AXIS_Client)
    AXIS_Client.connect("wss://ws.axis.prioris.jp/socket", null, null, {
      Authorization: `Bearer ${config.Source.axis.AccessToken}`,
    });
  AXIS_ConnectedDate = new Date();
}

//ProjectBS WebSocket接続・受信処理
export var ProjectBS_Client;
export var ProjectBS_Connection;
export var ProjectBS_Ping_Timer;
export function ProjectBS() {
  const config = eewRxCtx.getConfig();
  const Replay = eewRxCtx.getReplay();
  if (!config.Source.ProjectBS.GetData) return;
  ProjectBS_Client = new WebSocketClient();

  ProjectBS_Client.on("connectFailed", function () {
    UpdateStatus("ProjectBS", "Error");
    TryConnect_ProjectBS();
  });

  ProjectBS_Client.on("connect", function (connection) {
    ProjectBS_Connection = connection;
    connection.on("error", function () {
      UpdateStatus("ProjectBS", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("ProjectBS", "Disconnect");
      TryConnect_ProjectBS();
      clearInterval(ProjectBS_Ping_Timer);
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("ProjectBS", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr !== "pong") DetectEEW(1, ParseJSON(dataStr));
      } catch {
        UpdateStatus("ProjectBS", "Error");
      }
    });
    connection.sendUTF("queryjson");

    UpdateStatus("ProjectBS", "success");
    if (ProjectBS_Ping_Timer) {
      clearInterval(ProjectBS_Ping_Timer);
      ProjectBS_Ping_Timer = null;
    }
    ProjectBS_Ping_Timer = setInterval(function () {
      connection.sendUTF("ping");
    }, 1200000);
  });

  Connect_ProjectBS();
}
export var ProjectBS_ConnectedDate = new Date();
export function TryConnect_ProjectBS() {
  var timeout = Math.max(30000 - (new Date() - ProjectBS_ConnectedDate), 100);
  setTimeout(Connect_ProjectBS, timeout);
}
export function Connect_ProjectBS() {
  if (ProjectBS_Client) ProjectBS_Client.connect("wss://telegram-cf.projectbs.cn/jmaeewws/");
  ProjectBS_ConnectedDate = new Date();
}

//Wolfx WebSocket接続・受信処理
export var WolfxWS_Client;
export var WolfxConnection;
export var Wolfx_Timer;
export function WolfxWS() {
  const config = eewRxCtx.getConfig();
  const Replay = eewRxCtx.getReplay();
  if (!config.Source.wolfx.GetData) return;
  WolfxWS_Client = new WebSocketClient();

  WolfxWS_Client.on("connectFailed", function () {
    UpdateStatus("wolfx", "Error");
    TryConnect_WolfxWS();
  });

  WolfxWS_Client.on("connect", function (connection) {
    WolfxConnection = connection;
    connection.on("error", function () {
      UpdateStatus("wolfx", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("wolfx", "Disconnect");
      TryConnect_WolfxWS();
      clearInterval(Wolfx_Timer)
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("wolfx", "success");
      try {
        var json = ParseJSON(message.utf8Data);
        if (json.type == "heartbeat") {
          connection.sendUTF("ping");
        } else if (json.type == "jma_eew") {
          DetectEEW(2, json);
        } else if (json.type == "jma_eqlist") {
          UpdateEQInfo();
        }
      } catch {
        UpdateStatus("wolfx", "Error");
      }
    });
    connection.sendUTF("query_jmaeew");
    UpdateStatus("wolfx", "success");

    if (Wolfx_Timer) {
      clearInterval(Wolfx_Timer)
      Wolfx_Timer = null;
    }
    Wolfx_Timer = setInterval(function () {
      connection.sendUTF("ping");
    }, 60000);
  });

  Connect_WolfxWS();
}
export var Wolfx_ConnectedDate = new Date();
export function TryConnect_WolfxWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Wolfx_ConnectedDate), 100);
  setTimeout(Connect_WolfxWS, timeoutTmp);
}
export function Connect_WolfxWS() {
  if (WolfxWS_Client) WolfxWS_Client.connect("wss://ws-api.wolfx.jp/all_eew");
  Wolfx_ConnectedDate = new Date();
}

//Seisjs WebSocket接続・受信処理
