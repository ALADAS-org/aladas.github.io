// =========================================================================================================
// ========================================     polyline_shape.js     ======================================
// =========================================================================================================
"use strict";

// NB: caller must fill 'POINTS_ARG' in 'data', 'COLOR_ARG' is optional (default in 'Current Theme'[LINK_COLOR])
class PolylineShape extends BaseShape {
	constructor( renderer, data ) {	
        super( renderer, data );
        this.polyline = undefined;
        this.color = THEMES[this.renderer.getParameter(THEME_PARAM)][LINK_COLOR][0];
        if ( this.data[COLOR_ARG] != undefined ) { 
            this.color = Color.AsVec3( this.data[COLOR_ARG] );
        }
	} // constructor()   

    draw() {	
		this.polyline = BABYLON.MeshBuilder.CreateLines( this.id, { points: this.points });
		this.polyline.color = this.color;
        this.doEdgeRendering( arc_line, this.color );

		this.renderer.addObject( this.polyline );
        
        return this.polyline;
    } // draw()
} // PolylineShape class