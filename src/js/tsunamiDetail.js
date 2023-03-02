var data;
var RevocationTimer;

window.electronAPI.messageSend((event, request) => {
  if (request.action == "tsunamiUpdate") {
    tsunamiUpdate(request.data);
  }
});

function tsunamiUpdate(dataTmp) {
  var Tsunami_MajorWarning = (Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false);
  document.getElementById("dateTime").style.display = "block";
  document.getElementById("revocation").style.display = "none";
  document.getElementById("no-data").style.display = "none";

  document.getElementById("dateTime").innerText = dateEncode(3, new Date(dataTmp.issue.time));
  if (dataTmp.revocation) {
    document.getElementById("revocation").style.display = "block";
  } else if (!dataTmp || dataTmp.areas.length == 0) {
    document.getElementById("no-data").style.display = "table-row";
    document.getElementById("dateTime").style.display = "none";
  }
  document.querySelectorAll(".add-content").forEach(function (elm) {
    elm.remove();
  });

  //情報の有効期限
  if (dataTmp.ValidDateTime) {
    clearTimeout(RevocationTimer);
    console.log(dataTmp.ValidDateTime, new Date());
    RevocationTimer = setTimeout(function () {
      document.getElementById("revocation").style.display = "block";
      document.querySelectorAll(".add-content").forEach(function (elm) {
        elm.remove();
      });
    }, dataTmp.ValidDateTime - new Date());
  }
  dataTmp.areas.reverse();
  dataTmp.areas.forEach((elm) => {
    if (!elm.canceled) {
      var condition = "";
      var arrivalTime = "不明";
      if (elm.firstHeight) {
        arrivalTime = dateEncode(5, elm.firstHeight);
        if (elm.firstHeightCondition) {
          condition = elm.firstHeightCondition;
        }
      } else if (elm.firstHeightCondition) {
        arrivalTime = elm.firstHeightCondition;
      }

      var maxHeight = "不明";
      if (elm.maxHeight) {
        maxHeight = "<span class='TxtIcon'>観</span>" + elm.maxHeight;
      }
      var IconTxt = "";
      switch (elm.grade) {
        case "MajorWarning":
          Tsunami_MajorWarning = true;
          IconTxt = "大";
          break;
        case "Warning":
          Tsunami_Warning = true;
          IconTxt = "警";
          break;
        case "Watch":
          Tsunami_Watch = true;
          IconTxt = "注";
          break;
        case "Yoho":
          Tsunami_Yoho = true;
          arrivalTime = "<span class='disabled-wrap'>-</span>";
          if (!maxHeight) maxHeight = "若干の海面変動";
          IconTxt = "予";
          break;

        default:
          break;
      }

      var new_tr = document.createElement("tr");
      new_tr.innerHTML = "<td><div class='ListIcon_" + elm.grade + "'>" + IconTxt + "</div></td><td>" + elm.name + "</td><td>" + arrivalTime + "</td><td>" + maxHeight + "</td><td class='disabled-cell'>-</td><td>" + condition + "</td>";
      new_tr.classList.add("add-content");
      new_tr.classList.add("ListItem_" + elm.grade);
      document.getElementById(elm.grade + "Info").after(new_tr);

      if (elm.stations && Array.isArray(elm.stations)) {
        elm.stations.forEach(function (elm2) {
          var condition = "";
          var arrivalTime = "不明";
          var HighTideDateTime = "不明";
          var omaxHeight = "不明";

          if (elm2.Conditions) {
            condition = elm2.Conditions;
          }
          if (elm2.HighTideDateTime) {
            HighTideDateTime = dateEncode(5, elm2.HighTideDateTime);
          }
          if (elm2.omaxHeight) {
            omaxHeight = "<span class='TxtIcon'>予</span>" + elm2.omaxHeight;
            if (elm2.firstHeightInitial) {
              omaxHeight = "<span class='TxtIcon'>予</span>" + elm2.omaxHeight + " (" + elm2.firstHeightInitial + ")";
            }
          } else {
            omaxHeight = maxHeightCondition;
          }

          if (elm2.Condition == "第１波の到達を確認" || elm2.Condition == "津波到達中と推測") {
            arrivalTime = elm2.Condition;
          } else if (elm2.firstHeightCondition == "第１波識別不能") {
            arrivalTime = elm2.firstHeightCondition;
          } else if (elm2.ArrivedTime) {
            arrivalTime = dateEncode(5, elm2.ArrivedTime);
          } else if (elm2.ArrivalTime) {
            arrivalTime = dateEncode(5, elm2.ArrivalTime);
          }
          /*
                                firstHeightCondition: firstHeightConditionTmp,
                                firstHeightInitial: firstHeightInitialTmp,
                                maxHeightTime: maxheightTime,
                                maxHeightCondition: maxHeightCondition,
          */

          var new_tr2 = document.createElement("tr");

          new_tr2.innerHTML = "<td></td><td>" + elm2.name + "</td><td>" + arrivalTime + "</td><td>" + omaxHeight + "</td><td>" + HighTideDateTime + "</td><td>" + condition + "</td>";
          new_tr2.classList.add("add-content");
          new_tr2.classList.add("ListItem_detail");
          new_tr.after(new_tr2);
        });
      }
    }
  });

  document.getElementById("MajorWarningInfo").style.display = Tsunami_MajorWarning ? "table-row" : "none";
  document.getElementById("WarningInfo").style.display = Tsunami_Warning ? "table-row" : "none";
  document.getElementById("WatchInfo").style.display = Tsunami_Watch ? "table-row" : "none";
  document.getElementById("YohoInfo").style.display = Tsunami_Yoho ? "table-row" : "none";
}
