// ====================================================================================================
// =======================================     node_rep.js     ========================================
// ====================================================================================================
"use strict";

// ============================== NodeRep class ==============================
class NodeRep extends BaseRep {
	constructor( vizmode, word_indexes, node_number, data ) {
        super( vizmode, word_indexes, data );      

        this.node_number = node_number;
        this.word_index  = this.word_indexes[this.node_number];       
        
        let use_scaling_factor = (this.vizmode.getCoordinatesSystem() == CARTESIAN_COORDINATES);
        // console.log(">> NodeRep.computePosition  use_scaling_factor: " + use_scaling_factor);
        this.word_point  = GeometryUtils.WordIndexToVector3( this.word_index, use_scaling_factor );

        this.theta       = -1;
        this.phi         = -1;

        this.position    = this.computePosition(GeometryUtils.GetRadius());

        this.point_normal_theta = BABYLON.Vector3.Zero();
        this.point_normal_phi   = BABYLON.Vector3.Zero();        
    } // constructor

    getPoints() {
        return [ this.position ];
    } // getPoints()

    getWordPoint() {
        return this.word_point;
    } // getWordPoint()

    getWordIndex() {
        return this.word_index;
    } // getWordIndex()

    getNodeNumber() {
        return this.node_number;
    } // getNodeNumber()

    getPosition() {
        return this.position;
    } // getPosition()

    getTheta() {
        return this.theta;
    } // getTheta()

    getPhi() {
        return this.phi;
    } // getPhi()

    getShape() {
        return this.shape;
    } // getShape()

    getShapeMesh() {
        return this.shape_mesh;
    } // getShapeMesh()

    // computePosition( radius, log ) {   
    computePosition( radius ) {     
        // console.log(">> NodeRep.computePosition  node_number: " + this.node_number + "  word_index: " + this.word_index);

        if ( radius == undefined ) {            
            if ( this.coordinates_system == CYLINDRICAL_COORDINATES ) {
                radius = STEP * this.word_point.x * X_SCALING_FACTOR * CYLINDER_SCALE;
            }
            else radius = GeometryUtils.GetRadius();
        }  
        
        // if ( log == undefined ) {
        //    log = true;
        //} 

        let pos_x = 0;
        let pos_y = 0;
        let pos_z = 0;

        if ( this.coordinates_system == CARTESIAN_COORDINATES ) {
            let vizmode_origin = this.vizmode.getOrigin();
            let start_x = vizmode_origin.x;
            //pos_x = START + STEP * this.word_point.x; // x = [0..15]
            pos_x = start_x + STEP * this.word_point.x; // x = [0..15]

            let start_y = vizmode_origin.y;
            //pos_y = START + STEP * this.word_point.y; // y = [0..15]
            pos_y = start_y + STEP * this.word_point.y; // y = [0..15]

            let start_z = vizmode_origin.z;
            // pos_z = START + STEP * this.word_point.z; // z = [0..15]
            pos_z = start_z + STEP * this.word_point.z; // z = [0..15]
        }
        else if ( this.coordinates_system == SPHERICAL_COORDINATES ) {
            // https://stackoverflow.com/questions/10085069/polar-coordinates-of-a-vector-in-three-dimensional-space#:~:text=But%2C%20for%203D%20polar%2C%20a,z%2Daxis%20to%20the%20radius.
            this.theta = this.word_point.y * TAU / MAX_UNITS_ON_AXIS; // theta = [0..2*PI] ;
            // console.log(" word_point.y: " + word_point.y + " theta: " + theta + " theta(deg): " + GeometryUtils.RadianToDegree(theta));             

            this.phi = this.word_point.z * TAU / MAX_UNITS_ON_AXIS;   // phi   = [0..2*PI] ;
            // console.log(" word_point.z: " + word_point.z + " phi: " + phi + " phi(deg): " + GeometryUtils.RadianToDegree(phi)); 

            let compute_xyz = ( radius, theta, phi ) => { 
                let x = STEP * radius * Math.sin(theta) * Math.cos(phi);
                let y = STEP * radius * Math.sin(theta) * Math.sin(phi);
                let z = STEP * radius * Math.cos(theta);
                return new BABYLON.Vector3( x, y, z);
            }; // compute_xyz()

            let xyz_vec3 = compute_xyz( radius, this.theta, this.phi );

            pos_x = xyz_vec3.x;
            pos_y = xyz_vec3.y;
            pos_z = xyz_vec3.z;
        }
        else if ( this.coordinates_system == CYLINDRICAL_COORDINATES ) {
            // this.theta = ( this.word_point.x / MAX_UNITS_ON_AXIS ) * TAU ;
            this.theta = ( this.word_point.z / MAX_UNITS_ON_AXIS ) * TAU ; // Ref is Z
            // this.theta = ( this.word_point.x / MAX_UNITS_ON_AXIS ) * TAU ; // Ref is X or Z ?

            //if ( log ) {
            //    // console.log("   Cylindrical theta: " + this.theta);
            //}            
           
            pos_x  = STEP * ( radius + MIN_CYLINDER_RADIUS ) * Math.cos( this.theta );
            pos_z  = STEP * ( radius + MIN_CYLINDER_RADIUS ) * Math.sin( this.theta );
            pos_y  = START + STEP * this.word_point.y;
        }

        return new BABYLON.Vector3( pos_x, pos_y, pos_z );
    } // computePosition()

