function getCheckedValues() {
  var radios = document.getElementsByName("radio");
  var value;
  radios.forEach(function (radio) {
    if (radio.checked) {
      value = radio.value;
    }
  });
  return value;
}
// Функция для закрытия модального окна
function exitModal() {
  document.getElementById("customModal").style.display = "none";
  document.getElementById("delCont").remove();
}

// Закрываем модальное окно при клике вне его области
window.onclick = function (event) {
  if (event.target == document.getElementById("customModal")) {
    exitModal();
  }
};
var checks = document.querySelectorAll(".clickable");
checks.forEach((check) => {
  check.addEventListener("click", (e) => {
    if (e.target.tagName == "LABEL") {
      // ничего
    } else if (e.target.classList.contains("check")) {
      let selector = document.getElementById("selector");
      selector.dispatchEvent(new Event("change")); // Вызов события change
      e.target.parentNode.classList.toggle("selected");
    } else {
      let checkbox = e.target.querySelector("input");
      checkbox.checked = !checkbox.checked;
      let selector = document.getElementById("selector");
      selector.dispatchEvent(new Event("change")); // Вызов события change
      e.target.classList.toggle("selected");
    }
  });
});


fetch("/coordinates")
  .then((response) => response.json())
  .then((coordinates) => {
    ymaps.ready(init);

    function init() {
      var myMap = new ymaps.Map("map", {
        center: [47.210179, 38.930721],
        zoom: 14,
        controls: ["zoomControl", "fullscreenControl", "rulerControl"],
      });

      const dividedArray = coordinates.reduce((acc, obj) => {
        const key = obj["pathId"];
        (acc[key] = acc[key] || []).push(obj);
        return acc;
      }, {});
      var collections = {};
      for (key of Object.keys(dividedArray)) {
        collections[key] = new ymaps.GeoObjectCollection(
          {},
          {
            preset: "islands#redDotIcon",
            visible: false,
          }
        );
        for (elem of dividedArray[key]) {
          let placemark = new ymaps.Placemark([elem.ltd, elem.lng], {
            hintContent: `"${elem.desc}"\n${elem.address}`,
            id: elem.id,
          });
          placemark.events.add("click", function (e) {
            // Получаем ID метки
            var id = e.get("target").properties.get("id");
            // Открываем модальное окно с ID метки
            document.getElementById("customModal").style.display = "block";
            let place = document.querySelector(".custom-modal-content");
            let cls = document.getElementById("mdlClose");
            let cont = document.createElement("div");
            cont.id = "delCont";
            let site = document.createElement("p");
            site.textContent = `${coordinates[id].address}, "${coordinates[id].desc}"`;
            cont.appendChild(site);
            if (coordinates[id].review){ 
              let mark = document.createElement("p");
              mark.textContent = `Рейтинг: ${coordinates[id].review.toFixed(2)}`;
              cont.appendChild(mark);
              }
            place.insertBefore(cont, cls);
          });
          collections[key].add(placemark)
        }
        myMap.geoObjects.add(collections[key]);
      }
      document
        .getElementById("selector")
        .addEventListener("change", function () {
          var value = getCheckedValues();
          var checks = document.querySelectorAll(".clickable");
          checks.forEach((check) => {
            check.classList.remove('selected')
          })
          for (key of Object.keys(collections)) {
            collections[key].options.set("visible", false);
          }
          if (!value) return;
          collections[value].options.set("visible", true);
        });
    }
  })
  .catch((error) => console.error("Ошибка при получении координат:", error));
