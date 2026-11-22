import electron from "electron";
const { dialog } = electron;
import * as turf from "@turf/turf";
import { throttle, NormalizeShindo, newDate2, FERegion, nullHandler } from "./constants.js";
import { MainWindow, SettingWindow, Create_SettingWindow, messageToMainWindow } from "./windows.js";
import { MargeEQInfo, AlertEQInfo, eqInfo } from "./PROC_EQInfo.js";
import { ConvertTsunamiInfo, TsunamiValidate_bypass } from "./PROC_Tsunami.js";

import {
  package_ver,
  packageJson,
  JMA_CurrentInfoNumber,
  USGS_CurrentInfoNumber,
  Replay,
  UpdateStatus,
  GeneralError_handler,
} from "./state.js";

export var update_data = null;
export var downloadURL;

//アップデートの確認
export var checkUpdate = throttle(async function (userAction) {

  try {
    var UpdateError = function () {
      var current_verTmp = package_ver;

      update_data = {
        check_error: true,
        check_date: new Date(),
        latest_version: null,
        current_version: current_verTmp,
        update_available: null,
        dl_page: null,
      };
      if (SettingWindow) {
        SettingWindow.webContents.send("message2", {
          action: "Update_Data",
          data: update_data,
        });
      }
    };

    fetch(`https://api.github.com/repos/0quake/Zero-Quake/releases?_=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
        return r.json();
      }).then((json) => {
        if (!Array.isArray(json) || !json[0]) throw new Error("GitHub Releases APIが空または不正なデータを返しました。");
        var latest_ver = String(json[0].tag_name).replace("v", "");
        var current_ver = packageJson.version;

        var dl_page = json[0].html_url;
        var update_detail = json[0].body;
        downloadURL = json[0].assets[0];
        if (downloadURL && downloadURL.browser_download_url)
          downloadURL = downloadURL.browser_download_url;
        else {
          update_data = { check_error: true, check_date: new Date() };
          if (SettingWindow) {
            SettingWindow.webContents.send("message2", {
              action: "Update_Data",
              data: update_data,
            });
          }
        }


        const collator = new Intl.Collator(undefined, { numeric: true });
        var update_available = collator.compare(current_ver, latest_ver) < 0;

        if (update_available && !userAction) {
          var options4 = {
            type: "question",
            title: "アプリケーションの更新",
            message: "Zero Quake で更新が利用可能です。",
            detail: `v.${current_ver} > v.${latest_ver}\n操作を選択してください。`,
            buttons: ["後で確認", "詳細を確認"],
            noLink: true,
          };

          dialog.showMessageBox(MainWindow, options4).then(function (result) {
            if (result.response == 1) {
              Create_SettingWindow(true);
            }
          });
        }

        update_data = {
          check_error: false,
          check_date: new Date(),
          latest_version: latest_ver,
          current_version: current_ver,
          update_available: update_available,
          dl_page: dl_page,
          update_detail: update_detail,
        };
        if (SettingWindow) {
          SettingWindow.webContents.send("message2", {
            action: "Update_Data",
            data: update_data,
          });
        }

      }).catch((err) => {
        GeneralError_handler(err)
        UpdateError(err);
      });

  } catch (err) {
    throw new Error("アップデートの確認で深刻なエラーが発生しました。", { cause: err });
  }
}, 2000);

//定期実行

var usgsLastGenerated = 0;
export var Req_USGS = throttle(function () {
  fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=${USGS_CurrentInfoNumber}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var LastGenTmp = Number(json?.metadata?.generated);
      if (!LastGenTmp) throw new Error("usgs.govが不正なデータを返しました。");
      if (usgsLastGenerated > LastGenTmp) throw new Error("usgs.govが古いデータを返しました。");

      usgsLastGenerated = LastGenTmp;

      var dataTmp2 = [];
      (json.features || []).forEach(function (elm) {
        var FECode = null;
        if (elm.geometry?.coordinates) {
          FECode = FERegion.features.find(function (elm2) {
            return turf.booleanPointInPolygon(elm.geometry.coordinates, elm2);
          });
        }

        var maxi;
        if (elm.properties?.mmi != null) maxi = elm.properties.mmi;

        var magTmp = elm?.properties?.mag;
        dataTmp2.push({
          eventId: elm.id,
          category: null,
          OriginTime: newDate2(elm?.properties?.time),
          epiCenter: FECode?.properties?.nameJA || "",
          M: magTmp ? (Math.round(magTmp * 10) / 10) : null,
          maxI: maxi,
          DetailURL: elm.properties?.url ? [elm.properties.url] : [],
        });
      });
      dataTmp2 = dataTmp2.sort((a, b) => a.OriginTime > b.OriginTime ? -1 : 1);
      AlertEQInfo(dataTmp2, "usgs");
      if (dataTmp2.length < USGS_CurrentInfoNumber) {
        messageToMainWindow({ action: "Deny_additionalEQInfo_USGS" });
      }
    }).catch((err) => {
      GeneralError_handler(err);
      messageToMainWindow({ action: "Deny_additionalEQInfo_USGS" });
    });
}, 2000);

//narikakun地震情報API リスト取得→Req_Narikakun
export function Req_NarikakunList(count) {
  fetch(`https://earthquake-api-v2.nakn.jp/api/v2/list?limit=${JMA_CurrentInfoNumber}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      if (!json || json.status != "ok" || !json.items) throw new Error("ntools APIが不正なデータかstatus≠okを返した。");

      var data_array = [];
      for (let item of json.items) {
        //if (!originTimeTmp) originTimeTmp = new Date(json.Head.TargetDateTime); 保留

        for (let elm of (item.lists || [])) {
          var originTime = newDate2(elm.data?.originTimeNew);
          var reportDateTime = newDate2(elm.datetime);
          var epiCenter = elm.data?.hypoName;
          var Magnitude = elm.data?.magnitude ? Number(elm.data?.magnitude) : null;
          var MaxI = elm.data?.int ? NormalizeShindo(elm.data?.int) : null;
          var cancel = (elm.type == "取消");
          var url_list = elm.url ? [elm.url] : [];

          data_array.push({
            status: elm.status,
            eventId: item.eventId,
            category: elm.title,
            OriginTime: originTime,
            epiCenter: epiCenter,
            M: Magnitude,
            maxI: MaxI,
            cancel: cancel,
            reportDateTime: reportDateTime,
            DetailURL: url_list,
            headline: "",//保留
            axisData: null,
          });
          UpdateStatus("ntool", "success");
        }
      }

      var prevCount = eqInfo.jma.length;
      MargeEQInfo(data_array, count);

      // 新規データが追加されなかった場合、最新のスライスを送信
      if (eqInfo.jma.length === prevCount) {
        messageToMainWindow({
          action: "EQInfo",
          source: "jma",
          data: eqInfo.jma.slice(0, JMA_CurrentInfoNumber),
        });
        if (eqInfo.jma.length < JMA_CurrentInfoNumber) {
          messageToMainWindow({ action: "Deny_additionalEQInfo_JMA" });
        }
      }

      UpdateStatus("ntool", "success");
    }).catch((err) => {
      GeneralError_handler(err);
      UpdateStatus("ntool", "Error");
      messageToMainWindow({ action: "Deny_additionalEQInfo_JMA" });
    });
}

var NaknQAPI_Fetched = [];
export function Req_NaknQAPI_Rep(reportId) {
  var url = `https://quake-api.nakn.jp/v2/reports/${reportId}`;
  if (NaknQAPI_Fetched.includes(url)) return;

  return fetch(
    url,
    { signal: AbortSignal.timeout(5000) }
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.text();
  }).then((text) => {
    var json = JSON.parse(text);
    if (!json) throw new Error("nakn quake apiでjsonパースエラー");

    if (json?.kind == "earthquake") {
      var eqBody = json.body?.earthquake;
      var intBody = json.body?.intensity;
      MargeEQInfo([{
        status: "通常",
        eventId: nullHandler(json.eventId),
        category: nullHandler(json.title),
        reportDateTime: nullHandler(json.reportedAt, (v) => new Date(v)),
        OriginTime: eqBody ? nullHandler(eqBody.originTime, (v) => new Date(v)) : undefined,
        epiCenter: eqBody ? nullHandler(eqBody.hypocenter?.name) : undefined,
        M: eqBody ? nullHandler(eqBody.magnitude?.value, Number) : undefined,
        maxI: intBody ? NormalizeShindo(intBody.maxIntensity) : undefined,
        cancel: json.infoType === "canceled",
        DetailURL: [url],
        headline: nullHandler(json.headline),
        axisData: null,
      }]);
    } else if (json?.kind == "tsunami") {
      var rdt = nullHandler(json.reportedAt ?? json.targetAt, (v) => new Date(v));
      var validDateTimeTmp = nullHandler(rdt, (d) => {
        var dt = new Date(d);
        dt.setHours(dt.getHours() + 12);
        return dt;
      });
      var isCanceled = json.infoType === "canceled";
      var eventIdsTmp = Array.isArray(json.eventIds)
        ? json.eventIds.map(Number).filter((n) => !Number.isNaN(n) && n > 0)
        : (json.eventId != null && !Number.isNaN(Number(json.eventId)) && Number(json.eventId) > 0 ? [Number(json.eventId)] : []);

      var tsunamiDataTmp = {
        title: nullHandler(json.title),
        status: "通常",
        issue: {
          time: rdt,
          EventID: eventIdsTmp,
          EarthQuake: [],
        },
        areas: [],
        Torikeshi: isCanceled,
        cancelled: isCanceled,
        revocation: false,
        headline: nullHandler(json.headline),
        comment: null,
        source: "NaknQAPI",
        ValidDateTime: isCanceled ? null : validDateTimeTmp,
      };

      //付加文取得の不具合による処理停止を回避
      try {
        var WarningComment = json.body?.comments?.warning?.text || "";
        var FreeFormComment = json.body?.comments?.free || "";

        tsunamiDataTmp.comment = [WarningComment, FreeFormComment].filter(Boolean).join("\n\n");
      } catch { }


      var EQData = [];
      json.body?.earthquakes?.forEach(function (eq, index) {
        var eventId = eventIdsTmp[index];
        if (!eventId) return;
        EQData.push({
          status: "通常",
          eventId: eventId,
          category: "Tsunami",
          OriginTime: nullHandler(eq.originTime, (v) => new Date(v)),
          epiCenter: nullHandler(eq.hypocenter?.name),
          M: nullHandler(eq.magnitude?.value, Number),
          maxI: undefined,
          cancel: isCanceled,
          reportDateTime: rdt,
          DetailURL: [url],
          headline: "",
          axisData: null,
        });
      });
      if (isCanceled && EQData.length === 0 && eventIdsTmp.length > 0) {
        eventIdsTmp.forEach(function (eid) {
          EQData.push({
            status: "通常",
            eventId: eid,
            category: "Tsunami",
            OriginTime: null,
            epiCenter: null,
            M: null,
            maxI: undefined,
            cancel: true,
            reportDateTime: rdt,
            DetailURL: [url],
            headline: "",
            axisData: null,
          });
        });
      }
      if (EQData.length > 0) MargeEQInfo(EQData);
      tsunamiDataTmp.issue.EarthQuake = EQData;

      if (!isCanceled && validDateTimeTmp && Number(validDateTimeTmp) < (Date.now() - Replay) && !TsunamiValidate_bypass) {
        UpdateStatus("NaknQAPI", "success");
        NaknQAPI_Fetched.push(url);
        return;
      }

      var forecastItems = (Array.isArray(json.body?.forecasts) && json.body.forecasts.length > 0)
        ? json.body.forecasts
        : (Array.isArray(json.body?.estimations) ? json.body.estimations : []);

      for (const item of forecastItems) {
        var gradeTmp = null;
        var cancelledTmp = false;

        switch (item.category) {
          case "majorWarning":
            gradeTmp = "MajorWarning";
            break;
          case "warning":
            gradeTmp = "Warning";
            break;
          case "advisory":
            gradeTmp = "Watch";
            break;
          case "forecast":
            gradeTmp = "Yoho";
            break;
          case "none":
            cancelledTmp = true;
            break;
        }

        var firstHeightTmp = nullHandler(item.firstArrival?.time, (v) => new Date(v));
        var firstHeightConditionTmp = nullHandler(item.firstArrival?.conditionLabel);
        var maxHeightTmp = nullHandler(item.maxHeight?.label, (v) => String(v).normalize("NFKC"));
        var codeTmp = nullHandler(item.area?.code, Number);
        var name = nullHandler(item.area?.name);

        tsunamiDataTmp.areas.push({
          code: codeTmp,
          grade: gradeTmp,
          name: name,
          cancelled: cancelledTmp,
          firstHeight: firstHeightTmp,
          firstHeightCondition: firstHeightConditionTmp,
          stations: [],
          maxHeight: maxHeightTmp,
        });
      }

      if (Array.isArray(json.body?.observations)) {
        const initialMap = { push: "押し", pull: "引き" };
        for (const obs of json.body.observations) {
          var ArrivalTimeTmp = nullHandler(obs.firstArrival?.time, (v) => new Date(v));
          var firstHeightConditionTmp = nullHandler(obs.firstArrival?.conditionLabel);
          var firstHeightInitialTmp = initialMap[obs.firstArrival?.initial] ?? nullHandler(obs.firstArrival?.initial);
          var maxHeightTime = nullHandler(obs.maxHeight?.time, (v) => new Date(v));
          var maxHeightCondition = obs.maxHeight?.condition ? nullHandler(obs.maxHeight?.label) : null;
          var oMaxHeightTmp = (obs.maxHeight?.heightM != null || !obs.maxHeight?.condition)
            ? nullHandler(obs.maxHeight?.label, (v) => String(v).normalize("NFKC"))
            : null;
          var maxHeightRising = Boolean(obs.maxHeight?.rising);
          var nameTmp = nullHandler(obs.station?.name);
          var codeTmp = nullHandler(obs.station?.code);

          var stationData = {
            name: nameTmp,
            code: codeTmp,
            ArrivedTime: ArrivalTimeTmp,
            firstHeightCondition: firstHeightConditionTmp,
            firstHeightInitial: firstHeightInitialTmp,
            omaxHeight: oMaxHeightTmp,
            maxHeightRising: maxHeightRising,
            maxHeightTime: maxHeightTime,
            maxHeightCondition: maxHeightCondition,
          };
          if (obs.firstArrival) {
            stationData.firstHeight_obs = {
              arrivedTime: ArrivalTimeTmp,
              condition: firstHeightConditionTmp,
              initial: firstHeightInitialTmp,
            };
          }
          if (obs.maxHeight) {
            stationData.maxHeight_obs = {
              height: oMaxHeightTmp,
              time: maxHeightTime,
              condition: maxHeightCondition,
              rising: maxHeightRising,
            };
          }

          var areaName = (json.type == "VTSE52" || !obs.area?.name) ? "（海上）" : obs.area.name;
          var tsunamiItem = tsunamiDataTmp.areas.find(function (elm2) {
            return elm2.name == areaName;
          });
          if (tsunamiItem) {
            if (!Array.isArray(tsunamiItem.stations)) tsunamiItem.stations = [];
            var stationElm = tsunamiItem.stations.findIndex(function (elm3) {
              return elm3.name == stationData.name;
            });
            if (stationElm > -1) tsunamiItem.stations[stationElm] = Object.assign(tsunamiItem.stations[stationElm], stationData);
            else tsunamiItem.stations.push(stationData);
          } else {
            tsunamiDataTmp.areas.push({
              name: areaName,
              stations: [stationData],
            });
          }
        }
      }

      ConvertTsunamiInfo(tsunamiDataTmp);
    }
    UpdateStatus("NaknQAPI", "success");



    NaknQAPI_Fetched.push(url);
  }).catch((err) => {
    GeneralError_handler(err)
    UpdateStatus("NaknQAPI", "Error");
  });
}