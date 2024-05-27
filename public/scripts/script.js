// Функция для закрытия модального окна
function exitModal() {
  if (document.querySelector(".reviewNode")) {
    document.querySelectorAll(".reviewNode").forEach((node) => {
      node.remove();
    });
  }
  if (document.querySelector("#secret"))
    document.querySelector("#secret").remove();
  if (document.getElementById("delCont"))
    document.getElementById("delCont").remove();
  document.getElementById("customModal").style.display = "none";
  document.getElementById("recomendat").style.display = "none";
}

// Закрываем модальное окно при клике вне его области
window.onclick = function (event) {
  if (event.target == document.getElementById("customModal")) {
    exitModal();
  } else if (event.target == document.getElementById("recomendat")) {
    exitModal();
  }
};

document.getElementById("all").addEventListener("click", () => {
  document.getElementById("selector").classList.remove("hidden");
  document.querySelector(".selectorFav").innerHTML = "";
  document.querySelector(".selectorFav").style.display = "none";
  document.getElementById("fav").disabled = false;
});

document.getElementById("fav").addEventListener("click", () => {
  document.getElementById("fav").disabled = true;
  document.getElementById("selector").classList.add("hidden");
  let cont = document.querySelector(".selectorFav");
  let places = document.querySelectorAll(".heart-checkbox");
  let newPlaces = [];
  places.forEach((place) => {
    plc = place.parentNode.cloneNode(true);
    newPlaces.push(plc);
  });
  newPlaces.forEach((place) => {
    if (place.querySelector(".heart-checkbox").checked) {
      cont.appendChild(place);
      place.querySelector(".heart-checkbox").disabled = true;
    }
  });
  cont.style.display = "block";
  let checks = cont.querySelectorAll(".clickable");
  checks.forEach((check) => {
    check.addEventListener("click", (e) => {
      if (e.target.tagName == "LABEL") {
        // ничего
      } else if (e.target.className == "heart-checkbox") {
      } else if (e.target.classList.contains("check")) {
        let selector = document.querySelector(".selectorFav");
        selector.dispatchEvent(new Event("change")); // Вызов события change
        e.target.parentNode.classList.toggle("selected");
      } else {
        let checkbox = e.target.querySelector("input[type=radio");
        checkbox.checked = !checkbox.checked;
        let selector = document.querySelector(".selectorFav");
        selector.dispatchEvent(new Event("change")); // Вызов события change
        e.target.classList.toggle("selected");
      }
    });
  });
});

