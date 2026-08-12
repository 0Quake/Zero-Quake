// eslint-disable-next-line no-undef
process.env.TZ = "Asia/Tokyo";
// eslint-disable-next-line no-undef
process.title = 'Zero Quake';

//リプレイ
var Replay = 0;
var MainWindow, SettingWindow, TsunamiWindow, WorkerWindow;
var worker;
function replay(ReplayDate) {
  try {
    if (ReplayDate) {
      Replay = new Date() - new Date(ReplayDate);
    } else {
      Replay = 0;
    }
    EQDetect_List = [];
    EEW_Active = [];
    if (worker) worker.postMessage({ action: "Replay", data: Replay });
    messageToMainWindow({ action: "Replay", data: Replay });
    if (SettingWindow) {
      SettingWindow.webContents.send("message2", {
        action: "Replay",
        data: Replay,
      });
    }
    Req_JMAXMLList(0, true);
  } catch (err) {
    throw new Error("リプレイに失敗しました。", { cause: err });
  }
}
// prettier-ignore
var EEWSect = { 135: "宗谷支庁北部", 136: "宗谷支庁南部", 125: "上川支庁北部", 126: "上川支庁中部", 127: "上川支庁南部", 130: "留萌支庁中北部", 131: "留萌支庁南部", 139: "北海道利尻礼文", 150: "日高支庁西部", 151: "日高支庁中部", 152: "日高支庁東部", 145: "胆振支庁西部", 146: "胆振支庁中東部", 110: "檜山支庁", 105: "渡島支庁北部", 106: "渡島支庁東部", 107: "渡島支庁西部", 140: "網走支庁網走", 141: "網走支庁北見", 142: "網走支庁紋別", 165: "根室支庁北部", 166: "根室支庁中部", 167: "根室支庁南部", 160: "釧路支庁北部", 161: "釧路支庁中南部", 155: "十勝支庁北部", 156: "十勝支庁中部", 157: "十勝支庁南部", 119: "北海道奥尻島", 120: "空知支庁北部", 121: "空知支庁中部", 122: "空知支庁南部", 100: "石狩支庁北部", 101: "石狩支庁中部", 102: "石狩支庁南部", 115: "後志支庁北部", 116: "後志支庁東部", 117: "後志支庁西部", 200: "青森県津軽北部", 201: "青森県津軽南部", 202: "青森県三八上北", 203: "青森県下北", 230: "秋田県沿岸北部", 231: "秋田県沿岸南部", 232: "秋田県内陸北部", 233: "秋田県内陸南部", 210: "岩手県沿岸北部", 211: "岩手県沿岸南部", 212: "岩手県内陸北部", 213: "岩手県内陸南部", 220: "宮城県北部", 221: "宮城県南部", 222: "宮城県中部", 240: "山形県庄内", 241: "山形県最上", 242: "山形県村山", 243: "山形県置賜", 250: "福島県中通り", 251: "福島県浜通り", 252: "福島県会津", 300: "茨城県北部", 301: "茨城県南部", 310: "栃木県北部", 311: "栃木県南部", 320: "群馬県北部", 321: "群馬県南部", 330: "埼玉県北部", 331: "埼玉県南部", 332: "埼玉県秩父", 350: "東京都２３区", 351: "東京都多摩東部", 352: "東京都多摩西部", 354: "神津島", 355: "伊豆大島", 356: "新島", 357: "三宅島", 358: "八丈島", 359: "小笠原", 340: "千葉県北東部", 341: "千葉県北西部", 342: "千葉県南部", 360: "神奈川県東部", 361: "神奈川県西部", 420: "長野県北部", 421: "長野県中部", 422: "長野県南部", 410: "山梨県東部", 411: "山梨県中・西部", 412: "山梨県東部・富士五湖", 440: "静岡県伊豆", 441: "静岡県東部", 442: "静岡県中部", 443: "静岡県西部", 450: "愛知県東部", 451: "愛知県西部", 430: "岐阜県飛騨", 431: "岐阜県美濃東部", 432: "岐阜県美濃中西部", 460: "三重県北部", 461: "三重県中部", 462: "三重県南部", 370: "新潟県上越", 371: "新潟県中越", 372: "新潟県下越", 375: "新潟県佐渡", 380: "富山県東部", 381: "富山県西部", 390: "石川県能登", 391: "石川県加賀", 400: "福井県嶺北", 401: "福井県嶺南", 500: "滋賀県北部", 501: "滋賀県南部", 510: "京都府北部", 511: "京都府南部", 520: "大阪府北部", 521: "大阪府南部", 530: "兵庫県北部", 531: "兵庫県南東部", 532: "兵庫県南西部", 535: "兵庫県淡路島", 540: "奈良県", 550: "和歌山県北部", 551: "和歌山県南部", 580: "岡山県北部", 581: "岡山県南部", 590: "広島県北部", 591: "広島県南東部", 592: "広島県南西部", 570: "島根県東部", 571: "島根県西部", 575: "島根県隠岐", 560: "鳥取県東部", 562: "鳥取県中部", 563: "鳥取県西部", 600: "徳島県北部", 601: "徳島県南部", 610: "香川県東部", 611: "香川県西部", 620: "愛媛県東予", 621: "愛媛県中予", 622: "愛媛県南予", 630: "高知県東部", 631: "高知県中部", 632: "高知県西部", 700: "山口県北部", 701: "山口県東部", 702: "山口県西部", 710: "福岡県福岡", 711: "福岡県北九州", 712: "福岡県筑豊", 713: "福岡県筑後", 750: "大分県北部", 751: "大分県中部", 752: "大分県南部", 753: "大分県西部", 730: "長崎県北部", 731: "長崎県南西部", 732: "長崎県島原半島", 735: "長崎県対馬", 736: "長崎県壱岐", 737: "長崎県五島", 720: "佐賀県北部", 721: "佐賀県南部", 740: "熊本県阿蘇", 741: "熊本県熊本", 742: "熊本県球磨", 743: "熊本県天草・芦北", 760: "宮崎県北部平野部", 761: "宮崎県北部山沿い", 762: "宮崎県南部平野部", 763: "宮崎県南部山沿い", 770: "鹿児島県薩摩", 771: "鹿児島県大隅", 774: "鹿児島県十島村", 775: "鹿児島県甑島", 776: "鹿児島県種子島", 777: "鹿児島県屋久島", 778: "鹿児島県奄美北部", 779: "鹿児島県奄美南部", 800: "沖縄県本島北部", 801: "沖縄県本島中南部", 802: "沖縄県久米島", 803: "沖縄県大東島", 804: "沖縄県宮古島", 805: "沖縄県石垣島", 806: "沖縄県与那国島", 807: "沖縄県西表島" };
// prettier-ignore
var KmoniColorTable = { "0": { "r": 63, "g": 250, "b": 54 }, "1": { "r": 189, "g": 255, "b": 12 }, "2": { "r": 255, "g": 255, "b": 0 }, "3": { "r": 255, "g": 221, "b": 0 }, "4": { "r": 255, "g": 144, "b": 0 }, "5": { "r": 255, "g": 68, "b": 0 }, "6": { "r": 245, "g": 0, "b": 0 }, "7": { "r": 170, "g": 0, "b": 0 }, "-3": { "r": 0, "g": 0, "b": 205 }, "-2.9": { "r": 0, "g": 7, "b": 209 }, "-2.8": { "r": 0, "g": 14, "b": 214 }, "-2.7": { "r": 0, "g": 21, "b": 218 }, "-2.6": { "r": 0, "g": 28, "b": 223 }, "-2.5": { "r": 0, "g": 36, "b": 227 }, "-2.4": { "r": 0, "g": 43, "b": 231 }, "-2.3": { "r": 0, "g": 50, "b": 236 }, "-2.2": { "r": 0, "g": 57, "b": 240 }, "-2.1": { "r": 0, "g": 64, "b": 245 }, "-2": { "r": 0, "g": 72, "b": 250 }, "-1.9": { "r": 0, "g": 85, "b": 238 }, "-1.8": { "r": 0, "g": 99, "b": 227 }, "-1.7": { "r": 0, "g": 112, "b": 216 }, "-1.6": { "r": 0, "g": 126, "b": 205 }, "-1.5": { "r": 0, "g": 140, "b": 194 }, "-1.4": { "r": 0, "g": 153, "b": 183 }, "-1.3": { "r": 0, "g": 167, "b": 172 }, "-1.2": { "r": 0, "g": 180, "b": 161 }, "-1.1": { "r": 0, "g": 194, "b": 150 }, "-1": { "r": 0, "g": 208, "b": 139 }, "-0.9": { "r": 6, "g": 212, "b": 130 }, "-0.8": { "r": 12, "g": 216, "b": 121 }, "-0.7": { "r": 18, "g": 220, "b": 113 }, "-0.6": { "r": 25, "g": 224, "b": 104 }, "-0.5": { "r": 31, "g": 228, "b": 96 }, "-0.4": { "r": 37, "g": 233, "b": 88 }, "-0.3": { "r": 44, "g": 237, "b": 79 }, "-0.2": { "r": 50, "g": 241, "b": 71 }, "-0.1": { "r": 56, "g": 245, "b": 62 }, "0.1": { "r": 75, "g": 250, "b": 49 }, "0.2": { "r": 88, "g": 250, "b": 45 }, "0.3": { "r": 100, "g": 251, "b": 41 }, "0.4": { "r": 113, "g": 251, "b": 37 }, "0.5": { "r": 125, "g": 252, "b": 33 }, "0.6": { "r": 138, "g": 252, "b": 28 }, "0.7": { "r": 151, "g": 253, "b": 24 }, "0.8": { "r": 163, "g": 253, "b": 20 }, "0.9": { "r": 176, "g": 254, "b": 16 }, "1.1": { "r": 195, "g": 254, "b": 10 }, "1.2": { "r": 202, "g": 254, "b": 9 }, "1.3": { "r": 208, "g": 254, "b": 8 }, "1.4": { "r": 215, "g": 254, "b": 7 }, "1.5": { "r": 222, "g": 255, "b": 5 }, "1.6": { "r": 228, "g": 254, "b": 4 }, "1.7": { "r": 235, "g": 255, "b": 3 }, "1.8": { "r": 241, "g": 254, "b": 2 }, "1.9": { "r": 248, "g": 255, "b": 1 }, "2.1": { "r": 254, "g": 251, "b": 0 }, "2.2": { "r": 254, "g": 248, "b": 0 }, "2.3": { "r": 254, "g": 244, "b": 0 }, "2.4": { "r": 254, "g": 241, "b": 0 }, "2.5": { "r": 255, "g": 238, "b": 0 }, "2.6": { "r": 254, "g": 234, "b": 0 }, "2.7": { "r": 255, "g": 231, "b": 0 }, "2.8": { "r": 254, "g": 227, "b": 0 }, "2.9": { "r": 255, "g": 224, "b": 0 }, "3.1": { "r": 254, "g": 213, "b": 0 }, "3.2": { "r": 254, "g": 205, "b": 0 }, "3.3": { "r": 254, "g": 197, "b": 0 }, "3.4": { "r": 254, "g": 190, "b": 0 }, "3.5": { "r": 255, "g": 182, "b": 0 }, "3.6": { "r": 254, "g": 174, "b": 0 }, "3.7": { "r": 255, "g": 167, "b": 0 }, "3.8": { "r": 254, "g": 159, "b": 0 }, "3.9": { "r": 255, "g": 151, "b": 0 }, "4.1": { "r": 254, "g": 136, "b": 0 }, "4.2": { "r": 254, "g": 128, "b": 0 }, "4.3": { "r": 254, "g": 121, "b": 0 }, "4.4": { "r": 254, "g": 113, "b": 0 }, "4.5": { "r": 255, "g": 106, "b": 0 }, "4.6": { "r": 254, "g": 98, "b": 0 }, "4.7": { "r": 255, "g": 90, "b": 0 }, "4.8": { "r": 254, "g": 83, "b": 0 }, "4.9": { "r": 255, "g": 75, "b": 0 }, "5.1": { "r": 254, "g": 61, "b": 0 }, "5.2": { "r": 253, "g": 54, "b": 0 }, "5.3": { "r": 252, "g": 47, "b": 0 }, "5.4": { "r": 251, "g": 40, "b": 0 }, "5.5": { "r": 250, "g": 33, "b": 0 }, "5.6": { "r": 249, "g": 27, "b": 0 }, "5.7": { "r": 248, "g": 20, "b": 0 }, "5.8": { "r": 247, "g": 13, "b": 0 }, "5.9": { "r": 246, "g": 6, "b": 0 }, "6.1": { "r": 238, "g": 0, "b": 0 }, "6.2": { "r": 230, "g": 0, "b": 0 }, "6.3": { "r": 223, "g": 0, "b": 0 }, "6.4": { "r": 215, "g": 0, "b": 0 }, "6.5": { "r": 208, "g": 0, "b": 0 }, "6.6": { "r": 200, "g": 0, "b": 0 }, "6.7": { "r": 192, "g": 0, "b": 0 }, "6.8": { "r": 185, "g": 0, "b": 0 }, "6.9": { "r": 177, "g": 0, "b": 0 } };
// prettier-ignore
var EQIAreaLoc = { "石狩地方北部": [141.54675, 43.43578], "石狩地方中部": [141.23705, 42.98504], "石狩地方南部": [141.52402, 42.85309], "渡島地方北部": [140.18512, 42.32746], "渡島地方東部": [140.693, 41.94338], "渡島地方西部": [140.31204, 41.60581], "檜山地方": [139.9998, 42.3766], "後志地方北部": [140.81871, 43.16516], "後志地方東部": [140.85942, 42.83641], "後志地方西部": [140.53046, 42.91356], "北海道奥尻島": [139.46697, 42.15214], "空知地方北部": [142.01984, 43.84019], "空知地方中部": [142.04045, 43.47655], "空知地方南部": [141.94768, 43.14824], "上川地方北部": [142.42944, 44.40536], "上川地方中部": [142.67244, 43.7236], "上川地方南部": [142.50933, 43.21754], "留萌地方中北部": [141.90835, 44.54206], "留萌地方南部": [141.77079, 43.94982], "宗谷地方北部": [141.94211, 45.20023], "宗谷地方南部": [142.39298, 44.88518], "北海道利尻礼文": [141.23048, 45.17836], "網走地方": [144.48047, 43.90311], "北見地方": [143.79168, 43.84761], "紋別地方": [143.30967, 44.19196], "胆振地方西部": [140.82689, 42.60353], "胆振地方中東部": [141.39009, 42.64401], "日高地方西部": [142.37647, 42.7154], "日高地方中部": [142.59539, 42.47374], "日高地方東部": [142.93003, 42.19558], "十勝地方北部": [143.32314, 43.32573], "十勝地方中部": [143.28856, 42.87941], "十勝地方南部": [143.15465, 42.44626], "釧路地方北部": [144.39781, 43.54639], "釧路地方中南部": [144.51042, 43.20982], "根室地方北部": [145.00385, 43.90127], "根室地方中部": [144.95723, 43.41467], "根室地方南部": [145.34732, 43.27908], "青森県津軽北部": [140.4857, 40.93446], "青森県津軽南部": [140.36289, 40.59874], "青森県三八上北": [141.20052, 40.68776], "青森県下北": [141.11944, 41.32661], "岩手県沿岸北部": [141.75098, 39.92458], "岩手県沿岸南部": [141.71304, 39.23375], "岩手県内陸北部": [141.21093, 39.93023], "岩手県内陸南部": [141.09343, 39.1759], "宮城県北部": [141.08257, 38.72049], "宮城県南部": [140.60006, 38.02044], "宮城県中部": [140.90636, 38.40323], "秋田県沿岸北部": [140.11294, 40.1368], "秋田県沿岸南部": [140.15039, 39.43931], "秋田県内陸北部": [140.56991, 40.15347], "秋田県内陸南部": [140.47855, 39.43633], "山形県庄内": [139.87396, 38.72509], "山形県最上": [140.32742, 38.77739], "山形県村山": [140.24408, 38.38752], "山形県置賜": [139.97007, 38.0049], "福島県中通り": [140.37852, 37.38397], "福島県浜通り": [140.94343, 37.38026], "福島県会津": [139.63988, 37.38346], "茨城県北部": [140.44279, 36.53773], "茨城県南部": [140.21035, 36.07702], "栃木県北部": [139.8116, 36.87802], "栃木県南部": [139.84548, 36.52125], "群馬県北部": [139.01583, 36.72978], "群馬県南部": [139.03612, 36.30946], "埼玉県北部": [139.43115, 36.11991], "埼玉県南部": [139.49001, 35.93128], "埼玉県秩父": [138.94888, 35.99408], "千葉県北東部": [140.44757, 35.63605], "千葉県北西部": [140.16283, 35.66762], "千葉県南部": [140.10234, 35.19097], "東京都２３区": [139.73616, 35.67495], "東京都多摩東部": [139.38037, 35.65425], "東京都多摩西部": [139.1547, 35.7822], "神津島": [139.15228, 34.21408], "伊豆大島": [139.40239, 34.73847], "新島": [139.21407, 34.32634], "三宅島": [139.52125, 34.08539], "八丈島": [139.80768, 33.10241], "小笠原": [141.3198, 24.7791], "神奈川県東部": [139.49668, 35.38991], "神奈川県西部": [139.14266, 35.40645], "新潟県上越": [138.17565, 37.03639], "新潟県中越": [138.83942, 37.23676], "新潟県下越": [139.44225, 38.0003], "新潟県佐渡": [138.35139, 38.0673], "富山県東部": [137.42681, 36.67474], "富山県西部": [136.91921, 36.62078], "石川県能登": [136.79615, 37.14454], "石川県加賀": [136.59766, 36.4297], "福井県嶺北": [136.35588, 35.97698], "福井県嶺南": [135.96354, 35.55479], "山梨県中・西部": [138.5194, 35.57003], "山梨県東部・富士五湖": [138.95487, 35.60847], "長野県北部": [138.139, 36.68361], "長野県中部": [138.08506, 36.16776], "長野県南部": [137.87913, 35.6424], "岐阜県飛騨": [137.19971, 36.04247], "岐阜県美濃東部": [137.30969, 35.51208], "岐阜県美濃中西部": [136.68755, 35.60052], "静岡県伊豆": [138.95185, 34.89169], "静岡県東部": [138.75944, 35.19231], "静岡県中部": [138.30691, 35.13232], "静岡県西部": [137.84768, 34.94967], "愛知県東部": [137.52624, 34.90666], "愛知県西部": [137.16109, 35.05975], "三重県北部": [136.57907, 35.02821], "三重県中部": [136.29628, 34.60764], "三重県南部": [136.19401, 34.1446], "滋賀県北部": [136.15375, 35.41752], "滋賀県南部": [136.11841, 35.03771], "京都府北部": [135.17996, 35.46993], "京都府南部": [135.59642, 35.04177], "大阪府北部": [135.58859, 34.79913], "大阪府南部": [135.50817, 34.44004], "兵庫県北部": [134.70365, 35.40012], "兵庫県南東部": [135.07489, 34.96647], "兵庫県南西部": [134.56049, 35.03026], "兵庫県淡路島": [134.83253, 34.39891], "奈良県": [135.89674, 34.3202], "和歌山県北部": [135.33995, 34.0628], "和歌山県南部": [135.63744, 33.75076], "鳥取県東部": [134.2345, 35.3919], "鳥取県中部": [133.79765, 35.38716], "鳥取県西部": [133.43964, 35.30505], "島根県東部": [132.95331, 35.27622], "島根県西部": [132.08681, 34.78736], "島根県隠岐": [133.2763, 36.25405], "岡山県北部": [133.85634, 35.10442], "岡山県南部": [133.80639, 34.6947], "広島県北部": [132.84361, 34.80103], "広島県南東部": [133.14532, 34.59501], "広島県南西部": [132.49039, 34.40867], "徳島県北部": [134.15068, 34.01571], "徳島県南部": [134.31538, 33.76563], "香川県東部": [134.16606, 34.25569], "香川県西部": [133.82632, 34.20103], "愛媛県東予": [133.44723, 33.94659], "愛媛県中予": [132.91864, 33.74242], "愛媛県南予": [132.64041, 33.27646], "高知県東部": [134.09693, 33.4822], "高知県中部": [133.47726, 33.61205], "高知県西部": [132.90471, 33.10141], "山口県北部": [131.41539, 34.3815], "山口県西部": [130.99428, 34.14127], "山口県東部": [132.10386, 34.15051], "山口県中部": [131.6771, 34.23622], "福岡県福岡": [130.4963, 33.64257], "福岡県北九州": [130.94544, 33.72879], "福岡県筑豊": [130.74432, 33.63414], "福岡県筑後": [130.62192, 33.25556], "佐賀県北部": [129.9974, 33.35641], "佐賀県南部": [130.13544, 33.21836], "長崎県北部": [129.73617, 33.19129], "長崎県南西部": [130.00364, 32.83446], "長崎県島原半島": [130.29003, 32.73602], "長崎県対馬": [129.36201, 34.50103], "長崎県壱岐": [129.70993, 33.78369], "長崎県五島": [128.75554, 32.68612], "熊本県阿蘇": [131.10776, 32.9743], "熊本県熊本": [130.91671, 32.75494], "熊本県球磨": [130.84598, 32.29696], "熊本県天草・芦北": [130.1034, 32.36995], "大分県北部": [131.19514, 33.501], "大分県中部": [131.4288, 33.25512], "大分県南部": [131.70822, 32.92816], "大分県西部": [131.21244, 33.14283], "宮崎県北部平野部": [131.56893, 32.42842], "宮崎県北部山沿い": [131.26067, 32.48259], "宮崎県南部平野部": [131.3663, 31.74618], "宮崎県南部山沿い": [131.0424, 31.89712], "鹿児島県薩摩": [130.4553, 31.67134], "鹿児島県大隅": [130.89609, 31.40053], "鹿児島県十島村": [129.86608, 29.8501], "鹿児島県甑島": [129.88505, 31.84194], "鹿児島県種子島": [130.99595, 30.5918], "鹿児島県屋久島": [130.52448, 30.34791], "鹿児島県奄美北部": [129.39683, 28.31986], "鹿児島県奄美南部": [128.58819, 27.38427], "沖縄県本島北部": [128.16633, 26.64532], "沖縄県本島中南部": [127.74713, 26.26225], "沖縄県久米島": [126.78815, 26.34114], "沖縄県大東島": [131.2429, 25.84249], "沖縄県宮古島": [124.69963, 24.65816], "沖縄県石垣島": [124.23828, 24.47049], "沖縄県与那国島": [122.98771, 24.45599], "沖縄県西表島": [123.83915, 24.34639], "色丹島": [146.70781, 43.79579], "国後島": [145.81289, 44.08527], "択捉島": [147.83756, 44.99076], "鷹島(甑島南方)": [129.73294, 31.44904], "津倉瀬(宇治群島北東方）": [129.74011, 31.30856], "うるま市・金武町境界部地先の埋立地": [127.84314, 26.43409] }

