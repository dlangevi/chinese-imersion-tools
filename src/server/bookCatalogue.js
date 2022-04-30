import fs from 'fs';
import config from './config.js';

function loadBooks() {
  const allBooks = JSON.parse(fs.readFileSync(config.catalogue, 'UTF-8', 'r'));
  const ourBooks = {};
  const filter = [
    '张天翼 - 秃秃大王',
    '张天翼 - 大林和小林',
    '莫晨欢 - 地球上线',
  ];
  filter.forEach((book) => {
    ourBooks[book] = allBooks[book];
  });
  // return ourBooks;

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
  allBooks: loadBooks,
  allLists: () => {
    return lists;
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
};
export default bookCatalogue;
