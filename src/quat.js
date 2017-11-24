module.exports = {

	setFromEuler: function ( out, a ) {

        // out: quat
        // a: euler
        // order xyz

		var c1 = Math.cos( a[ 0 ] / 2 );
		var c2 = Math.cos( a[ 1 ] / 2 );
		var c3 = Math.cos( a[ 2 ] / 2 );
		var s1 = Math.sin( a[ 0 ] / 2 );
		var s2 = Math.sin( a[ 1 ] / 2 );
		var s3 = Math.sin( a[ 2 ] / 2 );

		out[ 0 ] = s1 * c2 * c3 + c1 * s2 * s3;
		out[ 1 ] = c1 * s2 * c3 - s1 * c2 * s3;
		out[ 2 ] = c1 * c2 * s3 + s1 * s2 * c3;
		out[ 3 ] = c1 * c2 * c3 - s1 * s2 * s3;

		return out;

	},

	getEuler: function ( out, q ) {

		var q0 = q[ 0 ];
		var q1 = q[ 1 ];
		var q2 = q[ 2 ];
		var q3 = q[ 3 ];
		var q12 = Math.pow( q1, 2 );
		var q22 = Math.pow( q2, 2 );
		var q32 = Math.pow( q3, 2 );

		out[ 0 ] = Math.atan2( 2 * ( q0 * q1 + q2 * q3 ), 1 - 2 * ( q12 + q22 ) );
		out[ 1 ] = Math.asin( 2 * ( q0 * q2 - q3 * q1 ) );
		out[ 2 ] = Math.atan2( 2 * ( q0 * q3 + q1 * q2 ), 1 - 2 * ( q22 + q32 ) );

		return out;

	}

};
