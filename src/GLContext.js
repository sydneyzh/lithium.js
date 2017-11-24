var glConsts = require( './glConsts' );
var utils = require( './utils' );
var vec4 = window.vec4;

function GLContext() {

	this.isGLContext = true;
	this.gl = undefined;
	this.canvas = undefined;
	this._viewportConfigs = {};
	this._currentViewportKey = undefined;

}

GLContext.prototype = {

	constructor: GLContext,

	getWebGLContext: function ( canvas, opts ) {

		if ( ! ( canvas instanceof HTMLCanvasElement ) )
			utils.throwErr( this, '"canvas" must be an HTMLCanvasElement.' );

		try {

			this.gl = canvas.getContext( 'webgl', opts );

		} catch ( e ) {

			utils.err( this, 'cannot get WebGL context ' + e );

		}

		try {

			this.gl = this.gl || canvas.getContext( 'experimental-webgl', opts );

		} catch ( e ) {

			utils.err( this, 'cannot get experimental WebGL context ' + e );

		}

		if ( ! this.gl ) {

			utils.throwErr( this, 'WebGL is not supported by your browser.' );

		}

		this.canvas = canvas;
		var left = opts.left || 0;
		var bottom = opts.bottom || 0;
		var width = opts.width || this.canvas.width;
		var height = opts.height || this.canvas.height;
		this.addViewportConfig( 'default', left, bottom, width, height );
		this.resizeViewport();

		this.gl.enable( glConsts.DEPTH_TEST );
		this.gl.clearColor( 0, 0, 0, 1 );

	},

	addViewportConfig: function ( key, l, t, w, h ) {

		if ( ! key || this._viewportConfigs[ key ] !== undefined )
			utils.throwErr( this, 'Invalid viewport config key' + key );

		this._checkViewportConfig( l, t, w, h );
		this._viewportConfigs[ key ] = vec4.fromValues( l, t, w, h );

	},

	setViewportConfig: function ( key, l, t, w, h ) {

		var config = this._viewportConfigs[ key ];
		if ( ! config ) utils.throwErr( this, 'Viewport config ' + key + ' not found' );
		this._checkViewportConfig( l, t, w, h );
		vec4.set( config, l, t, w, h );

	},

	_checkViewportConfig: function ( l, t, w, h ) {

		if ( ! this.canvas ) utils.throwErr( this, 'Cannot find canvas' );

		utils.checkNumber( l, t, w, h );

		if ( l < 0 || l > w ||
			 t < 0 || t > h )
			utils.throwErr( this, 'Invalid viewport config ' + l + t + w + h );

	},

	resizeViewport: function ( key ) {

		utils.checkContext( this );

		key = key || 'default';
		var config = this._viewportConfigs[ key ];
		if ( ! config ) utils.throwErr( this, 'Invalid viewport config key ' + key );

		this.gl.viewport( config[ 0 ], config[ 1 ], config[ 2 ], config[ 3 ] );
		this._currentViewportKey = key;

	},

	getCurrentViewportKey: function () {

		return this._currentViewportKey;

	}

};

module.exports = GLContext;
