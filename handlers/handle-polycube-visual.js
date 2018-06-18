//Module representing the polycube visualizer. This handles how polycubes are represented in
//scenes, including how highlights appear

//The different versions of polycubes we need to handle
let _viewPolycubes = new Map();
let _edgePickPolycubes = new Map();
let _facePickPolycubes = new Map();

//Highlight materials when mousing over
const _HIGHLIGHT_MOUSE_SHIFT = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFFFF00});
const _HIGHLIGHT_MOUSE = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x00FF00});

//Highlight materials for cut edges
const _HIGHLIGHT_CUT = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFF0000});

//Highlight materials for hinges
const _HIGHLIGHT_HINGE = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x22EEDD});

//Highlight materials for face dual graph partitions
const _HIGHLIGHT_FACE_DUAL1 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFF0000});
const _HIGHLIGHT_FACE_DUAL2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color:0x0000FF});

//Material for inactive parts in picking scenes.
const _INACTIVE_PICK_PART_MAT = new THREE.MeshBasicMaterial({color : 0x000000});

const _visibleHighlights = [];

const _modelTemplates = {cube: null, face: null, edge: null};

let _edgeHighlight = null;
let _faceHighlight = null;
let _previewCube = null;

export const setModelTemplates = function(templates){
	_modelTemplates.cube = templates.cube.clone();
	_modelTemplates.face = templates.face.clone();
	_modelTemplates.edge = templates.edge.clone();

	_edgeHighlight = _modelTemplates.edge.clone();
	_faceHighlight = _modelTemplates.face.clone();
	_previewCube = _modelTemplates.cube.clone();

	_faceHighlight.scale.set(0.9, 0.9, 0.9);

	_previewCube.children.map((face) => {
		face.children.map((part) => {
			part.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: part.material.color.getHex()});
		});
	});

	_edgeHighlight.visible = false;
	_faceHighlight.visible = false;
	_previewCube.visible = false;
}

