window.electronAPI.messageSend((event, request) => {
  if (request.action == "tsunamiUpdate") {
    tsunamiUpdate(request.data);
    document.getElementById("splash").style.display = "none";
  }
});

var mySectElm;
function tsunamiUpdate(dataTmp) {
  var Tsunami_MajorWarning = (Tsunami_Warning = Tsunami_Watch = Tsunami_Yoho = false);
  document.getElementById("revocation").style.display = "none";
  document.getElementById("no-data").style.display = "none";

  if (dataTmp.revocation) document.getElementById("revocation").style.display = "block";
  else if (!dataTmp || dataTmp.areas.length == 0) {
    document.getElementById("no-data").style.display = "table-row";
  }

  if (dataTmp.issue.time) document.getElementById("dateTime").textContent = NormalizeDate(5, dataTmp.issue.time);
  if (dataTmp.ValidDateTime) document.getElementById("validdateTime").textContent = NormalizeDate(5, dataTmp.ValidDateTime);

  if (dataTmp.comment) {
    document.getElementById("headline").innerText = dataTmp.headline;
    document.getElementById("comment").innerText = dataTmp.comment;
  }

  document.querySelectorAll(".add-content").forEach(function (elm) {
    elm.remove();
  });

  var has_condition = false;
  var has_tide = false;
  var has_obs = false;
  dataTmp.areas.reverse();
  dataTmp.areas.forEach((elm) => {
    if (!elm.canceled) {
      var condition = "";
      var arrivalTime = "";
      var maxHeight = "";
      var maxHeightStr = "";
      if (elm.firstHeight) {
        arrivalTime = NormalizeDate(10, elm.firstHeight);
        if (elm.firstHeightCondition == "早いところでは既に津波到達と推定") condition = "早いところでは到達と推定";
        else if (elm.firstHeightCondition) condition = elm.firstHeightCondition;
      } else if (elm.firstHeightCondition) {
        if (elm.firstHeightCondition == "第１波の到達を確認") arrivalTime = "到達";
        else if (elm.firstHeightCondition == "津波到達中と推測") arrivalTime = "到達中と推測";
        else arrivalTime = elm.firstHeightCondition;
      }
      if (condition) has_condition = true;

      if (elm.maxHeight) {
        maxHeight = elm.maxHeight;
        maxHeightStr = elm.maxHeight.replace("m", "メートル");
        if (maxHeight.match(/未満/)) maxHeight = "<" + maxHeight.replace("未満", "");
        else if (maxHeight.match(/超/)) maxHeight = ">" + maxHeight.replace("超", "");
      }
      var IconTxt = "";
      var FullTxt = "";
      switch (elm.grade) {
        case "MajorWarning":
          Tsunami_MajorWarning = true;
          IconTxt = "大";
          FullTxt = "大津波警報";
          break;
        case "Warning":
          Tsunami_Warning = true;
          IconTxt = "警";
          FullTxt = "津波警報";
          break;
        case "Watch":
          Tsunami_Watch = true;
          IconTxt = "注";
          FullTxt = "津波注意報";
          break;
        case "Yoho":
          Tsunami_Yoho = true;
          if (!maxHeight) {
            maxHeight = "若干の海面変動";
            maxHeightStr = "若干の海面変動";
          }
          IconTxt = "予";
          FullTxt = "津波予報";
          break;
      }

      var new_tr = document.createElement("tr");
      var ihtml = "";
      ihtml += "<td aria-hidden='true'><div class='ListIcon_" + elm.grade + "'>" + IconTxt + "</div></td>";
      ihtml += "<td aria-label='予報区：" + elm.name + "、" + FullTxt + "発表中'>" + elm.name + "</td>";
      ihtml += "<td " + (arrivalTime ? `aria-label='予想第一波時刻：${arrivalTime}'` : "aria-hidden='true'") + ">" + (arrivalTime ? arrivalTime : "<span class='disabled-wrap'>-</span>") + "</td>";
      ihtml += "<td " + (maxHeight ? `aria-label='予想最大波高さ：${maxHeightStr}'` : "aria-hidden='true'") + ">" + maxHeight + "</td>";
      ihtml += "<td aria-hidden='true' class='obs_item'></td>";
      ihtml += "<td aria-hidden='true' class='obs_item'></td>";
      ihtml += "<td aria-hidden='true' class='tide_item'></td>";
      ihtml += "<td " + (condition ? `aria-label='${condition}'` : "aria-hidden='true'") + " class='condition_item'>" + condition + "</td>";
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

      if (elm.stations && Array.isArray(elm.stations) && elm.stations[0]) {
        document.querySelectorAll(".obs_item").forEach(function (elm) {
          elm.style.display = "";
        });

        elm.stations.forEach(function (elm2) {
          var condition = "";
          var arrivalTime = "";
          var ArrivedTime = "";
          var HighTideDateTime = "";
          var omaxHeight = "";
          var maxHeightTime = "";
          var rising = "";
          var risingStr = "";

          if (elm2.Conditions) condition = elm2.Conditions;

          if (condition) has_condition = true;

          if (elm2.HighTideDateTime) HighTideDateTime = NormalizeDate(6, elm2.HighTideDateTime);
          if (HighTideDateTime) has_tide = true;

          if (elm2.omaxHeight) {
            omaxHeight = elm2.omaxHeight;
            if (elm2.firstHeightInitial) omaxHeight = elm2.omaxHeight + " " + elm2.firstHeightInitial;
          } else if (elm2.maxHeightCondition && elm2.maxHeightCondition.includes("観測中")) omaxHeight = "観測中";
          else if (elm2.maxHeightCondition && elm2.maxHeightCondition.includes("微弱")) omaxHeight = "微弱";
          else if (elm2.maxHeightCondition && elm2.maxHeightCondition.includes("欠測")) omaxHeight = "欠測";
          else if (elm2.maxHeightCondition) omaxHeight = elm2.maxHeightCondition;
          if (elm2.maxHeightRising) {
            rising = " <span class='rising'>上昇中↗</span>";
            risingStr = "上昇中";
          }
          if (elm2.maxHeightTime) maxHeightTime = "（" + NormalizeDate(10, elm2.maxHeightTime) + "）";

          if (elm2.ArrivedTime) ArrivedTime = NormalizeDate(10, elm2.ArrivedTime);
          else if (elm2.firstHeightCondition == "欠測") ArrivedTime = "欠測";
          else if (elm2.Condition == "第１波の到達を確認") ArrivedTime = "到達";
          else if (elm2.Condition == "津波到達中と推測") ArrivedTime = "到達と推測";
          else if (elm2.firstHeightCondition == "第１波識別不能") ArrivedTime = elm2.firstHeightCondition;
          if (elm2.firstHeightInitial) ArrivedTime += " " + elm2.firstHeightInitial;
          if (elm2.ArrivalTime) arrivalTime = NormalizeDate(10, elm2.ArrivalTime);

          var new_tr2 = document.createElement("tr");
          var ihtml = "";
          ihtml += "<td aria-hidden='true'></td>";
          ihtml += "<td aria-label='観測点：" + elm2.name + "'>" + elm2.name + "</td>";
          ihtml += "<td " + (arrivalTime ? `aria-label='第一波予想：${arrivalTime}'` : "aria-hidden='true'") + ">" + arrivalTime + "</td>";
          ihtml += "<td aria-hidden='true'></td>";
          ihtml += "<td class='obs_item' " + (ArrivedTime ? `aria-label='第一波観測：${ArrivedTime}'` : "aria-hidden='true'") + ">" + ArrivedTime + "</td>";
          ihtml += "<td class='obs_item'" + (omaxHeight || maxHeightTime || rising ? `aria-label='最大波観測：${omaxHeight}、${maxHeightTime}、${risingStr}'` : "aria-hidden='true'") + ">" + omaxHeight + maxHeightTime + rising + "</td>";
          ihtml += "<td class='tide_item'" + (HighTideDateTime ? `aria-label='満潮時刻：${HighTideDateTime}'` : "aria-hidden='true'") + ">" + HighTideDateTime + "</td>";
          ihtml += "<td class='condition_item'" + (condition ? `aria-label='コメント：${condition}'` : "aria-hidden='true'") + ">" + condition + "</td>";
          new_tr2.innerHTML = ihtml;
          new_tr2.setAttribute("tabindex", 0);

          if (ArrivedTime || omaxHeight || maxHeightTime || rising) has_obs = true;

          new_tr2.classList.add("add-content");
          new_tr2.classList.add("ListItem_detail");
          new_tr.after(new_tr2);
        });
      }
    }
  });

  document.querySelectorAll(".obs_item").forEach(function (elm) {
    elm.style.display = has_obs ? "" : "none";
  });
  document.querySelectorAll(".condition_item").forEach(function (elm) {
    elm.style.display = has_condition ? "" : "none";
  });
  document.querySelectorAll(".tide_item").forEach(function (elm) {
    elm.style.display = has_tide ? "" : "none";
  });

  document.getElementById("MajorWarningInfo").style.display = Tsunami_MajorWarning ? "table-row" : "none";
  document.getElementById("WarningInfo").style.display = Tsunami_Warning ? "table-row" : "none";
  document.getElementById("WatchInfo").style.display = Tsunami_Watch ? "table-row" : "none";
  document.getElementById("YohoInfo").style.display = Tsunami_Yoho ? "table-row" : "none";

  document.querySelector(".TestNotes").style.display = dataTmp.status == "試験" ? "inline-block" : "none";
  document.querySelector(".trainingNotes").style.display = dataTmp.status == "訓練" ? "inline-block" : "none";
}
