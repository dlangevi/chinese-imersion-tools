async function main() {
  var eGridDiv = document.querySelector('#bookList')
  new agGrid.Grid(eGridDiv, Tables.bookList)
  var wGridDiv = document.querySelector('#myBookList')
  new agGrid.Grid(wGridDiv, Tables.myBookList)

  Tables.bookList.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40)
  Tables.myBookList.columnApi.sizeColumnsToFit(wGridDiv.offsetWidth)

  var dropZoneParams = Tables.myBookList.api.getRowDropZoneParams();
  Tables.bookList.api.addRowDropZone(dropZoneParams);

  await loadFileList();
  await loadListList();

  document.querySelector('#addList').addEventListener('click', async () => {
    var name = prompt("Name please")
    let response = await fetch("/savelist", {
      method: 'POST',
      headers: {
        'Content-Type': "application/json;charset=utf-8"
      },
      body: JSON.stringify({
        title: name,
        data: [],
      })
    });
    var selector = document.querySelector('#myBookLists');
    var opt = document.createElement('option');
    opt.value = name;
    opt.innerHTML = name;
    selector.appendChild(opt);
  });

  document.querySelector('#saveList').addEventListener('click', async () => {
    var selector = document.querySelector('#myBookLists');
    var currentList = selector.value;
    var books = []
    Tables.myBookList.api.forEachNode(node => {
      books.push(`${node.data.author} - ${node.data.title}`)
    });
    let response = await fetch("/savelist", {
      method: 'POST',
      headers: {
        'Content-Type': "application/json;charset=utf-8"
      },
      body: JSON.stringify({
        title: selector.value,
        data: books,
      })
    });
  });

  document.querySelector('#deleteList').addEventListener('click',
    async () => {
      var selector = document.querySelector('#myBookLists');
      var currentList = selector.value;
      let response = await fetch("/deletelist", {
        method: 'POST',
        headers: {
          'Content-Type': "application/json;charset=utf-8"
        },
        body: JSON.stringify({
          title: selector.value,
        })
      });
    });

  document.querySelector('#myBookLists').addEventListener('change',
    () => loadListContents());

}

async function withLoader(fn) {
  showLoader();
  await fn();
  finishLoader();
}

async function loadFileList() {
  let response = await fetch("/filelistdata");
  let data = await response.json();
  Tables.bookList.api.setRowData(data);
  return
}

async function loadListList() {
  let response = await fetch("/listlist");
  let data = await response.json();
  var selector = document.querySelector('#myBookLists');
  data.forEach(title => {
    var opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    selector.appendChild(opt);
  });
  if (data.length > 0) {
    await loadListContents()
  }
  return
}

async function loadListContents() {
  var selector = document.querySelector('#myBookLists');
  var currentList = selector.value;
  let response = await fetch("/loadlist", {
    method: 'POST',
    headers: {
      'Content-Type': "application/json;charset=utf-8"
    },
    body: JSON.stringify({
      title: currentList,
    })
  });
  let data = await response.json()
  Tables.myBookList.api.setRowData(data);
}


// Prevent migaku empty spans from messing stuff up
const observer = new MutationObserver(mutations_list => {
  mutations_list.forEach(mutation => {
    mutation.addedNodes.forEach(added_node => {
      if (added_node.innerText == '' && added_node.nodeName ==
        'SPAN') {
        added_node.remove()
      }
    });
  });
});
observer.observe(document.querySelector('body'), {
  subtree: true,
  childList: true
});

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

myBookListCols = [{
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
    resizeable: false,
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
}

main()
