var pointList;

var data_time = document.getElementById("data_time");
var data_maxI = document.getElementById("data_maxI");
var data_M = document.getElementById("data_M");
var data_MT = document.getElementById("data_MT");
var data_depth = document.getElementById("data_depth");
var data_center = document.getElementById("data_center");
var data_comment = document.getElementById("data_comment");
// prettier-ignore
var areaLocation = {"石狩地方北部": [43.413076136110604, 141.50423485806385],"石狩地方中部": [43.004363323917126, 141.265892263131],"石狩地方南部": [42.84924657478391, 141.52522257956556],"渡島地方北部": [42.30495990804651, 140.24302380716867],"渡島地方東部": [41.89620123195108, 140.72479147606663],"渡島地方西部": [41.6103548578448, 140.261940870666],"檜山地方": [42.40669392818229, 140.00662116512424],"後志地方北部": [43.168162916271434, 140.79245081660082],"後志地方東部": [42.82952266260202, 140.84430958892796],"後志地方西部": [42.86452966727084, 140.37144161074474],"北海道奥尻島": [42.16125648807478, 139.48263233747767],"空知地方北部": [43.80076213210013, 141.9513407132416],"空知地方中部": [43.50506520820097, 141.9777257338273],"空知地方南部": [43.14469353829023, 141.9007444261101],"上川地方北部": [44.369640587041665, 142.39534307275272],"上川地方中部": [43.7321266379372, 142.65330223842963],"上川地方南部": [43.19139186937177, 142.5026823559761],"留萌地方中北部": [44.506040056412985, 141.91978367908024],"留萌地方南部": [43.94110962721661, 141.74162923931343],"宗谷地方北部": [45.168610073356746, 141.94274273440487],"宗谷地方南部": [44.84733615403924, 142.4237072173547],"北海道利尻礼文": [45.38331325623933, 141.01710632611488],"網走地方": [43.85902168445321, 144.51021983862216],"北見地方": [43.79815318400806, 143.65057927585232],"紋別地方": [44.15982248397798, 143.07562293009465],"胆振地方西部": [42.62632038599024, 140.89636543814933],"胆振地方中東部": [42.669981851544655, 141.63284452408075],"日高地方西部": [42.727857705070576, 142.42677760651338],"日高地方中部": [42.496842205374755, 142.59839940940228],"日高地方東部": [42.21311784898656, 142.99911251517182],"十勝地方北部": [43.36389246247973, 143.28589827687418],"十勝地方中部": [42.865366581587764, 143.25265869513692],"十勝地方南部": [42.51160882158158, 143.14854667650877],"釧路地方北部": [43.540409038130825, 144.4040161751411],"釧路地方中南部": [43.20547339450386, 144.47514184245338],"根室地方北部": [43.87573961096797, 145.05211791001526],"根室地方中部": [43.39079550996485, 145.02517341133068],"根室地方南部": [43.28387746168607, 145.51678274271578],"青森県津軽北部": [40.89494632478845, 140.66433639788775],"青森県津軽南部": [40.568101702331745, 140.37329507455243],"青森県三八上北": [40.59317590216319, 141.2108426175272],"青森県下北": [41.29505248952015, 141.09977309144398],"岩手県沿岸北部": [39.82601766476434, 141.75004851382414],"岩手県沿岸南部": [39.19676361110766, 141.73888317256265],"岩手県内陸北部": [39.94107082935164, 141.2072878200944],"岩手県内陸南部": [39.202583921350374, 141.17670547621236],"宮城県北部": [38.73602677067491, 141.14884434309204],"宮城県南部": [38.022840902586125, 140.63238633384702],"宮城県中部": [38.403597729733036, 141.14912897890193],"秋田県沿岸北部": [40.10050307494432, 140.07516694979452],"秋田県沿岸南部": [39.462842510901304, 140.22752459674572],"秋田県内陸北部": [40.177858013003494, 140.59042018630498],"秋田県内陸南部": [39.43966897322789, 140.56916301407847],"山形県庄内": [38.69763693789022, 139.90503712985515],"山形県最上": [38.783919156601314, 140.28865425310988],"山形県村山": [38.37855572454489, 140.27049237116682],"山形県置賜": [38.000071671844225, 139.96592722051193],"福島県中通り": [37.41510223108065, 140.44005090632888],"福島県浜通り": [37.386909153396054, 140.79802440114096],"福島県会津": [37.42266957313514, 139.70571648187507],"茨城県北部": [36.57801250721768, 140.43879745583473],"茨城県南部": [36.11151734872863, 140.23492188023587],"栃木県北部": [36.84978700176259, 139.7914407307856],"栃木県南部": [36.547810324598046, 139.84051398465726],"群馬県北部": [36.6938462568101, 138.91580093536044],"群馬県南部": [36.329981693729515, 139.08205961951165],"埼玉県北部": [36.11495647037258, 139.3479817501061],"埼玉県南部": [35.90575311145351, 139.53413842737453],"埼玉県秩父": [35.98753436552702, 138.97275907840384],"千葉県北東部": [35.64010479419512, 140.42363406940103],"千葉県北西部": [35.65776585641114, 140.13655082498374],"千葉県南部": [35.201182084743024, 140.04110230427827],"東京都２３区": [35.68895975748203, 139.74769838849076],"東京都多摩東部": [35.67180955664536, 139.4100397507034],"東京都多摩西部": [35.78273097877106, 139.14850869004658],"神津島": [34.214054551256595, 139.14495866990177],"伊豆大島": [34.73522092947883, 139.39765524371518],"新島": [34.38835323474585, 139.26923506556412],"三宅島": [34.088007019818875, 139.51705556272836],"八丈島": [33.10499768203257, 139.7987665437302],"小笠原": [26.672489932634335, 142.1521379688722],"神奈川県東部": [35.39877185068225, 139.55918678252183],"神奈川県西部": [35.416956132590194, 139.16304454258884],"新潟県上越": [36.992273053862945, 138.12767847190491],"新潟県中越": [37.24170455665815, 138.90926386171927],"新潟県下越": [37.90875133392292, 139.41065188250735],"新潟県佐渡": [38.045673944993474, 138.3782059750024],"富山県東部": [36.61854273124515, 137.41475303040286],"富山県西部": [36.60917334377006, 136.9405551032168],"石川県能登": [37.159820441231396, 136.95195907382632],"石川県加賀": [36.37858340480565, 136.65015274663767],"福井県嶺北": [35.95667138068731, 136.393443142415],"福井県嶺南": [35.54559501049151, 135.81513014975613],"山梨県中・西部": [35.62598708681416, 138.49886761439424],"山梨県東部・富士五湖": [35.60425148844662, 138.88704006174675],"長野県北部": [36.667919852086236, 138.11845666945257],"長野県中部": [36.15682794813788, 138.14974600805263],"長野県南部": [35.676786035768295, 137.81776185231277],"岐阜県飛騨": [36.09051183932872, 137.19778581505557],"岐阜県美濃東部": [35.48176004498256, 137.31585496996541],"岐阜県美濃中西部": [35.63015081695226, 136.71458631439066],"静岡県伊豆": [34.876189162276454, 138.94080399433471],"静岡県東部": [35.19674805932553, 138.78845869576742],"静岡県中部": [35.16270295027468, 138.23306317084987],"静岡県西部": [34.94417872111253, 137.8910991410442],"愛知県東部": [34.91233806238121, 137.43895612908952],"愛知県西部": [35.05955575408968, 137.1102437670095],"三重県北部": [35.01192222657143, 136.51146250099987],"三重県中部": [34.60905311603202, 136.28969815998488],"三重県南部": [34.19055937910805, 136.4052761127342],"滋賀県北部": [35.41188917094853, 136.17174974105595],"滋賀県南部": [35.026665941158534, 136.11616304325958],"京都府北部": [35.4803362553027, 135.20890939714974],"京都府南部": [35.02162238013128, 135.6860285457557],"大阪府北部": [34.822671367613374, 135.52425137488686],"大阪府南部": [34.43062695497913, 135.40583441215205],"兵庫県北部": [35.44469103814878, 134.73659676782387],"兵庫県南東部": [34.955056199127206, 135.12262548117758],"兵庫県南西部": [34.98705329592291, 134.5690635419024],"兵庫県淡路島": [34.376624302832006, 134.84097246538727],"奈良県": [34.30919399452728, 135.87146329930437],"和歌山県北部": [34.09295576596969, 135.32660549800872],"和歌山県南部": [33.7432051937904, 135.63999395290298],"鳥取県東部": [35.38177205805848, 134.24121707736603],"鳥取県中部": [35.38863644013633, 133.80434942068928],"鳥取県西部": [35.290990483938764, 133.3702021488749],"島根県東部": [35.28096563739954, 132.93938990895305],"島根県西部": [34.77861532282397, 132.2144747220875],"島根県隠岐": [36.248425244187416, 133.28443525398382],"岡山県北部": [35.08540636157218, 133.83942793869412],"岡山県南部": [34.72293711995913, 133.85053084207476],"広島県北部": [34.781179367058876, 132.73665636071735],"広島県南東部": [34.57418121946276, 133.16326223148323],"広島県南西部": [34.41230486413142, 132.52289054108584],"徳島県北部": [34.01539959070174, 134.17982473704785],"徳島県南部": [33.77823123439525, 134.3936385778539],"香川県東部": [34.26390966335682, 134.16589134202678],"香川県西部": [34.202755092544976, 133.8183747950894],"愛媛県東予": [33.93285543252425, 133.23497862018726],"愛媛県中予": [33.71574376150083, 132.87123005951503],"愛媛県南予": [33.28968934267261, 132.50747936396283],"高知県東部": [33.532622840598265, 134.06955227792312],"高知県中部": [33.60888774256235, 133.48654382315067],"高知県西部": [33.10134633394665, 132.9222740716661],"山口県北部": [34.379377462127216, 131.34525751534903],"山口県西部": [34.10819252799925, 131.11190132484452],"山口県東部": [34.149479621402484, 132.0539530229666],"山口県中部": [34.16756190717181, 131.6512676382673],"福岡県福岡": [33.61104445301425, 130.3818135771421],"福岡県北九州": [33.75614525439487, 130.90587625610837],"福岡県筑豊": [33.6285807317919, 130.7452086579841],"福岡県筑後": [33.25517904165481, 130.63099732792153],"佐賀県北部": [33.38132293536752, 129.91863012791168],"佐賀県南部": [33.23756363798394, 130.22750366493688],"長崎県北部": [33.19161215789655, 129.75916036064478],"長崎県南西部": [32.85577966928194, 129.86157041392104],"長崎県島原半島": [32.73529786083379, 130.2395115067745],"長崎県対馬": [34.48523804415473, 129.35885904239754],"長崎県壱岐": [33.783927692845886, 129.71550282603337],"長崎県五島": [32.68596801621318, 128.7354750127043],"熊本県阿蘇": [32.94470815669065, 131.1227958168304],"熊本県熊本": [32.72633227174993, 130.7593404669818],"熊本県球磨": [32.287672920028, 130.85450428157992],"熊本県天草・芦北": [32.35397669624828, 130.08966606045212],"大分県北部": [33.49932735368988, 131.37015331574224],"大分県中部": [33.22296848470551, 131.62627008407412],"大分県南部": [32.92528742016062, 131.75376044584698],"大分県西部": [33.16829797486957, 131.13833783608956],"宮崎県北部平野部": [32.46802285871476, 131.53295643560358],"宮崎県北部山沿い": [32.48292713110136, 131.26842050821472],"宮崎県南部平野部": [31.74370288221448, 131.3017591812182],"宮崎県南部山沿い": [31.906798184580463, 131.04689317911527],"鹿児島県薩摩": [31.664056835619366, 130.47320164763727],"鹿児島県大隅": [31.40165075861499, 130.91803678426353],"鹿児島県十島村": [29.84854217762944, 129.8735627338786],"鹿児島県甑島": [31.703681410484272, 129.73510333335048],"鹿児島県種子島": [30.593103698591435, 130.98451356177677],"鹿児島県屋久島": [30.35148299142745, 130.52492996253804],"鹿児島県奄美北部": [28.320329699342928, 129.43962273226677],"鹿児島県奄美南部": [27.78559029422137, 128.9500389422511],"沖縄県本島北部": [26.614091554664835, 128.0433068706771],"沖縄県本島中南部": [26.26841893546141, 127.77237232360443],"沖縄県久米島": [26.341854707748613, 126.77636759536826],"沖縄県大東島": [25.844678797964676, 131.24000003424484],"沖縄県宮古島": [24.79671359239748, 125.32069504783361],"沖縄県石垣島": [24.45863138319498, 124.21018194757309],"沖縄県与那国島": [24.455601971553808, 122.98820360322807],"沖縄県西表島": [24.344548650252342, 123.79889994651398],"色丹島": [43.79985896890051, 146.74623849569028],"国後島": [44.13289261498165, 145.92546447687894],"択捉島": [45.045633618554604, 147.81102671139362],"鷹島(甑島南方)": null,"津倉瀬(宇治群島北東方）": null,"うるま市・金武町境界部地先の埋立地": [26.434881146422825, 127.84251057707652]};

var eid;
var ESmarkerElm;
var newInfoDateTime = 0;
var map;
var jmaURL = [];
var jmaLURL = [];
var jmaXMLURL = [];
var narikakunURL = [];
var config;
var jmaURLHis = [];
var jmaXMLURLHis = [];
var narikakunURLHis = [];
var EQInfo = { originTime: null, maxI: null, mag: null, lat: null, lng: null, depth: null, epiCenter: null, comment: null };
var hinanjoLayers = [];
var hinanjoCheck = document.getElementById("hinanjo");
var ZoomBounds;

