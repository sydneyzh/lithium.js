var math = require( './math' );
var glMatrix = window.glMatrix;
var vec3 = window.vec3;
var EPS = 0.000001;

module.exports = {

	create: function () {

		var out = new ( glMatrix.ARRAY_TYPE || glMatrix.glMatrix.ARRAY_TYPE )( 3 );
		out[ 0 ] = 1; // radius
		out[ 1 ] = 0; // theta
		out[ 2 ] = 0; // phi
		return out;

	},

	fromValues: function ( r, theta, phi ) {

		var out = new ( glMatrix.ARRAY_TYPE || glMatrix.glMatrix.ARRAY_TYPE )( 3 );
		out[ 0 ] = r; // radial
		out[ 1 ] = theta; // polar
		out[ 2 ] = phi; // azimuthal
		return out;

	},

	setFromVec3: function ( out, a ) {

        // set out from a ( vec3 )

		out[ 0 ] = vec3.length( a );

		if ( out[ 0 ] === 0 ) {

			out[ 1 ] = 0;
			out[ 2 ] = 0;

		} else {

			out[ 1 ] = Math.acos( math.clamp( a[ 1 ] / out[ 0 ], - 1, 1 ) );
			out[ 2 ] = Math.atan2( a[ 0 ], a[ 2 ] );

		}

		return out;

	},

	clone: function ( a ) {

		return vec3.clone( a );

	},

	copy: function ( out, a ) {

		out[ 0 ] = a[ 0 ];
		out[ 1 ] = a[ 1 ];
		out[ 2 ] = a[ 2 ];
		return out;

	},

	set: function ( out, r, theta, phi ) {

		out[ 0 ] = r;
		out[ 1 ] = theta;
		out[ 2 ] = phi;
		return out;

	},

	restrict: function ( out, a ) {

        // restrict phi to be between EPS and PI-EPS

		out[ 0 ] = a[ 0 ];
		out[ 1 ] = Math.max( EPS, Math.min( Math.PI - EPS, a[ 1 ] ) );
		out[ 2 ] = a[ 2 ];
		return out;

	}

};
