import { wordToDirection, wordToOppositeWord, faceIDCalculator, edgeIDCalculator } from '/api/utils.js';

export const PolycubeVisualizer = function(modelTemplates){

	//The different versions of polycubes we need to handle
	let _viewPolycubes = new Map();
	let _edgePickPolycubes = new Map();
	let _facePickPolycubes = new Map();

	//Highlight colors when mousing over
	const _HIGHLIGHT_MOUSE_SHIFT = new THREE.Color(0xFFFF00);
	const _HIGHLIGHT_MOUSE = new THREE.Color(0x00FF00);

	//Highlight color for cut edges
	const _HIGHLIGHT_CUT = new THREE.Color(0xFF0000);

	//Highlight color for hinges
	const _HIGHLIGHT_HINGE = new THREE.Color(0x22EEDD);

	//Highlight colors for face dual graph partitions
	const _HIGHLIGHT_FACE_DUAL1 = new THREE.Color(0xFF0000);
	const _HIGHLIGHT_FACE_DUAL2 = new THREE.Color(0x0000FF);

	let that = this;

	//Constructs a 3D polycube object for the view scene, the edge pick scene, and the face pick scene
	this.onNewPolycube = function(newPolycube){
		let newPolycubeModel = new THREE.Group();
		newPolycubeModel.matrixAutoUpdate = false;

		_viewPolycubes.set(newPolycube.ID, newPolycubeModel.clone());
		_edgePickPolycubes.set(newPolycube.ID, newPolycubeModel.clone());
		_facePickPolycubes.set(newPolycube.ID, newPolycubeModel.clone());

		addCubeToView(newPolycube, new THREE.Vector3(0, 0, 0));
		addCubeToEdgePick(newPolycube, 0, new THREE.Vector3(0, 0, 0));
		addCubeToEdgePick(newPolycube, 0, new THREE.Vector3(0, 0, 0));
	}

	//Removes this polycube's model from the scene
	this.onDestroyPolycube = function(polycube){
		let viewPolycube = _viewPolycubes.get(polycube.ID);
		let edgePickPolycube = _edgePickPolycubes.get(polycube.ID);
		let facePickPolycube = _facePickPolycubes.get(polycube.ID);

		viewPolycube.parent.remove(viewPolycube);
		edgePickPolycube.parent.remove(edgePickPolycube);
		facePickPolycube.parent.remove(facePickPolycube);

		_viewPolycubes.delete(polycube.ID);
		_edgePickPolycubes.delete(polycube.ID);
		_facePickPolycubes.delete(polycube.ID);
 	}

 	this.getViewPolycube = function(polycubeID){
 		return _viewPolycubes.get(polycubeID);
 	}

 	this.getEdgePickPolycube = function(polycubeID){
 		return _edgePickPolycubes.get(polycubeID);
 	}

 	this.getFacePickPolycube = function(polycubeID){
 		return _facePickPolycubes.get(polycubeID);
 	}

	function addCubeToView(polycube, cubePosition){
		//Create a new cube model
		let newCubeModel = modelTemplates.cube.clone();
		newCubeModel.matrixAutoUpdate = false;

		//Give this cube a name
		newCubeModel.name = getCubeName(polycube.cubeCount - 1);

		//Check in all directions. If there is an adjacent cube, remove the corresponding faces.
		wordToDirection.forEach(function(dir, word){

			let adjacentPosition = new THREE.Vector3().addVectors(cubePosition, dir);

			if(polycube.hasCubeAtPosition(adjacentPosition)){
				let cubeID = polycube.getCube(adjacentPosition);

				//Get the actual cube scene object
				let cubeObj = _viewPolycubes.get(polycube.ID).getObjectByName(getCubeName(cubeID));
				//Get the face to remove from the cube
				let faceObj = cubeObj.getObjectByName(wordToOppositeWord.get(word));
				//Remove the object
				cubeObj.remove(faceObj);

				//Now remove the appropriate face from the new cube model
				faceObj = newCubeModel.getObjectByName(word);
				newCubeModel.remove(faceObj);
			}
		})

		//Add the cube to the corresponding view polycube
		_viewPolycubes.get(polycube.ID).add(newCubeModel);

		//Set this cube model's position. Scale the position by 2
		newCubeModel.position.copy(cubePosition).multiplyScalar(2);
		newCubeModel.updateMatrix();
	}

	function addCubeToEdgePick(polycube, newCubeID, cubePosition){
		//Create a new cube model
		let newCubeModel = modelTemplates.cube.clone();
		newCubeModel.matrixAutoUpdate = false;

		//Give this cube a name
		newCubeModel.name = getCubeName(polycube.cubeCount - 1);

		//Check in all directions. If there is an adjacent cube, remove the corresponding faces.
		wordToDirection.forEach(function(dir, word){

			let adjacentPosition = new THREE.Vector3().addVectors(cubePosition, dir);

			if(polycube.hasCubeAtPosition(adjacentPosition)){
				let cubeID = polycube.getCube(adjacentPosition);

				//Get the actual cube scene object
				let cubeObj = _edgePickPolycubes.get(polycube.ID).getObjectByName(getCubeName(cubeID));
				//Get the face to remove from the cube
				let faceObj = cubeObj.getObjectByName(wordToOppositeWord.get(word));
				//Remove the object
				cubeObj.remove(faceObj);

				//Now remove the appropriate face from the new cube model
				faceObj = newCubeModel.getObjectByName(word);
				newCubeModel.remove(faceObj);
			}
		})

		//give each edge a color according to the edge's ID. Color the body black.
		newCubeModel.children.map((face) => {
			let faceID = faceIDCalculator[face.name](newCubeID);
			face.children.map((facePiece) => {
				facePiece.material = new THREE.MeshBasicMaterial();

				if(facePiece.name === "body"){
					facePiece.material.color.setHex(0x000000);
				}
				else{
					facePiece.material.color.setHex(edgeIDCalculator[facePiece.name](faceID));
				}
			})
		}) 


		//Add the cube to the corresponding view polycube
		_edgePickPolycubes.get(polycube.ID).add(newCubeModel);

		//Set this cube model's position. Scale the position by 2
		newCubeModel.position.copy(cubePosition).multiplyScalar(2);
		newCubeModel.updateMatrix();
	}

	function addCubeToFacePick(polycube, newCubeID, cubePosition){
		//Create a new cube model
		let newCubeModel = modelTemplates.cube.clone();
		newCubeModel.matrixAutoUpdate = false;

		//Give this cube a name
		newCubeModel.name = getCubeName(polycube.cubeCount - 1);

		//Check in all directions. If there is an adjacent cube, remove the corresponding faces.
		wordToDirection.forEach(function(dir, word){

			let adjacentPosition = new THREE.Vector3().addVectors(cubePosition, dir);

			if(polycube.hasCubeAtPosition(adjacentPosition)){
				let cubeID = polycube.getCube(adjacentPosition);

				//Get the actual cube scene object
				let cubeObj = _facePickPolycubes.get(polycube.ID).getObjectByName(getCubeName(cubeID));
				//Get the face to remove from the cube
				let faceObj = cubeObj.getObjectByName(wordToOppositeWord.get(word));
				//Remove the object
				cubeObj.remove(faceObj);

				//Now remove the appropriate face from the new cube model
				faceObj = newCubeModel.getObjectByName(word);
				newCubeModel.remove(faceObj);
			}
		})

		//give each face a color according to the face's ID. This means coloring all of the face's children.
		newCubeModel.children.map((face) => {
			let faceID = faceIDCalculator[face.name](newCubeID);

			face.children.map((facePiece) => {
				facePiece.material = new THREE.MeshBasicMaterial();
				facePiece.material.color.setHex(faceID);
			})
		})

		//Add the cube to the corresponding view polycube
		_facePickPolycubes.get(polycube.ID).add(newCubeModel);

		//Set this cube model's position. Scale the position by 2
		newCubeModel.position.copy(cubePosition).multiplyScalar(2);
		newCubeModel.updateMatrix();
	}

	function getCubeName(cubeID){
		return "cube #" + cubeID;
	}
}