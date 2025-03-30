// ====================================================================================================
// ======================================     shape_utils.js     ======================================
// ====================================================================================================
"use strict";

const BOX_POINTS_MATRIX = [ [ 0, 0, 0], [ 1, 0, 0], [ 1, 1, 0], [ 0, 1, 0], [ 0, 0, 0],
							[ 0, 0, 0], [ 0, 1, 0], [ 0, 1, 1], [ 0, 0, 1], [ 0, 0, 0],
							[ 0, 0, 0], [ 0, 0, 1], [ 1, 0, 1], [ 1, 0, 0], [ 0, 0, 0],

							[ 0, 0, 1], [ 1, 0, 1], [ 1, 1, 1], [ 0, 1, 1], [ 0, 0, 1],
							[ 0, 0, 1], [ 0, 1, 1], [ 1, 1, 1], [ 1, 1, 0], [ 0, 1, 0],
                          ];

const AXIS_LENGTH = 0.85;

let LinkCount        = 0; 
let SimpleShapeCount = 0;  

class ShapeUtils {
    static Reset() {
        LinkCount        = 0;
        SimpleShapeCount = 0; 
    } // ShapeUtils.Reset()

    static PadWithZero(n) {
        return (n < 10 ? ('0'+n).toString() : n.toString());
    } // ShapeUtils.PadWithZero()

    static CreatePolyline( arg_points, args ) {
		// console.log(">> createPolyline");
        let renderer = Renderer.GetInstance();
		let polyline_color = THEMES[renderer.getParameter(THEME_PARAM)][LINK_COLOR][0];
		// console.log("   polyline_color: " + polyline_color);
	
		let color_rgb = Color.AsVec3( polyline_color );
		if ( args !=  undefined && args["color"] != undefined ) {
			// Note: color[0] is' Color Name' and 1..3 indexes are RGB components
			color_rgb = Color.AsVec3( args["color"] );
		}
		const polylines = BABYLON.MeshBuilder.CreateLines( "Polyline_" + LinkCount, { points: arg_points });
		polylines.color = color_rgb;
		renderer.addObject( polylines );
        LinkCount++;
		
		return polylines;
	} // ShapeUtils.CreatePolyline()

    static CreateTruncatedIcosahedron() {
        let renderer = Renderer.GetInstance();
        let scene = renderer.getScene();       

        let options = { m:1, n: 1, size: .5 };
        const goldbergPoly = BABYLON.MeshBuilder.CreateGoldberg("goldberg", options, scene); // scene is optional and defaults to the current scene

        return goldbergPoly;
    } // ShapeUtils.CreateTruncatedIcosahedron()

    static DrawPoint( position, color, point_diameter ) {	
        let renderer = Renderer.GetInstance();
        color          = ( color != undefined) ? color : GREEN;
        point_diameter = ( point_diameter != undefined) ? point_diameter : .035; // 0.05

        let point_vizject = BABYLON.MeshBuilder.CreateSphere
                               ( "Point_" + SimpleShapeCount, 
                                 { "segments": 16, "diameter": point_diameter }, renderer.getScene() ); 
        point_vizject.position = position;
        point_vizject.material = MATERIALS[color];        
        renderer.addObject( point_vizject );
        SimpleShapeCount++;

        return point_vizject;
    } // ShapeUtils.DrawPoint()

    static DrawLine( p0, p1, color ) {
        let renderer = Renderer.GetInstance();        
        color = ( color != undefined) ? color : GREY_75;
        
        let line_vizject = BABYLON.MeshBuilder.CreateLines
                           ("Line_" + SimpleShapeCount, { points: [ p0, p1 ] });
        line_vizject.color = Color.AsVec3(color);

        renderer.addObject( line_vizject );
        SimpleShapeCount++;

        return line_vizject;
    } // ShapeUtils.DrawLine()

