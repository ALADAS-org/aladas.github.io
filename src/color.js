// =====================================================================================================
// ========================================     color.js     ==========================================
// =====================================================================================================
"use strict";

const WHITE_COLOR = new BABYLON.Color3(1, 1, 1);
const BLACK_COLOR = new BABYLON.Color3(0, 0 ,0);

const ALPHA_MAT   = "alpha";
const ALPHA_MAT_2 = "alpha_2";

const RED        = ["red",        1,    0,    0  ]; 
const GREEN      = ["green",      0,    1,    0  ]; 
const BLUE       = ["blue",       0,    0,    1  ]; 

const CYAN       = ["cyan",       0,    1,    1  ];
const YELLOW     = ["yellow",     1,    1,    0  ];
const ORANGE     = ["orange",     1,    0.5,  0  ];
const MAGENTA    = ["magenta",    1,    0,    1  ];

const BEIGE      = ["beige",      0.90, 0.90, 0.75 ];

const WHITE      = ["white",      1,    1,    1  ];
const BLACK      = ["black",      0,    0,    0  ];

const GREY       = ["grey",       0.4,  0.4,  0.4];
const LIGHT_GREY = ["light_grey", 0.85, 0.85, 0.85];
const DARK_GREY  = ["dark_grey",  0.4,  0.4,  0.4];
const MID_GREY   = ["mid_grey",   0.6,  0.6,  0.6];

const GREY_10    = ["grey_10",    0.1,  0.1,  0.1];
const GREY_25    = ["grey_25",    0.25, 0.25, 0.25];
const GREY_50    = ["grey_50",    0.5,  0.5,  0.5];
const GREY_60    = ["grey_60",    0.6,  0.6,  0.6];
const GREY_75    = ["grey_75",    0.75, 0.75, 0.75];
const GREY_85    = ["grey_85",    0.85, 0.85, 0.85];

const DARK_BLUE  = ["dark blue",  0.2, 0.2, 0.3]; //#33334C

const COLOR_NAME_TO_CONST = { 
    "red":   [RED],   "green":   [GREEN],   "blue":   [BLUE], 
    "cyan":  [CYAN],  "magenta": [MAGENTA], "yellow": [YELLOW], "orange": [ORANGE], 
    "black": [BLACK], "white":   [WHITE],   "beige":  [BEIGE],
    "grey":  [GREY],   
    "light_grey": [LIGHT_GREY], "dark_grey": [LIGHT_GREY], "mid_grey": [MID_GREY],
    "grey_10": [GREY_10], "grey_25": [GREY_25], "grey_50":  [GREY_50], "grey_75": [GREY_75], "grey_85": [GREY_85],
    "dark blue":  [DARK_BLUE]
}; 

const COLORS  = [ RED, BLUE, GREEN, 
                  CYAN, YELLOW, ORANGE, MAGENTA, 
                  WHITE, BLACK, BEIGE,
                  GREY, LIGHT_GREY, DARK_GREY, MID_GREY, 
                  GREY_10, GREY_25, GREY_50, GREY_60, GREY_75, GREY_85,
                  DARK_BLUE ];

class Color {
    static AsVec3( color ) {
        // Note: color[0] is' Color Name' and 1..3 indexes are RGB components
        let color_rgb = new BABYLON.Color3( color[1], color[2], color[3] );
        // console.log("Color.AsVec3: " + color_rgb);
        return color_rgb;
    } // Color.AsVec3()

    static FromHex( color_hex ) {
        if (color_hex == undefined ) color_hex = "#000000";
        if ( color_hex.startsWith('#') ) color_hex = color_hex.substring(1);

        let red_hex = color_hex.substring(0, 2);
        console.log("red_hex: " + red_hex);

        let green_hex = color_hex.substring(2, 4);
        console.log("green_hex: " + green_hex);

        let blue_hex = color_hex.substring(4);
        console.log("blue_hex: " + blue_hex);

        let color_vec3 =  parseInt("0x" + red_hex, 16) / 255 
                        + parseInt("0x" + green_hex, 16) / 255
                        + parseInt("0x" + blue_hex, 16) / 255
        console.log("Color.FromHex: " + color_vec3);
        return color_vec3;
    } // Color.FromHex()

    static AsHex( color ) {
        // Note: color[0] is' Color Name' and 1..3 indexes are RGB components
        const pad_with_zero = (n) => (n < 10 ? ('0'+n).toString() : n.toString());

        let red   = Math.floor(color[1] * 255);
        console.log("red: " + red);

        let green = Math.floor(color[2] * 255);
        console.log("green: " + green);

        let blue  = Math.floor(color[3] * 255);
        console.log("blue: " + blue);

        let color_hex = '#'+ pad_with_zero(red.toString(16)) 
                           + pad_with_zero(green.toString(16)) 
                           + pad_with_zero(blue.toString(16));
        console.log("Color.AsHex: " + color_hex);
        return color_hex;
    } // Color.AsHex()
} // Color class