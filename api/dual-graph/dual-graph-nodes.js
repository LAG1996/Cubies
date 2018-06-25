//Classes representing nodes of the face dual graph
//Private static members for the FaceNode class
const FN_PRIVATES = new WeakMap();

export class FaceNode{
	constructor(faceID, facePosition, faceNormal, parentCubePosition){
		//Defining private variables
		FN_PRIVATES.set(this, {
			id: faceID,
			neighbors: [],
			edges: [],
			normal: faceNormal,
			position: facePosition,
			parentCubePosition: parentCubePosition
		});

		this.visited = false;
	}

	//getters
	get ID(){
		return FN_PRIVATES.get(this).id;
	}

	get neighbors(){
		return [...FN_PRIVATES.get(this).neighbors];
	}

	get position(){
		return FN_PRIVATES.get(this).position.clone();
	}

	get normal(){
		return FN_PRIVATES.get(this).normal.clone();
	}

	get parentCubePosition(){
		return FN_PRIVATES.get(this).parentCubePosition.clone();
	}

	get edges(){
		return [...FN_PRIVATES.get(this).edges];
	}

	//Add neighbors to the neighbor list. Release a warning if this face
	//has more than 4 neighbors.
	addNeighbor(faceNode){
		let neighbors = FN_PRIVATES.get(this).neighbors;

		if(neighbors.includes(faceNode)) return;

		try{
			if(neighbors.length >=4 ){
				throw "Face #" + this.ID + " has more than 4 neighbors. The polycube face dual graph is not 4-regular.";
			}
		}
		catch(err){
			console.error(err);
		}
		finally{
			neighbors.push(faceNode);
		}
	}

	addEdge(edgeNode){
		FN_PRIVATES.get(this).edges.push(edgeNode);
	}

	//Remove the specified neighbor
	removeNeighbor(faceNode){
		let neighbors = FN_PRIVATES.get(this).neighbors;

		neighbors.splice(neighbors.indexOf(faceNode), 1);
	}

	destroy(){

		//Destroy all edges attached to this face
		FN_PRIVATES.get(this).edges.map((edge) => {
			edge.destroy();
		});

		//Tell all neighbors to forget about this node
		FN_PRIVATES.get(this).neighbors.map((neighbor) => {
			neighbor.removeNeighbor(this);
		});

		//Remove references to this face's private members
		FN_PRIVATES.delete(this);
	}

}

//Private static members for the EdgeNode class
const EN_PRIVATES = new WeakMap();

export class EdgeNode{
	constructor(edgeID, edgePosition, edgeEndpoints, edgeAxis, parentFace){
		EN_PRIVATES.set(this, {
			id: edgeID,
			neighbors: [],
			endpoints: edgeEndpoints,
			axis: edgeAxis,
			position: edgePosition,
			isBoundary: true,
			incidentEdge: null,
			parent: parentFace
		})
	}

	//getters
	get ID(){
		return EN_PRIVATES.get(this).id;
	}

	get position(){
		return EN_PRIVATES.get(this).position.clone();
	}

	get neighbors(){
		return [...EN_PRIVATES.get(this).neighbors];
	}

	get endpoints(){
		return [...EN_PRIVATES.get(this).endpoints];
	}

	get axis(){
		return EN_PRIVATES.get(this).axis.clone();
	}
	
	get incidentEdge(){
		return EN_PRIVATES.get(this).incidentEdge;
	}

	get parent(){
		return EN_PRIVATES.get(this).parent;
	}

	get isBoundary(){
		return this.incidentEdge == null;
	}

	//setters
	set incidentEdge(edgeNode){
		//console.log("Edge #" + this.ID + ": now incident with edge#" + edgeNode.ID); 
		EN_PRIVATES.get(this).incidentEdge = edgeNode;
	}

	getAllNeighbors(){
		let neighborNodes = [];

		EN_PRIVATES.get(this).neighbors.map((neighbor) => {
			neighborNodes.push(neighbor);

			if(!neighbor.isBoundary){
				neighborNodes.push(neighbor);
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
		let neighbors = EN_PRIVATES.get(this).neighbors;
		if(neighbors.includes(edgeNode)) return;

		try{
			if(neighbors.length >= 8)
				throw "Edge #" + this.ID + " has " + (this.neighbors.length + 1) + " neighbors. Edge graph is no longer of maximum degree 8."
		}
		catch(err){
			console.error(err);
		}
		finally{
			//console.log("Edge #" + this.ID + ": setting edge #" + edgeNode.ID + " as a neighbor");
			neighbors.push(edgeNode);
		}
	}

	removeNeighbor(edgeNode){
		let neighbors = EN_PRIVATES.get(this).neighbors;

		neighbors.splice(neighbors.indexOf(edgeNode), 1);
	}

	removeIncidentEdge(){
		EN_PRIVATES.get(this).incidentEdge = null;
	}

	//Delete all internal references to this node.
	destroy(){
		//tell all neighbors to forget this node
		//console.log("Deleting edge#" + this.ID);

		EN_PRIVATES.get(this).neighbors.map((neighborEdge) => {
			neighborEdge.removeNeighbor(this);
		})

		//tell the incident edge to forget this node
		if(!this.isBoundary){
			EN_PRIVATES.get(this).incidentEdge.removeIncidentEdge();
		}

		EN_PRIVATES.delete(this);
	}
}