fetch("Resource/PointSeismicIntensityLocation.json")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    pointList = data;
    fetch("https://files.nakn.jp/earthquake/code/PointSeismicIntensityLocation.json")
      .then(function (res2) {
        return res2.json();
      })
      .then(function (data2) {
        pointList = data2;
      });
  });

var EEWData;
var axisDatas;
window.electronAPI.messageSend((event, request) => {
  if (request.action == "metaData") {
    eid = request.eid;

    var EEWURL = "https://www.data.jma.go.jp/svd/eew/data/nc/fc_hist/" + String(eid).slice(0, 4) + "/" + String(eid).slice(4, 6) + "/" + eid + "/index.html";
    fetch(EEWURL).then(function (res) {
      if (res.status == 200) {
        document.getElementById("EEWLink").style.display = "block";
        document.getElementById("EEWLink").addEventListener("click", function () {
          window.open(EEWURL);
        });
      }
    });

    if (request.urls && Array.isArray(request.urls)) {
      jmaURL = request.urls.filter(function (elm) {
        return elm && elm.includes("www.jma.go.jp");
      });
      jmaXMLURL = request.urls.filter(function (elm) {
        return elm && elm.includes("www.data.jma.go.jp");
      });
      narikakunURL = request.urls.filter(function (elm) {
        return elm && elm.includes("dev.narikakun.net");
      });
    }
    if (request.axisData && Array.isArray(request.axisData)) axisDatas = request.axisData;

    if (request.eew && !request.eew.canceled) {
      var eewItem = request.eew.data[request.eew.data.length - 1];

      EEWData = {
        category: "EEW",
        status: eewItem.is_training ? "訓練" : "通常",
        reportTime: eewItem.report_time,
        originTime: eewItem.origin_time,
        maxI: eewItem.maxInt,
        mag: eewItem.magnitude,
        lat: eewItem.latitude,
        lng: eewItem.longitude,
        depth: eewItem.depth,
        epiCenter: eewItem.region_name,
        comment: "",
        cancel: false,
        eew: true,
      };
    }
    Mapinit();
  } else if (request.action == "setting") {
    config = request.data;
    document.getElementById("areaName").textContent = config.home.name;
  }
});

//情報取得
function InfoFetch() {
  jma_ListReq();
  narikakun_ListReq(new Date().getFullYear(), new Date().getMonth() + 1);
  if (EEWData) ConvertEQInfo(EEWData);

  if (axisDatas) {
    axisDatas.forEach(function (elm) {
      axisInfoCtrl(elm.message);
    });
  }
  estimated_intensity_mapReq();
}

