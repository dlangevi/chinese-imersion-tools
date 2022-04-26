import assert from 'assert';
import {toDateString} from '../knownWords.js';
import known from '../knownWords.js';

describe('Words', function() {
  describe('NumWords', function() {
    it('should return the number of words', function() {
      assert.equal(known.knownWords(), known.knownWords());
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
