const workerThreads = require("worker_threads");

var EQDetectID = 0;
var EQDetect_List = [];
var pointsData = {};

var historyCount = 10; //比較する件数
var threshold01 = 3; //検出とする観測点数
var threshold02 = 0.06; //1次フラグ条件のPGA増加量[gal]
var threshold03 = 0.2; //2次フラグ条件のPGA増加量[gal]
var threshold04 = 1; //1次フラグ条件の震度
var MargeRange = 40; //地震の同定範囲[km]
var time00 = 300000; //最初の検出~解除[ms](優先)
var time01 = 10000; //最後の検出~解除[ms]

workerThreads.parentPort.on("message", (message) => {
  var data = message.data;
  var ptDataTmp;

  var detect0;
  var detect1;
  var detect2;
  var pgaAvr;
  var oneBeforePGADifference;
  for (const elm of data) {
    if (elm.Point && !elm.IsSuspended) {
      ptDataTmp = pointsData[elm.Code];
      if (!ptDataTmp) {
        var isCity = elm.Region == "東京都" || elm.Region == "千葉県" || elm.Region == "埼玉県" || elm.Region == "神奈川県";
        pointsData[elm.Code] = { detectCount: 0, SUMTmp: [elm.pga], Event: null, oneBeforePGA: elm.pga, isCity: isCity };
        ptDataTmp = pointsData[elm.Code];
      }

      pgaAvr =
        ptDataTmp.SUMTmp.reduce(function (acc, cur) {
          return acc + cur;
        }) / ptDataTmp.SUMTmp.length;
      if (!pgaAvr) pgaAvr = 0.03;

      threshold02 = 0.4 * pgaAvr + 0.025;
      threshold03 = 0.6 * pgaAvr + 0.13;
      if (ptDataTmp.isCity) {
        threshold02 *= 2;
        threshold03 *= 2;
      }

      detect0 = elm.pga - pgaAvr >= threshold02 || elm.shindo >= threshold04;
      detect1 = detect0 && ptDataTmp.detectCount > 0;
      detect2 = detect1 && (elm.pga - pgaAvr >= threshold03 || elm.shindo > 1.5) && ptDataTmp.UpCount > 0 && ptDataTmp.detectCount > 1; /*|| elm.shindo >= threshold04*/ /* || elm.detectCount > 1*/

      elm.detect = detect1;
      elm.detect2 = detect2;

      if (detect0) {
        ptDataTmp.detectCount++;
      } else {
        ptDataTmp.detectCount = 0;
      }
      if (!detect2) {
        ptDataTmp.SUMTmp = ptDataTmp.SUMTmp.slice(0, historyCount - 1);
        ptDataTmp.SUMTmp.push(elm.pga);

        if (!detect1 && ptDataTmp.Event) {
          ptDataTmp.Event = null;
          for (const elm2 of EQDetect_List) {
            elm2.Codes = elm2.Codes.filter(function (elm3) {
              return elm3.Code !== elm.Code;
            });
          }
        }
      }

      oneBeforePGADifference = elm.pga - ptDataTmp.SUMTmp[ptDataTmp.SUMTmp.length - 1];
      if (oneBeforePGADifference >= 0) {
        ptDataTmp.UpCount++;
      } else if (oneBeforePGADifference < 0) {
        ptDataTmp.UpCount = 0;
      }
    }
  }

  for (const elm of data) {
    if (elm.detect) {
      var ptDataTmp = pointsData[elm.Code];
      if (ptDataTmp.isCity) {
        threshold01 = 5;
        MargeRange = 20;
      } else {
        threshold01 = 4;
        MargeRange = 40;
      }

      var EQD_ItemTmp = EQDetect_List.find(function (elm2) {
        return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm2.lat, elm2.lng) - elm2.Radius <= Math.max(0, MargeRange);
      });
      if (EQD_ItemTmp) {
        var CodesTmp = EQD_ItemTmp.Codes.find(function (elm3) {
          return geosailing(elm.Location.Latitude, elm.Location.Longitude, elm3.Location.Latitude, elm3.Location.Longitude) <= MargeRange;
        });

        if (CodesTmp) {
          var already = ptDataTmp.Event;

          if (!already) {
            EQD_ItemTmp.Codes.push(elm);
            ptDataTmp.Event = EQD_ItemTmp.id;
            var radiusTmp = geosailing(elm.Location.Latitude, elm.Location.Longitude, EQD_ItemTmp.lat, EQD_ItemTmp.lng);
            if (EQD_ItemTmp.Radius < radiusTmp) EQD_ItemTmp.Radius = radiusTmp;
            continue;
          }
        }
      }

      if (EQD_ItemTmp) {
        EQD_ItemTmp.last_Detect = new Date();

        if (EQD_ItemTmp.Codes.length >= threshold01) {
          if (!EQD_ItemTmp.showed) {
            if (EQD_ItemTmp.maxPGA > 1) {
              soundPlay("EQDetectLv2");
            } else {
              soundPlay("EQDetectLv1");
            }
            createWindow();
          } else {
            if (EQD_ItemTmp.maxPGA > 1) {
              if (EQD_ItemTmp.Lv == 1) soundPlay("EQDetectLv2");
            }
          }
          if (EQD_ItemTmp.maxPGA > 1) {
            EQD_ItemTmp.Lv = 2;
          } else {
            EQD_ItemTmp.Lv = 1;
          }

          EQD_ItemTmp.showed = true;
          workerThreads.parentPort.postMessage({
            action: "sendDataToMainWindow",
            data: {
              action: "EQDetect",
              data: EQD_ItemTmp,
            },
          });
        }
      } else if (elm.detect2) {
        EQDetect_List.push({ id: EQDetectID, lat: elm.Location.Latitude, lng: elm.Location.Longitude, Codes: [elm], Radius: 0, maxPGA: elm.pga, maxInt: elm.shindo, detectCount: 1, Up: false, Lv: 0, last_Detect: new Date(), origin_Time: new Date(), showed: false });
        EQDetectID++;

        //新報
      }
    }
  }

  //地震検知解除
  var index = 0;
  for (const elm of EQDetect_List) {
    if (EEWNow || new Date() - elm.origin_Time > time00 || new Date() - elm.last_Detect > time01) {
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
  workerThreads.parentPort.postMessage({
    action: "EQDetect_List_Update",
    data: EQDetect_List,
  });
  workerThreads.parentPort.postMessage({
    action: "PointsData_Update",
    data: data,
    date: message.date,
  });
});
