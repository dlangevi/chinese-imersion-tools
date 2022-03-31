import fetch from 'node-fetch';
import knownWords from './knownWords.js';
import config from './config.js';
import fs from 'fs/promises';

async function invoke(action, params) {
  const response = await fetch('http://127.0.0.1:8765', {
    method: 'Post',
    body: JSON.stringify({
      action: action,
      version: 6,
      params: {
        ...params,
      },
    }),
  });
  return response.json();
}

async function exportAnkiKeywords() {
  await invoke('sync');
  const reading = await invoke('findCards', {
    query: 'deck:Reading -"note:Audio Card"',
  });
  const readingInfo = await invoke('cardsInfo', {
    cards: reading.result,
  });

  const intervalMap = {};
  Object.assign(intervalMap, ...readingInfo.result.map(
      (card) => ({
        [card.fields.Simplified.value]: card.interval,
      })));

  const skritter = await invoke('findCards', {
    query: 'deck:Skritter',
  });
  const skritterInfo = await invoke('cardsInfo', {
    cards: skritter.result,
  });

  Object.assign(intervalMap, ...skritterInfo.result.map(
      (card) => ({
        [card.fields.Word.value]: card.interval,
      })));


  console.log(intervalMap);
  return intervalMap;

  await fs.writeFile(config.ankiKeywords, words.join('\n'));
}

export function register(app) {
  app.get('/loadAnki', (req, res, next) => {
    exportAnkiKeywords().then((ankiObject) => {
      knownWords.mergeWords(ankiObject);
      res.json({
        success: 1,
        words: knownWords.knownWords(),
      });
    });
  });
}