    draw() {   
        // let data = { [COLOR_ARG]: this.color, [FACE_COUNT_ARG]: 8, [ORIGIN_ARG]: this.position };

        if ( this.coordinates_system == SPHERICAL_COORDINATES ) {
             // NB: "required" Side effect
            this.position = this.computePosition(GeometryUtils.GetRadius() * SPHERICAL_RADIUS_SCALE);
        }
        else if ( this.coordinates_system == CYLINDRICAL_COORDINATES ) {
            this.position = this.computePosition(GeometryUtils.GetRadius() * CYLINDRICAL_RADIUS_SCALE);
        }

        let data = { [ORIGIN_ARG]: this.position  };
        if ( this.renderer.getParameter(METADATA_PARAM) )  {
            data[MNEMONIC_ARG]   = MnemonicUtils.WordIndexToMnemonic( this.getWordIndex() ); 
            data[WORD_INDEX_ARG] = this.getWordIndex();
        }

        // "node shape consts" in 'base_shape.js'
        if (this.node_shape == NODE_SHAPE_CUBE) {
            data[COLOR_ARG]      = this.color;
            data[FACE_COUNT_ARG] = 6;
            data[SIZE_ARG]       = this.size;
            if ( this.vizmode.getName() == BLOCKCHAIN_VIZMODE ) {
                data[[PARENT_REP_ARG]] = this;            
            }
            this.shape = new PolyhedronShape( this.renderer, data );
        }
        else if (this.node_shape == NODE_SHAPE_SPHERE) {
            data[PARENT_REP_ARG] = this;
            data[MATERIAL_ARG]   = MATERIALS[GREY_50];
            data[SIZE_ARG]       = 0.07;            
            this.shape = new BallShape( this.renderer, data );
        }
        else { // NODE_SHAPE_ISOCAHEDRON
            // let data = { [COLOR_ARG]: this.color, [FACE_COUNT_ARG]: 6, [ORIGIN_ARG]: this.position };
            data[PARENT_REP_ARG] = this;
            data[COLOR_ARG]      = this.color;
            data[FACE_COUNT_ARG] = 8;             
            //this.shape = new BaseShape( this.renderer, data );
            this.shape = new PolyhedronShape( this.renderer, data );
        }

        // NB: Specific case: dont't draw NodeRep for BLOCKCHAIN_VIZMODE vizmode
        if ( this.shape != undefined ) {
            this.shape_mesh = this.shape.draw();

            if ( this.renderer.getParameter(METADATA_PARAM) ) {
                let gltf_metadata = this.shape._getGltfMetaData();
                let word_index = this.getWordIndex();
                gltf_metadata["extras"] = 
                    { [MNEMONIC_ARG]:   MnemonicUtils.WordIndexToMnemonic(word_index), 
                      [WORD_INDEX_ARG]: word_index };                       
            }

            // this.id = "NodeRep/" + this.shape.getId();
            // console.log(">> NodeRep.draw " + this.id);          
            // console.log("this.vizmode: " + this.vimode);

            if ( this.coordinates_system == SPHERICAL_COORDINATES ) {
                GeometryUtils.RotateAroundPivot( this.shape_mesh, this.shape_mesh.position, BABYLON.Axis.Y, this.theta );
                GeometryUtils.RotateAroundPivot( this.shape_mesh, this.shape_mesh.position, BABYLON.Axis.Z, this.phi );
            }   
            else if ( this.coordinates_system == CYLINDRICAL_COORDINATES ) {
            // GeometryUtils.RotateAroundPivot( this.shape_mesh, this.shape_mesh.position, BABYLON.Axis.Z, this.theta );
            // GeometryUtils.RotateAroundPivot( this.shape_mesh, this.shape_mesh.position, BABYLON.Axis.Y, Math.PI/4 );
            }       

            this.vizmode.drawStick( this ); // must be after GeometryUtils.RotateAroundPivot which sets rotationQuaternion
        }

        return this.shape_mesh;
    } // draw()
} // NodeRep class