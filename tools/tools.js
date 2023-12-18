//各観測点の周辺の観測点の数を求める
for (const elm of data) {
  if (elm.data) {
    data.arroundPoints = data.filter(function (elm3) {
      return elm3.data && geosailing(elm.Location.Latitude, elm.Location.Longitude, elm3.Location.Latitude, elm3.Location.Longitude) <= MargeRangeTmp;
    }).length;
  }
}

//画像上で重なっているであろう観測点の組を表示
var group = {};
a.forEach(function (elm) {
  b = a.filter(function (elm2) {
    return Math.abs(elm2.Point.X - elm.Point.X) <= 1 && Math.abs(elm2.Point.Y - elm.Point.Y) <= 1 && elm.Code !== elm2.Code && !elm.IsSuspended && !elm.IsSuspended;
  });
  b.forEach(function (elm2) {
    if (group[elm.Code]) {
      if (!group[elm.Code].includes(elm2.Code)) group[elm.Code].push(elm2.Code);
    } else if (group[elm2.Code]) {
      if (!group[elm2.Code].includes(elm.Code)) group[elm2.Code].push(elm.Code);
    } else group[elm.Code] = [elm2.Code];
  });
});
var c = "";
Object.keys(group).forEach(function (elm) {
  c += elm + "と" + group[elm].join(",") + "\n";
});
console.log(c);

//maplibreで上の項目の組を順に表示
a.replaceAll("と", ",").split("|");
var i = 0;
function aa() {
  document.querySelectorAll(".marker-circle").forEach(function (elm) {
    elm.style.border = "none";
  });
  var q = 0;
  b[Math.min(i, b.length)].split(",").forEach(function (elm2) {
    var pt = document.querySelector(".KmoniPoint_" + elm2);
    if (pt) {
      pt.style.border = "solid 10px #FFF";
      q++;
    }
  });
  console.log(i + "/" + b.length, q + "件");
}
document.onkeydown = function (e) {
  if (e.keyCode == 37) {
    i--;
  } else if (e.keyCode == 37) {
    i++;
  }
  aa();
};

function geosailing(latA, lngA, latB, lngB) {
  return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}
