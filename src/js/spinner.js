async function withLoader(fn) {
  showLoader();
  await fn();
  finishLoader();
}

function showLoader() {
  var loader = document.querySelector('#loader');
  loader.style.display = "block"
}

function finishLoader() {
  var loader = document.querySelector('#loader');
  loader.style.display = "none"
}
