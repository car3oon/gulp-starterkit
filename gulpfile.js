var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer');
    babel = require('gulp-babel'),
    bower = require('gulp-bower');
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rm = require('gulp-rm');
    cache = require('gulp-cache'),
    minifycss = require('gulp-minify-css'),
    mqpacker = require('css-mqpacker'),
    csswring = require('csswring'),
    postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    inject = require('gulp-inject');

var config = {
  prodDir: 'build'
}

gulp.task('clean', function() {
  return gulp.src(config.prodDir + '/**/*', {read: false})
    .pipe(rm());
})

gulp.task('copy-index', function() {
  gulp.src('src/index.html')
  .pipe(gulp.dest(config.prodDir))
  .pipe(browserSync.reload({stream: true}));
});

gulp.task('bower', function () {
	return gulp.src('src/*.html')
		.pipe(wiredep({
			directory: 'src/bower_components'
		}))
		.pipe(gulp.dest('config.prodDir'))
		.pipe(reload({stream:true}))
});

gulp.task('inject', function(){
	return gulp.src(config.prodDir + '/index.html')
		.pipe(gulp.src([config.prodDir + '/styles/**',config.prodDir + '/scripts/**'],
			{read: false}), {ignorePath: config.prodDir + '/', addRootSlash: false})
		.pipe(gulp.dest(config.prodDir))
		.pipe(reload({stream:true}));
});

gulp.task('useref', function () {
	var jsFilter = filter('**/*.js');
	var cssFilter = filter('**/*.css');
  // @TODO fix files injection
  //  return gulp.src('app/*.html')
	// 	.pipe($.useref.assets())
	// 	.pipe(jsFilter)
	// 	.pipe($.ngmin())
	// 	.pipe($.uglify())
	// 	.pipe(jsFilter.restore())
	// 	.pipe(cssFilter)
	// 	.pipe($.csso())
	// 	.pipe(cssFilter.restore())
	// 	.pipe($.useref.restore())
	// 	.pipe($.useref())
	// 	.pipe(gulp.dest('./build'))
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: config.prodDir
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('images', function(){
  gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images/'));
});

gulp.task('styles', function(){
  var processors = [
    // autoprefixer({browsers: ['last 2 version']}),
    mqpacker
  ];
  gulp.src(['src/styles/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(gulp.dest(config.prodDir + '/styles/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(config.prodDir + '/styles/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src('src/scripts/**/*.js')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('app.js'))
    .pipe(babel())
    .pipe(gulp.dest(config.prodDir + '/scripts/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(config.prodDir + '/scripts/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('watch-files', function() {
  gulp.watch('src/index.html', ['copy-index']);
  gulp.watch('bower.json', ['bower']);
  gulp.watch("src/styles/**/*.scss", ['styles']);
  gulp.watch("src/scripts/**/*.js", ['scripts']);
  gulp.watch("*.html", ['bs-reload']);
})

gulp.task('pre-compile', ['clean', 'copy-index', 'bower', 'styles', 'scripts'])

gulp.task('default', ['pre-compile', 'browser-sync', 'watch-files']);
