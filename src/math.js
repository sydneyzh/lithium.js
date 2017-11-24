var vec3 = window.vec3;

module.exports = {

	ORIGIN: vec3.create(),
	POS_X: vec3.fromValues( 1, 0, 0 ),
	NEG_X: vec3.fromValues( - 1, 0, 0 ),
	POS_Y: vec3.fromValues( 0, 1, 0 ),
	NEG_Y: vec3.fromValues( 0, - 1, 0 ),
	POS_Z: vec3.fromValues( 0, 0, 1 ),
	NEG_Z: vec3.fromValues( 0, 0, - 1 ),
	EPS: 1.0E-6,
	INF: 1.0E10,

	clamp: function ( val, min, max ) {

		return Math.max( min, Math.min( max, val ) );

	}

};
