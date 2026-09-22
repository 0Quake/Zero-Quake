import electron from "electron";
const { powerSaveBlocker, Notification } = electron;
import path from "path";
import { fileURLToPath } from "url";
import * as turf from "@turf/turf";

import { calcInt, calc_arTime, getClosestNum, } from "./CALC_PSWave.js";
import { TTT_JMA2001, TTT_AK135, JMA_Int_Points, NormalizeShindo, NormalizeDate, Boolean2, EEWSect, EQIAreaLoc, newDate2 } from "./constants.js";
import { MainWindow, messageToMainWindow, PlayAudio, speak, CreateMainWindow } from "./windows.js";
import { MargeEQInfo } from "./PROC_EQInfo.js";
import { worker } from "./RX_RTSeis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

var psBlock;
export var EEW_Storage = []; //地震速報リスト
export var EEW_Active = []; //現在発報中リスト
export var EarlyEst_Data = []; //Earlyest地震速報リスト

export function clearEEWActive() {
  EEW_Active = [];
}

export function resetEEWStorage() {
  EEW_Storage = [];
}

export function resetEarlyEstData() {
  EarlyEst_Data = [];
}

let eewCtx = {
  getConfig: () => ({}),
  getReplay: () => 0,
  getKmoniTimeTmp: () => ({}),
  UpdateStatus: () => { },
};

export function initEEWContext(ctx) {
  eewCtx = Object.assign(eewCtx, ctx);
}

const UpdateStatus = (...args) => eewCtx.UpdateStatus(...args);

