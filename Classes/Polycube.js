function PolyCube(position, name = ""){
	this.name = name
	this.scale = 1
	this.obj = new THREE.Group()
	this.trans_helper = new THREE.AxisHelper(4)

	this.obj.position.copy(LatticeToReal(position))
	this.obj.add(this.trans_helper)

	var AdjacencyGraph = new DualGraph()
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

			//Cube faces have adjacency with each other, so let's set this first
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

			/*///////////////////////////
			START CLEANING CUBE AND SETTING UP ADJACENCY
			*///////////////////////////
			//Clean up the cube so no two faces are incident
			var up = PosToKey(new THREE.Vector3().addVectors(PolyCube.key_to_dir["up"], cube.lattice_position))
			var down = PosToKey(new THREE.Vector3().addVectors(PolyCube.key_to_dir["down"], cube.lattice_position))
			var right = PosToKey(new THREE.Vector3().addVectors(PolyCube.key_to_dir["right"], cube.lattice_position))
			var left = PosToKey(new THREE.Vector3().addVectors(PolyCube.key_to_dir["left"], cube.lattice_position))
			var front = PosToKey(new THREE.Vector3().addVectors(PolyCube.key_to_dir["front"], cube.lattice_position))
			var back = PosToKey(new THREE.Vector3().addVectors(PolyCube.key_to_dir["back"], cube.lattice_position))

			var c_up = L_Cubes[up]
			var c_down = L_Cubes[down]
			var c_right = L_Cubes[right]
			var c_left = L_Cubes[left]
			var c_front = L_Cubes[front]
			var c_back = L_Cubes[back]

			if(ObjectExists(c_up))
			{
				console.log("Incident face up")
				
				HandleFaceRemoval(cube, c_up)

				SetAdjacentFaces(cube, c_up, "up")
			}
			if(ObjectExists(c_down))
			{
				console.log("Incident face down")
				HandleFaceRemoval(cube, c_down)
				SetAdjacentFaces(cube, c_down, "down")
			}
			if(ObjectExists(c_right))
			{
				console.log("Incident face right")
				HandleFaceRemoval(cube, c_right, "right")
				SetAdjacentFaces(cube, c_right, "right")
			}
			if(ObjectExists(c_left))
			{
				console.log("Incident face left")
				HandleFaceRemoval(cube, c_left, "left")
				SetAdjacentFaces(cube, c_left, "left")
			}
			if(ObjectExists(c_front))
			{
				console.log("Incident face front")
				HandleFaceRemoval(cube, c_front, "front")
				SetAdjacentFaces(cube, c_front, "front")
			}
			if(ObjectExists(c_back))
			{
				console.log("Incident face back")
				HandleFaceRemoval(cube, c_back, "back")
				SetAdjacentFaces(cube, c_back, "back")
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

	this.Set_PosX = function(x){
		_lattice_position.x = Math.floor(x)
		that.obj.position.x = LatticeToRealXZ(x)
	}

	this.Set_PosY = function(y){
		_lattice_position.y = Math.floor(y)
		that.obj.position.y = LatticeToRealY(y)
	}

	this.Set_PosZ = function(z){
		_lattice_position.z = Math.floor(z)
		that.obj.position.z = LatticeToRealXZ(z)
	}

	this.Get_Cubes = function(){
		return L_Cubes
	}

	var PosToKey = function(position){
		return position.x+","+position.y+","+position.z
	}

	var SetAdjacentFaces = function(cube_1, cube_2, dir)
	{
		for(i = 0; i < PolyCube.dir_keys.length; i++)
		{
			if(PolyCube.dir_keys[i] != dir && PolyCube.dir_keys[i] != PolyCube.dir_to_opp[dir])
			{
				AdjacencyGraph.AddNeighboringFaces(PolyCube.CubeFaceString(cube_1, PolyCube.dir_keys[i]), cube_1.Obj.getObjectByName(PolyCube.dir_keys[i]),
				PolyCube.CubeFaceString(cube_2, PolyCube.dir_keys[i]), cube_2.Obj.getObjectByName(PolyCube.dir_keys[i]))
			}
		}
	}

	var HandleFaceRemoval = function(cube_1, cube_2, dir)
	{

		AdjacencyGraph.RemoveFace(PolyCube.CubeFaceString(cube_1, dir))
		AdjacencyGraph.RemoveFace(PolyCube.CubeFaceString(cube_2, PolyCube.dir_to_opp[dir]))

		cube_1.RemoveFace(dir)
		cube_2.RemoveFace(PolyCube.dir_to_opp[dir])
	}
}

PolyCube.ID = 0
PolyCube.name_being_changed = ""
PolyCube.Active_Polycube = null
PolyCube.L_Polycubes = []
PolyCube.dir_keys = ["up", "down", "right", "left", "front", "back"]
PolyCube.dir_to_opp = {"up": "down", "down": "up", "right": "left", "left": "right", "front": "back", "back": "front"}
PolyCube.key_to_dir = {
	"up" : new THREE.Vector3(0, 1, 0),
	"down": new THREE.Vector3(0, -1, 0),
	"left": new THREE.Vector3(-1, 0, 0),
	"right": new THREE.Vector3(1, 0, 0),
	"front": new THREE.Vector3(0, 0, 1),
	"back": new THREE.Vector3(0, 0, -1)
}

PolyCube.CubeFaceString = function(cube, dir)
{
	return cube.ToIDString() + dir
}

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