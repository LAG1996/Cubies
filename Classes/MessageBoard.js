function MessageBoard()
{
	var packages = []

	setInterval(function(){_HandleMessages()}, 10)

	var MESSAGES = {
		'ADD_CUBE' : function(packet){_RequestAddCubeToPolycube(packet)},
		'SWITCH_ACTIVE_POLYCUBE' : function(packet){_RequestSwitchActivePolycube(packet)},
		'REMOVE_POLYCUBE' : function(packet){_RequestRemovePolycube(packet)},
		'ROTATE' : function(packet){_RequestPolyCubeRotate(packet)},
		'SHOW_FACE_GRAPHS' : function(){},
		'PICK' : function(){},
		'ADD_TO_SCENE' : function(packet){_RequestAddToScene(packet)},
		'ADD_TO_PICK_SCENE' : function(packet){_RequestAddToPickingScene(packet)},
		'SWITCH_TO_SCENE' : function(packet){_RequestSwitchToScene(packet)}
	}

	var SendMessage = function(packet){
		MESSAGES[packet[0]](packet)
	}

	this.PostMessage = function(message)
	{
		packages.push(message)
	}

	function _RequestAddCubeToPolycube(packet){

		try{
			var polycube = packet[1]
			var cube_position = packet[2]
			polycube.Add_Cube(cube_position)
		}
		catch(err){
			throw 'ADD_CUBE_TO_POLYCUBE: ' + err
		}	
	}

	function _RequestSwitchActivePolycube(packet){
		try{
			var new_polycube = packet[1] != null ? PolyCubes.L_Polycubes[packet[1]] : null
			PolyCube.SwitchToNewActive(new_polycube)
		}
		catch(err){
			throw 'SWITCH_ACTIVE_POLYCUBE: ' + packet[1] + ' is not a valid polycube name'
		}
	}

	function _RequestAddToScene(packet)
	{
		var scene_handler = packet[1]
		var object = packet[2]

		try{
			scene_handler.RequestAddToScene(object)
		}
		catch(err){
			throw "ADD TO SCENE: Object was not a valid THREE.js object"
		}	
	}

	function _RequestRemovePolycube(packet)
	{
		var polycube = PolyCube.L_Polycubes[packet[1]]
		var toolbar_handler = packet[2]

		try{
			$("#" + PolyCube.ToPolyCubeIDString(polycube) + "_data").remove()

			PolyCube.DestroyPolyCube(polycube)
	
			toolbar_handler.Switch_Context_H('edit-context')
	
			cut_edges = {} 
			invalid_cut_edges = {}
			ClearEdgeJunk()
		}
		catch(err){
			throw 'REMOVE_POLYCUBE: ' + packet[1] + ' is not a valid polycube name'
		}
	}

	function _RequestAddToPickingScene(packet)
	{
		var scene_handler = packet[1]
		var object = packet[2]

		try{
			scene_handler.RequestAddToPickingScene(object)
		}
		catch(err){
			throw "ADD TO PICKING SCENE: Object was not a valid THREE.js object"
		}
	}

	function _RequestSwitchToScene(packet)
	{
		var scene_handler = packet[1]
		var scene = packet[2]
		try{
			if(ObjectExists(scene))
				scene_handler.RequestSwitchToScene(scene)
			else
				scene_handler.SwitchToDefaultScene()
		}
		catch(err){
			throw err + " | " + " object was not a scene"
		}
	}

	function _HandleMessages(){
		while(packages.length > 0)
		{
			var package = packages.pop()

			if(!(package[0] in MESSAGES))
				throw package[0] + " is not a valid message"
			else
				SendMessage(package)
		}
	}
}

MessageBoard.The_Board = new MessageBoard()

function PostMessage()
{
	MessageBoard.The_Board.PostMessage(arguments[0])
}