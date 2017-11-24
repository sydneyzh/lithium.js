var utils = require( './utils' );

function Updater() {

	this.isUpdater = true;

	this._idCount = 0;
	this._schedule = {};

	this._sortIdsByWeight = ( function ( a, b ) {

		return this._schedule[ a ]._weight - this._schedule[ b ]._weight;

	} ).bind( this );

}

Updater.prototype = {

	constructor: Updater,

	getId: function () {

		return this._idCount ++;

	},

	add: function ( obj ) {

		if ( ! obj.isObject3D )
			utils.throwErr( this, 'Item is not Object3D' );

		if ( this._schedule[ obj._id ] === undefined )
			this._schedule[ obj._id ] = obj;

	},

	update: function () {

		var ids = Object.keys( this._schedule ).slice( 0 );

		if ( ids.length > 0 ) {

			ids.sort( this._sortIdsByWeight );

			var rootId = ids[ 0 ];

			this._updateObject( this._schedule[ rootId ], rootId );

		}

	},

	_updateObject: function ( object, rootId ) {

		// todo: reduce On^2 to linear

		var id = object._id;

		if ( this._schedule[ id ] !== undefined ) {

			delete this._schedule[ id ];

			object.updateMatrix();

		} else {

			object.updateMatrixWorld();

		}

		for ( var childId in object.children ) {

			if ( object.children.hasOwnProperty( childId ) ) {

				var child = object.children[ childId ];

				this._updateObject( child, rootId );

			}

		}

		// return to the update-tree root

		if ( id.toString() === rootId ) {

			this.update();

		}

	}

};

module.exports = Updater;
