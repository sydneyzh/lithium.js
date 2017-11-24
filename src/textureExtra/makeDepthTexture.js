// makeDepthTexture

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( opts ) {

	if ( ! utils.canUseExtension( 'WEBGL_depth_texture' ) )
		utils.throwErr( this, 'Program abort' );

	this._target = glConsts.TEXTURE_2D;
	this._createTextureObject();
	this._config( opts );

	this._ctx.gl.bindTexture( this._target, this._textureObject );
	this._applyFilterWrapping();
	this._ctx.gl.texImage2D( this._target, 0, glConsts.DEPTH_COMPONENT, this._width, this._height, 0, glConsts.DEPTH_COMPONENT, this._type, null );

};
