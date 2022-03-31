import known from './knownWords.js';
import {Document} from './documentStats.js';
import catalogue from './bookCatalogue.js';

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
  const filename = catalogue.getPath(bookname);
  console.log(`Loading ${filename}`);
  const document = new Document(filename);
  const segText = document.text;

  const oneT = [];
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

      const stats = document.stats(unknownWord);

      oneT.push({
        word: unknownWord,
        occurances: stats.occurances,
        stars: stats.stars,
        position: (index / segText.length * 100).toFixed(2),
        sentence: combinedSentence,
      });
    }
  });

  const candidateWords = new Set([...oneT.map((entry) => entry.word)]);
  const stats = document.documentStats();
  const documentWords = document.documentWords();
  const documentChars = document.documentChars();
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

      const books = catalogue.loadList(listname);
      const output = [];

      books.forEach((bookname) => {
        const parsed = parseFile(bookname, wellKnown);
        output.push(parsed);
      });
      res.json(output);
    });
  },
};
export default oneTsentences;
