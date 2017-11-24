var utils = require( './utils' );
var glConsts = require( './glConsts' );
var Object3D = require( './Object3D' );
var Attribute = require( './Attribute' );
var Buffer = require( './Buffer' );

var Mesh = function ( updater ) {

	Object3D.call( this, updater );

	this.isMesh = true;
	this._attributes = {};
	this._indexBuffer = undefined;

	this._vertexNum;
	this._interleavedBuffer = undefined;
	this._stride = undefined;
	this._FSIZE = undefined;

	this.faces = undefined;

};

Object.assign( Mesh.prototype, Object3D.prototype, {

	setVertexNumber: function ( attributeName ) {

		var data, vertexNum;

		if ( attributeName ) {

			data = this._attributes[ attributeName ]._data;
			vertexNum = data.length / this._attributes[ attributeName ]._dataSpacing;

		} else {

			data = this._attributes.a_Position._data ||
                this._attributes.a_Normal._data;

			if ( data )
				vertexNum = data.length / 3;

		}

		if ( ! vertexNum ) utils.throwErr( this, 'Unable to calculate vertex number' );

		this._vertexNum = vertexNum;

		return vertexNum;

	},

	getVertexNumber: function ( attributeName ) {

		return this._vertexNum || ( this.setVertexNumber( attributeName ) );

	},

	_addAttribute: function ( params ) {

		if ( params.name === undefined || params.type === undefined || params.spacing === undefined || params.data === undefined )
			utils.throwErr( this, 'Missing parameter(s)' );

		if ( this._attributes[ params.name ] !== undefined )
			utils.throwErr( this, 'Attribute "' + params.name + '" already exist' );

		this._attributes[ params.name ] = new Attribute( params );

	},

	addAttribute: function () {

		var scope = this;
		var args = Array.prototype.slice.call( arguments );

		args.forEach( function ( arg ) {

			scope._addAttribute( arg );

		} );

	},

	makeAttributeBuffers: function ( ctx ) {

		for ( var key in this._attributes ) {

			if ( this._attributes.hasOwnProperty( key ) )
				this._attributes[ key ].makeBuffer( ctx );

		}

	},

	makeInterleavedBuffer: function ( ctx ) {

		if ( this._interleavedBuffer ) this._interleavedBuffer.dispose();

		var vertexNum = this.getVertexNumber();

		this._stride = 0;
		for ( var key in this._attributes ) {

			this._stride += this._attributes[ key ]._dataSpacing;

		}

		this._FSIZE = 4;

		var data = new Float32Array( vertexNum * this._stride );

		for ( var i = 0, vLen = vertexNum; i < vLen; i ++ ) {

			var l = 0;

			for ( var j = 0, aLen = Object.keys( this._attributes ).length; j < aLen; j ++ ) {

				var attribute = this._attributes[ Object.keys( this._attributes )[ j ] ];
				var m = 0;

				for ( var k = 0, aSpace = attribute._dataSpacing; k < aSpace; k ++ ) {

					data[ i * this._stride + l ] = attribute._data[ i * aSpace + m ];
					l ++;
					m ++;

				}

			}

		}

		this._interleavedBuffer = new Buffer( ctx, data, glConsts.ARRAY_BUFFER );

	},

	addIndexBuffer: function ( ctx, data ) {

		if ( this._indexBuffer ) this._indexBuffer.dispose();

		this._indexBuffer = new Buffer( ctx, data, glConsts.ELEMENT_ARRAY_BUFFER );

	},

	compile: function ( isDynamic ) {

		if ( this._interleavedBuffer !== undefined ) {

			this._interleavedBuffer.compile( false );

		} else {

			for ( var name in this._attributes ) {

				if ( this._attributes.hasOwnProperty( name ) )
					this._attributes[ name ].compileBuffer( isDynamic );

			}

		}

		if ( this._indexBuffer !== undefined )
			this._indexBuffer.compile();

	}

} );

Mesh.prototype.makeCircle =
    require( './meshExtra/makeCircle.js' );

Mesh.prototype.makeCube =
    require( './meshExtra/makeCube.js' );

Mesh.prototype.makePlaneWireframe =
    require( './meshExtra/makePlaneWireframe.js' );

Mesh.prototype.makeLine =
    require( './meshExtra/makeLine.js' );

Mesh.prototype.makePlane =
    require( './meshExtra/makePlane.js' );

Mesh.prototype.makeSphere =
    require( './meshExtra/makeSphere.js' );

Mesh.prototype.makeQuad =
    require( './meshExtra/makeQuad.js' );

Mesh.prototype.makeCylinder =
    require( './meshExtra/makeCylinder.js' );

Mesh.prototype.computeVertexNormals =
    require( './meshExtra/computeVertexNormals.js' );

Mesh.prototype.raycast =
    require( './meshExtra/raycast.js' );

module.exports = Mesh;
