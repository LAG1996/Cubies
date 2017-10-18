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

	var Loc2Edge_Map = {} //A surjective mapping of a coordinate in R^3 to an edge name 
	var Edge2Data_Map = {}
	var Edge2FlexiData_Map = {}

	var Face2Edges = {}
	var Edges2Face = {}


	var that = this

	this.AddFace = function(face_name, location, normal)
	{
		var s = HashLocation(location)

		Loc2Face_Map[s] = face_name

		Face2Data_Map[face_name] = {}
		Face2Data_Map[face_name]["normal"] = new THREE.Vector3().copy(normal)
		Face2Data_Map[face_name]["location"] = new THREE.Vector3().copy(location)

		Face2FlexiData_Map[face_name] = {}
		Face2FlexiData_Map[face_name]["normal"] = new THREE.Vector3().copy(normal)
		Face2FlexiData_Map[face_name]["location"] = new THREE.Vector3().copy(location)

		Face2Edges[face_name] = []
	}

	this.RemoveFace = function(face_name)
	{
		var face_data = Face2Data_Map[face_name]

		if(!ObjectExists(face_data))
			return

		var s = HashLocation(face_data.location)

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

		var s = HashLocation(location)

		Edge2Data_Map[edge_name] = {}
		Edge2Data_Map[edge_name]["axis"] = new THREE.Vector3().copy(axis)
		Edge2Data_Map[edge_name]["location"] = new THREE.Vector3().copy(location)

		Edge2FlexiData_Map[edge_name] = {}
		Edge2FlexiData_Map[edge_name]["axis"] = new THREE.Vector3().copy(axis)
		Edge2FlexiData_Map[edge_name]["location"] = new THREE.Vector3().copy(location)

		if(!ObjectExists(Loc2Edge_Map[s]))
		{
			Loc2Edge_Map[s] = []
		}

		Loc2Edge_Map[s].push(edge_name)

		Edges2Face[edge_name] = parent_face_name

		Face2Edges[parent_face_name].push(edge_name)
	}

	function RemoveEdge(edge_name)
	{
		delete Edge2Data_Map[edge_name]
		delete Edge2FlexiData_Map[edge_name]
	}

	function HashLocation(loc)
	{
		return loc.x.toString() + "," + loc.y.toString() + "," + loc.z.toString()
	}
	
	this.RotateFaceAroundEdge = function(edge_name, face_name, rads, axis)
	{
		var obj = Face2FlexiData_Map[face_name]
		var pEObj = Edge2FlexiData_Map[edge_name]

		var separating_vec = new THREE.Vector3().subVectors(obj.location, pEObj.location).normalize()
		separating_vec.multiplyScalar(obj.location.distanceTo(pEObj.location))

		separating_vec.applyAxisAngle(axis, rads)

		obj.location.copy(separating_vec)
		obj.location.add(pEObj.location)

		obj.location.x = Math.round(obj.location.x)
		obj.location.y = Math.round(obj.location.y)
		obj.location.z = Math.round(obj.location.z)

		obj.normal.applyAxisAngle(axis, rads)

		obj.normal.x = Math.round(obj.normal.x)
		obj.normal.y = Math.round(obj.normal.y)
		obj.normal.z = Math.round(obj.normal.z)

		obj.normal.normalize()

		for(var e in Face2Edges[face_name])
		{
			var e_n = Face2Edges[face_name][e]

			obj = Edge2FlexiData_Map[e_n]

			if(obj.location.equals(pEObj.location))
				continue

			separating_vec = new THREE.Vector3().subVectors(obj.location, pEObj.location).normalize()
			separating_vec.multiplyScalar(obj.location.distanceTo(pEObj.location))

			separating_vec.applyAxisAngle(axis, rads)

			var s = HashLocation(obj.location)

			Loc2Edge_Map[s].splice(Loc2Edge_Map[s].indexOf(e_n), 1)

			obj.location.copy(separating_vec)
			obj.location.add(pEObj.location)

			obj.location.x = Math.round(obj.location.x)
			obj.location.y = Math.round(obj.location.y)
			obj.location.z = Math.round(obj.location.z)

			s = HashLocation(obj.location)

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

		return [new THREE.Vector3().addVectors(data.location, data.axis), new THREE.Vector3().addVectors(data.location, new THREE.Vector3().copy(data.axis).multiplyScalar(-1))]

	}

	this.HaveCommonEdge = function(face_1_name, face_2_name)
	{
		var edges_1 = Face2Edges[face_1_name]
		var edges_2 = Face2Edges[face_2_name]

		var package = {"common" : false, "edge_1" : null, "edge_2" : null}

		for(var e in edges_1)
		{
			var edge = edges_1[e]

			var e_1_d = this.GetEdgeData(edge)

			for(var h in edges_2)
			{
				var hedge = edges_2[h]

				var e_2_d = this.GetEdgeData(hedge)

				if(e_1_d.location.equals(e_2_d.location))
				{
					package.common = true
					package.edge_1 = edge
					package.edge_2 = hedge
				}
			}
		}

		return package
	}

	this.GetEdgesAtLoc = function(location)
	{
		var l = HashLocation(location)

		return Loc2Edge_Map[l]
	}

	this.GetFaceFromEdge = function(edge_name)
	{
		return Edges2Face[edge_name]
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
			Face2FlexiData_Map[f].location.copy(Face2Data_Map[f].location)
			Face2FlexiData_Map[f].normal.copy(Face2Data_Map[f].normal)
		}

		for(var e in Edge2Data_Map)
		{
			Edge2FlexiData_Map[e].location.copy(Edge2Data_Map[e].location)
			Edge2FlexiData_Map[e].axis.copy(Edge2Data_Map[e].axis)
		}
	}
}