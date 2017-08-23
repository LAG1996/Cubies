var CONTROL = new Controller()

$(document).ready(function(){

	//CONTROL.scene = new Scene(CONTROL)
	CONTROL.scene_handler = new SceneHandler()
	CONTROL.toolbar_handler = new Toolbar_Handler(CONTROL)

	var grid = GenerateGrid(100, 2, 0x000000)
	grid.position.y = -1
	CONTROL.scene_handler.RequestAddToScene(grid)

	grid.add(new THREE.AxisHelper(50))

	//Some flags for the controller
	CONTROL.context = ''

	CONTROL.Switch_To_Edit = function(btns){

		CONTROL.context = 'edit'

	}

	CONTROL.Switch_To_Poly = function(btns){

		CONTROL.context = 'poly'
		$("#mode_text").text($("#mode_text").text() + " " + PolyCube.Active_Polycube.name)

	}

	CONTROL.Switch_To_Rotate = function(btns){
		CONTROL.context = 'rotate'
	}

	CONTROL.Context_Funcs = {'edit-context' : function(btns){CONTROL.Switch_To_Edit(btns)}, 'poly-context' : function(btns){CONTROL.Switch_To_Poly(btns)}, 'rotate-context' : function(btns){CONTROL.Switch_To_Rotate(btns)}}

	CONTROL.Switch_Context = function(context_name)
	{
		CONTROL.toolbar_handler.Switch_Context_H(context_name)

		CONTROL.Context_Funcs[context_name](CONTROL.toolbar_handler.toolbar_btns)
	}

	//Alert functions for the control

	CONTROL.Alert_Funcs['NEW_POLYCUBE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		var new_p_cube = PolyCube.GenerateNewPolyCube(args[0], args[1])
		CONTROL.toolbar_handler.AddPolyCubeToObjectView(args[1])

		CONTROL.scene_handler.RequestAddToScene(new_p_cube.Obj)

		CONTROL.Switch_Context('poly-context')
	}


	CONTROL.Alert_Funcs['ADD_CUBE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		if(!ObjectExists(PolyCube.Active_Polycube))
		{
			throw "Critical error: tried to add cube without an active polycube"
		}
		else
		{
			PolyCube.Active_Polycube.Add_Cube(args[0])
		}
	}

	CONTROL.Alert_Funcs['DESTROY_POLYCUBE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		var p_cube = ObjectExists(args[0]) ? args[0] : PolyCube.Active_Polycube

		if(ObjectExists(p_cube))
		{
			$("#" + PolyCube.ToPolyCubeIDString(p_cube.name) + "_data").remove()
			PolyCube.DestroyPolyCube(p_cube)

		}

		CONTROL.Switch_Context('edit-context')
	}

	CONTROL.Alert_Funcs['SAVE_POLYCUBE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		var p_cube = ObjectExists(args[0]) ? args[0] : PolyCube.Active_Polycube

		if(ObjectExists(p_cube))
		{
			saveTextAs(JSON.stringify(p_cube.toJSON()), p_cube.name) //Thank you Eli Grey
		}
	}


	//The update function
	CONTROL.update = function(){

		CONTROL.scene_handler.Draw()

		requestAnimationFrame(CONTROL.update)
	}

	CONTROL.Switch_Context('edit-context')

	requestAnimationFrame(CONTROL.update)
})