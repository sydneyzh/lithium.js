// makeFromImage

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( src, opts, cb ) {

	if ( ! src || typeof src !== 'string' )
		utils.throwErr( this, 'Missing image src' );

	this._target = glConsts.TEXTURE_2D;
	this._createTextureObject();
	this._config( opts );

	var image = new Image();
	image.src = src;
	var scope = this;
	image.onload = function () {

		scope._ctx.gl.pixelStorei( glConsts.UNPACK_FLIP_Y_WEBGL, 1 );
		scope._ctx.gl.bindTexture( scope._target, scope._textureObject );
		scope._applyFilterWrapping();
		scope._ctx.gl.texImage2D( scope._target, 0, scope._format, scope._format, scope._type, image );

		if ( typeof cb === 'function' ) cb();

	};

};
