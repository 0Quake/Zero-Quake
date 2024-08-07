# Zero-Quake

![](https://img.shields.io/github/downloads/0quake/Zero-Quake/total)
![](https://img.shields.io/github/v/release/0Quake/Zero-Quake)
![](https://img.shields.io/github/license/0quake/Zero-Quake)

## ご注意

- [気象庁「緊急地震速報について」](https://www.data.jma.go.jp/svd/eew/data/nc/)を確認し、緊急地震速報について正しく理解したうえでご利用ください。
- 地図に表示されるリアルタイムの揺れ情報には、生活振動などを含みます。
- TREM-RTS から取得する台湾の揺れ情報は、日本とは異なる尺度の震度ですが、おおむね日本の震度と対応するため、そのまま表示しています。
- インターネットを使用して情報を取得する都合で、情報の遅延・取得漏れ等があり得ます。
- 当アプリとしては、動画・配信等での使用は制限しませんが、当アプリで使用している情報源、合成音声システム等に付帯する、第三者の権利には十分にご注意ください。

## 受信できる情報

### 気象庁による気象情報

- ### 緊急地震速報

  予報・警報／キャンセル報／PLUM 法など含む
  <details>
  <summary>情報源</summary>
  <ul>
    <li>Wolfx <a href="https://api.wolfx.jp/">© Wolfx Studio.</a></li>
    <li>ProjectBS © CrossRoad</li>
    <li>Axis <a href="https://axis.prioris.jp/">© Prioris</a>（無料登録必須）</li>
    <li>P2P 地震情報 API <a href="https://www.p2pquake.net/json_api_v2/">© P2P地震情報</a>（警報のみ）</li>
  </ul>
  </details>

- ### 地震情報

  震度速報／震源に関する情報／震度・震源に関する情報[震度・震源情報/遠地地震に関する情報]  
  長周期地震動に関する観測情報※／顕著な地震の震源要素更新のお知らせ／推計震度分布※  
  南海トラフ地震に関連する情報[南海トラフ地震臨時情報/南海トラフ地震関連解説情報]
  <details>
  <summary>情報源</summary>
  <ul>
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
- TREM-RTS※（台湾など コミュニティ地震観測網）

※<a href="https://github.com/whes1015">YuYu1015 様</a>のご厚意でデータを提供していただいています

<details>
<summary>情報源</summary>
<ul>
  <li>強震モニタ <a href="http://www.kmoni.bosai.go.jp/">© 防災科学技術研究所</a>（強震／毎秒）</li>
  <li>長周期地震動モニタ <a href="http://www.lmoni.bosai.go.jp/">© 防災科学技術研究所</a>（強震／毎秒）</li>
  <li>海しる <a href="https://www.msil.go.jp/">© Japan Coast Guard, 防災科学技術研究所</a>（海底／3分毎）</li>
  <li>TREM-RTS API © ExpTech Studio（台湾など／毎秒）</li>
</ul>
</details>

### その他

1. Earthquake Catalog（USGS）
2. リアルタイム地震情報（Early-Est）
   <details>
   <summary>情報源</summary>
   <ol>
     <li>FDSN Web Service <a href="https://earthquake.usgs.gov/fdsnws/event/1/">© USGS</a></li>
     <li>Early-est <a href="http://early-est.rm.ingv.it">© イタリア国立地球物理学火山学研究所</a></li>
   </ol>
   </details>

## 使用素材

### 地図データ

#### ベースマップ

- 「標準」 (単純化して使用)
  - 国内：気象庁 予報区等 GIS データ [© 気象庁](https://www.data.jma.go.jp/developer/gis.html)
  - 国外：ne_110m_admin_0_countries [© Natural Earth ](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/)
  - 湖沼：国土数値情報 [© 国土交通省 ](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-W09-v2_2.html)
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

#### その他 GIS データ

- プレート境界： [© Hugo Ahlenius, Nordpil and Peter Bird](https://raw.githubusercontent.com/fraxen/tectonicplates/master/LICENSE.md)
- 海底地形：[NOAA National Centers for Environmental Information. 2022: ETOPO 2022 15 Arc-Second Global Relief Model.](https://doi.org/10.25921/fd45-gt74)

### フォント（Google Fonts）

- 太字 MPLUS1p-ExtraBold
- 標準 BIZUDPGothic-Regular
- 数字 AzeretMono-Regular
- アイコン MaterialIcons

### その他

- 強震観測点の情報（編集して使用） [© 2019 ingen084](https://raw.githubusercontent.com/ingen084/KyoshinEewViewerIngen/develop/LICENSE)
- 地盤増幅率：表層地盤情報提供 API [© 防災科学技術研究所／下記文献](https://www.j-shis.bosai.go.jp/api-sstruct-meshinfo)

  1. 若松加寿江・松岡昌志(2013)：全国統一基準による地形・地盤分類 250m メッシュマップの構築とその利用，地震工学会誌 No.18, pp.35-38.
  2. Wakamatsu, K. and Matsuoka, M. (2013): " Nationwide 7.5-Arc-Second Japan Engineering Geomorphologic Classification Map and Vs30 Zoning", Journal of Disaster Research Vol.8 No.5, pp.904-911.
  3. 松岡昌志・若松加寿江(2008) ： 地形・地盤分類 250m メッシュマップ全国版に基づく地盤のゆれやすさデータ，産業技術総合研究所，知的財産管理番号 H20PRO-936．
  4. 藤本一雄・翠川三郎(2006) : 近接観測点ペアの強震観測記録に基づく地盤増幅度と地盤の平均 S 波速度の関係,日本地震工学会論文集,Vol.6,No.1,pp.11-22.

- [KyoshinShindoColorMap](https://github.com/ingen084/KyoshinShindoColorMap) ingen084 様, こんぽ様
