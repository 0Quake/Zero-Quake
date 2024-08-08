window.electronAPI.messageSend((event, request) => {
  if (request.action == "tsunamiUpdate") {
    tsunamiUpdate(request.data);
    document.getElementById("splash").style.display = "none";
  }
});

var mySectElm;
function tsunamiUpdate(dataTmp) {
  console.log(dataTmp);
  var Tsunami_MajorWarning = (Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false);
  document.getElementById("revocation").style.display = "none";
  document.getElementById("no-data").style.display = "none";

  if (dataTmp.revocation) document.getElementById("revocation").style.display = "block";
  else if (!dataTmp || dataTmp.areas.length == 0) {
    document.getElementById("no-data").style.display = "table-row";
    document.getElementById("dateTime").style.display = "none";
  }
  document.querySelectorAll(".add-content").forEach(function (elm) {
    elm.remove();
  });

  dataTmp.areas.reverse();
  dataTmp.areas.forEach((elm) => {
    if (!elm.canceled) {
      var condition = "";
      var arrivalTime = "";
      var maxHeight = "";
      if (elm.firstHeight) {
        arrivalTime = NormalizeDate(5, elm.firstHeight);
        if (elm.firstHeightCondition) condition = elm.firstHeightCondition;
      } else if (elm.firstHeightCondition) {
        if (elm.firstHeightCondition == "第１波の到達を確認") arrivalTime = "到達";
        else if (elm.firstHeightCondition == "津波到達中と推測") arrivalTime = "到達中と推測";
        else arrivalTime = elm.firstHeightCondition;
      }

      if (elm.maxHeight) {
        maxHeight = elm.maxHeight;
        if (maxHeight.match(/未満/)) maxHeight = "<" + maxHeight.replace("未満", "");
        else if (maxHeight.match(/超/)) maxHeight = ">" + maxHeight.replace("超", "");
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
      ihtml += "<td class='disabled-cell'>-</td>";
      ihtml += "<td>" + condition + "</td>";
      new_tr.innerHTML = ihtml;
      new_tr.classList.add("add-content");
      new_tr.classList.add("ListItem_" + elm.grade);
      new_tr.setAttribute("tabindex", "0");
      if (elm.grade) document.getElementById(elm.grade + "Info").after(new_tr);
      else document.getElementById("no-data").before(new_tr);
      if (config && config.home.TsunamiSect && elm.name == config.home.TsunamiSect) {
        mySectElm = new_tr;
        mySectElm.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(function () {
          mySectElm.focus();
        }, 100);
      }

      if (elm.stations && Array.isArray(elm.stations)) {
        elm.stations.forEach(function (elm2) {
          var condition = "";
          var arrivalTime = "-";
          var ArrivedTime = "";
          var HighTideDateTime = "";
          var omaxHeight = "";
          var maxHeightTime = "";

          if (elm2.Conditions) condition = elm2.Conditions;

          if (elm2.HighTideDateTime) HighTideDateTime = NormalizeDate(5, elm2.HighTideDateTime);

          if (elm2.omaxHeight) {
            omaxHeight = elm2.omaxHeight;
            if (elm2.firstHeightInitial) omaxHeight = elm2.omaxHeight + " " + elm2.firstHeightInitial;
          } else if (elm2.maxHeightCondition) omaxHeight = elm2.maxHeightCondition;

          if (elm2.maxheightRising) omaxHeight += "↗";

          if (elm2.maxHeightTime) maxHeightTime = NormalizeDate(5, elm2.maxHeightTime);

          if (elm2.ArrivedTime) ArrivedTime = NormalizeDate(5, elm2.ArrivedTime);
          else if (elm2.firstHeightCondition == "欠測") ArrivedTime = "欠測";
          else if (elm2.Condition == "第１波の到達を確認") ArrivedTime = "到達";
          else if (elm2.Condition == "津波到達中と推測") ArrivedTime = "到達と推測";
          else if (elm2.firstHeightCondition == "第１波識別不能") ArrivedTime = elm2.firstHeightCondition;
          if (elm2.firstHeightInitial) ArrivedTime += " " + elm2.firstHeightInitial;
          if (elm2.ArrivalTime) arrivalTime = NormalizeDate(5, elm2.ArrivalTime);

          var new_tr2 = document.createElement("tr");
          var ihtml = "";
          ihtml += "<td></td>";
          ihtml += "<td>" + elm2.name + "</td>";
          ihtml += "<td" + (arrivalTime ? " class='disabled-cell'" : "") + ">" + arrivalTime + "</td>";
          ihtml += "<td class='disabled-cell'>-</td>";
          ihtml += "<td>" + ArrivedTime + "</td>";
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

  document.querySelector(".TestNotes").style.display = dataTmp.status == "試験" ? "inline-block" : "none";
  document.querySelector(".trainingNotes").style.display = dataTmp.status == "訓練" ? "inline-block" : "none";
}
