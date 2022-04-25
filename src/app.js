import express from 'express';
import bodyParser from 'body-parser';

import catalogue from './app_modules/bookCatalogue.js';
import documentProcessor from './app_modules/documentProcessor.js';
import {register} from './app_modules/importFromAnki.js';
import knownWords from './app_modules/knownWords.js';
import sentenceDB from './app_modules/sentenceDB.js';

// Init App
const app = express();

app.use(express.static('dist/'));
app.use(express.static('node_modules/ag-grid-community/dist/'));

app.use(bodyParser.json());

// Sentence Mining Calls
register(app);

// Book Library Calls
catalogue.register(app);

knownWords.register(app);

documentProcessor.register(app);

app.post('/lookupWord', async (req, res, next) => {
  const word = req.body.word;
  const list = req.body.list;
  if (!sentenceDB.loaded) {
    await sentenceDB.reloadSentences();
  }
  let sentences = sentenceDB.lookupWordFast(word, list);
  if (sentences.length == 0) {
    sentences = await sentenceDB.lookupWordSlow(word, list);
  }
  res.json(sentences);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
