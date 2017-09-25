/*
Author: Luis Angel Garcia
Last Edited: 9/24/2017

Description: Data structure that maps faces and edges to their locations in R^3. Also keeps track of face rotations and normal locations.
The usage of this class should be for keeping track of face and edge locations as they are rotating in 3-D space.

*/

function FlexiFaceEdgeMap()
{
	var Loc2Face_Map = {} //A bijective mapping of a coordinate in R^3 to a face name.
	var Face2Data_Map = {} //A mapping of a face's name to its coordinate in R^3, as well as it's normal. This map should be kept invariant.
	var Face2FlexiData_Map = {} //Another mapping of a face's name to its coordinate in R^3, as well as it's normal. This is the one that could be changed.

	var Edge2Data_Map = {}
	var Edge2FlexiData_Map = {}

	var Face2Edges = {}

	var that = this

	this.AddFace = function(face_name, location, normal)
	{
		var s = location.x.toString() + "," + location.y.toString() + "," + location.z.toString()

		Loc2Face_Map[s] = face_name

		Face2Data_Map[face_name] = {}
		Face2Data_Map[face_name]["normal"] = normal
		Face2Data_Map[face_name]["location"] = location

		Face2FlexiData_Map[face_name] = {}
		Face2FlexiData_Map[face_name]["normal"] = normal
		Face2FlexiData_Map[face_name]["location"] = location

		Face2Edges[face_name] = []
	}

	this.RemoveFace = function(face_name)
	{
		var face_data = Face2Data_Map[face_name]

		if(!ObjectExists(face_data))
			return

		var s = face_data.location.x.toString() + "," + face_data.location.y.toString() + "," + face_data.location.z.toString()
		delete Loc2Face_Map[s]

		delete Face2Data_Map[face_name]

		delete Face2FlexiData_Map[face_name]

		var edges = Face2Edges[face_name]

		for(var e in edges)
		{
			RemoveEdge(edges[e])
		}

		delete Face2Edges[face_name]
	}

	this.AddEdge = function(edge_name, parent_face_name, location, axis)
	{

		if(!ObjectExists(Face2Data_Map[parent_face_name]))
		{
			throw "Cannot add new edge data if face doesn't exist"
		}

		var s = location.x.toString() + "," + location.y.toString() + "," + location.z.toString()

		Edge2Data_Map[edge_name] = {}
		Edge2Data_Map[edge_name]["axis"] = axis
		Edge2Data_Map[edge_name]["location"] = location

		Edge2FlexiData_Map[edge_name] = {}
		Edge2FlexiData_Map[edge_name]["axis"] = axis
		Edge2FlexiData_Map[edge_name]["location"] = location

		Face2Edges[parent_face_name].push(edge_name)
	}

	function RemoveEdge(edge_name)
	{
		delete Edge2Data_Map[edge_name]
		delete Edge2FlexiData_Map[edge_name]
	}

	//How the fuck am I supposed to write this one???
	this.RotateFaceAroundEdge = function(edge_name, face_name, angle, axis)
	{
		var obj = Face2FlexiData_Map[face_name]
		var pEObj = Edge2FlexiData_Map[edge_name]

		var separating_vec = new THREE.Vector3().subVectors(obj.location, pEObj.location)

		separating_vec.applyAxisAngle(axis, angle)

		obj.location.copy(separating_vec)

		obj.location.x = Math.round(obj.location.x)
		obj.location.y = Math.round(obj.location.y)
		obj.location.z = Math.round(obj.location.z)

		obj.normal.applyAxisAngle(axis, angle)

		obj.normal.x = Math.round(obj.location.x)
		obj.normal.y = Math.round(obj.location.y)
		obj.normal.z = Math.round(obj.location.z)

		for(var e in Face2Edges[face_name])
		{
			var e_n = Face2Edges[face_name][e]

			obj = Edge2FlexiData_Map[e_n]

			separating_vec = new THREE.Vector3().subVectors(obj.location, pEObj.location)

			separating_vec.applyAxisAngle(axis, angle)

			obj.location.copy(separating_vec)

			obj.location.x = Math.round(obj.location.x)
			obj.location.y = Math.round(obj.location.y)
			obj.location.z = Math.round(obj.location.z)

			obj.axis.applyAxisAngle(axis, angle)

			obj.axis.x = Math.round(obj.location.x)
			obj.axis.y = Math.round(obj.location.y)
			obj.axis.z = Math.round(obj.location.z)
		}
	}

	this.GetEdgeLoc = function(edge_name)
	{
		return Edge2FlexiData_Map[edge_name]
	}

	this.GetFaceLoc = function(face_name)
	{
		return Face2FlexiData_Map[face_name]
	}
}