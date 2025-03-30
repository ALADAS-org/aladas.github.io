// ====================================================================================================
// =======================================     link_rep.js     ========================================
// ====================================================================================================
"use strict";

// ============================== LinkRep class ==============================
class LinkRep extends BaseRep {
	constructor( vizmode, word_indexes, start_node, end_node, data ) {
        super( vizmode, word_indexes, data );

        this.color = THEMES[this.renderer.getParameter(THEME_PARAM)][LINK_COLOR][0];
        this.color = ( this.data[COLOR_ARG] != undefined ) ? this.data[COLOR_ARG] : this.color;

        // console.log(">> new LinkRep : " + this.mode_name);
        if ( MODE_NAMES[this.mode_name] != undefined && MODE_NAMES[this.mode_name][LINK_COLOR] != undefined ) {
            this.color = MODE_NAMES[this.mode_name][LINK_COLOR][0];
        }
        
        this.start_node = start_node;
        this.end_node   = end_node;
    } // constructor

    getPoints() {
        return [ this.start_node.getPosition(), this.end_node.getPosition() ];
    } // getPoints()

    draw() {        
        // let link_color = Color.AsVec3( THEMES[this.theme_name][LINK_COLOR][0] );
        // let link_color = [RED][0];
        let points = this.getPoints();
        let center_point = new BABYLON.Vector3.Zero(); 
        let radius = GeometryUtils.GetRadius( STEP );

        let middle_arc_point = GeometryUtils.FindMidArcPoint( points[0], points[1], center_point, radius );  	

        let white_color = Color.AsVec3(WHITE);

        // NB: inconsistency with [COLOR_ARG] : for LinkRep it is the ColorAsVec3(WHITE)
        //                                      for NodeRep it is the color name (eg: WHITE) 
        this.id =   "Link_" 
                 + ShapeUtils.PadWithZero(this.start_node.getNodeNumber() + 1) + "->"
                 + ShapeUtils.PadWithZero(this.end_node.getNodeNumber() + 1);                               
        let data = { [ID_ARG]: this.id, [COLOR_ARG]: Color.AsVec3(this.color), 
                     [MIDDLE_ARC_POINT_ARG]: middle_arc_point, [POINTS_ARG]: points };	
        this.link_shape = new ArcShape( this.renderer, data );
        this.link_shape.draw();
        // console.log(">> LinkRep.draw " + this.id);
    } // draw()
} // LinkRep class