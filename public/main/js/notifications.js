let userLogin = document
  .getElementById("navbarDropdown")
  .innerHTML.split("\n")
  .join("")
  .split(" ")
  .join("");

let searchString = document.getElementById("searchString");
let searchButton = document.getElementById("searchButton");
searchString.addEventListener("input", () => {
  let realValue = searchString.value
    .split("\n")
    .join("")
    .split(" ")
    .join("");
  if (realValue) searchButton.style.display = "block";
  else searchButton.style.display = "none";
});

searchButton.addEventListener("click", () => {
  searchLocation(searchString.value);
});

searchString.addEventListener("keydown", button => {
  if (button.keyCode === 13) searchLocation(searchString.value);
});

function searchLocation(value) {
  let realValue = value
    .split("\n")
    .join("")
    .split(" ")
    .join("");

  if (realValue) {
    window.location.href = `/search/${searchString.value.split("#").join("")}`;
  }
}

let showNotifsBtn = document.getElementById("notifDropdown");
let showToggler = false;
if (showNotifsBtn) {
  showNotifsBtn.addEventListener("click", () => {
    showToggler = !showToggler;
    if (showToggler) showNotifs();
  });
}
if (userLogin) {
  fetch(`/getNotifications/${userLogin}`)
    .then(response => {
      return response.json();
    })
    .then(notifs => {
      let length = 0;
      notifs.forEach(notif => {
        if (notif.newNotif) length++;
      });
      if (length)
        document.getElementById("notifsCount").innerHTML = `+${length}`;
      else document.getElementById("notifsCount").innerHTML = "";
    });
}

function showNotifs() {
  fetch(`/getNotifications/${userLogin}`, {
    method: "GET"
  })
    .then(response => {
      return response.json();
    })
    .then(notifs => {
      let notifsContainer = document.getElementById("notifList");
      notifsContainer.innerHTML = "";
      if (notifs.length) {
        for (let i = notifs.length - 1; i >= 0; i--) {
          let notif = notifs[i];
          let postId = parseInt(notif.text.split("№")[1]);
          let notifCont = document.createElement("div");
          if (notif.newNotif) {
            notifCont.setAttribute("class", "notif newNotif");
          } else {
            notifCont.setAttribute("class", "notif");
          }
          notifCont.setAttribute("id", `notif_${i}`);
          let notifInfo = document.createElement("div");
          notifInfo.setAttribute("class", "notifInfo");
          let notifDate = document.createElement("div");
          notifDate.setAttribute("class", "notifDate");
          notifDate.innerHTML = notif.date;
          let notifUserLink = document.createElement("a");
          notifUserLink.setAttribute("class", "nav-link notifLink");
          notifUserLink.setAttribute("href", `/user/${notif.user}`);
          notifUserLink.innerHTML = notif.user;
          let notifText = document.createElement("span");
          notifText.setAttribute("class", "notifText");
          notifText.innerHTML = notif.text.split("№")[0];

          notifInfo.appendChild(notifUserLink);
          notifInfo.appendChild(notifText);
          notifInfo.appendChild(notifDate);
          notifCont.appendChild(notifInfo);

          notifsContainer.appendChild(notifCont);
          let divider = document.createElement("div");
          divider.setAttribute("class", "blueDivider");
          notifsContainer.appendChild(divider);
          if (notif.type == "like" || notif.type == "comment") {
            getMinPostImage(userLogin, postId, notifCont, i);
          }
        }
        fetch(`/userLooked/${userLogin}/${notifs.length}`, {
          method: "GET"
        })
          .then(res => res.text())
          .then(message => {
            console.log(message);
          });
      } else {
        let noNotifs = document.createElement("span");
        noNotifs.setAttribute("id", "noNotif");
        noNotifs.innerHTML = "Нет новых уведомлений";
        notifsContainer.appendChild(noNotifs);
      }
    });
}

function getMinPostImage(login, i, postsContainer, notifId) {
  fetch(`/getPost/${login}/${i}-${login}`, {
    method: "GET"
  })
    .then(res => {
      return res.blob();
    })
    .then(postImg => {
      let image = URL.createObjectURL(postImg);
      let postElem = document.createElement("div");
      postElem.setAttribute("class", "postBlock animation");
      postElem.setAttribute("id", i);
      postElem.style.background = `url(${image}) center no-repeat`;
      postElem.style.backgroundSize = "cover";
      postsContainer.appendChild(postElem);
    });
}

function getTextWithTags(text) {
  text = text.replace(
    /#[A-Za-zА-Яа-яЁё0-9\_]+/gi,
    '<a class="tags" href="/search/$&">$&</a>'
  );
  return text.replace("#", "");
}

function getTextWithUsers(text) {
  text = text.replace(
    /@[A-Za-zА-Яа-яЁё0-9\_\.\-]+/gi,
    '<a class="textUserLink" href="/user/$&">$&</a>'
  );
  text = text.split("@").join("");
  return text.split("$at").join("@");
}

function isVisible(elem) {
  if (elem) {
    var coords = elem.getBoundingClientRect();

    var windowHeight = document.documentElement.clientHeight;
    var topVisible = coords.top > 0 && coords.top < windowHeight;
    var bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

    return topVisible || bottomVisible;
  } else return false;
}
