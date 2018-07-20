//import handlers
import { GUIHandler } from '../handlers/ui/handler-gui.js';
import { InputHandler } from '../handlers/ui/handler-input.js';
import { SceneHandler } from '../handlers/handler-scene.js';
import { PolycubeVisualHandler, setPolyViewTemplates } from '../handlers/handle-polycube-visual.js';
import { ArrowHandler, setArrowTemplates } from '../handlers/handle-hinge-arrow.js';
import { HingeAnimHandler } from '../handlers/handle-hinging.js';

//import polycube class
import { Polycube } from '../api/polycube.js';

//import mode handler class
import { Mode } from '../handlers/modes/mode.js';

//import tutorial flags
import { TutorialFlags } from '../handlers/handle-tutorial.js';

//Cubies Main module. This module should contain all of Cubies' main functions. These functions should be simply
//taking inputs and sending instructions to the appropriate handlers.
const Cubies = {
	flags: {
		showFaceDual: false,
		hasArrowData: false,
		isShiftDown: false,
		isControlDown: false,
		isKeyDown: false,
		isOverEdge: false,
		isOverFace: false,
		doUpdateCuts: false,
		doUpdateEdges: false,
		inTutorial: false
	},
	cache : {
		hoverEdgeID: 0,
		hoverFaceID: 0,
		arrowData: null,
		focusPolycube: null,
		chosenHingeEdgeID: null,
		chosenDecomp: [],
		dualGraphDecompObj: {pieceMap: null, decomp: null, decompIndex: -1},
		tapeFace1: null,
		tapeFace2: null
	},
	modes: {
		inDefault: false,
		inAddCube: false,
		inHingeMode: false,
		inPickArrow: false,
		inTape: false,
		currentMode: null
	}
}

const CLOCK = new THREE.Clock();

