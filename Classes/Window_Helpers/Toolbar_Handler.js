function Toolbar_Handler(){
	this.mode = ''
	var buttons = []

	var that = this

	this.Switch_Context_H = function(mode){
		if(that.mode == mode)
		{
			return
		}
		else 
		{
			buttons = []

			$(".toolbar").empty()

			if(mode = 'camera-control')
				_Switch_To_Camera_Mode()

			buttons[0] = document.createElement("button")
			$(buttons[0]).attr("id", "dropdown_trigger")
			for(i = 0; i < buttons.length; i++)
			{	
				if(i > 0)
				{
					$(buttons[i]).attr("class", "toolbar_btn")
					$(buttons[i]).attr("id", "button_"+i)
				}

				var newListItem = document.createElement("li")
				newListItem.append(buttons[i])

				$(".toolbar").append(newListItem)

				console.log(buttons[i])
			}

		}
	}

	function _Switch_To_Camera_Mode(){
		//Initialize the toolbar for camera controls
		for(i = 1; i < 3;  i++)
		{
			buttons[i] = document.createElement("button")
		}
					
		$(buttons[1]).text("Third Person")
		$(buttons[2]).text("Orbital View")

		$(buttons[1]).click(function(){
			cam_cam.SwitchToMode(0)
		})

		$(buttons[2]).click(function(){
			cam_cam.SwitchToMode(1)
		})
	}
}