# Zero-Quake

## 受信できる情報

- 緊急地震速報（予報・警報）※PLUM 法・深発地震含む
- 津波情報（大津波警報・津波警報・津波注意報）
- 地震情報（震度速報・震源に関する情報・震度・震源に関する情報）

## 情報源

Zero Quake が情報を取得している情報源

### 緊急地震速報

- 強震モニタ
  - [強震モニタ](kmoni.bosai.go.jp)
  - [長周期地震動モニタ](lmoni.bosai.go.jp)
  - [Yahoo 強震モニタ](https://typhoon.yahoo.co.jp/weather/jp/earthquake/kyoshin/)
- [narikakun.net 緊急地震速報 API](https://dev.narikakun.net/doc/eew)
- [P2P 地震情報 API](https://www.p2pquake.net/json_api_v2/)

### 地震情報

- [気象庁](https://www.jma.go.jp/bosai/map.html?contents=earthquake_map)
- [NHK](https://www.nhk.or.jp/kishou-saigai/earthquake/)
- [narikakun.net 地震情報 API](https://dev.narikakun.net/doc/earthquake)
- [AQUA システム](https://www.hinet.bosai.go.jp/AQUA/aqua_catalogue.php?LANG=ja)
- [FDSN Web Service](https://earthquake.usgs.gov/fdsnws/event/1/)

### 津波情報

- [P2P 地震情報 API](https://www.p2pquake.net/json_api_v2/)

### P 波・S 波 予報円

- 緊急地震速報から得られる、地震発生時刻・深さ・震源の緯度・経度をもとに
  [JMA2001 走時表](https://www.data.jma.go.jp/eqev/data/bulletin/catalog/appendix/trtime/trt_j.html)
  を利用して計算

## 参考資料

[@NoneType1](https://twitter.com/NoneType1) |
[多項式補間を使用して強震モニタ画像から数値データを決定する](https://qiita.com/NoneType1/items/a4d2cf932e20b56ca444)  
[@ingen084](https://twitter.com/ingen084) |
[強震モニタの画像から震度と地点を特定するまで](https://qiita.com/ingen084/items/7e91f8da2996972ac586)
[@YasumiYasumi](https://qiita.com/YasumiYasumi)|
[【ワンライナー】緯度経度から１行で距離計算](https://qiita.com/YasumiYasumi/items/9e8a6f185b00cba8c8bd)