import electron from "electron";
const { app, BrowserWindow, ipcMain, net, Notification, shell, dialog, Menu, powerSaveBlocker, } = electron;
import { fileURLToPath } from "url";
import path from "path";
import jsdom from "jsdom";
const JSDOM = jsdom.JSDOM;
import Store from "electron-store";
import WebSocket from "websocket";
var WebSocketClient = WebSocket.client;
import * as turf from "@turf/turf";
import workerThreads from "worker_threads";
import { readFile } from "fs/promises";
import fs from "fs";
import url from "url";
import { exec } from "child_process";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var FERegion = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/feRegion.json"))
);
var packageJson = JSON.parse(await readFile(path.join(__dirname, "../package.json")));
var package_ver = packageJson.version;
var EQ_FetchCount = 0;

const DomPsr = new (new JSDOM()).window.DOMParser();

const store = new Store();
var defaultConfigVal = {
  system: {
    WindowAutoOpen: true,
    alwaysOnTop: false,
    isFirstRun: false, //初回起動時かどうか判定用（自動起動を設定するため）
    powerSaveBlocking: true,
    zoom: 1,
  },
  home: {
    name: "自宅",
    latitude: 35.68,
    longitude: 139.767,
    Section: "東京都２３区",
    TsunamiSect: "東京湾内湾",
    ShowPin: true,
    arv: 1.27,
    initialBounds: [[98, 20], [154, 46]]
  },
  Info: {
    EEW: {
      kodoriyou: true,
      showtraining: false,
      IntThreshold: 0,
      IntQuestion: true,
      userIntThreshold: 0,
      userIntQuestion: false,
      IntType: "max",
    },
    EQInfo: {
      //ItemCount: 15,//廃止済み
      Interval: 60000,
      showtraining: false,
      showTest: false,
      NotificationSound: true,
      maxI_threshold: "0",
      M_threshold: -5,
      Bypass_threshold: true,
    },
    TsunamiInfo: {
      GetData: true,
      showtraining: false,
      showTest: false,
      NotificationSound: true,
      Global_threshold: 0,
      Local_threshold: -1,
      Bypass_threshold: true,
    },
    TideHeight: {
      processing: "median",
    },
    RealTimeShake: {
      DetectEarthquake: false,
      noticeLv: 2,
      notice_BigEvent: true,
    },
  },
  Source: {
    kmoni: { kmoni: { GetData: true, Interval: 1000 } },
    msil: { GetData: true, Interval: 10000 },
    axis: { GetData: false, AccessToken: "" },
    ProjectBS: { GetData: true },
    wolfx: { GetData: true, GetDataFromSeisJS: false },
    TREMRTS: { GetData: true, Interval: 1000 },
    EarlyEst: { GetData: false, Interval: 60000 },
  },
  notice: {
    bell_volume: 1,
    voice_parameter: {
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: "",
      engine: "Default",
      Boyomi_Port: 50080,
      Boyomi_Voice: "auto",
    },
    voice: {
      EEW: "{training2}緊急地震速報です。{region_name}で最大の震度、{maxInt}の地震が発生しました。[{location}の予想震度は{local_Int}です。]",
      EEWUpdate: "緊急地震速報が更新されました。",
      EEWCancel: "緊急地震速報が取り消されました。",
      EQInfo: "{training2}{origin_time2}の地震について、{category}が発表されました。",
      EQInfoCancel: "地震情報が取り消されました。",
      Tsunami:
        "{max_grade}が発表されました。[直ちに逃げてください。直ちに逃げてください。]",
      TsunamiRevocation: "津波情報が解除されました。",
      TsunamiTorikeshi: "津波情報が取り消されました。",
    },
    window: { EEW: "openWindow", EEW_Update: "push" },
  },
  color: {
    "IntColorTheme": "0quake",
    psWave: { PwaveColor: "rgb(48, 148, 255)", SwaveColor: "rgb(255, 62, 48)" },
    "Shindo": {
      "0": { "background": "rgb(80, 81, 83)", "color": "rgb(194, 195, 197)" },
      "1": { "background": "rgb(157, 175, 194)", "color": "rgb(61, 64, 89)" },
      "2": { "background": "rgb(89, 123, 171)", "color": "rgb(0, 1, 6)" },
      "3": { "background": "rgb(69, 72, 130)", "color": "rgb(216, 217, 235)" },
      "4": { "background": "rgb(217, 215, 98)", "color": "rgb(67, 67, 71)" },
      "7": { "background": "rgb(165, 0, 194)", "color": "rgb(255, 255, 255)" },
      "5m": { "background": "rgb(224, 157, 0)", "color": "rgb(38, 38, 38)" },
      "5p": { "background": "rgb(232, 93, 19)", "color": "rgb(0, 0, 0)" },
      "6m": { "background": "rgb(194, 26, 0)", "color": "rgb(255, 255, 255)" },
      "6p": { "background": "rgb(128, 0, 21)", "color": "rgb(255, 255, 255)" },
      "?": { "background": "rgb(191, 191, 191)", "color": "rgb(68, 68, 68)" },
      "5p?": { "background": "rgb(232, 93, 19)", "color": "rgb(0, 0, 0)" }
    }, "LgInt": {
      "1": { "background": "rgb(69, 72, 130)", "color": "rgb(216, 217, 235)" },
      "2": { "background": "rgb(224, 157, 0)", "color": "rgb(38, 38, 38)" },
      "3": { "background": "rgb(194, 26, 0)", "color": "rgb(255, 255, 255)" },
      "4": { "background": "rgb(165, 0, 194)", "color": "rgb(255, 255, 255)" },
      "?": { "background": "rgb(191, 191, 191)", "color": "rgb(68, 68, 68)" }
    },
    Tsunami: {
      TsunamiMajorWarningColor: "rgb(200, 0, 255)",
      TsunamiWarningColor: "rgb(255, 40, 0)",
      TsunamiWatchColor: "rgb(250, 245, 0)",
      TsunamiYohoColor: "rgb(66, 158, 255)",
      AstroHeightColor: "rgb(66, 158, 255)",
    },
  },
  data: { layer: "", overlay: [], kmoni_points_show: true },
};
var config = store.get("config", defaultConfigVal);
var isFirstRun = !config || config.system.isFirstRun !== false;//ここじゃないとダメ
config = mergeDeeply(defaultConfigVal, config);
store.set("config", config);

var psBlock;
var kmoniTimeTmp = {};
var EEW_Storage = []; //地震速報リスト
var EEW_Active = []; //現在発報中リスト
var EarlyEst_Data = []; //Earlyest地震速報リスト

var KmoniOffset = 2500;

var EQDetect_List = [];

var jmaXML_Fetched = [];
var eqInfo = { jma: [], usgs: [] };
var kmoniPointsDataTmp, SnetPointsDataTmp, TremRtsData_Marged;
let tray;
var thresholds;

electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-range-request',
    privileges: {
      supportFetchAPI: true,
      standard: true,
      secure: true,
      corsEnabled: true,
      bypassCSP: true
    }
  }
]);

app.whenReady().then(() => {
  // アプリ全体のネットワークリクエストの発生を事前に検知するフック
  electron.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    if (details.url.includes("https://")) {
      //console.log(`[Request detected] ${details.url}`);
    }

    // キャンセルしない場合は空オブジェクトを渡してリクエストを続行
    callback({});
  });
});

if (app.isPackaged) {
  //メニューバー非表示
  Menu.setApplicationMenu(false);
  //多重起動防止
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.exit(0);
  }
}

var update_data;
var downloadURL;

//アップデートの確認
var checkUpdate = throttle(async function (userAction) {
  try {
    var UpdateError = function (err) {
      var current_verTmp = package_ver;

      update_data = {
        check_error: true,
        check_date: new Date(),
        latest_version: null,
        current_version: current_verTmp,
        update_available: null,
        dl_page: null,
      };
      if (SettingWindow) {
        SettingWindow.webContents.send("message2", {
          action: "Update_Data",
          data: update_data,
        });
      }
    };

    fetch(`https://api.github.com/repos/0quake/Zero-Quake/releases?_=${Number(new Date())}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
        return r.json();
      }).then((json) => {
        var latest_verTmp = String(json[0].tag_name.replace("v", ""));

        var current_verTmp = packageJson.version;
        var latest_v = String(latest_verTmp).split(".").map(Number);
        var current_v = String(current_verTmp).split(".").map(Number);
        var dl_page = json[0].html_url;
        var update_detail = json[0].body;
        downloadURL = json[0].assets[0];
        if (downloadURL && downloadURL.browser_download_url)
          downloadURL = downloadURL.browser_download_url;
        else {
          update_data = { check_error: true, check_date: new Date() };
          if (SettingWindow) {
            SettingWindow.webContents.send("message2", {
              action: "Update_Data",
              data: update_data,
            });
          }
        }
        var update_available = false;
        if (latest_v[0] > current_v[0]) {
          update_available = true;
        } else if (latest_v[0] == current_v[0]) {
          if (latest_v[1] > current_v[1]) {
            update_available = true;
          } else if (latest_v[1] == current_v[1]) {
            if (latest_v[2] > current_v[2]) {
              update_available = true;
            }
          }
        }

        if (update_available && !userAction) {
          var options4 = {
            type: "question",
            title: "アプリケーションの更新",
            message: "Zero Quake で更新が利用可能です。",
            detail: `v.${current_verTmp} > v.${latest_verTmp}\n操作を選択してください。`,
            buttons: ["後で確認", "詳細を確認"],
            noLink: true,
          };

          dialog.showMessageBox(MainWindow, options4).then(function (result) {
            if (result.response == 1) {
              Create_SettingWindow(true);
            }
          });
        }

        update_data = {
          check_error: false,
          check_date: new Date(),
          latest_version: latest_verTmp,
          current_version: current_verTmp,
          update_available: update_available,
          dl_page: dl_page,
          update_detail: update_detail,
        };
        if (SettingWindow) {
          SettingWindow.webContents.send("message2", {
            action: "Update_Data",
            data: update_data,
          });
        }

      }).catch((err) => {
        GeneralError_handler(err)
        UpdateError(err);
      });

  } catch (err) {
    throw new Error("アップデートの確認で深刻なエラーが発生しました。");
  }
}, 2000);

//定期実行
function ScheduledExecution() {
  //axisのアクセストークン確認
  if (!config.Source.axis.GetData) return;

  fetch(`https://axis.prioris.jp/api/token/refresh/?token=${config.Source.axis.AccessToken}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      if (json.status == "generate a new token") {
        //トークン更新
        if (json.token) {
          config.Source.axis.AccessToken = String(json.token);
          store.set("config", config);
          SystemNotification("Axisのアクセストークンを自動で更新しました。");
        }
      } else if (json.status == "contract has expired") {
        //トークン期限切れ
        config.Source.axis.GetData = false;
        store.set("config", config);
        SystemNotification("Axisのアクセストークンの期限が切れました。手動でトークンを更新しください。");
      } else if (json.status == "invalid header authorization") {
        config.Source.axis.GetData = false;
        store.set("config", config);
        SystemNotification("Axisのアクセストークンが不正です。設定を修正してください。");
      }
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("axis", "Error");
    });
}
//準備完了イベント
app.whenReady().then(() => {
  //ウィンドウ作成
  Create_WorkerWindow();
  //定期実行
  ScheduledExecution();
  setInterval(ScheduledExecution, 1200000);

  //↓ 「!== false」必須
  if (isFirstRun) {
    dialog
      .showMessageBox({
        type: "question",
        detail: "PCの起動時に自動実行する様に設定しますか？",
        normalizeAccessKeys: true,
        buttons: ["いいえ", "はい"],
        defaultId: 1,
        noLink: true,
        cancelId: 0,
      })
      .then(function (result) {
        if (result.response == 1) setOpenAtLogin(true);
      });
  }

  if (config.system.WindowAutoOpen) {
    CreateMainWindow();
    app.on("activate", () => {
      // メインウィンドウが消えている場合は再度メインウィンドウを作成する
      if (BrowserWindow.getAllWindows().length === 0) {
        CreateMainWindow();
      }
    });
  }

  //各種のためカスタムリファラーを送信
  const filter = { urls: ['https://*/*'] };
  electron.session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Referer'] = 'https://0quake.github.io/ZeroQuake_Website/';
    details.requestHeaders['User-Agent'] = `ZeroQuake/${package_ver} contact:(https://0quake.github.io/ZeroQuake_Website/contact.html)`;
    callback({ requestHeaders: details.requestHeaders });
  });

  electron.protocol.handle('local-range-request', (request) => {
    try {
      let rawPath = decodeURI(request.url.slice('local-range-request://'.length));
      // ビルド後も正しくファイルパスを生成するためapp.getAppPath()を使用
      let filePath = path.isAbsolute(rawPath) ? rawPath : path.join(app.getAppPath(), rawPath);

      var rangeHeader = request.headers.get("Range");
      var stat = fs.statSync(filePath);
      var totalSize = stat.size;

      if (rangeHeader && rangeHeader.startsWith("bytes=")) {
        var header_value = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        var start = Number(header_value[1]);
        var end = Number(header_value[2]) || totalSize - 1;
        var ContentLength = end - start + 1;

        var buffer = Buffer.alloc(ContentLength);
        var fd = fs.openSync(filePath, "r");
        try {
          fs.readSync(fd, buffer, 0, ContentLength, start);
        } finally {
          fs.closeSync(fd);
        }

        return new Response(buffer, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Content-Length": String(ContentLength),
            "Content-Type": "binary/octet-stream",
          },
        });
      } else {
        throw new Error(`local-range-requestプロトコルにてRangeヘッダーなしのリクエスト。URL:${request.url}`);
      }
    } catch (err) {
      return new Response(`500 error:${err}`, {
        status: 500,
      });
    }
  });

  //初期化処理
  start();

  checkUpdate();
});

let options = {
  type: "error",
  title: "エラー",
  message: "予期しないエラーが発生しました",
  detail: "動作を選択してください。",
  buttons: ["アプリを再起動", "終了", "無視"],
  noLink: true,
};
var errorMsgBox = false;
//エラーイベント
// eslint-disable-next-line no-undef
process.on("uncaughtException", function (err) {
  try {
    if (!errorMsgBox && app.isReady()) {
      GeneralError_handler(causeTree(err))
      if (String(err.stack).startsWith("Error: net::ERR_")) return false;
      errorMsgBox = true;
      options.detail = `よろしければ、以下のエラーメッセージのスクリーンショット等を開発者へご報告ください。\n=================\nZeroQuake v${package_ver ? package_ver : "?.?.?"}\n\n${causeTree(err)}\n=================\n\n動作を選択してください。`;

      if (MainWindow) {
        dialog.showMessageBox(MainWindow, options).then(function (result) {
          errorMsgBox = false;
          errorResolve(result.response);
        });
      } else {
        dialog.showMessageBox(options).then(function (result) {
          errorMsgBox = false;
          errorResolve(result.response);
        });
      }

      SystemNotification("予期しないエラーが発生しました。");
    }
  } catch {
    return;//ここでエラーだすとループするので何が何でもreturnだけ
  }
});

function GeneralError_handler(err) {
  console.error(new Date().toLocaleString(), err)
}

//エラーメッセージの作成。エラー原因のツリー
function causeTree(err) {
  try {
    var ErrString = err.stack;
    var i = 0;

    try {
      while (err.cause && i < 10) {
        ErrString += `\n[cause]:${err.cause.stack}`;
        i++;
        err = err.cause;
      }
    } catch { }

    try {
      //ユーザーのフォルダ構成を秘匿
      var homeDir = app.getAppPath();
      homeDir = homeDir.replaceAll("\\", "/");//バックスラッシュ対策
      ErrString = ErrString.replace(homeDir, '<0quake_root>');
    } catch { }

    return ErrString;
  } catch (e) {
    return "エラーログツリーの作成に失敗";
  }
}

//エラー処理
function errorResolve(response) {
  try {
    switch (response) {
      case 0:
        app.relaunch();
        app.exit(0);
        break;
      case 1:
        app.exit(0);
        break;
    }
  } catch {
    return;
  }
}

//アプリのロード完了イベント
electron.app.on("ready", () => {
  //タスクトレイアイコン
  tray = new electron.Tray(
    // eslint-disable-next-line no-undef
    `${__dirname}/img/icon.${process.platform === "win32" ? "ico" : "png"}`
  );
  tray.setToolTip("Zero Quake");
  tray.setContextMenu(
    electron.Menu.buildFromTemplate([
      {
        label: "メイン画面の表示",
        click: () => {
          CreateMainWindow();
        },
      },
      {
        label: "設定",
        click: () => {
          Create_SettingWindow();
        },
      },
      { type: "separator" },
      {
        label: "再起動",
        click: () => {
          app.relaunch();
          app.exit(0);
        },
      },
      {
        label: "終了",
        click: () => {
          app.exit(0);
        },
      },
    ])
  );
  tray.on("double-click", function () {
    CreateMainWindow();
  });

  electron.powerMonitor.on("resume", () => {
    UpdateEQInfo();
    RegularExecution();
    if (WolfxConnection) WolfxConnection.sendUTF("query_jmaeew");
    if (ProjectBS_Connection) ProjectBS_Connection.sendUTF("queryjson");
  });
});

app.on("second-instance", CreateMainWindow);

