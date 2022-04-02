import known from './knownWords.js';
import {Document} from './documentStats.js';
import catalogue from './bookCatalogue.js';
import wordStats from './wordStats.js';

/*
 * Here is where the logic for extracting useful information from our document
 * sits, it can take a single filename, or a list of filenames
 */
export class MultiDocumentProcessor {
  #documents = [];

  #aggregateWordTable = {};
  #aggregateCharTable = {};
  #aggregateTotalWords = 0;
  #aggregateTotalKnownWords = 0;
  #aggregateTotalWellKnownWords = 0;

  constructor(booknames) {
    if (!(booknames instanceof Array)) {
      booknames = [booknames];
    }
    this.#documents = booknames.map((bookname) => {
      const filename = catalogue.getPath(bookname);
      console.log(`Loading ${filename}`);
      return new Document(filename, bookname);
    });

    this.#aggregateStats();
  }

  candidateSentences(howKnown) {
    const oneT = [];
    this.#documents.forEach((document) => {
      const segText = document.text;
      segText.forEach((sentence, index) => {
        const [isOneT, unknownWord] = sentenceMostlyKnown(sentence, howKnown);
        if (isOneT && !known.isKnown(unknownWord)) {
          let combinedSentence = toText(sentence);
          for (let i = index - 1; i >= Math.max(index - 6, 0); i--) {
            const isKnown = sentenceKnown(segText[i], unknownWord, howKnown);
            if (!isKnown) {
              break;
            }
            combinedSentence = toText(segText[i]) + combinedSentence;
          }
          for (let i = index + 1; i < Math.min(index + 6, segText
              .length); i++) {
            const isKnown = sentenceKnown(segText[i], unknownWord, howKnown);
            if (!isKnown) {
              break;
            }
            combinedSentence = combinedSentence + toText(segText[i]);
          }

          // TODO aggregate this
          // const stats = this.wordStats(unknownWord);
          const stats = document.wordStats(unknownWord);

          oneT.push({
            word: unknownWord,
            occurances: stats.occurances,
            stars: stats.stars,
            position: (index / segText.length * 100).toFixed(2),
            bookTitle: document.title,
            sentence: combinedSentence,
          });
        }
      });
    });
    return oneT;
  }

  wordStats(word) {
    const occurances = this.#aggregateWordTable[word];
    return {
      occurances: occurances,
      percent: occurances / this.#aggregateTotalWords * 100,
      stars: wordStats.frequency(word),
    };
  }

  /*
   * Just playing around with what reduce and structured bindings can do
   */
  #aggregateStats() {
    function combineObjects(a, obj) {
      Object.entries(obj).forEach(([key, val]) => {
        a[key] = (a[key] || 0) + val;
      });
      return a;
    }

    const {
      wordTable,
      charTable,
      totalWords,
      totalKnownWords,
      totalWellKnownWords,
    } = this.#documents.map((document) => {
      return document.allStats;
    }).reduce((
        {
          wordTable: wordTable1,
          charTable: charTable1,
          totalWords: totalWords1,
          totalKnownWords: totalKnownWords1,
          totalWellKnownWords: totalWellKnownWords1,
        },
        {
          wordTable: wordTable2,
          charTable: charTable2,
          totalWords: totalWords2,
          totalKnownWords: totalKnownWords2,
          totalWellKnownWords: totalWellKnownWords2,
        },
    ) => {
      return {
        wordTable: combineObjects(wordTable1, wordTable2),
        charTable: combineObjects(charTable1, charTable2),
        totalWords: totalWords1 + totalWords2,
        totalKnownWords: totalKnownWords1 + totalKnownWords2,
        totalWellKnownWords: totalWellKnownWords1 + totalWellKnownWords2,
      };
    });

    this.#aggregateWordTable = wordTable;
    this.#aggregateCharTable = charTable;
    this.#aggregateTotalWords = totalWords;
    this.#aggregateTotalKnownWords = totalKnownWords;
    this.#aggregateTotalWellKnownWords = totalWellKnownWords;
  }

  // Todo, some of the underlying logic should be lifted into this class
  documentStats() {
    return {
      totalWords: this.#aggregateTotalWords,
      curentKnownWords: this.#aggregateTotalKnownWords,
      currentWellKnownWords: this.#aggregateTotalWellKnownWords,
      currentKnown: this.#aggregateTotalKnownWords /
        this.#aggregateTotalWords * 100,
      currentWellKnown: this.#aggregateTotalWellKnownWords /
        this.#aggregateTotalWords * 100,
    };
  }
  documentWords() {
    return Object.entries(this.#aggregateWordTable).map(
        ([word, occurances]) => {
          return {
            word: word,
            occurances: occurances,
            isKnown: known.isKnown(word),
            stars: wordStats.frequency(word),
          };
        });
  }
  documentChars() {
    return Object.entries(this.#aggregateCharTable).map(([ch, occurances]) => {
      return {
        word: ch,
        occurances: occurances,
        isKnown: known.isKnownChar(ch),
      };
    });
  }
}

function sentenceMostlyKnown(sentence, howKnown) {
  let unknown = 0;
  let unknownWord = '';
  sentence.forEach(([word, type]) => {
    if (type != 3) return;

    if (!(known.isKnown(word, howKnown))) {
      unknown += 1;
      unknownWord = word;
    }
  });
  return [unknown == 1, unknownWord];
}

function sentenceKnown(sentence, exception, howKnown) {
  let allKnown = true;
  sentence.forEach(([word, type]) => {
    if (type != 3) return;
    if (word == exception) return;
    if (!(known.isKnown(word, howKnown))) {
      allKnown = false;
    }
  });
  return allKnown;
}

function toText(sentence) {
  return sentence.map(([word, type]) => word).join('');
}


function parseFile(bookname, wellKnown) {
  let howKnown = 0;
  if (wellKnown) {
    howKnown = 20;
  }
  const document = new MultiDocumentProcessor(bookname);

  const oneT = document.candidateSentences(howKnown);
  const candidateWords = new Set([...oneT.map((entry) => entry.word)]);

  const stats = document.documentStats();
  console.log(stats);
  return {
    stats: stats,
    sentences: {
      rowData: oneT,
      words: candidateWords.size,
    },
  };
}

function parseList(listname, wellKnown) {
  let howKnown = 0;
  if (wellKnown) {
    howKnown = 20;
  }
  const books = catalogue.loadList(listname);
  const document = new MultiDocumentProcessor(books);

  const oneT = document.candidateSentences(howKnown);
  const candidateWords = new Set([...oneT.map((entry) => entry.word)]);

  const stats = document.documentStats();
  return {
    stats: stats,
    sentences: {
      rowData: oneT,
      words: candidateWords.size,
    },
  };
}

const oneTsentences = {
  register: (app) => {
    app.post('/loadfile', (req, res, next) => {
      const bookname = req.body.name;
      const wellKnown = req.body.wellKnown;
      const parsed = parseFile(bookname, wellKnown);
      res.json(parsed);
    });

    app.post('/loadCombinedList', (req, res, next) => {
      const listname = req.body.name;
      const wellKnown = req.body.wellKnown;
      const parsed = parseList(listname, wellKnown);
      res.json(parsed);
    });

    app.post('/loadFileWords', (req, res, next) => {
      const bookname = req.body.name;
      const document = new MultiDocumentProcessor(bookname);
      const documentWords = document.documentWords();
      const stats = document.documentStats();
      res.json({words: documentWords, stats: stats});
    });
  },

};
export default oneTsentences;