//Module representing the polycube visualizer. This handles how polycubes are represented in
//scenes, including how highlights appear

//The different versions of polycubes we need to handle
let _viewPolycubes = new Map();
let _edgePickPolycubes = new Map();
let _facePickPolycubes = new Map();

//Highlight materials when mousing over components
const _HIGHLIGHT_MOUSE_SHIFT = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFFFF00});
const _HIGHLIGHT_MOUSE = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x00FF00});

//Highlight materials for cut edges
const _HIGHLIGHT_CUT = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFF0000});

//Highlight materials for hinges
const _HIGHLIGHT_HINGE = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x22EEDD});

//Highlight materials for face dual graph partitions
const _HIGHLIGHT_FACE_DUAL = [
	new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFE9DA2}),
	new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFFD670}),
	new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x74EB67}),
	new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x7081DB})
]

//Highlights for adjacency
const _HIGHLIGHT_ADJ_PRIME = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x4BD3C5});
const _HIGHLIGHT_ADJ_SEC = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xFFEA88});

//Material for inactive parts in picking scenes.
const _INACTIVE_PICK_PART_MAT = new THREE.MeshBasicMaterial({color : 0x000000});

const _visibleHighlights = [];

const _modelTemplates = {cube: null, face: null, edge: null};

let _edgeHighlightPair = [null, null];
let _faceHighlight = null;
let _previewCube = null;

const _hingeHighlights = [];

