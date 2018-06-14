import { loadModels, areModelsLoaded } from './load-models.js';

import { Cubies } from './Cubies.js';

const templates = { face: null, edge: null, cube: null, arrow: null };
loadModels(templates);

let loadInterval = setInterval(function(){
	if(areModelsLoaded){
		clearInterval(loadInterval);
		Cubies(templates);
	}
}, 10)