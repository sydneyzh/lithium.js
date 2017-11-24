// makeSphere

var vec3 = window.vec3;
var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, radius, wSeg, hSeg ) {

	utils.checkContext( ctx );

	if ( radius === undefined ) throw Error( 'makeSphere: missing parameter "radius".' );

	wSeg = Math.max( 3, Math.floor( wSeg ) || 8 );
	hSeg = Math.max( 2, Math.floor( hSeg ) || 6 );

	var phiStart = 0,
		phiLength = Math.PI * 2;

	var thetaStart = 0,
		thetaLength = Math.PI;

	var thetaEnd = thetaStart + thetaLength;

	var vertexNum = ( wSeg + 1 ) * ( hSeg + 1 );

	var positionData = new Float32Array( vertexNum * 3 );
	var normalData = new Float32Array( vertexNum * 3 );
	var uvData = new Float32Array( vertexNum * 2 );

	var index = 0, vertices = [], normal = vec3.create();

	for ( var y = 0; y <= hSeg; y ++ ) {

		var verticesRow = [];

		var v = y / hSeg;

		for ( var x = 0; x <= wSeg; x ++ ) {

			var u = x / wSeg;

			var px = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			var py = radius * Math.cos( thetaStart + v * thetaLength );
			var pz = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			vec3.set( normal, px, py, pz );
			vec3.normalize( normal, normal );

			positionData[ index * 3 ] = px;
			positionData[ index * 3 + 1 ] = py;
			positionData[ index * 3 + 2 ] = pz;

			normalData[ index * 3 ] = normal[ 0 ];
			normalData[ index * 3 + 1 ] = normal[ 1 ];
			normalData[ index * 3 + 2 ] = normal[ 2 ];

			uvData[ index * 2 ] = u;
			uvData[ index * 2 + 1 ] = 1 - v;

			verticesRow.push( index );

			index ++;

		}

		vertices.push( verticesRow );

	}

	var indices = [];

	for ( y = 0; y < hSeg; y ++ ) {

		for ( x = 0; x < wSeg; x ++ ) {

			var v1 = vertices[ y ][ x + 1 ];
			var v2 = vertices[ y ][ x ];
			var v3 = vertices[ y + 1 ][ x ];
			var v4 = vertices[ y + 1 ][ x + 1 ];

			if ( y !== 0 || thetaStart > 0 ) {

				indices.push( v1, v2, v4 );

			}

			if ( y !== hSeg - 1 || thetaEnd < Math.PI ) {

				indices.push( v2, v3, v4 );

			}

		}

	}


	var indexNum = indices.length;
	var indexData = new ( indexNum > 65535 ? Uint32Array : Uint16Array )( indexNum );
	indexData.set( indices );

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 },
                       { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: normalData, offset: 3 },
                       { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 6 } );

	this.makeInterleavedBuffer( ctx );
	this.addIndexBuffer( ctx, indexData );
	this.compile();

};
