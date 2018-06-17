//Classes representing nodes of the face dual graph
//Private static members for the FaceNode class
const FN_PRIVATES = new WeakMap();

export class FaceNode{
	constructor(faceID, facePosition, parentCubePosition){
		//Defining private variables
		FN_PRIVATES.set(this, {
			id: faceID,
			neighbors: new Map(),
			edges: [],
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
		return FN_PRIVATES.get(this).neighbors;
	}

	get position(){
		return FN_PRIVATES.get(this).position;
	}

	get parentCubePosition(){
		return FN_PRIVATES.get(this).parentCubePosition;
	}

	get edges(){
		return FN_PRIVATES.get(this).edges;
	}

	//Add neighbors to the neighbor list. Release a warning if this face
	//has more than 4 neighbors.
	addNeighbor(faceNode, neighborsEdge, myEdge){
		let neighbors = FN_PRIVATES.get(this).neighbors;
		try{
			if(neighbors.length >=4 ){
				throw "Face #" + this.ID + " has more than 4 neighbors. The polycube face dual graph is not 4-regular.";
			}
		}
		catch(err){
			console.error(err);
		}
		finally{
			neighbors.set(faceNode.ID, {face: faceNode, neighborsEdge: neighborsEdge, myEdge: myEdge});
		}
	}

	addEdge(edgeNode){
		FN_PRIVATES.get(this).edges.push(edgeNode);
	}

	//Remove the specified neighbor
	removeNeighbor(faceNode){
		this.neighbors.delete(faceNode.ID);
	}

	destroy(){

		//Destroy all edges attached to this face
		this.edges.forEach(function(edge){
			edge.destroy();
		})

		//Tell all neighbors to forget about this node
		this.neighbors.forEach((neighborData) => {
			neighborData.face.removeNeighbor(this);
		})

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
			parent: parentFace
		})
	}

	//getters
	get ID(){
		return EN_PRIVATES.get(this).id;
	}

	get position(){
		return EN_PRIVATES.get(this).position;
	}

	get neighbors(){
		return EN_PRIVATES.get(this).neighbors;
	}

	get endpoints(){
		return EN_PRIVATES.get(this).endpoints;
	}

	get axis(){
		return EN_PRIVATES.get(this).axis;
	}

	get isBoundary(){
		return EN_PRIVATES.get(this).isBoundary;
	}

	get parent(){
		return EN_PRIVATES.get(this).parent;
	}

	//setters
	set isBoundary(val){
		EN_PRIVATES.get(this).isBoundary = val;
	}

	removeNeighbor(edgeNode){
		this.neighbors.splice(this.neighbors.indexOf(edgeNode), 1);
	}

	destroy(){
		//tell all neighbors to remove me
		this.neighbors.forEach(function(neighborEdge){
			neighborEdge.removeNeighbor(this);
		})

		EN_PRIVATES.delete(this);
	}
}