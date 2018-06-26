import { FaceNode, EdgeNode } from './dual-graph-nodes.js';

import { SpatialMap } from '../spatial-map.js'

//Class representing the dual graph of a polycube
//In this case, we refer to the face dual graph and the edge dual graph, the edge analogue to the face dual graph.

//Static members
const DG_PRIVATES = new WeakMap();
export class DualGraph{
	constructor(cubeMap){
		DG_PRIVATES.set(this, {
			faceHash: new Map(),
			edgeHash: new Map(),
			edgeMap: new SpatialMap(),
			faceMap: new SpatialMap(),
			cubeMap: cubeMap,
			edgeIsCut: new Map(),
			cutTrees: new Map(),
			tapedEdgesCache: [],
			edgeToCutTreeIndex: new Map(),
			edgeToHingeIndex: new Map(),
		})
	}

	//Attempts to apply a cut to the edge given by the ID.
	//A cut is not successful if the given edge is already a boundary or if the cut would result in a disconnected dual graph.
	tryApplyCut(edgeID){
		let edgeNode = DG_PRIVATES.get(this).edgeHash.get(edgeID);

		if(!edgeNode.isBoundary){
			let edgeNodeIncident = edgeNode.incidentEdge;

			DG_PRIVATES.get(this).edgeIsCut.set(edgeNode, true);
			DG_PRIVATES.get(this).edgeIsCut.set(edgeNodeIncident, true);

			let face1 = edgeNode.parent;
			let face2 = edgeNodeIncident.parent;

			face1.removeNeighbor(face2);
			face2.removeNeighbor(face1);

			computeCutTrees(this, edgeNode);

			console.log(DG_PRIVATES.get(this).cutTrees);

			edgeNode.removeIncidentEdge();
			edgeNodeIncident.removeIncidentEdge();
			return true;
		}

		return false;
	}

	//getters
	get faceHash(){
		return [...DG_PRIVATES.get(this).faceHash];
	}

	get edgeHash(){
		return [...DG_PRIVATES.get(this).edgeHash];
	}

	get tapedEdgesCache(){
		let tapedEdges = [...DG_PRIVATES.get(this).tapedEdgesCache];

		DG_PRIVATES.get(this).tapedEdgesCache = [];

		return tapedEdges;
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
		let newFaceNode = new FaceNode(faceObj.id, faceObj.position, faceObj.normal, faceObj.parentCubePosition);

		addEdges(this, newFaceNode, faceObj.edgeData);

		findAdjacentFaces(this, newFaceNode);

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
			DG_PRIVATES.get(this).edgeIsCut.delete(edgeNode);

			removeEdgeFromMap(this, edgeNode);
		});

		let faceNode = this.getFace(faceID);

		faceNode.neighbors.map((neighbor) => {
			findAdjacentFaces(this, neighbor, );
		});

		faceNode.destroy();
		DG_PRIVATES.get(this).faceHash.delete(faceID);
	}

	//Given a list of faces, set adjacencies as appropriate.
	setAdjacentFaces(faceIDs){}

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

		edgeList.splice(edgeList.indexOf(edgeNode), 1);

	}
}

//Finds faces adjacent to a new face node, and sets them as neighbors.
//This should be called only when a new cube is added in the polycube.
//Faces can be adjacent to each other only if they have incident edges and either
//	a. their cubes are adjacent
//	b. their cubes share a common neighbor.
function findAdjacentFaces(dualGraph, faceNode){
	let edgeNodes = faceNode.edges;
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;
	let cubeMap = DG_PRIVATES.get(dualGraph).cubeMap;

	//Look for edges incident to this faces' edges
	edgeNodes.map((edgeNode) => {
		let incidentEdges = edgeMap.getData(edgeNode.position);

		//If edges incident to this edge node exist, check if the faces' cubes fit the criteria enumerated above.
		if(incidentEdges != null){
			incidentEdges.map((incidentEdge) => {
				if(incidentEdge.parent != faceNode){
					let face2 = incidentEdge.parent;

					let facesAreAdjacent = false;

					let normal1 = faceNode.normal;
					let normal2 = face2.normal;

					if(faceNode.parentCubePosition.distanceTo(face2.parentCubePosition) <= 1){
						setComponentRelationships(dualGraph, faceNode, face2, edgeNode, incidentEdge);
					}
					else{
						//Check if the two faces' cubes have a common neighbor.
						let face2Dir = faceIDtoDirWord(face2.ID);

						let commonNeighborDir = wordToDirection.get(wordToOppositeWord.get(face2Dir));

						if(cubeMap.hasDataAtPosition(new THREE.Vector3().addVectors(faceNode.parentCubePosition, commonNeighborDir))){
							setComponentRelationships(dualGraph, faceNode, face2, edgeNode, incidentEdge);
						}
					}
				}
			})
		}
	});
}

