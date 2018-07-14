//Import the dual graph class
import { DualGraph } from './dual-graph/dual-graph.js';

import { SpatialMap } from './spatial-map.js';

//Class representing polycubes
//Polycubes are composed of cubes, a dual graph, and a spatial map.
//We use the ES6 class with the Weak Map technique to creating private variables.

//Static properties
//Maps a polycube instance to its private variables
const P_PRIVATES = new WeakMap();

//A counter that gives the ID of the next polycube
let nextPid = 0

//Maps a polycube's name to the actual object
const MAP_PNAME = new Map();

//Maps a polycube's id to the actual object
const MAP_PID = new Map();

const edgeEndpointCalculator = {
	"up" : {
		"up": (cubePosition) => { 
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, -1))
				];
			},
		"right": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, 1))
				];
			},
		"down": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, 1))
				];
			},
		"left": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, -1))
				];
			}
		},

	"down": {
			"up": (cubePosition) => { 
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, 1))
				];
			},
			"right": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, -1))
				];
			},
			"down": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, -1))
				];
			},
			"left": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, -1))
				];
			}
		},

	"right": {
			"up": (cubePosition) => { 
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, 1))
				];
			},
			"right": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, -1))
				];
			},
			"down": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, -1))
				];
			},
			"left": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, 1))
				];
			}
		},

	"left": {
			"up": (cubePosition) => { 
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, -1))
				];
			},
			"right": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, 1))
				];
			},
			"down": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, -1))
				];
			},
			"left": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, -1))
				];
			}
		},
	
	"front": {
			"up": (cubePosition) => { 
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, 1))
				];
			},
			"right": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, 1))
				];
			},
			"down": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, 1))
				];
			},
			"left": (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, 1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, 1))
				];
			}
		},

	"back": {
			"up" : (cubePosition) => { 
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, -1))
				];
			},
			"right" : (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, -1, -1))
				];
			},
			"down" : (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(-1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, -1))
				];
			},
			"left" : (cubePosition) => {
				return [
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, 1, -1)),
					new THREE.Vector3().addVectors(cubePosition, new THREE.Vector3(1, -1, -1))
				];
			}
		},
};

export class Polycube {
	constructor(polycubeName = Polycube.nextDefaultName()){
		//Private variables, objects
		P_PRIVATES.set(this, {
			id: nextPid,
			cubeCount: 0,
			faceCount: 0,
			name: polycubeName,
			cubeMap: new SpatialMap(),
			dualGraph: null,
		});

		P_PRIVATES.get(this).dualGraph = new DualGraph(P_PRIVATES.get(this).cubeMap);

		//Map this polycube's name and id to itself
		MAP_PNAME.set(polycubeName, this);
		MAP_PID.set(nextPid++, this);

		this.getCube = this.getCube.bind(this);
		this.getCubesAroundPosition = this.getCubesAroundPosition.bind(this);

		this.addCube(new THREE.Vector3(0, 0, 0));
	}