document.querySelectorAll(".heart-checkbox").forEach((elem) => {
  elem.addEventListener("change", () => {
    let places = document.querySelectorAll(".heart-checkbox");
    let hearts = [];
    console.log(1);
    places.forEach((place) => {
      if (place.checked) {
        hearts.push(+place.value);
      }
    });
    fetch("/users", {
      method: "PUT", // Используем метод PUT для обновления данных
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hearts),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error:", error);
        // Обработайте ошибку
      });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/users")
    .then((res) => res.json())
    .then((response) => {
      var favourites = document.querySelectorAll(".heart-checkbox");
      if (response.fav) {
        favourites.forEach((favour) => {
          if (response.fav.includes(+favour.value)) {
            favour.checked = true;
          }
        });
      }
    });
});

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
    } else if (e.target.className == "heart-checkbox") {
    } else if (e.target.classList.contains("check")) {
      let selector = document.getElementById("selector");
      selector.dispatchEvent(new Event("change")); // Вызов события change
      e.target.parentNode.classList.toggle("selected");
    } else {
      let checkbox = e.target.querySelector("input[type=radio");
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
    navigator.geolocation.getCurrentPosition(function (position) {
      const userLatitude = position.coords.latitude;
      const userLongitude = position.coords.longitude;

      ymaps.ready(init);

      function init() {
        var myMap = new ymaps.Map("map", {
          center: [47.210179, 38.930721],
          zoom: 14,
          controls: ["zoomControl", "fullscreenControl", "rulerControl"],
        });
        document.getElementById("rec").addEventListener("click", async () => {
          fetch("/get_recom")
            .then((response) => response.json())
            .then((data) => {
              let radius = 1000;
              var filteredMarkers = data.filter((marker) => {
                var distance = ymaps.coordSystem.geo.getDistance(
                  [47.210179, 38.930721],
                  [marker.ltd, marker.lng]
                );
                return distance <= radius;
              });
              let mrks = [];
              for (let i = 0; i < 5; i++) {
                mrks.push(filteredMarkers[i]);
              }
              recs = new ymaps.GeoObjectCollection(
                {},
                {
                  preset: "islands#yellowDotIcon",
                  visible: true,
                }
              );
              mrks.forEach((marker) => {
                var placemark = new ymaps.Placemark([marker.ltd, marker.lng], {
                  hintContent: `"${marker.desc}"\n${marker.address}`,
                  id: marker.id,
                });
                recs.add(placemark);
              });
              myMap.geoObjects.add(recs);
            });
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
              let id = e.get("target").properties.get("id");
              // Открываем модальное окно с ID метки
              document.getElementById("customModal").style.display = "block";
              let place = document.querySelector(".custom-modal-content");
              let cls = document.getElementById("mdlClose");
              let cont = document.createElement("div");
              cont.id = "delCont";
              let secret = document.createElement("span");
              secret.style.opacity = "0";
              secret.textContent = id;
              secret.id = "secret";
              let site = document.createElement("p");
              site.textContent = `${coordinates[id].address}, "${coordinates[id].desc}"`;
              let desc = document.createElement("p");
              desc.innerHTML = coordinates[id].fullDesc;
              cont.appendChild(site);
              cont.appendChild(secret);
              cont.appendChild(desc);
              if (coordinates[id].schedule) {
                let schedule = document.createElement("p");
                schedule.innerHTML =
                  "Время работы: " + coordinates[id].schedule;
                cont.appendChild(schedule);
              }
              if (coordinates[id].review) {
                let mark = document.createElement("p");
                mark.textContent = `Рейтинг: ${coordinates[id].review.toFixed(
                  2
                )}`;
                cont.appendChild(mark);
              }
              place.insertBefore(cont, cls);
              fetch("/reviews")
                .then((response) => response.json())
                .then((res) => {
                  for (elem of res) {
                    if (elem.id === id) {
                      for (rev of elem.reviews) {
                        let container = document.createElement("div");
                        container.classList.add("reviewNode");
                        let site = document.createElement("p");
                        site.textContent = `${elem.address}, "${elem.desc}"`;
                        let mark = document.createElement("h2");
                        mark.textContent = `Оценка пользователя: ${rev.mark}`;
                        let text = document.createElement("p");
                        text.textContent = `Комментарий: ${rev.text}`;
                        let usr = document.createElement("h2");
                        usr.textContent = `${rev.user.username}: `;
                        container.appendChild(site);
                        container.appendChild(mark);
                        container.appendChild(usr);
                        container.appendChild(text);
                        document
                          .getElementById("revCont")
                          .appendChild(container);
                      }
                    }
                  }
                });
              var review_form = document.querySelector(".custom-modal-form");
              review_form.addEventListener("submit", async (e) => {
                e.preventDefault();
                await fetch("/users")
                  .then((response) => response.json())
                  .then((user) => {
                    if (document.getElementById("secret")) {
                      if (
                        user.id + 7 ===
                        coordinates[
                          +document.getElementById("secret").textContent
                        ].pathId
                      ) {
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
                        markerId:
                          +document.getElementById("secret").textContent,
                      };
                      xhr.send(JSON.stringify(dataToSend));
                    }
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
            if (key > 7) {
              collections[key].options.set("preset", "islands#blueDotIcon");
            }
            collections[key].add(placemark);
          }
          myMap.geoObjects.add(collections[key]);
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

        document
          .querySelector(".selectorFav")
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
                var radius = document.getElementById("recRadius").value;
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
                  var placemark = new ymaps.Placemark(
                    [marker.ltd, marker.lng],
                    {
                      hintContent: `"${marker.desc}"\n${marker.address}`,
                      id: marker.id,
                    }
                  );
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
          setTimeout(function () {
            window.location.reload();
          }, 700);
        });

        // document.getElementById("add_route").addEventListener("click", () => {
        //   if (!coords) {
        //     document.getElementById("warning").textContent =
        //       "Выберите точку на карте";
        //   } else {
        //     document.getElementById("warning").textContent = "";
        //     var modal = document.getElementById("modal");
        //     modal.style.display = "block";
        //   }
        // });
        document.getElementById("get_recs").addEventListener("click", () => {
          var modal = document.getElementById("recomendat");
          modal.style.display = "block";
        });
      }
    });
  })
  .catch((error) => console.error("Ошибка при получении координат:", error));