    static DrawTriangle( p0, p1, p2, color ) {
        let renderer = Renderer.GetInstance();        
        color = ( color != undefined) ? color : ORANGE;

        let triangle_vizject = BABYLON.MeshBuilder.CreateLines
                               ("Triangle_" + SimpleShapeCount, { points:[ p0, p1, p2, p0 ] });
        triangle_vizject.color = Color.AsVec3(color);

        renderer.addObject( triangle_vizject );
        SimpleShapeCount++;

        return triangle_vizject;
    } // ShapeUtils.DrawTriangle()

    static DrawCircle( center, radius, color ) {
        let renderer = Renderer.GetInstance();        
        color = ( color != undefined) ? color : ORANGE;
        
        let p0 = GeometryUtils.ComputePolarPoint2D( radius,     Math.PI/4, center );
        let p1 = GeometryUtils.ComputePolarPoint2D( radius, 2 * Math.PI/4, center );
        let p2 = GeometryUtils.ComputePolarPoint2D( radius, 3 * Math.PI/4, center );

        let arc = BABYLON.Curve3.ArcThru3Points( p0, p1, p2, 32, false, true);
        let circle_vizject = BABYLON.MeshBuilder.CreateLines
                             ("Circle_" + SimpleShapeCount, { points: arc.getPoints() });
        circle_vizject.color = Color.AsVec3(color);

        renderer.addObject( circle_vizject );
        SimpleShapeCount++;

        return circle_vizject;
    } // ShapeUtils.DrawCircle()

    static DrawWireFrameSphere( origin, radius, color ) {
        if ( color == undefined ) color = GREY_75;  

        ShapeUtils.DrawCircle( origin, radius, color );

        const draw_meridian = ( origin, radius, angle, color ) => {
            let circle_vizject = ShapeUtils.DrawCircle( origin, radius, color )
            circle_vizject.rotation.x = angle;
        } // draw_meridian()

        const draw_parallel = ( origin, radius, angle, color ) => {
            let dY = radius * Math.sin(angle);
            let parallel_radius = radius * Math.cos(angle);

            let origin_0 = new BABYLON.Vector3( 0, dY, 0 );
            ShapeUtils.DrawCircle( origin_0, parallel_radius, color )

            let origin_1 = new BABYLON.Vector3( 0, -dY, 0 );
            ShapeUtils.DrawCircle( origin_1, parallel_radius, color )
        } // draw_parallel()

        for ( let angle = 0; angle < Math.PI; angle += Math.PI/8 ) {
            draw_meridian( origin, radius, angle, color );
        }

        for ( let angle = 0; angle < Math.PI; angle += Math.PI/8 ) {
            draw_parallel( origin, radius, angle, color );
        }

        ShapeUtils.DrawCircle( origin, radius, color );
    } // ShapeUtils.DrawWireFrameSphere()

    // https://babylonjsguide.github.io/snippets/Minimise_Vertices
    static MinimizeVertices( mesh ) {
        let _pdata = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        let _ndata = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        let _idata = mesh.getIndices();    

        let _newPdata = []; //new positions array
        let _newIdata = []; //new indices array

        let _mapPtr =0; // new index;
        let _uniquePositions = []; // unique vertex positions
        for ( let _i=0; _i<_idata.length; _i+=3 ) {
            let _facet = [_idata[_i], _idata[_i + 1], _idata[_i+2]]; //facet vertex indices
            let _pstring = []; //lists facet vertex positions (x,y,z) as string "xyz""
            for ( let _j = 0; _j<3; _j++ ) { //
                _pstring[_j] = "";
                for ( let _k = 0; _k<3; _k++ ) {
                    // small values make 0
                    if (Math.abs(_pdata[3*_facet[_j] + _k]) < 0.0001) {
                        _pdata[3*_facet[_j] + _k] = 0;
                    }
                    _pstring[_j] += _pdata[3*_facet[_j] + _k] + "|";
                }
                _pstring[_j] = _pstring[_j].slice(0, -1);        
            }

            // Check facet vertices to see that none are repeated
            // do not process any facet that has a repeated vertex, ie is a line
            if ( !(_pstring[0] == _pstring[1] || _pstring[0] == _pstring[2] || _pstring[1] == _pstring[2]) ) {        
                // For each facet position check if already listed in uniquePositions
                // if not listed add to uniquePositions and set index pointer
                // if listed use its index in uniquePositions and new index pointer
                for ( let _j=0; _j < 3; _j++ ) { 
                    let _ptr = _uniquePositions.indexOf(_pstring[_j])
                    if ( _ptr < 0 ) {
                        _uniquePositions.push(_pstring[_j]);
                        _ptr = _mapPtr++;
                        // Not listed so add individual x, y, z coordinates to new positions array newPdata
                        // and add matching normal data to new normals array newNdata
                        for( let _k = 0; _k<3; _k++ ) {
                            _newPdata.push(_pdata[3*_facet[_j] + _k]);
                        }
                    }
                    // add new index pointer to new indices array newIdata
                    _newIdata.push(_ptr);
                }
            }
        }

        let _newNdata = []; //new normal data

        BABYLON.VertexData.ComputeNormals(_newPdata, _newIdata, _newNdata);

        // Create new vertex data object and update
        let _vertexData = new BABYLON.VertexData();
        _vertexData.positions = _newPdata;
        _vertexData.indices   = _newIdata;
        _vertexData.normals   = _newNdata;

        _vertexData.applyToMesh( mesh );
    } // ShapeUtils.MinimizeVertices()

