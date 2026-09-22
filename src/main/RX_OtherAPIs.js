import path from "path";
import { fileURLToPath } from "url";
import electron from "electron";
const { app, shell, dialog } = electron;
import * as turf from "@turf/turf";
import { throttle, NormalizeDate, NormalizeShindo, newDate2, FERegion } from "./constants.js";
import { MainWindow, SettingWindow, Create_SettingWindow, messageToMainWindow, messageToSettingWindow } from "./windows.js";
import { MargeEQInfo, AlertEQInfo } from "./PROC_EQInfo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let otherCtx = {
  getConfig: () => ({}),
  getReplay: () => 0,
  getPackageVer: () => "",
  getPackageJson: () => null,
  getJMAInfoNumber: () => 20,
  getUSGSInfoNumber: () => 20,
  UpdateStatus: () => { },
  GeneralError_handler: () => { },
};

export function initOtherAPIsContext(ctx) {
  otherCtx = Object.assign(otherCtx, ctx);
}

const packageJson = {
  get version() {
    return otherCtx.getPackageJson?.()?.version || otherCtx.getPackageVer();
  },
};

const UpdateStatus = (...args) => otherCtx.UpdateStatus(...args);
const GeneralError_handler = (...args) => otherCtx.GeneralError_handler(...args);

export var update_data;
export var downloadURL;

//アップデートの確認
export var checkUpdate = throttle(async function (userAction) {
  const config = otherCtx.getConfig();
  const package_ver = otherCtx.getPackageVer();
  try {
    var UpdateError = function (err) {
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

    fetch(`https://api.github.com/repos/0quake/Zero-Quake/releases?_=${Number(new Date())}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
        return r.json();
      }).then((json) => {
        var latest_verTmp = String(json[0].tag_name).replace("v", "");

        var current_verTmp = packageJson.version;
        var latest_v = String(latest_verTmp).split(".").map(Number);
        var current_v = String(current_verTmp).split(".").map(Number);
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
        var update_available = false;
        if (latest_v[0] > current_v[0]) {
          update_available = true;
        } else if (latest_v[0] == current_v[0]) {
          if (latest_v[1] > current_v[1]) {
            update_available = true;
          } else if (latest_v[1] == current_v[1]) {
            if (latest_v[2] > current_v[2]) {
              update_available = true;
            }
          }
        }

        if (update_available && !userAction) {
          var options4 = {
            type: "question",
            title: "アプリケーションの更新",
            message: "Zero Quake で更新が利用可能です。",
            detail: `v.${current_verTmp} > v.${latest_verTmp}\n操作を選択してください。`,
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
          latest_version: latest_verTmp,
          current_version: current_verTmp,
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
    throw new Error("アップデートの確認で深刻なエラーが発生しました。");
  }
}, 2000);

//定期実行

export var usgsLastGenerated = 0;
export var Req_USGS = throttle(function () {
  const config = otherCtx.getConfig();
  const Replay = otherCtx.getReplay();
  const USGS_CurrentInfoNumber = otherCtx.getUSGSInfoNumber();
  fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=${USGS_CurrentInfoNumber}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var LastGenTmp = Number(json?.features?.[0]?.properties?.updated || new Date());
      if (!LastGenTmp) throw new Error("usgs.govが不正なデータを返しました。");
      if (usgsLastGenerated > LastGenTmp) throw new Error("usgs.govが古いデータを返しました。");

      usgsLastGenerated = LastGenTmp;

      var dataTmp2 = [];
      json.features.forEach(function (elm) {
        var FECode = FERegion.features.find(function (elm2) {
          return turf.booleanPointInPolygon(elm.geometry.coordinates, elm2);
        });

        var maxi;
        if (elm.properties.mmi !== null) maxi = elm.properties.mmi;

        var magTmp = elm?.properties?.mag;
        dataTmp2.push({
          eventId: elm.id,
          category: null,
          OriginTime: newDate2(elm?.properties?.time),
          epiCenter: FECode?.properties?.nameJA || "",
          M: magTmp ? (Math.round(magTmp * 10) / 10) : null,
          maxI: maxi,
          DetailURL: [elm.properties.url],
        });
      });
      dataTmp2 = dataTmp2.sort((a, b) => a.OriginTime > b.OriginTime ? -1 : 1);
      AlertEQInfo(dataTmp2, "usgs");
    }).catch((err) => {
      GeneralError_handler(err)
    });
}, 2000);

//narikakun地震情報API リスト取得→Req_Narikakun
export function Req_NarikakunList(count) {
  const config = otherCtx.getConfig();
  const Replay = otherCtx.getReplay();
  const JMA_CurrentInfoNumber = otherCtx.getJMAInfoNumber();
  fetch(`https://earthquake-api-v2.nakn.jp/api/v2/list?limit=${JMA_CurrentInfoNumber}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      if (!json || json.status != "ok" || !json.items) throw new Error("ntools APIが不正なデータかstatus≠okを返した。");

      var data_array = [];
      for (let item of json.items) {
        //if (!originTimeTmp) originTimeTmp = new Date(json.Head.TargetDateTime);　保留

        for (let elm of item.lists) {
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

      MargeEQInfo(data_array, count);

      UpdateStatus("ntool", "success");
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("ntool", "Error");
    });
}

