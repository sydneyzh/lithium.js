var utils = require( './utils' );
var Object3D = require( './Object3D' );
var vec3 = window.vec3;
var mat4 = window.mat4;
var quat = window.quat;

var Camera = function ( updater ) {

	Object3D.call( this, updater );

	this.isCamera = true;

	this.type = undefined;

	this._top = vec3.fromValues( 0, 1, 0 ); // world coord
	this._zoom = 1;

	this._near = undefined;
	this._far = undefined;

	// ortho
	this._left = undefined;
	this._right = undefined;
	this._low = undefined;
	this._high = undefined;

	// perspective
	this._fov = undefined;
	this._aspect = undefined;

	this._viewMatrix = mat4.create(); // a copy of matrixWorldInverse
	this._projectionMatrix = mat4.create();

	this.lookAt( vec3.fromValues( 0, 0, - 1 ) );

};

Object.assign( Camera.prototype, Object3D.prototype, {

	constructor: Camera,

	_updateProjectionMatrix: function () {

		var left, right, high, low;

		if ( this.type === 'ortho' ) {

			var dx = ( this._right - this._left ) / ( 2 * this._zoom );
			var dy = ( this._high - this._low ) / ( 2 * this._zoom );
			var cx = ( this._right + this._left ) / 2;
			var cy = ( this._high + this._low ) / 2;

			left = cx - dx;
			right = cx + dx;
			high = cy + dy;
			low = cy - dy;

			mat4.ortho( this._projectionMatrix, left, right, low, high, this._near, this._far );

		} else if ( this.type === 'perspective' ) {

			high = this._near * Math.tan( 0.5 * this._fov ) / this._zoom;
			low = - high;
			left = - this._aspect * high;
			right = this._aspect * high;

			mat4.frustum( this._projectionMatrix, left, right, low, high, this._near, this._far );

		} else {

			utils.throwErr( this, 'Invalid camera type ' + this.type );

		}

	},

	updateMatrixWorld: function () {

		// override parent method

		Object3D.prototype.updateMatrixWorld.call( this );
		mat4.copy( this._viewMatrix, this._matrixWorldInverse );

	},

	// setters

	makePerspective: function ( fovDeg, aspect, near, far ) {

		if ( this.type === 'ortho' ) {

			this._left = undefined;
			this._right = undefined;
			this._low = undefined;
			this._high = undefined;

		}

		this.type = 'perspective';

		utils.checkNumber( fovDeg, aspect, near, far );

		this._fov = fovDeg * 3.14 / 180;
		this._aspect = aspect;
		this._near = near;
		this._far = far;

		this._updateProjectionMatrix();

	},

	makeOrtho: function ( left, right, low, high, near, far ) {

		if ( this.type === 'perspective' ) {

			this._fov = undefined;
			this._aspect = undefined;

		}

		this.type = 'ortho';

		utils.checkNumber( left, right, low, high, near, far );

		this._left = left;
		this._right = right;
		this._low = low;
		this._high = high;
		this._near = near;
		this._far = far;

		this._updateProjectionMatrix();

	},

	lookAt: ( function () {

		var q;

		return function ( v ) {

			// v in world coord

			if ( this.parent !== null ) {

				utils.warn( this, 'lookAt() operation for cameras in a Object3D group is not supported.' );
				return;

			}

			utils.checkArrNumber( v, 3 );

			// update viewMatrix
			mat4.lookAt( this._viewMatrix, this._position, v, this._top );

			// update modelMatrix
			mat4.invert( this._matrix, this._viewMatrix );
			mat4.copy( this._matrixWorld, this._matrix );

			// update position
			mat4.getTranslation( this._position, this._matrixWorld );

			// update rotation
			q = q || quat.create();
			mat4.getRotation( q, this._matrixWorld );
			this.setQuaternion( q );

		};

	} )(),

	setFront: ( function () {

		// set and look at a new front (normalized)

		var ref;

		return function ( front ) {

			if ( this.parent !== null ) {

				utils.warn( this, 'setFront() operation for cameras in a Object3D group is not supported.' );
				return;

			}

			utils.checkArrNumber( front, 3 );

			vec3.normalize( front, front );
			ref = ref || vec3.create();
			vec3.add( ref, this.getPosition(), front );
			this.lookAt( ref );

		};

	} )(),

	setTop: function ( top ) {

		utils.checkArrNumber( top, 3 );

		vec3.copy( this._top, top );

	},

	setScale: function () {

		// override parent method

		utils.warn( this, 'Camera.setScale() is disabled.' );

	},

	zoom: function ( z ) {

		utils.checkNumber( z );

		if ( z <= 0 )
			utils.throwErr( this, 'Invalid zoom value "' + z + '"' );

		this._zoom = z;
		this._updateProjectionMatrix();

	},

	// getters

	getTop: ( function () {

		var t;

		return function () {

			t = t || vec3.create();
			vec3.copy( t, this._top );
			return t;

		};

	} )(),

	getFront: ( function () {

		var front;

		return function () {

			front = front || vec3.create();

			vec3.set( front, - this._matrixWorld[ 8 ], - this._matrixWorld[ 9 ], - this._matrixWorld[ 10 ] );
			return front;

		};

	} )(),

	getRight: ( function () {

		var right;

		return function () {

			right = right || vec3.create();
			vec3.set( right, this._matrixWorld[ 0 ], this._matrixWorld[ 1 ], this._matrixWorld[ 2 ] );
			return right;

		};

	} )(),

	getLeft: ( function () {

		var left;

		return function () {

			left = left || vec3.create();

			vec3.set( left, - this._matrixWorld[ 0 ], - this._matrixWorld[ 1 ], - this._matrixWorld[ 2 ] );
			return left;

		};

	} )(),

	getUp: ( function () {

		var up;

		return function () {

			up = up || vec3.create();

			vec3.cross( up, this.getFront(), this.getLeft() );
			vec3.normalize( up, up );
			return up;

		};

	} )(),

	getViewMatrix: ( function () {

		var m;

		return function () {

			m = m || mat4.create();
			return mat4.copy( m, this._viewMatrix );

		};

	} )(),

	getProjectionMatrix: ( function () {

		var m;

		return function () {

			m = m || mat4.create();
			return mat4.copy( m, this._projectionMatrix );

		};

	} )(),

	project: ( function () {

		var m, res;

		return function ( v ) {

			m = m || mat4.create();
			res = res || vec3.create();

			mat4.multiply( m, this._projectionMatrix, this._matrixWorldInverse );
			vec3.transformMat4( res, v, m );
			return res;

		};


	} )(),

	unproject: ( function () {

		var m, n, res;

		return function ( v ) {

			m = m || mat4.create();
			n = n || mat4.create();
			res = res || vec3.create();

			mat4.invert( n, this._projectionMatrix );
			mat4.multiply( m, this._matrixWorld, n );
			vec3.multiplyByMat4( res, v, m );
			return res;

		};

	} )(),

	clone: function ( camera ) {

		if ( ! camera.isCamera )
			utils.throwErr( this, 'Invalid parameter' );

		if ( camera.type === 'perspective' ) {

			this.makePerspective( camera._fov * 180 / Math.PI, camera._aspect, camera._near, camera._far );

		} else if ( camera.type === 'ortho' ) {

			this.makeOrtho( camera._left, camera._right, camera._low, camera._high, camera._near, camera._far );

		} else {

			utils.throwErr( this, 'Cannot clone camera. Invalid type "' + camera.type + '"' );

		}

	}

} );

module.exports = Camera;
