var RevocationTimer;

window.electronAPI.messageSend((event, request) => {
  if (request.action == "tsunamiUpdate") {
    tsunamiUpdate(request.data);
    document.getElementById("splash").style.display = "none";
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
      var maxHeight = "不明";
      if (elm.firstHeight) {
        arrivalTime = dateEncode(5, elm.firstHeight);
        if (elm.firstHeightCondition) {
          condition = elm.firstHeightCondition;
        }
      } else if (elm.firstHeightCondition) {
        arrivalTime = elm.firstHeightCondition;
      }

      if (elm.maxHeight) {
        maxHeight = elm.maxHeight;
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
      var ihtml = "";
      ihtml += "<td><div class='ListIcon_" + elm.grade + "'>" + IconTxt + "</div></td>";
      ihtml += "<td>" + elm.name + "</td>";
      ihtml += "<td>" + arrivalTime + "</td>";
      ihtml += "<td>" + maxHeight + "</td>";
      ihtml += "<td class='disabled-cell'>-</td>";
      ihtml += "<td class='disabled-cell'>-</td>";
      ihtml += "<td class='disabled-cell'>-</td>";
      ihtml += "<td></td>";
      ihtml += "<td>" + condition + "</td>";
      new_tr.innerHTML = ihtml;
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
            omaxHeight = elm2.omaxHeight;
            if (elm2.firstHeightInitial) {
              omaxHeight = elm2.omaxHeight + " (" + elm2.firstHeightInitial + ")";
            }
          } else {
            omaxHeight = maxHeightCondition;
          }
          if (elm2.maxHeightTime) {
            maxHeightTime = dateEncode(5, elm2.maxHeightTime);
          }

          if (elm2.ArrivedTime) {
            arrivalTime = dateEncode(5, elm2.ArrivedTime);
          } else if (elm2.Condition == "到達" || elm2.Condition == "到達中と推測") {
            arrivalTime = elm2.Condition;
          } else if (elm2.firstHeightCondition == "識別不能") {
            arrivalTime = elm2.firstHeightCondition;
          }
          if (elm2.firstHeightInitial) arrivalTime += " (" + elm2.firstHeightInitial + ")";

          var new_tr2 = document.createElement("tr");

          var ihtml = "";
          ihtml += "<td></td>";
          ihtml += "<td>" + elm2.name + "</td>";
          ihtml += "<td class='disabled-cell'>-</td>";
          ihtml += "<td class='disabled-cell'>-</td>";

          ihtml += "<td>" + arrivalTime + "</td>";
          ihtml += "<td>" + omaxHeight + "</td>";
          ihtml += "<td>" + maxHeightTime + "</td>";
          ihtml += "<td>" + HighTideDateTime + "</td>";
          ihtml += "<td>" + condition + "</td>";
          new_tr2.innerHTML = ihtml;

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
