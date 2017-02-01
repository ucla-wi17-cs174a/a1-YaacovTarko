"use strict";
var gl;

//just some global variables from the TA's sample code
var canvas;
var gl;

var NumVertices  = 36;
var NumLineVertices=24; 
var NumCrosshairVertices=4; 

//stores the point locations and color data for cube faces
var points = [];
var colors = [];

//stores the point locations and color data for cube edges
var edgepoints=[];
var edgecolors=[];

//stores the point locations and color data for crosshair 
var crosshairpoints=[];
var crosshaircolors=[]; 

var dist=10; //distance of the cubes from the origin along EACH axis 

var cBuffer; 
var vBuffer; 

var model_transform_loc;     
var camera_transform_loc;     


//for key-press options

var field_of_view=45;    //default fov, changes with w and n
var numColorCycles=0;    //each press of c will increment this variable, causing the color to cycle
var azimuth_cam_angle=0;  //changes with left and right arrow keys
var cam_x=0; //y changes with up and down arrow keys. x and z change with i, j, k, and m 			
var cam_y=0;
var cam_z=-30; 

//to render the crosshair
var render_crosshair=false;  //flips when + is pressed to indicate whether crosshair should be rendered



//creates a rotation matrix using quaternions
function quaternion_rotate(angle, x, y, z)
{
    var axis=vec4(x, y, z);
    normalize(axis);

    angle=radians(angle);
    //generate the quaternion
    var a=Math.cos(angle/2);
    var b=axis[0]*Math.sin(angle/2);
    var c=axis[1]*Math.sin(angle/2);
    var d=axis[2]*Math.sin(angle/2);

    var quaternion = vec4(a, b, c, d);
    normalize(quaternion); 

    var w = quaternion[0];
    var x = quaternion[1];
    var y = quaternion[2];
    var z = quaternion[3];

	//create the rotation matrix based on the quaternion
    var result = mat4(
        vec4(1-2*(y*y + z*z), 2*(x*y-w*z), 2*(x*z+w*y), 0),
        vec4(2*(x*y + w*z), 1-2*(x*x+z*z), 2*(y*z-w*x), 0),
        vec4(2*(x*z-w*y), 2*(y*z+w*x), 1-2*(x*x+y*y), 0),
        vec4(0, 0, 0, 1)
    );

    return result;
}


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


	//create the faces of the cube at the origin that will be translated to the proper locations
   	initializeCube();

   	//create the outline of the cube at the origin that will be translated to the proper locations
   	initializeOutline(); 

   	//create the crosshair at the origin that will be translated to the proper location
   	initializeCrosshair(); 

   	//Since the colors of the outline and the crosshair won't change, it only has to be set once: 
   	setWhite(); 

   	
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
    vBuffer  = gl.createBuffer();
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

function initializeOutline(){
	//Each pair of vertices in ths array represents a line between two vertices of the unit cube
	edgepoints=[
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
 	vec4(0.5, -0.5, -0.5), vec4(-0.5, -0.5, -0.5)
	]; 

}

function initializeCrosshair(){
	//each pair of vertices in this array represents a line of the crosshair
	crosshairpoints=[
	vec4(0.1, 0, 0), vec4(-0.1, 0, 0),
	vec4(0, 0.1, 0), vec4(0, -0.1, 0)
	]
}

function setColors(colorID)
{
    var vertexColors = [
        [ 0.5, 0.25, 1.0, 1.0 ], // salmon 
        [ 1.0, 0.5, 0.5, 1.0 ],  // red
        [ 0.6, 0.6, 0.0, 1.0 ],  // yellow
        [ 0.0, 0.8, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 0.8, 0.8, 1.0 ],  // cyan
        [ 0.5, 0.5, 0.5, 1.0 ]   // gray
    ];
	
	
    for ( var i = 0; i < NumVertices; i++ ){
    		
        colors[i]=vertexColors[colorID%8]; 
	}

}

