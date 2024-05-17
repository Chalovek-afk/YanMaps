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

function exitModal() {
  document.getElementById("myReviewModal").style.display = "none";
}

// Закрываем модальное окно при клике вне его области
window.onclick = function (event) {
  if (event.target == document.getElementById("myReviewModal")) {
    exitModal();
  }
};
