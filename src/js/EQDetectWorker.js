const workerThreads = require("worker_threads");

var EEWNow = false; //EEW発令中かどうか
var EQDetectID = 0; //独自の地震ID
var EQDetect_List = []; //地震アイテムのリスト
var pointsData = {}; //毎秒クリアされない、観測点のデータ

var thresholds = {
  historyCount: 10, //比較する件数
  threshold01: 5, //検出とする観測点数
  threshold01C: 5, //検出とする観測点数【都会】
  threshold02: null, //1次フラグ条件のPGA増加量[gal]
  threshold03: null, //2次フラグ条件のPGA増加量[gal]
  threshold04: 3, //1次フラグ条件の震度
  MargeRange: 30, //地震の同定範囲[km]
  MargeRangeC: 20, //地震の同定範囲[km]【都会】
  time00: 300000, //最初の検出~解除[ms](優先)
  time01: 10000, //最後の検出~解除[ms]
};

var Replay = 0;

workerThreads.parentPort.postMessage({
  action: "thresholds",
  data: thresholds,
});

workerThreads.parentPort.on("message", (message) => {
  if (message.action == "EQDetect") {
    //観測点ごとのデータを毎秒受信
    EQDetect(message.data, message.date, message.detect);
  } else if (message.action == "EEWNow") {
    EEWNow = message.data;
  } else if (message.action == "Replay") {
    Replay = message.data;
    pointsData = {};
  }
});

