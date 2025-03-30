// ===================================================================================================
// ====================================     geometry_utils.js     ====================================
// ===================================================================================================
"use strict";

const XY_MIN = "xy_min";
const XY_MAX = "xy_max";

const XZ_MIN = "xz_min";
const XZ_MAX = "xz_max";

const YZ_MIN = "yz_min";
const YZ_MAX = "yz_max";

const XY_PLANE = "xy_plane"; 
const YZ_PLANE = "yz_plane"; 
const XZ_PLANE = "xz_plane"; 

const ORIGIN = BABYLON.Vector3.Zero();

const DEBUG_LOCAL_AXIS_LENGTH = 0.1;

const TAU     = 2 * Math.PI; 
const START   = -0.75;
const STEP    =  0.1;

const MAX_UNITS_ON_AXIS = 16;
const X_SCALING_FACTOR  = 2.14286; // X Scaling: so that max X (7) is 15 when scaled (7*2.14286 = 15)

const CARTESIAN_COORDINATES     = "cartesian coordinates";
const SPHERICAL_COORDINATES     = "spherical coordinates";

const CYLINDRICAL_COORDINATES   = "cylindrical coordinates";
const MIN_CYLINDER_RADIUS       = 4;
const CYLINDER_SCALE            = 1;

const SPHERICAL_RADIUS_SCALE    = 1.05;
const RADIUS_NORMAL_PERCENT     = 10;

const CYLINDRICAL_RADIUS_SCALE  = .12; // .5;

// ---------- 'Spring' constants ----------
const SCALE_XZ     = 0.2;
const SCALE_Y      = 0.01;
const TUBE_RADIUS  = 0.03;
const RANGE        = 180; //80; 
const HELIX_PITCH  = 1 / 325; // 1 / 400 
const STEPS_COUNT  = 200; 
// ---------- 'Spring' constants  

const TETRAHEDRON_TYPE          = 0;
const OCTAHEDRON_TYPE           = 1;
const DODECAHEDRON_TYPE         = 2;
const ISOCAHEDRON_TYPE          = 3;
const RHOMBICUBOCTAHEDRON_TYPE  = 4;
const TRUNCATEDISOCAHEDRON_TYPE = 5;

const PLANE_PROJECTIONS = { [XY_MIN]: { 'x':null, 'y':null, 'z':   0 }, [XY_MAX]: { 'x':null, 'y':null, 'z':   1 },
	                        [XZ_MIN]: { 'x':null, 'y':   0, 'z':null }, [XZ_MAX]: { 'x':null, 'y':   1, 'z':null },
					        [YZ_MIN]: { 'x':   0, 'y':null, 'z':null }, [YZ_MAX]: { 'x':   1, 'y':null, 'z':null }
                          };

class GeometryUtils {
	static GetRadius( scaled ) {
		if ( scaled == undefined ) scaled = 1;
		return scaled * MAX_UNITS_ON_AXIS / 2; // xyz = [0..15] ; 
	} // GeometryUtils.GetRadius()

	static ComputePolarPoint2D( radius, theta, center ) {
		if ( center == undefined ) center = ORIGIN; 
		let pos_x = center.x + radius * Math.cos( theta );
		let pos_y = center.y;
		let pos_z = center.z + radius * Math.sin( theta );
		
		return new BABYLON.Vector3( pos_x, pos_y, pos_z );
    } // GeometryUtils.ComputePolarPoint2D()

	static ComputePolarPoint3D( radius, theta, phi, origin ) {
		if ( origin == undefined ) origin = ORIGIN; 

		let compute_xyz = ( radius, theta, phi, origin ) => { 
			let x = origin.x + radius * Math.sin(theta) * Math.cos(phi);
			let y = origin.y + radius * Math.sin(theta) * Math.sin(phi);
			let z = origin.z + radius * Math.cos(theta);
			return new BABYLON.Vector3( x, y, z);
		}; // compute_xyz()

		return compute_xyz( radius, theta, phi, origin  );
    } // GeometryUtils.ComputePolarPoint3D()