export const PolycubeVisualHandler = {
	onNewPolycube: (newPolycube) => {
			let newPolycubeModel = new THREE.Group();
			newPolycubeModel.matrixAutoUpdate = false;

			_viewPolycubes.set(newPolycube.ID, newPolycubeModel.clone());
			_edgePickPolycubes.set(newPolycube.ID, newPolycubeModel.clone());
			_facePickPolycubes.set(newPolycube.ID, newPolycubeModel.clone());

			addCube(newPolycube, 0, new THREE.Vector3(0, 0, 0));
	},
	onNewCube: (polycube, newCubePosition) => {
		addCube(polycube, polycube.cubeCount - 1, newCubePosition);
	},
	onDestroyPolycube: (polycubeID) => {
		let viewPolycube = _viewPolycubes.get(polycubeID);
		let edgePickPolycube = _edgePickPolycubes.get(polycubeID);
		let facePickPolycube = _facePickPolycubes.get(polycubeID);

		viewPolycube.parent.remove(viewPolycube);
		edgePickPolycube.parent.remove(edgePickPolycube);
		facePickPolycube.parent.remove(facePickPolycube);

		_viewPolycubes.delete(polycubeID);
		_edgePickPolycubes.delete(polycubeID);
		_facePickPolycubes.delete(polycubeID);
	},
	getViewPolycube: (polycubeID) => {
		return _viewPolycubes.get(polycubeID);
	},
	getEdgePickPolycube: (polycubeID) => {
		return _edgePickPolycubes.get(polycubeID);
	},
	getFacePickPolycube: (polycubeID) => {
		return _facePickPolycubes.get(polycubeID);
	},
	showEdgeHighlight: (polycubeID, edgeID, isRegular) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let edgeObj = polycube.getObjectByName(edgeName.withEdgeID(edgeID));

		let position = edgeObj.getWorldPosition();
		let rotation = edgeObj.getWorldRotation();

		_edgeHighlight.position.copy(position);
		_edgeHighlight.rotation.copy(rotation);
		_edgeHighlight.material = isRegular ? _HIGHLIGHT_MOUSE : _HIGHLIGHT_MOUSE_SHIFT;
		_edgeHighlight.updateMatrix();
		_edgeHighlight.visible = true;

		polycube.add(_edgeHighlight);

		_visibleHighlights.push(_edgeHighlight);
	},
	showFaceHighlight: (polycubeID, faceID, isRegular) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let faceObj = polycube.getObjectByName(faceName.withFaceID(faceID));

		let position = faceObj.getWorldPosition();
		let rotation = faceObj.getWorldRotation();

		_faceHighlight.position.copy(position);
		_faceHighlight.rotation.copy(rotation);
		_faceHighlight.material = isRegular ? _HIGHLIGHT_MOUSE : _HIGHLIGHT_MOUSE_SHIFT;
		_faceHighlight.updateMatrix();
		_faceHighlight.visible = true;

		polycube.add(_faceHighlight);

		_visibleHighlights.push(_faceHighlight);
	},
	showFaceAdjacencyHighlight: (polycubeID, mainFaceID, faceNeighborIDs) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let mainFaceBody = polycube.getObjectByName(faceName.withFaceID(mainFaceID)).getObjectByName("body");

		mainFaceBody.children[0].material = _HIGHLIGHT_FACE_DUAL1;
		mainFaceBody.visible = true;

		_visibleHighlights.push(mainFaceBody.children[0]);

		faceNeighborIDs.map((neighborID) => {
			let neighborFaceBody = polycube.getObjectByName(faceName.withFaceID(neighborID)).getObjectByName("body");

			neighborFaceBody.children[0].material = _HIGHLIGHT_FACE_DUAL2;
			neighborFaceBody.children[0].visible = true;

			_visibleHighlights.push(neighborFaceBody.children[0]);
		});
	},
	showPreviewCube: (polycubeID, faceID) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let faceObj = polycube.getObjectByName(faceName.withFaceID(faceID));

		let position = new THREE.Vector3().addVectors(faceObj.getWorldPosition(), wordToDirection.get(faceIDtoDirWord(faceID)));

		_previewCube.position.copy(position);
		_previewCube.updateMatrix();
		_previewCube.visible = true;

		polycube.add(_previewCube);
	},
	hidePreviewCube: () => {
		_previewCube.visible = false;
	},
	hideHighlights: () => {
		_visibleHighlights.map((highlight) => {
			highlight.visible = false;
		});

		clearArray(_visibleHighlights);
	}
}

