import workerThreads from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { distance } from "@turf/turf";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

var EEW_Active = false; //EEW発令中かどうか

workerThreads.parentPort.on("message", (message) => {
  switch (message.action) {
    case "EQDetect"://観測点ごとのデータを毎秒受信
      dataStream({
        data: message.data,
        date: Number(new Date(message.date)),
        enabled: message.enabled
      });
      break;
    case "EEW_Active":
      //気象庁のEEW入電時に全イベントを破棄し検知処理を一時停止
      EEW_Active = message.data;
      clearAllEvents();
      break;
    case "Replay":
      //リプレイオフセットの変更（０含む）時に既存イベントを全破棄
      clearAllEvents();
      //過去値に基づくノイズフロア情報もリセット
      for (const st of stationStates.values()) {
        st.noiseFloor = null;
      }
      break;
  }
});

const events = new Map();
const stationStates = new Map();//観測点ごとのワーカー側保持データ
//データフレームなどの初期化
async function init() {
  var Knet_PointsJson = JSON.parse(await readFile(path.join(__dirname, "../Resource/Knet_Points.json")));
  Knet_PointsJson.forEach((elm) => {
    if (elm.IsSuspended) return;
    stationStates.set(elm.Code, {
      code: elm.Code,
      lat: elm.Location.Latitude,
      lon: elm.Location.Longitude,
      neighborsA: [],    //80km以内の観測点のcode
      noiseFloor: null,     //ノイズレベル基準値/初期値null
      isOnset: false,       //単点検知中フラグ
      isTriggered: false,   //統合検知中フラグ
      onsetTime: null, //単点検知時刻
    });
  });

  for (const a of stationStates.values()) {
    var neighborsA_Tmp1 = [];
    var neighborsA_Tmp2 = [];
    for (const b of stationStates.values()) {
      if (a.code == b.code) continue;

      var dist = distance([a.lon, a.lat], [b.lon, b.lat]);
      if (dist <= 60) neighborsA_Tmp1.push({ code: b.code, dist: dist });
      if (dist <= 300) neighborsA_Tmp2.push({ code: b.code, dist: dist });
    }
    if (4 <= neighborsA_Tmp1.length) {
      neighborsA_Tmp1.sort((x, y) => x.dist - y.dist)
      a.neighborsA = neighborsA_Tmp1.map((x) => x.code);
    } else {
      neighborsA_Tmp2.sort((x, y) => x.dist - y.dist)
      a.neighborsA = neighborsA_Tmp2.slice(0, 4).map((x) => x.code);
    }
  }
}
init();

function dataStream(stream) {
  if (!EEW_Active) {
    singlePointProcess(stream);
    const uf = make_union();
    const groups = groupUnion(uf);
    update_events(groups, stream.date);
    cleanup_events(stream.date);
  }

  workerThreads.parentPort.postMessage({
    action: "PointsData_Update",
    data: stream.data,
    date: stream.date,
  });
}

function singlePointProcess(stream) {
  if (!stationStates.size) return;
  var onsetStations = [];
  stream.data.forEach((st) => {
    const state = stationStates.get(st.Code);
    if (!state) return;

    //初回でノイズフロア未設定の場合
    if (state.noiseFloor === null) state.noiseFloor = Math.max(st.shindo, -0.5);

    //単点検知判定
    //閾値式の検討：https://www.desmos.com/calculator/vkhen3u8cp
    const onsetTmp =
      1.19 * state.noiseFloor + 0.95 <= st.shindo &&
      -1.5 <= st.shindo;
    if (!state.isOnset && onsetTmp) {
      state.onsetTime = Number(new Date(stream.date));//単点検知開始時刻
    }
    state.isOnset = onsetTmp;
    st.isOnset = state.isOnset;
    state.shindo = st.shindo;

    //ノイズフロアの更新
    const a = state.isTriggered ? 0.005 : 0.1;//単点検知中はノイズフロアへの影響を小さくする
    state.noiseFloor = (1 - a) * state.noiseFloor + a * st.shindo;

    //統合検知判定の下処理
    if (state.isOnset) onsetStations.push({ state, st });
    state.Prev_isTriggered = state.isTriggered;//値渡し
    state.isTriggered = false; //トリガ判定をfalseで初期化 
  });

  //統合検知判定
  onsetStations.forEach(({ state, st }) => {
    let isTriggered = false;
    if (state.Prev_isTriggered) {
      isTriggered = true;
    } else {
      let knn_onsetCount = 0;//近隣点の単点検知数
      state.neighborsA.forEach(b => {
        const stateb = stationStates.get(b);
        if (stateb?.isOnset) knn_onsetCount++;
      });
      //近傍150km以内の近傍点(最大10点)における単点検知中が２以上あるいは先述の近傍点数と一致
      isTriggered = state.neighborsA.length / knn_onsetCount <= 30;
    }
    st.isTriggered = state.isTriggered = isTriggered;
  });
}

