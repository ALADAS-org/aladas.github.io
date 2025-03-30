// =========================================================================================================
// ==========================================     ball_shape.js     ========================================
// =========================================================================================================
"use strict";

class BallShape extends BaseShape {
	constructor( renderer, data ) {	
        super( renderer, data );
        this.size = ( data[SIZE_ARG] != undefined ) ? data[SIZE_ARG] : 0.1;
	} // constructor()   

    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/sphere
    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/position}
    draw() {       
        this.shape_mesh = BABYLON.MeshBuilder.CreateSphere
                ( this.id, { "segments": 4, "diameter": this.size }, this.scene ); 

        this.shape_mesh.material  = this.material;        
        this.shape_mesh.position  = this.origin;

        this.renderer.addObject(this.shape_mesh);
        
        return this.shape_mesh;
    } // draw()
} // BallShape class