//Given a polycube object (so that we can ask about cube positions), the new cube's ID, and the new cube's position,
//add the new cube's faces to the scene.
//This does this in a few steps:
/*
	* Step 1: Remove incident faces
	* Step 2: Color the face and edge picking cubes
	* Step 3: Add the appropriate highlight meshes
	* Step 4: Add the faces to the appropriate polycube Groups
*/
function addCube(polycube, newCubeID, cubePosition){
	//Create a new cube model
	let newCubeModel = _modelTemplates.cube.clone();

	//Get the three different polycubes we're interested in.
	let viewPoly = _viewPolycubes.get(polycube.ID);
	let edgePoly = _edgePickPolycubes.get(polycube.ID);
	let facePoly = _facePickPolycubes.get(polycube.ID);

	//Check in all directions. If there is an adjacent cube, remove the corresponding faces.
	for(var w in directionWords){
		let word = directionWords[w];
		let dir = wordToDirection.get(word);

		let adjacentPosition = new THREE.Vector3().addVectors(cubePosition, dir);
		if(polycube.hasCubeAtPosition(adjacentPosition)){

			//Get the face's name
			let cubeID = polycube.getCube(adjacentPosition);
			let faceID = faceIDCalculator[wordToOppositeWord.get(word)](cubeID);
			let fName = faceName.withFaceID(faceID);

			//Remove the appropriate face from each polycube
			viewPoly.remove(viewPoly.getObjectByName(fName));
			edgePoly.remove(edgePoly.getObjectByName(fName));
			facePoly.remove(facePoly.getObjectByName(fName));

			//Remove the appropriate face from the new cube model
			for(var index in newCubeModel.children){
				if(newCubeModel.children[index].name == word){
					newCubeModel.remove(newCubeModel.children[index]);
					break;
				}
			}
		}
	}

	//Color the faces and edges for each scene appropriately.
	let viewNewCube = newCubeModel.clone();
	let edgeNewCube = newCubeModel.clone();
	let faceNewCube = newCubeModel.clone();

	colorEdges(edgeNewCube, newCubeID);
	colorFaces(faceNewCube, newCubeID);

	let scaledCubePosition = cubePosition.clone().multiplyScalar(2);

	viewNewCube.children.map((face) => {
		let position = new THREE.Vector3().addVectors(face.position, scaledCubePosition);
		let rotation = face.getWorldRotation();

		face.position.copy(toLatticeVector(position));
		face.rotation.copy(rotation);

		//Add the appropriate highlights to each part of the face
		face.children.map((comp) => {
			if(comp.name === "body"){
				let dualGraphHighlight = comp.clone();
				dualGraphHighlight.visible = false;
				comp.add(dualGraphHighlight);
			}
			else{
				let cutHighlight = comp.clone();
				cutHighlight.material = _HIGHLIGHT_CUT;
				cutHighlight.name = "cut";
				cutHighlight.visible = false;
				comp.add(cutHighlight);

				let hingeHighlight = comp.clone();
				hingeHighlight.material = _HIGHLIGHT_HINGE;
				hingeHighlight.name = "hinge";
				hingeHighlight.visible = false;
				comp.add(hingeHighlight);

				comp.name = edgeName.withFaceID(faceIDCalculator[face.name](newCubeID), comp.name);
			}
		})

		face.name = faceName.withCubeID(newCubeID, face.name);
		face.matrixAutoUpdate = false;
		face.updateMatrix();

		viewPoly.add(face.clone());
	})

	edgeNewCube.children.map((face) => {
		let position = new THREE.Vector3().addVectors(face.position, scaledCubePosition);
		let rotation = face.getWorldRotation();

		face.position.copy(toLatticeVector(position));
		face.rotation.copy(rotation);

		face.name = faceName.withCubeID(newCubeID, face.name);

		face.matrixAutoUpdate = false;
		face.updateMatrix();

		edgePoly.add(face.clone());
	})

	faceNewCube.children.map((face) => {
		let position = new THREE.Vector3().addVectors(face.position, scaledCubePosition);
		let rotation = face.getWorldRotation();

		face.position.copy(toLatticeVector(position));
		face.rotation.copy(rotation);

		face.name = faceName.withCubeID(newCubeID, face.name);

		face.matrixAutoUpdate = false;
		face.updateMatrix();

		facePoly.add(face.clone());
	})

	function colorEdges(cubeModel, newCubeID){
		cubeModel.children.map((face) => {
			let faceID = faceIDCalculator[face.name](newCubeID);
			face.children.map((facePiece) => {
				if(facePiece.name === "body"){
					facePiece.material = _INACTIVE_PICK_PART_MAT;
				}
				else{
					facePiece.material = new THREE.MeshBasicMaterial();
					facePiece.material.color.setHex(edgeIDCalculator[facePiece.name](faceID));
				}
			})
		})	
	}

	function colorFaces(cubeModel, newCubeID){
		//give each face a color according to the face's ID. This means coloring all of the face's children.
		cubeModel.children.map((face) => {
			let faceID = faceIDCalculator[face.name](newCubeID);
			face.children.map((facePiece) => {
				if(facePiece.name === "body"){
					facePiece.material = new THREE.MeshBasicMaterial();
					facePiece.material.color.setHex(faceID)
				}
				else{
					facePiece.material = _INACTIVE_PICK_PART_MAT;
				}
			})
		})
	}
}