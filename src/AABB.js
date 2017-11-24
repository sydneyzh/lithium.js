var utils = require( './utils' );
var vec3 = window.vec3;

// Axis-aligned bounding box

var AABB = function ( updater, arg0, arg1 ) {

	this.isAABB = true;

	this._updater = utils.checkUpdater( updater );

	this._min = vec3.create();
	this._max = vec3.create();
	this._center = vec3.create();

	if ( arg0 && arg0.isMesh ) {

		this.fromMesh( arg0 );

	} else if ( arg0 && arg1 ) {

		this.fromPositions( arg0, arg1 );

	}

};

AABB.prototype = {

	constructor: AABB,

    // modification methods

	fromMesh: function ( mesh ) {

		if ( ! ( mesh._attributes && mesh._attributes.a_Position && mesh._attributes.a_Position._data ) )
			utils.throwErr( this, 'Cannot find mesh attribute "a_Position" data' );

		this._updater.update();

		this.fromData( mesh._attributes.a_Position._data, mesh.getMatrixWorld() );

	},

	fromPositions: ( function () {

		var arr;

		return function ( a, b ) {

			utils.checkArrNumber( a, 3 );
			utils.checkArrNumber( b, 3 );

			arr = arr || [];
			arr.length = 0;
			arr.push( a, b );
			this.fromData( arr );

		};

	} )(),

	fromData: ( function () {

		var min, max;
		var v;

		return function ( data, matrixWorld ) {

			if ( ! data.length )
				utils.throwErr( this, 'Invalid data array ' + data );

			min = min || vec3.create();
			max = max || vec3.create();

			vec3.set( min, data[ 0 ], data[ 1 ], data[ 2 ] );
			vec3.set( max, data[ 0 ], data[ 1 ], data[ 2 ] );

			for ( var i = 3; i < data.length; i += 3 ) {

				v = v || vec3.create();
				vec3.set( v, data[ i ], data[ i + 1 ], data[ i + 2 ] );

				min[ 0 ] = Math.min( min[ 0 ], v[ 0 ] );
				min[ 1 ] = Math.min( min[ 1 ], v[ 1 ] );
				min[ 2 ] = Math.min( min[ 2 ], v[ 2 ] );
				max[ 0 ] = Math.max( max[ 0 ], v[ 0 ] );
				max[ 1 ] = Math.max( max[ 1 ], v[ 1 ] );
				max[ 2 ] = Math.max( max[ 2 ], v[ 2 ] );

			}

			vec3.transformMat4( this._min, min, matrixWorld );
			vec3.transformMat4( this._max, max, matrixWorld );

			this._calculateCenter();

		};

	} )(),

    // calculation methods

	_calculateCenter: function () {

		this._center[ 0 ] = 0.5 * ( this._min[ 0 ] + this._max[ 0 ] );
		this._center[ 1 ] = 0.5 * ( this._min[ 1 ] + this._max[ 1 ] );
		this._center[ 2 ] = 0.5 * ( this._min[ 2 ] + this._max[ 2 ] );

	},

    // getters

	getMin: ( function () {

		var v;

		return function () {

			v = v || vec3.create();
			return vec3.copy( v, this._min );

		};

	} )(),

	getMax: ( function () {

		var v;

		return function () {

			v = v || vec3.create();
			return vec3.copy( v, this._max );

		};

	} )(),

	getCenter: ( function () {

		var v;

		return function () {

			v = v || vec3.create();
			return vec3.copy( v, this._center );

		};

	} )()

};

module.exports = AABB;
