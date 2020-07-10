"use strict";

// Query Selectors
const inputElem = document.querySelector(".js-input");
const searchButtonElem = document.querySelector(".js-search");
const smallElem = document.querySelector(".js-small");
const mainElem = document.querySelector(".js-main");
const favButton = document.querySelector(".js-favButton");
const favPanel = document.querySelector(".js-favPanel");
const favList = document.querySelector(".js-favList");
const clearAllButton = document.querySelector(".js-clearAll");

// vars
let favs = [];

//script scope created elements
const listSeriesElem = document.createElement("ul");
listSeriesElem.classList.add("js-listSeries");
//This function searches on the API whatever is in the input and calls paintSeries()
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
//This function accepts whether the search handler list or the fav list and handles the macro
//scope of the painting
function paintSeries(arr, isFavList) {
  if (!isFavList && arr.length === 0) {
    smallElem.classList.toggle("hidden");
    smallElem.innerHTML = "There were no results for your search.";
    listSeriesElem.remove();
  } else if (isFavList && arr.length === 0) {
    favList.innerHTML = `<p>You haven't faved any series.<br><br>Please search for some series in the search bar and click on it to fav it.</p>`;
    return;
  }
  if (isFavList) favList.innerHTML = "";
  for (const serie of arr) appendSerieToSerieList(serie, isFavList);
}
//This is the function that actually adds the serie element to the normal/fav list by constructing
// the element, adding its corresponding properties
function appendSerieToSerieList(serie, isFavList) {
  let elem;
  let serieNameElem;
  let serieImgElem;
  let id;
  let name;
  let img;
  elem = document.createElement("li");
  if (!isFavList) {
    id = serie.show.id;
    name = serie.show.name;
    img = serie.show.image;
  } else {
    id = serie.id;
    name = serie.name;
    img = serie.img;
    let favRemoveButton = document.createElement("button");
    favRemoveButton.classList.add("favRemove");
    favRemoveButton.innerHTML = "X";
    elem.appendChild(favRemoveButton);
    favRemoveButton.addEventListener("click", favRemoveHandler);
  }
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
//This function returns true if the serie is in the favs array, false otherwise
function isSerieFaved(serie, favArr) {
  for (const elem of favArr) if (elem.id === serie.dataset.id) return true;
  return false;
}
//This function handles the click on the serie element to add it to the favs,
//update the localStorage and paint the favs in its list
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
//This function returns the index of the serie in the favs array, -1 if serie not found
function indexOfSerieInFav(serie, favArr) {
  for (let i = 0; i < favArr.length; i++)
    if (favArr[i].id === serie.dataset.id) return i;
  return -1;
}
//This function toggles different classes corresponding the fav button interaction in the header
function favButtonHandler() {
  favButton.classList.toggle("rotFav");
  favPanel.classList.toggle("hidden");
}
//This function handles the event of clicking a remove button in the fav list to remove one serie
function favRemoveHandler(event) {
  let id = event.currentTarget.parentNode.dataset.id;
  for (let i = 0; i < favs.length; i++)
    if (favs[i].id === id) favs.splice(i, 1);
  localStorage.setItem("favIdArr", JSON.stringify(favs));
  paintSeries(favs, true);
  for (const liElem of Array.from(listSeriesElem.childNodes))
    if (liElem.dataset.id === id) liElem.classList.remove("fav");
}
//This function handles the event of clicking remove all button, which clears the fav list
function favRemoveAllHandler() {
  favs = [];
  localStorage.setItem("favIdArr", JSON.stringify(favs));
  paintSeries(favs, true);
  for (const liElem of Array.from(listSeriesElem.childNodes))
    liElem.classList.remove("fav");
}
//This function is onLoad event to <body>, it gets the localStorage favs arr and paints the favs
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
clearAllButton.addEventListener("click", favRemoveAllHandler);
