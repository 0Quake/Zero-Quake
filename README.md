# Zero-Quake

![](https://img.shields.io/github/downloads/0quake/Zero-Quake/total)
![](https://img.shields.io/github/v/release/0Quake/Zero-Quake)
![](https://img.shields.io/github/license/0quake/Zero-Quake)

## ご注意

- 地震に関する正確な知識に基づき、正しくお使いください。
- インターネットを使用して情報を取得する都合で、情報の遅延・欠損等があり得ます。
- 動画・配信等での使用は制限しませんが、当アプリで使用する情報源・合成音声システム等に付帯する第三者の権利に関しては、ご自身で確認うえ、自己責任でご使用ください。
- 地図に表示されるリアルタイムの揺れ情報には、生活振動などを含みます。
- TREM-RTS から取得する台湾などの揺れ情報は、日本とは異なる尺度の震度ですが、おおむね日本の震度と対応するため、そのまま表示しています。
- Early-Estによる情報は実験的なものであり、専門家による検証を経ていません。自己責任にて有効化してください。

## 受信できる防災情報の一覧／出典

- ### 緊急地震速報 (気象庁)

  予報・警報／キャンセル報／PLUM 法など含む
  <details>
  <summary>出典・情報源</summary>
  <ul>
    <li>Wolfx (By: Wolfx Project)</li>
    <li>ProjectBS (By: CrossRoad)</li>
    <li>Axis (By:Prioris)（無料登録必須）</li>
    <li>P2P 地震情報 API (By: P2P地震情報)（警報のみ）</li>
  </ul>
  </details>

- ### 地震情報 (気象庁)

  震度速報 ／ 震源に関する情報 ／ 震度・震源に関する情報 _[震度・震源情報/遠地地震に関する情報]_  
  長周期地震動に関する観測情報※ ／ 顕著な地震の震源要素更新のお知らせ ／ 推計震度分布※  
  南海トラフ地震に関連する情報 _[南海トラフ地震臨時情報/南海トラフ地震関連解説情報]_
  地震の活動状況等に関する情報／北海道・三陸沖後発地震注意情報／地震回数に関する情報
  <details>
  <summary>出典・情報源</summary>
  <ul>
    <li>出典：<a href="https://xml.kishou.go.jp/xmlpull.html">気象庁防災情報 XML</a></li>
    <li>出典：<a href="https://www.jma.go.jp/bosai/map.html?contents=earthquake_map">気象庁ホームページ</a>（※の項目のみ）</li>
    <li>nTool Earthquake API</li>
    <li>Axis(By:Prioris)（無料登録必須）</li>
  </ul>
  </details>

- ### 津波情報 (気象庁)

  大津波警報／津波警報／津波注意報／津波予報※  
  津波情報／沖合の津波観測に関する情報※
  国際津波関連情報(WEPA40)☆
  <details>
  <summary>出典・情報源</summary>
  <ul>
    <li>出典：<a href="https://xml.kishou.go.jp/xmlpull.html">気象庁防災情報 XML</a></li>
    <li>出典：<a href="https://www.jma.go.jp/bosai/map.html#contents=pacifictsunami">気象庁ホームページ</a>（☆の項目のみ）</li>
    <li>P2P 地震情報 API（※の項目を除く）</li>
  </ul>
  </details>

- ### リアルタイム揺れ情報

  K-NET, KiK-net（防災科学技術研究所 強震観測網）  
  S-net, 相模湾地震観測施設（防災科学技術研究所 海底観測網）  
  TREM-RTS (SE-Net, MS-Net)※（台湾など コミュニティ観測網）  
  Wolfx SeisJS（中国本土など　コミュニティ観測網）

  ※<a href="https://github.com/whes1015">YuYu1015 様</a>のご厚意でデータを提供していただいています

  <details>
  <summary>出典・情報源</summary>
  <ul>
    <li>出典：強震モニタ <a href="http://www.kmoni.bosai.go.jp/">© 防災科学技術研究所</a>（K-NET, KiK-net）</li>
    <li>出典：長周期地震動モニタ <a href="http://www.lmoni.bosai.go.jp/">© 防災科学技術研究所</a>（K-NET, KiK-net）</li>
    <li>出典：海しる <a href="https://www.msil.go.jp/">© Japan Coast Guard, 防災科学技術研究所</a>（S-net, 相模湾地震観測施設）</li>
    <li>出典：TREM-RTS API（TREM-RTS）</li>
    <li>出典：Wolfx Project（Wolfx SeisJS）</li>
  </ul>
  </details>

- ### 解説情報

  各月の地震活動のまとめ
  <details>
  <summary>出典・情報源</summary>
    <ul><li>出典：<a href="https://www.data.jma.go.jp/svd/eqev/data/gaikyo/">気象庁ホームページ「各月の地震活動のまとめ」</a></li>
  </ul>
  </details>

- ### 海外の地震情報

  1. USGS Earthquake Catalog
  2. Early-Est リアルタイム地震情報
  <details>
  <summary>出典・情報源</summary>
  <ol>
    <li>© U.S. Geological Survey</li>
    <li>© INGV - National Institute of Geophysics and Volcanology (イタリア国立地球物理学火山学研究所)</li>
  </ol>
  </details>

## その他の出典表示

### 地図データ

- 国内陸地 出典： 気象庁「[地震情報／細分区域](https://www.data.jma.go.jp/developer/gis.html)」※
- 国内湖沼 出典：国土交通省「[国土数値情報(湖沼データ)](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-W09-v2_2.html)」※
- 国外陸地 出典：Natural Earth※
- プレート境界 出典

  1. [© Hugo Ahlenius, Nordpil, Peter Bird](http://opendatacommons.org/licenses/by/1.0/)
  2. 気象庁「[震度データベース検索](https://www.data.jma.go.jp/eqdb/data/shindo/)」(地図部分を編集して使用)
- 海底地形 出典：GEBCO
- [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright/)
- 最適化ベクトルタイル, 地理院タイル [© 国土地理院](https://maps.gsi.go.jp/development/ichiran.html)  

※加工（単純化処理）して使用

### フォント

- © 2022 The BIZ UDGothic Project Authors /
  [OFL](https://openfontlicense.org/open-font-license-official-text/)
- © 2016 The M+ Project Authors. /
  [OFL](https://openfontlicense.org/open-font-license-official-text/)
- © 2021 The Azeret Project Authors /
  [OFL](https://openfontlicense.org/open-font-license-official-text/)
- © Google /
  [Apache License, Version 2.0](https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/LICENSE)

### その他
- turf-distance（変更して使用） [© 2014 Morgan Herlocker](http://mit-license.org/)
- KyoshinShindoColorMap © ingen084, こんぽ
- 表層地盤増幅率：防災科学技術研究所 ／ 下記文献

  1. 若松加寿江・松岡昌志(2013)：全国統一基準による地形・地盤分類 250m メッシュマップの構築とその利用，地震工学会誌 No.18, pp.35-38.
  2. Wakamatsu, K. and Matsuoka, M. (2013): " Nationwide 7.5-Arc-Second Japan Engineering Geomorphologic Classification Map and Vs30 Zoning", Journal of Disaster Research Vol.8 No.5, pp.904-911.
  3. 松岡昌志・若松加寿江(2008) ： 地形・地盤分類 250m メッシュマップ全国版に基づく地盤のゆれやすさデータ，産業技術総合研究所，知的財産管理番号 H20PRO-936．
  4. 藤本一雄・翠川三郎(2006) : 近接観測点ペアの強震観測記録に基づく地盤増幅度と地盤の平均 S 波速度の関係,日本地震工学会論文集,Vol.6,No.1,pp.11-22.
