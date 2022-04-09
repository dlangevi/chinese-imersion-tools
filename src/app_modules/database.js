import fs from 'fs';
import sqlite3 from '@vscode/sqlite3';
import catalogue from './bookCatalogue.js';
import {open} from 'sqlite';
import known from './knownWords.js';
import wordStats from './wordStats.js';


// The data base will have functions that interact with the backend. Only will
// handle saving and loading data
class Database {
  constructor() {
  }

  async load() {
    const start = Date.now();
    this.db = await open({
      // filename: ':memory:',
      filename: 'theData',
      driver: sqlite3.Database,
    });
    const end = Date.now();
    console.log(`${(end - start) / 1000} seconds to load sqlite`);
  }

  async createTables() {
    // await this.db.exec('CREATE TABLE books (title TEXT) (info TEXT)');
    await this.db.exec(`
CREATE TABLE IF NOT EXISTS books (
  title TEXT PRIMARY KEY, 
  info TEXT
)`);
  }

  async insertBook(filename, bookname) {
    const hasBook = await this.hasBook(bookname);

    if (!hasBook) {
      const segTextSource = fs.readFileSync(filename, 'UTF-8', 'r');
      const result = await this.db.run(`
INSERT INTO books (title, info)
VALUES (?, ?)
`,
      bookname,
      segTextSource,
      );
    }
  }

  async loadBook(bookname) {
    const result = await this.db.get('SELECT info FROM books WHERE title = ?', bookname);
    return result.info
  }

  async hasBook(bookname) {
    const result = await this.db.get('SELECT title FROM books WHERE title = ?', bookname);
    return !(result == undefined);
  }

  closeDB() {
    this.db.close();
  }
}

const db = new Database();

const start = Date.now();
await db.load();
await db.createTables();
const books = catalogue.listBooks();
await Promise.all(books.map(async (bookname) => {
  const filename = catalogue.getPath(bookname);
  await db.insertBook(filename, bookname);
}));
// db.closeDB();

const end = Date.now();
console.log(`${(end - start) / 1000} seconds to run operation`);



const documents = {};
export async function loadDocument(filename, bookname) {
  
  // const filename = catalogue.getPath(bookname);
  if (!documents[filename]) {

    const segText = await db.loadBook(bookname);
    const doc = new Document(segText);
    documents[filename] = doc;
  }
  const loadedDoc = documents[filename];
  loadedDoc.generateStats();

  return loadedDoc;
}
