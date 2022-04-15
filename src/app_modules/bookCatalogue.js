import fs from 'fs';
import config from './config.js';
import {loadDocument} from './documentStats.js';

function loadBooks() {
  const allBooks = JSON.parse(fs.readFileSync(config.catalogue, 'UTF-8', 'r'));
  const ourBooks = {};
  const filter = [
    '张天翼 - 秃秃大王',
    '张天翼 - 大林和小林',
    '余华 - 活着',
  ];
  filter.forEach((book) => {
    ourBooks[book] = allBooks[book];
  });
  //return ourBooks;

  return allBooks;
}

const listsFile = config.catalogue + '.lists';
if (!fs.existsSync(listsFile)) {
  fs.writeFileSync(listsFile, '{}');
}
const lists = JSON.parse(fs.readFileSync(listsFile, 'UTF-8', 'r'));

const bookCatalogue = {
  listBooks: () => {
    const books = loadBooks();
    return Object.keys(books);
  },
  // This toggles whether we use CTA or Jieba rigth now
  // getPath: (bookName) => loadBooks()[bookName].segmentedText,
  getPath: (bookName) => loadBooks()[bookName].outputTxt,
  allBookData: () => {},
  loadList: (listname) => {
    if (listname == 'all' || listname == undefined) {
      const books = loadBooks();
      return Object.keys(books);
    }
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
      res.json(bookCatalogue.loadList(listName));
    });

    // Load Favorites
    app.get('/favfilelist', (req, res, next) => {
      res.json(bookCatalogue.loadList('favorites'));
    });

    // Library
    app.get('/filelistdata', async (req, res, next) => {
      const books = loadBooks();
      const bookData = await Promise.all(Object.values(books).map(async (book) => {
        const document = await loadDocument(book
            .segmentedText);
        const stats = document.documentStats();
        return {
          author: book.author,
          title: book.title,
          words: stats.totalWords,
          percent: stats.currentKnown.toFixed(2),
        };
      }));
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

    app.post('/deletelist', (req, res) => {
      const listname = req.body.title;
      bookCatalogue.deleteList(listname);
    });

    app.post('/loadlist', async (req, res, next) => {
      const listname = req.body.title;
      const books = loadBooks();

      const ourBooks = bookCatalogue.loadList(listname);
      const listcts = await Promise.all(ourBooks.map(async (bookKey) => {
        const book = books[bookKey];
        // const document = await loadDocument(book.segmentedText);
        const document = await loadDocument(book.outputTxt);
        const stats = document.documentStats();
        return {
          author: book.author,
          title: book.title,
          words: stats.totalWords,
          percent: stats.currentKnown.toFixed(2),
          percentChars: stats.currentKnownChar.toFixed(2),
        };
      }));
      res.json(listcts);
    });
  },
};
export default bookCatalogue;
