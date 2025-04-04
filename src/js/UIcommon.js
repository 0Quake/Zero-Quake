const root = document.querySelector(":root");

var config;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "setting") {
    config = request.data;
    SetShindoColor();
  }
});

function SetShindoColor() {
  root.style.setProperty("--IntTheme_Q_BgColor", config.color.Shindo["?"].background);
  root.style.setProperty("--IntTheme_0_BgColor", config.color.Shindo["0"].background);
  root.style.setProperty("--IntTheme_1_BgColor", config.color.Shindo["1"].background);
  root.style.setProperty("--IntTheme_2_BgColor", config.color.Shindo["2"].background);
  root.style.setProperty("--IntTheme_3_BgColor", config.color.Shindo["3"].background);
  root.style.setProperty("--IntTheme_4_BgColor", config.color.Shindo["4"].background);
  root.style.setProperty("--IntTheme_5m_BgColor", config.color.Shindo["5m"].background);
  root.style.setProperty("--IntTheme_5p_BgColor", config.color.Shindo["5p"].background);
  root.style.setProperty("--IntTheme_6m_BgColor", config.color.Shindo["6m"].background);
  root.style.setProperty("--IntTheme_6p_BgColor", config.color.Shindo["6p"].background);
  root.style.setProperty("--IntTheme_7_BgColor", config.color.Shindo["7"].background);

  root.style.setProperty("--IntTheme_Q_color", config.color.Shindo["?"].color);
  root.style.setProperty("--IntTheme_0_color", config.color.Shindo["0"].color);
  root.style.setProperty("--IntTheme_1_color", config.color.Shindo["1"].color);
  root.style.setProperty("--IntTheme_2_color", config.color.Shindo["2"].color);
  root.style.setProperty("--IntTheme_3_color", config.color.Shindo["3"].color);
  root.style.setProperty("--IntTheme_4_color", config.color.Shindo["4"].color);
  root.style.setProperty("--IntTheme_5m_color", config.color.Shindo["5m"].color);
  root.style.setProperty("--IntTheme_5p_color", config.color.Shindo["5p"].color);
  root.style.setProperty("--IntTheme_6m_color", config.color.Shindo["6m"].color);
  root.style.setProperty("--IntTheme_6p_color", config.color.Shindo["6p"].color);
  root.style.setProperty("--IntTheme_7_color", config.color.Shindo["7"].color);

  root.style.setProperty("--LngIntTheme_Q_BgColor", config.color.LgInt["?"].background);
  root.style.setProperty("--LngIntTheme_1_BgColor", config.color.LgInt["1"].background);
  root.style.setProperty("--LngIntTheme_2_BgColor", config.color.LgInt["2"].background);
  root.style.setProperty("--LngIntTheme_3_BgColor", config.color.LgInt["3"].background);
  root.style.setProperty("--LngIntTheme_4_BgColor", config.color.LgInt["4"].background);

  root.style.setProperty("--LngIntTheme_Q_color", config.color.LgInt["?"].color);
  root.style.setProperty("--LngIntTheme_1_color", config.color.LgInt["1"].color);
  root.style.setProperty("--LngIntTheme_2_color", config.color.LgInt["2"].color);
  root.style.setProperty("--LngIntTheme_3_color", config.color.LgInt["3"].color);
  root.style.setProperty("--LngIntTheme_4_color", config.color.LgInt["4"].color);

  root.style.setProperty("--TsunamiMajorWarningColor", config.color.Tsunami.TsunamiMajorWarningColor);
  root.style.setProperty("--TsunamiWarningColor", config.color.Tsunami.TsunamiWarningColor);
  root.style.setProperty("--TsunamiWatchColor", config.color.Tsunami.TsunamiWatchColor);
  root.style.setProperty("--TsunamiYohoColor", config.color.Tsunami.TsunamiYohoColor);
}

window.addEventListener("load", function () {
  document.querySelectorAll(".tabmenu").forEach(function (elm2) {
    elm2.setAttribute("aria-selected", elm2.classList.contains("active_tabmenu"));
  });
});
//タブUI
document.querySelectorAll(".tabmenu").forEach(function (elm) {
  elm.addEventListener("click", function () {
    var id = this.getAttribute("id").split("_")[0];

    document.querySelectorAll("#" + id + "_bar .active_tabmenu").forEach(function (elm2) {
      elm2.classList.remove("active_tabmenu");
      elm2.setAttribute("aria-selected", false);
    });

    document.querySelectorAll("#" + id + "_content > .active_tabcontent").forEach(function (elm2) {
      elm2.classList.remove("active_tabcontent");
    });
    elm.classList.add("active_tabmenu");
    document.getElementById(elm.getAttribute("aria-controls")).classList.add("active_tabcontent");
    elm.setAttribute("aria-selected", true);
  });
});

