var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var i18n = require('i18n-2');
var mongoose = require('mongoose');

var middleware = require('./src/middleware');
var routes = require('./src/routes');

const cert = {
    cert: fs.readFileSync(path.join(__dirname, 'crt', process.env.NODE_ENV, 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'crt', process.env.NODE_ENV, 'server.key'))
};

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI);

var app = express();

const isDev = process.env.NODE_ENV === 'dev';
const server = isDev ? https.createServer(cert, app) : http.createServer(app);

if (!isDev) {
    app.use((req, res, next) => {
        res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.headers.host}/`);
        }

        next();
    });
}

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
app.use('/views/dialogs', express.static(`${__dirname}/views/dialogs`));
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

// Certbot
app.get('/.well-known/acme-challenge/:id', wrap(async (req, res) => {
    res.write(req.params.id + '.TUnHNwa3rWgjWtaik-RTE82R5yXjE0N3Gc8iC7sD4vE');
    res.end();
}));

app.get('/', middleware.setLanguage, wrap(routes.root));
app.post('/lang', wrap(routes.lang));
app.post('/cutlist', wrap(routes.cutlist));
app.post('/check-finished/:key', wrap(routes.checkFinished));
app.post('/login', wrap(routes.login));
app.post('/plans', wrap(routes.postPlans));
app.get('/plans/:id', wrap(routes.getPlan));
app.patch('/plans/:id', wrap(routes.patchPlan));
app.delete('/plans/:id', wrap(routes.deletePlan));
app.post('/results', wrap(routes.postResults));
app.get('/results/:id', wrap(routes.getResult));
app.patch('/results/:id', wrap(routes.patchResult));
app.delete('/results/:id', wrap(routes.deleteResult));
app.get('/projects', wrap(routes.getProjects));
app.post('/projects', wrap(routes.postProjects));
app.delete('/projects/:id', wrap(routes.deleteProject));
app.get('/robots.txt', wrap(routes.robots));
app.use(routes.error);

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
server.listen(port);
