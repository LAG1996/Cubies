//Module representing the handler for scenes in Cubies. This handles drawing and picking.
const _bgColor = new THREE.Color(0xffffe6);
const _pickBGColor = new THREE.Color(0x000000);

const _pickingScenes = new Map();
const _pickingTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
_pickingTexture.texture.minFiler = THREE.LinearFilter;

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

//set window resize event
$(window).on('resize', function(){
	_camera.aspect = window.innerWidth/window.innerHeight;
	_camera.updateProjectionMatrix();

	_renderer.setSize(window.innerWidth, window.innerHeight);
	_renderer.setPixelRatio(window.devicePixelRatio);

	_pickingTexture.setSize(window.innerWidth, window.innerHeight);
})

export const SceneHandler = {
	addToViewScene: (...objects) => {
		objects.forEach((obj) => {_mainScene.add(obj)});
	},
	addToPickingScene: (sceneName, object) => {
		_pickingScenes.get(sceneName).add(object);
	},
	setPickingScene: (sceneName) => {
		_pickingScenes.set(sceneName, new THREE.Scene());
	},
	pick: (sceneName, mousePosition) => {
		_renderer.setClearColor(_pickBGColor.getHex(), 1);
		_renderer.render(_pickingScenes.get(sceneName), _camera, _pickingTexture);
		_renderer.setClearColor(_bgColor.getHex(), 1);
		return GetPixelColor(mousePosition);
	},
	draw: () => {
		_renderer.render(_mainScene, _camera);
	}
}

function GetPixelColor(mousePosition){
	let pixelBuffer = new Uint8Array(4);

	_renderer.readRenderTargetPixels(_pickingTexture, mousePosition.x + 0,
		_pickingTexture.height - (mousePosition.y + 0), 1, 1, pixelBuffer);

	let color = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

	return color;
}