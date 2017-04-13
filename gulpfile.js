'use strict';

let
	glob = require('glob'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	path = require('path'),
	rollup = require('rollup'),
	runSequence = require('run-sequence'),

	plugins = gulpLoadPlugins(),
	assets = require('./config/assets'),
	pkg = require('./package.json');


// Banner to append to generated files
let bannerString = '/*! ' + pkg.name + '-' + pkg.version + ' - ' + pkg.copyright + '*/\n'


/**
 * Validation Tasks
 */

gulp.task('validate-js', () => {

	return gulp.src(assets.src.js)

	// ESLint
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());

});


/**
 * Build
 */

gulp.task('build-js', ['rollup-js'], () => {

	// Uglify
	return gulp.src(path.join(assets.dist.dir, (pkg.artifactName + '.js')))
		.pipe(plugins.uglify({ preserveComments: 'license' }))
		.pipe(plugins.rename(pkg.artifactName + '.min.js'))
		.pipe(gulp.dest(assets.dist.dir));

});

gulp.task('rollup-js', () => {
	return rollup.rollup({
		entry: assets.src.entry
	})
		.then((bundle) => {
			return bundle.write({
				dest: path.join(assets.dist.dir, (pkg.artifactName + '.js')),
				format: 'umd',
				moduleName: pkg.moduleName,
				sourceMap: true,
				banner: bannerString
			});
		});

});


gulp.task('build-css', () => {

	// Generate a list of the sources in a deterministic manner
	let sourceArr = [];
	assets.src.sass.forEach((f) => {
		sourceArr = sourceArr.concat(glob.sync(f).sort());
	});

	return gulp.src(sourceArr)

		// Lint the Sass
		.pipe(plugins.sassLint({
			formatter: 'stylish',
			rules: require('./config/sasslint.conf.js')
		}))
		.pipe(plugins.sassLint.format())
		.pipe(plugins.sassLint.failOnError())

		// Compile and concat the sass (w/sourcemaps)
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass())
		.pipe(plugins.concat(pkg.artifactName + '.css'))
		.pipe(plugins.insert.prepend(bannerString))
		.pipe(plugins.sourcemaps.write('.'))
		.pipe(gulp.dest(assets.dist.dir))

		// Clean the CSS
		.pipe(plugins.filter(path.join(assets.dist.dir, (pkg.artifactName + '.css'))))
		.pipe(plugins.cleanCss())
		.pipe(plugins.rename(pkg.artifactName + '.min.css'))
		.pipe(gulp.dest(assets.dist.dir));

});

gulp.task('copy-fonts', () => {
	return gulp.src(assets.src.fonts.dir, { base: assets.src.fonts.base })
		.pipe(gulp.dest(assets.dist.dir));
});

gulp.task('watch', [ 'build' ], () => {
	gulp.watch([ assets.src.js, assets.src.sass ], [ 'build' ]);
});


/**
 * --------------------------
 * Main Tasks
 * --------------------------
 */

gulp.task('build', (done) => { runSequence('validate-js', [ 'build-js', 'build-css', 'copy-fonts' ], done); } );

// Default task builds and tests
gulp.task('default', [ 'build' ]);
