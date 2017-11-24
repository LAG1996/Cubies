function Toolbar_Handler(controller){
	this.controller = controller


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

	//Add events
	$(".add_polycube_btn").
}