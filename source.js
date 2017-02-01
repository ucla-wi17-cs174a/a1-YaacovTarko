"use strict";
var gl;

//just some global variables from the TA's sample code
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var dist=10; //distance of the cubes from the origin along EACH axis 

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


//for key-press options

var render_crosshair=false; 
var field_of_view=45; 
var numColorCycles=0; 
var azimuth_cam_angle=0; 
var cam_x=0;
var cam_y=0;
var cam_z=-30; 

//Describes the lines that will be drawn around the cube. Starts centered around the origin, and will be translated to each cube  
/*
[
 vec4(0.5, 0.5, 0.5), vec4(0.5, 0.5, -0.5),
 vec4(0.5, 0.5, 0.5), vec4(0.5, -0.5, 0.5),
 vec4(0.5, 0.5, 0.5), vec4(-0.5, 0.5, 0.5),
 vec4(0.5, 0.5, -0.5), vec4(0.5, -0.5, -0.5),
 vec4(0.5, 0.5, -0.5), vec4(-0.5, 0.5, -0.5),
 vec4(0.5, -0.5, 0.5), vec4(-0.5, -0.5, 0.5),
 vec4(0.5, -0.5, 0.5), vec4(0.5, -0.5, -0.5),
 vec4(-0.5, 0.5, 0.5), vec4(-0.5, 0.5, -0.5),
 vec4(-0.5, 0.5, 0.5), vec4(-0.5, -0.5, 0.5),
 vec4(-0.5, -0.5, 0.5), vec4(-0.5, -0.5, -0.5),
 vec4(-0.5, 0.5, -0.5), vec4(-0.5, -0.5, -0.5),
 vec4(0.5, -0.5, -0.5), vec4(-0.5, -0.5, -0.5),
]; 
*/

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


	//create the initial cube at the origin that will be translated to the proper locations
   	initializeCube();


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
//  		The c key should cycle the colors between the cubes - 5 points.
  		case "c":
  		numColorCycles++; 
  		break; 

/*
Implement a simple camera navigation system using the keyboard. 
Up and down arrow keys should control the position of the camera along the Y axis (+Y is up and -Y is down by default in WebGL). 
Each key press should adjust position by 0.25 units. - 5 points.
*/
    	case "ArrowDown":
    	cam_y+=0.25; 
      	break;
    	case "ArrowUp":
    	cam_y-=0.25; 
      	break;
/*
The left and right arrow keys control the heading (azimuth, like twisting your neck to say 'no') of the camera. 
Each key press should rotate the heading by four (4) degrees - 10 points.
*/
    	case "ArrowLeft":
    	azimuth_cam_angle-=4;         
       	break;
    	case "ArrowRight":
    	azimuth_cam_angle+=4;
      	break;

/*
The letters i, j, k and m control forward, left, right and backward, respectively, relative to the camera's current heading. 
Each key press should adjust position by 0.25 units. 
The r key should reset the view to the start position 
	(recall, the start position is defined only in that all cubes are visible and the eye be positioned along the Z axis) 20 points.
*/
    	case "i":
    		//uses trig to determine how much of the 0.25 units should be along each axis
  	    	var angle=radians(azimuth_cam_angle);
  			var cos=Math.cos(angle);
  			var sin=Math.sin(angle); 

			cam_x-=0.25*(sin)/(Math.abs(cos)+Math.abs(sin)); 
			cam_z+=0.25*(cos)/(Math.abs(cos)+Math.abs(sin));
     	break;
    	case "j":
    	    var angle=radians(azimuth_cam_angle);
    		var cos=Math.cos(angle);
    		var sin=Math.sin(angle); 
			
			 
			cam_x+=0.25*(cos)/(Math.abs(cos)+Math.abs(sin));
			cam_z+=0.25*(sin)/(Math.abs(cos)+Math.abs(sin));
      	break;
		case "k":
    	    var angle=radians(azimuth_cam_angle);
    		var cos=Math.cos(angle);
    		var sin=Math.sin(angle); 
			
			cam_x-=0.25*(cos)/(Math.abs(cos)+Math.abs(sin));
			cam_z-=0.25*(sin)/(Math.abs(cos)+Math.abs(sin));

     	break;
    	case "m":
    		var angle=radians(azimuth_cam_angle);
  			var cos=Math.cos(angle);
  			var sin=Math.sin(angle); 

			cam_x+=0.25*(sin)/(Math.abs(cos)+Math.abs(sin)); 
			cam_z-=0.25*(cos)/(Math.abs(cos)+Math.abs(sin));
      	break;

      	case "r":
      		//reset to the start position
      		azimuth_cam_angle=0; 
			cam_x=0;
			cam_y=0;
			cam_z=-30; 
      	break;

