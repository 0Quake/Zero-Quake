// 地図（MapLibre GL JS）共通設定・スタイル生成
/* global pmtiles, maplibregl */
/* exported initPMTilesProtocol, getCommonMapStyle, setupHinanjoLoader */

const PMTILES_URL = "https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/optimal_bvmap-v1.pmtiles";

// PMTiles プロトコルの初期化
function initPMTilesProtocol() {
  if (window._pmtilesInitialized) return;
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  const p = new pmtiles.PMTiles(PMTILES_URL);
  protocol.add(p);
  window._pmtilesInitialized = true;
}

// 共通地図スタイルの生成
function getCommonMapStyle(config, options = {}) {
  const high_contrast = window.matchMedia("(forced-colors: active)").matches;

  // 1. ソース定義（共通 + 画面固有）
  const baseSources = {
    submarine: {
      type: "raster",
      url: "pmtiles://local-range-request://./src/Resource/background.pmtiles",
      tileSize: 256,
      attribution: "GEBCO, Peter Bird",
      minzoom: 0,
      maxzoom: 6,
    },
    v: {
      type: "vector",
      url: `pmtiles://${PMTILES_URL}`,
      attribution: "国土地理院",
      minzoom: 4,
      maxzoom: 16,
    },
    worldmap: {
      type: "vector",
      url: "pmtiles://local-range-request://./src/Resource/world.pmtiles",
      attribution: "Natural Earth",
    },
    basemap: {
      type: "vector",
      url: "pmtiles://local-range-request://./src/Resource/jp_sect.pmtiles",
      attribution: "気象庁",
    },
    prefmap: {
      type: "vector",
      url: "pmtiles://local-range-request://./src/Resource/jp_pref.pmtiles",
      attribution: "気象庁",
    },
    lake: {
      type: "geojson",
      data: "./Resource/lake.json",
      tolerance: 1.7,
      attribution: "国土数値情報",
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
      tiles: [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=",
      ],
      attribution: "国土地理院",
      minzoom: 10,
      maxzoom: 10,
    },
  };

  // 津波ソース（mainWindow用）
  if (options.includeTsunami) {
    baseSources.tsunami = {
      type: "vector",
      url: "pmtiles://local-range-request://./src/Resource/jp_tsunami.pmtiles",
      attribution: "気象庁",
    };
  }

  // 画面固有の追加ソースを合成
  if (options.extraSources) {
    Object.assign(baseSources, options.extraSources);
  }

  // 2. レイヤー定義
  const layers = [
    // 背景・ラスタレイヤー
    {
      id: "submarine",
      type: "raster",
      source: "submarine",
      paint: { "raster-fade-duration": 500 },
      layout: { visibility: high_contrast ? "none" : "visible" },
    },
    { id: "tile0", type: "raster", source: "tile0", layout: { visibility: "none" } },
    { id: "tile1", type: "raster", source: "tile1", layout: { visibility: "none" } },
    { id: "tile2", type: "raster", source: "tile2", layout: { visibility: "none" } },
    { id: "tile4", type: "raster", source: "tile4", layout: { visibility: "none" } },
  ];

  // 津波レイヤー（mainWindow用）
  if (options.includeTsunami && config?.color?.Tsunami) {
    layers.push(
      {
        id: "tsunami_Yoho",
        type: "line",
        source: "tsunami",
        "source-layer": "jp_tsunami",
        layout: { "line-join": "round", "line-cap": "round", "line-round-limit": 0 },
        paint: {
          "line-color": config.color.Tsunami.TsunamiYohoColor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 30, 10, 50, 13, 100, 15, 400],
        },
        filter: ["==", "name", ""],
      },
      {
        id: "tsunami_Watch",
        type: "line",
        source: "tsunami",
        "source-layer": "jp_tsunami",
        layout: { "line-join": "round", "line-cap": "round", "line-round-limit": 1 },
        paint: {
          "line-color": config.color.Tsunami.TsunamiWatchColor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 30, 10, 50, 13, 100, 15, 400],
        },
        filter: ["==", "name", ""],
      },
      {
        id: "tsunami_Warn",
        type: "line",
        source: "tsunami",
        "source-layer": "jp_tsunami",
        layout: { "line-join": "round", "line-cap": "round", "line-round-limit": 0 },
        paint: {
          "line-color": config.color.Tsunami.TsunamiWarningColor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 30, 10, 50, 13, 100, 15, 400],
        },
        filter: ["==", "name", ""],
      },
      {
        id: "tsunami_MajorWarn",
        type: "line",
        source: "tsunami",
        "source-layer": "jp_tsunami",
        layout: { "line-join": "round", "line-cap": "round", "line-round-limit": 0 },
        paint: {
          "line-color": config.color.Tsunami.TsunamiMajorWarningColor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 30, 10, 50, 13, 100, 15, 400],
        },
        filter: ["==", "name", ""],
      }
    );
  }

  // 都道府県塗りつぶし・オーバーレイ
  layers.push(
    {
      id: "prefmap_fill",
      type: "fill",
      source: "prefmap",
      "source-layer": "jp_pref",
      paint: {
        "fill-color": high_contrast ? "#000" : "#333",
        "fill-opacity": 1,
      },
    },
    {
      id: "basemap_LINE",
      type: "line",
      source: "basemap",
      "source-layer": "jp_sect",
      minzoom: 6,
      paint: {
        "line-color": high_contrast ? "#FFF" : "#666",
        "line-width": 1,
      },
    },
    { id: "over0", type: "raster", source: "over0", layout: { visibility: "none" } },
    { id: "over1", type: "raster", source: "over1", layout: { visibility: "none" } },
    { id: "over2", type: "raster", source: "over2", layout: { visibility: "none" } },
    { id: "over3", type: "raster", source: "over3", layout: { visibility: "none" } },
    { id: "over4", type: "raster", source: "over4", layout: { visibility: "none" } },
    { id: "over5", type: "raster", source: "over5", layout: { visibility: "none" } }
  );

  // 震度0塗りつぶし（EQDetail用）
  if (options.includeLgInt && config?.color?.Shindo?.["0"]) {
    layers.push({
      id: "Int0",
      type: "fill",
      source: "basemap",
      "source-layer": "jp_sect",
      paint: { "fill-color": config.color.Shindo["0"].background },
      filter: ["==", "name", ""],
    });
  }

  // 震度1〜7 塗りつぶし（共通）
  const shindoList = [
    { id: "Int1", key: "1" },
    { id: "Int2", key: "2" },
    { id: "Int3", key: "3" },
    { id: "Int4", key: "4" },
    { id: "Int5-", key: "5m" },
    { id: "Int5+", key: "5p" },
    { id: "Int6-", key: "6m" },
    { id: "Int6+", key: "6p" },
    { id: "Int7", key: "7" },
  ];
  shindoList.forEach((s) => {
    if (config?.color?.Shindo?.[s.key]) {
      layers.push({
        id: s.id,
        type: "fill",
        source: "basemap",
        "source-layer": "jp_sect",
        paint: { "fill-color": config.color.Shindo[s.key].background },
        filter: ["==", "name", ""],
      });
    }
  });

  // 長周期地震動階級 塗りつぶし（EQDetail用）
  if (options.includeLgInt && config?.color?.LgInt) {
    ["1", "2", "3", "4"].forEach((lvl) => {
      if (config.color.LgInt[lvl]) {
        layers.push({
          id: `LgInt${lvl}`,
          type: "fill",
          source: "basemap",
          "source-layer": "jp_sect",
          paint: { "fill-color": config.color.LgInt[lvl].background },
          filter: ["==", "name", ""],
        });
      }
    });
  }

  // 境界線・水域
  layers.push(
    {
      id: "prefmap_LINE",
      type: "line",
      source: "prefmap",
      "source-layer": "jp_pref",
      paint: {
        "line-color": high_contrast ? "#FFF" : "#999",
        "line-width": 1,
      },
    },
    {
      id: "worldmap_fill",
      type: "fill",
      source: "worldmap",
      "source-layer": "world",
      paint: {
        "fill-color": high_contrast ? "#000" : "#333",
        "fill-opacity": 1,
      },
    },
    {
      id: "worldmap_LINE",
      type: "line",
      source: "worldmap",
      "source-layer": "world",
      paint: {
        "line-color": high_contrast ? "#FFF" : "#999",
        "line-width": 1,
      },
    },
    {
      id: "lake_fill",
      type: "fill",
      source: "lake",
      paint: {
        "fill-color": high_contrast ? "#FFF" : "#325385",
        "fill-opacity": high_contrast ? 1 : 0.5,
      },
      minzoom: 6,
    }
  );

  // 国土地理院ベクトル地物（河川・道路・鉄道・建物・行政界）
  layers.push(
    {
      id: "河川中心線",
      type: "line",
      source: "v",
      "source-layer": "RvrCL",
      filter: ["!", ["in", ["get", "vt_code"], ["literal", [5302, 5322]]]],
      paint: { "line-color": "#2468cb66", "line-width": 2 },
      layout: { visibility: "none" },
    },
    {
      id: "水涯線",
      type: "line",
      source: "v",
      "source-layer": "WL",
      paint: { "line-color": "#2468cb66", "line-width": 2 },
      layout: { visibility: "none" },
    },
    {
      id: "道路中心線ZL4-10国道・高速",
      maxzoom: 11,
      minzoom: 9,
      type: "line",
      source: "v",
      "source-layer": "RdCL",
      filter: [
        "any",
        ["in", ["get", "vt_rdctg"], ["literal", ["主要道路", "国道", "都道府県道", "市区町村道等"]]],
        ["==", ["get", "vt_rdctg"], "高速自動車国道等"],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
        "line-sort-key": ["get", "vt_drworder"],
        visibility: "none",
      },
      paint: { "line-color": "#80808066", "line-width": 3 },
    },
    {
      id: "道路中心線色0",
      minzoom: 11,
      maxzoom: 17,
      type: "line",
      source: "v",
      "source-layer": "RdCL",
      filter: [
        "any",
        [
          "step",
          ["zoom"],
          [
            "all",
            ["==", ["get", "vt_lvorder"], 0],
            ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]],
          ],
          17,
          [
            "all",
            ["in", ["get", "vt_flag17"], ["literal", [1, 2]]],
            ["!", ["in", ["get", "vt_code"], ["literal", [2724, 2734]]]],
          ],
        ],
        [
          "all",
          ["==", ["get", "vt_lvorder"], 0],
          ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]],
        ],
      ],
      layout: {
        "line-join": "round",
        "line-round-limit": 1.57,
        "line-sort-key": ["get", "vt_drworder"],
        visibility: "none",
      },
      paint: { "line-color": "#80808066", "line-width": 2 },
    },
    {
      id: "鉄道中心線",
      minzoom: 11,
      maxzoom: 17,
      type: "line",
      source: "v",
      "source-layer": "RailCL",
      filter: [
        "any",
        ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 0]],
        ["all", ["==", ["get", "vt_railstate"], "橋・高架"], ["==", ["get", "vt_lvorder"], 0]],
        ["all", ["!", ["in", ["get", "vt_railstate"], ["literal", ["トンネル", "雪覆い", "地下", "橋・高架"]]]], ["==", ["get", "vt_lvorder"], 1]],
      ],
      paint: {
        "line-color": "#80808066",
        "line-width": 2.5,
        "line-dasharray": [1, 1],
      },
      layout: { visibility: "none" },
    },
    {
      id: "建築物0",
      type: "fill",
      source: "v",
      "source-layer": "BldA",
      filter: ["==", ["get", "vt_lvorder"], 0],
      paint: { "fill-color": "#80808033" },
      layout: { visibility: "none" },
    },
    {
      id: "道路中心線色1",
      minzoom: 11,
      maxzoom: 17,
      type: "line",
      source: "v",
      "source-layer": "RdCL",
      filter: [
        "all",
        ["==", ["get", "vt_lvorder"], 1],
        ["!", ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733, 2724, 2734]]]],
      ],
      layout: {
        visibility: "none",
        "line-join": "round",
        "line-round-limit": 1.57,
        "line-sort-key": ["get", "vt_drworder"],
      },
      paint: {
        "line-color": "#80808066",
        "line-width": 4,
        "line-dasharray": [1, 1],
      },
    },
    {
      id: "道路中心線色橋1",
      minzoom: 11,
      maxzoom: 17,
      type: "line",
      source: "v",
      "source-layer": "RdCL",
      filter: [
        "all",
        ["==", ["get", "vt_lvorder"], 1],
        ["in", ["get", "vt_code"], ["literal", [2703, 2713, 2723, 2733]]],
      ],
      layout: {
        "line-join": "round",
        "line-round-limit": 1.57,
        "line-sort-key": ["get", "vt_drworder"],
        visibility: "none",
      },
      paint: { "line-color": "#80808066", "line-width": 1.5 },
    },
    {
      id: "道路縁",
      minzoom: 17,
      type: "line",
      source: "v",
      "source-layer": "RdEdg",
      layout: {
        "line-cap": "square",
        "line-sort-key": ["get", "vt_drworder"],
        visibility: "none",
      },
      paint: { "line-color": "#80808066", "line-width": 1.5 },
    },
    {
      id: "行政区画界線25000市区町村界",
      type: "line",
      source: "v",
      "source-layer": "AdmBdry",
      filter: ["==", ["get", "vt_code"], 1212],
      layout: { "line-cap": "square", visibility: "none" },
      paint: { "line-color": "#666666", "line-width": 1 },
    },
    {
      id: "hinanjo",
      type: "raster",
      source: "hinanjo",
      layout: { visibility: "none" },
      minzoom: 10,
    }
  );

  // 画面固有の観測点レイヤー等（mainWindow用: 注記の手前に挿入）
  if (options.pointLayers && Array.isArray(options.pointLayers)) {
    layers.push(...options.pointLayers);
  }

  // 注記レイヤー（共通の複雑な式）
  const annoFilter100Over = [
    "step", ["zoom"],
    ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]],
    16,
    ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]],
    17,
    ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [653, 661, 662, 3201, 3202, 3203, 3204, 3211, 3215, 3216, 3217, 3218, 3231, 3232, 3242, 3243, 3244, 3261, 4101, 4102, 4103, 4104, 4105, 6301, 6311, 6312, 6313, 6314, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6332, 6342, 6351, 6362, 7101, 7102, 7103, 7711, 8103, 8105]]]],
  ];

  const annoFilter100Under = [
    "step", ["zoom"],
    ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]],
    16,
    ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [0, 1]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]],
    17,
    ["all", ["==", ["geometry-type"], "Point"], ["in", ["get", "vt_flag17"], ["literal", [1, 2]]], ["in", ["get", "vt_code"], ["literal", [621, 631, 632, 633, 1301, 1302, 1303, 1401, 1402, 1403, 2941, 2942, 2945, 3205, 3206, 3212, 3213, 3214, 3221, 3241, 6331, 6361, 6367, 6368, 6371, 6373, 6375, 6376, 6381, 7201, 7221]]]],
  ];

  const annoTextFont = [
    "match", ["get", "vt_code"],
    [321, 322, 341, 342, 344, 345, 347, 820, 840, 841, 842],
    ["literal", ["NotoSerifJP-SemiBold"]],
    ["literal", ["NotoSansJP-Regular"]],
  ];

  const annoTextSize = [
    "let", "size",
    ["match", ["get", "vt_code"],
      [361, 1403, 7101, 7102, 7103, 7201, 7221], 10,
      [334, 730], 11,
      [312, 313, 314, 315, 316, 322, 323, 332, 342, 353, 412, 533, 621, 631, 632, 633, 634, 653, 654, 720, 999, 2941, 2942, 2943, 2944, 2945], 12,
      [343, 1402, 7711], 13,
      [311, 346, 347, 413, 422, 1303], 14,
      [210, 220, 321, 331, 352, 411, 421, 423, 431, 432, 441, 511, 521, 522, 523, 531, 532, 534, 611, 612, 613, 615, 651, 661, 662, 671, 672, 673, 681, 1302], 15,
      [130, 1301, 1401], 16,
      [140, 333, 351], 18,
      [110, 120, 341, 344, 345], 20,
      [348, 800, 810, 820, 822, 830, 831, 832, 833, 840, 841, 842, 843, 850, 860, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899], 24,
      10,
    ],
    [
      "interpolate", ["linear"], ["zoom"],
      4, ["*", 0.6, ["var", "size"]],
      8, ["var", "size"],
      11, ["match", ["get", "vt_code"], [1401, 1402, 1403], 20, 422, ["*", 0.7, ["var", "size"]], ["var", "size"]],
      12, ["var", "size"],
      14, ["match", ["get", "vt_code"], [2941, 2942], ["*", 1.3, ["var", "size"]], ["var", "size"]],
      17, ["match", ["get", "vt_code"], [412, 422], ["*", 2, ["var", "size"]], ["var", "size"]],
    ],
  ];

  const annoTextColor = [
    "let", "color",
    ["match", ["get", "vt_code"],
      521, "rgba(80,80,80,1)",
      348, "rgba(150,150,150,1)",
      [411, 412, 413, 421, 422, 423, 431, 432, 441, 860, 2941, 2942, 2943, 2944, 2945], "rgba(230,230,230,1)",
      [7372, 7711], "rgba(80,80,80,1)",
      7352, "rgba(50,50,50,1)",
      [2901, 2903, 2904], "rgba(255,255,255,1)",
      [321, 322, 341, 344, 345, 820, 840, 841], "rgba(80,80,80,1)",
      220, "rgba(150,150,150,1)",
      312, "rgba(150,150,150,1)",
      [333, 346], "rgba(150,150,150,1)",
      [511, 522, 523, 531, 532, 534, 611, 612, 613, 614, 615, 621, 623, 631, 632, 633, 634, 641, 642, 651, 652, 653, 654, 661, 662, 671, 672, 673, 681, 720, 730, 870, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 899, 999, 3201, 3202, 3203, 3204, 3205, 3206, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3221, 3231, 3232, 3241, 3242, 3243, 3244], "rgba(150,150,150,1)",
      "rgba(200,200,200,1)",
    ],
    [
      "step", ["zoom"],
      ["match", ["get", "vt_code"], [661, 662], "rgba(200,200,200,0)", ["var", "color"]],
      14,
      ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(200,200,200,0)", ["var", "color"]],
    ],
  ];

  const annoHaloColor = [
    "step", ["zoom"],
    ["match", ["get", "vt_code"], [661, 662], "rgba(50,50,50,0)", "rgba(50,50,50,1)"],
    14,
    ["match", ["get", "vt_code"], [3201, 3204, 3215, 3216, 3217, 3218, 3243], "rgba(50,50,50,0)", "rgba(50,50,50,1)"],
  ];

  layers.push(
    {
      id: "注記シンボル付きソート順100以上",
      type: "symbol",
      source: "v",
      "source-layer": "Anno",
      filter: annoFilter100Over,
      layout: {
        visibility: "none",
        "text-allow-overlap": false,
        "text-font": annoTextFont,
        "text-justify": "auto",
        "text-size": annoTextSize,
        "text-field": ["get", "vt_text"],
        "text-max-width": 100,
        "text-radial-offset": 0.5,
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-writing-mode": ["horizontal"],
      },
      paint: {
        "text-color": annoTextColor,
        "text-halo-color": annoHaloColor,
        "text-halo-width": 1,
      },
    },
    {
      id: "注記シンボル付きソート順100未満",
      type: "symbol",
      source: "v",
      "source-layer": "Anno",
      filter: annoFilter100Under,
      layout: {
        visibility: "none",
        "text-allow-overlap": false,
        "text-font": annoTextFont,
        "text-justify": "auto",
        "text-size": annoTextSize,
        "text-field": ["get", "vt_text"],
        "text-max-width": 100,
        "text-radial-offset": 0.5,
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-writing-mode": ["horizontal"],
      },
      paint: {
        "text-color": annoTextColor,
        "text-halo-color": annoHaloColor,
        "text-halo-width": 1,
      },
    }
  );

  return {
    version: 8,
    projection: { type: config?.data?.globeView ? "globe" : "mercator" },
    glyphs: "https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf",
    transition: options.transition,
    sources: baseSources,
    layers: layers,
  };
}