	//Add a cube to the specified position.
	//Returns true if the cube was successfully added, and false otherwise.
	addCube(cubePosition){
		
		let cubeCount = P_PRIVATES.get(this).cubeCount;

		//Check if this cube can be added. Bypass the check if this is the first cube
		if(cubeCount > 0 && !canAddCube(this, cubePosition)){ return false; }

		let faceCount = P_PRIVATES.get(this).faceCount;

		//multiply this cube's position by two. This is necessary to place faces and edges on an integer lattice
		let scaledCubePosition = cubePosition.clone().multiplyScalar(2);

		//reserve this cube's position
		reserveCubePosition(this, cubePosition);
		let newCube = this.getCube(cubePosition);

		//create faces
		let dualGraph = P_PRIVATES.get(this).dualGraph;

		let that = this;

		//An array of direction words that are set as "forebidden". A dir word is forebidden if an incident face
		//was found in the direction given by `dirWord` relative to the new cube.
		let dirWordIsForebidden = {};
		directionWords.map((dirWord) => {
			dirWordIsForebidden[dirWord] = false;
		})

		//Search for cubes in the direction given by `dirWord`. If there is such a cube, remove the appropriate face.
		directionWords.map((dirWord) => {
			let dirVector = wordToDirection.get(dirWord);
			let cubeInDirectionID = that.getCube(new THREE.Vector3().addVectors(cubePosition, dirVector));

			if(cubeInDirectionID != null){
				let oppositeDirectionWord = wordToOppositeWord.get(dirWord);
				let faceToRemoveID = faceIDCalculator[oppositeDirectionWord](cubeInDirectionID);

				dualGraph.removeFace(faceToRemoveID);

				//Set this direction word as forebidden.
				dirWordIsForebidden[dirWord] = true;

				//Decrement the face count, since we just removed a face.
				faceCount -= 1;
			}
		});

		//For direction words that are not forebidden (see above for a definition of 'forebidden' dir words),
		//add a face at that direction relative to the new cube's position in the dual graph.
		//Note that a "face" is both a face node and edge nodes representing the new face's edges.
		directionWords.map((dirWord) => {
			if(!dirWordIsForebidden[dirWord]){
				let dirVector = wordToDirection.get(dirWord);

				//Calculate the face's position
				let facePosition = new THREE.Vector3().addVectors(scaledCubePosition, dirVector);
				//Calculate the face's ID
				let faceID = faceIDCalculator[dirWord](cubeCount);

				//Generate the edge's data
				let edgeData = calculateEdgeData(faceID, scaledCubePosition, dirWord);

				//Add this new information to the dual graph
				dualGraph.addFace({id: faceID, position: facePosition, normal: dirVector, parentCubePosition: cubePosition, edgeData: edgeData}, P_PRIVATES.get(this).cubeMap);
				
				//Increment the face count
				faceCount += 1;
			}
		});

		P_PRIVATES.get(this).cubeCount = cubeCount + 1;
		P_PRIVATES.get(this).faceCount = faceCount;

		return true;
	}

	//Attempts to cut the dual graph at the specified edge. Returns true if successful. Returns false if the cut does not happen.
	cutEdge(edgeID){
		return P_PRIVATES.get(this).dualGraph.tryApplyCut(edgeID);
	}

	//getters
	get cubeCount(){
		return P_PRIVATES.get(this).cubeCount;
	}

	get faceCount(){
		return P_PRIVATES.get(this).faceCount;
	}

	get name(){
		return P_PRIVATES.get(this).name;
	}

	get ID(){
		return P_PRIVATES.get(this).id;
	}

	//setters
	//Set the name of this polycube. Delete the old reference, and then map this new name to this polycube.
	set name(newName){
		//Check if this new name already exists. If it does, don't change it.
		if(MAP_PNAME.has(newName)){ return; }

		let oldName = P_PRIVATES.get(this).name;

		MAP_PNAME.delete(oldName);

		P_PRIVATES.get(this).name = newName;

		MAP_PNAME.set(newName, this);
	}

	hasCubeAtPosition(cubePosition){
		return P_PRIVATES.get(this).cubeMap.hasDataAtPosition(cubePosition);
	}

	hasCubeAroundPosition(cubePosition){
		let hasCube = false;

		directions.map((dir) => {
			if(P_PRIVATES.get(this).cubeMap.hasDataAtPosition(new THREE.Vector3().addVectors(cubePosition, dir))){
				hasCube = true;
			}
		});

		return hasCube;
	}

	getCube(cubePosition){
		return P_PRIVATES.get(this).cubeMap.getData(cubePosition);
	}

	getCubesAroundPosition(cubePosition){
		let neighborList = [];
		directions.map((dir) => {
			neighborList.push(this.getCube(new THREE.Vector3().addVectors(cubePosition, dir)));
		})

		return neighborList;	
	}

	getFace(faceID){
		return P_PRIVATES.get(this).dualGraph.getFace(faceID);
	}

	getEdge(edgeID){
		return P_PRIVATES.get(this).dualGraph.getEdge(edgeID);
	}

