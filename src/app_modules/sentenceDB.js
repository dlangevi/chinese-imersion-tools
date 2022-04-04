import catalogue from './bookCatalogue.js';
import {MultiDocumentProcessor} from './documentProcessor.js';

/*
 *
 *
 */
export class SentenceDB {
  constructor() {
    const start = Date.now();
    this.books = catalogue.listBooks();
    this.reloadSentences();
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to load books`);
  }

  reloadSentences() {
    this.sentences = {};
    this.documents = {};
    this.books.forEach((book) => {
      const document = new MultiDocumentProcessor(book);
      this.documents[book] = document;
      this.sentences[book] = {};
      const currentDict = this.sentences[book];
      const oneT = document.candidateSentences(20);
      oneT.forEach((candidate) => {
        const word = candidate.word;
        if (!currentDict[word]) {
          currentDict[word] = [];
        }
        currentDict[word].push(candidate);
      });
    });
  }

  // todo, look up already known words somehow
  lookupWordFast(word) {
    const start = Date.now();
    console.log(word);
    const targets = [];
    Object.values(this.sentences).forEach((book) => {
      Object.entries(book).forEach(([entry, sentences]) => {
        if (entry == word) {
          sentences.forEach((sentence) => {
            targets.push(sentence);
          });
        }
      });
    });
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to lookup`);
    return targets;
  }

  // todo, look up already known words somehow
  lookupWordSlow(word) {
    const start = Date.now();
    console.log(word);
    const targets = [];
    Object.values(this.documents).forEach((document) => {
      const sentences = document.lookupSentences(word, 20);
      sentences.forEach((sentence) => {
        targets.push(sentence);
      });
    });
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to lookup`);
    return targets;
  }
}

const sentenceDB = new SentenceDB();
export default sentenceDB;
