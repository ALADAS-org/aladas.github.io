// ==========================================================================================================
// ==========================================    arc_vizmode.js    ==========================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";
// NB: 'viz modes constants (eg: PIN_VIZMODE) defined in 'const_vizmodes.js' 

// ============================== ArcVizMode class ==============================
class ArcVizMode extends BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.renderer = renderer;

        this.name = ARC_VIZMODE; 
        this.class_name = this.constructor.name;   
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = CARTESIAN_COORDINATES;
    } // constructor

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> ArcVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            
            let node_size = .2;           
            let data = { [ID_ARG]: "Mnemonic_" + ShapeUtils.PadWithZero(i+1), 
                         [MATERIAL_ARG]: MATERIALS[YELLOW], [NODE_SHAPE_ARG]: NODE_SHAPE_SPHERE, 
                         [SIZE_ARG]: node_size };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()

    drawDebugCore() {
    } // drawDebugCore()

    drawCore() {
        console.log(">> ArcVizMode.drawCore");        
    } // drawCore()

    drawBoundings() {
        // console.log(">> ArcVizMode.drawBoundings");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
            let data = { [SIZE_ARG]: STEP * (MAX_UNITS_ON_AXIS - 1) }; 
			ShapeUtils.DrawCubeBox( this, data );
            // ShapeUtils.DrawSphereBox( 0.2 );
		}
    } // drawBoundings()

    drawNodes() {
        console.log(">> ArcVizMode.drawNodes");
        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            let shape = node_rep.draw();
            if ( i == 0 ) shape.material = MATERIALS[GREEN]; 
            if ( i == this.node_reps.length - 1) shape.material = MATERIALS[RED]; 

            if ( i == 0 || i == (this.node_reps.length -1) ) {
                shape.updatable = true;
                shape.size  = 1;
            }
        }
    } // drawNodes()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep ) {
    } // drawStick()

    drawLinks() {
        // console.log(">> ArcVizMode.drawLinks");
        let p0 = BABYLON.Vector3.Zero();
        let p1 = BABYLON.Vector3.Zero();
        let centroid_point = GeometryUtils.ComputeCentroid( this.word_indexes, this );
        let polyline_points = []; 
        for ( let i=0; i < this.node_reps.length; i++ ) {  
            let current_point = this.node_reps[i].getPosition();
            polyline_points.push( current_point);
            if ( i > 0 ) {                
                p0 = polyline_points[ polyline_points.length - 1 ];
                p1 = polyline_points[ polyline_points.length - 2 ];
                let points = [ p0, p1 ];

                let theme_name = this.renderer.getParameter(THEME_PARAM);
                // console.log("theme_name:   " + theme_name);
                // console.log("LINK_COLOR:   " + THEMES[theme_name][LINK_COLOR][0] );
                let arc_color = Color.AsVec3( THEMES[theme_name][LINK_COLOR][0] );

                // console.log("filled_triangles:   " + filled_triangles);

                let vizject_id = "Link_" + ShapeUtils.PadWithZero(i) + "->" 
                                         + ShapeUtils.PadWithZero(i+1); 

                let data = { [ID_ARG]: vizject_id,
                             [COLOR_ARG]: arc_color, [ORIGIN_ARG]: current_point, 
                             [CENTROID_ARG]: centroid_point, [POINTS_ARG]: points };

                let arc_shape = new ArcShape( this.renderer, data ); 
                arc_shape.draw();
            }   
        } // for each this.node_reps 
    } // drawLinks()

    draw() {
        console.log(">> ArcVizMode.draw");
        this.drawBoundings();
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        this.drawLinks();
    } // draw()
} // ArcVizMode class