function PolyCube(position, name = ""){
	this.name = name
	this.scale = 1
	this.obj = new THREE.Group()
	this.trans_helper = new THREE.AxisHelper(4)

	this.obj.position.copy(LatticeToReal(position))
	this.obj.add(this.trans_helper)

	var AdjacencyGraph = new FaceEdgeDualGraph()
	var _lattice_position = position
	var L_Cubes = []

	var that = this

	scene.add(this.obj)

	this.Add_Cube = function(position){
		var key = PosToKey(position)

		if(!(key in L_Cubes))
		{
			cube = new Cube(scene, position, that)
			that.obj.add(cube.Obj)

			L_Cubes[key] = cube
			latt_pos = cube.lattice_position

			//Cube faces have adjacency with each other, so let's set this first
			SetAdjacentFacesWithSelf(cube)

			/*///////////////////////////
			START CLEANING CUBE AND SETTING UP ADJACENCY
			*///////////////////////////
			//Clean up the cube so no two faces are incident
			for(var key in PolyCube.key_to_dir)
			{
				var dir = PosToKey(SumOfVectors([PolyCube.key_to_dir[key], latt_pos]))
				var cube_2 = L_Cubes[dir]
				if(ObjectExists(cube_2))
				{
					console.log("Adjacency with " + key)
					HandleFaceRemoval(cube, key)
					HandleFaceRemoval(cube_2, PolyCube.dir_to_opp[key])
					SetAdjacentFaces(cube, cube_2, key)
				}
			}
			/*////////////////////////
			FINISH CLEANING CUBE AND SETTING UP ADJACENCY
			*///////////////////////	
		}
		else
		{
			console.log("Cube already exists here")
		}
	}

	//Set the x-axis of the origin of this polycube
	this.Set_PosX = function(x){
		_lattice_position.x = Math.floor(x)
		that.obj.position.x = LatticeToRealXZ(x)
	}

	//Set the y-axis of the origin of this polycube
	this.Set_PosY = function(y){
		_lattice_position.y = Math.floor(y)
		that.obj.position.y = LatticeToRealY(y)
	}

	//Set the z-axis of the origin of this polycube
	this.Set_PosZ = function(z){
		_lattice_position.z = Math.floor(z)
		that.obj.position.z = LatticeToRealXZ(z)
	}

	//Return the list of cubes in the polycube
	this.Get_Cubes = function(){
		return L_Cubes
	}

	//Let cube1 be the cube we are addding to the polycube, and cube2 be a cube adjacent to cube1. Then dir is the Vector3 representing the direction from
	//cube1 to cube2. For each face that is not facing the same or opposite direction to dir, check if each cube has the corresponding face.
	//If so, then the respective faces of each cube are adjacent.
	//If not, then there are two possibilities:
	// 1. there is a cube adjacent to cube2
	// 2. the missing face was cut out from either cube
	//Then, we simply check for 1. If case 1 fails, then it follows that case 2 is correct, and there is no adjacency.
	var SetAdjacentFaces = function(cube_1, cube_2, dir)
	{
		for(i = 0; i < PolyCube.dir_keys.length; i++)
		{
			var dir2 = PolyCube.dir_keys[i]
			if(dir2 != dir && dir2 != PolyCube.dir_to_opp[dir])
			{
				var face_1 = cube_1.Obj.getObjectByName(dir2)
				var face_2 = cube_2.Obj.getObjectByName(dir2)

				if(ObjectExists(face_1) && ObjectExists(face_2))
				{
					AdjacencyGraph.AddNeighboringFaces(PolyCube.CubeFaceString(cube_1, dir2), face_1,
					PolyCube.CubeFaceString(cube_2, dir2), face_2)
				}
				else
				{
					CheckAndSetAdjacentWithDiagonal(cube_1, dir, dir2)
				}
			}
		}
	}

	//Let cube1 be the cube we are adding to the polycube, and cube2 be a cube adjacent to cube1. Then, dir1 is the Vector3 representing the direction from cube1 to cube2,
	//and dir2 is the direction from cube2 where there may be another cube, which will be called cube3. If cube3 exists, then it is diagonal to cube1, and so one of its faces
	//will be adjacent to one of cube1's faces.
	//In particular, the adjacent faces between cube1 and cube3 would be cube1's dir2 face and cube3 opposite(dir1) face.
	//In this code, cube3 will be called cube_2, and cube1 would just be called cube.
	var CheckAndSetAdjacentWithDiagonal = function(cube, dir1, dir2)
	{
		var cube_2 = L_Cubes[PosToKey(SumOfVectors([PolyCube.key_to_dir[dir1], PolyCube.key_to_dir[dir2], cube.lattice_position]))]

		if(ObjectExists(cube_2))
		{
			var face_1 = cube.Obj.getObjectByName(dir2)
			var face_2 = cube_2.Obj.getObjectByName(PolyCube.dir_to_opp[dir1])

			if(ObjectExists(face_1) && ObjectExists(face_2))
			{
				AdjacencyGraph.AddNeighboringFaces(PolyCube.CubeFaceString(cube, dir2), face_1, PolyCube.CubeFaceString(cube_2, PolyCube.dir_to_opp[dir1]), face_2)
			}
		}
	}

	//For each face in a cube, we can say that it is adjacent to any other face in the same cube if and only if they are not facing opposite directions
	var SetAdjacentFacesWithSelf = function(cube)
	{
		for(i = 0; i < PolyCube.dir_keys.length; i++)
			{
				d1 = PolyCube.dir_keys[i]
				for(k = 0; k < PolyCube.dir_keys.length; k++)
				{
					d2 = PolyCube.dir_keys[k]
					if(d1 != d2 && PolyCube.dir_to_opp[d1] != d2)
					{
						AdjacencyGraph.AddNeighboringFaces(PolyCube.CubeFaceString(cube, d1), cube.Obj.getObjectByName(d1), 
							PolyCube.CubeFaceString(cube, d2), cube.Obj.getObjectByName(d2))
					}
				}
			}
	}

	//This is a utility function for removing a face from both a cube and the face dual graph
	var HandleFaceRemoval = function(cube, dir)
	{
		AdjacencyGraph.RemoveFace(PolyCube.CubeFaceString(cube, dir))
		cube.RemoveFace(dir)
	}

	//Utility function for converting the lattice position of a cube to a key to look up in L_Cubes
	var PosToKey = function(position){
		return position.x+","+position.y+","+position.z
	}

}

