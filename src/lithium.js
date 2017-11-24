if ( ! window.glMatrix ) {

	var glm = require( 'gl-matrix' );

	window.glMatrix = glm;
	window.vec2 = glm.vec2;
	window.vec3 = glm.vec3;
	window.vec4 = glm.vec4;
	window.mat2 = glm.mat2;
	window.mat2d = glm.mat2d;
	window.mat3 = glm.mat3;
	window.mat4 = glm.mat4;
	window.quat = glm.quat;

}

window.spherical = require( './spherical' );
Object.assign( window.vec3, require( './vec3' ) );
Object.assign( window.quat, require( './quat' ) );
Object.assign( window.mat4, require( './mat4' ) );

module.exports = {

	glConsts: require( './glConsts' ),
	math: require( './math' ),
	utils: require( './utils' ),
	GLContext: require( './GLContext' ),
	Rotation: require( './Rotation' ),
	Updater: require( './Updater' ),
	Object3D: require( './Object3D' ), // needs updater
	Mesh: require( './Mesh' ), // needs updater
	Face: require( './Face' ),
	Camera: require( './Camera' ), // needs updater
	CubeCamera: require( './CubeCamera' ), // needs updater
	VRCamera: require( './VRCamera' ),
	Ray: require( './Ray' ),
	Shader: require( './Shader' ), // needs ctx
	Texture: require( './Texture' ), // needs ctx
	FBO: require( './FBO' ), // needs ctx
	AABB: require( './AABB' ), // needs updater
	parseOBJData: require( './parseOBJData' ),
	loadOBJFile: require( './loadOBJFile' )
};
