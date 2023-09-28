//リプレイ
var Replay = 0;
var mainWindow, settingWindow, tsunamiWindow, kmoniWorker;
var worker;
/* eslint-disable */
function replay(ReplayDate) {
  if (ReplayDate) {
    Replay = new Date() - new Date(ReplayDate);
  } else {
    Replay = 0;
  }
  EQDetect_List = [];
  EEW_nowList = [];
  if (worker) worker.postMessage({ action: "Replay", data: Replay });

  if (mainWindow) {
    mainWindow.webContents.send("message2", {
      action: "Replay",
      data: Replay,
    });
  }
  if (settingWindow) {
    settingWindow.webContents.send("message2", {
      action: "Replay",
      data: Replay,
    });
  }
}
/* eslint-enable */
//replay("2023/04/04 16:11:00"); //２か所同時
//replay("2023/03/11 05:12:30"); //２か所同時
//replay("2020/06/15 02:28:38");//２か所同時

// prettier-ignore
var EEWSectName = { 135: "宗谷支庁北部", 136: "宗谷支庁南部", 125: "上川支庁北部", 126: "上川支庁中部", 127: "上川支庁南部", 130: "留萌支庁中北部", 131: "留萌支庁南部", 139: "北海道利尻礼文", 150: "日高支庁西部", 151: "日高支庁中部", 152: "日高支庁東部", 145: "胆振支庁西部", 146: "胆振支庁中東部", 110: "檜山支庁", 105: "渡島支庁北部", 106: "渡島支庁東部", 107: "渡島支庁西部", 140: "網走支庁網走", 141: "網走支庁北見", 142: "網走支庁紋別", 165: "根室支庁北部", 166: "根室支庁中部", 167: "根室支庁南部", 160: "釧路支庁北部", 161: "釧路支庁中南部", 155: "十勝支庁北部", 156: "十勝支庁中部", 157: "十勝支庁南部", 119: "北海道奥尻島", 120: "空知支庁北部", 121: "空知支庁中部", 122: "空知支庁南部", 100: "石狩支庁北部", 101: "石狩支庁中部", 102: "石狩支庁南部", 115: "後志支庁北部", 116: "後志支庁東部", 117: "後志支庁西部", 200: "青森県津軽北部", 201: "青森県津軽南部", 202: "青森県三八上北", 203: "青森県下北", 230: "秋田県沿岸北部", 231: "秋田県沿岸南部", 232: "秋田県内陸北部", 233: "秋田県内陸南部", 210: "岩手県沿岸北部", 211: "岩手県沿岸南部", 212: "岩手県内陸北部", 213: "岩手県内陸南部", 220: "宮城県北部", 221: "宮城県南部", 222: "宮城県中部", 240: "山形県庄内", 241: "山形県最上", 242: "山形県村山", 243: "山形県置賜", 250: "福島県中通り", 251: "福島県浜通り", 252: "福島県会津", 300: "茨城県北部", 301: "茨城県南部", 310: "栃木県北部", 311: "栃木県南部", 320: "群馬県北部", 321: "群馬県南部", 330: "埼玉県北部", 331: "埼玉県南部", 332: "埼玉県秩父", 350: "東京都２３区", 351: "東京都多摩東部", 352: "東京都多摩西部", 354: "神津島", 355: "伊豆大島", 356: "新島", 357: "三宅島", 358: "八丈島", 359: "小笠原", 340: "千葉県北東部", 341: "千葉県北西部", 342: "千葉県南部", 360: "神奈川県東部", 361: "神奈川県西部", 420: "長野県北部", 421: "長野県中部", 422: "長野県南部", 410: "山梨県東部", 411: "山梨県中・西部", 412: "山梨県東部・富士五湖", 440: "静岡県伊豆", 441: "静岡県東部", 442: "静岡県中部", 443: "静岡県西部", 450: "愛知県東部", 451: "愛知県西部", 430: "岐阜県飛騨", 431: "岐阜県美濃東部", 432: "岐阜県美濃中西部", 460: "三重県北部", 461: "三重県中部", 462: "三重県南部", 370: "新潟県上越", 371: "新潟県中越", 372: "新潟県下越", 375: "新潟県佐渡", 380: "富山県東部", 381: "富山県西部", 390: "石川県能登", 391: "石川県加賀", 400: "福井県嶺北", 401: "福井県嶺南", 500: "滋賀県北部", 501: "滋賀県南部", 510: "京都府北部", 511: "京都府南部", 520: "大阪府北部", 521: "大阪府南部", 530: "兵庫県北部", 531: "兵庫県南東部", 532: "兵庫県南西部", 535: "兵庫県淡路島", 540: "奈良県", 550: "和歌山県北部", 551: "和歌山県南部", 580: "岡山県北部", 581: "岡山県南部", 590: "広島県北部", 591: "広島県南東部", 592: "広島県南西部", 570: "島根県東部", 571: "島根県西部", 575: "島根県隠岐", 560: "鳥取県東部", 562: "鳥取県中部", 563: "鳥取県西部", 600: "徳島県北部", 601: "徳島県南部", 610: "香川県東部", 611: "香川県西部", 620: "愛媛県東予", 621: "愛媛県中予", 622: "愛媛県南予", 630: "高知県東部", 631: "高知県中部", 632: "高知県西部", 700: "山口県北部", 701: "山口県東部", 702: "山口県西部", 710: "福岡県福岡", 711: "福岡県北九州", 712: "福岡県筑豊", 713: "福岡県筑後", 750: "大分県北部", 751: "大分県中部", 752: "大分県南部", 753: "大分県西部", 730: "長崎県北部", 731: "長崎県南西部", 732: "長崎県島原半島", 735: "長崎県対馬", 736: "長崎県壱岐", 737: "長崎県五島", 720: "佐賀県北部", 721: "佐賀県南部", 740: "熊本県阿蘇", 741: "熊本県熊本", 742: "熊本県球磨", 743: "熊本県天草・芦北", 760: "宮崎県北部平野部", 761: "宮崎県北部山沿い", 762: "宮崎県南部平野部", 763: "宮崎県南部山沿い", 770: "鹿児島県薩摩", 771: "鹿児島県大隅", 774: "鹿児島県十島村", 775: "鹿児島県甑島", 776: "鹿児島県種子島", 777: "鹿児島県屋久島", 778: "鹿児島県奄美北部", 779: "鹿児島県奄美南部", 800: "沖縄県本島北部", 801: "沖縄県本島中南部", 802: "沖縄県久米島", 803: "沖縄県大東島", 804: "沖縄県宮古島", 805: "沖縄県石垣島", 806: "沖縄県与那国島", 807: "沖縄県西表島" };
// prettier-ignore
var FERegions = {1: "米国、アラスカ州中央部",2: "米国、アラスカ州南部",3: "ベーリング海",4: "ロシア、コマンドル諸島",5: "アリューシャン列島ニア諸島",6: "アリューシャン列島ラット諸島",7: "アリューシャン列島アンドリアノフ諸島",8: "米国、プリビロフ諸島",9: "アリューシャン列島フォックス諸島",10: "米国、アラスカ州ユーニマク島",11: "米国、ブリストル湾",12: "米国、アラスカ半島",13: "米国、アラスカ州コディアク島",14: "米国、アラスカ州キーナイ半島",15: "アラスカ湾",16: "アリューシャン列島南方",17: "アラスカ州南方",18: "カナダ、ユーコン準州南部",19: "米国、アラスカ州南東部",20: "米国、アラスカ州南東部沖",21: "バンクーバー島西方",22: "カナダ、クイーンシャーロット諸島",23: "カナダ、ブリティッシュコロンビア州",24: "カナダ、アルバータ州",25: "カナダ、バンクーバー島",26: "米国、ワシントン州沖",27: "米国、ワシントン州沿岸",28: "米国、ワシントン／オレゴン州境",29: "米国、ワシントン州",30: "米国、オレゴン州沖",31: "米国、オレゴン州沿岸",32: "米国、オレゴン州",33: "米国、アイダホ州",34: "米国、カリフォルニア州北部沖",35: "米国、カリフォルニア州北部沿岸",36: "米国、カリフォルニア州北部",37: "米国、ネバダ州",38: "米国、カリフォルニア州沖",39: "米国、カリフォルニア州中部",40: "米国、カリフォルニア／ネバダ州境",41: "米国、ネバダ州",42: "米国、アリゾナ州",43: "米国、カリフォルニア州南部",44: "米国、カリフォルニア／アリゾナ州境",45: "カリフォルニア州（米国）／メキシコ国境",46: "アリゾナ州（米国）／ソノラ州（メキシコ）境",47: "メキシコ、バハカリフォルニア州西方沖",48: "メキシコ、バハカリフォルニア州",49: "メキシコ、カリフォルニア湾",50: "メキシコ、ソノラ州",51: "メキシコ中部沖",52: "メキシコ中部沿岸",53: "メキシコ、レビージャヒヘード諸島",54: "メキシコ、ハリスコ州沖",55: "メキシコ、ハリスコ州沿岸",56: "メキシコ、ミチョアカン州沿岸",57: "メキシコ、ミチョアカン州",58: "メキシコ、ゲレロ州沿岸",59: "メキシコ、ゲレロ州",60: "メキシコ、オアハカ州",61: "メキシコ、チアパス州",62: "メキシコ／グアテマラ国境",63: "メキシコ沖",64: "メキシコ、ミチョアカン州沖",65: "メキシコ、ゲレロ州沖",66: "メキシコ、オアハカ州沿岸",67: "メキシコ、オアハカ州沖",68: "メキシコ、チアパス州沖",69: "メキシコ、チアパス州沿岸",70: "グアテマラ",71: "グアテマラ沿岸",72: "ホンジュラス",73: "エルサルバドル",74: "ニカラグア沿岸",75: "ニカラグア",76: "中央アメリカ沖",77: "コスタリカ沖",78: "コスタリカ",79: "パナマ北方",80: "パナマ／コスタリカ国境",81: "パナマ",82: "パナマ／コロンビア国境",83: "パナマ南方",84: "メキシコ、ユカタン半島",85: "キューバ",86: "ジャマイカ",87: "ハイチ",88: "ドミニカ共和国",89: "モナ海峡",90: "プエルトリコ",91: "バージン諸島",92: "リワード諸島",93: "ベリーズ",94: "カリブ海",95: "ウィンドワード諸島",96: "コロンビア北岸",97: "ベネズエラ沿岸",98: "トリニダード・トバゴ",99: "コロンビア北部",100: "ベネズエラ、マラカイボ湖",101: "ベネズエラ",102: "コロンビア西岸",103: "コロンビア",104: "エクアドル沖",105: "エクアドル沿岸",106: "コロンビア／エクアドル国境",107: "エクアドル",108: "ペルー北部沖",109: "ペルー北部沿岸",110: "ペルー／エクアドル国境",111: "ペルー北部",112: "ペルー／ブラジル国境",113: "ブラジル、アマゾナス州",114: "ペルー沖",115: "ペルー沿岸",116: "ペルー中部",117: "ペルー南部",118: "ペルー／ボリビア国境",119: "ボリビア北部",120: "ボリビア中部",121: "チリ北部沖",122: "チリ北部沿岸",123: "チリ北部",124: "チリ／ボリビア国境",125: "ボリビア南部",126: "パラグアイ",127: "チリ／アルゼンチン国境",128: "アルゼンチン、フフイ州",129: "アルゼンチン、サルタ州",130: "アルゼンチン、カタマルカ州",131: "アルゼンチン、トゥクマン州",132: "アルゼンチン、サンティアゴデルエステロ州",133: "アルゼンチン北東部",134: "チリ中部沖",135: "チリ中部沿岸",136: "チリ中部",137: "アルゼンチン、サンフアン州",138: "アルゼンチン、ラリオハ州",139: "アルゼンチン、メンドサ州",140: "アルゼンチン、サンルイス州",141: "アルゼンチン、コルドバ州",142: "ウルグアイ",143: "チリ南部沖",144: "チリ南部",145: "チリ南部／アルゼンチン国境",146: "アルゼンチン南部",147: "ティエラデルフエゴ",148: "フォークランド諸島",149: "ドレーク海峡",150: "スコシア海",151: "サウスジョージア島",152: "サウスジョージア海膨",153: "サウスサンドウィッチ諸島",154: "サウスシェトランド諸島",155: "南極半島",156: "大西洋南西部",157: "ウェッデル海",158: "ニュージーランド、北島西方沖",159: "ニュージーランド、北島",160: "ニュージーランド、北島東方沖",161: "ニュージーランド、南島西方沖",162: "ニュージーランド、南島",163: "ニュージーランド、クック海峡",164: "ニュージーランド、南島東方沖",165: "マクオーリー島北方",166: "オークランド諸島",167: "マクオーリー島",168: "ニュージーランド南方",169: "サモア諸島",170: "サモア諸島",171: "フィジー諸島南方",172: "トンガ諸島西方",173: "トンガ諸島",174: "トンガ諸島",175: "トンガ諸島南方",176: "ニュージーランド北方",177: "ケルマデック諸島",178: "ケルマデック諸島",179: "ケルマデック諸島南方",180: "フィジー諸島北方",181: "フィジー諸島",182: "フィジー諸島",183: "サンタクルーズ諸島",184: "サンタクルーズ諸島",185: "バヌアツ諸島",186: "バヌアツ諸島",187: "ニューカレドニア",188: "ローヤリティー諸島",189: "ローヤリティー諸島南東方",190: "パプアニューギニア、ニューアイルランド",191: "ソロモン諸島北方",192: "パプアニューギニア、ニューブリテン",193: "ソロモン諸島",194: "パプアニューギニア、ダントルカストー",195: "ソロモン諸島南方",196: "インドネシア、パプア",197: "インドネシア、パプア北岸",198: "パプアニューギニア、ニーニゴー諸島",199: "パプアニューギニア、アドミラルティ",200: "パプアニューギニア、ニューギニア北岸",201: "インドネシア、パプア",202: "パプアニューギニア、ニューギニア",203: "ビスマルク海",204: "インドネシア、アルー諸島",205: "インドネシア、パプア南岸",206: "パプアニューギニア、ニューギニア南岸",207: "パプアニューギニア、ニューギニア東部",208: "アラフラ海",209: "パラオ",210: "マリアナ諸島南方",211: "本州南東方",212: "小笠原諸島",213: "硫黄列島",214: "マリアナ諸島西方",215: "マリアナ諸島",216: "マリアナ諸島",217: "ロシア、カムチャツカ半島",218: "ロシア、カムチャツカ半島東岸",219: "ロシア、カムチャツカ半島東方沖",220: "千島列島北西方",221: "千島列島",222: "千島列島東方",223: "日本海東部",224: "北海道",225: "北海道南東沖",226: "本州東部西岸",227: "本州東部",228: "本州東部東岸",229: "本州東方沖",230: "本州東部南岸",231: "韓国",232: "本州西部",233: "本州西部南岸",234: "南西諸島北西方",235: "九州",236: "四国",237: "四国南東方",238: "南西諸島",239: "南西諸島南東方",240: "小笠原諸島西方",241: "フィリピン海",242: "中国南東部沿岸",243: "台湾",244: "台湾",245: "台湾北東方",246: "南西諸島南西部",247: "台湾南東方",248: "フィリピン諸島",249: "フィリピン諸島、ルソン",250: "フィリピン諸島、ミンドロ",251: "フィリピン諸島、サマル",252: "フィリピン諸島、パラワン",253: "スールー海",254: "フィリピン諸島、パナイ",255: "フィリピン諸島、セブ",256: "フィリピン諸島、レイテ",257: "フィリピン諸島、ネグロス",258: "フィリピン諸島、スールー諸島",259: "フィリピン諸島、ミンダナオ",260: "フィリピン諸島東方",261: "カリマンタン",262: "セレベス海",263: "インドネシア、タラウド諸島",264: "インドネシア、ハルマヘラ北方",265: "インドネシア、スラウェシ、ミナハサ半島",266: "モルッカ海",267: "インドネシア、ハルマヘラ",268: "インドネシア、スラウェシ",269: "スラ諸島",270: "セラム海",271: "インドネシア、ブル",272: "インドネシア、セラム",273: "インドネシア、スマトラ南西方",274: "インドネシア、スマトラ南部",275: "ジャワ海",276: "スンダ海峡",277: "インドネシア、ジャワ",278: "バリ海",279: "フローレス海",280: "バンダ海",281: "インドネシア、タニンバル諸島",282: "インドネシア、ジャワ南方",283: "インドネシア、バリ",284: "インドネシア、バリ南方",285: "インドネシア、スンバワ",286: "インドネシア、フローレス",287: "インドネシア、スンバ",288: "サブ海",289: "ティモール島",290: "ティモール海",291: "インドネシア、スンバワ南方",292: "インドネシア、スンバ南方",293: "ティモール南方",294: "ミャンマー／インド国境",295: "ミャンマー／バングラデシュ国境",296: "ミャンマー",297: "ミャンマー／中国国境",298: "ミャンマー南岸",299: "アジア南東部",300: "中国、海南島",301: "南シナ海",302: "カシミール東部",303: "カシミール／インド境界",304: "カシミール／チベット自治区（中国）境界",305: "チベット自治区西部（中国）／インド国境",306: "チベット自治区（中国）",307: "中国、スーチョワン（四川）省",308: "インド北部",309: "ネパール／インド国境",310: "ネパール",311: "インド、シッキム州",312: "ブータン",313: "チベット自治区東部（中国）／インド国境",314: "インド南部",315: "インド／バングラデシュ国境",316: "バングラデシュ",317: "インド北東部",318: "中国、ユンナン（雲南）省",319: "ベンガル湾",320: "キルギス／シンチアンウイグル自治区（中国）国境",321: "中国、シンチアンウイグル自治区南部",322: "中国、カンスー（甘粛）省",323: "中国、ネイモンクー（内蒙古）自治区西部",324: "カシミール／シンチアンウイグル自治区（中国）境界",325: "中国、チンハイ（青海）省",326: "ロシア、シベリア南西部",327: "ロシア、バイカル湖",328: "ロシア、バイカル湖東方",329: "カザフスタン東部",330: "キルギス、イシククル湖",331: "カザフスタン／シンチアンウイグル自治区（中国）国境",332: "中国、シンチアンウイグル自治区北部",333: "ロシア／モンゴル国境",334: "モンゴル",335: "ロシア、ウラル山脈",336: "カザフスタン西部",337: "コーカサス",338: "カスピ海",339: "ウズベキスタン",340: "トルクメニスタン",341: "トルクメニスタン／イラン国境",342: "トルクメニスタン／アフガニスタン国境",343: "トルコ／イラン国境",344: "イラン／アルメニア／アゼルバイジャン国境",345: "イラン",346: "イラン／イラク国境",347: "イラン",348: "イラン",349: "アフガニスタン",350: "アフガニスタン",351: "アラビア半島東部",352: "ペルシャ湾",353: "イラン",354: "パキスタン南西部",355: "オマーン湾",356: "パキスタン沖",357: "ウクライナ／モルドバ／ロシア南西部",358: "ルーマニア",359: "ブルガリア",360: "黒海",361: "ウクライナ、クリミア",362: "コーカサス",363: "ギリシャ／ブルガリア国境",364: "ギリシャ",365: "エーゲ海",366: "トルコ",367: "トルコ／ジョージア／アルメニア国境",368: "ギリシャ南部",369: "ギリシャ、ドデカネス諸島",370: "ギリシャ、クレタ",371: "地中海東部",372: "キプロス",373: "死海",374: "ヨルダン／シリア",375: "イラク",376: "ポルトガル",377: "スペイン",378: "ピレネー山脈",379: "フランス南岸",380: "フランス、コルシカ",381: "イタリア中央部",382: "アドリア海",383: "バルカン半島北西部",384: "ジブラルタル西方",385: "ジブラルタル海峡",386: "スペイン、バレアレス諸島",387: "地中海西部",388: "イタリア、サルデーニャ",389: "ティレニア海",390: "イタリア南部",391: "アルバニア",392: "ギリシャ／アルバニア国境",393: "ポルトガル、マデイラ諸島",394: "スペイン、カナリア諸島",395: "モロッコ",396: "アルジェリア北部",397: "チュニジア",398: "イタリア、シチリア",399: "イオニア海",400: "地中海中央部",401: "リビア沿岸",402: "北大西洋",403: "大西洋中央海嶺北部",404: "アゾレス諸島",405: "アゾレス諸島",406: "大西洋中央海嶺中部",407: "アセンション島北方",408: "アセンション島",409: "南大西洋",410: "大西洋中央海嶺南部",411: "トリスタンダクーニャ諸島",412: "ブーヴェ島",413: "アフリカ南西方",414: "大西洋南東部",415: "アデン湾",416: "ソコトラ島",417: "アラビア海",418: "インド、ラクシャドウィープ",419: "ソマリア北東部",420: "北インド洋",421: "カールスバーグ海嶺",422: "モルディブ諸島",423: "ラカディブ海",424: "スリランカ",425: "南インド洋",426: "チャゴス諸島",427: "モーリシャス／レユニオン",428: "南西インド洋海嶺",429: "中央インド洋海嶺",430: "アフリカ南方",431: "南アフリカ、プリンスエドワード諸島",432: "クロゼ諸島",433: "ケルゲレン諸島",434: "ブロークン海嶺",435: "南東インド洋海嶺",436: "ケルゲレン海台南部",437: "オーストラリア南方",438: "カナダ、サスカチュワン州",439: "カナダ、マニトバ州",440: "ハドソン湾",441: "カナダ、オンタリオ州",442: "カナダ、ハドソン海峡",443: "カナダ、ケベック州北部",444: "デービス海峡",445: "カナダ、ラブラドル",446: "ラブラドル海",447: "カナダ、ケベック州南部",448: "カナダ、ガスペ半島",449: "カナダ、ケベック州東部",450: "カナダ、アンチコスチ島",451: "カナダ、ニューブランズウィック州",452: "カナダ、ノバスコシア州",453: "カナダ、プリンスエドワード島",454: "セントローレンス湾",455: "カナダ、ニューファンドランド",456: "米国、モンタナ州",457: "米国、アイダホ州",458: "米国、モンタナ州ヘブゲン湖",459: "米国、ワイオミング州イエローストーン",460: "米国、ワイオミング州",461: "米国、ノースダコタ州",462: "米国、サウスダコタ州",463: "米国、ネブラスカ州",464: "米国、ミネソタ州",465: "米国、アイオワ州",466: "米国、ウィスコンシン州",467: "米国、イリノイ州",468: "米国、ミシガン州",469: "米国、インディアナ州",470: "カナダ、オンタリオ州南部",471: "米国、オハイオ州",472: "米国、ニューヨーク州",473: "米国、ペンシルバニア州",474: "米国、バーモント／ニューハンプシャー州",475: "米国、メーン州",476: "米国、ニューイングランド南部",477: "米国、メーン湾",478: "米国、ユタ州",479: "米国、コロラド州",480: "米国、カンザス州",481: "米国、アイオワ／ミズーリ州境",482: "米国、ミズーリ／カンザス州境",483: "米国、ミズーリ州",484: "米国、ミズーリ／アーカンソー州境",485: "米国、ミズーリ／イリノイ州境",486: "米国、ミズーリ州",487: "米国、ミズーリ州",488: "米国、イリノイ州南部",489: "米国、インディアナ州南部",490: "米国、ケンタッキー州",491: "米国、ウェストバージニア州",492: "米国、バーニジア州",493: "米国、チェサピーク湾",494: "米国、ニュージャージー州",495: "米国、アリゾナ州",496: "米国、ニューメキシコ州",497: "米国、テキサス州北西部／オクラホマ州境",498: "米国、テキサス州西部",499: "米国、オクラホマ州",500: "米国、テキサス州中部",501: "米国、アーカンソー／オクラホマ州境",502: "米国、アーカンソー州",503: "米国、ルイジアナ／テキサス州境",504: "米国、ルイジアナ州",505: "米国、ミシシッピ州",506: "米国、テネシー州",507: "米国、アラバマ州",508: "米国、フロリダ州西部",509: "米国、ジョージア州",510: "米国、フロリダ／ジョージア州境",511: "米国、サウスカロライナ州",512: "米国、ノースカロライナ州",513: "米国東方沖",514: "米国、フロリダ半島",515: "バハマ諸島",516: "アリゾナ州（米国）／ソノラ州（メキシコ）境",517: "ニューメキシコ州（米国）／チワワ州（メキシコ）境",518: "テキサス州（米国）／メキシコ国境",519: "米国、テキサス州南部",520: "米国、テキサス州沿岸",521: "メキシコ、チワワ州",522: "メキシコ北部",523: "メキシコ中部",524: "メキシコ、ハリスコ州",525: "メキシコ、ベラクルス州",526: "メキシコ湾",527: "カンペチェ湾",528: "ブラジル",529: "ガイアナ",530: "スリナム",531: "仏領ギアナ",532: "アイルランド",533: "イギリス",534: "北海",535: "ノルウェー南部",536: "スウェーデン",537: "バルト海",538: "フランス",539: "ビスケー湾",540: "オランダ",541: "ベルギー",542: "デンマーク",543: "ドイツ",544: "スイス",545: "イタリア北部",546: "オーストリア",547: "チェコ及びスロバキア",548: "ポーランド",549: "ハンガリー",550: "アフリカ北西部",551: "アルジェリア南部",552: "リビア",553: "エジプト",554: "紅海",555: "アラビア半島西部",556: "チャド",557: "スーダン",558: "エチオピア",559: "アデン湾",560: "ソマリア北西部",561: "北西アフリカ南方沖",562: "カメルーン",563: "赤道ギニア",564: "中央アフリカ共和国",565: "ガボン",566: "コンゴ共和国",567: "コンゴ民主共和国",568: "ウガンダ",569: "ビクトリア湖",570: "ケニア",571: "ソマリア南部",572: "タンガニーカ湖",573: "タンザニア",574: "マダガスカル北西方",575: "アンゴラ",576: "ザンビア",577: "マラウイ",578: "ナミビア",579: "ボツワナ",580: "ジンバブエ",581: "モザンビーク",582: "モザンビーク海峡",583: "マダガスカル",584: "南アフリカ共和国",585: "レソト",586: "スワジランド",587: "南アフリカ沖",588: "オーストラリア北西方",589: "オーストラリア西方",590: "オーストラリア、ウェスタンオーストラリア",591: "オーストラリア、ノーザンテリトリー",592: "オーストラリア、サウスオーストラリア",593: "オーストラリア、カーペンタリア湾",594: "オーストラリア、クィーンズランド",595: "コーラル海",596: "ニューカレドニア北西方",597: "ニューカレドニア",598: "オーストラリア南西方",599: "オーストラリア南方沖",600: "オーストラリア南岸",601: "オーストラリア、ニューサウスウェールズ",602: "オーストラリア、ビクトリア",603: "オーストラリア南東岸",604: "オーストラリア東岸",605: "オーストラリア東方",606: "オーストラリア、ノーフォーク島",607: "ニュージーランド北西方",608: "オーストラリア、バス海峡",609: "オーストラリア、タスマニア",610: "オーストラリア南東方",611: "北太平洋",612: "ハワイ諸島",613: "ハワイ諸島",614: "ミクロネシア連邦",615: "マーシャル諸島",616: "マーシャル諸島",617: "マーシャル諸島",618: "キリバス、ギルバート諸島",619: "ジョンストン島",620: "キリバス、ライン諸島",621: "キリバス、パルミラ島",622: "キリバス、キリティマティ",623: "ツバル",624: "キリバス、フェニックス諸島",625: "トケラウ諸島",626: "クック諸島北部",627: "クック諸島",628: "ソシエテ諸島",629: "トゥブアイ諸島",630: "マルキーズ諸島",631: "トゥアモトウ諸島",632: "南太平洋",633: "ロモノソフ海嶺",634: "北極海",635: "グリーンランド（カラーリットヌナート）北岸",636: "グリーンランド（カラーリットヌナート）東部",637: "アイスランド",638: "アイスランド",639: "ヤンマイエン島",640: "グリーンランド海",641: "スバールバル北方",642: "ノルウェー海",643: "ノルウェー、スバールバル",644: "フランツヨーゼフランド北方",645: "ロシア、フランツヨーゼフランド",646: "ノルウェー北部",647: "バレンツ海",648: "ロシア、ノバヤゼムリャ",649: "カラ海",650: "ロシア、シベリア北西部沿岸",651: "セーベルナヤゼムリャ北方",652: "ロシア、セーベルナヤゼムリャ",653: "ロシア、シベリア北部沿岸",654: "セーベルナヤゼムリャ東方",655: "ラプテフ海",656: "ロシア、シベリア南東部",657: "ロシア東部／中国北東部国境",658: "中国北東部",659: "北朝鮮",660: "日本海",661: "ロシア、沿海地方",662: "ロシア、サハリン島",663: "オホーツク海",664: "中国南東部",665: "黄海",666: "中国南東部東方沖",667: "ノボシビルスク（ニューシベリアン）諸島北方",668: "ロシア、ノボシビルスク（ニューシベリアン）諸島",669: "東シベリア海",670: "ロシア、シベリア東部北岸",671: "ロシア、シベリア東部",672: "チュクチ海",673: "ベーリング海峡",674: "米国、セントローレンス島",675: "ボーフォート海",676: "米国、アラスカ北部",677: "カナダ、ユーコン準州北部",678: "カナダ、クイーンエリザベス諸島",679: "カナダ、ノースウェスト準州",680: "グリーンランド（カラーリットヌナート）西部",681: "バフィン湾",682: "カナダ、バフィン島",683: "中央太平洋南東部",684: "東太平洋海膨南部",685: "イースター島",686: "西チリ海膨",687: "チリ、ファンフェルナンデス群島",688: "ニュージーランド北島東方",689: "ニュージーランド、チャタム諸島",690: "チャタム諸島南方",691: "太平洋／南極海嶺",692: "太平洋南部",693: "中央太平洋東部",694: "東太平洋海嶺中部",695: "ガラパゴス諸島西方",696: "ガラパゴス諸島",697: "ガラパゴス諸島",698: "ガラパゴス諸島南西方",699: "ガラパゴス諸島南東方",700: "タスマニア南方",701: "マクオーリー島西方",702: "バレニー諸島",703: "インド、アンダマン諸島",704: "インド、ニコバル諸島",705: "インドネシア、スマトラ北部西方沖",706: "インドネシア、スマトラ北部",707: "マレー半島",708: "タイ湾",709: "アフガニスタン",710: "パキスタン",711: "カシミール南西部",712: "インド／パキスタン国境",713: "カザフスタン中部",714: "ウズベキスタン",715: "タジキスタン",716: "キルギス",717: "アフガニスタン／タジキスタン国境",718: "アフガニスタン、ヒンドゥークシ",719: "タジキスタン／シンチアンウイグル自治区（中国）境",720: "カシミール北西部",721: "フィンランド",722: "ノルウェー／ムルマンスク（ロシア）境",723: "フィンランド／カレリア共和国（ロシア）境",724: "バルト諸国／ベラルーシ／ロシア北西部",725: "ロシア、シベリア北西部",726: "ロシア、シベリア北・中部",727: "南極、ビクトリアランド",728: "ロス海",729: "南極大陸",730: "東太平洋海膨北部",731: "ホンジュラス北方",732: "サウスサンドウィッチ諸島東方",733: "タイ",734: "ラオス",735: "カンボジア",736: "ベトナム",737: "トンキン湾",738: "レイキャネス海嶺",739: "アゾレス／セントビンセント岬海嶺",740: "オーエン断裂帯",741: "インド洋三重会合点",742: "インド／南極海嶺西部",743: "西サハラ",744: "モーリタニア",745: "マリ",746: "セネガル／ガンビア",747: "ギニア",748: "シエラレオネ",749: "リベリア",750: "コートジボワール",751: "ブルキナファソ",752: "ガーナ",753: "ベナン／トーゴ",754: "ニジェール",755: "ナイジェリア",756: "イースター島南東方",757: "ガラパゴス三重会合点",};

