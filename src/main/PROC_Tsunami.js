import { Boolean2, IncludesDuplicates, NormalizeDate } from "./constants.js";
import { TsunamiWindow, CreateMainWindow, messageToMainWindow, PlayAudio, speak } from "./windows.js";
import { config, Replay } from "./state.js";

export function resetTsunamiData() {
  Tsunami_Data = [];
  Tsunami_data_Marged = null;
}

export var Tsunami_Data = [];
export var Tsunami_data_Marged;
export var TsunamiValidate_bypass = false;
function mergeStation(target, source) {
  if (!target || !source) return;
  Object.keys(source).forEach(function (key) {
    if (Boolean2(source[key])) target[key] = source[key];
  });
  var cond = source.firstHeightCondition || source.Condition;
  if (cond === "第１波の到達を確認" || cond === "津波到達中と推測") {
    target.ArrivalTime = null;
    target.ArrivedTime = null;
  }
  if (source.firstHeight_obs && typeof source.firstHeight_obs === "object") {
    target.ArrivedTime = source.firstHeight_obs.arrivedTime || null;
    target.firstHeightInitial = source.firstHeight_obs.initial || null;
    if (source.firstHeight_obs.condition) {
      target.firstHeightCondition = source.firstHeight_obs.condition;
    }
  }
  if (source.maxHeight_obs && typeof source.maxHeight_obs === "object") {
    target.maxHeightRising = Boolean(source.maxHeight_obs.rising);
    target.omaxHeight = source.maxHeight_obs.height || null;
    target.maxHeightTime = source.maxHeight_obs.time || null;
    target.maxHeightCondition = source.maxHeight_obs.condition || null;
  }
}

function mergeArea(target, source) {
  if (!target || !source) return;
  var keys = ["code", "grade", "cancelled", "firstHeight", "firstHeightCondition", "maxHeight"];
  keys.forEach(function (key) {
    if (source[key] !== undefined) target[key] = source[key];
  });

  if (source.firstHeightCondition === "第１波の到達を確認" || source.firstHeightCondition === "津波到達中と推測") {
    target.firstHeight = null;
  }
  if (source.grade === "Yoho") {
    target.firstHeight = null;
    target.firstHeightCondition = null;
    target.maxHeight = null;
  }

  if (Array.isArray(source.stations)) {
    if (!Array.isArray(target.stations)) target.stations = [];
    source.stations.forEach(function (sta) {
      if (!sta) return;
      var existing = target.stations.find(function (s) {
        return s && ((sta.code != null && s.code === sta.code) || (sta.name != null && s.name === sta.name));
      });
      if (!existing) {
        target.stations.push({ ...sta });
      } else {
        mergeStation(existing, sta);
      }
    });
  }
}