//レンダラープロセスからのメッセージ
ipcMain.on("message", (_event, response) => {
  switch (response.action) {
    case "kmoniReturn":
      ConvertKmoni(response.data, response.date);
      break;
    case "SnetReturn":
      ConvertSnet(response.data, response.date, response.y, response.uid);
      break;
    case "SettingWindowOpen":
      Create_SettingWindow();
      break;
    case "TsunamiWindowOpen":
      Create_TsunamiWindow();
      break;
    case "EQInfoWindowOpen":
      EQInfo_createWindow(response);
      break;
    case "EQInfoWindowOpen_IS_WebURL":
      EQInfo_createWindow(response, true);
      break;
    case "openAtLogin":
      setOpenAtLogin(response.data);
      break;
    case "ChangeConfig":
      config = response.data;
      store.set("config", config);

      if (SettingWindow) {
        SettingWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }

      if (response.from == "ConfigWindow") {
        if (MainWindow) {
          MainWindow.reload();
          MainWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (WorkerWindow) {
          WorkerWindow.reload();
          WorkerWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (TsunamiWindow) {
          TsunamiWindow.reload();
          TsunamiWindow.webContents.setZoomFactor(config.system.zoom);
        }
        if (NankaiWindow.window) {
          NankaiWindow.window.reload();
          NankaiWindow.window.webContents.setZoomFactor(config.system.zoom);
        }
        if (SettingWindow) {
          SettingWindow.reload();
          SettingWindow.webContents.setZoomFactor(config.system.zoom);
        }
        Object.keys(EQI_Window).forEach(function (key) {
          if (EQI_Window[key] && EQI_Window[key].window) {
            EQI_Window[key].window.reload();
            EQI_Window[key].window.webContents.setZoomFactor(config.system.zoom);
          }
        });
      }
      break;
    case "EEWSimulation":
      EEW_Marge(response.data);
      break;
    case "checkForUpdate":
      checkUpdate(true);
      break;
    case "tsunamiReqest":
      if (Tsunami_data_Marged) {
        messageToMainWindow({
          action: "tsunamiUpdate",
          data: Tsunami_data_Marged,
        });
      }
      break;
    case "mapLoaded":
      if (kmoniPointsDataTmp) messageToMainWindow(kmoniPointsDataTmp);
      if (SnetPointsDataTmp) messageToMainWindow(SnetPointsDataTmp);
      if (TremRtsData_Marged) messageToMainWindow(TremRtsData_Marged);
      break;
    case "replay":
      replay(response.date);
      break;
    case "NankaiWindowOpen":
      Create_NankaiWindow(response.type);
      break;
    case "HokkaidoSanrikuWindowOpen":
      Create_HokkaidoSanrikuWindow();
      break;
    case "KatsudoJokyoInfoWindowOpen":
      Create_KatsudoJokyoWindow()
      break;
    case "internetConnection":
      if (response.internetConnection) {
        UpdateEQInfo();
        RegularExecution();
        if (WolfxConnection) WolfxConnection.sendUTF("query_jmaeew");
        if (ProjectBS_Connection) ProjectBS_Connection.sendUTF("queryjson");
        Req_TremRts_sta();
      }
      break;
    case "Request_gaikyo":
      Req_JMA_gaikyo();
      break;
    case "Request_tide":
      Req_JMATide();
      break;
    case "Request_wepa":
      Req_JMA_wepa();
      break;
    case "Request_usgs":
      Req_USGS();
      break;
    case "wepa_window":
      Create_WepaWindow(response.fname);
      break;
    case "Req_additionalEQInfo_JMA":
      if (JMA_CurrentInfoNumber < 1000) {//naknのMAX3000件以下にすべし
        JMA_CurrentInfoNumber += 5;
        UpdateEQInfo();
      } else {
        messageToMainWindow({ action: "Deny_additionalEQInfo_JMA" });
      }
      break;
    case "Req_additionalEQInfo_USGS":
      if (USGS_CurrentInfoNumber < 1000) {
        USGS_CurrentInfoNumber += 25;
        Req_USGS();
      } else {
        messageToMainWindow({ action: "Deny_additionalEQInfo_USGS" });
      }
      break;
  }
});

function setOpenAtLogin(openAtLogin) {
  // eslint-disable-next-line no-undef
  if (process.platform != "win32") {
    app.setLoginItemSettings({ openAtLogin: openAtLogin });
  } else {
    app.setLoginItemSettings({ openAtLogin: false });

    const homePath = String(app.getPath("home")).replace(/\\/g, "/");
    const dist = `${homePath}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/ZeroQuake.lnk`;
    if (openAtLogin) {
      const source = String(app.getPath("exe")).replace(/\\/g, "/");
      let command = `
  $WshShell = New-Object -ComObject WScript.Shell;
  $ShortCut = $WshShell.CreateShortcut("${dist}");
  $ShortCut.TargetPath = "${source}";
  $ShortCut.Save();
  `;
      exec(command, { shell: "powershell.exe" });
    } else {
      if (fs.existsSync(dist))
        fs.unlink(dist, () => {
          return;
        });
    }
  }
}

const unresponsiveMsg = {
  type: "question",
  title: "ウィンドウが応答しません。",
  message: "動作を選択してください。",
  buttons: ["画面を再表示", "アプリを再起動", "待機"],
  noLink: true,
};

var JMA_CurrentInfoNumber = 20;
var USGS_CurrentInfoNumber = 20;
//メインウィンドウ表示処理
function CreateMainWindow() {
  try {
    if (MainWindow && !MainWindow.isDestroyed()) {
      if (MainWindow.isMinimized()) MainWindow.restore();
      if (!MainWindow.isFocused()) MainWindow.focus();
      if (!MainWindow.isVisible()) MainWindow.show();
    } else {
      MainWindow = new BrowserWindow({
        x: store.get("x", null),
        y: store.get("y", null),
        width: store.get("width", 800),
        height: store.get("height", 640),

        minWidth: 650,
        minHeight: 400,
        icon: path.join(__dirname, "img/icon.ico"),
        webPreferences: {
          preload: path.join(__dirname, "js/preload.js"),
          title: "Zero Quake",
          backgroundThrottling: false,
        },
        backgroundColor: "#222225",
        alwaysOnTop: config.system.alwaysOnTop,
      });
      if (store.get("Maximized", null)) MainWindow.maximize()
      else MainWindow.unmaximize()

      MainWindow.webContents.on("did-finish-load", () => {
        MainWindow.webContents.setZoomFactor(config.system.zoom);

        if (notifyData) messageToMainWindow(notifyData);

        if (Replay !== 0) {
          messageToMainWindow({ action: "Replay", data: Replay });
        }

        Object.keys(kmoniTimeTmp).forEach(function (key) {
          var elm = kmoniTimeTmp[key];
          messageToMainWindow({
            action: "UpdateStatus",
            timestamp: elm.timestamp,
            LocalTime: elm.LocalTime,
            type: elm.type,
            condition: elm.condition,
          });
        });

        messageToMainWindow({ action: "setting", data: config });

        if (EEW_Active.length > 0) {
          messageToMainWindow({ action: "EEW_AlertUpdate", data: EEW_Active });
        }

        if (eqInfo.jma.length > 0) {
          messageToMainWindow({
            action: "EQInfo",
            source: "jma",
            data: eqInfo.jma.slice(0, JMA_CurrentInfoNumber),
          });
        }
        if (eqInfo.usgs.length > 0) {
          messageToMainWindow({
            action: "EQInfo",
            source: "usgs",
            data: eqInfo.usgs.slice(0, USGS_CurrentInfoNumber),
          });
        }
        EQCount_process(null)

        EQDetect_List.forEach(function (elm) {
          var threshold01Tmp = elm.isCity ? thresholds.threshold01C : thresholds.threshold01;
          if (elm.Codes.length >= threshold01Tmp) {
            messageToMainWindow({ action: "EQDetect", data: elm });
          }
        });

        if (kmoniPointsDataTmp) messageToMainWindow(kmoniPointsDataTmp);
        if (SnetPointsDataTmp) messageToMainWindow(SnetPointsDataTmp);
        if (NankaiTroughInfo) {
          messageToMainWindow({
            action: "NankaiTroughInfo",
            data: NankaiTroughInfo,
          });
        }
        if (HokkaidoSanrikuInfoAll[0]) {
          messageToMainWindow({
            action: "HokkaidoSanrikuInfo",
            data: HokkaidoSanrikuInfoAll[0],
          });
        }
        if (KatsudoJokyoInfoAll[0]) {
          messageToMainWindow({
            action: "KatsudoJokyoInfo",
            data: KatsudoJokyoInfoAll[0],
          });
        }

        messageToMainWindow({ action: "init" });
      });

      MainWindow.loadFile("src/index.html");

      var savePosition = throttle(function () {
        const { x, y, width, height } = MainWindow.getBounds();
        store.set({ x, y, width, height });
        store.set("Maximized", MainWindow.isMaximized());
      }, 300);
      MainWindow.on('maximize', savePosition)
        .on('unmaximize', savePosition)
        .on('resize', savePosition)
        .on('move', savePosition);

      MainWindow.on("unresponsive", () => {
        MainWindow.responsive = true;
        setTimeout(function () {
          if (MainWindow.responsive) {
            dialog.showMessageBox(MainWindow, unresponsiveMsg).then(function (result) {
              switch (result.response) {
                case 0:
                  MainWindow.loadFile("src/index.html");
                  break;
                case 1:
                  app.relaunch();
                  app.exit(0);
                  break;
              }
            });
          }
        }, 5000);
      }).on("responsive", () => {
        MainWindow.responsive = false;
      });

      MainWindow.on("focus", () => {
        messageToMainWindow({ action: "activate" });
      }).on("show", () => {
        messageToMainWindow({ action: "activate" });
      }).on("hide", () => {
        messageToMainWindow({ action: "deactivate" });
      }).on("restore", () => {
        messageToMainWindow({ action: "activate" });
      }).on("minimize", () => {
        messageToMainWindow({ action: "deactivate" });
      });

      MainWindow.on("close", (event) => {
        if (!MainWindow.isDestroyed()) {
          event.preventDefault();
          MainWindow.hide();
        }
      }).on("closed", () => {
        MainWindow = null;
      });
    }
  } catch (err) {
    throw new Error("メインウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//ワーカーウィンドウ表示処理
function Create_WorkerWindow() {
  if (WorkerWindow) WorkerWindow.close();
  WorkerWindow = new BrowserWindow({
    webPreferences: { preload: path.join(__dirname, "js/preload.js") },
    backgroundThrottling: false,
    show: false,
  });
  WorkerWindow.on("close", () => {
    WorkerWindow = null;
    setTimeout(Create_WorkerWindow, 2000)
  });
  WorkerWindow.webContents.on("did-finish-load", () => {
    WorkerWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });
  });
  WorkerWindow.loadFile("src/WorkerWindow.html");
  WorkerWindow.on("unresponsive", () => {
    WorkerWindow.responsive = true;
    setTimeout(function () {
      if (WorkerWindow.responsive) Create_WorkerWindow();
    }, 5000);
  });
  WorkerWindow.on("responsive", () => {
    WorkerWindow.responsive = false;
  });
}
//設定ウィンドウ表示処理
function Create_SettingWindow(update) {
  try {
    if (SettingWindow) {
      if (SettingWindow.isMinimized()) SettingWindow.restore();
      if (!SettingWindow.isFocused()) SettingWindow.focus();
      return false;
    }

    SettingWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "設定 - Zero Quake",
        parent: MainWindow ? MainWindow : null,
        center: true,
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    SettingWindow.webContents.on("did-finish-load", () => {
      SettingWindow.webContents.setZoomFactor(config.system.zoom);

      if (Replay !== 0) {
        SettingWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }

      const homePath = String(app.getPath("home")).replace(/\\/g, "/");
      SettingWindow.webContents.send("message2", {
        action: "initialData",
        config: config,
        defaultConfigVal: defaultConfigVal,
        softVersion: package_ver,
        openAtLogin: app.getLoginItemSettings().openAtLogin
          || fs.existsSync(`${homePath}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/ZeroQuake.lnk`),
        updatePanelMode: update,
      });
      if (update_data) {
        SettingWindow.webContents.send("message2", {
          action: "Update_Data",
          data: update_data,
        });
      }
    });
    SettingWindow.on("closed", () => {
      SettingWindow = null;
    });

    SettingWindow.loadFile("src/settings.html");
    SettingWindow.webContents.on("will-navigate", handleUrlOpen);
    SettingWindow.webContents.on("new-window", handleUrlOpen);
    SettingWindow.webContents.on("will-prevent-unload", (event) => {
      console.log(event)
      //if (handling_url) return handling_url = false;

      const choice = dialog.showMessageBoxSync(SettingWindow, {
        type: "question",
        title: "確認",
        message: "変更した設定を保存していません。\n設定を破棄して設定画面を閉じますか？",
        buttons: ["閉じる", "画面に戻る"],
        noLink: true,
        defaultId: 1,
        cancelId: 1,
      });
      if (choice == 0) event.preventDefault();
    });
  } catch (err) {
    throw new Error("設定ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//津波情報ウィンドウ表示処理
function Create_TsunamiWindow() {
  try {
    if (TsunamiWindow) {
      if (TsunamiWindow.isMinimized()) TsunamiWindow.restore();
      if (!TsunamiWindow.isFocused()) TsunamiWindow.focus();
      return false;
    }
    TsunamiWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "津波詳細情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    TsunamiWindow.webContents.on("did-finish-load", () => {
      TsunamiWindow.webContents.setZoomFactor(config.system.zoom);

      TsunamiWindow.webContents.send("message2", {
        action: "setting",
        data: config,
      });
      TsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: Tsunami_data_Marged,
      });
    });
    TsunamiWindow.loadFile("src/TsunamiDetail.html");

    TsunamiWindow.on("closed", () => {
      TsunamiWindow = null;
    });
  } catch (err) {
    throw new Error("津波情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}
//南海トラフ関連情報ウィンドウの作成
var NankaiWindow = { type: null, window: null };
function Create_NankaiWindow(type) {
  try {
    var win = NankaiWindow.window;
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isFocused()) win.focus();
    }

    if (win) {
      if (NankaiWindow.type == type) {
        //同じ情報について表示していたならおわる
        return false;
      } else NankaiWindow.type = type;
    } else {
      NankaiWindow.type = type;
      NankaiWindow.window = new BrowserWindow({
        minWidth: 650,
        minHeight: 400,
        icon: path.join(__dirname, "img/icon.ico"),
        webPreferences: {
          preload: path.join(__dirname, "js/preload.js"),
          title: "南海トラフ地震に関連する情報 - Zero Quake",
        },
        backgroundColor: "#222225",
        alwaysOnTop: config.system.alwaysOnTop,
      });

      NankaiWindow.window.webContents.on("did-finish-load", () => {
        NankaiWindow.window.webContents.setZoomFactor(config.system.zoom);

        var data =
          NankaiWindow.type == "rinji" ? NankaiTroughInfo.rinji : NankaiTroughInfo.teirei;
        if (data) {
          NankaiWindow.window.webContents.send("message2", {
            action: "NankaiTroughInfo",
            data: data,
          });
          NankaiWindow.window.webContents.send("message2", {
            action: "setting",
            data: config,
          });
        }
      });

      NankaiWindow.window.on("closed", () => {
        NankaiWindow.window = null;
      });
    }

    NankaiWindow.window.loadFile("src/NankaiTrough.html");
  } catch (err) {
    throw new Error("南海トラフ関連情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//WEPA40 国際津波関連情報ウィンドウ
var WepaWindow = {}
function Create_WepaWindow(fname) {
  try {
    if (WepaWindow[fname]) {
      if (WepaWindow[fname].isMinimized()) WepaWindow[fname].restore();
      if (!WepaWindow[fname].isFocused()) WepaWindow[fname].focus();
      return false;
    }

    WepaWindow[fname] = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "国際津波関連情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    WepaWindow[fname].webContents.on("did-finish-load", () => {
      WepaWindow[fname].webContents.setZoomFactor(config.system.zoom);

      if (fname) {
        WepaWindow[fname].webContents.send("message2", {
          action: "metadata",
          fname: fname,
        });
        WepaWindow[fname].webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
    });

    WepaWindow[fname].on("closed", () => {
      delete WepaWindow[fname];
    });

    WepaWindow[fname].loadFile("src/WEPA.html");
  } catch (err) {
    throw new Error("国際津波関連情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//北海道・三陸沖後発地震注意情報ウィンドウ
var HokkaidoSanrikuWindow;
function Create_HokkaidoSanrikuWindow() {
  try {
    if (HokkaidoSanrikuWindow) {
      if (HokkaidoSanrikuWindow.isMinimized()) HokkaidoSanrikuWindow.restore();
      if (!HokkaidoSanrikuWindow.isFocused()) HokkaidoSanrikuWindow.focus();
      return false;
    }

    HokkaidoSanrikuWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "北海道・三陸沖後発地震注意情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    HokkaidoSanrikuWindow.webContents.on("did-finish-load", () => {
      HokkaidoSanrikuWindow.webContents.setZoomFactor(config.system.zoom);

      if (HokkaidoSanrikuInfoAll[0]) {
        HokkaidoSanrikuWindow.webContents.send("message2", {
          action: "HokkaidoSanrikuInfo",
          data: HokkaidoSanrikuInfoAll[0],
        });
        HokkaidoSanrikuWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
    });

    HokkaidoSanrikuWindow.on("closed", () => {
      HokkaidoSanrikuWindow = null;
    });

    HokkaidoSanrikuWindow.loadFile("src/HokkaidoSanriku.html");
  } catch (err) {
    throw new Error("北海道・三陸沖後発地震注意情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

//地震の活動状況等に関する情報ウィンドウ
var KatsudoJokyoWindow
function Create_KatsudoJokyoWindow() {
  try {
    if (KatsudoJokyoWindow) {
      if (KatsudoJokyoWindow.isMinimized()) KatsudoJokyoWindow.restore();
      if (!KatsudoJokyoWindow.isFocused()) KatsudoJokyoWindow.focus();
      return false;
    }

    KatsudoJokyoWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "地震の活動状況等に関する情報 - Zero Quake",
      },
      backgroundColor: "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    KatsudoJokyoWindow.webContents.on("did-finish-load", () => {
      KatsudoJokyoWindow.webContents.setZoomFactor(config.system.zoom);

      if (KatsudoJokyoInfoAll[0]) {
        KatsudoJokyoWindow.webContents.send("message2", {
          action: "KatsudoJokyoInfo",
          data: KatsudoJokyoInfoAll[0],
        });
        KatsudoJokyoWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });
      }
    });

    KatsudoJokyoWindow.on("closed", () => {
      KatsudoJokyoWindow = null;
    });

    KatsudoJokyoWindow.loadFile("src/KatsudoJokyo.html");
  } catch (err) {
    throw new Error("地震の活動状況等に関する情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

function messageToMainWindow(message) {
  if (MainWindow) MainWindow.webContents.send("message2", message);
}

//地震情報ウィンドウ表示処理
var EQI_Window = {};
var handling_url = false;
function handleUrlOpen(e, url) {
  if (url.startsWith("http")) {
    handling_url = true;
    setTimeout(function () {
      handling_url = false;
    }, 5)
    e.preventDefault();
    shell.openExternal(url);
  }
}
function EQInfo_createWindow(response, IS_WebURL) {
  try {
    var EQInfoWindowT = EQI_Window[response.eid];
    if (EQInfoWindowT) {
      if (EQInfoWindowT.window.isMinimized()) EQInfoWindowT.window.restore();
      if (!EQInfoWindowT.window.isFocused()) EQInfoWindowT.window.focus();
      return;
    }

    var EQInfoWindow = new BrowserWindow({
      minWidth: 650,
      minHeight: 400,
      icon: path.join(__dirname, "img/icon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "地震詳細情報 - Zero Quake",
      },
      backgroundColor: IS_WebURL ? null : "#222225",
      alwaysOnTop: config.system.alwaysOnTop,
    });

    if (!IS_WebURL) {
      var EEWDataItem = EEW_Storage.find(function (elm) {
        return elm.EventID == response.eid;
      });
      var metadata = {
        action: "metaData",
        eid: response.eid,
        urls: response.urls,
        data: response.data,
        eew: EEWDataItem,
        axisData: response.axisData,
      };
      EQI_Window[response.eid] = { window: EQInfoWindow, metadata: metadata };

      EQInfoWindow.webContents.on("did-finish-load", () => {
        EQInfoWindow.webContents.setZoomFactor(config.system.zoom);

        EQInfoWindow.webContents.send("message2", {
          action: "setting",
          data: config,
        });

        EQInfoWindow.webContents.send("message2", metadata);
      });

      EQInfoWindow.on("closed", () => {
        EQI_Window[response.eid] = null;
      });
    }

    if (IS_WebURL) EQInfoWindow.loadURL(response.url);
    else EQInfoWindow.loadFile(response.url);
    EQInfoWindow.webContents.on("will-navigate", handleUrlOpen);
    EQInfoWindow.webContents.on("new-window", handleUrlOpen);
  } catch (err) {
    throw new Error("地震情報ウィンドウの作成でエラーが発生しました。", { cause: err });
  }
}

var TTT_JMA2001 = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/TimeTable_JMA2001.json"))
);
var TTT_AK135 = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/ak135table.json"))
);

//開始処理
function start() {
  //replay("2026/4/20 16:55:40")
  //地震検知ワーカー作成
  createWorker();

  //↓WebSocket接続処理
  P2P();
  AXIS();
  ProjectBS();
  WolfxWS();
  SeisjsWS();

  //HTTP定期GET着火
  Req_SNet();
  Req_kmoni();
  SetKmoniOffset(Req_kmoni);
  UpdateEQInfo(true); //地震情報定期取得 着火
  Req_EarlyEst();
  Req_TremRts();

  //定期実行 着火
  RegularExecution(true);

  //一回限り
  Req_TremRts_sta();
  Req_JMATide_sta();

}

function Req_JMA_gaikyo() {
  fetch(`https://www.data.jma.go.jp/svd/eqev/data/gaikyo/?_=${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      const doc = DomPsr.parseFromString(text, "text/html");
      var data = [];
      doc.querySelectorAll("ul.subMenu li a").forEach(function (elm) {
        var href = elm.getAttribute("href");
        if (href.includes("monthly/")) {
          var date = new Date(elm.textContent.substring(0, 4), elm.textContent.substring(5, 7) - 1 + 1, 0); //月の最終日を取得
          data.push({
            date: date,
            dateStr: `${elm.textContent.substring(0, 4)}/${elm.textContent.substring(5, 7)}`,
            title: "地震・火山月報（防災編）",
            headline: "地震・火山月報（防災編）",
            url: `https://www.data.jma.go.jp/svd/eqev/data/gaikyo/${href}`,
          });
        } else if (href.includes("press/") || href.includes("oshirase/")) {
          data.push({
            date: new Date(
              elm.textContent.substring(0, 4), elm.textContent.substring(5, 7) - 1, elm.textContent.substring(8, 10),
              elm.textContent.substring(11, 13), elm.textContent.substring(14, 16)),
            dateStr: `${elm.textContent.substring(0, 4)}/${elm.textContent.substring(5, 7)}/${elm.textContent.substring(8, 10)} ${elm.textContent.substring(11, 13)}:${elm.textContent.substring(14, 16)}`,
            title: "地震解説資料",
            headline: `地震解説資料\n${elm.textContent.substring(17).trim()}`,
            url: `https:${href}`,
          });
        } else if (href.includes("weekly/zenkoku/")) {
          var year = Number(elm.textContent.substring(0, 4));
          var year2 = Number(year);
          var number = Number(elm.textContent.substring(8, 10));
          if (number == 1 && Number(elm.textContent.substring(19, 21)) == 12) year -= 1;
          data.push({
            date0: new Date(year, elm.textContent.substring(19, 21) - 1, elm.textContent.substring(22, 24)),
            date: new Date(year2, elm.textContent.substring(31, 33) - 1, elm.textContent.substring(34, 36)),
            dateStr: `${year} / ${elm.textContent.substring(19, 21)} / ${elm.textContent.substring(22, 24)}～${elm.textContent.substring(31, 33)} / ${elm.textContent.substring(34, 36)}`,
            title: "週間地震概況（全国）",
            headline: `週間地震概況（全国）No.${number}`,
            url: `https://www.data.jma.go.jp/svd/eqev/data/gaikyo/${href}`,
          });
        } else if (href.includes("weekly/nt/")) {
          var year = Number(elm.textContent.substring(0, 4));
          var year2 = Number(year);
          var number = Number(elm.textContent.substring(8, 10));
          if (number == 1 && Number(elm.textContent.substring(19, 21)) == 12)
            year -= 1;
          data.push({
            date0: new Date(year, elm.textContent.substring(19, 21) - 1, elm.textContent.substring(22, 24)),
            date: new Date(year2, elm.textContent.substring(31, 33) - 1, elm.textContent.substring(34, 36)),
            dateStr: `${year} / ${elm.textContent.substring(19, 21)} / ${elm.textContent.substring(22, 24)}～${elm.textContent.substring(31, 33)} / ${elm.textContent.substring(34, 36)}`,
            title: "週間地震活動概況（南海トラフ周辺）",
            headline: `週間地震活動概況（南海トラフ周辺）No.${number}`,
            url: `https://www.data.jma.go.jp/svd/eqev/data/gaikyo/${href}`,
          });
        }
      });
      data.sort((a, b) => a.date < b.date ? 1 : -1);
      messageToMainWindow({ action: "Return_gaikyo", data: data });
    }).catch((err) => {
      GeneralError_handler(err);
      messageToMainWindow({ action: "Return_gaikyo", data: [] });
    });
}

function Req_JMA_wepa() {
  fetch(`https://www.jma.go.jp/bosai/pacifictsunami/data/list.json?_=${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      messageToMainWindow({ action: "Return_wepa", data: json });
    }).catch((err) => {
      GeneralError_handler(err)
      messageToMainWindow({ action: "Return_wepa", data: [] });
    });
}

var TremRts_sta;
var Trem_server = true;
function Req_TremRts_sta() {
  fetch(`https://api-${Trem_server ? 1 : 2}.exptech.dev/api/v1/trem/station?_=${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      TremRts_sta = json;
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("TREM-RTS", "Error");
      Trem_server = !Trem_server;
    });
}

