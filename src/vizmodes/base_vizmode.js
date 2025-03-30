// ==========================================================================================================
// =======================================   coronavirus_vizmode.js   =======================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";

// NB: 'viz modes constants (eg: CORONAVIRUS_VIZMODE) defined in 'const_vizmodes.js' 

// ============================== BaseVizMode class ==============================
class BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        this.renderer     = renderer;

        this.name = CORONAVIRUS_VIZMODE; 
        this.class_name = this.constructor.name;  
        
        // this.origin = new BABYLON.Vector3(START, START, START);
        this.origin = new BABYLON.Vector3(START, START, START);
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = SPHERICAL_COORDINATES;

        this.stick_points = { points: [] };
        this.stick_color = WHITE;

        this.debug_mode = false;
        if ( this.renderer.getParameter(DEBUG_PARAM) != undefined ) {
            this.debug_mode = this.renderer.getParameter(DEBUG_PARAM);
        }

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

    getName() {
        return this.name;
    } // getName()

    getRenderer() {
        return this.renderer;
    } // getRenderer()

    getOrigin() {
        return this.origin;
    } // getOrigin()

    getCoordinatesSystem() {
        return this.coordinates_system;
    } // getCoordinatesSystem()

    // NB: Don't use 'X_SCALING_FACTOR' because here we need the plain 3 bits of 'X' not scaled 
    getWordIndex_X_AsBitArray( node_rep ) {
        let word_index = node_rep.getWordIndex();
        
        let word_point_x = Math.floor( word_index / 256 );
        // console.log("   word_point_x: "        + word_point_x);
        let word_point_x_binary = word_point_x.toString(2);
        // console.log("   word_point_x_binary: "        + word_point_x_binary);

        // https://stackoverflow.com/questions/66141333/convert-binary-string-to-string-in-javascript        
        // concatenate the missing '0' up to minBitLength
        while ( word_point_x_binary.length < 3 ) {
            word_point_x_binary = '0' + word_point_x_binary;
        }
        // console.log("   word_point_x_binary: " + word_point_x_binary);

        let word_point_x_binary_items = word_point_x_binary.split(''); // convert string to array of characters
        // console.log("   word_point_x_binary_items: " + word_point_x_binary_items);
        let word_point_x_bit_array = [];
        for (let i=0; i < word_point_x_binary_items.length; i++) {
            word_point_x_bit_array.push( parseInt(word_point_x_binary_items[i]) );
        }
        // console.log("   word_point_x_bit_array: " + JSON.stringify(word_point_x_bit_array));
        return word_point_x_bit_array;
    } // getWordIndex_X_AsBitArray()

    getCoordinatesSystem() {
        return this.coordinates_system;
    } // getCoordinatesSystem()

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> BaseVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            let data = { [COLOR_ARG]: MAGENTA };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()

    drawDebugCore() {
        // const axes = new BABYLON.Debug.AxesViewer( this.scene, AXIS_LENGTH );
        // this.renderer.addObject( axes );
    } // drawDebugCore()

    drawCore() {
        console.log(">> BaseVizMode.drawCore");

        let core_mesh = undefined;
        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
            // Truncated Isocahedron: 32 faces, 'polyhedron type' = 3
            let data = { [COLOR_ARG]: ORANGE, [FACE_COUNT_ARG]: 32, [SIZE_ARG]: 0.75 };
            core_mesh = new PolyhedronShape( this.renderer, data );
            core_mesh.draw();

            let leaf_mesh = this.renderer.getLeafMesh();
            if ( leaf_mesh == undefined ) this.renderer.setLeafMesh(core_mesh); 
            //  animated_vizjects.push(core_mesh);
            
            // Isocahedron: 20 faces, 'polyhedron type' = 3
            // let data = { [COLOR_ARG]: ORANGE, [FACE_COUNT_ARG]: 20, [SIZE_ARG]: 0.7 };
            // let core_mesh = new PolyhedronShape( this.renderer, data );
            // core_mesh.draw();
		}
        return core_mesh;
    } // drawCore()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep) {
        let stick_color_rgb = Color.AsVec3( this.stick_color);
        // console.log(">> CoronaVirusVizMode.drawStick stick_color_rgb: " + stick_color_rgb);        

        let origin_point = new BABYLON.Vector3.Zero(); 
        this.stick_points = { points: [ node_rep.getPosition(), origin_point ] };              
        let stick = BABYLON.MeshBuilder.CreateLines( node_rep.id + "_stick", this.stick_points, this.scene );
        stick.color = stick_color_rgb;
        node_rep.do_edge_rendering( stick, stick_color_rgb, 2 );

        this.renderer.addObject(stick);
    } // drawStick()

    drawBoundings() {
        // console.log(">> BaseVizMode.drawBoundings");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
			ShapeUtils.DrawCubeBox();
            // ShapeUtils.DrawSphereBox( 0.2 );
		}
    } // drawBoundings()

    drawNodes() {
        console.log(">> BaseVizMode.drawNodes");
        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            node_rep.draw();
        }
    } // drawNodes()

    drawLinks() {
        // console.log(">> BaseVizMode.drawLinks");
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
        console.log(">> BaseVizMode.draw");
        this.drawBoundings();
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        this.drawLinks();
    } // draw()
} // BaseVizMode class