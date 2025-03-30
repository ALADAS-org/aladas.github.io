// =========================================================================================================
// ========================================     cylinder_shape.js     ======================================
// =========================================================================================================
"use strict";

const START_POINT_ARG = "start_point";
const END_POINT_ARG   = "end_point";
const DIAMETER_ARG    = "diameter";

class CylinderShape extends BaseShape {
	constructor( renderer, data ) {	
        super( renderer, data );

        this.start_point = ( data[START_POINT_ARG] != undefined ) ? data[START_POINT_ARG] : new BABYLON.Vector3.Zero();
        this.end_point   = ( data[END_POINT_ARG]   != undefined ) ? data[END_POINT_ARG]   : new BABYLON.Vector3.Zero();
        this.diameter    = ( data[DIAMETER_ARG]    != undefined ) ? data[DIAMETER_ARG]    : 0.02;
	} // constructor()   

    // 
    draw() {
        // https://www.babylonjs-playground.com/#1RWE59#387
        // https://forum.babylonjs.com/t/cylinder-positioning-off-maybe-changed/26179
        let distance = BABYLON.Vector3.Distance( this.start_point, this.end_point );   

        // Fonction utilitaire pour créer un cylindre entre deux points
        const create_cylinder_from_2_points = ( name, point1, point2, diameter_arg, scene ) => {
            // Calcul de la hauteur du cylindre (distance entre les deux points)
            const distance = BABYLON.Vector3.Distance(point1, point2);

            // Calcul du centre entre les deux points
            const center = BABYLON.Vector3.Lerp(point1, point2, 0.5);

            // Création du cylindre
            const cylinder = BABYLON.MeshBuilder.CreateCylinder( name, {
                height:   distance,        // La hauteur correspond à la distance entre les points
                diameter: diameter_arg,  // Ajustez le diamètre selon vos besoins
                tessellation: 36,        // Qualité du cylindre
            }, scene);

            // Orientation du cylindre pour l'aligner avec les deux points
            const direction = point2.subtract(point1).normalize(); // Vecteur direction
            const up    = new BABYLON.Vector3(0, 1, 0);               // Vecteur "haut" de base
            const axis  = BABYLON.Vector3.Cross(up, direction);       // Axe de rotation
            const angle = Math.acos(BABYLON.Vector3.Dot(up, direction)); // Angle de rotation

            if (axis.length() > 0) {
                const quaternion = BABYLON.Quaternion.RotationAxis(axis.normalize(), angle);
                cylinder.rotationQuaternion = quaternion;
            }

            // Positionner le cylindre au centre entre les deux points
            cylinder.position = center;

            return cylinder;
        }; // create_cylinder_from_2_points() 
        
        // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/cylinder
        //this.shape_mesh = BABYLON.Mesh.CreateCylinder
        //                  ( this.getId(), distance, start_diameter, end_diameter, tesselation, this.scene, true );
        this.shape_mesh = create_cylinder_from_2_points( this.getId(), this.start_point, this.end_point, this.diameter, this.scene );                  

        // First of all we have to set the pivot not in the center of the cylinder:
        // this.shape_mesh.setPivotMatrix( BABYLON.Matrix.Translation( 0, -distance / 2, 0 ), false );
        //this.shape_mesh.setPivotMatrix( BABYLON.Matrix.Translation( 0, distance / 2, 0 ), false );

        //let middle_point = GeometryUtils.GetMiddlePoint(this.start_point, this.end_point);
        // this.shape_mesh.setPivotPoint( this.start_point );
        //this.shape_mesh.setPivotPoint( middle_point );

        //this.shape_mesh.position = middle_point;
        //this.shape_mesh.rotation = new BABYLON.Vector3(1, 1, 1);
    
        // Then find the vector between spheres
        //let v1 = this.end_point.subtract(this.start_point); v1.normalize();
        //let v2 = new BABYLON.Vector3(0, 1, 0);
        
        // Using cross we will have a vector perpendicular to both vectors
        //let axis = BABYLON.Vector3.Cross(v1, v2); axis.normalize();
        
        // Angle between vectors
        //let angle = BABYLON.Vector3.Dot(v1, v2);
        
        // Then using axis rotation the result is obvious
        //this.shape_mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis( axis, -Math.PI/2 + angle );        
        
        this.shape_mesh.material = this.material;        

        this.renderer.addObject(this.shape_mesh);
        
        return this.shape_mesh;
    } // draw()
} // CylinderShape class