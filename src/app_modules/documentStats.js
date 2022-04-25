import fs from 'fs';
import known from './knownWords.js';
import wordStats from './wordStats.js';
import {database} from './database.js';
import {segmentation} from './segmentation.js';


/*
 * This class now just calculates the aggregate stats and list words for a piece
 * of text
 */
export class Document {
  #filename;

  // Aggregate Data
  wordTable;
  charTable;
  totalWords;
  totalKnownWords;
  totalWellKnownWords;
  segText;
  segTextSource;

  constructor(filename) {
    this.#filename = filename;
  }

  async load(title) {
    this.title = title;
    const bookValue = await database.getBookData(this.#filename);
    // const bookValue = [];

    if (bookValue.length > 1) {
      console.log(`duplicate books for ${this.#filename}`);
    }

    if (bookValue.length > 0) {
      const book = bookValue[0];
      this.wordTable = Object.fromEntries(book.wordTable);
      this.charTable = Object.fromEntries(book.charTable);
      this.totalWords = book.totalWords;
      this.totalCharacters = book.totalCharacters;
    } else {
      // This is the most computationally heavy block and also
      // is deterministic, so cache the results
      console.log(`${title}: Not in database`);
      this.segTextSource = fs.readFileSync(
          this.#filename,
          'UTF-8', 'r');
      if (this.#filename.endsWith('json')) {
        this.segText = JSON.parse(this.segTextSource);
      } else {
        this.segText = segmentation.loadJieba(this.#filename);
      }

      [
        this.wordTable,
        this.charTable,
        this.totalWords,
        this.totalCharacters,
      ] = this.#computeFrequencyData();

      database.saveBook(this.#filename, this);
    }
  };

  async #loadSegText() {
    const bookValue = await database.getBookText(this.#filename);
    if (bookValue.length > 0) {
      const book = bookValue[0];
      this.segTextSource = book.segTextSource;
      if (this.#filename.endsWith('json')) {
        this.segText = JSON.parse(this.segTextSource);
      } else {
        this.segText = segmentation.loadJieba(this.#filename);
      }
    }
  };

  #computeFrequencyData() {
    const wordTable = {};
    const charTable = {};
    let totalWords = 0;
    let totalCharacters = 0;
    this.segText.forEach((sentence) => {
      sentence.forEach(([word, type]) => {
        if (type != 3) return;
        totalWords += 1;
        totalCharacters += word.length;
        if (word in wordTable) {
          wordTable[word] += 1;
        } else {
          wordTable[word] = 1;
        }
        Array.from(word).forEach((ch) => {
          if (ch in charTable) {
            charTable[ch] += 1;
          } else {
            charTable[ch] = 1;
          }
        });
      });
    });

    return [wordTable, charTable, totalWords, totalCharacters];
  }

  generateStats() {
    this.totalKnownWords = 0;
    this.totalWellKnownWords = 0;
    this.totalKnownCharacters = 0;
    Object.entries(this.wordTable).forEach(([word, frequency]) => {
      if (known.isKnown(word)) {
        this.totalKnownWords += frequency;
        if (known.isKnown(word, 20)) {
          this.totalWellKnownWords += frequency;
        }
      }
    });
    Object.entries(this.charTable).forEach(([ch, frequency]) => {
      if (known.isKnownChar(ch)) {
        this.totalKnownCharacters += frequency;
      }
    });
  }

  async text() {
    if (this.segText == undefined) {
      await this.#loadSegText();
    }
    return this.segText;
  };

  get allStats() {
    return {wordTable: this.wordTable,
      charTable: this.charTable,
      totalWords: this.totalWords,
      totalKnownWords: this.totalKnownWords,
      totalWellKnownWords: this.totalWellKnownWords,
    };
  }

  inDocument(word) {
    return word in this.wordTable;
  }

  documentChars() {
    return Object.entries(this.charTable).map(([ch, occurances]) => {
      return {
        word: ch,
        occurances: occurances,
        isKnown: known.isKnownChar(ch),
      };
    });
  }

  documentStats() {
    return {
      totalWords: this.totalWords,
      curentKnownWords: this.totalKnownWords,
      currentWellKnownWords: this.totalWellKnownWords,
      currentKnown: this.totalKnownWords / this.totalWords * 100,
      currentWellKnown: this.totalWellKnownWords / this.totalWords * 100,
      currentKnownChar: this.totalKnownCharacters / this.totalCharacters * 100,
    };
  }

  wordStats(word) {
    const occurances = this.wordTable[word];
    return {
      occurances: occurances,
      percent: occurances / this.totalWords * 100,
      stars: wordStats.frequency(word),
    };
    Ligatures;
  }
}

const documents = {};
export async function loadDocument(filename, title) {
  console.log('loading ', filename, title);
  if (!documents[filename]) {
    const doc = new Document(filename, title);
    documents[filename] = doc;
    await doc.load(title);
  }
  const loadedDoc = documents[filename];
  loadedDoc.generateStats();

  return loadedDoc;
}
