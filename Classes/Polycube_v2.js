"use strict";
function PolyCube(position, name = "", auto_cleanse_flag = true){

	this.id = PolyCube.Next_ID
	this.name = name
	this.position = position
	this.auto_cleanse = auto_cleanse_flag

	this.Cube_Map = []

	var DualGraphs = new FaceEdgeDualGraph()
	var FaceEdgeLocations = new FlexiFaceEdgeMap()

	var cube_count = 0
	var can_add_cube = true
	var that = this

	//Adds a new cube to the polycube, assuming lattice positions
	this.Add_Cube = function(position)
	{
		if(!can_add_cube)
			return

		if(ObjectExists(CubeExistsAtPosition(position)))
		{
			return false
		}
		else if(cube_count > 0)
		{
			//Check if there are any adjacencies
			var has_adjacent_cubes = false
			for(var word in PolyCube.words2directions)
			{
				var dir = PolyCube.words2directions[word]
				var looking_at_pos = new THREE.Vector3().copy(position)
	
				looking_at_pos.add(dir)
	
				if(CubeExistsAtPosition(looking_at_pos))
				{
					has_adjacent_cubes = true
				}
			}

			if(!has_adjacent_cubes)
			{
				console.log("Cannot add a cube that is not adjacent to another")

				return false
			}
		}

		var cube = new Cube(cube_count++, position, this.id)

		MapCube(position, cube)

		for(var f_dir in cube.has_faces)
		{
			if(cube.has_faces[f_dir])
			{
				var face_name = Cube.GetFaceName(cube, f_dir)
				var face_loc = new THREE.Vector3().addVectors(cube.lattice_position, PolyCube.words2directions[f_dir])
				var face_normal = PolyCube.words2directions[f_dir]
				FaceEdgeLocations.AddFace(face_name, face_loc, face_normal)

				for(var e_dir in cube.has_faces)
				{
					if(e_dir == "front" || e_dir == "back")
						continue

					var edge_name = Cube.GetEdgeName(cube, f_dir, e_dir)
					
					var axis = new THREE.Vector3().subVectors(cube.edgeEndpoints[edge_name][0], cube.edgeEndpoints[edge_name][1])

					var edge_axis = MakePositiveVector(axis).normalize()

					var edge_loc = new THREE.Vector3().addVectors(cube.edgeEndpoints[edge_name][1], axis.multiplyScalar(.5))

					FaceEdgeLocations.AddEdge(edge_name, face_name, edge_loc, edge_axis)
				}
			}
		}

		SetAdjacencies(cube)

		return true

	}

	this.Rotate_Data = function(edge_name, face_name, rads, axis)
	{
		FaceEdgeLocations.RotateFaceAroundEdge(edge_name, face_name, rads, axis)
	}

	this.Reset_Data = function()
	{
		FaceEdgeLocations.ResetData()
	}

	this.Cut_Edge = function(edge_name)
	{
		can_add_cube = false
		return DualGraphs.HandleCut(edge_name)
	}

	this.Get_Edge = function(edge_name)
	{
		return DualGraphs.GetEdge(edge_name)
	}

	this.Get_Edge_Data = function(edge_name)
	{
		return FaceEdgeLocations.GetEdgeData(edge_name)
	}

	this.Get_Edge_Endpoints = function(edge_name)
	{
		return FaceEdgeLocations.GetEndPoints(edge_name)
	}

	this.Get_Face = function(face_name)
	{
		return DualGraphs.GetFace(face_name)
	}

	this.Get_Face_Data = function(face_name)
	{
		return FaceEdgeLocations.GetFaceData(face_name)
	}

	this.Have_Common_Edge = function(face_1_name, face_2_name)
	{
		return FaceEdgeLocations.HaveCommonEdge(face_1_name, face_2_name)
	}

	this.Get_Faces = function()
	{
		return DualGraphs.GetFaces()
	}

	this.Get_Edges = function()
	{
		return DualGraphs.GetEdges()
	}

	this.Get_Cuts = function()
	{
		return DualGraphs.GetCutEdges()
	}

	this.Is_Cut = function(edge_name)
	{
		return DualGraphs.IsCut(edge_name)
	}

	this.Is_Hinge = function(edge_name)
	{
		return DualGraphs.IsHinge(edge_name)
	}

	this.Is_Invalid_Cut = function(edge_name)
	{
		return DualGraphs.IsInvalid(edge_name)
	}

	this.Get_Rotation_Lines = function()
	{
		return DualGraphs.GetRotationLines()
	}

	this.Get_Face_Graphs = function(edge_name)
	{
		return DualGraphs.GetSubGraphs(edge_name)
	}

	this.GetCubeAtPosition = function(position)
	{
		if(!Array.isArray(this.Cube_Map[position.x]))
			return null

		return this.Cube_Map[position.x][position.y][position.z]
	}

	this.PositionToKey = function(position)
	{
		return ((position.x * 73856093) ^ (position.y * 19349663) ^ (position.z * 83492791)) % max_size
	}

	this.toJSON = function(){
		var j_obj = {"name" : null, "position" : null, "cubes" : []}

		j_obj.name = this.name
		j_obj.position = [this.position.x, this.position.y, this.position.z]

		for(var i_1 in this.Cube_Map)
		{
			for(var i_2 in this.Cube_Map[i_1])
			{
				for(var i_3 in this.Cube_Map[i_1][i_2])
				{
					var cube = this.Cube_Map[i_1][i_2][i_3]

					if(cube)
						j_obj.cubes.push([cube.position.x, cube.position.y, cube.position.z])
				}
			}
		}

		return j_obj
	}

	this.Destroy = function()
	{
		delete this.Cube_Map

		delete this
	}

	function SetAdjacencies(cube)
	{
		Clean_Cube(cube)

		for(var word in PolyCube.words2directions)
		{
			if(!cube.has_faces[word])
				continue

			var face_name = Cube.GetFaceName(cube, word)

			FindAdjacentFaces(face_name)
		}

		function Clean_Cube(cube)
		{
			for(var word in PolyCube.words2directions)
			{
				var dir = PolyCube.words2directions[word]
	
				var looking_at_pos = new THREE.Vector3().copy(cube.position)
	
				looking_at_pos.add(dir)
	
				if(CubeExistsAtPosition(looking_at_pos))
				{
					HandleFaceRemoval(cube, word)
					HandleFaceRemoval(that.GetCubeAtPosition(looking_at_pos), PolyCube.direction_words_to_opposites[word])
				}
			}
		}
	}

	function UpdateEdgeEndpoints(edge_name, endpoints)
	{
		var e = DualGraphs.GetEdge(edge_name)

		e.endpoints = endpoints
	}

	this.Recalculate_Edge_Neighbors = function(face_1_name, face_2_name, edge_1_name, edge_2_name)
	{
		var faces = this.Get_Faces()
		var edges = this.Get_Edges()

		var cut_edges = Object.keys(this.Get_Cuts())

		for(var e in edges)
		{
			DualGraphs.RemoveEdge(e)
		}
	
		for(var f in faces)
		{
			FindAdjacentFaces(faces[f].name)
		}

		for(var e in cut_edges)
		{
			var edge_name = cut_edges[e]

			if(edge_name == edge_1_name || edge_name == edge_2_name)
				continue

			DualGraphs.HandleCutNoUpdate(edge_name)
		}

		DualGraphs.UpdateCutPaths()
		DualGraphs.UpdateHingePaths()
	}

	function FindAdjacentFaces(face_name)
	{
		var edges = FaceEdgeLocations.GetEdgesFromFace(face_name)

		for(var e in edges)
		{
			var edge_1 = edges[e]
			var edge_2_list = FaceEdgeLocations.GetEdgesAtLoc(edge_1.position)
			var edge_2_name = edge_2_list[0] == edge_1.name ? edge_2_list[1] : edge_2_list[0]

			var other_face = FaceEdgeLocations.GetFaceFromEdge(edge_2_name)

			if(!ObjectExists(other_face))
				continue

			DualGraphs.AddNeighboringFaces(face_name, other_face.name)

			DualGraphs.AddIncidentEdges(edge_1.name, FaceEdgeLocations.GetEndPoints(edge_1.name), 
				edge_2_name, FaceEdgeLocations.GetEndPoints(edge_2_name))

			FindAdjacentEdges(edges, FaceEdgeLocations.GetEdgesFromFace(other_face.name))
		}
	}

	function FindAdjacentEdges(edges_1, edges_2)
	{
		for(var e_1 in edges_1)
		{
			for(var e_2 in edges_2)
			{
				var ed_1 = edges_1[e_1]
				var ed_2 = edges_2[e_2]

				if(ed_1.position.equals(ed_2.position))
					continue 

				var endpoints_1 = FaceEdgeLocations.GetEndPoints(ed_1.name)
				var endpoints_2 = FaceEdgeLocations.GetEndPoints(ed_2.name)

				if(endpoints_1[0].equals(endpoints_2[0]) || endpoints_1[0].equals(endpoints_2[1]) || 
					endpoints_1[1].equals(endpoints_2[0]) || endpoints_1[1].equals(endpoints_2[1]))
				{
					DualGraphs.AddNeighboringEdges(ed_1.name, endpoints_1, ed_2.name, endpoints_2)
				}
			}
		}
	}

	function MapCube(position, cube)
	{
		if(!Array.isArray(that.Cube_Map[position.x]))
		{
			that.Cube_Map[position.x] = []
			that.Cube_Map[position.x][position.y] = []
		}
		else if(!Array.isArray(that.Cube_Map[position.x][position.y]))
		{
			that.Cube_Map[position.x][position.y] = []
		}


		that.Cube_Map[position.x][position.y][position.z] = cube
	}

	function CubeExistsAtPosition(position)
	{

		if(!Array.isArray(that.Cube_Map[position.x]))
		{
			return false
		}
		else if(!Array.isArray(that.Cube_Map[position.x][position.y]))
		{
			return false
		}

		return ObjectExists(that.Cube_Map[position.x][position.y][position.z])
	}

	function HandleFaceRemoval(cube, dir_word)
	{
		var face_name = Cube.GetFaceName(cube, dir_word)

		cube.has_faces[dir_word] = false

		DualGraphs.RemoveFace(face_name)

		for(var word in PolyCube.direction_words)
		{
			if(PolyCube.direction_words[word] != 'front' && PolyCube.direction_words[word] != 'back')
				DualGraphs.RemoveEdge(Cube.GetEdgeName(cube, dir_word, PolyCube.direction_words[word]))
		}

		FaceEdgeLocations.RemoveFace(face_name)
	}

}

