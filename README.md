# Zero-Quake

![](https://img.shields.io/github/downloads/0quake/Zero-Quake/total)
![](https://img.shields.io/github/package-json/v/0quake/Zero-Quake)
![](https://img.shields.io/github/license/0quake/Zero-Quake)

## 受信できる情報

### 気象庁

- ### 緊急地震速報

  予報・警報／キャンセル報／PLUM 法など含む

- ### 地震情報

  震度速報／震源に関する情報／震度・震源に関する情報[震度・震源情報/遠地地震に関する情報]  
  長周期地震動に関する観測情報／顕著な地震の震源要素更新のお知らせ／推計震度分布

- ### 津波情報

  大津波警報／津波警報／津波注意報／津波予報  
  津波情報／沖合の津波観測に関する情報

### その他

- リアルタイム揺れ情報（K-NET,KiK-net,S-net,相模湾地震観測施設）
- Earthquake Catalog（USGS）
- リアルタイム地震情報（Early-Est）

## 情報源

### 緊急地震速報

- Wolfx [© Wolfx Studio.](https://api.wolfx.jp/)
- ProjectBS [© CrossRoad 十字路口](https://doc.telegram.projectbs.cn/jmaeew/)
- Axis（無料登録必須） [© Prioris](https://axis.prioris.jp/)
- P2P 地震情報 API（警報のみ） [© @p2pquake_takuya](https://www.p2pquake.net/json_api_v2/)

### 地震情報 (気象庁)

- 気象庁防災情報 XML [© 気象庁](https://xml.kishou.go.jp/xmlpull.html)
- narikakun.net 地震情報 API [© narikakun](https://dev.narikakun.net/doc/earthquake)
- Axis（無料登録必須） [© Prioris](https://axis.prioris.jp/)

### 地震情報 (Earthquake Catalog)

- FDSN Web Service [© USGS](https://earthquake.usgs.gov/fdsnws/event/1/)

### 津波情報 (気象庁)

- P2P 地震情報 API [© @p2pquake_takuya](https://www.p2pquake.net/json_api_v2/)
- 気象庁防災情報 XML [© 気象庁](https://xml.kishou.go.jp/xmlpull.html)

### リアルタイム揺れ情報

- 強震モニタ（地上） [© 防災科学技術研究所](http://www.kmoni.bosai.go.jp/)
- 長周期地震動モニタ（地上） [© 防災科学技術研究所](lmoni.bosai.go.jp)
- 海しる（海底地震計）[© Japan Coast Guard, 防災科学技術研究所](https://www.msil.go.jp/)

### リアルタイム地震情報 (Early-est)

- Early-est [© イタリア国立地球物理学火山学研究所](http://early-est.rm.ingv.it)

### P 波・S 波 予報円

- 緊急地震速報の情報をもとに [JMA2001 走時表](https://www.data.jma.go.jp/eqev/data/bulletin/catalog/appendix/trtime/trt_j.html) を利用して計算

## その他の情報源

### 地図データ

#### ベースマップ

- 「標準」 (単純化して使用)
  - 国内：気象庁 予報区等 GIS データ [© 気象庁](https://www.data.jma.go.jp/developer/gis.html)
  - 国外：ne_110m_admin_0_countries [© Natural Earth ](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/)
  - 湖沼：国土数値情報 [© 国土交通省 ](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-W09-v2_2.html)
  - プレート境界： [© テキサス大学](http://www-udc.ig.utexas.edu/external/plates/data.htm)
- 「地理院地図(標準)」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院地図(淡色)」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院地図(写真)」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「OpenStreetMap」 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright/)

#### オーバーレイ（ハザードマップなど）

- 「詳細地図(地名・道路等)」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 陰影起伏図」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 火山基本図データ」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 津波浸水想定 ハザードマップ」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 土砂災害警戒区域（急傾斜地の崩壊） ハザードマップ」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「地理院 土砂災害警戒区域（地すべり） ハザードマップ」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)
- 「避難所」 [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)

### フォント（Google Fonts）

- 太字 MPLUS1p-ExtraBold
- 標準 BIZUDPGothic-Regular
- 数字 AzeretMono-Regular
- アイコン MaterialIcons
