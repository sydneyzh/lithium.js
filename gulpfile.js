var browserify = require( 'browserify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var pkg = require( './package.json' );

var gulp = require( 'gulp' );
var clone = require( 'gulp-clone' );
var derequire = require( 'gulp-derequire' );
var header = require( 'gulp-header' );
var rename = require( 'gulp-rename' );
var gutil = require( 'gulp-util' );
var uglify = require( 'gulp-uglify' );
var sourcemaps = require( 'gulp-sourcemaps' );

var banner = [
	'/**',
	' * lithium.js <%= context.version %>',
	' * by sydneyzh <%= context.date %>',
	' * http://sydneyzh.com',
	' */',
	''
].join( '\n' );

// ========== bundle ==========

var bundler = browserify( 'src/lithium.js', { standalone: 'LI', debug: true } );

function bundle( isProduction, opts ) {

	var compiled = bundler
		.external( 'gl-matrix' )
		.bundle()
		.on( 'error', gutil.log )
		.pipe( source( 'compiled' ) )
		.pipe( derequire() )
		.pipe( buffer() );

	var devBuild = compiled.pipe( clone() )
		.pipe( rename( 'lithium.dev.js' ) )
		.pipe( sourcemaps.init( { loadMaps: true } ) )
		.pipe( sourcemaps.write( './' ) )
		.pipe( header( banner + '\n', { context: opts } ) )
		.pipe( gulp.dest( 'build' ) );

	if ( isProduction ) {

		compiled.pipe( clone() )
			.pipe( rename( 'lithium.min.js' ) )
			.pipe( uglify() )
			.on( 'error', gutil.log )
			.pipe( header( banner + '\n', { context: opts } ) )
			.pipe( gulp.dest( 'build' ) );

		return null;

	} else {

		return devBuild;

	}

}


// ========== tasks ==========

gulp.task( 'bundle-glm', function ( done ) {

	browserify( { debug: true } )
		.require( 'gl-matrix' )
		.bundle()
		.pipe( source( 'gl-matrix.min.js' ) )
		.pipe( buffer() )
		.pipe( uglify() )
		.pipe( gulp.dest( 'build' ) );

	done();

} );

var headerInfo = {

	version: pkg.version,
	date: new Date().toISOString().slice( 0, 10 )

};

gulp.task( 'dev:bundle', function ( done ) {

	bundle( false, headerInfo );
	done();

} );

gulp.task( 'deploy:bundle', function ( done ) {

	bundle( true, headerInfo );
	done();

} );

gulp.task( 'default', gulp.series( 'deploy:bundle' ) );
