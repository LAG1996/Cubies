function PolyCube(position, name = ""){
	this.name = name
	this.scale = 1
	this.obj = new THREE.Group()
	this.trans_helper = new THREE.AxisHelper(4)

	this.obj.position.copy(LatticeToReal(position))
	this.obj.add(this.trans_helper)

	var _lattice_position = position
	var L_Cubes = []
	var L_Edges = []

	var that = this

	scene.add(this.obj)

	this.Add_Cube = function(position){
		var key = PosToKey(position)

		if(!(key in L_Cubes))
		{
			cube = new Cube(scene, position, that)
			that.obj.add(cube.Obj)

			L_Cubes[key] = cube

			//Clean up the cube so no two faces are incident
			var up = PosToKey(new THREE.Vector3(cube.lattice_position.x, cube.lattice_position.y + 1, cube.lattice_position.z))
			var down = PosToKey(new THREE.Vector3(cube.lattice_position.x, cube.lattice_position.y - 1, cube.lattice_position.z))
			var right = PosToKey(new THREE.Vector3(cube.lattice_position.x + 1, cube.lattice_position.y, cube.lattice_position.z))
			var left = PosToKey(new THREE.Vector3(cube.lattice_position.x - 1, cube.lattice_position.y, cube.lattice_position.z))
			var front = PosToKey(new THREE.Vector3(cube.lattice_position.x, cube.lattice_position.y, cube.lattice_position.z + 1))
			var back = PosToKey(new THREE.Vector3(cube.lattice_position.x, cube.lattice_position.y, cube.lattice_position.z - 1))

			if(up in L_Cubes)
			{
				console.log("Incident face up")
				cube.RemoveFace("up")
				L_Cubes[up].RemoveFace("down")
			}
			if(down in L_Cubes)
			{
				console.log("Incident face down")
				cube.RemoveFace("down")
				L_Cubes[down].RemoveFace("up")
			}
			if(right in L_Cubes)
			{
				console.log("Incident face right")
				cube.RemoveFace("right")
				L_Cubes[right].RemoveFace("left")
			}
			if(left in L_Cubes)
			{
				console.log("Incident face left")
				cube.RemoveFace("left")
				L_Cubes[left].RemoveFace("right")
			}
			if(front in L_Cubes)
			{
				console.log("Incident face front")
				cube.RemoveFace("front")
				L_Cubes[front].RemoveFace("back")
			}
			if(back in L_Cubes)
			{
				console.log("Incident face back")
				cube.RemoveFace("back")
				L_Cubes[back].RemoveFace("front")
			}
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
}

PolyCube.ID = 0
PolyCube.name_being_changed = ""
PolyCube.Active_Polycube = null
PolyCube.L_Polycubes = []

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