function EQDetect(data, date, detect) {
  var changedData = [];

  if (!EEWNow) {
    var ptDataTmp;

    var detect0;
    var pgaAvr;
    for (const elm of data) {
      //ポイントごとの処理

      ptDataTmp = pointsData[elm.Code];
      if (!ptDataTmp) {
        //都会かどうか
        var isCity = elm.Region == "東京都" || elm.Region == "千葉県" || elm.Region == "埼玉県" || elm.Region == "神奈川県";
        ptDataTmp = pointsData[elm.Code] = { detectCount: 0, SUMTmp: [elm.pga], Event: false, isCity: isCity, UpCount: 0 };
      }

      if (elm.data) {
        if (detect) {
          //PGAの10回平均を求める
          pgaAvr =
            ptDataTmp.SUMTmp.reduce(function (a, b) {
              return a + b;
            }) / ptDataTmp.SUMTmp.length;

          //平均PGAから閾値を決定
          thresholds.threshold02 = 0.7 * pgaAvr + 0.08;
          thresholds.threshold03 = 0.8 * pgaAvr + 0.5;
          if (ptDataTmp.isCity) {
            //都会では閾値を大きく
            thresholds.threshold02 *= 2;
            thresholds.threshold03 *= 2;
          }

          detect0 = elm.pga - pgaAvr >= thresholds.threshold02 || elm.shindo >= thresholds.threshold04; //PGA増加量・震度絶対値で評価
          elm.detect = detect0 && ptDataTmp.detectCount > 0; //elm.detectに加え、detectCountを加えて評価
          elm.detect2 = elm.detect && ((elm.pga - pgaAvr >= thresholds.threshold03 && ptDataTmp.UpCount > 0) || elm.shindo > thresholds.threshold04);

          //連続上昇回数（変化なし含む）
          if (elm.pga - ptDataTmp.SUMTmp[ptDataTmp.SUMTmp.length - 1] >= 0) {
            ptDataTmp.UpCount++;
          } else {
            ptDataTmp.UpCount = 0;
          }
          //連続検出回数（elm.detectは連続検出回数を指標に含むため、detect0で判定）
          if (detect0) {
            ptDataTmp.detectCount++;
          } else {
            ptDataTmp.detectCount = 0;
          }
        }

        //前回からの変化の有無（描画時の負荷軽減のため）
        elm.changed = elm.pga != ptDataTmp.SUMTmp[ptDataTmp.SUMTmp.length - 1];

        //PGA平均を求めるためのデータ追加
        ptDataTmp.SUMTmp = ptDataTmp.SUMTmp.slice(0, thresholds.historyCount - 1);
        ptDataTmp.SUMTmp.push(elm.pga);
      }

      if (!elm.detect && ptDataTmp.Event) {
        //検出中ではない場合、地震アイテムから観測点データを削除
        ptDataTmp.Event = false;
        for (const elm2 of EQDetect_List) {
          elm2.Codes = elm2.Codes.filter(function (elm3) {
            return elm3.Code !== elm.Code;
          });
        }
      }
      if (elm.changed) changedData.push(elm);
    }

    var MargeRangeTmp;
    var threshold01Tmp;
    //単独点の検知情報をグルーピング
    if (detect) {
      for (const elm of data) {
        if (elm.detect) {
          var ptDataTmp = pointsData[elm.Code];

          if (!ptDataTmp.Event) {
            //すでに自観測点が地震アイテムに属していない場合
            //都会かどうかで閾値調整
            MargeRangeTmp = ptDataTmp.isCity ? thresholds.MargeRangeC : thresholds.MargeRange;

            //自観測点が地震アイテムの半径+閾値の範囲内に入っている地震アイテムを探す
            var EQD_ItemTmp = EQDetect_List.find(function (elm2) {
              return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm2.lat, elm2.lng) - elm2.Radius <= MargeRangeTmp;
            });
            if (EQD_ItemTmp) {
              //EQD_ItemTmpに属する観測点から、自観測点からの距離が閾値以下の観測点があるか確認
              var CodesTmp = EQD_ItemTmp.Codes.find(function (elm3) {
                return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm3.Location.Latitude, elm3.Location.Longitude) <= MargeRangeTmp;
              });

              if (CodesTmp) {
                //地震アイテムに自観測点を追加
                EQD_ItemTmp.Codes.push(elm);
                ptDataTmp.Event = true;
                //地震アイテムの「半径」を更新
                var radiusTmp = geosailing(elm.Location.Latitude, elm.Location.Longitude, EQD_ItemTmp.lat, EQD_ItemTmp.lng);
                if (EQD_ItemTmp.Radius < radiusTmp) EQD_ItemTmp.Radius = radiusTmp;
              }
            }
          }

          if (EQD_ItemTmp) {
            //最終検知時間（解除時に使用）を更新
            EQD_ItemTmp.last_Detect = new Date() - Replay;

            threshold01Tmp = EQD_ItemTmp.isCity ? thresholds.threshold01C : thresholds.threshold01;

            if (EQD_ItemTmp.Codes.length >= threshold01Tmp) {
              //地震アイテムに属する観測点数が閾値以上なら

              //情報をmainプロセスへ送信
              workerThreads.parentPort.postMessage({
                action: "EQDetectAdd",
                data: EQD_ItemTmp,
              });
              EQD_ItemTmp.showed = true; //新地震アイテムかどうかの判別用
            }
          } else if (elm.detect2) {
            //自観測点がどの地震アイテムにも属さず、検知レベルがLv.2以上の場合
            //自観測点を中心とした新規地震アイテム作成
            EQDetect_List.push({ id: EQDetectID, lat: elm.Location.Latitude, lng: elm.Location.Longitude, Codes: [elm], Radius: 0, maxPGA: elm.pga, maxInt: elm.shindo, detectCount: 1, Up: false, Lv: 0, last_Detect: new Date() - Replay, origin_Time: new Date() - Replay, showed: false, isCity: ptDataTmp.isCity });
            EQDetectID++;
          }
        }
      }
    }
  }

  //地震検知解除
  var index = 0;
  for (const elm of EQDetect_List) {
    if (EEWNow || new Date() - Replay - elm.origin_Time > thresholds.time00 || new Date() - Replay - elm.last_Detect > thresholds.time01) {
      //EEW発令中・発生から閾値以上経過・最後の検知から閾値以上経過
      EQDetect_List.splice(index, 1);
      workerThreads.parentPort.postMessage({
        action: "sendDataToMainWindow",
        data: {
          action: "EQDetectFinish",
          data: elm.id,
        },
      });
    }
    index++;
  }

  //mainProcessへ情報送信
  workerThreads.parentPort.postMessage({
    action: "EQDetect_List_Update",
    data: EQDetect_List,
  });
  workerThreads.parentPort.postMessage({
    action: "PointsData_Update",
    data: data,
    date: date,
    changedData: changedData,
  });
}

//緯度・経度から2地点間の距離を産出
function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}
