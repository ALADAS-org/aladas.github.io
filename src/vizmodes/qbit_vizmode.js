// ===========================================================================================================
// =======================================       qbit_vizmode.js       =======================================
// ===========================================================================================================
// https://www.google.com/search?q=virus+capside+shapes&sca_esv=3205b4b57189dd06&udm=2&biw=1229&bih=568&sxsrf=ADLYWIIb2DQgrdhwfDZhhZ8m95XfbwbULw%3A1734453270813&ei=FqhhZ8qWMa-LkdUPz8KLwQs&ved=0ahUKEwjK-df4na-KAxWvRaQEHU_hIrgQ4dUDCBE&uact=5&oq=virus+capside+shapes&gs_lp=EgNpbWciFHZpcnVzIGNhcHNpZGUgc2hhcGVzSMQxUABYzytwAHgAkAEAmAE3oAGdCaoBAjI4uAEDyAEA-AEBmAIHoALJAsICBhAAGAcYHsICCBAAGBMYBxgewgIIEAAYBxgIGB7CAgoQABgHGAgYChgemAMAkgcBN6AHrTY&sclient=img#vhid=DZw_jCnnjxyV6M&vssid=mosaic 
"use strict";
// NB: 'vizmode' constants (eg: CORONAVIRUS_MODE) defined in 'const_vizmodes.js' 

const QBIT_RADIUS = 2;

// =================================  QBitVizMode class  =================================
class QBitVizMode extends BaseVizMode {
	constructor( renderer, word_indexes, data ) {
        super( renderer, word_indexes, data );

        this.renderer = renderer;

        this.name = QBIT_VIZMODE; 
        this.class_name = this.constructor.name;   
            
        this.renderer.setParameter(MODE_PARAM, this.name);

        this.word_indexes = word_indexes;

        this.node_reps = [];
        if ( data == undefined ) data = {}; 

        this.coordinates_system = SPHERICAL_COORDINATES;
        
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

    // NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> QBitVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            let data = { [ID_ARG]: "Mnemonic_" + ShapeUtils.PadWithZero(i+1),
                         [COLOR_ARG]: MAGENTA };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()

    drawDebugCore() {
        // const axes = new BABYLON.Debug.AxesViewer( this.scene, AXIS_LENGTH );
        // this.renderer.addObject( axes );
    } // drawDebugCore()

