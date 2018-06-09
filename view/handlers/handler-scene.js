//Class representing the scene handler.
//This class handles the logic pertaining to drawing the editor scenes (including picking scenes)
//We use the ES5 approach to creating classes since we only intend to use one instance of this class.
const SceneHandler = function(bgColor = 0xffffe6){
	//private variables
	let _bgColor = new THREE.Color(bgColor);
	const _pickingScenes = new Map();

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
	//Function to handle picking
	this.pick = function(sceneName, mousePosition, colorContainer = null){}

	this.setBackgroundColor = function(color){
		_bgColor.set(color);
	}

	this.draw = function(){
		_renderer.render(_mainScene, _camera);
	}
}

export const sceneHandler = new SceneHandler();