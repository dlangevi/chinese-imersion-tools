import fs from 'fs';
import wordStats from './wordStats.js';
import config from './config.js';


const known = JSON.parse(fs.readFileSync(
    config.knownWordsJson, 'UTF-8', 'r'));
const knownCharacters = new Set();
Object.keys(known).forEach((word) => {
  Array.from(word).forEach((ch) => knownCharacters.add(ch));
});

function currentDateString() {
  const d = new Date();
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`
  }
  let day = d.getDate()
  if (day < 10) {
    day = `0${day}`
  }
  return `${year}-${month}-${day}`;
}

function toMilli(dateString) {
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month -1, day);
  return date.getTime();
}


function tableData() {
  const summed = {}
  Object.values(known).forEach(data => {
    if (!(data.added in summed)) {
      summed[data.added] = 0;
    }
    summed[data.added] += 1;
  });

  const sorted = Object.entries(summed).sort()
  let acc = 0;
  for (let i = 0; i < sorted.length; i++) {
    acc += sorted[i][1];
    sorted[i][1] = acc;
  }

  return {
    lables: sorted.map(([x, y]) => x).map(dateString => toMilli(dateString)),
    data : sorted.map(([x, y]) => y),
  }
}

function addWord(word, age) {
  // If this is a new word, add it with the current date
  if (!known.hasOwnProperty(word)) {
    known[word] = {added: currentDateString()}
    known[word].interval = age; 
    console.log(`Adding new word ${word} ${JSON.stringify(known[word])}`);
  } else {
    // else just update the interval
    known[word].interval = age; 
  }
}

function saveWords(callback) {
  fs.writeFile(config.knownWordsJson, JSON.stringify(known), (err) => {
    const words = Object.keys(known);
    console.log(`Saved ${words.length} words`);
    fs.writeFile(config.knownWords, words.join('\n'), callback);
  });
}

// from Anki, a dict of word => interval
function mergeWords(intervalDict) {
  Object.entries(intervalDict).forEach(([word, interval]) => {
    addWord(word, interval);
  });
}

function knownWordsTable() {
  return Object.entries(known).map(([key, value]) => {
    return {
      word: key,
      interval: value.interval,
      added: value.added,
      stars: wordStats.frequency(key),
    };
  });
}

function knownCharsTable() {
  return [...knownCharacters].map((ch) => {
    return {
      word: ch,
      isKnown: (ch in known),
    };
  });
}

function numKnownCharacters() {
  return knownCharacters.size;
}

function knownLevels() {
  return wordStats.frequencyStats(known);
}

// exports various dictionaries
const knownWords = {
  addWord: addWord,
  mergeWords: mergeWords,
  isKnown: (word, howKnown = 0) => {
    // if word is completly unknown return false
    if (!(word in known)) {
      return false;
    }
    // we know it at least somewhat known
    return known[word].interval >= howKnown;
  },
  isKnownChar: (ch) => {
    return knownCharacters.has(ch);
  },

  knownWordsTable: knownWordsTable,
  knownCharsTable: knownCharsTable,
  knownWords: () => Object.keys(known).length,
  saveWords: saveWords,
  knownCharacters: numKnownCharacters,
  knownLevels: knownLevels,

  register: (app) => {
    app.get('/saveWordlist', (req, res, next) => {
      // todo, do a callback promise or smth
      saveWords((err) => {
        console.log('Saved wordlist');
        res.json({
          success: err,
          totalWords: knownWords.knownWords(),
        });
      });
    });

    app.post('/addWords', (req, res, next) => {
      const words = req.body.words;
      console.log(words);
      words.forEach((word) => addWord(word, 10000));
      fs.appendFile(config.exportedWords,
          words.join('\n') + '\n',
          (err) => {
            const myWords = knownWordsTable();
            res.json({
              success: err,
              totalWords: myWords.length,
              words: myWords,
            });
          });
    });

    app.get('/stats', (req, res, next) => {
      const myWords = knownWordsTable();
      res.json({
        totalWords: myWords.length,
        totalChars: knownCharacters.size,
        tableData: tableData(),
      });
    });
  },
};
export default knownWords;