PolyCube.ID = 0
PolyCube.name_being_changed = ""
PolyCube.Active_Polycube = null
PolyCube.L_Polycubes = []

//The keys that we use to both denote directions from cube to cube and the labeling of each face in the cube
PolyCube.dir_keys = ["up", "down", "right", "left", "front", "back"]
//Mapping keys to their opposite labels
PolyCube.dir_to_opp = {"up": "down", "down": "up", "right": "left", "left": "right", "front": "back", "back": "front"}
//Mapping keys to the vectors that they represent
PolyCube.key_to_dir = {
	"up" : new THREE.Vector3(0, 1, 0),
	"down": new THREE.Vector3(0, -1, 0),
	"left": new THREE.Vector3(-1, 0, 0),
	"right": new THREE.Vector3(1, 0, 0),
	"front": new THREE.Vector3(0, 0, 1),
	"back": new THREE.Vector3(0, 0, -1),
}

//A static utility function for taking a cube id and the label of a face on that cube and turning it into an id for usage in the dual graph
PolyCube.CubeFaceString = function(cube, dir)
{
	return cube.ToIDString() + dir
}

//A static utility function for generating a new polycube object.
//It does the following:
//1. adds the polycube to the static list of polycubes,
//2. adds a corresponding DOM element to the list of polycubes that could be seen in the page
//3. adds corresponding functions to each of the added DOM elements. These functions including changing polycube names and positions, as well as setting
//	which polycube is active.
PolyCube.GenerateNewPolyCube = function(position, name)
{
	var new_pcube = new PolyCube(position, name)
	PolyCube.L_Polycubes[name] = new_pcube

	var object_data_space = $("#object_template").clone()

	var id_string = new_pcube.name + "_data"

	$(object_data_space).attr("id", id_string)

	$(object_data_space).find("#active_toggle").text(new_pcube.name)

	$(object_data_space).find("#poly_obj_name_edit").val(new_pcube.name)
	$(object_data_space).find("#poly_obj_x_edit").val($("#add_poly_modal_x").val())
	$(object_data_space).find("#poly_obj_y_edit").val($("#add_poly_modal_y").val())
	$(object_data_space).find("#poly_obj_z_edit").val($("#add_poly_modal_z").val())

	$(object_data_space).find("#objName_data_edit").attr("id", id_string+"_edit")

	$(object_data_space).show()

	$("#object_data_list").append(object_data_space)

	//Set up what happens when you click the button that triggers this polycube's active state
	//The button that I'm talking about would be found in the dropdown that shows all polycube data
	$(object_data_space).find("#active_toggle").click(function(){
			var thingy = $("#"+$(this).text() + "_data_edit")

			if($(thingy).is(":visible"))
			{
				$(thingy).hide()
				$(this).attr("class", "w3-button w3-black w3-right obj_data_trigger")
				PolyCube.SwitchToNewActive(null)
			}
			else
			{
				$(".obj_data_edit").hide()
				$(".obj_data_trigger").attr("class", "w3-button w3-black w3-right obj_data_trigger")
				$(thingy).show()
				$(this).attr("class", "w3-button w3-white w3-right obj_data_trigger")
				PolyCube.SwitchToNewActive(PolyCube.L_Polycubes[$(this).text()])
			}
		})

	//Set up what happens when somebody changes the polycube's name
	//It changes name property of the actual polycube object, the key that maps to it in the list of polycubes.
	//It also changes the text found on its active toggle button, and the id's of its respective div in the DOM
	$(object_data_space).find("#poly_obj_name_edit").blur(function(){
		var old_name = $(this).parent().parent().find("button").text()
		var new_name = $(this).val()

		if(old_name != new_name)
		{
			PolyCube.ChangeName(old_name, new_name)
			$(this).parent().parent().find("#active_toggle").text(new_name)

			$(this).parent().attr("id", new_name+"_data_edit")
			$(this).parent().parent().attr("id", new_name+"_data")
		}
	})

	//Set up what happens when the field containing the polycube's x-coordinate is changed
	$(object_data_space).find("#poly_obj_x_edit").blur(function(){
		var name = $(this).parent().parent().find("#active_toggle").text()

		PolyCube.Active_Polycube.Set_PosX(parseInt($(this).val()))
	})

	//Set up what happens when the field containing the polycube's y-coordinate is changed
	$(object_data_space).find("#poly_obj_y_edit").blur(function(){
		var name = $(this).parent().parent().find("#active_toggle").text()

		PolyCube.Active_Polycube.Set_PosY(parseInt($(this).val()))
	})

	//Set up what happens when the field containing the polycube's z-coordinate is changed
	$(object_data_space).find("#poly_obj_z_edit").blur(function(){
		var name = $(this).parent().parent().find("#active_toggle").text()

		PolyCube.Active_Polycube.Set_PosZ(parseInt($(this).val()))
	})


	PolyCube.ID++
	PolyCube.SwitchToNewActive(new_pcube)
}

PolyCube.ChangeName = function(old_name, new_name)
{
	var p_cube = PolyCube.Active_Polycube

	p_cube.name = new_name

	delete PolyCube.Active_Polycube

	PolyCube.L_Polycubes[new_name] = p_cube
	PolyCube.Active_Polycube = p_cube
}

PolyCube.SwitchToNewActive = function(new_active)
{
	if(PolyCube.Active_Polycube != null)
	{
		PolyCube.Active_Polycube.trans_helper.visible = false
	}

	PolyCube.Active_Polycube = new_active

	if(PolyCube.Active_Polycube != null)
	{
		PolyCube.Active_Polycube.trans_helper.visible = true
	}
}

PolyCube.CalculateFaceID = function(facename, cube)
{
	return PolyCube.dir_keys.indexOf(facename) + cube.ID + cube.ID*18
}

PolyCube.CalculateHingeID = function(cube)
{
	
}
