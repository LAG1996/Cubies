//Import some important definitions
import { directions, directionWords, wordToDirection, wordToOppositeWord, toQ1Vector } from './utils.js';

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

console.log(edgeEndpointCalculator);

export const existsPolycubeName = function(polycubeName){ return MAP_PNAME.has(polycubeName); }

export class Polycube {
	constructor(polycubeName = ("Polycube_" + nextPid), autoCleanseFlag = true){
		//Private variables, objects
		P_PRIVATES.set(this, {
			id: nextPid,
			cubeCount: 0,
			faceCount: 0,
			name: polycubeName,
			doAutoCleanse: autoCleanseFlag,
			cubeMap: new Array(),
			dualGraph: new DualGraph(),
			//spatialMap: new SpatialMap(),
		});

		//Map this polycube's name and id to itself
		MAP_PNAME.set(polycubeName, this);
		MAP_PID.set(nextPid++, this);

		console.log("polycube created");
		this.addCube(new THREE.Vector3(0, 0, 0));
	}


	//Add a cube to the specified position.
	//Returns true if the cube was successfully added, and false otherwise.
	addCube(cubePosition){
		//Bind private functions we are going to use to this instance
		canAddCube = canAddCube.bind(this);
		reserveCubePosition = reserveCubePosition.bind(this);
		getNeighboringCubes = getNeighboringCubes.bind(this);
		getCubeAtPosition = getCubeAtPosition.bind(this);
		hasCubeAtPosition = hasCubeAtPosition.bind(this);

		let cubeCount = P_PRIVATES.get(this).cubeCount;
		let faceCount = P_PRIVATES.get(this).faceCount;

		//multiply this cube's position by two.
		cubePosition = cubePosition.clone().multiplyScalar(2);
		console.log("Checking if I can add a cube at ")
		console.log(cubePosition);

		//Check if this cube can be added. Bypass the check if this is the first cube
		if(cubeCount > 0 && !canAddCube(cubePosition)){ return false; }

		//reserve this cube's position, increment the amount of cubes, and the amount of faces in the polycube
		reserveCubePosition(cubePosition);

		cubeCount += 1;
		faceCount += 6;

		let newCube = getCubeAtPosition(cubePosition);
		//create faces
		let dualGraph = P_PRIVATES.get(this).dualGraph;
		
		wordToDirection.forEach(function(dir, word){
			let facePosition = new THREE.Vector3().addVectors(cubePosition, dir);

			if(dualGraph.hasFaceAt(facePosition)){
				console.log("There is a face at ");
				console.log(facePosition);
				dualGraph.removeFace(facePosition);

				faceCount -= 2;
			}
			else
			{
				let edgeData = calculateEdgeData(cubePosition, word);

				dualGraph.addFace({position: facePosition, edges: edgeData});
			}

		})

		P_PRIVATES.get(this).cubeCount = cubeCount;
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
function canAddCube(cubePosition){
	//Bind private functions to `this` polycube instance.
	hasCubeAtPosition = hasCubeAtPosition.bind(this);
	hasCubeAroundPosition = hasCubeAroundPosition.bind(this);

	//Check if there is already a cube at this position.
	if(hasCubeAtPosition(cubePosition)){ console.log("Cube already exists at " + cubePosition.toArray().toString()); return false; }
	//Check if there aren't any cubes adjacent to this one
	else if(!hasCubeAroundPosition(cubePosition)) { console.log("No cubes around " + cubePosition.toArray().toString()); return false; }

	return true;
}

//Checks if a cube exists at this position
function hasCubeAtPosition(cubePosition){
	let CM = P_PRIVATES.get(this).cubeMap;
	
	if(!CM[cubePosition.x]){
		return false;
	}
	else if(!CM[cubePosition.x][cubePosition.y]){
		return false;
	}
	else if(!CM[cubePosition.x][cubePosition.y][cubePosition.z]){
		return false;
	}

	return true;
}

//Checks in the six directions around the given position for the existence of a cube.
function hasCubeAroundPosition(cubePosition){
	let foundCube = false;

	directions.forEach(function(dir){
		let scaledDirection = dir.clone().multiplyScalar(2);

		if(hasCubeAtPosition(new THREE.Vector3().addVectors(cubePosition, scaledDirection))){
			foundCube = true;
		}
	})

	return foundCube;
}

function reserveCubePosition(cubePosition){
	//Grab the reference for the cubeMap
	let newCM = P_PRIVATES.get(this).cubeMap;

	//Build new parts of the cube map if needed.
	if(!newCM[cubePosition.x]){
		newCM[cubePosition.x] = []
		newCM[cubePosition.x][cubePosition.y] = []
	}
	else if(!newCM[cubePosition.x][cubePosition.y]){
		newCM[cubePosition.x][cubePosition.y] = []
	}

	//Set the entry for this position in the cube map.
	newCM[cubePosition.x][cubePosition.y][cubePosition.z] = true;
}

function getNeighboringCubes(cubePosition){
	let neighborList = [];
	directions.forEach(function(dir){
		neighborList.push(getCubeAtPosition(new THREE.Vector3().addVectors(cubePosition, dir)));
	})

	return neighborList;
}

function getCubeAtPosition(cubePosition){
	if(hasCubeAtPosition(cubePosition)){
		return P_PRIVATES.get(this).cubeMap[cubePosition.x][cubePosition.y][cubePosition.z];
	}
}

function addFace(facePosition){
	return P_PRIVATES.get(this).dualGraph.addFace(facePosition);
}

function removeFace(cube, facePosition){
	P_PRIVATES.get(this).dualGraph.removeFace(facePosition);
}

function calculateEdgeData(cubePosition, dirWord1){
	let edgeData = [];

	wordToDirection.forEach(function(dir, dirWord2){

		if(dirWord2 !== "front" && dirWord2 !== "back"){
			let edgeEndpoints = edgeEndpointCalculator[dirWord1][dirWord2](cubePosition);
		
			let facePosition = new THREE.Vector3().addVectors(cubePosition, wordToDirection.get(dirWord1));
			let edgePosition = facePosition.add(dir);
		
			edgeData.push({position: edgePosition, endpoints: edgeEndpoints})
		}
	})

	return edgeData;
}