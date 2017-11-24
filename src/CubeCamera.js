var utils = require( './utils' );
var Object3D = require( './Object3D' );
var Camera = require( './Camera' );
var vec3 = window.vec3;

var CubeCamera = function ( updater, near, far ) {

	Object3D.call( this, updater );

	this.isCubeCamera = true;

	utils.checkNumber( near, far );

	near = near || 1;
	far = far || 10000;

	var fov = 90;
	var aspect = 1;

	var cameraPX = new Camera( updater );
	var cameraNX = new Camera( updater );
	var cameraPY = new Camera( updater );
	var cameraNY = new Camera( updater );
	var cameraPZ = new Camera( updater );
	var cameraNZ = new Camera( updater );

	this.cameras = [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ];

	cameraPX.makePerspective( fov, aspect, near, far );
	cameraNX.makePerspective( fov, aspect, near, far );
	cameraPY.makePerspective( fov, aspect, near, far );
	cameraNY.makePerspective( fov, aspect, near, far );
	cameraPZ.makePerspective( fov, aspect, near, far );
	cameraNZ.makePerspective( fov, aspect, near, far );

	cameraPX.setTop( vec3.fromValues( 0, - 1, 0 ) );
	cameraNX.setTop( vec3.fromValues( 0, - 1, 0 ) );
	cameraPY.setTop( vec3.fromValues( 0, 0, 1 ) );
	cameraNY.setTop( vec3.fromValues( 0, 0, - 1 ) );
	cameraPZ.setTop( vec3.fromValues( 0, - 1, 0 ) );
	cameraNZ.setTop( vec3.fromValues( 0, - 1, 0 ) );

	cameraPX.lookAt( vec3.fromValues( 1, 0, 0 ) );
	cameraNX.lookAt( vec3.fromValues( - 1, 0, 0 ) );
	cameraPY.lookAt( vec3.fromValues( 0, 1, 0 ) );
	cameraNY.lookAt( vec3.fromValues( 0, - 1, 0 ) );
	cameraPZ.lookAt( vec3.fromValues( 0, 0, 1 ) );
	cameraNZ.lookAt( vec3.fromValues( 0, 0, - 1 ) );

	this.add( cameraPX );
	this.add( cameraNX );
	this.add( cameraPY );
	this.add( cameraNY );
	this.add( cameraPZ );
	this.add( cameraNZ );

};

Object.assign( CubeCamera.prototype, Object3D.prototype );

module.exports = CubeCamera;
