// ==========================================================================================================
// =======================================   helical_virus_vizmode.js   =====================================
// ==========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic
"use strict";
// NB: 'viz modes constants (eg: HELICAL_VIRUS_VIZMODE) defined in 'const_vizmodes.js' 

// ============================== HelicalVirusVizMode class ==============================
class HelicalVirusVizMode extends CoronaVirusVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.name = HELICAL_VIRUS_VIZMODE;
        this.class_name = this.constructor.name; 

        this.renderer.setParameter(MODE_PARAM, this.name);

        this.coordinates_system = CYLINDRICAL_COORDINATES;

        this.getParameters();        
    } // constructor

    drawDebugCore() {
        // const axes = new BABYLON.Debug.AxesViewer( this.scene, AXIS_LENGTH );
        // this.renderer.addObject( axes );

        let radius = 0.2; 
        let center = new BABYLON.Vector3.Zero();

        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            center = new BABYLON.Vector3( 0, node_rep.getPosition().y, 0 );
            ShapeUtils.DrawPoint( center, GREEN );
            ShapeUtils.DrawCircle( center, radius, CYAN );

            let ring_point = GeometryUtils.ComputePolarPoint( radius, node_rep.getTheta(), center);
            ShapeUtils.DrawPoint( ring_point, MAGENTA );
        }

        for ( let i = -0.8; i < 0.8; i+= 0.3 ) {
            center = new BABYLON.Vector3( 0, i, 0 );
            ShapeUtils.DrawCircle( center, radius, GREY_50 );
        }
    } // drawDebugCore()

    drawCore() {
        console.log(">> HelicalVirusVizMode.drawCore");

        let core_mesh = undefined;
        if ( this.renderer.getParameter(DEBUG_PARAM) ) {
            core_mesh = this.drawDebugCore();
        }
        else {            
            core_mesh = ShapeUtils.DrawSpring();
            this.renderer.addObject( core_mesh );
        }  
        
        return core_mesh;
    } // drawCore()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep ) { 
        let stick_color_rgb = Color.AsVec3( this.stick_color);
        // console.log(">> HelicalVirusVizMode.drawStick stick_color_rgb: " + stick_color_rgb);     

        // ---------- 1. Draw 'Stick line' ----------
        let ring_center = new BABYLON.Vector3( 0, node_rep.getPosition().y, 0 );
        let radius = 0.2;
        let ring_point = GeometryUtils.ComputePolarPoint2D( radius, node_rep.getTheta(), ring_center);

        this.stick_points = { points: [ node_rep.getPosition(), ring_point ] }; 
        let vizject_id = "stick_" + ShapeUtils.PadWithZero(node_rep.getNodeNumber() + 1);              
        let stick = BABYLON.MeshBuilder.CreateLines( vizject_id, this.stick_points, this.scene );
        stick.color = stick_color_rgb
        node_rep.do_edge_rendering( stick, stick_color_rgb, 2 );
        this.renderer.addObject(stick);
        // ---------- 1. Draw 'Stick line'

        // ---------- 2. Draw 'Stick anchor line' ----------
        let Y_STEP = STEPS_COUNT * HELIX_PITCH / 7;
        let p0 = new BABYLON.Vector3( ring_point.x, ring_point.y - Y_STEP/2 , ring_point.z ); 
        let p1 = new BABYLON.Vector3( ring_point.x, ring_point.y + Y_STEP/2 , ring_point.z );
        let anchor_points = { points: [ p0, p1 ] };
        vizject_id = "stick_anchor_" + ShapeUtils.PadWithZero(node_rep.getNodeNumber() + 1);             
        let stick_anchor = BABYLON.MeshBuilder.CreateLines( vizject_id, anchor_points, this.scene);
        stick_anchor.color = stick_color_rgb
        node_rep.do_edge_rendering( stick_anchor, stick_color_rgb, 2 );
        this.renderer.addObject(stick_anchor);
        // ---------- 2. Draw 'Stick anchor line'

        this.decorateStick( node_rep );
    } // drawStick()

    decorateStick( node_rep ) {
        // console.log(">> HelicalVirusVizMode.decorateStick ");

        let word_point_x_bit_array = this.getWordIndex_X_AsBitArray( node_rep );
        
        let stick_start = this.stick_points['points'][0];
        let stick_end   = this.stick_points['points'][1];

        let start_percent = 30;
        let step_percent  = 10;
        let decorate_radius = 0.02; // 0.03
        
        const RING_TORUS_RADIUS = .015; 

        const draw_ring = ( center, ring_index, color ) => {
            let p1_a = new BABYLON.Vector3( center.x, center.y - decorate_radius, center.z);    
            let p1_b = new BABYLON.Vector3( center.x, center.y + decorate_radius, center.z);    
            let p1_ortho = GeometryUtils.ComputePolarPoint2D( decorate_radius, node_rep.getTheta() + Math.PI/2, center );
    
            let ring_circle = ShapeUtils.DrawCircleFrom3Points( p1_a, p1_ortho, p1_b, color );
            ring_circle.setEnabled(false);
            this.renderer.addObject( ring_circle );

            let options = { diameter: decorate_radius*1.6, thickness: RING_TORUS_RADIUS, tessellation: 32 };
            let vizject_id =   "ring_" + ShapeUtils.PadWithZero(node_rep.getNodeNumber() + 1) 
                             + "_" + ring_index;
            let ring_torus = BABYLON.MeshBuilder.CreateTorus( vizject_id, options, this.scene );
            ring_torus.material = MATERIALS[color];
            ring_torus.position = center;
            GeometryUtils.RotateAroundPivot( ring_torus, center, BABYLON.Axis.X, ring_circle.rotation.x + Math.PI/2 );
            GeometryUtils.RotateAroundPivot( ring_torus, center, BABYLON.Axis.Y, ring_circle.rotation.z - node_rep.getTheta() + Math.PI/2 );
            GeometryUtils.RotateAroundPivot( ring_torus, center, BABYLON.Axis.Z, ring_circle.rotation.y );

            this.renderer.addObject( ring_torus );
        }; // draw_ring()

        let ring_color = GREY_50; // GREY_50: 0 / MAGENTA: 1

        // NB: 'rings bits' are ordered from center to periphery: [0],[1],[2]
        let p0 = GeometryUtils.GetMiddlePoint( stick_start, stick_end, start_percent + 2 * step_percent);
        ring_color = ( word_point_x_bit_array[0] == 1 ) ? MAGENTA : GREY_50; // GREY_50;
        draw_ring( p0, 0, ring_color );

        let p1 = GeometryUtils.GetMiddlePoint( stick_start, stick_end, start_percent + step_percent );
        ring_color = ( word_point_x_bit_array[1] == 1 ) ? MAGENTA : GREY_50; // GREY_50; 
        draw_ring( p1, 1, ring_color );        

        let p2 = GeometryUtils.GetMiddlePoint( stick_start, stick_end, start_percent );        
        ring_color = ( word_point_x_bit_array[2] == 1 ) ? MAGENTA : GREY_50; // GREY_50; 
        draw_ring( p2, 2, ring_color );        
    } // decorateStick()

    drawBoundings() {
        // console.log(">> HelicalVirusVizMode.drawBoundings");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
			ShapeUtils.DrawCubeBox();
		}
    } // drawBoundings()
    
    drawNodes() {
        console.log(">> HelicalVirusVizMode.drawNodes");
        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            node_rep.draw();
            let shape_mesh = node_rep.getShapeMesh();
            shape_mesh.rotation.y = - node_rep.getTheta();       
        }
    } // drawNodes()
} // HelicalVirusVizMode class