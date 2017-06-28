function SceneHandler(){
	var WIDTH, HEIGHT, INIT, CLOCK, CAMERA
	var container, renderer, picking_texture


	var defaultScene
	var defaultPickingScene
	var active_scene
	var active_picking_scene

	var VIEW_ANGLE, ASPECT, NEAR, FAR, CAMERA, cam_cam

	var DIR_LIGHT

	var mouse_x, mouse_y

	var Controls

	var deltaTime = 0

	var that = this

	initScene()
	requestAnimationFrame(update)

	this.RequestAddToScene = function(object){
		if(object.isObject3D && ObjectExists(object)){
			defaultScene.add(object)
		}
	}

	this.RequestAddToPickingScene = function(object){
		if(object.isObject3D && ObjectExists(object)){
			defaultPickingScene.add(object)
		}
	}

	this.RequestSwitchToScene = function(scene)
	{
		if(ObjectExists(scene))
		{
			active_scene = scene
		}
	}

	this.RequestSwitchToPickingScene = function(scene)
	{
		if(ObjectExists(scene))
		{
			active_scene = scene
		}
	}


	this.SetEvent = function(eventtype, element, func){
		$(element).on(eventtype, func)
	}

	function initScene(){
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		picking_texture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
		picking_texture.texture.minFilter = THREE.LinearFilter 

		//Flags
		CLOCK = new THREE.Clock(true)

		//Get some DOM elements that we're going to need to use
		container = $("#container")

		//Create a renderer
		renderer = new THREE.WebGLRenderer()

		//Create a scene
		defaultScene = new THREE.Scene()
		defaultPickingScene = new THREE.Scene()

		active_scene = defaultScene
		active_picking_scene = defaultPickingScene

		//Start up that renderer
		renderer.setSize(WIDTH, HEIGHT)
		renderer.domElement.id = 'canvas'
		renderer.setClearColor(0xFFFFE6, 1)

		container.append(renderer.domElement)

		//Set up a directional light and add it to the scene
		DIR_LIGHT = new THREE.DirectionalLight(0xFFFFFF, 0.5)

		defaultScene.add(DIR_LIGHT)

		//Create a camera and add it to the scene
		VIEW_ANGLE = 45 //Viewing angle for the perspective camera
		ASPECT = WIDTH / HEIGHT //Aspect ratio dimensions for the camera
		NEAR = 0.1 //The near clipping plane
		FAR = 10000 //The far clipping plane

		CAMERA = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
		CAMERA.position.z = 10
		CAMERA.position.y = 10
		CAMERA.position.x = -10

		Controls = new THREE.OrbitControls(CAMERA, renderer.domElement)

		//Events
		$(window).on('resize', onWindowResize)
		console.log($(window))
	}

	function onWindowResize(){
		cam_cam.camera.aspect = window.innerWidth/ window.innerHeight
		cam_cam.camera.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
		picking_texture.setSize(window.innerWidth, window.innerHeight)
	}

	function update() {
		deltaTime = CLOCK.getDelta();
		renderer.render(active_picking_scene, CAMERA, picking_texture)
		renderer.render(active_scene, CAMERA)
		requestAnimationFrame(update)
	}
}
