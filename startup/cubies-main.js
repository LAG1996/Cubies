//import handlers
import { GUIHandler } from '../handlers/ui/handler-gui.js';
import { InputHandler } from '../handlers/ui/handler-input.js';
import { SceneHandler } from '../handlers/handler-scene.js';
import { PolycubeVisualHandler, setModelTemplates } from '../handlers/handle-polycube-visual.js';

//import polycube class
import { Polycube } from '../api/polycube.js';

//import mode handler class
import { Mode } from '../handlers/modes/mode-handler.js';

//Cubies Main module. This module should contain all of Cubies' main functions. These functions should be simply
//taking inputs and sending instructions to the appropriate handlers.
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
		hoverEdge: 0,
		hoverFace: 0,
		focusPolycube: null
	},
	modes: {
		inDefault: false,
		inAddCube: false,
		inPickDualGraph: false,
		inPickHingeArrow: false,
		currentMode: null
	}
}

const defaultMode = new Mode({
	startMode : () => {
		CubiesState.modes.inDefault = true;
		GUIHandler.switchCursor("default");
	},
	endMode : () => {
		CubiesState.modes.inDefault = false;
	},
	mouseMove : () => {
		tryMouseOverHighlight();
	},
	keyDown : () => {
		//Update highlights to reflect the new key press.
		tryMouseOverHighlight();
	},
	keyUp: () => {
		//Update highlights to reflect the new key press.
		tryMouseOverHighlight();
	}
});

const addCubeMode = new Mode({
	startMode : () => {	
		CubiesState.modes.inAddCube = true;
		GUIHandler.switchCursor("cell");
	},
	endMode : () => {
		CubiesState.modes.inAddCube = false;
		GUIHandler.switchCursor("default");
	},
	mouseMove: () => {
		if(CubiesState.flags.isOverFace){
			PolycubeVisualHandler.showPreviewCube(CubiesState.cache.focusPolycube.ID, CubiesState.cache.hoverFace);
		}
		else{
			PolycubeVisualHandler.hidePreviewCube();
		}
	},
	mouseUp: () => {
		if(CubiesState.flags.isOverFace){
			let faceID = CubiesState.cache.hoverFace;
			let polycube = CubiesState.cache.focusPolycube;

			let adjacentCubePosition = CubiesState.cache.focusPolycube.getFace(faceID).parentCubePosition;
			let direction = wordToDirection.get(faceIDtoDirWord(faceID));

			let cubePosition = new THREE.Vector3().addVectors(adjacentCubePosition, direction);
			
			if(polycube.addCube(cubePosition)){
				PolycubeVisualHandler.onNewCube(polycube, cubePosition);
			}
		}

		PolycubeVisualHandler.hidePreviewCube();
	}
});

//Functions that handle entering and exiting "modes in Cubies"
function startMode(mode){
	CubiesState.modes.currentMode = mode;

	CubiesState.modes.currentMode.startMode();
}

function interruptMode(){
	CubiesState.modes.currentMode.endMode();
}

//Set the current mode to the default mode
startMode(defaultMode);

//Define GUI handler callbacks
//Function for creating a polycube. Generates a new polycube object, hands the object to the visual handler for
//generating an appropriate Object3D instance, and then hands that instance to the scene handler to render.
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
	startMode(addCubeMode);
}

GUIHandler.callbacks.onDeletePolycube = () => {
	PolycubeVisualHandler.onDestroyPolycube(CubiesState.cache.focusPolycube.ID);
	CubiesState.cache.focusPolycube.destroy();
	CubiesState.cache.focusPolycube = null;
	GUIHandler.switchToCreatePolycubeView(0);
}

//Define input handler function callbacks
InputHandler.callbacks.onMouseDown = () => {
}

InputHandler.callbacks.onMouseUp = () => {

	if(InputHandler.getMouseDeltaMagnitude() < 5){
		
		CubiesState.modes.currentMode.onMouseUp();

		if(CubiesState.modes.inAddCube && !CubiesState.modes.isShiftDown){
			startMode(defaultMode);
		}
	}
}

