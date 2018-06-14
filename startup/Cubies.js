//import handlers
import { GUIHandler } from '/view/handlers/handler-gui.js';
import { SceneHandler } from '/view/handlers/handler-scene.js';
import { PolycubeVisualizer } from '/view/handlers/handle-polycube-visual.js';

//import common utility stuff
import { NTY_RAD } from '/api/utils.js';

//import polycube class and interface
import { Polycube } from '/api/polycube.js';
import { existsPolycubeName, nextDefaultName } from '/api/polycube.js';

//The main Cubies function - Represents the core function of our program.
export const Cubies = function(modelTemplates){

	console.log("Cubies has started!");

	//Default to the create polycube view on the gui
	let guiHandler = new GUIHandler(false, {onNewPolycube: onNewPolycube, onNewCube: onNewCube})
	guiHandler.switchToCreatePolycubeView();

	let sceneHandler = new SceneHandler();
	sceneHandler.setPickingScene("face");
	sceneHandler.setPickingScene("edge");

	let polycubeVisual = new PolycubeVisualizer(modelTemplates);

	//Start the main loop
	requestAnimationFrame(update);

	//Update is called at every frame. Handles drawing 
	function update(){
		sceneHandler.draw();
		requestAnimationFrame(update);
	}

	function onNewPolycube(polycubeName = nextDefaultName()){
		console.log("Creating " + polycubeName);

		if(!existsPolycubeName(polycubeName)){
			let newPolycube = new Polycube(polycubeName);

			polycubeVisual.onNewPolycube(newPolycube);

			sceneHandler.addToViewScene(polycubeVisual.getViewPolycube(newPolycube.ID));
			sceneHandler.addToPickingScene("face", polycubeVisual.getFacePickPolycube(newPolycube.ID));
			sceneHandler.addToPickingScene("edge", polycubeVisual.getEdgePickPolycube(newPolycube.ID));

			guiHandler.switchToPolycubeView(polycubeName);
		}
	}

	function onNewCube(){
		console.log("Going into add cube mode");
	}
}