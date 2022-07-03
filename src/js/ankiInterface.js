// Must have ankiconnect installed as a plugin in your anki installation
async function invoke(action, params) {
  const response = await fetch('http://localhost:8765', {
  // const response = await fetch('http://120.0.0.1:8765', {
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

export async function createCard() {
  // const result = await invoke('modelNames', {
  const result = await invoke('addNote', {
    note: {
      'deckName': 'Testing',
      'modelName': 'Reading Card',
      'fields': {
        Simplified: 'test',
        Meaning: 'test',
        EnglishMeaning: 'test',
        SentenceSimplified: 'test',
      },
      'options': {
        'allowDuplicate': true,
      },
      'audio': [{
        'url': 'https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=猫&kana=ねこ',
        'filename': 'yomichan_ねこ_猫.mp3',
        'skipHash': '7e2c2f954ef6051373ba916f000168dc',
        'fields': [
          'Audio',
        ],
      }],
      'picture': [{
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/A_black_cat_named_Tilly.jpg/220px-A_black_cat_named_Tilly.jpg',
        'filename': 'black_cat.jpg',
        'skipHash': '8d6e4646dfae812bf39651b59d7429ce',
        'fields': [
          'SentenceImage',
        ],
      }],
    },
  });
  return result;
}

// @todo: make this configurable from the app to pick certian decks and fields
export async function importAnkiKeywords() {
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
