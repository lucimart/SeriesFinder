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

//bonus clouds & stars & sky
const cloudsElem = document.querySelector(".js-clouds");
const starsElem = document.querySelector(".js-stars");
const skyElem = document.querySelector(".js-sky");
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
  serieImgElem.setAttribute("alt", `Poster of ${name}`);
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
  favButton.classList.toggle("defaultFavAnimation");
  favPanel.classList.toggle("favPanelTransition");
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
//BONUS CLOUD FUNCTIONS
//Utility function, generates a random floating number between start and end
function randomInRangeFloat(start, end) {
  return Math.random() * (end - start) + start;
}
//Utility function, generates a random integer number between start and end
function randomInRangeInt(start, end) {
  return Math.floor(Math.random() * (end - start + 1)) + start;
}
//Utility function, returns the pixel equivalent of the vw introduced
function vwToPx(vwVal) {
  return (vwVal * document.documentElement.clientWidth) / 100;
}
//Utility function, returns the vw equivalent of the pixel introduced
function pxToVw(pxVal) {
  return pxVal * (100 / document.documentElement.clientWidth);
}
//This function given below parameters, generates a random number of clouds
//between minClouds and maxClouds, of sized scaling from minCloudSize to
//maxCloudSize based on it's CSS width, then it randomly places it on the page
//and gives it a data-speed which is inversely proportional to its scale.
function cloudsIniPos(isGen) {
  const minClouds = 4;
  const maxClouds = 8;
  const minCloudSize = 0.2;
  const maxCloudSize = 2;
  for (
    let i = 0;
    i < (isGen ? 1 : randomInRangeInt(minClouds, maxClouds));
    i++
  ) {
    const cloudType = randomInRangeInt(1, 4);
    const cloudEl = document.createElement("img");
    cloudEl.setAttribute("src", `./assets/images/cloud${cloudType}.svg`);
    cloudEl.classList.add("js-cloud", "cloud");
    cloudsElem.appendChild(cloudEl);
    if (isGen) {
      const scaleVal = randomInRangeFloat(minCloudSize, maxCloudSize);
      cloudEl.style.top = `${randomInRangeInt(-5, 95)}vh`;
      cloudEl.style.left = `${-300 * scaleVal - 20}px`;
      cloudEl.style.transform = `scale(${scaleVal})`;
      cloudEl.dataset.speed = 1 + 1 / scaleVal;
      return;
    }
  }
  for (const cloud of cloudsElem.childNodes) {
    const scaleVal = randomInRangeFloat(minCloudSize, maxCloudSize);
    cloud.style.top = `${randomInRangeInt(-5, 105)}vh`;
    cloud.style.left = `${randomInRangeInt(-5, 105)}vw`;
    cloud.style.left = `${vwToPx(cloud.style.left.slice(0, -2))}px`;
    cloud.style.transform = `scale(${scaleVal})`;
    cloud.dataset.speed = 1 + 1 / scaleVal;
  }
}
//This function handles the movement of the cloud by altering its left style using the data-speed
function cloudMoveHandler() {
  const speedBase = 5;
  for (const cloud of cloudsElem.childNodes) {
    let xPos = parseInt(cloud.style.left.slice(0, -2));
    cloud.style.left = `${
      xPos + speedBase * parseFloat(cloud.dataset.speed)
    }px`;
    if (pxToVw(xPos) > 100) {
      cloud.remove();
      cloudsIniPos(true);
    }
  }
}
//Move the clouds every X ms
setInterval(cloudMoveHandler, 2000);
//END BONUS CLOUD
//BONUS STARS START
//generate between minStars and maxStars amount of stars, assign a type of .svg, a random
//opacity val between opacMin and opacMax and randomly place in on the page
function starsIniPos() {
  const minStars = 50;
  const maxStars = 80;
  const opacMin = 0.05;
  const opacMax = 0.35;
  for (let i = 0; i < randomInRangeInt(minStars, maxStars); i++) {
    const starType = randomInRangeInt(1, 4);
    const starEl = document.createElement("img");
    starEl.setAttribute("src", `./assets/images/star${starType}.svg`);
    starEl.classList.add("js-star", "star", `star${starType}`);
    starsElem.appendChild(starEl);
  }
  for (const star of starsElem.childNodes) {
    const opacityVal = randomInRangeFloat(opacMin, opacMax);
    star.style.top = `${randomInRangeInt(-5, 105)}vh`;
    star.style.left = `${randomInRangeInt(-5, 105)}vw`;
    star.style.opacity = `${opacityVal}`;
  }
}
//this function handles the animation of each star, giving it a chance
//of liting of chanceOfAnimating (ex: 0.1 = 10%) and proceeds to delete
//the animation once its over, so that it could be readded in the future
function starLitHandler() {
  const chanceOfAnimating = 0.1;
  for (const star of starsElem.childNodes) {
    if (randomInRangeFloat(0, 1) >= 1 - chanceOfAnimating) {
      star.classList.add("starAnimation");
      star.addEventListener("webkitAnimationEnd", (ev) =>
        ev.currentTarget.classList.remove("starAnimation")
      );
      star.addEventListener("animationend", (ev) =>
        ev.currentTarget.classList.remove("starAnimation")
      );
    }
  }
}
//Lit stars every x ms
setInterval(starLitHandler, 5000);
//Bonus STARS END
//BONUS Stepped background gradient START
function hex(c) {
  var s = "0123456789abcdef";
  var i = parseInt(c);
  if (i == 0 || isNaN(c)) return "00";
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
}
/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}
/* Remove '#' in color hex string */
function trim(s) {
  return s.charAt(0) == "#" ? s.substring(1, 7) : s;
}
/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
  var color = [];
  color[0] = parseInt(trim(hex).substring(0, 2), 16);
  color[1] = parseInt(trim(hex).substring(2, 4), 16);
  color[2] = parseInt(trim(hex).substring(4, 6), 16);
  return color;
}
function generateColor(colorStart, colorEnd, colorCount) {
  // The beginning of your gradient
  var start = convertToRGB(colorStart);

  // The end of your gradient
  var end = convertToRGB(colorEnd);

  // The number of colors to compute
  var len = colorCount;

  //Alpha blending amount
  var alpha = 0.0;

  var saida = [];
  saida.push(trim(colorEnd));
  for (let i = 0; i < len; i++) {
    var c = [];
    alpha += 1.0 / len;

    c[0] = start[0] * alpha + (1 - alpha) * end[0];
    c[1] = start[1] * alpha + (1 - alpha) * end[1];
    c[2] = start[2] * alpha + (1 - alpha) * end[2];

    saida.push(convertToHex(c));
  }

  return saida;
}
function genSky() {
  //Color Gradient generated by https://stackoverflow.com/a/32257791
  //Using generateColor("#4c566a", "#2e3440", 30)
  // $$color-polarNight-darkest to $color-polarNight-brightest
  const gradient = generateColor("#4c566a", "#2e3440", 25);
  for (let i = 0; i < gradient.length; i++) {
    const skyStripe = document.createElement("div");
    skyStripe.classList.add("stripe");
    skyStripe.style.backgroundColor = `#${gradient[i]}`;
    skyStripe.style.height = `${100 / gradient.length}vh`;
    skyElem.appendChild(skyStripe);
  }
}
//BONUS Stepped background gradient END
//This function is onLoad event to <body>, it gets the localStorage favs arr and paints the favs
function init() {
  if (localStorage.getItem("favIdArr"))
    favs = JSON.parse(localStorage.getItem("favIdArr"));
  if (favs) paintSeries(favs, true);
  genSky();
  cloudsIniPos(false);
  starsIniPos();
}
//This function generates clouds and animates them constantly through the site
//Event Listeners
searchButtonElem.addEventListener("click", searchHandler);
inputElem.addEventListener("submit", searchHandler);
inputElem.addEventListener("keyup", searchHandler);
listSeriesElem.addEventListener("click", favHandler);
favButton.addEventListener("click", favButtonHandler);
clearAllButton.addEventListener("click", favRemoveAllHandler);
