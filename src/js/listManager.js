import {
  RemoveBookRenderer,
} from './agRenderers.js';
import {
  observeTable,
  post,
  fetchUser,
} from './shared.js';
import {topNavLoaded} from './topnav.js';

async function main() {
  await topNavLoaded();
  const eGridDiv = document.querySelector('#allBookList');
  new agGrid.Grid(eGridDiv, Tables.bookList);
  const wGridDiv = document.querySelector('#myBookList');
  new agGrid.Grid(wGridDiv, Tables.myBookList);

  Tables.bookList.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40);
  Tables.myBookList.columnApi.sizeColumnsToFit(wGridDiv.offsetWidth);
  observeTable('#allBookList', Tables.bookList);
  observeTable('#myBookList', Tables.myBookList);

  const dropZoneParams = Tables.myBookList.api.getRowDropZoneParams();
  Tables.bookList.api.addRowDropZone(dropZoneParams);

  const listSelector = document.querySelector('#listSelect');
  await loadFileList(listSelector.value);
  await loadListList();

  document.querySelector('#listSelect').addEventListener('change',
      () => {
        const selector = document.querySelector('#listSelect');
        const currentList = selector.value;
        loadFileList(currentList);
      });

  document.querySelector('#addList').addEventListener('click', async () => {
    const name = prompt('Name please');
    await post('/savelist', {
      title: name,
      books: [],
    });
    const selector = document.querySelector('#myBookLists');
    const opt = document.createElement('option');
    opt.value = name;
    opt.innerHTML = name;
    selector.appendChild(opt);
  });

  document.querySelector('#saveList').addEventListener('click', async () => {
    const selector = document.querySelector('#myBookLists');
    const currentList = selector.value;
    const books = [];
    Tables.myBookList.api.forEachNode((node) => {
      books.push(`${node.data.author} - ${node.data.title}`);
    });
    await post('/savelist', {
      title: currentList,
      books: books,
    });
  });

  document.querySelector('#deleteList').addEventListener('click',
      async () => {
        const selector = document.querySelector('#myBookLists');
        const currentList = selector.value;
        await post('/deletelist', {
          title: currentList,
        });
      });


  document.querySelector('#myBookLists').addEventListener('change',
      () => loadListContents());
}

async function loadFileList(sublist='all') {
  const response = await post('/loadlist', {
    title: sublist,
  });
  const data = await response.json();
  Tables.bookList.api.setRowData(data);
  return;
}

async function loadListList() {
  const response = await fetchUser('/listlist');
  const data = await response.json();
  const selector = document.querySelector('#myBookLists');
  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    selector.appendChild(opt);
  });
  if (data.length > 0) {
    await loadListContents();
  }
  return;
}

async function loadListContents() {
  const selector = document.querySelector('#myBookLists');
  const currentList = selector.value;
  const response = await post('/loadlist', {
    title: currentList,
  });

  const data = await response.json();
  Tables.myBookList.api.setRowData(data);
}


const bookListCols = [{
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

const myBookListCols = [{
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
  headerName: '',
  field: 'removeBook',
  width: 50,
  cellRenderer: RemoveBookRenderer,
  resizable: false,
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
  myBookList: {
    columnDefs: myBookListCols,
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
