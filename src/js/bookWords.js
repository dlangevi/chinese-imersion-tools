async function main() {
  var dGridDiv = document.querySelector('#docWordGrid')
  new agGrid.Grid(dGridDiv, Tables.docWords)

  Tables.docWords.columnApi.sizeColumnsToFit(dGridDiv.offsetWidth - 40)
  ObserveTable('#docWordGrid', Tables.docWords)

  await loadFileList();
  await loadFile()

  document.querySelector('#jsonFiles').addEventListener('change',
    () => loadFile(false));
  document.querySelector('#showKnown').addEventListener('click',
    () => {
      const filter = Tables.docWords.api.getFilterInstance('isKnown')
      filter.setModel({
        state: 'known'
      })
    });
  document.querySelector('#showUnknown').addEventListener('click',
    () => {
      const filter = Tables.docWords.api.getFilterInstance('isKnown')
      filter.setModel({
        state: 'unknown'
      })
    }
  );
}

async function loadFileList() {
  let response = await fetch("/filelist");
  let data = await response.json();
  var fileSelector = document.querySelector('#jsonFiles');
  fileSelector.innerHTML = ""
  data.forEach(title => {
    var opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    fileSelector.appendChild(opt);
  });
  var savedFile = localStorage.getItem('ch|loadFile');
  if (savedFile) {
    var fileSelector = document.querySelector('#jsonFiles');
    fileSelector.value = savedFile
  }
  return
}

async function loadFile(wellKnown = false) {

  var fileSelector = document.querySelector('#jsonFiles');

  localStorage.setItem('ch|loadFile', fileSelector.value);
  let response = await fetch("/loadfile", {
    method: 'POST',
    headers: {
      'Content-Type': "application/json;charset=utf-8"
    },
    body: JSON.stringify({
      name: fileSelector.value,
      wellKnown: wellKnown
    })
  });

  let data = await response.json();

  var words = data.docWords;

  Tables.docWords.data = words;
  Tables.docWords.stats = data.stats;
  Tables.docWords.api.setRowData(words);

  return
}

main()
