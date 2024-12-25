var ESMap, ESMapO;
var ESMap_context, ESMap_context_out;
var config;
self.addEventListener("message", (event) => {
  if (event.data.action == "config") {
    config = event.data.config;
  } else if (event.data.action == "ESMap_canvas") {
    ESMap = event.data.canvas;
    ESMap_context = ESMap.getContext("2d");
  } else if (event.data.action == "ESMapO_canvas") {
    ESMapO = event.data.canvas;
    ESMap_context_out = ESMapO.getContext("2d");
  } else if (event.data.action == "URL") {
    var intColor = {
      4: NormalizeShindo("4", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "5-": NormalizeShindo("5-", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "5+": NormalizeShindo("5+", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "6-": NormalizeShindo("6-", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "6+": NormalizeShindo("6+", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      7: NormalizeShindo("7", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
    };

    fetch(event.data.url)
      .then((r) => r.blob())
      .then(function (imageBlob) {
        return createImageBitmap(imageBlob);
      })
      .then(function (img) {
        ESMap_context.clearRect(0, 0, 800, 800);
        ESMap_context.drawImage(img, 0, 0, 800, 800);
        var imgData = ESMap_context.getImageData(0, 0, 800, 800).data;
        ESMap_context_out.clearRect(0, 0, 320, 320);
        var imgData_out = ESMap_context_out.getImageData(0, 0, 320, 320);

        var y = 1;
        for (let i = 0; i < 320; i++) {
          var x = 1;
          for (let j = 0; j < 320; j++) {
            if (imgData[(y * 800 + x) * 4 + 3] > 50) {
              var r = imgData[(y * 800 + x) * 4];
              var g = imgData[(y * 800 + x) * 4 + 1];
              var b = imgData[(y * 800 + x) * 4 + 2];

              var color;
              if (r == 250 && g == 230 && b == 150) color = intColor["4"];
              else if (r == 255 && g == 230 && b == 0) color = intColor["5-"];
              else if (r == 255 && g == 153 && b == 0) color = intColor["5+"];
              else if (r == 255 && g == 40 && b == 0) color = intColor["6-"];
              else if (r == 165 && g == 0 && b == 33) color = intColor["6+"];
              else if (r == 180 && g == 0 && b == 104) color = intColor["7"];
              else {
                if (Math.abs(r - 250) < 16 && Math.abs(g - 230) < 16 && Math.abs(b - 150) < 16) color = intColor["4"];
                else if (Math.abs(r - 255) < 16 && Math.abs(g - 230) < 16 && Math.abs(b - 0) < 16) color = intColor["5-"];
                else if (Math.abs(r - 255) < 16 && Math.abs(g - 153) < 16 && Math.abs(b - 0) < 16) color = intColor["5+"];
                else if (Math.abs(r - 255) < 16 && Math.abs(g - 40) < 16 && Math.abs(b - 0) < 16) color = intColor["6-"];
                else if (Math.abs(r - 165) < 16 && Math.abs(g - 0) < 16 && Math.abs(b - 33) < 16) color = intColor["6+"];
                else if (Math.abs(r - 180) < 16 && Math.abs(g - 0) < 16 && Math.abs(b - 104) < 16) color = intColor["7"];
              }

              imgData_out.data[(i * 320 + j) * 4] = color[0];
              imgData_out.data[(i * 320 + j) * 4 + 1] = color[1];
              imgData_out.data[(i * 320 + j) * 4 + 2] = color[2];
              imgData_out.data[(i * 320 + j) * 4 + 3] = 255;
            }
            x += j % 2 == 0 ? 3 : 2;
          }
          y += i % 2 == 0 ? 2 : 3;
        }
        ESMap_context_out.putImageData(imgData_out, 0, 0);

        ESMapO.convertToBlob().then(function (blob) {
          let reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = function () {
            dataUrl = reader.result;
            self.postMessage({
              data: dataUrl,
              index: event.data.index,
              lat: event.data.lat,
              lng: event.data.lng,
              lat2: event.data.lat2,
              lng2: event.data.lng2,
            });
          };
        });
      });
  }
});

function NormalizeShindo(str, responseType) {
  var ShindoTmp;
  if (str === null || str === undefined) ShindoTmp = 11;
  else if (isNaN(str)) {
    str = String(str)
      .replace(/[０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      })
      .replaceAll("＋", "+")
      .replaceAll("－", "-")
      .replaceAll("強", "+")
      .replaceAll("弱", "-")
      .replace(/\s+/g, "");
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
