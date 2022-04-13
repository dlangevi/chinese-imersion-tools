import {
  observeTable,
  post,
  migakuParse,
} from './shared.js';
import {
  markLearnedColumn,
  wordColumn,
  occuranceColumn,
  starsColumn,
} from './tableDefn.js';
import {
  CenteredRenderer,
} from './agRenderers.js';
import {topNavLoaded} from './topnav.js';

const sentenceCols = [
  markLearnedColumn({
    suppressSizeToFit: true,
  }),
  wordColumn({
    suppressSizeToFit: true,
  }),
  occuranceColumn({
    suppressSizeToFit: true,
  }),
  starsColumn({
    width: 160,
    suppressSizeToFit: true,
  }),
  {
    headerName: 'Pos',
    field: 'position',
    width: 100,
    filter: true,
    cellRenderer: CenteredRenderer,
    suppressSizeToFit: true,
  },
  {
    headerName: 'Sentence',
    field: 'sentence',
    resizable: true,
    cellRenderer: CenteredRenderer,
    wrapText: true,
  },
];

const Sentences = {
  columnDefs: sentenceCols,
  rowData: [],
  // todo, predict height based on number of characters in sentence
  rowHeight: 30,
  getRowHeight: (params) => {
    const sentenceLength = params.data.sentence.length;
    if (sentenceLength > 150) {
      return 250;
    } else if (sentenceLength > 100) {
      return 150;
    } else {
      return 100;
    }
  },
  rowBuffer: 100,
  enableCellTextSelection: true,
  suppressRowClickSelection: true,
  // If these can be ratelimited then reenable
  // onBodyScrollEnd: (event) => migakuParse(),
  onSortChanged: (event) => migakuParse(),
  onFilterChanged: (event) => {
    reCalcSentenceStats();
    migakuParse();
  },
};

async function main() {
	await topNavLoaded();
  const eGridDiv = document.querySelector('#sentenceGrid');
  new agGrid.Grid(eGridDiv, Sentences);

  Sentences.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  observeTable('#sentenceGrid', Sentences);

  const customList = localStorage.getItem('listSelect');
  if (customList) {
    await loadFileList(customList);
  } else {
    await loadFileList('all');
  }
  await loadFile();

  document.querySelector('#jsonFiles').addEventListener('change',
      () => loadFile(false));
  document.querySelector('#loadAll').addEventListener('click',
      () => loadFile(false));
  document.querySelector('#loadKnown').addEventListener('click',
      () => loadFile(true));
  document.querySelector('#toWords').addEventListener('click',
      () => {
        const query = window.location.search;
        window.location = '/bookwords.html' + query;
      });

  document.querySelector('#listSelect').addEventListener('change',
      async () => {
        const selector = document.querySelector('#listSelect');
        const currentList = selector.value;
        await loadFileList(currentList);
        await loadFile();
      });

  setTimeout(() => {
    migakuParse();
  },
  3000);
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
  const response = await post('/loadfile', {
    name: fileSelector.value,
    wellKnown: wellKnown,
  });

  const data = await response.json();
  const sentences = data.sentences;

  Sentences.data = data;
  Sentences.data.wellKnown = wellKnown;
  Sentences.api.setRowData(sentences.rowData);

  reCalcSentenceStats();
  return;
}

function reCalcSentenceStats() {
  const data = Sentences.data;
  const wellKnown = Sentences.data.wellKnown;
  const currentWords = {};
  Sentences.api.forEachNodeAfterFilter((rowNode, index) => {
    currentWords[rowNode.data.word] = rowNode.data.occurances;
  });
  let words = 0;
  let occurances = 0;

  Object.entries(currentWords).forEach(([word, val]) => {
    words += 1;
    occurances += val;
  });
  const percent = occurances / data.stats.totalWords * 100;

  let currentKnown = data.stats.currentKnown;
  if (wellKnown) {
    currentKnown = data.stats.currentWellKnown;
  }
  document.querySelector('#oneTwords').innerHTML = words;
  document.querySelector('#occurances').innerHTML = occurances;
  document.querySelector('#percent').innerHTML = percent.toFixed(2);
  document.querySelector('#known').innerHTML = currentKnown.toFixed(2);
}

main();
