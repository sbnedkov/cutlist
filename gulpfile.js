var fork = require('child_process').fork;

var gulp = require('gulp');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var nodemon = require('gulp-nodemon');
var babelify = require('babelify');
//var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('browserify', gulp.series(function () {
    return browserify({
        entries: [
            './public/cutlist.js',
            './public/editable-select.js',
            './public/editable-input.js',
            './public/editable-toggle.js',
            './public/projects.js',
            './public/project.js'
        ],
        debug: true
    }).transform(babelify)
        .bundle()
        .pipe(source('./public/cutlist.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));
}));

gulp.task('dev', gulp.series(['browserify'], function () {
    return nodemon({exec: '/usr/bin/node main.js', ext: 'js json', ignore: ['*.swp', '*~', '.git/', 'dist/', 'node_modules/', 'tmp-test/'], env: {'NODE_ENV': 'dev'}, verbose: true, tasks: 'browserify'}).on('restart', function () {
        console.log('restart');
    });
}));

gulp.task('node', gulp.series(['browserify'], function () {
    var server = fork('./main.js', {
        env: {
            NODE_ENV: 'production',
            MONGODB_URI: process.env.MONGODB_URI,
            PORT: process.env.PORT
        }
    });

    server.on('data', function (data) {
          process.stdout.write(data.toString());
    });

    server.on('close', function (code) {
          console.log('server process exited with code ' + code);
    });

    return server;
}));

gulp.task('prod', gulp.series(['node']));
