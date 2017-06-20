function PolyCube(position, name = ""){
	this.name = name
	this.position = position
	this.scale = 1
	this.L_Cubes = []
	this.L_Edges = []

	var new_cube_queue = []
	var index = 0

	this.Add_Cube = function(position){
		
		cube = new Cube(scene)
		cube.Obj.position.clone(position)
		scene.add(cube.Obj)

		console.log(cube.Obj)
	}
}

PolyCube.ID = 0
PolyCube.name_being_changed = ""

PolyCube.GenerateNewPolyCube = function(position, name)
{
	var new_pcube = new PolyCube(position, name)
	L_Polycubes[name] = new_pcube

	var object_view_space = $("#object_template").clone()

	var id_string = new_pcube.name + "_data"

	$(object_view_space).attr("id", id_string)

	$(object_view_space).find("#obj_data_trigger_template").text(new_pcube.name)
	$(object_view_space).find("#obj_data_trigger_template").attr("id", id_string+"_trigger")

	$(object_view_space).find("#poly_obj_name_edit").val(new_pcube.name)
	$(object_view_space).find("#poly_obj_x_edit").val($("#add_poly_modal_x").val())
	$(object_view_space).find("#poly_obj_y_edit").val($("#add_poly_modal_y").val())
	$(object_view_space).find("#poly_obj_z_edit").val($("#add_poly_modal_z").val())

	$(object_view_space).find("#objName_data_edit").attr("id", id_string+"_edit")

	$(object_view_space).show()

	$("#object_data_list").append(object_view_space)

	$("#"+id_string+"_trigger").click(function(){
			var thingy = $("#"+$(this).text() + "_data_edit")

			console.log(thingy)

			if($(thingy).is(":visible"))
			{
				$(thingy).hide()
				$(this).attr("class", "w3-button w3-black w3-right obj_data_trigger")
			}
			else
			{
				$(thingy).show()
				$(this).attr("class", "w3-button w3-white w3-right obj_data_trigger")
			}
			
		})

	$(object_view_space).find("#poly_obj_name_edit").blur(function(){
		var old_name = $(this).parent().parent().find("button").text()
		var new_name = $(this).val()

		if(old_name != new_name)
		{
			PolyCube.ChangeName(old_name, new_name)
			$(this).parent().parent().find("button").text(new_name)

			$(this).parent().attr("id", new_name+"_data_edit")
			$(this).parent().parent().attr("id", new_name+"_data")
		}

		console.log('adsadas')
	})

	PolyCube.ID++
}

PolyCube.ChangeName = function(old_name, new_name)
{
	var p_cube = L_Polycubes[old_name]

	p_cube.name = new_name

	delete L_Polycubes[old_name]
	L_Polycubes[new_name] = p_cube
}