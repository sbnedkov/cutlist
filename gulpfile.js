var fork = require('child_process').fork;

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var nodemon = require('gulp-nodemon');
var babelify = require('babelify');
//var babel = require('gulp-babel');
//var sourcemaps = require('gulp-sourcemaps');

gulp.task('browserify', function () {
    return browserify({
        entries: [
            './public/cutlist.js',
            './public/editable-select.js',
            './public/editable-input.js',
            './public/editable-toggle.js'
        ],
        debug: true
    }).transform(babelify)
        .bundle()
        .pipe(source('./public/cutlist.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dev', ['browserify'], function () {
    return nodemon({exec: '/usr/bin/node main.js', ext: 'js json', ignore: ['*.swp', '*~', '.git/', 'dist/', 'node_modules/', 'tmp-test/'], env: {'NODE_ENV': 'local'}/*, verbose: true*/}).on('restart', function () {
        console.log('restart');
        gulp.run('browserify');
    });
});

gulp.task('prod', ['node']);

gulp.task('node', ['browserify'], function () {
    var server = fork('./main.js', {
        env: {
            NODE_ENV: 'production'
        }
    });

    server.on('data', function (data) {
          process.stdout.write(data.toString());
    });

    server.on('close', function (code) {
          console.log('server process exited with code ' + code);
    });

    return server;
});