//地図初期化
function Mapinit() {
  if (map) return;
  map = new maplibregl.Map({
    container: "mapcontainer",
    center: [138.46, 32.99125],
    zoom: 4,
    attributionControl: true,
    pitchWithRotate: false,
    dragRotate: false,
    style: {
      version: 8,
      glyphs: "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",

      sources: {
        submarine: {
          type: "raster",
          tiles: ["./Resource/Submarine/{z}/{x}/{y}.jpg"],
          tileSize: 256,
          attribution: "NOAA, Peter Bird",
          minzoom: 0,
          maxzoom: 5,
        },
        v: {
          type: "vector",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/{z}/{x}/{y}.pbf"],
          attribution: "国土地理院",
          minzoom: 4,
          maxzoom: 16,
        },
        worldmap: {
          type: "geojson",
          data: "./Resource/World.json",
          tolerance: 2,
          attribution: "Natural Earth",
        },
        basemap: {
          type: "geojson",
          data: "./Resource/basemap.json",
          tolerance: 0.9,
          attribution: "気象庁",
        },
        prefmap: {
          type: "geojson",
          data: "./Resource/prefectures.json",
          tolerance: 0.9,
          attribution: "気象庁",
        },
        lake: {
          type: "geojson",
          data: "./Resource/lake.json",
          tolerance: 1.7,
          attribution: "国土数値情報",
        },
        estimated_intensity_map: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          tolerance: 0,
        },
        tile0: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile1: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile2: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 18,
        },
        tile4: {
          type: "raster",
          tiles: ["http://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "OpenStreetMap contributors",
          minzoom: 0,
          maxzoom: 19,
        },
        over0: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 2,
          maxzoom: 16,
        },
        over1: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/vbmd_colorrel/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 11,
          maxzoom: 18,
        },
        over2: {
          type: "raster",
          tiles: ["https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 12,
        },
        over3: {
          type: "raster",
          tiles: ["https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 12,
        },
        over4: {
          type: "raster",
          tiles: ["https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "国土地理院",
          minzoom: 7,
          maxzoom: 11,
        },
        over5: {
          type: "raster",
          tiles: ["https://www.jma.go.jp/tile/jma/transparent-cities/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "気象庁",
          minzoom: 2,
          maxzoom: 11,
        },
        hinanjo: {
          type: "raster",
          tiles: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII="],
          attribution: "国土地理院",
          minzoom: 10,
          maxzoom: 10,
        },
      },
      layers: [
        {
          id: "submarine",
          type: "raster",
          source: "submarine",
        },
        {
          id: "tile0",
          type: "raster",
          source: "tile0",
          layout: { visibility: "none" },
        },
        {
          id: "tile1",
          type: "raster",
          source: "tile1",
          layout: { visibility: "none" },
        },
        {
          id: "tile2",
          type: "raster",
          source: "tile2",
          layout: { visibility: "none" },
        },
        {
          id: "tile4",
          type: "raster",
          source: "tile4",
          layout: { visibility: "none" },
        },
        {
          id: "over0",
          type: "raster",
          source: "over0",
          layout: { visibility: "none" },
        },
        {
          id: "over1",
          type: "raster",
          source: "over1",
          layout: { visibility: "none" },
        },
        {
          id: "over2",
          type: "raster",
          source: "over2",
          layout: { visibility: "none" },
        },
        {
          id: "over3",
          type: "raster",
          source: "over3",
          layout: { visibility: "none" },
        },
        {
          id: "over4",
          type: "raster",
          source: "over4",
          layout: { visibility: "none" },
        },
        {
          id: "over5",
          type: "raster",
          source: "over5",
          layout: { visibility: "none" },
        },
        {
          id: "basemap_fill",
          type: "fill",
          source: "basemap",
          paint: {
            "fill-color": "#333",
            "fill-opacity": 1,
          },
        },
        {
          id: "basemap_LINE",
          type: "line",
          source: "basemap",
          minzoom: 6,
          paint: {
            "line-color": "#666",
            "line-width": 1,
          },
        },
        { id: "Int0", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["0"].background }, filter: ["==", "name", ""] },
        { id: "Int1", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["1"].background }, filter: ["==", "name", ""] },
        { id: "Int2", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["2"].background }, filter: ["==", "name", ""] },
        { id: "Int3", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["3"].background }, filter: ["==", "name", ""] },
        { id: "Int4", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["4"].background }, filter: ["==", "name", ""] },
        { id: "Int5-", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["5m"].background }, filter: ["==", "name", ""] },
        { id: "Int5+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["5p"].background }, filter: ["==", "name", ""] },
        { id: "Int6-", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["6m"].background }, filter: ["==", "name", ""] },
        { id: "Int6+", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["6p"].background }, filter: ["==", "name", ""] },
        { id: "Int7", type: "fill", source: "basemap", paint: { "fill-color": config.color.Shindo["7"].background }, filter: ["==", "name", ""] },
        { id: "LgInt1", type: "fill", source: "basemap", paint: { "fill-color": config.color.LgInt["1"].background }, filter: ["==", "name", ""] },
        { id: "LgInt2", type: "fill", source: "basemap", paint: { "fill-color": config.color.LgInt["2"].background }, filter: ["==", "name", ""] },
        { id: "LgInt3", type: "fill", source: "basemap", paint: { "fill-color": config.color.LgInt["3"].background }, filter: ["==", "name", ""] },
        { id: "LgInt4", type: "fill", source: "basemap", paint: { "fill-color": config.color.LgInt["4"].background }, filter: ["==", "name", ""] },

        {
          id: "prefmap_LINE",
          type: "line",
          source: "prefmap",
          paint: {
            "line-color": "#999",
            "line-width": 1,
          },
        },
        {
          id: "worldmap_fill",
          type: "fill",
          source: "worldmap",
          paint: {
            "fill-color": "#333",
            "fill-opacity": 1,
          },
        },
        {
          id: "worldmap_LINE",
          type: "line",
          source: "worldmap",
          paint: {
            "line-color": "#444",
            "line-width": 1,
          },
        },
        {
          id: "lake_fill",
          type: "fill",
          source: "lake",
          paint: {
            "fill-color": "#325385",
            "fill-opacity": 0.5,
          },
          minzoom: 6,
        },
        { id: "海岸線", type: "line", source: "v", "source-layer": "Cstline", filter: ["in", ["get", "vt_code"], ["literal", [5101, 5103]]], paint: { "line-color": "#999999", "line-offset": 0, "line-width": 1 }, layout: { visibility: "none" } },
        { id: "河川中心線人工水路地下", type: "line", source: "v", "source-layer": "RvrCL", filter: ["==", ["get", "vt_code"], 5322], paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 }, layout: { visibility: "none" } },
        { id: "河川中心線枯れ川部", type: "line", source: "v", "source-layer": "RvrCL", filter: ["==", ["get", "vt_code"], 5302], paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 }, layout: { visibility: "none" } },
        { id: "河川中心線", type: "line", source: "v", "source-layer": "RvrCL", filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]], paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 }, layout: { visibility: "none" } },
        { id: "海岸線堤防等に接する部分破線", type: "line", source: "v", "source-layer": "Cstline", filter: ["==", ["get", "vt_code"], 5103], layout: { "line-cap": "round", visibility: "none" }, paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "水涯線", type: "line", source: "v", "source-layer": "WL", paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 }, layout: { visibility: "none" } },
        { id: "水涯線堤防等に接する部分破線", type: "line", source: "v", "source-layer": "WL", filter: ["in", ["get", "vt_code"], ["literal", [5203, 5233]]], layout: { "line-cap": "round", visibility: "none" }, paint: { "line-color": "rgba(36,104,203,0.25)", "line-width": 2 } },
        { id: "水部表記線polygon", type: "fill", source: "v", "source-layer": "WRltLine", filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "rgba(50,83,132,0.2)", "fill-outline-color": "rgba(36,104,203,0.25)" }, layout: { visibility: "none" } },
        { id: "行政区画界線国の所属界", maxzoom: 8, type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1221], layout: { "line-cap": "square", visibility: "none" }, paint: { "line-color": "#999", "line-width": 1 } },
        { id: "道路中心線ZL4-10国道", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]]], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 3 } },
        { id: "道路中心線ZL4-10高速", maxzoom: 11, minzoom: 9, type: "line", source: "v", "source-layer": "RdCL", filter: ["==", ["get", "vt_rdctg"], "高速自動車国道等"], layout: { "line-cap": "round", "line-join": "round", "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 3 } },
        { id: "道路中心線色0", minzoom: 11, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], 17, ["all", ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "鉄道中心線0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "鉄道中心線旗竿0", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "道路中心線ククリ橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]], ["!", ["all", ["in", ["get", "vt_rdctg"], ["literal", ["市区町村道等", "その他", "不明"]]], ["==", ["get", "vt_rnkwidth"], "3m-5.5m未満"]]]], 14, ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "道路中心線色橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 0], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "建築物0", type: "fill", source: "v", "source-layer": "BldA", filter: ["==", ["get", "vt_lvorder"], 0], paint: { "fill-color": "rgba(127.5,127.5,127.5,0.15)" }, layout: { visibility: "none" } },
        { id: "鉄道中心線橋0", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "鉄道中心線旗竿橋0", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["in", ["get", "vt_railstate"], "橋・高架"], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 0]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "道路中心線色1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]]], layout: { visibility: "none", "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 4, "line-dasharray": [1, 1] } },
        { id: "鉄道中心線1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "鉄道中心線旗竿1", minzoom: 14, maxzoom: 17, type: "line", source: "v", "source-layer": "RailCL", filter: ["all", ["==", ["get", "vt_rtcode"], "JR"], ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["!=", ["get", "vt_sngldbl"], "駅部分"], ["==", ["get", "vt_lvorder"], 1]], paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 2.5, "line-dasharray": [1, 1] }, layout: { visibility: "none" } },
        { id: "道路中心線ククリ橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["step", ["zoom"], ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]], ["!", ["all", ["in", ["get", "vt_rdctg"], ["literal", ["市区町村道等", "その他", "不明"]]], ["==", ["get", "vt_rnkwidth"], "3m-5.5m未満"]]]], 14, ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713]]]]], layout: { visibility: "none", "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"] }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "道路中心線色橋1", minzoom: 11, maxzoom: 17, type: "line", source: "v", "source-layer": "RdCL", filter: ["all", ["==", ["get", "vt_lvorder"], 1], ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]]], layout: { "line-join": "round", "line-round-limit": 1.57, "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "道路縁", minzoom: 17, type: "line", source: "v", "source-layer": "RdEdg", layout: { "line-cap": "square", "line-sort-key": ["get", "vt_drworder"], visibility: "none" }, paint: { "line-color": "rgba(128,128,128,0.22)", "line-width": 1.5 } },
        { id: "行政区画界線25000市区町村界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1212], layout: { "line-cap": "square", visibility: "none" }, paint: { "line-color": "#666666", "line-width": 1 } },
        { id: "行政区画界線25000都府県界及び北海道総合振興局・振興局界", type: "line", source: "v", "source-layer": "AdmBdry", filter: ["==", ["get", "vt_code"], 1211], layout: { "line-cap": "round", visibility: "none" }, paint: { "line-color": "#999999", "line-width": 1 } },
        // prettier-ignore
        {id: "注記シンボル付きソート順100以上",type: "symbol",source: "v","source-layer": "Anno",filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]]],layout: { visibility: "none" , "icon-allow-overlap": false, "icon-image": ["step", ["zoom"], ["match", ["get", "vt_code"], [1301, 1302, 1303], "人口50万人未満-500", ""], 6, ["match", ["get", "vt_code"], 1301, "人口100万人以上-500", 1302, "人口50万-100万人未満-500", 1303, "人口50万人未満-500", 6368, "主要な港-500", 6376, "主要な空港-500", 7201, "標高点（測点）", ""], 8, ["match", ["get", "vt_code"], 1401, "都道府県所在地-100", 1402, "市役所・東京都の区役所（都道府県所在都市以外）-20", 1403, "町・村-20", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 2941, "インターチェンジ-20", 2942, "ジャンクション-20", 2945, "スマートインターチェンジ-20", 3221, "灯台-20", 6351, "採鉱地", 6367, "特定重要港-20", 6368, "重要港-20", 6375, "国際空港-20", 6376, "国際空港以外の拠点空港等-20", 7102, "標高点（測点）", 7201, "標高点（測点）", 7221, "火山-20", ""], 11, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3212, "高等学校・中等教育学校", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3243, "病院", 3261, "工場-20", 4102, "風車", 4103, "油井・ガス井", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 6367, "特定重要港-20", 6371, "国際空港-20", 6373, "自衛隊等の飛行場-20", 6375, "国際空港-20", 6381, "自衛隊-20", 7101, "電子基準点", 7102, "三角点", 7201, "標高点（測点）", 8103, "発電所等", ""], 14, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 2901, "国道番号-20", 3201, "官公署", 3202, "裁判所", 3203, "税務署", 3204, "外国公館", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3211, "交番", 3212, "高等学校・中等教育学校", [3213, 3214], "小学校", 3215, "老人ホーム", 3216, "博物館法の登録博物館・博物館相当施設", 3217, "図書館", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3242, "消防署", 3243, "病院", 3244, "保健所", 4101, "煙突", 4102, "風車", 4103, "油井・ガス井", 4104, "記念碑", 4105, "自然災害伝承碑", 6301, "墓地", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6323, "竹林", 6324, "ヤシ科樹林", 6325, "ハイマツ地", 6326, "笹地", 6327, "荒地", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 7101, "電子基準点", 7102, "三角点", 7103, "水準点", 7201, "標高点（測点）", 7711, "水深-20", 8103, "発電所等", 8105, "電波塔", ""]], "icon-size": ["let", "size", ["match", ["get", "vt_code"], [7221, 8103], 0.4, [631, 632, 633, 653, 661, 662, 1301, 1302, 1303, 1401, 1402, 1403, 2903, 2904, 2941, 2942, 2945, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244, 4101, 4102, 4103, 4104, 4105, 6301, 6367, 6368, 6371, 6375, 6376, 6331, 6332, 6342, 6351, 6361, 6362, 6381, 7101, 7102, 7103, 8105], 0.5, [6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 7201], 0.6, 621, 1, 1], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, ["var", "size"]], 8, ["*", 0.75, ["var", "size"]], 11, ["var", "size"], 14, ["var", "size"], 16, ["*", 1.5, ["var", "size"]]]], "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["top", "bottom", "left", "right"], "text-writing-mode": ["horizontal"] },paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [661, 662], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 },},
        { id: "注記シンボルなし縦ソート順100以上", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["==", ["get", "vt_arrng"], 2]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["==", ["get", "vt_arrng"], 2]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["==", ["get", "vt_arrng"], 2]]], layout: { visibility: "none", "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["vertical"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記シンボルなし横ソート順100以上", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [313, 353, 361, 413, 423, 522, 523, 533, 534, 611, 612, 613, 615, 671, 673, 681, 720, 860, 870, 882, 883, 884, 886, 887, 888, 890, 899, 7104]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]]], layout: { visibility: "none", "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記角度付き線", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "LineString"], ["!", ["in", ["get", "vt_code"], ["literal", [2901, 2903, 2904, 7701]]]]], 16, ["all", ["==", ["geometry-type"], "LineString"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["!", ["in", ["get", "vt_code"], ["literal", [2901, 2903, 2904, 7701]]]]], 17, ["all", ["==", ["geometry-type"], "LineString"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["!", ["in", ["get", "vt_code"], ["literal", [2901, 2903, 2904, 7701]]]]]], layout: { visibility: "none", "icon-allow-overlap": false, "symbol-placement": "line-center", "text-pitch-alignment": "viewport", "text-rotation-alignment": "map", "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 521, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, [422, 531], ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["var", "size"], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["center"], "text-writing-mode": ["horizontal", "vertical"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記シンボル付きソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]]], layout: { visibility: "none", "icon-allow-overlap": false, "icon-image": ["step", ["zoom"], ["match", ["get", "vt_code"], [1301, 1302, 1303], "人口50万人未満-500", ""], 6, ["match", ["get", "vt_code"], 1301, "人口100万人以上-500", 1302, "人口50万-100万人未満-500", 1303, "人口50万人未満-500", 6368, "主要な港-500", 6376, "主要な空港-500", 7201, "標高点（測点）", ""], 8, ["match", ["get", "vt_code"], 1401, "都道府県所在地-100", 1402, "市役所・東京都の区役所（都道府県所在都市以外）-20", 1403, "町・村-20", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 2941, "インターチェンジ-20", 2942, "ジャンクション-20", 2945, "スマートインターチェンジ-20", 3221, "灯台-20", 6351, "採鉱地", 6367, "特定重要港-20", 6368, "重要港-20", 6375, "国際空港-20", 6376, "国際空港以外の拠点空港等-20", 7102, "標高点（測点）", 7201, "標高点（測点）", 7221, "火山-20", ""], 11, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 631, "高等学校・中等教育学校", 632, "高等学校・中等教育学校", 633, "高等学校・中等教育学校", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 2903, "都市高速道路番号-20", 2904, "高速道路番号-20", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3212, "高等学校・中等教育学校", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3243, "病院", 3261, "工場-20", 4102, "風車", 4103, "油井・ガス井", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 6367, "特定重要港-20", 6371, "国際空港-20", 6373, "自衛隊等の飛行場-20", 6375, "国際空港-20", 6381, "自衛隊-20", 7101, "電子基準点", 7102, "三角点", 7201, "標高点（測点）", 8103, "発電所等", ""], 14, ["match", ["get", "vt_code"], 621, "都道府県所在地-20", 653, "発電所等", 661, "神社", 662, "寺院", 2901, "国道番号-20", 3201, "官公署", 3202, "裁判所", 3203, "税務署", 3204, "外国公館", 3205, "市役所・東京都の区役所", 3206, "町村役場・政令指定都市の区役所", 3211, "交番", 3212, "高等学校・中等教育学校", [3213, 3214], "小学校", 3215, "老人ホーム", 3216, "博物館法の登録博物館・博物館相当施設", 3217, "図書館", 3218, "郵便局", 3221, "灯台", 3231, "神社", 3232, "寺院", 3241, "警察署", 3242, "消防署", 3243, "病院", 3244, "保健所", 4101, "煙突", 4102, "風車", 4103, "油井・ガス井", 4104, "記念碑", 4105, "自然災害伝承碑", 6301, "墓地", 6311, "田", 6312, "畑", 6313, "茶畑", 6314, "果樹園", 6321, "広葉樹林", 6322, "針葉樹林", 6323, "竹林", 6324, "ヤシ科樹林", 6325, "ハイマツ地", 6326, "笹地", 6327, "荒地", 6331, "温泉", 6332, "噴火口・噴気口", 6342, "城跡", 6351, "採鉱地", 6361, "港湾", 6362, "漁港", 7101, "電子基準点", 7102, "三角点", 7103, "水準点", 7201, "標高点（測点）", 7711, "水深-20", 8103, "発電所等", 8105, "電波塔", ""]], "icon-size": ["let", "size", ["match", ["get", "vt_code"], [7221, 8103], 0.4, [631, 632, 633, 653, 661, 662, 1301, 1302, 1303, 1401, 1402, 1403, 2903, 2904, 2941, 2942, 2945, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244, 4101, 4102, 4103, 4104, 4105, 6301, 6367, 6368, 6371, 6375, 6376, 6331, 6332, 6342, 6351, 6361, 6362, 6381, 7101, 7102, 7103, 8105], 0.5, [6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 7201], 0.6, 621, 1, 1], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, ["var", "size"]], 8, ["*", 0.75, ["var", "size"]], 11, ["var", "size"], 14, ["var", "size"], 16, ["*", 1.5, ["var", "size"]]]], "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["var", "size"], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [2941, 2942], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-radial-offset": 0.5, "text-variable-anchor": ["top", "bottom", "left", "right"], "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["let", "color", ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(200,200,200,0)", ["var", "color"]], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(200,200,200,0)", ["var", "color"]]]], "text-halo-color": ["step", ["zoom"], ["match", ["get", "vt_code"], [631, 632, 633, 6368, 6376], "rgba(50,50,50,0)", "rgba(50,50,50,1)"], 14, ["match", ["get", "vt_code"], [3212, 3213, 3214], "rgba(50,50,50,0)", "rgba(50,50,50,1)"]], "text-halo-width": 1 } },
        { id: "注記シンボルなし縦ソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["==", ["get", "vt_arrng"], 2]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["==", ["get", "vt_arrng"], 2]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["==", ["get", "vt_arrng"], 2]]], layout: { visibility: "none", "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 521, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["match", ["get", "vt_code"], [343, 352], ["*", 0.9, ["var", "size"]], ["var", "size"]], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, [422, 531], ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [412], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["vertical"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        { id: "注記シンボルなし横ソート順100未満", type: "symbol", source: "v", "source-layer": "Anno", filter: ["step", ["zoom"], ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 16, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]], 17, ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [110, 120, 130, 140, 210, 220, 311, 312, 314, 315, 316, 321, 322, 323, 331, 332, 333, 334, 341, 342, 343, 344, 345, 346, 347, 348, 351, 352, 411, 412, 421, 422, 431, 432, 441, 511, 521, 531, 532, 634, 651, 800, 810, 820, 822, 830, 831, 832, 840, 841, 842, 843, 850, 880, 881, 885, 889, 2943, 2944]]], ["any", ["==", ["get", "vt_arrng"], 1], ["!", ["has", "vt_arrng"]]]]], layout: { visibility: "none", "symbol-sort-key": ["match", ["get", "vt_code"], 110, 17, 120, 31, 130, 19, 140, 8, 150, 176, 210, 37, 212, 182, 220, 72, 311, 11, 312, 20, 313, 148, 314, 15, 315, 21, 316, 30, 321, 23, 322, 22, 323, 52, 331, 50, 332, 51, 333, 10, 334, 42, 341, 28, 342, 41, 343, 49, 344, 12, 345, 48, 346, 38, 347, 47, 348, 14, 351, 9, 352, ["match", ["get", "vt_text"], "択捉島", 6, 40], 353, 147, 361, 175, 411, 32, 412, 86, 413, 145, 421, 33, 422, 74, 423, 146, 431, 64, 432, 84, 441, 63, 511, 85, 521, 76, 522, 130, 523, 108, 531, 95, 532, 80, 533, 106, 534, 115, 611, 100, 612, 131, 613, 101, 614, 183, 615, 104, 621, 36, 623, 184, 631, 69, 632, 70, 633, 71, 634, 93, 641, 185, 642, 186, 651, 94, 652, 187, 653, 127, 654, 188, 661, 128, 662, 129, 671, 118, 672, 189, 673, 137, 681, 119, 710, 190, 720, 155, 730, 191, 800, 35, 810, 29, 820, 24, 822, 78, 830, 55, 831, 57, 832, 77, 833, 192, 840, 44, 841, 43, 842, 58, 843, 59, 850, 39, 860, 117, 870, 116, 880, 98, 881, 99, 882, 123, 883, 134, 884, 125, 885, 68, 886, 121, 887, 132, 888, 138, 889, 97, 890, 158, 899, 160, 999, 193, 1301, ["match", ["get", "vt_text"], "東京", 1, ["さいたま", "横浜", "大阪"], 2, 3], 1302, ["match", ["get", "vt_text"], "千葉", 4, 5], 1303, ["match", ["get", "vt_text"], ["稚内", "根室", "青森", "盛岡", "秋田", "山形", "福島", "水戸", "前橋", "甲府", "長野", "富山", "金沢", "福井", "岐阜", "津", "大津", "奈良", "和歌山", "鳥取", "松江", "山口", "徳島", "高松", "高知", "佐賀", "長崎", "大分", "宮崎", "那覇"], 6, 7], 1401, 16, 1402, 25, 1403, 26, 2901, 92, 2902, 177, 2903, 54, 2904, 53, 2941, 34, 2942, 91, 2943, 87, 2944, 88, 2945, 46, 3200, 178, 3201, 107, 3202, 102, 3203, 103, 3204, 157, 3205, 18, 3206, 27, 3211, 135, 3212, 79, 3213, 89, 3214, 90, 3215, 159, 3216, 139, 3217, 136, 3218, 133, 3221, 75, 3231, 153, 3232, 154, 3241, 96, 3242, 124, 3243, 120, 3244, 122, 3261, 126, 4101, 143, 4102, 141, 4103, 142, 4104, 149, 4105, 151, 5801, 60, 6301, 144, 6311, 161, 6312, 162, 6313, 163, 6314, 164, 6321, 165, 6322, 166, 6323, 167, 6324, 168, 6325, 169, 6326, 170, 6327, 171, 6331, 56, 6332, 150, 6341, 81, 6342, 140, 6351, 109, 6361, 67, 6362, 105, 6367, 65, 6368, 66, 6371, 62, 6373, 83, 6375, 61, 6376, 73, 6381, 82, 7101, 112, 7102, 110, 7103, 113, 7104, 172, 7105, 179, 7106, 180, 7107, 194, 7108, 195, 7111, 196, 7121, 197, 7122, 198, 7131, 199, 7188, 181, 7201, 45, 7202, 200, 7211, 201, 7212, 202, 7221, 13, 7288, 203, 7299, 204, 7601, 173, 7621, 174, 7711, 114, 8103, 152, 8105, 156, 0], "text-allow-overlap": false, "text-anchor": ["match", ["get", "vt_code"], [431, 532, 533, 720], "top-left", [2941, 2942, 2943, 2944, 2945], "left", ["case", ["==", ["get", "arrng"], 2], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-right", ["==", ["get", "vt_dsppos"], "CT"], "right", ["==", ["get", "vt_dsppos"], "RT"], "bottom-right", ["==", ["get", "vt_dsppos"], "LC"], "top", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "bottom", ["==", ["get", "vt_dsppos"], "LB"], "top-left", ["==", ["get", "vt_dsppos"], "CB"], "left", ["==", ["get", "vt_dsppos"], "RB"], "bottom-left", "center"], ["case", ["==", ["get", "vt_dsppos"], "LT"], "top-left", ["==", ["get", "vt_dsppos"], "CT"], "top", ["==", ["get", "vt_dsppos"], "RT"], "top-right", ["==", ["get", "vt_dsppos"], "LC"], "left", ["==", ["get", "vt_dsppos"], "CC"], "center", ["==", ["get", "vt_dsppos"], "RC"], "right", ["==", ["get", "vt_dsppos"], "LB"], "bottom-left", ["==", ["get", "vt_dsppos"], "CB"], "bottom", ["==", ["get", "vt_dsppos"], "RB"], "bottom-right", "center"]]], "text-font": ["match", ["get", "vt_code"], [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842], ["literal", ["NotoSerifJP-SemiBold"]], ["literal", ["NotoSansJP-Regular"]]], "text-justify": "auto", "text-size": ["let", "size", ["match", ["get", "vt_code"], [361, 1403, 7101, 7102, 7103, 7201, 7221], 10, [334, 730], 11, [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 521, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12, [343, 1402, 7711], 13, [311, 346, 347, 413, 422, 1303], 14, [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15, [130, 1301, 1401], 16, [140, 333, 351], 18, [110, 120, 341, 344, 345], 20, [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24, 10], ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.6, ["var", "size"]], 8, ["match", ["get", "vt_code"], [343, 352], ["*", 0.9, ["var", "size"]], ["var", "size"]], 11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, [422, 531], ["*", 0.7, ["var", "size"]], ["var", "size"]], 12, ["var", "size"], 14, ["match", ["get", "vt_code"], [412], ["*", 1.3, ["var", "size"]], ["var", "size"]], 17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]]]], "text-field": ["get", "vt_text"], "text-max-width": 100, "text-writing-mode": ["horizontal"] }, paint: { "text-color": ["match", ["get", "vt_code"], 521, "rgba(80,80,80,1)", 348, "rgba(150,150,150,1)", [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)", [7372, 7711], "rgba(80,80,80,1)", 7352, "rgba(50,50,50,1)", [2901, 2903, 2904], "rgba(255,255,255,1)", [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)", 220, "rgba(150,150,150,1)", 312, "rgba(150,150,150,1)", [333, 346], "rgba(150,150,150,1)", [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)", "rgba(200,200,200,1)"], "text-halo-color": "rgba(50,50,50,1)", "text-halo-width": 1 } },
        {
          id: "hinanjo",
          type: "raster",
          source: "hinanjo",
          layout: { visibility: "none" },
          minzoom: 10,
        },
      ],
    },
  });
  map.touchZoomRotate.disableRotation();
  ZoomBounds = new maplibregl.LngLatBounds();

  map.on("sourcedataloading", (e) => {
    if (e.sourceId == "hinanjo" && hinanjoCheck.checked && e.tile != undefined) {
      var ca = e.tile.tileID.canonical;
      if (map.getLayer("hinanjo_eq_" + ca.x + ca.y + ca.z)) map.removeLayer("hinanjo_eq_" + ca.x + ca.y + ca.z);
      if (map.getSource("hinanjo_eq_" + ca.x + ca.y + ca.z)) map.removeSource("hinanjo_eq_" + ca.x + ca.y + ca.z);
      if (map.getLayer("hinanjo_ts_" + ca.x + ca.y + ca.z)) map.removeLayer("hinanjo_ts_" + ca.x + ca.y + ca.z);
      if (map.getSource("hinanjo_ts_" + ca.x + ca.y + ca.z)) map.removeSource("hinanjo_ts_" + ca.x + ca.y + ca.z);

      map.addSource("hinanjo_eq_" + ca.x + ca.y + ca.z, {
        type: "geojson",
        data: "https://cyberjapandata.gsi.go.jp/xyz/skhb04/" + ca.z + "/" + ca.x + "/" + ca.y + ".geojson",
      });

      map.addLayer({
        id: "hinanjo_eq_" + ca.x + ca.y + ca.z,
        type: "circle",
        source: "hinanjo_eq_" + ca.x + ca.y + ca.z,
        layout: { visibility: hinanjoCheck.checked ? "visible" : "none" },
        paint: {
          "circle-color": "#bf8715",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#222",
        },
        minzoom: 10,
        maxzoom: 22,
      });

      map.addSource("hinanjo_ts_" + ca.x + ca.y + ca.z, {
        type: "geojson",
        data: "https://cyberjapandata.gsi.go.jp/xyz/skhb05/" + ca.z + "/" + ca.x + "/" + ca.y + ".geojson",
      });

      map.addLayer({
        id: "hinanjo_ts_" + ca.x + ca.y + ca.z,
        type: "circle",
        source: "hinanjo_ts_" + ca.x + ca.y + ca.z,
        layout: { visibility: hinanjoCheck.checked ? "visible" : "none" },
        paint: {
          "circle-color": "#2488c7",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#222",
        },
        minzoom: 10,
        maxzoom: 22,
      });

      map.on("click", "hinanjo_eq_" + ca.x + ca.y + ca.z, hinanjoPopup);
      map.on("click", "hinanjo_ts_" + ca.x + ca.y + ca.z, hinanjoPopup);
      hinanjoLayers.push("hinanjo_eq_" + ca.x + ca.y + ca.z, "hinanjo_ts_" + ca.x + ca.y + ca.z);
    }
  });

  hinanjoCheck.addEventListener("change", function () {
    map.setLayoutProperty("hinanjo", "visibility", hinanjoCheck.checked ? "visible" : "none");
    hinanjoLayers.forEach(function (elm) {
      map.setLayoutProperty(elm, "visibility", hinanjoCheck.checked ? "visible" : "none");
    });
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  var layerButton = document.createElement("button");
  layerButton.innerText = "layers";
  layerButton.title = "レイヤーの切り替え";
  layerButton.setAttribute("id", "layerSwitch_toggle");
  layerButton.addEventListener("click", function () {
    document.getElementById("menu_wrap").classList.toggle("menu_show");
  });

  var layerMenu = document.createElement("div");
  layerMenu.setAttribute("id", "estimated_intensity_map_toggle");
  layerMenu.classList.add("menu");
  layerMenu.innerHTML = "<h3>地震情報選択</h3>";
  var radioWrap = document.createElement("div");
  radioWrap.classList.add("radio");
  radioWrap.innerHTML = '<label id="estshindomap_radioWrap"><input type="radio" name="mapFillSelect" value="fill1" id="estshindomap_radio">推計震度分布図</label>';
  radioWrap.innerHTML += '<label><input type="radio" name="mapFillSelect" value="fill2" checked>各地の震度</label>';
  radioWrap.innerHTML += '<label id="LgInt_radioWrap"><input type="radio" name="mapFillSelect" value="fill4">各地の長周期地震動階級</label>';

  var checkWrap = document.createElement("div");
  checkWrap.classList.add("check");
  checkWrap.innerHTML = '<label><input type="checkbox" id="mapFillToggle" value="fill3" checked>地図の塗りつぶし</label>';

  layerMenu.appendChild(radioWrap);
  layerMenu.appendChild(checkWrap);

  var TLControlWrapper = document.createElement("div");
  TLControlWrapper.className = "maplibregl-ctrl maplibregl-ctrl-group transparent-ctrl";
  TLControlWrapper.appendChild(layerButton);
  TLControlWrapper.appendChild(layerMenu);
  map.addControl(
    {
      onAdd: function () {
        return TLControlWrapper;
      },
      onRemove: function () {},
    },
    "top-left"
  );
  document.getElementById("mapFillToggle").addEventListener("change", function () {
    MapFill = this.checked;
    mapFillDraw();
  });

  document.getElementsByName("mapFillSelect").forEach(function (elm) {
    elm.addEventListener("change", function () {
      mapFillSwitch(elm.value);
    });
  });

  var continueButton = document.createElement("button");
  continueButton.innerText = "sync";
  continueButton.title = "情報を再取得";
  continueButton.className = "material-icons-round";
  continueButton.addEventListener("click", function () {
    location.reload();
  });

  var homeButton = document.createElement("button");
  homeButton.innerText = "home";
  homeButton.title = "ズーム範囲をリセット";
  homeButton.className = "material-icons-round";
  homeButton.addEventListener("click", mapZoomReset);

  var cbWrapper = document.createElement("div");
  cbWrapper.className = "maplibregl-ctrl maplibregl-ctrl-group";
  cbWrapper.appendChild(continueButton);
  cbWrapper.appendChild(homeButton);
  map.addControl({
    onAdd: function () {
      return cbWrapper;
    },
    onRemove: function () {},
  });

  var zoomLevelContinue = function () {
    var currentZoom = map.getZoom();
    document.getElementById("mapcontainer").classList.remove("zoomLevel_1", "zoomLevel_2", "zoomLevel_3", "zoomLevel_4", "popup_show");

    if (currentZoom < 4.5) document.getElementById("mapcontainer").classList.add("zoomLevel_1");
    else if (currentZoom < 6) document.getElementById("mapcontainer").classList.add("zoomLevel_2");
    else if (currentZoom < 8) document.getElementById("mapcontainer").classList.add("zoomLevel_3");
    else document.getElementById("mapcontainer").classList.add("zoomLevel_4");
  };
  zoomLevelContinue();
  map.on("zoom", zoomLevelContinue);
  map.on("load", function () {
    zoomLevelContinue();
    mapFillSwitch();
    layerSelect(config.data.layer);
    radioSet("mapSelect", config.data.layer);
    InfoFetch();

    config.data.overlay.forEach(function (elm) {
      overlaySelect(elm, true);
      if (document.getElementById(elm)) document.getElementById(elm).checked = true;
    });
  });

  if (config.home.ShowPin) {
    const img = document.createElement("img");
    img.src = "./img/homePin.svg";
    img.classList.add("homeIcon");

    new maplibregl.Marker({ element: img }).setLngLat([config.home.longitude, config.home.latitude]).addTo(map);
  }
}

document.getElementById("menu_wrap").addEventListener("click", function () {
  document.getElementById("menu_wrap").classList.remove("menu_show");
});
document.getElementById("layerSwitch_close").addEventListener("click", function () {
  document.getElementById("menu_wrap").classList.remove("menu_show");
});
document.getElementById("menu").addEventListener("click", function (e) {
  e.stopPropagation();
});

var mapSelect = document.getElementsByName("mapSelect");
var tilemapActive = false;
function layerSelect(layerName) {
  map.setLayoutProperty("tile0", "visibility", "none");
  map.setLayoutProperty("tile1", "visibility", "none");
  map.setLayoutProperty("tile2", "visibility", "none");
  map.setLayoutProperty("tile4", "visibility", "none");

  if (layerName) {
    tilemapActive = true;
    map.setLayoutProperty(layerName, "visibility", "visible");
  } else tilemapActive = false;
  if (!tilemapActive && overlayCount == 0) {
    map.setLayoutProperty("basemap_fill", "visibility", "visible");
    map.setLayoutProperty("worldmap_fill", "visibility", "visible");
  } else {
    map.setLayoutProperty("basemap_fill", "visibility", "none");
    map.setLayoutProperty("worldmap_fill", "visibility", "none");
  }
  config.data.layer = layerName;
  window.electronAPI.messageReturn({
    action: "ChangeConfig",
    from: "Other",
    data: config,
  });
}

mapSelect.forEach(function (elm) {
  elm.addEventListener("change", function () {
    layerSelect(this.value);
  });
});
var overlayCount = 0;
function overlaySelect(layerName, checked) {
  if (layerName == "kmoni_points") return;
  var visibility = checked ? "visible" : "none";
  if (layerName !== "hinanjo" && layerName !== "kmoni_points") {
    if (layerName == "gsi_vector") {
      ["海岸線", "河川中心線人工水路地下", "河川中心線枯れ川部", "河川中心線", "海岸線堤防等に接する部分破線", "水涯線", "水涯線堤防等に接する部分破線", "水部表記線polygon", "行政区画界線国の所属界", "道路中心線ZL4-10国道", "道路中心線ZL4-10高速", "道路中心線色0", "鉄道中心線0", "鉄道中心線旗竿0", "道路中心線ククリ橋0", "道路中心線色橋0", "建築物0", "鉄道中心線橋0", "鉄道中心線旗竿橋0", "道路中心線色1", "鉄道中心線1", "鉄道中心線旗竿1", "道路中心線ククリ橋1", "道路中心線色橋1", "道路縁", "行政区画界線25000市区町村界", "行政区画界線25000都府県界及び北海道総合振興局・振興局界", "注記シンボル付きソート順100以上", "注記シンボルなし縦ソート順100以上", "注記シンボルなし横ソート順100以上", "注記角度付き線", "注記シンボル付きソート順100未満", "注記シンボルなし縦ソート順100未満", "注記シンボルなし横ソート順100未満"].forEach(function (elm) {
        map.setLayoutProperty(elm, "visibility", visibility);
      });
    } else {
      overlayCount += checked ? 1 : -1;
      map.setLayoutProperty(layerName, "visibility", visibility);
    }

    if (layerName == "over2") document.getElementById("legend1").style.display = checked ? "inline-block" : "none";
    else if (layerName == "over3") {
      over3_visiblity = checked;
      document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
    } else if (layerName == "over4") {
      over4_visiblity = checked;
      document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
    }

    if (!tilemapActive && overlayCount == 0) {
      map.setLayoutProperty("basemap_fill", "visibility", "visible");
      map.setLayoutProperty("worldmap_fill", "visibility", "visible");
    } else {
      map.setLayoutProperty("basemap_fill", "visibility", "none");
      map.setLayoutProperty("worldmap_fill", "visibility", "none");
    }
  }
  var selectedLayer = [];
  document.getElementsByName("overlaySelect").forEach(function (elm) {
    if (elm.checked) selectedLayer.push(elm.value);
  });

  config.data.overlay = selectedLayer;
  window.electronAPI.messageReturn({
    action: "ChangeConfig",
    from: "Other",
    data: config,
  });
}
document.getElementsByName("overlaySelect").forEach(function (elm) {
  elm.addEventListener("change", function () {
    overlaySelect(this.value, this.checked);
  });
});
var estShindoMapDraw = false;
var ShindoMapDraw = true;
var LgIntMapDraw = false;
var MapFill = true;
function mapFillSwitch(val) {
  if (val) {
    estShindoMapDraw = val == "fill1";
    ShindoMapDraw = val == "fill2";
    LgIntMapDraw = val == "fill4";
  }

  if (LgIntMapDraw) {
    document.querySelectorAll(".ShindoIcon,.MaxShindoIcon,#ShindoSample").forEach(function (elm) {
      elm.style.display = "none";
    });
    document.querySelectorAll(".LgIntIcon,.MaxLgIntIcon,#LngIntSample").forEach(function (elm) {
      elm.style.display = "block";
    });
  } else {
    document.querySelectorAll(".ShindoIcon,.MaxShindoIcon,#ShindoSample").forEach(function (elm) {
      elm.style.display = "block";
    });
    document.querySelectorAll(".LgIntIcon,.MaxLgIntIcon,#LngIntSample").forEach(function (elm) {
      elm.style.display = "none";
    });
  }
  mapFillDraw();
}

document.getElementById("over2").addEventListener("change", function () {
  document.getElementById("legend1").style.display = this.checked ? "inline-block" : "none";
});
var over3_visiblity = false;
var over4_visiblity = false;
document.getElementById("over3").addEventListener("change", function () {
  over3_visiblity = this.checked;
  document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
});
document.getElementById("over4").addEventListener("change", function () {
  over4_visiblity = this.checked;
  document.getElementById("legend2").style.display = over3_visiblity || over4_visiblity ? "inline-block" : "none";
});

//推計震度分布リスト取得→描画
var estimated_intensity_map_layers = [];
var ESMap_Worker;
function estimated_intensity_mapReq() {
  ESMap_Worker = new Worker("js/ESMap_Worker.js");
  ESMap_Worker.addEventListener("message", (e) => {
    if (map.getSource("estimated_intensity_map_" + e.data.index)) {
      map.removeLayer("estimated_intensity_map_layer_" + e.data.index);
      map.removeSource("estimated_intensity_map_" + e.data.index);
    }
    map.addSource("estimated_intensity_map_" + e.data.index, {
      type: "image",
      url: e.data.data,
      coordinates: [
        [e.data.lng, e.data.lat2],
        [e.data.lng2, e.data.lat2],
        [e.data.lng2, e.data.lat],
        [e.data.lng, e.data.lat],
      ],
    });
    map.addLayer(
      {
        id: "estimated_intensity_map_layer_" + e.data.index,
        type: "raster",
        source: "estimated_intensity_map_" + e.data.index,
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      },
      "basemap_LINE"
    );
    estimated_intensity_map_layers.push("estimated_intensity_map_layer_" + e.data.index);
  });

  ESMap_Worker.postMessage({
    action: "config",
    config: config,
  });

  var ESMap_canvas = document.createElement("canvas");
  ESMap_canvas.width = ESMap_canvas.height = 800;
  var ESMap_offscreen = ESMap_canvas.transferControlToOffscreen();
  var ESMap_canvas_out = document.createElement("canvas");
  ESMap_canvas_out.width = ESMap_canvas_out.height = 320;
  var ESMapO_offscreen = ESMap_canvas_out.transferControlToOffscreen();
  ESMap_Worker.postMessage(
    {
      action: "ESMap_canvas",
      canvas: ESMap_offscreen,
    },
    [ESMap_offscreen]
  );
  ESMap_Worker.postMessage(
    {
      action: "ESMapO_canvas",
      canvas: ESMapO_offscreen,
    },
    [ESMapO_offscreen]
  );

  fetch("https://www.jma.go.jp/bosai/estimated_intensity_map/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      ItemTmp = json.find(function (elm) {
        return elm.url.split("_")[0] == String(eid).substring(0, 12);
      });
      if (ItemTmp) {
        ConvertEQInfo({
          category: "推計震度分布",
          status: "通常",
          reportTime: ItemTmp.hypo.it,
          originTime: ItemTmp.hypo.at,
          maxI: ItemTmp.hypo.maxi,
          mag: ItemTmp.hypo.mag,
          lat: ItemTmp.hypo.lat,
          lng: ItemTmp.hypo.lon,
          depth: ItemTmp.hypo.dep,
          epiCenter: ItemTmp.hypo.epi,
          comment: null,
          cancel: null,
        });

        InfoType_add("type-6");
        idTmp = ItemTmp.url;

        ItemTmp.mesh_num.forEach(function (elm, index) {
          var lat = Number(elm.substring(0, 2)) / 1.5;
          var lng = Number(elm.substring(2, 4)) + 100;
          var lat2 = lat + 2 / 3;
          var lng2 = lng + 1;

          ZoomBounds.extend([lng, lat2]);
          ZoomBounds.extend([lng2, lat]);

          ESMap_Worker.postMessage({
            action: "URL",
            url: "https://www.jma.go.jp/bosai/estimated_intensity_map/data/" + idTmp + "/" + elm + ".png",
            index: index,
            lat: lat,
            lng: lng,
            lat2: lat2,
            lng2: lng2,
          });
        });

        document.getElementById("estshindomap_radio").setAttribute("checked", true);
        estShindoMapDraw = true;
        ShindoMapDraw = false;
        LgIntMapDraw = false;
        mapFillDraw();
        document.getElementById("estshindomap_radioWrap").style.display = "block";
      }
    });
}

