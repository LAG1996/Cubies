var CONTROL = new Controller()

$(document).ready(function(){

	CONTROL.scene_handler = new SceneHandler()
	CONTROL.toolbar_handler = new Toolbar_Handler(CONTROL)

	var grid = GenerateGrid(100, 2, 0x000000)
	grid.position.y = -1
	CONTROL.scene_handler.RequestAddToScene(grid)

	grid.add(new THREE.AxisHelper(50))

	//Some helper variables
	CONTROL.Load_Polycube_Handler_List = []
	CONTROL.mouse_pos = new THREE.Vector2()
	CONTROL.old_mouse_pos = new THREE.Vector2()
	CONTROL.mouse_delta = 0
	CONTROL.accum_mouse_delta = 0
	CONTROL.hover_over_poly = null
	CONTROL.hover_over_hinge = null

	//Highlights
	CONTROL.prime_highlight = new THREE.Color(0xFF0000)
	CONTROL.second_highlight = new THREE.Color(0x0000FF)
	CONTROL.cut_highlight = new THREE.Color(0x22EEDD)
	CONTROL.hinge_highlight = new THREE.Color(0xAA380F)

	//Junk collectors
	CONTROL.face_junk = []
	CONTROL.hinge_junk = []
	CONTROL.edge_junk = []
	CONTROL.cut_junk = []

	//Some delegate functions
	CONTROL.Mouse_Hover_Funcs = []
	CONTROL.Mouse_Up_Funcs = []
	CONTROL.Mouse_Down_Funcs = []

	//Some flags for the controller
	CONTROL.context = ''
	CONTROL.mouse_down = false
	CONTROL.hovering_over_hinge = false

	CONTROL.Switch_To_Edit = function(){

		$('#poly_cube_name_only').hide()

		CONTROL.scene_handler.SwitchToDefaultScene()
		CONTROL.scene_handler.SwitchToDefaultPickingScene()

		CONTROL.context = 'edit'

		CONTROL.Mouse_Hover_Funcs = [function(){

			if(CONTROL.hover_over_poly)
			{
				$('#poly_cube_name_only').show()
				$('.tooltip_text').text(CONTROL.hover_over_poly.name)
			}
			else
			{
				$('#poly_cube_name_only').hide()
			}

		}]

		CONTROL.Mouse_Up_Funcs = [function(){

			if(CONTROL.accum_mouse_delta <= 10)
			{
				if(CONTROL.hover_over_poly)
				{
					PolyCube.SwitchToNewActive(CONTROL.hover_over_poly)

					CONTROL.toolbar_handler.ActivePolyCubeObjectView(CONTROL.hover_over_poly.name)

					CONTROL.Switch_Context('poly-context')

				}
			}

		}]

		CONTROL.Mouse_Down_Funcs = [function(){

		}]

	}

	CONTROL.Switch_To_Poly = function(){

		CONTROL.context = 'poly'
		$("#mode_text").text($("#mode_text").text() + " " + PolyCube.Active_Polycube.name)

		$('#poly_cube_name_only').show()
		$('.tooltip_text').text(PolyCube.Active_Polycube.name)

		CONTROL.scene_handler.SwitchToDefaultScene()
		CONTROL.scene_handler.SwitchToDefaultPickingScene()

		CONTROL.Mouse_Hover_Funcs = [function(){

			CONTROL.ClearJunk(CONTROL.edge_junk)
			CONTROL.ClearJunk(CONTROL.face_junk)

			PolyCube.Active_Polycube.SwitchToContext('hinge')
			CONTROL.scene_handler.RequestSwitchToPickingScene(PolyCube.Active_Polycube.pick_context)
			var id =CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

			package = PolyCube.Active_Polycube.HandlePick(id)

			if(!ObjectExists(package))
			{
				CONTROL.hovering_over_hinge = false
				CONTROL.hover_over_hinge = null

				PolyCube.Active_Polycube.SwitchToContext('face')
				CONTROL.scene_handler.RequestSwitchToPickingScene(PolyCube.Active_Polycube.pick_context)
				id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

				package = PolyCube.Active_Polycube.HandlePick(id)

				if(ObjectExists(package))
				{
					CONTROL.HighlightParts(package['parent'], CONTROL.prime_highlight, 'face', CONTROL.face_junk)
				}
			}
			else
			{
				CONTROL.hovering_over_hinge = true
				CONTROL.hover_over_hinge = package['parent'][0]
				CONTROL.HighlightParts(package['parent'], CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk)
			}

		}]

		CONTROL.Mouse_Up_Funcs = [function(){

			if(CONTROL.accum_mouse_delta <= 10)
			{
				if(CONTROL.hovering_over_hinge)
				{

					PolyCube.Active_Polycube.CutEdge(CONTROL.hover_over_hinge)

					CONTROL.ClearJunk(CONTROL.cut_junk, [PolyCube.Rotation_Scene, null])
					CONTROL.ClearJunk(CONTROL.hinge_junk, [PolyCube.Rotation_Scene, null])
					
					var cuts = PolyCube.Active_Polycube.GetCutEdges()

					for(var bindex in cuts)
					{
						CONTROL.HighlightParts(cuts[bindex], CONTROL.cut_highlight, 'hinge', CONTROL.cut_junk, [PolyCube.Rotation_Scene, null])
					}


					var l_hinges = PolyCube.Active_Polycube.GetRotationLines()

					for(var lindex in l_hinges)
					{
						var line  = l_hinges[lindex]
						for(var gindex in line)
						{
							CONTROL.HighlightParts([line[gindex]['edge'], line[gindex]['incidentEdge']['edge']], CONTROL.hinge_highlight, 'hinge', CONTROL.hinge_junk, [PolyCube.Rotation_Scene, null])
						}
					}
				}
			}
		}]

		CONTROL.Mouse_Down_Funcs = [function(){
			
		}]

	}

	CONTROL.Switch_To_Rotate = function(){

		$('#poly_cube_name_only').hide()

		CONTROL.context = 'rotate'

		CONTROL.scene_handler.RequestSwitchToScene(PolyCube.Rotation_Scene)
		CONTROL.scene_handler.SwitchToDefaultPickingScene()

		CONTROL.Mouse_Hover_Funcs = [function(){

			CONTROL.ClearJunk(CONTROL.edge_junk)
			CONTROL.ClearJunk(CONTROL.face_junk)

			PolyCube.Active_Polycube.SwitchToContext('hinge')
			CONTROL.scene_handler.RequestSwitchToPickingScene(PolyCube.Active_Polycube.pick_context)
			var id =CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

			package = PolyCube.Active_Polycube.HandlePick(id)

			if(!ObjectExists(package))
			{
				CONTROL.hovering_over_hinge = false
				CONTROL.hover_over_hinge = null

				PolyCube.Active_Polycube.SwitchToContext('face')
				CONTROL.scene_handler.RequestSwitchToPickingScene(PolyCube.Active_Polycube.pick_context)
				id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

				package = PolyCube.Active_Polycube.HandlePick(id)

				if(ObjectExists(package))
				{
					CONTROL.HighlightParts(package['parent'], CONTROL.prime_highlight, 'face', CONTROL.face_junk)
				}
			}
			else
			{
				CONTROL.hovering_over_hinge = true
				CONTROL.hover_over_hinge = package['parent'][0]
				CONTROL.HighlightParts(package['parent'], CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk)
			}

		}]

		CONTROL.Mouse_Up_Funcs = [function(){

		}]

		CONTROL.Mouse_Down_Funcs = [function(){
			
		}]

	}

	CONTROL.Context_Funcs = {'edit-context' : function(){CONTROL.Switch_To_Edit()}, 'poly-context' : function(){CONTROL.Switch_To_Poly()}, 'rotate-context' : function(){CONTROL.Switch_To_Rotate()}}

	CONTROL.Switch_Context = function(context_name)
	{

		CONTROL.toolbar_handler.Switch_Context_H(context_name)

		CONTROL.Context_Funcs[context_name]()

	}

	//Alert functions for the control

	CONTROL.Alert_Funcs['NEW_POLYCUBE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		var new_p_cube = PolyCube.GenerateNewPolyCube(args[0], args[1])
		CONTROL.toolbar_handler.AddPolyCubeToObjectView(args[1])

		CONTROL.scene_handler.RequestAddToScene(new_p_cube.Obj)
		PolyCube.SwitchToNewActive(new_p_cube)

		CONTROL.toolbar_handler.ActivePolyCubeObjectView(new_p_cube.name)
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

	CONTROL.Alert_Funcs['LOAD_POLYCUBE'] = function(){

		//Instantiate a file reader that will read the file specified
		var reader = new FileReader()
		var that = this
		
		reader.onload = function(){
			data = reader.result
			var obj = JSON.parse(data)
	
			//TODO: Verify the file
	
			//The file has been verified. Create a new polycube with all of the specified cubes
	
			var p = PolyCube.GenerateNewPolyCube(new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]), obj.name)
		
			CONTROL.scene_handler.RequestAddToScene(p.Obj)
			CONTROL.scene_handler.RequestAddToPickingScene(p.picking_polycube)

			PolyCube.SwitchToNewActive(p)

			CONTROL.toolbar_handler.AddPolyCubeToObjectView(p.name)
			CONTROL.toolbar_handler.ActivePolyCubeObjectView(p.name)
	
			CONTROL.Load_Polycube_Handler_List.push(new Cube_Add_Handler(obj.cubes, p))
			
			CONTROL.Switch_Context('poly-context')
	
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

	}

	CONTROL.Alert_Funcs['CHANGE_POLY_NAME'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		PolyCube.ChangeName(args[0], args[1])
		args[2].parent().parent().find("#active_toggle").text(args[1])

		args[2].parent().attr("id", args[1]+"_data_edit")
		args[2].parent().parent().attr("id", args[1]+"_data")

	}

	CONTROL.Alert_Funcs['SET_ACTIVE_POLY'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)


		PolyCube.SwitchToNewActive(typeof args[0] == 'string' ? PolyCube.L_Polycubes[args[0]] : null)
		
		if(ObjectExists(PolyCube.Active_Polycube))
			CONTROL.Switch_Context('poly-context')
		else
			CONTROL.Switch_Context('edit-context')

	}


	//Creating mouse functions
	CONTROL.onMouseMove = function(event){
		
		CONTROL.mouse_pos.x = event.clientX
		CONTROL.mouse_pos.y = event.clientY

		CONTROL.mouse_delta = CONTROL.old_mouse_pos.distanceTo(CONTROL.mouse_pos)

		if(CONTROL.mouse_down)
		{	
			CONTROL.accum_mouse_delta += CONTROL.mouse_delta
		}
		else
		{
			CONTROL.accum_mouse_delta = 0
		}

		CONTROL.old_mouse_pos.copy(CONTROL.mouse_pos)

		$('#poly_cube_name_only').css("top", "" + CONTROL.mouse_pos.y + "px")
		$('#poly_cube_name_only').css("left", "" + (CONTROL.mouse_pos.x + 10) + "px")

		var id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

		var p_cube = PolyCube.ID2Poly[id]


		if(ObjectExists(p_cube))
		{
			CONTROL.hover_over_poly = p_cube	
		}
		else
		{
			CONTROL.hover_over_poly = null
		}

		for(var index in CONTROL.Mouse_Hover_Funcs)
		{
			CONTROL.Mouse_Hover_Funcs[index]()
		}

	}

	CONTROL.onMouseDown = function(event){

		CONTROL.mouse_down = true

		for(var index in CONTROL.Mouse_Down_Funcs)
		{
			CONTROL.Mouse_Down_Funcs[index]()
		}

	}

	CONTROL.onMouseUp = function(event){

		CONTROL.mouse_down = false

		for(var index in CONTROL.Mouse_Up_Funcs)
		{
			CONTROL.Mouse_Up_Funcs[index]()
		}
	}

	$('canvas').on('mousemove', CONTROL.onMouseMove)
	$('canvas').on('mousedown', CONTROL.onMouseDown)
	$('canvas').on('mouseup', CONTROL.onMouseUp)

	//Utility functions
	CONTROL.ClearJunk = function(junk_collector, scenes = null)
	{
		for(var jindex in junk_collector)
		{

			if(Array.isArray(scenes))
			{
				for(var windex in scenes)
				{
					if(!ObjectExists(scenes[windex]))
					{
						CONTROL.scene_handler.SwitchToDefaultScene()
						CONTROL.scene_handler.RequestRemoveFromScene(junk_collector[jindex])
					}
					else
					{
						CONTROL.scene_handler.RequestSwitchToScene(scenes[windex])
						CONTROL.scene_handler.RequestRemoveFromScene(scenes[windex].getObjectByName(junk_collector[jindex]))
					}
				}
			}
			else if(ObjectExists(scenes))
			{
				CONTROL.scene_handler.RequestSwitchToScene(scenes)
				CONTROL.scene_handler.RequestRemoveFromScene(junk_collector[jindex])
			}
			else
			{
				CONTROL.scene_handler.SwitchToDefaultScene()
				CONTROL.scene_handler.RequestRemoveFromScene(junk_collector[jindex])
			}

			delete junk_collector[jindex]

		}

		junk_collector = []
	}

	CONTROL.HighlightParts = function(package, color, context, junk_collector, scenes = null)
	{	
		if(!ObjectExists(package) || !ObjectExists(color) || !ObjectExists(context) || !ObjectExists(junk_collector))
			return
	
		var highlight = context == 'hinge' ? Cube.highlightEdge.clone() : Cube.highlightFace.clone()
	
		highlight.material = new THREE.MeshBasicMaterial()
		highlight.material.color.copy(color)
	
		if(Array.isArray(package))
		{
			for(var index = 0; index < package.length; index++)
			{
				var part = ObjectExists(package[index].face) ? package[index].face : package[index].edge

				if(!ObjectExists(part))
				{
					part = package[index]
				}

				if(Array.isArray(scenes))
				{
					for(var windex in scenes)
					{
						if(!ObjectExists(scenes[windex]))
						{
							CONTROL.scene_handler.SwitchToDefaultScene()

							highlight.position.copy(part.getWorldPosition())
							highlight.rotation.copy(part.getWorldRotation())
						}
						else
						{
							highlight.position.copy(scenes[windex].getObjectByName(part.name).getWorldPosition())
							highlight.rotation.copy(part.getObjectByName(part.name).getWorldRotation())
							CONTROL.scene_handler.RequestSwitchToScene(scenes[windex])
						}
						
						var h = highlight.clone()
						CONTROL.scene_handler.RequestAddToScene(h)

						junk_collector.push(h)
					}
				}
				else if(ObjectExists(scenes))
				{
					highlight.position.copy(part.getWorldPosition())
					highlight.rotation.copy(part.getWorldRotation())

					CONTROL.scene_handler.RequestSwitchToScene(scenes)
					var h = highlight.clone()
					CONTROL.scene_handler.RequestAddToScene(h)

					junk_collector.push(h)
				}
				else
				{
					highlight.position.copy(part.getWorldPosition())
					highlight.rotation.copy(part.getWorldRotation())

					CONTROL.scene_handler.SwitchToDefaultScene()
					var h = highlight.clone()
					CONTROL.scene_handler.RequestAddToScene(h)

					junk_collector.push(h)
				}
			}
		}
		else
		{
			var part = ObjectExists(package.face) ? package.face : package.edge
	
			if(!ObjectExists(part))
			{
				part = package
			}
	
			highlight.position.copy(part.getWorldPosition())
			highlight.rotation.copy(part.getWorldRotation())

			if(Array.isArray(scenes))
			{
				for(var windex in scenes)
				{
					if(!ObjectExists(scenes[windex]))
					{
						CONTROL.scene_handler.SwitchToDefaultScene()

						highlight.position.copy(part.getWorldPosition())
						highlight.rotation.copy(part.getWorldRotation())
					}
					else
					{
						highlight.position.copy(scenes[windex].getObjectByName(part.name).getWorldPosition())
						highlight.rotation.copy(part.getObjectByName(part.name).getWorldRotation())
						CONTROL.scene_handler.RequestSwitchToScene(scenes[windex])
					}

					var h = highlight.clone()
					CONTROL.scene_handler.RequestAddToScene(h)

					junk_collector.push(h)
				}
			}
			else if(ObjectExists(scenes))
			{
				highlight.position.copy(part.getWorldPosition())
				highlight.rotation.copy(part.getWorldRotation())
				CONTROL.scene_handler.RequestSwitchToScene(scenes)
				var h = highlight.clone()
				CONTROL.scene_handler.RequestAddToScene(h)

				junk_collector.push(h)
			}
			else
			{
				highlight.position.copy(part.getWorldPosition())
				highlight.rotation.copy(part.getWorldRotation())

				CONTROL.scene_handler.SwitchToDefaultScene()
				var h = highlight.clone()
				CONTROL.scene_handler.RequestAddToScene(h)

				junk_collector.push(h)
			}
	
			
		}
	}

	//The update function
	CONTROL.update = function(){

		CONTROL.scene_handler.Draw()

		//Load up cubes from any opened files
		for(var c in CONTROL.Load_Polycube_Handler_List)
		{
			if(CONTROL.Load_Polycube_Handler_List[c].finished)
			{
				delete CONTROL.Load_Polycube_Handler_List[c]
			}
			else
			{
				CONTROL.Load_Polycube_Handler_List[c].Add_Another_Cube()
			}
		}

		requestAnimationFrame(CONTROL.update)
	}

	CONTROL.Switch_Context('edit-context')

	requestAnimationFrame(CONTROL.update)
})