const electron = require("electron");
const workerThreads = require("worker_threads");
const { app, BrowserWindow, ipcMain, net, Notification, shell, dialog, Menu, powerSaveBlocker } = electron;
const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const Store = require("electron-store");
var WebSocketClient = require("websocket").client;
var soft_version = require("../package.json").version;
const store = new Store();
var defaultConfigVal = {
  system: {
    crashReportAutoSend: "yes",
    WindowAutoOpen: true,
    alwaysOnTop: false,
  },
  home: {
    name: "自宅",
    latitude: 35.68,
    longitude: 139.767,
    Section: "東京都２３区",
    TsunamiSect: "東京湾内湾",
    ShowPin: true,
  },
  Info: {
    EEW: {
      showTraning: false,
      IntThreshold: 0,
      IntQuestion: true,
      IntType: "max",
    },
    EQInfo: {
      ItemCount: 15,
      Interval: 60000,
    },
    TsunamiInfo: {
      GetData: true,
    },
    RealTimeShake: {
      List: {
        ItemCount: 10,
      },
      DetectEarthquake: false,
    },
  },
  Source: {
    kmoni: {
      kmoni: {
        GetData: true,
        Interval: 1000,
      },
      lmoni: {
        GetData: true,
        Interval: 1000,
      },
    },
    msil: {
      GetData: true,
      Interval: 10000,
    },
    axis: {
      GetData: false,
      AccessToken: "",
    },
    wolfx: {
      GetData: true,
      Interval: 1000,
    },
    EarlyEst: {
      GetData: true,
      Interval: 20000,
    },
  },
  notice: {
    voice_parameter: {
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: "",
    },
    voice: {
      EEW: "緊急地震速報です。強い揺れに警戒してください。",
    },
  },
  color: {
    psWave: {
      PwaveColor: "rgb(48, 148, 255)",
      SwaveColor: "rgb(255, 62, 48)",
    },
    Shindo: {
      0: {
        background: "rgb(80, 86, 102)",
        color: "rgb(204, 204, 204)",
      },
      1: {
        background: "rgb(134, 168, 198)",
        color: "rgb(51, 51, 51)",
      },
      2: {
        background: "rgb(56, 120, 193)",
        color: "rgb(255, 255, 255)",
      },
      3: {
        background: "rgb(80, 186, 84)",
        color: "rgb(34, 34, 34)",
      },
      4: {
        background: "rgb(204, 209, 74)",
        color: "rgb(34, 34, 34)",
      },
      "5m": {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
      "5p": {
        background: "rgb(255, 91, 22)",
        color: "rgb(0, 0, 0)",
      },
      "6m": {
        background: "rgb(237, 0, 0)",
        color: "rgb(255, 255, 255)",
      },
      "6p": {
        background: "rgb(128, 9, 9)",
        color: "rgb(255, 255, 255)",
      },
      7: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "7p": {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
      "5p?": {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
    },
    LgInt: {
      1: {
        background: "rgb(80, 186, 84)",
        color: "rgb(34, 34, 34)",
      },
      2: {
        background: "rgb(231, 150, 21)",
        color: "rgb(0, 0, 0)",
      },
      3: {
        background: "rgb(237, 0, 0)",
        color: "rgb(255, 255, 255)",
      },
      4: {
        background: "rgb(196, 0, 222)",
        color: "rgb(255, 255, 255)",
      },
      "?": {
        background: "rgb(191, 191, 191)",
        color: "rgb(68, 68, 68)",
      },
    },
    Tsunami: {
      TsunamiMajorWarningColor: "rgb(200, 0, 255)",
      TsunamiWarningColor: "rgb(255, 40, 0)",
      TsunamiWatchColor: "rgb(250, 245, 0)",
      TsunamiYohoColor: "rgb(66, 158, 255)",
    },
  },
};
var config = store.get("config", defaultConfigVal);
config = mergeDeeply(defaultConfigVal, config);
store.set("config", config);

var psBlock;
var kmoniActive = false;
var kmoniTimeTmp = [];
var EEW_Data = []; //地震速報リスト
var EEW_nowList = []; //現在発報中リスト
var EEW_history = []; //起動中に発生したリスト
var EarlyEst_Data = []; //Earlyest地震速報リスト
var EarlyEst_history = []; //起動中に発生したリスト

var Yoyu = 250;
var yoyuK = (yoyuL = 2500);
var EEWNow = false;

var errorCountk = (errorCountkI = errorCountkEI = errorCountl = errorCountyw = errorCountye = 0);

var EQDetect_List = [];

var P2P_ConnectData;
var jmaXML_Fetched = [];
var nakn_Fetched = [];
var narikakun_URLs = [];
var narikakun_EIDs = [];
var eqInfo = { jma: [], usgs: [] };
var EQInfoFetchIndex = 0;
var tsunamiData;
var kmoniTimeout, lmoniTimeout;
var msil_lastTime = 0;
var kmoniEid;
var kmoniPointsDataTmp, SnetPointsDataTmp;
let tray;
var RevocationTimer;
var thresholds;

if (app.isPackaged) {
  //メニューバー非表示
  Menu.setApplicationMenu(false);

  //多重起動防止
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.exit(0);
  }
}

//アプリの更新を確認
var update_data;
var downloadURL;

function checkUpdate() {
  let request = net.request("https://api.github.com/repos/0quake/Zero-Quake/releases?_=" + Number(new Date()));

  request.on("response", (res) => {
    if (!300 <= res._responseHead.statusCode && !res._responseHead.statusCode < 200) {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = jsonParse(dataTmp);
          var latest_verTmp = String(json[0].tag_name.replace("v", ""));
          var p = require("../package.json");
          var current_verTmp = p.version;
          var latest_v = latest_verTmp.split(".");
          var current_v = current_verTmp.split(".");
          var dl_page = json[0].html_url;
          var update_detail = json[0].body;
          downloadURL = json[0].assets[0].browser_download_url;

          var update_available = false;
          if (latest_v[0] > current_v[0]) {
            update_available = true;
          } else if (latest_v[0] == current_v[0]) {
            if (latest_v[1] > current_v[1]) {
              update_available = true;
            } else if (latest_v[1] == current_v[1]) {
              if (latest_v[2] > current_v[2]) {
                update_available = true;

                var options4 = {
                  type: "question",
                  title: "アプリケーションの更新",
                  message: "Zero Quake で更新が利用可能です。",
                  detail: "v." + current_verTmp + " > v." + latest_verTmp + "\n操作を選択してください。[今すぐ更新]をすることをお勧めします。",
                  buttons: ["今すぐ更新", "詳細", "後で確認"],
                  noLink: true,
                };

                dialog.showMessageBox(mainWindow, options4).then(function (result) {
                  if (result.response == 0) {
                    if (downloadURL) doUpdate(downloadURL);
                  } else if (result.response == 1) {
                    setting_createWindow(true);
                  }
                });
              }
            }
          }

          update_data = { check_error: false, check_date: new Date(), latest_version: latest_verTmp, current_version: current_verTmp, update_available: update_available, dl_page: dl_page, update_detail: update_detail };
          if (settingWindow) {
            settingWindow.webContents.send("message2", {
              action: "Update_Data",
              data: update_data,
            });
          }
        } catch (err) {
          return;
        }
      });
    }
  });
  request.on("error", () => {
    var current_verTmp = soft_version;

    update_data = { check_error: true, check_date: new Date(), latest_version: null, current_version: current_verTmp, update_available: null, dl_page: null };
    if (settingWindow) {
      settingWindow.webContents.send("message2", {
        action: "Update_Data",
        data: update_data,
      });
    }
  });

  // リクエストの送信
  request.end();
}

