var utils = require( './utils' );
var vec3 = window.vec3;
var mat3 = window.mat3;
var quat = window.quat;

var Rotation = function () {

	this.isRotation = true;

	this._euler = vec3.create();
	this._quaternion = quat.create();

};

Rotation.prototype = {

	constructor: Rotation,

	setEuler: function ( euler ) {

		utils.checkArrNumber( euler, 3 );

		vec3.copy( this._euler, euler );

		this._syncQuaternion();

	},

	setQuaternion: function ( qt ) {

		utils.checkArrNumber( qt, 4 );

		quat.copy( this._quaternion, qt );

		this._syncEuler();

	},

	setRotationMatrix: ( function () {

		var euler;

		return function ( m ) {

			utils.checkMatNumber( m, 3, 3 );

			euler = euler || vec3.create();

			vec3.setFromRotationMatrix( euler, m );

			this.setEuler( euler );

		};

	} )(),

	rotateX: function ( angle ) {

		utils.checkNumber( angle );

		quat.rotateX( this._quaternion, this._quaternion, angle );

		this._syncEuler();

	},

	rotateY: function ( angle ) {

		utils.checkNumber( angle );

		quat.rotateY( this._quaternion, this._quaternion, angle );

		this._syncEuler();

	},

	rotateZ: function ( angle ) {

		utils.checkNumber( angle );

		quat.rotateZ( this._quaternion, this._quaternion, angle );

		this._syncEuler();

	},

	applyQuaternion: function ( qt ) {

		utils.checkArrNumber( qt, 4 );

		quat.multiply( this._quaternion, this._quaternion, qt );

		this._syncEuler();

	},

	_syncEuler: function () {

		vec3.setFromQuaternion( this._euler, this._quaternion );

	},

	_syncQuaternion: function () {

		quat.setFromEuler( this._quaternion, this._euler );

	},

	getEuler: ( function () {

		var v;

		return function () {

			v = v || vec3.create();

			return vec3.copy( v, this._euler );

		};

	} )(),

	getQuaternion: ( function () {

		var v;

		return function () {

			v = v || quat.create();

			return quat.copy( v, this._quaternion );

		};

	} )(),

	getRotationMatrix: ( function () {

		var m;

		return function () {

			m = m || mat3.create();

			return mat3.fromRotation( m, this._quaternion );

		};

	} )()

};

module.exports = Rotation;
