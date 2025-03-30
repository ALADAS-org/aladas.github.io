// ==========================================================================================================
// ===========================================   pin_vizmode.js   ===========================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";
// NB: 'viz modes constants (eg: PIN_VIZMODE) defined in 'const_vizmodes.js' 

// ============================== PinVizMode class ==============================
class PinVizMode extends BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.renderer = renderer;

        this.name = PIN_VIZMODE; 
        this.class_name = this.constructor.name;   
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = CARTESIAN_COORDINATES;
    } // constructor

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> PinVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            
            let data = { [ID_ARG]: "Mnemonic_" + ShapeUtils.PadWithZero(i+1), 
                         [MATERIAL_ARG]: MATERIALS[YELLOW], [NODE_SHAPE_ARG]: NODE_SHAPE_SPHERE, [SIZE_ARG]: 0.2 };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()

    drawDebugCore() {
    } // drawDebugCore()

    drawCore() {
        console.log(">> PinVizMode.drawCore");        
    } // drawCore()

    drawBoundings() {
        // console.log(">> CoronaVirusVizMode.drawBoundings");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
            let data = { [SIZE_ARG]: STEP * (MAX_UNITS_ON_AXIS - 1) }; 
			ShapeUtils.DrawCubeBox( this, data );
            // ShapeUtils.DrawSphereBox( 0.2 );
		}
    } // drawBoundings()

    drawNodes() {
        console.log(">> PinVizMode.drawNodes");

        let VIZMODE_ORIGIN = this.getOrigin();

        const get_closest_point_on_axis = ( node_rep, axis_number ) => { // axis_number: X=0,Y=0,Z=0 
            let pos_x = VIZMODE_ORIGIN.x + STEP * node_rep.getWordPoint().x;
            let pos_y = VIZMODE_ORIGIN.y + STEP * node_rep.getWordPoint().y;
            let pos_z = VIZMODE_ORIGIN.z + STEP * node_rep.getWordPoint().z;

            let node_point = new BABYLON.Vector3( pos_x, pos_y, pos_z ); 

            switch ( axis_number ) {
                case 0: pos_x = VIZMODE_ORIGIN.x; break;
                case 1: pos_y = VIZMODE_ORIGIN.y; break;
                case 2: pos_z = VIZMODE_ORIGIN.z; break;      
            }

            let min_on_axis = new BABYLON.Vector3( pos_x, pos_y, pos_z ); 
            let d_min = min_on_axis.subtract(node_point).length();        

            pos_x = VIZMODE_ORIGIN.x + STEP * node_rep.getWordPoint().x;
            pos_y = VIZMODE_ORIGIN.y + STEP * node_rep.getWordPoint().y;
            pos_z = VIZMODE_ORIGIN.z + STEP * node_rep.getWordPoint().z;
            switch ( axis_number ) {
                case 0: pos_x = VIZMODE_ORIGIN.x + STEP*15; break;
                case 1: pos_y = VIZMODE_ORIGIN.y + STEP*15; break;
                case 2: pos_z = VIZMODE_ORIGIN.z + STEP*15; break;      
            }
            let max_on_axis = new BABYLON.Vector3( pos_x, pos_y, pos_z ); 
            let d_max = max_on_axis.subtract(node_point).length();

            if (d_min <= d_max) {
                return min_on_axis;
                //ShapeUtils.DrawCircle(min_X, 0.02);
                //ShapeUtils.DrawLine(min_X, node_point);
            }
            else {
                return max_on_axis;
                //ShapeUtils.DrawCircle(max_X, 0.02);
                //ShapeUtils.DrawLine(max_X, node_point);
            }
        }; // get_closest_point_on_axis()

        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            node_rep.draw();

            let pos_x = VIZMODE_ORIGIN.x + STEP * node_rep.getWordPoint().x;
            let pos_y = VIZMODE_ORIGIN.y + STEP * node_rep.getWordPoint().y;
            let pos_z = VIZMODE_ORIGIN.z + STEP * node_rep.getWordPoint().z;
            let node_point = new BABYLON.Vector3( pos_x, pos_y, pos_z );

            let closest_on_X_axis = get_closest_point_on_axis(node_rep, 0);
            let closest_on_Y_axis = get_closest_point_on_axis(node_rep, 1);

            let d_X = node_point.subtract(closest_on_X_axis).length();
            let d_Y = node_point.subtract(closest_on_Y_axis).length();

            let closest_point = undefined; 
            let d_closest     = undefined;
            if (d_X <= d_Y) { closest_point = closest_on_X_axis; d_closest = d_X; }
            else            { closest_point = closest_on_Y_axis; d_closest = d_Y; }

            let closer_on_Z_axis = get_closest_point_on_axis(node_rep, 2);
            let d_Z = node_point.subtract(closer_on_Z_axis).length();
            if (d_Z <= d_closest) { closest_point = closer_on_Z_axis; }

            // ShapeUtils.DrawCircle(closest_point, 0.02);
            // ShapeUtils.DrawLine(closest_point, node_point);
            
            let epsilon = 0.09;
            let cylinder_length = BABYLON.Vector3.Distance( closest_point, node_point ); 

            if ( cylinder_length > epsilon ) {
                let data = { [START_POINT_ARG]: closest_point, [END_POINT_ARG]: node_point, [DIAMETER_ARG]: 0.05 };
                let cylinder_shape = new CylinderShape( this.renderer, data ); 
                cylinder_shape.draw();
                cylinder_shape.getShapeMesh().material = MATERIALS[MAGENTA];
           }
        }
    } // drawNodes()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep ) {
    } // drawStick()

    drawLinks() {
        // console.log(">> PinVizMode.drawLinks");
        for ( let i=0; i < this.node_reps.length; i++ ) {  
            if ( i > 0 ) {
                let start_node_rep = this.node_reps[i-1];
                let end_node_rep   = this.node_reps[i];  
                // console.log(">> link between " + start_node_rep.getId() + " and " + end_node_rep.getId());
                
                ShapeUtils.DrawLine(start_node_rep.getPosition(), end_node_rep.getPosition(), CYAN); 
            }   
        }
    } // drawLinks()

    draw() {
        console.log(">> PinVizMode.draw");
        this.drawBoundings();
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        this.drawLinks();
    } // draw()
} // PinVizMode class