/*
The n and w keys should adjust the horizontal field of view (FOV) narrower or wider. 
One (1) degree per key press. Keep the display of your scene square as the FOV changes - 5 points.
*/
		case "n":
		field_of_view-=1;
		break;
		case "w":
		field_of_view+=1; 
		break;

/*
The + key should toggle the display of an orthographic projection of a cross hair centered over your scene. 
The cross hairs themselves can be a simple set of lines rendered in white */
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


function initializeCube()
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

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );


    }
}

function setColors(colorID)
{
    var vertexColors = [
        [ 0.5, 0.25, 1.0, 1.0 ], // salmon 
        [ 1.0, 0.5, 0.5, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 0.5, 0.5, 0.5, 1.0 ]   // gray
    ];
	
	
    for ( var i = 0; i < 36; i++ ){
    		
        colors[i]=vertexColors[colorID%8]; 
	}

}

function setWhite()
{
	for(var i=0; i<36; i++){
		colors[i]=[1.0, 1.0, 1.0, 1.0]; 
	}
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //camera transform
    var camera=mat4(); 
    
    


    //zoom out so you can see all the cubes
    camera=mult(camera, scalem(.5,.5,.5));

    //multiply by perspective matrix. Use 45 as the initial field of view parameter, small zNear, big zFar.
	camera=mult(camera, perspective(field_of_view, 1, -11, 11));
	
    //Rotate the camera angle
    var rotation_matrix = rotate(azimuth_cam_angle, 0, 1, 0);
    camera = mult(camera, rotation_matrix); 

	
    //Moves the camera up and down the axes
    camera = mult(camera, translate(cam_x, cam_y, cam_z));

	
	gl.uniformMatrix4fv( camera_transform_loc, false, flatten( camera ) );    // # Fill in GPU's camera transform

	
    gl.uniformMatrix4fv(camera_transform_loc, false, flatten(camera)); 

    //generate a model view matrix to look at the cubes from along the Z-axis

/*
bindBuffer
bufferData -- will eventually need gl.DYNAMIC_DRAW
gl.uniformMat

*/



    //Draw all 8 cubes. 1 in args represents positive position relative to the axis, -1 represents negative. 
    drawcube(1, 1, 1, numColorCycles);
    drawcube(1, 1, -1, numColorCycles+1);
    drawcube(1, -1, 1, numColorCycles+2);
    drawcube(-1, 1, 1, numColorCycles+3);
    drawcube(1, -1, -1, numColorCycles+4);
    drawcube(-1, 1, -1, numColorCycles+5);
    drawcube(-1, -1, 1, numColorCycles+6);
    drawcube(-1, -1, -1, numColorCycles+7);


	//draw boundary lines around the 8 cubes. 
	drawlines(1, 1, 1);
	

    if(render_crosshair){
    	//render the crosshair:

    }

    requestAnimFrame( render );
}

function drawcube(x, y, z, colorID){
	var mv_transform = mat4();
	//moves cube to its destination. 
	mv_transform=mult(mv_transform, translate(dist*x, dist*y, dist*z));

	//color the cubes
	setColors(colorID); 

	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW); 
    gl.uniformMatrix4fv( model_transform_loc, false, flatten(mv_transform /* mat4()*/));    //Fill in GPU's model transform with the set matrix
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


}

//outline the cube edges in white to make them visible
function drawlines(x, y, z){


	//make the boundary lines white
	setWhite(); 

	//move the cube edges to the same places as the cubes
	var mv_transform=mat4(); 
	mv_transform=mult(mv_transform, translate(dist*x, dist*y, dist*z)); 

	gl.drawArrays(gl.LINES, 0, NumVertices)	

}