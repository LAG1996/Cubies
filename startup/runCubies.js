import { loadModels, areModelsLoaded } from './load-models.js';
import { CubiesMain } from './cubies-main.js';

//Import models for Cubies. Hold off on actually running the main program until initialization is complete.
const templates = { face: null, edge: null, cube: null, arrow: null };

loadModels(templates);

let loadInterval = setInterval(function(){
	if(areModelsLoaded){
		//Models are loaded. It is now safe to run Cubies.
		clearInterval(loadInterval);
		CubiesMain(templates);
	}
}, 10)