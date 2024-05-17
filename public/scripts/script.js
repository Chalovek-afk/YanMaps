// Функция для закрытия модального окна
function exitModal() {
  document.getElementById("reviewModal").style.display = "none";
  document.getElementById("customModal").style.display = "none";
  document.getElementById("myReviewModal").style.display = "none";
  document.getElementById("recomendat").style.display = "none";
  if (document.getElementById("delCont"))
    document.getElementById("delCont").remove();
}

// Закрываем модальное окно при клике вне его области
window.onclick = function (event) {
  if (event.target == document.getElementById("customModal")) {
    exitModal();
  } else if (event.target == document.getElementById("reviewModal")) {
    exitModal();
  } else if (event.target == document.getElementById("myReviewModal")) {
    exitModal();
  } else if (event.target == document.getElementById("recomendat")) {
    exitModal();
  }
};

function openMyReview() {
  document.getElementById("myReviewModal").style.display = "block";
  fetch("/my_reviews")
    .then((response) => response.json())
    .then((res) => {
      for (rev of res) {
        let container = document.createElement("div");
        container.classList.add("reviewNode");
        let site = document.createElement("p");
        site.textContent = `${rev.marker.address}, "${rev.marker.desc}"`;
        let mark = document.createElement("h2");
        mark.textContent = `Моя оценка: ${rev.mark}`;
        let text = document.createElement("p");
        text.textContent = `Мой комментарий: ${rev.text}`;
        container.appendChild(site);
        container.appendChild(mark);
        container.appendChild(text);
        document.getElementById("myRevCont").appendChild(container);
      }
    });
}

function openReview() {
  document.getElementById("reviewModal").style.display = "block";
  fetch("/reviews")
    .then((response) => response.json())
    .then((res) => {
      for (elem of res) {
        for (rev of elem.reviews) {
          let container = document.createElement("div");
          container.classList.add("reviewNode");
          let site = document.createElement("p");
          site.textContent = `${elem.address}, "${elem.desc}"`;
          let mark = document.createElement("h2");
          mark.textContent = `Оценка пользователя: ${rev.mark}`;
          let markAvg = document.createElement("h2");
          markAvg.textContent = `Средняя оценка: ${elem.review.toFixed(2)}`;
          let text = document.createElement("p");
          text.textContent = `Комментарий: ${rev.text}`;
          let usr = document.createElement("h2");
          usr.textContent = `${rev.user.username}: `;
          container.appendChild(site);
          container.appendChild(mark);
          container.appendChild(markAvg);
          container.appendChild(usr);
          container.appendChild(text);
          document.getElementById("revCont").appendChild(container);
        }
      }
    });
}

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