    static DrawCircleFrom3Points( p0, p1, p2, color, thickness ) {
        let renderer = Renderer.GetInstance();        
        color = ( color != undefined) ? color : ORANGE;  
        
        let edge_rendering = false;
        if ( thickness != undefined ) {
            edge_rendering = true;
        }

        let arc = BABYLON.Curve3.ArcThru3Points( p0, p1, p2, 32, false, true);
        let circle_vizject = BABYLON.MeshBuilder.CreateLines
                             ("Circle_" + SimpleShapeCount, { points: arc.getPoints() });
        circle_vizject.color = Color.AsVec3(color);

        if ( edge_rendering ) {
            circle_vizject.enableEdgesRendering();
            circle_vizject.edgesWidth = thickness;
            let edges_color = new BABYLON.Color4
                              ( circle_vizject.color.r, circle_vizject.color.g, circle_vizject.color.b, 1);
            circle_vizject.edgesColor = edges_color;
        }

        renderer.addObject( circle_vizject );
        SimpleShapeCount++;

        return circle_vizject;
    } // ShapeUtils.DrawCircleFrom3Points()

    static DrawSphereBox( radius ) {	
        let renderer = Renderer.GetInstance();
        if ( radius == undefined ) sphere_radius = 1.55; // X_SCALING_FACTOR * STEP / 2;

        let sphere_mesh = BABYLON.MeshBuilder.CreateSphere
            ( "SphereBox", { "segments": 16, "diameter": radius}, renderer.getScene() ); 
        sphere_mesh.origin = new BABYLON.Vector3.Zero();
        renderer.addObject( sphere_mesh );
    } // ShapeUtils.DrawSphereBox()

