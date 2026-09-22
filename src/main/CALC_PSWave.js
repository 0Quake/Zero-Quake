import * as turf from "@turf/turf";

export function depthFilter(depth) {
  if (!isFinite(depth) || depth < 0) return 0;
  else if (depth > 700) return 700;
  else if (200 <= depth) return Math.floor(depth / 10) * 10;
  else if (50 <= depth) return Math.floor(depth / 5) * 5;
  else return Math.floor(depth / 2) * 2;
}

export function getClosestNum(needle, haystack) {
  return haystack.reduce((a, b) => {
    var aDiff = Math.abs(a - needle);
    var bDiff = Math.abs(b - needle);

    if (aDiff == bDiff) return a > b ? a : b;
    else return bDiff < aDiff ? b : a;

  });
}

export function calcInt(magJMA, depth, epiLat, epiLng, pointLat, pointLng, arv, max) {
  const magW = magJMA - 0.171;
  const long = 10 ** (0.5 * magW - 1.85) / 2;
  const epicenterDistance = turf.distance([epiLng, epiLat], [pointLng, pointLat])
  const hypocenterDistance = (depth ** 2 + epicenterDistance ** 2) ** 0.5 - (max ? 0 : long); //上限なら断層長を引かない
  const x = Math.max(hypocenterDistance, 3);
  const gpv600 = 10 ** (0.58 * magW + 0.0038 * depth - 1.29 - Math.log10(x + 0.0028 * 10 ** (0.5 * magW)) - 0.002 * x);

  // 最大速度を工学的基盤（Vs=600m/s）から工学的基盤（Vs=400m/s）へ変換を行う
  const pgv400 = gpv600 * 1.31;
  const pgv = pgv400 * arv;
  return 2.68 + 1.72 * Math.log10(pgv);
}

//EarlyEst地震情報マージ

export function calc_arTime(distance, TimeTable) {
  if (!TimeTable || !Array.isArray(TimeTable.s)) return null;
  var SSec = null;
  for (let index = 0; index < TimeTable.s.length; index++) {
    var elm = TimeTable.s[index];
    if (elm.r > distance) {
      if (index >= 1) {
        var elm2 = TimeTable.s[index - 1];
        SSec = elm.t + ((elm2.t - elm.t) * (distance - elm.r)) / (elm2.r - elm.r);
      } else {
        SSec = null;
      }
      break;
    }
  }
  return SSec || SSec === 0 ? SSec : null;
}
