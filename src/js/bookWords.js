import {
  observeTable,
  post,
} from './shared.js';
import Tables from './tableDefn.js';

async function main() {
  const dGridDiv = document.querySelector('#docWordGrid');
  new agGrid.Grid(dGridDiv, Tables.docWords);

  Tables.docWords.columnApi.sizeColumnsToFit(dGridDiv.offsetWidth - 40);
  observeTable('#docWordGrid', Tables.docWords);

  await loadFileList();
  await loadFile();

  document.querySelector('#jsonFiles').addEventListener('change',
      () => loadFile(false));
  document.querySelector('#showKnown').addEventListener('click',
      () => {
        const filter = Tables.docWords.api.getFilterInstance('isKnown');
        filter.setModel({
          state: 'known',
        });
      });
  document.querySelector('#showUnknown').addEventListener('click',
      () => {
        const filter = Tables.docWords.api.getFilterInstance('isKnown');
        filter.setModel({
          state: 'unknown',
        });
      },
  );
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

async function loadFile(wellKnown = false) {
  const fileSelector = document.querySelector('#jsonFiles');

  localStorage.setItem('ch|loadFile', fileSelector.value);
  const response = await post('/loadFileWords', {
    name: fileSelector.value,
  });

  const data = await response.json();

  const words = data;

  Tables.docWords.data = words;
  // Tables.docWords.stats = data.stats;
  Tables.docWords.api.setRowData(words);

  return;
}

main();
