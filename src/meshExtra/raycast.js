// raycast

var utils = require( './../utils' );
var vec3 = window.vec3;
var vec4 = window.vec4;

module.exports = ( function () {

	var intersects;
	var va, vb, vc, va4, vb4, vc4;

	return function ( ray, backfaceCulling ) {

		if ( ! this.indexBuffer ) utils.throwErr( this, 'Missing indexBuffer' );
		if ( ! this.attributes || ! this.attributes.a_Position || ! this.attributes.a_Position.data ) utils.throwErr( this, 'position attribute not found.' );

		intersects = intersects || [];
		intersects.length = 0;

		var indexData = this.indexBuffer.data;
		var positionData = this.attributes.a_Position.data;
		var triangleNum = indexData.length / 3;
		for ( var i = 0; i < triangleNum; i ++ ) {

			var ia = indexData[ i * 3 ];
			var ib = indexData[ i * 3 + 1 ];
			var ic = indexData[ i * 3 + 2 ];

			va = va || vec3.create();
			vb = vb || vec3.create();
			vc = vc || vec3.create();
			va4 = va4 || vec4.create();
			vb4 = vb4 || vec4.create();
			vc4 = vc4 || vec4.create();

			vec4.set( va4, positionData[ ia * 3 ], positionData[ ia * 3 + 1 ], positionData[ ia * 3 + 2 ], 1 );
			vec4.set( vb4, positionData[ ib * 3 ], positionData[ ib * 3 + 1 ], positionData[ ib * 3 + 2 ], 1 );
			vec4.set( vc4, positionData[ ic * 3 ], positionData[ ic * 3 + 1 ], positionData[ ic * 3 + 2 ], 1 );

			vec4.transformMat4( va4, va4, this.matrixWorld );
			vec4.transformMat4( vb4, vb4, this.matrixWorld );
			vec4.transformMat4( vc4, vc4, this.matrixWorld );

			vec3.copy( va, va4 );
			vec3.copy( vb, vb4 );
			vec3.copy( vc, vc4 );

			var hitpoint = ray.intersectTriangle( va, vb, vc, backfaceCulling );
			if ( hitpoint !== null ) intersects.push( hitpoint );

		}

		return intersects;

	};

} )();
