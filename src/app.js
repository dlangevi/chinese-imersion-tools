const express = require('express');
const fs = require('fs');
const path = require('path');
const catalogue = require("./app_modules/bookCatalogue.js")
const oneTsentences = require("./app_modules/oneTsentences.js")
const importFromAnki = require("./app_modules/importFromAnki.js")
const knownWords = require("./app_modules/knownWords.js")
const documentStats = require("./app_modules/documentStats.js")
const bodyParser = require('body-parser')
const config = JSON.parse(fs.readFileSync("../config.json", "UTF-8", "r"))

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

app.get("/saveWordlist", (req, res, next) => {
  // todo, do a callback promise or smth
  knownWords.saveWords((err) => {
    res.json({
      success: err,
      totalWords: knownWords.knownWords()
    })
  });

});

app.post("/exportwords", (req, res, next) => {
  var words = req.body.words
  console.log(words)
  words.forEach(word => knownWords.addWord(word, 365))
  fs.appendFile(config.exportedWords,
    words.join("\n") + "\n",
    (err) => {
      var myWords = knownWords.knownWordsTable();
      res.json({
        success: err,
        totalWords: knownWords.knownWords(),
        words: myWords,
      });
    });
});

app.listen(3000, () => {
  console.log('Server started on port 3000')
});
