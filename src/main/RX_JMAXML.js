import { JSDOM } from "jsdom";
const DomPsr = new (new JSDOM()).window.DOMParser();

import { throttle, NormalizeShindo, Boolean2, newDate2 } from "./constants.js";
import { NankaiWindow, HokkaidoSanrikuWindow, KatsudoJokyoWindow, messageToMainWindow } from "./windows.js";
import { MargeEQInfo, EQCount_process } from "./PROC_EQInfo.js";
import { ConvertTsunamiInfo, TsunamiValidate_bypass } from "./PROC_Tsunami.js";
import { Req_NarikakunList } from "./RX_OtherAPIs.js";

import {
  config,
  Replay,
  EQ_FetchCount,
  incEQFetchCount,
  JMA_CurrentInfoNumber,
  UpdateStatus,
  GeneralError_handler,
} from "./state.js";
const OneDayInMS = 1000 * 60 * 60 * 24;

var jmaXML_Fetched = [];

export function Req_JMA_gaikyo() {
  fetch(`https://www.data.jma.go.jp/svd/eqev/data/gaikyo/?_=${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      const doc = DomPsr.parseFromString(text, "text/html");
      var data = [];
      doc.querySelectorAll("ul.subMenu li a").forEach(function (elm) {
        var href = elm.getAttribute("href");
        if (href.includes("monthly/")) {
          var date = new Date(elm.textContent.substring(0, 4), elm.textContent.substring(5, 7) - 1 + 1, 0); //月の最終日を取得
          data.push({
            date: date,
            dateStr: `${elm.textContent.substring(0, 4)}/${elm.textContent.substring(5, 7)}`,
            title: "地震・火山月報（防災編）",
            headline: "地震・火山月報（防災編）",
            url: `https://www.data.jma.go.jp/svd/eqev/data/gaikyo/${href}`,
          });
        } else if (href.includes("press/") || href.includes("oshirase/")) {
          data.push({
            date: new Date(
              elm.textContent.substring(0, 4), elm.textContent.substring(5, 7) - 1, elm.textContent.substring(8, 10),
              elm.textContent.substring(11, 13), elm.textContent.substring(14, 16)),
            dateStr: `${elm.textContent.substring(0, 4)}/${elm.textContent.substring(5, 7)}/${elm.textContent.substring(8, 10)} ${elm.textContent.substring(11, 13)}:${elm.textContent.substring(14, 16)}`,
            title: "地震解説資料",
            headline: `地震解説資料\n${elm.textContent.substring(17).trim()}`,
            url: `https:${href}`,
          });
        } else if (href.includes("weekly/zenkoku/")) {
          var year = Number(elm.textContent.substring(0, 4));
          var year2 = Number(year);
          var number = Number(elm.textContent.substring(8, 10));
          if (number == 1 && Number(elm.textContent.substring(19, 21)) == 12) year -= 1;
          data.push({
            date0: new Date(year, elm.textContent.substring(19, 21) - 1, elm.textContent.substring(22, 24)),
            date: new Date(year2, elm.textContent.substring(31, 33) - 1, elm.textContent.substring(34, 36)),
            dateStr: `${year} / ${elm.textContent.substring(19, 21)} / ${elm.textContent.substring(22, 24)}～${elm.textContent.substring(31, 33)} / ${elm.textContent.substring(34, 36)}`,
            title: "週間地震概況（全国）",
            headline: `週間地震概況（全国）No.${number}`,
            url: `https://www.data.jma.go.jp/svd/eqev/data/gaikyo/${href}`,
          });
        } else if (href.includes("weekly/nt/")) {
          var year = Number(elm.textContent.substring(0, 4));
          var year2 = Number(year);
          var number = Number(elm.textContent.substring(8, 10));
          if (number == 1 && Number(elm.textContent.substring(19, 21)) == 12)
            year -= 1;
          data.push({
            date0: new Date(year, elm.textContent.substring(19, 21) - 1, elm.textContent.substring(22, 24)),
            date: new Date(year2, elm.textContent.substring(31, 33) - 1, elm.textContent.substring(34, 36)),
            dateStr: `${year} / ${elm.textContent.substring(19, 21)} / ${elm.textContent.substring(22, 24)}～${elm.textContent.substring(31, 33)} / ${elm.textContent.substring(34, 36)}`,
            title: "週間地震活動概況（南海トラフ周辺）",
            headline: `週間地震活動概況（南海トラフ周辺）No.${number}`,
            url: `https://www.data.jma.go.jp/svd/eqev/data/gaikyo/${href}`,
          });
        }
      });
      data.sort((a, b) => a.date < b.date ? 1 : -1);
      messageToMainWindow({ action: "Return_gaikyo", data: data });
    }).catch((err) => {
      GeneralError_handler(err);
      messageToMainWindow({ action: "Return_gaikyo", data: [] });
    });
}