function doUpdate(url) {
  var request = net.request(url);
  request.on("response", (res) => {
    res.pipe(fs.createWriteStream("ZeroQuakeInstaller.exe")).on("close", function () {
      var COMMAND = "start ZeroQuakeInstaller.exe";
      var spawn = require("child_process").spawn;
      spawn(COMMAND, [], { shell: true, detached: true, stdio: "inherit" });
      app.exit(0);
    });
  });
  request.end();
}

//定期実行
function ScheduledExecution() {
  checkUpdate();

  //axisのアクセストークン確認
  if (config.Source.axis.GetData) {
    var request = net.request("https://axis.prioris.jp/api/token/refresh/?token=" + config.Source.axis.AccessToken);
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = jsonParse(dataTmp);
          if (json.status == "generate a new token") {
            //トークン更新
            if (json.token) {
              config.Source.axis.AccessToken = String(json.token);
              store.set("config", config);
              Window_notification("Axisのアクセストークンを更新しました。", "info");
            }
          } else if (json.status == "contract has expired") {
            //トークン期限切れ
            config.Source.axis.GetData = false;
            store.set("config", config);
            Window_notification("Axisのアクセストークンの期限が切れました。手動でトークンを更新しください。", "warn");
          } else if (json.status == "invalid header authorization") {
            config.Source.axis.GetData = false;
            store.set("config", config);
            Window_notification("Axisのアクセストークンが不正です。", "error");
          }
        } catch (err) {
          return;
        }
      });
    });

    request.end();
  }
  setTimeout(ScheduledExecution, 1800000);
}

//準備完了イベント
app.whenReady().then(() => {
  //ウィンドウ作成
  worker_createWindow();
  //定期実行着火
  ScheduledExecution();

  if (config.system.WindowAutoOpen) {
    createWindow();
    app.on("activate", () => {
      // メインウィンドウが消えている場合は再度メインウィンドウを作成する
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }

  //初期化処理
  start();
});

let options = {
  type: "error",
  title: "エラー",
  message: "予期しないエラーが発生しました",
  detail: "動作を選択してください。\n10秒で自動的に再起動します。",
  buttons: ["今すぐ再起動", "終了", "キャンセル"],
  noLink: true,
};
const options2 = {
  type: "question",
  title: "エラー情報の送信",
  message: "エラー情報を送信しますか",
  detail: "情報は今後のバグ改善に活用します。個人を特定できる情報を送信することはありません。\nご協力をお願いします。",
  buttons: ["送信", "送信しない"],
  checkboxLabel: "選択を記憶",
  noLink: true,
};
const options3 = {
  type: "error",
  title: "エラー",
  message: "エラー情報の送信に失敗しました。",
  detail: "",
  buttons: ["OK"],
};
var relaunchTimer;
var errorMsgBox = false;
//エラーイベント
process.on("uncaughtException", function (err) {
  if (!errorMsgBox && app.isReady()) {
    if (String(err.stack).startsWith("Error: net::ERR_")) return false;
    errorMsgBox = true;
    options.detail = "動作を選択してください。\n10秒で自動的に再起動します。\nエラーコードは以下の通りです。\n" + err.stack;

    dialog.showMessageBox(mainWindow, options).then(function (result) {
      clearTimeout(relaunchTimer);
      if (config.system.crashReportAutoSend == "yes") {
        crashReportSend(err.stack, result);
        errorMsgBox = false;
      } else if (config.system.crashReportAutoSend == "no") {
        errorResolve(result.response);
        errorMsgBox = false;
      } else {
        dialog.showMessageBox(mainWindow, options2).then(function (result2) {
          if (result2.checkboxChecked) {
            config.system.crashReportAutoSend = result2.response == 0 ? "yes" : "no";
            store.set("config", config);
          }
          if (result2.response == 0) {
            crashReportSend(err.stack, result);
            errorMsgBox = false;
          } else {
            errorResolve(result.response);
          }
        });
      }
    });
    clearTimeout(relaunchTimer);
    relaunchTimer = setTimeout(function () {
      app.relaunch();
      app.exit(0);
    }, 10000);

    Window_notification("予期しないエラーが発生しました。", "error");
  }
});
//エラー処理
function errorResolve(response) {
  switch (response) {
    case 0:
      app.relaunch();
      app.exit(0);
      break;
    case 1:
      app.exit(0);
      break;
    case 2:
      clearTimeout(relaunchTimer);
      break;
    default:
      break;
  }
}
//クラッシュレポートの送信
function crashReportSend(errMsg, result) {
  let request = net.request("https://zeroquake.wwww.jp/crashReport/?errorMsg=" + encodeURI(errMsg) + "&soft_version=" + encodeURI(soft_version));

  request.on("error", () => {
    dialog.showMessageBox(mainWindow, options3).then(function () {
      errorResolve(result.response);
    });
  });
  request.on("response", (res) => {
    if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
      dialog.showMessageBox(mainWindow, options3).then(function () {
        errorResolve(result.response);
      });
    } else {
      errorResolve(result.response);
    }
  });
  // リクエストの送信
  request.end();
}

//アプリのロード完了イベント
electron.app.on("ready", () => {
  //タスクトレイアイコン
  tray = new electron.Tray(`${__dirname}/img/icon.${process.platform === "win32" ? "ico" : "png"}`);
  tray.setToolTip("Zero Quake");
  tray.setContextMenu(
    electron.Menu.buildFromTemplate([
      {
        label: "画面の表示",
        click: () => {
          createWindow();
        },
      },
      {
        label: "設定画面標準",
        click: () => {
          setting_createWindow();
        },
      },
      {
        type: "separator",
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
    createWindow();
  });
});

//レンダラープロセスからのメッセージ
ipcMain.on("message", (_event, response) => {
  if (response.action == "kmoniReturn") {
    kmoniControl(response.data, response.date);
  } else if (response.action == "SnetReturn") {
    SnetControl(response.data, response.date);
  } else if (response.action == "kmoniEstShindoReturn") {
    estShindoControl(response);
  } else if (response.action == "settingWindowOpen") {
    setting_createWindow();
  } else if (response.action == "TsunamiWindowOpen") {
    tsunami_createWindow();
  } else if (response.action == "EQInfoWindowOpen") {
    EQInfo_createWindow(response);
  } else if (response.action == "EQInfoWindowOpen_website") {
    EQInfo_createWindowWS(response);
  } else if (response.action == "openAtLogin") {
    app.setLoginItemSettings({
      openAtLogin: response.data,
    });
  } else if (response.action == "settingReturn") {
    config = response.data;
    store.set("config", config);

    settingWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });
  } else if (response.action == "checkForUpdate") {
    checkUpdate();
  } else if (response.action == "tsunamiReqest") {
    if (tsunamiData) {
      mainWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: tsunamiData,
      });
    }
  } else if (response.action == "mapLoaded") {
    if (kmoniPointsDataTmp) {
      mainWindow.webContents.send("message2", kmoniPointsDataTmp);
    }
    if (SnetPointsDataTmp) {
      mainWindow.webContents.send("message2", SnetPointsDataTmp);
    }
    if (P2P_ConnectData) {
      mainWindow.webContents.send("message2", P2P_ConnectData);
    }
  } else if (response.action == "replay") {
    replay(response.date);
  } else if (response.action == "startInstall") {
    if (downloadURL) doUpdate(downloadURL);
  }
});

