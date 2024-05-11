const colors = [
  "islands#redDotIcon",
  "islands#blueDotIcon",
  "islands#darkGreenDotIcon",
  "islands#yellowDotIcon",
];

function getCheckedValues() {
  var checkboxes = document.getElementsByName("checkbox");
  var checkedValues = [];
  checkboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      checkedValues.push(checkbox.value);
    }
  });
  return checkedValues;
}

document.getElementById("first").addEventListener("click", function (event) {
  if (event.target.id === "first") {
    var checkbox = document.getElementById("checkbox1");
    checkbox.checked = !checkbox.checked;
    var selector = document.getElementById("selector");
    selector.dispatchEvent(new Event("change")); // Вызов события change
  }
});

document.getElementById("second").addEventListener("click", function (event) {
  if (event.target.id === "second") {
    var checkbox = document.getElementById("checkbox2");
    checkbox.checked = !checkbox.checked;
    var selector = document.getElementById("selector");
    selector.dispatchEvent(new Event("change")); // Вызов события change
  }
});

document.getElementById("third").addEventListener("click", function (event) {
  if (event.target.id === "third") {
    var checkbox = document.getElementById("checkbox3");
    checkbox.checked = !checkbox.checked;
    var selector = document.getElementById("selector");
    selector.dispatchEvent(new Event("change")); // Вызов события change
  }
});

document.getElementById("fourth").addEventListener("click", function (event) {
  if (event.target.id === "fourth") {
    var checkbox = document.getElementById("checkbox4");
    checkbox.checked = !checkbox.checked;
    var selector = document.getElementById("selector");
    selector.dispatchEvent(new Event("change")); // Вызов события change
  }
});

fetch("/coordinates")
  .then((response) => response.json())
  .then((coordinates) => {
    ymaps.ready(init);

    function init() {
      var myMap = new ymaps.Map("map", {
        center: [47.210179, 38.930721],
        zoom: 14,
      });
      var collections = [];
      for (var i = 0; i < coordinates.length; i++) {
        if (collections[coordinates[i].pathId - 1]) {
          collections[coordinates[i].pathId - 1].add(
            new ymaps.Placemark([coordinates[i].ltd, coordinates[i].lng], {
              hintContent: coordinates[i].desc,
              balloonContent: coordinates[i].address,
            })
          );
        } else {
          var myCollection = new ymaps.GeoObjectCollection(
            {},
            {
              visible: false,
            }
          );
          myCollection.add(
            new ymaps.Placemark([coordinates[i].ltd, coordinates[i].lng], {
              hintContent: coordinates[i].desc,
            })
          );

          collections.push(myCollection);
        }
      }
      for (let i = 0; i < collections.length; i++) {
        collections[i].options.set("preset", colors[i]);
        myMap.geoObjects.add(collections[i]);
      }

      document
        .getElementById("selector")
        .addEventListener("change", function () {
          var values = getCheckedValues();
          for (var i = 0; i < collections.length; i++) {
            collections[i].options.set("visible", false);
          }
          for (index of values) {
            collections[+index].options.set("visible", true);
          }
        });

      var placemark;
      myMap.events.add("click", function (e) {
        var coords = e.get("coords"); // Получаем координаты точки клика

        ymaps.geocode(coords).then(function (res) {
          // Получаем первый результат геокодирования
          var firstGeoObject = res.geoObjects.get(0);

          // Получаем адрес места по координатам
          var address = firstGeoObject.getAddressLine();

          // Выводим адрес на консоль или в другое место на вашем веб-странице
          console.log("Адрес места:", address);
        });

        if (placemark) {
          myMap.geoObjects.remove(placemark);
        }

        placemark = new ymaps.Placemark(
          coords,
          {},
          {
            preset: "islands#yellowDotIcon", // Предустановленный стиль метки
            draggable: true, // Разрешаем перетаскивание метки
          }
        );

        // Добавляем метку на карту
        myMap.geoObjects.add(placemark);
      });
    }
  })
  .catch((error) => console.error("Ошибка при получении координат:", error));
