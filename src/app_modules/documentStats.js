import fs from 'fs';
import known from './knownWords.js';
import wordStats from './wordStats.js';


import mongoose from 'mongoose';
const url = 'mongodb://127.0.0.1:27017/chinese';
mongoose.connect(url);
const db = mongoose.connection;

const bookSchema = mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  wordTable: {
    type: Map,
    of: Number, // occurances
    required: true,
  },
  charTable: {
    type: Map,
    of: Number, // occurances
    required: true,
  },
  totalWords: {
    type: Number,
    required: true,
  },
  totalCharacters: {
    type: Number,
    required: true,
  },
  /* segText: {
    type: Array,
    of: Array,
    required: true,
  }*/
  segTextSource: {
    type: String,
    required: true,
  },
});

const Book = mongoose.model('book', bookSchema);

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

  constructor(filename, title) {
    this.#filename = filename;
  }

  async load(title) {
    this.title = title;
    const cachedFileData = this.#filename + '.cached';

    const bookValue = await Book.find({filename: this.#filename},
        '-segTextSource').exec();

    if (bookValue.length > 1) {
      console.log(`duplicate books for ${filename}`);
    }

    if (bookValue.length > 0) {
      const book = bookValue[0];
      this.wordTable = Object.fromEntries(book.wordTable);
      this.charTable = Object.fromEntries(book.charTable);
      this.totalWords = book.totalWords;
      this.totalCharacters = book.totalCharacters;


    /* } else if (fs.existsSync(cachedFileData)) {
      const cachedData = JSON.parse(fs.readFileSync(cachedFileData, 'UTF-8',
          'r'));
      [this.wordTable, this.charTable, this.totalWords] = cachedData;

      */
    } else {
      // This is the most computationally heavy block and also
      // is deterministic, so cache the results
      this.segTextSource = fs.readFileSync(
          this.#filename,
          'UTF-8', 'r');
      this.segText = JSON.parse(this.segTextSource);

      [
        this.wordTable,
        this.charTable,
        this.totalWords,
        this.totalCharacters,
      ] = this.#computeFrequencyData();

      const book = new Book();
      book.filename = this.#filename;
      book.wordTable = this.wordTable;
      book.charTable = this.charTable;
      book.totalWords = this.totalWords;
      book.totalCharacters = this.totalCharacters;
      book.segTextSource = this.segTextSource;
      // book.segText = this.segText;
      book.save((err) => {
        if (err) {
          console.log(this.segText.length);
          console.log(this.#filename);
          console.log(err);
        }
      });
    }
  };

  async #loadSegText() {
    const bookValue = await Book.find({filename: this.#filename}).exec();
    if (bookValue.length > 0) {
      const book = bookValue[0];
      this.segTextSource = book.segTextSource;
      this.segText = JSON.parse(this.segTextSource);
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
  }
}

const documents = {};
export async function loadDocument(filename, title) {
  if (!documents[filename]) {
    const doc = new Document(filename, title);
    documents[filename] = doc;
    await doc.load(title);
  }
  const loadedDoc = documents[filename];
  loadedDoc.generateStats();

  return loadedDoc;
}
