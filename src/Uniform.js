var utils = require( './utils' );

var Uniform = function ( ctx, name, updateMethodName, location ) {

	this.isUniform = true;

	this._ctx = utils.checkContext( ctx );
	this._name = name;
	this._updateMethodName = updateMethodName;
	this._location = location;

};

Uniform.prototype = {

	constructor: Uniform,

	update: function ( value ) {

		utils.checkUniformValue( value );

		if ( ! this._updateMethodName.includes( 'Matrix' ) )

			this._ctx.gl[ this._updateMethodName ]( this._location, value );

		else

            this._ctx.gl[ this._updateMethodName ]( this._location, false, value );

	}

};

module.exports = Uniform;
