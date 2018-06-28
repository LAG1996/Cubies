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
			edgeEndpointMap: new SpatialMap(),
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
		let edgeIsCut = DG_PRIVATES.get(this).edgeIsCut;

		if(!edgeNode.isCut){
			let incidentEdgeNode = this.getIncidentEdge(edgeID);

			edgeNode.isCut = true;
			incidentEdgeNode.isCut = true;

			let face1 = this.getFace(edgeNode.parentID);
			let face2 = this.getFace(incidentEdgeNode.parentID);

			face1.removeNeighbors(face2);
			face2.removeNeighbors(face1);

			computeCutTrees(this, edgeNode);
			computeHingeLines(this, edgeNode);

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

	getFaceNeighbors(faceID){
		let faceNode = DG_PRIVATES.get(this).faceHash.get(faceID);

		return faceNode.neighbors;
	}

	getEdge(edgeID){
		return DG_PRIVATES.get(this).edgeHash.get(edgeID);
	}

	getEdgeNeighbors(edgeID){
		let edgeNode = DG_PRIVATES.get(this).edgeHash.get(edgeID);

		let neighbors = [];

		findAdjacentEdges(this, edgeNode, neighbors);
		let incidentEdge = edgeNode.incidentEdge;
		
		if(incidentEdge != null){
			findAdjacentEdges(this, incidentEdge, neighbors);
		}
		
		return neighbors;
	}

	getIncidentEdge(edgeID){
		let edgeNode = DG_PRIVATES.get(this).edgeHash.get(edgeID);

		return edgeNode.incidentEdge;
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

		DG_PRIVATES.get(this).faceHash.set(newFaceNode.ID, newFaceNode);
		addEdges(this, newFaceNode, faceObj.edgeData);

		let faceNeighbors = findAdjacentFaces(this, newFaceNode);

		faceNeighbors.map((neighbor) => {
			neighbor.addNeighbors(newFaceNode);
			newFaceNode.addNeighbors(neighbor);
		});
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

			removeEdgeFromMaps(this, edgeNode);
		});

		let faceNode = this.getFace(faceID);

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
		let newEdgeNode = new EdgeNode(edge.id, edge.position, edge.endpoints, edge.axis, parentFace.ID);

		parentFace.addEdge(newEdgeNode);
		addEdgeToMaps(dualGraph, newEdgeNode);

		DG_PRIVATES.get(dualGraph).edgeHash.set(newEdgeNode.ID, newEdgeNode);
		
		let incidentEdge = findIncidentEdge(dualGraph, newEdgeNode);

		if(incidentEdge != null){
			newEdgeNode.incidentEdge = incidentEdge;
			incidentEdge.incidentEdge = newEdgeNode;
		}
	});
}

//Add the new edge to the corresponding spatial maps.
function addEdgeToMaps(dualGraph, edgeNode){
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;
	let endpointMap = DG_PRIVATES.get(dualGraph).edgeEndpointMap;

	if(!edgeMap.hasDataAtPosition(edgeNode.position)){
		edgeMap.addToMap([edgeNode], edgeNode.position);
	}
	else{
		edgeMap.getData(edgeNode.position).push(edgeNode);
	}

	if(!endpointMap.hasDataAtPosition(edgeNode.endpoints[0])){
		endpointMap.addToMap([edgeNode], edgeNode.endpoints[0]);
	}
	else{
		endpointMap.getData(edgeNode.endpoints[0]).push(edgeNode);
	}

	if(!endpointMap.hasDataAtPosition(edgeNode.endpoints[1])){
		endpointMap.addToMap([edgeNode], edgeNode.endpoints[1]);
	}
	else{
		endpointMap.getData(edgeNode.endpoints[1]).push(edgeNode);
	}
}

//Remove this edge from its corresponding spatial maps.
function removeEdgeFromMaps(dualGraph, edgeNode){

	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;
	let endpointMap = DG_PRIVATES.get(dualGraph).edgeEndpointMap;

	if(edgeMap.hasDataAtPosition(edgeNode.position)){
		let edgeList = edgeMap.getData(edgeNode.position);

		edgeList.splice(edgeList.indexOf(edgeNode), 1);
	}

	if(endpointMap.hasDataAtPosition(edgeNode.endpoints[0])){
		let edgeList = endpointMap.getData(edgeNode.endpoints[0]);

		edgeList.splice(edgeList.indexOf(edgeNode), 1);	
	}

	if(endpointMap.hasDataAtPosition(edgeNode.endpoints[1])){
		let edgeList = endpointMap.getData(edgeNode.endpoints[1]);

		edgeList.splice(edgeList.indexOf(edgeNode), 1);	
	}
}

