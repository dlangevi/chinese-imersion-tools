import known from './knownWords.js';
import sentenceDB from './sentenceDB.js';
import bookCatalogue from './bookCatalogue.js';
import {loadDocument} from './documentStats.js';


function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader;
  if (token == null) return res.sendStatus(401);
  req.user = token;
  next();
}

export function registerRequests(app) {
  /*
   *   Top Nav
   */
  app.get('/saveWordlist', authenticateUser, async (req, res) => {
    // todo, do a callback promise or smth
    const err = await known.saveWords(req.user);
    console.log('Saved wordlist');
    res.json({
      success: err,
      totalWords: known.knownWords(),
    });
  });


  /*
   *   Dashboard
   */
  app.get('/stats', authenticateUser, (req, res) => {
    console.log(req.user);
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
  app.get('/listlist', authenticateUser, (_, res) => {
    res.json(Object.keys(bookCatalogue.allLists()));
  });
  /*
   *   List Manager
   */
  app.post('/filelist', authenticateUser, (req, res) => {
    const listName = req.body.list;
    res.json(bookCatalogue.loadList(listName));
  });

  app.post('/savelist', authenticateUser, (req, res) => {
    const listname = req.body.title;
    const books = req.body.books;
    bookCatalogue.saveList(listname, books);
    res.json({success: 'success'});
  });

  app.post('/deletelist', authenticateUser, (req, res) => {
    const listname = req.body.title;
    bookCatalogue.deleteList(listname);
    res.json({success: 'success'});
  });

  app.post('/loadlist', authenticateUser, async (req, res) => {
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
        wordsTo86: document.wordsToTarget(86),
        wordsTo90: document.wordsToTarget(90),
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
  app.post('/addWords', authenticateUser, (req, res) => {
    const words = req.body.words;
    Object.entries(words).forEach(([word, interval]) => {
      known.addWord(word, interval);
    });
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
  app.post('/lookupWord', authenticateUser, async (req, res) => {
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
