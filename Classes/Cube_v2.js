function Cube(id, position, parent_poly_id){

	this.id = id 

	this.parent_id = parent_poly_id

	this.position = Cube.ToLatticePosition(position)
	this.lattice_position = position.clone().multiplyScalar(2)

	this.has_faces = {'front' : true, 'up' : true, 'back' : true, 
		'down' : true, 'left' : true, 'right' : true}

	this.object_name = 'p' + this.parent_id + 'c' + this.id

	this.edgeEndpoints = {}

	this.Destroy = function()
	{
		delete this
	}

	var that = this

	CalculateEdgeEndpoints()

	function CalculateEdgeEndpoints(){

		that.edgeEndpoints[Cube.GetEdgeName(that, "front", "up")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, 1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, 1, 1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "front", "right")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, 1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, -1, 1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "front", "down")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, -1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, -1, 1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "front", "left")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, 1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, -1, 1))
			]

		that.edgeEndpoints[Cube.GetEdgeName(that, "up", "up")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, 1, -1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, 1, -1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "up", "right")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, 1, -1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, 1, 1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "up", "down")] = that.edgeEndpoints[Cube.GetEdgeName(that, "front", "up")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "up", "left")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, 1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, 1, -1))
			]

		that.edgeEndpoints[Cube.GetEdgeName(that, "back", "up")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, -1, -1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, -1, -1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "back", "right")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, 1, -1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, -1, -1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "back", "down")] = that.edgeEndpoints[Cube.GetEdgeName(that, "up", "up")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "back", "left")] = [
		new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, 1, -1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, -1, -1))
			]

		that.edgeEndpoints[Cube.GetEdgeName(that, "down", "up")] = that.edgeEndpoints[Cube.GetEdgeName(that, "front", "down")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "down", "right")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, -1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(-1, -1, -1))
			]
		that.edgeEndpoints[Cube.GetEdgeName(that, "down", "down")] = that.edgeEndpoints[Cube.GetEdgeName(that, "back", "up")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "down", "left")] = [
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, -1, 1)),
			new THREE.Vector3().addVectors(that.lattice_position, new THREE.Vector3(1, -1, -1))
			]

		that.edgeEndpoints[Cube.GetEdgeName(that, "right", "up")] = that.edgeEndpoints[Cube.GetEdgeName(that, "up", "right")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "right", "right")] = that.edgeEndpoints[Cube.GetEdgeName(that, "back", "left")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "right", "down")] = that.edgeEndpoints[Cube.GetEdgeName(that, "down", "left")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "right", "left")] = that.edgeEndpoints[Cube.GetEdgeName(that, "front", "right")]

		that.edgeEndpoints[Cube.GetEdgeName(that, "left", "up")] = that.edgeEndpoints[Cube.GetEdgeName(that, "down", "right")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "left", "right")] = that.edgeEndpoints[Cube.GetEdgeName(that, "front", "left")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "left", "down")] = that.edgeEndpoints[Cube.GetEdgeName(that, "up", "left")]
		that.edgeEndpoints[Cube.GetEdgeName(that, "left", "left")] = that.edgeEndpoints[Cube.GetEdgeName(that, "back", "right")]
	}
}

Cube.ToLatticePosition = function(position)
{

	position.x = position.x >= 0 ? Math.floor(position.x) : Math.ceil(position.x)
	position.y = position.x >= 0 ? Math.floor(position.y) : Math.ceil(position.y)
	position.z = position.x >= 0 ? Math.floor(position.z) : Math.ceil(position.z)

	return position
}

Cube.GetFaceName = function(cube, direction)
{
	return cube.object_name + direction
}

Cube.GetEdgeName = function(cube, direction_1, direction_2)
{
	return Cube.GetFaceName(cube, direction_1) + "_" + direction_2
}

Cube.EdgeNameToFaceName = function(edge_name)
{
	return edge_name.split("_")[0]
}

Cube.EdgeWordToCubeName = function(cube, edge_word)
{
	return cube.object_name + edge_word
}

Cube.EdgeWordToFaceDirection = function(edge_word)
{
	return edge_word.split("_")[0]
}

Cube.FaceNameToDirection = function(face_name)
{
	var re = new RegExp("\\d")
	var split_name = face_name.split(re)
	var word = split_name[split_name.length - 1]

	return word
}

Cube.PartNameToCubeID = function(part_name)
{
	return parseInt(part_name.split(new RegExp("\\D"))[2])
}