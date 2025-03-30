// ==========================================================================================================
// =========================================   simple_vizmode.js   =========================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";
// NB: 'viz modes constants (eg: PIN_VIZMODE) defined in 'const_vizmodes.js' 

// ============================== SimpleVizMode class ==============================
class SimpleVizMode extends BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.renderer = renderer;

        this.name = SIMPLE_VIZMODE; 
        this.class_name = this.constructor.name;   
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = CARTESIAN_COORDINATES;
    } // constructor

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> SimpleVizMode.createNodes");
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
        console.log(">> SimpleVizMode.drawCore");        
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
        console.log(">> SimpleVizMode.drawNodes");
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
        // console.log(">> SimpleVizMode.drawLinks");
        const create_arrow = (name, node_rep, end_point, size, material, show_ball) => {
            if ( show_ball == undefined ) show_ball = false;
            let arrow_mesh = BABYLON.MeshBuilder.CreateCylinder
                (name, { "height": size, "diameterTop": 0, "diameterBottom": size}, this.renderer.getScene());
                arrow_mesh.position = node_rep.getShapeMesh().position;
                arrow_mesh.material = material;           

            arrow_mesh.lookAt(end_point);
            arrow_mesh.rotation.x += Math.PI / 2;
            
            //if (hide_ball) {
                node_rep.getShapeMesh().setEnabled(show_ball); // hide ball mesh
            //}

            this.renderer.addObject( arrow_mesh );
            return arrow_mesh;
        }; // create_arrow();

        let link_lines = [];
        for ( let i=0; i < this.node_reps.length; i++ ) {  
            if ( i > 0 ) {
                let start_node_rep = this.node_reps[i-1];
                let end_node_rep   = this.node_reps[i];  
                // console.log(">> link between " + start_node_rep.getId() + " and " + end_node_rep.getId());
                
                let link_line = ShapeUtils.DrawLine(start_node_rep.getPosition(), end_node_rep.getPosition(), CYAN);                    
                link_lines.push(link_line);

                let p0 = this.node_reps[i-1].getShapeMesh().position;
                let p1 = this.node_reps[i].getShapeMesh().position;
                let link_arrow = create_arrow
                    ("arrow_" + i, this.node_reps[i-1], p1, 0.06, MATERIALS[CYAN], true);
                link_arrow.position = p0.add(p1).scale(0.5);
            }   
        } // for each this.node_reps  

        // ---- Start node ----
        let p1 = this.node_reps[0].getShapeMesh().position;
        let start_mesh = BABYLON.MeshBuilder.CreateSphere
                ( "start_node", { "segments": 16, "diameter": 0.1 }, this.scene ); 

        start_mesh.material = MATERIALS[GREEN];        
        start_mesh.position = p1;
        this.renderer.addObject(start_mesh);
        // ---- Start node

        // ---- End node ----
        let node_count = this.node_reps.length;
        p1 = this.node_reps[node_count-1].getShapeMesh().position;
        let end_mesh = BABYLON.MeshBuilder.CreateSphere
                ( "end_node", { "segments": 16, "diameter": 0.1 }, this.scene ); 
        
        end_mesh.material = MATERIALS[RED];        
        end_mesh.position = p1;
        this.renderer.addObject(end_mesh);
        // ---- End node
    } // drawLinks()

    draw() {
        console.log(">> SimpleVizMode.draw");
        this.drawBoundings();
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        this.drawLinks();
    } // draw()
} // SimpleVizMode class