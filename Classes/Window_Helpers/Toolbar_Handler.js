function Toolbar_Handler(){
	this.mode_h = ''
	this.Obj = $("#toolbar")
	var buttons = []
	var mode_text = ''

	var amt_buttons_for_context = {"camera-control" : 2, "world-context" : 1, "poly-context" : 3 }

	//Initialize the sidebars
	Init_Modals()
	Init_Sidebars()

	var that = this

	this.Switch_Context_H = function(mode, polycube = null){
		if(this.mode_h == mode && this.mode_h != 'poly-context')
		{
			return
		}
		else 
		{
			that.mode_h = mode
			buttons = []

			$(".toolbar_btn").remove()

			if(mode == 'camera-control')
				_Switch_To_Camera_Mode(amt_buttons_for_context[mode])
			else if(mode == 'world-context')
				_Switch_To_World_Context(amt_buttons_for_context[mode])
			else if(mode == 'poly-context')
			{
				if(ObjectExists(polycube))
					_Switch_To_Polycube_Context(amt_buttons_for_context[mode], polycube)
				else
					_Switch_To_World_Context(amt_buttons_for_context['world-context'])
			}

			for(i = 0; i < buttons.length; i++)
			{	
				$(buttons[i]).attr("class", "w3-bar-item w3-button w3-hover-black toolbar_btn")
				$(buttons[i]).attr("id", "button_"+i)

				$("#toolbar").append(buttons[i])
			}

			$("#mode_text").text(mode_text)
		}
	}

	function _Toggle_V(){
		if($("#sidebar").is(":visible"))
		{
			$("#sidebar_trigger").attr("class", "w3-button w3-black w3-hover-white")
			$("#sidebar").hide()
		}
		else
		{
			$("#sidebar_trigger").attr("class", "w3-button w3-red w3-hover-black")
			$("#sidebar").show()
			$("#object_list_trigger").attr("class", "w3-button w3-black w3-hover-white")
			$("#object_list").hide()
		}
	}

	function _Toggle_Object_L(){
		if($("#object_list").is(":visible"))
		{
			$("#object_list_trigger").attr("class", "w3-button w3-black w3-hover-white")
			$("#object_list").hide()
		}
		else
		{
			$("#object_list_trigger").attr("class", "w3-button w3-red w3-hover-black")
			$("#object_list").show()
			$("#sidebar_trigger").attr("class", "w3-button w3-black w3-hover-white")
			$("#sidebar").hide()
		}
	}

	function _Switch_To_Camera_Mode(amt_btns){
		//Initialize the toolbar for camera controls
		for(i = 0; i < amt_btns;  i++)
		{
			buttons[i] = document.createElement("button")
		}
					
		$(buttons[0]).text("Orbital View")
		$(buttons[1]).text("Third Person")

		$(buttons[0]).click(function(){
			cam_cam.SwitchToMode(0)
		})

		$(buttons[1]).click(function(){
			cam_cam.SwitchToMode(1)
		})

		mode_text = "Camera Control"
	}

	function _Switch_To_World_Context(amt_btns){
		for(i = 0; i < amt_btns; i++)
		{
			buttons[i] = document.createElement("button")
		}

		//Add a button for adding a new polycube origin point
		$(buttons[0]).text("New Polycube")
		$(buttons[0]).click(function(){
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			$("#add_poly_modal").show()})

		mode_text = "World View"
	}

	function _Switch_To_Polycube_Context(amt_btns, polycube){
		for(i = 0; i < amt_btns; i++)
		{
			buttons[i] = document.createElement("button")
		}
		//Add a button for adding cubes to the active polycube (selected by the user)
		$(buttons[0]).text("Add Cube")
		$(buttons[0]).click(function(){
			if(PolyCube.Active_Polycube != null)
			{
				//TODO: Make these console logs actual alerts on the screen
				$("#add_cube_to_poly_modal").show()
			}
		})

		$(buttons[1]).text("Face Context")
		$(buttons[1]).click(function(){
			if(PolyCube.Active_Polycube != null)
			{
				PolyCube.Active_Polycube.SwitchToContext('face')
			}
		})

		$(buttons[2]).text("Hinge Context")
		$(buttons[2]).click(function(){
			if(PolyCube.Active_Polycube != null)
			{
				PolyCube.Active_Polycube.SwitchToContext('hinge')
			}
		})

		mode_text = "Edit " + polycube.name
	}

	function Init_Sidebars()
	{
		$("#sidebar_trigger").click(function(){
			_Toggle_V()
		})
		$("#object_list_trigger").click(function(){
			_Toggle_Object_L()
		})
		//Set the function for the left sidebar buttons
		$("#s_worldview").click(function(){that.Switch_Context_H("world-context")})
		$("#s_camera_control").click(function(){that.Switch_Context_H("camera-control")})

		//Hide DOM templates
		$("#object_template").hide()
	}

	function Init_Modals()
	{
		//Setting up what modals do
		//The add_poly_modal does exactly that: adding a polycube to the scene
		//This modal handles naming the polycube and setting its origin point
		$("#add_poly_modal_close").click(function(){$("#add_poly_modal").hide()})
		
		$("#add_poly_modal_submit").click(function(){
			//TODO: handle verfication

			//Items have been verified. Make a new polycube
			var p_cube = PolyCube.GenerateNewPolyCube(new THREE.Vector3(parseInt($("#add_poly_modal_x").val(), 10), 
				parseInt($("#add_poly_modal_y").val(), 10), 
				parseInt($("#add_poly_modal_z").val(), 10)), 
				$("#add_poly_modal_new_name").val())

			//Now add that polycube to the scene
			var object_data_space = $("#object_template").clone()

			var id_string = p_cube.name + "_data"

			$(object_data_space).attr("id", id_string)

			$(object_data_space).find("#active_toggle").text(p_cube.name)

			$(object_data_space).find("#poly_obj_name_edit").val(p_cube.name)
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
						that.Switch_Context_H('world-context')
					}
					else
					{
						$(".obj_data_edit").hide()
						$(".obj_data_trigger").attr("class", "w3-button w3-black w3-right obj_data_trigger")
						$(thingy).show()
						$(this).attr("class", "w3-button w3-white w3-right obj_data_trigger")
						PolyCube.SwitchToNewActive(PolyCube.L_Polycubes[$(this).text()])
						that.Switch_Context_H('poly-context', PolyCube.Active_Polycube)
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

			scene_handler.RequestAddToScene(p_cube.Obj)
			scene_handler.RequestAddToPickingScene(p_cube.picking_polycube)
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			that.Switch_Context_H('poly-context', p_cube)
		})

		//The add_cube_to_poly_modal handles setting the cube's coordinates in relation to the polycube's origin
		$("#add_cube_to_poly_modal_close").click(function(){$("#add_cube_to_poly_modal").hide()})
		$("#add_cube_to_poly_modal_submit").click(function(){
			//TODO: handle verification

			//Data has been verified. Make a new polycube
			PolyCube.Active_Polycube.Add_Cube(new THREE.Vector3(parseInt($("#add_cube_to_poly_modal_x").val(), 10), parseInt($("#add_cube_to_poly_modal_y").val(), 10), parseInt($("#add_cube_to_poly_modal_z").val(), 10)))
		})
	}
}