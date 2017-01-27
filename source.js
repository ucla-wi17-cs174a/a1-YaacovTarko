"use strict";

window.onload=function init()
{
	canvas = document.getElementById("gl-canvas")
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

}