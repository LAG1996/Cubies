function SceneHandler(bg_color = 0xFFFFE6){

	this.background_color = new THREE.Color(bg_color)
	this.view_scenes = {}
	this.picking_scenes = {}

	var CAMERA
	var raycaster
	var pick_plane

	var renderer

	var Controls

	var that = this

	initScene()

	this.Pick = function(scene_name, mouse_position, color_container = null){

		renderer.render(this.picking_scenes[scene_name], CAMERA, picking_texture)
		return GetPixelColor(mouse_position, color_container)
	}

	this.VoxelPick = function(mouse_position){

		raycaster.setFromCamera(mouse_position, CAMERA)

		let intersections = raycaster.intersectObject( pick_plane )
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
		renderer.render(this.view_scenes[scene_name], CAMERA)
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

		CAMERA = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
		CAMERA.position.z = 10
		CAMERA.position.y = 10
		CAMERA.position.x = -10

		let Controls = new THREE.OrbitControls(CAMERA, renderer.domElement)

		//Create the main viewing scene that the user will see
		that.view_scenes["main"] = new THREE.Scene()

		//Add a grid to the default scene
		let grid = new THREE.GridHelper(1000, 1000)
		grid.position.y = -1
		grid.add(new THREE.AxisHelper(50))
		that.view_scenes["main"].add(grid)

		let plane_geo = new THREE.PlaneBufferGeometry(1000, 1000, 1, 1)
		plane_geo.rotateX( -Math.PI/2 )

		pick_plane = new THREE.Mesh( plane_geo, new THREE.MeshBasicMaterial( { visible: false } ) )
		pick_plane.position.y = -1
		pick_plane.name = "picking plane"
		that.view_scenes["main"].add( pick_plane )

		raycaster = new THREE.Raycaster()

		//Events
		$(window).on('resize', onWindowResize)
	}

	function onWindowResize(){
		CAMERA.aspect = window.innerWidth/ window.innerHeight
		CAMERA.updateProjectionMatrix()

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
