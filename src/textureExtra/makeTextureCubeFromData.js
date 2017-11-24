// makeTextureCubeFromData

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( pixelArrays, opts ) {

	this._target = glConsts.TEXTURE_CUBE_MAP;
	this._createTextureObject();
	this._config( opts );

	if ( pixelArrays !== null ) {

		if ( ( ! Array.isArray( pixelArrays ) || pixelArrays.length !== 6 ) )
			utils.throwErr( this, 'Invalid parameter. Should be an array containing 6 arrays' );

		pixelArrays.forEach( function ( arr ) {

			this._checkPixelArrType( arr );

		} );

	}

	this._ctx.gl.bindTexture( this._target, this._textureObject );
	this._applyFilterWrapping();

	for ( var i = 0; i < 6; i ++ ) {

		this._ctx.gl.texImage2D( glConsts.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this._format, this._width, this._height, 0, this._format, this._type, pixelArrays === null ? null : pixelArrays[ i ] );

	}

};
