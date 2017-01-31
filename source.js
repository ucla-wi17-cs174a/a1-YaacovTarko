"use strict";
var gl;

//just some global variables from the TA's sample code
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var model_transform_loc;     
var camera_transform_loc;     

window.onload=function init()
{
	var canvas = document.getElementById("gl-canvas")
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    gl.viewport( 0, 0, canvas.width, canvas.height );
    //clear to black
    gl.clearColor( 0, 0, 0, 1 );
    //enable z-buffer
	gl.enable(gl.DEPTH_TEST);

	//Gives my shaders to WebGL
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program); 



    gl.clear(gl.COLOR_BUFFER_BIT); //clear to black

    //create and bind color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    //specifies format for vertex color data 
    var vColor = gl.getAttribLocation( program, "vColor" );
    var whatswrong=gl.getError(); 
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    //create and bind vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    //specifies format for vertex position data
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


//    thetaLoc = gl.getUniformLocation(program, "theta"); // # Repeat for our two new shader variables (matrices):
    
	var vertices = [
    -0.7,-0.1,0,
    -0.3,0.6,0,
    -0.3,-0.3,0,
    0.2,0.6,0,
    0.3,-0.3,0,
    0.7,0.6,0 
    ]


    model_transform_loc = gl.getUniformLocation(program, "model_transform");   // # Pointer to our GPU variable
    camera_transform_loc = gl.getUniformLocation(program, "camera_transform"); // # Pointer to our GPU variable


}
