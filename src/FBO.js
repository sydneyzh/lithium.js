var utils = require( './utils' );
var glConsts = require( './glConsts' );

var FBO = function ( ctx, opts ) {

	this.isFBO = true;

	this._ctx = utils.checkContext( ctx );
	this._framebuffer = this._ctx.gl.createFramebuffer();
	this._renderbuffer = undefined;

	this._clearColor = undefined;
	this._clearColorReset = undefined;

	if ( opts ) {

		if ( opts.clearColor ) {

			utils.checkArrNumber( opts.clearColor, 4 );

			this._clearColor = opts.clearColor;
			this._clearColorReset = this._ctx.gl.getParameter( glConsts.COLOR_CLEAR_VALUE );

		}

	}

};

FBO.prototype = {

	constructor: FBO,

	checkComplete: function () {

		var status = this._ctx.gl.checkFramebufferStatus( glConsts.FRAMEBUFFER );
		if ( status !== glConsts.FRAMEBUFFER_COMPLETE )
			utils.throwErr( this, 'Framebuffer incomplete: ' + status.toString( 16 ).toUpperCase() );

	},

	_checkTextureValid: function ( texture ) {

		if ( ! ( texture.isTexture && texture.hasTextureObject() && texture._ctx === this._ctx ) )
			utils.throwErr( this, 'Invalid texture "' + texture + '"' );

	},

	drawTo: function ( texture, callback, hasDepthTest, depthTexture ) {

		this._checkTextureValid( texture );

		if ( typeof callback !== 'function' )
			utils.throwErr( this, 'Missing callback' );

		var viewportKey = this._ctx.getCurrentViewportKey();
		this._ctx.gl.viewport( 0, 0, texture._width, texture._height );

		this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, this._framebuffer );

		if ( hasDepthTest ) {

			this._renderbuffer = this._renderbuffer ||
				this._ctx.gl.createRenderbuffer();

			this._ctx.gl.bindRenderbuffer(
				glConsts.RENDERBUFFER,
				this._renderbuffer
			);
			this._ctx.gl.renderbufferStorage(
				glConsts.RENDERBUFFER,
				glConsts.DEPTH_COMPONENT16,
				texture._width,
				texture._height
			);
			this._ctx.gl.framebufferRenderbuffer(
				glConsts.FRAMEBUFFER,
				glConsts.DEPTH_ATTACHMENT,
				glConsts.RENDERBUFFER,
				this._renderbuffer
			);

		}

		this._ctx.gl.framebufferTexture2D(
			glConsts.FRAMEBUFFER,
			glConsts.COLOR_ATTACHMENT0,
			glConsts.TEXTURE_2D,
			texture._textureObject,
			0
		);

		if ( depthTexture && depthTexture.isTexture && depthTexture._target ) {

			if ( depthTexture._width !== texture._width &&
				 depthTexture._height !== texture._height )
				utils.throwErr( this, 'Cannot draw to two textures with different sizes.' );


			this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, this._framebuffer );

			this._ctx.gl.framebufferTexture2D(
				glConsts.FRAMEBUFFER,
				glConsts.DEPTH_ATTACHMENT,
				glConsts.TEXTURE_2D,
				depthTexture._textureObject,
				0
			);

		}

		this.checkComplete();

		this.clear();

		callback();

		this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, null );
		if ( hasDepthTest )
			this._ctx.gl.bindRenderbuffer( glConsts.RENDERBUFFER, null );

		this._ctx.resizeViewport( viewportKey );

	},

	drawToTextureCube: function ( cubeCamera, textureCube, callback, hasDepthTest, depthTextureCube ) {

		if ( ! cubeCamera.isCubeCamera )
			utils.throwErr( this, 'Invalid camera' );

		this._checkTextureValid( textureCube );

		if ( typeof callback !== 'function' )
			utils.throwErr( this, 'Missing callback' );

		var viewportKey = this._ctx.getCurrentViewportKey();
		this._ctx.gl.viewport( 0, 0, textureCube._width, textureCube._height );
		this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, this._framebuffer );

		for ( var i = 0; i < 6; i ++ ) {

			if ( hasDepthTest ) {

				this._renderbuffer = this._renderbuffer ||
					this._ctx.gl.createRenderbuffer();

				this._ctx.gl.bindRenderbuffer(
					glConsts.RENDERBUFFER,
					this._renderbuffer
				);
				this._ctx.gl.renderbufferStorage(
					glConsts.RENDERBUFFER,
					glConsts.DEPTH_COMPONENT16,
					textureCube._width,
					textureCube._height
				);
				this._ctx.gl.framebufferRenderbuffer(
					glConsts.FRAMEBUFFER,
					glConsts.DEPTH_ATTACHMENT,
					glConsts.RENDERBUFFER,
					this._renderbuffer
				);

			}

			this._ctx.gl.framebufferTexture2D(
				glConsts.FRAMEBUFFER,
				glConsts.COLOR_ATTACHMENT0,
				glConsts.TEXTURE_CUBE_MAP_POSITIVE_X + i,
				textureCube._textureObject,
				0
			);

			if ( depthTextureCube && depthTextureCube.isTexture && depthTextureCube._target ) {

				if ( depthTextureCube._width !== textureCube._width &&
				 depthTextureCube._height !== textureCube._height )
					utils.throwErr( this, 'Cannot draw to two textures with different sizes.' );

				this._ctx.gl.framebufferTexture2D(
					glConsts.FRAMEBUFFER,
					glConsts.DEPTH_ATTACHMENT,
					glConsts.TEXTURE_CUBE_MAP_POSITIVE_X + i,
					depthTextureCube._textureObject,
					0
				);

			}

			this.clear( hasDepthTest );

			var camera = cubeCamera.cameras[ i ];
			callback( camera );

		}

		this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, null );
		if ( hasDepthTest ) this._ctx.gl.bindRenderbuffer( glConsts.RENDERBUFFER, null );
		this._ctx.resizeViewport( viewportKey );

	},

	_clearCanvas: function ( hasDepthTest ) {

		if ( hasDepthTest ) {

			this._ctx.gl.clear( glConsts.COLOR_BUFFER_BIT | glConsts.DEPTH_BUFFER_BIT );

		} else {

			this._ctx.gl.clear( glConsts.COLOR_BUFFER_BIT );

		}

	},

	clear: function ( hasDepthTest ) {

		if ( ! this._clearColor ) this._clearCanvas( hasDepthTest );
		else {

			this._ctx.gl.clearColor( this._clearColor[ 0 ],
									 this._clearColor[ 1 ],
									 this._clearColor[ 2 ],
									 this._clearColor[ 3 ] );

			this._clearCanvas( hasDepthTest );

			this._ctx.gl.clearColor( this._clearColorReset[ 0 ],
									 this._clearColorReset[ 1 ],
									 this._clearColorReset[ 2 ],
									 this._clearColorReset[ 3 ] );

		}

	},

	readPixels: function ( pixels, texture, x, y, w, h, format, type ) {

		utils.checkNumber( x, y, w, h );
		if ( ! pixels ) utils.throwErr( this, 'Missing pixel array' );
		this._checkTextureValid( texture );

		// x,y is from lower left corner
		if ( x < 0 || y < 0 || w > texture._width || h > texture._height )
			utils.throwErr( this, 'Invalid dimension.' );

		format = format || texture._format;
		type = type || texture._type;

		this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, this._framebuffer );

		this._ctx.gl.framebufferTexture2D(
			glConsts.FRAMEBUFFER,
			glConsts.COLOR_ATTACHMENT0,
			glConsts.TEXTURE_2D,
			texture._textureObject,
			0
		);

		this.checkComplete();

		this._ctx.gl.readPixels( x, y, w, h, format, type, pixels );

		this._ctx.gl.bindFramebuffer( glConsts.FRAMEBUFFER, null );

	}

};

module.exports = FBO;
