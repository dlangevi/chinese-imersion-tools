const express = require('express');
const path = require('path');
const catalogue = require("./app_modules/bookCatalogue.js")
const bodyParser = require('body-parser')

// Init App
const app = express();

app.use(express.static('dist/'))
app.use(bodyParser.json())

// Load View Engine
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'pug');

// Home Route
app.get('/', (req, res) => {
  res.render('index');
});

// Add Route
app.get('/library', (req, res) => {
  res.render('library');
});

// Add Route
app.get('/booklists', (req, res) => {
  res.render('booklists');
});

// Add Route
app.get('/stats', (req, res) => {
  res.render('stats');
});

app.get("/filelistdata", (req, res, next) => {
  var jsonFiles = catalogue.allBookData()
  res.json(jsonFiles);
});

app.get("/listlist", (req, res, next) => {
  var jsonFiles = catalogue.listList()
  res.json(jsonFiles);
});

app.post("/loadlist", (req, res, next) => {
  var jsonFiles = catalogue.loadList(req.body.title)
  res.json(jsonFiles);
});

app.listen(3000, () => {
  console.log('Server started on port 3000')
});
