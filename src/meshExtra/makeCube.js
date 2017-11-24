// make cube

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, w, h, d, wSeg, hSeg, dSeg ) {

	utils.checkContext( ctx );

	wSeg = wSeg || 1;
	hSeg = hSeg || 1;
	dSeg = dSeg || 1;

	var vertexNum = 4 * 2 * ( wSeg * hSeg + wSeg * dSeg + hSeg * dSeg );

	var indexNum = 6 * 2 * ( wSeg * hSeg + wSeg * dSeg + dSeg * hSeg );

	var positionData = new Float32Array( vertexNum * 3 );
	var normalData = new Float32Array( vertexNum * 3 );
	var uvData = new Float32Array( vertexNum * 2 );
	var indexData = new ( indexNum > 65535 ? Uint32Array : Uint16Array )( indexNum );

	var pOffset = 0;
	var nOffset = 0;
	var uvOffset = 0;
	var iOffset = 0;
	var iOffset2 = 0;

	buildPlane( 2, 1, 0, - d, - h, dSeg, hSeg, 0.5 * w, [ 1, 0, 0 ] ); // posx
	buildPlane( 2, 1, 0, d, - h, dSeg, hSeg, - 0.5 * w, [ - 1, 0, 0 ] ); // negx
	buildPlane( 0, 2, 1, w, d, wSeg, dSeg, 0.5 * h, [ 0, 1, 0 ] ); // posy
	buildPlane( 0, 2, 1, w, - d, wSeg, dSeg, - 0.5 * h, [ 0, - 1, 0 ] ); // negy
	buildPlane( 0, 1, 2, w, - h, wSeg, hSeg, 0.5 * d, [ 0, 0, 1 ] ); // posz
	buildPlane( 0, 1, 2, - w, - h, wSeg, hSeg, - 0.5 * d, [ 0, 0, - 1 ] ); // negz

	function buildPlane(
        iIdx, jIdx, kIdx,
        iLen, jLen, iSeg, jSeg, kConst,
        normal ) {

		for ( var i = 0; i < iSeg; i ++ ) {

			for ( var j = 0; j < jSeg; j ++ ) {

                // 2 triangles

                // positions

				var ai = ( - 0.5 + i / iSeg ) * iLen;
				var aj = ( - 0.5 + j / jSeg ) * jLen;
				var bi = ai;
				var bj = ( - 0.5 + ( j + 1 ) / jSeg ) * jLen;
				var di = ( - 0.5 + ( i + 1 ) / iSeg ) * iLen;
				var dj = aj;
				var ci = di;
				var cj = bj;

				positionData[ pOffset + kIdx ] = kConst;
				positionData[ pOffset + kIdx + 3 ] = kConst;
				positionData[ pOffset + kIdx + 3 * 2 ] = kConst;
				positionData[ pOffset + kIdx + 3 * 3 ] = kConst;

				positionData[ pOffset + iIdx ] = ai;
				positionData[ pOffset + iIdx + 3 ] = bi;
				positionData[ pOffset + iIdx + 3 * 2 ] = ci;
				positionData[ pOffset + iIdx + 3 * 3 ] = di;

				positionData[ pOffset + jIdx ] = aj;
				positionData[ pOffset + jIdx + 3 ] = bj;
				positionData[ pOffset + jIdx + 3 * 2 ] = cj;
				positionData[ pOffset + jIdx + 3 * 3 ] = dj;

				pOffset += 3 * 4;

                // normal

				for ( var o = 0; o < 4; o ++ ) {

					normalData[ nOffset + o * 3 ] = normal[ 0 ];
					normalData[ nOffset + o * 3 + 1 ] = normal[ 1 ];
					normalData[ nOffset + o * 3 + 2 ] = normal[ 2 ];

				}

				nOffset += 3 * 4;

                // uv

				var au = i / iSeg;
				var av = j / jSeg;
				var bu = au;
				var bv = ( j + 1 ) / jSeg;
				var du = ( i + 1 ) / iSeg;
				var dv = av;
				var cu = du;
				var cv = bv;

				uvData[ uvOffset ] = au;
				uvData[ uvOffset + 1 ] = av;
				uvData[ uvOffset + 2 ] = bu;
				uvData[ uvOffset + 3 ] = bv;
				uvData[ uvOffset + 4 ] = cu;
				uvData[ uvOffset + 5 ] = cv;
				uvData[ uvOffset + 6 ] = du;
				uvData[ uvOffset + 7 ] = dv;

				uvOffset += 2 * 4;

                // index

				indexData[ iOffset ] = iOffset2;
				indexData[ iOffset + 1 ] = iOffset2 + 1;
				indexData[ iOffset + 2 ] = iOffset2 + 3;
				indexData[ iOffset + 3 ] = iOffset2 + 1;
				indexData[ iOffset + 4 ] = iOffset2 + 2;
				indexData[ iOffset + 5 ] = iOffset2 + 3;

				iOffset += 6;
				iOffset2 += 4;

			}

		}

	}

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 },
                       { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: normalData, offset: 3 },
                       { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 6 } );
	this.addIndexBuffer( ctx, indexData );
	this.makeInterleavedBuffer( ctx );
	this.compile();

};
