import fs from 'fs';
import wordStats from './wordStats.js';
import config from './config.js';


const known = JSON.parse(fs.readFileSync(
    config.knownWordsJson, 'UTF-8', 'r'));
const knownCharacters = new Set();
Object.keys(known).forEach((word) => {
  Array.from(word).forEach((ch) => knownCharacters.add(ch));
});

function addWord(word, age) {
  known[word] = age;
}

function saveWords(callback) {
  fs.writeFile(config.knownWordsJson, JSON.stringify(known), (err) => {
    const words = Object.keys(known);
    console.log(`Saved ${words.length} words`);
    fs.writeFile(config.knownWords, words.join('\n'), callback);
  });
}

function mergeWords(other) {
  Object.assign(known, other);
}

function knownWordsTable() {
  return Object.entries(known).map(([key, value]) => {
    return {
      word: key,
      interval: value,
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
    return known[word] >= howKnown;
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
      });
    });
  },
};
export default knownWords;