export function ConvertTsunamiInfo(data) {

  try {
    if (!config.Info?.TsunamiInfo?.GetData) return;
    if (!config.Info?.TsunamiInfo?.showtraining && data?.status == "訓練") return;
    if (!config.Info?.TsunamiInfo?.showTest && data?.status == "試験") return;
    if (!data || !data.issue || !data.issue.time) return;//発報時刻欠損は破棄
    if (Number(new Date(data.issue.time)) > (Date.now() - Replay)) return;//リプレイなどによって未来のデータが来たら破棄

    //同一報（同EIDかつ同じ時刻、かつ同title）
    let SameData = Tsunami_Data.find(function (elm) {
      return (Number(new Date(elm.issue?.time)) == Number(new Date(data.issue?.time)) &&
        (!elm.issue?.EventID || !data.issue?.EventID || IncludesDuplicates(elm.issue?.EventID, data.issue?.EventID)) &&
        (!elm.title || !data.title || elm.title === data.title));
    });

    if (SameData) {//同一報が既存ならマージ（重複登録防止）

      //各キーをコピー
      var keys = ["headline", "comment", "status", "cancelled", "ValidDateTime", "revocation", "Torikeshi", "title"]
      keys.forEach(function (key) {
        if (Boolean2(data[key])) SameData[key] = data[key];
      });//同一報なのでcancelledなどのBool値も「Falsyでない場合のみ上書きする方法」でマージ

      if (data.issue.EventID) SameData.issue.EventID = data.issue.EventID;
      if (data.issue.EarthQuake) SameData.issue.EarthQuake = data.issue.EarthQuake;

      if (Array.isArray(data.areas) && data.areas.length > 0) {
        data.areas.forEach(function (elm) {
          var SameArea;
          if (Array.isArray(SameData.areas)) {
            SameArea = SameData.areas.find(function (elm2) {
              return (elm.code != null && elm2.code === elm.code) ||
                     (elm.name != null && elm2.name === elm.name);
            });
          }

          if (!SameArea) {//同予報区のデータがないなら登録
            SameData.areas.push(elm);
          } else {
            mergeArea(SameArea, elm);
          }
        });
      }
    } else {
      Tsunami_Data.push(data);

      if (data.Torikeshi) {
        // 取消報の通知判定（最新の取消報であれば閾値に関わらず取消音声を再生）
        if (config.Info.TsunamiInfo.NotificationSound) {
          let isNewest = !Tsunami_Data.find(function (elm) {
            return (new Date(elm.issue.time) > new Date(data.issue.time) &&
              (!elm.issue.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue.EventID, data.issue.EventID)));
          });
          if (isNewest) {
            PlayAudio("TsunamiInfo");
            speak(GenerateTsunamiText(data));
            CreateMainWindow();
          }
        }
      } else {
        //アラートするかどうかの判定

        var GradeID = { "MajorWarning": 3, "Warning": 2, "Watch": 1, "Yoho": 0 };

        var home_grade = -1;//家地域にはなにも発表されていない「-1」
        //階級を数字に変換しつつ家の階級を調べる
        var grades = (Array.isArray(data.areas) ? data.areas : []).map(function (elm) {
          if (!elm || elm.cancelled) return 0;
          if (config.home?.TsunamiSect && elm.name == config.home.TsunamiSect) {
            home_grade = GradeID[elm.grade];
          }
          return GradeID[elm.grade] || 0;
        });

        var max_grade = Math.max(...grades, 0);

        if (config.Info?.TsunamiInfo?.NotificationSound) {
          //同EIDで最新の報かどうか
          let isNewest = !Tsunami_Data.find(function (elm) {
            return (new Date(elm.issue?.time) > new Date(data.issue.time) &&
              (!elm.issue?.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue?.EventID, data.issue.EventID)));
          });

          var Global_C = max_grade >= config.Info.TsunamiInfo.Global_threshold;
          var Local_C = home_grade >= config.Info.TsunamiInfo.Local_threshold;
          var Bypass_C = config.Info.TsunamiInfo.Bypass_threshold;
          if (isNewest && (Global_C || Local_C || Bypass_C)) {
            PlayAudio("TsunamiInfo");
            speak(GenerateTsunamiText(data));
            CreateMainWindow();
          }
        }
      }
    }

    Tsunami_data_Marged = { issue: {}, areas: [] };
    let sortedTsunamiData = [...Tsunami_Data]
      .sort((a, b) => new Date(a.issue.time) - new Date(b.issue.time));//古→新（非破壊）

    // 時系列ソート後のタイミングで、各電文に対する取消判定を実施
    // （自身の時刻より後に、同一情報単位の取消電文が存在するかどうかで判定）
    let activeTsunamiData = sortedTsunamiData.filter(function (elm, index, arr) {
      if (elm.Torikeshi) return false;
      for (let j = index + 1; j < arr.length; j++) {
        let next = arr[j];
        if (next.Torikeshi) {
          let sameTitle = !elm.title || !next.title || elm.title === next.title;
          let sameEvent = !elm.issue?.EventID?.length || !next.issue?.EventID?.length ||
            IncludesDuplicates(elm.issue?.EventID, next.issue?.EventID);
          let sameStatus = !elm.status || !next.status || elm.status === next.status;
          if (sameTitle && sameEvent && sameStatus) {
            return false; // より新しい時刻に同一情報単位の取消電文が存在するため無効
          }
        }
      }
      return true;
    });

    let latestRevocation = false;
    let latestCancelled = false;
    let latestTorikeshi = activeTsunamiData.length === 0 && sortedTsunamiData.some(elm => elm.Torikeshi && (config.Info?.TsunamiInfo?.showtraining || elm.status !== "訓練"));

    activeTsunamiData.forEach(function (elm0) {

      if (elm0.revocation) {
        latestRevocation = true;
        // 失効した報の予報区を解除扱いに更新
        if (Array.isArray(elm0.areas)) {
          elm0.areas.forEach(function (revokedArea) {
            var existing = Tsunami_data_Marged.areas.find(a => a.name == revokedArea.name || a.code == revokedArea.code);
            if (existing) {
              existing.cancelled = true;
            }
          });
        }
        return;
      }

      if (elm0.cancelled) {
        latestCancelled = true;
        // 全域解除電文等の場合
        if (Array.isArray(elm0.areas) && elm0.areas.length > 0) {
          elm0.areas.forEach(function (cancelledArea) {
            var existing = Tsunami_data_Marged.areas.find(a => a.name == cancelledArea.name || a.code == cancelledArea.code);
            if (existing) {
              existing.cancelled = true;
            }
          });
        } else {
          Tsunami_data_Marged.areas.forEach(a => { a.cancelled = true; });
        }
        return;
      }

      var keys = ["headline", "comment", "status", "ValidDateTime"];
      keys.forEach((key) => {
        if (elm0[key]) Tsunami_data_Marged[key] = elm0[key];
      });

      if (elm0.issue?.time) Tsunami_data_Marged.issue.time = elm0.issue.time;
      if (elm0.issue?.EventID) Tsunami_data_Marged.issue.EventID = elm0.issue.EventID;
      if (elm0.issue?.EarthQuake) Tsunami_data_Marged.issue.EarthQuake = elm0.issue.EarthQuake;

      if (Array.isArray(elm0.areas)) {
        elm0.areas.forEach(function (elm) {
          var SameArea;
          if (Array.isArray(Tsunami_data_Marged.areas)) {
            SameArea = Tsunami_data_Marged.areas.find(function (elm2) {
              return elm2.name == elm.name;
            });
          }
          if (SameArea) {
            mergeArea(SameArea, elm);
          } else {
            Tsunami_data_Marged.areas.push({
              ...elm,
              stations: Array.isArray(elm.stations) ? elm.stations.map(s => ({ ...s })) : []
            });
          }
        });
      }
    });

    // まだ有効なエリア（未解除）が残っているか
    const hasActiveAreas = Tsunami_data_Marged.areas.some(a => !a.cancelled);

    if (hasActiveAreas) {
      Tsunami_data_Marged.revocation = false;
      Tsunami_data_Marged.cancelled = false;
      Tsunami_data_Marged.Torikeshi = false;
    } else {
      Tsunami_data_Marged.Torikeshi = latestTorikeshi;
      Tsunami_data_Marged.revocation = latestRevocation;
      Tsunami_data_Marged.cancelled = latestCancelled || (!latestTorikeshi && !latestRevocation);
      Tsunami_data_Marged.areas = [];
    }

    messageToMainWindow({ action: "tsunamiUpdate", data: Tsunami_data_Marged });
    if (TsunamiWindow) {
      TsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: Tsunami_data_Marged,
      });
    }
  } catch (err) {
    throw new Error("津波情報の処理（マージ）でエラーが発生しました。", { cause: err });
  }
}


