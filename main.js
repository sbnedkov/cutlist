var path = require('path');

var express = require('express');
var jade = require('jade');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', (req, res) => {
    res.render('main.jade', {
        val: [1, 2, 3].map(() => 'Test').join(', ')
    });
});

var port = process.env.PORT || 31314;

console.log('Server listening on ' + port + '.');
app.listen(port);