	static ComputeCentroid( word_indexes, vizmode ) {
		let VIZMODE_ORIGIN = BABYLON.Vector3.Zero();
		if (vizmode != undefined) {
			VIZMODE_ORIGIN = vizmode.getOrigin();
		}

		let cx = 0;
		let cy = 0;
		let cz = 0;
		for ( let i=0; i < word_indexes.length; i++ ) {
			let word_xyz = GeometryUtils.WordIndexToVector3( word_indexes[i] );
			cx += word_xyz.x; 
			cy += word_xyz.y; 
			cz += word_xyz.z;  
		}
		cx = cx / word_indexes.length;
		cy = cy / word_indexes.length;
		cz = cz / word_indexes.length;
		let centroid_point = new BABYLON.Vector3( cx, cy, cz);

		// Centroid relocated with 'START'/'STEP' and position in 3D Grid
		let centroid_x = VIZMODE_ORIGIN.x + STEP * centroid_point.x;
		let centroid_y = VIZMODE_ORIGIN.y + STEP * centroid_point.y;
		let centroid_z = VIZMODE_ORIGIN.z + STEP * centroid_point.z;

		let centroid_in_coordinates_system = new BABYLON.Vector3( centroid_x, centroid_y, centroid_z );
		return centroid_in_coordinates_system; // { "x": cx, "y": cy, "z": cz };
	} // GeometryUtils.ComputeCentroid()

	static WordIndexToVector3( word_index, use_scaling_factor ) {
	    if ( use_scaling_factor == undefined ) use_scaling_factor = true; 

		let pos_x = Math.floor( word_index / 256 );
		
		// Note: Trick to compensate that there is only 11 bits in 0..2047 range but we need 3x4 bits	
		//       Hence 'x' dimension is half than 'y' && 'z' without this trick

		if ( use_scaling_factor ) { 
			// console.log("---------------\n pos_x BEFORE scaling: " + pos_x);
			pos_x = pos_x * X_SCALING_FACTOR; // add an extra bit to 'x'
			// console.log(" pos_x AFTER scaling: " + pos_x);
			pos_x = Math.round(pos_x); // add an extra bit to 'x'
			// console.log(" pos_x AFTER rounding: " + pos_x);
		}
		
		let remainder_x = word_index % 256;
		
		let pos_y = Math.floor( remainder_x / 16 );
		let remainder_y = remainder_x % 16;

		let pos_z = remainder_y;
		
		return { x: pos_x, y: pos_y, z: pos_z };
	} // GeometryUtils.WordIndexToVector3()

	// https://doc.babylonjs.com/toolsAndResources/utilities/Pivot
	static RotateAroundPivot( vizject, pivot_point, axis, angle ) {
		if ( ! vizject._rotationQuaternion) {
			vizject._rq = BABYLON.Quaternion.RotationYawPitchRoll
			              ( vizject.rotation.y, vizject.rotation.x, vizject.rotation.z );
		}
		else vizject._rq = vizject.rotationQuaternion;

		let x = vizject.position.x - pivot_point.x;	
		let y = vizject.position.y - pivot_point.y;
		let z = vizject.position.z - pivot_point.z;
		let _p = new BABYLON.Quaternion( x, y, z, 0);
		axis.normalize();

		let _q     = BABYLON.Quaternion.RotationAxis( axis, angle ); // form quaternion rotation		
		let _qinv  = BABYLON.Quaternion.Inverse( _q );	
		let _pdash = _q.multiply(_p).multiply( _qinv );
		x = pivot_point.x + _pdash.x;
		y = pivot_point.y + _pdash.y;
		z = pivot_point.z + _pdash.z;
		vizject.position = new BABYLON.Vector3( x, y, z );
		vizject.rotationQuaternion = _q.multiply( vizject._rq );
	} // GeometryUtils.RotateAroundPivot()  

	static ComputeHypothenuse( p0, p1, plane ) {
		if (plane == undefined) plane = XY_PLANE;
		let d0 = 0;
		let d1 = 0;
		switch (plane) {
			case XY_PLANE:  
				d0 = Math.abs(p1.x - p0.x); 
				d1 = Math.abs(p1.y - p0.y);
				break;
			case YZ_PLANE:  
				d0 = Math.abs(p1.y - p0.y); 
				d1 = Math.abs(p1.z - p0.z);
				break;
			case XZ_PLANE:  
				d0 = Math.abs(p1.x - p0.x); 
				d1 = Math.abs(p1.z - p0.z);
				break;
		}
		let hypotenuse = Math.sqrt(d0*d0 + d1*d1);
		return hypotenuse;
	} // GeometryUtils.ComputeHypothenuse()

	static RadianToDegree( radians ) {
		let degrees = radians * 180 / Math.PI;
		return degrees;
	} // GeometryUtils.RadianToDegree()	

