var utils = require( './utils' );
var glConsts = require( './glConsts' );

function toPow2( num ) {

	if ( ( ( num - 1 ) & num ) === 0 ) {

		return num;

	}

	num *= 2;
	var k = Math.floor( Math.log( num ) / Math.log( 2 ) );
	return ( num >> k ) << k;

}



var Texture = function ( ctx, w, h ) {

	this.isTexture = true;

	this._ctx = utils.checkContext( ctx );

	this._width = undefined;
	this._height = undefined;

	this._target = undefined;
	this._type = undefined;
	this._format = undefined;

	this._textureObject = undefined;

	this._minFilter = undefined;
	this._magFilter = undefined;

	this._wrapS = undefined;
	this._wrapT = undefined;

	if ( ! w || ! h ) utils.throwErr( this, 'Missing texture width and height' );
	this.setSize( w, h );

};

Texture.prototype = {

	constructor: Texture,

	_config: function ( opts ) {

		opts = opts || {};

		if ( this._target === glConsts.TEXTURE_CUBE_MAP )

			this._format = glConsts.RGB;

		else

            this._format = ( opts.format !== undefined ) ? opts.format : glConsts.RGBA;

		this._type = ( opts.type !== undefined ) ? opts.type : glConsts.UNSIGNED_BYTE;

		this._magFilter = ( opts.magFilter !== undefined ) ? opts.magFilter : glConsts.LINEAR;
		this._minFilter = ( opts.minFilter !== undefined ) ? opts.minFilter : glConsts.LINEAR;

		this._wrapS = ( opts.wrapS !== undefined ) ? opts.wrapS : glConsts.CLAMP_TO_EDGE;
		this._wrapT = ( opts.wrapT !== undefined ) ? opts.wrapT : glConsts.CLAMP_TO_EDGE;

		this._checkConfig();

	},

	_checkConfig: function () {

		if ( this._type === glConsts.FLOAT ) {

			if ( ! utils.canUseExtension( this._ctx, 'OES_texture_float' ) )

				utils.throwErr( this, 'Program abort' );

			if ( this._minFilter !== glConsts.NEAREST || this._magFilter !== glConsts.NEAREST ) {

				if ( ! utils.canUseExtension( this._ctx, 'OES_texture_float_linear' ) )

					utils.throwErr( this, 'Program abort' );

			}

		} else if ( this._type === glConsts.HALF_FLOAT_OES ) {

			if ( ! utils.canUseExtension( this._ctx, 'OES_texture_half_float' ) )

				utils.throwErr( this, 'Program abort' );

			if ( this._minFilter !== glConsts.NEAREST || this._magFilter !== glConsts.NEAREST ) {

				if ( ! utils.canUseExtension( this._ctx, 'OES_texture_half_float_linear' ) )

					utils.throwErr( this, 'Program abort' );

			}

		}

		if ( this._minFilter !== glConsts.NEAREST && this._minFilter !== glConsts.LINEAR )

			this._ctx.gl.generateMipmap( this._target );

		if ( this._target === glConsts.TEXTURE_CUBE_MAP && ( this._width !== this._height ) ) {

			this._height = this._width;

			utils.warn( this, 'TextureCube is resized to ' + this._width + ' ' + this._height + '. Aspect ratio must be 1' );

		}

	},

	_checkPixelArrType: function ( pixelArray ) {

		if ( pixelArray !== null ) {

			var arrType = pixelArray.constructor.name;
			var validArrType = utils.dataType2ArrayType( this._type );
			if ( arrType !== validArrType )
				utils.throwErr( this, 'Invalid pixel array type "' + arrType + '". Should be "' + validArrType + '"' );

		}

	},

	hasTextureObject: function () {

		return this._textureObject !== undefined;

	},

	_createTextureObject: function () {

		if ( this.hasTextureObject() )
			this._ctx.gl.deleteTexture( this._textureObject );

		this._textureObject = this._ctx.gl.createTexture();

	},

	_applyFilterWrapping: function () {

		this._ctx.gl.texParameteri( this._target, glConsts.TEXTURE_MIN_FILTER, this._minFilter );
		this._ctx.gl.texParameteri( this._target, glConsts.TEXTURE_MAG_FILTER, this._magFilter );
		this._ctx.gl.texParameteri( this._target, glConsts.TEXTURE_WRAP_S, this._wrapS );
		this._ctx.gl.texParameteri( this._target, glConsts.TEXTURE_WRAP_T, this._wrapT );

	},

	bind: function ( unit ) {

		if ( ! this._target ) utils.throwErr( this, 'Texture is not made.' );

		this._ctx.gl.activeTexture( glConsts.TEXTURE0 + ( unit || 0 ) );
		this._ctx.gl.bindTexture( this._target, this._textureObject );

	},

	unbind: function ( unit ) {

		if ( ! this._target ) utils.throwErr( this, 'Texture is not made.' );

		this._ctx.gl.activeTexture( this._ctx.gl.TEXTURE0 + ( unit || 0 ) );
		this._ctx.gl.bindTexture( this._target, null );

	},

	setSize: function ( w, h ) {

		utils.checkNumber( w, h );

		if ( w <= 0 || h <= 0 )

			utils.throwErr( this, 'Invalid texture width and/or height' );

		if ( ( ( w - 1 ) & w ) === 0 && ( ( h - 1 ) & h ) === 0 ) {

			this._width = w;
			this._height = h;

		} else {

			var len = ( w > h ) ? w : h;
			len = toPow2( len );

			this._width = len;
			this._height = len;

			utils.warn( this, 'Texture is resized from ' + w + ' by ' + h + ' to ' + this._width + ' by ' + this._height );

		}

	}

};

Texture.prototype.makeDepthTexture =
    require( './textureExtra/makeDepthtexture' );

Texture.prototype.makeFromData =
    require( './textureExtra/makeFromData' );

Texture.prototype.makeFromImage =
    require( './textureExtra/makeFromImage' );

Texture.prototype.makeFromLoadedImage =
    require( './textureExtra/makeFromLoadedImage' );

Texture.prototype.makeTextureCubeFromData =
    require( './textureExtra/makeTextureCubeFromData' );

Texture.prototype.makeTextureCubeFromDepthTexture =
    require( './textureExtra/makeTextureCubeFromDepthTexture' );

Texture.prototype.makeTextureCubeFromImages =
    require( './textureExtra/makeTextureCubeFromImages' );

Texture.prototype.makeTextureCubeFromLoadedImages =
    require( './textureExtra/makeTextureCubeFromLoadedImages' );

module.exports = Texture;
