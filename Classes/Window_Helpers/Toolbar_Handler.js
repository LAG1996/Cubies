function Toolbar_Handler(){
	this.mode_h = ''
	this.Obj = $("#toolbar")
	var buttons = []
	var mode_text = ''
	var Cube_Add_Handler_List = []

	var right_sidebar = {'context' : 'nada', 'buttons' : []}

	var right_sidebar_contexts = {
		'face' : [{"mode" : "nada"}, 
			{"text" : "Adjacency", "click": (function(){pick_mode = 'adj'; right_sidebar_contexts['face'][0]["mode"] = "adj"; ClearJunk()})}, 
			{"text" : "Remove", "click" : (function(){pick_mode = 'rem'; right_sidebar_contexts['face'][0]["mode"] = "rem"; ClearJunk()})}],

		'hinge' : [{"mode" : "nada"}, 
			{"text" : "Adjacency", "click": (function(){pick_mode = 'adj'; right_sidebar_contexts['hinge'][0]["mode"] = "adj"; ClearJunk()})}, 
			{"text" : "Cut", "click": (function(){pick_mode = 'cut'; right_sidebar_contexts['hinge'][0]["mode"] = "cut"; ShowCutEdgeData()})},
			{"text" : "Collinear", "click": (function(){pick_mode = 'col'; right_sidebar_contexts['hinge'][0]["mode"] = "col"; ClearJunk()})},
			{"text" : "Parallel", "click": (function(){pick_mode = 'para'; right_sidebar_contexts['hinge'][0]["mode"] = "para"; ClearJunk()})},
			{"text" : "Perpendicular", "click": (function(){pick_mode = 'perp'; right_sidebar_contexts['hinge'][0]["mode"] = "perp"; ClearJunk()})},
			{"text" : "Hinge", "click": (function(){pick_mode = 'hinge'; right_sidebar_contexts['hinge'][0]["mode"] = "hinge"; ClearJunk()})}]
	}

	/*
	{"text" : "Collinear", "click": (function(){pick_mode = 'col'; right_sidebar_contexts['hinge'][0]["mode"] = "col"; ClearJunk()})},
	{"text" : "Parallel", "click": (function(){pick_mode = 'para'; right_sidebar_contexts['hinge'][0]["mode"] = "para"; ClearJunk()})},
	{"text" : "Perpendicular", "click": (function(){pick_mode = 'perp'; right_sidebar_contexts['hinge'][0]["mode"] = "perp"; ClearJunk()})}
	*/

	var amt_buttons_for_context = {"camera-control" : 2, "edit-context" : 1, "poly-context" : 5, "rotate-context" : 2}

	var that = this

	//Initialize the sidebars
	Init_Modals()
	Init_Sidebars()

	//Initialize the object with a clicking function
	this.Obj.on("click", function(){
		//Clear junk from the scene
		ClearJunk()
	})


	//Some data can be manipulated independently from toolbars. For example, a polycube could be deactivated by
	//clicking the screen. The sidebar object representing it, however, will show it as being activated, which could
	//be quite confusing. There are a few ways we could handle this, but I'll choose this approach. We create a simple
	//check that runs every frame step that will simply deactivate and activate objects accordingly.

	setInterval(function(){
		Update_Object_Viewer()
		Update_Cube_Add_Handlers()
		Update_Toolbar()
		Update_Right_Sidebar()
	}, 10)

	var that = this

	this.Switch_Context_H = function(mode, polycube = null){
		if(this.mode_h == mode && this.mode_h != 'poly-context')
		{
			return
		}
		else 
		{
			this.mode_h = mode
			buttons = []

			$(".toolbar_btn").remove()

			if(mode == 'camera-control')
				_Switch_To_Camera_Mode(amt_buttons_for_context[mode])
			else if(mode == 'edit-context')
				_Switch_To_Edit_Context(amt_buttons_for_context[mode])
			else if(mode == 'poly-context')
			{
				if(ObjectExists(polycube))
					_Switch_To_Polycube_Context(amt_buttons_for_context[mode], polycube)
				else
					_Switch_To_Edit_Context(amt_buttons_for_context['edit-context'])
			}
			else if(mode == 'rotate-context')
				_Switch_To_Rotate_Context(amt_buttons_for_context['rotate-context'])

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

	function _Switch_To_Edit_Context(amt_btns){
		for(i = 0; i < amt_btns; i++)
		{
			buttons[i] = document.createElement("button")
		}

		//Add a button for adding a new polycube origin point
		$(buttons[0]).text("New Polycube")
		$(buttons[0]).click(function(){
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			$("#add_poly_modal").show()})

		PostMessage(['SWITCH_TO_SCENE', scene_handler, null])

		//Unbind the previous event handlers from the container
		$("#container").unbind('mousedown')
		$("#container").unbind('mouseup')
		//Add these event handlers to the container
		$('#container').on('mousedown', StoreMouseVals)
		$('#container').on('mouseup', HandlePick)

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

		$(buttons[3]).text("Save Polycube")
		$(buttons[3]).click(function(){
			if(PolyCube.Active_Polycube != null)
			{
				saveTextAs(JSON.stringify(PolyCube.Active_Polycube.toJSON()), PolyCube.Active_Polycube.name) //Thank you Eli Grey
			}
		})

		$(buttons[4]).text("Remove Polycube")
		$(buttons[4]).click(function(){
			if(PolyCube.Active_Polycube)
			{
				PostMessage(['REMOVE_POLYCUBE', PolyCube.Active_Polycube.name, that])
			}
		})

		mode_text = "Edit " + polycube.name
	}

	function _Switch_To_Rotate_Context(amt_btns)
	{
		for(i = 0; i < amt_btns; i++)
		{
			buttons[i] = document.createElement("button")
		}

		$(buttons[0]).text("Rotate!")
		$(buttons[0]).on('click', function(){
			PolyCube.TriggerRotation()
		})
		$(buttons[1]).text("Undo Rotations")

		PostMessage(['SWITCH_TO_SCENE', scene_handler, PolyCube.Rotation_Scene])

		//Unbind the previous event handlers from the container
		$("#container").unbind('mousedown')
		$("#container").unbind('mouseup')

		mode_text = 'Rotate View'
	}

	function Init_Sidebars()
	{
		//Position the right sidebar to be under the toolbar
		//$("#right_sidebar").offset({top: that.Obj.innerHeight()})
		$("#sidebar_trigger").click(function(){
			_Toggle_V()
		})
		$("#object_list_trigger").click(function(){
			_Toggle_Object_L()
		})
		//Set the function for the left sidebar buttons
		$("#s_editview").click(function(){that.Switch_Context_H("edit-context")})
		//$("#s_camera_control").click(function(){that.Switch_Context_H("camera-control")})
		$("#s_rotateview").click(function(){that.Switch_Context_H('rotate-context')})

		//Set the functions for the object list sidebar buttons
		$("#dropdown_add_polycube").click(function(){
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			$("#add_poly_modal").show()
		})

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
			AddPolyCube(new THREE.Vector3(parseInt($("#add_poly_modal_x").val(), 10), 
				parseInt($("#add_poly_modal_y").val(), 10), 
				parseInt($("#add_poly_modal_z").val(), 10)), 
				$("#add_poly_modal_new_name").val())

			$("#add_poly_modal").hide()
		})

		$("#polycube_file_read").on("change", function(){
			//Instantiate a file reader that will read the file specified
			var reader = new FileReader()
			var that = this
	
			reader.onload = function(){
				data = reader.result
				var obj = JSON.parse(data)

				//TODO: Verify the file

				//The file has been verified. Create a new polycube with all of the specified cubes

				var p = AddPolyCube(new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]), obj.name)

				Cube_Add_Handler_List.push(new Cube_Add_Handler(obj.cubes, p))

				$(that).val("")
				$("#add_poly_modal").hide()
			}
			reader.onerror = function(){
				data = ""
			}
			reader.onabort = function(){
				data = ""
			}

			if(event.target.files[0])
			{
				reader.readAsText(event.target.files[0])
			}
			else
			{
				reader.abort()
			}
		})


		//The add_cube_to_poly_modal handles setting the cube's coordinates in relation to the polycube's origin
		$("#add_cube_to_poly_modal_close").click(function(){$("#add_cube_to_poly_modal").hide()})
		$("#add_cube_to_poly_modal_submit").click(function(){
			//TODO: handle verification

			//Data has been verified. Make a new polycube
			PostMessage(["ADD_CUBE", PolyCube.Active_Polycube, 
				new THREE.Vector3(parseInt($("#add_cube_to_poly_modal_x").val(), 10), parseInt($("#add_cube_to_poly_modal_y").val(), 10), parseInt($("#add_cube_to_poly_modal_z").val(), 10))])
			//PolyCube.Active_Polycube.Add_Cube(new THREE.Vector3(parseInt($("#add_cube_to_poly_modal_x").val(), 10), parseInt($("#add_cube_to_poly_modal_y").val(), 10), parseInt($("#add_cube_to_poly_modal_z").val(), 10)))
		})
	}

	function Update_Object_Viewer()
	{
		if(ObjectExists(PolyCube.Active_Polycube))
		{
			var activePolycubeDataDOM = $("#" + PolyCube.ToPolyCubeIDString(PolyCube.Active_Polycube) + "_data")
			var activePolyCubeDataEditDOM = activePolycubeDataDOM.find("#"+ PolyCube.ToPolyCubeIDString(PolyCube.Active_Polycube) + "_data_edit")

			if(!activePolyCubeDataEditDOM.attr(":visible"))
			{
				$(".obj_data_edit").hide()
				$(".obj_data_trigger").attr("class", "w3-button w3-black obj_data_trigger")	
				activePolyCubeDataEditDOM.show()
				activePolycubeDataDOM.find("#active_toggle").attr("class", "w3-button w3-white w3-right obj_data_trigger")
			}
		}
		else
		{
			$(".obj_data_edit").hide()
			$(".obj_data_trigger").attr("class", "w3-button w3-black obj_data_trigger")	
		}
	}

	function Update_Cube_Add_Handlers()
	{
		for(var key in Cube_Add_Handler_List)
		{
			if(Cube_Add_Handler_List[key].finished == true)
			{
				delete Cube_Add_Handler_List[key]
			}
			else
			{
				Cube_Add_Handler_List[key].Add_Another_Cube()
			}
		}
	}

	function Update_Toolbar(){
		if(ObjectExists(PolyCube.Active_Polycube) && that.mode_h != 'rotate-context')
		{
			if(that.mode_h == 'edit-context')
				that.Switch_Context_H('poly-context', PolyCube.Active_Polycube)

			if(!$("#context_text").attr(":visible"))
			{
				$("#context_text").show()
			}

			if($("#context").text() != PolyCube.Active_Polycube.context_name)
				$("#context_text").text(PolyCube.Active_Polycube.context_name)
		}
		else
		{
			that.Switch_Context_H('edit-context')
			$("#context_text").hide()
		}
	}

	function Update_Right_Sidebar(){

		if(ObjectExists(PolyCube.Active_Polycube) && that.mode_h != 'rotate-context')
		{	
			if(right_sidebar.context != PolyCube.Active_Polycube.context_name)
			{
				$(".right_sidebar_btns").remove()
				right_sidebar.context = PolyCube.Active_Polycube.context_name
				var context = right_sidebar_contexts[PolyCube.Active_Polycube.context_name]

				for(var index = 1; index < context.length; index++)
				{
					var new_button = $("#right_sidebar_btn_template").clone()
					new_button.text(context[index].text)
					new_button.attr("id", "right_sidebar_btn_"+index)
					new_button.addClass("right_sidebar_btns")
					new_button.on("click", context[index].click)
					new_button.show()
					$("#right_sidebar").append($(new_button))
				}

				if(pick_mode != 'rotate')
					pick_mode = context[0]["mode"]
				else
					context[0]['mode'] = pick_mode
				
				$("#right_sidebar").show()
			}
		}
		else
		{
			right_sidebar.context = 'nada'
			$("#right_sidebar").hide()
		}
	}

	function AddPolyCube(position, name){
			var p_cube = PolyCube.GenerateNewPolyCube(position, name)

			//Now add that polycube to the scene
			var object_data_space = $("#object_template").clone()

			var id_string = PolyCube.ToPolyCubeIDString(p_cube) + "_data"

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
					var thingy = $("#"+ id_string + "_edit")

					if($(thingy).is(":visible"))
					{
						$(thingy).hide()
						$(this).attr("class", "w3-button w3-black obj_data_trigger")
						PostMessage(['SWITCH_ACTIVE_POLYCUBE', null])
						//PolyCube.SwitchToNewActive(null)
						that.Switch_Context_H('world-context')
					}
					else
					{
						$(".obj_data_edit").hide()
						$(".obj_data_trigger").attr("class", "w3-button w3-black obj_data_trigger")
						$(thingy).show()
						$(this).attr("class", "w3-button w3-white w3-right obj_data_trigger")

						PostMessage(['SWITCH_ACTIVE_POLYCUBE', $(this).text()])

						//PolyCube.SwitchToNewActive(PolyCube.L_Polycubes[$(this).text()])
						
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

			PostMessage(['ADD_TO_SCENE', scene_handler, p_cube.Obj])
			PostMessage(['ADD_TO_PICK_SCENE', scene_handler, p_cube.picking_polycube])
			
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			that.Switch_Context_H('poly-context', p_cube)

			return p_cube
	}
}