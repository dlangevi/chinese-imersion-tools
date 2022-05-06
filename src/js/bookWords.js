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
import {
  CenteredRenderer,
} from './agRenderers.js';
import {topNavLoaded} from './topnav.js';

const DocumentWords = {
  columnDefs: [
    {
      headerName: 'Row',
      valueGetter: 'node.rowIndex + 1',
      width: 10,
      cellRenderer: CenteredRenderer,
    },
    markLearnedColumn(),
    wordColumn({
    }),
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
  await topNavLoaded();
  const dGridDiv = document.querySelector('#docWordGrid');
  new agGrid.Grid(dGridDiv, DocumentWords);

  DocumentWords.columnApi.sizeColumnsToFit(dGridDiv.offsetWidth - 40);
  observeTable('#docWordGrid', DocumentWords);
  const filter = DocumentWords.api.getFilterInstance('isKnown');
  filter.setModel({
    state: 'unknown',
  });

  const customList = localStorage.getItem('listSelect');
  if (customList) {
    await loadFileList(customList);
  } else {
    await loadFileList('all');
  }
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
  document.querySelector('#toSentences').addEventListener('click',
      () => {
        const query = window.location.search;

        window.location = '/mining.html' + query;
      });

  document.querySelector('#listSelect').addEventListener('change',
      async () => {
        const selector = document.querySelector('#listSelect');
        const currentList = selector.value;
        await loadFileList(currentList);
        await loadFile();
      });
}

async function loadFileList(list) {
  const response = await post('/filelist', {
    list: list,
  });
  const data = await response.json();
  const fileSelector = document.querySelector('#jsonFiles');
  fileSelector.innerHTML = '';

  const savedFile = localStorage.getItem('ch|loadFile');

  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    fileSelector.appendChild(opt);
    if (title == savedFile) {
      fileSelector.value = savedFile;
    }
  });

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
  if (!stats) return;
  let currentKnown = 0;
  const currentWords = [];
  DocumentWords.api.forEachNode((rowNode) => {
    if (rowNode.data.isKnown == true) {
      currentKnown += rowNode.data.occurances;
    }
  });
  DocumentWords.api.forEachNodeAfterFilter((rowNode) => {
    if (rowNode.data.isKnown == false) {
      currentWords.push(rowNode.data);
    }
  });
  currentKnown = currentKnown / stats.totalWords * 100;
  const targets = determineTargets(currentKnown);
  const needed = targets.map((target)=> countWords(currentKnown, target,
      stats.totalWords, currentWords));

  document.querySelector('#known').innerHTML = currentKnown.toFixed(2);
  document.querySelector('#neededWords').innerHTML = needed.join(',');
  document.querySelector('#target').innerHTML = targets.join(',');
}

function countWords(currentKnown, target, totalWords, currentWords) {
  const gap = target - currentKnown;
  let neededOccurances = (gap/100) * totalWords;
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
  // const willKnow = target;
  console.log(neededOccurances);
  // console.log(stats.totalWords);
  // if (neededOccurances > 0) {
  // willKnow = target - (neededOccurances / stats.totalWords * 100);
  // willKnow = willKnow.toFixed(2);
  // }
  return neededWords;
}

function determineTargets(currentKnown) {
  if (currentKnown < 86) {
    return [86, 90, 91];
  } else if (currentKnown < 90) {
    return [90, 91, 92];
  } else if (currentKnown < 95) {
    const a = Math.floor(currentKnown);
    return [a + 1, a+ 2, a+3];
  } else if (currentKnown < 99) {
    return [Math.floor(currentKnown + 1)];
  } else {
    return [100];
  }
}

main();