	// Codé par ChatGPT avec le prompt suivant rédigé par Valérie 8D
	// Bonjour, je voudrais que tu m'aides à coder une fonction en Javascript pour le toolkit BabylonJS. 
    // Il s'agit de créer un arc de cercle passant par trois points.
    // Les données en entrée sont : 
    // 1. les deux extrémités de l'arc de cercle (appelons les A et B)
    // 2. le rayon du cercle
    // 3. le centre du cercle (C)
    // Ces données sont les variables de la fonction que nous voulons écrire. 
    // Nous connaissons pour chaque point ses coordonnées x, y, z (ce sont des points en 3 dimensions), 
	// donc pour le point A : Ax, Ay et Az, pour le point B : Bx, By, Bz et pour le centre du cercle, 
	// je connais Cx, Cy et CZ.
    // La sortie de la fonction est un point (appelons le S) qui se situera au milieu de l'arc de cercle: 
	// la fonction doit donc renvoyer Sx, Sy et Sz.
    // Est-ce que j'ai bien exposé ma demande ? As tu- besoin d'informations complémentaires ?
	static FindMidArcPoint(A, B, O, radius) {
        // Convertir les points A, B, O en vecteurs BabylonJS
        const pointA = new BABYLON.Vector3(A.x, A.y, A.z);
        const pointB = new BABYLON.Vector3(B.x, B.y, B.z);
        const center = new BABYLON.Vector3(O.x, O.y, O.z);
    
        // Étape 1 : Vecteurs CA et CB
        const vectorCA = pointA.subtract(center).normalize();
        const vectorCB = pointB.subtract(center).normalize();
    
        // Étape 2 : Calculer le vecteur milieu (moyenne des vecteurs normalisés)
        const vectorMid = vectorCA.add(vectorCB).normalize();
    
        // Étape 3 : Multiplier par le rayon pour obtenir la bonne distance
        const midPoint = center.add(vectorMid.scale(radius));
    
        // Retourner les coordonnées du point milieu de l'arc
		return midPoint;
	} // GeometryUtils.FindMidArcPoint()

	static PointToClosestPlaneProjection( point, axis_end ) {
		if (axis_end == undefined) {
			axis_end = 0;
		}	
		const { x, y, z } = point;
			
		// ---------- MIN ----------
		// Distances aux plans XY_MIN, XZ_MIN, YZ_MIN
		const distance_to_XY_MIN = Math.abs(z); // Distance au plan XY_MIN (z = 0)
		const distance_to_XZ_MIN = Math.abs(y); // Distance au plan XZ_MIN (y = 0)
		const distance_to_YZ_MIN = Math.abs(x); // Distance au plan YZ_MIN (x = 0)
	
		// Trouver le plan le plus proche en MIN
		let closest_to_MIN = Math.min(distance_to_XY_MIN, distance_to_XZ_MIN, distance_to_YZ_MIN);
		console.log("closest_to_MIN:" + closest_to_MIN);
		// ---------- MIN 

		// ---------- MAX ----------
		// Distances aux plans XY_MAX, XZ_MAX, YZ_MAX
		const distance_to_XY_MAX = Math.abs(axis_end - z); // Distance au plan XY_MAX (z = end_of_axis)
		const distance_to_XZ_MAX = Math.abs(axis_end - y); // Distance au plan XZ_MAX (y = end_of_axis)
		const distance_to_YZ_MAX = Math.abs(axis_end - x); // Distance au plan YZ_MAX (x = end_of_axis) 
				
		// Trouver le plan le plus proche en MAX
		let closest_to_MAX = Math.min(distance_to_XY_MAX, distance_to_XZ_MAX, distance_to_YZ_MAX);
		console.log("closest_to_MAX:" + closest_to_MAX);
		// ---------- MAX

		let plane_name = undefined;
		if (closest_to_MIN < closest_to_MAX) {
			plane_name = YZ_MIN;
			if (closest_to_MIN === distanceToXY_MIN) plane_name = XY_MIN;
			if (closest_to_MIN === distanceToXZ_MIN) plane_name = XZ_MIN;
		}
		else {
			plane_name = YZ_MAX;
			if (closest_to_MAX === distanceToXY_MAX) plane_name = XY_MAX;
			if (closest_to_MAX === distanceToXZ_MAX) plane_name = XZ_MAX;
		}

		console.log("plane_name:" + plane_name);

		let plane_projection = PLANE_PROJECTIONS[plane_name];

		return plane_projection;
	} // GeometryUtils.PointToClosestPlaneProjection()
    
