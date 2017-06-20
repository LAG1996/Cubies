function PolyCube(name = ""){
	this.name = name
	this.position = null
	this.scale = null
	this.L_Cubes = []
	this.L_Edges = []

	var new_cube_queue = []
	var index = 0

	this.Add_Cube = function(position){
	var created_cube = setInterval(function(){
		if(INIT.flags["IS_COMPLETE"]){
		cube = new Cube(scene)
		scene.add(cube.Obj)
		clearInterval(created_cube)
			}
		}, 10)
		}
}

PolyCube.ID = 0

PolyCube.GenerateNewPolyCube = function(name)
{
	var new_pcube = new PolyCube(name)
	L_Polycubes[name] = new_pcube

	var object_view_space = $("#object_template").clone()

	var id_string = new_pcube.name + "_data"

	$(object_view_space).attr("id", id_string)

	$(object_view_space).find("#object_name").text(new_pcube.name)
	$(object_view_space).find("#object_origin").text("X: " + $("#add_poly_modal_x").val())

	console.log($(object_view_space))

	$("#object_data_list").append($(object_view_space))

	PolyCube.ID++
}