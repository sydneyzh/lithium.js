var math = require( './math' );
var vec3 = window.vec3;
var mat4 = window.mat4;

module.exports = {

	setFromSpherical: function ( out, s ) {

		var sinPhiRadius = Math.sin( s[ 1 ] ) * s[ 0 ];
		out[ 0 ] = sinPhiRadius * Math.sin( s[ 2 ] );
		out[ 1 ] = Math.cos( s[ 1 ] ) * s[ 0 ];
		out[ 2 ] = sinPhiRadius * Math.cos( s[ 2 ] );
		return out;

	},

	setFromRotationMatrix: function ( out, a ) {

        // out: vec3
        // a: rotation matrix
        // order: xyz

		var m11 = a[ 0 ], m12 = a[ 4 ], m13 = a[ 8 ];
		var m22 = a[ 5 ], m23 = a[ 9 ];
		var m32 = a[ 6 ], m33 = a[ 10 ];

		out[ 1 ] = Math.asin( math.clamp( m13, - 1, 1 ) );

		if ( Math.abs( m13 ) < 0.99999 ) {

			out[ 0 ] = Math.atan2( - m23, m33 );
			out[ 2 ] = Math.atan2( - m12, m11 );

		} else {

			out[ 0 ] = Math.atan2( m32, m22 );
			out[ 2 ] = 0;

		}

		return out;

	},

	setFromQuaternion: function ( out, q ) {

        // out: vec3
        // q: quaternion
        // order: xyz

		var m = mat4.create();
		mat4.fromRotationTranslation( m, q, vec3.create() );
		vec3.setFromRotationMatrix( out, m );
		return out;

	}

};