// 避難所の動的タイル読み込み設定
function setupHinanjoLoader(map, config, hinanjoLayers, popupFunc) {
  map.on("sourcedataloading", (e) => {
    const isHinanjoEnabled = config?.data?.overlay?.includes("hinanjo");
    if (!map || e.sourceId !== "hinanjo" || !isHinanjoEnabled || e.tile === undefined) return;

    const ca = e.tile.tileID.canonical;
    const eq_name = `hinanjo_eq_${ca.x}${ca.y}${ca.z}`;
    const ts_name = `hinanjo_ts_${ca.x}${ca.y}${ca.z}`;

    if (map.getLayer(eq_name)) map.removeLayer(eq_name);
    if (map.getSource(eq_name)) map.removeSource(eq_name);
    if (map.getLayer(ts_name)) map.removeLayer(ts_name);
    if (map.getSource(ts_name)) map.removeSource(ts_name);

    map.addSource(eq_name, {
      type: "geojson",
      data: `https://cyberjapandata.gsi.go.jp/xyz/skhb04/${ca.z}/${ca.x}/${ca.y}.geojson`,
    });
    map.addLayer({
      id: eq_name,
      type: "circle",
      source: eq_name,
      layout: { visibility: isHinanjoEnabled ? "visible" : "none" },
      paint: {
        "circle-color": "#bf8715",
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#222",
      },
      minzoom: 10,
      maxzoom: 22,
    });

    map.addSource(ts_name, {
      type: "geojson",
      data: `https://cyberjapandata.gsi.go.jp/xyz/skhb05/${ca.z}/${ca.x}/${ca.y}.geojson`,
    });
    map.addLayer({
      id: ts_name,
      type: "circle",
      source: ts_name,
      layout: { visibility: isHinanjoEnabled ? "visible" : "none" },
      paint: {
        "circle-color": "#2488c7",
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#222",
      },
      minzoom: 10,
      maxzoom: 22,
    });

    if (popupFunc) {
      map.on("click", eq_name, popupFunc);
      map.on("click", ts_name, popupFunc);
    }
    if (hinanjoLayers && Array.isArray(hinanjoLayers)) {
      hinanjoLayers.push(eq_name, ts_name);
    }
  });
}
