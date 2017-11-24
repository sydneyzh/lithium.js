// makeFromData

var glConsts = require( './../glConsts' );

module.exports = function ( pixelArray, opts ) {

	this._target = glConsts.TEXTURE_2D;
	this._createTextureObject();
	this._config( opts );

	this._checkPixelArrType( pixelArray );

	this._ctx.gl.pixelStorei( glConsts.UNPACK_ALIGNMENT, 1 );
	this._ctx.gl.bindTexture( this._target, this._textureObject );
	this._applyFilterWrapping();
	this._ctx.gl.texImage2D( this._target, 0, this._format, this._width, this._height, 0, this._format, this._type, pixelArray );

};
