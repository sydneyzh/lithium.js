var utils = require( './utils' );
var parseOBJData = require( './parseObjData' );

var onerror = function ( err ) {

	utils.throwErr( 'XHR error ' + err );

};

var loadFile = function ( path, callback ) {

	var rq = new XMLHttpRequest();
	rq.open( 'GET', path, true );

	rq.onreadystatechange = function () {

		if ( rq.readyState === 4 && rq.status === 200 ) {

			callback( rq.response );

		}

	};

	rq.onerror = onerror;
	rq.send( null );

};

module.exports = function ( ctx, output, path, opts, cb ) {

	utils.checkContext( ctx );

	if ( typeof path !== 'string' ) utils.throwErr( this, 'Invalid file path "' + path + '"' );

	loadFile( path, function ( data ) {

		parseOBJData( ctx, output, data, opts );
		if ( typeof cb === 'function' ) cb( output );

	} );

};