//メインウィンドウ表示処理
function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isFocused()) mainWindow.focus();
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  } else {
    mainWindow = new BrowserWindow({
      minWidth: 450,
      minHeight: 400,
      webPreferences: {
        preload: path.join(__dirname, "js/preload.js"),
        title: "Zero Quake",
        icon: path.join(__dirname, "img/icon.ico"),
        backgroundThrottling: false,
      },
      backgroundColor: "#202227",
      alwaysOnTop: config.system.alwaysOnTop,
    });
    if (Replay !== 0) {
      mainWindow.webContents.send("message2", {
        action: "Replay",
        data: Replay,
      });
    }

    mainWindow.webContents.on("did-finish-load", () => {
      if (notifyData) {
        mainWindow.webContents.send("message2", notifyData);
      }

      if (Replay !== 0) {
        mainWindow.webContents.send("message2", {
          action: "Replay",
          data: Replay,
        });
      }

      kmoniTimeTmp.forEach(function (elm) {
        mainWindow.webContents.send("message2", {
          action: "kmoniTimeUpdate",
          Updatetime: elm.Updatetime,
          LocalTime: elm.LocalTime,
          type: elm.type,
          condition: "success",
        });
      });

      mainWindow.webContents.send("message2", {
        action: "setting",
        data: config,
      });

      if (EEWNow) {
        mainWindow.webContents.send("message2", {
          action: "EEWAlertUpdate",
          data: EEW_nowList,
        });
        if (estShindoTmp) {
          mainWindow.webContents.send("message2", estShindoTmp);
        }
      }

      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: "jma",
        data: eqInfo.jma.slice(0, config.Info.EQInfo.ItemCount),
      });
      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: "usgs",
        data: eqInfo.usgs.slice(0, config.Info.EQInfo.ItemCount),
      });

      var threshold01Tmp;
      EQDetect_List.forEach(function (elm) {
        if (elm.isCity) {
          threshold01Tmp = thresholds.threshold01C;
        } else {
          threshold01Tmp = thresholds.threshold01;
        }

        if (elm.Codes.length >= threshold01Tmp) {
          mainWindow.webContents.send("message2", {
            action: "EQDetect",
            data: elm,
          });
        }
      });

      if (P2P_ConnectData) {
        mainWindow.webContents.send("message2", P2P_ConnectData);
      }

      if (kmoniPointsDataTmp) {
        mainWindow.webContents.send("message2", kmoniPointsDataTmp);
      }
      if (SnetPointsDataTmp) {
        mainWindow.webContents.send("message2", SnetPointsDataTmp);
      }
    });

    mainWindow.loadFile("src/index.html");

    mainWindow.on("close", (event) => {
      event.preventDefault();
      mainWindow.hide();
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
}
//ワーカーウィンドウ表示処理
function worker_createWindow() {
  if (kmoniWorker) {
    kmoniWorker.close();
  }
  kmoniWorker = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
    },
    backgroundThrottling: false,
    show: false,
    alwaysOnTop: config.system.alwaysOnTop,
  });
  kmoniWorker.on("close", () => {
    kmoniWorker = null;
  });
  kmoniWorker.webContents.on("did-finish-load", () => {
    kmoniWorker.webContents.send("message2", {
      action: "setting",
      data: config,
    });
  });
  kmoniWorker.loadFile("src/kmoniWorker.html");
  kmoniActive = new Date();
}
//設定ウィンドウ表示処理
function setting_createWindow(update) {
  if (settingWindow) {
    if (settingWindow.isMinimized()) settingWindow.restore();
    if (!settingWindow.isFocused()) settingWindow.focus();
    return false;
  }

  settingWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "設定 - Zero Quake",
      parent: mainWindow,
      center: true,
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#202227",
    alwaysOnTop: config.system.alwaysOnTop,
  });
  if (Replay !== 0) {
    settingWindow.webContents.send("message2", {
      action: "Replay",
      data: Replay,
    });
  }

  settingWindow.webContents.on("did-finish-load", () => {
    if (Replay !== 0) {
      settingWindow.webContents.send("message2", {
        action: "Replay",
        data: Replay,
      });
    }

    settingWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });
    settingWindow.webContents.send("message2", {
      action: "softVersion",
      data: soft_version,
    });
    settingWindow.webContents.send("message2", {
      action: "openAtLogin",
      data: app.getLoginItemSettings().openAtLogin,
    });
    if (update_data) {
      settingWindow.webContents.send("message2", {
        action: "Update_Data",
        data: update_data,
      });
    }
    if (update) {
      settingWindow.webContents.send("message2", {
        action: "updatePanel",
      });
    }
  });
  settingWindow.on("closed", () => {
    settingWindow = null;
  });

  settingWindow.loadFile("src/settings.html");
  const handleUrlOpen = (e, url) => {
    if (url.match(/^http/)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };
  settingWindow.webContents.on("will-navigate", handleUrlOpen);
  settingWindow.webContents.on("new-window", handleUrlOpen);
}
//津波情報ウィンドウ表示処理
function tsunami_createWindow() {
  if (tsunamiWindow) {
    if (tsunamiWindow.isMinimized()) tsunamiWindow.restore();
    if (!tsunamiWindow.isFocused()) tsunamiWindow.focus();
    return false;
  }
  tsunamiWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "津波詳細情報 - Zero Quake",
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#202227",
    alwaysOnTop: config.system.alwaysOnTop,
  });

  tsunamiWindow.webContents.on("did-finish-load", () => {
    tsunamiWindow.webContents.send("message2", {
      action: "setting",
      data: config,
    });
    tsunamiWindow.webContents.send("message2", {
      action: "tsunamiUpdate",
      data: tsunamiData,
    });
  });
  tsunamiWindow.loadFile("src/TsunamiDetail.html");

  tsunamiWindow.on("closed", () => {
    tsunamiWindow = null;
  });
}
//地震情報ウィンドウ表示処理
var EQI_Window = {};
const handleUrlOpen = (e, url) => {
  if (url.match(/^http/)) {
    e.preventDefault();
    shell.openExternal(url);
  }
};
function EQInfo_createWindow(response) {
  var EQInfoWindowT = EQI_Window[response.eid];
  if (EQInfoWindowT) {
    if (EQInfoWindowT.window.isMinimized()) EQInfoWindowT.window.restore();
    if (!EQInfoWindowT.window.isFocused()) EQInfoWindowT.window.focus();
    return;
  }

  var EQInfoWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, "js/preload.js"),
      title: "地震詳細情報 - Zero Quake",
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#202227",
    alwaysOnTop: config.system.alwaysOnTop,
  });

  var EEWDataItem = EEW_Data.find(function (elm) {
    return elm.EQ_id == response.eid;
  });
  var metadata = {
    action: "metaData",
    eid: response.eid,
    urls: response.urls,
    eew: EEWDataItem,
    axisData: response.axisData,
  };
  EQI_Window[response.eid] = { window: EQInfoWindow, metadata: metadata };

  EQI_Window[response.eid].window.webContents.on("did-finish-load", () => {
    EQI_Window[response.eid].window.webContents.send("message2", {
      action: "setting",
      data: config,
    });

    EQI_Window[response.eid].window.webContents.send("message2", metadata);
  });

  EQI_Window[response.eid].window.on("closed", () => {
    EQI_Window[response.eid] = null;
  });

  EQI_Window[response.eid].window.loadFile(response.url);
  EQI_Window[response.eid].window.webContents.on("will-navigate", handleUrlOpen);
  EQI_Window[response.eid].window.webContents.on("new-window", handleUrlOpen);
}

function EQInfo_createWindowWS(response) {
  var EQInfoWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    webPreferences: {
      title: "地震詳細情報 - Zero Quake",
      icon: path.join(__dirname, "img/icon.ico"),
    },
    backgroundColor: "#FFFFFF",
    alwaysOnTop: config.system.alwaysOnTop,
  });

  EQInfoWindow.loadURL(response.url);
}

//開始処理
function start() {
  //↓接続処理
  P2P_WS();
  AXIS_WS();

  SnetRequest();

  kmoniRequest();
  wolfxRequest();
  lmoniRequest();
  yoyuSetK(function () {
    kmoniRequest();
  });
  yoyuSetL(function () {
    lmoniRequest();
  });
  //↑接続処理

  //地震情報
  eqInfoUpdate();

  //定期実行発火
  RegularExecution();
  earlyEstReq();
}

function ConvertJST(time) {
  return new Date(time.setHours(time.getHours() + 9));
}
function earlyEstReq() {
  if (config.Source.EarlyEst.GetData) {
    var request = net.request("http://early-est.rm.ingv.it/monitor.xml");
    request.on("response", (res) => {
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        NetworkError(res._responseHead.statusCode, "Early-est");
        kmoniTimeUpdate(new Date() - Replay, "Early-est", "Error");
      } else {
        var dataTmp = "";
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          try {
            let parser = new new JSDOM().window.DOMParser();
            let doc = parser.parseFromString(dataTmp, "text/xml");
            doc.querySelectorAll("eventParameters event").forEach(function (elm) {
              var data = {
                alertflg: "EarlyEst",
                EventID: 901471985000000000000 + Number(String(elm.getAttribute("publicID")).slice(-12)), //気象庁EIDと確実に区別するため、EarlyEstのIPアドレスと連結,
                serial: Number(elm.querySelector("origin quality").getElementsByTagName("ee:report_count")[0].textContent) + 1,
                report_time: ConvertJST(new Date(elm.querySelector("creationInfo creationTime").textContent)),
                magnitude: Number(elm.querySelector("magnitude mag value").textContent),
                depth: Number(elm.querySelector("origin depth value").textContent) / 1000,
                latitude: Number(elm.querySelector("origin latitude value").textContent),
                longitude: Number(elm.querySelector("origin longitude value").textContent),
                region_name: elm.querySelector("origin region").textContent,
                origin_time: ConvertJST(new Date(elm.querySelector("origin time value").textContent)),
                source: "EarlyEst",
              };
              EarlyEstControl(data);
            });
            kmoniTimeUpdate(new Date() - Replay, "Early-est", "success");
          } catch (err) {
            NetworkError(err, "Early-est");
            kmoniTimeUpdate(new Date() - Replay, "Early-est", "Error");
          }
        });
      }
    });
    request.on("error", (error) => {
      NetworkError(error, "Early-est");
      kmoniTimeUpdate(new Date() - Replay, "Early-est", "Error");
    });

    request.end();
  }
  setTimeout(earlyEstReq, config.Source.EarlyEst.Interval);
}

worker = new workerThreads.Worker(path.join(__dirname, "js/EQDetectWorker.js"), {
  workerData: "From Main", // Worker に初期値を渡せる
});
worker.on("message", (message) => {
  switch (message.action) {
    case "EQDetectAdd":
      var EQD_ItemTmp = message.data;

      if (EQD_ItemTmp.maxPGA > 1.3) {
        var LvTmp = 2;
      } else {
        var LvTmp = 1;
      }

      if (EQD_ItemTmp.showed) {
        if (LvTmp == 2) {
          if (EQD_ItemTmp.Lv == 1) soundPlay("EQDetectLv2");
        }
      } else {
        if (LvTmp == 2) {
          soundPlay("EQDetectLv2");
        } else {
          soundPlay("EQDetectLv1");
        }
        createWindow();
      }
      EQD_ItemTmp.Lv = LvTmp;
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EQDetect",
          data: message.data,
        });
      }

      break;
    case "sendDataToMainWindow":
      if (mainWindow) {
        mainWindow.webContents.send("message2", message.data);
      }
      break;
    case "sendDataToKmoniWorker":
      if (kmoniWorker) {
        kmoniWorker.webContents.send("message2", message.data);
      }
      break;
    case "EQDetect_List_Update":
      EQDetect_List = message.data;
      break;
    case "thresholds":
      thresholds = message.data;
      break;
    case "PointsData_Update":
      kmoniPointsDataTmp = {
        action: "kmoniUpdate",
        Updatetime: new Date(message.date),
        LocalTime: new Date(),
        data: message,
      };
      if (mainWindow) {
        mainWindow.webContents.send("message2", kmoniPointsDataTmp);
      }
      break;

    default:
      break;
  }
});
worker.on("error", (error) => {
  throw new Error("地震検知ワーカーでエラー発生:\n" + error);
});

//強震モニタリアルタイム揺れ情報処理（地震検知など）
function kmoniControl(data, date) {
  kmoniActive = new Date();

  worker.postMessage({ action: "EQDetect", data: data, date: date, detect: config.Info.RealTimeShake.DetectEarthquake });
}