//気象庁リスト取得→jma_Fetch
function jma_ListReq() {
  fetch("https://www.jma.go.jp/bosai/quake/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      data.forEach(function (elm) {
        var urlTmp = "https://www.jma.go.jp/bosai/quake/data/" + elm.json;
        if (elm.eid == eid && !jmaURL.includes(urlTmp)) jmaURL.push(urlTmp);
      });
      mapDraw();
    })
    .catch(function () {});
  fetch("https://www.jma.go.jp/bosai/ltpgm/data/list.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      data.forEach(function (elm) {
        var urlTmp = "https://www.jma.go.jp/bosai/ltpgm/data/" + elm.json;
        if (elm.eid == eid && !jmaLURL.includes(urlTmp)) jmaLURL.push(urlTmp);
      });
      mapDraw();
    })
    .catch(function () {});
}
//narikakun地震情報APIリスト取得→narikakun_Fetch
function narikakun_ListReq(year, month, retry) {
  fetch("https://ntool.online/api/earthquakeList?year=" + year + "&month=" + month)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var nakn_detected = false;
      data.lists.forEach(function (elm) {
        if (elm.includes(eid) && !narikakunURL.includes(elm)) {
          narikakunURL.push(elm);
          nakn_detected = true;
        }
      });

      if (!nakn_detected && !retry) {
        var yearTmp = new Date().getFullYear();
        var monthTmp = new Date().getMonth();
        if (monthTmp == 0) {
          yearTmp = new Date().getFullYear() - 1;
          monthTmp = 1;
        }
        narikakun_ListReq(yearTmp, monthTmp, true);
      }
      mapDraw();
    });
}