export function Req_JMA_wepa() {
  fetch(`https://www.jma.go.jp/bosai/pacifictsunami/data/list.json?_=${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      messageToMainWindow({ action: "Return_wepa", data: json });
    }).catch((err) => {
      GeneralError_handler(err)
      messageToMainWindow({ action: "Return_wepa", data: [] });
    });
}

export const UpdateEQInfo_Tmp = throttle(function () {//ユーザー操作など一時
  UpdateEQInfoCore();
}, 2000);

var UpdateEQInfo_Timer;
export const UpdateEQInfo_Loop = function () {//ループ
  UpdateEQInfoCore();

  if (UpdateEQInfo_Timer) clearTimeout(UpdateEQInfo_Timer);
  UpdateEQInfo_Timer = setTimeout(function () {
    UpdateEQInfo_Loop();
  }, config.Info.EQInfo.Interval);
};
export function UpdateEQInfoCore() {
  try {
    Req_JMAXMLList(EQ_FetchCount, EQ_FetchCount == 0);
    Req_JMAJSONList();
    Req_NarikakunList(EQ_FetchCount);
  } catch (err) {
    throw new Error("地震情報の処理でエラーが発生しました。", { cause: err });
  }
  incEQFetchCount();
};

//気象庁XMLリスト取得→Req_JMAXML
export function Req_JMAXMLList(count, longFeed) {
  var url = `https://www.data.jma.go.jp/developer/xml/feed/${longFeed ? "eqvol_l.xml" : "eqvol.xml"}`
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      const xml = DomPsr.parseFromString(text, "text/xml");
      if (!xml || xml.getElementsByTagName("parsererror").length > 0) throw new Error("XMLのパースに失敗");
      var EQInfoCount = 0;
      Array.prototype.forEach.call(xml.getElementsByTagName("entry"), function (elm) {
        var url;
        var urlElm = elm.getElementsByTagName("id");
        if (urlElm && urlElm[0]) url = urlElm[0].textContent;
        if (!url) return;
        try {
          if (new URL(url).hostname !== "www.data.jma.go.jp") return;
        } catch (e) {
          return;
        }
        var title = elm.getElementsByTagName("title")?.[0]?.textContent;
        if (!title) return;
        if (
          title == "震度速報" ||
          title == "震源に関する情報" ||
          title == "震源・震度に関する情報" ||
          title == "長周期地震動に関する観測情報" ||
          title == "遠地地震に関する情報" ||
          title == "顕著な地震の震源要素更新のお知らせ"
        ) {
          if (EQInfoCount < JMA_CurrentInfoNumber) {
            Req_JMAXML(url, count);
          }
          if (title == "震源・震度に関する情報") EQInfoCount++; //「震源・震度に関する情報」の件数<=地震の数 のためカウント
        } else if (
          title == "津波情報a" ||
          title == "津波警報・注意報・予報a" ||
          title == "沖合の津波観測に関する情報" ||
          title == "北海道・三陸沖後発地震注意情報" ||
          title == "地震の活動状況等に関する情報" ||
          title == "地震回数に関する情報"
        )
          Req_JMAXML(url, count);
      });

      if (15 < JMA_CurrentInfoNumber && !longFeed) {//永久ループ防止で!longFeed必須
        Req_JMAXMLList(count, true)
      }

      var nankai = Array.from(xml.getElementsByTagName("entry")).find(function (elm) {
        var ttl = elm.getElementsByTagName("title")?.[0];
        return ttl && ttl.textContent.startsWith("南海トラフ地震関連解説情報");
      });

      if (nankai) {
        var nankaiUrl = nankai.getElementsByTagName("link")?.[0]?.getAttribute("href");
        if (nankaiUrl) Req_JMAXML(nankaiUrl);
      }

      Array.from(xml.getElementsByTagName("entry")).forEach(
        function (elm) {
          var ttl = elm.getElementsByTagName("title")?.[0];
          var updatedStr = elm.getElementsByTagName("updated")?.[0]?.textContent;
          var updatedTime = updatedStr ? new Date(updatedStr).getTime() : NaN;

          if (ttl && ttl.textContent.startsWith("南海トラフ地震臨時情報") && !Number.isNaN(updatedTime) && (Date.now() - updatedTime) <= 14 * OneDayInMS) {
            var href = elm.getElementsByTagName("link")?.[0]?.getAttribute("href");
            if (href) Req_JMAXML(href);
          }
        }
      );

      UpdateStatus("JMAXML", "success");
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("JMAXML", "Error");
    });
}

export function Req_JMAJSONList() {
  fetch("https://www.jma.go.jp/bosai/quake/data/list.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var HokkaidoSanrikuURL = json.find(function (el) {
        return el.ttl == "北海道・三陸沖後発地震注意情報"
      })
      if (HokkaidoSanrikuURL) Req_Hokkaidosanriku_JSON(`https://www.jma.go.jp/bosai/quake/data/${HokkaidoSanrikuURL.json}`)
    }).catch((err) => {
      GeneralError_handler(err)
    });
}

export function Req_Hokkaidosanriku_JSON(url) {
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var data = {
        title: "北海道・三陸沖後発地震注意情報",
        kind: json.Head?.InfoType,//発表/取消
        reportDate: newDate2(json.Head?.ReportDateTime), //時刻
        ControlDateTime: newDate2(json.Control?.DateTime),
        HeadLine: json.Head?.Headline?.Text, //要約
        Text: "",
        Appendix: "",
        Text2: "",
      };


      data.Text = json.Body?.EarthquakeInfo?.Text;
      data.Appendix = json.Body?.EarthquakeInfo?.Appendix;
      data.Text2 = json.Body?.Text;

      Process_Hokkaidosanriku(data)
    }).catch((err) => {
      GeneralError_handler(err)
    });
}

