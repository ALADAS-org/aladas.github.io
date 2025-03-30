// =====================================================================================================
// ========================================     renderer.js     ========================================
// =====================================================================================================
// Notes: PointCloud to Mesh
//        https://github.com/KineticTactic/marching-cubes-js/blob/master/sketch.js
"use strict";

// https://www.npmjs.com/package/@babylonjs/core		
const MNEMONICS_INDEXES = [  1104, 169, 526, 1304, 1799, 884, 915, 1720, 1637, 1950, 153, 1633,
                              615, 272, 339, 1773, 1978, 704, 483,  190, 1382,   25, 254,  216 ];

const CUBE_DOT   = "Cube";
const SPHERE_DOT = "Sphere";

const canvas = document.getElementById("renderCanvas");

const MODE_NAME_TO_CLASS = { 
	[ARC_VIZMODE]: ArcVizMode,
	[CORONAVIRUS_VIZMODE]: CoronaVirusVizMode, 
	[HELICAL_VIRUS_VIZMODE]: HelicalVirusVizMode,
	[PIN_VIZMODE]: PinVizMode,
	[BLOCKCHAIN_VIZMODE]: BlockchainVizMode,
	[SIMPLE_VIZMODE]: SimpleVizMode  
}; // MODE_NAME_TO_CLASS

let PreventRecursiveEventCall = false;

let SelectedGUIMnemonicNode = undefined;
let SelectedMnemonic = "";

const SHOW_MNEMONICS  = "Show Mnemonics";
const INPUT_MNEMONICS = "Input Mnemonics";
let MnemonicsMode = SHOW_MNEMONICS;

let MainWordIndexes = [];

// https://forum.babylonjs.com/t/how-to-build-animation-for-arcrotatecamera-so-it-can-rotate-smoothly/25698/4
// https://playground.babylonjs.com/#U5SSCN#169
BABYLON.ArcRotateCamera.prototype.spinTo = function (whichprop, targetval, speed) {
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode( BABYLON.EasingFunction.EASINGMODE_EASEINOUT );
 
 	setTimeout( async () => {
		let animation = BABYLON.Animation.CreateAndStartAnimation
		                ('at4', this, whichprop, speed, 120, this[whichprop], targetval, 0, ease);

        console.log("before this.alpha: " + this.alpha);
		let save_alpha = this.alpha;
        await animation.waitAsync();
        console.log("after this.alpha: " + this.alpha);
		this.alpha = save_alpha;
    });
} // BABYLON.ArcRotateCamera.prototype.spinTo()

// ============================== Renderer class ==============================
class Renderer {	
	static #Key          = Symbol('Renderer');
	static #Singleton    = new Renderer( Renderer.#Key );
	static #Scene        = undefined;
	static #SceneObjects = [];

	static GetInstance() {	
		return Renderer.#Singleton;
	} // Renderer.GetInstance()

	constructor( instance_key ) {
		// console.log(">> ---- Renderer.new instance_key: " + String(instance_key));
		if ( instance_key != Renderer.#Key ) {	
			throw new Error("**Error** in Renderer: private constructor use Renderer.GetInstance()");
		} 	
		// console.log(">> ---- new Renderer");

		this.seedphrase = new SeedPhrase( this );

        this.scene = undefined;
		this.scene_objects = [];

		this.parameters = {};
		this.parameters[THEME_PARAM]             = SCREEN_THEME;

		this.viz_mode = ARC_VIZMODE;
		this.parameters[MODE_PARAM]              = this.viz_mode;
		this.parameters[WORD_COUNT_PARAM]        = 12;

		this.parameters[RENDERING_PARAM]         = DEFAULT_RENDERING;
		this.parameters[RENDERING_FRAME_PARAM]   = 1;

		//this.parameters[ARC_MODE_PARAM]          = false;
		//this.parameters[STAIR_STEP_PARAM]        = true;
		
		this.parameters[FILLED_TRIANGLES_PARAM]  = false;
		this.parameters[METADATA_PARAM]          = true;
		
		this.parameters[FILE_FORMAT_PARAM]       = GLB_FILE_FORMAT;

		this.parameters[SHOW_BALLS_PARAM]        = true;
		this.parameters[SHOW_CENTROID_PARAM]     = false;
		this.parameters[SHOW_BOUNDING_BOX_PARAM] = true;
		this.parameters[SHOW_GRID_PARAM]         = false;
		this.parameters[DEBUG_PARAM]             = false;

		this.registerCallbacks();
	} // constructor()