//気象庁 取得・フォーマット変更→ ConvertEQInfo
function jma_Fetch(url) {
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      var LatLngDepth, originTimeTmp, epiCenterTmp, magnitudeTmp, maxIntTmp, LatTmp, LngTmp, depthTmp;
      if (json.Body.Earthquake) LatLngDepth = json.Body.Earthquake.Hypocenter.Area.Coordinate.replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");

      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.OriginTime) originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
        if (json.Body.Earthquake.Hypocenter.Area.Name) epiCenterTmp = json.Body.Earthquake.Hypocenter.Area.Name;
        if (json.Body.Earthquake.Magnitude) magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
      }
      if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt) maxIntTmp = json.Body.Intensity.Observation.MaxInt;
      if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1]) LatTmp = Number(LatLngDepth[1]);
      if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2]) LngTmp = Number(LatLngDepth[2]);
      if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3]) depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

      var cancelTmp = json.Head.InfoType == "取消";

      var commentText = { ForecastComment: "", VarComment: "", FreeFormComment: "" };
      if (json.Body.Comments) {
        if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text) commentText.ForecastComment = json.Body.Comments.ForecastComment.Text;
        if (json.Body.Comments.VarComment && json.Body.Comments.VarComment.Text) commentText.VarComment = json.Body.Comments.VarComment.Text;
        if (json.Body.Comments.FreeFormComment) commentText.FreeFormComment = json.Body.Comments.FreeFormComment;
      }

      var IntData = [];
      if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
        json.Body.Intensity.Observation.Pref.forEach(function (elm) {
          var areaData = [];
          if (elm.Area) {
            elm.Area.forEach(function (elm2) {
              var cityData = [];
              if (elm2.City) {
                elm2.City.forEach(function (elm3) {
                  var stData = [];
                  if (elm3.IntensityStation) {
                    elm3.IntensityStation.forEach(function (elm4) {
                      stData.push({ lat: elm4.latlon.lat, lng: elm4.latlon.lon, name: elm4.Name, int: elm4.Int });
                    });
                  }
                  cityData.push({ name: elm3.Name, int: elm3.MaxInt, station: stData });
                });
              }
              areaData.push({ name: elm2.Name, int: elm2.MaxInt, city: cityData });
            });
          }
          IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
        });
      }

      ConvertEQInfo({
        category: json.Head.Title,
        status: json.Control.Status,
        reportTime: json.Head.ReportDateTime,
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: depthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
        IntData: IntData,
      });
    });
}

