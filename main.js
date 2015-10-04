var path = require('path');

var express = require('express');
var jade = require('jade');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var I18n = require('i18n-2');

var middleware = require('./src/middleware');

var Item = require('./src/item');
var Solver = require('./src/solver').Solver;

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use('/dist', express.static(`${__dirname}/dist`));

I18n.expressBind(app, {
    locales: ['en', 'bg'],
    cookieName: 'cutlistlang'
});

app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');

app.get('/', middleware.setLanguage, (req, res) => {
    res.render('main.jade');
});

app.post('/lang', (req, res) => {
    res.cookie('cutlistlang', req.body.lang);
    res.status(200).end();
});

app.post('/cutlist', (req, res) => {
    // TODO: cut type

    var stocks = req.body.slates;
    var parts = req.body.parts;
    var items = [];

    // TODO: many stock sheets
    var solver = new Solver(parseInt(stocks[0].w), parseInt(stocks[0].h));
    parts.forEach(item => {
        if (item.ref) { // TODO: better way to filter unwanted items
            items.push(new Item(item.ref, parseInt(item.w), parseInt(item.h), item.canRotate, parseInt(item.q)));
        }
    });

    res.json(solver.solveNew(items));
});

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
