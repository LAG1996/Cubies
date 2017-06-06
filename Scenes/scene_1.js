const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;


const CLOCK = new THREE.Clock(true)

//Get some DOM elements that we're going to need to use
var container = $("#container")

//Create a renderer
var renderer = new THREE.WebGLRenderer()

//Create a scene
var scene = new THREE.Scene()

//Create a camera and add it to the scene
const VIEW_ANGLE = 45 //Viewing angle for the perspective camera
const ASPECT = WIDTH / HEIGHT //Aspect ratio dimensions for the camera
const NEAR = 0.1 //The near clipping plane
const FAR = 10000 //The far clipping plane

var cam_cam = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)

scene.add(cam_cam)

//Start up that renderer
renderer.setSize(WIDTH, HEIGHT)

container.append(renderer.domElement)

//Set up a directional light and add it to the scene
const DIR_LIGHT = new THREE.DirectionalLight(0xFFFFFF, 0.5)

scene.add(DIR_LIGHT)

//Create the mesh for a cube
//Set up the verticies

var cube = new Cube(scene)
cube.Obj.position.z = -10


scene.add(cube.Obj)

function update() {

	var deltaTime = CLOCK.getDelta();

	if(typeof cube.Obj != "undefined" && cube.Obj != null)
	{
		cube.Obj.rotation.x += 2 * deltaTime
		cube.Obj.rotation.y += 2* deltaTime
	}

	renderer.render(scene, cam_cam)
	requestAnimationFrame(update)
}

requestAnimationFrame(update)