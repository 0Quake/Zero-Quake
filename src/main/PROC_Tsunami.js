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
export function ConvertTsunamiInfo(data) {

  try {
    if (!config.Info.TsunamiInfo.GetData) return;
    if (!config.Info.TsunamiInfo.showtraining && data.status == "訓練") return;
    if (!config.Info.TsunamiInfo.showTest && data.status == "試験") return;
    if (!data.issue || !data.issue.time) return;//発報時刻欠損は破棄
    if (Number(new Date(data.issue.time)) > (Date.now() - Replay)) return;//リプレイなどによって未来のデータが来たら破棄

    //同一報（同EIDかつ同じ時刻）
    let SameData = Tsunami_Data.find(function (elm) {
      return (Number(new Date(elm.issue.time)) == Number(new Date(data.issue.time)) &&
        (!elm.issue.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue.EventID, data.issue.EventID)));
    });

    if (SameData) {//同一報が既存ならマージ

      //各キーをコピー
      var keys = ["headline", "comment", "status", "cancelled", "ValidDateTime", "revocation"]
      keys.forEach(function (key) {
        if (Boolean2(data[key])) SameData[key] = data[key];
      });//同一報なのでcancelledなどのBool値も「Falsyでない場合のみ上書きする方法」でマージ

      if (data.issue.EventID) SameData.issue.EventID = data.issue.EventID;
      if (data.issue.EarthQuake) SameData.issue.EarthQuake = data.issue.EarthQuake;

      data.areas.forEach(function (elm) {
        var SameArea;
        if (Array.isArray(SameData.areas)) {
          SameArea = SameData.areas.find(function (elm2) {
            return elm2.name == elm.name || elm2.code == elm.code;
          });
        }

        if (!SameArea) {//同予報区のデータがないなら登録
          SameData.areas.push(elm);
        } else {//同予報区のデータがあるならマージ
          var keys = ["code", "grade", "cancelled", "firstHeight", "firstHeightCondition", "maxHeight"]
          keys.forEach(function (key) {
            if (elm[key]) SameArea[key] = elm[key];
          });

          if (elm.stations) {
            elm.stations.forEach(function (elm2) {
              var SameSta;
              if (Array.isArray(SameArea.stations)) {
                SameSta = SameArea.stations.find(function (elm3) {
                  return elm3.code == elm2.code || elm3.name == elm2.name;
                });
              }
              if (!SameSta) {//同観測点のデータがないなら登録
                SameArea.stations.push(elm2)
              } else {//同観測点のデータがあるならマージ
                Object.keys(elm2).forEach(function (key) {
                  if (Boolean2(elm2[key])) SameSta[key] = elm2[key];
                });
              }
            });
          }
        }
      });
    } else {
      Tsunami_Data.push(data);

      //アラートするかどうかの判定

      var GradeID = { "MajorWarning": 3, "Warning": 2, "Watch": 1, "Yoho": 0 };

      var home_grade = -1;//家地域にはなにも発表されていない「-1」
      //階級を数字に変換しつつ家の階級を調べる
      var grades = data.areas.map(function (elm) {
        if (config.home?.TsunamiSect && elm.name == config.home.TsunamiSect) {
          home_grade = GradeID[elm.grade];
        }
        return GradeID[elm.grade] || 0;
      });

      var max_grade = Math.max(...grades);

      if (config.Info.TsunamiInfo.NotificationSound) {
        //同EIDで最新の報かどうか
        let isNewest = !Tsunami_Data.find(function (elm) {
          return (new Date(elm.issue.time) > new Date(data.issue.time) &&
            (!elm.issue.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue.EventID, data.issue.EventID)));
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

    Tsunami_data_Marged = { issue: {}, areas: [] };
    let sortedTsunamiData = [...Tsunami_Data]
      .sort((a, b) => new Date(a.issue.time) - new Date(b.issue.time));//古→新（非破壊）
    //↑非破壊でソートしないと自動解除処理のTsunami_Data.forEach()内から呼んだときに競合

    sortedTsunamiData.forEach(function (elm0) {
      Tsunami_data_Marged.revocation = elm0.revocation;//キャンセル・失効は常に新しいものを優先
      Tsunami_data_Marged.cancelled = elm0.cancelled;
      if (elm0.revocation || elm0.cancelled) return;

      var keys = ["headline", "comment", "status", "cancelled", "ValidDateTime"]
      keys.forEach((key) => {
        if (elm0[key]) Tsunami_data_Marged[key] = elm0[key];
      })

      if (elm0.issue?.time) Tsunami_data_Marged.issue.time = elm0.issue.time;
      if (elm0.issue?.EventID) Tsunami_data_Marged.issue.EventID = elm0.issue.EventID;
      if (elm0.issue?.EarthQuake) Tsunami_data_Marged.issue.EarthQuake = elm0.issue.EarthQuake;

      elm0.areas.forEach(function (elm) {
        var SameArea;
        if (Array.isArray(Tsunami_data_Marged.areas)) {
          SameArea = Tsunami_data_Marged.areas.find(function (elm2) {
            return elm2.name == elm.name;
          });
        }
        if (SameArea) {
          var keys = ["code", "grade", "cancelled", "firstHeight", "firstHeightCondition", "maxHeight"]
          keys.forEach(function (key) {
            if (elm[key]) SameArea[key] = elm[key];
          });

          if (!elm.stations) {
            Tsunami_data_Marged.areas.push(elm);
          } else {
            elm.stations.forEach(function (elm2) {
              var SameSta;
              if (Array.isArray(SameArea.stations)) {
                SameSta = SameArea.stations.find(function (elm3) {
                  return elm3.name == elm2.name;
                });
              }

              if (!SameSta) {
                SameArea.stations.push(elm2);
              } else {
                Object.keys(elm2).forEach(function (key) {
                  if (Boolean2(elm2[key])) SameSta[key] = elm2[key];
                });
              }
            });
          }
        } else {
          Tsunami_data_Marged.areas.push(elm)
        }
      });
    });

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
    data.areas.forEach(function (area) {
      if (area.grade) {
        grades[area.grade] = true;
      }
      if (config.home.TsunamiSect && area.name == config.home.TsunamiSect) {
        homeArea = area;
      }
    });

    Object.keys(grades).forEach(function (key) {
      if (grades[key]) grade_arr.push(grades_JA[key]);
    });

    text = text.replaceAll("{max_grade}", grade_arr[0] || "津波情報");
    text = text.replaceAll("{all_grade}", grade_arr[0] ? grade_arr.join("、") : "津波情報");
    text = text.replaceAll("{report_time}", data.issue.time ? NormalizeDate(9, data.issue.time) : "不明な時刻");
    text = text.replaceAll("{headline}", data.headline || "");

    if (homeArea && !homeArea?.cancelled) {
      text = text.replaceAll("{home_area}", homeArea?.name || "設定地点");
      text = text.replaceAll("{home_grade}", grades_JA?.[homeArea?.grade] || "津波情報");

      var firstHeightTmp = "";
      if (homeArea?.firstHeight) {
        firstHeightTmp = `第１波が${NormalizeDate(9, homeArea?.firstHeight)}に予想され、`;
      } else if (homeArea?.firstHeightCondition == "津波到達中と推測") {
        firstHeightTmp = "津波が到達中とみられ、";
      } else if (homeArea?.firstHeightCondition == "第１波の到達を確認") {
        firstHeightTmp = "既に第１波が到達し、";
      } else {
        firstHeightTmp = "";
      }
      text = text.replaceAll("{first_height1}", firstHeightTmp);

      var firstHeightTmp2 = "";
      if (homeArea?.firstHeight) {
        firstHeightTmp2 = `到達予想時刻は${NormalizeDate(9, homeArea?.firstHeight)}`;
      } else if (homeArea?.firstHeightCondition == "津波到達中と推測") {
        firstHeightTmp2 = "津波到達中と推測";
      } else if (homeArea?.firstHeightCondition == "第１波の到達を確認") {
        firstHeightTmp2 = "第１波の到達を確認";
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
      if (homeArea?.maxHeight == "巨大") {
        MaxHeightTmp = "巨大な津波";
      } else if (homeArea?.maxHeight == "高い") {
        MaxHeightTmp = "高い津波";
      } else if (homeArea?.maxHeight) {
        MaxHeightTmp = `今後最大${String(homeArea?.maxHeight).replace("m", "メートル")}の津波`;
      } else if (!homeArea?.maxHeight && homeArea.grade == "Yoho") {
        MaxHeightTmp = "若干の海面変動";
      } else {
        MaxHeightTmp = "高さ不明の津波";
      }
      text = text.replaceAll("{max_height1}", MaxHeightTmp);

      var MaxHeightTmp2 = "";
      if (homeArea?.maxHeight == "巨大") {
        MaxHeightTmp2 = "巨大";
      } else if (homeArea?.maxHeight == "高い") {
        MaxHeightTmp2 = "高い";
      } else if (homeArea?.maxHeight) {
        MaxHeightTmp2 = String(homeArea?.maxHeight).replace("m", "メートル");
      } else if (!homeArea?.maxHeight && homeArea?.grade == "Yoho") {
        MaxHeightTmp2 = "若干の海面変動";
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

