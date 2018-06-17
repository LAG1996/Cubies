//import handlers
import { GUIHandler } from '/handlers/ui/handler-gui.js';
import { InputHandler } from '/handlers/ui/handler-input.js';
import { SceneHandler } from '/handlers/handler-scene.js';
import { PolycubeVisualHandler, setModelTemplates, edgeHighlight, faceHighlight } from '/handlers/handle-polycube-visual.js';

//import polycube class and interface
import { Polycube } from '/api/polycube.js';

const CubiesState = {
	flags: {
		showFaceDual: false,
		showArrows: false,
		isShiftDown: false,
		isControlDown: false,
		isKeyDown: false,
		isOverEdge: false,
		isOverFace: false,
		doUpdateCuts: false,
		doUpdateEdges: false
	},
	cache : {
		hoverEdge: null,
		hoverFace: null,
		focusPolycube: null
	}
}

//The main Cubies function - Represents the core function of our program.
export const CubiesMain = function(modelTemplates){

	setModelTemplates(modelTemplates);
	//Tell the GUI handler to show the main nav.
	GUIHandler.displayGUI(true);
	GUIHandler.switchToCreatePolycubeView();

	SceneHandler.addToViewScene(edgeHighlight, faceHighlight);
	SceneHandler.setPickingScene("face");
	SceneHandler.setPickingScene("edge");

	requestAnimationFrame(update);

	function update(){
		SceneHandler.draw();
		requestAnimationFrame(update);
	}
}

//Set callback functions
//GUI callbacks
GUIHandler.callbacks.onCreatePolycube = (polycubeName = Polycube.nextDefaultName()) => {

	if(!Polycube.isNameTaken(polycubeName)){
		let newPolycube = new Polycube(polycubeName);

		PolycubeVisualHandler.onNewPolycube(newPolycube);

		SceneHandler.addToViewScene(PolycubeVisualHandler.getViewPolycube(newPolycube.ID));
		SceneHandler.addToPickingScene("face", PolycubeVisualHandler.getFacePickPolycube(newPolycube.ID));
		SceneHandler.addToPickingScene("edge", PolycubeVisualHandler.getEdgePickPolycube(newPolycube.ID));

		GUIHandler.switchToPolycubeView(false, polycubeName);

		CubiesState.cache.focusPolycube = newPolycube;
	}
}

GUIHandler.callbacks.onAddCube = () => {
	console.log("Adding cube");
}

InputHandler.callbacks.onMouseDown = () => {
}

InputHandler.callbacks.onMouseUp = () => {
}

//Function to handle mouse hovering
InputHandler.callbacks.onMouseMove = () => {
	tryHighlight();
}

//Function to handle key presses
InputHandler.callbacks.onKeyDown = (key) => {
	if(CubiesState.flags.isKeyDown) return; 

	if(key === "Shift"){
		console.log("Clicked shift");
		CubiesState.flags.isKeyDown = true;

		CubiesState.flags.isControlDown = false;
		CubiesState.flags.isShiftDown = true;
	}
	else if(key === "Control"){
		console.log("Clicked control")
		CubiesState.flags.isKeyDown = true;

		CubiesState.flags.isShiftDown = false;
		CubiesState.flags.isControlDown = true;
	}

	tryHighlight();
}

InputHandler.callbacks.onKeyUp = (key) => {
	console.log("hmmmm")
	CubiesState.flags.isKeyDown = false;

	if(key === "Shift"){
		CubiesState.flags.isShiftDown = false;
	}
	else if(key === "Control"){
		CubiesState.flags.isControlDown = false;
	}

	tryHighlight();
}

function tryHighlight(){
	if(CubiesState.cache.focusPolycube != null && !InputHandler.isMouseDown()){
	//Hide highlights
	PolycubeVisualHandler.hideHighlights(CubiesState.cache.focusPolycube.ID);
	//Find what component of the polycube we are hovering over.
	let faceID = SceneHandler.pick("face", InputHandler.getMousePosition());

	let edgeID = 0;
	if(faceID === 0)
	{
		edgeID = SceneHandler.pick("edge", InputHandler.getMousePosition());

		if(edgeID !== 0){
			PolycubeVisualHandler.showEdgeHighlight(CubiesState.cache.focusPolycube.ID, edgeID, !CubiesState.flags.isShiftDown);
		}
	}
	else{
			if(!CubiesState.flags.isControlDown)
				PolycubeVisualHandler.showFaceHighlight(CubiesState.cache.focusPolycube.ID, faceID, !CubiesState.flags.isShiftDown);
			else
				PolycubeVisualHandler.showFaceAdjacencyHighlight(CubiesState.cache.focusPolycube.ID, faceID, CubiesState.cache.focusPolycube.getFaceNeighbors(faceID));
		}
	}
	else{

	}
}