    static DrawCustomCubeWireframe(vizmode) {
        let VIZMODE_ORIGIN = new BABYLON.Vector3(START, START, START);
        if (vizmode != undefined ) {
            VIZMODE_ORIGIN = vizmode.getOrigin();
        }
        console.log(">> ShapeUtils.DrawCustomCubeWireframe");
        let renderer = Renderer.GetInstance();

        let square_mesh = undefined;

        const draw_squares = ( pos_index ) => {
            let positions = []; 
    
            // 6 planes ( 6 faces of a cube)	
            for ( let plane_idx=0; plane_idx < BOX_POINTS_MATRIX.length; plane_idx+=5 ) {
                // 5 points for each plane  				
                for ( let point_idx=0; point_idx < 5; point_idx++ ) {   
                    let point_vector = BOX_POINTS_MATRIX[plane_idx + point_idx];	
                    // console.log("point_vector(" + point_idx + "): " + JSON.stringify(point_vector));	
    
                    let p1 = new BABYLON.Vector3
                    ( VIZMODE_ORIGIN.x + STEP * point_vector[0] * pos_index - STEP/2, 
                      VIZMODE_ORIGIN.y + STEP * point_vector[1] * pos_index - STEP/2, 
                      VIZMODE_ORIGIN.z + STEP * point_vector[2] * pos_index - STEP/2
                    );
                    positions.push( p1 );		
                }
            }	
            
            let square_color = THEMES[renderer.getParameter(THEME_PARAM)][BOUNDING_BOX_COLOR][0];

            // for ( let i=0; i < positions.length; i++ ) {
            //     // Draw edges with Thickness if 'LINE_THICKNESS' is defined on current 'Theme'
            //     // https://playground.babylonjs.com/#1IYSYD#12
            //     if ( i > 0 ){
            //         let line_thickness = THEMES[renderer.getParameter(THEME_PARAM)][LINE_THICKNESS];
            //         let line_points = [ positions[i], positions[i-1] ]; 
            //         // const new_line = BABYLON.MeshBuilder.CreateLines( "bb_line_" + i, { points: line_points });
            //         if ( line_thickness != undefined ) {
            //             const black3 = new BABYLON.Color3(0, 0, 0);
            //             const black4 = new BABYLON.Color4(0, 0, 0, 1);
            //             new_line.color = square_color;
            //             new_line.enableEdgesRendering();
            //             new_line.edgesWidth = line_thickness;
            //             new_line.edgeColor = square_color;
            //             new_line.material = MATERIALS[BLACK];
            //         }
            //     }
            // }

            square_mesh = ShapeUtils.CreatePolyline( positions, { "color": square_color } );
            renderer.addObject( square_mesh );

            // NB: Draw 'BoundingBox' as Cube Mesh with Material.wireframe = true 
            //     BUT... it draws also diagonals on Faces 8((               
        }; // draw_squares()	
    
        draw_squares( 16 );
        return square_mesh;
    } // ShapeUtils.DrawCustomCubeWireframe()

    static DrawCubeBox( vizmode, options ) {	
        console.log(">> ShapeUtils.DrawCubeBox");
        if ( options == undefined ) options = {};
        if ( options[SIZE_ARG]   == undefined )  options[SIZE_ARG] = STEP * MAX_UNITS_ON_AXIS;
        let alpha_faces = ( options[ALPHA_FACES_ARG] != undefined ) ? options[ALPHA_FACES_ARG] : false;
        
        if ( options[ORIGIN_ARG] == undefined )  options[ORIGIN_ARG] = new BABYLON.Vector3.Zero();
        else {
            let orig_X = options[ORIGIN_ARG].x;
            console.log("   --- ShapeUtils.DrawCubeBox: orig_X " + orig_X);

            let orig_Y = options[ORIGIN_ARG].y;
            console.log("   --- ShapeUtils.DrawCubeBox: orig_Y " + orig_Y);

            let orig_Z = options[ORIGIN_ARG].z;
            console.log("   --- ShapeUtils.DrawCubeBox: orig_Z " + orig_Z);

            options[ORIGIN_ARG] = new BABYLON.Vector3( START + STEP * options[ORIGIN_ARG].x, 
                                                       START + STEP * options[ORIGIN_ARG].y, 
                                                       START + STEP * options[ORIGIN_ARG].z );

            console.log("ShapeUtils.DrawCubeBox: options[ORIGIN_ARG]\n" + JSON.stringify(options[ORIGIN_ARG]));
        }

        let renderer = Renderer.GetInstance();
        let cube_box = undefined;

        //let cube_ref = BABYLON.Mesh.CreateBox( "cube_ref", 1, renderer.getScene() );
        //cube_ref.material = MATERIALS[YELLOW]; 
        //cube_ref.material.wireframe = true;
        //cube_ref.origin = new BABYLON.Vector3.Zero();         
        //renderer.addObject( cube_ref );

        let exportable = THEMES[renderer.getParameter(THEME_PARAM)][EXPORTABLE];
        if ( exportable == undefined ) exportable = false;

        // NB: Disable semi-opaque ùaterial for the bounding box 
        exportable = true;

        if ( alpha_faces ) exportable = true;

        if ( exportable ) {
            return ShapeUtils.DrawCustomCubeWireframe(vizmode);
        }
        else {
            let bb_color = Color.AsVec3(THEMES[renderer.getParameter(THEME_PARAM)][BOUNDING_BOX_COLOR][0]);
            // console.log("bb_color: " + JSON.stringify(bb_color));

            // https://www.babylonjs-playground.com/#7HZISY#0
            // https://doc.babylonjs.com/resources/transparency_and_how_meshes_are_rendered
            let alphamat = new BABYLON.StandardMaterial( 'alphamat', renderer.getScene() );
            alphamat.diffuseColor  = BABYLON.Color3.Blue();
            alphamat.emissiveColor = new BABYLON.Color3(.5, .4, .5); // not necessary artistic decision
            alphamat.alpha = 0.065;
            renderer.addObject( alphamat );
            
            // https://doc.babylonjs.com/how_to/how_to_use_edgesrenderer
            cube_box = BABYLON.Mesh.CreateBox( "bounding_box", options[SIZE_ARG], renderer.getScene() ); 
            cube_box.position = new BABYLON.Vector3.Zero(); // options[ORIGIN_ARG];   
            cube_box.origin   = options[ORIGIN_ARG]; // new BABYLON.Vector3.Zero();  
            //cube_box.position = new BABYLON.Vector3.Zero();
            //let cube_position = STEP * 7;
            //cube_box.origin = new BABYLON.Vector3( cube_position, cube_position, cube_position );

            cube_box.enableEdgesRendering();

            // Draw edges with Thickness if 'LINE_THICKNESS' is defined on current 'Theme'
            let edge_thickness = THEMES[renderer.getParameter(THEME_PARAM)][EDGE_THICKNESS];
            if ( edge_thickness == undefined ) edge_thickness = 1.0;

            cube_box.edgesWidth = edge_thickness;
            let edges_color = new BABYLON.Color4(bb_color.r, bb_color.g, bb_color.b, 1);
            cube_box.edgesColor = edges_color;

            cube_box.material = alphamat;
            cube_box.convertToFlatShadedMesh();

            renderer.addObject( cube_box );
        }

        return cube_box;
    } // ShapeUtils.DrawCubeBox()

