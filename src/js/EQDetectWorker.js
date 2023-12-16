const workerThreads = require("worker_threads");

var EEWNow = false; //EEW発令中かどうか
var EQDetectID = 0; //独自の地震ID
var EQDetect_List = []; //地震アイテムのリスト
var pointsData = {}; //毎秒クリアされない、観測点のデータ
var Replay = 0;

var thresholds = {
  historyCount: 40, //比較する件数
  threshold01: 5, //検出とする観測点数
  threshold01C: 5, //検出とする観測点数【都会】
  threshold02: null, //1次フラグ条件のPGA増加量[gal]
  threshold03: null, //2次フラグ条件のPGA増加量[gal]
  threshold04: 3, //1次フラグ条件の震度
  threshold05: 0.3, //イベントの観測点数が最大時のn倍未満で解除
  MargeRange: 30, //地震の同定範囲[km]
  MargeRangeC: 20, //地震の同定範囲[km]【都会】
  time00: 300000, //最初の検出~解除[ms](優先)
  time01: 10000, //最後の検出~解除[ms]
};

workerThreads.parentPort.postMessage({
  action: "thresholds",
  data: thresholds,
});

workerThreads.parentPort.on("message", (message) => {
  switch (message.action) {
    case "EQDetect":
      EQDetect(message.data, message.date, message.detect); //観測点ごとのデータを毎秒受信
      break;
    case "EEWNow":
      //EEWNow = message.data;
      break;
    case "Replay":
      Replay = message.data;
      pointsData = {};
      break;
  }
});

function EQDetect(data, date, detect) {
  var changedData = [];

  var ptData, detect0, pgaAvr;
  for (const elm of data) {
    //ポイントごとの処理
    ptData = pointsData[elm.Code];
    if (!ptData) {
      //都会かどうか
      var isCity = elm.Region == "東京都" || elm.Region == "千葉県" || elm.Region == "埼玉県" || elm.Region == "神奈川県";
      ptData = pointsData[elm.Code] = { detectCount: 0, SUMTmp: [elm.pga], SUM: elm.pga, Event: false, isCity: isCity, UpCount: 0, o_arrivalTime: null };
    }

    if (elm.data) {
      if (!EEWNow && detect) {
        //PGAの10回平均を求める
        pgaAvr = ptData.SUM / ptData.SUMTmp.length;

        //平均PGAから閾値を決定
        thresholds.threshold02 = 0.18 * pgaAvr + 0.02;
        thresholds.threshold03 = 0.7 * pgaAvr + 0.2;
        if (ptData.isCity) {
          //都会では閾値を大きく
          thresholds.threshold02 *= 2;
          thresholds.threshold03 *= 2;
        }

        detect0 = elm.pga - pgaAvr >= thresholds.threshold02 || elm.shindo >= thresholds.threshold04; //PGA増加量・震度絶対値で評価
        elm.detect = detect0 && ptData.detectCount > 0; //elm.detectに加え、連続検出回数を加えて評価
        elm.detect2 = elm.detect && ((elm.pga - pgaAvr >= thresholds.threshold03 && ptData.UpCount > 0) || elm.shindo > thresholds.threshold04);

        //連続上昇回数（変化なし含む）
        if (elm.pga >= ptData.SUMTmp[ptData.SUMTmp.length - 1]) ptData.UpCount++;
        else ptData.UpCount = 0;

        if (ptData.detectCount == 0 && detect0) {
          ptData.o_arrivalTime = new Date();
        }

        //連続検出回数（elm.detectは連続検出回数を指標に含むため、detect0で判定）
        if (detect0) ptData.detectCount++;
        else ptData.detectCount = 0;
      }

      //前回からの変化の有無（描画時の負荷軽減のため）
      if (elm.pga != ptData.SUMTmp[ptData.SUMTmp.length - 1]) changedData.push(elm);

      //PGA平均を求めるためのデータ追加
      ptData.SUMTmp = ptData.SUMTmp.slice(1);
      ptData.SUMTmp.push(elm.pga);
      if (ptData.SUMTmp.length >= 30) {
        ptData.SUM += ptData.SUMTmp[ptData.SUMTmp.length - 30];
        ptData.SUM -= ptData.SUMTmp[0];
      }
    }

    if (!elm.detect && ptData.Event) {
      //検出中ではない場合、地震アイテムから観測点データを削除
      ptData.Event = false;
      for (const elm2 of EQDetect_List) {
        elm2.Codes = elm2.Codes.filter(function (elm3) {
          return elm3.Code !== elm.Code;
        });
      }
    }
  }

  var MargeRangeTmp, threshold01Tmp, ptData, EQD_ItemTmp, radiusTmp;
  //単独点の検知情報をグルーピング
  for (const elm of data) {
    if (elm.detect) {
      ptData = pointsData[elm.Code];

      if (!ptData.Event) {
        //すでに自観測点が地震アイテムに属していない場合
        //都会かどうかで閾値調整
        MargeRangeTmp = ptData.isCity ? thresholds.MargeRangeC : thresholds.MargeRange;

        //自観測点が地震アイテムの半径+閾値の範囲内に入っている地震アイテムを探す
        EQD_ItemTmp = EQDetect_List.find(function (elm2) {
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
            EQD_ItemTmp.Codes_history++;
            ptData.Event = true;
            //地震アイテムの「半径」を更新
            radiusTmp = geosailing(elm.Location.Latitude, elm.Location.Longitude, EQD_ItemTmp.lat, EQD_ItemTmp.lng);
            if (EQD_ItemTmp.Radius < radiusTmp) EQD_ItemTmp.Radius = radiusTmp;
            //最終検知時間（解除時に使用）を更新
            EQD_ItemTmp.last_Detect = new Date() - Replay;

            threshold01Tmp = EQD_ItemTmp.isCity ? thresholds.threshold01C : thresholds.threshold01;
            threshold01Tmp = Math.min(Math.max(elm.arroundPoints, 2), threshold01Tmp); //周囲の観測点数に応じて閾値を調整（離島対応）
            if (EQD_ItemTmp.Codes.length >= threshold01Tmp) {
              //地震アイテムに属する観測点数が閾値以上なら

              var result = GuessHypocenter(EQD_ItemTmp, data);
              EQD_ItemTmp.lat2 = result.lat;
              EQD_ItemTmp.lng2 = result.lng;
              EQD_ItemTmp.Radius2 = result.rad;

              //情報をmainプロセスへ送信
              workerThreads.parentPort.postMessage({
                action: "EQDetectAdd",
                data: EQD_ItemTmp,
              });
              EQD_ItemTmp.showed = true; //新地震アイテムかどうかの判別用
            }
          }
        }
      }

      if (!ptData.Event && elm.detect2) {
        //自観測点がどの地震アイテムにも属さず、検知レベルがLv.2以上の場合
        //自観測点を中心とした新規地震アイテム作成
        EQDetect_List.push({ id: EQDetectID, lat: elm.Location.Latitude, lng: elm.Location.Longitude, Codes: [elm], Codes_history: 1, Radius: 0, maxPGA: elm.pga, maxInt: elm.shindo, detectCount: 1, Up: false, Lv: 0, last_Detect: new Date() - Replay, origin_Time: new Date() - Replay, showed: false, isCity: ptData.isCity });
        EQDetectID++;
      }
    }
  }

  //地震検知解除
  var index = 0;
  for (const elm of EQDetect_List) {
    if (EEWNow || new Date() - Replay - elm.origin_Time > thresholds.time00 || new Date() - Replay - elm.last_Detect > thresholds.time01 || elm.Codes.length < elm.Codes_history * thresholds.threshold05) {
      //EEW発令中・発生から閾値以上経過・最後の検知から閾値以上経過・観測点数が最大時より一定割合減少
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
    action: "PointsData_Update",
    data: data,
    date: date,
    changedData: changedData,
    EQDetect_List: EQDetect_List,
  });
}

