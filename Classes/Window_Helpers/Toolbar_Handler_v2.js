function Toolbar_Handler(controller){
	this.context = ''
	this.pick_mode = ''
	this.Obj = $("#toolbar")
	this.controller = controller

	this.toolbar_btns = []

	var mode_text = ''
	var Cube_Add_Handler_List = []

	var amt_buttons_for_context = {"edit-context" : 1, "poly-context" : 3, "rotate-context" : 0}

	var that = this

	//Initialize the sidebars
	Init_Modals()
	Init_Sidebars()

	//Some data can be manipulated independently from toolbars. For example, a polycube could be deactivated by
	//clicking the screen. The sidebar object representing it, however, will show it as being activated, which could
	//be quite confusing. There are a few ways we could handle this, but I'll choose this approach. We create a simple
	//check that runs every frame step that will simply deactivate and activate objects accordingly.

	setInterval(function(){
		//Update_Object_Viewer()
		Update_Cube_Add_Handlers()
	}, 10)

	var that = this

	this.Switch_Context_H = function(context, polycube = null){
		if(this.context == context && this.context != 'poly-context')
		{
			return
		}
		else 
		{
			this.context = context
			this.toolbar_btns = []

			$(".toolbar_btn").remove()

			if(this.context == 'camera-control')
				_Switch_To_Camera_Mode(amt_buttons_for_context[this.context])
			else if(this.context == 'edit-context')
			{
				_Switch_To_Edit_Context(amt_buttons_for_context[this.context])
			}
			else if(this.context == 'poly-context')
			{
				_Switch_To_Polycube_Context(amt_buttons_for_context[this.context])
			}
			else if(this.context == 'rotate-context')
				_Switch_To_Rotate_Context(amt_buttons_for_context['rotate-context'])

			for(i = 0; i < this.toolbar_btns.length; i++)
			{	
				$(this.toolbar_btns[i]).attr("class", "w3-bar-item w3-button w3-hover-black toolbar_btn")
				$(this.toolbar_btns[i]).attr("id", "toolbar_button_"+i)

				$("#toolbar").append(this.toolbar_btns[i])
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

	function _Switch_To_Edit_Context(amt_btns){
		for(i = 0; i < amt_btns; i++)
		{
			that.toolbar_btns[i] = document.createElement("button")
		}

		//Add a button for adding a new polycube origin point
		$(that.toolbar_btns[0]).text("New Polycube")

		$(that.toolbar_btns[0]).on('click', function(){

			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			$("#add_poly_modal").show()

		})
		
		$("#context_text").hide()

		mode_text = "World View"
	}

	function _Switch_To_Polycube_Context(amt_btns){
		for(i = 0; i < amt_btns; i++)
		{
			that.toolbar_btns[i] = document.createElement("button")
		}
		//Add a button for adding cubes to the active polycube (selected by the user)
		$(that.toolbar_btns[0]).text("Add Cube")
		

		$(that.toolbar_btns[1]).text("Save Polycube")
		

		$(that.toolbar_btns[2]).text("Remove Polycube")

		//Button functions
		$(that.toolbar_btns[0]).on('click', function(){
			if(ObjectExists(PolyCube.Active_Polycube))
			{
				$("#add_cube_to_poly_modal").show()
			}
		})

		$(that.toolbar_btns[1]).on('click', function(){
			controller.Alert('SAVE_POLYCUBE')
		})

		$(that.toolbar_btns[2]).on('click', function(){
			controller.Alert('DESTROY_POLYCUBE')
		})

		
		mode_text = "Edit"
	}

	function _Switch_To_Rotate_Context(amt_btns)
	{	
		$("#context_text").hide()
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

			controller.Alert('NEW_POLYCUBE', 
				new THREE.Vector3(parseInt($("#add_poly_modal_x").val(), 10), 
				parseInt($("#add_poly_modal_y").val(), 10), 
				parseInt($("#add_poly_modal_z").val(), 10)), 
				$("#add_poly_modal_new_name").val())

			//AddPolyCube(new THREE.Vector3(parseInt($("#add_poly_modal_x").val(), 10), 
				//parseInt($("#add_poly_modal_y").val(), 10), 
				//parseInt($("#add_poly_modal_z").val(), 10)), 
				//$("#add_poly_modal_new_name").val())

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
			controller.Alert('ADD_CUBE', 
				new THREE.Vector3(parseInt($("#add_cube_to_poly_modal_x").val(), 10), parseInt($("#add_cube_to_poly_modal_y").val(), 10), parseInt($("#add_cube_to_poly_modal_z").val(), 10)))

			//PostMessage(["ADD_CUBE", PolyCube.Active_Polycube, 
				//new THREE.Vector3(parseInt($("#add_cube_to_poly_modal_x").val(), 10), parseInt($("#add_cube_to_poly_modal_y").val(), 10), parseInt($("#add_cube_to_poly_modal_z").val(), 10))])
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

	this.AddPolyCubeToObjectView = function(p_name){
			//var p_cube = PolyCube.GenerateNewPolyCube(position, name)

			//Now add that polycube to the scene
			var object_data_space = $("#object_template").clone()

			var id_string = PolyCube.ToPolyCubeIDString(p_name) + "_data"

			$(object_data_space).attr("id", id_string)

			$(object_data_space).find("#active_toggle").text(p_name)

			$(object_data_space).find("#poly_obj_name_edit").val(p_name)
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
						PostMessage(['SWITCH_ACTIVE_POLYCUBE', null, that])
						//PolyCube.SwitchToNewActive(null)
						that.Switch_Context_H('edit-context')
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
			/*$(object_data_space).find("#poly_obj_name_edit").blur(function(){
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

			//PostUrgentMessage(['ADD_TO_SCENE', scene_handler, p_cube.Obj, null])
			//PostUrgentMessage(['ADD_TO_PICK_SCENE', scene_handler, p_cube.picking_polycube, null])
			
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)*/
	}
}