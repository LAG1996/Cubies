function SceneHandler(bg_color = 0xFFFFE6){

	this.background_color = new THREE.Color(bg_color)
	this.defaultScene
	this.defaultPickingScene
	this.active_scene
	this.active_picking_scene

	var active = true

	var update_functions = {}

	var viewportOffset_x = 0
	var viewportOffset_y = 0

	var WIDTH, HEIGHT, INIT, CLOCK, CAMERA
	var container, renderer, picking_texture


	var mouse_pos = new THREE.Vector2()

	var VIEW_ANGLE, ASPECT, NEAR, FAR, CAMERA, cam_cam

	var DIR_LIGHT

	var mouse_x, mouse_y

	var Controls

	var deltaTime = 0

	var that = this

	initScene()
	requestAnimationFrame(update)

	this.AddUpdateFunction = function(func_name, func){
		update_functions[func_name] = func
	}

	this.RequestAddToScene = function(object){

		if(ObjectExists(object) && object.isObject3D){
			this.active_scene.add(object)
			return true
		}
		
		return false
	}

	this.RequestRemoveFromScene = function(object){
		if(ObjectExists(object) && object.isObject3D){
			this.active_scene.remove(object)
			return true
		}
		return false
	}

	this.RequestAddToPickingScene = function(object){
		if(ObjectExists(object) && object.isObject3D){
			this.active_picking_scene.add(object)
			return true
		}
		return false
	}

	this.RequestSwitchToScene = function(scene)
	{
		if(ObjectExists(scene))
		{
			this.active_scene = scene
			return true
		}

		return false
	}

	this.RequestSwitchToPickingScene = function(scene)
	{
		if(ObjectExists(scene))
		{
			this.active_picking_scene = scene
			return true
		}

		return false
	}

	this.MakeDefaultSceneToPickingScene = function()
	{
		this.RequestSwitchToPickingScene(this.active_scene)
	}

	this.SwitchToDefaultScene = function()
	{
		this.active_scene = this.defaultScene
	}

	this.SwitchToDefaultPickingScene = function()
	{
		this.active_picking_scene = this.defaultPickingScene
	}

	this.GetMousePos = function(){
		return mouse_pos
	}

	this.Pick = function(id_object = null){

		renderer.render(this.active_picking_scene, CAMERA, picking_texture)
		return GetPixelColor(id_object)
	}


	this.SetViewportOffset = function(x, y){
		viewportOffset_x = x
		viewportOffset_y = y

		picking_texture.setSize(window.innerWidth, window.innerHeight)
	}

	this.ToggleActive = function(){
		active = !active
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
		that.defaultScene = new THREE.Scene()
		that.defaultPickingScene = new THREE.Scene()

		that.active_scene = that.defaultScene
		that.active_picking_scene = that.defaultPickingScene

		//Start up that renderer
		renderer.setSize(WIDTH, HEIGHT)
		renderer.domElement.id = 'canvas'
		renderer.setClearColor(that.background_color.getHex(), 1)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.sortObjects = true

		container.append(renderer.domElement)

		//Set up a directional light and add it to the scene
		DIR_LIGHT = new THREE.DirectionalLight(0xFFFFFF, 0.5)

		that.defaultScene.add(DIR_LIGHT)

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

		$('canvas').on('mousemove', onMouseMove)
	}

	function onWindowResize(){
		CAMERA.aspect = window.innerWidth/ window.innerHeight
		CAMERA.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.setPixelRatio(window.devicePixelRatio)
		picking_texture.setSize(window.innerWidth, window.innerHeight)
	}

	function onMouseMove(event){
		mouse_pos.x = event.clientX
		mouse_pos.y = event.clientY
	}

	function update() {

		if(active)
		{
			requestAnimationFrame(update)
		
			DoUpdateFunctions()
			
			deltaTime = CLOCK.getDelta();
			renderer.render(that.active_scene, CAMERA)
		}

	}

	function DoUpdateFunctions(){

		for(var funcName in update_functions)
		{
			try{
				update_functions[funcName]()
			}
			catch(err){
				throw funcName + ": " + err
			}
		}
	}

	//Uses a simple color buffer draw trick to decide where the client is clicking
	function GetPixelColor(id_object = null){
		var pixelBuffer = new Uint8Array(4)

		renderer.readRenderTargetPixels(picking_texture, mouse_pos.x + viewportOffset_x, 
			picking_texture.height - (mouse_pos.y + viewportOffset_y), 1, 1, pixelBuffer)

		var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2])

		//Change an id variable by reference
		if(id_object != null)
			id_object['id'] = id

		//Return the id
		return id
	}
}
