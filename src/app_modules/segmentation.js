import nodejieba from 'nodejieba';
import Segment from 'novel-segment';
import fs from 'fs';
import books from './bookCatalogue.js';

// Here we will handle the segmentation of text. There will be two supported
// methods for now.
//
// 1) Read in json dumped results from CTA
// 2) Use nodejieba to directly read the text
//


function loadCTA(bookname) {
  const ctaPath = books.getPath(bookname);
  const ctaJson = fs.readFileSync(ctaPath, 'UTF-8', 'r');
  const json = JSON.parse(ctaJson);

  const output = [];
  for (let i = 0; i < json.length; i++) {
    const sentance = json[i];
    const last = sentance[sentance.length - 1][0];
    // Todo, maybe we want this
    if (false && last == '…') {
      const next = json[i+1];
      i = i+1;
      output.push(sentance.concat(next));
    } else {
      output.push(sentance);
    }
  }
  return output;
  // For now dont do anything, but we will want to change the id's later
  return ctaJson.map((sentence) => {
    return sentence.map(([word, id]) => {
      return [word, id];
    });
  });
}

function compareLoadTimes(txtPath) {
  const txt = fs.readFileSync(txtPath, 'UTF-8', 'r');
  let start = Date.now();
  nodejieba.tag(txt);
  let end = Date.now();
  console.log(`${(end - start) / 1000} seconds to tag`);
  start = Date.now();
  nodejieba.cut(txt);
  end = Date.now();
  console.log(`${(end - start) / 1000} seconds to cut`);
  start = Date.now();
  nodejieba.cut(txt, true);
  end = Date.now();
  console.log(`${(end - start) / 1000} seconds to cut true`);
}

const novelSegment = new Segment();
novelSegment.useDefault();

function loadJieba(txtPath) {
  const txt = fs.readFileSync(txtPath, 'UTF-8', 'r');
  // Misses names, but also makes less compound words
  // Haha, I see why they recommended the default. This still produces a
  // 'lower' accuracy than CTA, but it is not as bad as others
  // let json = []
  // const json = nodejieba.cut(txt);

  const json = [];
  const txtLines = txt.split('\n');
  txtLines.forEach((line) => {
    const split = nodejieba.cut(line);
    split.forEach((word) => json.push(word));
  });
  console.log(txtPath, ':', json.length);

  // Detects names better but makes stuff like 有庆死, 看凤霞
  // const json = nodejieba.cut(txt, true);

  // Creates weird words like 看家珍, 他们说
  // const json = nodejieba.cutHMM(txt);

  // Creates words like 两条腿
  // const json = nodejieba.cutAll(txt);

  // Doesn't get as many names still makes 两条腿
  // const json = nodejieba.cutForSearch(txt);

  // 9 years old with no maintainence, a little slow but alright
  // const json = segment.doSegment(txt, {simple: true});
  // const json = novelSegment.doSegment(txt, {simple: true});

  // Ok VERY SLOW, but also segments similar to cta (in terms of how much stuff
  // gets cut up)
  // const json = segment(txt);
  // const finalJson =  json.reduce((result, word, index) => {
  return json.reduce((result, word, index) => {
    let type = '';
    // const punc = /\p{Script_Extensions=Han}/u;
    // const punc = /\p{CJK_Symbols_and_Punctuation}/u;
    const punc = /\p{P}/u;
    if (punc.test(word)) {
      // punctuation
      type = 1;
    } else if (/\s+/.test(word)) {
      // whitespace
      type = 1;
    } else if (/\p{Script=Latin}+/u.test(word)) {
      // english
      type = 1;
    } else if (/\p{Script=Han}+/u.test(word)) {
      type = 3;
    } else {
      type = 1;
    }
    const end = result[result.length -1];
    if (word.length > 1 && word.includes('.') ) {
      // It sees 15. 14. etc as being words, so remove the . since it breaks db
      // storage
      word = word.replaceAll('.', '');
    }
    if (word == '\n') {
      if (end.length > 0) {
        result.push([]);
      }
    } else if (word == '？' | word == '！'| word == '。' |
      word == '…' | word == '.') {
      if (end.length == 0) {
        const previous = result[result.length -2];
        previous.push([word, type]);
      } else {
        end.push([word, type]);
        result.push([]);
      }
    } else if (word == ' ' || word == '　' || word == '\t') {
      // cta strips leading spaces
      if (end.length > 0) {
        end.push([word, type]);
      }
    } else if ((word == '”' | word == '‘' | word == '』') && end.length == 0) {
      // Closing quotes go onto previous
      const previous = result[result.length -2];
      previous.push([word, type]);
    } else {
      end.push([word, type]);
    }
    return result;
  }, [[]]);
}

