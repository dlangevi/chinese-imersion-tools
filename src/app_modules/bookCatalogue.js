import fs from 'fs';
import config from './config.js';
import {Document} from './documentStats.js';

function loadBooks() {
  return JSON.parse(fs.readFileSync(config.catalogue, 'UTF-8', 'r'));
}

const listsFile = config.catalogue + '.lists';
if (!fs.existsSync(listsFile)) {
  fs.writeFileSync(listsFile, '{}');
}
const lists = JSON.parse(fs.readFileSync(listsFile, 'UTF-8', 'r'));

function listCustomList(listName) {
  const books = loadBooks();
  const list = lists[listName];
  return Object.keys(books).filter((title) => {
    return list.includes(title);
  });
}

const bookCatalogue = {
  listBooks: () => {
    const books = loadBooks();
    return Object.keys(books);
  },
  getPath: (bookName) => loadBooks()[bookName].segmentedText,
  allBookData: () => {},
  loadList: (listname) => {
    return lists[listname];
  },
  saveList: (listname, data) => {
    lists[listname] = data;
    fs.writeFileSync(listsFile, JSON.stringify(lists));
  },
  deleteList: (listname) => {
    delete lists[listname];
    fs.writeFileSync(listsFile, JSON.stringify(lists));
  },
  register: (app) => {
    // Sentences
    app.post('/filelist', (req, res, next) => {
      const books = loadBooks();
      const listName = req.body.list;
      if (listName == 'all' || listName == undefined) {
        res.json(Object.keys(books));
      } else {
        const list = lists[listName];
        res.json(Object.keys(books).filter((title) => {
          return list.includes(title);
        }));
      }
    });

    // Load Favorites
    app.get('/favfilelist', (req, res, next) => {
      res.json(listCustomList('favorites'));
    });

    // Library
    app.get('/filelistdata', (req, res, next) => {
      const books = loadBooks();
      const bookData = Object.values(books).map((book) => {
        const document = new Document(book
            .segmentedText);
        const stats = document.documentStats();
        return {
          author: book.author,
          title: book.title,
          words: stats.totalWords,
          percent: stats.currentKnown.toFixed(2),
        };
      });
      res.json(bookData);
    });

    app.get('/listlist', (req, res, next) => {
      res.json(Object.keys(lists));
    });

    app.post('/savelist', (req, res) => {
      const listname = req.body.title;
      const books = req.body.books;
      bookCatalogue.saveList(listname, books);
      res.json({success: 'success'});
    });

    app.post('/loadlist', (req, res, next) => {
      const listname = req.body.title;
      const books = loadBooks();
      let ourBooks = Object.keys(books);
      if (listname !== 'all') {
        console.log('loading' + listname);
        ourBooks = listCustomList(listname);
      }
      const listcts = ourBooks.map((bookKey) => {
        const book = books[bookKey];
        const document = new Document(book
            .segmentedText);
        const stats = document.documentStats();
        return {
          author: book.author,
          title: book.title,
          words: stats.totalWords,
          percent: stats.currentKnown.toFixed(2),
        };
      });
      res.json(listcts);
    });
  },
};
export default bookCatalogue;
