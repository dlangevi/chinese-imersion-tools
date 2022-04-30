import mongoose from 'mongoose';
import {Book} from './schemas.js';

// The data base will have functions that interact with the backend. Only will
// handle saving and loading data
class Database {
  disableDatabase = false;
  constructor() {
    const url = 'mongodb://127.0.0.1:27017/chinese';
    mongoose.connect(url);
    this.db = mongoose.connection;
  }

  close() {
    mongoose.connection.close(function() {
    });
  }

  async getBookData(filename) {
    if (this.disableDatabase) {
      return [];
    }
    return await Book.find({filename: filename},
        '-segTextSource').exec();
  }

  saveBook(filename, book) {
    if (this.disableDatabase) {
      return;
    }
    const databaseBook = new Book();
    databaseBook.filename = filename;
    databaseBook.wordTable = book.wordTable;
    databaseBook.charTable = book.charTable;
    databaseBook.totalWords = book.totalWords;
    databaseBook.totalCharacters = book.totalCharacters;
    // todo, sometime segTextSource gets too big
    databaseBook.segTextSource = book.segTextSource;
    databaseBook.save((err) => {
      if (err) {
        console.log(book.segText.length);
        console.log(filename);
        // console.log(err);
      }
    });
  }

  async getBookText(filename) {
    return await Book.find({filename: filename}).exec();
  }
}

const database = new Database();
export {database};