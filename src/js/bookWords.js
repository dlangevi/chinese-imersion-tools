import {
  observeTable,
  post,
  migakuParse,
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
  onFilterChanged: (event) => {
    // todo, move this logic to all client side if possible
    reCalcWordStats(); 
    migakuParse();
  },
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
  const response = await post('/filelist');
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

  const words = data.words;

  DocumentWords.data = words;
  DocumentWords.stats = data.stats;
  DocumentWords.api.setRowData(words);
  reCalcWordStats();
  return;
}

function reCalcWordStats() {
  const stats = DocumentWords.stats;



  let currentKnown = 0;
  const currentWords = [];
  DocumentWords.api.forEachNode((rowNode, index) => {

    if (rowNode.data.isKnown == false) {
      currentWords.push(rowNode.data);
    } else {
      currentKnown += rowNode.data.occurances;
    }
  });
  currentKnown = currentKnown / stats.totalWords * 100;
  const target = determineTarget(currentKnown).toFixed(0);
  const gap = target - currentKnown;
  let neededOccurances = (gap/100) * stats.totalWords;
  let neededWords = 0;
  currentWords.sort((a, b) => b.occurances - a.occurances);
  currentWords.every((row) => {
    if (neededOccurances < 0) {
      return false;
    }
    neededWords += 1;
    neededOccurances -= row.occurances;
    return true;
  });

  document.querySelector('#known').innerHTML = currentKnown.toFixed(2);
  document.querySelector('#neededWords').innerHTML = neededWords;
  document.querySelector('#target').innerHTML = target;
}

function determineTarget(currentKnown) {
  if (currentKnown < 86) {
    return 86;
  } else if (currentKnown < 90) {
    return currentKnown;
  } else if (currentKnown < 95) {
    return currentKnown + 2;
  } else if (currentKnown < 99) {
    return currentKnown + 1;
  } else {
    return 100;
  }
}

main();
