import { NormalizeShindo, Boolean2, NormalizeDate } from "./constants.js";
import { messageToMainWindow, PlayAudio, speak, EQI_Window } from "./windows.js";
import { config, Replay, JMA_CurrentInfoNumber, USGS_CurrentInfoNumber } from "./state.js";
import { EEW_Storage } from "./PROC_EEW.js";

export var eqInfo = { jma: [], usgs: [] };

export var EQInfoData = {};
//地震情報マージ→AlertEQInfo
export function MargeEQInfo(dataList, count) {

  try {
    var eqInfoTmp = [];
    var UpdateEQInfoTmp = [];

    dataList.forEach(function (data) {
      if (!data.eventId) return;
      var changed = false;
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
        var rawData = EQElm.raw_data
          .sort((a, b) => a.reportDateTime < b.reportDateTime ? -1 : 1);

        //キャンセル報を受信時、同一カテゴリの過去情報のキャンセルフラグを立てる（気象庁仕様に準拠）
        rawData.forEach(function (elm, index) {
          if (elm.cancel) {
            for (var j = 0; j < index; j++) {
              if (rawData[j].category == elm.category) {
                rawData[j].cancel = true;
              }
            }
          }
        });
        rawData.forEach(function (elm) {
          if (!config.Info.EQInfo.showtraining && elm.status == "訓練") return;
          if (!config.Info.EQInfo.showTest && elm.status == "試験") return;
          if (Number(new Date(elm.reportDateTime)) > (Date.now() - Replay)) return;


          if (elm.category == "EEW" && EQElm.EEW === false) return;//EEW以外の情報が既に入っているとき、EEWによる情報を破棄
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

          EQInfo_Item.reportDateTime = elm.reportDateTime;
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

        //同イベント2報以降だがEEW以外の情報は初の場合音声通知する。そうでなければ残ってるフラグをfalseにもどす。
        EQElm.audioNotification = (EQElm.category == "EEW" && EQInfo_Item.category != "EEW")

        //キーごとにマージ
        Object.keys(EQInfo_Item).forEach(function (key) {
          if (!EQInfo_Item[key]) return;//新しい側の値がなかったら無視

          if (key == "reportDateTime") {//reportDateTimeは常に更新、フラグ立てない
            EQElm[key] = EQInfo_Item[key];
          } else if (key == "DetailURL") {//DetailURLは配列を結合
            if (Array.isArray(EQInfo_Item[key]) && Array.isArray(EQElm[key])) {//データ検証
              EQElm[key] = Array.from(new Set([...EQElm[key], ...EQInfo_Item[key]]));
              changed = true;//変更ありフラグ
            }
          } else if (key == "axisData") {
            if (!Array.isArray(EQElm[key])) EQElm[key] = [];
            EQInfo_Item[key].forEach(function (elm) {
              var uuid = elm.message.uuid_
              var exists = EQElm[key].find((el) => {
                return el.message?.uuid_ == uuid
              });
              if (!exists) EQElm[key].push(elm)
            })
          } else if (key == "audioNotification") {
            return;//前の部分で判定済みなので上書きしないよう飛ばす
          } else {
            if (EQElm[key] !== EQInfo_Item[key] && Boolean2(EQInfo_Item[key])) {
              EQElm[key] = EQInfo_Item[key];
              changed = true;//変更ありフラグ
            }
          }
        });

        if (changed) {
          UpdateEQInfoTmp.push(EQElm);
          var i = eqInfo.jma.findIndex((el) => el.eventId == EQElm.eventId);
          if (-1 < i) eqInfo.jma[i] = EQElm;
        }
      } else {
        data.EEW = data.category == "EEW"

        EQInfoData[data.eventId] = { ...data };//値渡しにする
        EQInfoData[data.eventId].raw_data = [{ ...data }];//値渡しにする

        eqInfoTmp.push(data);
        eqInfo.jma.push(data);
        var latest_reportDate = Math.max(...Object.keys(EQInfoData).map(function (key) { return Number(EQInfoData[key].reportDateTime) }));

        //当該イベントの初受信＆それが最新（reportDateが過去最大）なら音声通知する
        data.audioNotification = (count !== 0 && data.category !== "EEW" && Number(data.reportDateTime) == latest_reportDate)
      }
    });

    if (eqInfoTmp.length > 0) AlertEQInfo(eqInfoTmp, "jma", false);
    if (UpdateEQInfoTmp.length > 0) AlertEQInfo(UpdateEQInfoTmp, "jma", true);
  } catch (err) {
    throw new Error("地震情報データの処理（マージ）に失敗しました。", { cause: err });
  }
}


export var EQCount_data = {};
export function EQCount_process(data) {
  if (data) EQCount_data[data.eventId] = data
  var EQCount_data_array = Object.values(EQCount_data);

  EQCount_data_array = EQCount_data_array
    .sort((a, b) => Number(a.reportDateTime) - Number(b.reportDateTime))

  messageToMainWindow({
    action: "EQCount",
    source: "jma",
    data: EQCount_data_array,
  });
}

//時間(ms)を「～分[秒,分,時間,日]」の形にする
export function timeDifference(miliseconds) {
  if (isNaN(miliseconds) || miliseconds < 0) return null;

  var sec = Math.round(miliseconds / 1000);
  var min = Math.round(miliseconds / 60000);
  var hrs = Math.round(miliseconds / 3600000);
  var day = Math.round(miliseconds / 86400000)

  if (sec < 60) return { num: sec, unit: "秒" };
  if (min < 60) return { num: min, unit: "分" };
  if (hrs < 24) return { num: hrs, unit: "時間" };
  return { num: day, unit: "日" };
}

//地震情報通知（音声・画面表示等）
export function AlertEQInfo(data, source) {
  try {
    if (source == "jma") {

      //OriginTimeがないデータ用にソート専用時刻をつくる
      data.forEach(function (elm) {
        elm.DateForSort = elm.OriginTime ? elm.OriginTime : elm.reportDateTime;
      })

      //音声通知条件を満たす最新のデータ
      var dataToNotify = data
        .sort((a, b) => a.DateForSort > b.DateForSort ? -1 : 1)
        .find(function (elm) {
          return elm.audioNotification
        })

      //音声通知
      if (dataToNotify) {
        if (config.Info.EQInfo.NotificationSound &&
          (config.Info.EQInfo.Bypass_threshold || NormalizeShindo(config.Info.EQInfo.maxI_threshold, 5) <= NormalizeShindo(dataToNotify.maxI, 5) || config.Info.EQInfo.M_threshold <= dataToNotify.M)) {
          PlayAudio("EQInfo");
          speak(GenerateEQInfoText(dataToNotify));
        }
      }

      eqInfo.jma = eqInfo.jma
        .sort((a, b) => a.DateForSort > b.DateForSort ? -1 : 1);

      messageToMainWindow({
        action: "EQInfo",
        source: "jma",
        data: eqInfo.jma.slice(0, JMA_CurrentInfoNumber),
      });

      //現在開いている地震情報ウィンドウにデータ送信
      data.forEach(function (elm) {
        if (EQI_Window[elm.eventId]) {
          var metadata = EQI_Window[elm.eventId].metadata;
          var EEWDataItem = EEW_Storage.find(function (elm2) {
            return elm2.EventID == elm.eventId;
          });

          metadata.urls = elm.DetailURL;
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
        data: eqInfo.usgs.slice(0, USGS_CurrentInfoNumber),
      });
    }
  } catch (err) {
    throw new Error("地震情報の通知処理でエラーが発生しました。", { cause: err });
  }
}


export function GenerateEQInfoText(EQData) {
  try {
    if (EQData.category == "EEW") return ""; //EEWは専用の読み上げシステムに任せる
    if (!EQData.epiCenter && !EQData.maxI) return; //震度も震源もわからない（壊れたデータ）をはねる

    if (EQData.cancel) var text = config.notice.voice.EQInfoCancel;
    else var text = config.notice.voice.EQInfo;

    var category = EQData.category;
    if (category == "Tsunami") category = "津波情報に付帯する地震情報";

    var dif = timeDifference(new Date() - new Date(EQData.OriginTime));
    text = text.replaceAll("{category}", category || "");
    text = text.replaceAll("{training}", EQData.status == "訓練" ? "訓練報。" : "");
    text = text.replaceAll("{training2}", EQData.status == "訓練" ? "これは訓練報です。" : "");
    text = text.replaceAll("{report_time}", EQData.reportDateTime ? NormalizeDate(9, EQData.reportDateTime) : "");
    text = text.replaceAll("{origin_time}", EQData.OriginTime ? NormalizeDate(9, EQData.OriginTime) : "");
    text = text.replaceAll("{origin_time2}", (EQData.OriginTime && dif) ? `${dif.num}${dif.unit}前` : "先ほど");
    text = text.replaceAll("{region_name}", EQData.epiCenter || "");
    text = text.replaceAll("{magnitude}", EQData.M || "");
    text = text.replaceAll("{maxInt}", EQData.maxI ? NormalizeShindo(EQData.maxI, 1) : "");
    text = text.replaceAll("{headline}", EQData.headline || "");

    if (!EQData.epiCenter) text = text.replace(/\[.*?\]/g, "");
    if (!EQData.maxI) text = text.replace(/<.*?>/g, "");
    text = text.replace(/\[|\]|<|>/g, "");

    return text;
  } catch {
    return "";
  }
}
//津波情報時読み上げ文章 生成