export function Process_Hokkaidosanriku(data) {
  var SameData = HokkaidoSanrikuInfoAll.find(function (el) {
    if (Number(new Date(el.reportDate)) !== Number(new Date(data.reportDate))) return false;
    if (el.ControlDateTime && data.ControlDateTime) {
      return Number(new Date(el.ControlDateTime)) === Number(new Date(data.ControlDateTime));
    }
    return !el.ControlDateTime && !data.ControlDateTime;
  });
  if (SameData) return;

  HokkaidoSanrikuInfoAll.push(data);
  HokkaidoSanrikuInfoAll = HokkaidoSanrikuInfoAll
    .sort(function (a, b) {
      var diff = Number(new Date(b.reportDate)) - Number(new Date(a.reportDate));
      return diff !== 0 ? diff : (Number(new Date(b.ControlDateTime || 0)) - Number(new Date(a.ControlDateTime || 0)));
    });

  messageToMainWindow({
    action: "HokkaidoSanrikuInfo",
    data: HokkaidoSanrikuInfoAll[0],
  });
  if (HokkaidoSanrikuWindow && HokkaidoSanrikuInfoAll[0] && data) {
    HokkaidoSanrikuWindow.webContents.send("message2", {
      action: "HokkaidoSanrikuInfo",
      data: HokkaidoSanrikuInfoAll[0],
    });
  }
}