	static PointToPlaneProjection( origin, axis_end ) {
		if (axis_end == undefined) {
			axis_end = 0;
		}	

		let pos_x = origin.x;
		let pos_y = origin.y;
		let pos_z = origin.z;

		// ---------- MIN ----------
		const distance_to_XY_MIN = Math.abs(pos_z); // Distance au plan XY_MIN (z = 0)
		const distance_to_XZ_MIN = Math.abs(pos_y); // Distance au plan XZ_MIN (y = 0)
		const distance_to_YZ_MIN = Math.abs(pos_x); // Distance au plan YZ_MIN (x = 0)
		let closest_to_MIN = Math.min(distance_to_XY_MIN, distance_to_XZ_MIN, distance_to_YZ_MIN);

		let plane_name = YZ_MIN;
		if (closest_to_MIN === distance_to_XY_MIN) plane_name = XY_MIN;
		if (closest_to_MIN === distance_to_YZ_MIN) plane_name = XZ_MIN;
        // ---------- MIN

		// ---------- MAX ----------
		const distance_to_XY_MAX = Math.abs(axis_end - pos_z); // Distance au plan XY_MAX (z = axis_end)
		const distance_to_XZ_MAX = Math.abs(axis_end - pos_y); // Distance au plan XZ_MAX (y = axis_end)
		const distance_to_YZ_MAX = Math.abs(axis_end - pos_x); // Distance au plan YZ_MAX (x = axis_end)
		let closest_to_MAX = Math.min(distance_to_XY_MAX, distance_to_XZ_MAX, distance_to_YZ_MAX);

		if (closest_to_MAX < closest_to_MIN) {
			plane_name = YZ_MAX;
			if (closest_to_MAX === distance_to_XY_MAX) plane_name = XY_MAX;
			if (closest_to_MAX === distance_to_YZ_MAX) plane_name = XZ_MAX;
		}	
		// ---------- MAX

		console.log("plane_name:" + plane_name);

		let plane_projection = PLANE_PROJECTIONS[plane_name];
		return plane_projection;
	} // GeometryUtils.PointToPlaneProjection()

	static GetLineRotation( p0, p1 ) {
		let dx = Math.max( p1.x - p0.x );
		let dy = Math.max( p1.y - p0.y );
		let dz = Math.max( p1.z - p0.z );

		let rotation = {};
		
		let alpha = Math.asin( dx / GeometryUtils.ComputeHypothenuse(p0, p1, XY_PLANE) );
		let beta  = Math.asin( dy / GeometryUtils.ComputeHypothenuse(p0, p1, YZ_PLANE) );
		let gamme = Math.asin( dx / GeometryUtils.ComputeHypothenuse(p0, p1, XZ_PLANE) );

		rotation.x = alpha;
		rotation.y = beta;
		rotation.z = gamme;

		return rotation;
	} // GeometryUtils.GetLineRotation()

	static GetDistance( p0, p1 ) {
		if ( percent == undefined ) percent = 50;

		let dx = Math.max( p1.x - p0.x );
		let dy = Math.max( p1.y - p0.y );
		let dz = Math.max( p1.z - p0.z );
		let distance = new BABYLON.Vector3( p0.x + dx*percent/100, p0.y + dy*percent/100, p0.z + dz*percent/100 );
		return distance;
	} // GeometryUtils.GetDistance()

	static GetMiddlePoint( p0, p1, percent ) {
		if ( percent == undefined ) percent = 50;

		let dx = Math.max( p1.x - p0.x );
		let dy = Math.max( p1.y - p0.y );
		let dz = Math.max( p1.z - p0.z );
		let middle_point = new BABYLON.Vector3( p0.x + dx*percent/100, p0.y + dy*percent/100, p0.z + dz*percent/100 );
		return middle_point;
	} // GeometryUtils.GetMiddlePoint()

	static GetOppositePointInRectTriangle( origin, hypotenuse ) {
		let pos_x = origin.x + Math.abs( hypotenuse * Math.cos( 45 * (Math.PI/180) ) ); 
		let pos_y = origin.y + Math.abs( hypotenuse * Math.sin( 45 * (Math.PI/180) ) ); 
		let opposite_point = new BABYLON.Vector3( pos_x, pos_y, origin.z );
		return opposite_point;
	} // GetOppositePointInRectTriangle()
} // GeometryUtils class 