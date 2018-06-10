//Import some important definitions
import { directionWords, wordToDirection, wordToOppositeWord } from './utils.js';

//Import the dual graph class
import { DualGraph } from './dual-graph.js';

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

export const existsPolycubeName = function(polycubeName){ return MAP_PNAME.has(polycubeName); }

export class Polycube {
	constructor(polycubeName = ("Polycube_" + nextPid), autoCleanseFlag = true){
		//Private variables, objects
		P_PRIVATES.set(this, {
			id: nextPid,
			cubeCount: 0,
			name: polycubeName,
			doAutoCleanse: autoCleanseFlag,
			cubeMap: new Array(),
			dualGraph: new DualGraph(),
			//spatialMap: new SpatialMap(),
		});

		//Map this polycube's name and id to itself
		MAP_PNAME.set(polycubeName, this);
		MAP_PID.set(nextPid++, this);

		this.addCube(new THREE.Vector3(0, 0, 0));
	}


	//Add a cube to the specified position.
	//Returns true if the cube was successfully added, and false otherwise.
	addCube(cubePosition){
		//Bind private functions we are going to use to this instance
		canAddCube = canAddCube.bind(this);
		saveCubePosition = saveCubePosition.bind(this);

		//Check if this cube can be added. Bypass the check if this is the first cube
		if(P_PRIVATES.get(this).cubeCount > 0 && !canAddCube(cubePosition)){ return false; }

		//save this cube's position and increment the amount of cubes in the polycube
		saveCubePosition(cubePosition);

		P_PRIVATES.get(this).cubeCount += 1;
		return true;
	}

	//getters
	get cubeCount(){
		return P_PRIVATES.get(this).cubeCount;
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

			delete this;
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
	if(hasCubeAtPosition(cubePosition)){ return false; }
	//Check if there aren't any cubes adjacent to this one
	else if(!hasCubeAroundPosition(cubePosition)) { return false; }

	return true;
}

//Checks if a cube exists at this position
function hasCubeAtPosition(cubePosition){
	let CM = [...P_PRIVATES.get(this).cubeMap];
	
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
	wordToDirection.forEach(function(dir){
		if(hasCubeAtPosition(new THREE.Vector3().addVectors(cubePosition, dir))){
			foundCube = true;
		}
	})

	return foundCube;
}

function saveCubePosition(cubePosition){
	//Copy the cube map
	let newCM = [...P_PRIVATES.get(this).cubeMap];

	//Build new parts of the cube map if needed.
	if(!newCM[cubePosition.x]){
		newCM[cubePosition.x] = []
		newCM[cubePosition.x][cubePosition.y] = []
	}
	else if(!newCM[cubePosition.x][cubePosition.y]){
		newCM[cubePosition.x][cubePosition.y] = []
	}

	//Set the entry for this position in the cube map for true.
	//This just makes this entry something other than undefined.
	newCM[cubePosition.x][cubePosition.y][cubePosition.z] = true;

	//Copy the new cube map over to our private member.
	P_PRIVATES.get(this).cubeMap = [...newCM];
}