//海しるリアルタイム揺れ情報処理
function SnetControl(data, date) {
  SnetPointsDataTmp = {
    action: "SnetUpdate",
    Updatetime: new Date(date),
    LocalTime: new Date(),
    data: { data: data, changedData: data },
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", SnetPointsDataTmp);
  }
}

var estShindoTmp;
var estShindoTmp;
//強震モニタ予想震度処理
function estShindoControl(response) {
  if (!estShindoTmp || estShindoTmp.eid !== response.eid || estShindoTmp.serial !== response.serial) {
    estShindoTmp = {
      action: "EstShindoUpdate",
      data: response.data,
      eid: response.eid,
      serial: response.serial,
    };
    if (mainWindow) {
      mainWindow.webContents.send("message2", estShindoTmp);
    }
  }
}

//var kmoniEstShindoData;
var kmoniEEW_url = true;
var kmoniI_url = 0;
//強震モニタへのHTTPリクエスト
function kmoniRequest() {
  if (net.online && config.Source.kmoni.kmoni.GetData) {
    var ReqTime = new Date() - yoyuK - Replay;

    var urlTmp = kmoniEEW_url ? "http://www.kmoni.bosai.go.jp/webservice/hypo/eew/" + dateEncode(1, ReqTime) + ".json" : "https://smi.lmoniexp.bosai.go.jp/webservice/hypo/eew/" + dateEncode(1, ReqTime) + ".json";
    var request = net.request(urlTmp);
    request.on("response", (res) => {
      var dataTmp = "";
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        errorCountk++;
        if (errorCountk > 3) {
          errorCountk = 0;
          kmoniEEW_url = !kmoniEEW_url;
        }
        NetworkError(res._responseHead.statusCode, "強震モニタ");
        kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
      } else {
        errorCountk = 0;
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          var json = jsonParse(dataTmp);
          if (json) {
            EEWdetect(2, json, 1);
          }
        });
      }
    });
    request.on("error", (error) => {
      NetworkError(error, "強震モニタ");
      kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
    });

    request.end();

    if (kmoniI_url != 2 || dateEncode(1, ReqTime) % 2 == 0) {
      var urlTmp = ["https://smi.lmoniexp.bosai.go.jp/data/map_img/RealTimeImg/jma_s/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".jma_s.gif", "http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/jma_s/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".jma_s.gif"][kmoniI_url];

      var request = net.request(urlTmp);
      request.on("response", (res) => {
        var dataTmp = [];
        res.on("data", (chunk) => {
          dataTmp.push(chunk);
        });
        res.on("end", () => {
          try {
            if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
              errorCountkI++;
              if (errorCountkI > 3) {
                errorCountkI = 0;
                kmoniI_url++;
                if (kmoniI_url > 2) kmoniI_url = 0;
              }
              kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
            } else {
              errorCountkI = 0;
              var bufTmp = Buffer.concat(dataTmp);
              if (kmoniWorker) {
                kmoniWorker.webContents.send("message2", {
                  action: "KmoniImgUpdate",
                  data: "data:image/gif;base64," + bufTmp.toString("base64"),
                  date: ReqTime,
                });
              }
            }
          } catch (err) {
            kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
          }
        });
      });
      request.end();
    }
  }
  if (kmoniEid && kmoniEI_URL) kmoniEstShindoRequest();

  if (kmoniTimeout) clearTimeout(kmoniTimeout);
  kmoniTimeout = setTimeout(kmoniRequest, config.Source.kmoni.kmoni.Interval);
}
var kmoniEI_URL = true;
//var kmoniEidT, kmoniRNumT;
function kmoniEstShindoRequest() {
  /*
  if (kmoniEid == kmoniEidT && kmoniRNum == kmoniRNumT) return;
  kmoniEid = kmoniEidT;
  kmoniRNum = kmoniRNumT;
  var ReqTime = new Date() - yoyuK - Replay;

  var urlTmp = kmoniEI_URL ? "http://www.kmoni.bosai.go.jp/data/map_img/EstShindoImg/eew/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".eew.gif" : "https://smi.lmoniexp.bosai.go.jp/data/map_img/EstShindoImg/eew/" + dateEncode(2, ReqTime) + "/" + dateEncode(1, ReqTime) + ".eew.gif";
  var request = net.request(urlTmp);
  request.on("response", (res) => {
    var dataTmp = [];
    res.on("data", (chunk) => {
      dataTmp.push(chunk);
    });
    res.on("end", () => {
      try {
        if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
          errorCountkEI++;
          if (errorCountkEI > 3) {
            errorCountkEI = 0;
            kmoniEI_URL = !kmoniEI_URL;
          }
          kmoniTimeUpdate(new Date() - Replay, "kmoni", "Error");
        } else {
          var bufTmp = Buffer.concat(dataTmp);
          if (kmoniWorker) {
            var kmoniEstShindoDataTmp = "data:image/gif;base64," + bufTmp.toString("base64");
            if (kmoniEstShindoDataTmp !== kmoniEstShindoData) {
              kmoniEstShindoData = kmoniEstShindoDataTmp;
              kmoniWorker.webContents.send("message2", {
                action: "KmoniEstShindoImgUpdate",
                data: kmoniEstShindoData,
                eid: kmoniEid,
                serial: kmoniRNum,
              });
            }
          }
        }
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "強震モニタ(画像)");
  });
  request.end();
  */
}

//長周期地震動モニタへのHTTPリクエスト
function lmoniRequest() {
  if (net.online && config.Source.kmoni.lmoni.GetData) {
    var request = net.request("https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/" + dateEncode(1, new Date() - yoyuL - Replay) + ".json");
    request.on("response", (res) => {
      var dataTmp = "";
      if (300 <= res._responseHead.statusCode || res._responseHead.statusCode < 200) {
        NetworkError(res._responseHead.statusCode, "長周期地震動モニタ");
        kmoniTimeUpdate(new Date() - Replay, "Lmoni", "Error");
      } else {
        errorCountl = 0;
        res.on("data", (chunk) => {
          dataTmp += chunk;
        });
        res.on("end", function () {
          var json = jsonParse(dataTmp);
          EEWdetect(2, json, 2);
        });
      }
    });
    request.on("error", (error) => {
      NetworkError(error, "長周期地震動モニタ");
      kmoniTimeUpdate(new Date() - Replay, "Lmoni", "Error");
    });

    request.end();
  }
  if (kmoniEid && !kmoniEI_URL) kmoniEstShindoRequest();

  if (lmoniTimeout) clearTimeout(lmoniTimeout);
  lmoniTimeout = setTimeout(lmoniRequest, config.Source.kmoni.lmoni.Interval);
}

//海しるへのHTTPリクエスト処理
function SnetRequest() {
  if (net.online && config.Source.msil.GetData) {
    var request = net.request("https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer/query?f=json&returnGeometry=false&outFields=msilstarttime%2Cmsilendtime&_=" + new Date());
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        var json = jsonParse(dataTmp);
        if (!json || !json.features || !Array.isArray(json.features)) return false;
        var dateTime = 0;
        var NowDateTime = Number(new Date() - Replay);
        json.features.forEach(function (elm) {
          if (NowDateTime - dateTime > NowDateTime - elm.attributes.msilstarttime && NowDateTime >= elm.attributes.msilstarttime) {
            dateTime = Number(elm.attributes.msilstarttime);
          }
        });
        if (msil_lastTime < dateTime) {
          var request = net.request("https://www.msil.go.jp/arcgis/rest/services/Msil/DisasterPrevImg1/ImageServer//exportImage?f=image&time=" + dateTime + "%2C" + dateTime + "&bbox=13409547.546603577%2C2713376.239114911%2C16907305.960932314%2C5966536.162931148&size=400%2C400");
          request.on("response", (res) => {
            var dataTmp = [];
            res.on("data", (chunk) => {
              dataTmp.push(chunk);
            });
            res.on("end", () => {
              try {
                var bufTmp = Buffer.concat(dataTmp);
                if (kmoniWorker) {
                  var ReqTime = new Date(dateTime);
                  kmoniWorker.webContents.send("message2", {
                    action: "SnetImgUpdate",
                    data: "data:image/png;base64," + bufTmp.toString("base64"),
                    date: ReqTime,
                  });
                }
              } catch (err) {
                kmoniTimeUpdate(new Date() - Replay, "Lmoni", "Error");
              }
            });
          });
          request.end();

          msil_lastTime = dateTime;
        }
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "海しる");
      kmoniTimeUpdate(new Date() - Replay, "Lmoni", "Error");
    });

    request.end();
  }
  setTimeout(function () {
    SnetRequest();
  }, config.Source.msil.Interval);
}

//wolfxへのHTTPリクエスト処理
var wolfx_lastUpdate = 0;
function wolfxRequest() {
  if (config.Source.wolfx.GetData && net.isOnline) {
    var request = net.request("https://api.wolfx.jp/jma_eew.json?_=" + new Date());
    request.on("response", (res) => {
      var dataTmp = "";
      res.on("data", (chunk) => {
        dataTmp += chunk;
      });
      res.on("end", function () {
        try {
          var json = jsonParse(dataTmp);
          if (json && (wolfx_lastUpdate < new Date(json.AnnouncedTime) || Replay)) {
            wolfx_lastUpdate = json.AnnouncedTime;
            var EBIData = [];
            EBIStr = json.OriginalText.split("EBI ")[1];
            if (EBIStr) {
              EBIStr = EBIStr.split("ECI")[0].split("EII")[0].split(" 9999=")[0];
              EBIStr = EBIStr.split(" ");
              if (EBIStr.length % 4 == 0) {
                for (let i = 0; i < EBIStr.length; i += 4) {
                  var sectName = EEWSectName[EBIStr[i]];
                  var maxInt = EBIStr[i + 1].substring(1, 3);
                  var minInt = EBIStr[i + 1].substring(3, 5);
                  minInt = minInt == "//" ? null : shindoConvert(minInt, 0);
                  maxInt = maxInt == "//" ? null : shindoConvert(maxInt, 0);
                  var arrivalTime = EBIStr[i + 2];
                  arrivalTime = arrivalTime.substring(0, 2) + ":" + arrivalTime.substring(2, 4) + ":" + arrivalTime.substring(4, 6);
                  arrivalTime = new Date(dateEncode(4, null) + " " + arrivalTime);

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
              } else throw new Error("予想震度等のデコードでエラー");
            }
            var EEWdata = {
              alertflg: json.isWarn ? "警報" : "予報",
              EventID: Number(json.EventID),
              serial: json.Serial,
              report_time: new Date(json.AnnouncedTime),
              magnitude: json.Magunitude,
              maxInt: shindoConvert(json.MaxIntensity, 0),
              depth: json.Depth,
              is_cancel: json.isCancel,
              is_final: json.isFinal,
              is_training: json.isTraining,
              latitude: json.Latitude,
              longitude: json.Longitude,
              region_code: null,
              region_name: json.Hypocenter,
              origin_time: new Date(json.OriginTime),
              isPlum: json.isAssumption,
              userIntensity: null,
              arrivalTime: null,
              intensityAreas: null,
              warnZones: EBIData,
              source: "wolfx",
            };
            EEWcontrol(EEWdata);
            kmoniTimeUpdate(new Date() - Replay, "wolfx", "success");
          }
        } catch (err) {
          kmoniTimeUpdate(new Date() - Replay, "wolfx", "Error");
        }
      });
    });
    request.on("error", (error) => {
      NetworkError(error, "wolfx");
      kmoniTimeUpdate(new Date() - Replay, "wolfx", "Error");
    });

    request.end();
  }
  setTimeout(function () {
    wolfxRequest();
  }, config.Source.wolfx.Interval);
}

//P2P地震情報API WebSocket接続・受信処理
var P2PWSclient;

function P2P_WS() {
  P2PWSclient = new WebSocketClient();

  P2PWSclient.on("connectFailed", function () {
    kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
    setTimeout(P2P_WS_TryConnect, 5000);
  });

  P2PWSclient.on("connect", function (connection) {
    connection.on("error", function () {
      kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Disconnect");
      setTimeout(P2P_WS_TryConnect, 5000);
    });
    connection.on("message", function (message) {
      if (Replay == 0) return;
      if (message.type === "utf8") {
        var data = message.utf8Data;
        switch (data.code) {
          case 552:
            //津波情報
            if (data.canceled) {
              data.forEach(function (elm) {
                elm.canceled = true;
              });
              data.revocation = false;
              data.source = "P2P";
            }
            TsunamiInfoControl(data);
            break;
          case 554:
            break;
          case 556:
            //緊急地震速報（警報）
            EEWdetect(4, data);
            break;
          default:
            return false;
        }
        if (data.time) {
          kmoniTimeUpdate(new Date(data.time), "P2P_EEW", "success");
        }
      }
    });
    kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "success");
  });

  P2P_WS_Connect();
}
var P2PReconnectTimeout = 500;
function P2P_WS_TryConnect() {
  P2PReconnectTimeout *= 2;
  setTimeout(P2P_WS_Connect, P2PReconnectTimeout);
}
function P2P_WS_Connect() {
  if (P2PWSclient) P2PWSclient.connect("wss://api.p2pquake.net/v2/ws");
}

//AXIS WebSocket接続・受信処理
var AXISWSclient;
const AXIS_headers = {
  Authorization: `Bearer ${config.Source.axis.AccessToken}`,
};
function AXIS_WS() {
  if (!config.Source.axis.GetData) return;
  AXISWSclient = new WebSocketClient();

  AXISWSclient.on("connectFailed", function () {
    kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
    AXIS_WS_TryConnect();
  });

  AXISWSclient.on("connect", function (connection) {
    connection.on("error", function () {
      kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
    });
    connection.on("close", function () {
      kmoniTimeUpdate(new Date() - Replay, "axis", "Disconnect");
      AXIS_WS_TryConnect();
    });
    connection.on("message", function (message) {
      if (Replay == 0) return;
      var dataStr = message.utf8Data;
      kmoniTimeUpdate(new Date() - Replay, "axis", "success");

      if (dataStr == "hello") return;

      var data = JSON.parse(dataStr);
      if (data.channel == "eew") {
        //eew
        EEWdetect(3, data.message);
      } else if (data.channel == "jmx-seismology") {
        //地震情報
        var EarthquakeElm = {
          Hypocenter: { Area: { Name: null } },
          Magnitude: null,
        };
        if (data.message.Body.Earthquake[0]) EarthquakeElm = data.message.Body.Earthquake[0];
        var IntensityElm = {
          Observation: { MaxInt: null },
        };
        if (data.message.Body.Intensity) IntensityElm = data.message.Body.Intensity;

        eqInfoControl(
          [
            {
              eventId: data.message.Head.EventID,
              category: data.message.Head.Title,
              reportDateTime: data.message.Head.ReportDateTime,
              OriginTime: data.message.Head.TargetDateTime,
              epiCenter: EarthquakeElm.Hypocenter.Area.Name,
              M: EarthquakeElm.Magnitude,
              maxI: IntensityElm.Observation.MaxInt,
              cancel: null,
              DetailURL: [],
              axisData: data,
            },
          ],
          "jma"
        );
      }
    });
    kmoniTimeUpdate(new Date() - Replay, "axis", "success");
  });

  AXIS_WS_Connect();
}
var lastConnectDate = new Date();
function AXIS_WS_TryConnect() {
  var timeoutTmp = Math.max(30000 - (new Date() - lastConnectDate), 100);
  setTimeout(AXIS_WS_Connect, timeoutTmp);
}
function AXIS_WS_Connect() {
  if (AXISWSclient) AXISWSclient.connect("wss://ws.axis.prioris.jp/socket", null, null, AXIS_headers);
  lastConnectDate = new Date();
}

