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

var checks = document.querySelectorAll('.clickable')
checks.forEach(check => {
  check.addEventListener('click', (e) => {
    var checkbox = e.target.querySelector('input')
    checkbox.checked = !checkbox.checked;
    var radios = document.querySelectorAll("input[type=radio]");
    radios.forEach((radio) => {
      radio.dispatchEvent(new Event("change")); // Вызов события change
    });
    var selector = document.getElementById("selector");
    selector.dispatchEvent(new Event("change")); // Вызов события change
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
          collections[key].add(
            new ymaps.Placemark([elem.ltd, elem.lng], {
              hintContent: elem.desc,
              balloonContent: elem.address,
            })
          );
        }
        myMap.geoObjects.add(collections[key]);
      }
      document
        .getElementById("selector")
        .addEventListener("change", function () {
          var value = getCheckedValues();
          for (key of Object.keys(collections)) {
            collections[key].options.set("visible", false);
          }
          if (!value) return;
          collections[value].options.set("visible", true);
        });
    }
  })
  .catch((error) => console.error("Ошибка при получении координат:", error));