	getFaceNeighbors(faceID){
		let neighbors = P_PRIVATES.get(this).dualGraph.getFaceNeighbors(faceID);

		let neighborIDs = [];
		neighbors.map((neighbor) => {
			neighborIDs.push(neighbor.ID);
		});

		return neighborIDs;
	}

	getEdgeNeighbors(edgeID){
		let neighborIDs = P_PRIVATES.get(this).dualGraph.getEdgeNeighbors(edgeID);

		return neighborIDs;
	}

	getIncidentEdge(edgeID){
		let incidentEdge = P_PRIVATES.get(this).dualGraph.getIncidentEdge(edgeID);

		if(incidentEdge != null){
			return incidentEdge.ID;
		}
		else{
			return 0;
		}
	}

	getCutTreeHingeLines(edgeID){
		return P_PRIVATES.get(this).dualGraph.getCutTreeHingeLines(edgeID);
	}

	getIndividualHingeLine(edgeID){
		return P_PRIVATES.get(this).dualGraph.getIndividualHingeLine(edgeID);
	}

	getDualGraphDecomposition(edgeID){
		return P_PRIVATES.get(this).dualGraph.getDualGraphDecomposition(edgeID);
	}

	rotateData(faceIDs, hingeEdgeID, rads){
		P_PRIVATES.get(this).dualGraph.rotateData(faceIDs, hingeEdgeID, rads);
	}

	tapeFaces(faceID1, faceID2){
		P_PRIVATES.get(this).dualGraph.tapeFaces(faceID1, faceID2);
	}

	//Removes all references to this object
	destroy(){
		try{
			if(!MAP_PNAME.delete(P_PRIVATES.get(this).name)){
				throw "ERROR: Polycube '" + P_PRIVATES.get(this).name + "'' has no entry in map `MAP_PNAME`.";
			}
			
			if(!MAP_PID.delete(P_PRIVATES.get(this).id)){
				throw "ERROR: Polycube '" + P_PRIVATES.get(this).name + "'' has no entry in map `MAP_PID`.";
			}

			P_PRIVATES.delete(this);
		}
		catch(err){
			console.error(err);
		}
	}

	static isNameTaken(name){
		return MAP_PNAME.has(name);
	}

	static nextDefaultName(){
		return "Polycube " + nextPid;
	}
}

//Private functions
//Checks if a new cube can be added to the polycube
function canAddCube(polycube, newCubePosition){

	//Check if there is already a cube at this position.
	if(polycube.hasCubeAtPosition(newCubePosition)){ return false; }
	//Check if there aren't any cubes adjacent to this one
	else if(!polycube.hasCubeAroundPosition(newCubePosition)) { return false; }

	return true;
}

//Place the new cube's ID (given by the current polycube count before adding this cube) at the given position
function reserveCubePosition(polycube, newCubePosition){
	P_PRIVATES.get(polycube).cubeMap.addToMap(P_PRIVATES.get(polycube).cubeCount, newCubePosition);
}

//Given the ID of a new face, the cube's position (scaled to 2 so we can place edges on a lattice), and the direction word for the new face,
//calculate the endpoints, position, axis, and ID for each edge of the new face.
//Returns a list of objects containing data on the edges.
function calculateEdgeData(parentFaceID, scaledCubePosition, dirWord1){
	let edgeData = [];

	wordToDirection.forEach(function(dir, dirWord2){

		if(dirWord2 !== "front" && dirWord2 !== "back"){
			let edgeEndpoints = edgeEndpointCalculator[dirWord1][dirWord2](scaledCubePosition);
		
			let facePosition = new THREE.Vector3().addVectors(scaledCubePosition, wordToDirection.get(dirWord1));
			let edgeAxis = toQ1Vector(new THREE.Vector3().subVectors(edgeEndpoints[0], edgeEndpoints[1]).normalize());
			let edgePosition = new THREE.Line3(edgeEndpoints[0], edgeEndpoints[1]).getCenter();

			let edgeID = edgeIDCalculator[dirWord2](parentFaceID);

			edgeData.push({id: edgeID, position: edgePosition, endpoints: edgeEndpoints, axis: edgeAxis})
		}
	})

	return edgeData;
}