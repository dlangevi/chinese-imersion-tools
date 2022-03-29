import fs from 'fs';
import config from "./config.js";
import { Document } from "./documentStats.js";

function loadBooks() {
  return JSON.parse(fs.readFileSync(config.catalogue, "UTF-8", "r"))
}

const listsFile = config.catalogue + ".lists"
if (!fs.existsSync(listsFile)) {
  fs.writeFileSync(listsFile, "{}");
}
var lists = JSON.parse(fs.readFileSync(listsFile, "UTF-8", "r"))

function listCustomList(listName) {
  let books = loadBooks()
  list = lists[listName]
  console.log(list)
  return Object.keys(books).filter(title => {
    return list.includes(title)
  });
}

const bookCatalogue = {
  listBooks: () => {
    let books = loadBooks()
    return Object.keys(books)
  },
  getPath: bookName => loadBooks()[bookName].segmentedText,
  listCustomList: listCustomList,
  allBookData: () => {},
  loadList: (listname) => {},
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
    app.get("/filelist", (req, res, next) => {
      let books = loadBooks()
      res.json(Object.keys(books));
    });

    // Load Favorites
    app.get("/favfilelist", (req, res, next) => {
      res.json(listCustomList('favorites'))
    });

    // Library
    app.get("/filelistdata", (req, res, next) => {
      let books = loadBooks()
      var bookData = Object.values(books).map(book => {
        var document = new Document(book
          .segmentedText);
        var stats = document.documentStats()
        return {
          author: book.author,
          title: book.title,
          words: stats.totalWords,
          percent: stats.currentKnown.toFixed(2)
        }
      });
      res.json(bookData);
    });

    app.get("/listlist", (req, res, next) => {
      res.json(Object.keys(lists));
    });

    app.post("/loadlist", (req, res, next) => {
      var listname = req.body.title;
      let books = loadBooks()
      var ourBooks = listCustomList(listname)
      var listcts = ourBooks.map(bookKey => {
        var book = books[bookKey]
        var document = new Document(book
          .segmentedText);
        var stats = document.documentStats()
        return {
          author: book.author,
          title: book.title,
          words: stats.totalWords,
          percent: stats.currentKnown.toFixed(2)
        }
      });
      res.json(listcts);
    });
  }
}
export default bookCatalogue
