import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

import catalogue from './app_modules/bookCatalogue.js';
import oneTsentences from './app_modules/oneTsentences.js';
import {register} from './app_modules/importFromAnki.js';
import knownWords from './app_modules/knownWords.js';
import {Document} from './app_modules/documentStats.js';
import config from './app_modules/config.js';

// Init App
const app = express();

app.use(express.static('dist/'));
app.use(express.static('node_modules/ag-grid-community/dist/'));

app.use(bodyParser.json());

// Sentence Mining Calls
register(app);

// Book Library Calls
catalogue.register(app);


app.post('/loadfile', (req, res, next) => {
  const bookname = req.body.name;
  const wellKnown = req.body.wellKnown;
  let howKnown = 0;
  if (wellKnown) {
    howKnown = 20;
  }

  const filename = catalogue.getPath(bookname);
  console.log(`Loading ${filename}`);
  const document = new Document(filename);
  const documentWords = document.documentWords();
  const documentChars = document.documentChars();
  const stats = document.documentStats();
  const parsed = oneTsentences.parse(document, howKnown);
  res.json({
    stats: stats,
    sentences: parsed,
    docWords: documentWords,
    chars: documentChars,
  });
});

app.get('/saveWordlist', (req, res, next) => {
  // todo, do a callback promise or smth
  knownWords.saveWords((err) => {
    res.json({
      success: err,
      totalWords: knownWords.knownWords(),
    });
  });
});

app.post('/exportwords', (req, res, next) => {
  const words = req.body.words;
  console.log(words);
  words.forEach((word) => knownWords.addWord(word, 365));
  fs.appendFile(config.exportedWords,
      words.join('\n') + '\n',
      (err) => {
        const myWords = knownWords.knownWordsTable();
        res.json({
          success: err,
          totalWords: knownWords.knownWords(),
          words: myWords,
        });
      });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
