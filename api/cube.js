//import important utility definitions
import { toLattice } from './utils.js';

//Static members
const C_PRIVATES = new WeakMap();


class Cube{
	constructor(cubeID, cubePosition, parentPolycube){
		//Set private properties
		C_PRIVATES.set(this, {
			id: cubeID,
			parent: parentPolycube,
			position: toLattice(cubePosition)
		})
	}

	get faceName(dir){
		return C_PRIVATES.get(this).name + "direction";
	}

	get edgeName(dir1, dir2){
		return C_PRIVATES.get(this).name
	}

	destroy(){}
}

//private methods