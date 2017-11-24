var utils = require( './utils' );
var Rotation = require( './Rotation' );
var vec3 = window.vec3;
var mat3 = window.mat3;
var mat4 = window.mat4;
var quat = window.quat;

var Object3D = function ( updater ) {

	this.isObject3D = true;
	this._updater = utils.checkUpdater( updater );
	this._id = updater.getId();
	this._weight = 0;

	this.parent = null;
	this.children = {};

	this._position = vec3.create();
	this._rotation = new Rotation();
	this._scale = vec3.fromValues( 1, 1, 1 );

	this._matrix = mat4.create();
	this._matrixWorld = mat4.create();
	this._matrixWorldInverse = mat4.create();
	this._matrixWorldInverseTranspose = mat3.create();

};

Object3D.prototype = {

	constructor: Object3D,

	setEuler: function ( v ) {

		this._rotation.setEuler( v );

		this._updater.add( this );

	},

	rotateTo: function ( v ) {

		utils.checkArrNumber( v, 3 );

		return this.setEuler( v );

	},

	setQuaternion: ( function () {

		var tmp;

		return function ( q ) {

			utils.checkArrNumber( q, 4 );

			tmp = tmp || quat.create();
			quat.normalize( tmp, q );
			this._rotation.setQuaternion( tmp );

			this._updater.add( this );

		};

	} )(),

	setRotationMatrix: function ( m ) {

		this._rotation.setFromRotationMatrix( m );

		this._updater.add( this );

	},


    // params - delta

	rotateX: function ( angle ) {

		this._rotation.rotateX( angle );

		this._updater.add( this );

	},

	rotateY: function ( angle ) {

		this._rotation.rotateY( angle );

		this._updater.add( this );

	},

	rotateZ: function ( angle ) {

		this._rotation.rotateZ( angle );

		this._updater.add( this );

	},

	rotateOnAxis: ( function () {

		var tmpAxis, q;

		return function ( axis, angle ) {

			utils.checkArrNumber( axis, 3 );
			utils.checkNumber( angle );

			tmpAxis = tmpAxis || vec3.create();
			q = q || quat.create();

            // normalize axis
			vec3.normalize( tmpAxis, axis );

            // get quaternion
			quat.setAxisAngle( q, tmpAxis, angle );

            // apply quaternion
			this._rotation.applyQuaternion( q );

			this._updater.add( this );

		};

	} )(),

	rotate: ( function () {

		var q;

		return function ( euler ) {

			utils.checkArrNumber( euler, 3 );

			q = q || quat.create();

            // order: xyz

            // get quaternion
			quat.setFromEuler( q, euler );

            // apply quaternion
			this._rotation.applyQuaternion( q );

			this._updater.add( this );

		};

	} )(),

	applyQuaternion: function ( q ) {

		this._rotation.applyQuaternion( q );

		this._updater.add( this );

	},


    // params - value

	translateTo: function ( v ) {

		utils.checkArrNumber( v, 3 );

		vec3.copy( this._position, v );

		this._updater.add( this );

	},

	setScale: function ( v ) {

		utils.checkArrNumber( v, 3 );

		vec3.copy( this._scale, v );

		this._updater.add( this );

	},

    // params - delta

	translateX: function ( d ) {

		utils.checkNumber( d );

		this._position[ 0 ] += d;

		this._updater.add( this );

	},

	translateY: function ( d ) {

		utils.checkNumber( d );

		this._position[ 1 ] += d;

		this._updater.add( this );

	},

	translateZ: function ( d ) {

		utils.checkNumber( d );

		this._position[ 2 ] += d;

		this._updater.add( this );

	},

	translateOnDirection: ( function () {

		var tmpDir;

		return function ( dir, d ) {

			utils.checkArrNumber( dir, 3 );
			utils.checkNumber( d );

			tmpDir = tmpDir || vec3.create();

            // normalize dir
			vec3.normalize( tmpDir, dir );

            // get vector
			vec3.scale( tmpDir, tmpDir, d );

            // translate
			this.translate( tmpDir );

		};

	} )(),

	translate: function ( v ) {

		utils.checkArrNumber( v, 3 );

		vec3.add( this._position, this._position, v );

		this._updater.add( this );

	},


    // hierarchy

	add: function ( object ) {

        // cannot have multiple parents

		if ( object.parent !== null ) {

			utils.warn( this, 'Existing parent "' + object.parent + '" is removed' );
			object.parent.remove( object );

		}

		object.parent = this;
		this.children[ object._id ] = object;

		this._updateWeights();

	},

	remove: function ( object ) {

		if ( this.children[ object.objectId ] === undefined )
			utils.throwErr( this, 'Object "' + object + '" is not its children. Cannot be removed' );

		object.parent = null;
		delete this.children[ object.objectId ];

		this._updateWeights();

	},

	_updateWeights: function () {

		if ( this.parent !== null ) {

			this._weight = this.parent._weight + 1;

		} else {

			this._weight = 0;

		}

		for ( var key in this.children ) {

			if ( this.children.hasOwnProperty( key ) ) {

				this.children[ key ]._updateWeights();

			}

		}

	},

    // matrix manipulation, called by updater

	updateMatrix: function () {

		mat4.fromRotationTranslationScale( this._matrix, this._rotation._quaternion, this._position, this._scale );

		this.updateMatrixWorld();

	},

	updateMatrixWorld: function () {

		if ( this.parent === null ) {

			mat4.copy( this._matrixWorld, this._matrix );

		} else {

			mat4.multiply( this._matrixWorld, this.parent._matrixWorld, this._matrix );

		}

		mat4.invert( this._matrixWorldInverse, this._matrixWorld );
		mat3.fromMat4( this._matrixWorldInverseTranspose, this._matrixWorldInverse );
		mat3.transpose( this._matrixWorldInverseTranspose, this._matrixWorldInverseTranspose );

	},

    // getters

	getPosition: ( function () {

		var v;

		return function () {

			v = v || vec3.create();

			return vec3.copy( v, this._position );

		};

	} )(),

	getWorldPosition: ( function () {

		var v;

		return function () {

			v = v || vec3.create();

			return mat4.getTranslation( v, this._matrixWorld );

		};

	} )(),

	getEuler: function () {

		return this._rotation.getEuler();

	},

	getQuaternion: function () {

		return this._rotation.getQuaternion();

	},

	getRotationMatrix: function () {

		return this._rotation.getRotationMatrix();

	},

	getMatrix: ( function () {

		var m;

		return function () {

			m = m || mat4.create();

			return mat4.copy( m, this._matrix );

		};

	} )(),

	getMatrixWorld: ( function () {

		var m;

		return function () {

			m = m || mat4.create();

			return mat4.copy( m, this._matrixWorld );

		};

	} )(),

	getMatrixWorldInverse: ( function () {

		var m;

		return function () {

			m = m || mat4.create();

			return mat4.copy( m, this._matrixWorldInverse );

		};

	} )(),

	getMatrixWorldInverseTranspose: ( function () {

		var m;

		return function () {

			m = m || mat3.create();

			return mat3.copy( m, this._matrixWorldInverseTranspose );

		};

	} )()

};

module.exports = Object3D;
