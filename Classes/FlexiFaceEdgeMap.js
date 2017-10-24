/*
Author: Luis Angel Garcia
Last Edited: 9/24/2017

Description: Data structure that maps faces and edges to their positions in R^3. Also keeps track of face rotations and normal positions.
The usage of this class should be for keeping track of face and edge positions as they are rotating in 3-D space.

*/

function FlexiFaceEdgeMap()
{
	var Loc2Face_Map = {} //A bijective mapping of a coordinate in R^3 to a face name.
	var Face2Data_Map = {} //A mapping of a face's name to its coordinate in R^3, as well as it's normal. This map should be kept invariant.
	var Face2FlexiData_Map = {} //Another mapping of a face's name to its coordinate in R^3, as well as it's normal. This is the one that could be changed.

	var Loc2Edge_Map = {} //A surjective mapping of a coordinate in R^3 to an edge name 
	var Edge2Data_Map = {}
	var Edge2FlexiData_Map = {}

	var Face2Edges = {}
	var Edges2Face = {}


	var that = this

	this.AddFace = function(face_name, position, normal)
	{
		var s = HashPosition(position)

		Loc2Face_Map[s] = face_name

		Face2Data_Map[face_name] = {}
		Face2Data_Map[face_name]["name"] = face_name
		Face2Data_Map[face_name]["normal"] = new THREE.Vector3().copy(normal)
		Face2Data_Map[face_name]["position"] = new THREE.Vector3().copy(position)

		Face2FlexiData_Map[face_name] = {}
		Face2FlexiData_Map[face_name]["name"] = face_name
		Face2FlexiData_Map[face_name]["normal"] = new THREE.Vector3().copy(normal)
		Face2FlexiData_Map[face_name]["position"] = new THREE.Vector3().copy(position)

		Face2Edges[face_name] = []
	}

	this.RemoveFace = function(face_name)
	{
		var face_data = Face2Data_Map[face_name]

		if(!ObjectExists(face_data))
			return

		var s = HashPosition(face_data.position)

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

	this.AddEdge = function(edge_name, parent_face_name, position, axis)
	{

		if(!ObjectExists(Face2Data_Map[parent_face_name]))
		{
			throw "Cannot add new edge data if face doesn't exist"
		}

		var s = HashPosition(position)

		Edge2Data_Map[edge_name] = {}
		Edge2Data_Map[edge_name]["name"] = edge_name 
		Edge2Data_Map[edge_name]["axis"] = new THREE.Vector3().copy(axis)
		Edge2Data_Map[edge_name]["position"] = new THREE.Vector3().copy(position)

		Edge2FlexiData_Map[edge_name] = {}
		Edge2FlexiData_Map[edge_name]["name"] = edge_name
		Edge2FlexiData_Map[edge_name]["axis"] = new THREE.Vector3().copy(axis)
		Edge2FlexiData_Map[edge_name]["position"] = new THREE.Vector3().copy(position)

		if(!ObjectExists(Loc2Edge_Map[s]))
		{
			Loc2Edge_Map[s] = []
		}

		Loc2Edge_Map[s].push(edge_name)

		Edges2Face[edge_name] = Face2FlexiData_Map[parent_face_name]

		Face2Edges[parent_face_name].push(Edge2FlexiData_Map[edge_name])
	}

	function RemoveEdge(edge_data)
	{
		var h = HashPosition(edge_data.position)

		Loc2Edge_Map[h].splice(Loc2Edge_Map[h].indexOf(edge_data.name), 1)
		
		delete Edges2Face[edge_data.name]
		delete Edge2Data_Map[edge_data.name]
		delete Edge2FlexiData_Map[edge_data.name]
	}

	function HashPosition(loc)
	{
		return loc.x.toString() + "," + loc.y.toString() + "," + loc.z.toString()
	}
	
	this.RotateFaceAroundEdge = function(edge_name, face_name, rads, axis)
	{
		var obj = Face2FlexiData_Map[face_name]
		var pEObj = Edge2FlexiData_Map[edge_name]

		var separating_vec = new THREE.Vector3().subVectors(obj.position, pEObj.position).normalize()
		separating_vec.multiplyScalar(obj.position.distanceTo(pEObj.position))

		separating_vec.applyAxisAngle(axis, rads)

		obj.position.copy(separating_vec)
		obj.position.add(pEObj.position)

		obj.position.x = Math.round(obj.position.x)
		obj.position.y = Math.round(obj.position.y)
		obj.position.z = Math.round(obj.position.z)

		obj.normal.applyAxisAngle(axis, rads)

		obj.normal.x = Math.round(obj.normal.x)
		obj.normal.y = Math.round(obj.normal.y)
		obj.normal.z = Math.round(obj.normal.z)

		obj.normal.normalize()

		for(var e in Face2Edges[face_name])
		{
			var e_n = Face2Edges[face_name][e].name

			obj = Edge2FlexiData_Map[e_n]

			if(obj.position.equals(pEObj.position))
				continue

			separating_vec = new THREE.Vector3().subVectors(obj.position, pEObj.position).normalize()
			separating_vec.multiplyScalar(obj.position.distanceTo(pEObj.position))

			separating_vec.applyAxisAngle(axis, rads)

			var s = HashPosition(obj.position)

			Loc2Edge_Map[s].splice(Loc2Edge_Map[s].indexOf(e_n), 1)

			obj.position.copy(separating_vec)
			obj.position.add(pEObj.position)

			obj.position.x = Math.round(obj.position.x)
			obj.position.y = Math.round(obj.position.y)
			obj.position.z = Math.round(obj.position.z)

			s = HashPosition(obj.position)

			if(!ObjectExists(Loc2Edge_Map[s]))
				Loc2Edge_Map[s] = []

			Loc2Edge_Map[s].push(e_n)

			obj.axis.applyAxisAngle(axis, rads)

			obj.axis.x = Math.round(obj.axis.x)
			obj.axis.y = Math.round(obj.axis.y)
			obj.axis.z = Math.round(obj.axis.z)

			obj.axis.normalize()
		}
	}

	this.GetEndPoints = function(edge_name)
	{

		var data = this.GetEdgeData(edge_name)

		return [new THREE.Vector3().addVectors(data.position, data.axis), new THREE.Vector3().addVectors(data.position, new THREE.Vector3().copy(data.axis).multiplyScalar(-1))]

	}

	this.HaveCommonEdge = function(face_1_name, face_2_name)
	{
		var edges_1 = Face2Edges[face_1_name]
		var edges_2 = Face2Edges[face_2_name]

		var package = {"common" : false, "edge_1" : null, "edge_2" : null}

		for(var e in edges_1)
		{
			var edge_1_data = edges_1[e]

			for(var h in edges_2)
			{
				var edge_2_data = edges_2[h]

				if(edge_1_data.position.equals(edge_2_data.position))
				{
					package.common = true
					package.edge_1 = edge_1_data
					package.edge_2 = edge_2_data
				}
			}
		}

		return package
	}

	this.GetCommonEdgeEndpoints = function(face_1_name, face_2_name)
	{
		var edges_1 = Face2Edges[face_1_name]
		var edges_2 = Face2Edges[face_2_name]

		var package = {"common" : false, "neighbor_data" : []}

		for(var e in edges_1)
		{
			var edge_1_data = edges_1[e]

			for(var h in edges_2)
			{
				var edge_2_data = edges_2[h]

				if(edge_1_data.name == edge_2_data.name)
					continue


				var edge_1_endpoints = this.GetEndPoints(edge_1_data.name)
				var edge_2_endpoints = this.GetEndPoints(edge_2_data.name)

				if(edge_1_endpoints[0].equals(edge_2_endpoints[0]) || edge_1_endpoints[0].equals(edge_2_endpoints[1])
					|| edge_1_endpoints[1].equals(edge_2_endpoints[0]) || edge_1_endpoints[1].equals(edge_2_endpoints[1]))
				{
					package.common = true

					package.neighbor_data.push({"edge_1" : edge_1_data, "edge_2": edge_2_data, "endpoints_1" : edge_1_endpoints, "endpoints_2": edge_2_endpoints})

					//package.edge_1 = edge_1_data
					//package.edge_2 = edge_2_data

					//package.endpoints_1 = edge_1_endpoints
					//package.endpoints_2 = edge_2_endpoints
				}
			}
		}

		return package
	}

	this.GetEdgesAtLoc = function(position)
	{
		var l = HashPosition(position)

		return Loc2Edge_Map[l]
	}

	this.GetFaceAtLoc = function(position)
	{
		var l = HashPosition(position)
		return Loc2Face_Map[l]
	}

	this.GetFaceFromEdge = function(edge_name)
	{
		return Edges2Face[edge_name]
	}

	this.GetEdgesFromFace = function(face_name)
	{
		return Face2Edges[face_name]
	}

	this.GetEdgeData = function(edge_name)
	{
		return Edge2FlexiData_Map[edge_name]
	}

	this.GetFaceData = function(face_name)
	{
		return Face2FlexiData_Map[face_name]
	}

	this.ResetData = function()
	{
		for(var f in Face2Data_Map)
		{
			Face2FlexiData_Map[f].position.copy(Face2Data_Map[f].position)
			Face2FlexiData_Map[f].normal.copy(Face2Data_Map[f].normal)
		}

		for(var e in Edge2Data_Map)
		{
			Edge2FlexiData_Map[e].position.copy(Edge2Data_Map[e].position)
			Edge2FlexiData_Map[e].axis.copy(Edge2Data_Map[e].axis)
		}
	}
}