function jmaL_Fetch(url) {
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      InfoType_add("type-7");

      document.getElementById("LgInt_radioWrap").style.display = "block";
      if (json.Body.Earthquake) var LatLngDepth = json.Body.Earthquake.Hypocenter.Area.Coordinate.replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");

      if (json.Body.Earthquake) {
        if (json.Body.Earthquake.OriginTime) var originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
        if (json.Body.Earthquake.Hypocenter.Area.Name) var epiCenterTmp = json.Body.Earthquake.Hypocenter.Area.Name;
        if (json.Body.Earthquake.Magnitude) var magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
      }
      if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt) var maxIntTmp = json.Body.Intensity.Observation.MaxInt;
      if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1]) var LatTmp = Number(LatLngDepth[1]);
      if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2]) var LngTmp = Number(LatLngDepth[2]);
      if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3]) var depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

      var cancelTmp = json.Head.InfoType == "取消";

      if (json.Body.Comments) {
        var commentText = { ForecastComment: "", VarComment: "", FreeFormComment: "" };
        if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text) commentText.ForecastComment = json.Body.Comments.ForecastComment.Text;
        if (json.Body.Comments.VarComment && json.Body.Comments.VarComment.Text) commentText.VarComment = json.Body.Comments.VarComment.Text;
        if (json.Body.Comments.FreeFormComment && json.Body.Comments.FreeFormComment) commentText.FreeFormComment = json.Body.Comments.FreeFormComment;
      }

      var LngIntData = [];
      if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
        json.Body.Intensity.Observation.Pref.forEach(function (elm) {
          var areaData = [];
          if (elm.Area) {
            elm.Area.forEach(function (elm2) {
              var stData = [];
              if (elm2.IntensityStation) {
                elm2.IntensityStation.forEach(function (elm4) {
                  stData.push({ lat: elm4.latlon.lat, lng: elm4.latlon.lon, name: elm4.Name, lgint: elm4.LgInt });
                });
              }
              areaData.push({ name: elm2.Name, lgint: elm2.MaxLgInt, station: stData });
            });
          }
          33;
          LngIntData.push({ name: elm.Name, lgint: elm.MaxLgInt, area: areaData });
        });
      }

      ConvertEQInfo({
        category: json.Head.Title,
        status: json.Control.Status,
        reportTime: 0,
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: depthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
        LngIntData: LngIntData,
      });
    });
}
//気象庁防災XML 取得・フォーマット変更→ ConvertEQInfo
function jmaXMLFetch(url) {
  fetch(url)
    .then((response) => {
      return response.text();
    }) // (2) レスポンスデータを取得
    .then((data) => {
      var parser = new DOMParser();
      var xml = parser.parseFromString(data, "application/xml");
      var cancelTmp = xml.querySelector("InfoType").textContent == "取消";
      var ReportTime = new Date(xml.querySelector("Head ReportDateTime").textContent);
      if (!newInfoDateTime || newInfoDateTime <= ReportTime) {
        newInfoDateTime = ReportTime;
      }
      var EarthquakeElm = xml.querySelector("Body Earthquake");
      var originTimeTmp, epiCenterTmp, magnitudeTmp, LatLngDepth, magnitudeTypeTmp, LatTmp, LngTmp, DepthTmp, maxIntTmp;

      if (EarthquakeElm) {
        originTimeTmp = new Date(EarthquakeElm.querySelector("OriginTime").textContent);
        epiCenterTmp = EarthquakeElm.querySelector("Name").textContent;
        magnitudeTmp = Number(EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].textContent);
        magnitudeTypeTmp = EarthquakeElm.getElementsByTagName("jmx_eb:Magnitude")[0].getAttribute("type");
        LatLngDepth = xml.querySelector("Body Earthquake Hypocenter").getElementsByTagName("jmx_eb:Coordinate")[0].textContent.replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");
        LatTmp = Number(LatLngDepth[1]);
        LngTmp = Number(LatLngDepth[2]);
        DepthTmp = Number(LatLngDepth[3] / 1000);
      }

      var IntensityElm = xml.querySelector("Body Intensity");
      if (IntensityElm) maxIntTmp = NormalizeShindo(IntensityElm.querySelector("MaxInt").textContent, 4);

      var commentText = { ForecastComment: "", VarComment: "", FreeFormComment: "" };
      if (xml.querySelector("Body Comments")) {
        if (xml.querySelector("Body Comments ForecastComment")) commentText.ForecastComment = xml.querySelector("Body Comments ForecastComment Text").textContent;
        if (xml.querySelector("Body Comments VarComment")) commentText.VarComment = xml.querySelector("Body Comments VarComment Text").textContent;
        if (xml.querySelector("Body Comments FreeFormComment")) commentText.FreeFormComment = xml.querySelector("Body Comments FreeFormComment").textContent;
      }

      var infoType = xml.querySelector("Head Title").textContent;
      if (xml.querySelector("Control Title").textContent == "津波情報a" || xml.querySelector("Control Title").textContent == "津波警報・注意報・予報a") infoType = "津波";

      var IntData = [];
      if (xml.querySelector("Body Intensity") && xml.querySelector("Body Intensity Observation Pref")) {
        xml.querySelectorAll("Body Intensity Observation Pref").forEach(function (elm) {
          var areaData = [];
          if (elm.querySelectorAll("Area")) {
            elm.querySelectorAll("Area").forEach(function (elm2) {
              var cityData = [];
              if (elm2.querySelectorAll("City")) {
                elm2.querySelectorAll("City").forEach(function (elm3) {
                  var stData = [];
                  if (elm3.querySelectorAll("IntensityStation")) {
                    elm3.querySelectorAll("IntensityStation").forEach(function (elm4) {
                      var pointT = pointList[elm4.querySelector("Code").textContent];
                      if (pointT) stData.push({ lat: pointT.location[0], lng: pointT.location[1], name: elm4.querySelector("Name").textContent, int: elm4.querySelector("Int").textContent });
                    });
                  }
                  cityData.push({ name: elm3.querySelector("Name").textContent, int: elm3.querySelector("MaxInt").textContent, station: stData });
                });
              }
              areaData.push({ name: elm2.querySelector("Name").textContent, int: elm2.querySelector("MaxInt").textContent, city: cityData });
            });
          }
          IntData.push({ name: elm.querySelector("Name").textContent, int: elm.querySelector("MaxInt").textContent, area: areaData });
        });
      }

      ConvertEQInfo({
        category: infoType,
        status: xml.querySelector("Control Status").textContent,
        reportTime: new Date(xml.querySelector("Head ReportDateTime").textContent),
        originTime: originTimeTmp,
        maxI: maxIntTmp,
        mag: magnitudeTmp,
        magType: magnitudeTypeTmp,
        lat: LatTmp,
        lng: LngTmp,
        depth: DepthTmp,
        epiCenter: epiCenterTmp,
        comment: commentText,
        cancel: cancelTmp,
        IntData: IntData,
      });
    });
}
//narikakun地震情報API 取得・フォーマット変更→ ConvertEQInfo
function narikakun_Fetch(url) {
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      if (json.Head.EventID == eid) {
        var originTimeTmp, magnitudeTmp, depthTmp, epiCenterTmp, LatTmp, LngTmp, maxIntTmp, commentTmp;
        if (json.Body.Earthquake) {
          if (json.Body.Earthquake.OriginTime) originTimeTmp = new Date(json.Body.Earthquake.OriginTime);
          if (json.Body.Earthquake.Magnitude) magnitudeTmp = Number(json.Body.Earthquake.Magnitude);
          if (json.Body.Earthquake.Hypocenter.Depth) depthTmp = Number(json.Body.Earthquake.Hypocenter.Depth);
          if (json.Body.Earthquake.Hypocenter.Name) epiCenterTmp = json.Body.Earthquake.Hypocenter.Name;
          if (json.Body.Earthquake.Hypocenter.Latitude) LatTmp = json.Body.Earthquake.Hypocenter.Latitude;
          if (json.Body.Earthquake.Hypocenter.Longitude) LngTmp = json.Body.Earthquake.Hypocenter.Longitude;
        }
        if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt) maxIntTmp = json.Body.Intensity.Observation.MaxInt;
        if (json.Body.Comments && json.Body.Comments.Observation) commentTmp = { ForecastComment: json.Body.Comments.Observation, VarComment: "", FreeFormComment: "" };

        var cancelTmp = json.Head.InfoType == "取消";

        var IntData = [];
        if (json.Body.Intensity && json.Body.Intensity.Observation.Pref && json.Body.Intensity.Observation.Pref.length > 0) {
          json.Body.Intensity.Observation.Pref.forEach(function (elm) {
            var areaData = [];
            if (elm.Area) {
              elm.Area.forEach(function (elm2) {
                var cityData = [];
                if (elm2.City) {
                  elm2.City.forEach(function (elm3) {
                    var stData = [];
                    if (elm3.IntensityStation) {
                      elm3.IntensityStation.forEach(function (elm4) {
                        pointT = pointList[elm4.Code];
                        if (pointT) stData.push({ lat: pointT.location[0], lng: pointT.location[1], name: elm4.Name, int: elm4.Int });
                      });
                    }
                    cityData.push({ name: elm3.Name, int: elm3.MaxInt, station: stData });
                  });
                }
                areaData.push({ name: elm2.Name, int: elm2.MaxInt, city: cityData });
              });
            }
            IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
          });
        }

        ConvertEQInfo({
          category: json.Head.Title,
          status: json.Control.Status,
          reportTime: json.Head.ReportDateTime,
          originTime: originTimeTmp,
          maxI: maxIntTmp,
          mag: magnitudeTmp,
          lat: LatTmp,
          lng: LngTmp,
          depth: depthTmp,
          epiCenter: epiCenterTmp,
          comment: commentTmp,
          cancel: cancelTmp,
          IntData: IntData,
        });
      }
    });
}

function axisInfoCtrl(json) {
  Earthquake = json.Body.Earthquake[0];
  var LatLngDepth = Earthquake.Hypocenter.Area.Coordinate[0].valueOf_.replaceAll("+", "｜+").replaceAll("-", "｜-").replaceAll("/", "").split("｜");

  var originTimeTmp, epiCenterTmp, magnitudeTmp, maxIntTmp, LatTmp, LngTmp, depthTmp;
  if (Earthquake.OriginTime) originTimeTmp = new Date(Earthquake.OriginTime);
  if (Earthquake.Hypocenter.Area.Name) epiCenterTmp = Earthquake.Hypocenter.Area.Name;
  if (Earthquake.Magnitude) magnitudeTmp = Number(Earthquake.Magnitude);
  if (json.Body.Intensity && json.Body.Intensity.Observation.MaxInt) maxIntTmp = json.Body.Intensity.Observation.MaxInt;
  if (LatLngDepth && !isNaN(LatLngDepth[1]) && LatLngDepth[1]) LatTmp = Number(LatLngDepth[1]);
  if (LatLngDepth && !isNaN(LatLngDepth[2]) && LatLngDepth[2]) LngTmp = Number(LatLngDepth[2]);
  if (LatLngDepth && !isNaN(LatLngDepth[3]) && LatLngDepth[3]) depthTmp = Math.abs(Number(LatLngDepth[3]) / 1000);

  var cancelTmp = json.Head.InfoType == "取消";

  var commentText = { ForecastComment: "", VarComment: "", FreeFormComment: "" };
  if (json.Body.Comments) {
    if (json.Body.Comments.ForecastComment && json.Body.Comments.ForecastComment.Text) commentText.ForecastComment = json.Body.Comments.ForecastComment.Text;
    if (json.Body.Comments.VarComment && json.Body.Comments.VarComment.Text) commentText.VarComment = json.Body.Comments.VarComment.Text;
    if (json.Body.Comments.FreeFormComment) commentText.FreeFormComment = json.Body.Comments.FreeFormComment;
  }

  var IntData = [];
  if (json.Body.Intensity && json.Body.Intensity.Observation.Pref) {
    json.Body.Intensity.Observation.Pref.forEach(function (elm) {
      var areaData = [];
      if (elm.Area) {
        elm.Area.forEach(function (elm2) {
          var cityData = [];
          if (elm2.City) {
            elm2.City.forEach(function (elm3) {
              var stData = [];
              if (elm3.IntensityStation) {
                elm3.IntensityStation.forEach(function (elm4) {
                  var pointT = pointList[elm4.Code];
                  if (pointT) stData.push({ lat: pointT.location[0], lng: pointT.location[1], name: elm4.Name, int: elm4.Int });
                });
              }
              cityData.push({ name: elm3.Name, int: elm3.MaxInt, station: stData });
            });
          }
          areaData.push({ name: elm2.Name, int: elm2.MaxInt, city: cityData });
        });
      }
      IntData.push({ name: elm.Name, int: elm.MaxInt, area: areaData });
    });
  }

  ConvertEQInfo({
    category: json.Head.Title,
    status: json.Control.Status,
    reportTime: json.Head.ReportDateTime,
    originTime: originTimeTmp,
    maxI: maxIntTmp,
    mag: magnitudeTmp,
    lat: LatTmp,
    lng: LngTmp,
    depth: depthTmp,
    epiCenter: epiCenterTmp,
    comment: commentText,
    cancel: cancelTmp,
    IntData: IntData,
  });
}

var Int0T = ["any"];
var Int1T = ["any"];
var Int2T = ["any"];
var Int3T = ["any"];
var Int4T = ["any"];
var Int5mT = ["any"];
var Int5pT = ["any"];
var Int6mT = ["any"];
var Int6pT = ["any"];
var Int7T = ["any"];

var LgInt1T = ["any"];
var LgInt2T = ["any"];
var LgInt3T = ["any"];
var LgInt4T = ["any"];

function mapFillReset() {
  Int0T = ["any"];
  Int1T = ["any"];
  Int2T = ["any"];
  Int3T = ["any"];
  Int4T = ["any"];
  Int5mT = ["any"];
  Int5pT = ["any"];
  Int6mT = ["any"];
  Int6pT = ["any"];
  Int7T = ["any"];
  Int7pT = ["any"];
  if (!map.loaded()) return;
  map.setFilter("Int0", ["==", "name", ""]);
  map.setFilter("Int1", ["==", "name", ""]);
  map.setFilter("Int2", ["==", "name", ""]);
  map.setFilter("Int3", ["==", "name", ""]);
  map.setFilter("Int4", ["==", "name", ""]);
  map.setFilter("Int5-", ["==", "name", ""]);
  map.setFilter("Int5+", ["==", "name", ""]);
  map.setFilter("Int6-", ["==", "name", ""]);
  map.setFilter("Int6+", ["==", "name", ""]);
  map.setFilter("Int7", ["==", "name", ""]);
}
function mapFillResetL() {
  LgInt1T = ["any"];
  LgInt2T = ["any"];
  LgInt3T = ["any"];
  LgInt4T = ["any"];
  if (!map.loaded()) return;
  map.setFilter("LgInt1", ["==", "name", ""]);
  map.setFilter("LgInt2", ["==", "name", ""]);
  map.setFilter("LgInt3", ["==", "name", ""]);
  map.setFilter("LgInt4", ["==", "name", ""]);
}