export function DetectEEW(type, json) {
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
            var sectName = EEWSect[EBIStr[i]];
            var maxInt = EBIStr[i + 1].substring(1, 3);
            var minInt = EBIStr[i + 1].substring(3, 5);
            minInt = minInt == "//" ? null : NormalizeShindo(minInt);
            maxInt = maxInt == "//" ? null : NormalizeShindo(maxInt);
            var arrivalTime = EBIStr[i + 2];
            arrivalTime = `${arrivalTime.substring(0, 2)}:${arrivalTime.substring(2, 4)}:${arrivalTime.substring(4, 6)}`;
            arrivalTime = new Date(`${NormalizeDate(4)} ${arrivalTime}`);

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
        EventID: Number(json.eventID) || null,
        serial: json.serial,
        report_time: newDate2(json.issue?.time),
        magnitude: json.hypocenter?.magnitude,
        maxInt: NormalizeShindo(json.maxIntensity, 0),
        depth: json.hypocenter?.location?.depth,
        is_cancel: json.isCancel,
        is_final: json.isFinal,
        is_training: codeData[2] == "01" || codeData[2] == "30",
        latitude: json.hypocenter?.location?.lat,
        longitude: json.hypocenter?.location?.lng,
        region_name: json.hypocenter?.name,
        origin_time: new Date(json.originTime),
        isPlum: json.hypocenter?.isEstimate,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "ProjectBS",
      };
      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("ProjectBS", "Error");
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
            var sectName = EEWSect[EBIStr[i]];
            var maxInt = EBIStr[i + 1].substring(1, 3);
            var minInt = EBIStr[i + 1].substring(3, 5);
            minInt = minInt == "//" ? null : minInt;
            maxInt = maxInt == "//" ? null : maxInt;
            if (maxInt == 99) maxInt = minInt;
            var arrivalTime = EBIStr[i + 2];
            arrivalTime = `${arrivalTime.substring(0, 2)}:${arrivalTime.substring(2, 4)}:${arrivalTime.substring(4, 6)}`;
            arrivalTime = new Date(`${NormalizeDate(4)} ${arrivalTime}`);

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
        EventID: Number(json.EventID) || null,
        serial: json.Serial,
        report_time: newDate2(json.AnnouncedTime),
        magnitude: json.Magnitude,
        maxInt: NormalizeShindo(json.MaxIntensity, 0),
        depth: json.Depth,
        is_cancel: json.isCancel,
        is_final: json.isFinal,
        is_training: json.isTraining,
        latitude: json.Latitude,
        longitude: json.Longitude,
        region_name: json.Hypocenter,
        origin_time: newDate2(json.OriginTime),
        isPlum: json.isAssumption,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "wolfx",
      };

      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("wolfx", "Error");
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
          IntTo: NormalizeShindo(elm.Intensity?.To),
          IntFrom: NormalizeShindo(elm.Intensity?.From),
          ArrivalTime: null,
          Arrived: null,
        });
      });
      var EEWdata = {
        alertflg: alertflgTmp,
        EventID: Number(json.EventID) || null,
        serial: json.Serial,
        report_time: newDate2(json.ReportDateTime) || null,
        magnitude: Number(json.Magnitude) || null,
        maxInt: NormalizeShindo(json.Intensity),
        depth: Number(String(json.Hypocenter?.Depth).replace("km", "")),
        is_cancel: json.Flag?.is_cancel,
        is_final: json.Flag?.is_final,
        is_training: json.Flag?.is_training,
        latitude: json.Hypocenter?.Coordinate?.[1],
        longitude: json.Hypocenter?.Coordinate?.[0],
        region_name: json.Hypocenter?.Name,
        origin_time: newDate2(json.OriginDateTime),
        isPlum: null,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "axis",
      };
      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("axis", "Error");
    }
  } else if (type == 4) {
    //P2P
    try {
      var scaleTo_arr = json.areas.map((p) => p.scaleTo);
      var maxIntTmp = Math.floor(Math.max(...scaleTo_arr));

      var latitudeTmp;
      var longitudeTmp;
      var depthTmp;
      var magnitudeTmp;
      var region_nameTmp;
      var origin_timeTmp;
      var conditionTmp = false;

      latitudeTmp = json.earthquake?.hypocenter?.latitude;
      longitudeTmp = json.earthquake?.hypocenter?.longitude;
      depthTmp = json.earthquake?.hypocenter?.depth;
      magnitudeTmp = json.earthquake?.hypocenter?.magnitude;
      region_nameTmp = json.earthquake?.hypocenter?.name;
      origin_timeTmp = newDate2(json.earthquake?.originTime);
      conditionTmp = json.earthquake?.condition == "仮定震源要素";

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
        EventID: Number(json.issue?.eventId) || null,
        serial: Number(json.issue?.serial) || 1,
        report_time: newDate2(json.issue?.time),
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

      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("P2P_EEW", "Error");
    }
  }
}


