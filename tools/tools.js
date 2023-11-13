//各観測点の周辺の観測点の数を求める
for (const elm of data) {
  if (elm.data) {
    data.arroundPoints = data.filter(function (elm3) {
      return elm3.data && geosailing(elm.Location.Latitude, elm.Location.Longitude, elm3.Location.Latitude, elm3.Location.Longitude) <= MargeRangeTmp;
    }).length;
  }
}

function geosailing(latA, lngA, latB, lngB) {
    return Math.acos(Math.sin(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.sin(Math.atan(Math.tan(latB * (Math.PI / 180)))) + Math.cos(Math.atan(Math.tan(latA * (Math.PI / 180)))) * Math.cos(Math.atan(Math.tan(latB * (Math.PI / 180)))) * Math.cos(lngA * (Math.PI / 180) - lngB * (Math.PI / 180))) * 6371.008;
}