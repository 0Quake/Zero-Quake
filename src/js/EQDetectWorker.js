import workerThreads from "worker_threads";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));

var EEWNow = false; //EEW発令中かどうか
var EQDetectID = 0; //独自の地震ID
var EQDetect_List = []; //地震アイテムのリスト
var pointsData = {}; //毎秒クリアされない、観測点のデータ
var Replay = 0;

var thresholds = {
  historyCount: 30, //比較する件数
  threshold01: 5, //検出とする観測点数
  threshold01C: 5, //検出とする観測点数【都会】
  threshold02: null, //1次フラグ条件のPGA増加量[gal]
  threshold03: null, //2次フラグ条件のPGA増加量[gal]
  threshold04: 3, //1次フラグ条件の震度
  threshold05: 0.1, //イベントの観測点数が最大時のn倍未満で解除
  MargeRange: 40, //地震の同定範囲[km]
  MargeRangeC: 20, //地震の同定範囲[km]【都会】
  time00: 300000, //最初の検出~解除[ms](優先)
  time01: 60000, //最後の検出~解除[ms]
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
      EEWNow = message.data;
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
        thresholds.threshold02 = 0.19 * pgaAvr + 0.02;
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
          elm.o_arrivalTime = new Date() - Replay;
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
      if (ptData.SUMTmp.length >= thresholds.historyCount) {
        ptData.SUM += ptData.SUMTmp[ptData.SUMTmp.length - thresholds.historyCount];
        ptData.SUM -= ptData.SUMTmp[0];
      }
    }

    if (!elm.detect && ptData.Event) {
      //検出中ではない場合、地震アイテムから観測点データを削除
      ptData.Event = false;
      for (const elm2 of EQDetect_List) {
        elm2.Codes = elm2.Codes.filter(function (elm3) {
          if (elm3.Code == elm.Code) elm2.last_changed = new Date() - Replay;
          return elm3.Code !== elm.Code;
        });
      }
    }
  }

  var MargeRangeTmp, threshold01Tmp, ptData, EQD_ItemTmp;
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
          //地震アイテムに自観測点を追加
          var SameST = EQD_ItemTmp.Codes.find(function (elm2) {
            return elm2.Code == elm.Code;
          });
          if (!SameST) {
            var nearpointslength = 0;
            var detectPointsLength = 0;
            data.forEach(function (station) {
              if (station.data && station.Code !== elm.Code && geosailing(station.Location.Latitude, station.Location.Longitude, elm.Location.Latitude, elm.Location.Longitude) <= 100) {
                nearpointslength++;
                if (station.detect) detectPointsLength++;
              }
            });

            if (detectPointsLength / nearpointslength > 0.15 || nearpointslength < 1) {
              EQD_ItemTmp.Codes.push(elm);
              if (!EQD_ItemTmp.Codes_history.includes(elm.Code)) EQD_ItemTmp.Codes_history.push(elm.Code);
              ptData.Event = true;

              //最終検知時間（解除時に使用）を更新
              EQD_ItemTmp.last_Detect = new Date() - Replay;
              EQD_ItemTmp.last_changed = new Date() - Replay;
            }
          }
        }
      }

      MargeRangeTmp = elm.isCity ? thresholds.MargeRangeC : thresholds.MargeRange;
      var nearEvent = EQDetect_List.find(function (EQD_ItemTmp) {
        return geosailing(elm.Location.Latitude, elm.Location.Longitude, EQD_ItemTmp.lat, EQD_ItemTmp.lng) <= MargeRangeTmp;
      });
      if (!ptData.Event && elm.detect2 && !nearEvent) {
        //自観測点がどの地震アイテムにも属さず、検知レベルがLv.2以上の場合
        //自観測点を中心とした新規地震アイテム作成
        EQDetect_List.push({ id: EQDetectID, lat: elm.Location.Latitude, lng: elm.Location.Longitude, lat2: elm.Location.Latitude, lng2: elm.Location.Longitude, Codes: [elm], Codes_history: [elm.Code], Radius: 0, maxPGA: elm.pga, maxInt: elm.shindo, detectCount: 1, Up: false, Lv: 0, last_Detect: new Date() - Replay, last_changed: new Date() - Replay, origin_Time: new Date() - Replay, showed: false, isCity: ptData.isCity });
        EQDetectID++;
      }
    }
  }

  for (const EQD_ItemTmp of EQDetect_List) {
    MargeRangeTmp = EQD_ItemTmp.isCity ? thresholds.MargeRangeC : thresholds.MargeRange;
    var ArroundPoints = data.filter(function (station) {
      return station.data && geosailing(station.Location.Latitude, station.Location.Longitude, EQD_ItemTmp.lat2, EQD_ItemTmp.lng2) <= MargeRangeTmp;
    });
    threshold01Tmp = EQD_ItemTmp.isCity ? thresholds.threshold01C : thresholds.threshold01;
    threshold01Tmp = Math.min(Math.max(ArroundPoints.length, 2), threshold01Tmp); //周囲の観測点数に応じて閾値を調整（離島対応）
    if (EQD_ItemTmp.Codes.length >= threshold01Tmp) {
      //地震アイテムに属する観測点数が閾値以上なら
      if (Math.abs(EQD_ItemTmp.last_Detect - (new Date() - Replay)) < 500) {
        var result = GuessHypocenter(EQD_ItemTmp, data);
        if (Math.abs(EQD_ItemTmp.lat - result[0].lat) > 0.5) EQD_ItemTmp.lat = result[0].lat;
        if (Math.abs(EQD_ItemTmp.lng - result[0].lng) > 0.5) EQD_ItemTmp.lng = result[0].lng;
        if (result[0].rad) EQD_ItemTmp.Radius = result[0].rad;
      }

      //情報をmainプロセスへ送信
      workerThreads.parentPort.postMessage({
        action: "EQDetectAdd",
        data: EQD_ItemTmp,
      });
      EQD_ItemTmp.showed = true; //新地震アイテムかどうかの判別用
    }
  }

  //地震検知解除
  var index = 0;
  for (const elm of EQDetect_List) {
    if (EEWNow || new Date() - Replay - elm.origin_Time > thresholds.time00 || new Date() - Replay - elm.last_Detect > thresholds.time01 || elm.Codes.length < elm.Codes_history.length * thresholds.threshold05) {
      //EEW発令中・発生から閾値以上経過・最後の検知から閾値以上経過・観測点数が最大時より一定割合減少
      EQDetect_List.splice(index, 1);
      workerThreads.parentPort.postMessage({
        action: "sendDataToMainWindow",
        data: {
          action: "EQDetectFinish",
          data: elm.id,
        },
      });
      elm.Codes.forEach(function (elm2) {
        pointsData[elm2.Code].Event = false;
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
  var o_arrivalTime_min = Infinity;
  for (const station of EQElm.Codes) {
    if (o_arrivalTime_min > pointsData[station.Code].o_arrivalTime) o_arrivalTime_min = pointsData[station.Code].o_arrivalTime;
  }
  if (EQElm.origin_Time - o_arrivalTime_min < 10000) var originTime = new Date(o_arrivalTime_min - 2000);
  else var originTime = new Date(EQElm.origin_Time - 6000);

  var Tmp = { dif: Infinity };
  for (let lat = Math.floor(EQElm.lat2) - 3; lat <= Math.floor(EQElm.lat2) + 3; lat++) {
    for (let lng = Math.floor(EQElm.lng2) - 3; lng <= Math.floor(EQElm.lng2) + 3; lng++) {
      for (var depth of [10, 40, 100, 300]) {
        var res = calcDifference(lat, lng, EQElm, data, originTime, depth);
        if (res) {
          var item = { lat: lat, lng: lng, dif: res[0], rad: res[1] };
          if (Tmp.dif > item.dif) Tmp = item;
        }
      }
    }
  }

  var result = { dif: Infinity };
  for (let lat = Tmp.lat - 0.5; lat <= Tmp.lat + 0.5; lat += 0.2) {
    for (let lng = Tmp.lng - 0.5; lng <= Tmp.lng + 0.5; lng += 0.2) {
      for (var depth of [0, 10, 30, 70, 100, 300, 700]) {
        var res = calcDifference(lat, lng, EQElm, data, originTime, depth);
        if (res) {
          var item = { lat: lat, lng: lng, dif: res[0], rad: res[1] };
          if (Tmp.dif > item.dif) result = item;
        }
      }
    }
  }

  return [result, originTime];
}

var TimeTable_JMA2001 = JSON.parse(await readFile(path.join(__dirname, "../Resource/TimeTable_JMA2001.json")));
function calcDifference(lat, lng, stations, data, originTime, dep) {
  var TimeTable = TimeTable_JMA2001[dep];
  var f_arrivalTime_min = Infinity;
  var radius = 0;

  var distance = [];
  for (const station of stations.Codes) {
    station.distance = geosailing(lat, lng, station.Location.Latitude, station.Location.Longitude);
    distance.push(station.distance);

    if (radius < station.distance) radius = station.distance;
    var index = TimeTable.findIndex(function (elm) {
      return elm.R >= station.distance;
    });
    if (index >= 0) {
      var elm0 = TimeTable[Math.max(index - 1, 0)];
      var elm2 = TimeTable[index];
      if (elm0.R == station.distance) station.f_arrivalTime = elm0.S;
      else station.f_arrivalTime = elm0.S + ((elm2.S - elm0.S) * (station.distance - elm0.R)) / (elm2.R - elm0.R);
      station.o_arrivalTime = pointsData[station.Code].o_arrivalTime;

      if (f_arrivalTime_min > station.f_arrivalTime) f_arrivalTime_min = station.f_arrivalTime;
    } else return null;
  }
  /*radius = distance.sort((a, b) => {
    return (a < b) ? -1 : 1;
  })[Math.abs(distance.length*0.8)];*/

  var Difference = 0;
  stations.Codes.forEach((station) => {
    Difference += Math.abs((station.o_arrivalTime - originTime) / 1000 - station.f_arrivalTime - f_arrivalTime_min);
  });

  var ArroundPoints = data.filter(function (station) {
    return station.data && geosailing(station.Location.Latitude, station.Location.Longitude, lat, lng) <= radius;
  });

  Difference = Difference / stations.Codes.length;
  Difference = Difference / (stations.Codes.length / ArroundPoints.length) ** 2;
  if (stations.Codes.length / ArroundPoints.length < 0.5) Difference *= 10;
  if (stations.Codes.length / ArroundPoints.length < 0.3) Difference *= 1000;

  return [Difference, radius];
}

//緯度・経度から2地点間の距離を産出
function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}
