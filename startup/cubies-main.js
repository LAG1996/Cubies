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
		hoverEdgeID: 0,
		hoverFaceID: 0,
		focusPolycube: null
	},
	modes: {
		inDefault: false,
		inAddCube: false,
		inPickGraphPiece: false,
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
	mouseUp: () => {
		//Do not do anything if we aren't hovering over an edge or one of the keys are pressed.
		if(!CubiesState.flags.isOverEdge || CubiesState.flags.isControlDown || CubiesState.flags.isShiftDown) { return; };

		let edgeToCut = CubiesState.cache.hoverEdgeID;
		let focusPolycube = CubiesState.cache.focusPolycube;
		let edgeToCutIncident = focusPolycube.getIncidentEdge(edgeToCut);
		
		//Tell the polycube to cut this edge
		let isCutSuccessful = focusPolycube.cutEdge(edgeToCut);

		//Check if this cut was successful. If not, then don't do anything.
		if(!isCutSuccessful) return;

		//Tell the polycube visualizer to reflect that this edge has been cut by showing the cut highlight
		PolycubeVisualHandler.showCutHighlight(focusPolycube.ID, edgeToCut, edgeToCutIncident);

		//Tell the polycube visualizer to show any hinge lines that may have formed
		PolycubeVisualHandler.showHingeLines(focusPolycube.ID, focusPolycube.getCutTreeHingeLines(edgeToCut));

		//Tell the toolbar handler to disable the add cube button
		GUIHandler.disableAddCubeButton();
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
			PolycubeVisualHandler.showPreviewCube(CubiesState.cache.focusPolycube.ID, CubiesState.cache.hoverFaceID);
		}
		else{
			PolycubeVisualHandler.hidePreviewCube();
		}
	},
	mouseUp: () => {
		if(CubiesState.flags.isOverFace){
			let faceID = CubiesState.cache.hoverFaceID;
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

const pickDualGraphPieceMode = new Mode({
	startMode : (dualGraphDecomp) => {
		CubiesState.modes.inPickGraphPiece = true;
		GUIHandler.switchCursor("default");

		//Hide the hinge highlight
		PolycubeVisualHandler.hideHighlights();
		//Hide the preview cube
		PolycubeVisualHandler.hidePreviewCube();
		//Show the dual graph decomposition
		PolycubeVisualHandler.showDualGraphDecomposition(CubiesState.cache.focusPolycube.ID, dualGraphDecomp);
	},
	endMode: () => {
		CubiesState.modes.inPickGraphPiece = false;

		//Hide the dual graph decomposition
		PolycubeVisualHandler.hideDualGraphDecomposition(CubiesState.cache.focusPolycube.ID);
	},
	mouseUp: () => {
		//Don't do anything if we aren't hovering over a face
		if(!CubiesState.flags.isOverFace){ return; }
	}
})

//Functions that handle entering and exiting "modes in Cubies"
function startMode(mode, args){
	interruptMode();

	CubiesState.modes.currentMode = mode;

	CubiesState.modes.currentMode.startMode(args);
}

function interruptMode(args){
	if(CubiesState.modes.currentMode != null)
		CubiesState.modes.currentMode.endMode(args);
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
			console.log("Edge #" + CubiesState.cache.hoverEdgeID);
			doEdgeHighlight();
		}
	}
}

function doFaceHighlight(faceID = CubiesState.cache.hoverFaceID){
	let polycube = CubiesState.cache.focusPolycube;
	if(!CubiesState.flags.isControlDown)
		PolycubeVisualHandler.showFaceHighlight(polycube.ID, faceID, CubiesState.flags.isShiftDown);
	else{
		PolycubeVisualHandler.showFaceAdjacencyHighlight(polycube.ID, faceID, polycube.getFaceNeighbors(faceID));
	}
}

function doEdgeHighlight(edgeID = CubiesState.cache.hoverEdgeID){
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
		startMode(defaultMode);

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

			if(CubiesState.modes.inDefault){
				if(CubiesState.flags.isShiftDown && CubiesState.flags.isOverEdge){
					let dualGraphDecomp = CubiesState.cache.focusPolycube.getDualGraphDecomposition(CubiesState.cache.hoverEdgeID);

					if(dualGraphDecomp != null){
						startMode(pickDualGraphPieceMode, dualGraphDecomp);
					}
				}
					
			}
			else if(CubiesState.modes.inAddCube){}
			else if(CubiesState.modes.inPickGraphPiece){
				if(!CubiesState.flags.isOverFace)
					startMode(defaultMode);
			}

			CubiesState.modes.currentMode.onMouseUp();

			if(CubiesState.modes.inDefault){}
			else if(CubiesState.modes.inAddCube){
				if(!CubiesState.flags.isShiftDown){
					startMode(defaultMode);
				}
			}
		}
	}

	//Function for mouse hovering. 
	InputHandler.callbacks.onMouseMove = () => {

		CubiesState.flags.isOverFace = false;
		CubiesState.flags.isOverEdge = false;

		if((CubiesState.cache.hoverFaceID = SceneHandler.pick("face", InputHandler.getMousePosition())) !== 0){
			CubiesState.flags.isOverFace = true;
		}
		else if((CubiesState.cache.hoverEdgeID = SceneHandler.pick("edge", InputHandler.getMousePosition())) !== 0){
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

	requestAnimationFrame(update);

	function update(){
		SceneHandler.draw();
		requestAnimationFrame(update);
	}
}