var TremRTS_server = true;
var Trem_URLs = {
  RT: [//リアルタイム
    "https://lb-1.exptech.dev/api/v1/trem/rts",
    "https://lb-2.exptech.dev/api/v1/trem/rts",
    "https://lb-3.exptech.dev/api/v1/trem/rts",
    "https://lb-4.exptech.dev/api/v1/trem/rts",
  ],
  Hi: [
    "https://api-1.exptech.dev/api/v1/trem/rts/[UNIXTIME]",
    "https://api-2.exptech.dev/api/v1/trem/rts/[UNIXTIME]"
  ]
}
function Req_TremRts() {
  setTimeout(Req_TremRts, config.Source.TREMRTS.Interval);

  if (!config.Source.TREMRTS.GetData) return;
  if (!TremRts_sta) Req_TremRts_sta();

  if (Replay !== 0) var url = `https://api-${TremRTS_server ? 1 : 2}.exptech.dev/api/v1/trem/rts/${Number(new Date() - Replay)}`;
  else var url = `https://lb-${TremRTS_server ? 1 : 2}.exptech.dev/api/v1/trem/rts?_=${Number(new Date())}`;


  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var TremRtsData = {};
      Object.keys(json.station).forEach(function (StID) {
        var st = json.station[StID];
        var stationData = TremRts_sta ? TremRts_sta[StID] : null;
        if (stationData) {
          var JPShindo = st.i; //おおむね対応するため、現時点では変換不要と判断
          var rgb = KmoniColorTable[Math.min(7, Math.max(-3, Math.floor(JPShindo * 10) / 10))];
          TremRtsData[StID] = {
            Type: "TREMRTS",
            shindo: JPShindo,
            PGA: st.pga,
            Code: StID,
            Name: "",
            IsSuspended: false,
            Region: "",
            Location: {
              Longitude: stationData.info[0].lon,
              Latitude: stationData.info[0].lat,
            },
            rgb: [rgb.r, rgb.g, rgb.b],
          };
        }
      });
      TremRtsData_Marged = {
        action: "TREM-RTSUpdate",
        LocalTime: new Date(),
        data: TremRtsData,
      };
      messageToMainWindow(TremRtsData_Marged);
      UpdateStatus("TREM-RTS", "success", new Date(json.time));

    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("TREM-RTS", "Error");
      TremRTS_server = !TremRTS_server;
    });

}

function sort_by_dist_TIDE(data) {
  return data.sort((a, b) => {
    var a_dist = turf.distance([a.lon, a.lat], [config.home.longitude, config.home.latitude]);
    var b_dist = turf.distance([b.lon, b.lat], [config.home.longitude, config.home.latitude]);
    return a_dist - b_dist
  })
}

var JMATide_sta;
function Req_JMATide_sta() {
  fetch(`https://www.jma.go.jp/bosai/tidelevel/const/tide_area.json?_=${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var stations = []
      Object.keys(json).forEach(function (key) {
        var el = json[key]
        el.class30s.forEach(function (cl) {
          if (cl.stations) {
            cl.stations.forEach(function (st) {
              if (st.code && st.lat && st.lon && st.name) {//データ有効性チェック
                st.threshold_warn = cl.standard.level4
                st.threshold_advisory = cl.standard.level5
                stations.push(st);
              }
            });
          }
        });
      });

      //↓近い順10件
      stations = sort_by_dist_TIDE(stations);
      JMATide_sta = stations.slice(0, 10)
      //↑近い順10件
    }).catch((err) => {
      GeneralError_handler(err)
      messageToMainWindow({ action: "Return_tide", data: [] });
    });
}

var JMATide_astro = {};
var JMATide_obs = {};
function Req_JMATide() {
  if (!JMATide_sta) Req_JMATide_sta();
  JMATide_sta.forEach(function (st) {

    if (!JMATide_astro[st.code]) {
      fetch(`https://www.jma.go.jp/bosai/tidelevel/const/tide_astro/tide_astro_${NormalizeDate("YYYY", new Date() - Replay)}_${st.code}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
          return r.json();
        }).then((json) => {
          if (json.tide) {
            var tide = json.tide;
            JMATide_astro[st.code] = tide

            if (JMATide_obs[st.code]) {//★1と同じ
              JMATide_obs[st.code].astro = tide[NormalizeDate("MMDD", new Date() - Replay)][NormalizeDate("h", new Date() - Replay)]
              messageToMainWindow({ action: "Return_tide", data: sort_by_dist_TIDE(Object.values(JMATide_obs)) });
            }
          }
        }).catch((err) => {
          GeneralError_handler(err)
          messageToMainWindow({ action: "Return_tide", data: [] });
        });
    }

    fetch(`https://www.jma.go.jp/bosai/tidelevel/data/tide/tide_obs_${NormalizeDate(2, new Date() - Replay)}_${st.code}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
        return r.json();
      }).then((json) => {
        if (json.tide && json.tide.length >= 4) {
          var obsdata = {
            code: st.code,
            name: st.name,
            by: st.typeName ? st.typeName.replaceAll("（地図では自治体等）", "") : "-",
            date: new Date(Number(new Date(json.time)) + (json.interval * json.tide.length * 1000)),
            threshold_warn: st.threshold_warn,
            threshold_advisory: st.threshold_advisory
          };

          var part = json.tide.slice(-4);
          var height;
          switch (config.Info.TideHeight.processing) {
            case "median":
              var sorted = part.sort((a, b) => a - b);
              height = (sorted[1] + sorted[2]) / 2
              break;
            default:
            case "latest":
              height = json.tide[json.tide.length - 1]
              break;
          }
          obsdata.height = height;

          if (JMATide_astro[st.code]) {//★1と同じ処理
            obsdata.astro = JMATide_astro[st.code][NormalizeDate("MMDD", new Date() - Replay)][NormalizeDate("h", new Date() - Replay)]
          }

          JMATide_obs[st.code] = obsdata
          messageToMainWindow({ action: "Return_tide", data: sort_by_dist_TIDE(Object.values(JMATide_obs)) });
        }
      }).catch((err) => {
        GeneralError_handler(err)
        messageToMainWindow({ action: "Return_tide", data: [] });
      });
  })
}


function Req_EarlyEst() {
  setTimeout(Req_EarlyEst, config.Source.EarlyEst.Interval);

  if (!config.Source.EarlyEst.GetData) return;

  fetch("http://early-est.rm.ingv.it/monitor.xml")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      UpdateStatus("Early-est", "success");
      let doc = DomPsr.parseFromString(text, "text/xml");
      Array.prototype.forEach.call(
        doc.getElementsByTagName("eventParameters"),
        function (parent) {
          var elm = parent.getElementsByTagName("event")[0];
          if (!elm) return;
          var latitude = elm.querySelector("origin latitude value") ? Number(elm.querySelector("origin latitude value").textContent) : null;
          var longitude = elm.querySelector("origin longitude value") ? Number(elm.querySelector("origin longitude value").textContent) : null;
          if (!Boolean2(latitude) || !Boolean2(longitude)) return;

          var FECode = FERegion.features.find(function (elm2) {
            return turf.booleanPointInPolygon([longitude, latitude], elm2);
          });
          if (!FECode) return;

          var data = {
            alertflg: "EarlyEst",
            EventID: Number(String(elm.getAttribute("publicID")).slice(-12)),
            serial: Number(elm.querySelector("origin quality").getElementsByTagName("ee:report_count")[0].textContent) + 1,
            report_time: elm.querySelector("creationInfo creationTime") ? ConvertJST(new Date(elm.querySelector("creationInfo creationTime").textContent)) : null,
            magnitude: elm.querySelector("magnitude mag value") ? Number(elm.querySelector("magnitude mag value").textContent) : null,
            depth: elm.querySelector("origin depth value") ? Number(elm.querySelector("origin depth value").textContent) / 1000 : null,
            latitude: latitude,
            longitude: longitude,
            region_name: FECode.properties.nameJA,
            origin_time: elm.querySelector("origin time value") ? ConvertJST(new Date(elm.querySelector("origin time value").textContent)) : null,
            source: "EarlyEst",
          };
          EarlyEst_Marge(data);
        }
      );
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("Early-est", "Error");
    });
}

function createWorker() {
  worker = new workerThreads.Worker(path.join(__dirname, "js/EQDetectWorker.js"));
  worker.on("message", (message) => {
    switch (message.action) {
      case "EQDetectAdd":
        var EQD_ItemTmp = message.data;
        var LvTmp = EQD_ItemTmp.maxPGA > 1.3 ? 2 : 1;

        if (config.Info.RealTimeShake.noticeLv <= LvTmp) {
          if (EQD_ItemTmp.showed) {//続報時
            if (LvTmp == 2 && EQD_ItemTmp.Lv == 1) {
              //既存イベントのレベルが上がったときの通知音
              PlayAudio("EQDetectLv2");
            }
          } else if (LvTmp == 2) {//初報時・大
            PlayAudio("EQDetectLv2");
            CreateMainWindow();
          } else if (LvTmp == 1) {//初報時・小
            PlayAudio("EQDetectLv1");
            CreateMainWindow();
          }
        }
        EQD_ItemTmp.Lv = LvTmp;
        messageToMainWindow({ action: "EQDetect", data: message.data });
        break;
      case "sendDataToMainWindow":
        messageToMainWindow(message.data);
        break;
      case "sendDataToWorkerWindow":
        if (WorkerWindow) WorkerWindow.webContents.send("message2", message.data);
        break;
      case "thresholds":
        thresholds = message.data;
        break;
      case "PointsData_Update":
        EQDetect_List = message.EQDetect_List;
        kmoniPointsDataTmp = {
          action: "kmoniUpdate",
          timestamp: new Date(message.date),
          LocalTime: new Date(),
          data: message,
        };
        messageToMainWindow(kmoniPointsDataTmp);
        break;
    }
  });
  worker.on("error", (error) => {
    throw new Error("地震検知処理でエラーが発生しました。", { cause: error });
  });
}

//強震モニタリアルタイム揺れ情報処理（地震検知など）
function ConvertKmoni(data, date) {
  worker.postMessage({
    action: "EQDetect",
    data: data,
    date: date,
    detect: config.Info.RealTimeShake.DetectEarthquake,
  });
}

//海しるリアルタイム揺れ情報処理
var msil_latest = { 11: null, 12: null }
function ConvertSnet(data, date, y, uid) {
  msil_latest[y] = [uid, data]
  var another = ((y == 11) ? 12 : 11)
  if (msil_latest[another] && msil_latest[another][0] == uid) {
    SnetPointsDataTmp = {
      action: "SnetUpdate",
      timestamp: new Date(date),
      LocalTime: new Date(),
      data: {
        data: [...data, ...msil_latest[another][1]]
      },
    };
    messageToMainWindow(SnetPointsDataTmp);
  }
}

var Kmoni_URLIndex = 0;
var Kmoni_ErrorCount = 0;
var Kmoni_Timer;
var Kmoni_URLs = [
  `https://smi.lmoniexp.bosai.go.jp/data/map_img/RealTimeImg/jma_s/[YYYYMMDD]/[YYYYMMDDhhmmss].jma_s.gif`,
  `http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/jma_s/[YYYYMMDD]/[YYYYMMDDhhmmss].jma_s.gif`,
];

//強震モニタへのHTTPリクエスト
function Req_kmoni() {//済
  //タイマー処理
  if (Kmoni_Timer) clearTimeout(Kmoni_Timer);
  Kmoni_Timer = setTimeout(Req_kmoni, config.Source.kmoni.kmoni.Interval);

  if (!config.Source.kmoni.kmoni.GetData) return;

  var ReqTime = new Date() - KmoniOffset - Replay;
  var url = Kmoni_URLs[Kmoni_URLIndex]
    .replace("[YYYYMMDD]", NormalizeDate(2, ReqTime))
    .replace("[YYYYMMDDhhmmss]", NormalizeDate(1, ReqTime));

  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.arrayBuffer();
    }).then((buffer) => {
      Kmoni_ErrorCount = 0;
      if (WorkerWindow) {
        var imgBase64 = Buffer.from(buffer).toString("base64")
        WorkerWindow.webContents.send("message2", {
          action: "KmoniImgUpdate",
          data: `data:image/gif;base64,${imgBase64}`,
          date: ReqTime,
        });
      }
    }).catch((err) => {
      GeneralError_handler(err)
      Kmoni_ErrorCount++;
      if (Kmoni_ErrorCount > 3) {//エラー回数が溜まったらURLを替える
        Kmoni_ErrorCount = 0;
        Kmoni_URLIndex = (Kmoni_URLIndex + 1) % Kmoni_URLs.length//モニタURLをローリングで選択
        SetKmoniOffset(Req_kmoni);
      }
      UpdateStatus("kmoniImg", "Error");
    });
}

var Msil_Timer;
var Msil_LastRecv = 0;

//海しるへのHTTPリクエスト処理
function Req_SNet() {

  if (Msil_Timer) clearTimeout(Msil_Timer);
  Msil_Timer = setTimeout(Req_SNet, config.Source.msil.Interval);

  if (!config.Source.msil.GetData) return;
  if (!net.online) return UpdateStatus("msilImg", "Error");

  fetch(`https://www.msil.go.jp/data/tiles/smoni/targetTimes.json?${Number(new Date())}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      var json = JSON.parse(text.replace(/\s+/g, ''));

      if (!Array.isArray(json)) throw new Error("msil.go.jpが不正なフォーマットのJSONを返しました。");
      var basetime = 0;
      var NowUTC = Number(NormalizeDate(1, ConvertUTC(new Date(new Date() - Replay))));
      json.forEach(function (elm) {
        if (basetime < elm.basetime && NowUTC >= elm.basetime)
          basetime = Number(elm.basetime);
      });
      if (Msil_LastRecv < basetime) {

        function Req_SNet_core(y, unique_id) {
          fetch(`https://www.msil.go.jp/data/tiles/smoni/tileimage/${basetime}/${basetime}/5/28/${y}.png`)
            .then((r) => {
              if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
              return r.arrayBuffer();
            }).then((buffer) => {
              if (WorkerWindow) {
                var imgBase64 = Buffer.from(buffer).toString("base64");
                WorkerWindow.webContents.send("message2", {
                  action: "SnetImgUpdate",
                  y: y,
                  unique_id: unique_id,
                  data: `data:image/png;base64,${imgBase64}`,
                  date: new Date(),
                });
              }
              UpdateStatus("msilImg", "success");

            }).catch((err) => {
              GeneralError_handler(err)
              UpdateStatus("msilImg", "Error");
            });
        }
        var unique_id = String(Number(new Date())) + String(Math.floor(Math.random() * 100));
        Req_SNet_core(11, unique_id);
        Req_SNet_core(12, unique_id);
        Msil_LastRecv = basetime;
      }

    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("msilImg", "Error");
    });
}

//P2P地震情報API WebSocket接続・受信処理
var P2P_Client;
function P2P() {
  P2P_Client = new WebSocketClient();
  P2P_Client.on("connectFailed", function () {
    UpdateStatus("P2P_EEW", "Error");
    TryConnect_P2P();
  });
  P2P_Client.on("connect", function (connection) {
    connection.on("error", function () {
      UpdateStatus("P2P_EEW", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("P2P_EEW", "Disconnect");
      TryConnect_P2P();
    });
    connection.on("message", function (message) {
      try {
        if (Replay == 0 && message.type === "utf8") {
          var data = JSON.parse(message.utf8Data);
          if (data.time) UpdateStatus("P2P_EEW", "success", new Date(data.time));
          else UpdateStatus("P2P_EEW", "success");

          switch (data.code) {
            case 551:
              setTimeout(UpdateEQInfo, 10000);
              break;
            case 552:
              //津波情報
              data.issue.time = new Date(data.issue.time);
              data.cancelled = false;
              data.revocation = false;
              data.source = "P2P";

              data.areas.forEach((elm) => {
                if (elm.firstHeight) {
                  if (elm.firstHeight.condition)
                    elm.firstHeightCondition = elm.firstHeight.condition;
                  if (elm.firstHeight.arrivalTime)
                    elm.firstHeight = new Date(elm.firstHeight.arrivalTime);
                  else elm.firstHeight = null;
                }
                if (elm.maxHeight && elm.maxHeight.description)
                  elm.maxHeight = elm.maxHeight.description;
              });
              ConvertTsunamiInfo(data);
              break;
            case 556:
              //緊急地震速報（警報）
              DetectEEW(4, data);
              break;
          }
        }
      } catch {
        UpdateStatus("P2P_EEW", "Error");
      }
    });
    UpdateStatus("P2P_EEW", "success");
    P2PReconnectTimeout = 500;
  });
  Connect_P2P();
}
var P2PReconnectTimeout = 500;
function TryConnect_P2P() {
  P2PReconnectTimeout = Math.min(30000, P2PReconnectTimeout * 2);
  setTimeout(Connect_P2P, P2PReconnectTimeout);
}
function Connect_P2P() {
  if (P2P_Client) P2P_Client.connect("wss://api.p2pquake.net/v2/ws");
}

//AXIS WebSocket接続・受信処理
var AXIS_Client;
function AXIS() {
  if (!config.Source.axis.GetData) return;
  AXIS_Client = new WebSocketClient();

  AXIS_Client.on("connectFailed", function () {
    UpdateStatus("axis", "Error");
    TryConnect_AXIS();
  });

  AXIS_Client.on("connect", function (connection) {
    connection.on("error", function () {
      UpdateStatus("axis", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("axis", "Disconnect");
      TryConnect_AXIS();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("axis", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr == "hello") return;
        var data = ParseJSON(dataStr);
        if (data && data.channel) {
          switch (data.channel) {
            case "eew":
              DetectEEW(3, data.message);
              break;
            case "jmx-seismology":
              //地震情報
              var EarthquakeElm = {
                Hypocenter: { Area: { Name: null } },
                Magnitude: [{ valueOf_: null }],
              };
              var IntensityElm = { Observation: { MaxInt: null } };
              var OriginTimeTmp;
              if (data.message.Body.Earthquake[0]) {
                EarthquakeElm = data.message.Body.Earthquake[0];
                OriginTimeTmp = new Date(EarthquakeElm.OriginTime);
              }
              if (!OriginTimeTmp) OriginTimeTmp = new Date(data.message.Head.TargetDateTime);
              if (data.message.Body.Intensity) IntensityElm = data.message.Body.Intensity;

              MargeEQInfo([{
                status: data.message.Control.Status,
                eventId: data.message.Head.EventID,
                category: data.message.Head.Title,
                reportDateTime: new Date(data.message.Head.ReportDateTime),
                OriginTime: OriginTimeTmp,
                epiCenter: EarthquakeElm.Hypocenter.Area.Name,
                M: Number(EarthquakeElm.Magnitude[0].valueOf_),
                maxI: NormalizeShindo(IntensityElm.Observation.MaxInt),
                cancel: data.message.Head.InfoType == "取消",
                DetailURL: [],
                headline: data.message.Head.Headline.Text,
                axisData: data,
              }]);
              break;
          }
        }
      } catch {
        UpdateStatus("axis", "Error");
      }
    });
    UpdateStatus("axis", "success");
  });

  Connect_AXIS();
}
var AXIS_ConnectedDate = new Date();
function TryConnect_AXIS() {
  var timeoutTmp = Math.max(30000 - (new Date() - AXIS_ConnectedDate), 100);
  setTimeout(Connect_AXIS, timeoutTmp);
}
function Connect_AXIS() {
  if (AXIS_Client)
    AXIS_Client.connect("wss://ws.axis.prioris.jp/socket", null, null, {
      Authorization: `Bearer ${config.Source.axis.AccessToken}`,
    });
  AXIS_ConnectedDate = new Date();
}

//ProjectBS WebSocket接続・受信処理
var ProjectBS_Client;
var ProjectBS_Connection;
var ProjectBS_Ping_Timer;
function ProjectBS() {
  if (!config.Source.ProjectBS.GetData) return;
  ProjectBS_Client = new WebSocketClient();

  ProjectBS_Client.on("connectFailed", function () {
    UpdateStatus("ProjectBS", "Error");
    TryConnect_ProjectBS();
  });

  ProjectBS_Client.on("connect", function (connection) {
    ProjectBS_Connection = connection;
    connection.on("error", function () {
      UpdateStatus("ProjectBS", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("ProjectBS", "Disconnect");
      TryConnect_ProjectBS();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("ProjectBS", "success");
      try {
        var dataStr = message.utf8Data;
        if (dataStr !== "pong") DetectEEW(1, ParseJSON(dataStr));
      } catch {
        UpdateStatus("ProjectBS", "Error");
      }
    });
    connection.sendUTF("queryjson");

    UpdateStatus("ProjectBS", "success");
    if (ProjectBS_Ping_Timer) {
      clearInterval(ProjectBS_Ping_Timer);
      ProjectBS_Ping_Timer = null;
    }
    ProjectBS_Ping_Timer = setInterval(function () {
      connection.sendUTF("ping");
    }, 1200000);
  });

  Connect_ProjectBS();
}
var ProjectBS_ConnectedDate = new Date();
function TryConnect_ProjectBS() {
  var timeout = Math.max(30000 - (new Date() - ProjectBS_ConnectedDate), 100);
  setTimeout(Connect_ProjectBS, timeout);
}
function Connect_ProjectBS() {
  if (ProjectBS_Client) ProjectBS_Client.connect("wss://telegram-cf.projectbs.cn/jmaeewws/");
  ProjectBS_ConnectedDate = new Date();
}

//Wolfx WebSocket接続・受信処理
var WolfxWS_Client;
var WolfxConnection;
var Wolfx_Timer;
function WolfxWS() {
  if (!config.Source.wolfx.GetData) return;
  WolfxWS_Client = new WebSocketClient();

  WolfxWS_Client.on("connectFailed", function () {
    UpdateStatus("wolfx", "Error");
    TryConnect_WolfxWS();
  });

  WolfxWS_Client.on("connect", function (connection) {
    WolfxConnection = connection;
    connection.on("error", function () {
      UpdateStatus("wolfx", "Error");
    });
    connection.on("close", function () {
      UpdateStatus("wolfx", "Disconnect");
      TryConnect_WolfxWS();
    });
    connection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("wolfx", "success");
      try {
        var json = ParseJSON(message.utf8Data);
        if (json.type == "heartbeat") {
          connection.sendUTF("ping");
        } else if (json.type == "jma_eew") {
          DetectEEW(2, json);
        } else if (json.type == "jma_eqlist") {
          UpdateEQInfo();
        }
      } catch {
        UpdateStatus("wolfx", "Error");
      }
      if (Wolfx_Timer) {
        clearInterval(Wolfx_Timer)
        Wolfx_Timer = null;
      }
      Wolfx_Timer = setInterval(function () {
        connection.sendUTF("ping");
      }, 60000);
    });
    connection.sendUTF("query_jmaeew");
    UpdateStatus("wolfx", "success");
  });

  Connect_WolfxWS();
}
var Wolfx_ConnectedDate = new Date();
function TryConnect_WolfxWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Wolfx_ConnectedDate), 100);
  setTimeout(Connect_WolfxWS, timeoutTmp);
}
function Connect_WolfxWS() {
  if (WolfxWS_Client) WolfxWS_Client.connect("wss://ws-api.wolfx.jp/all_eew");
  Wolfx_ConnectedDate = new Date();
}