//Function for mouse hovering. 
InputHandler.callbacks.onMouseMove = () => {

	CubiesState.flags.isOverFace = false;
	CubiesState.flags.isOverEdge = false;

	if((CubiesState.cache.hoverFace = SceneHandler.pick("face", InputHandler.getMousePosition())) !== 0){
		CubiesState.flags.isOverFace = true;
	}
	else if((CubiesState.cache.hoverEdge = SceneHandler.pick("edge", InputHandler.getMousePosition())) !== 0){
		CubiesState.flags.isOverEdge = true;
	}

	CubiesState.modes.currentMode.onMouseMove();
}

//Function to handle key presses
InputHandler.callbacks.onKeyDown = (key) => {
	if(CubiesState.flags.isKeyDown) return;

	CubiesState.flags.isKeyDown = true;

	//Respond to either Shift or Control.
	if(key === "Shift"){
		CubiesState.flags.isControlDown = false;
		CubiesState.flags.isShiftDown = true;
	}
	else if(key === "Control"){
		CubiesState.flags.isKeyDown = true;

		CubiesState.flags.isShiftDown = false;
		CubiesState.flags.isControlDown = true;
	}

	CubiesState.modes.currentMode.onKeyDown();
}

//Function to handle when a key is let go.
InputHandler.callbacks.onKeyUp = (key) => {
	CubiesState.flags.isKeyDown = false;

	if(key === "Shift"){
		CubiesState.flags.isShiftDown = false;
	}
	else if(key === "Control"){
		CubiesState.flags.isControlDown = false;
	}

	CubiesState.modes.currentMode.onKeyUp();
}


//Functions that update view
//Function that draws mouse-over highlights on polycube components.
function tryMouseOverHighlight(polycubeID = CubiesState.cache.focusPolycube){
	if(polycubeID != null && !InputHandler.isMouseDown()){
		//Hide highlights
		PolycubeVisualHandler.hideHighlights(polycubeID);

		//Try hovering over a face. If that fails, try hovering over an edge. There is no reason for this particular ordering. The functions
		//can be swapped.
		if(CubiesState.flags.isOverFace){
			doFaceHighlight();
		}
		else if(CubiesState.flags.isOverEdge){
			doEdgeHighlight();
		}
	}
}

function doFaceHighlight(faceID = CubiesState.cache.hoverFace){
	let polycube = CubiesState.cache.focusPolycube;
	if(!CubiesState.flags.isControlDown)
		PolycubeVisualHandler.showFaceHighlight(polycube.ID, faceID, CubiesState.flags.isShiftDown);
	else{
		PolycubeVisualHandler.showFaceAdjacencyHighlight(polycube.ID, faceID, polycube.getFaceNeighbors(faceID));
	}
}

function doEdgeHighlight(edgeID = CubiesState.cache.hoverEdge){
	let polycube = CubiesState.cache.focusPolycube;
	if(!CubiesState.flags.isControlDown)
		PolycubeVisualHandler.showEdgeHighlight(polycube.ID, edgeID, polycube.getIncidentEdge(edgeID), CubiesState.flags.isShiftDown);
	else
		PolycubeVisualHandler.showEdgeAdjacencyHighlight(polycube.ID, edgeID, polycube.getIncidentEdge(edgeID), polycube.getEdgeNeighbors(edgeID));
}

//The main Cubies function - Represents the core function of our program.
export const CubiesMain = function(modelTemplates){

	setModelTemplates(modelTemplates);
	//Tell the GUI handler to show the main nav.
	GUIHandler.displayGUI(true);
	GUIHandler.switchToCreatePolycubeView();

	SceneHandler.setPickingScene("face");
	SceneHandler.setPickingScene("edge");

	requestAnimationFrame(update);

	function update(){
		SceneHandler.draw();
		requestAnimationFrame(update);
	}
}