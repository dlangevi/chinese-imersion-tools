import assert from 'assert';
import {toDateString} from '../knownWords.js';
import known from '../knownWords.js';
import mockDB from './mockDb.js';

before(async () => {
  await mockDB.connect();
});


describe('Words', function() {
  describe('NumWords', function() {
    it('should return the number of words', function() {
      assert.equal(known.knownWords(), known.knownWords());
    });
  });
});

describe('Database', function() {
  describe('LoadAndSave', function() {
    it('should save a basic word list and then load it', async function() {
      const words = {
        你好: {
          added: '2020-02-02',
          interval: 30,
        },
        朋友: {
          added: '2020-02-08',
          interval: 20,
        },
      };
      await known.saveWordsDB('testing', words);
      const loaded = await known.loadWords('testing');
      assert.deepEqual(words, loaded.words);
    });
  });
});

describe('Dates', function() {
  describe('Check date formatting', function() {
    it('should pad datestrings with 0s', function() {
      assert.equal(toDateString(new Date(2020, 1, 1 )), '2020-02-01');
    });
  });
});


after(async () => {
  await mockDB.close();
});
