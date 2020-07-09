"use strict";

// vars
const inputElem = document.querySelector(".js-input");
const searchButtonElem = document.querySelector(".js-search");
const listSeriesElem = document.createElement("ul");
listSeriesElem.classList.add("js-listSeries");
const smallElem = document.querySelector(".js-small");
const mainElem = document.querySelector(".js-main");
const favButton = document.querySelector(".js-favButton");
const favPanel = document.querySelector(".js-favPanel");
// const transparentPanel = document.querySelector(".js-transparentPanel");
const favList = document.querySelector(".js-favList");

let favs = [];

function searchHandler(event) {
  if (localStorage.getItem("favIdArr"))
    favs = JSON.parse(localStorage.getItem("favIdArr"));
  event.preventDefault();
  if (!listSeriesElem.parentElement) mainElem.appendChild(listSeriesElem);
  listSeriesElem.innerHTML = "";
  smallElem.classList.add("hidden");
  fetch(`http://api.tvmaze.com/search/shows?q=${inputElem.value}`)
    .then((response) => response.json())
    .then((data) => paintSeries(data, false));
  return false;
}

function paintSeries(arr, isFavList) {
  if (!isFavList && arr.length === 0) {
    smallElem.classList.toggle("hidden");
    smallElem.innerHTML = "There were no results for your search.";
    listSeriesElem.remove();
  }
  if (isFavList) favList.innerHTML = "";
  for (const serie of arr) appendSerieToSerieList(serie, isFavList);
}

function appendSerieToSerieList(serie, isFavList) {
  let elem;
  let serieNameElem;
  let serieImgElem;
  let id;
  let name;
  let img;
  if (!isFavList) {
    id = serie.show.id;
    name = serie.show.name;
    img = serie.show.image;
  } else {
    id = serie.id;
    name = serie.name;
    img = serie.img;
  }
  elem = document.createElement("li");
  elem.setAttribute("data-id", `${id}`);
  serieNameElem = document.createElement("p");
  serieNameElem.appendChild(document.createTextNode(`${name}`));
  serieImgElem = document.createElement("img");
  if (img) serieImgElem.setAttribute("src", `${isFavList ? img : img.medium}`);
  else
    serieImgElem.src = `https://via.placeholder.com/210x295/ffffff/666666/?text=TV`;
  elem.appendChild(serieNameElem);
  elem.appendChild(serieImgElem);
  if (!isFavList && isSerieFaved(elem, favs)) elem.classList.add("fav");
  else if (isFavList) elem.classList.add("fav", "scaleFaved");
  if (!isFavList) listSeriesElem.appendChild(elem);
  else favList.appendChild(elem);
}

function favHandler(event) {
  let serie;
  if (event.target.nodeName === "LI") serie = event.target;
  else if (event.target.nodeName === "UL") return;
  else serie = event.target.parentElement;
  if (isSerieFaved(serie, favs)) {
    favs.splice(indexOfSerieInFav(serie, favs), 1);
    serie.classList.remove("fav");
  } else {
    favs.push({
      id: serie.dataset.id,
      name: serie.childNodes[0].innerHTML,
      img: serie.childNodes[1].src,
    });
    serie.classList.add("fav");
  }
  favs.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
  localStorage.setItem("favIdArr", JSON.stringify(favs));
  paintSeries(favs, true);
}
function isSerieFaved(serie, favArr) {
  for (const elem of favArr) if (elem.id === serie.dataset.id) return true;
  return false;
}
function indexOfSerieInFav(serie, favArr) {
  for (const index in favArr)
    if (favArr[index] && favArr[index].id === serie.dataset.id) return index;
  return -1;
}

function favButtonHandler() {
  favButton.classList.toggle("rotFav");
  favPanel.classList.toggle("hidden");
  //   transparentPanel.classList.toggle("hidden");
}

function init() {
  if (localStorage.getItem("favIdArr"))
    favs = JSON.parse(localStorage.getItem("favIdArr"));
  if (favs) paintSeries(favs, true);
}

//Event Listeners
searchButtonElem.addEventListener("click", searchHandler);
inputElem.addEventListener("submit", searchHandler);
listSeriesElem.addEventListener("click", favHandler);
favButton.addEventListener("click", favButtonHandler);
// transparentPanel.addEventListener("click", () => favButton.click());
