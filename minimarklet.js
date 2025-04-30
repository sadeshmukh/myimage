// ==Bookmarklet==
// @name MyImage
// @author sadeshmukh
// @style https://static.sahil.ink/myimage/index.css
// ==/Bookmarklet==

var s = document.createElement("script");
s.src = "https://static.sahil.ink/myimage/bookmarklet.js";
s.onload = function () {
  console.log("Bookmarklet script loaded successfully");
};
s.onerror = function () {
  console.error("Failed to load bookmarklet script");
};
document.body.appendChild(s);
