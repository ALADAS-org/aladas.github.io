// ========================================================================================================
// ========================================       arc_shape.js       ======================================
// ========================================================================================================
"use strict";

class ArcShape extends BaseShape {
	constructor( renderer, data ) {	
        super( renderer, data );
        this.id = ( data[ID_ARG] != undefined ) ? data[ID_ARG] : this.getId();
        this.middle_arc_point = ( data[MIDDLE_ARC_POINT_ARG] != undefined ) ? data[MIDDLE_ARC_POINT_ARG] : this.centroid_point;
    } // constructor()   

    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/sphere
    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/position}
    draw() {
        let p0 = this.points[ 0 ];
        let p1 = this.points[ 1 ];

        // https://playground.babylonjs.com/#KENEJP#3
        // const arc = BABYLON.Curve3.ArcThru3Points( p0, this.centroid_point, p1 );
        const arc = BABYLON.Curve3.ArcThru3Points( p0, this.middle_arc_point, p1 );
        const arc_line = BABYLON.MeshBuilder.CreateLines( this.id, { points: arc.getPoints() } );
        arc_line.color = this.color;    
        
        this.doEdgeRendering( arc_line, this.color );

        this.renderer.addObject( arc_line );
        
        return arc_line;
    } // draw()
} // ArcShape class