//Finds faces adjacent to a new face node, and sets them as neighbors.
//This should be called only when a new cube is added in the polycube.
//Faces can be adjacent to each other only if they have incident edges and either
//	a. their cubes are adjacent
//	b. their cubes share a common neighbor.
function findAdjacentFaces(dualGraph, faceNode){
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;
	let cubeMap = DG_PRIVATES.get(dualGraph).cubeMap;

	let neighbors = [];

	//Look for edges incident to this faces' edges
	faceNode.edges.map((edgeNode) => {
		let incidentEdges = edgeMap.getData(edgeNode.position);
		
		//If edges incident to this edge node exist, check if the faces' cubes fit the criteria enumerated above.
		if(incidentEdges != null){
			incidentEdges.map((incidentEdge) => {
				if(incidentEdge.parentID != faceNode.ID){
					let face2 = dualGraph.getFace(incidentEdge.parentID);
		
					let normal1 = faceNode.normal;
					let normal2 = face2.normal;
		
					if(cubesAreAdjacent(faceNode.parentCubePosition, face2.parentCubePosition)){
						neighbors.push(face2);
					}
					else{
						if(cubesShareCommonNeighbor(dualGraph, faceNode.parentCubePosition, face2.parentCubePosition)){
							neighbors.push(face2);
						}
					}
				}
			})
		}

	});

	return neighbors;
}

function findAdjacentEdges(dualGraph, edgeNode, neighborList){
	let endpointMap = DG_PRIVATES.get(dualGraph).edgeEndpointMap;

	let edgeList = [...endpointMap.getData(edgeNode.endpoints[0]), ...endpointMap.getData(edgeNode.endpoints[1])];

	edgeList.map((otherEdge) => {
		if(otherEdge !== edgeNode && !otherEdge.position.equals(edgeNode.position)){
			let face1 = dualGraph.getFace(edgeNode.parentID);
			let face2 = dualGraph.getFace(otherEdge.parentID);

			if(face1 === face2
				|| dualGraph.getFaceNeighbors(face1.ID).includes(face2)
				|| cubesAreAdjacent(face1.parentCubePosition, face2.parentCubePosition)
				|| cubesShareCommonNeighbor(dualGraph, face1.parentCubePosition, face2.parentCubePosition)){
				
				if(!neighborList.includes(otherEdge)){
					neighborList.push(otherEdge);
					let incidentEdge = dualGraph.getIncidentEdge(otherEdge.ID);

					if(incidentEdge != null && !neighborList.includes(incidentEdge))
						neighborList.push(incidentEdge)
				}
			}
		}
	});
}

function findIncidentEdge(dualGraph, edgeNode){

	if(edgeNode.isCut){ return null; }

	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;

	let edgeList = edgeMap.getData(edgeNode.position);

	for(var e in edgeList){
		let otherEdge = edgeList[e];

		if(otherEdge !== edgeNode && findAdjacentFaces(dualGraph, dualGraph.getFace(otherEdge.parentID)).includes(dualGraph.getFace(edgeNode.parentID))){
			return otherEdge;
		}
	}

	return null;
}

function cubesAreAdjacent(cubePosition1, cubePosition2){
	return cubePosition1.distanceTo(cubePosition2) <= 1;
}

function cubesShareCommonNeighbor(dualGraph, cubePosition1, cubePosition2){

	for(var d in directions){
		let dirVector = directions[d];
		let cubePosition3 = new THREE.Vector3().addVectors(cubePosition1, dirVector);

		if(DG_PRIVATES.get(dualGraph).cubeMap.hasDataAtPosition(cubePosition3) && cubesAreAdjacent(cubePosition2, cubePosition3))
			return true;
	}
	return false;
}

