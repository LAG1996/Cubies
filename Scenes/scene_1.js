var WIDTH, HEIGHT, INIT, CLOCK
var container, renderer, scene

var VIEW_ANGLE, ASPECT, NEAR, FAR, CAMERA, cam_cam

var DIR_LIGHT

var mouse_x, mouse_y

var Controls

var deltaTime = 0

initScene()

var toolbarHandler = new Toolbar_Handler()
toolbarHandler.Switch_Context_H('poly-view')

/*
//Some example cubes
var cube = null
var created_cube = setInterval(function(){
	if(INIT.flags["IS_COMPLETE"]){
		cube = new Cube(scene)
		scene.add(cube.Obj)
		clearInterval(created_cube)
	}
	}, 10)


var cube_2 = null
var created_cube_2 = setInterval(function(){
	if(INIT.flags["IS_COMPLETE"]){
		cube_2 = new Cube(scene)
		cube_2.Obj.position.x = 2
		console.log(cube_2)
		scene.add(cube_2.Obj)
		clearInterval(created_cube_2)
	}
	}, 10)

var cube_3 = null
var created_cube_3 = setInterval(function(){
	if(INIT.flags["IS_COMPLETE"]){
		cube_3 = new Cube(scene)
		cube_3.Obj.position.x = 2
		cube_3.Obj.position.y = 2.127
		console.log(cube_3)
		scene.add(cube_3.Obj)
		clearInterval(created_cube_3)
	}
	}, 10)

var cube_4 = null
var created_cube_4 = setInterval(function(){
	if(INIT.flags["IS_COMPLETE"]){
		cube_4 = new Cube(scene)
		cube_4.Obj.position.x = 2
		cube_4.Obj.position.z = 2
		cube_4.Obj.position.y = 2.127
		console.log(cube_4)
		scene.add(cube_4.Obj)
		clearInterval(created_cube_4)
	}
	}, 10)
*/

requestAnimationFrame(update)


function update() {
	deltaTime = CLOCK.getDelta();
	renderer.render(scene, cam_cam.camera)
	requestAnimationFrame(update)
}

function initScene(){
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	//Flags
	INIT = new Initialize()

	CLOCK = new THREE.Clock(true)

	//Get some DOM elements that we're going to need to use
	container = $("#container")

	//Create a renderer
	renderer = new THREE.WebGLRenderer()

	//Create a scene
	scene = new THREE.Scene()

	//Start up that renderer
	renderer.setSize(WIDTH, HEIGHT)
	renderer.domElement.id = 'canvas'
	renderer.setClearColor(0xFFFFE6, 1)

	container.append(renderer.domElement)

	//Set up a directional light and add it to the scene
	DIR_LIGHT = new THREE.DirectionalLight(0xFFFFFF, 0.5)

	scene.add(DIR_LIGHT)

	gridHelper = new THREE.GridHelper(1000, 500, 0x0000FF, 0x020202)
	gridHelper.position.y = -1
	gridHelper.position.x = -1
	gridHelper.position.z = -1
	scene.add(gridHelper)

	//Create a camera and add it to the scene
	VIEW_ANGLE = 45 //Viewing angle for the perspective camera
	ASPECT = WIDTH / HEIGHT //Aspect ratio dimensions for the camera
	NEAR = 0.1 //The near clipping plane
	FAR = 10000 //The far clipping plane

	CAMERA = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
	CAMERA.position.z = 10
	CAMERA.position.y = 10
	CAMERA.position.x = -10
	CAMERA.lookAt(gridHelper.position)
	cam_cam = new Camera_Handler(CAMERA, renderer)

	scene.add(cam_cam.camera)

	//Events
	$(window).on('resize', onWindowResize)

	$('#canvas').mousedown(function(){onClick()})
	$('#canvas').on('mousewheel', function(e, delta){onScroll(e, delta)})
}

function onWindowResize(){
	cam_cam.camera.aspect = window.innerWidth/ window.innerHeight
	cam_cam.camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function onScroll(e, delta){
	event.preventDefault()
	cam_cam.HandleZoom(event.wheelDelta, deltaTime)
}

function onClick(){
	event.preventDefault()
	mouse_x = event.pageX
	mouse_y = event.pageY

	if(event.button == 0)
	{
		$(document).mousemove(function(){onLeftClick()})
	}
	else if(event.button == 1)
	{
		$(document).mousemove(function(){onMiddleClick()})
	}

	$(document).mouseup(function(){onMouseUp()})
}

function onLeftClick(){
	cam_cam.HandlePan(event.pageX - mouse_x, event.pageY - mouse_y, deltaTime)

	mouse_x = event.pageX
	mouse_y = event.pageY
}

function onMiddleClick(){
	cam_cam.HandleRotate(event.pageX - mouse_x, event.pageY - mouse_y, deltaTime)

	mouse_x = event.pageX
	mouse_y = event.pageY
}

function onMouseUp(){
	$(document).off("mousemove")
}