//Object representing Cubies' default behaviour
const defaultMode = new Mode({
	startMode : () => {
		Cubies.modes.inDefault = true;
		GUIHandler.switchCursor("default");
	},
	endMode : () => {
		Cubies.modes.inDefault = false;
	},
	mouseMove : () => {
		tryMouseOverHighlight();
	},
	mouseUp: () => {
		//Do not do anything if we aren't hovering over an edge or one of the keys are pressed.
		if(!Cubies.flags.isOverEdge || Cubies.flags.isControlDown || Cubies.flags.isShiftDown) { return; };
		if(Cubies.flags.inTutorial && !TutorialFlags.inAddCube){ return; }

		let edgeToCut = Cubies.cache.hoverEdgeID;
		let focusPolycube = Cubies.cache.focusPolycube;
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

//Object representing Cubies' behaviour when the user is adding a Cube
const addCubeMode = new Mode({
	startMode : () => {	
		Cubies.modes.inAddCube = true;
		GUIHandler.switchCursor("cell");
	},
	endMode : () => {
		Cubies.modes.inAddCube = false;
		GUIHandler.switchCursor("default");
	},
	mouseMove: () => {
		if(Cubies.flags.isOverFace){
			PolycubeVisualHandler.showPreviewCube(Cubies.cache.focusPolycube.ID, Cubies.cache.hoverFaceID);
		}
		else{
			PolycubeVisualHandler.hidePreviewCube();
		}
	},
	mouseUp: () => {
		if(Cubies.flags.isOverFace){
			let faceID = Cubies.cache.hoverFaceID;
			let polycube = Cubies.cache.focusPolycube;

			let adjacentCubePosition = Cubies.cache.focusPolycube.getFace(faceID).parentCubePosition;
			let direction = wordToDirection.get(faceIDtoDirWord(faceID));

			let cubePosition = new THREE.Vector3().addVectors(adjacentCubePosition, direction);
			
			if(polycube.addCube(cubePosition)){
				PolycubeVisualHandler.onNewCube(polycube, cubePosition);
			}
		}

		PolycubeVisualHandler.hidePreviewCube();
	}
});

//Object representing Cubies' behaviour when the user is picking a piece of a polycube to unfold
const hingeMode = new Mode({
	startMode : () => {
		Cubies.modes.inHingeMode = true;
		Cubies.flags.hasArrowData = false;
		Cubies.cache.arrowData = null;
		GUIHandler.switchCursor("default");

		//Store the chosen hinging edge
		Cubies.cache.chosenHingeEdgeID = Cubies.cache.hoverEdgeID;
		//Hide the hinge highlight
		PolycubeVisualHandler.hideHighlights();
		//Hide the preview cube
		PolycubeVisualHandler.hidePreviewCube();
		//Show the dual graph decomposition
		PolycubeVisualHandler.showDualGraphDecomposition(Cubies.cache.focusPolycube.ID, Cubies.cache.dualGraphDecompObj.decomp);
	},
	endMode: () => {
		Cubies.modes.inHingeMode = false;

		//Hide the arrows
		ArrowHandler.hideArrows();
		//Hide the dual graph decomposition
		PolycubeVisualHandler.hideDualGraphDecomposition(Cubies.cache.focusPolycube.ID);
	},
	mouseUp: () => {
		//Don't do anything if we aren't hovering over a face or an arrow
		if(!Cubies.flags.isOverFace && !Cubies.flags.inPickArrow){ return; }

		if(Cubies.flags.inPickArrow){
			let arrowID = SceneHandler.pick("arrow", InputHandler.getMousePosition());

			if(arrowID !== 0){
				Cubies.flags.hasArrowData = true;
				Cubies.cache.arrowData = ArrowHandler.getChosenArrowData(arrowID);

				doRotate();
			}

			Cubies.flags.inPickArrow = false;
		}

		if(!Cubies.flags.hasArrowData && Cubies.flags.isOverFace)
		{			
			let polycube = Cubies.cache.focusPolycube;
			let faceData = polycube.getFace(Cubies.cache.hoverFaceID);

			let chosenDecompIndex = Cubies.cache.dualGraphDecompObj.pieceMap[Cubies.cache.hoverFaceID];
			let chosenDecomp = Cubies.cache.dualGraphDecompObj.decomp[chosenDecompIndex];

			Cubies.cache.dualGraphDecompObj.decompIndex = chosenDecompIndex;
			Cubies.cache.chosenDecomp = [...chosenDecomp];

			ArrowHandler.showArrowsAt(faceData.position.clone(), faceData.normal.clone());
			Cubies.flags.inPickArrow = true;
		}
	}
});

//Object representing Cubies' behaviour when the user is trying to tape two faces together
const tapeMode = new Mode({
	startMode(){
		Cubies.modes.inTape = true;
		Cubies.cache.tapeFace1 = Cubies.cache.hoverFaceID;
		PolycubeVisualHandler.hideHighlights();
	},
	endMode(){
		Cubies.modes.inTape = false;

		Cubies.cache.tapeFace1 = null;
		Cubies.cache.tapeFace2 = null;
	},
	mouseUp(){
		if(!Cubies.flags.isOverFace){ return; }

		Cubies.cache.tapeFace2 = Cubies.cache.hoverFaceID;

		//Check if taping was valid. If not, set `tapeFace2` back to null.
		let result = Cubies.cache.focusPolycube.tapeFaces(Cubies.cache.tapeFace1, Cubies.cache.tapeFace2)
		if(result == null)
		{
			Cubies.cache.tapeFace2 = null;
		}
		else{
			PolycubeVisualHandler.hideCutHighlight(Cubies.cache.focusPolycube.ID, result.tapedEdges[0], result.tapedEdges[1]);
			PolycubeVisualHandler.hideHingeLines(Cubies.cache.focusPolycube.ID);
			for(var res of result.cutEdges){
				PolycubeVisualHandler.showHingeLines(Cubies.cache.focusPolycube.ID, Cubies.cache.focusPolycube.getCutTreeHingeLines(res));
			}
		}
	}
});

//Functions that handle entering and exiting "modes in Cubies"
function startMode(mode, ...args){
	interruptMode();

	Cubies.modes.currentMode = mode;

	Cubies.modes.currentMode.startMode(...args);
}

function interruptMode(...args){
	if(Cubies.modes.currentMode != null)
		Cubies.modes.currentMode.endMode(...args);
}

function tryDeletePolycube(){

	if(Cubies.cache.focusPolycube == null){ return;}

	PolycubeVisualHandler.onDestroyPolycube(Cubies.cache.focusPolycube.ID);
	Cubies.cache.focusPolycube.destroy();
	Cubies.cache.focusPolycube = null;
	GUIHandler.switchToCreatePolycubeView(0);
}

//Functions that update view
function doRotate(){
	let polycube = Cubies.cache.focusPolycube;
	let chosenDecomp = Cubies.cache.chosenDecomp;
	let edgeData = polycube.getEdge(Cubies.cache.chosenHingeEdgeID);
	
	if(Cubies.cache.dualGraphDecompObj.decompIndex !== Cubies.cache.dualGraphDecompObj.pieceMap[edgeData.parentID])
		edgeData = edgeData.incidentEdge;

	let faceData = polycube.getFace(edgeData.parentID);

	let arrowData = Cubies.cache.arrowData;
	
	//Determine the radians given what arrow was pressed, the direction of the faces adjacent
	let rads = THREE.Math.degToRad(90);
	//console.log(arrowData.color);
	let dirMultiplier = arrowData.color === "white" ? 1 : -1;
	
	let cross = new THREE.Vector3().crossVectors(faceData.normal, edgeData.axis);
	cross.normalize();
	cross = toLatticeVector(cross);

	let dirFromHinge = new THREE.Vector3().subVectors(faceData.position, edgeData.position);
	dirFromHinge.normalize();
	dirFromHinge = toLatticeVector(dirFromHinge);
	
	if(!cross.equals(dirFromHinge)){
		dirMultiplier = -dirMultiplier;
	}

	rads = dirMultiplier * rads;

	//Get all face objects from the different scene representations of our polycube
	let faceObjs = PolycubeVisualHandler.getFaceObjs(polycube.ID, ...chosenDecomp);

	polycube.rotateData(chosenDecomp, edgeData.ID, rads);
	HingeAnimHandler.startAnimation(polycube.ID, faceObjs, edgeData, rads);
}

//Function that draws mouse-over highlights on polycube components.
function tryMouseOverHighlight(polycubeID = Cubies.cache.focusPolycube){
	if(polycubeID != null && !InputHandler.isMouseDown()){
		//Hide highlights
		PolycubeVisualHandler.hideHighlights(polycubeID);

		//Try hovering over a face. If that fails, try hovering over an edge. There is no reason for this particular ordering. The functions
		//can be swapped.
		if(Cubies.flags.isOverFace){
			doFaceHighlight();
		}
		else if(Cubies.flags.isOverEdge){
			doEdgeHighlight();
		}
	}
}

function doFaceHighlight(faceID = Cubies.cache.hoverFaceID){
	let polycube = Cubies.cache.focusPolycube;
	if(!Cubies.flags.isControlDown)
		PolycubeVisualHandler.showFaceHighlight(polycube.ID, faceID, Cubies.flags.isShiftDown);
	else{
		PolycubeVisualHandler.showFaceAdjacencyHighlight(polycube.ID, faceID, polycube.getFaceNeighbors(faceID));
	}
}

function doEdgeHighlight(edgeID = Cubies.cache.hoverEdgeID){
	let polycube = Cubies.cache.focusPolycube;
	if(!Cubies.flags.isControlDown)
		PolycubeVisualHandler.showEdgeHighlight(polycube.ID, edgeID, polycube.getIncidentEdge(edgeID), Cubies.flags.isShiftDown);
	else
		PolycubeVisualHandler.showEdgeAdjacencyHighlight(polycube.ID, edgeID, polycube.getIncidentEdge(edgeID), polycube.getEdgeNeighbors(edgeID));
}

//The main Cubies function - Represents the core function of our program.
export const CubiesMain = function(modelTemplates){

	let polycubeHighlights = setPolyViewTemplates(modelTemplates);
	let hingeArrows = setArrowTemplates(modelTemplates.arrow);

	//Tell the GUI handler to show the main nav.
	GUIHandler.displayGUI(true);
	GUIHandler.switchToCreatePolycubeView();

	SceneHandler.addToViewScene(...polycubeHighlights.edgeHighlightPair, polycubeHighlights.faceHighlight, polycubeHighlights.previewCube);
	SceneHandler.addToViewScene(hingeArrows.viewArrowPair);

	SceneHandler.setPickingScene("face");
	SceneHandler.setPickingScene("edge");
	SceneHandler.setPickingScene("arrow");

	SceneHandler.addToPickingScene("arrow", hingeArrows.pickArrowPair);

	SceneHandler.printViewSceneData();

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

			Cubies.cache.focusPolycube = newPolycube;
		}
	}

	GUIHandler.callbacks.onAddCube = () => {
		startMode(addCubeMode);
	}

	GUIHandler.callbacks.onTutorialClick = () => {
		Cubies.flags.inTutorial = !Cubies.flags.inTutorial;

		tryDeletePolycube();
	}

	GUIHandler.callbacks.onDeletePolycube = () => {
		startMode(defaultMode);

		tryDeletePolycube();
	}

	//Define input handler function callbacks
	InputHandler.callbacks.onMouseDown = () => {
	}

	InputHandler.callbacks.onMouseUp = () => {

		if(InputHandler.getMouseDeltaMagnitude() < 5){

			//handle click-based mode switching
			let switchedMode = false;
			if(Cubies.modes.inDefault){
				if(Cubies.flags.isShiftDown){

					if(Cubies.flags.isOverEdge){
						let dualGraphDecomp = Cubies.cache.focusPolycube.getDualGraphDecomposition(Cubies.cache.hoverEdgeID);
						if(dualGraphDecomp != null){
							Cubies.cache.dualGraphDecompObj = JSON.parse(JSON.stringify(dualGraphDecomp));
							startMode(hingeMode);
							switchedMode = true;
						}
					}
					else if(Cubies.flags.isOverFace){
						if(Cubies.flags.isShiftDown){
							startMode(tapeMode);
							switchedMode = true;
						}
					}
				}
			}
			else if(Cubies.modes.inHingeMode){
				if(!Cubies.flags.isOverFace && !Cubies.flags.inPickArrow){
					startMode(defaultMode);
					switchedMode = true;
				}
			}
			else if(Cubies.modes.inTape){
				if(!Cubies.flags.isOverFace || !Cubies.flags.isShiftDown){
					startMode(defaultMode);
					switchedMode = true;
				}
			}

			if(switchedMode){ return; }

			Cubies.modes.currentMode.onMouseUp();

			//Handle post-click mode switching
			if(Cubies.modes.inAddCube){
				if(!Cubies.flags.isShiftDown){
					startMode(defaultMode);
				}
			}
			else if(Cubies.modes.inHingeMode){
				if(Cubies.flags.hasArrowData || !Cubies.flags.isOverFace){
					startMode(defaultMode);
				}
			}
			else if(Cubies.modes.inTape){
				if(Cubies.cache.tapeFace2 != null){
					startMode(defaultMode);
				}
			}
		}
	}

	//Function for mouse hovering. 
	InputHandler.callbacks.onMouseMove = () => {

		Cubies.flags.isOverFace = false;
		Cubies.flags.isOverEdge = false;

		if((Cubies.cache.hoverFaceID = SceneHandler.pick("face", InputHandler.getMousePosition())) !== 0){
			Cubies.flags.isOverFace = true;
		}
		else if((Cubies.cache.hoverEdgeID = SceneHandler.pick("edge", InputHandler.getMousePosition())) !== 0){
			//console.log(Cubies.cache.hoverEdgeID);
			Cubies.flags.isOverEdge = true;
		}

		Cubies.modes.currentMode.onMouseMove();
	}

	//Function to handle key presses
	InputHandler.callbacks.onKeyDown = (key) => {
		if(Cubies.flags.isKeyDown) return;

		Cubies.flags.isKeyDown = true;

		//Respond to either Shift or Control.
		if(key === "Shift"){
			Cubies.flags.isControlDown = false;
			Cubies.flags.isShiftDown = true;
		}
		else if(key === "Control"){
			Cubies.flags.isKeyDown = true;

			Cubies.flags.isShiftDown = false;
			Cubies.flags.isControlDown = true;
		}

		Cubies.modes.currentMode.onKeyDown();
	}

	//Function to handle when a key is let go.
	InputHandler.callbacks.onKeyUp = (key) => {
		Cubies.flags.isKeyDown = false;

		if(key === "Shift"){
			Cubies.flags.isShiftDown = false;
		}
		else if(key === "Control"){
			Cubies.flags.isControlDown = false;
		}

		Cubies.modes.currentMode.onKeyUp();
	}

	requestAnimationFrame(update);

	//Handles any operations at the end of every frame
	function update(){
		let deltaTime = CLOCK.getDelta();

		HingeAnimHandler.continueAnimations(deltaTime);

		SceneHandler.draw();
		requestAnimationFrame(update);
	}
}