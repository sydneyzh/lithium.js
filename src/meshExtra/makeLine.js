// makeLine

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, start, stop, seg ) {

	utils.checkContext( ctx );

	seg = seg || 1;

	var dx = ( stop[ 0 ] - start[ 0 ] ) / seg;
	var dy = ( stop[ 1 ] - start[ 1 ] ) / seg;
	var dz = ( stop[ 2 ] - start[ 2 ] ) / seg;

	var n = seg + 1;

	var vertexNum = n;

	var positionData = new Float32Array( vertexNum * 3 );

	var offset = 0;

	for ( var i = 0; i < n; i ++ ) {

		positionData[ offset ] = start[ 0 ] + i * dx;
		positionData[ offset + 1 ] = start[ 1 ] + i * dy;
		positionData[ offset + 2 ] = start[ 2 ] + i * dz;
		offset += 3;

	}

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 } );
	this.attributes.a_Position.makeBuffer( ctx );
	this.compile();

};
