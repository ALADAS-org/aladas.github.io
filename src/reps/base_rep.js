// ====================================================================================================
// =======================================     base_rep.js     ========================================
// ====================================================================================================
"use strict";

// ============================== BaseRep class ==============================
class BaseRep {
	constructor( vizmode, word_indexes, data ) {
        this.vizmode    = vizmode;
        this.mode_name  = this.vizmode.getName();

        this.renderer   = this.vizmode.getRenderer();
        this.scene      = this.renderer.getScene();

        // NB: X axis is red, Y axis is Green and Z axis is blue
        this.local_axes = undefined;

        this.theme_name = this.renderer.getThemeName();       
        
        this.coordinates_system = this.vizmode.getCoordinatesSystem();        

        this.word_indexes = word_indexes;   
        
        data = ( data != undefined ) ? data : {}; 
        this.data = data; 

        this.id = ( data[ID_ARG] != undefined ) ? data[ID_ARG] : "";

        this.shape_mesh = undefined;

        // NB: Centroid relocated with 'START/'STEP'' and position in 3D Grid
        this.centroid_point = GeometryUtils.ComputeCentroid( this.word_indexes );
        this.centroid_size  = 0.12;

        this.size = ( this.data[SIZE_ARG] != undefined ) ? this.data[SIZE_ARG] : 0.1;

        //this.color = THEMES[this.renderer.getParameter(THEME_PARAM)][NODE_COLOR][0];
        this.color = ( this.data[COLOR_ARG] != undefined ) ? this.data[COLOR_ARG] : RED;

        this.material = ( this.data[MATERIAL_ARG] != undefined ) ? this.data[MATERIAL_ARG] : MATERIALS[MAGENTA] ;

        // "node shape consts" in 'base_shape.js'
        this.node_shape = ( this.data[NODE_SHAPE_ARG] != undefined ) ? this.data[NODE_SHAPE_ARG] : NODE_SHAPE_ISOCAHEDRON;
    } // constructor

    // NB: X axis is red, Y axis is Green and Z axis is blue
    setLocalAxesVisibility( visible ) {
        if ( visible ) {
            this.local_axes = new BABYLON.AxesViewer( this.scene, DEBUG_LOCAL_AXIS_LENGTH); 
            this.local_axes.xAxis.parent = this.shape_mesh;
            this.local_axes.yAxis.parent = this.shape_mesh;
            this.local_axes.zAxis.parent = this.shape_mesh;
        }
        else {
            this.local_axes.dispose();  
            this.local_axes = undefined;          
        }
    } // getShapeMesh()

    do_edge_rendering( edges_object, color, edge_thickness ) {                
        // Draw edges with Thickness if 'LINK_THICKNESS' is defined on current 'Theme'
        if ( edge_thickness == undefined ) edge_thickness = 1.0;

        edges_object.enableEdgesRendering();
        edges_object.edgesWidth = edge_thickness;
        let edges_color = new BABYLON.Color4( color.r, color.g, color.b, 1);
        edges_object.edgesColor = edges_color;
    } // do_edge_rendering()

    getId() {
        return this.id;
    } // getId()

    getData() {
        return this.data;
    } // getData()

    getPoints() {
        return [ this.centroid_point ];
    } // getPoints()

    getVizMode() {
        return this.vizmode;
    } // getVizMode()

    draw() {
        console.log(">> BaseRep.draw");      

        let data = { [ID_ARG] : this.id,
                     [MATERIAL_ARG] : MATERIALS[this.color], [ORIGIN_ARG]: this.centroid_point, 
                     [SIZE_ARG]: this.centroid_size };
            
        this.shape = new BaseShape( this.renderer, data );
        this.shape.draw();
    } // draw()
} // BaseRep class