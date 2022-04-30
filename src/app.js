import express from 'express';
import bodyParser from 'body-parser';

import documentProcessor from './server/documentProcessor.js';
import {register} from './server/importFromAnki.js';
import {registerRequests} from './server/requests.js';

// Init App
const app = express();

app.use(express.static('dist/'));
app.use(express.static('node_modules/ag-grid-community/dist/'));

app.use(bodyParser.json());

registerRequests(app);

// Sentence Mining Calls
register(app);

documentProcessor.register(app);


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