//Seisjs WebSocket接続・受信処理
var SeisjsWS_Client;
var SeisjsWS_timer;
function SeisjsWS() {
  if (!config.Source.wolfx.GetDataFromSeisJS) return;
  SeisjsWS_Client = new WebSocketClient();

  SeisjsWS_Client.on("connectFailed", function () {
    UpdateStatus("wolfx", "Error");
    TryConnect_SeisjsWS();
  });

  SeisjsWS_Client.on("connect", function (SeisjsConnection) {
    SeisjsConnection.on("error", function () {
      UpdateStatus("wolfx", "Error");
    });
    SeisjsConnection.on("close", function () {
      UpdateStatus("wolfx", "Disconnect");
      TryConnect_SeisjsWS();
    });
    SeisjsConnection.on("message", function (message) {
      if (Replay !== 0) return;
      UpdateStatus("wolfx", "success");
      try {
        var json = ParseJSON(message.utf8Data);
        if (!json || json.type == "pong" || json.type == "heartbeat") return;
        MargeSeisJS(json);
      } catch {
        UpdateStatus("wolfx", "Error");
      }
      if (SeisjsWS_timer) {
        clearInterval(SeisjsWS_timer);
        SeisjsWS_timer = null;
      }
      SeisjsWS_timer = setInterval(function () {
        SeisjsConnection.sendUTF("ping");
      }, 60000);
    });
    UpdateStatus("wolfx", "success");
  });

  Connect_SeisjsWS();
}
var Seisjs_ConnectedDate = new Date();
function TryConnect_SeisjsWS() {
  var timeoutTmp = Math.max(30000 - (new Date() - Seisjs_ConnectedDate), 100);
  setTimeout(Connect_SeisjsWS, timeoutTmp);
}
function Connect_SeisjsWS() {
  if (SeisjsWS_Client) SeisjsWS_Client.connect("wss://seisjs.wolfx.jp/all_seis");
  Seisjs_ConnectedDate = new Date();
}

var SeisJSData = {};
function MargeSeisJS(json) {
  var rgb = KmoniColorTable[Math.min(7, Math.max(-3, Math.floor(json.CalcShindo * 10) / 10))];
  SeisJSData[json.type] = {
    Type: "Wolfx_SeisJS",
    shindo: json.CalcShindo,
    PGA: json.PGA,
    Code: json.type,
    Name: json.region,
    IsSuspended: false,
    Region: "",
    Location: { Longitude: json.longitude, Latitude: json.latitude },
    rgb: [rgb.r, rgb.g, rgb.b],
    update_at: json.update_at,
  };

  Object.keys(SeisJSData).forEach(function (elm) {
    var dif = Number(new Date() - new Date(Number(new Date(SeisJSData[elm].update_at))));
    if (dif > 15000) delete SeisJSData[elm];
  });

  IntervalRun(500, function () {
    messageToMainWindow({
      action: "SeisJSUpdate",
      LocalTime: new Date(),
      data: SeisJSData,
    });
  });
}

var LastRunTime = 0;
var RunnningTimer;
function IntervalRun(msec, func) {
  if (RunnningTimer) {
    clearInterval(RunnningTimer);
    RunnningTimer = null;
  }
  var dif = new Date() - LastRunTime;
  if (dif > msec) {
    func();
    LastRunTime = new Date();
  } else {
    RunnningTimer = setTimeout(function () {
      func();
      LastRunTime = new Date();
    }, msec - dif);
  }
}

//定期実行
function RegularExecution(loop) {
  try {
    //EEW解除
    EEW_Active.forEach(function (elm) {
      if (new Date() - Replay - new Date(elm.origin_time) > 300000)
        EEW_Clear(elm.EventID);
    });

    //津波情報解除
    Tsunami_Data.forEach(function (elm) {
      if (elm.ValidDateTime <= new Date() - Replay && !elm.revocation) {
        elm.revocation = true;
        elm.issue.time = new Date() - Replay;
        ConvertTsunamiInfo(elm); //ダミーデータを送信、再度マージ処理
      }
    });

    if (loop) {
      setTimeout(function () {
        RegularExecution(true);
      }, 1000);
    }
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。", { cause: err });
  }
}

//強震モニタの取得オフセット設定
async function SetKmoniOffset(func) {
  try {
    if (!net.online) throw new Error();

    var index = 0;
    var resTimeTmp;
    KmoniOffset = null;
    while (!KmoniOffset && index < 10) {
      await new Promise((resolve) => {
        var dataTmp = "";
        var reqTime = new Date();

        fetch(`http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=${Number(new Date())}`)
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
            return r.json();
          }).then((json) => {
            var resTime = new Date(json.latest_time);
            if (Number(resTimeTmp) !== Number(resTime)) KmoniOffset = new Date() - resTime - (new Date() - reqTime) / 2;
            resTimeTmp = resTime;
          }).catch((err) => {
            GeneralError_handler(err)
            UpdateStatus("kmoniImg", "Error");
          });

        setTimeout(resolve, 100);
      });

      index++;
    }

    if (!KmoniOffset) throw new Error();
    KmoniOffset += 200;
  } catch (err) {
    KmoniOffset = 2500;
    GeneralError_handler(err)
  }
  if (func) setTimeout(func, 200);
}

//情報最終更新時刻を更新
function UpdateStatus(type, condition, timeStamp) {
  if (!timeStamp || !Boolean2(new Date(timeStamp))) timeStamp = new Date(new Date() - Replay)
  else timeStamp = new Date(timeStamp)
  messageToMainWindow({
    action: "UpdateStatus",
    timestamp: timeStamp,
    LocalTime: new Date(),
    type: type,
    condition: condition,
  });

  kmoniTimeTmp[type] = {
    type: type,
    timestamp: timeStamp,
    LocalTime: new Date(),
    condition: condition,
  };
}

//情報フォーマット変更・新報検知→MargeEEW
function DetectEEW(type, json) {
  if (!json) return;
  if (type == 1) {
    //ProjectBS
    try {
      var EBIData = [];
      var EBIStr = String(json.originalTelegram).split("EBI ")[1];
      var codeData = String(json.originalTelegram).split(" ");
      if (EBIStr) {
        EBIStr = EBIStr.split("ECI")[0].split("EII")[0].split(" 9999=")[0];
        EBIStr = EBIStr.split(" ");
        if (EBIStr.length % 4 == 0) {
          for (let i = 0; i < EBIStr.length; i += 4) {
            var sectName = EEWSect[EBIStr[i]];
            var maxInt = EBIStr[i + 1].substring(1, 3);
            var minInt = EBIStr[i + 1].substring(3, 5);
            minInt = minInt == "//" ? null : NormalizeShindo(minInt);
            maxInt = maxInt == "//" ? null : NormalizeShindo(maxInt);
            var arrivalTime = EBIStr[i + 2];
            arrivalTime = `${arrivalTime.substring(0, 2)}:${arrivalTime.substring(2, 4)}:${arrivalTime.substring(4, 6)}`;
            arrivalTime = new Date(`${NormalizeDate(4)} ${arrivalTime}`);

            var alertFlg = EBIStr[i + 3].substring(0, 1) == "1";
            var arrived = EBIStr[i + 3].substring(1, 2) == "1";

            EBIData.push({
              Code: Number(EBIStr[i]),
              Name: sectName,
              Alert: alertFlg,
              IntTo: maxInt,
              IntFrom: minInt,
              ArrivalTime: arrivalTime,
              Arrived: arrived,
            });
          }
        }
      }

      var EEWdata = {
        alertflg: json.isWarn ? "警報" : "予報",
        EventID: Number(json.eventID),
        serial: json.serial,
        report_time: new Date(json.issue.time),
        magnitude: json.hypocenter.magnitude,
        maxInt: NormalizeShindo(json.maxIntensity, 0),
        depth: json.hypocenter.location.depth,
        is_cancel: json.isCancel,
        is_final: json.isFinal,
        is_training: codeData[2] == "01" || codeData[2] == "30",
        latitude: json.hypocenter.location.lat,
        longitude: json.hypocenter.location.lng,
        region_name: json.hypocenter.name,
        origin_time: new Date(json.originTime),
        isPlum: json.hypocenter.isEstimate,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "ProjectBS",
      };
      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("ProjectBS", "Error");
    }
  } else if (type == 2) {
    //wolfx
    try {
      var EBIData = [];
      var EBIStr = String(json.OriginalText).split("EBI ")[1];
      if (EBIStr) {
        EBIStr = EBIStr.split("ECI")[0].split("EII")[0].split(" 9999=")[0];
        EBIStr = EBIStr.split(" ");
        if (EBIStr.length % 4 == 0) {
          for (let i = 0; i < EBIStr.length; i += 4) {
            var sectName = EEWSect[EBIStr[i]];
            var maxInt = EBIStr[i + 1].substring(1, 3);
            var minInt = EBIStr[i + 1].substring(3, 5);
            minInt = minInt == "//" ? null : minInt;
            maxInt = maxInt == "//" ? null : maxInt;
            if (maxInt == 99) maxInt = minInt;
            var arrivalTime = EBIStr[i + 2];
            arrivalTime = `${arrivalTime.substring(0, 2)}:${arrivalTime.substring(2, 4)}:${arrivalTime.substring(4, 6)}`;
            arrivalTime = new Date(`${NormalizeDate(4)} ${arrivalTime}`);

            var alertFlg = EBIStr[i + 3].substring(0, 1) == "1";
            var arrived = EBIStr[i + 3].substring(1, 2) == "1";

            EBIData.push({
              Code: Number(EBIStr[i]),
              Name: sectName,
              Alert: alertFlg,
              IntTo: NormalizeShindo(maxInt),
              IntFrom: NormalizeShindo(minInt),
              ArrivalTime: arrivalTime,
              Arrived: arrived,
            });
          }
        }
      }
      var EEWdata = {
        alertflg: json.isWarn ? "警報" : "予報",
        EventID: Number(json.EventID),
        serial: json.Serial,
        report_time: new Date(json.AnnouncedTime),
        magnitude: json.Magunitude,
        maxInt: NormalizeShindo(json.MaxIntensity, 0),
        depth: json.Depth,
        is_cancel: json.isCancel,
        is_final: json.isFinal,
        is_training: json.isTraining,
        latitude: json.Latitude,
        longitude: json.Longitude,
        region_name: json.Hypocenter,
        origin_time: new Date(json.OriginTime),
        isPlum: json.isAssumption,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "wolfx",
      };

      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("wolfx", "Error");
    }
  } else if (type == 3) {
    //axis
    try {
      var alertflgTmp = json.Title == "緊急地震速報（予報）" ? "予報" : "警報";
      var EBIData = [];
      json.Forecast.forEach(function (elm) {
        EBIData.push({
          Code: elm.Code,
          Name: elm.Name,
          Alert: null,
          IntTo: NormalizeShindo(elm.Intensity.To),
          IntFrom: NormalizeShindo(elm.Intensity.From),
          ArrivalTime: null,
          Arrived: null,
        });
      });
      var EEWdata = {
        alertflg: alertflgTmp,
        EventID: Number(json.EventID),
        serial: json.Serial,
        report_time: new Date(json.ReportDateTime),
        magnitude: Number(json.Magnitude),
        maxInt: NormalizeShindo(json.Intensity),
        depth: Number(json.Hypocenter.Depth.replace("km", "")),
        is_cancel: json.Flag.is_cancel,
        is_final: json.Flag.is_final,
        is_training: json.Flag.is_training,
        latitude: json.Hypocenter.Coordinate[1],
        longitude: json.Hypocenter.Coordinate[0],
        region_name: json.Hypocenter.Name,
        origin_time: new Date(json.OriginDateTime),
        isPlum: null,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "axis",
      };
      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("axis", "Error");
    }
  } else if (type == 4) {
    //P2P
    try {
      var scaleTo_arr = json.areas.map((p) => p.scaleTo);
      var maxIntTmp = Math.floor(Math.max(...scaleTo_arr));

      var latitudeTmp;
      var longitudeTmp;
      var depthTmp;
      var magnitudeTmp;
      var region_nameTmp;
      var origin_timeTmp;
      var conditionTmp = false;
      if (json.earthquake) {
        latitudeTmp = json.earthquake.hypocenter.latitude;
        longitudeTmp = json.earthquake.hypocenter.longitude;
        depthTmp = json.earthquake.hypocenter.depth;
        magnitudeTmp = json.earthquake.hypocenter.magnitude;
        region_nameTmp = json.earthquake.hypocenter.name;
        origin_timeTmp = new Date(json.earthquake.originTime);
        conditionTmp = json.earthquake.condition == "仮定震源要素";
      }
      var EBIData = [];
      json.areas.forEach(function (elm) {
        EBIData.push({
          Code: null,
          Name: elm.name,
          Alert: elm.kindCode == 10 || elm.kindCode == 11 || elm.kindCode == 19,
          IntTo: NormalizeShindo(elm.scaleTo),
          IntFrom: NormalizeShindo(elm.scaleFrom),
          ArrivalTime: new Date(elm.arrivalTime),
          Arrived: elm.kindCode == 11,
        });
      });
      if (!json.issue) return;
      var EEWdata = {
        alertflg: "警報",
        EventID: Number(json.issue.eventId),
        serial: Number(json.issue.serial),
        report_time: new Date(json.issue.time),
        magnitude: magnitudeTmp,
        maxInt: NormalizeShindo(maxIntTmp, 0),
        depth: depthTmp,
        is_cancel: Boolean(json.cancelled),
        is_final: null,
        is_training: Boolean(json.test),
        latitude: latitudeTmp,
        longitude: longitudeTmp,
        region_name: region_nameTmp,
        origin_time: origin_timeTmp,
        isPlum: conditionTmp,
        warnZones: EBIData,
        source: "P2P_EEW",
      };

      EEW_Marge(EEWdata);
    } catch {
      UpdateStatus("P2P_EEW", "Error");
    }
  }
}

var JMA_Int_Points = JSON.parse(
  await readFile(path.join(__dirname, "./Resource/JMA_Int_Points.json"))
);

//EEW情報マージ
function EEW_Marge(data) {
  if (!data) return; //データがない場合、処理終了
  try {
    if (!config.Info.EEW.showtraining && data.is_training) return; //訓練法を受信するかどうか（設定に準拠）
    if (!config.Info.EEW.kodoriyou && data.alertflg == "予報") return; //高度利用者向けを受信するかどうか（設定に準拠）
    if (!data.origin_time || !data.EventID || !data.serial || !data.latitude || !data.longitude) return;//不正データをはねる

    //５分以上前の地震／未来の地震（リプレイ時）を除外 ただし既に表示中の地震の更新報は通す
    var pastTime = new Date() - Replay - data.origin_time;
    var showing = Boolean(EEW_Active.find((elm) => elm.EventID == data.EventID));
    if (!showing && (pastTime > 300000 || pastTime < 0)) return;

    if (data.source == "simulation") {
      var EEWActive = EEW_Active.find((e) => e.source !== "simulation");
      if (EEWActive) return;//通常報発報中ならシミュレーション開始拒否
    } else {
      //通常報受信時にシミュレーションをクリアー
      EEW_Active.forEach(function (elm) {
        if (elm.source == "simulation") EEW_Clear(elm.EventID);
      });
    }

    //現在地との距離

    data.distance = turf.distance([data.longitude, data.latitude], [config.home.longitude, config.home.latitude])
    data.TimeTable = {
      p: TTT_JMA2001.p[getClosestNum(data.depth, Object.keys(TTT_JMA2001.p))],
      s: TTT_JMA2001.s[getClosestNum(data.depth, Object.keys(TTT_JMA2001.s))]
    }
    data.TimeTable2 = {
      p: TTT_AK135.p[getClosestNum(data.depth, Object.keys(TTT_AK135.p))],
      s: TTT_AK135.s[getClosestNum(data.depth, Object.keys(TTT_AK135.s))]
    }


    //シミュレーション機能における仮想地震限定の地震動予測
    if (data.source == "simulation" && !data.isPlum && !data.is_cancel) {
      //このif内はシミュレーション機能においてのみ有効。実地震で行うと気象業務法違反のおそれあり。
      //登録地点の震度予測
      if (!data.userIntensity && data.depth <= 150) {
        data.userIntensity = calcInt(
          data.magnitude,
          data.depth,
          data.latitude,
          data.longitude,
          config.home.latitude,
          config.home.longitude,
          config.home.arv,
          config.Info.EEW.IntType == "max"
        );
      }

      //到達時刻の予測
      function calc_arTime(distance, TimeTable) {
        for (let index = 0; index < TimeTable.s.length; index++) {
          var elm = TimeTable.s[index];
          if ((elm.r) > distance) {
            if (index >= 1) {
              var elm2 = TimeTable.s[index - 1];
              var SSec = elm.t + (elm2.t - elm.t) * (distance - elm.r) / (elm2.r - elm.r);
            } else SSec = null;
            break;
          }
        }
        return (SSec || SSec == 0) ? SSec : null;
      }

      if (!data.arrivalTime) {//JMA2001走時表での到達時刻予想
        var res = calc_arTime(data.distance, data.TimeTable)
        if (res) data.arrivalTime = new Date(Number(data.origin_time) + res * 1000)
      }

      if (!data.arrivalTime) {//AK135走時表での到達時刻予想
        var res = calc_arTime(data.distance, data.TimeTable2)
        if (res) data.arrivalTime = new Date(Number(data.origin_time) + res * 1000)
      }

      //全国の震度予測      
      var estIntTmp = {};
      if (data.depth <= 150) {
        var maxShindo = 0;
        var sects = Object.keys(EQIAreaLoc);
        JMA_Int_Points.forEach(function (elm) {
          if (elm.a && elm.s) {
            var sect = sects[elm.s];
            if (!sect) return;

            var estInt = calcInt(
              data.magnitude,
              data.depth,
              data.latitude,
              data.longitude,
              elm.y,
              elm.x,
              elm.a,
              config.Info.EEW.IntType == "max"
            );
            if (maxShindo < estInt) {
              maxShindo = estInt;
            }
            if (!estIntTmp[sect] || estInt > estIntTmp[sect]) {
              estIntTmp[sect] = estInt;
            }
          }
        });

        //最大震度の設定（必要なら）
        if (NormalizeShindo(data.maxInt, 4) === null) {
          data.maxInt = NormalizeShindo(maxShindo);
        }


        Object.keys(estIntTmp).forEach(function (key) {
          var shindo = NormalizeShindo(estIntTmp[key]);
          var SameZone;
          if (data.warnZones) {
            var SameZone = data.warnZones.find((elm) => elm.Name == key);
          } else {
            data.warnZones = [];
          }
          if (!SameZone) {
            data.warnZones.push({
              Name: key,
              IntTo: shindo, //レンダラープロセス側で下限・上限を選択するが、シミュレーションでは計算時点で設定を反映済みのため同値を代入
              IntFrom: shindo,
              Alert: NormalizeShindo(shindo, 5) >= 5,
            });
          }
        });
      }
    }

    //現在地の予想震度・到達予想時刻を設定
    if (Array.isArray(data.warnZones)) {
      //設定された細分区域のデータ参照
      var SameZone = data.warnZones.find(function (elm2) {
        return elm2.Name == config.home.Section;
      });

      if (SameZone) {
        var EstInt = (config.Info.EEW.IntType == "max") ? SameZone.IntTo : SameZone.IntFrom;
        if (!data.userIntensity) data.userIntensity = EstInt;
        if (SameZone.ArrivalTime) data.arrivalTime = SameZone.ArrivalTime;
      }
    }

    var SameEEW = EEW_Storage.find((elm) => elm.EventID == data.EventID);
    if (SameEEW) {//同一地震のデータが既に存在する場合

      var SameReport = SameEEW.data.find((elm) => elm.serial == data.serial);
      if (SameReport) {//同じ報数の情報が既に存在する（マージ処理へ）

        var MaxSerial = Math.max(...SameEEW.data.map((o) => o.serial));
        if (data.serial == MaxSerial) {//最新報である場合

          var changed = false;
          //マージ元のデータ
          var CurrentData = SameEEW.data.find((elm) => elm.serial == data.serial);

          //キーごとにマージ（同一報のためBool値も「Falsyでない場合のみ上書きする」方法でマージ）
          Object.keys(CurrentData).forEach(function (key) {
            if (key == "warnZones") return;//warnZonesは後で別処理
            if (data[key] && (!Array.isArray(data[key]) || data[key].length > 0)) {
              CurrentData[key] = data[key];
              changed = true;
            }
          });

          //warnZonesをマージ
          if (Array.isArray(data.warnZones) && Array.isArray(CurrentData.warnZones)) {
            data.warnZones.forEach(function (zone) {
              //一致する細分区域のデータを検索
              var SameZone = CurrentData.warnZones.find((el) => el.Name == zone.Name);
              if (SameZone) {
                Object.keys(zone).forEach((key) => {
                  if (zone[key]) {
                    SameZone[key] = zone[key];
                    changed = true;
                  }
                });
              } else {
                CurrentData.warnZones.push({ ...zone });
                changed = true;
              }
            });
          }
          //データに変化があれば、警報処理へ
          if (changed) EEW_Alert(CurrentData, true);
        }
      } else {
        //同じ報数の情報がない場合（データ登録）
        var MaxSerial = Math.max(...SameEEW.data.map((o) => o.serial));
        if (data.serial > MaxSerial) {
          //最新の報である
          SameEEW.data.push(data);//データ追加
          if (data.is_cancel) SameEEW.cancelled = true;
          EEW_Alert(data); //警報処理
        }
      }
    } else {
      //第１報

      //データ追加
      EEW_Storage.push({
        EventID: data.EventID,
        cancelled: false,
        simulation: data.source == "simulation",
        data: [data],
      });

      EEW_Alert(data); //警報処理
    }
  } catch (err) {
    throw new Error("緊急地震速報データの処理（マージ）に失敗しました。", { cause: err });
  }
}

