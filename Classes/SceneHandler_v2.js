function SceneHandler(bg_color = 0xFFFFE6){

	this.background_color = new THREE.Color(bg_color)
	this.defaultScene
	this.defaultPickingScene
	this.active_scene
	this.active_picking_scene
	this.CAMERA

	this.view_scenes = {}
	this.picking_scenes = {}

	var renderer

	var Controls

	var that = this

	initScene()

	this.Pick = function(scene_name, mouse_position, color_container = null){

		//console.log("Drawing the picking scene: " + this.active_picking_scene.name)
		renderer.render(this.picking_scenes[scene_name], this.CAMERA, picking_texture)
		return GetPixelColor(mouse_position, color_container)
	}


	this.SetViewportOffset = function(x, y){
		viewportOffset_x = x
		viewportOffset_y = y

		picking_texture.setSize(window.innerWidth, window.innerHeight)
	}

	this.ClearDepthBuffer = function(){
		renderer.clearDepth()
	}


	this.Draw = function(scene_name) {
		renderer.render(this.view_scenes[scene_name], that.CAMERA)
	}


	function initScene(){
		let WIDTH = window.innerWidth;
		let HEIGHT = window.innerHeight;
		picking_texture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
		picking_texture.texture.minFilter = THREE.LinearFilter 

		//Flags
		let CLOCK = new THREE.Clock(true)

		//Get some DOM elements that we're going to need to use
		let container = $("#container")

		//Create a renderer
		renderer = new THREE.WebGLRenderer()

		//Start up that renderer
		renderer.setSize(WIDTH, HEIGHT)
		renderer.domElement.id = 'canvas'
		renderer.setClearColor(that.background_color.getHex(), 1)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.sortObjects = true

		container.append(renderer.domElement)

		//Create a camera and add it to the scene
		let VIEW_ANGLE = 45 //Viewing angle for the perspective camera
		let ASPECT = WIDTH / HEIGHT //Aspect ratio dimensions for the camera
		let NEAR = 0.1 //The near clipping plane
		let FAR = 10000 //The far clipping plane

		that.CAMERA = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
		that.CAMERA.position.z = 10
		that.CAMERA.position.y = 10
		that.CAMERA.position.x = -10

		let Controls = new THREE.OrbitControls(that.CAMERA, renderer.domElement)

		//Events
		$(window).on('resize', onWindowResize)
	}

	function onWindowResize(){
		that.CAMERA.aspect = window.innerWidth/ window.innerHeight
		that.CAMERA.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.setPixelRatio(window.devicePixelRatio)
		picking_texture.setSize(window.innerWidth, window.innerHeight)
	}

	//Uses a simple color buffer draw trick to decide where the client is clicking
	function GetPixelColor(mouse_position, color_container = null){
		var pixelBuffer = new Uint8Array(4)

		renderer.readRenderTargetPixels(picking_texture, mouse_position.x + 0, 
			picking_texture.height - (mouse_position.y + 0), 1, 1, pixelBuffer)

		var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2])

		//Change an id variable by reference
		if(color_container != null)
			color_container['id'] = id

		//Return the id
		return id
	}
}

function PreviewHandler(bg_color = 0xFFFFE6, container, polycube){

	var myScene = null
	var background_color = bg_color
	var myContainer = container
	var renderer = null
	var orbiter = null
	var camera = null
	var myPolycube = polycube
	var current_context = null

	var that = this

	initScene()

	function initScene(){
		//Get some DOM elements that we're going to need to use
		WIDTH = 0
		HEIGHT = 0

		//Create a renderer
		renderer = new THREE.WebGLRenderer()

		//Create a scene
		defaultScene = new THREE.Scene()

		//Start up that renderer
		renderer.setSize(WIDTH, HEIGHT)
		renderer.domElement.id = polycube.name + "_renderer"
		renderer.setClearColor(background_color.getHex(), 1)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.sortObjects = true

		//$("#container").append(renderer.domElement)

		//Create a camera and add it to the scene
		VIEW_ANGLE = 45 //Viewing angle for the perspective camera
		ASPECT = WIDTH / HEIGHT //Aspect ratio dimensions for the camera
		NEAR = 0.1 //The near clipping plane
		FAR = 10000 //The far clipping plane

		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
		camera.position.z = 10
		camera.position.y = 10
		camera.position.x = -10

		orbiter = new THREE.OrbitControls(camera, renderer.domElement)
		orbiter.autoRotate = true

		//Create the scene, add a grid, add the polycube
		myScene = new THREE.Scene()

		let grid = GenerateGrid(20, 2, 0x000000)
		grid.position.y = -1
		grid.add(new THREE.AxisHelper(50))

		myScene.add(grid)
		myScene.add(myPolycube)

		console.log("my scene")
		console.log(myScene)

	}

	function CalculateCameraPosition(polycube){

		

	}

	this.Draw = function(){
		
		orbiter.update()
		renderer.render(myScene, camera)

	}

	this.AttachToContext = function(context){

		current_context = context

		camera.aspect = current_context.parent().width()/ (current_context.parent().height() * 2)
		camera.updateProjectionMatrix()

		renderer.setSize(current_context.parent().width(), current_context.parent().height() * 2)

		context.append(renderer.domElement)


		this.Draw()
	}

	this.GetRenderer = function(){

		return renderer

	}

	this.GetPolyCube = function(){

		return myScene.children[1]

	}
}