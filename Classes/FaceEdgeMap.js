/*
Author: Luis Angel Garcia
Last Edited: 9/24/2017

Description: Data structure that maps faces and edges to their positions in R^3. Also keeps track of face rotations and normal positions.
This class should be for keeping track of face and edge positions as they are rotating in 3-D space.

*/

function FaceEdgeMap()
{
	var Loc2Face_Map = [] //A bijective mapping of a coordinate in R^3 to a face name.
	var Face2Data_Map = {} //A mapping of a face's name to its coordinate in R^3, as well as it's normal. This map should be kept invariant.
	var Face2RawData_Map = {} //Another mapping of a face's name to its coordinate in R^3, as well as it's normal. This is the one that could be changed.

	var Loc2Edge_Map = [] //A surjective mapping of a coordinate in R^3 to a list of edges in that location
	var Edge2Data_Map = {}
	var Edge2RawData_Map = {}

	var Face2Edges = {}
	var Edges2Face = {}

	var that = this

	this.AddFace = function(face_name, position, normal)
	{
		//Loc2Face_Map[s] = face_name
		Face2Data_Map[face_name] = {}
		Face2Data_Map[face_name]["name"] = face_name
		Face2Data_Map[face_name]["normal"] = new THREE.Vector3().copy(normal)
		Face2Data_Map[face_name]["position"] = new THREE.Vector3().copy(position)

		Face2RawData_Map[face_name] = {}
		Face2RawData_Map[face_name]["name"] = face_name
		Face2RawData_Map[face_name]["normal"] = new THREE.Vector3().copy(normal)
		Face2RawData_Map[face_name]["position"] = new THREE.Vector3().copy(position)

		MapObject(face_name, Loc2Face_Map, position)	

		Face2Edges[face_name] = []
	}

	this.RemoveFace = function(face_name)
	{
		var face_data = Face2Data_Map[face_name]

		if(!ObjectExists(face_data))
			return

		RemoveObjectFromMap(face_data.name, Loc2Face_Map, face_data.position)

		delete Face2Data_Map[face_name]

		delete Face2RawData_Map[face_name]

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

		Edge2Data_Map[edge_name] = {}
		Edge2Data_Map[edge_name]["name"] = edge_name 
		Edge2Data_Map[edge_name]["axis"] = new THREE.Vector3().copy(axis)
		Edge2Data_Map[edge_name]["position"] = new THREE.Vector3().copy(position)

		Edge2RawData_Map[edge_name] = {}
		Edge2RawData_Map[edge_name]["name"] = edge_name
		Edge2RawData_Map[edge_name]["axis"] = new THREE.Vector3().copy(axis)
		Edge2RawData_Map[edge_name]["position"] = new THREE.Vector3().copy(position)
		Edge2RawData_Map[edge_name]["endpoints"][0] = this.GetEndPoints(edge_name)
		Edge2RawData_Map[edge_name]["endpoints"][1] = this.GetEndPoints(edge_name)


		MapObject(edge_name, Loc2Edge_Map, position)

		Edges2Face[edge_name] = Face2RawData_Map[parent_face_name]

		Face2Edges[parent_face_name].push(Edge2RawData_Map[edge_name])
	}

	function RemoveEdge(edge_data)
	{
		RemoveObjectFromMap(edge_data.name, Loc2Edge_Map, edge_data.position)
		
		delete Edges2Face[edge_data.name]
		delete Edge2Data_Map[edge_data.name]
		delete Edge2RawData_Map[edge_data.name]
	}

	function HashPosition(loc)
	{
		return loc.x.toString() + "," + loc.y.toString() + "," + loc.z.toString()
	}
	
	this.RotateFaceAroundEdge = function(edge_name, face_name, rads)
	{
		let face = Face2RawData_Map[face_name]
		let hinge = Edge2RawData_Map[edge_name]

		let axis = hinge.axis

		let separating_vec = new THREE.Vector3().subVectors(face.position, hinge.position).normalize()
		separating_vec.multiplyScalar(face.position.distanceTo(hinge.position))

		separating_vec.applyAxisAngle(axis, rads)

		RemoveObjectFromMap(face.name, Loc2Face_Map, face.position)

		face.position.copy(separating_vec)
		face.position.add(hinge.position)

		face.position.x = Math.round(face.position.x)
		face.position.y = Math.round(face.position.y)
		face.position.z = Math.round(face.position.z)

		face.normal.applyAxisAngle(axis, rads)

		face.normal.x = Math.round(face.normal.x)
		face.normal.y = Math.round(face.normal.y)
		face.normal.z = Math.round(face.normal.z)

		face.normal.normalize()

		MapObject(face.name, Loc2Face_Map, face.position)

		for(var e in Face2Edges[face_name])
		{
			let e_n = Face2Edges[face_name][e].name

			let edge = Edge2RawData_Map[e_n]

			if(edge.position.equals(hinge.position))
				continue

			separating_vec = new THREE.Vector3().subVectors(edge.position, hinge.position).normalize()
			separating_vec.multiplyScalar(edge.position.distanceTo(hinge.position))

			separating_vec.applyAxisAngle(axis, rads)

			RemoveObjectFromMap(edge.name, Loc2Edge_Map, edge.position)

			edge.position.copy(separating_vec)
			edge.position.add(hinge.position)

			edge.position.x = Math.round(edge.position.x)
			edge.position.y = Math.round(edge.position.y)
			edge.position.z = Math.round(edge.position.z)

			s = HashPosition(edge.position)

			MapObject(edge.name, Loc2Edge_Map, edge.position)

			edge.axis.applyAxisAngle(axis, rads)

			edge.axis.x = Math.round(edge.axis.x)
			edge.axis.y = Math.round(edge.axis.y)
			edge.axis.z = Math.round(edge.axis.z)

			edge.axis.normalize()
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
				}
			}
		}

		return package
	}

	this.GetEdgesAtLoc = function(position)
	{
		//var l = HashPosition(position)

		if(!Array.isArray(Loc2Edge_Map[position.x]))
		{
			return null
		}
		else if(!Array.isArray(Loc2Edge_Map[position.x][position.y]))
		{
			return null
		}
		else if(!Array.isArray(Loc2Edge_Map[position.x][position.y][position.z]))
		{
			return null
		}

		return Loc2Edge_Map[position.x][position.y][position.z]
	}

	this.GetFacesAtLoc = function(position)
	{

		if(!Array.isArray(Loc2Face_Map[position.x]))
		{
			return null
		}
		else if(!Array.isArray(Loc2Face_Map[position.x][position.y]))
		{
			return null
		}
		else if(!Array.isArray(Loc2Face_Map[position.x][position.y][position.z]))
		{
			return null
		}

		return Loc2Face_Map[position.x][position.y][position.z]
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
		return Edge2RawData_Map[edge_name]
	}

	this.GetFaceData = function(face_name)
	{
		return Face2RawData_Map[face_name]
	}

	this.ResetData = function()
	{
		for(var f in Face2Data_Map)
		{
			Face2RawData_Map[f].position.copy(Face2Data_Map[f].position)
			Face2RawData_Map[f].normal.copy(Face2Data_Map[f].normal)
		}

		for(var e in Edge2Data_Map)
		{
			Edge2RawData_Map[e].position.copy(Edge2Data_Map[e].position)
			Edge2RawData_Map[e].axis.copy(Edge2Data_Map[e].axis)
		}
	}

	function RemoveObjectFromMap(obj_name, map, position)
	{
		map[position.x][position.y][position.z].splice(map[position.x][position.y][position.z].indexOf(obj_name), 1)
	}

	function MapObject(obj_name, map, position)
	{
		if(!Array.isArray(map[position.x]))
		{
			map[position.x] = []
			map[position.x][position.y] = []
			map[position.x][position.y][position.z] = []
		}
		else if(!Array.isArray(map[position.x][position.y]))
		{
			map[position.x][position.y] = []
			map[position.x][position.y] = []
			map[position.x][position.y][position.z] = []
		}
		else if(!Array.isArray(map[position.x][position.y][position.z]))
		{
			map[position.x][position.y][position.z] = []
		}

		map[position.x][position.y][position.z].push(obj_name)
	}

	//Class for an undirected map of hinges in the polycube.
	//A hinge can be two edges 
	function HingeGraph()
	{
		var Nt_Nodes = {} //Maps edge names to the node they belong to
		var Et_Nodes = [] //Three-dimensional mapping of endpoints to a list of nodes
		var Pt_Nodes = [] //Three-dimensional mapping of locations to a node

		//Input: The edge object to be added. Optional: A partner for that edge
		//Result:
		//If the edge is incident to another, they are clumped together to form a new node
		//Otherwise, simply create a new node
		this.AddEdge = function(edge)
		{
			//First, find out if this edge shares a location with another
			let node = VectorToData(Pt_Nodes, edge.position)
			if(node)
			{
				//If so, simply add this edge to that node
				node.Add(edge)
			}
			else
				CreateNode([edge])
		}

		//Input: A list of edge objects
		//Result:
		//-A new node is created with the edges clumped in it.
		function CreateNode(edge_list)
		{
			let new_node = new Node()

			for(var e in edge_list)
			{
				new_node.AddEdge(edge_list[e])

				Nt_Nodes[edge_list[e].name] = new_node

				//MapObject(new_node, Et_Nodes, edge_list[e].endpoints[0], edge_list[e].endpoints[1])
			}
		}

		//Input: A mapping and a vector
		//Output: Data that the vector maps to, if any.
		function VectorToData(map, vector)
		{
			if(map[vector.x])
			{
				if(map[vector.x][vector.y])
				{
					if(map[vector.x][vector.y][vector.z])
					{
						return map[vector.x][vector.y][vector.z]
					}
				}
			}

			return null
		}

		function MapEndpoints(endpoints, node)
		{
			if(!Array.isArray(Et_Nodes[endpoints[0].x]))
			{
				Et_Nodes[endpoints[0].x] = []
				Et_Nodes[endpoints[0].x][endpoints[0].y] = []
				Et_Nodes[endpoints[0].x][endpoints[0].y][endpoints[0].z] = []

				Et_Nodes[endpoints[1].x] = []
				Et_Nodes[endpoints[1].x][endpoints[1].y] = []
				Et_Nodes[endpoints[1].x][endpoints[1].y][endpoints[1].z] = []
			}

			Et_Nodes[endpoints[0].x][endpoints[0].y][endpoints[0].z].push(node)
			Et_Nodes[endpoints[1].x][endpoints[1].y][endpoints[1].z].push(node)
		}

		//Class for nodes in the graph
		function Node()
		{
			var EdgePair = [] //Holds a list of edges. Intended to be a pair of edges.
			var Neighbors = [] //Holds a list of neighbor nodes

			//Input: The node object to be removed
			//Result: The node is removed from the list of neighbors
			this.RemoveNeighbor = function(node)
			{
				Neighbors.splice(Neighbors.IndexOf(node))
			}

			//Input: The node object to be added
			//Result: The node is added to the list of neighbors
			this.AddNeighbor = function(node)
			{
				Neighbors.push(node)
			}

			//Output: The list of neighbors
			this.GetNeighbors = function()
			{
				return Neighbors
			}

			//Input: The edge object to be added
			//Result: The edge is added to the pair
			this.AddEdge = function(edge)
			{
				EdgePair.push(edge)
			}

			//Input: The edge object to be removed
			//Result: The edge is removed from the pair
			this.RemoveEdge = function(edge)
			{
				EdgePair.splice(EdgePair.IndexOf(edge))
			}

			//Output: A boolean value that tells if the value was cut or not
			//Simply, if there is only a single edge in this node, then it must
			//be a cut edge
			this.IsCut = function()
			{
				return EdgePair.length >= 2
			}
		}

	}

	function FaceGraph()
	{}
}