// import fetch from 'node-fetch'
// const fetch = require('node-fetch')
const fetch = (...args) => import('node-fetch').then(({
  default: fetch
}) => fetch(...args));

const fs = require('fs/promises')
const fsSync = require('fs')
const config = JSON.parse(fsSync.readFileSync("../config.json", "UTF-8", "r"));

async function invoke(action, params) {
  const response = await fetch("http://127.0.0.1:8765", {
    method: 'Post',
    body: JSON.stringify({
      action: action,
      version: 6,
      params: {
        ...params
      }
    })
  });
  return response.json()
}

async function exportAnkiKeywords() {
  var sync = await invoke('sync')
  var reading = await invoke('findCards', {
    query: 'deck:Reading -"note:Audio Card"'
  });
  var readingInfo = await invoke('cardsInfo', {
    cards: reading.result
  });

  var intervalMap = {}
  Object.assign(intervalMap, ...readingInfo.result.map(
    card => ({
      [card.fields.Simplified.value]: card.interval
    })));

  var skritter = await invoke('findCards', {
    query: 'deck:Skritter'
  });
  var skritterInfo = await invoke('cardsInfo', {
    cards: skritter.result
  });

  Object.assign(intervalMap, ...skritterInfo.result.map(
    card => ({
      [card.fields.Word.value]: card.interval
    })));


  console.log(intervalMap);
  return intervalMap;

  // var writeFile = fs.writeFile(config.ankiKeywords, words.join("\n"), (err) => console.log(err));
  var writeFile = await fs.writeFile(config.ankiKeywords, words.join(
    "\n"));
}

module.exports = {
  exportAnkiKeywords: () => exportAnkiKeywords()

}
