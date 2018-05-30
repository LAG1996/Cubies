function Toolbar_Handler(controller){

	var that = this

	this.controller = controller

	this.tutorial_data = new Tutorial_Prompts()

	this.tutorial_mode = true

	this.current_tutorial_part = 0

	$("#add_cube_inactive").hide()
	$("iframe").hide()

	GoToTutorialPart(this.current_tutorial_part)

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
		else if(cursor == "pointer")
			$("#container").css('cursor', 'pointer')
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


	function GoToTutorialPart(part)
	{
		$("#tutorial_prompt").text(that.tutorial_data.tutorial_prompts[part])
		$("#tutorial_part").text(that.tutorial_data.tutorial_parts[part])

		if(part == that.tutorial_data.create_new_poly_index)
		{
			$(".tutorial_new_poly").attr("data-toggle", "modal")
			$(".tutorial_new_poly").attr("data-target", "#add_polycube_modal")
		}
		else if(part < that.tutorial_data.create_new_poly_index)
		{
			$(".tutorial_new_poly").attr("data-toggle", "")
			$(".tutorial_new_poly").attr("data-target", "")
		}

		/*
		if(part == 0)
		{
			//Hide the previous button, since there's no previous tutorial option
			$("#tutorial_prev").hide()
		}
		else
		{
			$("#tutorial_prev").show()
		}*/

		if(part == that.tutorial_data.tutorial_prompts.length - 1 || part == that.tutorial_data.create_new_poly_index || part == that.tutorial_data.add_cube_index || (part >= that.tutorial_data.add_cuts_index && part != that.tutorial_data.unfold_index))
		{
			$("#tutorial_next").hide()
		}
		else
		{
			$("#tutorial_next").show()
		}

		if(part < that.tutorial_data.create_new_poly_index || (part == that.tutorial_data.unfold_index-1) || (part > that.tutorial_data.click_black_arrow + 2))
		{
			$("#tutorial_example").hide()
		}
		else
		{
			$("#tutorial_example").show()
		}

		//Decide which videos to show in the example modal
		if(part == that.tutorial_data.create_new_poly_index)
		{
			$("iframe").hide()
			$("#add_poly_vid").show()
		}
		else if(part == that.tutorial_data.add_cube_index)
		{
			$("iframe").hide()
			$("#add_cube_vid").show()
		}
		else if(part == that.tutorial_data.add_cuts_index)
		{
			$("iframe").hide()
			$("#add_cut_vid").show()
		}
		else if(part == that.tutorial_data.unfold_index)
		{
			$("iframe").hide()
			$("#crease_pick_vid").show()
		}
		else if(part == that.tutorial_data.click_white_arrow)
		{
			$("iframe").hide()
			$("#fold_unfold_vid").show()
		}
		else if(part == that.tutorial_data.click_black_arrow + 1)
		{
			$("iframe").hide()
			$("#tape_vid").show()
		}
	}

	//Add events
	$("#submit_poly_coords").on("click", function(){HandleSubmitPolyCoords()})
	$("#submit_cube_coords").on("click", function(){HandleSubmitCubeCoords()})

	$("#add_cube_active").on("click", function(){HandleAddCube()})

	//$("#save_polycube").on("click", function(){HandleSavePolycube()})
	//$("#delete_polycube").on("click", function(){HandleDeletePolycube()})

	$("#tutorial_next").on("click", function(){that.HandleNextTutorialPart()})
	$("#tutorial_example").on("click", function(){$("#example_modal").show()})


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

	function HandleSavePolycube(){
		that.controller.Alert('SAVE_POLYCUBE')
	}

	function HandleDeletePolycube(){
		that.controller.Alert('DESTROY_POLYCUBE')
	}

	function HandleAddCube(){
		that.controller.Alert('ADD_CUBE')
	}


	this.HandleNextTutorialPart = function(){
		that.current_tutorial_part+=1
		GoToTutorialPart(that.current_tutorial_part)
	}

	function HandlePrevTutorialPart(){

		that.current_tutorial_part-=1


		if(that.current_tutorial_part == that.tutorial_data.create_new_poly_index)
			HandleDeletePolycube()


		GoToTutorialPart(that.current_tutorial_part)
	}

}