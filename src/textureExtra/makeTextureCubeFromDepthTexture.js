// makeTextureCubeFromDepthTexture

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( opts ) {

	if ( ! utils.canUseExtension( 'WEBGL_depth_texture' ) )
		utils.throwErr( this, 'Program abort' );

	this._target = glConsts.TEXTURE_CUBE_MAP;
	this._createTextureObject();
	this._config( opts );

	this._ctx.gl.bindTexture( this._target, this._textureObject );
	this._applyFilterWrapping();

	for ( var i = 0; i < 6; i ++ ) {

		this._ctx.gl.texImage2D( glConsts.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glConsts.DEPTH_COMPONENT, this._width, this._height, 0, glConsts.DEPTH_COMPONENT, this._type, null );

	}

};
