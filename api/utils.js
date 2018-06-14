export const Y_OFFSET = -0.115
export const XZ_OFFSET = 0
export const NTY_RAD = 90*(Math.PI/180);

const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const left = new THREE.Vector3(-1, 0, 0);
const right = new THREE.Vector3(1, 0, 0);
const front = new THREE.Vector3(0, 0, 1);
const back = new THREE.Vector3(0, 0, -1);

export const directionWords = ["up", "down", "right", "left", "front", "back", "up"];

export const directions = [up, down, left, right, front, back, up];

export const wordToDirection = new Map(
	[["up", up],
	["down", down],
	["left", left],
	["right", right],
	["front", front],
	["back", back]]);

export const wordToOppositeWord = new Map(
	[["up", "down"], 
	["down", "up"], 
	["right", "left"], 
	["left", "right"], 
	["front", "back"], 
	["back", "front"]]);

export const toLattice = function(position){

	let lattPos = position.clone();

	lattPos.x = Math.round(lattPos.x);
	lattPos.y = Math.round(lattPos.y);
	lattPos.z = Math.round(lattPos.z);

	return lattPos;
}

export const toQ1Vector = function(vector){
	let newVec = vector.clone();

	newVec.x = newVec.x < 0 ? newVec.x * -1 : newVec.x;
	newVec.y = newVec.y < 0 ? newVec.y * -1 : newVec.y;
	newVec.z = newVec.z < 0 ? newVec.z * -1 : newVec.z;

	return newVec;
}

//Maps a direction word to a function that gives the ID of a face based off the 
export const faceIDCalculator = {
	"up": (cubeCount) => { return cubeCount * 6;},
	"down" : (cubeCount) => { return (cubeCount * 6) + 1; },
	"left" : (cubeCount) => { return (cubeCount * 6) + 2; },
	"right" : (cubeCount) => { return (cubeCount * 6) + 3; },
	"front" : (cubeCount) => { return (cubeCount * 6) + 4; },
	"back" : (cubeCount) => { return (cubeCount * 6) + 5; }
}

export const edgeIDCalculator = {
	"up" : (faceID) => { return faceID * 4 + 1; },
	"down" : (faceID) => { return (faceID * 4) + 2; },
	"left" : (faceID) => { return (faceID * 4) + 3; },
	"right" : (faceID) => { return (faceID * 4) + 4; }
}