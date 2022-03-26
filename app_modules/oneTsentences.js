const documentStats = require("./documentStats.js")
const known = require("./knownWords.js")

function sentenceMostlyKnown(sentence, howKnown) {

  var unknown = 0;
  var unknownWord = ""
  sentence.forEach(([word, type]) => {
    if (type != 3) return;

    if (!(known.isKnown(word, howKnown))) {
      unknown += 1;
      unknownWord = word;
    }
  });

  return [unknown == 1, unknownWord];

}


function sentenceKnown(sentence, exception, howKnown) {
  var allKnown = true;
  sentence.forEach(([word, type]) => {
    if (type != 3) return;
    if (word == exception) return;
    if (!(known.isKnown(word, howKnown))) {
      allKnown = false;
    }
  });
  return allKnown;
}

function toText(sentence) {
  return sentence.map(([word, type]) => word).join("");
}

function parseFile(document, howKnown) {
  var segText = document.text

  var oneT = []
  segText.forEach((sentence, index) => {
    var [isOneT, unknownWord] = sentenceMostlyKnown(sentence, howKnown);


    if (isOneT && !known.isKnown(unknownWord)) {
      var combinedSentence = toText(sentence)
      for (var i = index - 1; i >= Math.max(index - 6, 0); i--) {
        var isKnown = sentenceKnown(segText[i], unknownWord, howKnown)
        if (!isKnown) {
          break;
        }
        combinedSentence = toText(segText[i]) + combinedSentence
      }
      for (var i = index + 1; i < Math.min(index + 6, segText
          .length); i++) {
        var isKnown = sentenceKnown(segText[i], unknownWord, howKnown)
        if (!isKnown) {
          break;
        }
        combinedSentence = combinedSentence + toText(segText[i])
      }

      var stats = document.stats(unknownWord)

      oneT.push({
        word: unknownWord,
        occurances: stats.occurances,
        stars: stats.stars,
        position: (index / segText.length * 100).toFixed(2),
        sentence: combinedSentence
      });
    }
  });

  var candidateWords = new Set([...oneT.map((entry) => entry.word)])
  var stats = document.documentStats()

  return {
    rowData: oneT,
    words: candidateWords.length,
    ...stats
  }

}

module.exports = {
  parse: parseFile,
}
