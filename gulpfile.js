var spawn = require('child_process').spawn;

var gulp = require("gulp");
var source = require('vinyl-source-stream');
var browserify = require("browserify");
var nodemon = require('gulp-nodemon');

gulp.task('browserify', function () {
    return browserify({
        entries: './public/cutlist.js',
        debug: true
    }).bundle()
        .pipe(source('./public/cutlist.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dev', function () {
    nodemon({exec: 'babel-node', ext: 'js json', ignore: ['dist/'], env: {'NODE_ENV': 'development'}}).on('restart', function () {
        // nothing for now
    });
});

gulp.task('prod', ['babel-node']);

gulp.task('babel-node', ['browserify'], function () {
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
