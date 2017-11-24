// makeTextureCubeFromImages

var utils = require( './../utils' );
var glConsts = require( './../glConsts' );

module.exports = function ( folderPath, ext, opts, cb ) {

	if ( typeof folderPath !== 'string' || typeof ext !== 'string' )
		utils.throwErr( this, 'Invalid folder path "' + folderPath + '" or extension "' + ext + '"' );
	var filenames = [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ];

	this._target = glConsts.TEXTURE_CUBE_MAP;
	this._createTextureObject();
	this._config( opts );

	var loadedCount = 0;
	var scope = this;
	function imgOnload( image ) {

		loadedCount ++;
		if ( loadedCount === 6 ) {

			scope._ctx.gl.bindTexture( scope._target, scope._textureObject );
			scope._applyFilterWrapping();

			for ( var i = 0; i < 6; i ++ ) {

				scope._ctx.gl.texImage2D( glConsts.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, scope._format, scope._format, scope._type, image );

			}

			if ( typeof cb === 'function' ) cb();

		}

	}

	for ( var i = 0; i < 6; i ++ ) {

		var image = new Image();
		image.src = folderPath + '/' + filenames[ i ] + '.' + ext;
		image.onload = imgOnload.bind( null, image );

	}

};
