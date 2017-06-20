function Toolbar_Handler(){
	this.mode_h = ''
	var buttons = []
	var mode_text = ''

	var amt_buttons_for_context = {"camera-control" : 2, "poly-view" : 1 }

	//Initialize the sidebars
	Init_Modals()
	Init_Sidebars()
	

	var that = this

	this.Switch_Context_H = function(mode){
		if(that.mode_h == mode)
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
			else if(mode == 'poly-view')
				_Switch_To_Polycube_Mode(amt_buttons_for_context[mode])

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

	function _Switch_To_Polycube_Mode(amt_btns){
		for(i = 0; i < amt_btns; i++)
		{
			buttons[i] = document.createElement("button")
		}

		$(buttons[0]).text("New Polycube")
		$(buttons[0]).click(function(){
			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
			$("#add_poly_modal").show()})

		mode_text = "Edit Polycube"
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
		$("#s_polyview").click(function(){that.Switch_Context_H("poly-view")})
		$("#s_camera_control").click(function(){that.Switch_Context_H("camera-control")})

		//Hide DOM templates
		$("#object_template").hide()
	}

	function Init_Modals()
	{
		$("#add_poly_modal_close").click(function(){$("#add_poly_modal").hide()})
		$("#add_poly_modal_submit").click(function(){
			//TODO: handle verfication

			//Items have been verified. Make a new polycube
			PolyCube.GenerateNewPolyCube(new THREE.Vector3(parseInt($("#add_poly_modal_x"), 10), parseInt($("#add_poly_modal_y"), 10), parseInt($("#add_poly_modal_z"), 10)), $("#add_poly_modal_new_name").val())

			$("#add_poly_modal_new_name").val("Polycube_"+PolyCube.ID)
		})
	}
}