function MessageBoard()
{
	var packages = []

	setInterval(function(){_HandleMessages()}, 10)

	var MESSAGES = {
		'ADD_CUBE' : function(packet){_RequestAddCubeToPolycube(packet)},
		'SWITCH_ACTIVE_POLYCUBE' : function(packet){_RequestSwitchActivePolycube(packet)},
		'REMOVE_POLYCUBE' : function(packet){_RequestRemovePolycube(packet)},
		'CUT_EDGE' : function(packet){_RequestCutEdge(packet)},
		'PICK' : function(packet){_RequestPick(packet)},
		'ADD_TO_SCENE' : function(packet){_RequestAddToScene(packet)},
		'REMOVE_FROM_SCENE' : function(packet){_RequestRemoveFromScene(packet)},
		'ADD_TO_PICK_SCENE' : function(packet){_RequestAddToPickingScene(packet)},
		'SWITCH_TO_SCENE' : function(packet){_RequestSwitchToScene(packet)},
		'SEE_SUB_GRAPHS' : function(packet){_RequestSeeSubGraphs(packet)}
	}

	var SendMessage = function(packet){
		MESSAGES[packet[0]](packet)
	}

	this.PostMessage = function(message)
	{
		packages.push(message)
	}

	this.HandleMessageImmediately = function(packet)
	{
		MESSAGES[packet[0]](packet)
	}

	function _RequestSeeSubGraphs(packet){

		var object = packet[1]
		var p_cube = packet[2]

		var s = p_cube.GetSubGraphs(object)

		SCENE.rotation_line_index = s['rotation_line_index']
		SCENE.sub_graph_1 = s['subgraphs'][0]
		SCENE.sub_graph_2 = s['subgraphs'][1]
	}

	function _RequestRemoveFromScene(packet){
		var scene_handler = packet[1]
		var object = packet[2]
		var scene = packet[3]

		try{
			var active_scene = scene_handler.active_scene

			if(ObjectExists(scene))
			{
				scene_handler.RequestSwitchToScene(scene)
				scene_handler.RequestRemoveFromScene(object)
			}
			else
			{
				scene_handler.SwitchToDefaultScene()
				scene_handler.RequestRemoveFromScene(object)
			}

			scene_handler.RequestSwitchToScene(active_scene)
		}
		catch(err)
		{

		}
	}

	function _RequestCutEdge(packet){
		try{

			var edge = packet[1]
			var polycube = packet[2]

			polycube.CutEdge(edge)
		}
		catch(err){

			throw "CUT_EDGE: " + err
		}
	}

	function _RequestPick(packet){
		
		try{
			var scene_handler = packet[1]
			var id_object = packet[2]

			scene_handler.Pick(id_object)
		}
		catch(err){
			throw "PICK: " + err
		}
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
			var new_polycube = packet[1] != null ? PolyCube.L_Polycubes[packet[1]] : null
			var toolbar_handler = packet[2]

			PolyCube.SwitchToNewActive(new_polycube)

			if(new_polycube == null)
			{
				toolbar_handler.Switch_Context_H('edit-context')
			}
			else
			{
				toolbar_handler.Switch_Context_H('poly-context', new_polycube)
			}
		}
		catch(err){
			throw 'SWITCH_ACTIVE_POLYCUBE: ' + packet[1] + err
		}
	}

	function _RequestAddToScene(packet)
	{
		var scene_handler = packet[1]
		var object = packet[2]

		var scene = packet[3]
			
		try{

			var active_scene = scene_handler.active_scene
			
			if(ObjectExists(scene))
			{
				scene_handler.RequestSwitchToScene(scene)
				scene_handler.RequestAddToScene(object)
			}
			else
			{
				scene_handler.SwitchToDefaultScene()
				scene_handler.RequestAddToScene(object)
			}

			scene_handler.RequestSwitchToScene(active_scene)
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
		}
		catch(err){
			throw 'REMOVE_POLYCUBE: ' + err
		}
	}

	function _RequestAddToPickingScene(packet)
	{
		var scene_handler = packet[1]
		var object = packet[2]

		var scene = ObjectExists(packet[3]) ? packet[3] : null

		
		try{
			var active_scene = scene_handler.active_picking_scene

			if(ObjectExists(scene))
			{
				scene_handler.RequestSwitchToPickingScene(scene)
				scene_handler.RequestAddToPickingScene(object)
			}
			else
			{
				scene_handler.SwitchToDefaultPickingScene()
				scene_handler.RequestAddToPickingScene(object)
			}

			scene_handler.RequestSwitchToPickingScene(active_scene)
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

function PostUrgentMessage()
{
	MessageBoard.The_Board.HandleMessageImmediately(arguments[0])
}