var recs = document.querySelectorAll(".clickableRec");
recs.forEach((rec) => {
  rec.addEventListener("click", (e) => {
    if (e.target.tagName == "LABEL") {
      // ничего
    } else if (e.target.classList.contains("box")) {
      let selector = document.getElementById("recSel");
      selector.dispatchEvent(new Event("change")); // Вызов события change
      e.target.parentNode.classList.toggle("selected");
    } else {
      let checkbox = e.target.querySelector("input");
      checkbox.checked = !checkbox.checked;
      let selector = document.getElementById("recSel");
      selector.dispatchEvent(new Event("change")); // Вызов события change
      e.target.classList.toggle("selected");
    }
  });
});

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
            if (coordinates[id].review) {
              let mark = document.createElement("p");
              mark.textContent = `Рейтинг: ${coordinates[id].review.toFixed(
                2
              )}`;
              cont.appendChild(mark);
            }
            place.insertBefore(cont, cls);

            var review_form = document.querySelector(".custom-modal-form");
            review_form.addEventListener("submit", async (e) => {
              e.preventDefault();

              await fetch("/users")
                .then((response) => response.json())
                .then((user) => {
                  if (user.id + 4 === coordinates[id].pathId) {
                    document.getElementById("warning").textContent =
                      "Нельзя оставлять отзывы на свои метки";
                    return;
                  }
                  document.getElementById("warning").textContent = "";
                  var xhr = new XMLHttpRequest();
                  xhr.open("POST", "/review", true);
                  xhr.setRequestHeader("Content-Type", "application/json");
                  var dataToSend = {
                    mark: document.getElementById("rating").value,
                    text: document.getElementById("comment").value,
                    markerId: id,
                  };
                  xhr.send(JSON.stringify(dataToSend));
                });
              document.getElementById("rating").value = 1;
              document.getElementById("comment").value = "";
              if (document.getElementById("delCont"))
                document.getElementById("delCont").remove();
              var modal = document.getElementById("customModal");
              modal.style.display = "none";
              setTimeout(function () {
                window.location.reload();
              }, 700);
            });
          });
          collections[key].add(placemark);
        }
        myMap.geoObjects.add(collections[key]);
      }
      if (
        ![1, 2, 3, 4].includes(
          Object.keys(collections)[Object.keys(collections).length - 1]
        )
      ) {
        collections[
          Object.keys(collections)[Object.keys(collections).length - 1]
        ].options.set("preset", "islands#blueDotIcon");
      }

      document
        .getElementById("selector")
        .addEventListener("change", function () {
          var value = getCheckedValues();
          var checks = document.querySelectorAll(".clickable");
          checks.forEach((check) => {
            check.classList.remove("selected");
          });
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
      var flag = false;
      var sp = document.createElement("span");
      document.getElementById("getRad").addEventListener("click", () => {
        flag = Boolean(coords);
        if (!flag) {
          if (sp.textContent === "") {
            sp.textContent = "Для начала выберите точку на карте";
            let parent = document.getElementById("RAD");
            let bef = parent.querySelector("input");
            parent.insertBefore(sp, bef);
          }
        } else {
          sp.textContent = "";
          document.getElementById("recRadius").removeAttribute("disabled");
        }
      });
      var recs;
      var rec_form = document.getElementById("get_rec");
      rec_form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (recs) recs.options.set("visible", false);
        let boxes = document.querySelectorAll(".box");
        let arr = [];
        let dataToSend = {};
        boxes.forEach((box) => {
          if (box.checked) arr.push(box.value);
        });
        if (arr.length > 0) {
          dataToSend["paths"] = arr;
        }
        dataToSend["rates"] = document.getElementById("getRating").value;
        let requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend), // Преобразуем данные в формат JSON
        };

        fetch("/get_rec", requestOptions)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json(); // Преобразуем ответ в формат JSON
          })
          .then((data) => {
            if (document.getElementById("recRadius").value !== "") {
              var radius = document.getElementById("recRadius").value * 1000;
              var center = coords;
              var filteredMarkers = data.filter((marker) => {
                var distance = ymaps.coordSystem.geo.getDistance(center, [
                  marker.ltd,
                  marker.lng,
                ]);
                return distance <= radius;
              });

              recs = new ymaps.GeoObjectCollection(
                {},
                {
                  preset: "islands#greenDotIcon",
                  visible: true,
                }
              );
              filteredMarkers.forEach((marker) => {
                var placemark = new ymaps.Placemark([marker.ltd, marker.lng], {
                  hintContent: `"${marker.desc}"\n${marker.address}`,
                  id: marker.id,
                });
                recs.add(placemark);
              });
            } else {
              recs = new ymaps.GeoObjectCollection(
                {},
                {
                  preset: "islands#greenDotIcon",
                  visible: true,
                }
              );
              for (elem of data) {
                let placemark = new ymaps.Placemark([elem.ltd, elem.lng], {
                  hintContent: `"${elem.desc}"\n${elem.address}`,
                  id: elem.id,
                });
                recs.add(placemark);
              }
            }

            myMap.geoObjects.add(recs);

            document.getElementById("getRating").value = "1";
            document.getElementById("recRadius").value = "";
            boxes.forEach((box) => {
              box.checked = false;
            });
            let conts = document.querySelectorAll(".clickableRec");
            conts.forEach((cont) => {
              cont.classList.remove("selected");

              document.getElementById("recomendat").style.display = "none";
            });
          })
          .catch((error) => {
            console.error(
              "There was a problem with your fetch operation:",
              error
            );
          });
      });

      var form = document.getElementById("new_mark");
      // Добавляем обработчик события submit для формы
      form.addEventListener("submit", function (event) {
        // Отменяем отправку формы по умолчанию
        event.preventDefault();
        // Отправляем данные с помощью AJAX запроса
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/markers", true);
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
        window.location.reload();
      });

      document.getElementById("add_route").addEventListener("click", () => {
        if (!coords) {
          document.getElementById("warning").textContent =
            "Выберите точку на карте";
        } else {
          document.getElementById("warning").textContent = "";
          var modal = document.getElementById("modal");
          modal.style.display = "block";
        }
      });
      document.getElementById("get_recs").addEventListener("click", () => {
        var modal = document.getElementById("recomendat");
        modal.style.display = "block";
      });
    }
  })
  .catch((error) => console.error("Ошибка при получении координат:", error));
