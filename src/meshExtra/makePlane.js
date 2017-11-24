// makePlane

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( ctx, w, h, wSeg, hSeg ) {

	utils.checkContext( ctx );

	wSeg = wSeg || 1;
	hSeg = hSeg || 1;

	var dw = w / wSeg;
	var dh = h / hSeg;

	var nw = wSeg + 1;
	var nh = hSeg + 1;
	var vertexNum = nw * nh;

	var pw = 1 / wSeg;
	var ph = 1 / hSeg;

	var halfw = w / 2;
	var halfh = h / 2;

	var positionData = new Float32Array( vertexNum * 3 );
	var normalData = new Float32Array( vertexNum * 3 );
	var uvData = new Float32Array( vertexNum * 2 );

	var offset = 0;
	var offset2 = 0;

	for ( var i = 0; i < nh; i ++ ) {

		for ( var j = 0; j < nw; j ++ ) {

			positionData[ offset ] = - halfw + dw * j;
			positionData[ offset + 1 ] = halfh - dh * i;
			positionData[ offset + 2 ] = 0;

			normalData[ offset + 0 ] = 0;
			normalData[ offset + 1 ] = 0;
			normalData[ offset + 2 ] = 1;

			uvData[ offset2 ] = pw * j;
			uvData[ offset2 + 1 ] = 1 - ph * i;

			offset += 3;
			offset2 += 2;

		}

	}

	var indexData = new ( ( positionData.length / 3 ) > 65535 ? Uint32Array : Uint16Array )( wSeg * hSeg * 6 );

	offset = 0;

	for ( i = 0; i < hSeg; i ++ ) {

		for ( j = 0; j < wSeg; j ++ ) {

			var a = j + nw * i;
			var b = j + nw * ( i + 1 );
			var c = ( j + 1 ) + nw * ( i + 1 );
			var d = ( j + 1 ) + nw * i;

			indexData[ offset ] = a;
			indexData[ offset + 1 ] = b;
			indexData[ offset + 2 ] = d;

			indexData[ offset + 3 ] = b;
			indexData[ offset + 4 ] = c;
			indexData[ offset + 5 ] = d;

			offset += 6;

		}

	}

	this.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 },
                       { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: normalData, offset: 3 },
                       { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 6 } );
	this.addIndexBuffer( ctx, indexData );
	this.makeInterleavedBuffer( ctx );
	this.compile();

};
