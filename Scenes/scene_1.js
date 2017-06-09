var WIDTH, HEIGHT, INIT, CLOCK
var container, renderer, scene

var VIEW_ANGLE, ASPECT, NEAR, FAR, CAMERA, cam_cam

var DIR_LIGHT

var mouse_x, mouse_y

var deltaTime = 0

init()

var cube = null
var created_cube = setInterval(function(){
	if(INIT.flags["IS_COMPLETE"]){
		cube = new Cube(scene)
		scene.add(cube.Obj)
		clearInterval(created_cube)
	}
	}, 10)

requestAnimationFrame(update)

//Events
$(window).on('resize', onWindowResize)

$(document).mousedown(function(){onClick()})


function update() {
	deltaTime = CLOCK.getDelta();

	renderer.render(scene, cam_cam.camera)
	requestAnimationFrame(update)
}

function init(){
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

	//Create a camera and add it to the scene
	VIEW_ANGLE = 45 //Viewing angle for the perspective camera
	ASPECT = WIDTH / HEIGHT //Aspect ratio dimensions for the camera
	NEAR = 0.1 //The near clipping plane
	FAR = 10000 //The far clipping plane

	CAMERA = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
	CAMERA.position.z = 10
	CAMERA.lookAt(new THREE.Vector3(0, 0, 0))
	cam_cam = new Camera_Handler(CAMERA)

	scene.add(cam_cam.camera)

	//Start up that renderer
	renderer.setSize(WIDTH, HEIGHT)

	container.append(renderer.domElement)

	//Set up a directional light and add it to the scene
	DIR_LIGHT = new THREE.DirectionalLight(0xFFFFFF, 0.5)

	scene.add(DIR_LIGHT)

	gridHelper = new THREE.GridHelper(100, 10)
	scene.add(gridHelper)
}

function onWindowResize(){
	cam_cam.camera.aspect = window.innerWidth/ window.innerHeight
	cam_cam.camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
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