function setWhite()
{
	for(var i=0; i<NumLineVertices; i++){
		edgecolors[i]=[1.0, 1.0, 1.0, 1.0]; 
	}

	for(var i=0; i<NumCrosshairVertices; i++){
		crosshaircolors[i]=[1.0, 1.0, 1.0, 1.0];
	}
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //camera transform
    var camera=mat4(); 
    
    

    //make everything smaller so you can see the cubes
    camera=mult(camera, scalem(.5,.5,.5));


    //multiply by perspective matrix. Use 45 as the initial field of view parameter, small zNear, big zFar.
	camera=mult(camera, perspective(field_of_view, 1, -11, 11));


    //Rotate the camera angle
    var rotation_matrix = quaternion_rotate(azimuth_cam_angle, 0, 1, 0);
	camera = mult(camera, rotation_matrix); 

	
    //Moves the camera up and down the axes
    camera = mult(camera, translate(cam_x, cam_y, cam_z));

	
	gl.uniformMatrix4fv( camera_transform_loc, false, flatten( camera ) );    // # Fill in GPU's camera transform

	
//    gl.uniformMatrix4fv(camera_transform_loc, false, flatten(camera)); 



    //Draw all 8 cubes. 1 in args represents positive position relative to the axis, -1 represents negative. 
    drawcube(1, 1, 1, numColorCycles);
    drawcube(1, 1, -1, numColorCycles+1);
    drawcube(1, -1, 1, numColorCycles+2);
    drawcube(-1, 1, 1, numColorCycles+3);
    drawcube(1, -1, -1, numColorCycles+4);
    drawcube(-1, 1, -1, numColorCycles+5);
    drawcube(-1, -1, 1, numColorCycles+6);
    drawcube(-1, -1, -1, numColorCycles+7);


    //rebind the buffers to the cube edge data
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );


	//draw boundary lines around the 8 cubes. 
	drawlines(1, 1, 1);
	drawlines(1, 1, -1);
	drawlines(1, -1, 1);
	drawlines(1, -1, -1); 
	drawlines(-1, 1, 1);
	drawlines(-1, 1, -1);
	drawlines(-1, -1, 1);
	drawlines(-1, -1, -1); 
	

    if(render_crosshair){
    	//render the crosshair:
    	drawcrosshair(); 

    }

    requestAnimFrame( render );
}

function drawcube(x, y, z, colorID){
	var mv_transform = mat4();
	//moves cube to its destination. 
	mv_transform=mult(mv_transform, translate(dist*x, dist*y, dist*z));

	//color the cubes
	setColors(colorID); 

	//bind the vertex and color buffers to the cube face data
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW); 
    gl.uniformMatrix4fv( model_transform_loc, false, flatten(mv_transform));    //Fill in GPU's model transform with the set matrix
	
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

//outline the cube edges in white to make them visible
function drawlines(x, y, z){

	//move the cube edges to the same places as the cubes
	var mv_transform=mat4(); 
	mv_transform=mult(mv_transform, translate(dist*x, dist*y, dist*z)); 


	//bind the vertex and color buffers to the cube edge data
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(edgecolors), gl.STATIC_DRAW);
	gl.uniformMatrix4fv(model_transform_loc, false, flatten(mv_transform)); 

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(edgepoints), gl.STATIC_DRAW );


	gl.drawArrays(gl.LINES, 0, NumLineVertices)	

}

function drawcrosshair(){
	var distance=0.2; //distance from the front of the camera to the crosshair

	//since it's an orthographic projection, the camera and model-view transforms aren't needed, so we'll reset them to the identity matrix
	var id_matrix=mat4(); 

	gl.uniformMatrix4fv(model_transform_loc, false, flatten(id_matrix)); 
	gl.uniformMatrix4fv( camera_transform_loc, false, flatten( id_matrix ) );


	var angle=-azimuth_cam_angle; //since the entire scene is scaled by .5, the angle must be multiplied by 2

	//rotate the crosshair so that it's facing the same direction as the camera.
//	mv_transform=mult(mv_transform, rotate(angle, 0, 1, 0));
	
//move the crosshair so that it's directly in front of the camera
//azimuthal position in the x-z plane should be a constant distance in front of the camera, determined with trigonometry 

	var crosshair_y=-cam_y;
	var crosshair_x=cam_x+distance*2* (Math.sin(angle) / (Math.sin(angle)+Math.cos(angle)) );
	var crosshair_z=cam_z+distance*2* (Math.cos(angle) / (Math.sin(angle)+Math.cos(angle)) );
//	mv_transform=mult(mv_transform, translate(crosshair_x, crosshair_y, crosshair_z));

	//bind the vertex and color buffers to the crosshair data
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(crosshaircolors), gl.STATIC_DRAW);

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(crosshairpoints), gl.STATIC_DRAW );

    gl.drawArrays(gl.LINES, 0, NumCrosshairVertices); 
	
}