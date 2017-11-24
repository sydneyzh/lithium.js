// makeTextureCubeFromLoadedImages

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( images, opts ) {

	if ( ! images || ! Array.isArray( images ) )
		utils.throwErr( this, 'Invalid image array "' + images + '"' );

	images.forEach( function ( image ) {

		if ( ! image || image.constructor.name !== 'HTMLImageElement' )
			utils.throwErr( this, 'Invalid image ' + image );

	} );

	this._target = glConsts.TEXTURE_CUBE_MAP;
	this._createTextureObject();
	this._config( opts );

	this._ctx.gl.bindTexture( this._target, this._textureObject );
	this._applyFilterWrapping();

	for ( var i = 0; i < 6; i ++ ) {

		this._ctx.gl.texImage2D( glConsts.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this._format, this._format, this._type, images[ i ] );

	}

};
