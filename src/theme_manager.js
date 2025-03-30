// ======================================================================================================
// =====================================     theme_manager.js     =======================================
// ======================================================================================================
"use strict";

const SCREEN_THEME = "screen";
const PRINT_THEME  = "print";
const EXPORT_THEME = "export";
// const FLUO_THEME   = "fluo";

const NOT_OVERWRITABLE   = "not_overwritable";
const EXPORTABLE         = "exportable";
const BACKGROUND_COLOR   = "background_color";
const BOUNDING_BOX_COLOR = "bounding_box_color";
const NODE_COLOR         = "node_color";
const NODE_SIZE          = "node_size";
const EDGE_RENDERING     = "edge_rendering";
const EDGE_THICKNESS     = "edge_thickness";
const LINK_COLOR         = "link_color";
const LINK_THICKNESS     = "link_thickness";
const STICK_COLOR        = "stick_color";
const STICK_THICKNESS    = "stick_thickness";

const THEMES = {
   [SCREEN_THEME] : {
       [BACKGROUND_COLOR]   : [DARK_BLUE], 
       [BOUNDING_BOX_COLOR] : [GREY_75],
       [NODE_COLOR]         : [GREY],
       [NODE_SIZE]          : .08,
       [LINK_COLOR]         : [CYAN]
   },

   [PRINT_THEME] : {
       [NOT_OVERWRITABLE]   : true,
       [BACKGROUND_COLOR]   : [WHITE],
       [BOUNDING_BOX_COLOR] : [BLACK],
       [EDGE_RENDERING]     : true,
       [EDGE_THICKNESS]     : 1.15,
       [NODE_COLOR]         : [GREY_50],
       [NODE_SIZE]          : .1,       
       [LINK_COLOR]         : [GREY_60],
       [LINK_THICKNESS]     : .1   
   },

   [EXPORT_THEME] : {
       [EXPORTABLE]         : true,
       [BACKGROUND_COLOR]   : [DARK_BLUE], 
       [BOUNDING_BOX_COLOR] : [GREY_75],
       [NODE_COLOR]         : [GREY],
       [NODE_SIZE]          : .08,
       [LINK_COLOR]         : [CYAN]
   }
};