export function GenerateTsunamiText(data) {
  try {
    if (!data) return "";
    if (data.Torikeshi) {
      var text = config.notice.voice.TsunamiTorikeshi;
    } else if (data.revocation || data.cancelled) {
      var text = config.notice.voice.TsunamiRevocation;
    } else {
      var text = config.notice.voice.Tsunami;
    }
    var grades = { MajorWarning: false, Warning: false, Watch: false, Yoho: false, };
    var grades_JA = {
      MajorWarning: "大津波警報",
      Warning: "津波警報",
      Watch: "津波注意報",
      Yoho: "津波予報",
    };

    //自地域（カッコで） 最大波高さ
    var grade_arr = [];
    var homeArea;
    if (Array.isArray(data.areas)) {
      data.areas.forEach(function (area) {
        if (area && !area.cancelled && area.grade) {
          grades[area.grade] = true;
        }
        if (config.home?.TsunamiSect && area?.name == config.home.TsunamiSect) {
          homeArea = area;
        }
      });
    }

    Object.keys(grades).forEach(function (key) {
      if (grades[key]) grade_arr.push(grades_JA[key]);
    });

    text = text.replaceAll("{test}", data.status == "試験" ? "試験報、" : "");
    text = text.replaceAll("{training}", data.status == "訓練" ? "訓練報、" : "");

    text = text.replaceAll("{max_grade}", grade_arr[0] || "津波情報");
    text = text.replaceAll("{all_grade}", grade_arr[0] ? grade_arr.join("、") : "津波情報");
    text = text.replaceAll("{report_time}", data.issue?.time ? NormalizeDate(9, data.issue.time) : "不明な時刻");
    text = text.replaceAll("{headline}", data.headline || "");

    if (homeArea && !homeArea?.cancelled) {
      text = text.replaceAll("{home_area}", homeArea?.name || "設定地点");
      text = text.replaceAll("{home_grade}", grades_JA?.[homeArea?.grade] || "津波情報");

      var firstHeightTmp = "";
      if (homeArea?.firstHeightCondition == "津波到達中と推測") {
        firstHeightTmp = "津波が到達中とみられ、";
      } else if (homeArea?.firstHeightCondition == "第１波の到達を確認") {
        firstHeightTmp = "既に第１波が到達し、";
      } else if (homeArea?.firstHeight) {
        firstHeightTmp = `第１波が${NormalizeDate(9, homeArea?.firstHeight)}に予想され、`;
      } else {
        firstHeightTmp = "";
      }
      text = text.replaceAll("{first_height1}", firstHeightTmp);

      var firstHeightTmp2 = "";
      if (homeArea?.firstHeightCondition == "津波到達中と推測") {
        firstHeightTmp2 = "津波到達中と推測";
      } else if (homeArea?.firstHeightCondition == "第１波の到達を確認") {
        firstHeightTmp2 = "第１波の到達を確認";
      } else if (homeArea?.firstHeight) {
        firstHeightTmp2 = `到達予想時刻は${NormalizeDate(9, homeArea?.firstHeight)}`;
      } else {
        firstHeightTmp2 = "到達時刻は不明";
      }
      text = text.replaceAll("{first_height2}", firstHeightTmp2);

      var immediately = "";
      if (homeArea?.firstHeightCondition == "ただちに津波来襲と予測") {
        immediately = "ただちに津波が来襲すると予測されます。";
      }
      text = text.replaceAll("{immediately}", immediately);

      var MaxHeightTmp = "";
      if (homeArea?.grade == "Yoho") {
        MaxHeightTmp = "若干の海面変動";
      } else if (homeArea?.maxHeight == "巨大") {
        MaxHeightTmp = "巨大な津波";
      } else if (homeArea?.maxHeight == "高い") {
        MaxHeightTmp = "高い津波";
      } else if (homeArea?.maxHeight) {
        MaxHeightTmp = `今後最大${String(homeArea?.maxHeight).replace("m", "メートル")}の津波`;
      } else {
        MaxHeightTmp = "高さ不明の津波";
      }
      text = text.replaceAll("{max_height1}", MaxHeightTmp);

      var MaxHeightTmp2 = "";
      if (homeArea?.grade == "Yoho") {
        MaxHeightTmp2 = "若干の海面変動";
      } else if (homeArea?.maxHeight == "巨大") {
        MaxHeightTmp2 = "巨大";
      } else if (homeArea?.maxHeight == "高い") {
        MaxHeightTmp2 = "高い";
      } else if (homeArea?.maxHeight) {
        MaxHeightTmp2 = String(homeArea?.maxHeight).replace("m", "メートル");
      } else {
        MaxHeightTmp2 = "不明";
      }
      text = text.replaceAll("{max_height2}", MaxHeightTmp2);
    } else {
      text = text.replace(/\[.*?\]/g, "");
    }

    text = text.replace(/\[|\]/g, "");
    return text;
  } catch {
    return "";
  }
}

