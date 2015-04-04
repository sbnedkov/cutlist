var spawn = require('child_process').spawn;

var gulp = require("gulp");
var nodemon = require('gulp-nodemon');

gulp.task('dev', function () {
    nodemon({exec: 'babel-node', ext: 'js', ignore: [], env: {'NODE_ENV': 'development'}}).on('restart', function () {
        // nothing for now
    });
});

gulp.task('babel-node', function () {
    var server = spawn('./node_modules/.bin/babel-node', ['main.js']);

    server.stdout.on('data', function (data) {
          process.stdout.write(data.toString());
    });

    server.stderr.on('data', function (data) {
          process.stderr.write(data.toString());
    });

    server.on('close', function (code) {
          console.log('server process exited with code ' + code);
    });

    return server;
});
