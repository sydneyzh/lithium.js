var glConsts = require( './glConsts' );
var utils = require( './utils' );
var Uniform = require( './Uniform' );
var mat4 = window.mat4;

var _modeConstName = [ 'POINTS', 'LINES', 'LINE_LOOP', 'LINE_STRIP', 'TRIANGLE_STRIP', 'TRIANGLE_FAN' ];

function _getModeConstName( mode ) {

	if ( typeof mode === 'string' && _modeConstName.indexOf( mode.toUpperCase() ) !== - 1 )

		return mode.toUpperCase();

}

var Shader = function ( ctx, vsSrc, fsSrc ) {

	this.isShader = true;

	this._ctx = utils.checkContext( ctx );
	this._program = undefined;
	this._vertexShader = undefined;
	this._fragmentShader = undefined;

	this._uniforms = {};
	this._meshCache = {};

	if ( typeof vsSrc === 'string' && typeof fsSrc === 'string' ) this.createProgram( vsSrc, fsSrc );

};

Shader.prototype = {

	constructor: Shader,

	_loadSource: function ( type, source ) {

		var shader = this._ctx.gl.createShader( type );
		if ( ! shader ) utils.throwErr( this, 'Cannot create shader.' );

		this._ctx.gl.shaderSource( shader, source );
		this._ctx.gl.compileShader( shader );

		if ( ! this._ctx.gl.getShaderParameter( shader, glConsts.COMPILE_STATUS ) ) {

			utils.log( this, 'Failed to compile shader: \n' +
					   this._ctx.gl.getShaderInfoLog( shader ) );
			utils.logWithLineNumber( this, source );
			utils.throwErr( this, 'program abort' );

		}

		return shader;

	},

	createProgram: function ( vsSrc, fsSrc ) {

		if ( this._program ) this.dispose();

		// create shaders
		this._vertexShader = this._loadSource( glConsts.VERTEX_SHADER, vsSrc );
		this._fragmentShader = this._loadSource( glConsts.FRAGMENT_SHADER, fsSrc );

		// create program
		this._program = this._ctx.gl.createProgram();
		if ( ! this._program ) utils.throwErr( this, 'Cannot create shader program.' );

		// attach
		this._ctx.gl.attachShader( this._program, this._vertexShader );
		this._ctx.gl.attachShader( this._program, this._fragmentShader );

		// link
		this._ctx.gl.linkProgram( this._program );
		if ( ! this._ctx.gl.getProgramParameter( this._program, glConsts.LINK_STATUS ) )
			utils.throwErr( this, 'Failed to link program: \n' +
							this._ctx.gl.getProgramInfoLog( this._program ) );

	},

	use: function () {

		this._ctx.gl.useProgram( this._program );

	},

	dispose: function () {

		this._ctx.gl.deleteProgram( this._program );
		this._ctx.gl.deleteShader( this._fragmentShader );
		this._ctx.gl.deleteShader( this._vertexShader );

		utils.clearObject( this._uniforms );
		utils.clearObject( this._meshCache );

	},

	_addUniform: function ( u ) {

		// { name, type, value }

		// name
		if ( ! u.name || this._uniforms[ u.name ] !== undefined )
			utils.throwErr( this, 'Invalid uniform name "' + u.name + '"' );

		// updateMethodName
		var updateMethodName = utils.getUniformUpdateMethodName( u.type );
		if ( ! updateMethodName )
			utils.throwErr( this, 'Invalid uniform type "' + u.type + '"' );

		// location
		var location = this._ctx.gl.getUniformLocation( this._program, u.name );
		if ( ! location )
			utils.throwErr( this, 'Cannot find uniform "' + u.name + '" location' );

		this._uniforms[ u.name ] = new Uniform( this._ctx, u.name, updateMethodName, location );

	},

	addUniform: function () {

		if ( ! this._program ) utils.throwErr( this, 'Cannot add uniform. Shader program does note exist' );

		var scope = this;
		var args = Array.prototype.slice.call( arguments );

		this.use();

		args.forEach( function ( arg ) {

			scope._addUniform( arg );
			if ( arg.value ) scope._uniforms[ arg.name ].update( arg.value );

		} );

	},

	_updateBuiltInUniform: function ( name, value ) {

		var u = this._uniforms[ name ];

		if ( u ) u.update( value );

	},

	updateUniform: function ( name, value ) {

		var u = this._uniforms[ name ];

		if ( ! u )
			utils.warn( this, 'Shader program does not have uniform "' + name + '"' );

		u.update( value );

	},

	draw: function ( camera, obj, mode ) {

		if ( obj.isObject3D && ! obj.isMesh ) {

			if ( Object.keys( obj.children ).length > 0 ) {

				for ( var key in obj.children ) {

					if ( obj.children.hasOwnProperty( key ) ) {

						this.draw( camera, obj.children[ key ], mode );

					}

				}


			} else

				utils.throwErr( this, 'Object "' + obj + '" is empty' );


		} else if ( obj.isMesh )

			this.drawMesh( camera, obj, mode );

		else

			utils.throwErr( this, 'Cannot draw object "' + obj + '"' );

	},

	drawMesh: ( function () {

		var mv = mat4.create();

		return function ( camera, mesh, mode ) {

			// todo: check buffer ctx is current ctx
			var attributes = mesh._attributes;
			var indexBuffer = mesh._indexBuffer;
			var interleaved = false;
			var stride = 0;
			var offset = 0;

			if ( mesh._interleavedBuffer ) {

				mesh._interleavedBuffer.bind( this._ctx );
				stride = mesh._stride * mesh._FSIZE;
				interleaved = true;

			}

			var id = mesh._id;

			if ( this._meshCache[ id ] === undefined )
				this._meshCache[ id ] = {};

			for ( var key in attributes ) {

				if ( attributes.hasOwnProperty( key ) ) {

					var attribute = attributes[ key ];

					var location = this._meshCache[ id ][ key ];
					if ( location === undefined ) {

						location = this._ctx.gl.getAttribLocation( this._program, key );
						if ( location >= Object.keys( attributes ) ) utils.throwErr( this, 'Invalid attribute found in shader' );
						this._meshCache[ id ][ key ] = location;

					}

					if ( location === - 1 ) continue;

					if ( ! interleaved )
						attribute.bindBuffer( this._ctx );

					this._ctx.gl.enableVertexAttribArray( location );

					if ( interleaved )
						offset = attribute._offset * mesh._FSIZE;

					this._ctx.gl.vertexAttribPointer( location, attribute._dataSpacing, attribute._type, false, stride, offset );

				}

			}

			if ( camera && camera.isCamera ) {

				var modelMatrix = mesh._matrixWorld;
				var modelMatrixInv = mesh._matrixWorldInverse;
				var normalMatrix = mesh._matrixWorldInverseTranspose;
				var viewMatrix = camera._viewMatrix;
				var projectionMatrix = camera._projectionMatrix;
				var cameraPosition = camera.getWorldPosition();
				mat4.multiply( mv, viewMatrix, modelMatrix );

				this._updateBuiltInUniform( 'u_ModelMatrix', modelMatrix );
				this._updateBuiltInUniform( 'u_ModelMatrixInv', modelMatrixInv );
				this._updateBuiltInUniform( 'u_NormalMatrix ', normalMatrix );
				this._updateBuiltInUniform( 'u_ViewMatrix', viewMatrix );
				this._updateBuiltInUniform( 'u_ProjectionMatrix', projectionMatrix );
				this._updateBuiltInUniform( 'u_CameraPosition', cameraPosition );
				this._updateBuiltInUniform( 'u_ModelViewMatrix', mv );

			}

			if ( mode === undefined && indexBuffer !== undefined ) {

				if ( ! this._meshCache[ id ].indexBufferDataType ) {

					var dataType = utils.indexBufferArrayType2DataType( indexBuffer._data.constructor.name );
					this._meshCache[ id ].indexBufferDataType = dataType;

				}
				var indexBufferDataType = this._meshCache[ id ].indexBufferDataType;

				indexBuffer.bind( this._ctx );

				this._ctx.gl.drawElements( glConsts.TRIANGLES, indexBuffer._data.length, indexBufferDataType, 0 );

			} else {

				var modeConstName = _getModeConstName( mode );

				if ( ! modeConstName ) utils.throwErr( this, 'Invalid draw mode "' + mode + '"' );

				this._ctx.gl.drawArrays( glConsts[ modeConstName ], 0, mesh.getVertexNumber() );

			}

		};

	} )()

};

module.exports = Shader;
