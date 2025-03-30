// =========================================================================================================
// ======================================     polyhedron_shape.js     ======================================
// =========================================================================================================
"use strict";

class PolyhedronShape extends BaseShape {
	constructor( renderer, data ) {	
        super( renderer, data );
        this.face_count = (this.data[FACE_COUNT_ARG] != undefined) ? this.data[FACE_COUNT_ARG ] : 6;
        this.goldberg_polyhedron_options = (this.data[GOLDBERG_POLYHEDRON_ARG] != undefined) ? this.data[GOLDBERG_POLYHEDRON_ARG ] : {};           
	} // constructor()   

    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/sphere
    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/position}
    draw() {	
        let options = { m:1, n: 1, size: this.size };

        if (this.goldberg_polyhedron_options != {} && this.data[FACE_COUNT_ARG] == 0) {
            // https://en.wikipedia.org/wiki/Goldberg_polyhedron f(m,n)
            let gp_options = this.goldberg_polyhedron_options;
            options = { m: gp_options.m, n: gp_options.n, size: this.size };
            this.shape_mesh = BABYLON.MeshBuilder.CreateGoldberg( this.id, options, this.scene );
        }
        else  if ( this.face_count == 6 )	{
            this.shape_mesh = BABYLON.MeshBuilder.CreateBox( this.id, { size: this.size }, this.scene );		    
        }
        else if ( this.face_count == 32 ) {
            options = { m:1, n: 1, size: this.size };
            this.shape_mesh = BABYLON.MeshBuilder.CreateGoldberg( this.id, options, this.scene );
        }
        else {
            // https://babylonjsguide.github.io/intermediate/Polyhedra_Shapes#provided-polyhedron-types	
            let polyhedron_type = 1;
            switch ( this.face_count ) {
                case 4  : polyhedron_type = 0; break;
                case 8  : polyhedron_type = OCTAHEDRON_TYPE;   break;
                case 12 : polyhedron_type = DODECAHEDRON_TYPE; break;
                case 20 : polyhedron_type = ISOCAHEDRON_TYPE;  break;
                case 26 : polyhedron_type = RHOMBICUBOCTAHEDRON_TYPE; break;
                default : polyhedron_type = 1;
            }
            this.shape_mesh = BABYLON.MeshBuilder.CreatePolyhedron( this.id, { type: polyhedron_type, size: this.size }, this.scene );
        } 

        this.shape_mesh.position = this.origin;
        this.shape_mesh.material = MATERIALS[this.color];     

		this.shape_mesh.enableEdgesRendering();
		this.shape_mesh.edgesWidth = 0.4;
		this.shape_mesh.edgesColor = new BABYLON.Color4(0, 0, 0, 1);          

        this.renderer.addObject( this.shape_mesh );
        
        return this.shape_mesh;
    } // draw()
} // PolyhedronShape class