    static DrawSpring( data ) {
        // 'data' fields: 'scale_xz', 'scale_y', 'tube_radius', 'range', 'helix_pitch', 'steps_count' 
		let renderer = Renderer.GetInstance();
        let scene = renderer.getScene();
		
		if ( data == undefined ) data = {};

		let scale_xz    = ( data['scale_xz']    != undefined ) ? data['scale_xz']:    SCALE_XZ;
		let scale_y     = ( data['scale_y']     != undefined ) ? data['scale_y']:     SCALE_Y;
		let tube_radius = ( data['tube_radius'] != undefined ) ? data['tube_radius']: TUBE_RADIUS;
		let range       = ( data['range']       != undefined ) ? data['range']:       RANGE;
        let helix_pitch = ( data['helix_pitch'] != undefined ) ? data['helix_pitch']: HELIX_PITCH;
        let steps_count = ( data['steps_count'] != undefined ) ? data['steps_count']: STEPS_COUNT;

	    // https://playground.babylonjs.com/#WW0ALQ#2
		let draw_helical_tube = ( scene ) =>  {
			const make_curve = ( range, nb_steps ) => {
				const path = [];
				const STEP_SIZE = range / nb_steps;
				for ( let i = -range / 2; i < range / 2; i += STEP_SIZE ) {
					let x = scale_xz * Math.sin(i * nb_steps * helix_pitch);
					let y = i * scale_y; 
					let z = scale_xz * Math.cos(i * nb_steps * helix_pitch);
					path.push( new BABYLON.Vector3( x, y, z) );
				}
				return path;
			}; // make_curve()
		
			const curve = make_curve( range, steps_count );
			
			const tube_mesh = BABYLON.MeshBuilder.CreateTube
								( "cylinder_core",
								{ path: curve, radius: TUBE_RADIUS, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
			tube_mesh.position = new BABYLON.Vector3.Zero();
			tube_mesh.material = MATERIALS[GREY_50]; 
			return tube_mesh;
		}; // draw_helical_tube()
	
		let core_mesh = draw_helical_tube(this.scene);

		// let data = { [COLOR_ARG]: GREEN, [FACE_COUNT_ARG]: 32, [SIZE_ARG]: 0.75 };
		// const core_mesh = BABYLON.MeshBuilder.CreateCylinder("cylinder_core", { height: 1.5, diameter: 0.4} );		

        return core_mesh;
	} // ShapeUtils.DrawSpring()

    static CreateDotGrid( material, scene, scene_objects ) {
        // scene is optional and defaults to the current scene
        let start = -0.75; // -3.2;
        let end   =  0.75; //  3.2;
        let step  =  0.1;
        
        let x = start;
        let y = start;
        let z = start;
        let dot_size = 0.007; // 0.025;
        let dot_mesh = undefined;

        let renderer = Renderer.GetInstance();
        let ball_color = THEMES[renderer.getParameter(THEME_PARAM)][NODE_COLOR][0];
    
        for ( y=start; y < end; y+= step ) {
            for ( z=start; z < end; z+= step ) {
                for ( x=start; x < end; x+= step ) {
                    let dot_position = new BABYLON.Vector3(x, y, z);				
                    // dot_mesh = createDot( material, scene, position, dot_size, { "shape": [SPHERE_DOT] }  );                    

                    let data = { [MATERIAL_ARG] : MATERIALS[ball_color], [ORIGIN_ARG]: dot_position, 
                                 [SIZE_ARG]: dot_size, [ARGS_ARG]: { "shape": [SPHERE_DOT] } };
                    let dot_shape = new BallShape( Renderer.GetInstance(), data ); 
                    dot_shape.draw();
                    // scene_objects.push( dot_mesh );
                }
            }
        }
    } // ShapeUtils.CreateDotGrid()

    // https://playground.babylonjs.com/#FUK3S#8
    // https://doc.babylonjs.com/toolsAndResources/utilities/Sector
	static ShowAngleSector( scene, origin, vector1, vector2, radius ) {
		const cross  = BABYLON.Vector3.Cross(vector1, vector2);
		const dot    = BABYLON.Vector3.Dot(vector1, vector2);
		const angle  = Math.acos(dot / (vector1.length() * vector2.length()));
		const points = [];
		const minNb  = 16;
		const factor = 2;
		let nbPoints = Math.floor(radius * angle * factor);
		nbPoints = nbPoints < minNb ? minNb : nbPoints;
	
		const firstPoint = BABYLON.Vector3.Normalize(vector1).scale(radius);
		const lastPoint  = BABYLON.Vector3.Normalize(vector2).scale(radius);
		let matrix;
		let ang = angle / nbPoints;
		let rotated;
		for (let i = 0; i < nbPoints; i++) {
            matrix  = BABYLON.Matrix.RotationAxis(cross, ang * i);
            rotated = BABYLON.Vector3.TransformCoordinates(firstPoint, matrix);
            points.push(rotated.add(origin));
		}
		points.push(lastPoint.add(origin));
	
		let sector = BABYLON.MeshBuilder.CreateLines("sector", { points }, scene);
		return sector;
	} // ShapeUtils.ShowAngleSector()

    // https://playground.babylonjs.com/#FUK3S#8
    // https://doc.babylonjs.com/toolsAndResources/utilities/Sector
    static DrawArcCircle( scene, origin, p0, p1, radius ) {
        let points = [origin, p0, p1, origin];
        let triangle = BABYLON.Mesh.CreateLines("l", points, scene);

        // vectors
        let axis_0 = p0.subtract( origin );
        let axis_1 = p0.subtract( p1 );
        let axis_2 = p1.subtract( p0 );

        // sectors
        let sector1 = ShapeUtils.ShowAngleSector( scene, origin, axis_0, axis_2, radius );
        let sector2 = ShapeUtils.ShowAngleSector( scene, p0, axis_0.scale(-1), axis_1.scale(-1), radius );
        let sector3 = ShapeUtils.ShowAngleSector( scene, p1, axis_1, axis_2.scale(-1), radius );
		return sector1;
	} // ShapeUtils.DrawArcCircle()
} // ShapeUtils class