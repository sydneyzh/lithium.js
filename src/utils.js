var glConsts = require( './glConsts' );
var vec3 = window.vec3;

var _concatNameMsg = function ( ins, msg ) {

	var name;

	if ( typeof ins === 'string' )
		name = ins;

	else if ( ins && ins.constructor && ins.constructor.name !== 'Object' && ins.constructor.name !== 'Function' )
		name = ins.constructor.name;

	name = name || '';

	return 'LT.' + name + ': ' + ( msg || '' ) + '.';

};

var _attribDataSpacings = [ 1, 2, 3, 4 ];

var _attribDataTypes = [

	glConsts.BYTE, // Int8Array
	glConsts.SHORT, // Int16Array

	glConsts.UNSIGNED_BYTE, // Uint8Array
	glConsts.UNSIGNED_SHORT, // Uint16Array

	glConsts.FLOAT // Float32Array

];

var _dataType2ArrayTypes = {};
_dataType2ArrayTypes[ glConsts.BYTE ] = 'Int8Array';
_dataType2ArrayTypes[ glConsts.SHORT ] = 'Int16Array';
_dataType2ArrayTypes[ glConsts.UNSIGNED_BYTE ] = 'Uint8Array';
_dataType2ArrayTypes[ glConsts.UNSIGNED_SHORT ] = 'Uint16Array';
_dataType2ArrayTypes[ glConsts.FLOAT ] = 'Float32Array';
_dataType2ArrayTypes[ glConsts.HALF_FLOAT_OES ] = 'Uint16Array';

var _indexBufferArrayType2DataTypes = {};
_indexBufferArrayType2DataTypes[ 'Uint8Array' ] = glConsts.UNSIGNED_BYTE;
_indexBufferArrayType2DataTypes[ 'Uint16Array' ] = glConsts.UNSIGNED_SHORT;

var _uniformUpdateMethodNames = {

	i: 'uniform1i',
	t: 'uniform1i',
	f: 'uniform1f',
	v2: 'uniform2fv',
	v3: 'uniform3fv',
	v4: 'uniform4fv',
	iv2: 'uniform2iv',
	iv3: 'unifrom3iv',
	iv4: 'uniform4iv',
	m2: 'uniformMatrix2fv',
	m3: 'uniformMatrix3fv',
	m4: 'uniformMatrix4fv'

};

var _extCache = {};

