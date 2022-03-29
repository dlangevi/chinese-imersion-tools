async function withLoader(fn) {
  showLoader();
  await fn();
  finishLoader();
}

function showLoader() {
  const loader = document.querySelector('#loader');
  loader.style.display = 'block';
}

function finishLoader() {
  const loader = document.querySelector('#loader');
  loader.style.display = 'none';
}
