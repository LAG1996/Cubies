//Class representing the scene handler.
//This class handles the logic pertaining to drawing the editor scenes (including picking scenes)
//We use the ES5 approach to creating classes since we only intend to use one instance of this class.
const SceneHandler = function(bgColor = 0xffffe6){
	//private variables
	let _bgColor = new THREE.Color(bgColor);
	const _pickingScenes = new Map();
	const _pickingTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
	_pickingTexture.texture.minFilter = THREE.LinearFilter;

	//set the renderer and child it to the main canvas
	const _renderer = new THREE.WebGLRenderer();
	_renderer.setSize(window.innerWidth, window.innerHeight);
	_renderer.setClearColor(_bgColor.getHex(), 1);
	_renderer.setPixelRatio(window.devicePixelRatio);
	$("#main-canvas").append(_renderer.domElement);

	//Set the camera to have
	/*
		-view angle of 45
		-aspect ratio of the window's width over the window's height
		-a near clipping plane that is 0.1f units away from the screen
		-a far clipping plane that is 1000 units away from the screen
	*/
	const _camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
	_camera.position.z = -10;
	_camera.position.y = 10;
	_camera.position.x = 10;
	_camera.lookAt(0, 0, 0);
	const cameraControls = new THREE.OrbitControls(_camera, _renderer.domElement);
	

	//Set the main scene. Add a grid to the scene.
	const _mainScene = new THREE.Scene();
	{
		const grid = new THREE.GridHelper(10, 5, 0x000000);
		grid.position.y = -1;
		_mainScene.add(grid);
	}

	//public variables


	this.setBackgroundColor = function(color){
		_bgColor.set(color);
	}

	/*
		This draws the chosen picking scene, which is just the scene the user sees, but
		with special colors that help identify what the user is clicking. 
	*/
	this.pick = function(sceneName, mousePosition){
		_renderer.render(_pickingScenes.get(sceneName), _camera, _pickingTexture);

		let pixelBuffer = new Uint8Array(4);

		_renderer.readRenderTargetPixels(_pickingTexture, mousePos.x = 0,
			pickingTexture.height - (mousePosition.y + 0), 1, 1, pixelBuffer);

		var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBUffer[2];

		return id;
	}

	//This function draws the scene
	this.draw = function(){
		_renderer.render(_mainScene, _camera);
	}

	//set window resize event
	$(window).on('resize', function(){
		_camera.aspect = window.innerWidth/window.innerHeight;
		_camera.updateProjectionMatrix();

		_renderer.setSize(window.innerWidth, window.innerHeight);
		_renderer.setPixelRatio(window.devicePixelRatio);

		_pickingTexture.setSize(window.innerWidth, window.innerHeight);
	})
}

export const sceneHandler = new SceneHandler();