function Toolbar_Handler(controller){

	var that = this

	this.controller = controller

	this.tutorial_data = new Tutorial_Prompts()

	var current_tutorial_part = 0

	GoToTutorialPart(current_tutorial_part)

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


		if(part == 0)
		{
			//Hide the previous button, since there's no previous tutorial option
			$("#tutorial_prev").hide()
		}
		else
		{
			$("#tutorial_prev").show()
		}

		if(part == that.tutorial_data.tutorial_prompts.length - 1 || part == that.tutorial_data.create_new_poly_index)
		{
			$("#tutorial_next").hide()
		}
		else
		{
			$("#tutorial_next").show()
		}
	}

	//Add events
	$("#submit_poly_coords").on("click", function(){HandleSubmitPolyCoords()})
	$("#submit_cube_coords").on("click", function(){HandleSubmitCubeCoords()})

	//$("#save_polycube").on("click", function(){HandleSavePolycube()})
	//$("#delete_polycube").on("click", function(){HandleDeletePolycube()})

	$("#tutorial_next").on("click", function(){HandleNextTutorialPart()})
	$("#tutorial_prev").on("click", function(){HandlePrevTutorialPart()})


	//Functions for events
	function HandleSubmitPolyCoords(){

		var x = parseInt($("#poly_x").val(), 10)
		var y = parseInt($("#poly_y").val(), 10)
		var z = parseInt($("#poly_z").val(), 10)

		var name = $("#poly_name").val()

		var coord = new THREE.Vector3(x, y, z)
		that.controller.Alert('NEW_POLYCUBE', coord, name)

		current_tutorial_part+=1
		GoToTutorialPart(current_tutorial_part)

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

	function HandleNextTutorialPart(){
		current_tutorial_part+=1
		GoToTutorialPart(current_tutorial_part)
	}

	function HandlePrevTutorialPart(){
		current_tutorial_part-=1
		GoToTutorialPart(current_tutorial_part)
	}

}