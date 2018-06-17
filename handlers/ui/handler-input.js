const _mousePosition = new THREE.Vector2(0, 0);
const _oldMousePosition = new THREE.Vector2(0, 0);

let _mouseDeltaMagnitude = 0;
let _mouseDown = false;

export const InputHandler = {
	callbacks: {
		onMouseDown: () => {},
		onMouseUp: () => {},
		onMouseMove: () => {},
		onKeyDown: () => {},
		onKeyUp: () => {}
	},
	getMousePosition: () => {
		return _mousePosition.clone();
	},
	getMouseDown: () => {
		return _mouseDown;
	},
	getMouseDeltaMagnitude: () => {
		return _mouseDeltaMagnitude;
	},
	isMouseDown: () => {
		return _mouseDown;
	},
	isMouseUp: () => {
		return !_mouseDown;
	}
}

$("#main-canvas").on("mousemove", (event) => {
	_mousePosition.x = event.clientX;
	_mousePosition.y = event.clientY;

	if(_mouseDown){
		_mouseDeltaMagnitude += _oldMousePosition.distanceTo(_mousePosition);
	}

	_oldMousePosition.copy(_mousePosition);

	InputHandler.callbacks.onMouseMove();
});

$("#main-canvas").on("mousedown", (event) => {
	_mouseDown = true;
	_mouseDeltaMagnitude = 0;

	InputHandler.callbacks.onMouseDown();
});

$("#main-canvas").on("mouseup", (event) => {
	_mouseDown = false;

	InputHandler.callbacks.onMouseUp();
});

$(window).on("keydown", (event) => {
	InputHandler.callbacks.onKeyDown(event.key);
})

$(window).on("keyup", (event) => {
	InputHandler.callbacks.onKeyUp(event.key);
})