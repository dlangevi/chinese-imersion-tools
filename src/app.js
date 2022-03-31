import express from 'express';
import bodyParser from 'body-parser';

import catalogue from './app_modules/bookCatalogue.js';
import oneTsentences from './app_modules/documentProcessor.js';
import {MultiDocumentProcessor} from './app_modules/documentProcessor.js';
import {register} from './app_modules/importFromAnki.js';
import knownWords from './app_modules/knownWords.js';

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

oneTsentences.register(app);

app.post('/loadFileWords', (req, res, next) => {
  const bookname = req.body.name;
  const filename = catalogue.getPath(bookname);
  console.log(`Loading ${filename}`);
  const document = new MultiDocumentProcessor(filename);
  const documentWords = document.documentWords();
  res.json(documentWords);
});


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
