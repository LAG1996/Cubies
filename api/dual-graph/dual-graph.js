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
			faceCount: 0,
			edgeHash: new Map(),
			edgeCount: 0,
			edgeMap: new SpatialMap(),
			edgeEndpointMap: new SpatialMap(),
			faceMap: new SpatialMap(),
			cubeMap: cubeMap,
			edgeIsCut: new Map(),

			cutTrees: new Map(),
			lastEditedCutTreeIndex: -1,

			hingeLines: new Map(),
			tapedEdgesCache: [],
			cutTreeIndexToHingeLines: new Map(),
			edgeToCutTreeIndex: new Map(),
			edgeToHingeLine: new Map(),
		})
	}

	//Attempts to apply a cut to the edge given by the ID.
	//A cut is not successful if the given edge is already a boundary or if the cut would result in a disconnected dual graph.
	tryApplyCut(edgeID){
		let edgeNode = DG_PRIVATES.get(this).edgeHash.get(edgeID);
		let edgeIsCut = DG_PRIVATES.get(this).edgeIsCut;

		if(!edgeNode.isCut && !canDisconnectDualGraph(this, edgeNode)){
			
			cutEdge(this, edgeNode);
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

	getAllHingeLines(){
		let hingeLines = DG_PRIVATES.get(this).hingeLines;

		return hingeLines;
	}

	getHingeLines(edgeID){
		let hingeLines = DG_PRIVATES.get(this).hingeLines.get(DG_PRIVATES.get(this).edgeToCutTreeIndex.get(edgeID));

		return hingeLines;
	}

	isEdgeInHinge(edgeID){
		return DG_PRIVATES.get(this).edgeToHingeLine.has(edgeID);
	}

	getIncidentEdge(edgeID){
		let edgeNode = DG_PRIVATES.get(this).edgeHash.get(edgeID);

		return edgeNode.incidentEdge;
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

		DG_PRIVATES.get(this).faceCount += 1;
	}

	//Check if there is a face with the given ID.
	hasFace(faceID){
		return DG_PRIVATES.get(this).faceHash.has(faceID);
	}

	//If the given edge is part of a hinge line, decompose the dual graph around that hinge line and return an
	//array of the parts.
	getDualGraphDecomposition(edgeID){
		let edgeToHingeLine = DG_PRIVATES.get(this).edgeToHingeLine;

		if(edgeToHingeLine.has(edgeID)){
			return 1;
		}

		return null;
	}

	//Remove the face 
	removeFace(faceID){
		let edgeNodes = this.getEdgesFromFace(faceID);

		edgeNodes.map((edgeNode) => { 
			DG_PRIVATES.get(this).edgeHash.delete(edgeNode.ID);
			DG_PRIVATES.get(this).edgeIsCut.delete(edgeNode);

			removeEdgeFromMaps(this, edgeNode);
			DG_PRIVATES.get(this).edgeCount -= 1;
		});

		let faceNode = this.getFace(faceID);

		faceNode.destroy();
		DG_PRIVATES.get(this).faceHash.delete(faceID);
		DG_PRIVATES.get(this).faceCount -=1;
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
		let newEdgeNode = new EdgeNode(edge.id, edge.position, edge.endpoints, edge.axis, parentFace.ID);

		parentFace.addEdge(newEdgeNode);
		addEdgeToMaps(dualGraph, newEdgeNode);

		DG_PRIVATES.get(dualGraph).edgeHash.set(newEdgeNode.ID, newEdgeNode);
		
		let incidentEdge = findIncidentEdge(dualGraph, newEdgeNode);

		if(incidentEdge != null){
			newEdgeNode.incidentEdge = incidentEdge;
			incidentEdge.incidentEdge = newEdgeNode;
		}

		DG_PRIVATES.get(dualGraph).edgeCount += 1;
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

//Severs the connection between two faces in the dual graph by a given edge
function cutEdge(dualGraph, edgeToCut){
	let incidentEdgeNode = dualGraph.getIncidentEdge(edgeToCut.ID);

	edgeToCut.isCut = true;
	incidentEdgeNode.isCut = true;

	let face1 = dualGraph.getFace(edgeToCut.parentID);
	let face2 = dualGraph.getFace(incidentEdgeNode.parentID);

	face1.removeNeighbors(face2);
	face2.removeNeighbors(face1);
}

function tapeEdges(dualGraph, edge1, edge2){
	edge1.incidentEdge = edge2;
	edge2.incidentEdge = edge1;

	let face1 = dualGraph.getFace(edge1.parentID);
	let face2 = dualGraph.getFace(edge2.parentID);

	face1.addNeighbors(face2);
	face2.addNeighbors(face1);
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

	let hingeLines = DG_PRIVATES.get(dualGraph).hingeLines;
	let edgeToHingeLine = DG_PRIVATES.get(dualGraph).edgeToHingeLine;

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
				edgeToHingeLine.delete(edgeNode.ID);
			});

			//We lose the reference to the cut tree neighbor was part of, since it has been concatenated into the other one.
			cutTrees.delete(neighborCutTreeIndex);

			//Since we lost that reference, we'd also want to lose the reference to the hinge line this tree was a part of,
			//if such a reference exists
			hingeLines.delete(neighborCutTreeIndex);


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
	let hingeLines = DG_PRIVATES.get(dualGraph).hingeLines;
	let edgeToHingeLine = DG_PRIVATES.get(dualGraph).edgeToHingeLine;

	let cutTreeIndex = edgeToCutTreeIndex.get(edgeNode.ID);
	let cutTree = [...cutTrees.get(cutTreeIndex)];

	let checkedHingeEndpoints = new WeakMap();

	let cutTreeHingeLines = hingeLines.get(cutTreeIndex);
	if(cutTreeHingeLines !== undefined){
		cutTreeHingeLines.map((lines) => {
			lines.map((edges) => {
				edgeToHingeLine.delete(edges.ID);
			})
		})

		cutTreeHingeLines.length = 0;
	}
	else
		cutTreeHingeLines = [];

	let hingeLineIndex = 0;

	for(var e1 in cutTree){
		for(var e2 in cutTree)
		{
			let cutEdge1 = cutTree[e1];
			let cutEdge2 = cutTree[e2];

			let edgeNeighbors = dualGraph.getEdgeNeighbors(cutEdge1.ID);
			
			if(checkedHingeEndpoints.has(cutEdge1) && checkedHingeEndpoints.get(cutEdge1).includes(cutEdge2)){ continue; }
			if(cutEdge1 === cutEdge2 || cutEdge1 === cutEdge2.incidentEdge){ continue; }
			if(edgeNeighbors.includes(cutEdge2)){ continue; }
		
			let hingeLineData = tryGenerateCollinearLine(dualGraph, cutEdge1, cutEdge2, cutTreeIndex, checkedHingeEndpoints, hingeLineIndex);
		
			if(!hingeLineData.generatedLine){
				hingeLineData = tryGenerateParallelLines(dualGraph, cutEdge1, cutEdge2, cutTreeIndex, checkedHingeEndpoints, hingeLineIndex);
			}

			if(!hingeLineData.generatedLine){
				hingeLineData = tryGeneratePerpendicularLine(dualGraph, cutEdge1, cutEdge2, cutTreeIndex, checkedHingeEndpoints, hingeLineIndex);
			}

			if(hingeLineData.generatedLine){
				for(var l in hingeLineData.lines){
					let hingeLine = hingeLineData.lines[l];

					if(hingeLine.length === 0){ continue; }

					cutTreeHingeLines[hingeLineIndex] = [];

					console.log(hingeLine);

					hingeLine.map((edge) => {
						//Adding each edge of the line to a hinge line
						console.log("Adding edge #" + edge.ID + " to hinge #" + hingeLineIndex + " for cut tree #" + cutTreeIndex);

						//First check if this edge is already associated with a hinge line.
						if(dualGraph.isEdgeInHinge(edge.ID)){
							console.log("Already in a line");
							console.log("My hinge length: " + edgeToHingeLine.get(edge.ID).length);
							console.log("New hinge length: " + hingeLine.length * 2);
							//We want to ensure that the edge stays with the larger hinge line, as decomposing the dual graph into would be made much easier
							if(edgeToHingeLine.get(edge.ID).length < hingeLine.length * 2){
								console.log("Going to larger line");
								edgeToHingeLine.get(edge.ID).splice(edgeToHingeLine.get(edge.ID).indexOf(edge), 1);
								edgeToHingeLine.get(edge.ID).splice(edgeToHingeLine.get(edge.incidentEdge.ID).indexOf(edge.incidentEdge), 1);
								
								edgeToHingeLine.set(edge.ID, cutTreeHingeLines[hingeLineIndex]);
								edgeToHingeLine.set(edge.incidentEdge.ID, cutTreeHingeLines[hingeLineIndex]);

								cutTreeHingeLines[hingeLineIndex].push(edge);
								cutTreeHingeLines[hingeLineIndex].push(edge.incidentEdge)
							}
						}
						else{
							//Of course, if the edge isn't already associated with a hinge line, we should add it anyway.
							edgeToHingeLine.set(edge.ID, cutTreeHingeLines[hingeLineIndex]);
							edgeToHingeLine.set(edge.incidentEdge.ID, cutTreeHingeLines[hingeLineIndex]);

							cutTreeHingeLines[hingeLineIndex].push(edge);
							cutTreeHingeLines[hingeLineIndex].push(edge.incidentEdge)
						}
					});

					hingeLineIndex += 1;
				}
			}
		}
	}

	hingeLines.set(cutTreeIndex, cutTreeHingeLines);

	console.log(hingeLines);
}

function tryGenerateCollinearLine(dualGraph, edge1, edge2, cutTreeIndex, checkedHingeEndpoints, hingeLineIndex){
	if(!edgesAreCollinear(edge1, edge2)){ return { generatedLine: false }; }

	console.log("Edges #" + edge1.ID + ",#" + edge1.incidentEdge.ID + " and #" 
		+ edge2.ID + ",#" + edge2.incidentEdge.ID + " are collinear.");
	
	//Subscribe these two edges as endpoints so we can avoid rechecking them later.
	subscribeEndpoints(edge1, edge2, checkedHingeEndpoints);

	let dirVector = new THREE.Vector3().subVectors(edge2.position, edge1.position).normalize();
	
	let lineData = doHingeWalk(dualGraph, edge1, edge2, dirVector, edge1.position, cutTreeIndex, checkedHingeEndpoints);

	if(lineData.endpoint == null){ return { generatedLine: false }; }

	return { generatedLine: true, lines: [lineData.line] };
}

function tryGenerateParallelLines(dualGraph, edge1, edge2, cutTreeIndex, checkedHingeEndpoints, hingeLineIndex){
	if(!edgesAreParallel(edge1, edge2)){ return { generatedLine: false }; }

	console.log("Edges #" + edge1.ID + ",#" + edge1.incidentEdge.ID + " and #" 
		+ edge2.ID + ",#" + edge2.incidentEdge.ID + " are parallel.");

	subscribeEndpoints(edge1, edge2, checkedHingeEndpoints);

	let dirVector = new THREE.Vector3().subVectors(edge2.position, edge1.position).normalize();

	let lineData = [
		doHingeWalk(dualGraph, edge1, edge2, dirVector, edge1.endpoints[0], cutTreeIndex, checkedHingeEndpoints),
		doHingeWalk(dualGraph, edge1, edge2, dirVector, edge1.endpoints[1], cutTreeIndex, checkedHingeEndpoints)];

	if(lineData[0].endpoint == null){ return { generatedLine: false }; }

	return { generatedLine: true, lines: [lineData[0].line, lineData[1].line] };
}

function tryGeneratePerpendicularLine(dualGraph, edge1, edge2, cutTreeIndex, checkedHingeEndpoints){
	if(!edgesArePerpendicular(edge1, edge2)){ return { generatedLine: false }; }

	console.log("Edges #" + edge1.ID + ",#" + edge1.incidentEdge.ID + " and #" 
		+ edge2.ID + ",#" + edge2.incidentEdge.ID + " are perpendicular.");

	subscribeEndpoints(edge1, edge2, checkedHingeEndpoints);

	let dirVector = new THREE.Vector3().subVectors(edge2.endpoints[0], edge1.endpoints[0]).normalize();
	let startingEndpoint = edge1.endpoints[0];
	if(!vectorIsOrthogonal(dirVector)){
		dirVector = new THREE.Vector3().subVectors(edge2.endpoints[1], edge1.endpoints[0]).normalize();

		if(!vectorIsOrthogonal(dirVector)){
			dirVector = new THREE.Vector3().subVectors(edge2.endpoints[0], edge1.endpoints[1]).normalize();
			startingEndpoint = edge1.endpoints[1];

			if(!vectorIsOrthogonal(dirVector)){
				dirVector = new THREE.Vector3().subVectors(edge2.endpoints[1], edge1.endpoints[1]).normalize();
			}
		}
	}

	let lineData = doHingeWalk(dualGraph, edge1, edge2, dirVector, startingEndpoint, cutTreeIndex, checkedHingeEndpoints);

	if(lineData.endpoint == null ){ return { generatedLine: false }; }

	return { generatedLine: true, lines: [lineData.line] };
}

//Does a walk from the given starting position (i.e. `edge1` or one of its endpoints) along the given direction until reaching `edge2`.
//Returns a line of edges encountered in that walk and whether this line found an endpoint (another cut in the given cut tree index)
function doHingeWalk(dualGraph, edge1, edge2, dirVector, startingPosition, cutTreeIndex, checkedHingeEndpoints){
	//Walk along the edge dual graph in that direction from `edge1` until we reach `edge2`.
	let edgeMap = DG_PRIVATES.get(dualGraph).edgeMap;
	let edge2Neighbors = dualGraph.getEdgeNeighbors(edge2.ID);

	let visitedQueue = [];

	let edgeLine = [];
	let lineEndpoint = null;

	//Walk along the dual graph from `edge 1`
	let stepEdge = edge1;
	while(!edge2Neighbors.includes(stepEdge)){
		let stepEdgeNeighbors = dualGraph.getEdgeNeighbors(stepEdge.ID);
		stepEdge.visited = true;

		visitedQueue.push(stepEdge);

		let foundNextEdge = false;
		for(var N in stepEdgeNeighbors){
			let neighbor = stepEdgeNeighbors[N];

			if(neighbor.visited){ continue; }

			let dir = new THREE.Vector3().subVectors(neighbor.position, startingPosition).normalize();

			if(dir.equals(dirVector)){
				stepEdge = neighbor;
				foundNextEdge = true;
				break;
			}
		}

		if(!foundNextEdge){ break; }
		
		if(DG_PRIVATES.get(dualGraph).edgeToCutTreeIndex.get(stepEdge.ID) !== cutTreeIndex){
			if(!stepEdge.isCut){
				console.log("Grabbing edge #" + stepEdge.ID + ",#" + stepEdge.incidentEdge.ID);

				edgeLine.push(stepEdge);
			}
		}
		else{
			console.log("Hit cut #" + stepEdge.ID + ",#" + stepEdge.incidentEdge.ID +" in our path. Subscribing it to our list of endpoints");
			lineEndpoint = stepEdge;
			subscribeEndpoints(edge1, stepEdge, checkedHingeEndpoints);
		}
	}

	if(edge2Neighbors.includes(stepEdge)){
		lineEndpoint = edge2;
	}

	clearVisited(visitedQueue);

	return { line: edgeLine, endpoint: lineEndpoint };
}

function edgesAreCollinear(edge1, edge2){
	//If the edges have different orientation, they can't possibly be collinear.
	if(!edge1.axis.equals(edge2.axis)){ return false; }

	//Check if the edges are collinear (i.e., their endpoints are collinear)
	let endpoints1 = edge1.endpoints;
	let endpoints2 = edge2.endpoints;

	let line = new THREE.Vector3().subVectors(endpoints1[0], endpoints2[1]);
	line = toQ1Vector(line).normalize();

	return edge1.axis.equals(line);
}

function edgesAreParallel(edge1, edge2){
	//If the edges have different orientation, then they can't possibly be collinear.
	if(!edge1.axis.equals(edge2.axis)){ return false; }

	//Check if the lines are parallel (i.e., there is an orthogonal line that separates them)
	let line = new THREE.Vector3().subVectors(edge1.position, edge2.position);
	line = toQ1Vector(line).normalize();

	return (vectorIsOrthogonal(line));
}

function edgesArePerpendicular(edge1, edge2){
	//If the edges have the same orientation, then they can't possibly be perpendicular.
	if(edge1.axis.equals(edge2.axis)){ return false; }

	//Check if the edges are perpendicular.
	//This check is done by taking the lines that can be drawn between the endpoints of the edges,
	//and then comparing them to the alignment of each edge to see if any three endpoints are collinear.
	//If so, returns true. Otherwise, returns false.

	let endpoints1 = edge1.endpoints;
	let endpoints2 = edge2.endpoints;

	let line1 = toQ1Vector(new THREE.Vector3().subVectors(endpoints1[0], endpoints2[0])).normalize();
	let line2 = toQ1Vector(new THREE.Vector3().subVectors(endpoints1[0], endpoints2[1])).normalize();

	let line3 = toQ1Vector(new THREE.Vector3().subVectors(endpoints1[1], endpoints2[0])).normalize();
	let line4 = toQ1Vector(new THREE.Vector3().subVectors(endpoints1[1], endpoints2[1])).normalize();

	return (
		edge1.axis.equals(line1) || edge1.axis.equals(line2) || edge1.axis.equals(line3) || edge1.axis.equals(line4)
		|| edge2.axis.equals(line1) || !edge2.axis.equals(line2) || edge2.axis.equals(line3) || edge2.axis.equals(line4)
	);
}

//Sets the given two edges as endpoints of some hinge line. This is really only used for caching for the hinging function.
function subscribeEndpoints(edge1, edge2, checkedHingeEndpoints){
	if(!checkedHingeEndpoints.has(edge1)){
		checkedHingeEndpoints.set(edge1, []);
	}

	if(!checkedHingeEndpoints.has(edge2)){
		checkedHingeEndpoints.set(edge2, []);
	}

	if(!checkedHingeEndpoints.has(edge1.incidentEdge)){
		checkedHingeEndpoints.set(edge1.incidentEdge, []);
	}

	if(!checkedHingeEndpoints.has(edge2.incidentEdge)){
		checkedHingeEndpoints.set(edge2.incidentEdge, []);
	}

	checkedHingeEndpoints.get(edge1).push(edge2);
	checkedHingeEndpoints.get(edge2).push(edge1);

	checkedHingeEndpoints.get(edge1.incidentEdge).push(edge2);
	checkedHingeEndpoints.get(edge2).push(edge1.incidentEdge);

	checkedHingeEndpoints.get(edge1).push(edge2.incidentEdge);
	checkedHingeEndpoints.get(edge2.incidentEdge).push(edge1);

	checkedHingeEndpoints.get(edge1.incidentEdge).push(edge2.incidentEdge);
	checkedHingeEndpoints.get(edge2.incidentEdge).push(edge1.incidentEdge);
}

function decomposeDualGraph(dualGraph, ...edgeNodes){

	console.log("Trying to decompose dual graph...");


	let dualGraphPieces = [];
	let visitedFaces = [];

	edgeNodes.map((edge) => {
		cutEdge(dualGraph, edge);
	})

	edgeNodes.map((edge) => {
		let incidentEdge = edge.incidentEdge;

		let face1 = dualGraph.getFace(edge.parentID);
		let face2 = dualGraph.getFace(incidentEdge.parentID);

		let faces = [face1, face2];

		faces.map((beginFace) => {
				if(beginFace.visited){ return; }
				let neighborQueue = [beginFace];
				let newDualGraphPiece = [beginFace];
				while(neighborQueue.length > 0){
					let face = neighborQueue.pop();

					face.visited = true;

					visitedFaces.push(face);

					newDualGraphPiece.push(face);
	
					for(var n in face.neighbors){
						console.log("Checking neighbor");
						let neighbor = face.neighbors[n];
	
						if(!neighbor.visited){
							neighborQueue.push(neighbor);
						}
					}
				}
	
				if(newDualGraphPiece.length > 0){
					dualGraphPieces.push([...newDualGraphPiece]);
				}
		})
	});

	console.log("Pieces of the dual graph:");

	clearVisited(visitedFaces);

	console.log(dualGraphPieces);

	edgeNodes.map((edge) => {
		tapeEdges(dualGraph, edge, edge.incidentEdge);
	});

	return dualGraphPieces;
}

function clearVisited(visitedQueue){
	visitedQueue.map((obj) => {
		obj.visited = false;
	})
}

function canDisconnectDualGraph(dualGraph, edgeToCut){
	let edgeToHingeLine = DG_PRIVATES.get(dualGraph).edgeToHingeLine;

	if(edgeToHingeLine.has(edgeToCut.ID)){
		if(edgeToHingeLine.get(edgeToCut.ID).length === 2){ console.log("Edge #" + edgeToCut.ID + " can disconnect dual graph (hinge size 2)"); return true; }
		else if(decomposeDualGraph(dualGraph, edgeToCut).length > 1){ console.log("Edge #" + edgeToCut.ID + " can disconnect dual graph (face decomp)"); return true;  }
	}
	
	return false;
}