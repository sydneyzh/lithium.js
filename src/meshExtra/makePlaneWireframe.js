// makePlaneWireframe

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, w, h, wSeg, hSeg ) {

	utils.checkContext( ctx );

    // mode - line_strip

	var xSeg = wSeg || 10;
	var ySeg = hSeg || 10;

	var xRange = w || 500;
	var yRange = h || 500;

	var dx = xRange / xSeg;
	var dy = yRange / ySeg;

	var x = - xRange / 2;
	var y = - yRange / 2;
	var z = 0;

	var vertexNum = ( xSeg + 1 ) * ( ySeg + 1 ) * 2;

	var positionData = new Float32Array( vertexNum * 3 );
	var normalData = new Float32Array( vertexNum * 3 );
	var uvData = new Float32Array( vertexNum * 2 );

	var offset = 0, offset2 = 0;

	for ( var i = 0; i < ( xSeg + 1 ) * ( ySeg + 1 ); i ++ ) {

		if ( i !== 0 ) {

			if ( i % ( xSeg + 1 ) === 0 ) {

				y += dy;

			} else if ( Math.floor( i / ( xSeg + 1 ) ) % 2 === 0 ) {

				x += dx;

			} else if ( Math.floor( i / ( xSeg + 1 ) ) % 2 === 1 ) {

				x -= dx;

			}

		}

		positionData[ offset ] = x;
		positionData[ offset + 1 ] = y;
		positionData[ offset + 2 ] = z;

		normalData[ offset ] = 0;
		normalData[ offset + 1 ] = 0;
		normalData[ offset + 2 ] = 1;

		uvData[ offset2 ] = 0.5 + x / xRange;
		uvData[ offset2 + 1 ] = 0.5 - y / yRange;

		offset += 3;
		offset2 += 2;

	}

	for ( i = 0; i < ( xSeg + 1 ) * ( ySeg + 1 ); i ++ ) {

		if ( i !== 0 ) {

			if ( i % ( ySeg + 1 ) === 0 ) {

				x -= dx;

			} else if ( Math.floor( i / ( ySeg + 1 ) ) % 2 === 0 ) {

				y -= dy;

			} else if ( Math.floor( i / ( ySeg + 1 ) ) % 2 === 1 ) {

				y += dy;

			}

		}

		positionData[ offset ] = x;
		positionData[ offset + 1 ] = y;
		positionData[ offset + 2 ] = z;

		normalData[ offset ] = 0;
		normalData[ offset + 1 ] = 0;
		normalData[ offset + 2 ] = 1;

		uvData[ offset2 ] = 0.5 + x / xRange;
		uvData[ offset2 + 1 ] = 0.5 - y / yRange;

		offset += 3;
		offset2 += 2;

	}

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 },
                       { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: normalData, offset: 3 },
                       { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 6 } );
	this.makeInterleavedBuffer( ctx );
	this.compile();

};
