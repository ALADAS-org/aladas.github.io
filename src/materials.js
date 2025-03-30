// ====================================================================================================
// =======================================     materials.js     =======================================
// ====================================================================================================
"use strict";

let MATERIALS = {};

class Materials {
    static ColorAsVec3( color ) {
        // Note: color[0] is' Color Name' and 1..3 indexes are RGB components
        let color_rgb = new BABYLON.Color3(color[1], color[2], color[3]);
        return color_rgb;
    } // Materials.ColorAsVec3()

    static CreateMaterial( material, scene  ) {
        // console.log(">> ---- Materials.CreateMaterial");
        let material_name = material[0] + "_material";
        let new_material = new BABYLON.StandardMaterial(material_name, scene);
            // Note: material[0] is Color Name then 1..3 indexes are RGB components 
            new_material.diffuseColor  = new BABYLON.Color3( material[1], material[2], material[3] );
            new_material.emissiveColor = new BABYLON.Color3( material[1], material[2], material[3] );
            new_material.specularColor = new BABYLON.Color3( material[1], material[2], material[3] );
            new_material.backFaceCulling = false; // backface is same material
        return new_material;
    } // Materials.CreateMaterial()

   static CreateMaterials( scene ) {	
        // console.log(">> ---- Materials.CreateMaterial");
        for (let i=0; i < COLORS.length; i++) {
            MATERIALS[COLORS[i]] = Materials.CreateMaterial( COLORS[i], scene );
        }

        // https://www.babylonjs-playground.com/#7HZISY#0
        // https://doc.babylonjs.com/resources/transparency_and_how_meshes_are_rendered
        let alphamat = new BABYLON.StandardMaterial( 'alphamat', Renderer.GetInstance().getScene() );
            alphamat.diffuseColor  = BABYLON.Color3.Blue();
            alphamat.emissiveColor = new BABYLON.Color3(.5, .4, .5); // not necessary artistic decision
            alphamat.alpha = 0.065;
        MATERIALS[ALPHA_MAT] = alphamat;

        let alphamat_2 = new BABYLON.StandardMaterial( 'alphamat_2', Renderer.GetInstance().getScene() );
            alphamat_2.diffuseColor  = Color.AsVec3(CYAN);
            alphamat_2.emissiveColor = Color.AsVec3(CYAN); 
            alphamat_2.alpha = 0.1;
        MATERIALS[ALPHA_MAT_2] = alphamat_2;
    } // MaterialscreateMaterials()
} // Materials class