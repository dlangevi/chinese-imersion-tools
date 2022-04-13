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
  {
    headerName: 'Book',
    field: 'bookTitle',
    width: 400,
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
    migakuParse();
  },
};

async function main() {
	await topNavLoaded();
  const eGridDiv = document.querySelector('#sentenceGrid');
  new agGrid.Grid(eGridDiv, Sentences);

  Sentences.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  observeTable('#sentenceGrid', Sentences);


  document.querySelector('#searchBox').addEventListener('keyup', (event) => {
    console.log('keyup');
    if (event.keyCode === 13) {
      event.preventDefault();
      document.querySelector('#searchButton').click();
    }
  });
  document.querySelector('#searchButton').addEventListener('click', () => {
    searchWord();
  }); ;
}

async function searchWord() {
  const searchBox = document.querySelector('#searchBox');
  const selector = document.querySelector('#listSelect');
  const response = await post('/lookupWord', {
    word: searchBox.value,
    list: selector.value,
  });
  const data = await response.json();
  Sentences.api.setRowData(data);
  migakuParse();
}


main();
