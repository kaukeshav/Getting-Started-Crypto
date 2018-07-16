var gulp = require('gulp');
var htmlv = require('gulp-w3c-html-validation');
var del = require('del');
var server = require('gulp-express');
var runSequence = require('run-sequence');
var wcagAccess = require('gulp-wcag-accessibility');
var csslint = require('gulp-csslint');
var jshint = require('gulp-jshint');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var scss = require('gulp-sass');


// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

var src = './app/';
var dest = './dist/';

gulp.task('validate-html', function () {
    gulp.src([src + '*.html',src + '*.htm'])
        .pipe(htmlv({doctype: 'HTML5',charset: 'utf-8'}))
});

gulp.task('clean', function() {
    return del([dest]);
});

gulp.task('copy-img', function(){
    return gulp.src([src + '**/*.png', src + '**/*.jpg', src + '**/*.gif', src + '**/*.svg'])
        .pipe(gulp.dest(dest));
});
gulp.task('copy-data', function(){
    return gulp.src([src + 'data/*.*'])
        .pipe(gulp.dest(dest + 'data'));
});

gulp.task('copy-css',function() {
    return gulp.src([src + '**/*.css'])
        .pipe(gulp.dest(dest));
});

gulp.task('copy-js',function() {
    return gulp.src([src + '**/*.js'])
        .pipe(gulp.dest(dest));
});

gulp.task('copy-fonts', function(){
    return gulp.src([src + 'fonts/**/*.otf', src + 'fonts/**/*.ttf', src + 'fonts/**/*.eot', src + 'fonts/**/*.svg', src + 'fonts/**/*.woff', src + 'fonts/**/*.woff2'])
        .pipe(gulp.dest(dest +'fonts'));
});

gulp.task('copy-html', function() {
    return gulp.src([src + '*.html', src + '*.htm'])
        .pipe(gulp.dest(dest));
});

gulp.task('copy-all-assets', function() {
    return runSequence(['copy-img', 'copy-css' , 'copy-js' , 'copy-fonts','copy-data', 'copy-html'], function () {
        console.log("Copied All Assets");
    });
});

gulp.task('css-lint', function() {
    gulp.src([src + 'css/**/*.*'])
        .pipe(csslint())
        .pipe(csslint.formatter());
});

gulp.task('js-hint', function() {
    return gulp.src([src + 'js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('accessibility-check', function() {
    return gulp.src([src + '*.html',src + '*.htm'])
        .pipe(wcagAccess({
        accessibilityLevel: 'WCAG2AA',
        maxBuffer: '1024*1024',
        force: true,
        verbose: false,
        reportType: 'txt',
        reportLocation: 'accessibility-report/report.txt',
        reportLevels: {
            notice: false,
            warning: false,
            error: true
        },
        forceUrls: false,
    }))
});


// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).

gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: src + 'images/cool-icon.png',
        dest: dest,
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'noChange',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false,
            readmeFile: false,
            htmlCodeFile: true,
            usePathAsIs: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});


// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
    return gulp.src([src + '*.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest(dest));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.

gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});


//Gulp task for scss operations
gulp.task('scss', function () {
    return gulp.src([src + 'scss/one-tech.scss'])
        .pipe(scss())
        .pipe(gulp.dest(dest + 'css'));
});



gulp.task('build', function() {
    return runSequence( 'clean' , ['scss'] , 
                       ['validate-html' , 'generate-favicon' , 'css-lint' ] ,
                       ['copy-all-assets','inject-favicon-markups'] , function(){
        console.log('build complete...');
    });
});

/*
gulp.task('build', function() {
    return runSequence( 'clean' , ['scss'] , 
                       ['validate-html' , 'css-lint'] ,
                       ['copy-all-assets'] , function(){
        console.log('build complete...');
    });
});
*/


gulp.task('server', function () {
    server.run(['app.js']);
    gulp.watch([src + '*.html', src + '*.htm',src + '**/*.css',src + '**/*.js'], server.notify);
});

gulp.task('serve', function() {
    runSequence( 'build',['server'], function(){

        gulp.watch([src + '*.html', src + '*.htm'], function (file) {
            runSequence('copy-html', function(){
                console.log('HTML modified and validated...!!! UPDATING...');
            });
        });

        gulp.watch([src + 'scss/**/*.scss'], function(file) {
            runSequence('scss', function() {
                console.log('SCSS modified...!!! UPDATING...');
            });
        });
		/**/
		gulp.watch([src + 'js/**/*.js'], function(file) {
            runSequence('copy-js', function() {
                console.log('js modified...!!! UPDATING...');
            });
        });
    });
});

gulp.task('default', ['serve']);
