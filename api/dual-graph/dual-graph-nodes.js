//Classes representing nodes of the face dual graph
//Private static members for the FaceNode class
const FN_PRIVATES = new WeakMap();

export class FaceNode{
	constructor(facePosition){
		//Defining private variables
		FN_PRIVATES.set(this, {
			neighbors: [],
			edges: [],
			position: facePosition,
		});

		this.visited = false;
	}

	//getters
	get neighbors(){
		return FN_PRIVATES.get(this).neighbors;
	}

	get position(){
		return FN_PRIVATES.get(this).position;
	}

	get edges(){
		return FN_PRIVATES.get(this).edges;
	}

	//Add neighbors to the neighbor list. Release a warning if this face
	//has more than 4 neighbors.
	addNeighbor(face){
		let neighbors = FN_PRIVATES.get(this).neighbors;
		try{
			if(neighbors.length >=4 ){
				throw "Face " + FN_PRIVATES.get(this).name + " has more than 4 neighbors. The polycube face dual graph is not 4-regular.";
			}
		}
		catch(err){
			console.error(err);
		}
		finally{
			neighbors.push(face);
		}
	}

	addEdge(edgeNode){
		FN_PRIVATES.get(this).edges.push(edgeNode);
	}

	//Remove the specified neighbor
	removeNeighbor(face){
		let neighbors = FN_PRIVATES.get(this).neighbors;
		neighbors.splice(neighbors.indexOf(face), 1);
	}

	destroy(){
		console.log(this);
		FN_PRIVATES.get(this).edges.forEach(function(edge){
			edge.destroy();
		})

		FN_PRIVATES.delete(this);

		delete this;
	}

}

//Private static members for the EdgeNode class
const EN_PRIVATES = new WeakMap();

export class EdgeNode{
	constructor(edgePosition, edgeEndpoints, edgeAxis, parentFace){
		EN_PRIVATES.set(this, {
			neighbors: [],
			endpoints: edgeEndpoints,
			axis: edgeAxis,
			isBoundary: true,
			parent: parentFace
		})
	}

	//getters
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

	destroy(){
		EN_PRIVATES.delete(this);

		delete this;
	}
}