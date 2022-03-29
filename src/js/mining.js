async function main() {
  const eGridDiv = document.querySelector('#sentenceGrid');
  new agGrid.Grid(eGridDiv, Tables.sentences);

  Tables.sentences.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  observeTable('#sentenceGrid', Tables.sentences);

  await loadFileList();
  await loadFile();

  document.querySelector('#jsonFiles').addEventListener('change',
      () => loadFile(false));
  document.querySelector('#loadAll').addEventListener('click',
      () => loadFile(false));
  document.querySelector('#loadKnown').addEventListener('click',
      () => loadFile(true));
  document.querySelector('#showfavorite').addEventListener('click',
      loadFavorites);

  setTimeout(() => {
    migakuParse();
  },
  3000);
}

async function loadFileList() {
  const response = await fetch('/filelist');
  const data = await response.json();
  const fileSelector = document.querySelector('#jsonFiles');
  fileSelector.innerHTML = '';
  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    fileSelector.appendChild(opt);
  });

  const savedFile = localStorage.getItem('ch|loadFile');
  if (savedFile) {
    const fileSelector = document.querySelector('#jsonFiles');
    fileSelector.value = savedFile;
  }
  return;
}

async function loadFavorites() {
  const response = await fetch('/favfilelist');
  const data = await response.json();
  const fileSelector = document.querySelector('#jsonFiles');
  fileSelector.innerHTML = '';
  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    fileSelector.appendChild(opt);
  });
}


async function loadFile(wellKnown = false) {
  const fileSelector = document.querySelector('#jsonFiles');

  localStorage.setItem('ch|loadFile', fileSelector.value);
  const response = await fetch('/loadfile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      name: fileSelector.value,
      wellKnown: wellKnown,
    }),
  });

  const data = await response.json();

  const sentences = data.sentences;

  Tables.sentences.data = sentences;
  Tables.sentences.data.wellKnown = wellKnown;
  Tables.sentences.api.setRowData(sentences.rowData);

  reCalcSentenceStats();
  return;
}

function reCalcSentenceStats() {
  const data = Tables.sentences.data;
  if (data == undefined) {
    return;
  }
  const wellKnown = Tables.sentences.data.wellKnown;
  const currentWords = {};
  Tables.sentences.api.forEachNodeAfterFilter((rowNode, index) => {
    currentWords[rowNode.data.word] = rowNode.data.occurances;
  });
  let words = 0;
  let occurances = 0;

  Object.entries(currentWords).forEach(([word, val]) => {
    words += 1;
    occurances += val;
  });
  const percent = occurances / data.totalWords * 100;

  let currentKnown = data.currentKnown;
  if (wellKnown) {
    currentKnown = data.currentWellKnown;
  }
  document.querySelector('#oneTwords').innerHTML = words;
  document.querySelector('#occurances').innerHTML = occurances;
  document.querySelector('#percent').innerHTML = percent.toFixed(2);
  document.querySelector('#known').innerHTML = currentKnown.toFixed(2);
}

main();
