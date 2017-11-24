// makeCylinder

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, radius, height, segment ) {

	utils.checkContext( ctx );

    // flat side is facing +z

    // surface: 2 sides
	var positionData0 = [];
	var normalData0 = []; // todo: normal transformation
	var indexData0 = [];

    // surface

	var singleSideVertexNum = segment + 1;

	positionData0[ 0 ] = 0;
	positionData0[ 1 ] = 0;
	positionData0[ 2 ] = 0.5 * height;
	positionData0[ singleSideVertexNum * 3 ] = 0;
	positionData0[ singleSideVertexNum * 3 + 1 ] = 0;
	positionData0[ singleSideVertexNum * 3 + 2 ] = - 0.5 * height;

	normalData0[ 0 ] = 0;
	normalData0[ 1 ] = 0;
	normalData0[ 2 ] = 1;
	normalData0[ singleSideVertexNum * 3 ] = 0;
	normalData0[ singleSideVertexNum * 3 + 1 ] = 0;
	normalData0[ singleSideVertexNum * 3 + 2 ] = - 1;

	for ( var j = 0; j < segment; j ++ ) {

		var frontOffset = ( j + 1 ) * 3;
		var backOffset = ( singleSideVertexNum + j + 1 ) * 3;
		var frontOffset2 = ( j + 1 ) * 2;
		var backOffset2 = ( singleSideVertexNum + j + 1 ) * 2;

		var angle = j * Math.PI * 2 / segment;
		var cosAngle = Math.cos( angle );
		var sinAngle = Math.sin( angle );

        // position

		var x = radius * cosAngle;
		var y = radius * sinAngle;
		var z = 0.5 * height;
		positionData0[ frontOffset ] = x;
		positionData0[ frontOffset + 1 ] = y;
		positionData0[ frontOffset + 2 ] = z;
		positionData0[ backOffset ] = - x;
		positionData0[ backOffset + 1 ] = y;
		positionData0[ backOffset + 2 ] = - z;

        // normal

		normalData0[ frontOffset ] = 0;
		normalData0[ frontOffset + 1 ] = 0;
		normalData0[ frontOffset + 2 ] = 1;
		normalData0[ backOffset ] = 0;
		normalData0[ backOffset + 1 ] = 0;
		normalData0[ backOffset + 2 ] = - 1;

        // index

		var ia = 0;
		var ib = j + 1;
		var ic = j < segment - 1 ? j + 2 : j + 2 - segment;
		indexData0[ frontOffset ] = ia;
		indexData0[ frontOffset + 1 ] = ib;
		indexData0[ frontOffset + 2 ] = ic;
		indexData0[ backOffset ] = singleSideVertexNum + ia;
		indexData0[ backOffset + 1 ] = singleSideVertexNum + ib;
		indexData0[ backOffset + 2 ] = singleSideVertexNum + ic;

	}
	var indexData0max = indexData0.reduce( function ( a, b ) {

		return Math.max( a, b );

	} );

    // // rim
	var positionData1 = [];
	var normalData1 = [];
	var indexData1 = [];

    // first two vertices
	var x, y, z0, z1;
	x = radius;
	y = 0;
	z0 = 0.5 * height;
	z1 = - 0.5 * height;
	positionData1.push( x, y, z0, x, y, z1 );
	normalData1.push( 1, 0, 0, 1, 0, 0 );

	var vertexOffset = 0;

	for ( var j = 1; j <= segment; j ++ ) {

		var angle = j * Math.PI * 2 / segment;

		if ( j !== segment ) {

			var cosAngle = Math.cos( angle );
			var sinAngle = Math.sin( angle );

            // position
			x = radius * cosAngle;
			y = radius * sinAngle;
			z0 = 0.5 * height;
			z1 = - 0.5 * height;
			positionData1.push( x, y, z0, x, y, z1 );

            // normal
			normalData1.push( cosAngle, sinAngle, 0 );
			normalData1.push( cosAngle, sinAngle, 0 );

		}

        // index
		var ia = vertexOffset;
		var ib = vertexOffset + 1;
		var ic = vertexOffset + 2;
		var id = vertexOffset + 3;
		ic %= segment * 2;
		id %= segment * 2;

		indexData1.push( ia, ib, ic, ib, id, ic );
		vertexOffset += 2;

	}

	var positionData = positionData0.concat( positionData1 );
	var normalData = normalData0.concat( normalData1 );
	var indexData = indexData0.concat( indexData1.map( function ( i ) {

		return i + indexData0max + 1;

	} ) );

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: new Float32Array( positionData ), offset: 0 },
                       { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: new Float32Array( normalData ), offset: 3 } );
	this.makeInterleavedBuffer( ctx );
	this.addIndexBuffer( ctx, new Uint16Array( indexData ) );
	this.compile();

};