function calcInt(magJMA, depth, epiLat, epiLng, pointLat, pointLng, arv, max) {
  const magW = magJMA - 0.171;
  const long = 10 ** (0.5 * magW - 1.85) / 2;
  const epicenterDistance = turf.distance([epiLng, epiLat], [pointLng, pointLat])
  const hypocenterDistance = (depth ** 2 + epicenterDistance ** 2) ** 0.5 - (max ? long : 0); //上限なら断層長を引かない
  const x = Math.max(hypocenterDistance, 3);
  const gpv600 = 10 ** (0.58 * magW + 0.0038 * depth - 1.29 - Math.log10(x + 0.0028 * 10 ** (0.5 * magW)) - 0.002 * x);

  // 最大速度を工学的基盤（Vs=600m/s）から工学的基盤（Vs=400m/s）へ変換を行う
  const pgv400 = gpv600 * 1.31;
  const pgv = pgv400 * arv;
  return 2.68 + 1.72 * Math.log10(pgv);
}

//EarlyEst地震情報マージ
function EarlyEst_Marge(data) {
  try {
    if (!data) return;
    if (!data.origin_time || !data.latitude || !data.longitude) return;

    var pastTime = new Date() - Replay - data.origin_time;
    if (pastTime > 300000 || pastTime < 0) return;

    data.distance = turf.distance([data.longitude, data.latitude], [config.home.longitude, config.home.latitude]);

    data.TimeTable = {
      p: TTT_JMA2001.p[getClosestNum(data.depth, Object.keys(TTT_JMA2001.p))],
      s: TTT_JMA2001.s[getClosestNum(data.depth, Object.keys(TTT_JMA2001.s))]
    }
    data.TimeTable2 = {
      p: TTT_AK135.p[getClosestNum(data.depth, Object.keys(TTT_AK135.p))],
      s: TTT_AK135.s[getClosestNum(data.depth, Object.keys(TTT_AK135.s))]
    }

    var SameEEW = EarlyEst_Data.find((elm) => elm.EventID == data.EventID);
    if (SameEEW) {
      //ID・報の両方一致した情報が存在するか
      var SameReport = SameEEW.data.find((elm) => elm.serial == data.serial);
      if (!SameReport) {
        //最新の報かどうか
        var MaxSerial = Math.max(...SameEEW.data.map((o) => o.serial));
        if (data.serial > MaxSerial) {
          //第２報以降
          EarlyEst_Alert(data, false);
          SameEEW.data.push(data);
          if (data.is_cancel) {
            SameEEW.cancelled = true;
          }
        }
      }
    } else {
      //第１報
      EarlyEst_Alert(data, true);
      EarlyEst_Data.push({
        EventID: data.EventID,
        cancelled: false,
        data: [data],
      });
    }
  } catch (err) {
    throw new Error("Early-Est データの処理（マージ）に失敗しました。", { cause: err });
  }
}

//EEW解除処理
function EEW_Clear(EventID) {
  try {
    //EEWデータ削除
    EEW_Active = EEW_Active.filter((elm) => elm.EventID !== EventID);

    messageToMainWindow({ action: "EEW_AlertUpdate", data: EEW_Active });

    if (EEW_Active.length == 0) {
      //パワーセーブ再開
      if (psBlock && powerSaveBlocker.isStarted(psBlock)) {
        powerSaveBlocker.stop(psBlock);
      }
      worker.postMessage({ action: "EEWNow", data: true });
    }
  } catch (err) {
    throw new Error("緊急地震速報の解除処理でエラーが発生しました。", { cause: err });
  }
}

//EEW通知（音声・画面表示等）
function EEW_Alert(data, update) {
  try {
    worker.postMessage({ action: "EEWNow", data: true });

    //通知条件の判定
    var show_alert = false;
    if (NormalizeShindo(data.maxInt) == "?") {
      if (config.Info.EEW.IntQuestion) {//予想震度不明を無視するか（設定に準拠）
        show_alert = true;
      }
    } else if (NormalizeShindo(config.Info.EEW.IntThreshold, 5) <= NormalizeShindo(data.maxInt, 5)) {
      show_alert = true//予想最大震度通知条件（設定に準拠）
    }

    if (NormalizeShindo(data.userIntensity) == "?") {
      if (config.Info.EEW.userIntQuestion) {//予想震度不明を無視するか（設定に準拠）
        show_alert = true;
      }
    } else if (NormalizeShindo(config.Info.EEW.userIntThreshold, 5) <= NormalizeShindo(data.userIntensity, 5)) {
      show_alert = true; //予想震度（細分区域）通知条件（設定に準拠）
    }

    var SameEEW = EEW_Storage.find((elm) => elm.EventID == data.EventID);
    var first = !SameEEW || !SameEEW.isNotified;
    var PrevData;
    if (SameEEW) {
      SameEEW.isNotified = true;
      PrevData = SameEEW.data
        .filter((e) => e.serial < data.serial)//本データより古く
        .sort((a, b) => b.serial - a.serial)[0]//降順[0]でserial最大
    }

    var old_i = PrevData ? NormalizeShindo(PrevData.maxInt, 5) : -9;
    var new_i = NormalizeShindo(data.maxInt, 5);
    var int_increased = new_i > old_i || !Boolean2(new_i) || !Boolean2(old_i);

    if (!update && show_alert && (int_increased || !config.Info.EEW.IntTerm1)) {
      //同一報の更新時でなく、条件に合致
      PlayAudio((data.alertflg == "警報") ? "EEW1" : "EEW2");
      speak(GenerateEEWText(data, !first));

      var notice_setting = first ? config.notice.window.EEW : config.notice.window.EEW_Update;
      var WindowInvisible = !MainWindow || MainWindow.isMinimized() || !MainWindow.isFocused() || !MainWindow.isVisible();
      if (notice_setting == "push" && WindowInvisible) {
        var EEWNotification = new Notification({
          title: `${data.is_training ? "【訓練報】 " : ""}緊急地震速報 ${data.alertflg} #${data.serial}`,
          body: `${data.region_name}\n予想最大震度：${NormalizeShindo(data.maxInt, 1)} ／ M${data.magnitude ? data.magnitude : "不明"} ／ 深さ：${data.depth ? `${data.depth}km` : "不明"}${data.userIntensity ? `\n現在地の予想震度：${NormalizeShindo(data.userIntensity, 1)}` : ""}`,
          icon: path.join(__dirname, "img/icon.ico"),
        });
        EEWNotification.show();
        EEWNotification.on("click", CreateMainWindow);
      } else if (notice_setting == "openWindow") {
        CreateMainWindow();
      }
    }

    //【現在のEEW】から同一地震、古い報を取得・削除
    EEW_Active = EEW_Active.filter(function (elm) {
      return elm.EventID !== data.EventID;
    });

    //【現在のEEW】配列に追加
    EEW_Active.push(data);

    messageToMainWindow({
      action: "EEW_AlertUpdate",
      data: EEW_Active,
      update: update,
    });


    MargeEQInfo([{
      status: data.is_training ? "訓練" : "通常",
      eventId: data.EventID,
      category: "EEW",
      reportDateTime: new Date(data.report_time),
      OriginTime: new Date(data.origin_time),
      epiCenter: data.region_name,
      M: data.isPlum ? null : Number(data.magnitude),
      maxI: NormalizeShindo(data.maxInt),
      cancel: Boolean(data.is_cancel),
      DetailURL: [],
      axisData: null,
    }], 999);

    //スリープ回避開始
    if (show_alert) {
      if (config.system.powerSaveBlocking && (!psBlock || !powerSaveBlocker.isStarted(psBlock))) {
        psBlock = powerSaveBlocker.start("prevent-display-sleep");
      }
    }
  } catch (err) {
    throw new Error("緊急地震速報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//EarlyEst通知（音声・画面表示等）
function EarlyEst_Alert(data, first) {
  try {
    //【現在のEEW】から同一地震、古い報を削除
    EEW_Active = EEW_Active.filter(function (elm) {
      return elm.EventID !== data.EventID;
    });
    //【現在のEEW】配列に追加
    EEW_Active.push(data);

    if (first) {
      CreateMainWindow();
      PlayAudio("EEW2");
    }
    messageToMainWindow({
      action: "EEW_AlertUpdate",
      data: EEW_Active,
    });
    if (!MainWindow) {
      var EEWNotification = new Notification({
        title: `Early-Est 地震情報 #${data.serial}`,
        body: `${data.region_name}\n M${data.magnitude}  深さ：${data.depth}km`,
        icon: path.join(__dirname, "img/icon.ico"),
      });
      EEWNotification.show();
      EEWNotification.on("click", function () {
        CreateMainWindow();
      });
    }


    //スリープ回避開始
    if (config.system.powerSaveBlocking && (!psBlock || !powerSaveBlocker.isStarted(psBlock))) {
      psBlock = powerSaveBlocker.start("prevent-display-sleep");
    }
  } catch (err) {
    throw new Error("Early-Est地震情報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//🔴地震情報🔴

//地震情報更新処理
var UpdateEQInfo = throttle(function (loop) {
  try {
    Req_JMAXMLList(EQ_FetchCount, EQ_FetchCount == 0);
    Req_JMAJSONList()
    Req_NarikakunList(EQ_FetchCount);
  } catch (err) {
    throw new Error("地震情報の処理でエラーが発生しました。", { cause: err });
  }
  EQ_FetchCount++;

  if (loop) {
    setTimeout(function () {
      UpdateEQInfo(true);
    }, config.Info.EQInfo.Interval);
  }
}, 2000);

//気象庁XMLリスト取得→Req_JMAXML
function Req_JMAXMLList(count, longFeed) {
  var url = `https://www.data.jma.go.jp/developer/xml/feed/${longFeed ? "eqvol_l.xml" : "eqvol.xml"}`
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      const xml = DomPsr.parseFromString(text, "text/xml");
      if (!xml) throw new Error("XMLのパースに失敗");
      var EQInfoCount = 0;
      Array.prototype.forEach.call(xml.getElementsByTagName("entry"), function (elm) {
        var url;
        var urlElm = elm.getElementsByTagName("id");
        if (urlElm && urlElm[0]) url = urlElm[0].textContent;
        if (!url) return;
        var title = elm.getElementsByTagName("title")[0].textContent;
        if (
          title == "震度速報" ||
          title == "震源に関する情報" ||
          title == "震源・震度に関する情報" ||
          title == "長周期地震動に関する観測情報" ||
          title == "遠地地震に関する情報" ||
          title == "顕著な地震の震源要素更新のお知らせ"
        ) {
          if (EQInfoCount < JMA_CurrentInfoNumber) {
            Req_JMAXML(url, count);
          }
          if (title == "震源・震度に関する情報") EQInfoCount++; //「震源・震度に関する情報」の件数<=地震の数 のためカウント
        } else if (
          title == "津波情報a" ||
          title == "津波警報・注意報・予報a" ||
          title == "沖合の津波観測に関する情報" ||
          title == "北海道・三陸沖後発地震注意情報" ||
          title == "地震の活動状況等に関する情報"
        )
          Req_JMAXML(url, count);
      });

      if (15 < JMA_CurrentInfoNumber && !longFeed) {//永久ループ防止で!longFeed必須
        Req_JMAXMLList(count, true)
      }

      var nankai = Array.from(xml.getElementsByTagName("entry")).find(function (elm) {
        var ttl = elm.getElementsByTagName("title")[0];
        return ttl && ttl.textContent.startsWith("南海トラフ地震関連解説情報");
      });

      if (nankai) Req_JMAXML(nankai.getElementsByTagName("link")[0].getAttribute("href"));

      Array.from(xml.getElementsByTagName("entry")).forEach(
        function (elm) {
          var ttl = elm.getElementsByTagName("title")[0];

          if (ttl && ttl.textContent.startsWith("南海トラフ地震臨時情報") && Number(new Date() - new Date(elm.getElementsByTagName("updated")[0].textContent)) <= 12091200000) {
            Req_JMAXML(elm.getElementsByTagName("link")[0].getAttribute("href"));
          }
        }
      );

      UpdateStatus("JMAXML", "success");
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("JMAXML", "Error");
    });
}

function Req_JMAJSONList() {
  fetch("https://www.jma.go.jp/bosai/quake/data/list.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var HokkaidoSanrikuURL = json.find(function (el) {
        return el.ttl == "北海道・三陸沖後発地震注意情報"
      })
      if (HokkaidoSanrikuURL) Req_Hokkaidosanriku_JSON(`https://www.jma.go.jp/bosai/quake/data/${HokkaidoSanrikuURL.json}`)
    }).catch((err) => {
      GeneralError_handler(err)
    });
}

function Req_Hokkaidosanriku_JSON(url) {
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      var data = {
        title: "北海道・三陸沖後発地震注意情報",
        kind: json.Head.InfoType,//発表/取消
        reportDate: new Date(json.Head.ReportDateTime), //時刻
        HeadLine: json.Head.Headline.Text, //要約
        Text: "",
        Appendix: "",
        Text2: "",
      };

      var EarthQuakeInfo = json.Body.EarthquakeInfo;
      if (EarthQuakeInfo) {
        data.Text = EarthQuakeInfo.Text;
        if (EarthQuakeInfo.Appendix) data.Appendix = EarthQuakeInfo.Appendix;
      }

      if (json.Body.Text) data.Text2 = json.Body.Text;

      Process_Hokkaidosanriku(data)
    }).catch((err) => {
      GeneralError_handler(err)
    });
}

function Process_Hokkaidosanriku(data) {
  var SameData = HokkaidoSanrikuInfoAll.find((el) => Number(new Date(el.reportDate)) == Number(new Date(data.reportDate)));
  if (SameData) return;

  HokkaidoSanrikuInfoAll.push(data);
  HokkaidoSanrikuInfoAll = HokkaidoSanrikuInfoAll
    .sort((a, b) => a.reportDate > b.reportDate ? -1 : 1);

  messageToMainWindow({
    action: "HokkaidoSanrikuInfo",
    data: HokkaidoSanrikuInfoAll[0],
  });
  if (HokkaidoSanrikuWindow && HokkaidoSanrikuInfoAll[0] && data) {
    HokkaidoSanrikuWindow.webContents.send("message2", {
      action: "HokkaidoSanrikuInfo",
      data: HokkaidoSanrikuInfoAll[0],
    });
  }
}

