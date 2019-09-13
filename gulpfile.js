'use strict';

/**
 * Project gulpfile
 * Adds tasks to compile, lint and minify styles, scripts, etc.
 */

// Requirements
let gulp = require('gulp');
let sourcemaps = require("gulp-sourcemaps");
let babel = require("gulp-babel");
let autoprefixer = require('gulp-autoprefixer');
let sass = require('gulp-sass');

sass.compiler = require('node-sass');

// Constants
const dirs = {
	assets: {
		src: {
			styles: 'assets/src/styles',
			scripts: 'assets/src/scripts'
		},
		dist: {
			styles: 'assets/dist/styles',
			scripts: 'assets/dist/scripts'
		},
		vendor: 'assets/vendor/'
	}
};

// Tasks

// # Compile tasks
function js() {
	return gulp.src(dirs.assets.src.scripts + '/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.on('error', function(e) {
			console.error(e);
			this.emit('end');
		})
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dirs.assets.dist.scripts));
}

function scss() {
	return gulp.src(dirs.assets.src.styles + '/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass()).on('error', sass.logError)
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dirs.assets.dist.styles));
}

exports.compile = gulp.parallel(js, scss);

// # Build tasks
function compressJs() {
	let uglify = require('gulp-uglify');
    return gulp.src(dirs.assets.dist.scripts + "/**/*.js")
        .pipe(uglify())
        .pipe(gulp.dest(dirs.assets.dist.scripts));
}
const buildJs = gulp.series(js, compressJs);

function compressCSS() {
	let uglify = require('gulp-uglifycss');
    return gulp.src(dirs.assets.dist.styles + '/**/*.css')
		.pipe(uglify())
		.pipe(gulp.dest(dirs.assets.dist.styles));
}
const buildCSS = gulp.series(scss, compressCSS);

exports.build = gulp.parallel(buildJs, buildCSS);

// # Linting tasks
function lintJs() {
	let eslint = require('gulp-eslint');
	return gulp.src([dirs.assets.src.scripts + '/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
}

exports.lint = lintJs;

// # Watcher tasks
function compileWatch() {
	gulp.watch(dirs.assets.src.styles + '/**/*.scss', { ignoreInitial: false }, scss);
    gulp.watch(dirs.assets.src.scripts + '/**/*.js', { ignoreInitial: false }, js);
}

function lintWatch() {
	gulp.watch(dirs.assets.src.scripts + '/**/*.js', { ignoreInitial: false }, lintJs);
}

exports.watch = gulp.parallel(compileWatch, lintWatch);

// # Default tasks
exports.default = exports.watch