//Sets relationships between components of the dual graphs (i.e. adjacency and incidence)
function setComponentRelationships(dualGraph, face1, face2, edge1, edge2){

	//Set the two faces as neighbors
	face1.addNeighbor(face2);
	face2.addNeighbor(face1);

	let edgeIsCut = DG_PRIVATES.get(dualGraph).edgeIsCut;
	let cutEdges = DG_PRIVATES.get(dualGraph).cutEdges;

	if(edgeIsCut.get(edge1) && edgeIsCut.get(edge2)) { return false; }

	if(edgeIsCut.get(edge1)){
		DG_PRIVATES.get(dualGraph).tapedEdgesCache.push(edge1);
	}
	if(edgeIsCut.get(edge2)){
		DG_PRIVATES.get(dualGraph).tapedEdgesCache.push(edge2);
	}

	edge1.incidentEdge = edge2;
	edge2.incidentEdge = edge1;

	edgeIsCut.set(edge1, false);
	edgeIsCut.set(edge2, false);

	setEdgeAdjacency(face1, face2);
}

function setEdgeAdjacency(face1, face2){
	face1.edges.map((face1Edge) => {
		face2.edges.map((face2Edge) => {
			if(face1Edge.incidentEdge !== face2Edge){
				if(face1Edge.endpoints[0].equals(face2Edge.endpoints[0])
					|| face1Edge.endpoints[0].equals(face2Edge.endpoints[1])
					|| face1Edge.endpoints[1].equals(face2Edge.endpoints[0])
					|| face1Edge.endpoints[1].equals(face2Edge.endpoints[1])){

					face1Edge.addNeighbor(face2Edge);
					face2Edge.addNeighbor(face1Edge);
				}
			}
		});
	});
}

//Computes cut trees around the newly cut edge.
//If this edge is an isolated cut, then it is the seed of a new tree of cuts.
//If this edge is adjacent to another cut, then it will be joined to the tree that the latter cut belongs to.
//We also handle the case where two disjoint cut trees are bridged by the newly cut edge.
function computeCutTrees(dualGraph, newlyCutEdge){
	//Get all neigbhors of the edge and its incident edge
	let neighbors = newlyCutEdge.getAllNeighbors();
	let incidentEdge = newlyCutEdge.incidentEdge;

	//Grab references to private variables.
	let cutTrees = DG_PRIVATES.get(dualGraph).cutTrees;
	let edgeToCutTreeIndex = DG_PRIVATES.get(dualGraph).edgeToCutTreeIndex;

	//Search the neighbors. If a neighbor is cut, grab its cut tree index.
	let cutTreeIndex = -1;
	for(var n in neighbors){
		if(neighbors[n].isBoundary){
			cutTreeIndex = edgeToCutTreeIndex.get(neighbors[n].ID);
			break;
		}
	}

	//If no neighbors are cut (i.e., the cut tree index is -1), just set our own. We are done.
	if(cutTreeIndex === -1){
		if(cutTrees.size === 0){
			cutTrees.set(0, [newlyCutEdge, incidentEdge]);
			edgeToCutTreeIndex.set(newlyCutEdge.ID, 0);
			edgeToCutTreeIndex.set(incidentEdge.ID, 0);
		}
		else{
			for(var i = 1; i <= cutTrees.size; i++){
				if(!cutTrees.has(i)){
					cutTrees.set(i, [newlyCutEdge, incidentEdge]);
					edgeToCutTreeIndex.set(newlyCutEdge.ID, i);
					edgeToCutTreeIndex.set(incidentEdge.ID, i);
					break;
				}
			}
		}
		return;
	}

	//If we found a cut tree index then we need to do the following:
	//1. add this edge (and its incident edge) to the cut tree
	//2. check if any neighbors are cut. If so, then this new edge may have bridged two cut trees. We'll need to handle that.

	//Add the new edge and its incident edge to the cut tree, and map these edges to this cut tree index.
	cutTrees.get(cutTreeIndex).push(newlyCutEdge, incidentEdge);
	edgeToCutTreeIndex.set(newlyCutEdge.ID, cutTreeIndex);
	edgeToCutTreeIndex.set(incidentEdge.ID, cutTreeIndex);

	//Check all neighbors. If there are any cut neighbors of a different cut tree, then we need to join that tree to this one.
	for(var n in neighbors){
		let neighborNode = neighbors[n];
		let neighborCutTreeIndex = edgeToCutTreeIndex.get(neighborNode.ID);

		if(neighborNode.isBoundary && neighborCutTreeIndex !== cutTreeIndex){
			let cutTree = cutTrees.get(neighborCutTreeIndex);

			//This neighbor is of a different cut tree, so we need to add it to this cut tree, and map it to this cut tree index.
			cutTree.map((edgeNode) => {
				cutTrees.get(cutTreeIndex).push(edgeNode.ID);
				edgeToCutTreeIndex.set(edgeNode.ID, cutTreeIndex);
			});

			//We lose the reference to the cut tree neighbor was part of, since it has been concatenated into the other one.
			cutTrees.delete(neighborCutTreeIndex);

			//We can stop here since it is only possible for an edge to bridge at most two cut trees together.
			break;
		}
	}
}