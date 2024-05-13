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


closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
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
        controls: ["zoomControl", "fullscreenControl", "rulerControl"],
      });

      // Функция для разделения массива на подмассивы по значению атрибута
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
      collections[
        Object.keys(collections)[Object.keys(collections).length - 1]
      ].options.set("preset", "islands#blueDotIcon");

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

      var placemark;
      var coords;
      myMap.events.add("click", function (e) {
        coords = e.get("coords"); // Получаем координаты точки клика
        // ymaps.geocode(coords).then(function (res) {
        //   // Получаем первый результат геокодирования
        //   var firstGeoObject = res.geoObjects.get(0);

        //   // Получаем адрес места по координатам
        //   var address = firstGeoObject.getAddressLine();

        //   // Выводим адрес на консоль или в другое место на вашем веб-странице
        //   console.log("Адрес места:", address);
        // });
        if (placemark) {
          myMap.geoObjects.remove(placemark);
        }

        placemark = new ymaps.Placemark(
          coords,
          {},
          {
            preset: "islands#blueDotIcon", // Предустановленный стиль метки
            draggable: true, // Разрешаем перетаскивание метки
          }
        );

        // Добавляем метку на карту
        myMap.geoObjects.add(placemark);
      });
      var form = document.getElementById("new_mark");
      // Добавляем обработчик события submit для формы
      form.addEventListener("submit", function (event) {
        // Отменяем отправку формы по умолчанию
        event.preventDefault();
        // Отправляем данные с помощью AJAX запроса
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/create", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        var dataToSend = {
          isPrivate: document.getElementById("mySelect").value,
          addr: document.getElementById("addr").value,
          desc: document.getElementById("desc").value,
          ltd: coords[0],
          lng: coords[1],
        };
        xhr.send(JSON.stringify(dataToSend));
        var modal = document.getElementById("modal");
        modal.style.display = "none";
        document.getElementById("mySelect").value = "1";
        document.getElementById("addr").value = "";
        document.getElementById("desc").value = "";
        myMap.geoObjects.remove(placemark);
      });

      document.getElementById("add_route").addEventListener("click", () => {
        if (!coords) {
          // Создаем новый элемент
          var newElement = document.createElement("div");

          // Настраиваем его, например, добавляем текст
          newElement.textContent = "Выберите точку на карте";

          // Добавляем класс (если нужно)
          newElement.id = "warning";

          // Получаем родительский элемент, в который мы хотим добавить новый элемент
          var parentElement = document.getElementById("left_side");

          // Добавляем новый элемент в DOM
          parentElement.appendChild(newElement);
        } else {
          if (document.getElementById("warning"))
            document.getElementById("warning").remove();
          var modal = document.getElementById("modal");
          modal.style.display = "block";
        }
      });
    }
  })
  .catch((error) => console.error("Ошибка при получении координат:", error));
