import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import I18n from 'i18n-2';
import solve from 'guillotine-solver';

import middleware from './src/middleware';
import translate from './src/adapter';

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
    var itemsw = [];
    var itemsh = [];
    var demands = [];
    var names = [];

    // TODO: many stock sheets
    parts.forEach(item => {
        if (item.ref && item.q) { // TODO: better way to filter unwanted items
            itemsw.push(item.w);
            itemsh.push(item.h);
            demands.push(item.q);
            names.push(item.ref);
            // item.ref
            // item.canRotate
        }
    });

    var result = solve([stocks[0].w], [stocks[0].h], itemsw, itemsh, demands);  // TODO: w is l which is h, confusing, fix

//    console.log(result);

    res.json(translate(result, names));
});

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
