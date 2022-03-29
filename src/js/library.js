async function main() {
  var eGridDiv = document.querySelector('#bookList')
  new agGrid.Grid(eGridDiv, Tables.bookList)

  Tables.bookList.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40)
  ObserveTable('#bookList', Tables.bookList)

  await loadFileList();

}

async function loadFileList() {
  let response = await fetch("/filelistdata");
  let data = await response.json();
  Tables.bookList.api.setRowData(data);
  return
}

bookListCols = [{
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
]

var Tables = {
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
}

main()
