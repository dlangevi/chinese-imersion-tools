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
    headerName: 'Book',
    field: 'bookTitle',
    width: 200,
    filter: true,
    cellRenderer: CenteredRenderer,
    wrapText: true,
    suppressSizeToFit: true,
  },
  {
    headerName: 'Sentence',
    field: 'sentence',
    resizable: true,
    cellRenderer: CenteredRenderer,
    wrapText: true,
    flex: 1,
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
	
  const eGridDiv = document.querySelector('#sentenceGrid');
  new agGrid.Grid(eGridDiv, Sentences);

  // Sentences.columnApi.sizeColumnsToFit();
  Sentences.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  observeTable('#sentenceGrid', Sentences);

	await topNavLoaded();
  await loadList();

  document.querySelector('#listSelect').addEventListener('change',
      () => loadList(false));
  document.querySelector('#loadAll').addEventListener('click',
      () => loadList(false));
  document.querySelector('#loadKnown').addEventListener('click',
      () => loadList(true));

  setTimeout(() => {
    migakuParse();
  },
  3000);
}

async function loadList(wellKnown = false) {
  const listSelector = document.querySelector('#listSelect');
  const response = await post('/loadCombinedList', {
    name: listSelector.value,
    wellKnown: false,
  });
  const data = await response.json();
  const sentences = data.sentences;

  Sentences.data = data;
  Sentences.data.wellKnown = false;
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
