import {observeTable, post} from './shared.js';

async function main() {
  const eGridDiv = document.querySelector('#bookList');
  new agGrid.Grid(eGridDiv, Tables.bookList);

  Tables.bookList.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  observeTable('#bookList', Tables.bookList);

  await loadListContents('all');
  await loadListList();


  document.querySelector('#myBookLists').addEventListener('change',
      () => {
        const selector = document.querySelector('#myBookLists');
        const currentList = selector.value;
        loadListContents(currentList);
      });

  document.querySelector('#openList').addEventListener('click',
      async () => {
        const selector = document.querySelector('#myBookLists');
        const currentList = selector.value;
        window.location = '/mining.html?list=' + currentList;
      });
}

async function loadListList() {
  const response = await fetch('/listlist');
  const data = await response.json();
  const selector = document.querySelector('#myBookLists');
  const opt = document.createElement('option');
  opt.value = 'all';
  opt.innerHTML = 'all';
  selector.appendChild(opt);
  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    selector.appendChild(opt);
  });
  return;
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