//Computes cut trees around the newly cut edge.
//If this edge is an isolated cut, then it is the seed of a new tree of cuts.
//If this edge is adjacent to another cut, then it will be joined to the tree that the latter cut belongs to.
//We also handle the case where two disjoint cut trees are bridged by the newly cut edge.
function computeCutTrees(dualGraph, newlyCutEdge){
	//Get all neigbhors of the edge and its incident edge
	let neighbors = dualGraph.getEdgeNeighbors(newlyCutEdge.ID);
	let incidentEdge = dualGraph.getIncidentEdge(newlyCutEdge.ID);

	//Grab references to private variables.
	let cutTrees = DG_PRIVATES.get(dualGraph).cutTrees;
	let edgeToCutTreeIndex = DG_PRIVATES.get(dualGraph).edgeToCutTreeIndex;

	//Search the neighbors. If a neighbor is cut, grab its cut tree index.
	let cutTreeIndex = undefined;
	for(var n in neighbors){
		if(neighbors[n].isCut){
			cutTreeIndex = edgeToCutTreeIndex.get(neighbors[n].ID);
			break;
		}
	}

	//If no neighbors are cut (i.e., the cut tree index is -1), just set our own. We are done.
	if(cutTreeIndex === undefined){
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

		if(neighborNode.isCut && neighborCutTreeIndex !== cutTreeIndex){
			let cutTree = cutTrees.get(neighborCutTreeIndex);

			//This neighbor is of a different cut tree, so we need to add it to this cut tree, and map it to this cut tree index.
			cutTree.map((edgeNode) => {
				cutTrees.get(cutTreeIndex).push(edgeNode);
				edgeToCutTreeIndex.set(edgeNode.ID, cutTreeIndex);
			});

			//We lose the reference to the cut tree neighbor was part of, since it has been concatenated into the other one.
			cutTrees.delete(neighborCutTreeIndex);

			//We can stop here since it is only possible for an edge to bridge at most two cut trees together.
			break;
		}
	}
}

//Recomputes the cut tree around a removed edge.
function recomputeCutTree(dualGraph, removedEdge){
	let cutTrees = DG_PRIVATES.get(dualGraph).cutTrees;
	let edgeToCutTreeIndex = DG_PRIVATES.get(dualGraph).edgeToCutTreeIndex;

	let cutTreeIndex = edgeToCutTreeIndex.get(removedEdge.ID);
	let cutTree = [...cutTrees.get(cutTreeIndex)];

	cutTree.map((edge) => {
		edgeToCutTreeIndex.delete(removedEdge);

		console.log(edge);

		computeCutTrees(dualGraph, edge);
	});
}

//Computes hinging lines that portions of the polycube will rotate around
function computeHingeLines(dualGraph, edgeNode){
	let cutTrees = DG_PRIVATES.get(dualGraph).cutTrees;
	let edgeToCutTreeIndex = DG_PRIVATES.get(dualGraph).edgeToCutTreeIndex;

	let cutTreeIndex = edgeToCutTreeIndex.get(edgeNode.ID);
	let cutTree = [...cutTrees.get(cutTreeIndex)];

	let edgeNeighbors = dualGraph.getEdgeNeighbors(edgeNode.ID);

	for(var e in cutTree){
		let cutEdge = cutTree[e];
		
		if(cutEdge === edgeNode || cutEdge === edgeNode.incidentEdge){ continue; }
		if(edgeNeighbors.includes(cutEdge)){ continue; }

		if(edgesAreCollinear(edgeNode, cutEdge)){
			console.log("Edges #" + edgeNode.ID + " and #" + cutEdge.ID + " are collinear");
		}
	}
}

function edgesAreCollinear(edge1, edge2){
	let endpoints1 = edge1.endpoints;
	let endpoints2 = edge2.endpoints;

	//Add up `endpoints1` and `endpoints2`
	let line1 = new THREE.Vector3().subVectors(endpoints1[0], endpoints1[1]);

	let line2 = new THREE.Vector3().subVectors(endpoints1[0], endpoints2[0]);
	let line3 = new THREE.Vector3().subVectors(endpoints1[0], endpoints2[1]);

	line1 = toQ1Vector(line1).normalize();
	line2 = toQ1Vector(line2).normalize();
	line3 = toQ1Vector(line3).normalize();

	return (line1.equals(line2) && line1.equals(line3));
}

function edgesArePerpendicular(edge1, edge2){
	let endpoints1 = edge1.endpoints;
	let endpoints2 = edge2.endpoints;

	let line1 = new THREE.Vector3().subVectors(endpoints1[0], endpoints2[1]).normalize();
	let line2 = new THREE.Vector3().subVectors(endpoints2[0], endpoints2[1]).normalize();

	

}

function edgesAreParallel(edge1, edge2){

}