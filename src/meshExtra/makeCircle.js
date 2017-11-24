// makeCircle

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, radius, segment ) {

	utils.checkContext( ctx );

	var vertexNum = segment + 1;
	var positionData = new Float32Array( vertexNum * 3 );
	var normalData = new Float32Array( vertexNum * 3 );
	var uvData = new Float32Array( vertexNum * 2 );
	var indexData = new Uint16Array( segment * 3 );

	positionData[ 0 ] = 0;
	positionData[ 1 ] = 0;
	positionData[ 2 ] = 0;
	normalData[ 0 ] = 0;
	normalData[ 1 ] = 0;
	normalData[ 2 ] = 1;
	uvData[ 0 ] = 0.5;
	uvData[ 1 ] = 0.5;

	for ( var i = 0; i < segment; i ++ ) {

		var angle = i * Math.PI * 2 / segment;
		var j = i + 1;
		positionData[ j * 3 ] = radius * Math.cos( angle );
		positionData[ j * 3 + 1 ] = radius * Math.sin( angle );
		positionData[ ( j + 2 ) * 3 + 2 ] = 0;

		normalData[ j * 3 ] = 0;
		normalData[ j * 3 + 1 ] = 0;
		normalData[ j * 3 + 2 ] = 1;

		uvData[ j * 2 ] = 0.5 + 0.5 * Math.cos( angle );
		uvData[ j * 2 + 1 ] = 0.5 - 0.5 * Math.sin( angle );

	}

	for ( i = 0; i < segment; i ++ ) {

		indexData[ i * 3 ] = 0;
		indexData[ i * 3 + 1 ] = i === 0 ? segment : i;
		indexData[ i * 3 + 2 ] = i + 1;

	}

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 },
                       { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: normalData, offset: 3 },
                       { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 6 } );
	this.makeInterleavedBuffer( ctx );
	this.addIndexBuffer( ctx, indexData );
	this.compile();

};
