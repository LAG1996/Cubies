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
