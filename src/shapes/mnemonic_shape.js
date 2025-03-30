// =========================================================================================================
// ========================================     mnemonic_shape.js     ======================================
// =========================================================================================================
"use strict";

const MNEMONIC_ARG      = "mnemonic";
const WORD_INDEX_ARG    = "word_index";
const PREVIOUS_NODE_ARG = "previous_node";

class MnemonicShape extends BallShape {
	constructor( renderer, data ) {	
        super( renderer, data );      
       	this.material = ( data[MATERIAL_ARG] != undefined ) ? data[MATERIAL_ARG] : MATERIALS[WHITE];
	} // constructor()  

    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/sphere
    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/position}
    draw() {       
        this.shape_mesh = BABYLON.MeshBuilder.CreateSphere
                          ( this.id, { "segments": 4, "diameter": this.size }, this.scene );         

        if ( this.renderer.getParameter(METADATA_PARAM) ) {
			    let metadata = this._getGltfMetaData();
			    metadata["extras"] = { [MNEMONIC_ARG]:   this.mnemonic, 
                                 [WORD_INDEX_ARG]: this.word_index
                               };
        }
		
        this.shape_mesh.material = this.material;        
        this.shape_mesh.position = this.origin;

        this.renderer.addObject( this.shape_mesh );
        
        return this.shape_mesh;
    } // draw()

    getId() {
		if ( this.id != undefined ) return this.id;

		if ( BaseShape.InstanceCounts[this.shape_type] == undefined ) {
			BaseShape.InstanceCounts[this.shape_type] = 0;
		}

		BaseShape.InstanceCounts[this.shape_type]++;

		this.id =   "Mnemonic" 
		          + "_" + ShapeUtils.PadWithZero( BaseShape.InstanceCounts[this.shape_type] );
		return this.id;
	} // getId();
} // MnemonicShape class