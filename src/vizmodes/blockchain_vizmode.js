// ==========================================================================================================
// =======================================   blockchain_vizmode.js   ========================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";
// NB: 'viz modes constants (eg: BLOCKCHAIN_VIZMODE) defined in 'const_vizmodes.js' 

// ============================== BlockchainVizMode class ==============================
class BlockchainVizMode extends BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.renderer = renderer;

        this.name = BLOCKCHAIN_VIZMODE; 
        this.class_name = this.constructor.name;   
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = CARTESIAN_COORDINATES;
    } // constructor

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        //console.log(">> BlockchainVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            // let data = { [MATERIAL_ARG]: MATERIALS[YELLOW], [NODE_SHAPE_ARG]: NODE_SHAPE_CUBE, [SIZE_ARG]: 0.1 };
            let data = { [ID_ARG]: "Mnemonic_" + ShapeUtils.PadWithZero(i+1), 
                         [COLOR_ARG]: MAGENTA, [NODE_SHAPE_ARG]: NODE_SHAPE_CUBE, [SIZE_ARG]: 0.04 };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()

    drawDebugCore() {
    } // drawDebugCore()

    drawCore() {
        console.log(">> BlockchainVizMode.drawCore");        
    } // drawCore()

    drawBoundings() {
        // console.log(">> BlockchainVizMode.drawBoundings");
        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
            let data = { [ALPHA_FACES_ARG]: true, [SIZE_ARG]: STEP * (MAX_UNITS_ON_AXIS - 1) }; 
			ShapeUtils.DrawCubeBox( this, data );
		}
    } // drawBoundings()

    drawNodes() {
        console.log(">> BlockchainVizMode.drawNodes");
       
        for (let i=0; i < this.node_reps.length; i++) {
            // console.log("   BlockchainVizMode.drawNodes " + JSON.stringify(rep.getPosition()) );
            let node_rep = this.node_reps[i];
            node_rep.draw();

            let data = { [PARENT_REP_ARG]: node_rep,
                         [MATERIAL_ARG]: MATERIALS|[ALPHA_MAT_2], [ALPHA_FACES_MAT_ARG]: MATERIALS[ALPHA_MAT_2],
                         [WIREFRAME_ARG]: true, [WIREFRAME_COLOR_ARG]: CYAN, [DASHED_ARG]: true,
                         [ORIGIN_ARG]: node_rep.getPosition(), [SIZE_ARG]: STEP };
            let box_shape = new CubeShape( this.renderer, data );
            box_shape.draw();
        }
    } // drawNodes()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep ) {
    } // drawStick()

    drawLinks() {
        // console.log(">> BlockchainVizMode.drawLinks");
        for ( let i=0; i < this.node_reps.length; i++ ) {  
            if ( i > 0 ) {
                let start_node_rep = this.node_reps[i-1];
                let end_node_rep   = this.node_reps[i];
                
                let start_point = start_node_rep.getPosition();
                let end_point   = end_node_rep.getPosition();

                let link_points = [];
                link_points.push(start_point);

                let start_X = start_point.x; 
                let start_Y = start_point.y;
                let start_Z = start_point.z;

                let end_X = end_point.x; 
                let end_Y = end_point.y;
                let end_Z = end_point.z;

                let p0 = new BABYLON.Vector3( end_X, start_Y, start_Z );
                link_points.push(p0);

                let p1 = new BABYLON.Vector3( p0.x, end_Y, p0.z );
                link_points.push(p1);

                let p2 = new BABYLON.Vector3( p1.x, p1.y, end_Z );
                link_points.push(p2);

                link_points.push(end_point);

                let vizject_id =   "Link_" 
                        + ShapeUtils.PadWithZero(start_node_rep.getNodeNumber() +1 ) + "->" 
                        + ShapeUtils.PadWithZero(end_node_rep.getNodeNumber() + 1);

                let blockchain_link_vizject = BABYLON.MeshBuilder.CreateLines( vizject_id, { points: link_points });
                blockchain_link_vizject.color = Color.AsVec3(MAGENTA);
                this.renderer.addObject(blockchain_link_vizject);
            }   
        }
    } // drawLinks()

    draw() {
        console.log(">> BlockchainVizMode.draw");
        this.drawBoundings();
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        this.drawLinks();
    } // draw()
} // BlockchainVizMode class