import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import authorization from 'express-openid-connect';
const {auth} = authorization;
import {connectDB} from './server/database.js';
import documentProcessor from './server/documentProcessor.js';
import {registerRequests} from './server/requests.js';

connectDB( 'mongodb://127.0.0.1:27017/chinese' );
// Init App
const app = express();


app.set('views', 'src/pug/pages');
app.set('view engine', 'pug');
app.use(express.static('dist/'));
app.use(express.static('node_modules/ag-grid-community/dist/'));

app.use(
    auth({
      issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
      baseURL: process.env.BASE_URL,
      clientID: process.env.AUTH0_CLIENT_ID,
      secret: process.env.SESSION_SECRET,
      authRequired: true,
      auth0Logout: true,
    }),
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.oidc.isAuthenticated();
  if (res.locals.isAuthenticated) {
    res.locals.user = req.oidc.user.nickname;
  }
  next();
});


app.use(bodyParser.json());

registerRequests(app);

// Sentence Mining Calls
documentProcessor.register(app);


/**
 * Routes
 */

// > Home

app.get('/', (req, res) => {
  res.render('index', {activeRoute: req.originalUrl});
});

app.get('/index', (req, res) => {
  res.render('index', {activeRoute: req.originalUrl});
});

app.get('/bookwords', (req, res) => {
  res.render('bookwords', {activeRoute: req.originalUrl});
});

app.get('/library', (req, res) => {
  res.render('library', {activeRoute: req.originalUrl});
});

app.get('/listManager', (req, res) => {
  res.render('listManager', {activeRoute: req.originalUrl});
});

app.get('/mining', (req, res) => {
  res.render('mining', {activeRoute: req.originalUrl});
});

app.get('/wordLookup', (req, res) => {
  res.render('wordLookup', {activeRoute: req.originalUrl});
});

app.get('/cardCreation', (req, res) => {
  res.render('cardCreation', {activeRoute: req.originalUrl});
});

app.get('/sign-up', (req, res) => {
  res.oidc.login({
    authorizationParams: {
      screen_hint: 'signup',
    },
  });
});

app.listen(process.env.PROCESS_PORT, () => {
  console.log(`Server started on port ${process.env.PROCESS_PORT}`);
});
