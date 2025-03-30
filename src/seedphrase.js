// ====================================================================================================
// =======================================     seedphrase.js     ======================================
// ====================================================================================================
"use strict";

let ObjectCount      = 0;
const MAX_STEP_VALUE = 16;

// let CentroidMode     = false;

let ClosedTrianglesMode = true;
let FilledTrianglesMode = false;

// ============================== SeedPhrase class ==============================
class SeedPhrase {
	constructor( renderer ) {
		// console.log(">> ---- SeedPhrase.new");
		this.renderer       = renderer;
		this.scene          = this.renderer.getScene();

		this.mode           = ARC_VIZMODE;
		this.word_indexes   = [];
		this.centroid_point = new BABYLON.Vector3(0,0,0);

		this.line_count = 0;
    } // constructor

    draw( word_indexes, args ) {
		console.log(">> ---- SeedPhrase.draw");

		this.word_indexes = word_indexes;
		
		let closed_triangles = ClosedTrianglesMode;
		if ( args != undefined && args["closed_triangles"] != undefined ) {
			closed_triangles = args["closed_triangles"];
		}
		
		let filled_triangles = this.renderer.getParameter(FILLED_TRIANGLES_PARAM);
		if ( args != undefined && args["filled_triangles"] != undefined ) {
			filled_triangles = args["filled_triangles"];
			this.renderer.setParameter(FILLED_TRIANGLES_PARAM, filled_triangles)
		}
	
		let mode = this.renderer.getParameter(MODE_PARAM);
		if ( args != undefined && args[MODE_PARAM] != undefined ) {
			mode = args[MODE_PARAM];
			if ( mode == CENTROID_VIZMODE ) closed_triangles = true; 
		}	
	
		// console.log("word_indexes.length: " + word_indexes.length);
		
		let word_xyz = {};
		
		let pos_x = 0;
		let pos_y = 0;
		let pos_z = 0;
	
		let polyline_points = []; 
		let triangle_points = []; 
		let current_point = new BABYLON.Vector3(0,0,0);
	
		let centroid_point = GeometryUtils.ComputeCentroid( word_indexes );
		
		let dot_size = 0.07; // 0.025;	
		
		// *** draw 'Centroid'
		if ( this.renderer.getParameter(SHOW_CENTROID_PARAM) ) {
			let centroid_dot_size = 0.12;	
			let ball_color = THEMES[this.renderer.getParameter(THEME_PARAM)][NODE_COLOR][0];
	
			let data = { [MATERIAL_ARG]: MATERIALS[ball_color], [ORIGIN_ARG]: centroid_point, 
						 [SIZE_ARG]: centroid_dot_size, [ARGS_ARG]: { "shape": [SPHERE_DOT] } };
			let centroid_shape = new BallShape( this.renderer, data ); 
			centroid_shape.draw();
		}
		
		let triangle_mesh  = undefined;
		let hypotenuse     = 0;
		let word_index     = 0;
		let mnemonic       = "";
		let word_point     = new BABYLON.Vector3.Zero();
		
		for ( let i=0; i < word_indexes.length; i++ ) {
			word_index = word_indexes[i];
			mnemonic = MnemonicUtils.WordIndexToMnemonic( word_index );
			
			word_point = GeometryUtils.WordIndexToVector3( word_index );
			
			pos_x = START + STEP * word_point.x;
			pos_y = START + STEP * word_point.y;
			pos_z = START + STEP * word_point.z;
	
			current_point = new BABYLON.Vector3( pos_x, pos_y, pos_z );
			polyline_points.push( current_point ); 
	
			//let ball_color = WHITE;
			let ball_color = THEMES[this.renderer.getParameter(THEME_PARAM)][NODE_COLOR][0];
			// console.log("ball_color: " + ball_color);
	
			// if ( i == 0 ) {	ball_color = RED; }
			// if ( i == 1 ) {	ball_color = ORANGE;  }		
			// if ( i == word_indexes.length ) { material = RED_MATERIAL; }		
			
			if ( this.renderer.getParameter(SHOW_BALLS_PARAM) )  {
				dot_size = THEMES[this.renderer.getParameter(THEME_PARAM)][NODE_SIZE]; 
				// dot_size = 0.07; // 0.07 = size for visible Balls 
			}
			else  {
				dot_size = 0.005; // 0.07 = size for visible Balls 
			}
	
			let data = { [MATERIAL_ARG]: MATERIALS[ball_color], 
				         [ORIGIN_ARG]: current_point, [SIZE_ARG]: dot_size };
						 
			if ( this.renderer.getParameter(METADATA_PARAM) )  {
				data[MNEMONIC_ARG]   = mnemonic; 
				data[WORD_INDEX_ARG] = word_index;
			}
			
			let mnemonic_shape = new MnemonicShape( this.renderer, data ); 
			mnemonic_shape.draw();	
			
			let p2 = current_point;
			let p1 = current_point;
			let p0 = current_point;
	
			let triangle_count = 0;
			let opposite_point = new BABYLON.Vector3.Zero();
			// let middle_point   = new BABYLON.Vector3( 0,0,0 );
	
			if ( polyline_points.length > 1 ) {
				triangle_points = [];
				
				triangle_count++;	
				
				if ( this.renderer.getParameter(MODE_PARAM) == ARC_VIZMODE ) {
					p0 = polyline_points[ polyline_points.length - 1 ];
					p1 = polyline_points[ polyline_points.length - 2 ];
					let points = [ p0, p1 ];
	
					let theme_name = this.renderer.getParameter(THEME_PARAM);
					// console.log("theme_name:   " + theme_name);
					// console.log("LINK_COLOR:   " + THEMES[theme_name][LINK_COLOR][0] );
					let arc_color = Color.AsVec3( THEMES[theme_name][LINK_COLOR][0] );
	
					// console.log("filled_triangles:   " + filled_triangles);

					let vizject_id =   "Link_" 
					                 + ShapeUtils.PadWithZero(i) + "->" 
									 + ShapeUtils.PadWithZero(i+1); 

					let data = { [ID_ARG]: vizject_id,
						         [COLOR_ARG]: arc_color, [ORIGIN_ARG]: current_point, 
						         [CENTROID_ARG]: centroid_point, [POINTS_ARG]: points };

					if (filled_triangles) {
						points.push(centroid_point);
                        arc_color = Color.AsVec3(RED);				
						let arc_shape = new ArcShape( this.renderer, data ); 
						arc_shape.material = MATERIALS[BLACK];
						arc_shape.draw();
					}
					else {	
						let arc_shape = new ArcShape( this.renderer, data ); 
						arc_shape.draw();
					}
				}
				else if ( this.renderer.getParameter(MODE_PARAM) == STAIR_STEP_VIZMODE ) {
					p0 = polyline_points[ polyline_points.length - 1 ];
					
					// let dx = Math.abs(p1.x - p0.x)
					// let dy = Math.abs(p1.y - p0.y);
					// let hypotenuse = Math.sqrt(dx*dx + dy*dy);
	
					hypotenuse = GeometryUtils.ComputeHypothenuse(p0, p1);
					// Note: Bug which create "serendipity" effect                             ***
					opposite_point = GeometryUtils.GetOppositePointInRectTriangle( 
										{ "x": p0.x,  "y": p0.y,  "x": p0.z },  hypotenuse ); 
					
					p1 = new BABYLON.Vector3( opposite_point.x, opposite_point.y, p0.z);
					p2 = polyline_points[ polyline_points.length - 2 ];		
				}
				else if ( this.renderer.getParameter(MODE_PARAM) == CENTROID_VIZMODE ) {
					p2 = centroid_point;
					p0 = polyline_points[ polyline_points.length - 1 ];
					p1 = polyline_points[ polyline_points.length - 2 ];								
				}		
				else { 
					if ( polyline_points.length > 2 ) {					
						p2 = polyline_points[ polyline_points.length - 1 ];
						p1 = polyline_points[ polyline_points.length - 2 ];
						p0 = polyline_points[ polyline_points.length - 3 ];
					}
					else	
						continue;
				}
				
				if ( mode != ARC_VIZMODE ) {
					triangle_points.push( p2 );
					triangle_points.push( p1 );
					triangle_points.push( p0  );
					if (   closed_triangles && filled_triangles 
						&& this.renderer.getParameter(MODE_PARAM) == STAIR_STEP_VIZMODE ) {
						triangle_points.push( p2 ); // closed Polyline 4th point = 1st point = p2 
					}
	
					let theme_name = this.renderer.getThemeName();
					let link_color_data = THEMES[theme_name][LINK_COLOR][0];
					// console.log("link_color_data: " + link_color_data);
					
					let link_color = THEMES[theme_name][LINK_COLOR][0];
					// console.log("link_color: " + link_color);
	
					//triangle_mesh = createPolyline( triangle_points, { "color": link_color } );
					triangle_mesh = ShapeUtils.CreatePolyline( triangle_points );
					triangle_mesh.color = Color.AsVec3(link_color);
					this.renderer.addObject( triangle_mesh );
					
					if ( filled_triangles ) {				
						let red   = ( word_xyz['x'] / MAX_STEP_VALUE ); 
						let green = ( word_xyz['y'] / MAX_STEP_VALUE );
						let blue  = ( word_xyz['z'] / MAX_STEP_VALUE );
						//if ( i == 3 ) {
						//	console.log( "word_xyz['x']:" + word_xyz['x'] + "  red:" + red);
						//	console.log( "word_xyz['y']:" + word_xyz['y'] + "  green:" + green);
						//	console.log( "word_xyz['z']:" + word_xyz['z'] + "  blue:" + blue);
						//}
						
						let positions = [ p2.x, p2.y, p2.z,  p1.x, p1.y, p1.z,  p0.x, p0.y, p0.z ];
	
						let triangle_mesh = createTriangleMesh( MATERIALS[BLACK], scene, positions );
						this.renderer.addObject( triangle_mesh );
					}	
				}			
			}	
		} // for each word_index
	} // draw()
} // SeedPhrase class