PolyCube.Next_ID = 0

PolyCube.direction_words = [
	"down",
	"right",
	"left",
	"front",
	"back",
	"up"
]

PolyCube.words2directions = {
	"up" : new THREE.Vector3(0, 1, 0),
	"down": new THREE.Vector3(0, -1, 0),
	"left": new THREE.Vector3(-1, 0, 0),
	"right": new THREE.Vector3(1, 0, 0),
	"front": new THREE.Vector3(0, 0, 1),
	"back": new THREE.Vector3(0, 0, -1)
}

PolyCube.direction_words_to_opposites = {
	"up": "down", 
	"down": "up", 
	"right": "left", 
	"left": "right", 
	"front": "back", 
	"back": "front"
}

PolyCube.Name2Poly = {}
PolyCube.ID2Poly = {}

//Generate new polycube, record it into the polycube dictionaries, and then return a reference to the
//new polycube
PolyCube.GenerateNewPolyCube = function(position = new Vector3(0, 0, 0), name = "")
{

	//If the user just submitted a blank name, that won't do! Change it to a generic name (i.e. Polycube_0)
	if(!/\S/.test(name))
	{
		name = "PolyCube_" + PolyCube.Next_ID
	}

	var new_pcube = new PolyCube(position, name)
	PolyCube.Name2Poly[name] = new_pcube
	PolyCube.ID2Poly[new_pcube.id] = new_pcube
	PolyCube.Next_ID++;

	return new_pcube
}

//Erase records of this polycube, and then destroy the polycube
PolyCube.DestroyPolyCube = function(polycube)
{
	delete PolyCube.Name2Poly[polycube.name]
	delete PolyCube.ID2Poly[polycube.id]
	polycube.Destroy()
}