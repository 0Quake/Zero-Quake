# Zero-Quake

![](https://img.shields.io/github/downloads/0quake/Zero-Quake/total)
![](https://img.shields.io/github/v/release/0Quake/Zero-Quake)
![](https://img.shields.io/github/license/0quake/Zero-Quake)

## 受信できる情報

### 気象庁

- ### 緊急地震速報

  予報・警報／キャンセル報／PLUM 法など含む
  <details>
  <summary>情報源</summary>
  <ul>
    <li>Wolfx <a href="https://api.wolfx.jp/">© Wolfx Studio.</a></li>
    <li>ProjectBS <a href="https://doc.telegram.projectbs.cn/jmaeew/">© CrossRoad</a></li>
    <li>Axis <a href="https://axis.prioris.jp/">© Prioris</a>（無料登録必須）</li>
    <li>P2P 地震情報 API <a href="https://www.p2pquake.net/json_api_v2/">© P2P地震情報</a>（警報のみ）</li>
  </ul>
  </details>

- ### 地震情報

  震度速報／震源に関する情報／震度・震源に関する情報[震度・震源情報/遠地地震に関する情報]  
  長周期地震動に関する観測情報※／顕著な地震の震源要素更新のお知らせ／推計震度分布※
  南海トラフ地震に関連する情報※[南海トラフ地震臨時情報/南海トラフ地震関連解説情報]
  <details>
  <summary>情報源</summary>
  <ul>
    <li>Wolfx <a href="https://api.wolfx.jp/">© Wolfx Studio.</a></li>
    <li>気象庁防災情報 XML <a href="https://xml.kishou.go.jp/xmlpull.html">© 気象庁</a></li>
    <li>nTool Earthquake API<a href="https://ntool.online/apidoc/earthquakeapi">© Narikakun Network</a></li>
    <li>Axis <a href="https://axis.prioris.jp/">© Prioris</a>（無料登録必須）</li>
    <li>気象庁ホームページ <a href="https://www.jma.go.jp/">© 気象庁</a>（※の項目のみ）</li>
  </ul>
  </details>

- ### 津波情報

  大津波警報／津波警報／津波注意報／津波予報※  
  津波情報／沖合の津波観測に関する情報※
  <details>
  <summary>情報源</summary>
  <ul>
    <li>気象庁防災情報 XML <a href="https://xml.kishou.go.jp/xmlpull.html">© 気象庁</a></li>
    <li>P2P 地震情報 API <a href="https://www.p2pquake.net/json_api_v2/">@p2pquake_takuya</a>（※の項目を除く）</li>
  </ul>
  </details>

### リアルタイム揺れ情報

- K-NET, KiK-net（防災科学技術研究所 強震観測網）
- S-net, 相模湾地震観測施設（防災科学技術研究所 海底地震計）
<details>
<summary>情報源</summary>
<ul>
  <li>強震モニタ <a href="http://www.kmoni.bosai.go.jp/">© 防災科学技術研究所</a>（強震／毎秒）</li>
  <li>長周期地震動モニタ <a href="http://www.lmoni.bosai.go.jp/">© 防災科学技術研究所</a>（強震／毎秒）</li>
  <li>海しる <a href="https://www.msil.go.jp/">© Japan Coast Guard, 防災科学技術研究所</a>（海底／3分毎）</li>
</ul>
</details>

### その他

1. Earthquake Catalog（USGS）
2. リアルタイム地震情報（Early-Est）
3. 地盤増幅率（緊急地震速報シミュレーション時の震度予想に使用）
   <details>
   <summary>情報源</summary>
   <ol>
     <li>FDSN Web Service <a href="https://earthquake.usgs.gov/fdsnws/event/1/">© USGS</a></li>
     <li>Early-est <a href="http://early-est.rm.ingv.it">© イタリア国立地球物理学火山学研究所</a></li>
     <li>表層地盤情報提供API <a href="https://www.j-shis.bosai.go.jp/api-sstruct-meshinfo">© 防災科学技術研究所</a></li>
   </ol>
   </details>

## 使用素材

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
