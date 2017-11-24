var utils = require( './utils' );
var Buffer = require( './Buffer' );
var glConsts = require( './glConsts' );

var Attribute = function ( params ) {

    // { name, type, [offset], data }

	this.isAttribute = true;

	this._name = params.name;
	this._type = utils.checkAttribDataType( params.type );
	this._dataSpacing = utils.checkAttribDataSpacing( params.spacing );
	this._offset = params.offset || 0;

	this._data = params.data;
	this._units = Math.floor( params.data.length / this._dataSpacing );
	this._buffer = undefined;

};

Attribute.prototype = {

	constructor: Attribute,

	bindBuffer: function ( ctx ) {

		if ( ! this._buffer ) utils.throwErr( this, 'Attribute ' + this._name + ' does not have a buffer' );

		this._buffer.bind( ctx );

	},

	makeBuffer: function ( ctx ) {

		if ( this._buffer ) this._buffer.dispose();

		this._buffer = new Buffer( ctx, this._data, glConsts.ARRAY_BUFFER );

	},

	compileBuffer: function ( isDynamic ) {

		if ( ! this._buffer ) utils.throwErr( this, 'Attribute ' + this._name + ' does not have a buffer' );

		this._buffer.compile( isDynamic );

	},

	disposeBuffer: function () {

		if ( ! this._buffer ) utils.throwErr( this, 'Attribute ' + this._name + ' does not have a buffer' );

		this._buffer.dispose();
		this._buffer = undefined;

	}

};

module.exports = Attribute;
