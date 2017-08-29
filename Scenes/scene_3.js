var CONTROL = new Controller()

$(document).ready(function(){
	Initialize() //Load the cube part models and then initialize the cube class with said models

	CONTROL.scene_handler = new SceneHandler()
	CONTROL.toolbar_handler = new Toolbar_Handler(CONTROL)
	CONTROL.data_processor = new PolycubeDataVisualizer(Cube_Template.new_cube)

	//Some helper variables
	CONTROL.Load_Polycube_Handler_List = []
	CONTROL.mouse_pos = new THREE.Vector2()
	CONTROL.old_mouse_pos = new THREE.Vector2()
	CONTROL.mouse_delta = 0
	CONTROL.accum_mouse_delta = 0
	CONTROL.hover_over_poly = null
	CONTROL.hover_over_hinge = null
	CONTROL.hover_over_face = null

	//Highlights
	CONTROL.prime_highlight = new THREE.Color(0xFF0000)
	CONTROL.second_highlight = new THREE.Color(0x0000FF)
	CONTROL.cut_highlight = new THREE.Color(0x22EEDD)
	CONTROL.hinge_highlight = new THREE.Color(0xAA380F)

	//The scenes that the viewer will see
	CONTROL.edit_mode_scene = new THREE.Scene()
	CONTROL.rotate_mode_scene = new THREE.Scene()

	//Some picking scenes that we're going to use
	CONTROL.edit_mode_poly_cube_picking_scene = new THREE.Scene()
	CONTROL.edit_mode_edge_picking_scene = new THREE.Scene()
	CONTROL.edit_mode_face_picking_scene = new THREE.Scene()

	CONTROL.rotate_mode_poly_cube_picking_scene = new THREE.Scene()
	CONTROL.rotate_mode_edge_picking_scene = new THREE.Scene()
	CONTROL.rotate_mode_face_picking_scene = new THREE.Scene()

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
	CONTROL.hovering_over_face = false
	CONTROL.face_graphs_out = false

	//Add a grid to the default scene
	var grid = GenerateGrid(100, 2, 0x000000)
	grid.position.y = -1
	grid.add(new THREE.AxisHelper(50))
	CONTROL.edit_mode_scene.add(grid)
	CONTROL.rotate_mode_scene.add(grid.clone())

	//Create some variables and functions for the polycube class	PolyCube.Rotation_Scene = new Scene()
	PolyCube.Active_Polycube = null
	PolyCube.SwitchToNewActive = function(polycube)
	{
		PolyCube.Active_Polycube = polycube
	}

	CONTROL.Switch_To_Edit = function(){

		$('#poly_cube_name_only').hide()

		CONTROL.scene_handler.RequestSwitchToScene(CONTROL.edit_mode_scene)
		CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.edit_mode_poly_cube_picking_scene)

		PolyCube.SwitchToNewActive(null)

		CONTROL.toolbar_handler.ActivePolyCubeObjectView(null)

		CONTROL.context = 'edit'

		CONTROL.Mouse_Hover_Funcs = [function(){

			if(CONTROL.hover_over_poly)
			{
				$('#poly_cube_name_only').show()
				$('.tooltip_text').text("Edit " + CONTROL.hover_over_poly.name)
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

		$('#poly_cube_name_only').hide()

		CONTROL.scene_handler.RequestSwitchToScene(CONTROL.edit_mode_scene)
		CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.edit_mode_poly_cube_picking_scene)

		CONTROL.toolbar_handler.ActivePolyCubeObjectView(PolyCube.Active_Polycube.name)

		CONTROL.Mouse_Hover_Funcs = [function(){

			CONTROL.ClearJunk(CONTROL.edge_junk, CONTROL.edit_mode_scene)
			CONTROL.ClearJunk(CONTROL.face_junk, CONTROL.edit_mode_scene)

			if(!ObjectExists(PolyCube.Active_Polycube) || !(ObjectExists(CONTROL.hover_over_poly)))
				return

			CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.edit_mode_edge_picking_scene)
			var id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

			var hinge_name = CONTROL.data_processor.Color2Hinge[id]

			if(!ObjectExists(hinge_name))
			{
				CONTROL.hovering_over_hinge = false
				CONTROL.hover_over_hinge = null

				CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.edit_mode_face_picking_scene)
				id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

				var face_name = CONTROL.data_processor.Color2Face[id]

				if(ObjectExists(face_name))
				{
					var face = PolyCube.Active_Polycube.Get_Face(face_name)
					CONTROL.hovering_over_face = true
					CONTROL.hover_over_face = face
					CONTROL.HighlightParts(CONTROL.scene_handler.active_scene.getObjectByName(face.name), CONTROL.prime_highlight, 'face', CONTROL.face_junk, CONTROL.edit_mode_scene)
					//$("#poly_cube_name_only").hide()
				}
				else
				{
					CONTROL.hover_over_face = null
					CONTROL.hovering_over_face = false

					//$("#poly_cube_name_only").show()
					//$(".tooltip_text").text("Exit " + PolyCube.Active_Polycube.name)
				}
			}
			else
			{
				var edge_data = PolyCube.Active_Polycube.Get_Edge(hinge_name)

				var edge_1 = CONTROL.scene_handler.active_picking_scene.getObjectByName(edge_data.name)
				var edge_2 = null

				if(ObjectExists(edge_data.incidentEdge))
				{
					var edge_2_data = edge_data.incidentEdge

					edge_2 = CONTROL.scene_handler.active_picking_scene.getObjectByName(edge_2_data.name)
					CONTROL.HighlightParts(edge_2, CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk, CONTROL.edit_mode_scene)
				}

				CONTROL.hovering_over_hinge = true
				CONTROL.hover_over_hinge = edge_1
				CONTROL.HighlightParts(edge_1, CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk, CONTROL.edit_mode_scene)
				//$("#poly_cube_name_only").hide()
			}

		}]

		CONTROL.Mouse_Up_Funcs = [function(){

			if(CONTROL.accum_mouse_delta <= 5)
			{
				if(CONTROL.hovering_over_hinge)
				{
					PolyCube.Active_Polycube.Cut_Edge(CONTROL.hover_over_hinge.name)

					CONTROL.ClearJunk(CONTROL.cut_junk, [CONTROL.rotate_mode_scene, CONTROL.edit_mode_scene])
					CONTROL.ClearJunk(CONTROL.hinge_junk, [CONTROL.rotate_mode_scene, CONTROL.edit_mode_scene])
					
					var cuts = PolyCube.Active_Polycube.Get_Cuts()

					for(var bindex in cuts)
					{
						var edge = CONTROL.scene_handler.active_scene.getObjectByName(cuts[bindex].name)
						CONTROL.HighlightParts(edge, CONTROL.cut_highlight, 'hinge', CONTROL.cut_junk, [CONTROL.rotate_mode_scene, CONTROL.edit_mode_scene])
					}

					var l_hinges = PolyCube.Active_Polycube.Get_Rotation_Lines()

					for(var lindex in l_hinges)
					{
						var line  = l_hinges[lindex]
						for(var gindex in line)
						{
							var edge_1 = CONTROL.scene_handler.active_scene.getObjectByName(line[gindex].name)

							var edge_2 = CONTROL.scene_handler.active_scene.getObjectByName(line[gindex]['incidentEdge'].name)

							CONTROL.HighlightParts([edge_1, edge_2], CONTROL.hinge_highlight, 'hinge', CONTROL.hinge_junk, [CONTROL.rotate_mode_scene, CONTROL.edit_mode_scene])
						}
					}

				}
				else if(CONTROL.hovering_over_face)
				{}
				else
				{
					CONTROL.Switch_Context('edit-context')
				}
			}
		}]

		CONTROL.Mouse_Down_Funcs = [function(){
			
		}]

	}

	CONTROL.Switch_To_Rotate = function(){

		$('#poly_cube_name_only').hide()

		CONTROL.context = 'rotate'

		CONTROL.scene_handler.RequestSwitchToScene(CONTROL.rotate_mode_scene)
		CONTROL.scene_handler.SwitchToDefaultPickingScene(CONTROL.rotate_mode_poly_cube_picking_scene)

		PolyCube.SwitchToNewActive(null)

		CONTROL.toolbar_handler.ActivePolyCubeObjectView(null)

		CONTROL.ClearJunk(CONTROL.face_junk, CONTROL.rotate_mode_scene)

		CONTROL.Mouse_Hover_Funcs = [function(){

			CONTROL.ClearJunk(CONTROL.edge_junk, CONTROL.rotate_mode_scene)
			
			if(!CONTROL.face_graphs_out)
				CONTROL.ClearJunk(CONTROL.face_junk, CONTROL.rotate_mode_scene)

			if(!ObjectExists(CONTROL.hover_over_poly))
			{
				CONTROL.hovering_over_hinge = false
				CONTROL.hover_over_hinge = null

				CONTROL.hovering_over_face = false
				CONTROL.hover_over_face = null

				return
			}

			CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.rotate_mode_face_picking_scene)
			var id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

			var hinge_name = CONTROL.data_processor.Color2Hinge[id]

			if(!ObjectExists(hinge_name))
			{
				CONTROL.hovering_over_hinge = false
				CONTROL.hover_over_hinge = null

				CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.edit_mode_face_picking_scene)
				id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

				var face_name = CONTROL.data_processor.Color2Face[id]

				if(ObjectExists(face_name) && !CONTROL.face_graphs_out)
				{
					var face = CONTROL.hover_over_poly.Get_Face(face_name)
					CONTROL.hovering_over_face = true
					CONTROL.hover_over_face = face
					CONTROL.HighlightParts(CONTROL.scene_handler.active_scene.getObjectByName(face.name), CONTROL.prime_highlight, 'face', CONTROL.face_junk, CONTROL.rotate_mode_scene)
					//$("#poly_cube_name_only").hide()
				}
				else
				{
					CONTROL.hover_over_face = null
					CONTROL.hovering_over_face = false

					//$("#poly_cube_name_only").show()
					//$(".tooltip_text").text("Exit " + PolyCube.Active_Polycube.name)
				}
			}
			else
			{
				var edge_data = CONTROL.hover_over_poly.Get_Edge(hinge_name)

				var edge_1 = CONTROL.scene_handler.active_picking_scene.getObjectByName(edge_data.name)
				var edge_2 = null

				if(ObjectExists(edge_data.incidentEdge))
				{
					var edge_2_data = edge_data.incidentEdge

					edge_2 = CONTROL.scene_handler.active_picking_scene.getObjectByName(edge_2_data.name)
					CONTROL.HighlightParts(edge_2, CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk, CONTROL.rotate_mode_scene)
				}

				CONTROL.hovering_over_hinge = true
				CONTROL.hover_over_hinge = edge_1
				CONTROL.HighlightParts(edge_1, CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk, CONTROL.rotate_mode_scene)
				//$("#poly_cube_name_only").hide()
			}

		}]

		CONTROL.Mouse_Up_Funcs = [function(){

			if(CONTROL.accum_mouse_delta <= 5)
			{
				CONTROL.ClearJunk(CONTROL.face_junk, CONTROL.rotate_mode_scene)

				if(CONTROL.hovering_over_hinge)
				{
					var subgraphs = CONTROL.hover_over_poly.Get_Face_Graphs(CONTROL.hover_over_hinge.name)['subgraphs']

					if(!ObjectExists(subgraphs))
					{
						CONTROL.face_graphs_out = false
						return
					}

					CONTROL.face_graphs_out = true

					for(var tindex in subgraphs[0])
					{
						var face = subgraphs[0][tindex]

						CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(face.name), CONTROL.prime_highlight, 'face', CONTROL.face_junk, CONTROL.rotate_mode_scene)
					}

					for(var tindex in subgraphs[1])
					{
						var face = subgraphs[1][tindex]

						CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(face.name), CONTROL.second_highlight, 'face', CONTROL.face_junk, CONTROL.rotate_mode_scene)
					}

				}
				else if(CONTROL.hovering_over_face && CONTROL.face_graphs_out)
				{

				}
				else
				{
					CONTROL.face_graphs_out = false
					
				}
			}
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

		//CONTROL.scene_handler.RequestAddToScene(new_p_cube.Obj)
		PolyCube.SwitchToNewActive(new_p_cube)
		PolyCube.Active_Polycube.Add_Cube(new THREE.Vector3(0, 0, 0))

		CONTROL.data_processor.ProcessPolycubeAfterNewCube(new_p_cube, new_p_cube.GetCubeAtPosition(new THREE.Vector3(0, 0, 0)))

		CONTROL.VisualizePolycube(new_p_cube)

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

			CONTROL.data_processor.ProcessPolycubeAfterNewCube(PolyCube.Active_Polycube, PolyCube.Active_Polycube.GetCubeAtPosition(args[0]))
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

			PolyCube.SwitchToNewActive(p)

			CONTROL.toolbar_handler.AddPolyCubeToObjectView(p.name)
			CONTROL.toolbar_handler.ActivePolyCubeObjectView(p.name)
	
			CONTROL.Load_Polycube_Handler_List.push(new Cube_Add_Handler(obj.cubes, p))

			CONTROL.data_processor.ProcessPolycube(p)

			CONTROL.VisualizePolycube(p)
			
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


		PolyCube.SwitchToNewActive(typeof args[0] == 'string' ? PolyCube.Name2Poly[args[0]] : null)
		
		if(ObjectExists(PolyCube.Active_Polycube))
			CONTROL.Switch_Context('poly-context')
		else
			CONTROL.Switch_Context('edit-context')

	}

	CONTROL.Alert_Funcs['CUT_EDGE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		var cuts = PolyCube.Active_Polycube.GetCutEdges()

		for(var bindex in cuts)
		{
			CONTROL.HighlightParts(cuts[bindex], CONTROL.cut_highlight, 'hinge', CONTROL.cut_junk, [PolyCube.Rotation_Scene, null])
		}

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


		CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.toolbar_handler.context == 'rotate-context' ? CONTROL.rotate_mode_poly_cube_picking_scene : CONTROL.edit_mode_poly_cube_picking_scene)
		var id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

		var p_cube = PolyCube.ID2Poly[id]

		if(ObjectExists(p_cube))
		{
			CONTROL.hover_over_poly = p_cube	
		}
		else
		{
			CONTROL.hover_over_poly = null
			
			CONTROL.hovering_over_hinge = false
			CONTROL.hover_over_hinge = null

			CONTROL.hover_over_face = null	
			CONTROL.hovering_over_face = false
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

	//Utility functions
	CONTROL.VisualizePolycube = function(polycube)
	{
		CONTROL.edit_mode_scene.add(CONTROL.data_processor.edit_polycubes[polycube.id])
		CONTROL.rotate_mode_scene.add(CONTROL.data_processor.rotate_polycubes[polycube.id])

		CONTROL.edit_mode_poly_cube_picking_scene.add(CONTROL.data_processor.edit_pick_polycubes[polycube.id])
		CONTROL.edit_mode_face_picking_scene.add(CONTROL.data_processor.edit_face_polycube[polycube.id])
		CONTROL.edit_mode_edge_picking_scene.add(CONTROL.data_processor.edit_hinge_polycubes[polycube.id])

		CONTROL.rotate_mode_poly_cube_picking_scene.add(CONTROL.data_processor.rotate_pick_polycubes[polycube.id])
		CONTROL.rotate_mode_edge_picking_scene.add(CONTROL.data_processor.rotate_hinge_polycubes[polycube.id])
		CONTROL.rotate_mode_face_picking_scene.add(CONTROL.data_processor.rotate_face_polycubes[polycube.id])
	}

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
						CONTROL.scene_handler.RequestRemoveFromScene(junk_collector[jindex])
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
	
		var highlight = context == 'hinge' ? Cube_Template.highlightEdge.clone() : Cube_Template.highlightFace.clone()
	
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

	$('canvas').on('mousemove', CONTROL.onMouseMove)
	$('canvas').on('mousedown', CONTROL.onMouseDown)
	$('canvas').on('mouseup', CONTROL.onMouseUp)

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

				CONTROL.data_processor.ProcessPolycubeAfterNewCube(CONTROL.Load_Polycube_Handler_List[c].my_polycube, CONTROL.Load_Polycube_Handler_List[c].newest_cube)
			}
		}

		requestAnimationFrame(CONTROL.update)
	}

	CONTROL.Switch_Context('edit-context')

	requestAnimationFrame(CONTROL.update)
})