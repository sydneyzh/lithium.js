var utils = require( './utils' );
var math = require( './math' );
var vec3 = window.vec3;
var mat4 = window.mat4;

var Ray = function ( origin, direction ) {

	this.isRay = true;

	this._origin = undefined;
	this._direction = undefined;

	if ( origin && direction )
		this.set( origin, direction );

};

Ray.prototype = {

	constructor: Ray,

	set: function ( origin, direction ) {

		utils.checkArrNumber( origin, 3 );
		utils.checkArrNumber( direction, 3 );

		this._origin = this._origin || vec3.create();
		this._direction = this._direction || vec3.create();

		vec3.copy( this._origin, origin );
		vec3.copy( this._direction, direction );
		vec3.normalize( this._direction, this._direction );

	},

	setFromCamera: ( function () {

		var mat, position, direction, screenPos;

		return function ( mouseXY, camera ) {

			mat = mat || mat4.create();
			position = position || vec3.create();
			direction = direction || vec3.create();
			screenPos = screenPos || vec3.create();

			var modMat = camera.getMatrix();
			var viewMat = camera.getViewMatrix();
			var projMat = camera.getProjectionMatrix();

			mat4.multiply( mat, projMat, viewMat );
			mat4.invert( mat, mat );

			if ( camera.type === 'perspective' ) {

				camera.updateMatrix();
				vec3.copy( position, camera.getWorldPosition() );
				vec3.set( screenPos, mouseXY[ 0 ], mouseXY[ 1 ], 0.5 );

				vec3.transformMat4( direction, screenPos, mat );
				vec3.sub( direction, direction, position );
				vec3.normalize( direction, direction );

			} else if ( camera.type === 'ortho' ) {

				vec3.set( screenPos, mouseXY[ 0 ], mouseXY[ 1 ], ( camera._near + camera._far ) / ( camera._near - camera._far ) );
				vec3.set( direction, 0, 0, - 1 );
				vec3.transformMat4( position, screenPos, mat );
				vec3.multiplyByMat4( direction, direction, modMat );

			} else

                utils.throwErr( this, 'Invalid camera type "' + camera.type + '"' );

			this.set( position, direction );

		};

	} )(),

	at: ( function () {

		var res;

		return function ( t ) {

			utils.checkNumber( t );

			res = res || vec3.create();

			vec3.scale( res, this._direction, t );
			vec3.add( res, res, this._origin );
			return res;

		};

	} )(),

	intersectPlane: ( function () {

		var v;

		return function ( point, normal, backfaceCulling ) {

			utils.checkArrNumber( point, 3 );
			utils.checkArrNumber( normal, 3 );

			var denominator = vec3.dot( this._direction, normal );

			if ( Math.abs( denominator ) < math.EPS ) {

                // unstable

				return null;

			} else if ( denominator > 0 && backfaceCulling === true ) {

                // culling

				return null;

			} else {

				v = v || vec3.create();

				vec3.sub( v, point, this._origin );

				var t = vec3.dot( v, normal ) / denominator;

				vec3.scale( v, this._direction, t );
				vec3.add( v, this._origin, v );
				return v;

			}

		};

	} )(),

	intersectTriangle: ( function () {

		var ab, ac, bc, faceNormal, ap, bp, tmp;

		return function ( a, b, c, backfaceCulling ) {

			utils.checkArrNumber( a, 3 );
			utils.checkArrNumber( b, 3 );
			utils.checkArrNumber( c, 3 );

			ab = ab || vec3.create();
			ac = ac || vec3.create();
			bc = bc || vec3.create();
			faceNormal = faceNormal || vec3.create();
			ap = ap || vec3.create();
			bp = bp || vec3.create();
			tmp = tmp || vec3.create();

			vec3.sub( ab, b, a );
			vec3.sub( ac, c, a );
			vec3.sub( bc, c, b );
			vec3.cross( faceNormal, ab, ac );

			var pAtPlane = this.intersectPlane( a, faceNormal, backfaceCulling );

			if ( pAtPlane === null ) {

				return null;

			}

			vec3.sub( ap, pAtPlane, a );
			vec3.sub( bp, pAtPlane, b );

			var tmp1 = vec3.dot( faceNormal, vec3.cross( tmp, ab, ap ) );
			var tmp2 = vec3.dot( faceNormal, vec3.cross( tmp, ap, ac ) );
			var tmp3 = vec3.dot( faceNormal, vec3.cross( tmp, bc, bp ) );

			if ( tmp1 >= 0 && tmp2 >= 0 && tmp3 >= 0 ) {

				return pAtPlane;

			}

			return null;

		};

	} )(),

	intersectSphere: ( function () {

		var intersects, eyeToCenter, resultArr;

		return function ( center, radius, backfaceCulling ) {

			utils.checkArrNumber( center, 3 );
			utils.checkNumber( radius );

			intersects = intersects || [];
			eyeToCenter = eyeToCenter || vec3.create();
			resultArr = resultArr || [];

			intersects.length = 0;
			resultArr.length = 0;

			vec3.sub( eyeToCenter, center, this._origin );
			var eyeToCenterDist = vec3.length( eyeToCenter );
			var eyeToCenter2 = Math.pow( eyeToCenterDist, 2 );

			if ( backfaceCulling === true && eyeToCenterDist < radius ) return null;

			var projectionLength = vec3.dot( eyeToCenter, this._direction );
			if ( projectionLength < 0 ) return null;
			var projectionLength2 = Math.pow( projectionLength, 2 );

			var centerToRayDist = Math.sqrt( eyeToCenter2 - projectionLength2 );
			var centerToRayDist2 = Math.pow( centerToRayDist, 2 );

			var radius2 = Math.pow( radius, 2 );

			if ( centerToRayDist > radius ) return null;
			else if ( centerToRayDist === radius ) {

				if ( projectionLength < 0 ) return null;
				else return this.at( projectionLength );

			} else {

				var t1 = projectionLength - Math.sqrt( radius2 - centerToRayDist2 );

				if ( backfaceCulling === true ) {

					return this.at( t1 );

				} else {

					var t2 = projectionLength + Math.sqrt( radius2 - centerToRayDist2 );
					resultArr[ 0 ] = this.at( t1 );
					resultArr[ 1 ] = this.at( t2 );
					return resultArr;

				}

			}

		};

	} )(),

	intersectTriangles: ( function () {

		var intersects;
		return function ( triangleArray, backfaceCulling ) {

			if ( ! Array.isArray( triangleArray ) )
				utils.throwErr( this, 'Invalid parameter ' + triangleArray );

			intersects = intersects || []; // hitpoints
			intersects.length = 0;
			for ( var i = 0; i < triangleArray.length; i ++ ) {

				var triangle = triangleArray[ i ];
				var hitpoint = this.intersectTriangle( triangle[ 0 ], triangle[ 1 ], triangle[ 2 ], backfaceCulling );
				if ( hitpoint !== null ) intersects.push( hitpoint );

			}
			intersects.sort( this.ascSort );
			return intersects;

		};

	} )(),

	intersectMeshGroup: ( function () {

		var intersects;
		return function ( obj, backfaceCulling, ignoreChildren ) {

			intersects = intersects || []; // hitpoints
			intersects.length = 0;
			this._intersectMeshGroup( obj, intersects, backfaceCulling, ignoreChildren );
			intersects.sort( this.ascSort );
			return intersects;

		};

	} )(),

	_intersectMeshGroup: function ( obj, intersects, backfaceCulling, ignoreChildren ) {

		if ( obj.isMesh ) {

			intersects.push.apply( intersects, obj.raycast( this, backfaceCulling ) );

		} else {

			if ( ! ignoreChildren ) {

				for ( var key in obj.children ) {

					this._intersectMeshGroup( obj.children[ key ], intersects, backfaceCulling );

				}

			}

		}

	},

	ascSort: function ( p1, p2 ) {

		return vec3.distance( p1, this._origin ) - vec3.distance( p2, this._origin );

	},

	getOrigin: ( function () {

		var res;

		return function () {

			res = res || vec3.create();
			return vec3.copy( res, this._origin );

		};

	} )(),

	getDirection: ( function () {

		var res;

		return function () {

			res = res || vec3.create();
			return vec3.copy( res, this._direction );

		};

	} )()

};

module.exports = Ray;
