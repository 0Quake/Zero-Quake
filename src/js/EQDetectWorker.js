import workerThreads from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { distance } from "@turf/turf";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

workerThreads.parentPort.on("message", (message) => {
  switch (message.action) {
    case "EQDetect"://観測点ごとのデータを毎秒受信
      dataStream({
        data: message.data,
        date: Number(new Date(message.date)),
        enabled: message.enabled,
        EEW_Active: message.EEW_Active
      });
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
      neighborsA: new Map(),    //近傍点A:60km以内or近傍4点の観測点
      neighborsA_Pair: new Map(),    //近傍点Aペア:近傍点Aおよび自点が近傍点Aにあたる点
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
      if (dist <= 60) neighborsA_Tmp1.push({ st: b, dist: dist });
      if (dist <= 300) neighborsA_Tmp2.push({ st: b, dist: dist });
    }
    var neighborsA_array;
    if (4 <= neighborsA_Tmp1.length) {
      neighborsA_Tmp1.sort((x, y) => x.dist - y.dist)
      neighborsA_array = neighborsA_Tmp1;
    } else {
      neighborsA_Tmp2.sort((x, y) => x.dist - y.dist)
      neighborsA_array = neighborsA_Tmp2.slice(0, 4);
    }
    for (const { st, dist } of neighborsA_array) {
      a.neighborsA.set(st.code, { st: st, dist: dist });

      //双方向参照
      a.neighborsA_Pair.set(st.code, { st: st, dist: dist });
      st.neighborsA_Pair.set(a.code, { st: a, dist: dist });
    }
  }
}
init();

function dataStream(stream) {
  if (stream.enabled) {
    singlePointProcess(stream);
    if (stream.EEW_Active) {
      clearAllEvents();
    } else {
      const uf = make_union();
      const groups = groupUnion(uf);
      update_events(groups, stream.date);
    }
  }
  cleanup_events(stream.date);

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
      1.19 * state.noiseFloor + 1.0 <= st.shindo &&
      -1.5 <= st.shindo ||
      2.5 <= st.shindo;
    if (!state.isOnset && onsetTmp) {
      state.onsetTime = Number(stream.date);//単点検知開始時刻
    }
    state.isOnset = onsetTmp;
    st.isOnset = state.isOnset;
    state.shindo = st.shindo;

    //ノイズフロアの更新
    const a = state.isTriggered ? 0.005 : 0.1;//統合検知中はノイズフロアへの影響を小さくする
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
      state.neighborsA.values().forEach(b => {
        const stateb = stationStates.get(b.st.code);
        if (stateb?.isOnset) knn_onsetCount++;
      });
      //近傍点Aにおける単点検知中点の割合で判定
      isTriggered = knn_onsetCount / state.neighborsA.size >= 0.08;
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
  function check_travelTime(a, b, dist) {
    const dt = Math.abs(a.onsetTime - b.onsetTime) / 1000;
    //dist = dist ? dist : distance([a.lon, a.lat], [b.lon, b.lat]);//distが与えられない場合計算
    const vs_min = 0.5; //km/s
    return dt <= dist / vs_min + 5;//震央付近での1sサンプリング周期の影響大に対して5秒の余裕
  }

  var uf = createUnionFind();

  for (const st of stationStates.values()) {
    if (!st.isTriggered) continue;//統合検知中の点のみ処理

    //観測点-観測点結合
    st.neighborsA.values().forEach((neighbor) => {
      if (
        neighbor.st &&
        st.code != neighbor.st.code &&
        st.isTriggered && neighbor.st.isTriggered &&
        check_travelTime(st, neighbor.st, neighbor.dist)
      ) {
        uf.union(st.code, neighbor.st.code);
      }
    });

    //観測点-イベント結合
    for (const event of events.values()) {
      for (const memberCode of event.member) {
        const member = stationStates.get(memberCode);
        const Pair = member.neighborsA_Pair.get(st.code);//neighborsAは非対称な判定なので両方向で判断する。
        if (st.code != member.code &&
          st.isTriggered && member.isTriggered &&
          Pair &&
          check_travelTime(st, member, Pair.dist)
        ) {
          uf.union(st.code, event.id);
          break;
        }
      }
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
              const Pair = stA.neighborsA_Pair.get(stB.code);//neighborsAは非対称な判定なので両方向で判断する。

              if (
                stA != stB &&
                stA.isTriggered && stB.isTriggered &&
                Pair &&
                check_travelTime(stA, stB, Pair.dist)
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
    if (3 > active_member.length) event.decayTimer++;
    else event.decayTimer = 0;

    if (
      10 <= event.decayTimer ||
      //  30000 <= date - event.update) ||
      (active_member.length / event.member.length < 0.2 && active_member.length < 5) ||
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