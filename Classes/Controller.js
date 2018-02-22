function Controller(){
	this.scene_handler = new SceneHandler()
	this.toolbar_handler = new Toolbar_Handler(this)
	this.visualizer = new PolycubeDataVisualizer(Cube_Template.new_cube, Arrow_Template.arrow)
	
	if(!this.toolbar_handler.tutorial_mode)
		this.template_loader = new PolyCubePreview(this)

	//Some helper variables
	this.CLOCK = new THREE.Clock()
	this.Load_Polycube_Handler_List = []
	this.HingeAnimationQueue = []
	this.mouse_pos = new THREE.Vector2()
	this.old_mouse_pos = new THREE.Vector2()
	this.mouse_delta = 0
	this.accum_mouse_delta = 0
	this.hover_over_poly = null
	this.hover_over_hinge = null
	this.last_hover_over_hinge = null
	this.hover_over_face = null
	this.last_hover_over_face = null
	this.last_hover_over_poly = null
	this.subgraphs = []
	this.active_subgraph = null
	this.face2graph_map = null
	this.add_cube_mode = false
	this.prev_poly_enums = []

	//Keyboard commands
	this.holding_down_shift = false
	this.holding_down_control = false

	this.tape = {'face_1' : null, 'face_2': null}
	
	//Highlights
	this.mouse_over_hinge_highlight = new THREE.Color(0xFFFF00)
	this.prime_highlight = new THREE.Color(0xFF0000)
	this.second_highlight = new THREE.Color(0x0000FF)
	this.cut_highlight = new THREE.Color(0x22EEDD)
	this.hinge_highlight = new THREE.Color(0xAA380F)
	
	//Some picking scenes that we're going to use
	this.scene_handler.picking_scenes["poly_pick"] = new THREE.Scene()
	this.scene_handler.picking_scenes["edge_pick"] = new THREE.Scene()
	this.scene_handler.picking_scenes["face_pick"] = new THREE.Scene()
	this.scene_handler.picking_scenes["arrow_pick"] = new THREE.Scene()
	
	this.scene_handler.view_scenes["main"].add(this.visualizer.arrow_pair)

	this.scene_handler.picking_scenes["arrow_pick"].add(this.visualizer.pick_arrow_pair)
	
	//Some delegate functions
	this.Mouse_Hover_Funcs = []
	this.Mouse_Up_Funcs = []
	this.Mouse_Down_Funcs = []
	
	//Some flags for the controller
	this.context = ''
	this.mouse_down = false
	this.hovering_over_hinge = false
	this.hovering_over_face = false
	this.face_graphs_out = false
	this.arrows_out = false
	
	this.cuts_need_update = false
	this.hinges_need_update = false

	this.Alert_Funcs = {}
	
	this.Alert = function(alert_word){
		this.Alert_Funcs[alert_word](arguments)
	}

	this.Context_Funcs = {'world' : function(){Switch_To_Edit()}, 'poly' : function(){Switch_To_Poly()}}

	var that = this

	this.Switch_Context = function(context_name)
	{
	
		that.toolbar_handler.Switch_Context(context_name, PolyCube.Active_Polycube ? name : "")
	
		that.Context_Funcs[context_name]()
	
	}
	
	//Alert functions for the control to be used by other modules
	this.Alert_Funcs['NEW_POLYCUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		var new_p_cube = PolyCube.GenerateNewPolyCube(args[0], args[1])
		//that.toolbar_handler.AddPolyCubeToObjectView(args[1])
		
		PolyCube.SwitchToNewActive(new_p_cube)
		PolyCube.Active_Polycube.Add_Cube(new THREE.Vector3(0, 0, 0))
	
		that.visualizer.ProcessPolycubeAfterNewCube(new_p_cube, new_p_cube.GetCubeAtPosition(new THREE.Vector3(0, 0, 0)))
	
		VisualizePolycube(new_p_cube)
	
		//that.toolbar_handler.ActivePolyCubeObjectView(new_p_cube.name)
	
		that.Switch_Context('poly')

		if(that.toolbar_handler.tutorial_mode)
		{
			that.toolbar_handler.HandleNextTutorialPart()
		}
	}

	this.Alert_Funcs['ADD_CUBE'] = function(){

		that.toolbar_handler.Switch_Cursor("cell")
		that.add_cube_mode = true
	
	}
	
	this.Alert_Funcs['DESTROY_POLYCUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		var p_cube = ObjectExists(args[0]) ? args[0] : PolyCube.Active_Polycube
	
		if(ObjectExists(p_cube))
		{
			$("#" + p_cube.name + "_data").remove()
	
			that.last_hover_over_poly = null
			that.face_graphs_out = false
			that.visualizer.arrow_pair.visible = false
			that.arrows_out = false
	
	
			that.visualizer.DestroyPolycube(p_cube)
			PolyCube.DestroyPolyCube(p_cube)
		}
	
		that.Switch_Context('world')
	}
	
	this.Alert_Funcs['SAVE_POLYCUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		var p_cube = ObjectExists(args[0]) ? args[0] : PolyCube.Active_Polycube
	
		if(ObjectExists(p_cube))
		{
			saveTextAs(JSON.stringify(p_cube.toJSON()), p_cube.name) //Thank you Eli Grey
		}
	}
	
	this.Alert_Funcs['LOAD_POLYCUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
		var file = args[0]
		var from_server = args[1]


		if(from_server)
		{
			//The file came from the server and was processed by the polycube preview module
			GeneratePolycube(file)
		}
		else
		{
			//The file came from the client and needs to be processed by a file loader.
			LoadDataFromClient(file)
		}
		
		function GeneratePolycube(poly_data)
		{
			let p = PolyCube.GenerateNewPolyCube(new THREE.Vector3(poly_data.position[0], poly_data.position[1], poly_data.position[2]), poly_data.name)
			
			that.Load_Polycube_Handler_List.push(new Cube_Add_Handler(poly_data.cubes, p))
			
			that.visualizer.ProcessPolycube(p)
			
			VisualizePolycube(p)

			PolyCube.SwitchToNewActive(p)
			
			that.Switch_Context('poly')
		}

		function LoadDataFromClient(file)
		{
			//Instantiate a file reader that will read the file specified
			var reader = new FileReader()

			//var that = this
			reader.onload = function(){
				let data = reader.result

				let obj = JSON.parse(data)
			
				//TODO: Verify the file
			
				//The file has been verified. Create a new polycube with all of the specified cubes
				GeneratePolycube(obj)
			}
			reader.onerror = function(){
				data = ""
			}
			reader.onabort = function(){
				data = ""
			}
		
			if(file)
			{
				reader.readAsText(file)
			}
			else
			{
				reader.abort()
			}
		}
	
	}
	
	this.Alert_Funcs['CHANGE_POLY_NAME'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		PolyCube.ChangeName(args[0], args[1])
		args[2].parent().parent().find("#active_toggle").text(args[1])
	
		args[2].parent().attr("id", args[1]+"_data_edit")
		args[2].parent().parent().attr("id", args[1]+"_data")
	
	}
	
	this.Alert_Funcs['SET_ACTIVE_POLY'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
	
		PolyCube.SwitchToNewActive(typeof args[0] == 'string' ? PolyCube.Name2Poly[args[0]] : null)
		
		if(ObjectExists(PolyCube.Active_Polycube))
			this.Switch_Context('poly')
		else
			this.Switch_Context('world')
	
	}

	this.Alert_Funcs['ROTATE_FACE_ROUND_EDGE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)


		PolyCube.Active_Polycube.Rotate_Data(args[0], args[1], args[2], args[3])

	}

	this.Alert_Funcs["SAVE_ENUM"] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)

		console.log("saving the polycube enumeration #" + (args[0] + 2))

	}

	function Switch_To_Edit(){
	
			$('#poly_cube_name_only').hide()
	
	
			PolyCube.SwitchToNewActive(null)
	
	
			that.context = 'world'
	
			that.Mouse_Hover_Funcs = [function(){

				if(that.hover_over_poly)
				{

					var faces = that.hover_over_poly.Get_Faces()

					for(var fName in faces)
					{
						that.visualizer.HighlightObject("face", fName, that.hover_over_poly.id, "dual_half_1")
					}
				}
				else
				{
					if(ObjectExists(that.last_hover_over_poly))
					{
						var faces = that.last_hover_over_poly.Get_Faces()

						for(var fName in faces)
						{
							that.visualizer.UnHighlightObject(that.last_hover_over_poly.id, "face", fName, "dual_half_1")
						}
					}

					//$('#poly_cube_name_only').hide()
				}
	
			}]
	
			that.Mouse_Up_Funcs = [function(){
	
				if(that.accum_mouse_delta <= 10)
				{
					if(that.hover_over_poly)
					{
						PolyCube.SwitchToNewActive(that.hover_over_poly)
	
						//that.toolbar_handler.ActivePolyCubeObjectView(that.hover_over_poly.name)
	
						that.Switch_Context('poly')
	
					}
				}
	
			}]
	
			that.Mouse_Down_Funcs = [function(){
	
			}]
	
		}
	
		function Switch_To_Poly(){
	
			that.context = 'poly'
			$("#mode_text").text($("#mode_text").text() + " " + PolyCube.Active_Polycube.name)
	
			$('#poly_cube_name_only').hide()
	
			if(Object.keys(PolyCube.Active_Polycube.Get_Cuts()).length > 0)
			{
				that.toolbar_handler.DeactivateAddCube()
			}
			else
			{
				that.toolbar_handler.ActivateAddCube()
			}
	
			for(var key in PolyCube.ID2Poly)
			{
				var faces = PolyCube.ID2Poly[key].Get_Faces()

				for(var fName in faces)
				{
					that.visualizer.UnHighlightObject(key, "face", fName, "dual_half_1")
				}
			}
			
			that.Mouse_Hover_Funcs = [function(){
	
				if(!that.face_graphs_out)
				{
					if(ObjectExists(that.last_hover_over_face))
					{
						that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", that.last_hover_over_face.name, "mouse_over_1")
						that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", that.last_hover_over_face.name, "mouse_over_2")
					}
				}

				if(ObjectExists(that.last_hover_over_hinge))
				{
					that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "edge", that.last_hover_over_hinge.name, "mouse_over_1")
					that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "edge", that.last_hover_over_hinge.name, "mouse_over_2")

					if(ObjectExists(that.last_hover_over_hinge.incidentEdge))
					{
						that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "edge", that.last_hover_over_hinge.incidentEdge.name, "mouse_over_1")
						that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "edge", that.last_hover_over_hinge.incidentEdge.name, "mouse_over_2")
					}
				}		
	

				if(!that.hover_over_poly)
					return

				if(PolyCube.Active_Polycube.name != that.hover_over_poly.name)
					return

				var id = that.scene_handler.Pick("edge_pick", that.mouse_pos)
	
				var hinge_name = that.visualizer.Color2Hinge[PolyCube.Active_Polycube.id][id]
	
				if(!ObjectExists(hinge_name))
				{
					that.hovering_over_hinge = false
					that.hover_over_hinge = null
					
					id = that.scene_handler.Pick("face_pick", that.mouse_pos)
	
					var face_name = that.visualizer.Color2Face[PolyCube.Active_Polycube.id][id]
	
					if(ObjectExists(face_name))
					{
						var face = PolyCube.Active_Polycube.Get_Face(face_name)
	
						that.hovering_over_face = true
						that.hover_over_face = face
						that.last_hover_over_face = face
	
						if(!that.face_graphs_out)
						{
							that.visualizer.HighlightObject("face", face.name, PolyCube.Active_Polycube.id, that.holding_down_shift ? "mouse_over_2" : "mouse_over_1")
						}
					}
					else
					{
						that.hover_over_face = null
						that.hovering_over_face = false
					}
				}
				else
				{
					var edge_data = PolyCube.Active_Polycube.Get_Edge(hinge_name)
	
					if(ObjectExists(edge_data.incidentEdge))
					{
						var edge_2_data = edge_data.incidentEdge
						
						that.visualizer.SaveIncidentEdge(edge_2_data.name, PolyCube.Active_Polycube.id, that.holding_down_shift ? "mouse_over_2" : "mouse_over_1")

						that.visualizer.HighlightObject("edge", edge_2_data.name, PolyCube.Active_Polycube.id, that.holding_down_shift ? "mouse_over_2" : "mouse_over_1")
					}
	
					that.hovering_over_hinge = true
					that.hover_over_hinge = edge_data
					that.last_hover_over_hinge = edge_data
					that.visualizer.HighlightObject("edge", edge_data.name, PolyCube.Active_Polycube.id, that.holding_down_shift ? "mouse_over_2" : "mouse_over_1")
				}
				
				if(!that.add_cube_mode)
					that.toolbar_handler.Switch_Cursor("crosshair")

	
			}]
	
			that.Mouse_Up_Funcs = [function(){
	
				if(that.accum_mouse_delta <= 5)
				{
					if(that.arrows_out)
					{
						HandleArrowState()
					}
					else if(that.hovering_over_hinge && !that.add_cube_mode)
					{
						if(that.holding_down_shift)
						{
							HandleHinge()
						}
						else
						{
							HandleCut()
						}
					}
					else if(that.hovering_over_face)
					{
						if(that.add_cube_mode)
						{
							HandleAddCube()

						}
						else if(that.face_graphs_out)
						{
							ShowArrows()
						}
						else if(that.holding_down_shift)
						{
							//The user is going to tape two faces together
							HandleTape()
						}	
					}
					else
					{
						if(that.toolbar_handler.tutorial_mode)
							return

						//that.visualizer.FadeFaces(PolyCube.Active_Polycube.id, .5)
						if(!that.face_graphs_out)
						{
							that.Switch_Context('world')
						}
						else
						{
							var faces = PolyCube.Active_Polycube.Get_Faces()

							for(var fName in faces)
							{
								that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", fName, "dual_half_1")
								that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", fName, "dual_half_2")
	
							}
						}


						that.add_cube_mode = false
						that.face_graphs_out = false
						that.visualizer.arrow_pair.visible = false
						that.arrows_out = false

						
					}
				}
			}]
	
			that.Mouse_Down_Funcs = [function(){				
			}]
		}
		
		function ShowArrows(){

			if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part < that.toolbar_handler.tutorial_data.click_black_arrow)
			that.toolbar_handler.HandleNextTutorialPart()

			var face_name = that.hover_over_face.name

			var subgraph_index = that.face2graph_map[face_name]

			if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.click_white_arrow)
				that.toolbar_handler.tutorial_data.face_graph_clicked_1 = subgraph_index
			if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.click_black_arrow)
				that.toolbar_handler.tutorial_data.face_graph_clicked_2 = subgraph_index


			that.active_subgraph = that.subgraphs[subgraph_index]

			that.visualizer.arrow_pair.visible = true

			var face_data = PolyCube.Active_Polycube.Get_Face_Data(face_name)

			var face_obj = that.visualizer.view_polycubes[PolyCube.Active_Polycube.id].getObjectByName(face_name)

			that.visualizer.arrow_pair.position.copy(face_obj.getWorldPosition())
			that.visualizer.pick_arrow_pair.position.copy(face_obj.getWorldPosition())

			var normal = face_data.normal.clone()

			if(normal.equals(new THREE.Vector3(-1, 0, 0)))
			{
				that.visualizer.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(180))
				that.visualizer.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(180))
			}
			else if(normal.equals(new THREE.Vector3(0, 1, 0)))
			{
				that.visualizer.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(90))
				that.visualizer.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(90))
			}
			else if(normal.equals(new THREE.Vector3(0, -1, 0)))
			{
				that.visualizer.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(-90))
				that.visualizer.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(-90))
			}
			else if(normal.equals(new THREE.Vector3(0, 0, 1)))
			{
				that.visualizer.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(-90))
				that.visualizer.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(-90))
			}
			else if(normal.equals(new THREE.Vector3(0, 0, -1)))
			{
				that.visualizer.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(90))
				that.visualizer.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(90))
			}
			else
			{
				that.visualizer.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), DEG2RAD(90))
				that.visualizer.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), DEG2RAD(90))
			}

			that.arrows_out = true
		}

		function HandleArrowState(){

			let color = that.scene_handler.Pick("arrow_pick", that.mouse_pos)	
						
			if(color == that.visualizer.white_arrow_pick_color)
			{
				if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.click_black_arrow)
					return
				if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.click_white_arrow)
					that.toolbar_handler.HandleNextTutorialPart()

				
				let hinge_data = that.last_hover_over_poly.Get_Edge_Data(that.hinge_to_rotate_around.name)
				let face_data = that.last_hover_over_poly.Get_Face_Data(that.active_subgraph[0].name)

				let cross = new THREE.Vector3().crossVectors(face_data.normal, hinge_data.axis).normalize()

				let dir_from_hinge = new THREE.Vector3().copy(face_data.position)
				dir_from_hinge.sub(new THREE.Vector3().copy(hinge_data.position))
				dir_from_hinge.normalize()

				let rads = cross.equals(dir_from_hinge) ? DEG2RAD(90) : -1*DEG2RAD(90)

				for(var f in that.active_subgraph)
				{
					that.last_hover_over_poly.Rotate_Data(that.hinge_to_rotate_around.name, that.active_subgraph[f].name, rads)
				}

				that.HingeAnimationQueue.push(new HingeAnimationHandler(that.active_subgraph, that.hinge_to_rotate_around, that.last_hover_over_poly, that.visualizer, that, rads, .5))

				that.cuts_need_update = true
				that.hinges_need_update = true
			}
			else if(color == that.visualizer.black_arrow_pick_color)
			{
				if(that.toolbar_handler.tutorial_mode)
				{
					if((that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.click_white_arrow) || that.toolbar_handler.tutorial_data.face_graph_clicked_1 != that.toolbar_handler.tutorial_data.face_graph_clicked_2)
						return
					else if(that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.click_black_arrow)
						that.toolbar_handler.HandleNextTutorialPart()
				} 

				let hinge_data = that.last_hover_over_poly.Get_Edge_Data(that.hinge_to_rotate_around.name)
				let face_data = that.last_hover_over_poly.Get_Face_Data(that.active_subgraph[0].name)

				let cross = new THREE.Vector3().crossVectors(face_data.normal, hinge_data.axis).normalize()

				let dir_from_hinge = new THREE.Vector3().copy(face_data.position)
				dir_from_hinge.sub(new THREE.Vector3().copy(hinge_data.position))
				dir_from_hinge.normalize()

				let rads = cross.equals(dir_from_hinge) ? DEG2RAD(-90) : -1*DEG2RAD(-90)

				for(var f in that.active_subgraph)
				{
					that.last_hover_over_poly.Rotate_Data(that.hinge_to_rotate_around.name, that.active_subgraph[f].name, DEG2RAD(-90))
				}

				that.HingeAnimationQueue.push(new HingeAnimationHandler(that.active_subgraph, that.hinge_to_rotate_around, that.last_hover_over_poly, that.visualizer, that, DEG2RAD(-90), .5))
				
				that.cuts_need_update = true
				that.hinges_need_update = true
			}
			else
			{
				if(that.toolbar_handler.tutorial_mode)
					return

				if(!that.face_graphs_out)
				{
					that.Switch_Context('world')
				}
			}

			var faces = PolyCube.Active_Polycube.Get_Faces()

			for(var fName in faces)
			{
				that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", fName, "dual_half_1")
				that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", fName, "dual_half_2")

			}

			that.face_graphs_out = false
			that.visualizer.arrow_pair.visible = false
			that.arrows_out = false

		}

		function HandleCut(){

			if(that.toolbar_handler.tutorial_mode)
			{
				if(that.toolbar_handler.current_tutorial_part < that.toolbar_handler.tutorial_data.add_cuts_index || that.toolbar_handler.current_tutorial_part >= that.toolbar_handler.tutorial_data.unfold_index)
					return
				else if(that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.add_cuts_index)
					that.toolbar_handler.HandleNextTutorialPart()
			}


			if(!PolyCube.Active_Polycube.Is_Cut(that.hover_over_hinge.name))
				PolyCube.Active_Polycube.Cut_Edge(that.hover_over_hinge.name)

			that.cuts_need_update = true
			that.hinges_need_update = true

		}

		function HandleAddCube(){
			that.add_cube_mode = false

			var face_name = that.hover_over_face.name

			var face_dir = Cube.FaceNameToDirection(face_name)

			var vec = PolyCube.words2directions[face_dir]
			var real_face = that.visualizer.view_polycubes[PolyCube.Active_Polycube.id].getObjectByName(face_name)
			var pos = new THREE.Vector3().addVectors(real_face.position, vec)

			pos.multiplyScalar(.5)

			if(PolyCube.Active_Polycube.Add_Cube(pos))
			{
				if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.add_cube_index)
				{
					that.toolbar_handler.HandleNextTutorialPart()
				}

				that.visualizer.ProcessPolycubeAfterNewCube(PolyCube.Active_Polycube, PolyCube.Active_Polycube.GetCubeAtPosition(pos))
			}

			that.toolbar_handler.Switch_Cursor('pointer')
		}

		function HandleTape(){
			//Save face 1 if there is no face_1
								
			if(!ObjectExists(that.tape.face_1))
				that.tape.face_1 = that.hover_over_face
			else
			{
				//Save face 2
				that.tape.face_2 = that.hover_over_face

				if(that.tape.face_1.name != that.tape.face_2.name)
				{
					var packet = PolyCube.Active_Polycube.Have_Common_Edge(that.tape.face_1.name, that.tape.face_2.name)
					if(packet.common && PolyCube.Active_Polycube.Is_Cut(packet.edge_1.name) && PolyCube.Active_Polycube.Is_Cut(packet.edge_2.name))
					{

						that.tape.face_1.neighbors[that.tape.face_2.name] = that.tape.face_2
						that.tape.face_2.neighbors[that.tape.face_1.name] = that.tape.face_1

						PolyCube.Active_Polycube.Recalculate_Edge_Neighbors(that.tape.face_1.name, that.tape.face_2.name, packet.edge_1.name, packet.edge_2.name)
						
						PolyCube.Active_Polycube.Cut_Edge(packet.edge_1)

						that.cuts_need_update = true
						that.hinges_need_update = true

						if(that.toolbar_handler.tutorial_mode)
							that.toolbar_handler.HandleNextTutorialPart()
					}
				}

				that.tape.face_1 = null
				that.tape.face_2 = null
			}
		}

		function HandleHinge(){

			that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", that.last_hover_over_face.name, "mouse_over_1")
			that.visualizer.UnHighlightObject(PolyCube.Active_Polycube.id, "face", that.last_hover_over_face.name, "mouse_over_2")

			if(that.toolbar_handler.tutorial_mode)
			{
				if(that.toolbar_handler.current_tutorial_part == that.toolbar_handler.tutorial_data.unfold_index + 1)
				{
					that.toolbar_handler.HandleNextTutorialPart()
				}
				else if(that.toolbar_handler.current_tutorial_part != that.toolbar_handler.tutorial_data.click_black_arrow)
				{
					return
				}
			}

			var data = PolyCube.Active_Polycube.Get_Face_Graphs(that.hover_over_hinge.name)
		
			var subgraphs = data['subgraphs']
		
			if(!ObjectExists(subgraphs))
			{
				return
			}
		
			that.face_graphs_out = true
		
			that.subgraphs[0] = subgraphs[0]
			that.subgraphs[1] = subgraphs[1]
			that.hinge_to_rotate_around = that.hover_over_hinge
			that.face2graph_map = data['face2graph_map']

			var obj_1 = that.scene_handler.view_scenes["main"].getObjectByName(subgraphs[0][0].name)
			var obj_2 = that.scene_handler.view_scenes["main"].getObjectByName(subgraphs[1][0].name)
		
			for(var tindex in subgraphs[0])
			{
				var face = subgraphs[0][tindex]
				
				that.visualizer.HighlightObject("face", face.name, PolyCube.Active_Polycube.id, "dual_half_1")
				//HighlightParts(that.scene_handler.view_scenes["main"].getObjectByName(face.name), that.prime_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.scene_handler.view_scenes["main"])
			}
		
			for(var tindex in subgraphs[1])
			{
				var face = subgraphs[1][tindex]
				that.visualizer.HighlightObject("face", face.name, PolyCube.Active_Polycube.id, "dual_half_2")
				//HighlightParts(that.scene_handler.view_scenes["main"].getObjectByName(face.name), that.second_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.scene_handler.view_scenes["main"])
			}
		}

		//Creating mouse functions
		function onMouseMove(event){
			
			that.mouse_pos.x = event.clientX
			that.mouse_pos.y = event.clientY
	
			that.mouse_delta = that.old_mouse_pos.distanceTo(that.mouse_pos)
	
			if(that.mouse_down)
			{	
				that.accum_mouse_delta += that.mouse_delta
			}
			else
			{
				that.accum_mouse_delta = 0
			}
	
			that.old_mouse_pos.copy(that.mouse_pos)
	
			$('#poly_cube_name_only').css("top", "" + that.mouse_pos.y + "px")
			$('#poly_cube_name_only').css("left", "" + (that.mouse_pos.x + 10) + "px")
	
			var id = that.scene_handler.Pick("poly_pick", that.mouse_pos)
	
			var p_cube = PolyCube.ID2Poly[id]

			if(ObjectExists(p_cube))
			{
				that.hover_over_poly = p_cube
				that.last_hover_over_poly = p_cube
			}
			else
			{

				if(!that.add_cube_mode)
					that.toolbar_handler.Switch_Cursor('default')

				that.hover_over_poly = null
				
				that.hovering_over_hinge = false
				that.hover_over_hinge = null
	
				that.hover_over_face = null	
				that.hovering_over_face = false
			}
	
			for(var index in that.Mouse_Hover_Funcs)
			{
				that.Mouse_Hover_Funcs[index]()
			}

			that.scene_handler.VoxelPick(that.mouse_pos)
	
		}
	
		function onMouseDown(event){
	
			that.mouse_down = true
	
			for(var index in that.Mouse_Down_Funcs)
			{
				that.Mouse_Down_Funcs[index]()
			}
	
		}
	
		function onMouseUp(event){
	
			that.mouse_down = false
	
			for(var index in that.Mouse_Up_Funcs)
			{
				that.Mouse_Up_Funcs[index]()
			}
		}

		$(window).on('keydown', function(event){

			if(event.key == "Shift")
			{
				that.holding_down_shift = true
			}

			if(event.key == "Control")
			{
				that.holding_down_control = true
			}

			for(var index in that.Mouse_Hover_Funcs)
			{
				that.Mouse_Hover_Funcs[index]()
			}

		})

		$(window).on("keyup", function(event){

			if(event.key =="Shift")
			{
				that.holding_down_shift = false
			}

			if(event.key == "Control")
			{
				that.holding_down_control = false
			}

			that.tape.face_1 = null
			that.tape.face_2 = null

			for(var index in that.Mouse_Hover_Funcs)
			{
				that.Mouse_Hover_Funcs[index]()
			}

		})
	
		//Utility functions
		function VisualizePolycube(polycube)
		{
	
			that.scene_handler.view_scenes["main"].add(that.visualizer.view_polycubes[polycube.id])
	
			that.scene_handler.picking_scenes["poly_pick"].add(that.visualizer.rotate_pick_polycubes[polycube.id])
	
			that.scene_handler.picking_scenes["edge_pick"].add(that.visualizer.rotate_hinge_polycubes[polycube.id])
	
			that.scene_handler.picking_scenes["face_pick"].add(that.visualizer.rotate_face_polycubes[polycube.id])
		}
	
		function UpdateCuts(polycube, scene)
		{
			if(!ObjectExists(polycube))
				return
			
			var edges = polycube.Get_Edges()

			var cut_exists = false
	
			for(var bindex in edges)
			{
				if(edges[bindex].cut)
				{
					that.visualizer.HighlightObject("edge", edges[bindex].name, polycube.id, "cut")
					cut_exists = true
				}
				else
					that.visualizer.UnHighlightObject(polycube.id, "edge", edges[bindex].name, "cut")
			}

			if(cut_exists)
				that.toolbar_handler.DeactivateAddCube()
			else
				that.toolbar_handler.ActivateAddCube()
		}
	
		function UpdateHinges(polycube, scene)
		{
	
			if(!ObjectExists(polycube))
				return

			var edges = polycube.Get_Edges()
	
			for(var bindex in edges)
			{

				that.visualizer.UnHighlightObject(polycube.id, "edge", edges[bindex].name, "hinge")
			}
	
			var l_hinges = polycube.Get_Rotation_Lines()

			if(that.toolbar_handler.tutorial_mode && that.toolbar_handler.current_tutorial_part < that.toolbar_handler.tutorial_data.unfold_index && l_hinges.length > 0)
			{
				that.toolbar_handler.HandleNextTutorialPart()
			}
	
			for(var lindex in l_hinges)
			{
				var line  = l_hinges[lindex]
				for(var gindex in line)
				{
					
					that.visualizer.HighlightObject("edge", line[gindex].name, polycube.id, "hinge")
					that.visualizer.HighlightObject("edge", line[gindex].incidentEdge.name, polycube.id, "hinge")
				}
			}
		}
	
	
		$('canvas').on('mousemove', onMouseMove)
		$('canvas').on('mousedown', onMouseDown)
		$('canvas').on('mouseup', onMouseUp)
	
		//The update function
		this.update = function(){
	
			let deltaTime = that.CLOCK.getDelta()

			that.scene_handler.Draw("main")
	
			//Load up cubes from any opened files
			for(var c in that.Load_Polycube_Handler_List)
			{
				if(that.Load_Polycube_Handler_List[c].finished)
				{
					delete that.Load_Polycube_Handler_List[c]
				}
				else
				{
					that.Load_Polycube_Handler_List[c].Add_Another_Cube()
	
					if(ObjectExists(that.Load_Polycube_Handler_List[c].newest_cube))
						that.visualizer.ProcessPolycubeAfterNewCube(that.Load_Polycube_Handler_List[c].my_polycube, that.Load_Polycube_Handler_List[c].newest_cube)
				}
			}

			//Continue any animations that are in queue
			for(var h in that.HingeAnimationQueue)
			{
				if(that.HingeAnimationQueue[h].finished)
				{
					delete that.HingeAnimationQueue[h]
				}
				else
				{
					that.HingeAnimationQueue[h].RotateFaces(deltaTime)
				}
			}
			
			if(that.cuts_need_update)
			{
				UpdateCuts(that.last_hover_over_poly, that.scene_handler.view_scenes["main"])
	
				that.cuts_need_update = false			
			}
	
			if(that.hinges_need_update)
			{
				UpdateHinges(that.last_hover_over_poly, that.scene_handler.view_scenes["main"])
	
				that.hinges_need_update = false
			}
			
			requestAnimationFrame(that.update)
		}
}