export function EEW_Marge(data) {
  const config = eewCtx.getConfig();
  const Replay = eewCtx.getReplay();
  if (!data) return; //データがない場合、処理終了
  try {
    if (!config.Info.EEW.showtraining && data.is_training) return; //訓練法を受信するかどうか（設定に準拠）
    if (!config.Info.EEW.kodoriyou && data.alertflg == "予報") return; //高度利用者向けを受信するかどうか（設定に準拠）
    if (!data.origin_time || !data.EventID || !data.serial || !data.latitude || !data.longitude) return;//不正データをはねる

    //５分以上前の地震／未来の地震（リプレイ時）を除外 ただし既に表示中の地震の更新報は通す
    var pastTime = new Date() - Replay - data.origin_time;
    var showing = Boolean(EEW_Active.find((elm) => elm.EventID == data.EventID));
    if (!showing && (pastTime > 300000 || pastTime < 0)) return;

    if (data.source == "simulation") {
      var EEWActive = EEW_Active.find((e) => e.source !== "simulation");
      if (EEWActive) return;//通常報発報中ならシミュレーション開始拒否
    } else {
      //通常報受信時にシミュレーションをクリアー
      EEW_Active.forEach(function (elm) {
        if (elm.source == "simulation") EEW_Clear(elm.EventID);
      });
    }

    //現在地との距離

    data.distance = turf.distance([data.longitude, data.latitude], [config.home.longitude, config.home.latitude])
    data.TimeTable = {
      p: TTT_JMA2001.p[getClosestNum(data.depth, Object.keys(TTT_JMA2001.p))],
      s: TTT_JMA2001.s[getClosestNum(data.depth, Object.keys(TTT_JMA2001.s))]
    }
    data.TimeTable2 = {
      p: TTT_AK135.p[getClosestNum(data.depth, Object.keys(TTT_AK135.p))],
      s: TTT_AK135.s[getClosestNum(data.depth, Object.keys(TTT_AK135.s))]
    }


    //シミュレーション機能における仮想地震限定の地震動予測
    if (data.source == "simulation" && !data.isPlum && !data.is_cancel) {
      //このif内はシミュレーション機能においてのみ有効。実地震で行うと気象業務法違反のおそれあり。
      //登録地点の震度予測
      if (!data.userIntensity && data.depth <= 150) {
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
      }

      if (!data.arrivalTime) {//JMA2001走時表での到達時刻予想
        var res = calc_arTime(data.distance, data.TimeTable)
        if (res) data.arrivalTime = new Date(Number(data.origin_time) + res * 1000)
      }

      if (!data.arrivalTime) {//AK135走時表での到達時刻予想
        var res = calc_arTime(data.distance, data.TimeTable2)
        if (res) data.arrivalTime = new Date(Number(data.origin_time) + res * 1000)
      }

      //全国の震度予測      
      var estIntTmp = {};
      if (data.depth <= 150) {
        var maxShindo = 0;
        var sects = Object.keys(EQIAreaLoc);
        JMA_Int_Points.forEach(function (elm) {
          if (elm.a && elm.s) {
            var sect = sects[elm.s];
            if (!sect) return;

            var estInt = calcInt(
              data.magnitude,
              data.depth,
              data.latitude,
              data.longitude,
              elm.y,
              elm.x,
              elm.a,
              config.Info.EEW.IntType == "max"
            );
            if (maxShindo < estInt) {
              maxShindo = estInt;
            }
            if (!estIntTmp[sect] || estInt > estIntTmp[sect]) {
              estIntTmp[sect] = estInt;
            }
          }
        });

        //最大震度の設定（必要なら）
        if (NormalizeShindo(data.maxInt, 4) === null) {
          data.maxInt = NormalizeShindo(maxShindo);
        }


        Object.keys(estIntTmp).forEach(function (key) {
          var shindo = NormalizeShindo(estIntTmp[key]);
          var SameZone;
          if (data.warnZones) {
            var SameZone = data.warnZones.find((elm) => elm.Name == key);
          } else {
            data.warnZones = [];
          }
          if (!SameZone) {
            data.warnZones.push({
              Name: key,
              IntTo: shindo, //レンダラープロセス側で下限・上限を選択するが、シミュレーションでは計算時点で設定を反映済みのため同値を代入
              IntFrom: shindo,
              Alert: Number(NormalizeShindo(shindo, 5)) >= 5,
            });
          }
        });
      }
    }

    //現在地の予想震度・到達予想時刻を設定
    if (Array.isArray(data.warnZones)) {
      //設定された細分区域のデータ参照
      var SameZone = data.warnZones.find(function (elm2) {
        return elm2.Name == config.home.Section;
      });

      if (SameZone) {
        var EstInt = (config.Info.EEW.IntType == "max") ? SameZone.IntTo : SameZone.IntFrom;
        if (!data.userIntensity) data.userIntensity = EstInt;
        if (SameZone.ArrivalTime) data.arrivalTime = SameZone.ArrivalTime;
      }
    }

    var SameEEW = EEW_Storage.find((elm) => elm.EventID == data.EventID);
    if (SameEEW) {//同一地震のデータが既に存在する場合

      var SameReport = SameEEW.data.find((elm) => elm.serial == data.serial);
      if (SameReport) {//同じ報数の情報が既に存在する（マージ処理へ）

        var MaxSerial = Math.max(...SameEEW.data.map((o) => o.serial));
        if (data.serial == MaxSerial) {//最新報である場合

          var changed = false;
          //マージ元のデータ
          var CurrentData = SameEEW.data.find((elm) => elm.serial == data.serial);

          //キーごとにマージ（同一報のためBool値も「Falsyでない場合のみ上書きする」方法でマージ）
          Object.keys(CurrentData).forEach(function (key) {
            if (key == "warnZones") return;//warnZonesは後で別処理
            if (data[key] && (!Array.isArray(data[key]) || data[key].length > 0)) {
              CurrentData[key] = data[key];
              changed = true;
            }
          });

          //warnZonesをマージ
          if (Array.isArray(data.warnZones) && Array.isArray(CurrentData.warnZones)) {
            data.warnZones.forEach(function (zone) {
              //一致する細分区域のデータを検索
              var SameZone = CurrentData.warnZones.find((el) => el.Name == zone.Name);
              if (SameZone) {
                Object.keys(zone).forEach((key) => {
                  if (zone[key]) {
                    SameZone[key] = zone[key];
                    changed = true;
                  }
                });
              } else {
                CurrentData.warnZones.push({ ...zone });
                changed = true;
              }
            });
          }
          //データに変化があれば、警報処理へ
          if (changed) EEW_Alert(CurrentData, true);
        }
      } else {
        //同じ報数の情報がない場合（データ登録）
        var MaxSerial = Math.max(...SameEEW.data.map((o) => o.serial));
        if (data.serial > MaxSerial) {
          //最新の報である
          SameEEW.data.push(data);//データ追加
          if (data.is_cancel) SameEEW.cancelled = true;
          EEW_Alert(data); //警報処理
        }
      }
    } else {
      //第１報

      //データ追加
      EEW_Storage.push({
        EventID: data.EventID,
        cancelled: false,
        simulation: data.source == "simulation",
        data: [data],
      });

      EEW_Alert(data); //警報処理
    }
  } catch (err) {
    throw new Error("緊急地震速報データの処理（マージ）に失敗しました。", { cause: err });
  }
}


