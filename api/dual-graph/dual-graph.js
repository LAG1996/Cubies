import { FaceNode, EdgeNode } from './dual-graph-nodes.js';

//Class representing the dual graph of a polycube
//In this case, we refer to the face dual graph and the edge dual graph, the edge analogue to the face dual graph.
//We use the ES6 method of defining the class and the WeakMap technique to defining private properties

//Static members
const DG_PRIVATES = new WeakMap();
export class DualGraph{
	constructor(){
		DG_PRIVATES.set(this, {
			faceMap: [],
			edgeMap: [],
			cutEdges: [],
			edgeToCutTreeIndex: new Map(),
			edgeToHinge: new Map(),
		})
	}

	//Given an object representing a polycube face, add it to the dual graph.
	/*
		faceObj will require the following properties:
			* position : THREE.Vector3
			* edges : Array(4)
	*/
	addFace(faceObj){
		//Bind private functions that we'll be using here
		placeNewFaceNode = placeNewFaceNode.bind(this);

		let newFaceNode = new FaceNode(faceObj.position);
		let edges = addEdges(newFaceNode, faceObj.edges);
		setAdjacentFaces(newFaceNode);
		placeNewFaceNode(newFaceNode.position, newFaceNode);
	}

	//Check if there is a face at the specified position.
	hasFaceAt(facePosition){
		let FM = DG_PRIVATES.get(this).faceMap;

		if(!FM[facePosition.x]){
			return false;
		}
		else if(!FM[facePosition.x][facePosition.y]){
			return false;
		}
		else if(!FM[facePosition.x][facePosition.y][facePosition.z]){
			return false;
		}

		return true;
	}

	removeFace(facePosition){
		let FM = DG_PRIVATES.get(this).faceMap;

		if(FM[facePosition.x] && FM[facePosition.x][facePosition.y] && FM[facePosition.x][facePosition.y][facePosition.z]){
			FM[facePosition.x][facePosition.y][facePosition.z].destroy();
		}
	}

	destroy(){
		DG_PRIVATES.delete(this);
	}
}

//Private methods
//Given a reference to a faceNode as the parent and a list of edges,
//add an edge node to the dual graph.
/*
	Each element of the edge list requires the following properties:
		* endpoints: [ THREE.Vector3, THREE.Vector3 ]
		* position : THREE.Vector3
*/
function addEdges(faceParent, edges){
}

function placeNewFaceNode(facePosition, faceNode){
	let FM = DG_PRIVATES.get(this).faceMap;

	if(!FM[facePosition.x]){
		FM[facePosition.x] = [];
		FM[facePosition.x][facePosition.y] = [];
	}
	else if(!FM[facePosition.x][facePosition.y]){
		FM[facePosition.x][facePosition.y] = [];
	}

	FM[facePosition.x][facePosition.y][facePosition.z] = faceNode;
}

function setAdjacentFaces(faceNode){}