const root = document.querySelector(":root");
const rootStyle = getComputedStyle(root);
var config;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "setting") {
    config = request.data;
  }
});

//タブUI
document.querySelectorAll(".tabmenu").forEach(function (elm) {
  elm.addEventListener("click", function () {
    //var containsTmp = !elm.classList.contains("active_tabmenu");

    document.querySelectorAll(".active_tabmenu").forEach(function (elm2) {
      elm2.classList.remove("active_tabmenu");
    });
    document.querySelectorAll(".active_tabcontent").forEach(function (elm2) {
      elm2.classList.remove("active_tabcontent");
    });
    //if (containsTmp) {
    elm.classList.add("active_tabmenu");
    document.getElementById(elm.dataset.contentid).classList.add("active_tabcontent");
    //}
  });
});
document.querySelectorAll(".tabgroup").forEach(function (elm) {
  elm.addEventListener("click", function () {
    //var containsTmp = !elm.classList.contains("active_tabmenu");

    document.querySelectorAll(".active_tabgroup").forEach(function (elm2) {
      elm2.classList.remove("active_tabgroup");
    });
    document.querySelectorAll(".active_tabgroupContent").forEach(function (elm2) {
      elm2.classList.remove("active_tabgroupContent");
    });
    //if (containsTmp) {
    elm.classList.add("active_tabgroup");
    document.getElementById(elm.dataset.contentid).classList.add("active_tabgroupContent");
    document.getElementById(elm.dataset.contentid).querySelector(".tabmenu").click();
    //}
  });
});

