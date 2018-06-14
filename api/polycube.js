//Import some important definitions
import { directions, directionWords, wordToDirection, wordToOppositeWord, toQ1Vector } from './utils.js';
import { faceIDCalculator, edgeIDCalculator } from './utils.js';

//Import the dual graph class
import { DualGraph } from './dual-graph/dual-graph.js';

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

export const existsPolycubeName = function(polycubeName){ return MAP_PNAME.has(polycubeName); }
export const existsPolycubeID = function(polycubeID){ return MAP_PID.has(polycubeID); }
export const nextDefaultName = function(){ return "Polycube_" + nextPid; }

export class Polycube {
	constructor(polycubeName = nextDefaultName()){
		//Private variables, objects
		P_PRIVATES.set(this, {
			id: nextPid,
			cubeCount: 0,
			faceCount: 0,
			name: polycubeName,
			cubeMap: new Array(),
			dualGraph: new DualGraph(),
			//spatialMap: new SpatialMap(),
		});

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
		wordToDirection.forEach(function(dir, dirWord){
			//If there is a cube in the direction given by `dir`, then there is a face incident to this one.
			//We need to remove that face.
			let cubeInDirectionID = that.getCube(new THREE.Vector3().addVectors(cubePosition, dir));
			if(typeof cubeInDirectionID === "number"){

				let oppositeDirectionWord = wordToOppositeWord.get(dirWord);
				let faceToRemoveID = faceIDCalculator[oppositeDirectionWord](cubeInDirectionID);

				dualGraph.removeFace(faceToRemoveID);

				//Decrement the face count, since we just removed a face.
				faceCount -= 1;

			}
			//Otherwise, generate the data for the new face, including data for its edges.
			else
			{
				//Calculate this face's position
				let facePosition = new THREE.Vector3().addVectors(scaledCubePosition, dir);
				//Calculate this face's ID
				let faceID = faceIDCalculator[dirWord](cubeCount);

				//Generate the edge's data
				let edgeData = calculateEdgeData(faceID, scaledCubePosition, dirWord);

				dualGraph.addFace({id: faceID, position: facePosition, parentCubePosition: cubePosition, edgeData: edgeData});

				//Increment the face count.
				faceCount += 1;
			}
		})

		P_PRIVATES.get(this).cubeCount = cubeCount + 1;
		P_PRIVATES.get(this).faceCount = faceCount;

		return true;
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
		let CM = P_PRIVATES.get(this).cubeMap;
		
		if(typeof CM[cubePosition.x] === 'undefined'){
			return false;
		}
		else if(typeof CM[cubePosition.x][cubePosition.y] === 'undefined'){
			return false;
		}
		else if(typeof CM[cubePosition.x][cubePosition.y][cubePosition.z] === 'undefined'){
			return false;
		}

		return true;
	}



	getCube(cubePosition){
		if(this.hasCubeAtPosition(cubePosition)){
			return P_PRIVATES.get(this).cubeMap[cubePosition.x][cubePosition.y][cubePosition.z];
		}

		return null;
	}

	getCubesAroundPosition(cubePosition){
		let neighborList = [];
		directions.map((dir) => {
			neighborList.push(this.getCube(new THREE.Vector3().addVectors(cubePosition, dir)));
		})

		return neighborList;	
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
}

//Private functions
function canAddCube(polycube, cubePosition){

	//Check if there is already a cube at this position.
	if(hasCubeAtPosition(polycube, cubePosition)){ return false; }
	//Check if there aren't any cubes adjacent to this one
	else if(!hasCubeAroundPosition(polycube, cubePosition)) { return false; }

	return true;
}

//Checks if a cube exists at this position
function hasCubeAtPosition(polycube, cubePosition){
	let CM = P_PRIVATES.get(polycube).cubeMap;
	
	if(typeof CM[cubePosition.x] === 'undefined'){
		return false;
	}
	else if(typeof CM[cubePosition.x][cubePosition.y] === 'undefined'){
		return false;
	}
	else if(typeof CM[cubePosition.x][cubePosition.y][cubePosition.z] === 'undefined'){
		return false;
	}

	return true;
}

//Checks in the six directions around the given position for the existence of a cube.
function hasCubeAroundPosition(polycube, cubePosition){
	let foundCube = false;

	directions.forEach(function(dir){
		if(hasCubeAtPosition(polycube, new THREE.Vector3().addVectors(cubePosition, dir))){
			foundCube = true;
		}
	})

	return foundCube;
}

function reserveCubePosition(polycube, cubePosition){
	//Grab the reference for the cubeMap
	let newCM = P_PRIVATES.get(polycube).cubeMap;

	//Build new parts of the cube map if needed.
	if(!newCM[cubePosition.x]){
		newCM[cubePosition.x] = []
		newCM[cubePosition.x][cubePosition.y] = []
	}
	else if(!newCM[cubePosition.x][cubePosition.y]){
		newCM[cubePosition.x][cubePosition.y] = []
	}

	//Set the entry for this position in the cube map.
	newCM[cubePosition.x][cubePosition.y][cubePosition.z] = P_PRIVATES.get(polycube).cubeCount;
}

function addFace(polycube, facePosition){
	return P_PRIVATES.get(polycube).dualGraph.addFace(facePosition);
}

function removeFace(polycube, cube, facePosition){
	P_PRIVATES.get(polycube).dualGraph.removeFace(facePosition);
}

function calculateEdgeData(parentFaceID, cubePosition, dirWord1){
	let edgeData = [];

	wordToDirection.forEach(function(dir, dirWord2){

		if(dirWord2 !== "front" && dirWord2 !== "back"){
			let edgeEndpoints = edgeEndpointCalculator[dirWord1][dirWord2](cubePosition);
		
			let facePosition = new THREE.Vector3().addVectors(cubePosition, wordToDirection.get(dirWord1));
			let edgeAxis = toQ1Vector(new THREE.Vector3().subVectors(edgeEndpoints[0], edgeEndpoints[1]).normalize());
			let edgePosition = new THREE.Line3(edgeEndpoints[0], edgeEndpoints[1]).getCenter();

			let edgeID = edgeIDCalculator[dirWord2](parentFaceID);

			edgeData.push({id: edgeID, position: edgePosition, endpoints: edgeEndpoints, axis: edgeAxis})
		}
	})

	return edgeData;
}