function createUnionFind() {
  const parent = new Map();
  function find(x) {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x))); // 経路圧縮
    }
    return parent.get(x);
  }
  function union(x, y) {
    const rootX = find(x);
    const rootY = find(y);
    if (rootX !== rootY) parent.set(rootX, rootY);
  }
  return { parent, find, union };
}

function make_union() {
  function check_travelTime(a, b) {
    const dt = Math.abs(a.onsetTime - b.onsetTime) / 1000;
    const dist = distance([a.lon, a.lat], [b.lon, b.lat]);
    const vs_min = 0.5; //km/s
    return dt <= dist / vs_min + 5;//震央付近での1sサンプリング周期の影響大に対して10秒の余裕
  }

  var uf = createUnionFind();

  for (const st of stationStates.values()) {
    if (!st.isTriggered) continue;//統合検知中の点のみ処理

    //観測点-観測点結合
    st.neighborsA.forEach((neighborCode) => {
      const neighbor = stationStates.get(neighborCode);
      if (
        neighbor &&
        st.code != neighbor.code &&
        st.isTriggered && neighbor.isTriggered &&
        check_travelTime(st, neighbor)
      ) {
        uf.union(st.code, neighbor.code);
      }
    });

    //観測点-イベント結合
    for (const event of events.values()) {
      event.member.forEach(memberCode => {
        const member = stationStates.get(memberCode);
        const isNeighbor = member.neighborsA.includes(st.code) ||
          st.neighborsA.includes(member.code);//neighborsAは非対称な判定なので両方向で判断する。
        if (st.code != member.code &&
          st.isTriggered && member.isTriggered &&
          isNeighbor &&
          check_travelTime(st, member)
        ) {
          uf.union(st.code, event.id);
        }
      });
    }
  }

  //イベント-イベント結合
  if (events.size >= 2) {
    for (const eventA of events.values()) {
      if (!eventA) continue;
      eventA.member.forEach(codeA => {
        const stA = stationStates.get(codeA);
        for (const eventB of events.values()) {
          if (eventA.id >= eventB.id) continue;
          if (!eventB.member.includes(codeA)) {
            eventB.member.forEach(codeB => {
              const stB = stationStates.get(codeB);
              if (!stA || !stB) return;
              const isNeighbor = stA.neighborsA.includes(stB.code) ||
                stB.neighborsA.includes(stA.code);//neighborsAは非対称な判定なので両方向で判断する。

              if (
                stA != stB &&
                stA.isTriggered && stB.isTriggered &&
                isNeighbor &&
                check_travelTime(stA, stB)
              ) {
                uf.union(eventA.id, eventB.id);
              }
            });
          }
        }
      });
    }
  }

  return uf;
}

function groupUnion(uf) {
  var unionGroups = new Map();

  for (var key of uf.parent.keys()) {
    var root = uf.find(key);
    if (!unionGroups.has(root)) {
      unionGroups.set(root, { stations: [], events: [] });
    }
    var group = unionGroups.get(root);
    if (key.startsWith("evt_")) {
      group.events.push(key);
    } else {
      group.stations.push(key);
    }
  }

  return unionGroups;
}

