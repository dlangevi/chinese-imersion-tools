const fs = require('fs');
const config = JSON.parse(fs.readFileSync("../config.json", "UTF-8", "r"))
const documentStats = require("./documentStats.js")

function loadBooks() {

  var books = JSON.parse(fs.readFileSync(config.catalogue, "UTF-8", "r"))
  return books

}

const listsFile = config.catalogue + ".lists"
if (!fs.existsSync(listsFile)) {
  fs.writeFileSync(listsFile, "{}");
}
var lists = JSON.parse(fs.readFileSync(listsFile, "UTF-8", "r"))

function listCustomList(listName) {
  books = loadBooks()
  list = lists[listName]
  console.log(list)
  return Object.keys(books).filter(title => {
    return list.includes(title)
  });
}

module.exports = {
  listBooks: () => {
    books = loadBooks()
    return Object.keys(books)
  },
  getPath: bookName => books[bookName].segmentedText,
  listCustomList: listCustomList,
  listFavorites: () => {
    return listCustomList('favorites')
  },
  allBookData: () => {
    books = loadBooks()
    return Object.values(books).map(book => {
      var document = new documentStats.Document(book.segmentedText);
      var stats = document.documentStats()
      return {
        author: book.author,
        title: book.title,
        words: stats.totalWords,
        percent: stats.currentKnown.toFixed(2)
      }
    });
  },
  loadList: (listname) => {
    books = loadBooks()
    var ourBooks = listCustomList(listname)
    return ourBooks.map(bookKey => {
      var book = books[bookKey]
      var document = new documentStats.Document(book.segmentedText);
      var stats = document.documentStats()
      return {
        author: book.author,
        title: book.title,
        words: stats.totalWords,
        percent: stats.currentKnown.toFixed(2)
      }
    });
  },
  saveList: (listname, data) => {
    lists[listname] = data;
    fs.writeFileSync(listsFile, JSON.stringify(lists));
  },
  deleteList: (listname) => {
    delete lists[listname];
    fs.writeFileSync(listsFile, JSON.stringify(lists));
  },
  listList: () => {
    return Object.keys(lists);
  }

}
