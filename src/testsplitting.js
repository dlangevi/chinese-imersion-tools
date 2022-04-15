import {segmentation} from './app_modules/segmentation.js';
import {database} from './app_modules/database.js';
import books from './app_modules/bookCatalogue.js';

const bookname = "余华 - 活着"
const filename = books.getPath(bookname)

// Desired output ??
const transformedJieba = segmentation.loadJieba(filename, false);
 const transformedJieba2 = segmentation.loadJieba(filename);

// segmentation.compareSentenceChunks(transformedJieba, transformedJieba2);
segmentation.compareWordChunks(transformedJieba, transformedJieba2);

segmentation.compareLoadTimes(filename);

const letter = /\p{Script=Latin}/u;

console.log(letter.test('胡'))

database.close();
