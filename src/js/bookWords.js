import {
  observeTable,
  post,
} from './shared.js';
import {
   markLearnedColumn,
   wordColumn,
   starsColumn,
   occuranceColumn,
   isKnownColumn,
} from './tableDefn.js';

const DocumentWords = {
  columnDefs: [
   markLearnedColumn(),
   wordColumn(),
   starsColumn(),
   occuranceColumn({
     width: 80,
   }),
   isKnownColumn(),
 ],
  rowData: [],
  rowHeight: 60,
  rowBuffer: 20,
  enableCellTextSelection: true,
  suppressRowClickSelection: true,
};

async function main() {
  const dGridDiv = document.querySelector('#docWordGrid');
  new agGrid.Grid(dGridDiv, DocumentWords);

  DocumentWords.columnApi.sizeColumnsToFit(dGridDiv.offsetWidth - 40);
  observeTable('#docWordGrid', DocumentWords);

  await loadFileList();
  await loadFile();

  document.querySelector('#jsonFiles').addEventListener('change',
      () => loadFile(false));
  document.querySelector('#showKnown').addEventListener('click',
      () => {
        const filter = DocumentWords.api.getFilterInstance('isKnown');
        filter.setModel({
          state: 'known',
        });
      });
  document.querySelector('#showUnknown').addEventListener('click',
      () => {
        const filter = DocumentWords.api.getFilterInstance('isKnown');
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

  DocumentWords.data = words;
  // DocumentWords.stats = data.stats;
  DocumentWords.api.setRowData(words);

  return;
}

main();