    drawCore() {
        console.log(">> QBitVizMode.drawCore");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
            // Truncated Isocahedron: 32 faces, 'polyhedron type' = 3

            if ( this.debug_mode ) {
                ShapeUtils.DrawWireFrameSphere( ORIGIN, 0.5 );
            }
            else {
                let data = { [ID_ARG]: "Core", [COLOR_ARG]: BLUE, [FACE_COUNT_ARG]: 32, [SIZE_ARG]: 0.72 };
                // let core_shape = new PolyhedronShape( this.renderer, data );
				// let core_shape = ShapeUtils.DrawWireFrameSphere( ORIGIN, 0.5 );
				
				let core_shape = BABYLON.MeshBuilder.CreateSphere("qbit", { diameter: QBIT_RADIUS }, scene);

				// Création du matériau semi-transparent gris clair
				let qbit_material = new BABYLON.StandardMaterial("qbitMaterial", scene);
				qbit_material.diffuseColor = new BABYLON.Color3( 0.96, 0.96, 0.86 ); // Gris clair
				qbit_material.alpha = 0.20; // Semi-transparent (0 = invisible, 1 = opaque)

				// Application du matériau à la sphère
				core_shape.material = qbit_material;
				
				this.renderer.addObject(core_shape);

                // core_shape.draw();
				this.display3DAxes();
            }

            // Isocahedron: 20 faces, 'polyhedron type' = 3
            // let data = { [COLOR_ARG]: ORANGE, [FACE_COUNT_ARG]: 20, [SIZE_ARG]: 0.7 };
            // let bb_mesh = new PolyhedronShape( this.renderer, data );
            // bb_mesh.draw();
		}
    } // drawCore()
	
	display3DAxes() {
		// Fonction pour créer une flèche
		const create_arrow = (name, direction, color, size = 1.5) => {
			const origin = BABYLON.Vector3.Zero();
			
			let stick_thickness = 0.03;
			let stick_length    = 0.5;
			
			const axis_stick = BABYLON.MeshBuilder.CreateCylinder(name + "Stick", {
				height:   stick_length,
				// diameter: size * 0.1
				diameter: stick_thickness
			}, scene);
			
			this.renderer.addObject(axis_stick);
			
			const axis_cone = BABYLON.MeshBuilder.CreateCylinder
                ( name+ "Cone", 
				  { "height":         0.2, 
				    "diameterTop":    0, 
					"diameterBottom": 0.11 }, this.renderer.getScene());
                axis_cone.position = axis_stick.position;     

            axis_cone.lookAt( axis_stick.position );
            axis_cone.rotation.x += Math.PI / 2;
			
			this.renderer.addObject( axis_cone );			
			
			// Positionner la flèche
			axis_stick.position = direction.clone().scale(size * 0.16);
			axis_cone.position  = direction.clone().scale(size * 0.31);
			
			// Orienter la flèche
			const quaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
				BABYLON.Vector3.Up(), 
				direction.clone().normalize(),
				new BABYLON.Quaternion()
			);
			
			axis_stick.rotationQuaternion = quaternion;
			axis_cone.rotationQuaternion  = quaternion;
			
			// Appliquer la couleur
			axis_stick.material = new BABYLON.StandardMaterial(name + "StickMat", scene);
			axis_stick.material.diffuseColor = color;
			axis_stick.material.emissiveColor = color;
			
			axis_cone.material = new BABYLON.StandardMaterial(name + "ConeMat", scene);
			axis_cone.material.diffuseColor = color;
			axis_cone.material.emissiveColor = color;
			
			return { axis_stick, axis_cone };
		}; // create_arrow()

		// Créer les axes
		create_arrow("axisX", new BABYLON.Vector3(1, 0, 0), new BABYLON.Color3(1, 0, 0));
		create_arrow("axisY", new BABYLON.Vector3(0, 1, 0), new BABYLON.Color3(0, 1, 0));
		create_arrow("axisZ", new BABYLON.Vector3(0, 0, 1), new BABYLON.Color3(0, 0, 1));
	} // draw3DAxes()

    // NB: called by 'NodeRep.draw()'
    drawStick( node_rep) {
    } // drawStick()

    decorateStick( node_rep ) {
    } // decorateStick()

    drawBoundings() {
        // console.log(">> QBitVizMode.drawBoundings");

        if ( this.renderer.getParameter(SHOW_BOUNDING_BOX_PARAM) ) {
			// ShapeUtils.DrawCubeBox();
            // ShapeUtils.DrawSphereBox( 0.2 );			
			this.drawEquatorCircle(ORIGIN, 1);
		}
    } // drawBoundings()
	
	drawEquatorCircle( origin, radius, color ) {
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

        // for ( let angle = 0; angle < Math.PI; angle += Math.PI/8 ) {
		let angle = Math.PI/2;	
        // draw_meridian( origin, radius, angle, color );
        draw_parallel( origin, radius, angle, color );

        ShapeUtils.DrawCircle( origin, radius, color );
    } // drawEquatorCircle()
	
	// NB: Create 'Nodes' before drawing them because they may be required by 'drawCore()'
    createNodes() {
        console.log(">> BaseVizMode.createNodes");
        for (let i=0; i < this.word_indexes.length; i++) {
            // NB: inconsistency with [COLOR_ARG] : for NodeRep it is the color name (eg: MAGENTA)
            //                                      for LinkRep it is the ColorAsVec3(MAGENTA)
            let data = { [COLOR_ARG]: ORANGE, [RADIUS_ARG]: GeometryUtils.GetRadius() * 1.2 };
            let node_rep = new NodeRep( this, this.word_indexes, i, data );
            this.node_reps.push( node_rep );
        }
    } // createNodes()
	
	drawPoles() {
		let scene = this.renderer.getScene();
		
        // --------------------   North Pole (|0⟩)   --------------------
        const north_pole = BABYLON.MeshBuilder.CreateSphere("north-pole", { diameter: 0.2 }, scene);
		this.renderer.addObject( north_pole );
		
        north_pole.position = new BABYLON.Vector3(0, 1, 0);
        north_pole.material = new BABYLON.StandardMaterial("north-Mat", scene);
		north_pole.material.diffuseColor  = new BABYLON.Color3(0, 0, 1); // Blue
        north_pole.material.emissiveColor = new BABYLON.Color3(0, 0, 1); // Blue

        // Texte |0⟩
        const north_label = BABYLON.MeshBuilder.CreatePlane("north-text", { size: 0.4 }, scene);
		north_label.position = new BABYLON.Vector3(0.0, 1.2, 0.0);
		this.renderer.addObject( north_label );
		
        const north_texture  = new BABYLON.DynamicTexture("northTexture", { width: 128, height: 128 }, scene);
        north_texture.drawText("|0⟩", 33, 70, "bold 50px Arial", "white", "transparent", true);
        north_label.material = new BABYLON.StandardMaterial("northTextMat", scene);
		
        north_label.material.diffuseTexture = north_texture;
        north_label.material.backFaceCulling = false;
        north_label.material.emissiveColor   = new BABYLON.Color3(1, 1, 1);
        north_label.material.diffuseTexture.hasAlpha = true;
        north_label.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		// --------------------   North Pole (|0⟩)


        // --------------------   South Pole (|1⟩)   --------------------
        const south_pole = BABYLON.MeshBuilder.CreateSphere("south-pole", { diameter: 0.2 }, scene);
		this.renderer.addObject( south_pole );
		
        south_pole.position = new BABYLON.Vector3(0, -1, 0);
        south_pole.material = new BABYLON.StandardMaterial("southMat", scene);
        south_pole.material.diffuseColor  = new BABYLON.Color3(1, 0, 0); // Red
        south_pole.material.emissiveColor = new BABYLON.Color3(1, 0, 0); // Red

        // Texte |1⟩
        const south_label = BABYLON.MeshBuilder.CreatePlane("south-text", { size: 0.4 }, scene);
		this.renderer.addObject( south_label );
		
		south_label.position = new BABYLON.Vector3(0, -1.25, 0);
        const south_texture = new BABYLON.DynamicTexture("southTexture", { width: 128, height: 128 }, scene);
        south_texture.drawText("|1⟩", 33, 70, "bold 50px Arial", "white", "transparent", true);
        south_label.material = new BABYLON.StandardMaterial("southTextMat", scene);
        south_label.material.diffuseTexture = south_texture;
        south_label.material.backFaceCulling = false;
        south_label.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        south_label.material.diffuseTexture.hasAlpha = true;
        south_label.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		// --------------------   South Pole (|1⟩)   --------------------
	} // drawPoles()

    drawNodes() {
        console.log(">> QBitVizMode.drawNodes");
        for (let i=0; i < this.node_reps.length; i++) {
            let node_rep = this.node_reps[i];
            node_rep.draw();
        }
    } // drawNodes()

    drawLinks() {
        // console.log(">> QBitVizMode.drawLinks");
    } // drawLinks()

    draw() {
        console.log(">> QBitVizMode.draw");
        this.drawBoundings();
		this.drawPoles()
		
        this.createNodes();
        this.drawCore();
        this.drawNodes();
        // this.drawLinks();
    } // draw()
} // QBitVizMode class