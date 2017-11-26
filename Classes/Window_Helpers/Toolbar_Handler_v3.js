function Toolbar_Handler(controller){
	this.controller = controller
	this.tutorial_mode = false


	$("#add_cube_inactive").hide()

	var current_cursor = "default"
	var that = this

	this.Switch_Context = function(context){
		
		if(context == "world")
		{
			_Switch_To_World_Context()
		}
		else if(context == "poly")
		{
			_Switch_To_Poly_Context()
		}
	}

	function _Switch_To_World_Context()
	{
		$("#world_view_nav").show()
		$("#poly_view_nav").hide()
	}

	function _Switch_To_Poly_Context()
	{
		$("#world_view_nav").hide()
		$("#poly_view_nav").show()
	}

	this.Switch_Cursor = function(cursor)
	{
		if(cursor == "cell")
			$("#container").css('cursor', 'cell')
		else if(cursor == "crosshair")
			$("#container").css('cursor', 'crosshair')
		else
			$("#container").css('cursor', 'default')

		current_cursor = cursor
	}

	this.ActivateAddCube = function()
	{
		$("#add_cube_active").show()
		$("#add_cube_inactive").hide()
	}

	this.DeactivateAddCube = function()
	{
		$("#add_cube_active").hide()
		$("#add_cube_inactive").show()
	}

	//Add events
	$("#submit_poly_coords").on("click", function(){HandleSubmitPolyCoords()})
	$("#submit_cube_coords").on("click", function(){HandleSubmitCubeCoords()})

	//$("#save_polycube").on("click", function(){HandleSavePolycube()})
	$("#delete_polycube").on("click", function(){HandleDeletePolycube()})

	$("#add_cube_active").on("click", function(){HandleAddCube()})


	//Functions for events
	function HandleSubmitPolyCoords(){

		var x = parseInt($("#poly_x").val(), 10)
		var y = parseInt($("#poly_y").val(), 10)
		var z = parseInt($("#poly_z").val(), 10)

		var name = $("#poly_name").val()

		var coord = new THREE.Vector3(x, y, z)
		that.controller.Alert('NEW_POLYCUBE', coord, name)

		//$("#add_polycube_modal").hide()
	}

	function HandleSubmitCubeCoords(){
		var x = parseInt($("#cube_x").val(), 10)
		var y = parseInt($("#cube_y").val(), 10)
		var z = parseInt($("#cube_z").val(), 10)

		var coord = new THREE.Vector3(x, y, z)
		that.controller.Alert('ADD_CUBE', coord)

		//$("#add_polycube_modal").hide()
	}

	function HandleAddCube(){
		that.controller.Alert('ADD_CUBE')
	}

	function HandleSavePolycube(){
		that.controller.Alert('SAVE_POLYCUBE')
	}

	function HandleDeletePolycube(){
		that.controller.Alert('DESTROY_POLYCUBE')
	}

}