import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import i18n from 'i18n-2';
import solve from 'guillotine-solver';

import middleware from './src/middleware';
import translate from './src/adapter';

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());

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

app.get('/', middleware.setLanguage, (req, res) => {
    res.render('index.jade');
});

app.post('/lang', (req, res) => {
    res.cookie('cutlistlang', req.body.lang);
    res.status(200).end();
});

var cutlists = {};

app.post('/cutlist', (req, res) => {
    var stocks = req.body.slates;
    var parts = req.body.parts;
    var type = req.body.cutType;
    var itemsw = [];
    var itemsh = [];
    var demands = [];
    var names = [];
    var canRotate = [];

    parts.forEach(item => {
        if (item.ref && item.q) {
            itemsw.push(item.w);
            itemsh.push(item.h);
            demands.push(item.q);
            names.push(item.ref);
            canRotate.push(item.canRotate);
        }
    });

    var key = (Math.random() * 1e18).toString(36);

    res.send(key).end();

    solve(stocks.map(s => s.w), stocks.map(s => s.h), itemsw, itemsh, canRotate, demands, type, (_, result) => {
        cutlists[key] = translate(result, names, type);
    });
});

app.post('/check-finished/:key', (req, res) => {
    var result = cutlists[req.params.key];
    if (result) {
        delete cutlists[req.params.key];
        return res.json(result);
    }

    res.json(false);
});

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
