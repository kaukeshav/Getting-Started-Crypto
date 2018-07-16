var imagesToLoad = document.querySelectorAll('img[data-src]');
var loadImages = function(image) {
  image.setAttribute('src', image.getAttribute('data-src'));
  image.onload = function() {
    image.removeAttribute('data-src');
  };
};