function tostring(sentence) {
  return sentence.reduce((string, [word, type]) => {
    return string + word;
  }, '');
}

function stringify(sentence) {
  return sentence.reduce((string, [word, type]) => {
    return string + `[${word}, ${type}]`;
  }, '');
}


/* const TYPE = {
  NONE: 0, // None - Indicative of an error
  INVALID: 1, // Invalid - Invalid utf8 text
  CHINESE: 2, // Chinese - A word made up of Chinese text
  ALPHA: 3, // Alpha - A word made up of letters from the English alphabet
  NUMBER: 4, // Number - A word made up of Arabic numerals
  WHITESPACE: 5, // Whitespace - A block of whitespace
                 // (spaces, tabs, newlines etc).
  CHINESEPUNCTUATION: 6, // ChinesePunctuation - Chinese punctuation
  ASCIIPUNCTUATION: 7, // AsciiPunctuation - Standard ascii
                       // (English) punctuation.
};*/


function compareSentenceChunks(cta, jieba) {
  const minLen = Math.min(cta.length, jieba.length);
  console.log(`
  CTA generated sentences: ${cta.length}
  Jieba generated sentences: ${jieba.length}
`);

  let ctaIndex = 0;
  let jiebaIndex = 0;
  for (let i = 0; i < minLen; i++) {
    const sentanceA = tostring(cta[ctaIndex]);
    const sentanceB = tostring(jieba[jiebaIndex]);
    if (sentanceA !== sentanceB) {
      console.log(`
  Correct sentances: 
    ${i}
  Failed on
    CTA:   ${sentanceA} 
    Jieba: ${sentanceB}

    CTA: 
      i-1: ${stringify(cta[i-1])}
      i:   ${stringify(cta[i])}
      i+1: ${stringify(cta[i+1])}

    Jieba:
      i-1: ${stringify(jieba[i-1])}
      i:   ${stringify(jieba[i])}
      i+1: ${stringify(jieba[i+1])}
`);
      return;
      if (sentanceA.length > sentanceB.length) {
        jiebaIndex += 1;
      } else {
        ctaIndex += 1;
      }
    }
    jiebaIndex += 1;
    ctaIndex += 1;
  }
  console.log('scanned min and passed, this shouldnt be possible');
}

function compareWordChunks(a, b) {
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    const senA = a[i];
    const senB = b[i];
    const minSenLen = Math.min(senA.length, senB.length);
    let allMatch = true;
    for (let j = 0; j < minSenLen; j++) {
      if (senA[j][0] != senB[j][0]) {
        allMatch = false;
        console.log(senA[j][0], senB[j][0]);
        break;
      }
      if (senA[j][1] != senB[j][1]) {
        console.log(senA[j], senB[j]);
        allMatch = false;
        break;
      }
    }

    if (!allMatch) {
      console.log(`
  Failed on
    CTA:   ${tostring(senA)} 
    Jieba: ${tostring(senB)}
`);
    }
  }
}

const segmentation = {
  loadCTA: loadCTA,
  loadJieba: loadJieba,
  compareSentenceChunks: compareSentenceChunks,
  compareWordChunks: compareWordChunks,
  compareLoadTimes: compareLoadTimes,
};
export {segmentation};
