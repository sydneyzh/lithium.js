// makeQuad
// dimension is ( -1,-1 ) to ( 1, 1 )

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx ) {

	utils.checkContext( ctx );

	var positionData = new Float32Array( [ - 1, 1, 0,
		- 1, - 1, 0,
		1, - 1, 0,
		1, 1, 0 ] );
	var uvData = new Float32Array( [ 0, 0,
		0, 1,
		1, 1,
		1, 0 ] );

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 },
                       { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 3 } );
	this.addIndexBuffer( ctx, new Uint16Array( [ 0, 1, 3, 1, 2, 3 ] ) );
	this.makeInterleavedBuffer( ctx );
	this.compile();

};