//震度フォーマット
//eslint-disable-next-line
function NormalizeShindo(str, responseType) {
  var ShindoTmp;
  if (str === null || str === undefined) ShindoTmp = 11;
  else if (isNaN(str)) {
    str = String(str)
      .replace(/[０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      }).replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-").replace(/\s+/g, "");
    switch (str) {
      case "1":
      case "10":
        ShindoTmp = 1;
        break;
      case "2":
      case "20":
        ShindoTmp = 2;
        break;
      case "3":
      case "30":
        ShindoTmp = 3;
        break;
      case "4":
      case "40":
        ShindoTmp = 4;
        break;
      case "5-":
      case "45":
        ShindoTmp = 5;
        break;
      case "5+":
      case "50":
        ShindoTmp = 6;
        break;
      case "6-":
      case "55":
        ShindoTmp = 7;
        break;
      case "6+":
      case "60":
        ShindoTmp = 8;
        break;
      case "7":
      case "70":
        ShindoTmp = 9;
        break;
      case "震度5-以上未入電":
      case "5+?":
        ShindoTmp = 10;
        break;
      case "-1":
      case "?":
      case "不明":
      default:
        ShindoTmp = 11;
    }
  } else {
    if (str < 0.5) ShindoTmp = 0;
    else if (str < 1.5) ShindoTmp = 1;
    else if (str < 2.5) ShindoTmp = 2;
    else if (str < 3.5) ShindoTmp = 3;
    else if (str < 4.5) ShindoTmp = 4;
    else if (str < 5) ShindoTmp = 5;
    else if (str < 5.5) ShindoTmp = 6;
    else if (str < 6) ShindoTmp = 7;
    else if (str < 6.5) ShindoTmp = 8;
    else if (6.5 <= str) ShindoTmp = 9;
    else ShindoTmp = 11;
  }
  switch (responseType) {
    case 1:
      var ConvTable = ["0", "1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7", "５弱以上未入電", "不明"];
      break;
    case 2:
      var ConvTable = [
        [config.color.Shindo["0"].background, config.color.Shindo["0"].color],
        [config.color.Shindo["1"].background, config.color.Shindo["1"].color],
        [config.color.Shindo["2"].background, config.color.Shindo["2"].color],
        [config.color.Shindo["3"].background, config.color.Shindo["3"].color],
        [config.color.Shindo["4"].background, config.color.Shindo["4"].color],
        [config.color.Shindo["5m"].background, config.color.Shindo["5m"].color],
        [config.color.Shindo["5p"].background, config.color.Shindo["5p"].color],
        [config.color.Shindo["6m"].background, config.color.Shindo["6m"].color],
        [config.color.Shindo["6p"].background, config.color.Shindo["6p"].color],
        [config.color.Shindo["7"].background, config.color.Shindo["7"].color],
        [config.color.Shindo["5p?"].background, config.color.Shindo["5p?"].color],
        [config.color.Shindo["?"].background, config.color.Shindo["?"].color],
      ];
      break;
    case 3:
      var ConvTable = [null, "1", "2", "3", "4", "5m", "5p", "6m", "6p", "7", "5p?", null];
      break;
    case 4:
      var ConvTable = [0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 7, 4.5, null];
      break;
    case 5:
      var ConvTable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4.5, 0];
      break;
    case 0:
    default:
      var ConvTable = ["0", "1", "2", "3", "4", "5-", "5+", "6-", "6+", "7", "未", "?"];
      break;
  }
  return ConvTable[ShindoTmp];
}

document.querySelectorAll("input[type=number]").forEach(function (elm) {
  elm.addEventListener("change", function () {
    var max = this.getAttribute("max");
    if (Number(max) < Number(this.value)) this.value = max;
    var min = this.getAttribute("min");
    if (Number(min) > Number(this.value)) this.value = min;
    var step = this.getAttribute("step");
    if (Number(this.value) % Number(step) == 0) this.value = Math.floor(this.value / step) * step;
  });
});