function mapFillDraw() {
  map.setFilter("Int0", Int0T);
  map.setFilter("Int1", Int1T);
  map.setFilter("Int2", Int2T);
  map.setFilter("Int3", Int3T);
  map.setFilter("Int4", Int4T);
  map.setFilter("Int5-", Int5mT);
  map.setFilter("Int5+", Int5pT);
  map.setFilter("Int6-", Int6mT);
  map.setFilter("Int6+", Int6pT);
  map.setFilter("Int7", Int7T);

  map.setFilter("LgInt1", LgInt1T);
  map.setFilter("LgInt2", LgInt2T);
  map.setFilter("LgInt3", LgInt3T);
  map.setFilter("LgInt4", LgInt4T);

  estimated_intensity_map_layers.forEach(function (elm2) {
    if (map.getLayer(elm2)) map.setLayoutProperty(elm2, "visibility", estShindoMapDraw && MapFill ? "visible" : "none");
  });

  ["Int0", "Int1", "Int2", "Int3", "Int4", "Int5-", "Int5+", "Int6-", "Int6+", "Int7"].forEach(function (elm2) {
    map.setLayoutProperty(elm2, "visibility", ShindoMapDraw && MapFill ? "visible" : "none");
  });
  ["LgInt1", "LgInt2", "LgInt3", "LgInt4"].forEach(function (elm2) {
    map.setLayoutProperty(elm2, "visibility", LgIntMapDraw && MapFill ? "visible" : "none");
  });
}

function mapZoomReset() {
  try {
    map.fitBounds(ZoomBounds, { padding: 60, maxZoom: 7, animate: false });
  } catch (err) {
    return;
  }
}

var intensityIcons = [];
//都道府県ごとの情報描画（リスト）
var ShindoFragment;
function add_Pref_info(name, maxInt) {
  var newDiv = document.createElement("div");
  var color1 = NormalizeShindo(maxInt, 2);
  newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + maxInt + "</span>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem1");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel1", "close");
  ShindoFragment.append(newDiv, newDiv2);

  document.getElementById("splash").style.display = "none";
}
//細分区域ごとの情報描画（リスト・地図塗りつぶし・地図プロット）
function add_Area_info(name, maxInt) {
  var wrap = ShindoFragment.querySelectorAll(".WrapLevel1");

  var newDiv = document.createElement("div");
  var color = NormalizeShindo(maxInt, 2);
  newDiv.innerHTML = "<span style='background:" + color[0] + ";color:" + color[1] + ";'>" + maxInt + "</span>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem2");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel2", "close");

  wrap[wrap.length - 1].append(newDiv, newDiv2);

  if (name == config.home.Section) {
    var newDiv3 = document.createElement("div");
    newDiv3.innerHTML = "<span style='background:" + color[0] + ";color:" + color[1] + ";'>" + maxInt + "</span>" + name;
    newDiv3.classList.add("ShindoItem", "ShindoItem2");

    removeChild(document.getElementById("homeShindo"));
    document.getElementById("homeShindoWrap").style.display = "block";
    document.getElementById("homeShindo").appendChild(newDiv3);
  }

  var pointLocation = areaLocation[name];
  if (pointLocation) {
    const icon = document.createElement("div");
    icon.classList.add("MaxShindoIcon");
    icon.innerHTML = '<div style="background:' + color[0] + ";color:" + color[1] + '">' + NormalizeShindo(maxInt) + "</div>";

    var maxIntStr = NormalizeShindo(maxInt, 1);
    var AreaPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML("<div class='popupContent'><div class='shindoItem_S' style='background:" + color[0] + ";color:" + color[1] + "'>震度 " + maxIntStr + "</div><div class='pointName'>" + name + "</div><div class='pointHead'>細分区域</div></div><div></div>");
    markerElm = new maplibregl.Marker({ element: icon }).setLngLat([pointLocation[1], pointLocation[0]]).setPopup(AreaPopup).addTo(map);
    intensityIcons.push(markerElm);
    ZoomBounds.extend([pointLocation[1], pointLocation[0]]);
  }

  switch (maxInt) {
    case "0":
      Int0T.push(["==", "name", name]);
      break;
    case "1":
      Int1T.push(["==", "name", name]);
      break;
    case "2":
      Int2T.push(["==", "name", name]);
      break;
    case "3":
      Int3T.push(["==", "name", name]);
      break;
    case "4":
      Int4T.push(["==", "name", name]);
      break;
    case "5-":
      Int5mT.push(["==", "name", name]);
      break;
    case "5+":
      Int5pT.push(["==", "name", name]);
      break;
    case "6-":
      Int6mT.push(["==", "name", name]);
      break;
    case "6+":
      Int6pT.push(["==", "name", name]);
      break;
    case "7":
      Int7T.push(["==", "name", name]);
      break;
    default:
      break;
  }
}
//町ごとの情報描画（リスト）
function add_City_info(name, maxInt) {
  var wrap2 = ShindoFragment.querySelectorAll(".WrapLevel2");

  var newDiv = document.createElement("div");
  var color3 = NormalizeShindo(maxInt, 2);
  newDiv.innerHTML = "<span style='background:" + color3[0] + ";color:" + color3[1] + ";'>" + maxInt + "</span>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem3");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel3", "close");

  wrap2[wrap2.length - 1].append(newDiv, newDiv2);
}
//観測点ごとの情報描画（リスト・地図プロット）
function add_IntensityStation_info(lat, lng, name, int) {
  var wrap3 = ShindoFragment.querySelectorAll(".WrapLevel3");

  var intStr = NormalizeShindo(int);
  var intStrLong = NormalizeShindo(int, 1);

  var newDiv = document.createElement("div");
  var color4 = NormalizeShindo(int, 2);
  newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + intStr + "</span>" + name;
  newDiv.classList.add("ShindoItem", "ShindoItem4");
  const icon = document.createElement("div");
  icon.classList.add("ShindoIcon");
  icon.innerHTML = '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + intStr + "</div>";

  var mi_description = intStr == "未" ? "<div class = 'description'>震度5弱以上と考えられるが<br>現在震度を入手していない。</div>" : "";
  var PtPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML("<div class='popupContent'><div class='shindoItem' style='background:" + color4[0] + ";color:" + color4[1] + "'>震度 " + intStrLong + "</div><div class='pointName'>" + name + "</div>" + mi_description + "<div class='pointHead'>震度観測点</div></div><div></div>");
  markerElm = new maplibregl.Marker({ element: icon }).setLngLat([lng, lat]).setPopup(PtPopup).addTo(map);
  intensityIcons.push(markerElm);

  wrap3[wrap3.length - 1].append(newDiv);
  ZoomBounds.extend([lng, lat]);
}

var lastDrawDate;
var drawTimeout;
var DataToDraw;
function DrawIntensity(data) {
  DataToDraw = data;
  if (lastDrawDate && new Date() - lastDrawDate < 500) {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
      DrawIntensity(DataToDraw);
    }, 500);
  } else {
    DrawIntensityCORE(DataToDraw);
    lastDrawDate = new Date();
  }
}

function DrawIntensityCORE(data) {
  intensityIcons.forEach(function (elm) {
    elm.remove();
  });
  intensityIcons = [];
  removeChild(document.getElementById("Shindo"));
  document.getElementById("ShindoWrap").style.display = "inline-block";
  document.getElementById("Shindo").style.display = "block";
  mapFillReset();

  console.time("a");
  ShindoFragment = document.createDocumentFragment();
  data.forEach(function (elm) {
    add_Pref_info(elm.name, elm.int);
    if (elm.area) {
      elm.area.forEach(function (elm2) {
        add_Area_info(elm2.name, elm2.int);
        if (elm2.city) {
          elm2.city.forEach(function (elm3) {
            add_City_info(elm3.name, elm3.int);
            if (elm3.station) {
              elm3.station.forEach(function (elm4) {
                add_IntensityStation_info(elm4.lat, elm4.lng, elm4.name, elm4.int);
              });
            }
          });
        }
      });
    }
  });
  document.getElementById("Shindo").appendChild(ShindoFragment);
  console.timeEnd("a");

  mapFillDraw();
  mapZoomReset();
}

function DrawLgIntensity(data) {
  LgIntIcons.forEach(function (elm) {
    elm.remove();
  });
  removeChild(document.getElementById("LngInt"));
  document.getElementById("ShindoWrap").style.display = "inline-block";
  document.getElementById("lngintListWrap").style.display = "block";
  mapFillResetL();

  LgIntFragment = document.createDocumentFragment();
  data.forEach(function (elm) {
    add_Pref_infoL(elm.name, elm.lgint);
    if (elm.area) {
      elm.area.forEach(function (elm2) {
        add_Area_infoL(elm2.name, elm2.lgint);
        if (elm2.station) {
          elm2.station.forEach(function (elm4) {
            add_IntensityStation_infoL(elm4.lat, elm4.lng, elm4.name, elm4.lgint);
          });
        }
      });
    }
  });
  document.getElementById("LngInt").appendChild(LgIntFragment);
  mapFillDraw();
  mapZoomReset();
}

var LgIntIcons = [];
//都道府県ごとの情報描画（リスト）
var LgIntFragment;
function add_Pref_infoL(name, lngInt) {
  var newDiv = document.createElement("div");
  var color1 = LgIntConvert(lngInt);

  newDiv.innerHTML = "<span style='background:" + color1[0] + ";color:" + color1[1] + ";'>" + lngInt + "</span>" + name;
  newDiv.classList.add("ShindoItemL", "ShindoItem1L");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel1L", "close");
  LgIntFragment.append(newDiv, newDiv2);

  document.getElementById("splash").style.display = "none";
}
//細分区域ごとの情報描画（リスト・地図塗りつぶし・地図プロット）
function add_Area_infoL(name, maxInt) {
  var wrap = LgIntFragment.querySelectorAll(".WrapLevel1L");
  var color = LgIntConvert(maxInt);

  var newDiv = document.createElement("div");
  newDiv.innerHTML = "<span style='background:" + color[0] + ";color:" + color[1] + ";'>" + maxInt + "</span>" + name;
  newDiv.classList.add("ShindoItemL", "ShindoItem2L");
  newDiv.addEventListener("click", function () {
    this.classList.toggle("has-open");
    this.nextElementSibling.classList.toggle("open");
  });

  var newDiv2 = document.createElement("div");
  newDiv2.innerHTML = "<div></div>";
  newDiv2.classList.add("WrapLevel2L", "close");

  wrap[wrap.length - 1].append(newDiv, newDiv2);

  if (name == config.home.Section) {
    var newDiv3 = document.createElement("div");
    newDiv3.innerHTML = "<span style='background:" + color[0] + ";color:" + color[1] + ";'>" + maxInt + "</span>" + name;
    newDiv3.classList.add("ShindoItemL", "ShindoItem2L");

    removeChild(document.getElementById("homeShindoL"));
    document.getElementById("homeShindoWrap").style.display = "block";
    document.getElementById("homeShindoL").appendChild(newDiv3);
  }

  var pointLocation = areaLocation[name];
  if (pointLocation) {
    const icon = document.createElement("div");
    icon.classList.add("MaxLgIntIcon");
    icon.innerHTML = '<div style="background:' + color[0] + ";color:" + color[1] + '">' + maxInt + "</div>";

    var AreaPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML("<div class='popupContent'><div class='shindoItem_S' style='background:" + color[0] + ";color:" + color[1] + "'>長周期地震動階級 " + maxInt + "</div><div class='pointName'>" + name + "</div><div class='pointHead'>細分区域</div></div><div></div>");
    markerElm = new maplibregl.Marker({ element: icon }).setLngLat([pointLocation[1], pointLocation[0]]).setPopup(AreaPopup).addTo(map);
    LgIntIcons.push(markerElm);
    ZoomBounds.extend([pointLocation[1], pointLocation[0]]);
  }

  switch (maxInt) {
    case "1":
      LgInt1T.push(["==", "name", name]);
      break;
    case "2":
      LgInt2T.push(["==", "name", name]);
      break;
    case "3":
      LgInt3T.push(["==", "name", name]);
      break;
    case "4":
      LgInt4T.push(["==", "name", name]);
      break;
    default:
      break;
  }
}
//観測点ごとの情報描画（リスト・地図プロット）
function add_IntensityStation_infoL(lat, lng, name, int) {
  var wrap3 = LgIntFragment.querySelectorAll(".WrapLevel2L");

  var color4 = LgIntConvert(int, 2);
  var intStr = int;

  var newDiv = document.createElement("div");
  newDiv.innerHTML = "<span style='background:" + color4[0] + ";color:" + color4[1] + ";'>" + int + "</span>" + name;
  newDiv.classList.add("ShindoItemL", "ShindoItem4L");
  wrap3[wrap3.length - 1].append(newDiv);

  const icon = document.createElement("div");
  icon.classList.add("LgIntIcon");
  icon.innerHTML = '<div style="background:' + color4[0] + ";color:" + color4[1] + '">' + int + "</div>";

  var PtPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML("<div class='popupContent'><div class='shindoItem' style='background:" + color4[0] + ";color:" + color4[1] + "'>長周期地震動階級 " + intStr + "</div><div class='pointName'>" + name + "</div><div class='pointHead'>震度観測点</div></div><div></div>");
  markerElm = new maplibregl.Marker({ element: icon }).setLngLat([lng, lat]).setPopup(PtPopup).addTo(map);
  LgIntIcons.push(markerElm);

  ZoomBounds.extend([lng, lat]);
}

