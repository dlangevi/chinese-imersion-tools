import fs from 'fs';
import config from './config.js';

const frequencyData = JSON.parse(fs.readFileSync(
    config.frequencyData + 'Combined.json', 'UTF-8', 'r'));

const counts = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

Object.entries(frequencyData).forEach(([word, rank]) => {
  const ranking = convertRankingNum(word);
  counts[ranking] += 1;
});


function convertRankingNum(word) {
  const rank = frequencyData[word];
  if (rank == undefined) {
    return 0;
  } else if (rank < 1500) {
    return 5;
  } else if (rank < 5000) {
    return 4;
  } else if (rank < 15000) {
    return 3;
  } else if (rank < 30000) {
    return 2;
  } else if (rank < 60000) {
    return 1;
  } else {
    return 0;
  }
}

export function frequency(word) {
  const rank = frequencyData[word];
  if (rank == undefined) {
    return 'none';
  } else if (rank < 1500) {
    return '★★★★★';
  } else if (rank < 5000) {
    return '★★★★';
  } else if (rank < 15000) {
    return '★★★';
  } else if (rank < 30000) {
    return '★★';
  } else if (rank < 60000) {
    return '★';
  } else {
    return 'none';
  }
}

export function frequencyStats(knownWords) {
  const knownCounts = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  Object.entries(knownWords).forEach(([word, known]) => {
    const ranking = convertRankingNum(word);
    knownCounts[ranking] += 1;
  });

  return {
    counts: counts,
    knownCounts: knownCounts,
  };
}

const wordStats = {
  frequency: frequency,
  frequencyStats: frequencyStats,
};
export default wordStats;