//気象庁XML 取得・フォーマット変更→MargeEQInfo
export function Req_JMAXML(url, count) {
  if (!url || jmaXML_Fetched.includes(url)) return;

  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {

      const xml = DomPsr.parseFromString(text, "text/xml");
      if (!xml || xml.getElementsByTagName("parsererror").length > 0) throw new Error("XMLのパースに失敗");

      var titleElm = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("Title")?.[0];
      if (!titleElm) throw new Error("XML構造が不正です（Control/Title不在）");
      var title = titleElm.textContent;

      var rdtVal = Number(new Date(xml.getElementsByTagName("ReportDateTime")[0]?.textContent));
      if (Replay !== 0 && rdtVal > (Date.now() - Replay)) {
        //未来のデータ（リプレイ時）のため処理を中断し、取得済みリストにも入れない
        return;
      }
      jmaXML_Fetched.push(url);

      var cancel = (xml.getElementsByTagName("InfoType")[0]?.textContent || "").trim() == "取消";

      if (
        title == "震度速報" ||
        title == "震源に関する情報" ||
        title == "震源・震度に関する情報" ||
        title == "長周期地震動に関する観測情報" ||
        title == "遠地地震に関する情報" ||
        title == "顕著な地震の震源要素更新のお知らせ"
      ) {
        //地震情報
        var EarthquakeElm = xml.getElementsByTagName("Body")?.[0]?.getElementsByTagName("Earthquake")?.[0];
        var originTime;
        var epiCenterTmp;
        var magnitudeTmp;
        if (EarthquakeElm) {
          var OTimeStr = EarthquakeElm.getElementsByTagName("OriginTime")?.[0]?.textContent;
          if (OTimeStr) originTime = new Date(OTimeStr);
          epiCenterTmp = EarthquakeElm.getElementsByTagName("Name")?.[0]?.textContent;
          var magElm = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")?.[0];
          var magStr = magElm?.textContent;
          var magDesc = magElm?.getAttribute?.("description") || "";
          if (magStr) magnitudeTmp = Number(magStr);
          if (!Boolean2(magnitudeTmp)) {
            if (magDesc.includes("８を超える巨大地震")) {
              magnitudeTmp = "M8超";
            } else {
              magnitudeTmp = null;
            }
          }
        }

        var TgDateStr = xml.getElementsByTagName("TargetDateTime")?.[0]?.textContent
        if (TgDateStr && !originTime) originTime = new Date(TgDateStr);

        var IntElm = xml.getElementsByTagName("Body")?.[0]?.getElementsByTagName("Intensity")?.[0];
        var maxInt;
        var maxLgInt;
        if (IntElm) {
          var ObsElm = IntElm.getElementsByTagName("Observation")?.[0];
          maxInt = ObsElm?.getElementsByTagName("MaxInt")?.[0]?.textContent;
          maxLgInt = ObsElm?.getElementsByTagName("MaxLgInt")?.[0]?.textContent;
          if (maxInt == "[objectHTMLUnknownElement]") maxInt = null;
        }
        var headline = xml?.getElementsByTagName("Head")?.[0]?.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent;
        var cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;

        MargeEQInfo([{
          status: xml.getElementsByTagName("Status")?.[0]?.textContent,
          eventId: xml.getElementsByTagName("EventID")?.[0]?.textContent,
          category: xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("Title")?.[0]?.textContent,
          ControlDateTime: cdtStr ? new Date(cdtStr) : null,
          OriginTime: originTime,
          epiCenter: epiCenterTmp,
          M: magnitudeTmp,
          maxI: IntElm ? NormalizeShindo(maxInt) : undefined,
          maxLgInt: IntElm ? maxLgInt : undefined,
          cancel: Boolean(cancel),
          reportDateTime: new Date(
            xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent
          ),
          DetailURL: [url],
          headline: headline,
          axisData: null,
        }], count);
      } else if (title == "地震回数に関する情報") {
        var hourly = [];
        var std = [];
        var sum = null;
        if (xml.getElementsByTagName("EarthquakeCount")[0]) {
          xml.querySelectorAll("EarthquakeCount Item").forEach(function (el) {
            var type = el?.getAttribute("type")

            var StTimeStr = el?.getElementsByTagName("StartTime")?.[0]?.textContent
            var EnTimeStr = el?.getElementsByTagName("EndTime")?.[0]?.textContent
            var NumStr = el?.getElementsByTagName("Number")?.[0]?.textContent
            var FNumStr = el?.getElementsByTagName("FeltNumber")?.[0]?.textContent
            var StartTime = StTimeStr ? new Date(StTimeStr) : null;
            var EndTime = EnTimeStr ? new Date(EnTimeStr) : null;
            var _Number = (NumStr && Number(NumStr) !== -1) ? Number(NumStr) : null;
            var FeltNumber = (FNumStr && Number(FNumStr) !== -1) ? Number(FNumStr) : null;

            var data = {
              StartTime: StartTime,
              EndTime: EndTime,
              Number: _Number,
              FeltNumber: FeltNumber
            };

            if (type == "１時間地震回数") {
              hourly.push(data)
            } else if (type == "累積地震回数") {
              sum = data
            } else if (type == "地震回数") {
              std.push(data);
            }
          })
        }

        var headline = xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent;
        var Text = xml.querySelector("Body Text")?.textContent || "";
        var NextAdvisory = xml.querySelector("NextAdvisory")?.textContent || ""
        var FreeFormComment = xml.querySelector("Comments FreeFormComment")?.textContent || ""

        var rdtStr = xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent
        var rdt = newDate2(rdtStr);
        var isCancel = cancel || xml.getElementsByTagName("Status")?.[0]?.textContent == "取消";
        var cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;

        EQCount_process({
          ControlDateTime: cdtStr ? newDate2(cdtStr) : null,
          status: xml.getElementsByTagName("Status")?.[0]?.textContent,
          eventId: xml.getElementsByTagName("EventID")?.[0]?.textContent,
          category: xml.getElementsByTagName("Title")?.[0]?.textContent,
          cancel: Boolean(isCancel),
          reportDateTime: rdt,
          headline: headline || "",
          hourly: hourly,
          sum: sum,
          std: std,
          Text: Text,
          NextAdvisory: NextAdvisory,
          FreeFormComment: FreeFormComment
        })

      } else if (title == "南海トラフ地震関連解説情報" || title == "南海トラフ地震臨時情報") {
        var kind = xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("InfoType")?.[0]?.textContent;
        var status = xml.getElementsByTagName("Status")?.[0]?.textContent;
        var eventId = xml.getElementsByTagName("EventID")?.[0]?.textContent;

        var rdtStr = xml.getElementsByTagName("ReportDateTime")[0]?.textContent;
        var rdt = newDate2(rdtStr);

        var headline = xml.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent || "";

        var isCancel = kind == "取消";

        var cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;
        var data = {
          title: title, //南海トラフ地震関連解説情報など
          ControlDateTime: cdtStr ? newDate2(cdtStr) : null,
          eventId: eventId,
          status: status,//通常、訓練、試験
          kind: isCancel ? "取消" : null, //定例など
          reportKind: kind, //発表/取消
          reportDate: rdt, //時刻
          Serial: null,
          HeadLine: headline, //要約
          Text: "",
          Appendix: "",
          NextAdvisory: "",
          Text2: "",
          is_cancel: isCancel,
        };

        var SerialStr = xml.getElementsByTagName("Serial")?.[0]?.textContent;
        if (SerialStr) data.Serial = Number(SerialStr);

        var Body = xml.getElementsByTagName("Body")?.[0];
        if (Body) {
          var EarthQuakeInfo = Body.getElementsByTagName("EarthquakeInfo")[0];
          if (EarthQuakeInfo) {
            var infoSerialName = EarthQuakeInfo.getElementsByTagName("InfoSerial")?.[0]?.getElementsByTagName("Name")?.[0]?.textContent;
            var infoKindName = EarthQuakeInfo.getElementsByTagName("InfoKind")?.[0]?.textContent;
            if (!isCancel) {
              data.kind = infoSerialName || (title.startsWith("南海トラフ地震臨時情報") ? "臨時" : infoKindName);
            }
            data.Text = EarthQuakeInfo.getElementsByTagName("Text")?.[0]?.textContent || "";
            data.Appendix = EarthQuakeInfo.getElementsByTagName("Appendix")?.[0]?.textContent || "";
          }

          data.NextAdvisory = Body.getElementsByTagName("NextAdvisory")?.[0]?.textContent || "";

          var Text2Elm = Array.from(Body.children)
            .find(function (elm) { return elm.tagName == "Text"; });

          if (Text2Elm) data.Text2 = Text2Elm.textContent || "";
        }

        // 取消電文を受信した場合、同EventID（または直前の同種電文）の過去報を取り消し状態にする
        // 南海トラフ解説・臨時情報のキャンセルは、Serialが自分より若い（または同一）ものだけ遡る
        if (isCancel) {
          NankaiTroughInfoAll.forEach(function (prev) {
            if (prev.title == data.title && (!data.eventId || !prev.eventId || prev.eventId == data.eventId)) {
              if (data.Serial != null && prev.Serial != null) {
                if (prev.Serial <= data.Serial) {
                  prev.is_cancel = true;
                }
              } else if (new Date(prev.reportDate) <= new Date(data.reportDate)) {
                prev.is_cancel = true;
              }
            }
          });
        }

        NankaiTroughInfoAll.push(data);
        // 全体の取消状態を再評価（取消が先着し、旧報が後着した場合にも対応）
        NankaiTroughInfoAll.forEach(function (elm1) {
          if (elm1.is_cancel || elm1.reportKind == "取消") {
            NankaiTroughInfoAll.forEach(function (elm2) {
              if (elm2.title == elm1.title && (!elm1.eventId || !elm2.eventId || elm1.eventId == elm2.eventId)) {
                if (elm1.Serial != null && elm2.Serial != null) {
                  if (elm2.Serial <= elm1.Serial) elm2.is_cancel = true;
                }
              }
            });
          }
        });
        NankaiTroughInfoAll = NankaiTroughInfoAll
          .sort(function (a, b) {
            var diff = Number(new Date(b.reportDate)) - Number(new Date(a.reportDate));
            return diff !== 0 ? diff : (Number(new Date(b.ControlDateTime || 0)) - Number(new Date(a.ControlDateTime || 0)));
          });

        var teirei;
        var latestRinji = NankaiTroughInfoAll.find(function (elm) {
          if (!elm.title.startsWith("南海トラフ地震臨時情報")) return false;
          if (elm.is_cancel && elm.reportKind != "取消") return false;
          return true;
        });

        var rinji = null;
        if (latestRinji) {
          var offset = Number(new Date() - new Date(latestRinji.reportDate)) / OneDayInMS;
          if (latestRinji.reportKind == "取消") {
            if (offset <= 7) rinji = latestRinji;
          } else {
            var isValid = (
              (latestRinji.kind == "巨大地震警戒" && offset <= 14) ||
              (latestRinji.kind == "巨大地震注意" && offset <= 7) ||
              (latestRinji.kind == "調査中" && offset <= 7) ||
              (latestRinji.kind == "調査終了" && offset <= 7) ||
              ((latestRinji.kind == "臨時" || latestRinji.kind == "南海トラフ地震臨時情報") && offset <= 7)
            );
            if (isValid) rinji = latestRinji;
          }
        }
        if (rinji && rinji.reportKind != "取消") {
          teirei = NankaiTroughInfoAll.find(function (elm) {
            return (
              elm.title.startsWith("南海トラフ地震関連解説情報") &&
              !elm.is_cancel &&
              new Date(rinji.reportDate) <= new Date(elm.reportDate)
            );
          });
        } else {
          teirei = NankaiTroughInfoAll.find(function (elm) {
            return elm.title.startsWith("南海トラフ地震関連解説情報") && !elm.is_cancel;
          });
        }

        NankaiTroughInfo = { rinji: rinji, teirei: teirei };

        messageToMainWindow({
          action: "NankaiTroughInfo",
          data: NankaiTroughInfo,
        });

        if (NankaiWindow.window) {
          var data = NankaiWindow.type == "rinji" ? NankaiTroughInfo.rinji : NankaiTroughInfo.teirei;
          if (data) {
            NankaiWindow.window.webContents.send("message2", {
              action: "NankaiTroughInfo",
              data: data,
            });
          }
        }
      } else if (
        title == "津波情報a" ||
        title == "津波警報・注意報・予報a" ||
        title == "沖合の津波観測に関する情報"
      ) {
        //津波予報
        var tsunamiDataTmp;
        var EventID = (xml.getElementsByTagName("EventID")[0]?.textContent || "").trim().split(/\s+/).map(Number);
        var EQData = [];
        var status = xml.getElementsByTagName("Status")?.[0]?.textContent;
        var rdt = newDate2(xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent);
        Array.from(xml.getElementsByTagName("Earthquake")).forEach(function (elm, index) {
          var magElm = elm.getElementsByTagName("jmx_eb:Magnitude")?.[0];
          var magStr = magElm?.textContent;
          var magDesc = magElm?.getAttribute?.("description") || "";
          var magTmp = Number(magStr);
          if (!Boolean2(magTmp)) {
            if (magDesc.includes("８を超える巨大地震")) {
              magTmp = "M8超";
            } else {
              magTmp = null;
            }
          }
          var ECTmp = elm.getElementsByTagName("Name")?.[0]?.textContent;
          var odtStr = elm.getElementsByTagName("OriginTime")?.[0]?.textContent;
          var odt = newDate2(odtStr) || rdt;

          EQData.push({
            status: status,
            eventId: EventID[index],
            category: "Tsunami",
            OriginTime: odt,
            epiCenter: ECTmp,
            M: magTmp,
            maxI: undefined,
            cancel: Boolean(cancel),
            reportDateTime: rdt,
            DetailURL: [url],
            Headline: "",
            axisData: null,
          });
        });
        if (cancel && EQData.length === 0 && Array.isArray(EventID) && EventID.length > 0) {
          EventID.filter(Boolean).forEach(function (eid) {
            EQData.push({
              status: status,
              eventId: eid,
              category: "Tsunami",
              OriginTime: null,
              epiCenter: null,
              M: null,
              maxI: undefined,
              cancel: true,
              reportDateTime: rdt,
              DetailURL: [url],
              Headline: "",
              axisData: null,
            });
          });
        }
        MargeEQInfo(EQData, count);

        if (cancel) {
          var dateStr = xml.getElementsByTagName("Control")[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;
          var dateTime = dateStr ? new Date(dateStr) : null;
          var rdtStr = xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent;
          var rdt = dateTime || newDate2(rdtStr);
          var EventIDs = Array.isArray(EventID) ? EventID.map(Number) : [];

          tsunamiDataTmp = {
            title: title,
            status: xml.getElementsByTagName("Status")?.[0]?.textContent,
            issue: {
              time: rdt,
              EventID: EventIDs,
              EarthQuake: null,
            },
            areas: [],
            Torikeshi: true,
            cancelled: true,
            revocation: false,
            source: "jmaXML",
            ValidDateTime: null,
          };
        } else {
          var ValidDateTimeTmp = null;
          var VDateStr = xml.getElementsByTagName("ValidDateTime")?.[0]?.textContent ||
            xml.getElementsByTagNameNS("*", "ValidDateTime")?.[0]?.textContent;
          if (VDateStr) {
            ValidDateTimeTmp = new Date(VDateStr);
          } else {
            var rdtStr = xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent ||
              xml.getElementsByTagNameNS("*", "ReportDateTime")?.[0]?.textContent;
            if (rdtStr) {
              ValidDateTimeTmp = new Date(rdtStr);
              ValidDateTimeTmp.setHours(ValidDateTimeTmp.getHours() + 12);
            }
          }
          if (ValidDateTimeTmp && Number(ValidDateTimeTmp) < (Date.now() - Replay) && !TsunamiValidate_bypass) return;

          var headline = xml.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent || "";

          var Text1;
          var WarningComment = "";
          var FreeFormComment = "";
          var Comment_Joined = "";
          //付加文取得の不具合による処理停止を回避
          try {
            Text1 = xml.querySelector("Body  > Text")?.textContent || "";

            var cmt_el = xml.getElementsByTagName("Comments")[0];
            if (cmt_el) {
              WarningComment = cmt_el.getElementsByTagName("WarningComment")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent;
              FreeFormComment = cmt_el.getElementsByTagName("FreeFormComment")[0]?.textContent || "";
            }

            Comment_Joined = [Text1, WarningComment, FreeFormComment].filter(Boolean).join("\n\n")
          } catch { }

          //P2PのAPIとの整合性のため、津波情報においてのみ、Control > DateTimeを発表時刻として扱う
          var dateStr = xml.getElementsByTagName("Control")[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;
          var dateTime = dateStr ? new Date(dateStr) : null;

          tsunamiDataTmp = {
            title: title,
            status: xml.getElementsByTagName("Status")?.[0]?.textContent,
            issue: {
              time: dateTime,
              EventID: EventID,
              EarthQuake: EQData,
            },
            areas: [],
            revocation: false,
            headline: headline,
            comment: Comment_Joined,
            source: "jmaXML",
            ValidDateTime: ValidDateTimeTmp,
          };

          var tsunamiElm = xml.getElementsByTagName("Body")?.[0]?.getElementsByTagName("Tsunami")?.[0];
          var forecastElm = tsunamiElm?.getElementsByTagName("Forecast")?.[0];
          if (!forecastElm) forecastElm = tsunamiElm?.getElementsByTagName("Estimation")?.[0];


          for (const elm of (forecastElm?.getElementsByTagName("Item") || [])) {
            var gradeTmp = null;
            var cancelledTmp = false;

            var codeStr = elm.getElementsByTagName("Category")?.[0]?.getElementsByTagName("Kind")?.[0]?.getElementsByTagName("Code")?.[0]?.textContent;

            if (elm.getElementsByTagName("Category")[0]) {
              switch (Number(codeStr || 0)) {
                case 52:
                case 53:
                  gradeTmp = "MajorWarning";
                  break;
                case 51:
                  gradeTmp = "Warning";
                  break;
                case 62:
                  gradeTmp = "Watch";
                  break;
                case 71:
                case 72:
                case 73:
                  gradeTmp = "Yoho";
                  break;
                case 50:
                case 60:
                  cancelledTmp = true;
                  break;
              }
            }
            var firstHeightTmp = null;
            var firstHeightConditionTmp = null;
            var maxHeightTmp = null;

            var fHgtStr = elm.getElementsByTagName("FirstHeight")?.[0]?.getElementsByTagName("ArrivalTime")?.[0]?.textContent;
            if (fHgtStr) firstHeightTmp = new Date(fHgtStr);
            firstHeightConditionTmp = elm.getElementsByTagName("FirstHeight")?.[0]?.getElementsByTagName("Condition")?.[0]?.textContent || null;

            var maxHeightElm = elm.getElementsByTagName("MaxHeight")?.[0]?.getElementsByTagName("jmx_eb:TsunamiHeight");
            var mHeightStr = maxHeightElm?.[0]?.getAttribute("description");
            if (mHeightStr) {
              maxHeightTmp = mHeightStr
                .replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                  return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                });
            } else {
              maxHeightTmp = elm.getElementsByTagName("MaxHeight")?.[0]?.getElementsByTagName("Condition")?.[0]?.textContent || null;
            }


            var stations = [];
            if (elm.getElementsByTagName("Station")[0]) {
              Array.prototype.forEach.call(
                elm.getElementsByTagName("Station"),
                function (elm2) {
                  var ArrivalTimeTmp = null;
                  var ConditionTmp = null;
                  var highTideTimeTmp = null;
                  var nameTmp = elm2.getElementsByTagName("Name")?.[0]?.textContent || null;
                  var codeTmp = elm2.getElementsByTagName("Code")?.[0]?.textContent || null;

                  var highTideStr = elm2.getElementsByTagName("HighTideDateTime")?.[0]?.textContent;
                  if (highTideStr) highTideTimeTmp = new Date(highTideStr);

                  var fHeightElm = elm2.getElementsByTagName("FirstHeight")?.[0];
                  var arDateStr = fHeightElm?.getElementsByTagName("ArrivalTime")?.[0]?.textContent;
                  if (arDateStr) ArrivalTimeTmp = new Date(arDateStr);

                  ConditionTmp = fHeightElm?.getElementsByTagName("Condition")?.[0]?.textContent || elm2.getElementsByTagName("Condition")?.[0]?.textContent || null;

                  stations.push({
                    name: nameTmp,
                    code: codeTmp,
                    hasFirstHeight: Boolean(fHeightElm),
                    HighTideDateTime: highTideTimeTmp,
                    ArrivalTime: ArrivalTimeTmp,
                    Condition: ConditionTmp,
                  });
                }
              );
            }

            var areaElm = elm.getElementsByTagName("Area")?.[0];
            var areaCodeStr = areaElm?.getElementsByTagName("Code")?.[0]?.textContent;
            var codeTmp = areaCodeStr ? Number(areaCodeStr) : null;

            var name = areaElm?.getElementsByTagName("Name")?.[0]?.textContent || elm.getElementsByTagName("Name")?.[0]?.textContent || null;

            tsunamiDataTmp.areas.push({
              code: codeTmp,
              grade: gradeTmp,
              name: name,
              cancelled: cancelledTmp,
              firstHeight: firstHeightTmp,
              firstHeightCondition: firstHeightConditionTmp,
              stations: stations,
              maxHeight: maxHeightTmp,
            });
          }


          if (tsunamiElm?.getElementsByTagName("Observation")?.[0]) {
            for (const elm of (tsunamiElm.getElementsByTagName("Observation")?.[0]?.getElementsByTagName("Item") || [])) {
              var stations = [];
              if (elm.getElementsByTagName("Station")[0]) {

                for (const elm2 of elm.getElementsByTagName("Station") || []) {
                  var ArrivalTimeTmp = null;
                  var firstHeightConditionTmp = null;
                  var firstHeightInitialTmp = null;
                  var maxHeightTime = null;
                  var maxHeightCondition = null;
                  var oMaxHeightTmp = null;
                  var maxHeightRising = false;
                  var nameTmp = elm2.getElementsByTagName("Name")?.[0]?.textContent || null;

                  var fHeightElm = elm2.getElementsByTagName("FirstHeight")?.[0];
                  if (fHeightElm) {
                    var arTimeStr = fHeightElm.getElementsByTagName("ArrivalTime")?.[0]?.textContent;
                    if (arTimeStr) ArrivalTimeTmp = new Date(arTimeStr);
                    firstHeightConditionTmp = fHeightElm.getElementsByTagName("Condition")?.[0]?.textContent || null;
                    firstHeightInitialTmp = fHeightElm.getElementsByTagName("Initial")?.[0]?.textContent || null;
                  }
                  if (elm2.getElementsByTagName("MaxHeight")[0]) {
                    var maxHeightElm = elm2.getElementsByTagName("MaxHeight")?.[0]?.getElementsByTagName("jmx_eb:TsunamiHeight")?.[0];
                    if (maxHeightElm) {
                      var desc = maxHeightElm.getAttribute("description");
                      if (desc) {
                        oMaxHeightTmp = desc.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                        });
                      }
                      if (maxHeightElm.getAttribute("condition")) {
                        maxHeightRising = maxHeightElm.getAttribute("condition") === "上昇中";
                      }
                    }

                    var mhTimeStr = elm2.getElementsByTagName("MaxHeight")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;
                    if (mhTimeStr) maxHeightTime = new Date(mhTimeStr);

                    maxHeightCondition = elm2.getElementsByTagName("MaxHeight")?.[0]?.getElementsByTagName("Condition")?.[0]?.textContent || null;
                  }

                  var codeTmp = elm2.getElementsByTagName("Code")?.[0]?.textContent || null;
                  var hasFirstHeight = Boolean(fHeightElm);
                  var hasMaxHeight = Boolean(elm2.getElementsByTagName("MaxHeight")[0]);

                  stations.push({
                    name: nameTmp,
                    code: codeTmp,
                    hasFirstHeight: hasFirstHeight,
                    hasMaxHeight: hasMaxHeight,
                    ArrivedTime: ArrivalTimeTmp,
                    firstHeightCondition: firstHeightConditionTmp,
                    firstHeightInitial: firstHeightInitialTmp,
                    omaxHeight: oMaxHeightTmp,
                    maxHeightRising: maxHeightRising,
                    maxHeightTime: maxHeightTime,
                    maxHeightCondition: maxHeightCondition,
                  });
                }
              }

              var areaName = title == "沖合の津波観測に関する情報" ? "（海上）" : elm.getElementsByTagName("Name")[0]?.textContent;
              var tsunamiItem = tsunamiDataTmp.areas.find(function (elm2) {
                return elm2.name == areaName;
              });
              if (tsunamiItem) {
                if (!Array.isArray(tsunamiItem.stations)) tsunamiItem.stations = [];
                stations.forEach(function (elm2) {
                  var stationElm = tsunamiItem.stations.findIndex(function (elm3) {
                    return elm3.name == elm2.name;
                  });
                  if (stationElm > -1) tsunamiItem.stations[stationElm] = Object.assign(tsunamiItem.stations[stationElm], elm2);
                  else tsunamiItem.stations.push(elm2);
                });
              } else {
                tsunamiDataTmp.areas.push({
                  name: areaName,
                  stations: stations,
                });
              }

            }
          }

        }
        ConvertTsunamiInfo(tsunamiDataTmp);
      } else if (title == "北海道・三陸沖後発地震注意情報") {
        var kind = xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("InfoType")?.[0]?.textContent;
        var headline = xml.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent || "";
        var rdt = newDate2(xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent);
        var cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;
        var status = xml.getElementsByTagName("Status")?.[0]?.textContent || "通常";
        var data = {
          title: title, //北海道・三陸沖後発地震注意情報
          status: status,
          kind: kind,//発表/取消
          reportDate: rdt, //時刻
          ControlDateTime: cdtStr ? newDate2(cdtStr) : null,
          HeadLine: headline, //要約
          Text: "",
          Appendix: "",
          Text2: "",
        };

        var Body = xml.getElementsByTagName("Body")?.[0];
        var EarthQuakeInfo = Body?.getElementsByTagName("EarthquakeInfo")?.[0];
        data.Text = EarthQuakeInfo?.getElementsByTagName("Text")?.[0]?.textContent;
        data.Appendix = EarthQuakeInfo?.getElementsByTagName("Appendix")?.[0]?.textContent;

        var Text2Elm = Array.from(xml.getElementsByTagName("Body")?.[0]?.children || [])
          .find(function (elm) { return elm.tagName == "Text"; });
        data.Text2 = Text2Elm?.textContent;

        Process_Hokkaidosanriku(data)
      } else if (title == "地震の活動状況等に関する情報") {
        var headline = xml.getElementsByTagName("Headline")?.[0]?.getElementsByTagName("Text")?.[0]?.textContent || "";
        if (/^南海トラフ地震に関連する情報（(臨時|定例)）を発表します。$/.test(headline.trim())) return;//南海トラフ地震関連解説情報（移行措置電文）の重複をはじく

        var kind = xml.getElementsByTagName("Head")?.[0]?.getElementsByTagName("InfoType")?.[0]?.textContent;
        var rdt = newDate2(xml.getElementsByTagName("ReportDateTime")?.[0]?.textContent);
        var cdtStr = xml.getElementsByTagName("Control")?.[0]?.getElementsByTagName("DateTime")?.[0]?.textContent;

        var data = {
          title: title, //地震の活動状況等に関する情報
          ControlDateTime: cdtStr ? newDate2(cdtStr) : null,
          kind: kind,//発表/取消
          reportDate: rdt, //時刻
          HeadLine: headline, //要約
          Naming: null,
          NamingEn: null,
          Text: "",
          Comments: "",
        };

        var Body = xml.getElementsByTagName("Body")?.[0];
        data.Text = Body?.getElementsByTagName("Text")?.[0]?.textContent;

        var commentsEl = Body?.getElementsByTagName("Comments")?.[0];
        data.Comments = commentsEl?.getElementsByTagName("FreeFormComment")?.[0]?.textContent;

        var NamingElm = Body?.getElementsByTagName("Naming")?.[0]
        data.Naming = NamingElm?.textContent
        data.NamingEn = NamingElm?.getAttribute("english")

        KatsudoJokyoInfoAll.push(data);
        KatsudoJokyoInfoAll = KatsudoJokyoInfoAll
          .sort(function (a, b) {
            var diff = Number(new Date(b.reportDate)) - Number(new Date(a.reportDate));
            return diff !== 0 ? diff : (Number(new Date(b.ControlDateTime || 0)) - Number(new Date(a.ControlDateTime || 0)));
          });

        messageToMainWindow({
          action: "KatsudoJokyoInfo",
          data: KatsudoJokyoInfoAll[0],
        });

        if (KatsudoJokyoWindow && KatsudoJokyoInfoAll[0]) {
          KatsudoJokyoWindow.webContents.send("message2", {
            action: "KatsudoJokyoInfo",
            data: KatsudoJokyoInfoAll[0],
          });
        }

      }
      UpdateStatus("JMAXML", "success");
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("JMAXML", "Error");
    });
}

export var NankaiTroughInfo = { rinji: null, teirei: null };
export var NankaiTroughInfoAll = [];
export var HokkaidoSanrikuInfoAll = [];
export var KatsudoJokyoInfoAll = [];

//USGS 取得・フォーマット変更→MargeEQInfo
