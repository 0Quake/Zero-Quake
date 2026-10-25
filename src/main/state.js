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

// アプリケーション全体で共有する状態オブジェクト（セッター不要で直接プロパティ代入可能）
export const state = {
  get config() { return config; },
  set config(val) { config = val; },
  get defaultConfigVal() { return defaultConfigVal; },
  set defaultConfigVal(val) { defaultConfigVal = val; },
  get store() { return store; },
  set store(val) { store = val; },
  get Replay() { return Replay; },
  set Replay(val) { Replay = val; },
  get package_ver() { return package_ver; },
  set package_ver(val) { package_ver = val; },
  get packageJson() { return packageJson; },
  set packageJson(val) { packageJson = val; },
  get kmoniOffset() { return kmoniOffset; },
  set kmoniOffset(val) { kmoniOffset = val; },
  get JMA_CurrentInfoNumber() { return JMA_CurrentInfoNumber; },
  set JMA_CurrentInfoNumber(val) { JMA_CurrentInfoNumber = val; },
  get USGS_CurrentInfoNumber() { return USGS_CurrentInfoNumber; },
  set USGS_CurrentInfoNumber(val) { USGS_CurrentInfoNumber = val; },
  get EQ_FetchCount() { return EQ_FetchCount; },
  set EQ_FetchCount(val) { EQ_FetchCount = val; },
  get kmoniTimeTmp() { return kmoniTimeTmp; },
  set kmoniTimeTmp(val) { kmoniTimeTmp = val; },
};

// 後方互換用セッター（既存テスト・移行コード用）
export function setConfig(val) { state.config = val; }
export function setDefaultConfigVal(val) { state.defaultConfigVal = val; }
export function setStore(val) { state.store = val; }
export function setReplay(val) { state.Replay = val; }
export function setPackageVer(val) { state.package_ver = val; }
export function setPackageJson(val) { state.packageJson = val; }
export function setKmoniOffset(val) { state.kmoniOffset = val; }
export function setJMAInfoNumber(val) { state.JMA_CurrentInfoNumber = val; }
export function setUSGSInfoNumber(val) { state.USGS_CurrentInfoNumber = val; }
export function incEQFetchCount() { state.EQ_FetchCount++; }

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
