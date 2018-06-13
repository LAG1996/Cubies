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
	//getters
	get faceMap(){
		return DG_PRIVATES.get(this).faceMap;
	}

	get edgeMap(){
		return DG_PRIVATES.get(this).edgeMap;
	}

	//Given an object representing a polycube face, add it to the dual graph.
	/*
		faceObj will require the following properties:
			* position : THREE.Vector3
			* edges : Array(4)
	*/
	addFace(faceObj){
		//Bind private functions that we'll be using here
		addEdges = addEdges.bind(this);

		let newFaceNode = new FaceNode(faceObj.position);
		addEdges(this, newFaceNode, faceObj.edges);
		placeNodeAt(DG_PRIVATES.get(this).faceMap, newFaceNode.position, newFaceNode);
	}

	//Check if there is a face at the specified position.
	hasFaceAt(facePosition){
		return hasNodeAt(DG_PRIVATES.get(this).faceMap, facePosition);
	}

	hasEdgeAt(edgePosition){
		return hasNodeAt(DG_PRIVATES.get(this).edgeMap, edgePosition);
	}

	removeFace(facePosition){
		let faceMap = DG_PRIVATES.get(this).faceMap;
		if(hasNodeAt(faceMap, facePosition)){
			faceMap[facePosition.x][facePosition.y][facePosition.z].destroy();
		}
	}

	removeEdge(edgePosition){
		let edgeMap = DG_PRIVATES.get(this).edgeMap;
		if(hasNodeAt(edgeMap, edgePosition)){
			edgeMap[edgePosition.x][edgePosition.y][edgePosition.z].destroy();
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
function addEdges(dualGraph, faceParent, edges){
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;

	edges.forEach(function(edge){
		let newEdgeNode = new EdgeNode(edge.position, edge.endpoints, edge.axis, faceParent);
		placeNodeAt(edgeMap, edge.position, newEdgeNode);
		faceParent.addEdge(newEdgeNode);
	})
}

//Places a node of the specified type into their respective map.
function placeNodeAt(map, nodePosition, newNode){

	if(!map[nodePosition.x]){
		map[nodePosition.x] = [];
		map[nodePosition.x][nodePosition.y] = [];
	}
	else if(!map[nodePosition.x][nodePosition.y]){
		map[nodePosition.x][nodePosition.y] = [];
	}

	map[nodePosition.x][nodePosition.y][nodePosition.z] = newNode;
}

function hasNodeAt(map, nodePosition){

	if(!map[nodePosition.x]){ return false; }
	else if(!map[nodePosition.x][nodePosition.y]){ return false; }
	else if(!map[nodePosition.x][nodePosition.y][nodePosition.z]){ return false; }

	return true;
}

function getNodeAt(map, nodePosition){

	if(hasNodeAt(map, nodePosition)){
		return map[nodePosition.x][nodePosition.y][nodePosition.z]
	}
}


function setAdjacentFaces(faceNode){}

//Setup functions meant to be called when adding new cube