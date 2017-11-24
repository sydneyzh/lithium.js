// makeFromLoadedImage

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( image, opts ) {

	if ( ! image || image.constructor.name !== 'HTMLImageElement' )
		utils.throwErr( this, 'Invalid image ' + image );

	this._target = glConsts.TEXTURE_2D;
	this._createTextureObject();
	this._config( opts );

	this._ctx.gl.pixelStorei( glConsts.UNPACK_FLIP_Y_WEBGL, 1 );
	this._ctx.gl.bindTexture( this._target, this._textureObject );
	this._applyFilterWrapping();
	this._ctx.gl.texImage2D( this._target, 0, this._format, this._format, this._type, image );

};
