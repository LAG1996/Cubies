//Classes representing nodes of the face dual graph
//Private static members for both node classes.
const NODE_PRIVATES = new WeakMap();

export class FaceNode{
	constructor(faceID, facePosition, faceNormal, parentCubePosition){
		//Defining private variables
		NODE_PRIVATES.set(this, {
			id: faceID,
			edges: [],
			neighbors: [],
			normal: faceNormal,
			position: facePosition,
			parentCubePosition: parentCubePosition,
		});

		this.visited = false;
	}

	//getters
	get ID(){
		return NODE_PRIVATES.get(this).id;
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

	get neighbors(){
		return [...NODE_PRIVATES.get(this).neighbors]; 
	}

	//setters
	set position(newPosition){
		NODE_PRIVATES.get(this).position = newPosition.clone();
	}

	set normal(newNormal){
		NODE_PRIVATES.get(this).normal = newNormal.clone();
	}

	addNeighbors(...faceNodes){

		faceNodes.map((node) => {
			if(!NODE_PRIVATES.get(this).neighbors.includes(node))
				NODE_PRIVATES.get(this).neighbors.push(node);
		});
		
	}

	removeNeighbors(...faceNodes){
		let neighbors = NODE_PRIVATES.get(this).neighbors;

		faceNodes.map((node) => {
			if(neighbors.includes(node))
				neighbors.splice(neighbors.indexOf(node), 1);
		});
	}

	addEdge(edgeNode){
		NODE_PRIVATES.get(this).edges.push(edgeNode);
	}

	destroy(){

		//Tell neighbors to forget about this face
		NODE_PRIVATES.get(this).neighbors.map((face) => {
			face.removeNeighbors(this);
		});

		//Destroy all edges attached to this face
		NODE_PRIVATES.get(this).edges.map((edge) => {
			edge.destroy();
		});

		//Remove references to this face's private members
		NODE_PRIVATES.delete(this);
	}
}

export class EdgeNode{
	constructor(edgeID, edgePosition, edgeEndpoints, edgeAxis, parentFaceID){
		NODE_PRIVATES.set(this, {
			id: edgeID,
			endpoints: edgeEndpoints,
			axis: edgeAxis,
			position: edgePosition,
			parentID: parentFaceID,
		});

		this.isCut = false;
		this.isHinge = false;
		this.incidentEdge;
		this.visited = false;
	}

	//getters
	get ID(){
		return NODE_PRIVATES.get(this).id;
	}

	get position(){
		return NODE_PRIVATES.get(this).position.clone();
	}

	get endpoints(){
		return [...NODE_PRIVATES.get(this).endpoints];
	}

	get axis(){
		return NODE_PRIVATES.get(this).axis.clone();
	}

	get parentID(){
		return NODE_PRIVATES.get(this).parentID;
	}

	//setters
	set position(newPosition){
		NODE_PRIVATES.get(this).position = newPosition.clone();
	}

	set axis(newAxis){
		NODE_PRIVATES.get(this).axis = newAxis.clone();
	}

	setEndpoints(newEndpoint1, newEndpoint2){
		NODE_PRIVATES.get(this).endpoints[0] = newEndpoint1.clone();
		NODE_PRIVATES.get(this).endpoints[1] = newEndpoint2.clone();
	}

	//Delete all internal references to this node.
	destroy(){

		//Tell the incident edge to forget this node
		if(this.incidentEdge != null){
			this.incidentEdge.incidentEdge = null;
		}

		NODE_PRIVATES.delete(this);
	}
}