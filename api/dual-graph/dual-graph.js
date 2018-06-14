import { FaceNode, EdgeNode } from './dual-graph-nodes.js';

import { directionWords, faceIDCalculator, edgeIDCalculator } from '/api/utils.js';
//Class representing the dual graph of a polycube
//In this case, we refer to the face dual graph and the edge dual graph, the edge analogue to the face dual graph.
//We use the ES6 method of defining the class and the WeakMap technique to defining private properties

//Static members
const DG_PRIVATES = new WeakMap();
export class DualGraph{
	constructor(){
		DG_PRIVATES.set(this, {
			faceHash: new Map(),
			edgeHash: new Map(),
			cutEdges: [],
			edgeToCutTreeIndex: new Map(),
			edgeToHinge: new Map(),
		})
	}
	//getters
	get faceHash(){
		return DG_PRIVATES.get(this).faceHash;
	}

	get edgeHash(){
		return DG_PRIVATES.get(this).edgeHash;
	}

	getFace(faceID){
		return DG_PRIVATES.get(this).faceHash.get(faceID);
	}

	getEdge(edgeID){
		return DG_PRIVATES.get(this).edgeHash.get(edgeID);
	}

	getEdgesFromFace(faceID){
		return DG_PRIVATES.get(this).faceHash.get(faceID).edges;
	}

	//Given an object representing a polycube face, add it to the dual graph.
	/*
		faceObj will require the following properties:
			* position : THREE.Vector3
			* edgeData : Array(4)
	*/
	addFace(faceObj){
		let newFaceNode = new FaceNode(faceObj.id, faceObj.position);
		
		addEdges(this, newFaceNode, faceObj.edgeData);
		mapFace(this, newFaceNode.ID, newFaceNode);
	}

	//Check if there is a face with the given ID.
	hasFace(faceID){
		return DG_PRIVATES.get(this).faceHash.has(faceID);
	}

	//Remove the face 
	removeFace(faceID){
		let edgeNodes = this.getEdgesFromFace(faceID);

		edgeNodes.map((edge) => { DG_PRIVATES.get(this).edgeHash.delete(edgeNode.ID);} )

		let faceNode = this.getFace(faceID);
		faceNode.destroy();
		DG_PRIVATES.get(this).faceHash.delete(faceID);
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
function addEdges(dualGraph, parentFace, edgeData){
	edgeData.map((edge) => {
		let newEdgeNode = new EdgeNode(edgeData.id, edgeData.position, edgeData.endpoints, edgeData.axis, parentFace);
		DG_PRIVATES.get(dualGraph).edgeHash.set(newEdgeNode.ID, newEdgeNode);
	})
}

//Places a node of the specified type into their respective map.
function mapFace(dualGraph, faceID, newFaceNode){
	DG_PRIVATES.get(dualGraph).faceHash.set(faceID, newFaceNode);
}

function setAdjacentFaces(faceNode){}

//Setup functions meant to be called when adding new cube