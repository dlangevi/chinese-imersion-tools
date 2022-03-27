const express = require('express');
const path = require('path');
const catalogue = require("./app_modules/bookCatalogue.js")
const oneTsentences = require("./app_modules/oneTsentences.js")
const importFromAnki = require("./app_modules/importFromAnki.js")
const knownWords = require("./app_modules/knownWords.js")
const documentStats = require("./app_modules/documentStats.js")
const bodyParser = require('body-parser')

// Init App
const app = express();

app.use(express.static('dist/'))
app.use(express.static('node_modules/ag-grid-community/dist/'))

app.use(bodyParser.json())

// Book Library Calls
catalogue.register(app);

// Sentence Mining Calls
importFromAnki.register(app)

app.post("/loadfile", (req, res, next) => {
  var bookname = req.body.name;
  var wellKnown = req.body.wellKnown;
  if (wellKnown) {
    var howKnown = 20
  } else {
    var howKnown = 0
  }

  var filename = catalogue.getPath(bookname)
  console.log(`Loading ${filename}`)
  var document = new documentStats.Document(filename);
  var documentWords = document.documentWords();
  var documentChars = document.documentChars();
  var stats = document.documentStats()
  var parsed = oneTsentences.parse(document, howKnown)
  res.json({
    stats: stats,
    sentences: parsed,
    docWords: documentWords,
    chars: documentChars
  })
});


app.listen(3000, () => {
  console.log('Server started on port 3000')
});
