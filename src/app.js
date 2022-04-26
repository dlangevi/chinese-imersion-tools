import express from 'express';
import bodyParser from 'body-parser';

import catalogue from './app_modules/bookCatalogue.js';
import documentProcessor from './app_modules/documentProcessor.js';
import {register} from './app_modules/importFromAnki.js';
import {registerRequests} from './app_modules/requests.js';

// Init App
const app = express();

app.use(express.static('dist/'));
app.use(express.static('node_modules/ag-grid-community/dist/'));

app.use(bodyParser.json());

registerRequests(app);

// Sentence Mining Calls
register(app);

// Book Library Calls
catalogue.register(app);

documentProcessor.register(app);


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
