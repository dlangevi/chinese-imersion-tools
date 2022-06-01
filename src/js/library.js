import {observeTable, post} from './shared.js';
import {topNavLoaded} from './topnav.js';

async function main() {
  await topNavLoaded();
  const eGridDiv = document.querySelector('#bookList');
  new agGrid.Grid(eGridDiv, Tables.bookList);

  Tables.bookList.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  observeTable('#bookList', Tables.bookList);

  const listSelector = document.querySelector('#listSelect');
  await loadListContents( listSelector.value);


  document.querySelector('#listSelect').addEventListener('change',
      () => {
        const selector = document.querySelector('#listSelect');
        const currentList = selector.value;
        loadListContents(currentList);
      });
}


async function loadListContents(sublist) {
  const response = await post('/loadlist', {
    title: sublist,
  });

  const data = await response.json();
  Tables.bookList.api.setRowData(data);
}

const bookListCols = [
  {
    headerName: 'Title',
    field: 'title',
    width: 200,
    rowDrag: true,
    sortable: true,
  },
  {
    headerName: 'Author',
    field: 'author',
    width: 100,
    sortable: true,
  },
  {
    headerName: 'Words',
    field: 'words',
    width: 50,
    filter: 'agNumberColumnFilter',
    sortable: true,
  },
  {
    headerName: 'Percent',
    field: 'percent',
    width: 50,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  {
    headerName: 'Percent By Char',
    field: 'percentChars',
    width: 50,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },

  {
    headerName: 'To 86',
    field: 'wordsTo86',
    width: 50,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  {
    headerName: 'To 90',
    field: 'wordsTo90',
    width: 50,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
];

const Tables = {
  bookList: {
    columnDefs: bookListCols,
    rowData: [],
    rowHeight: 60,
    rowBuffer: 20,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
    getRowId: function(params) {
      return params.data.title;
    },
    rowDragManaged: true,
    animateRows: true,

  },
};

main();