//定期実行
function RegularExecution() {
  //EEW解除
  EEW_nowList.forEach(function (elm) {
    if (new Date() - Replay - new Date(dateEncode(3, Number(elm.origin_time), 1)) > 300000) {
      EEWClear(null, elm.EventID, null, true);
    }
  });

  //kmoniWorker監視
  if (new Date() - kmoniActive > 5000) {
    worker_createWindow();
  }

  setTimeout(RegularExecution, 1000);
}

//強震モニタの取得オフセット設定
async function yoyuSetK(func) {
  var yoyuKOK = false;
  var loopCount = 0;
  var resTimeTmp;
  while (!yoyuKOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var dataTmp = "";
          var request = net.request("http://www.kmoni.bosai.go.jp/webservice/server/pros/latest.json?_=" + Number(new Date()));
          request.on("response", (res) => {
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });
            res.on("end", function () {
              try {
                var json = jsonParse(dataTmp);
                if (json) {
                  var resTime = new Date(json.latest_time);

                  if (resTimeTmp !== resTime && 0 < loopCount) {
                    yoyuKOK = true;
                    yoyuK = new Date() - resTime;
                  }
                  resTimeTmp = resTime;
                }
                resolve();
              } catch (err) {
                return;
              }
            });
          });

          request.end();
        }
      } catch (err) {
        return;
      }
    });
    if (loopCount > 25) {
      yoyuK = 2500;
      break;
    }

    loopCount++;
  }
  func();
  return true;
}

//長周期地震動モニタの取得オフセット設定
async function yoyuSetL(func) {
  var yoyuLOK = false;
  var loopCount = 0;
  var resTimeTmp;
  while (!yoyuLOK) {
    await new Promise((resolve) => {
      try {
        if (net.online) {
          var dataTmp = "";
          var request = net.request("https://smi.lmoniexp.bosai.go.jp/webservice/server/pros/latest.json?_" + Number(new Date()));
          request.on("response", (res) => {
            res.on("data", (chunk) => {
              dataTmp += chunk;
            });
            res.on("end", function () {
              try {
                var json = JSON.parse(dataTmp);
                var resTime = new Date(json.latest_time);

                if (resTimeTmp !== resTime && 0 < loopCount) {
                  yoyuLOK = true;
                  yoyuL = new Date() - resTime;
                }
                resTimeTmp = resTime;
                resolve();
              } catch (err) {
                return;
              }
            });
          });

          request.end();
        }
      } catch (err) {
        return;
      }
    });
    if (loopCount > 25) {
      yoyuL = 2500 + Yoyu;
      break;
    }

    loopCount++;
  }

  func();
  return true;
}

//情報最終更新時刻を更新
function kmoniTimeUpdate(Updatetime, type, condition, vendor) {
  var sendData = {
    action: "kmoniTimeUpdate",
    Updatetime: Updatetime,
    LocalTime: new Date(),
    vendor: vendor,
    type: type,
    condition: condition,
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", sendData);
  }

  if (type == "P2P_EEW") {
    P2P_ConnectData = sendData;
  }
  var kmoniTimeTmpElm = kmoniTimeTmp.find(function (elm) {
    return elm.type == type;
  });
  if (kmoniTimeTmpElm) {
    kmoniTimeTmpElm = {
      type: type,
      Updatetime: Updatetime,
      LocalTime: new Date(),
    };
  } else {
    kmoniTimeTmp.push({
      type: type,
      Updatetime: Updatetime,
      LocalTime: new Date(),
    });
  }
}

//情報フォーマット変更・新報検知→EEWcontrol
function EEWdetect(type, json /*, KorL*/) {
  if (!json) return;
  //if (type == 1) { y-kmoni
  if (type == 2) {
    //kmoni/lmoni
    try {
      if (json.result.message == "") {
        kmoniEid = json.report_id;
        kmoniRNum = json.report_num;
      } else {
        kmoniEid = null;
        kmoniRNum = null;
      }
    } catch (err) {
      return;
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
          IntTo: elm.Intensity.To,
          IntFrom: elm.Intensity.From,
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
        maxInt: shindoConvert(json.Intensity),
        depth: Number(json.Hypocenter.Depth.replace("km", "")),
        is_cancel: json.Flag.is_cancel,
        is_final: json.Flag.is_final,
        is_training: json.Flag.is_training,
        latitude: json.Hypocenter.Coordinate[1],
        longitude: json.Hypocenter.Coordinate[0],
        region_code: json.Hypocenter.Code,
        region_name: json.Hypocenter.Name,
        origin_time: new Date(json.OriginDateTime),
        isPlum: null,
        userIntensity: null,
        arrivalTime: null,
        intensityAreas: null,
        warnZones: EBIData,
        source: "axis",
      };
      EEWcontrol(EEWdata);
    } catch (err) {
      kmoniTimeUpdate(new Date() - Replay, "axis", "Error");
    }
  } else if (type == 4) {
    //P2P
    try {
      var maxIntTmp = Math.floor(
        Math.max.apply(
          null,
          json.areas.map(function (p) {
            return p.scaleTo;
          })
        )
      );

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
          Alert: alertFlg,
          IntTo: shindoConvert(elm.scaleTo, 0, true),
          IntFrom: shindoConvert(elm.scaleFrom, 0, true),
          ArrivalTime: elm.arrivalTime,
          Arrived: elm.kindCode == 11,
        });
      });
      var EEWdata = {
        alertflg: "警報",
        EventID: Number(json.issue.eventId),
        serial: Number(json.issue.serial),
        report_time: new Date(json.issue.time),
        magnitude: magnitudeTmp,
        maxInt: shindoConvert(maxIntTmp, 0, true),
        depth: depthTmp,
        is_cancel: Boolean(json.canceled),
        is_final: null,
        is_training: Boolean(json.test),
        latitude: latitudeTmp,
        longitude: longitudeTmp,
        region_code: "",
        region_name: region_nameTmp,
        origin_time: origin_timeTmp,
        isPlum: conditionTmp,
        warnZones: [],
        source: "P2P_EEW",
      };

      var areaTmp = [];
      json.areas.forEach(function (elm) {
        areaTmp.push({
          Code: null,
          Name: elm.name,
          Alert: elm.kindCode == 10 || elm.kindCode == 11 || elm.kindCode == 19,
          IntTo: shindoConvert(elm.scaleTo),
          IntFrom: shindoConvert(elm.scaleFrom),
          ArrivalTime: new Date(elm.arrivalTime),
          Arrived: elm.kindCode == 11,
        });
      });
      EEWdata.warnZones = areaTmp;

      EEWcontrol(EEWdata);
    } catch (err) {
      kmoniTimeUpdate(new Date() - Replay, "P2P_EEW", "Error");
    }
  }
}

//EEW情報マージ→EEWAlert
function EEWcontrol(data) {
  if (!data) return;
  if (!config.Info.EEW.showTraning && data.is_training) return;

  if (data.origin_time) {
    var origin_timeTmp = data.origin_time;
  } else {
    var eqj = EEW_Data.find(function (elm) {
      return elm.EQ_id == data.EventID;
    });
    if (eqj) {
      origin_timeTmp = eqj.data[eqj.data.length - 1].origin_time;
    } else {
      origin_timeTmp = new Date() - Replay;
    }
  }
  var pastTime = new Date() - Replay - origin_timeTmp;
  if (pastTime > 300000 || pastTime < 0) return;

  if (data.latitude && data.longitude) {
    data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);
  }

  if (data.warnZones && data.warnZones.length) {
    var userSect = data.warnZones.find(function (elm2) {
      return elm2.Name == config.home.Section;
    });

    if (userSect) {
      data.userIntensity = config.Info.EEW.IntType == "max" ? userSect.IntTo : userSect.IntFrom;
      data.arrivalTime = userSect.ArrivalTime;
    }
  }

  var EQJSON = EEW_Data.find(function (elm) {
    return elm.EQ_id == data.EventID;
  });
  if (EQJSON) {
    //ID・報の両方一致した情報が存在するか
    var EEWJSON = EQJSON.data.find(function (elm2) {
      return elm2.serial == data.serial;
    });
    if (EEWJSON) {
      var oneBefore =
        data.serial ==
        Math.max.apply(
          null,
          EQJSON.data.map(function (o) {
            return o.serial;
          })
        );

      if (oneBefore) {
        //既知／情報更新
        var changed = false;
        oneBeforeData = EQJSON.data.find(function (elm) {
          return elm.serial == data.serial;
        });
        var keys = ["alertflg", "EventID", "serial", "report_time", "magnitude", "maxInt", "depth", "is_cancel", "is_final", "is_training", "latitude", "longitude", "region_code", "region_name", "origin_time", "isPlum", "userIntensity", "arrivalTime", "intensityAreas", "warnZones"];

        keys.forEach(function (elm) {
          if ((!oneBeforeData[elm] || oneBeforeData[elm].length == 0) && data[elm]) {
            oneBeforeData[elm] = data[elm];
            changed = true;
          }
        });

        if (data.warnZones.length) {
          data.warnZones.forEach(function (elm) {
            Item = oneBeforeData.warnZones.find(function (elm2) {
              return elm.Name == elm2.Name;
            });
            if (Item) {
              elm = Object.assign(Item, elm);
            }
          });
        }

        if (changed) {
          EEWAlert(oneBeforeData, false, true);
        }
      }
    } else {
      //最新の報かどうか
      var saishin =
        data.serial >
        Math.max.apply(
          null,
          EQJSON.data.map(function (o) {
            return o.serial;
          })
        );

      if (saishin) {
        //第２報以降

        var EQJSON = EEW_Data.find(function (elm) {
          return elm.EQ_id == data.EventID;
        });

        EEWAlert(data, false);
        EQJSON.data.push(data);
        if (data.is_cancel) {
          EQJSON.canceled = true;
        }
      }
    }
  } else {
    //第１報
    if (!data.maxInt) {
      if (!config.Info.EEW.IntQuestion) return;
    } else if (shindoConvert(config.Info.EEW.IntThreshold, 5) > shindoConvert(data.maxInt, 5)) {
      return;
    }

    EEWAlert(data, true);
    EEW_Data.push({
      EQ_id: data.EventID,
      canceled: false,
      data: [data],
    });
  }
  //EEW履歴に追加
  if (!EEW_history[data.source]) EEW_history[data.source] = [];
  if (
    !EEW_history[data.source].find(function (elm) {
      return data.EventID == elm.EventID && data.serial == elm.serial;
    })
  ) {
    EEW_history[data.source].push(data);
  }
}

function EarlyEstControl(data) {
  if (!data) return;

  if (data.origin_time) {
    var origin_timeTmp = data.origin_time;
  } else {
    var eqj = EarlyEst_Data.find(function (elm) {
      return elm.EQ_id == data.EventID;
    });
    if (eqj) {
      origin_timeTmp = eqj.data[eqj.data.length - 1].origin_time;
    } else {
      origin_timeTmp = new Date() - Replay;
    }
  }
  var pastTime = new Date() - Replay - origin_timeTmp;
  if (pastTime > 300000 || pastTime < 0) return;

  if (data.latitude && data.longitude) {
    data.distance = geosailing(data.latitude, data.longitude, config.home.latitude, config.home.longitude);
  }

  var EQJSON = EarlyEst_Data.find(function (elm) {
    return elm.EQ_id == data.EventID;
  });
  if (EQJSON) {
    //ID・報の両方一致した情報が存在するか
    var EEWJSON = EQJSON.data.find(function (elm2) {
      return elm2.serial == data.serial;
    });
    if (!EEWJSON) {
      //最新の報かどうか
      var saishin =
        data.serial >
        Math.max.apply(
          null,
          EQJSON.data.map(function (o) {
            return o.serial;
          })
        );

      if (saishin) {
        //第２報以降

        var EQJSON = EarlyEst_Data.find(function (elm) {
          return elm.EQ_id == data.EventID;
        });

        EarlyEstAlert(data, false);
        EQJSON.data.push(data);
        if (data.is_cancel) {
          EQJSON.canceled = true;
        }
      }
    }
  } else {
    //第１報
    EarlyEstAlert(data, true);
    EarlyEst_Data.push({
      EQ_id: data.EventID,
      canceled: false,
      data: [data],
    });
  }
  //EarlyEst履歴に追加
  if (!EarlyEst_history[data.source]) EarlyEst_history[data.source] = [];
  if (
    !EarlyEst_history[data.source].find(function (elm) {
      return data.EventID == elm.EventID && data.serial == elm.serial;
    })
  ) {
    EarlyEst_history[data.source].push(data);
  }
}

//EEW解除処理
function EEWClear(source, code, reportnum, bypass) {
  if (EEWNow || bypass) {
    if (!bypass && EEW_history[source]) {
      var EEW_detected = EEW_history[source].find(function (elm) {
        return code == elm.EventID;
      });
    }
    if (EEW_detected || bypass) {
      EEW_nowList = EEW_nowList.filter(function (elm) {
        return elm.EventID !== code;
      });
      if (mainWindow) {
        mainWindow.webContents.send("message2", {
          action: "EEWAlertUpdate",
          data: EEW_nowList,
        });
      }

      if (estShindoTmp && estShindoTmp.eid == code) estShindoTmp = null;

      if (EEW_nowList.length == 0) {
        EEWNow = false;
        if (psBlock && powerSaveBlocker.isStarted(psBlock)) powerSaveBlocker.stop(psBlock);
        worker.postMessage({ action: "EEWNow", data: EEWNow });
      }
    }
  }
}

