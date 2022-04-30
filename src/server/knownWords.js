import fs from 'fs';
import wordStats from './wordStats.js';
import config from './config.js';

// @todo save and load this from the database,
// and handle per user word lists
const known = JSON.parse(fs.readFileSync(
    config.knownWordsJson, 'UTF-8', 'r'));
const knownCharacters = new Set();
Object.keys(known).forEach((word) => {
  Array.from(word).forEach((ch) => knownCharacters.add(ch));
});

/**
 * Return the current date formated 'YYYY-MM-DD'
 * @return {string}
 */
function currentDateString() {
  return toDateString(new Date());
}

/**
 * Format a date to the form 'YYYY-MM-DD'
 * @param {Date} date
 * @return {string}
 */
export function toDateString(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  let day = date.getDate();
  if (day < 10) {
    day = `0${day}`;
  }
  return `${year}-${month}-${day}`;
}

/**
 * Convert a 'YYYY-MM-DD' string into milliseconds
 * @param {Date} dateString - input date
 * @return {number}
 */
function toMilli(dateString) {
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month -1, day);
  return date.getTime();
}

/**
 * Data for the index.html word progress chart
 * @return {Object}
 */
function tableData() {
  const summed = {};
  Object.values(known).forEach((data) => {
    if (!(data.added in summed)) {
      summed[data.added] = 0;
    }
    summed[data.added] += 1;
  });

  const sorted = Object.entries(summed).sort();
  let acc = 0;
  for (let i = 0; i < sorted.length; i++) {
    acc += sorted[i][1];
    sorted[i][1] = acc;
  }

  return {
    lables: sorted.map(([x, _]) => x).map((dateString) => toMilli(dateString)),
    data: sorted.map(([_, y]) => y),
  };
}

function addWord(word, age) {
  // If this is a new word, add it with the current date
  if (!known.hasOwnProperty(word)) {
    known[word] = {added: currentDateString()};
    known[word].interval = age;
    console.log(`Adding new word ${word} ${JSON.stringify(known[word])}`);
  } else {
    // else just update the interval
    known[word].interval = age;
  }
}

function saveWords(callback) {
  fs.writeFile(config.knownWordsJson, JSON.stringify(known), (_) => {
    const words = Object.keys(known);
    console.log(`Saved ${words.length} words`);
    fs.writeFile(config.knownWords, words.join('\n'), callback);
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

function numKnownCharacters() {
  return knownCharacters.size;
}

// exports various dictionaries
const knownWords = {
  addWord: addWord,
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
  knownWords: () => Object.keys(known).length,
  saveWords: saveWords,
  knownCharacters: numKnownCharacters,
  tableData: tableData,
};
export default knownWords;
