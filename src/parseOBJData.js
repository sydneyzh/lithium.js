// parseOBJData
// based on https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/OBJLoader.js

var utils = require( './utils' );
var glConsts = require( './glConsts' );
var Mesh = require( './Mesh' );

var regexp = {

    // v float float float
	vertex_pattern: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    // vn float float float
	normal_pattern: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    // vt float float
	uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,


    // f vertex vertex vertex
	face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
    // f vertex/uv vertex/uv vertex/uv
	face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
	face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
    // f vertex//normal vertex//normal vertex//normal
	face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,


    // o object_name | g group_name
	object_pattern: /^[og]\s*(.+)?/,
    // s boolean
	smoothing_pattern: /^s\s+(\d+|on|off)/,
    // mtllib file_reference
	material_library_pattern: /^mtllib /,
    // usemtl material_name
	material_use_pattern: /^usemtl /

};

var verbose = false;

var ParseState = function ( ctx, output ) {

	utils.checkContext( ctx );
	this._ctx = ctx;

	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	this.object = undefined;
	this.output = output;

};

ParseState.prototype = {

	constructor: ParseState,

	initObject: function ( name ) {

		if ( this.object === undefined )

			this.object = {

				name: name,
				positionData: [],
				normalData: [],
				uvData: [],
				indexData: []

			};

		else {

			this.object.name = name;
			this.object.positionData.length = 0;
			this.object.normalData.length = 0;
			this.object.uvData.length = 0;
			this.object.indexData.length = 0;

		}

	},

	finalizeObject: function () {

		var mesh = new Mesh( this.output._updater );

		if ( this.object.indexData.length === 0 ) throw Error( 'Cannot finalize indexData.' );
		var indexData;
		if ( this.object.indexData.length > 65535 )
			indexData = new Uint32Array( this.object.indexData );
		else
            indexData = new Uint16Array( this.object.indexData );

		if ( this.object.positionData.length === 0 ) throw Error( 'Cannot finalize positionData.' );
		var positionData = new Float32Array( this.object.positionData );

		var normalData;
		if ( this.object.normalData.length !== 0 )
			normalData = new Float32Array( this.object.normalData );
		else
            normalData = mesh.computeVertexNormals( positionData, indexData );

		var uvData;
		if ( this.object.uvData.length !== 0 )
			uvData = new Float32Array( this.object.uvData );
		else {

			if ( verbose )
				console.log( 'Object ' + this.object.name + ' does not have uv data.' );

		}

		mesh.addAttribute( { name: 'a_Position', type: glConsts.FLOAT, spacing: 3, data: positionData, offset: 0 } );
		mesh.addAttribute( { name: 'a_Normal', type: glConsts.FLOAT, spacing: 3, data: normalData, offset: 3 } );
		if ( uvData !== undefined )
			mesh.addAttribute( { name: 'a_Uv', type: glConsts.FLOAT, spacing: 2, data: uvData, offset: 6 } );

		var vertexNum = positionData.length / 3;
		mesh._attributes.a_Position.makeBuffer( this._ctx );
		mesh._attributes.a_Normal.makeBuffer( this._ctx );
		mesh._attributes.a_Uv.makeBuffer( this._ctx );
		mesh.addIndexBuffer( this._ctx, indexData );
		mesh.compile();

		if ( verbose )
			console.log( 'Object ' + this.object.name + ' vertexNum ' + vertexNum );

		this.output.add( mesh );

	},

	startObject: function ( name ) {

		if ( this.object )
			this.finalizeObject();

		this.initObject( name );

	},

	finalize: function () {

        // finalize the last object

		if ( this.object )
			this.finalizeObject();

		this.object = undefined;

	},

	incObjectIndices: function () {

		var len = this.object.indexData.length;
		this.object.indexData.push( len, len + 1, len + 2 );

	},

	addObjectPositions: function ( ia, ib, ic ) {

		var src = this.vertices;
		var dst = this.object.positionData;

		dst.push(

            src[ ia ], src[ ia + 1 ], src[ ia + 2 ],
            src[ ib ], src[ ib + 1 ], src[ ib + 2 ],
            src[ ic ], src[ ic + 1 ], src[ ic + 2 ]

        );

	},

	addObjectVertexNormals: function ( ia, ib, ic ) {

		var src = this.normals;
		var dst = this.object.normalData;

		dst.push(

            src[ ia ], src[ ia + 1 ], src[ ia + 2 ],
            src[ ib ], src[ ib + 1 ], src[ ib + 2 ],
            src[ ic ], src[ ic + 1 ], src[ ic + 2 ]

        );

	},

	addObjectUvs: function ( ia, ib, ic ) {

		var src = this.uvs;
		var dst = this.object.uvData;

		dst.push(

            src[ ia ], src[ ia + 1 ],
            src[ ib ], src[ ib + 1 ],
            src[ ic ], src[ ic + 1 ]

        );

	},

	addFace: function ( a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd ) {

		if ( ! this.object )
			throw Error( 'State object has not been initiated.' );

		var vLen = this.vertices.length;

		var ia = this.parseVertexIndex( a, vLen );
		var ib = this.parseVertexIndex( b, vLen );
		var ic = this.parseVertexIndex( c, vLen );
		var id;

		if ( d === undefined ) {

			this.incObjectIndices();
			this.addObjectPositions( ia, ib, ic );

		} else {

			id = this.parseVertexIndex( d, vLen );
			this.incObjectIndices();
			this.incObjectIndices();
			this.addObjectPositions( ia, ib, id );
			this.addObjectPositions( ib, ic, id );

		}

		if ( ua !== undefined ) {

			var uvLen = this.uvs.length;

			ia = this.parseUvIndex( ua, uvLen );
			ib = this.parseUvIndex( ub, uvLen );
			ic = this.parseUvIndex( uc, uvLen );

			if ( d === undefined ) {

				this.addObjectUvs( ia, ib, ic );

			} else {

				id = this.parseUvIndex( ud, uvLen );
				this.addObjectUvs( ia, ib, id );
				this.addObjectUvs( ib, ic, id );

			}

		}

		if ( na !== undefined ) {

			var nLen = this.normals.length;
			ia = this.parseNormalIndex( na, nLen );
			ib = na === nb ? ia : this.parseNormalIndex( nb, nLen );
			ic = na === nc ? ia : this.parseNormalIndex( nc, nLen );

			if ( d === undefined ) {

				this.addObjectVertexNormals( ia, ib, ic );

			} else {

				id = this.parseNormalIndex( nd, nLen );
				this.addObjectVertexNormals( ia, ib, id );
				this.addObjectVertexNormals( ib, ic, id );

			}

		}

	},

	parseVertexIndex: function ( value, len ) {

		var index = parseInt( value, 10 );
		return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

	},

	parseNormalIndex: function ( value, len ) {

		var index = parseInt( value, 10 );
		return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

	},

	parseUvIndex: function ( value, len ) {

		var index = parseInt( value, 10 );
		return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;

	}

};

