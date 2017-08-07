function MessageBoard(s_handler)
{
	var scene_handler = s_handler

	var MESSAGES = {
		ROTATE : function(){_RequestPolyCubeRotate()},
		SHOW_FACE_GRAPHS : function(){},
		PICK : function(){},
		ADD_TO_SCENE : function(object){_RequestAddToScene(object)},
		ADD_TO_PICK_SCENE : function(){},
		SWITCH_TO_SCENE : function(scene){_RequestSwitchToScene(scene)}
	}

	this.PostMessage = function(message, data){
		MESSAGES[message](data)
	}

	function _RequestAddToScene(object = null)
	{
		scene_handler.RequestAddToScene(object)
	}

	function _RequestSwitchToScene(scene = null)
	{
		scene_handler.RequestSwitchToScene(scene)
	}
}