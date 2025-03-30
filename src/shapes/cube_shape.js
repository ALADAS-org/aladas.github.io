// =========================================================================================================
// ==========================================     ball_shape.js     ========================================
// =========================================================================================================
"use strict";

const CUBE_POINTS_MATRIX = [ [ 0, 0, 0], [ 1, 0, 0], [ 1, 1, 0], [ 0, 1, 0], [ 0, 0, 0],
							 [ 0, 0, 0], [ 0, 1, 0], [ 0, 1, 1], [ 0, 0, 1], [ 0, 0, 0],
							 [ 0, 0, 0], [ 0, 0, 1], [ 1, 0, 1], [ 1, 0, 0], [ 0, 0, 0],

							 [ 0, 0, 1], [ 1, 0, 1], [ 1, 1, 1], [ 0, 1, 1], [ 0, 0, 1],
							 [ 0, 0, 1], [ 0, 1, 1], [ 1, 1, 1], [ 1, 1, 0], [ 0, 1, 0],
                          ];

class CubeShape extends BaseShape {
	constructor( renderer, data ) {	
        super( renderer, data );
	} // constructor()   

    draw() {    
        const draw_dashed_wire_square = ( id, position, size ) => {
            let positions = []; 
    
            // 6 planes ( 6 faces of a cube)	
            for ( let plane_idx=0; plane_idx < CUBE_POINTS_MATRIX.length; plane_idx+=5 ) {
                // 5 points for each plane  				
                for ( let point_idx=0; point_idx < 5; point_idx++ ) {   
                    let point_vector = CUBE_POINTS_MATRIX[plane_idx + point_idx];	
                    // console.log("point_vector(" + point_idx + "): " + JSON.stringify(point_vector));	    
                    let p1 = new BABYLON.Vector3( position.x + point_vector[0] * size - size/2, 
                                                  position.y + point_vector[1] * size - size/2, 
                                                  position.z + point_vector[2] * size - size/2 
                                                );
                    positions.push( p1 );		
                }
            }	
            
            let square_color = Color.AsVec3(this.wireframe_color);

            // https://playground.babylonjs.com/#TYF5GH#1
            // https://babylonjsguide.github.io/intermediate/Parametric_Shapes#dashed-lines
            let data = { points: positions, gapSize: 5 };

            // const padWithZero = (n) => (n < 10 ? ('0'+n).toString() : n.toString());
            let mesh_name = id;
            // if (this.parent_rep != undefined) mesh_name += "_" + padWithZero(this.parent_rep.getNodeNumber());            

            let square_mesh = BABYLON.MeshBuilder.CreateDashedLines( mesh_name, data );
            square_mesh.color = square_color;
            this.renderer.addObject( square_mesh );               
        }; // draw_dashed_wire_square()

        // console.log("> CubeShape new shape_mesh: " + this.id);
        let vizject_id = this.id;
        if ( this.parent_rep != undefined ) {
            vizject_id =   "Node_alpha_box_" 
                         + ShapeUtils.PadWithZero(this.parent_rep.getNodeNumber() + 1);
        }
        this.shape_mesh = BABYLON.MeshBuilder.CreateBox
                          ( vizject_id, { "size": this.size }, this.scene ); 

        this.shape_mesh.material = this.material;        
        this.shape_mesh.position = this.origin;

        if ( this.wireframe ) {
            let edge_thickness = 1.0;
            if ( this.dashed ) {
                let vizject_id = "Node_wirebox_" + this.id;                
                if (this.parent_rep != undefined) {
                    vizject_id =   "Node_wirebox_" 
                                 + ShapeUtils.PadWithZero(this.parent_rep.getNodeNumber() + 1);
                }
                draw_dashed_wire_square( vizject_id, this.origin, this.size);
                // this.shape_mesh.setEnabled(false);
                edge_thickness = 0;
            }    
            
            this.shape_mesh.enableEdgesRendering();  
            this.shape_mesh.edgesWidth = edge_thickness;

            let wire_color  = Color.AsVec3(this.wireframe_color);
            let edges_color = new BABYLON.Color4( wire_color.r, wire_color.g, wire_color.b, 1 );
            this.shape_mesh.edgesColor = edges_color;

            this.shape_mesh.material = this.alpha_faces_material;
            this.shape_mesh.convertToFlatShadedMesh();
        }

        this.renderer.addObject(this.shape_mesh);
        
        return this.shape_mesh;
    } // draw()
} // CubeShape class