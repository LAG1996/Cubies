function PolyCube(position, name = "", auto_cleanse_flag = true){

	this.id = PolyCube.Next_ID
	this.name = name
	this.position = position
	this.auto_cleanse = auto_cleanse_flag

	this.Cube_Map = {}

	this.ID2Cube = {}
	this.Name2Cube = {}

	var DualGraphs = new FaceEdgeDualGraph()
	var FaceEdgeLocations = new FlexiFaceEdgeMap()

	var that = this


	//Adds a new cube to the polycube, assuming lattice positions
	this.Add_Cube = function(position)
	{
		if(ObjectExists(CubeExistsAtPosition(position)))
		{
			return false
		}
		else if(Object.keys(this.Cube_Map).length > 0)
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

		var cube = new Cube(Object.keys(this.Cube_Map).length, position, this.id)

		this.ID2Cube[cube.id] = cube
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

	this.Clean_Cube = function(cube)
	{
		for(var word in PolyCube.words2directions)
		{
			var dir = PolyCube.words2directions[word]

			var looking_at_pos = new THREE.Vector3().copy(cube.position)

			looking_at_pos.add(dir)

			if(CubeExistsAtPosition(looking_at_pos))
			{
				HandleFaceRemoval(cube, word)
				HandleFaceRemoval(this.GetCubeAtPosition(looking_at_pos), PolyCube.direction_words_to_opposites[word])
			}
		}
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
		return this.Cube_Map[that.PositionToKey(position)]
	}

	this.PositionToKey = function(position)
	{
		return position.x.toFixed(1)+","+position.y.toFixed(1)+","+position.z.toFixed(1)
	}

	this.toJSON = function(){
		var j_obj = {"name" : null, "position" : null, "cubes" : []}

		j_obj.name = this.name
		j_obj.position = [this.position.x, this.position.y, this.position.z]

		for(var val in this.Cube_Map)
		{
			var cube = this.Cube_Map[val]
			j_obj.cubes.push([cube.position.x, cube.position.y, cube.position.z])
		}

		return j_obj
	}

	this.Destroy = function()
	{
		for(var c in this.Cube_Map)
		{
			this.Cube_Map[c].Destroy()
		}

		delete this
	}

	function SetAdjacencies(cube_1)
	{
		for(var word in PolyCube.words2directions)
		{
			var dir = PolyCube.words2directions[word]
			var looking_at_pos = new THREE.Vector3().copy(cube_1.position)

			looking_at_pos.add(dir)

			if(CubeExistsAtPosition(looking_at_pos))
			{
				if(that.auto_cleanse)
				{
					HandleFaceRemoval(cube_1, word)
					HandleFaceRemoval(that.GetCubeAtPosition(looking_at_pos), PolyCube.direction_words_to_opposites[word])
				}

				var cube_2 = that.GetCubeAtPosition(looking_at_pos)

				RecordOrthoAdjacencies(cube_1, cube_2, word)
			}
			else
				continue

			for(var another_word in PolyCube.words2directions)
			{
				looking_at_pos.copy(cube_1.position)

				if(another_word != word && another_word != PolyCube.direction_words_to_opposites[word])
				{
					var diag_dir = new THREE.Vector3().addVectors(dir, PolyCube.words2directions[another_word])
					looking_at_pos.add(diag_dir)
					if(CubeExistsAtPosition(looking_at_pos))
					{
						cube_2 = that.GetCubeAtPosition(looking_at_pos)

						RecordDiagonalAdjacencies(cube_1, cube_2, another_word, PolyCube.direction_words_to_opposites[word])
					}
				}
			}
		}

		RecordAdjacencyWithSelf(cube_1)
	}

	function RecordOrthoAdjacencies(cube_1, cube_2, separating_dir_word)
	{
		for(var word in PolyCube.direction_words)
		{
			var w = PolyCube.direction_words[word]

			if(cube_1.has_faces[w] && cube_2.has_faces[w])
			{
				var f_1 = Cube.GetFaceName(cube_1, w)
				var f_2 = Cube.GetFaceName(cube_2, w)

				DualGraphs.AddNeighboringFaces(f_1, f_2)

				//that.HandleEdgeAdjacency(f_1, f_2)
			}
		}

		HandleEdgeAdjacency(cube_1, cube_2)
	}

	function RecordDiagonalAdjacencies(cube_1, cube_2, direction_1, direction_2)
	{

		if(cube_1.has_faces[direction_1] && cube_2.has_faces[direction_2])
		{
			var f_1 = Cube.GetFaceName(cube_1, direction_1)
			var f_2 = Cube.GetFaceName(cube_2, direction_2)

			DualGraphs.AddNeighboringFaces(f_1, f_2)

			//that.HandleEdgeAdjacency(f_1, f_2)
		}

		HandleEdgeAdjacency(cube_1, cube_2)
	}

	function RecordAdjacencyWithSelf(cube) 
	{
		for(var word in PolyCube.direction_words)
		{
			var dir_1 = PolyCube.direction_words[word]

			if(cube.has_faces[dir_1])
			{
				for(var word_2 in PolyCube.direction_words)
				{
					var dir_2 = PolyCube.direction_words[word_2]
					if(dir_1 != dir_2 && dir_2 != PolyCube.direction_words_to_opposites[dir_1])
					{
						if(cube.has_faces[dir_2])
						{
							var f_1 = Cube.GetFaceName(cube, dir_1)							
							var f_2 = Cube.GetFaceName(cube, dir_2)

							DualGraphs.AddNeighboringFaces(f_1, f_2)

							//that.HandleEdgeAdjacency(f_1, f_2)
						}
					}
				}
			}
		}

		HandleEdgeAdjacency(cube, cube)
	}

	function HandleEdgeAdjacency(cube_1, cube_2)
	{
		for(var edge_name_1 in cube_1.edgeEndpoints)
		{
			var e_1 = cube_1.edgeEndpoints[edge_name_1]

			for(var edge_name_2 in cube_2.edgeEndpoints)
			{
				if(cube_1.id == cube_2.id && edge_name_1 == edge_name_2)
					continue
				
				var e_2 = cube_2.edgeEndpoints[edge_name_2]

				if(cube_1.has_faces[Cube.FaceNameToDirection(Cube.EdgeNameToFaceName(edge_name_1))] && cube_2.has_faces[Cube.FaceNameToDirection(Cube.EdgeNameToFaceName(edge_name_2))])
				{
					if((e_1[0].equals(e_2[0]) && e_1[1].equals(e_2[1])) || (e_1[0].equals(e_2[1]) && e_1[1].equals(e_2[0])))
					{
						DualGraphs.AddIncidentEdges(edge_name_1, e_1, edge_name_2, e_2)
					}
					else if(e_1[0].equals(e_2[0]) || e_1[0].equals(e_2[1]) || e_1[1].equals(e_2[0]) || e_1[1].equals(e_2[1])) 
					{
						DualGraphs.AddNeighboringEdges(edge_name_1, e_1, edge_name_2, e_2)
					}
				}
			}
		}
	}

	this.Recalculate_Edge_Neighbors = function(face_1_name, face_2_name)
	{
		var f_1 = this.Get_Face(face_1_name)
		var f_2 = this.Get_Face(face_2_name)

		for(var dir in PolyCube.direction_words[dir])
		{
			if(PolyCube.direction_words[dir] == "front" || PolyCube.direction_words[dir] == "back")
				continue

			var edge_name = face_1_name + "_" + PolyCube.direction_words[dir]

			DualGraphs.RemoveEdge(edge_name)
		}

		for(var dir in PolyCube.direction_words[dir])
		{
			if(PolyCube.direction_words[dir] == "front" || PolyCube.direction_words[dir] == "back")
				continue

			var edge_name = face_2_name + "_" + PolyCube.direction_words[dir]

			DualGraphs.RemoveEdge(edge_name)
		}

		for(var n in f_1.neighbors)
		{
			HandleEdgeAdjacencyByFace(face_2_name, n)
			HandleEdgeAdjacencyByFace(face_1_name, n)
		}

		for(var n in f_2.neighbors)
		{
			HandleEdgeAdjacencyByFace(face_1_name, n)
			HandleEdgeAdjacencyByFace(face_2_name, n)
		}

		DualGraphs.AddNeighboringFaces(face_1_name, face_2_name)

		HandleEdgeAdjacencyByFace(face_1_name, face_2_name)

		DualGraphs.UpdateCutPaths()
		DualGraphs.UpdateHingePaths()
	}

	function HandleEdgeAdjacencyByFace(face_1_name, face_2_name)
	{
		for(var dir in PolyCube.direction_words)
		{
			if(PolyCube.direction_words[dir] == "front" || PolyCube.direction_words[dir] == "back")
				continue

			var edge_name_1 = face_1_name + "_" + PolyCube.direction_words[dir]

			var e_1_d = FaceEdgeLocations.GetEdgeData(edge_name_1)
			var e_1_e = FaceEdgeLocations.GetEndPoints(edge_name_1)

			for(var dir2 in PolyCube.direction_words)
			{
				if(PolyCube.direction_words[dir2] == "front" || PolyCube.direction_words[dir2] == "back")
					continue

				var edge_name_2 = face_2_name + "_" + PolyCube.direction_words[dir2]

				var e_2_d = FaceEdgeLocations.GetEdgeData(edge_name_2)	
				var e_2_e = FaceEdgeLocations.GetEndPoints(edge_name_2)

				if(e_1_d.location.equals(e_2_d.location))
				{
					DualGraphs.AddIncidentEdges(edge_name_1, e_1_e, edge_name_2, e_2_e)
				}
				else if(e_1_e[0].equals(e_2_e[0]) || e_1_e[0].equals(e_2_e[1]) || e_1_e[1].equals(e_2_e[0]) || e_1_e[1].equals(e_2_e[1]))
				{
					DualGraphs.AddNeighboringEdges(edge_name_1, e_1_e, edge_name_2, e_2_e)
				}
			}
		}
	}

	function MapCube(position, cube)
	{
		that.Cube_Map[that.PositionToKey(position)] = cube
	}

	function CubeExistsAtPosition(position)
	{
		return ObjectExists(that.Cube_Map[that.PositionToKey(position)])
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
PolyCube.GenerateNewPolyCube = function(position = new Vector3(0, 0, 0), name = "PolyCube_" + PolyCube.Next_ID)
{
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