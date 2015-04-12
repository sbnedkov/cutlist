var path = require('path');

var express = require('express');
var jade = require('jade');
var i18n = require('i18n');
var bodyParser = require('body-parser');

var middleware = require('./src/middleware');
var guillotine = require('./src/guillotine');
var Rectangle = guillotine.Rectangle;
var Slate = guillotine.Slate;
var Part = guillotine.Part;

i18n.configure({
    locales: ['en', 'bg'],
    directory: __dirname + '/locales'
});

var app = express();
global.lang = 'en';

app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use('/dist', express.static(`${__dirname}/dist`));

app.use(i18n.init);

app.get('/', middleware.setLanguage, (req, res) => {
    res.render('main.jade');
});

app.post('/lang', (req, res) => {
    global.lang = req.body.lang;
    res.status(200).end();
});

app.post('/cutlist', (req, res) => {
    var slate = new Slate(new Rectangle(0, 0, req.body.slate.w, req.body.slate.h));
    var parts = [];
    req.body.parts.forEach((part) => {
        if (part.w && part.h) {
            parts.push(new Part(part.w, part.h));
        }
    });

    res.json(guillotine.apply(slate, parts));
});

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
