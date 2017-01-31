"use strict";
var gl;

//just some global variables from the TA's sample code
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var dist=10; //distance of the cubes from the origin ALONG EACH AXIS 

var cBuffer; 
/* rotation stuff that I don't need 
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
*/

var model_transform_loc;     
var camera_transform_loc;     


var render_crosshair=false; 


window.onload=function init()
{
	var canvas = document.getElementById("gl-canvas")
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    //create all eight cubes. arg 1 means it's in a positive position on that axis, -1 means negative 
   	colorCube();

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
    cBuffer = gl.createBuffer();
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
    

    model_transform_loc = gl.getUniformLocation(program, "model_transform");   // # Pointer to our GPU variable
    camera_transform_loc = gl.getUniformLocation(program, "camera_transform"); // # Pointer to our GPU variable


window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  	}

  	switch (event.key) {
//  		The ‘c’ key should cycle the colors between the cubes - 5 points.
  		case "c":
  		break; 

/*
Implement a simple camera navigation system using the keyboard. 
Up and down arrow keys should control the position of the camera along the Y axis (+Y is up and -Y is down by default in WebGL). 
Each key press should adjust position by 0.25 units. - 5 points.
*/
    	case "ArrowDown":
      	break;
    	case "ArrowUp":
      	break;
/*
The left and right arrow keys control the heading (azimuth, like twisting your neck to say 'no') of the camera. 
Each key press should rotate the heading by four (4) degrees - 10 points.
*/
    	case "ArrowLeft":
       	break;
    	case "ArrowRight":
      	break;

/*
The letters i, j, k and m control forward, left, right and backward, respectively, relative to the camera's current heading. 
Each key press should adjust position by 0.25 units. 
The ‘r’ key should reset the view to the start position 
	(recall, the start position is defined only in that all cubes are visible and the eye be positioned along the Z axis) – 20 points.
*/
    	case "i":
     	break;
    	case "j":
      	break;
		case "k":
     	break;
    	case "m":
      	break;

      	case "r":
      	break;

/*
The ‘n’ and ‘w’ keys should adjust the horizontal field of view (FOV) narrower or wider. 
One (1) degree per key press. Keep the display of your scene square as the FOV changes - 5 points.
*/
		case "n":
		break;
		case "w":
		break;

/*
The ‘+’ key should toggle the display of an orthographic projection of a cross hair centered over your scene. 
The cross hairs themselves can be a simple set of lines rendered in white – 5 points.
*/
		case "+":
		render_crosshair = !render_crosshair; 
		break; 

    	default:
      	return; // Quit when this doesn't handle the key event.
      }
  

  // Cancel the default action to avoid it being handled twice
  event.preventDefault(); }, true);


  	render(); 
}

function keypresslistener(event){
	console.log(event.key); 
}


function colorCube()
{
    quad( 1, 0, 3, 2);
    quad( 2, 3, 7, 6);
    quad( 3, 0, 4, 7);
    quad( 6, 5, 1, 2);
    quad( 4, 5, 6, 7);
    quad( 5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //camera transform
    var camera=mat4(); 
    
    camera=mult(camera, scalem(.08,.08,.08));
    //camera = mult(camera, translate(0, 0, 20));

    //This doesn't do anything yet. Modify when you need to rotate the camera
    camera = mult(camera, rotate(0, 0, 1, 0)); 
    //multiply by perspective matrix. Use 45 as the field of view parameter, small zNear, big zFar.
    // -11 and 11 work for znear and zfar because you're moving the cubes 10 away from the origin 

	//camera=mult(camera, perspective(45, 1, -20, 20));
	
    gl.uniformMatrix4fv(camera_transform_loc, false, flatten(camera)); 

    //generate a model view matrix to look at the cubes from along the Z-axis

/*
bindBuffer
bufferData -- will eventually need gl.DYNAMIC_DRAW
gl.uniformMat

*/

    //Draw all 8 cubes. 1 in args represents positive position relative to the axis, -1 represents negative. 
    drawcube(1, 1, 1);
    drawcube(1, 1, -1);
    drawcube(1, -1, 1);
    drawcube(-1, 1, 1);
    drawcube(1, -1, -1);
    drawcube(-1, 1, -1);
    drawcube(-1, -1, 1);
    drawcube(-1, -1, -1);


    if(render_crosshair){
    	//render the crosshair:

    }

    requestAnimFrame( render );
}

function drawcube(x, y, z){
	var mv_transform = mat4();
	//moves cube to its destination. 
	mv_transform=mult(mv_transform, translate(dist*x, dist*y, dist*z));
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW); 
    gl.uniformMatrix4fv( model_transform_loc, false, flatten(mv_transform /* mat4()*/));    //Fill in GPU's model transform with the set matrix
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