module.exports = {

	throwErr: function ( ins, msg ) {

		throw Error( _concatNameMsg( ins, msg ) );

	},

	log: function ( ins, msg ) {

		console.log( _concatNameMsg( ins, msg ) );

	},

	warn: function ( ins, msg ) {

		console.warn( _concatNameMsg( ins, msg ) );

	},

	err: function ( ins, msg ) {

		console.error( _concatNameMsg( ins, msg ) );

	},

	logWithLineNumber: function ( ins, msg ) {

		var res = _concatNameMsg( ins, '' );
		res += '\n';

		var msgArr = msg.split( '\n' );
		var linum = 1;
		msgArr.forEach( function ( line ) {

			res += linum + ': ' + line + '\n';
			linum ++;

		} );

		console.log( res );

	},

	checkUpdater: function ( updater ) {

		if ( ! updater.isUpdater )
			this.throwErr( 'utils', 'Invalid updater ' + updater );
		return updater;

	},

	/* context */

	checkContext: function ( ctx ) {

		if ( ! ctx.isGLContext || ! ctx.gl )
			this.throwErr( 'utils', 'Invalid context ' + ctx );
		return ctx;

	},

	canUseExtension: function ( ctx, extName ) {

		var cache = _extCache[ extName ];
		if ( cache !== undefined && cache.ctx === ctx ) return cache.res;

		this.checkContext( ctx );

		var res = ctx.gl.getExtension( extName );
		_extCache[ extName ] = { ctx: ctx, res: res };

		if ( res === null ) {

			this.warn( 'utils', 'extension ' + extName + ' is not supported' );
			return false;

		} else return true;

	},

	clearCanvas: function ( ctx ) {

		this.checkContext( ctx );

		ctx.gl.clear( glConsts.COLOR_BUFFER_BIT | glConsts.DEPTH_BUFFER_BIT );

	},


	/* check value */

	dataType2ArrayType: function ( dataType ) {

		var arrayType = _dataType2ArrayTypes[ dataType ];
		if ( ! arrayType ) this.throwErr( 'utils', 'Cannot find array type for data type ' + dataType );
		return arrayType;

	},

	indexBufferArrayType2DataType: function ( arrayType ) {

		var dataType = _indexBufferArrayType2DataTypes[ arrayType ];
		if ( ! dataType ) this.throwErr( 'utils', 'Cannot find data type for array type ' + arrayType );
		return dataType;

	},

	checkAttribDataType: function ( type ) {

		if ( _attribDataTypes.indexOf( type ) === - 1 )
			this.throwErr( 'utils', 'Invalid attribute data type ' + type );

		return type;

	},

	checkAttribDataSpacing: function ( spacing ) {

		if ( _attribDataSpacings.indexOf( spacing ) === - 1 )
			this.throwErr( 'utils', 'Invalid attribute data spacing ' + spacing );

		return spacing;

	},

	getUniformUpdateMethodName: function ( type ) {

		var methodName = _uniformUpdateMethodNames[ type ];
		return methodName || ( this.throwErr( 'utils', 'Invalid uniform data type ' + type ) );

	},

	checkUniformValue: function ( val ) {

		// can be an object or a number
		// cannot be null, undefined, NaN
		if ( typeof val === 'undefined' || val === null || ( typeof val === 'number' && isNaN( val ) ) )
			this.throwErr( 'utils', 'Invalid unifrom value ' + val );

	},

	isNumber: function ( val ) {

		if ( typeof val === 'number' && ! isNaN( val ) ) return true;

		return false;

	},

	_checkNumber: function ( val ) {

		if ( ! this.isNumber( val ) )
			this.throwErr( 'utils', 'Invalid number ' + val );

	},

	checkNumber: function () {

		var scope = this;
		var args = Array.prototype.slice.call( arguments );
		args.forEach( function ( arg ) {

			scope._checkNumber( arg );

		} );

	},

	_checkArrNumber: function ( arr ) {

		var scope = this;

		arr.forEach( function ( v ) {

			scope._checkNumber( v );

		} );

	},

	checkArrNumber: function ( arr, len ) {

		if ( len && arr.length !== len ) this.throwErr( 'utils', 'Invalid arr "' + arr + '". Length should be "' + len + '"' );

		this._checkArrNumber( arr );

	},

	checkMatNumber: function ( mat, h, w ) {

		if ( h && w && mat.length !== h * w ) this.throwErr( 'utils', 'Invalid mat "' + mat + '". Length should be "' + w + ' " * "' + h + '"' );

		this._checkArrNumber( mat );

	},

	_hexVal2RGB: function ( num ) {

		this.checkNumber( num );

		var r = Math.floor( num / 0x10000 ) / 255;

		num -= r * 255 * 0x10000;
		var g = Math.floor( num / 0x100 ) / 255;

		num -= g * 255 * 0x100;
		var b = Math.floor( num ) / 255;

		return vec3.fromValues( r, g, b );

	},

	_hexStr2RGB: function ( hexString ) {

		var hexNum;
		var charAt0 = hexString.charAt( 0 );

		if ( charAt0 === '#' ) {

			hexNum = parseInt( '0x' + hexString.slice( 1 ) );

		} else if ( charAt0 === '0' && hexString.charAt( 1 ) === 'x' ) {

			hexNum = parseInt( hexString );

		} else if ( this.isNumber( parseInt( charAt0 ) ) ||
					 charAt0 === 'a' || charAt0 === 'A' ||
					 charAt0 === 'b' || charAt0 === 'B' ||
					 charAt0 === 'c' || charAt0 === 'C' ||
					 charAt0 === 'd' || charAt0 === 'D' ||
					 charAt0 === 'e' || charAt0 === 'E' ||
					 charAt0 === 'f' || charAt0 === 'F' ) {

			hexNum = parseInt( '0x' + hexString );

		} else

			this.throwErr( 'utils', 'Invalid hex string ' + hexString );

		return this._hexVal2RGB( hexNum );

	},

	unsignedShort2Float: function ( num ) {

		var s = ( num & 0x8000 ) >> 15;
		var e = ( num & 0x7C00 ) >> 10;
		var f = num & 0x03FF;

		if ( e == 0 ) {

			return ( s ? - 1 : 1 ) * Math.pow( 2, - 14 ) * ( f / Math.pow( 2, 10 ) );

		} else if ( e == 0x1F ) {

			return f ? NaN : ( ( s ? - 1 : 1 ) * Infinity );

		}

		return ( s ? - 1 : 1 ) * Math.pow( 2, e - 15 ) * ( 1 + ( f / Math.pow( 2, 10 ) ) );

	},

	hex2RGB: function ( input ) {

		// input format can be
		//  0xffffff
		// '0xffffff'
		// '#ffffff'
		// 'ffffff'

		if ( typeof input === 'string' )
			return this._hexStr2RGB( input );

		else return this._hexVal2RGB( input );

	},

	clearObject: function ( o ) {

		if ( typeof o !== 'object' ) this.throwErr( 'utils', 'parameter "' + o + '"is not an object.' );

		for ( var key in o ) {

			if ( o.hasOwnProperty( key ) ) {

				delete o[ key ];

			}

		}

	},

	/* misc */

	detectMobile: function () {

		return /Android/i.test( navigator.userAgent ) ||
			/iPhone|iPad|iPod/i.test( navigator.userAgent );

	}

};