let current_eventId = 0;
function update_events(groups, date) {

  //イベントの各種パラメータを更新
  function update_prams(eid) {
    var event = events.get(eid)
    var maxInt = event.member.reduce((max, elm) => {
      const elmShindo = stationStates.get(elm)?.shindo ?? -9;
      return elmShindo > max ? elmShindo : max
    }, -Infinity);
    event.maxInt = maxInt;

    event.active_member = event.member.filter((st) => {
      const state = stationStates.get(st);
      return state?.isTriggered
    });

    //検知中の観測点数3以上になったらイベントを有効化（以降そのまま）
    if (3 <= event.active_member.length) event.isConfirmed = true;

    //検知レベル
    event.Prev_Lv = event.Lv;
    event.Lv = event.maxInt > 2.5 ? 2 : 1;
  }


  function send_event(event) {
    event.serial++;
    workerThreads.parentPort.postMessage({
      action: "EQDetectUpdate",
      data: {
        id: event.id,
        serial: event.serial,
        maxInt: event.maxInt,
        member: event.member,
        active_member: event.active_member,
        originTime: event.originTime,
        Lv: event.Lv,
        Prev_Lv: event.Prev_Lv,
      },
    });
  }

  //UnionをもとにEventを追加・更新
  for (const val of groups.values()) {
    var target_event;
    var event_count = val.events.length;
    if (event_count == 0) {

      var eid_str = `evt_${current_eventId}`;
      target_event = {
        id: eid_str,
        serial: 0,//送信と同時に++されるので0
        maxInt: null,//この後一括で設定する
        member: val.stations,
        originTime: Number(date),
        update: Number(date),
        decayTimer: 0,//この後一括で設定する
        isConfirmed: false,//条件満たし次第
        Lv: 0,//この後一括で設定する
        Prev_Lv: 0,//この後一括で設定する
      };
      events.set(eid_str, target_event);

      current_eventId++;
    } else {//複数のイベントがUnion内にある
      const minEID = val.events.reduce((a, b) => a.replace('evt_', '') - b.replace('evt_', '') < 0 ? a : b);
      target_event = events.get(minEID);//複数イベントのうち、残すイベント（最も若いID）

      val.stations.forEach(code => {//新規検知点の重複なし追加
        if (!target_event.member.includes(code)) {
          target_event.member.push(code)
          target_event.update = Number(date);
        }
      });

      val.events.forEach(codeA => {//既存イベント内点の重複なし追加
        if (codeA == minEID) return;
        var eventA = events.get(codeA);
        if (!eventA) return;
        eventA.member.forEach(codeB => {
          if (!target_event.member.includes(codeB)) {
            target_event.member.push(codeB)
            target_event.update = Number(date);
          }
        })
      });

      val.events.forEach(eidToDel => {
        if (minEID != eidToDel) {
          var event = events.get(eidToDel);
          if (event?.isConfirmed) {
            workerThreads.parentPort.postMessage({
              action: "EQDetectFinish",
              id: eidToDel,
            });
          }
          events.delete(eidToDel);
        }
      });
    }

    update_prams(target_event.id);
    if (target_event.isConfirmed) send_event(target_event);

  }
}

function cleanup_events(date) {
  for (const event of events.values()) {

    //event.active_memberは古いので再計算
    let active_member = event.member.filter((st) => {
      const state = stationStates.get(st);
      return state?.isTriggered
    });
    if (4 > active_member.length) event.decayTimer++;
    else event.decayTimer = 0;

    if (
      (10 <= event.decayTimer &&
        30000 <= date - event.update) ||
      300000 <= date - event.originTime
    ) {
      events.delete(event.id);
      if (event.isConfirmed) {
        workerThreads.parentPort.postMessage({
          action: "EQDetectFinish",
          id: event.id,
        });
      }
    }
  }
}

function clearAllEvents() {
  for (const event of events.values()) {
    events.delete(event.id);
    if (event.isConfirmed) {
      workerThreads.parentPort.postMessage({
        action: "EQDetectFinish",
        id: event.id,
      });
    }
  }
}