function GuessHypocenter(EQElm, data) {
  var mindif = Infinity;
  var difs = [];
  for (let lat = EQElm.lat - 3; lat <= EQElm.lat + 3; lat++) {
    for (let lng = EQElm.lng - 3; lng <= EQElm.lng + 3; lng++) {
      result = calcDifference(lat, lng, EQElm, data);
      if (result) {
        dif = result[0];
        rad = result[1];
        if (mindif > dif) mindif = dif;
        difs.push({ lat: lat, lng: lng, dif: dif });
      }
    }
  }
  var Tmp = difs.find(function (elm) {
    return mindif == elm.dif;
  });

  mindif = Infinity;
  difs = [];
  for (let lat = Tmp.lat - 0.5; lat <= Tmp.lat + 0.5; lat += 0.1) {
    for (let lng = Tmp.lng - 0.5; lng <= Tmp.lng + 0.5; lng++) {
      result = calcDifference(lat, lng, EQElm, data);
      if (result) {
        dif = result[0];
        rad = result[1];
        if (mindif > dif) mindif = dif;
        difs.push({ lat: lat, lng: lng, dif: dif, rad: rad });
      }
    }
  }

  result = difs.find(function (elm) {
    return mindif == elm.dif;
  });

  console.log("ccc", result);
  return result;
}

var TimeTable_JMA2001 = require("../Resource/TimeTable_JMA2001.json")[10];
function calcDifference(lat, lng, stations, data) {
  var o_arrivalTime_min = Infinity;
  var o_arrivalTime_max = 0;
  var f_arrivalTime_min = Infinity;
  var distance_max = 0;
  for (const station of stations.Codes) {
    distance = station.distance = geosailing(lat, lng, station.Location.Latitude, station.Location.Longitude);
    if (distance_max < distance) distance_max = distance;
    var index = TimeTable_JMA2001.findIndex(function (elm) {
      return elm.R >= distance;
    });
    if (index >= 0) {
      var elm0 = TimeTable_JMA2001[Math.max(index - 1, 0)];
      var elm2 = TimeTable_JMA2001[index];
      if (elm0.R == distance) station.f_arrivalTime = elm0.S;
      else station.f_arrivalTime = elm0.S + ((elm2.S - elm0.S) * (distance - elm0.R)) / (elm2.R - elm0.R);
      station.o_arrivalTime = pointsData[station.Code].o_arrivalTime;

      if (o_arrivalTime_max < station.o_arrivalTime) o_arrivalTime_max = station.o_arrivalTime;
      if (o_arrivalTime_min > station.o_arrivalTime) o_arrivalTime_min = station.o_arrivalTime;
      if (f_arrivalTime_min > station.f_arrivalTime) f_arrivalTime_min = station.f_arrivalTime;
    } else return null;
  }

  var Difference = 0;
  stations.Codes.forEach((station) => {
    o_dif = (station.o_arrivalTime - o_arrivalTime_min) / 1000;
    f_dif = station.f_arrivalTime - f_arrivalTime_min;
    Difference += Math.abs(o_dif - f_dif) * (1 / 250) * station.distance + 0.5;
  });

  new Date() - o_arrivalTime_min;

  var PointsNotDetecting = data.filter(function (station) {
    return geosailing(station.Location.Latitude, station.Location.Longitude, lat, lng) < distance_max;
  });

  Difference = Difference / stations.Codes.length;
  Difference = Difference * Math.abs((PointsNotDetecting.length * 1.5) / stations.Codes.length);
  return [Difference, distance_max];
}

//緯度・経度から2地点間の距離を産出
function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}