	getScene() {
		return this.scene;
	} // getScene()

	getCamera() {
		return this.camera;
	} // getCamera()

	animateCamera() {
		// console.log("  renderer.getCamera().alpha): " + this.camera.alpha );
		let speed = 50; // 50
		this.camera.spinTo("alpha", 6.75*Math.PI/4, speed);	
		// console.log("  renderer.getCamera().alpha): " + this.camera.alpha );
	} // animateCamera()

	// ==================== Create Scene ==================== 
	createScene() {
		console.log(">> ---- createScene ----");

		// This creates a basic Babylon Scene object (non-mesh)
		this.scene = new BABYLON.Scene( engine );

		// ********** ARC ROTATE CAMERA EXAMPLE **********
		// Creates, angles, distances and targets the camera
		this.camera = new BABYLON.ArcRotateCamera
			          ("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		
		// https://doc.babylonjs.com/typedoc/classes/BABYLON.PickingInfo#hit
		const onPointerDown = (evt) => {
			var pickInfo = scene.pick( this.scene.pointerX, this.scene.pointerY, function (mesh) {
				return true;
			}, false, this.camera);

			if ( pickInfo.hit ) {
				if ( pickInfo.pickedMesh != undefined && pickInfo.pickedMesh.metadata != undefined ) {
					let word_index = pickInfo.pickedMesh.metadata['word_index'];			 
					console.log("   *Hit* word_index: " + word_index ); 
					displaySelectedNode( pickInfo.pickedMesh );  
				}
			} else {
				console.log("No Hit");
			}
		}; // onPointerDown()

		// https://forum.babylonjs.com/t/arcrotatecamera-pan-and-zoom-sensitivity/33046
		this.camera.wheelDeltaPercentage = 0.01;

		// This rotates the camera
		let camera_alpha  =   2; // 2; //   0;
		let camera_beta   =   2; // 2;
		let camera_radius =  -3; // -10;
		
		// https://doc.babylonjs.com/features/featuresDeepDive/cameras/camera_introduction
		// Positions the camera overwriting alpha, beta, radius
		this.camera.setPosition( new BABYLON.Vector3(camera_alpha, camera_beta, camera_radius) );
		
		// This attaches the camera to the canvas
		this.camera.attachControl( canvas, true );

		// https://stackoverflow.com/questions/45901063/how-to-find-the-coordinates-of-a-click-in-the-babylon-js-scene
		this.scene.cameraToUseForPointers = this.camera;
		canvas.addEventListener("pointerdown", onPointerDown, false);
		this.scene.onDispose = () => {
			canvas.removeEventListener("pointerdown", onPointerDown);
		}; // scene.onDispose()
		/**************************************************************/

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		this.light = new BABYLON.HemisphericLight
					 ("light", new BABYLON.Vector3(0, 1, 0), this.scene);
		
		Materials.CreateMaterials( this.scene );

		MainWordIndexes = getRandomWordIndexes( this.parameters[WORD_COUNT_PARAM] );

		// ---------- GUI ----------
		let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

		let gui_selected_mnemonic = new BABYLON.GUI.TextBlock();
			gui_selected_mnemonic.text     = "";
			gui_selected_mnemonic.color    = "cyan";
			gui_selected_mnemonic.fontSize = 24;
			//text1.left     = "-50%";
			gui_selected_mnemonic.top      = "-47%";//"-46%";

		advancedTexture.addControl( gui_selected_mnemonic ); 
		
		SelectedGUIMnemonicNode = gui_selected_mnemonic;
		// ---------- GUI 
		
		// ---------- Draw 'Mnemonics Shape' ----------
		this.drawScene();
		// ---------- Create 'Mnemonics Shape'
		
		// https://doc.babylonjs.com/toolsAndResources/assetLibraries/materialsLibrary/gridMat
		//let ground = BABYLON.MeshBuilder.CreateGround
		//	("ground1", { width: 10, height: 10, subdivisions: 2 }, scene);
		
		return this.scene;
	}; // createScene()
	// ==================== Create Scene

	// https://forum.babylonjs.com/t/how-do-you-properly-remove-an-object-from-the-scene/1790/4
	clearScene() {
		ShapeUtils.Reset();
		BaseShape.ResetObjectCount();

		for ( let i=0; i < this.scene_objects.length; i++) {
			if ( this.scene_objects[i] != null && this.scene_objects[i] != undefined ) {
				this.scene_objects[i].dispose();
				this.scene_objects[i] = null;
			}		
		}
		this.scene_objects = [];
	
		this.clearObjects();
	} // clearScene()
	
	drawScene( args ) {
		console.log(">> ---- Renderer.drawScene ----");
		if ( args == undefined ) args = {};
		
		let background_color = THEMES[this.parameters[THEME_PARAM]][BACKGROUND_COLOR][0];
		this.scene.clearColor = Color.AsVec3( background_color );

		let viz_mode = this.parameters[MODE_PARAM];
		// console.log("   viz_mode: " + viz_mode);
		if ( MODE_NAME_TO_CLASS[viz_mode] != undefined ) {
			this.viz_mode = new MODE_NAME_TO_CLASS[viz_mode]( this, MainWordIndexes );
			this.viz_mode.draw();
			return;
		}

		// =================================================================== 
		
		if ( this.parameters[SHOW_BOUNDING_BOX_PARAM] ) {
			ShapeUtils.DrawCubeBox();
		}
		
		if ( this.parameters[SHOW_GRID_PARAM] ) {
			ShapeUtils.CreateDotGrid( MATERIALS[GREY], scene, this.scene_objects );
		}
		
		// ---------- Closed Triangles mode ---------- 
		let closed_mode = ClosedTrianglesMode;
		if ( args != undefined && args['closed_triangles'] != undefined ) {
			closed_mode = args['closed_triangles'];
		}
		// ---------- Closed Triangles mode
		
		// ---------- Filled Triangles mode ---------- 
		let filled_mode = this.parameters[FILLED_TRIANGLES_PARAM];
		if ( args != undefined && args['filled_triangles'] != undefined ) {
			filled_mode = args['filled_triangles'];
			this.parameters[FILLED_TRIANGLES_PARAM] = filled_mode;
		}
		// ---------- Filled Triangles mode
		
		this.seedphrase.draw( MainWordIndexes, 
			{ "closed_triangles": closed_mode, "filled_triangles": filled_mode } );	
	} // drawScene()

	setEventHandler( elt_id, event_name, handler_function ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // setEventHandler()	

	onParameterChange( elt_id ) {		
		let event_name = elt_id.replace('_id','');
		console.log(">> Renderer.onParameterChange id:" + elt_id + " evt:" + event_name);
	
		let elt = document.getElementById( name + "_id" );
		// console.log("   elt.nodeName: " + elt.nodeName);
		if ( elt.nodeName == "INPUT" && elt.type === 'checkbox') {
			this.parameters[ event_name ] = elt.checked;
		}
		else if ( elt.nodeName == "SELECT" ) {
			this.parameters[ event_name ] = elt.value;
			console.log("   renderer.parameters[" + event_name + "]: " + this.parameters[ event_name ]  );
		}
		
		if ( event_name == WORD_COUNT_PARAM ) {
			MainWordIndexes = getRandomWordIndexes( this.parameters[ WORD_COUNT_PARAM ] ); 
		}
		else if ( event_name == MODE_PARAM ) {			
			this.parameters[ MODE_PARAM ] = elt.value;
		}
	
		this.clearScene();
		this.drawScene();
	} // onParameterChange()

	registerCallbacks() {
		// ---------- THEME_ID ----------
		this.setEventHandler( THEME_ID, 'change', 
			(evt) => { 
			    console.log( "Renderer.evtHandler> " + THEME_ID );
				let elt = document.getElementById(THEME_ID);
				this.parameters[THEME_PARAM] = elt.value;
				console.log( "   this.parameters[THEME_PARAM]: " + elt.value );

				this.clearScene();
				this.drawScene();
			} ); 
		// ---------- THEME_ID 

		// ---------- MODE_ID ----------
		this.setEventHandler( MODE_ID, 'change', 
			(evt) => { 
				console.log( "Renderer.evtHandler> " + MODE_ID );
				let elt = document.getElementById(MODE_ID);
				this.parameters[MODE_PARAM] = elt.value;
				// console.log( "   this.parameters[MODE_PARAM]: " + elt.value );

				this.clearScene();
				this.drawScene();

				// NB: to prevent ficus on 'mode_id' which prevents 'A' key to trigger 'animateCamera'
				document.getElementById(ANIMATION_BTN_ID).focus();
			} ); 
		// ---------- THEME_ID 

		// ---------- Camera Animation on 'body' ----------
		document.body.addEventListener( 'keypress', (evt) => {
            console.log("keypress: '"+ evt.key + "'");			
			// NB: Better use 'evt.key' than 'evt.keyCode' (which is deprecated)
			// https://stackoverflow.com/questions/35394937/keyboardevent-keycode-deprecated-what-does-this-mean-in-practice
			
			// NB: Disable 'A'/'a' keys on 'mode_id' SELECT entity to 'arc': onkeydown="disableKey(event)"
			if ( ['A', 'a'].includes(evt.key) ) {			
				this.animateCamera();
			}
        });
        // ---------- Camera Animation on 'body'
	} // registerCallbacks()
	
	getParameter( name ) { 
	    return (this.parameters[name] != undefined) ? this.parameters[name] : undefined; 	
	} // getParameter()

	setParameter( name, value ) { 
	    this.parameters[name] = value; 	
	} // setParameter()

	getThemeName() {	
		return this.parameters[THEME_PARAM];
	} // getThemeName()

	setThemeName( theme_name ) {	
		this.parameters[THEME_PARAM] = theme_name;
		ThemeManager.UpdateTheme( theme_name );
	} // setThemeName()

	addObject( object ) {	
		this.scene_objects.push( object );
	} // addObject()

	clearObjects() {	
		ShapeUtils.Reset();
		for ( let i=0; i < this.scene_objects.length; i++) {
			if ( this.scene_objects[i] != null && this.scene_objects[i] != undefined ) {
				this.scene_objects[i].dispose();
				this.scene_objects[i] = null;
			}		
		}
		this.scene_objects = [];
	} // clearObjects()

	getScene() {	
		return this.scene;
	} // constructor()
} // Renderer class
// ============================== Renderer class

// NB: to be continued... ToDo: Mesh with Arc Shape (Polyline), add positions as a discretization of Arc shape
const createArcMesh = ( mesh_material, scene, positions ) => {
	// https://playground.babylonjs.com/#G37IGN#4
	
	let arc_mesh = new BABYLON.Mesh("arc_" + ObjectCount, scene);
	arc_mesh.material = mesh_material;

	let indices = [0, 1, 2];

	// Empty array to contain calculated values or normals added
	let normals = [];

	// Calculations of normals added
	BABYLON.VertexData.ComputeNormals( positions, indices, normals );

	let vertexData = new BABYLON.VertexData();

	vertexData.positions = positions;
	vertexData.indices   = indices;
	vertexData.normals   = normals; // Assignment of normal to vertexData added

	vertexData.applyToMesh( arc_mesh );	
	ObjectCount++;
	
	return arc_mesh;
}; // createArcMesh()

const createTriangleMesh = ( mesh_material, scene, positions ) => {
	let triangle_mesh = new BABYLON.Mesh("triangle_" + ObjectCount, scene);
	triangle_mesh.material = mesh_material;

	let indices = [0, 1, 2];

	// Empty array to contain calculated values or normals added
	let normals = [];

	// Calculations of normals added
	BABYLON.VertexData.ComputeNormals( positions, indices, normals );

	let vertexData = new BABYLON.VertexData();

	vertexData.positions = positions;
	vertexData.indices   = indices;
	vertexData.normals   = normals; // Assignment of normal to vertexData added

	vertexData.applyToMesh( triangle_mesh );	
	ObjectCount++;
	
	return triangle_mesh;
}; // createTriangleMesh()

const displayMnemonics = ( word_indexes ) => { 	
	if ( word_indexes != undefined && word_indexes.length >= 12 ) {
		let elt = document.getElementById( 'mnemonics_id' );
		let mnemonics = MnemonicUtils.WordIndexesToMemonics( word_indexes );
		let mnemonics_str = "";
		for ( let i=0; i< mnemonics.length; i++ ) {
			let mnemonic = mnemonics[i];
			let text_color = "#d0d0d0";
			if ( mnemonic == SelectedMnemonic ) {
				text_color = "cyan";
			}
			mnemonics_str += '<span style="color: ' + text_color + '">' + mnemonic + "&nbsp;&nbsp;"+ "</span>";
		}
		elt.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;"+ mnemonics_str; 
	}
}; // displayMnemonics ()

const displaySelectedNode = ( mesh ) => { 
	if ( mesh.metadata != undefined ) {
		// dot_mesh.metadata = { "gltf": { "mnemonic": mnemonic, "word_index": word_index } };
		// cube.metadata = {"gltf":{"extras": {"someKey": "someValue"}}};
		if ( mesh.metadata == undefined ) return;
		
		let gltf_properties = mesh.metadata['gltf'];
		let extras_property = gltf_properties['extras'];
		let word_index      = extras_property['word_index'];	
		let mnemonic = MnemonicUtils.WordIndexToMnemonic( word_index );		 
		console.log(">> *** displaySelectedNode word["+ word_index + "] : " + mnemonic );  	
		
		SelectedMnemonic = mnemonic;
		SelectedGUIMnemonicNode.text = mnemonic;

		displayMnemonics( MainWordIndexes );
	}	
}; // displaySelectedNode ()

const getRandomWordIndexes = ( index_count ) => {
	// console.log("> **** getRandomWordIndexes " + index_count );
	if ( index_count == undefined ) {
		index_count = 24;
	}
		
	const get_randomInt = ( max ) => {
		return Math.floor(Math.random() * max);
	}; // get_randomInt()
 	
	let random_indexes = [];
	for ( let i=0; i< index_count; i++ ) {
		let rnd_index = get_randomInt( 2048 );
		random_indexes.push(rnd_index);
	}

	SelectedMnemonic = MnemonicUtils.WordIndexToMnemonic( random_indexes[0] );

	MainWordIndexes = random_indexes;
	displayMnemonics( MainWordIndexes );
	
	return random_indexes;
}; // getRandomWordIndexes()

let startRenderLoop = ( engine, canvas ) => {
	engine.runRenderLoop( () => {
		if ( window.scene && window.scene.activeCamera ) {
			window.scene.render();
		}
	});
}; // startRenderLoop()

let createDefaultEngine = () => { 
	return new BABYLON.Engine
	           (canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); 
}; // createDefaultEngine()


// ======================================= EVENTS =======================================
const disableKey = ( evt ) => {	
   let event = evt ? evt : window.event;
   if ( event )
   {
       if ( event.preventDefault )
	      event.preventDefault();
       else
	      event.returnValue = false;         
   }    
}; // disableKey()

const onGenerate = ( evt ) => {	
	console.log(">> *** onGenerate ");
	let renderer = Renderer.GetInstance();
	MainWordIndexes = getRandomWordIndexes( renderer.getParameter(WORD_COUNT_PARAM) );	

	renderer.clearScene();
	renderer.drawScene();
}; // onGenerate()

// https://doc.babylonjs.com/features/featuresDeepDive/Exporters/glTFExporter
function onSave( evt ) {	
	console.log(">> *** onSave ");
	let renderer = Renderer.GetInstance();
	let file_format = renderer.getParameter( FILE_FORMAT_PARAM );
	console.log("onSave file_format: " + file_format);
	switch ( file_format ) {
		case GLB_FILE_FORMAT:
			BABYLON.GLTF2Export.GLBAsync( scene, "cryptoshape" ).then((glb) => {
				glb.downloadFiles();
			});
			break;
			
		case PNG_FILE_FORMAT:
		    // https://doc.babylonjs.com/features/featuresDeepDive/scene/renderToPNG/#createscreenshot
			BABYLON.Tools.CreateScreenshot( renderer.scene.getEngine(), renderer.getCamera(), {precision: 1.0} );
			break;
	} //switch ( file_format )
} // onSave()

function onAnimate() {	
	console.log(">> *** onAnimate ");
	let renderer = Renderer.GetInstance();
    renderer.animateCamera();	
} // onAnimate()

const onMnemonicsEditMode = () => {
	console.log(">> *** onMnemonicsEditMode ");
	if ( MnemonicsMode == SHOW_MNEMONICS ) {
		$("#mnemonics_id").hide();
		$("#editMnemonicsIcon").hide();
		$("#mnemonics_input_container_id").show();
        MnemonicsMode = INPUT_MNEMONICS;		
	}
}; // onMnemonicsEditMode()

const onApplyMnemonicsChange = () => {
	console.log(">> *** onApplyMnemonicsChange ");
	let renderer = Renderer.GetInstance();
	if ( MnemonicsMode == INPUT_MNEMONICS ) {
		$("#mnemonics_id").show();
		$("#editMnemonicsIcon").show();
		$("#mnemonics_input_container_id").hide();		
        MnemonicsMode = SHOW_MNEMONICS;	

        let mnemonics = document.getElementById( "mnemonics_input_id" ).value
		                .trim().replaceAll("  "," ");
        console.log("   mnemonics: '" + mnemonics + "'");
			
		let mnemonics_count = mnemonics.split(' ').length;
		console.log("   mnemonics length: '" + mnemonics_count + "'");

		document.getElementById(WORD_COUNT_ID).value = mnemonics_count;
		renderer.setParameter(WORD_COUNT_PARAM, mnemonics_count);

		let word_indexes = MnemonicUtils.MnemonicsToWordIndexes( mnemonics);

		MainWordIndexes = word_indexes;
		displayMnemonics( MainWordIndexes );
		renderer.clearScene();
		renderer.drawScene();		
	}
}; // onApplyMnemonicsChange()

const onCancelMnemonicsChange = () => {
	$("#mnemonics_id").show();
	$("#editMnemonicsIcon").show();
	$("#mnemonics_input_container_id").hide();
	MnemonicsMode = SHOW_MNEMONICS;	
}; // onCancelMnemonicsChange()

const onParameterChange = ( name ) => {	
	console.log(">> *** onParameterChange " + name);
	let renderer = Renderer.GetInstance();

	let elt = document.getElementById( name + "_id" );
	// console.log("   elt.nodeName: " + elt.nodeName);
	if ( elt.nodeName == "INPUT" && elt.type === 'checkbox') {
		renderer.setParameter( name, elt.checked);
	}
	else if ( elt.nodeName == "SELECT" ) {
		renderer.setParameter( name, elt.value);
		console.log("   renderer.parameters[" + name + "]: " + renderer.getParameter(name) );
	}
	
	if ( name == WORD_COUNT_PARAM ) {
		MainWordIndexes = getRandomWordIndexes( renderer.getParameter(WORD_COUNT_PARAM) ); 
	}
	else if ( name == MODE_PARAM ) {			
		renderer.setParameter(MODE_PARAM, elt.value);
	}

	renderer.clearScene();
	renderer.drawScene();
}; // onParameterChange()

const onClosedChange = ( data ) => {	
	let elt = document.getElementById("closed_id");
	let renderer = Renderer.GetInstance();
	ClosedTrianglesMode = elt.checked;
	console.log(">> *** onClosedChange " + ClosedTrianglesMode);
	renderer.clearScene();
	renderer.drawScene();
}; // onClosedChange()

window.initFunction = async () => {
	console.log(">> --- window.initFunction");
	let asyncEngineCreation = async () => {
		try {
			return createDefaultEngine();
		} 
		catch(e) {
			console.log("the available createEngine function failed. Creating the default engine instead");
			return createDefaultEngine();
		}
    }; // asyncEngineCreation() 

    window.engine = await asyncEngineCreation();

    if ( ! engine ) throw 'engine should not be null.';

    startRenderLoop( engine, canvas );
	window.scene = Renderer.GetInstance().createScene();
}; // window.initFunction()
	
initFunction().then(
	() => { 
		// sceneToRender = scene; 
	}                    
); // call of window.initFunction()

// Resize
window.addEventListener( "resize", () => { engine.resize(); } ); 
// ======================================= EVENTS