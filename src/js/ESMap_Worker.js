var ESMap, ESMapO;
var ESMap_context, ESMap_context_out;
var config;
var intColor;

function NormalizeShindo(str, responseType) {
  var ShindoTmp;
  switch (str) {
    case "1":
      ShindoTmp = 1;
      break;
    case "2":
      ShindoTmp = 2;
      break;
    case "3":
      ShindoTmp = 3;
      break;
    case "4":
      ShindoTmp = 4;
      break;
    case "5-":
      ShindoTmp = 5;
      break;
    case "5+":
      ShindoTmp = 6;
      break;
    case "6-":
      ShindoTmp = 7;
      break;
    case "6+":
      ShindoTmp = 8;
      break;
    case "7":
      ShindoTmp = 9;
      break;
    default:
      ShindoTmp = 11;
  }

  switch (responseType) {
    default:
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
        [config.color.Shindo["?"].background, config.color.Shindo["?"].color],
      ];
      break;
  }
  return ConvTable[ShindoTmp];
}

self.addEventListener("message", (event) => {
  if (event.data.action == "config") {
    config = event.data.config;
    intColor = true;
    intColor = {
      4: NormalizeShindo("4", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "5-": NormalizeShindo("5-", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "5+": NormalizeShindo("5+", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "6-": NormalizeShindo("6-", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      "6+": NormalizeShindo("6+", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
      7: NormalizeShindo("7", 2)[0].replace("rgb(", "").replace(")", "").replace(" ", "").split(","),
    };
  } else if (event.data.action == "ESMap_canvas") {
    ESMap = event.data.canvas;
    ESMap_context = ESMap.getContext("2d", { willReadFrequently: true });
  } else if (event.data.action == "ESMapO_canvas") {
    ESMapO = event.data.canvas;
    ESMap_context_out = ESMapO.getContext("2d", { willReadFrequently: true });
  } else if (event.data.action == "URL") {
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
            if (imgData[y * 3200 + x * 4 + 3] > 50) {
              var r = imgData[y * 3200 + x * 4];
              var g = imgData[y * 3200 + x * 4 + 1];
              var b = imgData[y * 3200 + x * 4 + 2];

              if (r == 250 && g == 230 && b == 150) var color = intColor["4"];
              else if (r == 255 && g == 230 && b == 0) var color = intColor["5-"];
              else if (r == 255 && g == 153 && b == 0) var color = intColor["5+"];
              else if (r == 255 && g == 40 && b == 0) var color = intColor["6-"];
              else if (r == 165 && g == 0 && b == 33) var color = intColor["6+"];
              else if (r == 180 && g == 0 && b == 104) var color = intColor["7"];
              else if (Math.abs(r - 250) < 16 && Math.abs(g - 230) < 16 && Math.abs(b - 150) < 16) var color = intColor["4"];
              else if (Math.abs(r - 255) < 16 && Math.abs(g - 230) < 16 && b < 16) var color = intColor["5-"];
              else if (Math.abs(r - 255) < 16 && Math.abs(g - 153) < 16 && b < 16) var color = intColor["5+"];
              else if (Math.abs(r - 255) < 16 && Math.abs(g - 40) < 16 && b < 16) var color = intColor["6-"];
              else if (Math.abs(r - 165) < 16 && g < 16 && Math.abs(b - 33) < 16) var color = intColor["6+"];
              else if (Math.abs(r - 180) < 16 && g < 16 && Math.abs(b - 104) < 16) var color = intColor["7"];

              imgData_out.data[i * 1280 + j * 4] = color[0];
              imgData_out.data[i * 1280 + j * 4 + 1] = color[1];
              imgData_out.data[i * 1280 + j * 4 + 2] = color[2];
              imgData_out.data[i * 1280 + j * 4 + 3] = 255;
            }
            x += 3 - (j % 2);
          }
          y += 2 + (i % 2);
        }
        ESMap_context_out.putImageData(imgData_out, 0, 0);

        ESMapO.convertToBlob().then(function (blob) {
          let reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = function () {
            var dataUrl = reader.result;
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
