// ==========================================================================================================
// =======================================   coronavirus_vizmode.js   =======================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";
// NB: 'viz modes constants (eg: CORONAVIRUS_MODE) defined in 'mode_manager.js' 

// ============================== CoronaVirusVizMode class ==============================
class CoronaVirusVizMode extends BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.renderer     = renderer;

        this.name = CORONAVIRUS_VIZMODE; 
        this.class_name = this.constructor.name;   
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = SPHERICAL_COORDINATES;
        
        this.getParameters();
    } // constructor

    getParameters() {  
        // console.log(">> VizMode.getParameters mode_name = " + this.name);      
        if ( MODE_NAMES[this.name] != undefined ) { 
            // console.log(">> " + this.class_name + ".getParameters mode_name = " + this.name);
            if ( MODE_NAMES[this.name][STICK_COLOR] != undefined ) {            
                this.stick_color = MODE_NAMES[this.name][STICK_COLOR][0];
            }
            // console.log("   this.stick_color: " + JSON.stringify(this.stick_color));
        }
    } // getParameters()

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> CoronaVirusVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            let data = { [ID_ARG]: "Mnemonic_" + ShapeUtils.PadWithZero(i+1),
                         [COLOR_ARG]: MAGENTA };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()

    drawDebugCore() {
        // const axes = new BABYLON.Debug.AxesViewer( this.scene, AXIS_LENGTH );
        // this.renderer.addObject( axes );
    } // drawDebugCore()

    drawCore() {
        console.log(">> CoronaVirusVizMode.drawCore");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
            // Truncated Isocahedron: 32 faces, 'polyhedron type' = 3

            if ( this.debug_mode ) {
                ShapeUtils.DrawWireFrameSphere( ORIGIN, 0.5 );
            }
            else {
                let data = { [ID_ARG]: "Core", [COLOR_ARG]: ORANGE, [FACE_COUNT_ARG]: 32, [SIZE_ARG]: 0.72 };
                let core_shape = new PolyhedronShape( this.renderer, data );
                core_shape.draw();
            }

            // Isocahedron: 20 faces, 'polyhedron type' = 3
            // let data = { [COLOR_ARG]: ORANGE, [FACE_COUNT_ARG]: 20, [SIZE_ARG]: 0.7 };
            // let bb_mesh = new PolyhedronShape( this.renderer, data );
            // bb_mesh.draw();
		}
    } // drawCore()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep) {
        let stick_color_rgb = Color.AsVec3( this.stick_color);
        // console.log(">> CoronaVirusVizMode.drawStick stick_color_rgb: " + stick_color_rgb);        

        this.stick_points = { points: [ node_rep.getPosition(), ORIGIN ] };  
        let vizject_id = "stick_" + ShapeUtils.PadWithZero(node_rep.getNodeNumber()+1);            
        let stick = BABYLON.MeshBuilder.CreateLines( vizject_id, this.stick_points, this.scene );
        stick.color = stick_color_rgb;
        node_rep.do_edge_rendering( stick, stick_color_rgb, 2 );

        this.renderer.addObject(stick);

        this.decorateStick( node_rep );
    } // drawStick()

    decorateStick( node_rep ) {
        // console.log(">> CoronaVirusVizMode.decorateStick ");

        this.debug_mode = false;

        let word_point_x_bit_array = this.getWordIndex_X_AsBitArray( node_rep );
        
        let stick_start = this.stick_points['points'][0];
        // let stick_end = this.stick_points['points'][1];

        let step_percent    = 3;
        let decorate_radius = 0.03;
        
        const RING_TORUS_RADIUS = .015; 

        const draw_ring = ( node_rep, ring_index, center, color ) => {
            let options = { diameter: decorate_radius*1.6, thickness: RING_TORUS_RADIUS, tessellation: 32 };
            let vizject_id =   "ring_" 
                             + ShapeUtils.PadWithZero(node_rep.getNodeNumber()+1) + "_" + ring_index;
            let ring_torus = BABYLON.MeshBuilder.CreateTorus(vizject_id, options, this.scene );
            ring_torus.material = MATERIALS[color];     
            ring_torus.position = center;
            this.renderer.addObject( ring_torus );

            let node_rep_mesh = node_rep.getShapeMesh();
            let node_rep_mesh_rotQ = node_rep_mesh.rotationQuaternion.clone();
            ring_torus.rotationQuaternion = node_rep_mesh_rotQ;
            ring_torus.addRotation( Math.PI / 2, 0, 0 );

            return ring_torus;
        }; // draw_ring()

        let start_percent = RADIUS_NORMAL_PERCENT - 1;
        let ring_color = GREY_50;

        let p0 = GeometryUtils.GetMiddlePoint( stick_start, ORIGIN, start_percent + 2 * step_percent ); 
        ring_color = ( word_point_x_bit_array[0] == 1 ) ? MAGENTA : GREY_50; // GREY_50;                           
        let ring_torus_0 = draw_ring( node_rep, 0, p0, ring_color); 

        let p1 = GeometryUtils.GetMiddlePoint( stick_start, ORIGIN, start_percent + step_percent );
        ring_color = ( word_point_x_bit_array[1] == 1 ) ? MAGENTA : GREY_50; // GREY_50; 
        let ring_torus_1 = draw_ring( node_rep, 1, p1, ring_color);

        let p2 = GeometryUtils.GetMiddlePoint( stick_start, ORIGIN, start_percent );
        ring_color = ( word_point_x_bit_array[2] == 1 ) ? MAGENTA : GREY_50; // GREY_50; 
        let ring_torus_2 = draw_ring( node_rep, 2, p2, ring_color);
    } // decorateStick()

    drawBoundings() {
        // console.log(">> CoronaVirusVizMode.drawBoundings");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
			ShapeUtils.DrawCubeBox();
            // ShapeUtils.DrawSphereBox( 0.2 );
		}
    } // drawBoundings()

    drawNodes() {
        console.log(">> CoronaVirusVizMode.drawNodes");
        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            node_rep.draw();
        }
    } // drawNodes()

    drawLinks() {
        // console.log(">> CoronaVirusVizMode.drawLinks");
        for ( let i=0; i < this.node_reps.length; i++ ) {
            if ( i > 0 ) {
                let start_node_rep = this.node_reps[i-1];
                let end_node_rep   = this.node_reps[i];  
                // console.log(">> link between " + start_node_rep.getId() + " and " + end_node_rep.getId());
                
                let link_rep = new LinkRep( this, this.word_indexes, start_node_rep, end_node_rep );
                link_rep.draw();  
            }   
        }
    } // drawLinks()

    draw() {
        console.log(">> CoronaVirusVizMode.draw");
        this.drawBoundings();
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        this.drawLinks();
    } // draw()
} // CoronaVirusVizMode class