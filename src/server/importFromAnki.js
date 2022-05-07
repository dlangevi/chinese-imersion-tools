import fetch from 'node-fetch';
import knownWords from './knownWords.js';

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
  const reading = await invoke('findCards', {
    query: 'deck:Reading -"note:Audio Card"',
  });
  const readingInfo = await invoke('cardsInfo', {
    cards: reading.result,
  });

  const intervalMap = {};
  Object.assign(intervalMap, ...readingInfo.result.filter((card) => {
    return isChinese(card.fields.Simplified.value);
  }).map(
      (card) => {
        let word = card.fields.Simplified.value;
        word = fixWord(word);
        return {
          [word]: card.interval,
        };
      }));

  const skritter = await invoke('findCards', {
    query: 'deck:Skritter',
  });
  const skritterInfo = await invoke('cardsInfo', {
    cards: skritter.result,
  });

  Object.assign(intervalMap, ...skritterInfo.result.filter((card) => {
    return isChinese(card.fields.Word.value);
  }).map(
      (card) => {
        let word = card.fields.Word.value;
        word = fixWord(word);
        return {
          [word]: card.interval,
        };
      }));

  return intervalMap;
}

function isChinese(word) {
  // unicode ranges for chinese characters
  const isOnlyChinese =
    /^[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]*$/
        .test(word);
  if (!isOnlyChinese) {
    console.log(`${word} is sus, skipping it`);
  }
  return isOnlyChinese;
}

function fixWord(word) {
  const origWord = word;
  word = word.replace(/<br>/gi, '');
  word = word.replace(/<div>/gi, '');
  word = word.replace(/<\/div>/gi, '');
  word = word.replace(/,/gi, '');
  word = word.replace(/&nbsp/, '');

  if (word != origWord) {
    console.log(`warning ${word} is ${origWord}`);
  }
  return word;
}

export function register(app) {
  app.get('/loadAnki', (req, res, next) => {
    exportAnkiKeywords().then((ankiObject) => {
      Object.entries(ankiObject).forEach(([word, interval]) => {
        knownWords.addWord(word, interval);
      });
      res.json({
        success: 1,
        words: knownWords.knownWords(),
      });
    });
  });
}
