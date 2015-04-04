var path = require('path');

var express = require('express');
var jade = require('jade');
var i18n = require('i18n');
var bodyParser = require('body-parser');

var middleware = require('./src/middleware');

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

var port = process.env.PORT || 31314;

console.log(`Server listening on ${port}.`);
app.listen(port);
