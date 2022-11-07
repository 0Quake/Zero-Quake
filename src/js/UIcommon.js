document.querySelectorAll(".tabmenu").forEach(function (elm) {
  elm.addEventListener("mousedown", function () {
    //var containsTmp = !elm.classList.contains("active_tabmenu");

    document.querySelectorAll(".active_tabmenu").forEach(function (elm2) {
      elm2.classList.remove("active_tabmenu");
    });
    document.querySelectorAll(".active_tabcontent").forEach(function (elm2) {
      elm2.classList.remove("active_tabcontent");
    });
    //if (containsTmp) {
    elm.classList.add("active_tabmenu");
    document.getElementById(elm.dataset.contentid).classList.add("active_tabcontent");
    //}
  });
});