export function EarlyEst_Marge(data) {
  const config = eewCtx.getConfig();
  const Replay = eewCtx.getReplay();
  try {
    if (!data) return;
    if (!data.origin_time || !data.latitude || !data.longitude) return;

    var pastTime = new Date() - Replay - data.origin_time;
    if (pastTime > 300000 || pastTime < 0) return;

    data.distance = turf.distance([data.longitude, data.latitude], [config.home.longitude, config.home.latitude]);

    data.TimeTable = {
      p: TTT_JMA2001.p[getClosestNum(data.depth, Object.keys(TTT_JMA2001.p))],
      s: TTT_JMA2001.s[getClosestNum(data.depth, Object.keys(TTT_JMA2001.s))]
    }
    data.TimeTable2 = {
      p: TTT_AK135.p[getClosestNum(data.depth, Object.keys(TTT_AK135.p))],
      s: TTT_AK135.s[getClosestNum(data.depth, Object.keys(TTT_AK135.s))]
    }

    var SameEEW = EarlyEst_Data.find((elm) => elm.EventID == data.EventID);
    if (SameEEW) {
      //ID・報の両方一致した情報が存在するか
      var SameReport = SameEEW.data.find((elm) => elm.serial == data.serial);
      if (!SameReport) {
        //最新の報かどうか
        var MaxSerial = Math.max(...SameEEW.data.map((o) => o.serial));
        if (data.serial > MaxSerial) {
          //第２報以降
          EarlyEst_Alert(data, false);
          SameEEW.data.push(data);
          if (data.is_cancel) {
            SameEEW.cancelled = true;
          }
        }
      }
    } else {
      //第１報
      EarlyEst_Alert(data, true);
      EarlyEst_Data.push({
        EventID: data.EventID,
        cancelled: false,
        data: [data],
      });
    }
  } catch (err) {
    throw new Error("Early-Est データの処理（マージ）に失敗しました。", { cause: err });
  }
}

