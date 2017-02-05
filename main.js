import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import i18n from 'i18n-2';
import mongoose from 'mongoose';

import middleware from './src/middleware';
import routes from './src/routes';

const MONGODB_URI = 'mongodb://heroku_5m8jj5r8:9a3nt7d80tkjpvi9do8v9scht7@ds143539.mlab.com:43539/heroku_5m8jj5r8';
mongoose.connect(MONGODB_URI);

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
    secret: '35on0y46zgowc',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: null
    }
}));

app.use('/dist', express.static(`${__dirname}/dist`));
app.use('/views/partials', express.static(`${__dirname}/views/partials`));
app.use('/data', express.static(`${__dirname}/data`));
app.use('/node_modules', express.static(`${__dirname}/node_modules`));
app.use('/fonts', express.static(`${__dirname}/fonts`));
app.use('/css', express.static(`${__dirname}/css`));
app.use('/img', express.static(`${__dirname}/img`));
app.use('/js', express.static(`${__dirname}/js`));

i18n.expressBind(app, {
    locales: ['en', 'bg'],
    cookieName: 'cutlistlang'
});

app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');

var wrap = fn => (...args) => fn(...args).catch(args[2]);

app.get('/', middleware.setLanguage, wrap(routes.root));
app.post('/lang', wrap(routes.lang));
app.post('/cutlist', wrap(routes.cutlist));
app.post('/check-finished/:key', wrap(routes.checkFinished));
app.post('/login', wrap(routes.login));
app.get('/robots.txt', wrap(routes.robots));
app.use(routes.error);

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
