const root = document.querySelector(":root");
const rootStyle = getComputedStyle(root);

document.querySelectorAll(".tabmenu").forEach(function (elm) {
  elm.addEventListener("mousedown", function () {
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
function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (!str) {
    ShindoTmp = "?";
  } else if (isNaN(str)) {
    ShindoTmp = String(str);
    ShindoTmp = ShindoTmp.replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
    ShindoTmp = ShindoTmp.replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-");
    ShindoTmp = ShindoTmp.replace(/\s+/g, "");
    switch (str) {
      case "-1":
      case "不明":
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
    switch (responseType) {
      case 1:
        var ConvTable = { "?": "不明", 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5弱", "5+": "5強", "6-": "6弱", "6+": "6強", 7: "7", "7+": "7以上" };
        return ConvTable[ShindoTmp];
        break;
      case 2:
        var ConvTable = {
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
        return ConvTable[ShindoTmp];
        break;
      case 3:
        var ConvTable = { "?": null, 0: null, 1: "1", 2: "2", 3: "3", 4: "4", "5-": "5-", "5+": "5p", "6-": "6-", "6+": "6p", 7: "7", "7+": "7p" };
        return ConvTable[ShindoTmp];
        break;
      case 4:
        var ConvTable = { "?": null, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, "5-": 4.5, "5+": 5, "6-": 5.5, "6+": 6, 7: 7, "7+": 7.5 };
        return ConvTable[ShindoTmp];
        break;

      case 0:
      default:
        return ShindoTmp;
        break;
    }
  } else {
    return str;
  }
}
