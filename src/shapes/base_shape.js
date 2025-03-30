// ===================================================================================================
// ======================================     base_shape.js     ======================================
// ===================================================================================================
"use strict";

class BaseShape {
    static InstanceCounts = {};

	constructor( renderer, data ) {	
		this.shape_type = this.constructor.name.replace("Shape", "");
		this.renderer   = renderer;	
		this.scene      = this.renderer.getScene();

		data = ( data != undefined ) ? data : {};
		this.data = data;

		this.mnemonic   = ( data[MNEMONIC_ARG] != undefined )   ? data[MNEMONIC_ARG] : "";
		this.word_index = ( data[WORD_INDEX_ARG] != undefined ) ? data[WORD_INDEX_ARG] : -1;
 		
		this.parent_rep = ( data[PARENT_REP_ARG] != undefined ) ? data[PARENT_REP_ARG] : undefined;

		this.id = (this.parent_rep != undefined) ? this.parent_rep.getId() : this.getId(); 

		this.origin     = ( data[ORIGIN_ARG]   != undefined ) ? data[ORIGIN_ARG] : new BABYLON.Vector3.Zero();
		this.size       = ( data[SIZE_ARG]     != undefined ) ? data[SIZE_ARG] : .05;

		this.color      = ( data[COLOR_ARG]    != undefined ) ? data[COLOR_ARG] : new BABYLON.Color3(0.5, 0.5, 0.5); // Grey 50%
		
		this.material   = ( data[MATERIAL_ARG] != undefined ) ? data[MATERIAL_ARG] : MATERIALS[YELLOW];

		this.wireframe       = ( data[WIREFRAME_ARG] != undefined )       ? data[WIREFRAME_ARG] : false;
        this.wireframe_color = ( data[WIREFRAME_COLOR_ARG] != undefined ) ? data[WIREFRAME_COLOR_ARG] : RED;
		this.dashed          = ( data[DASHED_ARG] != undefined )          ? data[DASHED_ARG] : false;

		this.alpha_faces_material = ( data[ALPHA_FACES_MAT_ARG] != undefined ) ? data[ALPHA_FACES_MAT_ARG] : MATERIALS[RED];

        this.centroid_point = ( data[CENTROID_ARG] != undefined ) ? data[CENTROID_ARG] : new BABYLON.Vector3.Zero();		

		this.points    = ( data[POINTS_ARG]   != undefined ) ? data[POINTS_ARG ] : [];
		this.args      = ( data[ARGS_ARG]     != undefined ) ? data[ARGS_ARG]    : {};

		this.shape_mesh = undefined;
	} // constructor()

	getShapeMesh() {		
		return this.shape_mesh;
    } // getShapeMesh()

	_getGltfMetaData() {
		if ( this.shape_mesh.metadata == undefined ) { 
			this.shape_mesh.metadata = { "gltf": {} };
		};

		return this.shape_mesh.metadata["gltf"];
    } // _getGltfMetaData()
	
	hasMetadata() {		
		return ( this.mnemonic != "" && this.word_index != -1 );
    } // hasMetadata()
    
    setMetadataValue( metadata_field_name, value ) {
        let metadata = this._getGltfMetaData();
        metadata["extras"][metadata_field_name] = value; 
    } // setMetadataValue()

	doEdgeRendering( edges_object, color ) {	
		let edge_rendering = THEMES[this.renderer.getParameter(THEME_PARAM)][EDGE_RENDERING];
        if ( edge_rendering == undefined ) edge_rendering = false;
		if ( edge_rendering ) {
			// Draw edges with Thickness if 'LINK_THICKNESS' is defined on current 'Theme'
			let edge_thickness = THEMES[this.renderer.getParameter(THEME_PARAM)][LINK_THICKNESS];
            if ( edge_thickness == undefined ) edge_thickness = 1.0;

			edges_object.enableEdgesRendering();
			edges_object.edgesWidth = edge_thickness;
			let edges_color = new BABYLON.Color4( color.r, color.g, color.b, 1);
			edges_object.edgesColor = edges_color;
		}
    } // doEdgeRendering()

	draw() {
        this.shape_mesh = undefined;
        
		// https://babylonjsguide.github.io/intermediate/Polyhedra_Shapes#provided-polyhedron-types					  
		this.shape_mesh = BABYLON.MeshBuilder.CreatePolyhedron( this.id, { type: 1, size: this.size }, this.scene );
		
		if ( this.renderer.getParameter(METADATA_PARAM) ) {
			let glf_metadata = this._getGltfMetaData();
			glf_metadata["extras"] = { [MNEMONIC_ARG]:   this.mnemonic, 
								       [WORD_INDEX_ARG]: this.word_index
						             };
	    }

		this.shape_mesh.enableEdgesRendering();
		this.shape_mesh.edgesWidth = 0.4;
		this.shape_mesh.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

        this.shape_mesh.material = this.material;        
        this.shape_mesh.position = this.origin;

        this.renderer.addObject( this.shape_mesh );
        
        return this.shape_mesh;
    } // draw()

	static ResetObjectCount() {
		// console.log(">> --- BaseShape.ResetObjectCount " +  this.name );
		let keys = Object.keys(BaseShape.InstanceCounts);
		for ( let i=0; i< keys.length; i++ ){
			BaseShape.InstanceCounts[keys[i]] = 0;
		}
	} // ResetObjectCount()

    getId() {
		if ( this.id != undefined ) return this.id;

		if ( BaseShape.InstanceCounts[this.shape_type] == undefined ) {
			BaseShape.InstanceCounts[this.shape_type] = 0;
		}

		BaseShape.InstanceCounts[this.shape_type]++;

		this.id =   this.shape_type.toLowerCase() 
		          + "_" + ShapeUtils.PadWithZero( BaseShape.InstanceCounts[this.shape_type] );
		return this.id;
	} // getId();
} // BaseShape class