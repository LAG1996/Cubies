//Classes representing nodes of the face dual graph
//Private static members for the FaceNode class
const NODE_PRIVATES = new WeakMap();

export class FaceNode{
	constructor(faceID, facePosition, faceNormal, parentCubePosition){
		//Defining private variables
		NODE_PRIVATES.set(this, {
			id: faceID,
			neighbors: [],
			edges: [],
			normal: faceNormal,
			position: facePosition,
			parentCubePosition: parentCubePosition,
			hadTooManyNeighbors: false
		});

		this.visited = false;
	}

	//getters
	get ID(){
		return NODE_PRIVATES.get(this).id;
	}

	get neighbors(){
		return [...NODE_PRIVATES.get(this).neighbors];
	}

	get position(){
		return NODE_PRIVATES.get(this).position.clone();
	}

	get normal(){
		return NODE_PRIVATES.get(this).normal.clone();
	}

	get parentCubePosition(){
		return NODE_PRIVATES.get(this).parentCubePosition.clone();
	}

	get edges(){
		return [...NODE_PRIVATES.get(this).edges];
	}

	//Add neighbors to the neighbor list. Release a warning if this face
	//has more than 4 neighbors.
	addNeighbor(faceNode){
		let neighbors = NODE_PRIVATES.get(this).neighbors;

		if(neighbors.includes(faceNode)) return;

		neighbors.push(faceNode);

		if(hasTooManyNeighbors(this, 4)){
			console.log("Face #" + this.ID + " has more than 4 neighbors. The polycube face dual graph is not 4-regular.");
			NODE_PRIVATES.get(this).hadTooManyNeighbors = true;
		}
	}

	addEdge(edgeNode){
		NODE_PRIVATES.get(this).edges.push(edgeNode);
	}

	//Remove the specified neighbor
	removeNeighbor(faceNode){
		let neighbors = NODE_PRIVATES.get(this).neighbors;

		neighbors.splice(neighbors.indexOf(faceNode), 1);

		if(hadTooManyNeighbors(this, 4)){
			console.log("Edge #" + this.ID + " now has a safe amount of neighbors. Neighbor count: " + (this.neighbors.length));
			NODE_PRIVATES.get(this).hadTooManyNeighbors = false;
		}
	}

	destroy(){

		//Destroy all edges attached to this face
		NODE_PRIVATES.get(this).edges.map((edge) => {
			edge.destroy();
		});

		//Tell all neighbors to forget about this node
		NODE_PRIVATES.get(this).neighbors.map((neighbor) => {
			neighbor.removeNeighbor(this);
		});

		//Remove references to this face's private members
		NODE_PRIVATES.delete(this);
	}

}

export class EdgeNode{
	constructor(edgeID, edgePosition, edgeEndpoints, edgeAxis, parentFace){
		NODE_PRIVATES.set(this, {
			id: edgeID,
			neighbors: [],
			endpoints: edgeEndpoints,
			axis: edgeAxis,
			position: edgePosition,
			isBoundary: true,
			incidentEdge: null,
			parent: parentFace,
			hadTooManyNeighbors: false
		})
	}

	//getters
	get ID(){
		return NODE_PRIVATES.get(this).id;
	}

	get position(){
		return NODE_PRIVATES.get(this).position.clone();
	}

	get neighbors(){
		return [...NODE_PRIVATES.get(this).neighbors];
	}

	get endpoints(){
		return [...NODE_PRIVATES.get(this).endpoints];
	}

	get axis(){
		return NODE_PRIVATES.get(this).axis.clone();
	}
	
	get incidentEdge(){
		return NODE_PRIVATES.get(this).incidentEdge;
	}

	get parent(){
		return NODE_PRIVATES.get(this).parent;
	}

	get isBoundary(){
		return this.incidentEdge == null;
	}

	//setters
	set incidentEdge(edgeNode){
		//console.log("Edge #" + this.ID + ": now incident with edge#" + edgeNode.ID); 
		NODE_PRIVATES.get(this).incidentEdge = edgeNode;
	}

	getAllNeighbors(){
		let neighborNodes = [];

		NODE_PRIVATES.get(this).neighbors.map((neighbor) => {
			neighborNodes.push(neighbor);

			if(!neighbor.isBoundary){
				neighborNodes.push(neighbor.incidentEdge);
			}
		});

		if(!this.isBoundary){
			this.incidentEdge.neighbors.map((neighbor) => {
				neighborNodes.push(neighbor);

				if(!neighbor.isBoundary)
					neighborNodes.push(neighbor.incidentEdge);
			});
		}

		return neighborNodes;
	}

	addNeighbor(edgeNode){
		let neighbors = NODE_PRIVATES.get(this).neighbors;
		
		if(neighbors.includes(edgeNode)) return;
		
		neighbors.push(edgeNode);

		if(hasTooManyNeighbors(this, 8)){
			console.log("Edge #" + this.ID + " has " + (this.neighbors.length) + " neighbors. Edge graph is no longer of maximum degree 8.");
			NODE_PRIVATES.get(this).hadTooManyNeighbors = true;
		}
	}

	removeNeighbor(edgeNode){
		let neighbors = NODE_PRIVATES.get(this).neighbors;

		neighbors.splice(neighbors.indexOf(edgeNode), 1);

		if(hadTooManyNeighbors(this, 8)){
			console.log("Edge #" + this.ID + " now has a safe amount of neighbors. Neighbor count: " + (this.neighbors.length));
		}
	}

	removeIncidentEdge(){
		NODE_PRIVATES.get(this).incidentEdge = null;
	}

	//Delete all internal references to this node.
	destroy(){
		//tell all neighbors to forget this node
		//console.log("Deleting edge#" + this.ID);

		NODE_PRIVATES.get(this).neighbors.map((neighborEdge) => {
			neighborEdge.removeNeighbor(this);
		})

		//tell the incident edge to forget this node
		if(!this.isBoundary){
			NODE_PRIVATES.get(this).incidentEdge.removeIncidentEdge();
		}

		NODE_PRIVATES.delete(this);
	}
}

function hasTooManyNeighbors(node, maximum){
	return node.neighbors.length > maximum;
}

function hadTooManyNeighbors(node, maximum){
	return NODE_PRIVATES.get(node).hadTooManyNeighbors && !hasTooManyNeighbors(node, maximum);
}