var EQInfoMarged = {};
var EQInfoData = [];
//地震情報マージ
function ConvertEQInfo(data) {
  var sameData = EQInfoData.find(function (elm) {
    return elm.category == data.category && Number(new Date(elm.reportTime)) == Number(new Date(data.reportTime));
  });
  if (sameData) return;

  EQInfoData.push(data);

  EQInfoData = EQInfoData.sort(function (a, b) {
    return new Date(a.reportTime) < new Date(b.reportTime) ? -1 : 1;
  });

  EQInfoData.forEach(function (elm, index) {
    if (elm.cancel) {
      EQInfoData.slice(0, index).forEach(function (elm2, index2) {
        if (elm2.category == elm.category) EQInfoData[index2].cancel = true;
      });
    }
  });

  EQInfoTmp = {};
  EQInfoData.forEach(function (elm) {
    if (elm.cancel) {
      if (elm.category == "EEW") InfoType_remove("type-1");
      else if (elm.category == "震度速報") InfoType_remove("type-2");
      else if (elm.category == "震源に関する情報") InfoType_remove("type-3");
      else if (elm.category == "震源・震度情報") InfoType_remove("type-4-1");
      else if (elm.category == "遠地地震に関する情報") InfoType_remove("type-4-2");
      else if (elm.category == "顕著な地震の震源要素更新のお知らせ") InfoType_remove("type-5");
      else if (elm.category == "津波") InfoType_remove("type-8");
    } else {
      if (elm.category == "EEW") InfoType_add("type-1");
      else if (elm.category == "震度速報") InfoType_add("type-2");
      else if (elm.category == "震源に関する情報") InfoType_add("type-3");
      else if (elm.category == "震源・震度情報") InfoType_add("type-4-1");
      else if (elm.category == "遠地地震に関する情報") InfoType_add("type-4-2");
      else if (elm.category == "顕著な地震の震源要素更新のお知らせ") InfoType_add("type-5");
      else if (elm.category == "津波") InfoType_add("type-8");
    }

    if (!config.Info.EQInfo.showtraining && elm.status == "訓練") return;
    if (!config.Info.EQInfo.showTest && elm.status == "試験") return;

    //EEW以外の情報が既に入っているとき、EEWによる情報を破棄
    if (elm.category == "EEW" && EQInfoTmp.EEW == false) return;
    else if (elm.category == "EEW") EQInfoTmp.EEW = true;
    else if (elm.category != "EEW" && EQInfoTmp.EEW == true) {
      //EEW以外の情報が入ってきたとき、EEWによる情報を破棄
      EQInfoTmp.EEW == false;
      EQInfoTmp = {};
    }

    if (!elm.cancel) {
      if (Boolean2(elm.category)) EQInfoTmp.category = elm.category;
      if (Boolean2(elm.status)) EQInfoTmp.status = elm.status;
      if (Boolean2(elm.reportTime)) EQInfoTmp.reportTime = elm.reportTime;
      if (Boolean2(elm.originTime)) EQInfoTmp.originTime = elm.originTime;
      if (Boolean2(elm.maxI) && elm.maxI !== "?") EQInfoTmp.maxI = elm.maxI;
      if (Boolean2(elm.mag) && elm.M != "Ｍ不明" && elm.M != "NaN") EQInfoTmp.mag = elm.mag;
      if (Boolean2(elm.magType)) EQInfoTmp.magType = elm.magType;
      if (Boolean2(elm.lat)) EQInfoTmp.lat = elm.lat;
      if (Boolean2(elm.lng)) EQInfoTmp.lng = elm.lng;
      if (Boolean2(elm.depth)) EQInfoTmp.depth = elm.depth;
      if (Boolean2(elm.epiCenter)) EQInfoTmp.epiCenter = elm.epiCenter;
      if (Boolean2(elm.comment)) EQInfoTmp.comment = elm.comment;
      if (Boolean2(elm.IntData)) EQInfoTmp.IntData = elm.IntData;
      if (Boolean2(elm.LngIntData)) EQInfoTmp.LngIntData = elm.LngIntData;
    }
  });

  EQInfoTmp.cancel = !EQInfoData.find(function (elm) {
    return !elm.cancel;
  });

  EQInfoMarged = EQInfoTmp;

  if (EQInfoMarged.IntData) DrawIntensity(EQInfoMarged.IntData);
  if (EQInfoMarged.LngIntData) DrawLgIntensity(EQInfoMarged.LngIntData);

  document.getElementById("canceled").style.display = EQInfoMarged.cancel ? "flex" : "none";

  if (EQInfoMarged.originTime) EQInfo.originTime = EQInfoMarged.originTime;
  if (EQInfoMarged.maxI) EQInfo.maxI = EQInfoMarged.maxI;
  if (EQInfoMarged.mag) EQInfo.mag = EQInfoMarged.mag;
  if (EQInfoMarged.magType) EQInfo.magType = EQInfoMarged.magType;
  else if (!EQInfo.magType) EQInfo.magType = "M";
  data_MT.innerText = EQInfo.magType;

  if (EQInfoMarged.depth || EQInfoMarged.depth === 0) EQInfo.depth = Math.abs(EQInfoMarged.depth);
  if (EQInfoMarged.epiCenter) EQInfo.epiCenter = EQInfoMarged.epiCenter;

  if (EQInfo.originTime) data_time.innerText = NormalizeDate(4, EQInfo.originTime);
  if (EQInfo.maxI) data_maxI.innerText = NormalizeShindo(EQInfo.maxI, 1);
  if (EQInfo.maxI) data_maxI.style.borderBottom = "solid 2px " + NormalizeShindo(EQInfo.maxI, 2)[0];
  if (EQInfo.mag) data_M.innerText = EQInfo.mag;

  if (EQInfo.depth == 0) data_depth.innerText = "ごく浅い";
  else if (EQInfo.depth == 700) data_depth.innerText = "700km以上";
  else if (EQInfo.depth) data_depth.innerText = Math.round(EQInfo.depth) + "km";

  if (EQInfo.epiCenter) data_center.innerText = EQInfo.epiCenter;

  if (EQInfoMarged.comment) {
    EQInfo.comment = EQInfoMarged.comment;

    data_comment.innerHTML = (EQInfoMarged.comment.ForecastComment + "\n" + EQInfoMarged.comment.VarComment + "\n" + EQInfoMarged.comment.FreeFormComment).replaceAll("\n", "<br>");

    var comments = EQInfoMarged.comment.ForecastComment.split("\n").concat(EQInfoMarged.comment.VarComment.split("\n"), EQInfoMarged.comment.FreeFormComment.split("\n"));

    var TsunamiShortMsg;
    for (const elm of comments) {
      switch (elm) {
        case "この地震による津波の心配はありません。":
        case "この地震による日本への津波の影響はありません。":
        case "震源の近傍で小さな津波発生の可能性がありますが、被害をもたらす津波の心配はありません。":
        case "この地震により、日本の沿岸では若干の海面変動があるかもしれませんが、被害の心配はありません。":
          TsunamiShortMsg = "津波の心配 なし";
          break;
        case "津波警報等（大津波警報・津波警報あるいは津波注意報）を発表中です。":
          TsunamiShortMsg = "津波警報等 発表";
          break;
        case "震源が海底の場合、津波が発生するおそれがあります。":
        case "一般的に、この規模の地震が海域の浅い領域で発生すると、津波が発生することがあります。":
          TsunamiShortMsg = "場合により津波の恐れ";
          break;
        case "震源の近傍で津波発生の可能性があります。":
          TsunamiShortMsg = "震源付近で津波の恐れ";
          break;
        case "今後の情報に注意してください。":
        case "日本への津波の有無については現在調査中です。":
          TsunamiShortMsg = "今後の情報に注意";
          break;
        case "太平洋の広域に津波発生の可能性があります。":
        case "太平洋で津波発生の可能性があります。":
        case "北西太平洋で津波発生の可能性があります。":
          TsunamiShortMsg = "太平洋で津波の恐れ";
          break;
        case "インド洋の広域に津波発生の可能性があります。":
        case "インド洋で津波発生の可能性があります。":
          TsunamiShortMsg = "インド洋で津波の恐れ";
          break;
      }
    }
    if (TsunamiShortMsg) {
      document.getElementById("TsunamiShortMsg").style.display = "block";
      document.getElementById("TsunamiShortMsg").innerText = TsunamiShortMsg;
    }
  }

  if (EQInfoMarged.lat && EQInfoMarged.lng) {
    ZoomBounds.extend([EQInfoMarged.lng, EQInfoMarged.lat]);

    if (!ESmarkerElm) {
      const img = document.createElement("img");
      img.src = "./img/epicenter.svg";
      img.classList.add("epicenterIcon");

      var ESPopup = new maplibregl.Popup({ offset: [0, -17] }).setHTML("<div class='popupContent'><div class='epicenterTitle'>震央</div><div class='pointName'>" + EQInfo.epiCenter + "</div></div>");
      ESmarkerElm = new maplibregl.Marker({ element: img }).setLngLat([EQInfoMarged.lng, EQInfoMarged.lat]).setPopup(ESPopup).addTo(map);
    } else ESmarkerElm.setLngLat([EQInfoMarged.lng, EQInfoMarged.lat]);
  }

  document.getElementById("splash").style.display = "none";
}

//地図（再）描画
function mapDraw() {
  if (eid) {
    jmaURL.forEach(function (elm) {
      jma_Fetch(elm);
    });

    jmaLURL.forEach(function (elm) {
      jmaL_Fetch(elm);
    });

    narikakunURL.forEach(function (elm) {
      narikakun_Fetch(elm);
    });

    jmaXMLURL.forEach(function (elm) {
      jmaXMLFetch(elm);
    });

    jmaURLHis = jmaURLHis.concat(jmaURL);
    jmaXMLURLHis = jmaXMLURLHis.concat(jmaXMLURL);
    narikakunURLHis = narikakunURLHis.concat(narikakunURL);
    jmaURL = [];
    jmaXMLURL = [];
    narikakunURL = [];
  }
}

//↓震度情報タブUI↓
document.getElementById("AllOpen").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1,.ShindoItem2,.ShindoItem3").forEach(function (elm) {
    elm.classList.add("has-open");
  });
  document.querySelectorAll(".WrapLevel1,.WrapLevel2,.WrapLevel3").forEach(function (elm) {
    elm.classList.add("open");
  });
});
document.getElementById("AllClose").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1,.ShindoItem2,.ShindoItem3").forEach(function (elm) {
    elm.classList.remove("has-open");
  });
  document.querySelectorAll(".WrapLevel1,.WrapLevel2,.WrapLevel3").forEach(function (elm) {
    elm.classList.remove("open");
  });
});

document.getElementById("AllOpenL").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1L,.ShindoItem2L,.ShindoItem3L").forEach(function (elm) {
    elm.classList.add("has-open");
  });
  document.querySelectorAll(".WrapLevel1L,.WrapLevel2L,.WrapLevel3L").forEach(function (elm) {
    elm.classList.add("open");
  });
});
document.getElementById("AllCloseL").addEventListener("click", function () {
  document.querySelectorAll(".ShindoItem1L,.ShindoItem2L,.ShindoItem3L").forEach(function (elm) {
    elm.classList.remove("has-open");
  });
  document.querySelectorAll(".WrapLevel1L,.WrapLevel2L,.WrapLevel3L").forEach(function (elm) {
    elm.classList.remove("open");
  });
});

function InfoType_add(type) {
  document.getElementById(type).style.display = "inline-block";
  document.getElementById(type).classList.remove("disabled");
  if (type == "type-1") document.getElementById("EEWCaption").style.display = "block";
  else document.getElementById("EEWCaption").style.display = "none";

  switch (type) {
    case "type-4-1":
      InfoType_remove("type-1");
      InfoType_remove("type-2");
      InfoType_remove("type-3");
      break;
    case "type-4-2":
      InfoType_remove("type-1");
      InfoType_remove("type-2");
      InfoType_remove("type-3");
      if (map) map.setZoom(2);
      break;
    case "type-5":
      InfoType_remove("type-1");
      InfoType_remove("type-3");
      break;
    case "type-2":
    case "type-3":
      InfoType_remove("type-1");
      break;
    default:
      break;
  }
}

function InfoType_remove(type) {
  document.getElementById(type).classList.add("disabled");
}

function hinanjoPopup(e) {
  var DataTmp = e.features[0].properties;
  var supportType = [];
  if (e.features[0].properties.disaster1 == 1) supportType.push("洪水");
  if (e.features[0].properties.disaster2 == 1) supportType.push("崖崩れ・土石流・地滑り");
  if (e.features[0].properties.disaster3 == 1) supportType.push("高潮");
  if (e.features[0].properties.disaster4 == 1) supportType.push("地震");
  if (e.features[0].properties.disaster5 == 1) supportType.push("津波");
  if (e.features[0].properties.disaster6 == 1) supportType.push("大規模な火事");
  if (e.features[0].properties.disaster7 == 1) supportType.push("内水氾濫");
  if (e.features[0].properties.disaster8 == 1) supportType.push("火山現象");
  supportType = supportType.join(", ");
  new maplibregl.Popup({ offset: 20 })
    .setLngLat(e.lngLat)
    .setHTML("<h3>指定緊急避難場所</h3><p>" + DataTmp.name + "</p>対応：" + supportType + (DataTmp.remarks ? "<div>" + DataTmp.remarks + "</div>" : ""))
    .addTo(map);
}

function radioSet(name, val) {
  document.getElementsByName(name).forEach(function (elm) {
    if (elm.value == val) elm.checked = true;
  });
}

function Boolean2(elm) {
  return Boolean(elm !== null && elm !== undefined && elm !== "" && !Number.isNaN(elm) && elm != "Invalid Date" && (!Array.isArray(elm) || elm.length > 0) && elm);
}