export const setPolyViewTemplates = function(templates){
	_modelTemplates.cube = templates.cube.clone();
	_modelTemplates.face = templates.face.clone();
	_modelTemplates.edge = templates.edge.clone();

	_edgeHighlightPair = [_modelTemplates.edge.clone(), _modelTemplates.edge.clone()];
	_faceHighlight = _modelTemplates.face.clone();
	_previewCube = _modelTemplates.cube.clone();

	_faceHighlight.scale.set(0.9, 0.9, 0.9);

	_previewCube.children.map((face) => {
		face.children.map((part) => {
			part.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: part.material.color.getHex()});
		});
	});

	_edgeHighlightPair[0].visible = false;
	_edgeHighlightPair[1].visible = false;
	_faceHighlight.visible = false;
	_previewCube.visible = false;

	return {edgeHighlightPair: _edgeHighlightPair, faceHighlight: _faceHighlight, previewCube: _previewCube}
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
	getFaceObjs: (polycubeID, ...faceIDs) => {
		let viewPoly = _viewPolycubes.get(polycubeID)
		let edgePoly = _edgePickPolycubes.get(polycubeID);
		let facePoly = _facePickPolycubes.get(polycubeID);

		let faces = [];

		faceIDs.map((ID) => {
			let faceObjName = faceName.withFaceID(ID);

			faces.push(viewPoly.getObjectByName(faceObjName));
			faces.push(edgePoly.getObjectByName(faceObjName));
			faces.push(facePoly.getObjectByName(faceObjName));
		})

		return faces;
	},
	//Handles edge mouse over highlight. Note that edges are allowed to be incident, so we should expect two IDs.
	showEdgeHighlight: (polycubeID, edge1ID, edge2ID, isShiftDown) => {
		let polycube = _viewPolycubes.get(polycubeID);
		let highlightMaterial = isShiftDown ? _HIGHLIGHT_MOUSE_SHIFT: _HIGHLIGHT_MOUSE;

		let edgeObj1 = polycube.getObjectByName(edgeName.withEdgeID(edge1ID));

		let position1 = edgeObj1.getWorldPosition();
		let rotation1 = edgeObj1.getWorldRotation();

		_edgeHighlightPair[0].position.copy(position1);
		_edgeHighlightPair[0].rotation.copy(rotation1);
		_edgeHighlightPair[0].material = highlightMaterial;
		_edgeHighlightPair[0].updateMatrix();
		_edgeHighlightPair[0].visible = true;

		//polycube.add(_edgeHighlightPair[0]);

		_visibleHighlights.push(_edgeHighlightPair[0]);

		//console.log("Highlighting edge#" + edge1ID);

		//If there is an incident edge, then do the same as above but to this second edge.
		if(edge2ID !== 0){
			let edgeObj2 = polycube.getObjectByName(edgeName.withEdgeID(edge2ID));

			let position2 = edgeObj2.getWorldPosition();
			let rotation2 = edgeObj2.getWorldRotation();

			_edgeHighlightPair[1].position.copy(position2);
			_edgeHighlightPair[1].rotation.copy(rotation2);
			_edgeHighlightPair[1].material = highlightMaterial;
			_edgeHighlightPair[1].updateMatrix();
			_edgeHighlightPair[1].visible = true;

			//polycube.add(_edgeHighlightPair[1]);

			_visibleHighlights.push(_edgeHighlightPair[1]);

			//console.log("Highlight edge#" + edge2ID);
		}
	},
	showEdgeAdjacencyHighlight(polycubeID, edge1ID, edge2ID, edgeNeighborIDs){
		let polycube = _viewPolycubes.get(polycubeID);
		let edge1Obj = polycube.getObjectByName(edgeName.withEdgeID(edge1ID));

		let highlight1 = edge1Obj.getObjectByName("adjacency");
		highlight1.material = _HIGHLIGHT_ADJ_PRIME;
		highlight1.visible = true;

		_visibleHighlights.push(highlight1);

		if(edge2ID !== 0){
			let edge2Obj = polycube.getObjectByName(edgeName.withEdgeID(edge2ID));

			let highlight2 = edge2Obj.getObjectByName("adjacency");
			highlight2.material = _HIGHLIGHT_ADJ_PRIME;
			highlight2.visible = true;

			_visibleHighlights.push(highlight2);
		}

		edgeNeighborIDs.map((neighborID) => {
			let edgeObj = polycube.getObjectByName(edgeName.withEdgeID(neighborID));

			let highlight = edgeObj.getObjectByName("adjacency");
			highlight.material = _HIGHLIGHT_ADJ_SEC;
			highlight.visible = true;

			_visibleHighlights.push(highlight);
		})
	},
	showCutHighlight(polycubeID, ...edgeIDs){

		let polycube = _viewPolycubes.get(polycubeID);

		edgeIDs.map((ID) => {
			let edgeObj = polycube.getObjectByName(edgeName.withEdgeID(ID));

			let cutHighlight = edgeObj.getObjectByName("cut");
			let hingeHighlight = edgeObj.getObjectByName("hinge");

			hingeHighlight.visible = false;
			cutHighlight.visible = true;
		});
	},
	hideCutHighlight(polycubeID, ...edgeIDs){
		let polycube = _viewPolycubes.get(polycubeID);

		edgeIDs.map((ID) => {
			let edgeObj = polycube.getObjectByName(edgeName.withEdgeID(ID));

			let cutHighlight = edgeObj.getObjectByName("cut");

			cutHighlight.visible = false;
		})
	},
	showHingeLines(polycubeID, hingeLines){
		let polycube = _viewPolycubes.get(polycubeID);

		hingeLines.map((line) => {
			line.map((edgeID) => {
				let edgeObj = polycube.getObjectByName(edgeName.withEdgeID(edgeID));

				let hingeHighlight = edgeObj.getObjectByName("hinge");

				_hingeHighlights.push(hingeHighlight);

				hingeHighlight.visible = true;
			});
		});
	},
	hideHingeLines(polycubeID){
		let polycube = _viewPolycubes.get(polycubeID);

		_hingeHighlights.map((hingeHighlight) => {
				hingeHighlight.visible = false;
		});
	},
	//Shows the appropriate face mouse-over highlight
	showFaceHighlight: (polycubeID, faceID, isShiftDown) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let faceObj = polycube.getObjectByName(faceName.withFaceID(faceID));

		let position = faceObj.getWorldPosition();
		let rotation = faceObj.getWorldRotation();

		_faceHighlight.position.copy(position);
		_faceHighlight.rotation.copy(rotation);
		_faceHighlight.material = isShiftDown ? _HIGHLIGHT_MOUSE_SHIFT: _HIGHLIGHT_MOUSE ;
		_faceHighlight.updateMatrix();
		_faceHighlight.visible = true;

		_visibleHighlights.push(_faceHighlight);

		//polycube.add(_faceHighlight);

		
	},
	//Highlight mode meant for debugging. Shows the face and its neighbors.
	showFaceAdjacencyHighlight: (polycubeID, mainFaceID, faceNeighborIDs) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let mainFaceBody = polycube.getObjectByName(faceName.withFaceID(mainFaceID)).getObjectByName("body");

		mainFaceBody.children[0].material = _HIGHLIGHT_ADJ_PRIME;
		mainFaceBody.children[0].visible = true;

		_visibleHighlights.push(mainFaceBody.children[0]);

		faceNeighborIDs.map((neighborID) => {
			let neighborFaceBody = polycube.getObjectByName(faceName.withFaceID(neighborID)).getObjectByName("body");

			neighborFaceBody.children[0].material = _HIGHLIGHT_ADJ_SEC;
			neighborFaceBody.children[0].visible = true;

			_visibleHighlights.push(neighborFaceBody.children[0]);
		});
	},
	//Draws dual graph decomposition
	showDualGraphDecomposition: (polycubeID, decomposition) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let dualIndex = 0;
		for(var p in decomposition){
			let piece = decomposition[p];

			for(var f in piece){
				let faceID = piece[f];

				let faceBody = polycube.getObjectByName(faceName.withFaceID(faceID)).getObjectByName("body");

				faceBody.children[0].material = _HIGHLIGHT_FACE_DUAL[dualIndex];

				faceBody.children[0].visible = true;
			}

			dualIndex = (dualIndex + 1) % _HIGHLIGHT_FACE_DUAL.length;
		}
	},
	//Hide the dual graph decomposition highlights.
	//We need to keep in mind that mouse over highlights and preview cubes may be children in the polycube.
	//In this case, we ignore them by simply checking if they have a component called "body". If it does, we just need to check if it has
	//a child.
	hideDualGraphDecomposition: (polycubeID) => {
		let polycube = _viewPolycubes.get(polycubeID);

		for(var f in polycube.children){
			let face = polycube.children[f];

			let faceBody = face.getObjectByName("body");

			if(faceBody == null || faceBody === undefined) continue;

			let faceBodyHighlight = faceBody.children[0];

			if(faceBodyHighlight != null && faceBodyHighlight !== undefined)
				faceBodyHighlight.visible = false;
		}
	},
	//Draws a preview cube on top of the given face
	showPreviewCube: (polycubeID, faceID) => {
		let polycube = _viewPolycubes.get(polycubeID);

		let faceObj = polycube.getObjectByName(faceName.withFaceID(faceID));

		let position = new THREE.Vector3().addVectors(faceObj.getWorldPosition(), wordToDirection.get(faceIDtoDirWord(faceID)));

		_previewCube.position.copy(position);
		_previewCube.updateMatrix();
		_previewCube.visible = true;

		//polycube.add(_previewCube);
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

	console.log(viewNewCube);

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
				let cutHighlight = _modelTemplates.edge.clone();
				cutHighlight.material = _HIGHLIGHT_CUT;
				cutHighlight.name = "cut";
				cutHighlight.visible = false;
				comp.add(cutHighlight);

				let hingeHighlight = _modelTemplates.edge.clone();
				hingeHighlight.material = _HIGHLIGHT_HINGE;
				hingeHighlight.name = "hinge";
				hingeHighlight.visible = false;
				comp.add(hingeHighlight);

				let adjacencyHighlight = _modelTemplates.edge.clone();
				adjacencyHighlight.name = "adjacency";
				adjacencyHighlight.visible = false;
				comp.add(adjacencyHighlight);

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
}

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