import catalogue from './bookCatalogue.js';
import {MultiDocumentProcessor} from './documentProcessor.js';

/*
 *
 *
 */
export class SentenceDB {
  constructor() {
    this.books = catalogue.listBooks();
  }

  async reloadSentences() {
    const start = Date.now();
    this.sentences = {};
    this.documents = {};
    await Promise.all(this.books.map(async (book) => {
      const document = new MultiDocumentProcessor(book);
      await document.init();
      this.documents[book] = document;
      this.sentences[book] = {};
      const currentDict = this.sentences[book];
      const oneT = await document.candidateSentences(20);
      oneT.forEach((candidate) => {
        const word = candidate.word;
        if (!currentDict[word]) {
          currentDict[word] = [];
        }
        currentDict[word].push(candidate);
      });
    }));
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to load books`);
  }

  // todo, look up already known words somehow
  lookupWordFast(word, list) {
    list = catalogue.loadList(list);
    const start = Date.now();
    console.log(word);
    const targets = [];
    Object.entries(this.sentences).forEach(([bookName, book]) => {
      if (list.includes(bookName)) {
        Object.entries(book).forEach(([entry, sentences]) => {
          if (entry == word) {
            sentences.forEach((sentence) => {
              targets.push(sentence);
            });
          }
        });
      }
    });
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to lookup`);
    return targets;
  }

  // todo, look up already known words somehow
  async lookupWordSlow(word, list) {
    list = catalogue.loadList(list);
    const start = Date.now();
    console.log(word);
    const targets = [];
    await Promise.all(Object.entries(this.documents).map(async ([bookName, document]) => {
      if (list.includes(bookName)) {
        const sentences = await document.lookupSentences(word, 20);
        sentences.forEach((sentence) => {
          targets.push(sentence);
        });
      }
    }));
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to lookup`);
    return targets;
  }
}

const sentenceDB = new SentenceDB();
// if we dont await does the service come up faster?
sentenceDB.reloadSentences();
export default sentenceDB;
