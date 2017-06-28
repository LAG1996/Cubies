function SceneHandler(){
	var WIDTH, HEIGHT, INIT, CLOCK
	var container, renderer, scene, picking_scene

	var VIEW_ANGLE, ASPECT, NEAR, FAR, CAMERA, cam_cam

	var DIR_LIGHT

	var mouse_x, mouse_y

	var Controls

	var deltaTime = 0

	requestAnimationFrame(update)

	this.RequestAddToScene = function(object){
		if(object.isObject && ObjectExists(object)){
			AddToScene(object)
		}
	}

	this.AddToPickingScene = function(object){
		if(object.isObject && ObjectExists(object)){
			AddToScene(object)
		}
	}

	var AddToScene = function(object){
		scene.add(object)
	}

	var AddToPickingScene = function(object){
		picking_scene.add(object)
	}

	var initScene = function(){
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

	var onWindowResize = function(){
		cam_cam.camera.aspect = window.innerWidth/ window.innerHeight
		cam_cam.camera.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
	}

	var onScroll = function(e, delta){
		event.preventDefault()
		cam_cam.HandleZoom(event.wheelDelta, deltaTime)
	}

	var onClick = function(){
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

	var onLeftClick = function(){
		cam_cam.HandlePan(event.pageX - mouse_x, event.pageY - mouse_y, deltaTime)

		mouse_x = event.pageX
		mouse_y = event.pageY
	}

	var onMiddleClick = function(){
		cam_cam.HandleRotate(event.pageX - mouse_x, event.pageY - mouse_y, deltaTime)

		mouse_x = event.pageX
		mouse_y = event.pageY
	}

	var onMouseUp = function(){
		$(document).off("mousemove")
	}

	var update = function() {
		deltaTime = CLOCK.getDelta();
		renderer.render(scene, cam_cam.camera)
		requestAnimationFrame(update)
	}
}