//気象庁XML 取得・フォーマット変更→MargeEQInfo
function Req_JMAXML(url, count) {
  if (!url || jmaXML_Fetched.includes(url)) return;

  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.text();
    }).then((text) => {
      const xml = DomPsr.parseFromString(text, "text/xml");
      if (!xml) throw new Error("XMLのパースに失敗");

      var title = xml.getElementsByTagName("Control")[0].getElementsByTagName("Title")[0].textContent;
      var cancel = xml.getElementsByTagName("InfoType")[0].textContent == "取消";

      if (
        title == "震度速報" ||
        title == "震源に関する情報" ||
        title == "震源・震度に関する情報" ||
        title == "長周期地震動に関する観測情報" ||
        title == "遠地地震に関する情報" ||
        title == "顕著な地震の震源要素更新のお知らせ"
      ) {
        //地震情報
        var EarthquakeElm = xml.getElementsByTagName("Body")[0].getElementsByTagName("Earthquake")[0];
        var originTimeTmp;
        var epiCenterTmp;
        var magnitudeTmp;
        if (EarthquakeElm) {
          originTimeTmp = new Date(
            EarthquakeElm.getElementsByTagName("OriginTime")[0].textContent
          );
          epiCenterTmp = EarthquakeElm.getElementsByTagName("Name")[0].textContent;
          var magElm = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0];
          if (magElm) magnitudeTmp = Number(magElm.textContent);
          if (!Boolean2(magnitudeTmp)) magnitudeTmp = null;
        }

        if (!originTimeTmp) originTimeTmp = new Date(xml.getElementsByTagName("TargetDateTime")[0].textContent);
        var IntensityElm = xml.getElementsByTagName("Body")[0].getElementsByTagName("Intensity")[0];
        var maxIntTmp;
        var maxLgInt;
        if (IntensityElm) {
          maxIntTmp = NormalizeShindo(
            IntensityElm.getElementsByTagName("Observation")[0].getElementsByTagName("MaxInt")[0].textContent
          );
          if (IntensityElm.getElementsByTagName("Observation")[0].getElementsByTagName("MaxLgInt")[0]) {
            maxLgInt = IntensityElm.getElementsByTagName("Observation")[0]
              .getElementsByTagName("MaxLgInt")[0].textContent;
          }
        }
        if (maxIntTmp == "[objectHTMLUnknownElement]") maxIntTmp = null;
        var headline = xml.getElementsByTagName("Head")[0].getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent;

        MargeEQInfo([{
          status: xml.getElementsByTagName("Status")[0].textContent,
          eventId: xml.getElementsByTagName("EventID")[0].textContent,
          category: xml.getElementsByTagName("Title")[0].textContent,
          OriginTime: originTimeTmp,
          epiCenter: epiCenterTmp,
          M: magnitudeTmp,
          maxI: NormalizeShindo(maxIntTmp),
          maxLgInt: maxLgInt,
          cancel: Boolean(cancel),
          reportDateTime: new Date(
            xml.getElementsByTagName("ReportDateTime")[0].textContent
          ),
          DetailURL: [url],
          headline: headline,
          axisData: null,
        }], count);
      } else if (title == "地震回数に関する情報") {
        if (xml.getElementsByTagName("EarthquakeCount")[0]) {
          var hourly = []
          var sum, std;
          xml.querySelectorAll("EarthquakeCount Item").forEach(function (el) {
            var type = el.getAttribute("type")

            if (el.getElementsByTagName("StartTime")[0]) var StartTime = new Date(el.getElementsByTagName("StartTime")[0].textContent)
            if (el.getElementsByTagName("EndTime")[0]) var EndTime = new Date(el.getElementsByTagName("EndTime")[0].textContent)
            if (el.getElementsByTagName("Number")[0] && Number(el.getElementsByTagName("Number")[0].textContent) !== -1) var _Number = Number(el.getElementsByTagName("Number")[0].textContent)
            if (el.getElementsByTagName("FeltNumber")[0] && Number(el.getElementsByTagName("FeltNumber")[0].textContent) !== -1) var FeltNumber = Number(el.getElementsByTagName("FeltNumber")[0].textContent)

            var data = {
              StartTime: StartTime,
              EndTime: EndTime,
              Number: _Number,
              FeltNumber: FeltNumber
            }

            if (type == "１時間地震回数") {
              hourly.push(data)
            } else if (type == "累積地震回数") {
              sum = data
            } else if (type == "地震回数") {
              std = data
            }
          })

          var headline = xml.getElementsByTagName("Head")[0].getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent;
          var Text = xml.querySelector("Body Text") ? xml.querySelector("Body Text").textContent : ""
          var NextAdvisory = xml.querySelector("NextAdvisory") ? xml.querySelector("NextAdvisory").textContent : ""
          var FreeFormComment = xml.querySelector("Comments FreeFormComment") ? xml.querySelector("Comments FreeFormComment").textContent : ""


          EQCount_process({
            status: xml.getElementsByTagName("Status")[0].textContent,
            eventId: xml.getElementsByTagName("EventID")[0].textContent,
            category: xml.getElementsByTagName("Title")[0].textContent,
            cancel: Boolean(cancel),
            reportDateTime: new Date(
              xml.getElementsByTagName("ReportDateTime")[0].textContent
            ),
            headline: headline || "",
            hourly: hourly,
            sum: sum,
            std: std,
            Text: Text,
            NextAdvisory: NextAdvisory,
            FreeFormComment: FreeFormComment
          })
        }

      } else if (title == "南海トラフ地震関連解説情報" || title == "南海トラフ地震臨時情報") {
        var data = {
          title: title, //南海トラフ地震関連解説情報など
          kind: null, //定例など
          reportKind: xml.getElementsByTagName("Head")[0].getElementsByTagName("InfoType")[0].textContent, //発表/取消
          reportDate: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent), //時刻
          Serial: null,
          HeadLine: xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent, //要約
          Text: "",
          Appendix: "",
          NextAdvisory: "",
          Text2: "",
        };

        if (xml.getElementsByTagName("Serial")[0] && xml.getElementsByTagName("Serial")[0].textContent)
          data.Serial = Number(xml.getElementsByTagName("Serial")[0].textContent);
        var Body = xml.getElementsByTagName("Body")[0];
        var EarthQuakeInfo = Body.getElementsByTagName("EarthquakeInfo")[0];
        if (EarthQuakeInfo) {
          if (EarthQuakeInfo.getElementsByTagName("InfoSerial")[0]) {
            data.kind = EarthQuakeInfo.getElementsByTagName("InfoSerial")[0].getElementsByTagName("Name")[0].textContent;
          }
          data.Text = EarthQuakeInfo.getElementsByTagName("Text")[0].textContent;

          if (EarthQuakeInfo.getElementsByTagName("Appendix")[0])
            data.Appendix = EarthQuakeInfo.getElementsByTagName("Appendix")[0].textContent;
        }

        if (Body.getElementsByTagName("NextAdvisory")[0])
          data.NextAdvisory = Body.getElementsByTagName("NextAdvisory")[0].textContent;

        var Text2Elm = Array.from(xml.getElementsByTagName("Body")[0].children)
          .find(function (elm) { return elm.tagName == "Text"; });

        if (Text2Elm) data.Text2 = Text2Elm.textContent;

        NankaiTroughInfoAll.push(data);
        NankaiTroughInfoAll = NankaiTroughInfoAll
          .sort((a, b) => a.reportDate > b.reportDate ? -1 : 1);

        var teirei;
        var rinji = NankaiTroughInfoAll.find(function (elm) {
          var offset = Number(new Date() - new Date(elm.reportDate));
          return (
            elm.title.startsWith("南海トラフ地震臨時情報") &&
            ((elm.kind == "巨大地震警戒" && offset <= 12091200000) || elm.kind == "巨大地震注意" || elm.kind == "調査中" || (elm.kind == "調査終了" && offset <= 604800000))
          );
        });
        if (rinji) {
          teirei = NankaiTroughInfoAll.find(function (elm) {
            return (
              elm.title.startsWith("南海トラフ地震関連解説情報") &&
              new Date(rinji.reportDate) <= new Date(elm.reportDate)
            );
          });
        } else {
          teirei = NankaiTroughInfoAll.find(function (elm) {
            return elm.title.startsWith("南海トラフ地震関連解説情報");
          });
        }

        NankaiTroughInfo = { rinji: rinji, teirei: teirei };

        messageToMainWindow({
          action: "NankaiTroughInfo",
          data: NankaiTroughInfo,
        });

        if (NankaiWindow.window) {
          var data = NankaiWindow.type == "rinji" ? NankaiTroughInfo.rinji : NankaiTroughInfo.teirei;
          if (data) {
            NankaiWindow.window.webContents.send("message2", {
              action: "NankaiTroughInfo",
              data: data,
            });
          }
        }
      } else if (
        title == "津波情報a" ||
        title == "津波警報・注意報・予報a" ||
        title == "沖合の津波観測に関する情報"
      ) {
        //津波予報
        var tsunamiDataTmp;
        var EventID = xml.getElementsByTagName("EventID")[0].textContent.split(" ").map(Number);
        var EQData = [];
        Array.prototype.forEach.call(
          xml.getElementsByTagName("Earthquake"),
          function (elm, index) {
            var magTmp = elm.getElementsByTagName("jmx_eb:Magnitude")[0];
            magTmp = (magTmp && magTmp.textContent !== "NaN") ? magTmp.textContent : null;
            var ECTmp = elm.getElementsByTagName("Name")[0];
            ECTmp = ECTmp ? ECTmp.textContent : null;

            EQData.push({
              status: xml.getElementsByTagName("Status")[0].textContent,
              eventId: EventID[index],
              category: "Tsunami",
              OriginTime: elm.getElementsByTagName("OriginTime")[0] ? new Date(elm.getElementsByTagName("OriginTime")[0].textContent) : new Date(),
              epiCenter: ECTmp,
              M: Number(magTmp),
              maxI: null,
              cancel: Boolean(cancel),
              reportDateTime: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent),
              DetailURL: [url],
              Headline: "",
              axisData: null,
            });
          }
        );
        MargeEQInfo(EQData, count);

        if (cancel) {
          tsunamiDataTmp = {
            status: xml.getElementsByTagName("Status")[0].textContent,
            issue: {
              time: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent),
              EventID: null,
              EarthQuake: null,
            },
            areas: [],
            revocation: true,
            source: "jmaXML",
            ValidDateTime: null,
          };
        } else {
          var ValidDateTimeElm = xml.getElementsByTagName("ValidDateTime")[0];
          if (ValidDateTimeElm) var ValidDateTimeTmp = new Date(ValidDateTimeElm.textContent);
          else {
            var ValidDateTimeTmp = new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent);
            ValidDateTimeTmp.setHours(ValidDateTimeTmp.getHours() + 12);
          }
          if (ValidDateTimeTmp < new Date() - Replay) return;

          var headline = "";
          var headlineElm = xml.getElementsByTagName("Headline")[0];
          if (headlineElm && headlineElm.getElementsByTagName("Text")[0])
            headline = headlineElm.getElementsByTagName("Text")[0].textContent;

          var Text1 = "";
          var WarningComment = "";
          var FreeFormComment = "";
          //付加文取得の不具合による処理停止を回避
          try {
            if (xml.querySelector("Body  > Text")) {
              Text1 = `${xml.querySelector("Body  > Text").textContent}\n\n`;
            }

            var comments_elm = xml.getElementsByTagName("Comments")[0];
            if (comments_elm) {
              var WarningComment_elm =
                comments_elm.getElementsByTagName("WarningComment")[0];
              if (WarningComment_elm)
                WarningComment = `${WarningComment_elm.getElementsByTagName("Text")[0].textContent}\n\n`;

              var FreeFormComment_elm =
                comments_elm.getElementsByTagName("FreeFormComment")[0];
              if (FreeFormComment_elm)
                FreeFormComment = FreeFormComment_elm.textContent;
            }
            // eslint-disable-next-line no-empty
          } catch { }

          //P2PのAPIとの整合性のため、津波情報においてのみ、Control > DateTimeを発表時刻として扱う
          var dateTime = new Date(
            xml.getElementsByTagName("Control")[0].getElementsByTagName("DateTime")[0].textContent
          );

          tsunamiDataTmp = {
            status: xml.getElementsByTagName("Status")[0].textContent,
            issue: {
              time: dateTime,
              EventID: EventID,
              EarthQuake: EQData,
            },
            areas: [],
            revocation: false,
            headline: headline,
            comment: Text1 + WarningComment + FreeFormComment,
            source: "jmaXML",
            ValidDateTime: ValidDateTimeTmp,
          };

          var tsunamiElm = xml.getElementsByTagName("Body")[0].getElementsByTagName("Tsunami")[0];
          if (tsunamiElm) {
            var forecastElm;
            if (tsunamiElm.getElementsByTagName("Forecast")[0])
              forecastElm = tsunamiElm.getElementsByTagName("Forecast")[0];
            if (tsunamiElm.getElementsByTagName("Estimation")[0])
              forecastElm = tsunamiElm.getElementsByTagName("Estimation")[0];
            if (forecastElm) {
              Array.prototype.forEach.call(
                forecastElm.getElementsByTagName("Item"),
                function (elm) {
                  var gradeTmp;
                  var cancelledTmp = false;
                  if (elm.getElementsByTagName("Category")[0]) {
                    switch (
                    Number(
                      elm.getElementsByTagName("Category")[0].getElementsByTagName("Kind")[0].getElementsByTagName("Code")[0].textContent
                    )
                    ) {
                      case 52:
                      case 53:
                        gradeTmp = "MajorWarning";
                        break;
                      case 51:
                        gradeTmp = "Warning";
                        break;
                      case 62:
                        gradeTmp = "Watch";
                        break;
                      case 71:
                      case 72:
                      case 73:
                        gradeTmp = "Yoho";
                        break;
                      case 50:
                      case 60:
                        cancelledTmp = true;
                        break;
                    }
                  }
                  var firstHeightTmp;
                  var firstHeightConditionTmp;
                  var maxHeightTmp;
                  if (elm.getElementsByTagName("FirstHeight")[0]) {
                    if (elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0]) {
                      firstHeightTmp = new Date(elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0].textContent);
                    }
                    if (elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("Condition")[0]) {
                      firstHeightConditionTmp = elm.getElementsByTagName("FirstHeight")[0].getElementsByTagName("Condition")[0].textContent;
                    }
                  }
                  if (elm.getElementsByTagName("MaxHeight")[0]) {
                    var maxHeightElm = elm.getElementsByTagName("MaxHeight")[0].getElementsByTagName("jmx_eb:TsunamiHeight");
                    if (maxHeightElm[0]) {
                      maxHeightTmp = maxHeightElm[0].getAttribute("description")
                        .replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                        });
                    } else if (elm.getElementsByTagName("MaxHeight")[0].getElementsByTagName("Condition")[0]) {
                      maxHeightTmp = elm.getElementsByTagName("MaxHeight")[0].getElementsByTagName("Condition")[0].textContent;
                    }
                  }

                  var stations = [];
                  if (elm.getElementsByTagName("Station")[0]) {
                    Array.prototype.forEach.call(
                      elm.getElementsByTagName("Station"),
                      function (elm2) {
                        var ArrivalTimeTmp;
                        var ConditionTmp;
                        var nameTmp = elm2.getElementsByTagName("Name")[0].textContent;
                        var codeTmp = elm2.getElementsByTagName("Code")[0].textContent;
                        var highTideTimeTmp = new Date(elm2.getElementsByTagName("HighTideDateTime")[0].textContent);
                        if (elm2.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0])
                          ArrivalTimeTmp = new Date(elm2.getElementsByTagName("FirstHeight")[0].getElementsByTagName("ArrivalTime")[0].textContent);
                        if (elm2.getElementsByTagName("Condition")[0])
                          ConditionTmp = elm2.getElementsByTagName("Condition")[0].textContent;
                        stations.push({
                          name: nameTmp,
                          code: codeTmp,
                          HighTideDateTime: highTideTimeTmp,
                          ArrivalTime: ArrivalTimeTmp,
                          Condition: ConditionTmp,
                        });
                      }
                    );
                  }

                  var codeTmp;
                  if (elm.getElementsByTagName("Category")[0])
                    codeTmp = Number(elm.getElementsByTagName("Category")[0].getElementsByTagName("Kind")[0].getElementsByTagName("Code")[0].textContent);

                  tsunamiDataTmp.areas.push({
                    code: codeTmp,
                    grade: gradeTmp,
                    name: elm.getElementsByTagName("Name")[0].textContent,
                    cancelled: cancelledTmp,
                    firstHeight: firstHeightTmp,
                    firstHeightCondition: firstHeightConditionTmp,
                    stations: stations,
                    maxHeight: maxHeightTmp,
                  });
                }
              );
            }

            if (tsunamiElm.getElementsByTagName("Observation")[0]) {
              Array.prototype.forEach.call(
                tsunamiElm.getElementsByTagName("Observation")[0].getElementsByTagName("Item"),
                function (elm) {
                  var stations = [];
                  if (elm.getElementsByTagName("Station")[0]) {
                    Array.prototype.forEach.call(
                      elm.getElementsByTagName("Station"),
                      function (elm2) {
                        var ArrivalTimeTmp;
                        var firstHeightConditionTmp;
                        var firstHeightInitialTmp;
                        var maxHeightTime;
                        var maxHeightCondition;
                        var oMaxHeightTmp;
                        var maxHeightRising = false;
                        var nameTmp = elm2.getElementsByTagName("Name")[0].textContent;

                        if (elm2.getElementsByTagName("FirstHeight")[0]) {
                          var firstHeightTag = elm2.getElementsByTagName("FirstHeight")[0];
                          if (firstHeightTag.getElementsByTagName("ArrivalTime")[0])
                            ArrivalTimeTmp = new Date(firstHeightTag.getElementsByTagName("ArrivalTime")[0].textContent);
                          if (firstHeightTag.getElementsByTagName("Condition")[0])
                            firstHeightConditionTmp = firstHeightTag.getElementsByTagName("Condition")[0].textContent;
                          if (firstHeightTag.getElementsByTagName("Initial")[0])
                            firstHeightInitialTmp = firstHeightTag.getElementsByTagName("Initial")[0].textContent;
                        }
                        if (elm2.getElementsByTagName("MaxHeight")[0]) {
                          var maxHeightElm = elm2.getElementsByTagName("MaxHeight")[0].getElementsByTagName("jmx_eb:TsunamiHeight")[0];
                          if (maxHeightElm) {
                            oMaxHeightTmp = maxHeightElm.getAttribute("description");
                            oMaxHeightTmp = oMaxHeightTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                              return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                            });
                            if (maxHeightElm.getAttribute("condition"))
                              maxHeightRising = maxHeightElm.getAttribute("condition") == "上昇中";
                          }

                          var maxHeightTimeElm = elm2.getElementsByTagName("MaxHeight")[0].getElementsByTagName("DateTime")[0];
                          if (maxHeightTimeElm) maxHeightTime = new Date(maxHeightTimeElm.textContent);

                          var maxHeightConditionElm = elm2.getElementsByTagName("MaxHeight")[0].getElementsByTagName("Condition")[0];
                          if (maxHeightConditionElm) maxHeightCondition = maxHeightConditionElm.textContent;
                        }

                        var codeTmp = elm2.getElementsByTagName("Code")[0].textContent;

                        stations.push({
                          name: nameTmp,
                          code: codeTmp,
                          ArrivedTime: ArrivalTimeTmp,
                          firstHeightCondition: firstHeightConditionTmp,
                          firstHeightInitial: firstHeightInitialTmp,
                          omaxHeight: oMaxHeightTmp,
                          maxHeightRising: maxHeightRising,
                          maxHeightTime: maxHeightTime,
                          maxHeightCondition: maxHeightCondition,
                        });
                      }
                    );
                  }

                  var areaName = title == "沖合の津波観測に関する情報" ? "（海上）" : elm.getElementsByTagName("Name")[0].textContent;
                  var tsunamiItem = tsunamiDataTmp.areas.find(function (elm2) {
                    return elm2.name == areaName;
                  });
                  if (tsunamiItem) {
                    stations.forEach(function (elm2) {
                      var stationElm = tsunamiItem.stations.findIndex(function (elm3) {
                        return elm3.name == elm2.name;
                      });
                      if (stationElm > -1) tsunamiItem.stations[stationElm] = Object.assign(tsunamiItem.stations[stationElm], elm2);
                      else tsunamiItem.stations.push(elm2);
                    });
                  } else {
                    tsunamiDataTmp.areas.push({
                      name: areaName,
                      stations: stations,
                    });
                  }
                }
              );
            }
          }
        }
        ConvertTsunamiInfo(tsunamiDataTmp);
      } else if (title == "北海道・三陸沖後発地震注意情報") {
        var data = {
          title: title, //北海道・三陸沖後発地震注意情報
          kind: xml.getElementsByTagName("Head")[0].getElementsByTagName("InfoType")[0].textContent,//発表/取消
          reportDate: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent), //時刻
          HeadLine: xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent, //要約
          Text: "",
          Appendix: "",
          Text2: "",
        };

        var Body = xml.getElementsByTagName("Body")[0];
        var EarthQuakeInfo = Body.getElementsByTagName("EarthquakeInfo")[0];
        if (EarthQuakeInfo) {
          data.Text = EarthQuakeInfo.getElementsByTagName("Text")[0].textContent;
          if (EarthQuakeInfo.getElementsByTagName("Appendix")[0])
            data.Appendix = EarthQuakeInfo.getElementsByTagName("Appendix")[0].textContent;
        }

        var Text2Elm = Array.from(xml.getElementsByTagName("Body")[0].children)
          .find(function (elm) { return elm.tagName == "Text"; });
        if (Text2Elm) data.Text2 = Text2Elm.textContent;

        Process_Hokkaidosanriku(data)
      } else if (title == "地震の活動状況等に関する情報") {
        var headline = xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent
        if (headline.includes("南海トラフ地震に関連する情報")) return;//南海トラフ地震関連解説情報（移行措置電文）の重複をはじく

        var data = {
          title: title, //地震の活動状況等に関する情報
          kind: xml.getElementsByTagName("Head")[0].getElementsByTagName("InfoType")[0].textContent,//発表/取消
          reportDate: new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent), //時刻
          HeadLine: xml.getElementsByTagName("Headline")[0].getElementsByTagName("Text")[0].textContent, //要約
          Naming: null,
          NamingEn: null,
          Text: "",
          Comments: "",
        };

        var Body = xml.getElementsByTagName("Body")[0];
        data.Text = Body.getElementsByTagName("Text")[0].textContent;

        var commentsEl = Body.getElementsByTagName("Comments")[0];
        if (commentsEl && commentsEl.getElementsByTagName("FreeFormComment")[0])
          data.Comments = commentsEl.getElementsByTagName("FreeFormComment")[0].textContent;

        var NamingElm = Body.getElementsByTagName("Naming")[0]
        if (NamingElm) {
          data.Naming = NamingElm.textContent
          if (NamingElm.getAttribute("english")) data.NamingEn = NamingElm.getAttribute("english")
        }



        KatsudoJokyoInfoAll.push(data);
        KatsudoJokyoInfoAll = KatsudoJokyoInfoAll
          .sort((a, b) => a.reportDate > b.reportDate ? -1 : 1);

        messageToMainWindow({
          action: "KatsudoJokyoInfo",
          data: KatsudoJokyoInfoAll[0],
        });

        if (KatsudoJokyoWindow && KatsudoJokyoInfoAll[0]) {
          KatsudoJokyoWindow.webContents.send("message2", {
            action: "KatsudoJokyoInfo",
            data: KatsudoJokyoInfoAll[0],
          });
        }

      }
      UpdateStatus("JMAXML", "success");
      if (new Date(xml.getElementsByTagName("ReportDateTime")[0].textContent) < (new Date() - Replay)) {
        //未来のデータ（リプレイ時）のため無視した場合、取得済みリストに入れない
        jmaXML_Fetched.push(url);
      }
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("JMAXML", "Error");
    });
}

var NankaiTroughInfo = { rinji: null, teirei: null };
var NankaiTroughInfoAll = [];
var HokkaidoSanrikuInfoAll = [];
var KatsudoJokyoInfoAll = [];

//USGS 取得・フォーマット変更→MargeEQInfo
var usgsLastGenerated = 0;
var Req_USGS = throttle(function () {
  fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=${USGS_CurrentInfoNumber}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      if (!json || !json.features[0] || !json.features[0].properties || !json.features[0].properties.updated) throw new Error("usgs.govが不正なデータを返しました。");
      if (usgsLastGenerated > json.features[0].properties.updated) throw new Error("usgs.govが古いデータを返しました。");

      usgsLastGenerated = json.features[0].properties.updated;

      var dataTmp2 = [];
      json.features.forEach(function (elm) {
        var FECode = FERegion.features.find(function (elm2) {
          return turf.booleanPointInPolygon(elm.geometry.coordinates, elm2);
        });

        var maxi;
        if (elm.properties.mmi !== null) maxi = elm.properties.mmi;

        dataTmp2.push({
          eventId: elm.id,
          category: null,
          OriginTime: new Date(elm.properties.time),
          epiCenter: FECode ? FECode.properties.nameJA : "",
          M: Math.round(elm.properties.mag * 10) / 10,
          maxI: maxi,
          DetailURL: [elm.properties.url],
        });
      });
      dataTmp2 = dataTmp2.sort((a, b) => a.OriginTime > b.OriginTime ? -1 : 1);
      AlertEQInfo(dataTmp2, "usgs");
    }).catch((err) => {
      GeneralError_handler(err)
    });
}, 2000);

