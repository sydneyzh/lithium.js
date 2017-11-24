var vec3 = window.vec3;
var mat4 = window.mat4;

var VRCamera = function () {

	this.isCamera = true;
	this.isVRCamera = true;

	this._position = vec3.create();
	this._viewMatrix = mat4.create();
	this._projectionMatrix = mat4.create();

	this._eyeTranslation = vec3.create();

};

VRCamera.prototype = {

	constructor: VRCamera,

	setEyeTranslation: function ( eyeOffset ) {

		vec3.copy( this._eyeTranslation, eyeOffset );

	},

	update: function ( sceneCameraPosition, viewMat, projMat ) {

		vec3.add( this._position, sceneCameraPosition, this._eyeTranslation );

		// offset vrCamera viewMatrix with scene camera position
		mat4.identity( this._viewMatrix );
		mat4.translate( this._viewMatrix, this._viewMatrix, sceneCameraPosition );
		mat4.invert( this._viewMatrix, this._viewMatrix );
		mat4.multiply( this._viewMatrix, viewMat, this._viewMatrix );

		mat4.copy( this._projectionMatrix, projMat );

	},

	getPosition: function () {

		return this._position;

	},

	getWorldPosition: function () {

		return this._position;

	},

	getViewMatrix: function () {

		return this._viewMatrix;

	},

	getProjectionMatrix: function () {

		return this._projectionMatrix;

	}

};

module.exports = VRCamera;
