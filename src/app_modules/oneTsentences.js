import known from './knownWords.js';

function sentenceMostlyKnown(sentence, howKnown) {
  let unknown = 0;
  let unknownWord = '';
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
  let allKnown = true;
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
  return sentence.map(([word, type]) => word).join('');
}

function parseFile(document, howKnown) {
  const segText = document.text;

  const oneT = [];
  segText.forEach((sentence, index) => {
    const [isOneT, unknownWord] = sentenceMostlyKnown(sentence, howKnown);


    if (isOneT && !known.isKnown(unknownWord)) {
      let combinedSentence = toText(sentence);
      for (let i = index - 1; i >= Math.max(index - 6, 0); i--) {
        const isKnown = sentenceKnown(segText[i], unknownWord, howKnown);
        if (!isKnown) {
          break;
        }
        combinedSentence = toText(segText[i]) + combinedSentence;
      }
      for (let i = index + 1; i < Math.min(index + 6, segText
          .length); i++) {
        const isKnown = sentenceKnown(segText[i], unknownWord, howKnown);
        if (!isKnown) {
          break;
        }
        combinedSentence = combinedSentence + toText(segText[i]);
      }

      const stats = document.stats(unknownWord);

      oneT.push({
        word: unknownWord,
        occurances: stats.occurances,
        stars: stats.stars,
        position: (index / segText.length * 100).toFixed(2),
        sentence: combinedSentence,
      });
    }
  });

  const candidateWords = new Set([...oneT.map((entry) => entry.word)]);
  const stats = document.documentStats();

  return {
    rowData: oneT,
    words: candidateWords.length,
    ...stats,
  };
}

const oneTsentences = {
  parse: parseFile,
};
export default oneTsentences;
