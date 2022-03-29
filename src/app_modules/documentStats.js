import fs from 'fs';
import known from "./knownWords.js";
import wordStats from "./wordStats.js";
import config from "./config.js";

export class Document {
  #segText;
  constructor(filename) {
    this.filename = filename


    var cachedFileData = filename + ".cached"
    if (fs.existsSync(cachedFileData)) {
      var cachedData = JSON.parse(fs.readFileSync(cachedFileData, "UTF-8",
        "r"));
      [this.wordTable, this.charTable, this.totalWords] = cachedData;
    } else {
      // This is the most computationally heavy block and also 
      // is deterministic, so cache the results
      this.#loadSegText();
      var dataToCache = this.#computeFrequencyData();
      fs.writeFileSync(cachedFileData, JSON.stringify(dataToCache));
      [this.wordTable, this.charTable, this.totalWords] = dataToCache;
    }
    this.#generateStats();

    this.wellKnownWords = {}
    this.knownWords = {}
    this.unKnownWords = {}

    Object.entries(this.wordTable).forEach(([word, occurances]) => {
      if (known.isKnown(word)) {
        this.knownWords[word] = occurances
      } else {
        this.unKnownWords[word] = occurances
      }
    });
  };

  #loadSegText() {
    this.#segText = JSON.parse(fs.readFileSync(
      this.filename,
      "UTF-8", "r"));
  };

  #computeFrequencyData() {
    var wordTable = {}
    var charTable = {}
    var totalWords = 0
    this.#segText.forEach((sentence) => {
      sentence.forEach(([word, type]) => {
        if (type != 3) return;
        totalWords += 1
        if (word in wordTable) {
          wordTable[word] += 1
        } else {
          wordTable[word] = 1
        }
        Array.from(word).forEach(ch => {
          if (ch in charTable) {
            charTable[ch] += 1
          } else {
            charTable[ch] = 1
          }
        });
      });
    });

    return [wordTable, charTable, totalWords]
  }

  #generateStats() {
    this.totalKnownWords = 0
    this.totalWellKnownWords = 0
    Object.entries(this.wordTable).forEach(([word, frequency]) => {
      if (known.isKnown(word)) {
        this.totalKnownWords += frequency
        if (known.isKnown(word, 20)) {
          this.totalWellKnownWords += frequency
        }
      }
    })
  }

  get text() {
    if (this.#segText == undefined) {
      this.#loadSegText();
    }
    return this.#segText
  };

  inDocument(word) {
    return word in this.wordTable;
  }

  documentWords() {
    return Object.entries(this.wordTable).map(([word, occurances]) => {
      return {
        word: word,
        occurances: occurances,
        isKnown: known.isKnown(word),
        stars: wordStats.frequency(word),
      };
    });
  }

  documentChars() {
    return Object.entries(this.charTable).map(([ch, occurances]) => {
      return {
        word: ch,
        occurances: occurances,
        isKnown: known.isKnownChar(ch),
      }
    });
  }

  documentStats() {
    return {
      totalWords: this.totalWords,
      curentKnownWords: this.totalKnownWords,
      currentWellKnownWords: this.totalWellKnownWords,
      currentKnown: this.totalKnownWords / this.totalWords * 100,
      currentWellKnown: this.totalWellKnownWords / this.totalWords * 100
    }
  }

  stats(word) {
    var occurances = this.wordTable[word]
    return {
      occurances: occurances,
      percent: occurances / this.totalWords * 100,
      stars: wordStats.frequency(word),
    }

  }
}