//震度フォーマット
//eslint-disable-next-line
function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (!str) {
    ShindoTmp = "?";
  } else if (isNaN(str)) {
    str = String(str);
    str = str.replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
    str = str.replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-");
    str = str.replace(/\s+/g, "");
    switch (str) {
      case "-1":
      case "?":
        ShindoTmp = "?";
        break;
      case "1":
      case "10":
        ShindoTmp = "1";
        break;
      case "2":
      case "20":
        ShindoTmp = "2";
        break;
      case "3":
      case "30":
        ShindoTmp = "3";
        break;
      case "4":
      case "40":
        ShindoTmp = "4";
        break;
      case "5-":
      case "45":
        ShindoTmp = "5-";
        break;
      case "5+":
      case "50":
        ShindoTmp = "5+";
        break;
      case "6-":
      case "55":
        ShindoTmp = "6-";
        break;
      case "6+":
      case "60":
        ShindoTmp = "6+";
        break;
      case "7":
      case "70":
        ShindoTmp = "7";
        break;
      case "99":
        ShindoTmp = "7+";
        break;
    }
  } else {
    if (str < 0.5) {
      ShindoTmp = "0";
    } else if (str < 1.5) {
      ShindoTmp = "1";
    } else if (str < 2.5) {
      ShindoTmp = "2";
    } else if (str < 3.5) {
      ShindoTmp = "3";
    } else if (str < 4.5) {
      ShindoTmp = "4";
    } else if (str < 5) {
      ShindoTmp = "5-";
    } else if (str < 5.5) {
      ShindoTmp = "5+";
    } else if (str < 6) {
      ShindoTmp = "6-";
    } else if (str < 6.5) {
      ShindoTmp = "6+";
    } else if (6.5 <= str) {
      ShindoTmp = "7";
    } else if (7.5 <= str) {
      ShindoTmp = "7+";
    } else {
      ShindoTmp = "?";
    }
  }
  if (["?", "0", "1", "2", "3", "4", "5-", "5+", "6-", "6+", "7", "7+"].includes(ShindoTmp)) {
    var ConvTable;
    switch (responseType) {
      case 1:
        ConvTable = { "?": "?", 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5弱", "5+": "5強", "6-": "6弱", "6+": "6強", 7: "7", "7+": "7以上" };
        break;
      case 2:
        ConvTable = {
          "?": [rootStyle.getPropertyValue("--IntTheme_Q_BgColor"), rootStyle.getPropertyValue("--IntTheme_Q_color")],
          0: [rootStyle.getPropertyValue("--IntTheme_0_BgColor"), rootStyle.getPropertyValue("--IntTheme_0_color")],
          1: [rootStyle.getPropertyValue("--IntTheme_1_BgColor"), rootStyle.getPropertyValue("--IntTheme_1_color")],
          2: [rootStyle.getPropertyValue("--IntTheme_2_BgColor"), rootStyle.getPropertyValue("--IntTheme_2_color")],
          3: [rootStyle.getPropertyValue("--IntTheme_3_BgColor"), rootStyle.getPropertyValue("--IntTheme_3_color")],
          4: [rootStyle.getPropertyValue("--IntTheme_4_BgColor"), rootStyle.getPropertyValue("--IntTheme_4_color")],
          "5-": [rootStyle.getPropertyValue("--IntTheme_5m_BgColor"), rootStyle.getPropertyValue("--IntTheme_5m_color")],
          "5+": [rootStyle.getPropertyValue("--IntTheme_5p_BgColor"), rootStyle.getPropertyValue("--IntTheme_5p_color")],
          "6-": [rootStyle.getPropertyValue("--IntTheme_6m_BgColor"), rootStyle.getPropertyValue("--IntTheme_6m_color")],
          "6+": [rootStyle.getPropertyValue("--IntTheme_6p_BgColor"), rootStyle.getPropertyValue("--IntTheme_6p_color")],
          7: [rootStyle.getPropertyValue("--IntTheme_7_BgColor"), rootStyle.getPropertyValue("--IntTheme_7_color")],
          "7+": [rootStyle.getPropertyValue("--IntTheme_7p_BgColor"), rootStyle.getPropertyValue("--IntTheme_7p_color")],
        };
        break;
      case 3:
        ConvTable = { "?": null, 0: null, 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5m", "5+": "5p", "6-": "6m", "6+": "6p", 7: "7", "7+": "7p" };
        break;
      case 4:
        ConvTable = { "?": null, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, "5-": 4.5, "5+": 5, "6-": 5.5, "6+": 6, 7: 7, "7+": 7.5 };
        break;
      case 5:
        ConvTable = { "?": 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, "5-": 6, "5+": 7, "6-": 8, "6+": 9, 7: 10, "7+": 11 };
        break;
      case 0:
      default:
        return ShindoTmp;
    }
    return ConvTable[ShindoTmp];
  } else {
    return str;
  }
}

//日時フォーマット
//eslint-disable-next-line
function dateEncode(type, dateTmp, inputtype) {
  if (inputtype == 1) {
    var str = String(dateTmp);
    const year = Number(str.substring(0, 4)); //2022
    const month = Number(str.substring(4, 6)); //2
    const day = Number(str.substring(6, 8)); //5
    const hour = Number(str.substring(8, 10)); //21
    const min = Number(str.substring(10, 12)); //0
    const sec = Number(str.substring(12, 14)); //0
    dateTmp = new Date(year, month - 1, day, hour, min, sec); //monthは0オリジン
  } else {
    dateTmp = new Date(dateTmp);
  }
  if (type == 1) {
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");
    return YYYY + MM + DD + hh + mm + ss;
  } else if (type == 2) {
    //YYYYMMDD
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    return YYYY + MM + DD;
  } else if (type == 3) {
    //YYYY/MM/DD HH:MM:SS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss;
  } else if (type == 4) {
    //YYYY/MM/DD HH:MM
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm;
  } else if (type == 5) {
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    return MM + "/" + DD + " " + hh + ":" + mm;
  } else {
    //free
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");

    type.replaceAll("YYYY", YYYY);
    type.replaceAll("MM", MM);
    type.replaceAll("DD", DD);
    type.replaceAll("hh", hh);
    type.replaceAll("mm", mm);
    type.replaceAll("ss", ss);

    return type;
  }
}

//子要素一括削除
//eslint-disable-next-line
function removeChild(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

//緯度経度フォーマット
//eslint-disable-next-line
function latitudeConvert(data) {
  // eslint-disable-line
  if (!isNaN(data)) {
    return Number(data);
  } else if (data.match(/N/)) {
    return Number(data.replace("N", ""));
  } else if (data.match(/S/)) {
    return 0 - Number(data.replace("S", ""));
  } else if (data.match(/E/)) {
    return Number(data.replace("E", ""));
  } else if (data.match(/W/)) {
    return 0 - Number(data.replace("W", ""));
  } else {
    return data;
  }
}
