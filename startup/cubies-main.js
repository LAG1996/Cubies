//import handlers
import { GUIHandler } from '/handlers/ui/handler-gui.js';
import { MouseHandler } from '/handlers/ui/handler-mouse.js';
import { SceneHandler } from '/handlers/handler-scene.js';
import { PolycubeVisualHandler, setModelTemplates, edgeHighlight, faceHighlight } from '/handlers/handle-polycube-visual.js';

//import polycube class and interface
import { Polycube } from '/api/polycube.js';

const CubiesState = {
	flags: {
		showFaceDual: false,
		showArrows: false,
		isShiftDown: false,
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

MouseHandler.callbacks.onMouseDown = () => {
}

MouseHandler.callbacks.onMouseUp = () => {
}

//Function to handle mouse hovering
MouseHandler.callbacks.onMouseMove = () => {

	if(!MouseHandler.isMouseDown()){
		//Hide highlights
		PolycubeVisualHandler.hideHighlights(CubiesState.cache.focusPolycube.ID);
		
		//Find what component of the polycube we are hovering over.
		let faceID = SceneHandler.pick("face", MouseHandler.getMousePosition());

		let edgeID = 0;
		if(faceID === 0)
		{
			edgeID = SceneHandler.pick("edge", MouseHandler.getMousePosition());

			if(edgeID !== 0){
				PolycubeVisualHandler.showEdgeHighlight(CubiesState.cache.focusPolycube.ID, edgeID, !CubiesState.flags.isShiftDown);
			}
		}
		else{
			PolycubeVisualHandler.showFaceHighlight(CubiesState.cache.focusPolycube.ID, faceID, !CubiesState.flags.isShiftDown);
		}
	}
	else{

	}

}