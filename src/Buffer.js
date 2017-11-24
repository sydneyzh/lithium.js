var utils = require( './utils' );
var glConsts = require( './glConsts' );

var Buffer = function ( ctx, data, target ) {

	this.isBuffer = true;

	this._ctx = utils.checkContext( ctx );
	this._data = data;
	this._target = target;
	this._bufferObject = ctx.gl.createBuffer();

};

Buffer.prototype = {

	constructor: Buffer,

	bind: function ( ctx ) {

		if ( ctx !== this._ctx ) utils.throwErr( this, 'Cannot bind buffer to a different GLContext' );

		this._ctx.gl.bindBuffer( this._target, this._bufferObject );

	},

	compile: function ( isDynamic ) {

		this.bind( this._ctx );

		this._ctx.gl.bufferData(
            this._target, this._data,
            isDynamic ? glConsts.DYNAMIC_DRAW : glConsts.STATIC_DRAW );

	},

	dispose: function () {

		this._ctx.deleteBuffer( this._bufferObject );

	}

};

module.exports = Buffer;