//EEW通知（音声・画面表示等）
function EEWAlert(data, first, update) {
  EEWNow = true;
  worker.postMessage({ action: "EEWNow", data: EEWNow });

  //【現在のEEW】から同一地震、古い報を削除
  EEW_nowList = EEW_nowList.filter(function (elm) {
    return elm.EventID !== data.EventID;
  });
  //【現在のEEW】配列に追加
  EEW_nowList.push(data);

  if (!update) {
    if (first) {
      createWindow();
      if (data.alertflg == "警報") {
        soundPlay("EEW1");
      } else {
        soundPlay("EEW2");
      }
      speak(config.notice.voice.EEW);
    } else {
      speak(config.notice.voice.EEWUpdate);
    }
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: false,
      });
    } else {
      var alertFlg = "";
      if (data.alertflg) alertFlg = "（" + data.alertflg + "）";
      var EEWNotification = new Notification({
        title: "緊急地震速報" + alertFlg + "#" + data.serial,
        body: data.region_name + "\n推定震度：" + data.maxInt + "  M" + data.magnitude + "  深さ：" + data.depth,
        icon: path.join(__dirname, "img/icon.ico"),
      });
      EEWNotification.show();
      EEWNotification.on("click", function () {
        createWindow();
      });
    }
  } else {
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    }
  }

  eqInfoControl(
    [
      {
        eventId: data.EventID,
        category: "EEW",
        reportDateTime: data.report_time,
        OriginTime: data.origin_time,
        epiCenter: data.region_name,
        M: data.magnitude,
        maxI: data.maxInt,
        cancel: data.is_cancel,
        DetailURL: [],
      },
    ],
    "jma",
    true
  );

  //スリープ回避開始
  if (!psBlock || !powerSaveBlocker.isStarted(psBlock)) psBlock = powerSaveBlocker.start("prevent-display-sleep");
}

//EarlyEst通知（音声・画面表示等）
function EarlyEstAlert(data, first, update) {
  EEWNow = true;

  //【現在のEEW】から同一地震、古い報を削除
  EEW_nowList = EEW_nowList.filter(function (elm) {
    return elm.EventID !== data.EventID;
  });
  //【現在のEEW】配列に追加
  EEW_nowList.push(data);

  if (!update) {
    if (first) {
      createWindow();
      soundPlay("EEW2");
      //speak(config.notice.voice.EEW);
    } else {
      //speak(config.notice.voice.EEWUpdate);
    }
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: false,
      });
    } else {
      var EEWNotification = new Notification({
        title: "Early-Est 地震情報" + " #" + data.serial,
        body: data.region_name + "\n M" + data.magnitude + "  深さ：" + data.depth,
        icon: path.join(__dirname, "img/icon.ico"),
      });
      EEWNotification.show();
      EEWNotification.on("click", function () {
        createWindow();
      });
    }
  } else {
    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EEWAlertUpdate",
        data: EEW_nowList,
        update: true,
      });
    }
  }

  //スリープ回避開始
  if (!psBlock || !powerSaveBlocker.isStarted(psBlock)) psBlock = powerSaveBlocker.start("prevent-display-sleep");
}

//🔴地震情報🔴

//地震情報更新処理
function eqInfoUpdate(disableRepeat) {
  EQInfoFetchIndex++;
  EQI_JMA_Req();
  EQI_JMAXMLList_Req();
  EQI_narikakunList_Req("https://ntool.online/api/earthquakeList?year=" + new Date().getFullYear() + "&month=" + (new Date().getMonth() + 1), 10, true);
  EQI_USGS_Req();

  if (!disableRepeat) setTimeout(eqInfoUpdate, config.Info.EQInfo.Interval);
}

//気象庁JSON 取得・フォーマット変更→eqInfoControl
function EQI_JMA_Req() {
  var request = net.request("https://www.jma.go.jp/bosai/quake/data/list.json");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json) return false;
        var dataTmp2 = [];
        json = json.filter(function (elm) {
          return elm.ttl == "震度速報" || elm.ttl == "震源に関する情報" || elm.ttl == "震源・震度情報" || elm.ttl == "遠地地震に関する情報" || elm.ttl == "顕著な地震の震源要素更新のお知らせ";
        });
        json = json.sort(function (a, b) {
          var r = 0;
          if (a.at > b.at) {
            r = -1;
          } else if (a.at < b.at) {
            r = 1;
          }
          return r;
        });

        var jmaJsonEIDs = [];
        for (let elm of json) {
          var eidTmp = elm.eid;
          if (!jmaJsonEIDs.includes(eidTmp)) {
            jmaJsonEIDs.push(eidTmp);
            if (jmaJsonEIDs.length == config.Info.EQInfo.ItemCount) break;
          }
        }
        json.forEach(function (elm) {
          if (jmaJsonEIDs.includes(elm.eid)) {
            var maxi = elm.maxi;
            if (!maxi || maxi == "") maxi = null;
            dataTmp2.push({
              eventId: elm.eid,
              category: elm.ttl,
              OriginTime: new Date(elm.at),
              epiCenter: elm.anm,
              M: elm.mag,
              maxI: maxi,
              cancel: elm.ift == "取消",

              reportDateTime: new Date(elm.rdt),
              DetailURL: [String("https://www.jma.go.jp/bosai/quake/data/" + elm.json)],
            });
          }
        });

        eqInfoControl(dataTmp2, "jma");
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁ホームページ");
  });
  request.end();
}

//気象庁XMLリスト取得→EQI_JMAXML_Req
function EQI_JMAXMLList_Req() {
  var request = net.request("https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml");
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        const parser = new new JSDOM().window.DOMParser();
        const xml = parser.parseFromString(dataTmp, "text/html");
        if (!xml) return;
        xml.querySelectorAll("entry").forEach(function (elm) {
          var url;
          var urlElm = elm.querySelector("id");
          if (urlElm) url = urlElm.textContent;
          if (!url) return;
          EQI_JMAXML_Req(url);
        });
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁防災情報XML");
  });

  request.end();
}

//気象庁XML 取得・フォーマット変更→eqInfoControl
function EQI_JMAXML_Req(url) {
  if (!url) return;
  if (jmaXML_Fetched.includes(url)) return;
  jmaXML_Fetched.push(url);
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        const parser = new new JSDOM().window.DOMParser();
        const xml = parser.parseFromString(dataTmp, "text/html");
        if (!xml) return false;

        var title = xml.title;
        var cancel = false;
        var cancelElm = xml.querySelector("InfoType");
        if (cancelElm) cancel = cancelElm.textContent == "取り消し";

        if (title == "震度速報" || title == "震源に関する情報" || title == "震源・震度に関する情報" || title == "遠地地震に関する情報" || title == "顕著な地震の震源要素更新のお知らせ") {
          //地震情報
          var EarthquakeElm = xml.querySelector("Body Earthquake");
          var originTimeTmp;
          var epiCenterTmp;
          var magnitudeTmp;
          if (EarthquakeElm) {
            originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
            epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
            magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].textContent);
          }

          var IntensityElm = xml.querySelector("Body Intensity");
          var maxIntTmp;
          if (IntensityElm) {
            maxIntTmp = shindoConvert(IntensityElm.querySelector("Observation > MaxInt").textContent);
          }
          if (maxIntTmp == "[objectHTMLUnknownElement]") maxIntTmp = null;
          eqInfoControl(
            [
              {
                eventId: xml.querySelector("EventID").textContent,
                category: xml.title,
                OriginTime: originTimeTmp,
                epiCenter: epiCenterTmp,
                M: magnitudeTmp,
                maxI: maxIntTmp,
                cancel: cancel,
                reportDateTime: new Date(xml.querySelector("ReportDateTime").textContent),
                DetailURL: [url],
              },
            ],
            "jma"
          );
        } else if (title == "津波情報a" || /大津波警報|津波警報|津波注意報|津波予報/.test(title)) {
          //津波予報
          var tsunamiDataTmp;
          if (cancel) {
            tsunamiDataTmp = {
              issue: { time: new Date(xml.querySelector("ReportDateTime").textContent) },
              areas: [],
              revocation: true,
            };
          } else {
            var ValidDateTimeElm = xml.querySelector("ValidDateTime");
            var ValidDateTimeTmp;
            if (ValidDateTimeElm) {
              ValidDateTimeTmp = new Date(ValidDateTimeElm.textContent);
            }
            tsunamiDataTmp = {
              issue: { time: new Date(xml.querySelector("ReportDateTime").textContent), EventID: Number(xml.querySelector("EventID").textContent) },
              areas: [],
              revocation: false,
              source: "jmaXML",
              ValidDateTime: ValidDateTimeTmp,
            };

            if (xml.querySelector("Body").querySelector("Tsunami")) {
              var tsunamiElm = xml.querySelector("Body").querySelector("Tsunami");
              if (tsunamiElm.querySelector("Forecast")) {
                tsunamiElm
                  .querySelector("Forecast")
                  .querySelectorAll("Item")
                  .forEach(function (elm) {
                    var gradeTmp;
                    var canceledTmp = false;
                    switch (Number(elm.querySelector("Category").querySelector("Kind").querySelector("Code").textContent)) {
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
                        canceledTmp = true;
                        break;
                      default:
                        break;
                    }
                    var firstHeightTmp;
                    var firstHeightConditionTmp;
                    var maxHeightTmp;
                    if (elm.querySelector("FirstHeight")) {
                      if (elm.querySelector("FirstHeight").querySelector("ArrivalTime")) {
                        firstHeightTmp = new Date(elm.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                      }
                      if (elm.querySelector("FirstHeight").querySelector("Condition")) {
                        firstHeightConditionTmp = elm.querySelector("FirstHeight").querySelector("Condition").textContent;
                      }
                    }
                    if (elm.querySelector("MaxHeight")) {
                      var maxheightElm = elm.querySelector("MaxHeight").getElementsByTagName("jmx_eb:TsunamiHeight");
                      if (maxheightElm) {
                        maxHeightTmp = maxheightElm[0].getAttribute("description").replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                        });
                      }
                    }
                    var stations = [];
                    if (elm.querySelector("Station")) {
                      elm.querySelectorAll("Station").forEach(function (elm2) {
                        var nameTmp;
                        var highTideTimeTmp;
                        var ArrivalTimeTmp;
                        var ConditionTmp;
                        nameTmp = elm2.querySelector("Name").textContent;
                        highTideTimeTmp = new Date(elm2.querySelector("HighTideDateTime").textContent);
                        if (elm2.querySelector("FirstHeight").querySelector("ArrivalTime")) ArrivalTimeTmp = new Date(elm2.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                        if (elm2.querySelector("Condition")) ConditionTmp = elm2.querySelector("Condition").textContent;
                        stations.push({
                          name: nameTmp,
                          HighTideDateTime: highTideTimeTmp,
                          ArrivalTime: ArrivalTimeTmp,
                          Condition: ConditionTmp,
                        });
                      });
                    }

                    tsunamiDataTmp.areas.push({
                      code: Number(elm.querySelector("Category").querySelector("Kind").querySelector("Code").textContent),
                      grade: gradeTmp,
                      name: elm.querySelector("Name").textContent,
                      canceled: canceledTmp,
                      firstHeight: firstHeightTmp,
                      firstHeightCondition: firstHeightConditionTmp,
                      stations: stations,
                      maxHeight: maxHeightTmp,
                    });
                  });
              }
              if (tsunamiElm.querySelector("Observation")) {
                tsunamiElm
                  .querySelector("Observation")
                  .querySelectorAll("Item")
                  .forEach(function (elm) {
                    var stations = [];
                    if (elm.querySelector("Station")) {
                      elm.querySelectorAll("Station").forEach(function (elm2) {
                        var nameTmp;
                        var ArrivalTimeTmp;
                        var firstHeightConditionTmp;
                        var firstHeightInitialTmp;
                        var maxheightTime;
                        var maxHeightCondition;
                        var oMaxHeightTmp;
                        nameTmp = elm2.querySelector("Name").textContent;
                        if (elm2.querySelector("FirstHeight")) {
                          if (elm2.querySelector("FirstHeight").querySelector("ArrivalTime")) ArrivalTimeTmp = new Date(elm2.querySelector("FirstHeight").querySelector("ArrivalTime").textContent);
                          if (elm2.querySelector("FirstHeight").querySelector("Condition")) firstHeightConditionTmp = elm2.querySelector("FirstHeight").querySelector("Condition").textContent;
                          if (elm2.querySelector("FirstHeight").querySelector("Initial")) firstHeightInitialTmp = elm2.querySelector("FirstHeight").querySelector("Initial").textContent;
                        }
                        if (elm2.querySelector("MaxHeight")) {
                          var maxheightElm = elm2.querySelector("MaxHeight").getElementsByTagName("jmx_eb:TsunamiHeight")[0];
                          if (maxheightElm) {
                            oMaxHeightTmp = maxheightElm.getAttribute("description");
                            oMaxHeightTmp = oMaxHeightTmp.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, function (s) {
                              return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                            });
                          }

                          var maxheightTimeElm = elm2.querySelector("MaxHeight").getElementsByTagName("DateTime");
                          if (maxheightTimeElm) {
                            maxheightTime = new Date(maxheightTimeElm.textContent);
                          }
                          var maxheightConditionElm = elm2.querySelector("MaxHeight").getElementsByTagName("Condition");
                          if (maxheightConditionElm) {
                            maxHeightCondition = elm2.querySelector("MaxHeight").getElementsByTagName("Condition").textContent;
                          }
                        }

                        stations.push({
                          name: nameTmp,
                          ArrivedTime: ArrivalTimeTmp,
                          firstHeightCondition: firstHeightConditionTmp,
                          firstHeightInitial: firstHeightInitialTmp,
                          omaxHeight: oMaxHeightTmp,
                          maxHeightTime: maxheightTime,
                          maxHeightCondition: maxHeightCondition,
                        });
                      });
                    }

                    var tsunamiItem = tsunamiDataTmp.areas.find(function (elm2) {
                      return elm2.name == elm.querySelector("Name").textContent;
                    });

                    if (tsunamiItem) {
                      stations.forEach(function (elm2) {
                        var stationElm = tsunamiItem.stations.find(function (elm3) {
                          return elm3.name == elm2.name;
                        });
                        if (stationElm) {
                          stationElm.ArrivedTime = elm2.ArrivedTime;
                          stationElm.firstHeightCondition = elm2.firstHeightCondition;
                          stationElm.firstHeightInitial = elm2.firstHeightInitial;
                          stationElm.omaxHeight = elm2.omaxHeight;
                          stationElm.maxheightTime = elm2.ArrivedTime;
                          stationElm.maxHeightCondition = elm2.maxHeightCondition;
                        }
                      });
                    } else {
                      tsunamiDataTmp.areas.push({
                        name: elm.querySelector("Name").textContent,
                        stations: stations,
                      });
                    }
                  });
              }
            }
          }
          TsunamiInfoControl(tsunamiDataTmp);
        }
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "気象庁防災情報XML");
  });

  request.end();
}

