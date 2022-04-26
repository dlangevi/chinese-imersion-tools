import known from './knownWords.js';
import sentenceDB from './sentenceDB.js';

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

  /*
   *   List Manager
   */

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