//narikakun地震情報API リスト取得→Req_Narikakun
function Req_NarikakunList(count) {
  fetch(`https://earthquake-api-v2.nakn.jp/api/v2/list?limit=${JMA_CurrentInfoNumber}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
      return r.json();
    }).then((json) => {
      if (!json || json.status != "ok" || !json.items) throw new Error("ntools APIが不正なデータかstatus≠okを返した。");

      var data_array = [];
      for (let item of json.items) {
        //if (!originTimeTmp) originTimeTmp = new Date(json.Head.TargetDateTime);　保留

        for (let elm of item.lists) {
          var originTime = (elm.data && elm.data.originTimeNew) ? new Date(elm.data.originTimeNew) : null;
          var reportDateTime = elm.datetime ? new Date(elm.datetime) : null;
          var epiCenter = (elm.data && elm.data.hypoName) ? elm.data.hypoName : null;
          var Magnitude = (elm.data && elm.data.magnitude) ? Number(elm.data.magnitude) : null;
          var MaxI = (elm.data && elm.data.int) ? NormalizeShindo(elm.data.int) : null;
          var cancel = (elm.type == "取消");
          var url_list = elm.url ? [elm.url] : [];

          data_array.push({
            status: elm.status,
            eventId: item.eventId,
            category: elm.title,
            OriginTime: originTime,
            epiCenter: epiCenter,
            M: Magnitude,
            maxI: MaxI,
            cancel: cancel,
            reportDateTime: reportDateTime,
            DetailURL: url_list,
            headline: "",//保留
            axisData: null,
          });
          UpdateStatus("ntool", "success");
        }
      }

      MargeEQInfo(data_array, count);

      UpdateStatus("ntool", "success");
    }).catch((err) => {
      GeneralError_handler(err)
      UpdateStatus("ntool", "Error");
    });
}

var EQInfoData = {};
//地震情報マージ→AlertEQInfo
function MargeEQInfo(dataList, count) {
  try {
    var eqInfoTmp = [];
    var UpdateEQInfoTmp = [];

    var audioNotification = false;

    dataList.forEach(function (data) {
      if (!data.eventId) return;
      var changed = false;
      var EQElm = EQInfoData[data.eventId];
      if (EQElm) {
        var EQInfo_Item = {
          eventId: EQElm.eventId,
          category: null,
          EEW: null,
          reportDateTime: null,
          OriginTime: null,
          epiCenter: null,
          M: null,
          maxI: null,
          maxLgInt: null,
          DetailURL: [],
          headline: null,
          axisData: [],
        };
        EQElm.raw_data.push(data);
        var rawData = EQElm.raw_data
          .sort((a, b) => a.reportDateTime < b.reportDateTime ? -1 : 1);

        //キャンセル報を受信時、同一カテゴリの過去情報のキャンセルフラグを立てる（気象庁仕様に準拠）
        rawData.forEach(function (elm, index) {
          if (elm.cancel) {
            rawData.slice(0, index).forEach(function (elm2, index2) {
              if (elm2.category == elm.category) rawData[index2].cancel = true;
            });
          }
        });
        rawData.forEach(function (elm) {
          if (!config.Info.EQInfo.showtraining && elm.status == "訓練") return;
          if (!config.Info.EQInfo.showTest && elm.status == "試験") return;
          if (new Date(elm.reportDateTime) > new Date() - Replay) return;


          if (elm.category == "EEW" && EQElm.EEW === false) return;//EEW以外の情報が既に入っているとき、EEWによる情報を破棄
          else if (elm.category == "EEW") EQElm.EEW = true;
          else if (elm.category != "EEW" && EQElm.EEW == true) {
            //EEW以外の情報が入ってきたとき、EEWによる情報を破棄
            EQElm.EEW = false;
            EQInfo_Item = {
              eventId: EQElm.eventId,
              category: null,
              EEW: false,
              reportDateTime: null,
              OriginTime: null,
              epiCenter: null,
              M: null,
              maxI: null,
              maxLgInt: null,
              DetailURL: [],
              headline: null,
              axisData: [],
            };
          }

          EQInfo_Item.reportDateTime = elm.reportDateTime;
          EQInfo_Item.category = elm.category;
          if (Boolean2(elm.OriginTime)) EQInfo_Item.OriginTime = elm.OriginTime;
          if (Boolean2(elm.epiCenter)) EQInfo_Item.epiCenter = elm.epiCenter;
          if (Boolean2(elm.M) && elm.M != "Ｍ不明" && elm.M != "NaN") EQInfo_Item.M = elm.M;
          if (Boolean2(elm.maxI) && elm.maxI !== "?") EQInfo_Item.maxI = elm.maxI;
          if (Boolean2(elm.maxLgInt) && elm.maxLgInt !== "?") EQInfo_Item.maxLgInt = elm.maxLgInt;
          if (Boolean2(elm.headline)) EQInfo_Item.headline = elm.headline;
          EQInfo_Item.cancel = elm.cancel;

          if (Array.isArray(elm.DetailURL)) {
            elm.DetailURL.forEach(function (elm2) {
              if (elm2 && !EQInfo_Item.DetailURL.includes(elm2) && !EQElm.DetailURL.includes(elm2)) {
                EQInfo_Item.DetailURL.push(elm2);
              }
            });
          }
          if (elm.axisData) EQInfo_Item.axisData.push(elm.axisData);
        });

        //同イベント2報以降だがEEW以外の情報は初の場合音声通知する。そうでなければ残ってるフラグをfalseにもどす。
        EQElm.audioNotification = (EQElm.category == "EEW" && EQInfo_Item.category != "EEW")

        //キーごとにマージ
        Object.keys(EQInfo_Item).forEach(function (key) {
          if (!EQInfo_Item[key]) return;//新しい側の値がなかったら無視

          if (key == "reportDateTime") {//reportDateTimeは常に更新、フラグ立てない
            EQElm[key] = EQInfo_Item[key];
          } else if (key == "DetailURL") {//DetailURLは配列を結合
            if (Array.isArray(EQInfo_Item[key]) && Array.isArray(EQElm[key])) {//データ検証
              EQElm[key] = Array.from(new Set([...EQElm[key], ...EQInfo_Item[key]]));
              changed = true;//変更ありフラグ
            }
          } else if (key == "axisData") {
            EQInfo_Item[key].forEach(function (elm) {
              var uuid = elm.message.uuid_
              var exists = EQElm[key].find((el) => {
                return el.message && el.message.uuid_ == uuid
              });
              if (!exists) EQElm[key].push(elm)
            })
          } else if (key == "audioNotification") {
            return;//前の部分で判定済みなので上書きしないよう飛ばす
          } else {
            if (EQElm[key] !== EQInfo_Item[key] && Boolean2(EQInfo_Item[key])) {
              EQElm[key] = EQInfo_Item[key];
              changed = true;//変更ありフラグ
            }
          }
        });

        if (changed) {
          UpdateEQInfoTmp.push(EQElm);
          var i = eqInfo.jma.findIndex((el) => el.eventId == EQElm.eventId);
          if (-1 < i) eqInfo.jma[i] = EQElm;
        }
      } else {
        data.EEW = data.category == "EEW"

        EQInfoData[data.eventId] = { ...data };//値渡しにする
        EQInfoData[data.eventId].raw_data = [{ ...data }];//値渡しにする

        eqInfoTmp.push(data);
        eqInfo.jma.push(data);
        var latest_reportDate = Math.max(...Object.keys(EQInfoData).map(function (key) { return Number(EQInfoData[key].reportDateTime) }));

        //当該イベントの初受信＆それが最新（reportDateが過去最大）なら音声通知する
        data.audioNotification = (count !== 0 && data.category !== "EEW" && Number(data.reportDateTime) == latest_reportDate)
      }
    });

    if (eqInfoTmp.length > 0) AlertEQInfo(eqInfoTmp, "jma", false);
    if (UpdateEQInfoTmp.length > 0) AlertEQInfo(UpdateEQInfoTmp, "jma", true);
  } catch (err) {
    throw new Error("地震情報データの処理（マージ）に失敗しました。", { cause: err });
  }
}


var EQCount_data = {};
function EQCount_process(data) {
  if (data) EQCount_data[data.eventId] = data
  var EQCount_data_array = Object.values(EQCount_data);

  EQCount_data_array = EQCount_data_array
    .sort((a, b) => Number(a.reportDateTime) - Number(b.reportDateTime))

  messageToMainWindow({
    action: "EQCount",
    source: "jma",
    data: EQCount_data_array,
  });
}

//時間(ms)を「～分[秒,分,時間,日]」の形にする
function timeDifference(miliseconds) {
  if (isNaN(miliseconds) || miliseconds < 0) return null;

  var sec = Math.round(miliseconds / 1000);
  var min = Math.round(miliseconds / 60000);
  var hrs = Math.round(miliseconds / 3600000);
  var day = Math.round(miliseconds / 86400000)

  if (sec < 60) return { num: sec, unit: "秒" };
  if (min < 60) return { num: min, unit: "分" };
  if (hrs < 24) return { num: hrs, unit: "時間" };
  return { num: day, unit: "日" };
}

//地震情報通知（音声・画面表示等）
function AlertEQInfo(data, source, update) {
  try {
    if (source == "jma") {

      //OriginTimeがないデータ用にソート専用時刻をつくる
      data.forEach(function (elm) {
        elm.DateForSort = elm.OriginTime ? elm.OriginTime : elm.reportDateTime;
      })

      //音声通知条件を満たす最新のデータ
      var dataToNotify = data
        .sort((a, b) => a.DateForSort > b.DateForSort ? -1 : 1)
        .find(function (elm) {
          return elm.audioNotification
        })

      //音声通知
      if (dataToNotify) {
        if (config.Info.EQInfo.NotificationSound &&
          (config.Info.EQInfo.Bypass_threshold || NormalizeShindo(config.Info.EQInfo.maxI_threshold, 5) <= NormalizeShindo(dataToNotify.maxI, 5) || config.Info.EQInfo.M_threshold <= dataToNotify.M)) {
          PlayAudio("EQInfo");
          speak(GenerateEQInfoText(dataToNotify));
        }
      }

      eqInfo.jma = eqInfo.jma
        .sort((a, b) => a.DateForSort > b.DateForSort ? -1 : 1);

      messageToMainWindow({
        action: "EQInfo",
        source: "jma",
        data: eqInfo.jma.slice(0, JMA_CurrentInfoNumber),
      });

      //現在開いている地震情報ウィンドウにデータ送信
      data.forEach(function (elm) {
        if (EQI_Window[elm.eventId]) {
          var metadata = EQI_Window[elm.eventId].metadata;
          var EEWDataItem = EEW_Storage.find(function (elm2) {
            return elm2.EventID == elm.eventId;
          });

          metadata.urls = elm.DetailURL;
          metadata.eew = EEWDataItem;
          metadata.axisData = elm.axisData;
          EQI_Window[elm.eventId].window.webContents.send("message2", metadata);
        }
      });
    } else if (source == "usgs") {
      eqInfo.usgs = data;

      messageToMainWindow({
        action: "EQInfo",
        source: "usgs",
        data: eqInfo.usgs.slice(0, USGS_CurrentInfoNumber),
      });
    }
  } catch (err) {
    throw new Error("地震情報の通知処理でエラーが発生しました。", { cause: err });
  }
}

//🔴津波情報🔴
var Tsunami_Data = [];
var Tsunami_data_Marged;
function ConvertTsunamiInfo(data) {
  try {
    if (!config.Info.TsunamiInfo.GetData) return;
    if (!config.Info.TsunamiInfo.showtraining && data.status == "訓練") return;
    if (!config.Info.TsunamiInfo.showTest && data.status == "試験") return;
    if (!data.issue || !data.issue.time) return;//発報時刻欠損は破棄
    if (new Date(data.issue.time) > (new Date() - Replay)) return;//リプレイなどによって未来のデータが来たら破棄

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
        if (config.home.TsunamiSect && elm.name == config.home.TsunamiSect) {
          home_grade = GradeID[elm.grade];
        }
        return GradeID[elm.grade] || 0;
      });

      var max_grade = Math.max(...grades);

      if (config.Info.TsunamiInfo.NotificationSound) {
        //同EIDで最新の報かどうか
        let isNewest = !Boolean(Tsunami_Data.find(function (elm) {
          return (new Date(elm.issue.time) > new Date(data.issue.time) &&
            (!elm.issue.EventID || !data.issue.EventID || IncludesDuplicates(elm.issue.EventID, data.issue.EventID)));
        }));

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

      if (elm0.issue) {
        if (elm0.issue.time) Tsunami_data_Marged.issue.time = elm0.issue.time;
        if (elm0.issue.EventID) Tsunami_data_Marged.issue.EventID = elm0.issue.EventID;
        if (elm0.issue.EarthQuake) Tsunami_data_Marged.issue.EarthQuake = elm0.issue.EarthQuake;
      }

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

//🔴支援関数🔴

//音声合成
function speak(str) {
  if (str && WorkerWindow) {
    WorkerWindow.webContents.send("message2", { action: "speak", data: str });
  }
}

//EEW時読み上げ文章 生成
function GenerateEEWText(EEWData, update) {
  try {
    if (EEWData.is_cancel) var text = config.notice.voice.EEWCancel;
    else if (update) var text = config.notice.voice.EEWUpdate;
    else var text = config.notice.voice.EEW;

    text = text.replaceAll("{grade}", EEWData.alertflg || "");
    text = text.replaceAll("{serial}", EEWData.serial || "");
    text = text.replaceAll("{final}", EEWData.is_final ? "最終報" : "");
    text = text.replaceAll("{location}", config.home.name ? config.home.name : "現在地");
    text = text.replaceAll("{magnitude}", Boolean2(EEWData.magnitude) ? EEWData.magnitude : "");
    text = text.replaceAll("{maxInt}", Boolean2(EEWData.maxInt) ? NormalizeShindo(EEWData.maxInt, 1) : "");
    text = text.replaceAll("{depth}", Boolean2(EEWData.depth) ? EEWData.depth : "");
    text = text.replaceAll("{training}", EEWData.is_training ? "訓練報。" : "");
    text = text.replaceAll("{training2}", EEWData.is_training ? "これは訓練報です。" : "");
    text = text.replaceAll("{region_name}", EEWData.region_name || "");
    text = text.replaceAll("{report_time}", EEWData.report_time ? NormalizeDate(8, EEWData.report_time) : "");
    text = text.replaceAll("{origin_time}", EEWData.origin_time ? NormalizeDate(8, EEWData.origin_time) : "");
    if (EEWData.source == "simulation") text = `シミュレーションです。${text}`;

    var userInt;
    if (EEWData.userIntensity) {
      userInt = EEWData.userIntensity;
    } else if (EEWData.warnZones && EEWData.warnZones.length) {
      var SameZone = EEWData.warnZones.find(function (elm2) {
        return elm2.Name == config.home.Section;
      });

      if (SameZone) userInt = config.Info.EEW.IntType == "max" ? SameZone.IntTo : SameZone.IntFrom;
    }

    text = text.replaceAll("{local_Int}", userInt ? NormalizeShindo(userInt, 1) : "不明");

    if (!Boolean2(userInt)) text = text.replace(/\[.*?\]/g, "");
    text = text.replace(/\[|\]/g, "");

    return text;
  } catch {
    return "";
  }
}
//津波情報時読み上げ文章 生成
function GenerateEQInfoText(EQData) {
  try {
    if (EQData.category == "EEW") return ""; //EEWは専用の読み上げシステムに任せる
    if (!EQData.epiCenter && !EQData.maxI) return; //震度も震源もわからない（壊れたデータ）をはねる

    if (EQData.cancel) var text = config.notice.voice.EQInfoCancel;
    else var text = config.notice.voice.EQInfo;

    var category = EQData.category;
    if (category == "Tsunami") category = "津波情報に付帯する地震情報";

    var dif = timeDifference(new Date() - new Date(EQData.OriginTime));
    text = text.replaceAll("{category}", category || "");
    text = text.replaceAll("{training}", EQData.status == "訓練" ? "訓練報。" : "");
    text = text.replaceAll("{training2}", EQData.status == "訓練" ? "これは訓練報です。" : "");
    text = text.replaceAll("{report_time}", EQData.reportDateTime ? NormalizeDate(9, EQData.reportDateTime) : "");
    text = text.replaceAll("{origin_time}", EQData.OriginTime ? NormalizeDate(9, EQData.OriginTime) : "");
    text = text.replaceAll("{origin_time2}", (EQData.OriginTime && dif) ? `${dif.num}${dif.unit}前` : "先ほど");
    text = text.replaceAll("{region_name}", EQData.epiCenter || "");
    text = text.replaceAll("{magnitude}", EQData.M || "");
    text = text.replaceAll("{maxInt}", EQData.maxI ? NormalizeShindo(EQData.maxI, 1) : "");
    text = text.replaceAll("{headline}", EQData.headline || "");

    if (!EQData.epiCenter) text = text.replace(/\[.*?\]/g, "");
    if (!EQData.maxI) text = text.replace(/<.*?>/g, "");
    text = text.replace(/\[|\]|<|>/g, "");

    return text;
  } catch {
    return "";
  }
}
//津波情報時読み上げ文章 生成
function GenerateTsunamiText(data) {
  try {
    if (data.Torikeshi) var text = config.notice.voice.TsunamiTorikeshi;
    else if (data.revocation || data.cancelled)
      var text = config.notice.voice.TsunamiRevocation;
    else var text = config.notice.voice.Tsunami;
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
      if (area.grade) grades[area.grade] = true;
      if (config.home.TsunamiSect && area.name == config.home.TsunamiSect)
        homeArea = area;
    });

    Object.keys(grades).forEach(function (key) {
      if (grades[key]) grade_arr.push(grades_JA[key]);
    });

    text = text.replaceAll("{max_grade}", grade_arr[0] ? grade_arr[0] : "津波情報");
    text = text.replaceAll("{all_grade}", grade_arr[0] ? grade_arr.join("、") : "津波情報");
    text = text.replaceAll("{report_time}", data.issue.time ? NormalizeDate(9, data.issue.time) : "不明な時刻");
    text = text.replaceAll("{headline}", data.headline || "");

    if (homeArea && !homeArea.cancelled) {
      text = text.replaceAll("{home_area}", homeArea.name ? homeArea.name : "設定地点");
      text = text.replaceAll("{home_grade}", homeArea.grade ? grades_JA[homeArea.grade] : "津波情報");

      var firstHeightTmp = "";
      if (homeArea.firstHeight) {
        firstHeightTmp = `第１波が${NormalizeDate(9, homeArea.firstHeight)}に予想され、`;
      } else if (homeArea.firstHeightCondition == "津波到達中と推測") {
        firstHeightTmp = "津波が到達中とみられ、";
      } else if (homeArea.firstHeightCondition == "第１波の到達を確認") {
        firstHeightTmp = "既に第１波が到達し、";
      } else {
        firstHeightTmp = "";
      }
      text = text.replaceAll("{first_height1}", firstHeightTmp);

      var firstHeightTmp2 = "";
      if (homeArea.firstHeight) {
        firstHeightTmp2 = `到達予想時刻は${NormalizeDate(9, homeArea.firstHeight)}`;
      } else if (homeArea.firstHeightCondition == "津波到達中と推測") {
        firstHeightTmp2 = "津波到達中と推測";
      } else if (homeArea.firstHeightCondition == "第１波の到達を確認") {
        firstHeightTmp2 = "第１波の到達を確認";
      } else {
        firstHeightTmp2 = "到達時刻は不明";
      }
      text = text.replaceAll("{first_height2}", firstHeightTmp2);

      var immediately = "";
      if (homeArea.firstHeightCondition == "ただちに津波来襲と予測")
        immediately = "ただちに津波が来襲すると予測されます。";
      text = text.replaceAll("{immediately}", immediately);

      var MaxHeightTmp = "";
      if (homeArea.maxHeight == "巨大") {
        MaxHeightTmp = "巨大な津波";
      } else if (homeArea.maxHeight == "高い") {
        MaxHeightTmp = "高い津波";
      } else if (homeArea.maxHeight) {
        MaxHeightTmp = `今後最大${String(homeArea.maxHeight).replace("m", "メートル")}の津波`;
      } else if (!homeArea.maxHeight && homeArea.grade == "Yoho") {
        MaxHeightTmp = "若干の海面変動";
      } else {
        MaxHeightTmp = "高さ不明の津波";
      }
      text = text.replaceAll("{max_height1}", MaxHeightTmp);

      var MaxHeightTmp2 = "";
      if (homeArea.maxHeight == "巨大") {
        MaxHeightTmp2 = "巨大";
      } else if (homeArea.maxHeight == "高い") {
        MaxHeightTmp2 = "高い";
      } else if (homeArea.maxHeight) {
        MaxHeightTmp2 = homeArea.maxHeight.replace("m", "メートル");
      } else if (!homeArea.maxHeight && homeArea.grade == "Yoho") {
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

//音声再生(WorkerWindow連携)
function PlayAudio(name) {
  if (WorkerWindow) {
    WorkerWindow.webContents.send("message2", {
      action: "PlayAudio",
      data: name,
    });
  }
}

//メインウィンドウ内通知
var notifyData;
function SystemNotification(message) {
  var Push = new Notification({
    title: "Zero Quake システム通知",
    body: message,
    icon: path.join(__dirname, "img/icon.ico"),
  });

  Push.show();
}

//JSONパース（拡張）
function ParseJSON(str) {
  try {
    str = String(str);
    var json = JSON.parse(str);
  } catch {
    return null;
  }
  return json;
}

//日時フォーマット
function NormalizeDate(type, date) {
  try {
    if (!date) date = new Date();
    else date = new Date(date);
    if (Number.isNaN(date.getTime())) throw new Error();

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
        return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
      case 2:
        return `${YYYY}${MM}${DD}`;
      case 3:
        return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss}`;
      case 4:
        return `${YYYY}/${MM}/${DD} ${hh}:${mm}`;
      case 5:
        return `${D}日 ${hh}:${mm}`;
      case 6:
        return `${hh}:${mm}`;
      case 7:
        return `${hh}時${mm}分${ss}秒`;
      case 8:
        return `${h}時${m}分${s}秒`;
      case 9:
        var date_str = "";
        if (!isToday) date_str = `${D}日 `;
        return `${date_str}${h}時${m}分`;
      case 10:
        var date_str = "";
        if (!isToday) date_str = `${D}日 `;
        return `${date_str}${hh}:${mm}`;
      default:
        return new Date().toLocaleString("ja-jp");
    }
  } catch {
    return new Date().toLocaleString("ja-jp");
  }
}
//震度の形式変換
function NormalizeShindo(str, responseType) {
  try {
    var p2p_table = { "10": 1, "20": 2, "30": 3, "40": 4, "45": 5, "50": 6, "55": 7, "60": 8, "70": 9 }
    var IntIndex = 11;
    if (str === null || str === undefined) {
      IntIndex = 11;//不明
    } else if (p2p_table[str]) {
      IntIndex = p2p_table[str]//p2pの2桁フォーマット
    } else if (isNaN(str)) {
      str = String(str)
        .replace(/[０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        }).replaceAll("＋", "+").replaceAll("－", "-").replaceAll("強", "+").replaceAll("弱", "-").replace(/\s+/g, "");
      switch (str) {
        case "1":
          IntIndex = 1;
          break;
        case "2":
          IntIndex = 2;
          break;
        case "3":
          IntIndex = 3;
          break;
        case "4":
          IntIndex = 4;
          break;
        case "5-":
          IntIndex = 5;
          break;
        case "5+":
          IntIndex = 6;
          break;
        case "6-":
          IntIndex = 7;
          break;
        case "6+":
          IntIndex = 8;
          break;
        case "7":
          IntIndex = 9;
          break;
        case "未":
        case "５弱以上未入電":
        case "震度5-以上未入電":
        case "5+?":
          IntIndex = 10;
          break;
        case "-1":
        case "?":
        case "不明":
        default:
          IntIndex = 11;
      }
    } else {
      if (str < 0.5) IntIndex = 0;
      else if (str < 1.5) IntIndex = 1;
      else if (str < 2.5) IntIndex = 2;
      else if (str < 3.5) IntIndex = 3;
      else if (str < 4.5) IntIndex = 4;
      else if (str < 5) IntIndex = 5;
      else if (str < 5.5) IntIndex = 6;
      else if (str < 6) IntIndex = 7;
      else if (str < 6.5) IntIndex = 8;
      else if (6.5 <= str) IntIndex = 9;
      else IntIndex = 11;
    }
    switch (responseType) {
      case 1:
        var ConvTable = ["0", "1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7", "５弱以上未入電", "不明",];
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
        var ConvTable = [null, "1", "2", "3", "4", "5m", "5p", "6m", "6p", "7", "5p?", null,
        ];
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
    return ConvTable[IntIndex];
  } catch {
    return "?";
  }
}

//連想配列オブジェクトのマージ
function mergeDeeply(target, source, opts) {
  try {
    const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
    const isConcatArray = opts && opts.concatArray;
    let result = { ...target };//参照渡しを切る
    if (isObject(target) && isObject(source)) {
      for (const [sourceKey, sourceValue] of Object.entries(source)) {
        const targetValue = target[sourceKey];
        if (isConcatArray && Array.isArray(sourceValue) && Array.isArray(targetValue))
          result[sourceKey] = targetValue.concat(...sourceValue);
        else if (isObject(sourceValue) && Object.prototype.hasOwnProperty.call(target, sourceKey))
          result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
        else Object.assign(result, { [sourceKey]: sourceValue });
      }
    }
    return result;
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。(JSONのマージ)", { cause: err });
  }
}
function ConvertJST(time) {
  try {
    var copy = new Date(time);
    copy.setHours(copy.getHours() + 9)
    return copy;
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。(タイムゾーンの変換 - UTC to JST)", { cause: err });
  }
}
function ConvertUTC(time) {
  try {
    var copy = new Date(time)
    copy.setHours(copy.getHours() - 9)
    return copy;
  } catch (err) {
    throw new Error("内部の情報処理でエラーが発生しました。(タイムゾーンの変換 - JST to UTC)", { cause: err });
  }
}
function depthFilter(depth) {
  if (!isFinite(depth) || depth < 0) return 0;
  else if (depth > 700) return 700;
  else if (200 <= depth) return Math.floor(depth / 10) * 10;
  else if (50 <= depth) return Math.floor(depth / 5) * 5;
  else return Math.floor(depth / 2) * 2;
}
function getClosestNum(needle, haystack) {
  return haystack.reduce((a, b) => {
    var aDiff = Math.abs(a - needle);
    var bDiff = Math.abs(b - needle);

    if (aDiff == bDiff) return a > b ? a : b;
    else return bDiff < aDiff ? b : a;

  });
}
function Boolean2(elm) {
  return Boolean(elm !== null && elm !== undefined && elm !== "" && !Number.isNaN(elm) && elm != "Invalid Date" && (!Array.isArray(elm) || elm.length > 0) && elm || elm === 0);
}

function IncludesDuplicates(arr1, arr2) {
  const a1 = Array.isArray(arr1) ? arr1 : [];
  const a2 = Array.isArray(arr2) ? arr2 : [];

  return a1.some(item => a2.includes(item));
}

function throttle(anonymousFunction, limit) {
  let lastFunctionTimerId;
  let lastExecute;

  return function () {
    const context = this;
    const args = arguments;

    // 最初の1回はすぐ実行
    if (!lastExecute) {
      anonymousFunction.apply(context, args);
      lastExecute = Date.now();
      return;
    }

    clearTimeout(lastFunctionTimerId);
    lastFunctionTimerId = setTimeout(function () {
      anonymousFunction.apply(context, args);
      lastExecute = Date.now();
      // 1秒以上経過している場合は即実行、そうでなければ残り時間経過後に実行
    }, limit - (Date.now() - lastExecute));
  }
}