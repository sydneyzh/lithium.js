var utils = require( './utils' );
var vec3 = window.vec3;

function sortNum( a, b ) {

	return a > b;

}

var Face = function ( mesh, ia, ib, ic ) {

    // only holds references

	utils.checkNumber( ia, ib, ic );

	if ( ! mesh.isMesh ) utils.throwErr( this, 'Parameter is not a mesh' );

	this.isFace = true;
	this._mesh = mesh;
	this._ia = ia;
	this._ib = ib;
	this._ic = ic;
	this._faceNormal = undefined;

};

Face.prototype = {

	constructor: Face,

	_getIndex: function ( i ) {

        // map triangle vertex index to its index in the buffers

		if ( i === 0 ) return this._ia;
		else if ( i === 1 ) return this._ib;
		else if ( i === 2 ) return this._ic;
		else utils.throwErr( this, 'Invalid index: ' + i );

	},

	updateVertexPosition: function ( i, pos ) {

		utils.checkArrNumber( pos, 3 );

		this.updateAttributeData( i, 'a_Position', pos );

	},

	updateVertexNormal: function ( i, n ) {

		utils.checkArrNumber( n, 3 );

		this.updateAttributeData( i, 'a_Normal', n );

	},

	updateVertexUv: function ( i, uv ) {

		utils.checkArrNumber( uv, 2 );

		this.updateAttributeData( i, 'a_Uv', uv );

	},

	updateAttributeData: function ( i, attribName, data ) {

        // update a vertex's attrib data in its mesh

		if ( typeof attribName !== 'string' ) utils.throwErr( this, 'Invalid attribute name ' + attribName );

		var attrib = this._mesh._attributes[ attribName ];

		if ( attrib === undefined )
			utils.throwErr( this, 'Mesh does not have attribute ' + attribName );

		var index = this._getIndex( i );

		attrib.update( data, index * attrib._dataSpacing );

	},

	computeFaceNormal: ( function () {

        // update faceNormal with positionData in position attribute

		var indicesCopy, table, va, vb, vc, ab, ac, normal;

		return function () {

			if ( ! this._mesh._attributes.a_Position ) {

				utils.log( this, 'Cannot compute face normal. Mesh does not have attribute "a_Position.".' );
				return;

			}

			indicesCopy = indicesCopy || [];
			table = table || {};
			ab = ab || vec3.create();
			ac = ac || vec3.create();
			normal = normal || vec3.create();
			va = va || vec3.create();
			vb = vb || vec3.create();
			vc = vc || vec3.create();

			var positionData = this._mesh._attributes.a_Position._data;

			table[ this._ia ] = 0;
			table[ this._ib ] = 1;
			table[ this._ic ] = 2;

			indicesCopy[ 0 ] = this._ia;
			indicesCopy[ 1 ] = this._ib;
			indicesCopy[ 2 ] = this._ic;
			indicesCopy.sort( sortNum );

			var arrIndexA = table[ indicesCopy[ 0 ] ];
			var arrIndexB = table[ indicesCopy[ 1 ] ];
			var arrIndexC = table[ indicesCopy[ 2 ] ];

			vec3.set( va,
                      positionData[ arrIndexA * 3 ],
                      positionData[ arrIndexA * 3 + 1 ],
                      positionData[ arrIndexA * 3 + 2 ] );
			vec3.set( vb,
                      positionData[ arrIndexB * 3 ],
                      positionData[ arrIndexB * 3 + 1 ],
                      positionData[ arrIndexB * 3 + 2 ] );
			vec3.set( vc,
                      positionData[ arrIndexC * 3 ],
                      positionData[ arrIndexC * 3 + 1 ],
                      positionData[ arrIndexC * 3 + 2 ] );

			vec3.sub( ab, vb, va );
			vec3.sub( ac, vc, va );
			vec3.cross( normal, ab, ac );
			vec3.normalize( normal, normal );

			this._faceNormal = this._faceNormal || vec3.create();
			vec3.copy( this._faceNormal, normal );

			utils.clearObject( table );

			return this.getFaceNormal();

		};

	} )(),

	getFaceNormal: ( function () {

		var n;
		return function () {

			n = n || vec3.create();
			return vec3.copy( n, this._faceNormal );

		};

	} )()

};

module.exports = Face;
