import { Boolean2 } from "./constants.js";

// アプリケーション全体で共有する状態
export var config = {};
export var defaultConfigVal = {};
export var store = null;
export var Replay = 0;
export var package_ver = "";
export var packageJson = null;
export var kmoniTimeTmp = {};
export var kmoniOffset = 2500;
export var JMA_CurrentInfoNumber = 20;
export var USGS_CurrentInfoNumber = 20;
export var EQ_FetchCount = 0;
export var update_data = null;

export function setConfig(val) { config = val; }
export function setDefaultConfigVal(val) { defaultConfigVal = val; }
export function setStore(val) { store = val; }
export function setReplay(val) { Replay = val; }
export function setPackageVer(val) { package_ver = val; }
export function setPackageJson(val) { packageJson = val; }
export function setKmoniOffset(val) { kmoniOffset = val; }
export function setUpdateData(val) { update_data = val; }
export function setJMAInfoNumber(val) { JMA_CurrentInfoNumber = val; }
export function setUSGSInfoNumber(val) { USGS_CurrentInfoNumber = val; }
export function incEQFetchCount() { EQ_FetchCount++; }

// ステータス変更リスナー（UIへの通知用）
let statusListener = null;
export function setStatusListener(fn) {
  statusListener = fn;
}

export function UpdateStatus(type, condition, timeStamp) {
  if (!timeStamp || !Boolean2(new Date(timeStamp))) {
    timeStamp = new Date(Date.now() - Replay);
  } else {
    timeStamp = new Date(timeStamp);
  }

  kmoniTimeTmp[type] = {
    type: type,
    timestamp: timeStamp,
    LocalTime: new Date(),
    condition: condition,
  };

  if (statusListener) {
    statusListener(type, condition, timeStamp);
  }
}

export function GeneralError_handler(err) {
  console.error(new Date().toLocaleString(), err);
}

var LastRunTime = 0;
var RunnningTimer;
export function IntervalRun(msec, func) {
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
