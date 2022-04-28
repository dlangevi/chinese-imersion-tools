import known from './knownWords.js';
import sentenceDB from './sentenceDB.js';
import bookCatalogue from './bookCatalogue.js';
import {loadDocument} from './documentStats.js';


export function registerRequests(app) {
  /*
   *   Top Nav
   */
  app.get('/saveWordlist', (_, res) => {
    // todo, do a callback promise or smth
    known.saveWords((err) => {
      console.log('Saved wordlist');
      res.json({
        success: err,
        totalWords: known.knownWords(),
      });
    });
  });


  /*
   *   Dashboard
   */
  app.get('/stats', (_, res) => {
    const myWords = known.knownWordsTable();
    res.json({
      totalWords: myWords.length,
      totalChars: known.knownCharacters(),
      tableData: known.tableData(),
    });
  });

  /*
   *   Book Library
   */
  app.get('/listlist', (_, res) => {
    res.json(Object.keys(bookCatalogue.allLists()));
  });
  /*
   *   List Manager
   */
  app.post('/filelist', (req, res) => {
    const listName = req.body.list;
    res.json(bookCatalogue.loadList(listName));
  });

  app.post('/savelist', (req, res) => {
    const listname = req.body.title;
    const books = req.body.books;
    bookCatalogue.saveList(listname, books);
    res.json({success: 'success'});
  });

  app.post('/deletelist', (req, res) => {
    const listname = req.body.title;
    bookCatalogue.deleteList(listname);
    res.json({success: 'success'});
  });

  app.post('/loadlist', async (req, res) => {
    const listname = req.body.title;
    const books = bookCatalogue.allBooks();
    const ourBooks = bookCatalogue.loadList(listname);
    const listcts = await Promise.all(ourBooks.map(async (bookName) => {
      const book = books[bookName];
      const document = await loadDocument(bookName);
      const stats = document.documentStats();
      return {
        author: book.author,
        title: book.title,
        words: stats.totalWords,
        percent: stats.currentKnown.toFixed(2),
        percentChars: stats.currentKnownChar.toFixed(2),
      };
    }));
    res.json(listcts);
  });

  /*
   *   Sentence Mining
   */

  /*
   *   Book Words
   */
  app.post('/addWords', (req, res) => {
    const words = req.body.words;
    console.log(words);
    words.forEach((word) => known.addWord(word, 10000));
    const myWords = known.knownWordsTable();
    res.json({
      success: 'success',
      totalWords: myWords.length,
      words: myWords,
    });
  });

  /*
   *   List Mining
   */

  /*
   *   Word Lookup
   */
  app.post('/lookupWord', async (req, res, next) => {
    const words = req.body.word;
    const list = req.body.list;
    if (!sentenceDB.loaded) {
      await sentenceDB.reloadSentences();
    }
    let sentences = sentenceDB.lookupWordFast(words, list);
    if (sentences.length == 0) {
      sentences = await sentenceDB.lookupWordSlow(words, list);
    }
    res.json(sentences);
  });
}
