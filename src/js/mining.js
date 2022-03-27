async function main() {
  var eGridDiv = document.querySelector('#sentenceGrid')
  new agGrid.Grid(eGridDiv, Tables.sentences)

  Tables.sentences.columnApi.sizeColumnsToFit(eGridDiv.offsetWidth - 40)
  ObserveTable('#sentenceGrid', Tables.sentences)


  await loadFileList();
  await loadFile()

  document.querySelector('#toggleButton').addEventListener('click',
    toggleMigakuContainer);
  document.querySelector('#parseButton').addEventListener('click',
    migakuParse);
  document.querySelector('#syncButton').addEventListener('click',
    ankiLoad);
  document.querySelector('#saveProgress').addEventListener('click',
    saveWordList);

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


function toggleMigakuContainer() {
  var container = document.querySelector('#migaku-toolbar-container')
  var state = container.style.display;
  if (state != 'block') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

function migakuParse() {
  var migakuParse = document.querySelector('#migaku-toolbar-po-parse')
  if (migakuParse) {
    migakuParse.click()
  } else {
    console.log("Consider installing Migaku")
  }
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

async function saveWordList() {
  withLoader(async () => {
    let response = await fetch("/saveWordlist");
    let data = await response.json();
  });
}

async function ankiLoad() {
  withLoader(async () => {
    let response = await fetch("/loadAnki");
    let data = await response.json();
    console.log(data);
  });
}

async function loadFile(wellKnown = false) {

  var fileSelector = document.querySelector('#jsonFiles');

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
  var bookWords = Tables.docWords.data.length
  var knownBookWords = Tables.docWords.data.filter(entry => entry.isKnown)
    .length
  var bookChars = Tables.docChars.data.length
  var knownBookChars = Tables.docChars.data.filter(entry => entry.isKnown)
    .length
  var totalWords = Tables.docWords.stats.totalWords

  document.querySelector('#bookWords').innerHTML = bookWords;
  document.querySelector('#knownBookWords').innerHTML = knownBookWords;
  document.querySelector('#bookCharacters').innerHTML = bookChars;
  document.querySelector('#knownBookCharacters').innerHTML = knownBookChars;
  document.querySelector('#totalBookWords').innerHTML = totalWords;
}

function reCalcWordStats() {
  var totalWords = Tables.words.data.length;
  var knownCharacters = Tables.chars.data.length;
  var stats = Tables.otherStats.knownLevels;
  console.log(stats)
  document.querySelector('#totalWords').innerHTML = totalWords;
  document.querySelector('#totalCharacters').innerHTML = knownCharacters;
  document.querySelector('#totalFiveStar').innerHTML = stats.counts["5"];
  document.querySelector('#knownFiveStar').innerHTML = stats.knownCounts["5"];
  document.querySelector('#percentFiveStar').innerHTML = (
    stats.knownCounts[
      "5"] /
    stats.counts["5"] * 100).toFixed(2);

  document.querySelector('#totalFourStar').innerHTML = stats.counts["4"];
  document.querySelector('#knownFourStar').innerHTML = stats.knownCounts["4"];
  document.querySelector('#percentFourStar').innerHTML = (
    stats.knownCounts[
      "4"] /
    stats.counts["4"] * 100).toFixed(2);
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


main()