//USGS 取得・フォーマット変更→eqInfoControl
var usgsLastGenerated = 0;
function EQI_USGS_Req() {
  var request = net.request("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=" + config.Info.EQInfo.ItemCount);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json) return false;
        if (json.features[0].properties && usgsLastGenerated < json.features[0].properties.updated) {
          usgsLastGenerated = json.features[0].properties.updated;

          var dataTmp2 = [];
          json.features.forEach(function (elm) {
            var request = net.request("https://earthquake.usgs.gov/ws/geoserve/regions.json?latitude=" + elm.geometry.coordinates[1] + "&longitude=" + elm.geometry.coordinates[0] + "&type=fe");
            request.on("response", (res) => {
              var dataTmp = "";
              res.on("data", (chunk) => {
                dataTmp += chunk;
              });
              res.on("end", function () {
                var json = jsonParse(dataTmp);
                var FE_ID;
                var i = 0;
                while (!FE_ID && i < json.fe.features.length) {
                  FE_ID = json.fe.features[i].properties.number;
                  i++;
                }
                var jpName = FERegions[FE_ID];
                dataTmp2.push({
                  eventId: elm.id,
                  category: null,
                  OriginTime: new Date(elm.properties.time),
                  epiCenter: jpName ? jpName : elm.properties.place,
                  M: Math.round(elm.properties.mag * 10) / 10,
                  maxI: null,
                  DetailURL: [elm.properties.url],
                });
                if (dataTmp2.length <= config.Info.EQInfo.ItemCount) {
                  eqInfoControl(dataTmp2, "usgs");
                }
              });
            });
            request.end();
          });
        }
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "USGS");
  });

  request.end();
}

//narikakun地震情報API リスト取得→EQI_narikakun_Req
function EQI_narikakunList_Req(url, num, first) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);
        if (!json || !json.lists) return false;
        narikakun_URLs = narikakun_URLs.concat(json.lists.reverse());

        if (narikakun_URLs.length < config.Info.EQInfo.ItemCount && first) {
          var yearTmp = new Date().getFullYear();
          var monthTmp = new Date().getMonth();
          if (monthTmp == 0) {
            yearTmp = new Date().getFullYear() - 1;
            monthTmp = 1;
          }
          EQI_narikakunList_Req("https://ntool.online/api/earthquakeList?year=" + yearTmp + "&month=" + monthTmp, config.Info.EQInfo.ItemCount - json.lists.length, false);
        } else {
          for (let elm of narikakun_URLs) {
            var eidTmp = elm.split("_")[2];
            if (nakn_Fetched.indexOf(url) === -1) {
              nakn_Fetched.push(elm);
              EQI_narikakun_Req(elm);
            }
            if (!narikakun_EIDs.includes(eidTmp)) {
              narikakun_EIDs.push(eidTmp);
              if (narikakun_EIDs.length == config.Info.EQInfo.ItemCount) break;
            }
          }
          narikakun_URLs = [];
          narikakun_EIDs = [];
        }
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "narikakun 地震情報API");
  });
  request.end();
}

//narikakun地震情報API 取得・フォーマット変更→eqInfoControl
function EQI_narikakun_Req(url) {
  var request = net.request(url);
  request.on("response", (res) => {
    var dataTmp = "";
    res.on("data", (chunk) => {
      dataTmp += chunk;
    });
    res.on("end", function () {
      try {
        var json = jsonParse(dataTmp);

        if (!json) return;

        var originTimeTmp = json.Body.Earthquake ? new Date(json.Body.Earthquake.OriginTime) : null;
        var epiCenterTmp = json.Body.Earthquake ? json.Body.Earthquake.Hypocenter.Name : null;
        var MagnitudeTmp = json.Body.Earthquake ? json.Body.Earthquake.Magnitude : null;
        var MaxITmp = json.Body.Intensity ? json.Body.Intensity.Observation.MaxInt : null;
        var cancel = json.Head.InfoType == "取消";

        var dataTmp2 = [
          {
            eventId: json.Head.EventID,
            category: json.Head.Title,
            OriginTime: originTimeTmp,
            epiCenter: epiCenterTmp,
            M: MagnitudeTmp,
            maxI: MaxITmp,
            cancel: cancel,
            reportDateTime: new Date(json.Head.ReportDateTime),
            DetailURL: [url],
          },
        ];
        eqInfoControl(dataTmp2, "jma");
      } catch (err) {
        return;
      }
    });
  });
  request.on("error", (error) => {
    NetworkError(error, "narikakun 地震情報API");
  });
  request.end();
}
//地震情報マージ→eqInfoAlert
function eqInfoControl(dataList, type, EEW) {
  switch (type) {
    case "jma":
      var eqInfoTmp = [];
      var eqInfoUpdateTmp = [];
      var audioPlay = false;

      dataList.forEach(function (data) {
        if (new Date(data.reportDateTime) > new Date() - Replay) return;
        var EQElm = eqInfo.jma.concat(eqInfoTmp).find(function (elm) {
          return elm.eventId == data.eventId;
        });

        if (!data.maxI) data.maxI = null;
        if (EQElm) {
          var newer = EQElm.reportDateTime < data.reportDateTime;
          var changed = false;
          if (EEW && EQElm.category !== "EEW") return; //EEW以外の情報が入っているとき、EEWによる情報を破棄
          if (!EEW && EQElm.category == "EEW") {
            //EEWによらない情報が入ったら、EEWによる情報をクリアー
            newer = true;
            EQElm = {
              eventId: EQElm.eventId,
              category: null,
              reportDateTime: null,
              OriginTime: null,
              epiCenter: null,
              M: null,
              maxI: null,
              DetailURL: [],
              axisData: [],
            };
            changed = true;
            audioPlay = true;
          }

          if (data.OriginTime && (!EQElm.OriginTime || newer)) {
            EQElm.OriginTime = data.OriginTime;
            changed = true;
          }
          if (data.epiCenter && (!EQElm.epiCenter || newer)) {
            EQElm.epiCenter = data.epiCenter;
            changed = true;
          }
          if (data.M == "Ｍ不明" || data.M == "NaN") data.M = null;
          if (data.M && (!EQElm.M || newer)) {
            EQElm.M = data.M;
            changed = true;
          }
          if (data.maxI && (!EQElm.maxI || newer)) {
            EQElm.maxI = data.maxI;
            changed = true;
          }

          if (data.cancel && (!EEW || EQElm.category == "EEW")) {
            //EEWによるキャンセル報の場合、EEWによる情報以外取り消さない
            if (data.cancel && (!EQElm.cancel || newer)) {
              EQElm.cancel = data.cancel;
              changed = true;
            }
          }
          EQElm.category = data.category;

          if (data.DetailURL && data.DetailURL[0] !== "" && !EQElm.DetailURL.includes(data.DetailURL[0])) {
            EQElm.DetailURL.push(data.DetailURL[0]);
            changed = true;
          }
          if (data.axisData) {
            if (!EQElm.axisData || EQElm.axisData.length) EQElm.axisData = [];
            EQElm.axisData.push(data.axisData);
            changed = true;
          }
          if (changed) {
            eqInfoUpdateTmp.push(EQElm);
            var EQElm2 = eqInfo.jma.findIndex(function (elm) {
              return elm.eventId == data.eventId;
            });
            if (EQElm2 !== -1) {
              eqInfo.jma[EQElm2] = EQElm;
            }
          }
        } else {
          eqInfoTmp.push(data);
        }
      });
      if (eqInfoTmp.length > 0) {
        eqInfoAlert(eqInfoTmp, "jma", false, audioPlay);
      }
      if (eqInfoUpdateTmp.length > 0) {
        eqInfoAlert(eqInfoUpdateTmp, "jma", true, audioPlay);
      }

      break;

    case "usgs":
      dataList
        .sort(function (a, b) {
          return a.OriginTime > b.OriginTime ? -1 : 1;
        })
        .forEach(function (elm) {
          eqInfoAlert(elm, "usgs");
        });

      break;
    default:
      break;
  }
}

//地震情報通知（音声・画面表示等）
function eqInfoAlert(data, source, update, audioPlay) {
  if (source == "jma") {
    if (!update) {
      eqInfo.jma = eqInfo.jma.concat(data);
    }
    if (audioPlay) {
      if (EQInfoFetchIndex > 0) {
        soundPlay("EQInfo");
      }
    }

    eqInfo.jma = eqInfo.jma.sort(function (a, b) {
      var r = 0;
      if (a.OriginTime > b.OriginTime) {
        r = -1;
      } else if (a.OriginTime < b.OriginTime) {
        r = 1;
      }
      return r;
    });

    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: "jma",
        data: eqInfo.jma.slice(0, config.Info.EQInfo.ItemCount),
      });
    }
    data.forEach(function (elm) {
      if (EQI_Window[elm.eventId]) {
        var metadata = EQI_Window[elm.eventId].metadata;
        var EEWDataItem = EEW_Data.find(function (elm2) {
          return elm2.EQ_id == elm.eventId;
        });

        metadata.urls = elm.urls;
        metadata.eew = EEWDataItem;
        metadata.axisData = elm.axisData;
        EQI_Window[elm.eventId].window.webContents.send("message2", metadata);
      }
    });
  } else if (source == "usgs") {
    eqInfo.usgs = eqInfo.usgs.filter((item) => {
      return item.eventId !== data.eventId;
    });
    eqInfo.usgs = eqInfo.usgs.concat(data);

    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "EQInfo",
        source: "usgs",
        data: eqInfo.usgs.slice(0, config.Info.EQInfo.ItemCount),
      });
    }
  }
}

//🔴津波情報🔴
function TsunamiInfoControl(data) {
  if (!config.Info.TsunamiInfo.GetData) return;
  var newInfo = !tsunamiData || !tsunamiData.issue || tsunamiData.issue.time < data.issue.time;
  if (newInfo) {
    //情報の有効期限
    if (data.ValidDateTime) {
      if (data.ValidDateTime < new Date()) return;

      clearTimeout(RevocationTimer);
      RevocationTimer = setTimeout(function () {
        TsunamiInfoControl({
          issue: { time: tsunamiData.ValidDateTime },
          revocation: true,
          cancelled: false,
          areas: [],
        });
      }, data.ValidDateTime - new Date());
    }

    soundPlay("TsunamiInfo");

    tsunamiData = data;

    if (newInfo) {
      //アラート
      createWindow();
    }

    if (mainWindow) {
      mainWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: data,
        new: newInfo,
      });
    }
    if (tsunamiWindow) {
      tsunamiWindow.webContents.send("message2", {
        action: "tsunamiUpdate",
        data: data,
        new: newInfo,
      });
    }
  }
}

//🔴支援関数🔴

//音声合成
function speak(str) {
  if (kmoniWorker) {
    kmoniWorker.webContents.send("message2", {
      action: "speak",
      data: str,
    });
  }
}
//音声再生(kmoniWorker連携)
function soundPlay(name) {
  if (kmoniWorker) {
    kmoniWorker.webContents.send("message2", {
      action: "soundPlay",
      data: name,
    });
  }
}

//ネットワークエラー処理
function NetworkError(/*error, type*/) {
  return false;
}
//メインウィンドウ内通知
var notifyData;
function Window_notification(message, type) {
  notifyData = {
    action: "notification_Update",
    data: {
      type: type,
      message: message,
      time: new Date(),
    },
  };
  if (mainWindow) {
    mainWindow.webContents.send("message2", notifyData);
  }
}

//JSONパース（拡張）
function jsonParse(str) {
  try {
    str = String(str);
    var json = JSON.parse(str);
  } catch (error) {
    return null;
  }
  return json;
}

//日時フォーマット
function dateEncode(type, dateTmp) {
  if (!dateTmp) dateTmp = new Date();
  else dateTmp = new Date(dateTmp);
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
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    return YYYY + MM + DD;
  } else if (type == 3) {
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    var hh = String(dateTmp.getHours()).padStart(2, "0");
    var mm = String(dateTmp.getMinutes()).padStart(2, "0");
    var ss = String(dateTmp.getSeconds()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss;
  } else if (type == 4) {
    //YYYYMMDDHHMMSS
    var YYYY = String(dateTmp.getFullYear());
    var MM = String(dateTmp.getMonth() + 1).padStart(2, "0");
    var DD = String(dateTmp.getDate()).padStart(2, "0");
    return YYYY + "/" + MM + "/" + DD;
  } else {
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
//震度の形式変換
function shindoConvert(str, responseType) {
  var ShindoTmp;
  if (!str) {
    ShindoTmp = 0;
  } else if (isNaN(str)) {
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
      case "99":
        ShindoTmp = 10;
        break;
      case "震度５弱以上未入電":
      case "5+?":
        ShindoTmp = 11;
        break;
      case "-1":
      case "?":
      case "不明":
      default:
        ShindoTmp = 12;
    }
  } else {
    if (str < 0.5) {
      ShindoTmp = 0;
    } else if (str < 1.5) {
      ShindoTmp = 1;
    } else if (str < 2.5) {
      ShindoTmp = 2;
    } else if (str < 3.5) {
      ShindoTmp = 3;
    } else if (str < 4.5) {
      ShindoTmp = 4;
    } else if (str < 5) {
      ShindoTmp = 5;
    } else if (str < 5.5) {
      ShindoTmp = 6;
    } else if (str < 6) {
      ShindoTmp = 7;
    } else if (str < 6.5) {
      ShindoTmp = 8;
    } else if (6.5 <= str) {
      ShindoTmp = 9;
    } else if (7.5 <= str) {
      ShindoTmp = 10;
    } else {
      ShindoTmp = 12;
    }
  }
  var ConvTable;
  switch (responseType) {
    case 1:
      ConvTable = ["0", "1", "2", "3", "4", "5弱", "5強", "6弱", "6強", "7", "7以上", "５弱以上未入電", "不明"];
      break;
    case 2:
      ConvTable = [
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
        [config.color.Shindo["7p"].background, config.color.Shindo["7p"].color],
        [config.color.Shindo["5p?"].background, config.color.Shindo["5p?"].color],
        [config.color.Shindo["?"].background, config.color.Shindo["?"].color],
      ];
      break;
    case 3:
      ConvTable = [null, "1", "2", "3", "4", "5m", "5p", "6m", "6p", "7", "7p", "5p?", null];
      break;
    case 4:
      ConvTable = [0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 7, 7.5, 4.5, null];
      break;
    case 5:
      ConvTable = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, null, 0];
      break;
    case 0:
    default:
      ConvTable = ["0", "1", "2", "3", "4", "5-", "5+", "6-", "6+", "7", "7+", "未", "?"];
      break;
  }
  return ConvTable[ShindoTmp];
}

//２地点の緯度経度から距離（km）を算出
function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}

//連想配列オブジェクトのマージ
function mergeDeeply(target, source, opts) {
  const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
  const isConcatArray = opts && opts.concatArray;
  let result = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    for (const [sourceKey, sourceValue] of Object.entries(source)) {
      const targetValue = target[sourceKey];
      if (isConcatArray && Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        result[sourceKey] = targetValue.concat(...sourceValue);
        //eslint-disable-next-line
      } else if (isObject(sourceValue) && target.hasOwnProperty(sourceKey)) {
        result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
      } else {
        Object.assign(result, { [sourceKey]: sourceValue });
      }
    }
  }
  return result;
}