//EEW解除処理
export function EEW_Clear(EventID) {
  try {
    //EEWデータ削除
    EEW_Active = EEW_Active.filter((elm) => elm.EventID !== EventID);

    messageToMainWindow({ action: "EEW_AlertUpdate", data: EEW_Active });

    if (EEW_Active.length == 0) {
      //パワーセーブ再開
      if (psBlock && powerSaveBlocker.isStarted(psBlock)) {
        powerSaveBlocker.stop(psBlock);
      }
      worker?.postMessage({ action: "EEWNow", data: true });
    }
  } catch (err) {
    throw new Error("緊急地震速報の解除処理でエラーが発生しました。", { cause: err });
  }
}

//EEW通知（音声・画面表示等）
export function EEW_Alert(data, update) {
  const config = eewCtx.getConfig();
  try {
    worker?.postMessage({ action: "EEWNow", data: true });

    //通知条件の判定
    var show_alert = false;
    if (NormalizeShindo(data.maxInt) == "?") {
      if (config.Info.EEW.IntQuestion) {//予想震度不明を無視するか（設定に準拠）
        show_alert = true;
      }
    } else if (NormalizeShindo(config.Info.EEW.IntThreshold, 5) <= NormalizeShindo(data.maxInt, 5)) {
      show_alert = true//予想最大震度通知条件（設定に準拠）
    }

    if (NormalizeShindo(data.userIntensity) == "?") {
      if (config.Info.EEW.userIntQuestion) {//予想震度不明を無視するか（設定に準拠）
        show_alert = true;
      }
    } else if (NormalizeShindo(config.Info.EEW.userIntThreshold, 5) <= NormalizeShindo(data.userIntensity, 5)) {
      show_alert = true; //予想震度（細分区域）通知条件（設定に準拠）
    }

    var SameEEW = EEW_Storage.find((elm) => elm.EventID == data.EventID);
    var first = !SameEEW || !SameEEW.isNotified;
    var PrevData;
    if (SameEEW) {
      SameEEW.isNotified = true;
      PrevData = SameEEW.data
        .filter((e) => e.serial < data.serial)//本データより古く
        .sort((a, b) => b.serial - a.serial)[0]//降順[0]でserial最大
    }

    var old_i = PrevData ? NormalizeShindo(PrevData.maxInt, 5) : -9;
    var new_i = NormalizeShindo(data.maxInt, 5);
    var int_increased = new_i > old_i || !Boolean2(new_i) || !Boolean2(old_i);

    if (!update && show_alert && (int_increased || !config.Info.EEW.IntTerm1)) {
      //同一報の更新時でなく、条件に合致
      PlayAudio((data.alertflg == "警報") ? "EEW1" : "EEW2");
      speak(GenerateEEWText(data, !first));

      var notice_setting = first ? config.notice.window.EEW : config.notice.window.EEW_Update;
      var WindowInvisible = !MainWindow || MainWindow.isMinimized() || !MainWindow.isFocused() || !MainWindow.isVisible();
      if (notice_setting == "push" && WindowInvisible) {
        var EEWNotification = new Notification({
          title: `${data.is_training ? "【訓練報】 " : ""}緊急地震速報 ${data.alertflg} #${data.serial}`,
          body: `${data.region_name}\n予想最大震度：${NormalizeShindo(data.maxInt, 1)} ／ M${data.magnitude ? data.magnitude : "不明"} ／ 深さ：${data.depth ? `${data.depth}km` : "不明"}${data.userIntensity ? `\n現在地の予想震度：${NormalizeShindo(data.userIntensity, 1)}` : ""}`,
          icon: path.join(__dirname, "../img/icon.ico"),
        });
        EEWNotification.show();
        EEWNotification.on("click", CreateMainWindow);
      } else if (notice_setting == "openWindow") {
        CreateMainWindow();
      }
    }

    //【現在のEEW】から同一地震、古い報を取得・削除
    EEW_Active = EEW_Active.filter(function (elm) {
      return elm.EventID !== data.EventID;
    });

    //【現在のEEW】配列に追加
    EEW_Active.push(data);

    messageToMainWindow({
      action: "EEW_AlertUpdate",
      data: EEW_Active,
      update: update,
    });


    MargeEQInfo([{
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
    }], 999);

    //スリープ回避開始
    if (show_alert) {
      if (config.system.powerSaveBlocking && (!psBlock || !powerSaveBlocker.isStarted(psBlock))) {
        psBlock = powerSaveBlocker.start("prevent-display-sleep");
      }
    }
  } catch (err) {
    throw new Error("緊急地震速報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//EarlyEst通知（音声・画面表示等）
export function EarlyEst_Alert(data, first) {
  try {
    //【現在のEEW】から同一地震、古い報を削除
    EEW_Active = EEW_Active.filter(function (elm) {
      return elm.EventID !== data.EventID;
    });
    //【現在のEEW】配列に追加
    EEW_Active.push(data);

    if (first) {
      CreateMainWindow();
      PlayAudio("EEW2");
    }
    messageToMainWindow({
      action: "EEW_AlertUpdate",
      data: EEW_Active,
    });
    if (!MainWindow) {
      var EEWNotification = new Notification({
        title: `Early-Est 地震情報 #${data.serial}`,
        body: `${data.region_name}\n M${data.magnitude}  深さ：${data.depth}km`,
        icon: path.join(__dirname, "../img/icon.ico"),
      });
      EEWNotification.show();
      EEWNotification.on("click", function () {
        CreateMainWindow();
      });
    }

  } catch (err) {
    throw new Error("Early-Est地震情報の通知処理でエラーが発生しました。", { cause: err });
  }
}


export function GenerateEEWText(EEWData, update) {
  const config = eewCtx.getConfig();
  try {
    if (EEWData.is_cancel) var text = config.notice.voice.EEWCancel;
    else if (update) var text = config.notice.voice.EEWUpdate;
    else var text = config.notice.voice.EEW;

    text = text.replaceAll("{grade}", EEWData.alertflg || "");
    text = text.replaceAll("{serial}", EEWData.serial || "");
    text = text.replaceAll("{final}", EEWData.is_final ? "最終報" : "");
    text = text.replaceAll("{location}", config.home.name ? config.home.name : "現在地");
    text = text.replaceAll("{magnitude}", Boolean2(EEWData.magnitude) ? EEWData.magnitude : "");
    text = text.replaceAll("{maxInt}", Boolean2(EEWData.maxInt) ? NormalizeShindo(EEWData.maxInt, 1) : "");
    text = text.replaceAll("{depth}", Boolean2(EEWData.depth) ? EEWData.depth : "");
    text = text.replaceAll("{training}", EEWData.is_training ? "訓練報。" : "");
    text = text.replaceAll("{training2}", EEWData.is_training ? "これは訓練報です。" : "");
    text = text.replaceAll("{region_name}", EEWData.region_name || "");
    text = text.replaceAll("{report_time}", EEWData.report_time ? NormalizeDate(8, EEWData.report_time) : "");
    text = text.replaceAll("{origin_time}", EEWData.origin_time ? NormalizeDate(8, EEWData.origin_time) : "");
    if (EEWData.source == "simulation") text = `シミュレーションです。${text}`;

    var userInt;
    if (EEWData.userIntensity) {
      userInt = EEWData.userIntensity;
    } else if (Array.isArray(EEWData.warnZones)) {
      var SameZone = EEWData.warnZones.find(function (elm2) {
        return elm2.Name == config.home.Section;
      });

      if (SameZone) userInt = config.Info.EEW.IntType == "max" ? SameZone.IntTo : SameZone.IntFrom;
    }

    text = text.replaceAll("{local_Int}", userInt ? NormalizeShindo(userInt, 1) : "不明");

    if (!Boolean2(userInt)) text = text.replace(/\[.*?\]/g, "");
    text = text.replace(/\[|\]/g, "");

    return text;
  } catch {
    return "";
  }
}
//津波情報時読み上げ文章 生成
