import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
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
  segTextSource: {
    type: String,
    required: true,
  },
});

const Book = mongoose.model('book', bookSchema);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

});

export {Book};