module.exports = function ( ctx, output, data, opts ) {

	if ( ! output.isObject3D ) utils.throwErr( 'parseObjData', 'Output is not Object3D' );
	if ( typeof data !== 'string' ) utils.throwErr( 'parseObjData', 'Input is not a string.' );

	if ( opts ) {

		if ( opts.verbose ) verbose = true;

	}

	var state = new ParseState( ctx, output );

	if ( data.indexOf( '\r\n' ) !== - 1 ) data = data.replace( /\r\n/g, '\n' );
	if ( data.indexOf( '\\\n' ) !== - 1 ) data = data.replace( /\\\n/g, '' );
	var lines = data.split( '\n' );

	var line = '', lineFirstChar = '', lineSecondChar = '';
	var lineLength = 0;
	var result = [];

	var trimLeft = ( typeof ''.trimLeft === 'function' );

	for ( var i = 0, l = lines.length; i < l; i ++ ) {

		line = lines[ i ];
		line = trimLeft ? line.trimLeft() : line.trim();

		lineLength = line.length;
		if ( lineLength === 0 ) continue;

		lineFirstChar = line.charAt( 0 );
		if ( lineFirstChar === '#' ) continue;

		if ( lineFirstChar === 'v' ) {

			lineSecondChar = line.charAt( 1 );

			if ( lineSecondChar === ' ' && ( result = regexp.vertex_pattern.exec( line ) ) !== null ) {

                // v
				state.vertices.push(
                    parseFloat( result[ 1 ] ),
                    parseFloat( result[ 2 ] ),
                    parseFloat( result[ 3 ] )
                );

			} else if ( lineSecondChar === 'n' && ( result = regexp.normal_pattern.exec( line ) ) !== null ) {

                // vn
				state.normals.push(
                    parseFloat( result[ 1 ] ),
                    parseFloat( result[ 2 ] ),
                    parseFloat( result[ 3 ] )
                );

			} else if ( lineSecondChar === 't' && ( result = regexp.uv_pattern.exec( line ) ) !== null ) {

                // vt
				state.uvs.push(
                    parseFloat( result[ 1 ] ),
                    parseFloat( result[ 2 ] )
                );

			} else {

				utils.throwErr( 'parseObjData', 'Unexpected v line ' + line );

			}

		} else if ( lineFirstChar === 'f' ) {

			if ( ( result = regexp.face_vertex_uv_normal.exec( line ) ) !== null ) {

                // f vertex/uv/normal
				state.addFace(
                    result[ 1 ], result[ 4 ], result[ 7 ], result[ 10 ],
                    result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
                    result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
                );

			} else if ( ( result = regexp.face_vertex_uv.exec( line ) ) !== null ) {

                // f vertex/uv
				state.addFace(
                    result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
                    result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
                );


			} else if ( ( result = regexp.face_vertex_normal.exec( line ) ) !== null ) {

                // f vertex//normal
				state.addFace(
                    result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
                    result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
                );


			} else if ( ( result = regexp.face_vertex.exec( line ) ) !== null ) {

                // f vertex
				state.addFace(
                    result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
                );

			} else {

				utils.throwErr( 'parseObjData', 'Unexpected f line ' + line );

			}

		} else if ( lineFirstChar === 'l' ) {

			if ( verbose )
				utils.log( 'parseObjdata', 'Line is not parsed: ' + line );

		} else if ( ( result = regexp.object_pattern.exec( line ) ) !== null ) {

            // o object_name | g group_name

			var name = ( ' ' + result[ 0 ].substr( 1 ).trim() ).substr( 1 );
			state.startObject( name );

		} else if ( regexp.material_use_pattern.test( line ) ) {

            // usemtl material_name

			if ( verbose )
				utils.log( 'parseObjData', 'usemtl info is not parsed: ' + line );

		} else if ( regexp.material_library_pattern.test( line ) ) {

            // mtllib file_reference

			if ( verbose )
				utils.log( 'parseObjData', 'mtllib info is not parsed: ' + line );

		} else if ( ( result = regexp.smoothing_pattern.exec( line ) ) !== null ) {

            // s boolean

			if ( verbose )
				utils.log( 'parseObjData', 'smoothing is not parsed: ' + line );

		} else {

			if ( line === '\0' ) continue;

			utils.throwErr( 'parseObjData', 'Unexpected line: ' + line );

		}

	}

	state.finalize();
	return output;

};
