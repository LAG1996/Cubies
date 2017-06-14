function Toolbar_Handler(){
	this.mode = ''
	var buttons = []

	var that = this

	this.Switch_Context_H = function(mode){
		if(that.mode == mode)
		{
			return
		}
		else if(mode = 'camera-control')
		{
			_Switch_To_Camera_Mode()
		}
	}

	function _Switch_To_Camera_Mode(){
		//Initialize the toolbar for camera controls
		for(i = 0; i < 2;  i++)
		{
			buttons[i] = document.createElement("button")
			$(buttons[i]).addClass("toolbar-btn")
		}
					
		$(buttons[0]).text("Third Person")
		$(buttons[1]).text("Orbital View")

		$(buttons[0]).click(function(){
			cam_cam.SwitchToMode(0)
		})

		$(buttons[1]).click(function(){
			cam_cam.SwitchToMode(1)
		})

		for(i = 0; i < buttons.length; i++)
		{
			$(".toolbar").append(buttons[i])
		}
	}
}