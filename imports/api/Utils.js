export const Y_OFFSET = -0.115
export const XZ_OFFSET = 0
export const NTY_RAD = 90*(Math.PI/180);

export const directionWords = ["up", "down", "right", "left", "front", "back", "up"];

export const wordToDirection = new Map(
	[["up", new THREE.Vector3(0, 1, 0)],
	["down", new THREE.Vector3(0, -1, 0)],
	["left", new THREE.Vector3(-1, 0, 0)],
	["right", new THREE.Vector3(1, 0, 0)],
	["front", new THREE.Vector3(0, 0, 1)],
	["back", new THREE.Vector3(0, 0, -1)]]);

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
