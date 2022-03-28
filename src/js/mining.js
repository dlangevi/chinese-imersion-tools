async function main() {
  var eGridDiv = document.querySelector('#sentenceGrid')
  new agGrid.Grid(eGridDiv, Tables.sentences)

  Tables.sentences.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40)
  ObserveTable('#sentenceGrid', Tables.sentences)


  await loadFileList();
  await loadFile()

  document.querySelector('#jsonFiles').addEventListener('change',
    () => loadFile(false));

  document.querySelector('#loadAll').addEventListener('click',
    () => loadFile(false));
  document.querySelector('#loadKnown').addEventListener('click',
    () => loadFile(true));
  document.querySelector('#showfavorite').addEventListener('click',
    loadFavorites);

  setTimeout(() => {
      migakuParse()
    },
    3000);

}

async function exportWords(rows) {
  withLoader(async () => {
    var words = [...new Set(rows.map(row => row.word))];
    let contents = await fetch("/exportwords", {
      method: 'POST',
      headers: {
        'Content-Type': "application/json;charset=utf-8"
      },
      body: JSON.stringify({
        words: words
      })
    });
    let obj = await contents.json()
    Tables.words.data = obj.words;
    Tables.words.api.setRowData(obj.words);
    reCalcWordStats();

    console.log(
      `Exported words ${words.join(',')} now know ${obj.totalWords} total words`
    )
  });
}


async function withLoader(fn) {
  showLoader();
  await fn();
  finishLoader();
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

async function loadFavorites() {
  let response = await fetch("/favfilelist");
  let data = await response.json();
  var fileSelector = document.querySelector('#jsonFiles');
  fileSelector.innerHTML = ""
  data.forEach(title => {
    var opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    fileSelector.appendChild(opt);
  });
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

  var sentences = data.sentences;

  Tables.sentences.data = sentences
  Tables.sentences.data.wellKnown = wellKnown;
  Tables.sentences.api.setRowData(sentences.rowData)

  reCalcSentenceStats()
  return
}

function reCalcSentenceStats() {
  var data = Tables.sentences.data
  if (data == undefined) {
    return;
  }
  var wellKnown = Tables.sentences.data.wellKnown
  var currentWords = {}
  Tables.sentences.api.forEachNodeAfterFilter((rowNode, index) => {
    currentWords[rowNode.data.word] = rowNode.data.occurances
  });
  var words = 0;
  var occurances = 0;

  Object.entries(currentWords).forEach(([word, val]) => {
    words += 1;
    occurances += val;
  });
  var percent = occurances / data.totalWords * 100;

  if (wellKnown) {
    var currentKnown = data.currentWellKnown
  } else {
    var currentKnown = data.currentKnown
  }
  document.querySelector('#oneTwords').innerHTML = words;
  document.querySelector('#occurances').innerHTML = occurances;
  document.querySelector('#percent').innerHTML = percent.toFixed(2);
  document.querySelector('#known').innerHTML = currentKnown.toFixed(2);
}

main()