//MMI震度フォーマット
//eslint-disable-next-line
function NormalizeMMI(str, responseType) {
  var ShindoTmp = 0;
  if (str === null || str === undefined) ShindoTmp = 0;
  else if (!isNaN(str)) {
    ShindoTmp = Math.min(12, Math.max(1, Math.round(Number(str))));
  }
  switch (responseType) {
    default:
    case 1:
      var ConvTable = ["?", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ", "Ⅺ", "Ⅻ"];
      break;
    case 2:
      var ConvTable = [
        [config.color.Shindo["?"].background, config.color.Shindo["?"].color],
        [config.color.Shindo["0"].background, config.color.Shindo["0"].color],
        [config.color.Shindo["1"].background, config.color.Shindo["1"].color],
        [config.color.Shindo["2"].background, config.color.Shindo["2"].color],
        [config.color.Shindo["3"].background, config.color.Shindo["3"].color],
        [config.color.Shindo["4"].background, config.color.Shindo["4"].color],
        [config.color.Shindo["5m"].background, config.color.Shindo["5m"].color],
        [config.color.Shindo["5p"].background, config.color.Shindo["5p"].color],
        [config.color.Shindo["6m"].background, config.color.Shindo["6m"].color],
        [config.color.Shindo["6p"].background, config.color.Shindo["6p"].color],
        [config.color.Shindo["7"].background, config.color.Shindo["7"].color],
        [config.color.Shindo["7"].background, config.color.Shindo["7"].color],
        [config.color.Shindo["7"].background, config.color.Shindo["7"].color],
      ];
      break;
    case 3:
      var ConvTable = ["不明", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ", "Ⅺ", "Ⅻ"];
      break;
  }
  return ConvTable[ShindoTmp];
}

//eslint-disable-next-line
function LgIntConvert(str) {
  switch (String(str)) {
    case "1":
      return [config.color.LgInt["1"].background, config.color.LgInt["1"].color];
    case "2":
      return [config.color.LgInt["2"].background, config.color.LgInt["2"].color];
    case "3":
      return [config.color.LgInt["3"].background, config.color.LgInt["3"].color];
    case "4":
      return [config.color.LgInt["4"].background, config.color.LgInt["4"].color];
    case "?":
    default:
      return [config.color.LgInt["?"].background, config.color.LgInt["?"].color];
  }
}

//日時フォーマット
//eslint-disable-next-line
function NormalizeDate(type, date) {
  if (!date) date = new Date();
  else date = new Date(date);
  if (Number.isNaN(date.getTime())) return "";

  var YYYY = String(date.getFullYear());
  var YY = String(date.getFullYear()).slice(-2);
  var MM = String(date.getMonth() + 1).padStart(2, "0");
  var DD = String(date.getDate()).padStart(2, "0");
  var hh = String(date.getHours()).padStart(2, "0");
  var mm = String(date.getMinutes()).padStart(2, "0");
  var ss = String(date.getSeconds()).padStart(2, "0");
  var M = String(date.getMonth() + 1);
  var D = String(date.getDate());
  var h = String(date.getHours());
  var m = String(date.getMinutes());
  var s = String(date.getSeconds());
  var isToday = date.toDateString() == new Date().toDateString();
  if (typeof type === "string" || type instanceof String) {
    return type.replaceAll("YYYY", YYYY).replaceAll("YY", YY).replaceAll("MM", MM).replaceAll("DD", DD).replaceAll("hh", hh).replaceAll("mm", mm).replaceAll("ss", ss).replaceAll("M", M).replaceAll("D", D).replaceAll("h", h).replaceAll("m", m).replaceAll("s", s);
  }
  switch (type) {
    case 1:
      return YYYY + MM + DD + hh + mm + ss;
    case 2:
      return YYYY + MM + DD;
    case 3:
      return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss;
    case 4:
      return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm;
    case 5:
      return D + "日 " + hh + ":" + mm;
    case 6:
      return hh + ":" + mm;
    case 7:
      return hh + "時" + mm + "分" + ss + "秒";
    case 8:
      return h + "時" + m + "分" + s + "秒";
    case 9:
      var date_str = "";
      if (!isToday) date_str = D + "日 ";
      return date_str + h + "時" + m + "分";
    case 10:
      var date_str = "";
      if (!isToday) date_str = D + "日 ";
      return date_str + hh + ":" + mm;
    default:
      return new Date().toLocaleString("ja-jp");
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
const moveFocus = (movement, event) => {
  const group = event.target.closest("[ZQ-focusgroup]");
  if (!group) return;
  const items = group.querySelectorAll("[ZQ-focusgroup-item]");
  if (items.length == 0) return;

  event.preventDefault();
  event.stopPropagation();

  for (let index = 0; index < items.length; index++) {
    if (items.item(index) == event.target) items.item((index + movement + items.length) % items.length)?.focus();
  }
};

window.addEventListener("keydown", (event) => {
  if (event.key == "ArrowDown") moveFocus(+1, event);
  else if (event.key == "ArrowUp") moveFocus(-1, event);
  else if (event.key == "ArrowRight") moveFocus(+1, event);
  else if (event.key == "ArrowLeft") moveFocus(-1, event);
  else if ((event.key == "Enter" || event.key == " ") && document.activeElement) {
    var tagname = document.activeElement.tagName;
    if (tagname == "DIV" || tagname == "SPAN") document.activeElement.dispatchEvent(new PointerEvent("click"));
  }
});
