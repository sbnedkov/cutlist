var path = require('path');

var express = require('express');
var jade = require('jade');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var I18n = require('i18n-2');

var middleware = require('./src/middleware');
var Guillotine = require('./src/guillotine');
var common = require('./src/common');

var Rectangle = common.Rectangle;
var Slate = common.Slate;
var Part = common.Part;

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
    var slate = new Slate(new Rectangle(0, 0, parseInt(req.body.slate.w), parseInt(req.body.slate.h)));
    var parts = [];
    req.body.parts.forEach((part) => {
        if (part.w && part.h) {
            parts.push(new Part(part.name, parseInt(part.w), parseInt(part.h), Boolean(part.canRotate)));
        }
    });

    var guillotine = new Guillotine(req.body.cutType);
    res.json(guillotine.apply(slate, parts));
});

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
