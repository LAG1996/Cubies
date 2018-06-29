const Y_OFFSET = -0.115
const XZ_OFFSET = 0
const NTY_RAD = 90*(Math.PI/180);

const degToRad = function(deg){
	return deg*(Math.PI/180);
}

const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const left = new THREE.Vector3(-1, 0, 0);
const right = new THREE.Vector3(1, 0, 0);
const front = new THREE.Vector3(0, 0, 1);
const back = new THREE.Vector3(0, 0, -1);

const directionWords = ["up", "down", "left", "right", "front", "back"];

const directions = [up, down, left, right, front, back];

const wordToDirection = new Map(
	[["up", up],
	["down", down],
	["left", left],
	["right", right],
	["front", front],
	["back", back]]);

const wordToOppositeWord = new Map(
	[["up", "down"], 
	["down", "up"], 
	["right", "left"], 
	["left", "right"], 
	["front", "back"], 
	["back", "front"]]);

const toLatticeVector = function(vector){

	let lattPos = vector.clone();

	lattPos.round();

	return lattPos;
}

const toQ1Vector = function(vector){
	let newVec = vector.clone();

	newVec.x = newVec.x < 0 ? newVec.x * -1 : newVec.x;
	newVec.y = newVec.y < 0 ? newVec.y * -1 : newVec.y;
	newVec.z = newVec.z < 0 ? newVec.z * -1 : newVec.z;

	return newVec;
}

const vectorIsOrthogonal = function(vector){
	let vec = toQ1Vector(vector);
	return (vec.equals(up) || vec.equals(right) || vec.equals(front));
}

//Maps a direction word to a function that gives the ID of a face based off the 
const faceIDCalculator = {
	"up": (cubeID) => { return (cubeID * 6) + 1;},
	"down" : (cubeID) => { return (cubeID * 6) + 2; },
	"left" : (cubeID) => { return (cubeID * 6) + 3; },
	"right" : (cubeID) => { return (cubeID * 6) + 4; },
	"front" : (cubeID) => { return (cubeID * 6) + 5; },
	"back" : (cubeID) => { return (cubeID * 6) + 6; }
}

//Given a cube's ID, get a list of that cube's faces' ID's.
const getFaceIDBundle = function(cubeID){
	let faceBundle = [];
	directionWords.map((dirWord) => {
		faceBundle.push(faceIDCalculator[dirWord](cubeID));
	});

	return faceBundle;
}

const edgeIDCalculator = {
	"up" : (faceID) => { return ((faceID - 1) * 4) + 1; },
	"down" : (faceID) => { return ((faceID - 1) * 4) + 2; },
	"left" : (faceID) => { return ((faceID - 1) * 4) + 3; },
	"right" : (faceID) => { return ((faceID - 1) * 4) + 4; }
}

const faceName = {
	withCubeID: (cubeID, direction) => {
		return "face" + faceIDCalculator[direction](cubeID);
	},
	withFaceID: (faceID) => {
		return "face" + faceID;
	}
}

const edgeName = {
	withFaceID: (faceID, direction) => {
		return "edge" + edgeIDCalculator[direction](faceID);
	},
	withEdgeID: (edgeID) => {
		return "edge" + edgeID;
	}
}

const faceIDtoDirWord = function(faceID){
	let mod = faceID % 6;

	switch(mod){
		case 1: return "up"; break;
		case 2: return "down"; break;
		case 3: return "left"; break;
		case 4: return "right"; break;
		case 5: return "front"; break;
		case 0: return "back"; break;
	}
}

const edgeIDtoDirWord = function(edgeID){
	let mod = edgeID % 4;

	switch(mod){
		case 1: return "up"; break;
		case 2: return "down"; break;
		case 3: return "left"; break;
		case 0: return "right"; break;
	}
}

const clearArray = function(array){
	array.length = 0;
}