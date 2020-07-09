"use strict";
// vars
const inputElem = document.querySelector(".js-input");
const searchButtonElem = document.querySelector(".js-search");
const listElem = document.createElement("ul");
const smallElem = document.querySelector(".js-small");
const mainElem = document.querySelector(".js-main");

function searchHandler(event) {
  event.preventDefault();
  if (!listElem.parentElement) mainElem.appendChild(listElem);
  listElem.innerHTML = "";
  smallElem.classList.add("hidden");
  fetch(`http://api.tvmaze.com/search/shows?q=${inputElem.value}`)
    .then((response) => response.json())
    .then((data) => paintSeries(data));
  return false;
}

function paintSeries(arr) {
  let elem;
  let serieNameElem;
  let serieImgElem;
  if (arr.length === 0) {
    smallElem.classList.toggle("hidden");
    smallElem.innerHTML = "There were no results for your search.";
    listElem.remove();
  }
  for (const serie of arr) {
    elem = document.createElement("li");
    elem.setAttribute("data-id", `${serie.show.id}`);
    serieNameElem = document.createElement("p");
    serieNameElem.appendChild(document.createTextNode(`${serie.show.name}`));
    serieImgElem = document.createElement("img");
    if (serie.show.image)
      serieImgElem.setAttribute("src", `${serie.show.image.medium}`);
    else
      serieImgElem.src = `https://via.placeholder.com/210x295/ffffff/666666/?text=TV`;
    elem.appendChild(serieNameElem);
    elem.appendChild(serieImgElem);
    listElem.appendChild(elem);
  }
}

//Event Listeners
searchButtonElem.addEventListener("click", searchHandler);
inputElem.addEventListener("submit", searchHandler);
