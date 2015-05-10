var spawn = require('child_process').spawn;

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var nodemon = require('gulp-nodemon');
var babelify = require('babelify');
var babel = require('gulp-babel');
require("babel/polyfill");
var mocha = require('gulp-mocha');

gulp.task('babelify-test', function () {
    return gulp.src(['test/*.js', 'src/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('tmp-test/'));
});

gulp.task('test', ['babelify-test'], function () {
    return gulp.src('tmp-test/test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('browserify', function () {
    return browserify({
        entries: './public/cutlist.js',
        debug: true
    }).transform(babelify)
        .bundle()
        .pipe(source('./public/cutlist.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dev', function () {
    return nodemon({tasks: ['browserify', 'test'], exec: './node_modules/.bin/babel-node main.js', ext: 'js json', ignore: ['*.swp', '*~', '.git/', 'dist/', 'node_modules/'], env: {'NODE_ENV': 'development'}, verbose: true}).on('restart', function () {
        console.log('restart');
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
