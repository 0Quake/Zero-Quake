# Zero-Quake

## 受信できる情報

### 気象庁

- 緊急地震速報（予報・警報）
- 地震情報（震度速報／震源に関する情報／震度・震源に関する情報／遠地地震に関する情報／顕著な地震の震源要素更新のお知らせ／推計震度分布）
- 津波情報（大津波警報／津波警報／津波注意報／津波予報／津波情報／沖合の津波観測に関する情報）

### 防災科学研究所

- リアルタイム揺れ情報
- 長周期地震動情報

### USGS(アメリカ地質調査所)

- Earthquake Catalog

## 情報源

### 緊急地震速報

- 強震モニタ
  - 強震モニタ[© 防災科学技術研究所](http://www.kmoni.bosai.go.jp/)
  - 長周期地震動モニタ[© 防災科学技術研究所](lmoni.bosai.go.jp)
  - Yahoo 強震モニタ[© 防災科学技術研究所／Yahoo Japan](https://typhoon.yahoo.co.jp/weather/jp/earthquake/kyoshin/)
- P2P 地震情報 API[©@p2pquake_takuya](https://www.p2pquake.net/json_api_v2/)
- (SignalNow X 連携)

### 地震情報(震度速報／震源に関する情報／震度・震源に関する情報／顕著な地震の震源要素更新のお知らせ)／推計震度分布

- 気象庁ホームページ[© 気象庁](https://www.jma.go.jp/bosai/map.html?contents=earthquake_map)
- 気象庁防災情報 XML[© 気象庁](https://xml.kishou.go.jp/xmlpull.html)
- narikakun.net 地震情報 API©[narikakun](https://dev.narikakun.net/doc/earthquake)

### 地震情報(Earthquake Catalog)

- FDSN Web Service[©USGS](https://earthquake.usgs.gov/fdsnws/event/1/)

### 大津波警報／津波警報／津波注意報

- P2P 地震情報 API[©@p2pquake_takuya](https://www.p2pquake.net/json_api_v2/)
- 気象庁防災情報 XML[© 気象庁](https://xml.kishou.go.jp/xmlpull.html)

### 津波情報／津波予報

- 気象庁防災情報 XML[© 気象庁](https://xml.kishou.go.jp/xmlpull.html)

### P 波・S 波 予報円

- 緊急地震速報から得られる、地震発生時刻・深さ・震源の緯度・経度をもとに
  [JMA2001 走時表](https://www.data.jma.go.jp/eqev/data/bulletin/catalog/appendix/trtime/trt_j.html)
  を利用して計算

## その他の情報源

### 地図データ

#### 「オフラインマップ」

- 国内：気象庁 予報区等 GIS データ [© 気象庁](https://www.data.jma.go.jp/developer/gis.html)
- 国外：© ne_110m_admin_0_countries [© Natural Earth ](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/)
- 湖沼：© 国土数値情報 [© 国土交通省 ](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-W09-v2_2.html)
  ([mapshaper.org](https://mapshaper.org/)で単純化して使用)

#### タイル地図

- 「気象庁」© 気象庁
- 「地理院 標準地図」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 淡色地図」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 写真」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 白地図」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「OpenStreetMap」[© OpenStreetMap contributors](https://www.openstreetmap.org/copyright/)

#### オーバーレイ

- 「地理院 陰影起伏図」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 火山基本図データ」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 津波浸水想定 ハザードマップ」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 土砂災害警戒区域（地すべり） ハザードマップ」[© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「気象庁　境界線」[© 気象庁](https://www.jma.go.jp/bosai/map.html#contents%3Dearthquake_map)

#### その他

- プレート境界 [テキサス大学](http://www-udc.ig.utexas.edu/external/plates/data.htm)
- S-net ケーブルの経路 [防災科学技術研究所](https://www.seafloor.bosai.go.jp/st_info_map/)

- ([mapshaper.org](https://mapshaper.org/)で単純化して使用)

## 参考資料

[@NoneType1](https://twitter.com/NoneType1) |
[多項式補間を使用して強震モニタ画像から数値データを決定する](https://qiita.com/NoneType1/items/a4d2cf932e20b56ca444)  
[@ingen084](https://twitter.com/ingen084) |
[強震モニタの画像から震度と地点を特定するまで](https://qiita.com/ingen084/items/7e91f8da2996972ac586)
