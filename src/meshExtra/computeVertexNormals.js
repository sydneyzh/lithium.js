// computeVertexNormals

var utils = require( './../utils' );
var vec3 = window.vec3;

module.exports = ( function () {

	var va = vec3.create();
	var vb = vec3.create();
	var vc = vec3.create();
	var ab = vec3.create();
	var ac = vec3.create();
	var normal = vec3.create();

	return function ( positionData, indexData ) {

        // compute vertex normals

		if ( ! positionData || ! indexData || ! positionData.length || ! indexData.length )
			utils.throwErr( this, 'Invalid parameter(s)' );

		var normalData = new Float32Array( positionData.length );

		for ( var i = 0; i < indexData.length / 3; i ++ ) {

			var ia = indexData[ i * 3 + 0 ];
			var ib = indexData[ i * 3 + 1 ];
			var ic = indexData[ i * 3 + 2 ];

			vec3.set( va, positionData[ ia * 3 ], positionData[ ia * 3 + 1 ], positionData[ ia * 3 + 2 ] );
			vec3.set( vb, positionData[ ib * 3 ], positionData[ ib * 3 + 1 ], positionData[ ib * 3 + 2 ] );
			vec3.set( vc, positionData[ ic * 3 ], positionData[ ic * 3 + 1 ], positionData[ ic * 3 + 2 ] );
			vec3.sub( ab, vb, va );
			vec3.sub( ac, vc, va );
			vec3.cross( normal, ab, ac );

			normalData[ ia * 3 + 0 ] += normal[ 0 ];
			normalData[ ia * 3 + 1 ] += normal[ 1 ];
			normalData[ ia * 3 + 2 ] += normal[ 2 ];

			normalData[ ib * 3 + 0 ] += normal[ 0 ];
			normalData[ ib * 3 + 1 ] += normal[ 1 ];
			normalData[ ib * 3 + 2 ] += normal[ 2 ];

			normalData[ ic * 3 + 0 ] += normal[ 0 ];
			normalData[ ic * 3 + 1 ] += normal[ 1 ];
			normalData[ ic * 3 + 2 ] += normal[ 2 ];

		}

        // normalize

		for ( i = 0; i < normalData.length / 3; i ++ ) {

			vec3.set( normal, normalData[ i * 3 ], normalData[ i * 3 + 1 ], normalData[ i * 3 + 2 ] );
			vec3.normalize( normal, normal );
			normalData.set( normal, i * 3 );

		}

		if ( this.faces && this.faces.length > 0 ) {

			for ( i = 0; i < this.faces.length; i ++ ) {

				ia = this.faces[ i ].indices[ 0 ];
				ib = this.faces[ i ].indices[ 1 ];
				ic = this.faces[ i ].indices[ 2 ];

				this.faces[ i ].setVertexNormals(

                    normalData[ ia ], normalData[ ib ], normalData[ ic ]

                );

			}

		}

		utils.log( this, 'NormalData has been generated.' );

		return normalData;

	};

} )();
