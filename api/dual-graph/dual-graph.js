import { FaceNode, EdgeNode } from './dual-graph-nodes.js';

import { SpatialMap } from '/api/spatial-map.js'

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
			edgeMap: new SpatialMap(),
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
	addFace(faceObj, cubeMap){
		let newFaceNode = new FaceNode(faceObj.id, faceObj.position, faceObj.parentCubePosition);

		addEdges(this, newFaceNode, faceObj.edgeData);

		findAdjacentFaces(this, newFaceNode, cubeMap);

		DG_PRIVATES.get(this).faceHash.set(newFaceNode.ID, newFaceNode);
	}

	//Check if there is a face with the given ID.
	hasFace(faceID){
		return DG_PRIVATES.get(this).faceHash.has(faceID);
	}

	//Remove the face 
	removeFace(faceID){
		let edgeNodes = this.getEdgesFromFace(faceID);

		edgeNodes.map((edgeNode) => { 
			DG_PRIVATES.get(this).edgeHash.delete(edgeNode.ID);

			removeEdgeFromMap(this, edgeNode);
		} )

		let faceNode = this.getFace(faceID);
		faceNode.destroy();
		DG_PRIVATES.get(this).faceHash.delete(faceID);
	}

	//Given a list of faces, set adjacencies as appropriate.
	setAdjacentFaces(faceIDs){
		console.log(faceIDs);

		faceIDs.map((faceID) => {
			let faceNode = DG_PRIVATES.get(this).faceHash.get(faceID);

			if(faceNode !== undefined){
			}
		})

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
		let newEdgeNode = new EdgeNode(edge.id, edge.position, edge.endpoints, edge.axis, parentFace);
		DG_PRIVATES.get(dualGraph).edgeHash.set(newEdgeNode.ID, newEdgeNode);
		parentFace.addEdge(newEdgeNode);
		addEdgeToMap(dualGraph, newEdgeNode);
	});
}

//Add the new edge to the edge spatial map.
function addEdgeToMap(dualGraph, edgeNode){
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;

	if(!edgeMap.hasDataAtPosition(edgeNode.position)){
		edgeMap.addToMap([edgeNode], edgeNode.position);
	}
	else{
		edgeMap.getData(edgeNode.position).push(edgeNode);
	}
}

//Remove this edge from the edge spatial map.
function removeEdgeFromMap(dualGraph, edgeNode){

	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;

	if(edgeMap.hasDataAtPosition(edgeNode.position)){
		let edgeList = edgeMap.getData(edgeNode.position);

		console.log(edgeMap.getData(edgeNode.position).length);
		edgeList.splice(edgeList.indexOf(edgeNode), 1);
		console.log(edgeMap.getData(edgeNode.position).length);
	}
}

//Finds faces adjacent to a new face node, and sets them as neighbors.
//This should be called only when a new cube is added in the polycube.
//Faces can be adjacent to each other only if they have incident edges and either
//	a. their cubes are adjacent
//	b. their cubes share a common neighbor.
function findAdjacentFaces(dualGraph, newFaceNode, cubeMap){
	let edgeNodes = newFaceNode.edges;
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;

	//Look for edges incident to this faces' edges
	edgeNodes.map((edgeNode) => {
		let incidentEdges = edgeMap.getData(edgeNode.position);

		//If edges incident to this edge node exist, check if the faces' cubes fit the criteria enumerated above.
		if(incidentEdges != null){
			incidentEdges.map((edge) => {
				if(edge.parent != newFaceNode){
					let face2 = edge.parent;

					if(newFaceNode.parentCubePosition.distanceTo(face2.parentCubePosition) <= 1){
						newFaceNode.addNeighbor(face2, edge, edgeNode);
						face2.addNeighbor(newFaceNode, edgeNode, edge);
					}
					else{
						//Check if the two faces' cubes have a common neighbor.
						let face2Dir = faceIDtoDirWord(face2.ID);

						let commonNeighborDir = wordToDirection.get(wordToOppositeWord.get(face2Dir));

						if(cubeMap.hasDataAtPosition(new THREE.Vector3().addVectors(newFaceNode.parentCubePosition, commonNeighborDir))){
							newFaceNode.addNeighbor(face2, edge, edgeNode);
							face2.addNeighbor(newFaceNode, edgeNode, edge);
						}
					}
				}
			})
		}
	});
}