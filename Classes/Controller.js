function Controller(){
	this.scene_handler = new SceneHandler()
	this.toolbar_handler = new Toolbar_Handler(this)
	this.data_processor = new PolycubeDataVisualizer(Cube_Template.new_cube)
	
	//Some helper variables
	this.Load_Polycube_Handler_List = []
	this.mouse_pos = new THREE.Vector2()
	this.old_mouse_pos = new THREE.Vector2()
	this.mouse_delta = 0
	this.accum_mouse_delta = 0
	this.hover_over_poly = null
	this.hover_over_hinge = null
	this.hover_over_face = null
	this.last_hover_over_poly = null
	this.subgraphs = []
	this.active_subgraph = null
	this.face2graph_map = null

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
	
	//The scenes that the viewer will see
	this.rotate_mode_scene = new THREE.Scene()
	this.rotate_mode_scene.name = "rotate_view"
	
	//Some picking scenes that we're going to use
	this.rotate_mode_poly_cube_picking_scene = new THREE.Scene()
	this.rotate_mode_poly_cube_picking_scene.name = "rotate_poly_pick"
	this.rotate_mode_edge_picking_scene = new THREE.Scene()
	this.rotate_mode_edge_picking_scene.name = "rotate_edge_pick"
	this.rotate_mode_face_picking_scene = new THREE.Scene()
	this.rotate_mode_face_picking_scene.name = "rotate_face_pick"

	this.arrow_pick_scene = new THREE.Scene()
	this.arrow_pick_scene.name = "arrow_pick"
	
	//An object for a pair of arrows
	this.arrow_pair = new THREE.Group()
	this.arrow_1 = Arrow_Template.arrow.clone()

	this.arrow_2 = Arrow_Template.arrow.clone()
	this.arrow_2.children[0].material = new THREE.MeshBasicMaterial({'color':0x000000})
	this.arrow_2.children[1].material = new THREE.MeshBasicMaterial({'color':0xFFFFFF})
	this.arrow_2.children[1].material.side = THREE.BackSide
	this.arrow_2.rotateY(DEG2RAD(180))

	this.arrow_1.position.x += 1.25
	this.arrow_2.position.x -= 1.25

	this.arrow_pair.add(this.arrow_1)
	this.arrow_pair.add(this.arrow_2)
	this.arrow_pair.visible = false
	this.rotate_mode_scene.add(this.arrow_pair)

	this.pick_arrow_pair = this.arrow_pair.clone()
	this.pick_arrow_pair.children[0].children[1].material = new THREE.MeshBasicMaterial({'color' : 0xFF0000})
	this.pick_arrow_pair.children[1].children[1].material = new THREE.MeshBasicMaterial({'color' : 0x00FF00})
	this.pick_arrow_pair.children[0].remove(this.pick_arrow_pair.children[0].children[0])
	this.pick_arrow_pair.children[1].remove(this.pick_arrow_pair.children[1].children[0])
	this.pick_arrow_pair.visible = true
	this.arrow_pick_scene.add(this.pick_arrow_pair)
	
	//this.rotate_arrow_scene.add(this.arrow_1.clone())
	
	//Junk collectors
	this.face_junk = [[]]
	this.edge_junk = [[]]
	
	this.rotate_cut_junk = [[]]
	this.rotate_hinge_junk = [[]]
	
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

	this.Context_Funcs = {'edit-context' : function(){Switch_To_Edit()}, 'poly-context' : function(){Switch_To_Poly()}}

	var that = this

	this.Switch_Context = function(context_name)
	{
	
		that.toolbar_handler.Switch_Context_H(context_name)
	
		that.Context_Funcs[context_name]()
	
	}
	
	//Alert functions for the control
	
	this.Alert_Funcs['NEW_POLYCUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		var new_p_cube = PolyCube.GenerateNewPolyCube(args[0], args[1])
		that.toolbar_handler.AddPolyCubeToObjectView(args[1])
		
		PolyCube.SwitchToNewActive(new_p_cube)
		PolyCube.Active_Polycube.Add_Cube(new THREE.Vector3(0, 0, 0))
	
		that.data_processor.ProcessPolycubeAfterNewCube(new_p_cube, new_p_cube.GetCubeAtPosition(new THREE.Vector3(0, 0, 0)))
	
		VisualizePolycube(new_p_cube)
	
		that.toolbar_handler.ActivePolyCubeObjectView(new_p_cube.name)
	
		CreateTrashCollectors(new_p_cube)
	
		that.Switch_Context('poly-context')
	}
	
	
	this.Alert_Funcs['ADD_CUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		if(!ObjectExists(PolyCube.Active_Polycube))
		{
			throw "Critical error: tried to add cube without an active polycube"
		}
		else
		{
			if(PolyCube.Active_Polycube.Add_Cube(args[0]))
				that.data_processor.ProcessPolycubeAfterNewCube(PolyCube.Active_Polycube, PolyCube.Active_Polycube.GetCubeAtPosition(args[0]))
		}
	}
	
	this.Alert_Funcs['DESTROY_POLYCUBE'] = function(){
	
		var args = Array.prototype.slice.call(arguments[0], 1)
	
		var p_cube = ObjectExists(args[0]) ? args[0] : PolyCube.Active_Polycube
	
		if(ObjectExists(p_cube))
		{
			$("#" + p_cube.name + "_data").remove()
	
			ClearJunk(that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
			ClearJunk(that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
	
	
			UpdateCuts(null, that.rotate_mode_scene, that.rotate_cut_junk[PolyCube.Active_Polycube.id])
	
			UpdateHinges(null, that.rotate_mode_scene, that.rotate_hinge_junk[PolyCube.Active_Polycube.id])
	
	
			that.last_hover_over_poly = null
			that.face_graphs_out = false
			that.arrow_pair.visible = false
			that.arrows_out = false
	
	
			that.data_processor.DestroyPolycube(p_cube)
			PolyCube.DestroyPolyCube(p_cube)
	
		}
	
	
	
		this.Switch_Context('edit-context')
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
	
			that.toolbar_handler.AddPolyCubeToObjectView(p.name)
			that.toolbar_handler.ActivePolyCubeObjectView(p.name)
	
			that.Load_Polycube_Handler_List.push(new Cube_Add_Handler(obj.cubes, p))
	
			that.data_processor.ProcessPolycube(p)
	
			CreateTrashCollectors(p)
	
			VisualizePolycube(p)
			
			this.Switch_Context('poly-context')
	
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
			this.Switch_Context('poly-context')
		else
			this.Switch_Context('edit-context')
	
	}

	this.Alert_Funcs['ROTATE_FACE_ROUND_EDGE'] = function(){

		var args = Array.prototype.slice.call(arguments[0], 1)


		PolyCube.Active_Polycube.Rotate_Data(args[0], args[1], args[2], args[3])

	}

	function Switch_To_Edit(){
	
			$('#poly_cube_name_only').hide()
	
			that.scene_handler.RequestSwitchToScene(that.rotate_mode_scene)
			that.scene_handler.RequestSwitchToPickingScene(that.rotate_mode_poly_cube_picking_scene)
	
			PolyCube.SwitchToNewActive(null)
	
			that.toolbar_handler.ActivePolyCubeObjectView(null)
	
			that.context = 'edit'
	
			that.Mouse_Hover_Funcs = [function(){

				if(ObjectExists(that.last_hover_over_poly))
					ClearJunk(that.face_junk[that.last_hover_over_poly.id], that.rotate_mode_scene)

				if(that.hover_over_poly)
				{
					$('#poly_cube_name_only').show()
					$('.tooltip_text').text("Edit " + that.hover_over_poly.name)

					var faces = that.hover_over_poly.Get_Faces()

					for(var fName in faces)
					{
						HighlightParts(that.rotate_mode_scene.getObjectByName(fName), that.prime_highlight, 'face', that.face_junk[that.hover_over_poly.id], that.rotate_mode_scene)
					}
				}
				else
				{
					$('#poly_cube_name_only').hide()
				}
	
			}]
	
			that.Mouse_Up_Funcs = [function(){
	
				if(that.accum_mouse_delta <= 10)
				{
					if(that.hover_over_poly)
					{
						ClearJunk(that.face_junk[that.last_hover_over_poly.id], that.rotate_mode_scene)

						PolyCube.SwitchToNewActive(that.hover_over_poly)
	
						that.toolbar_handler.ActivePolyCubeObjectView(that.hover_over_poly.name)
	
						that.Switch_Context('poly-context')
	
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
	
			that.scene_handler.RequestSwitchToScene(that.rotate_mode_scene)
			that.scene_handler.SwitchToDefaultPickingScene(that.rotate_mode_poly_cube_picking_scene)
	
			for(var key in PolyCube.ID2Poly)
			{
				ClearJunk(that.face_junk[PolyCube.ID2Poly.id], that.rotate_mode_scene)
			}
			
			that.Mouse_Hover_Funcs = [function(){
	
				if(!that.face_graphs_out)
					ClearJunk(that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)

				if(!that.hover_over_poly)
					return

				if(PolyCube.Active_Polycube.name != that.hover_over_poly.name)
					return

				ClearJunk(that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
	
				that.scene_handler.RequestSwitchToPickingScene(that.rotate_mode_edge_picking_scene)
				var id = that.scene_handler.Pick(that.mouse_pos)
	
				var hinge_name = that.data_processor.Color2Hinge[PolyCube.Active_Polycube.id][id]
	
				if(!ObjectExists(hinge_name))
				{
					that.hovering_over_hinge = false
					that.hover_over_hinge = null
	
					that.scene_handler.RequestSwitchToPickingScene(that.rotate_mode_face_picking_scene)
					id = that.scene_handler.Pick(that.mouse_pos)
	
					var face_name = that.data_processor.Color2Face[PolyCube.Active_Polycube.id][id]
	
					if(ObjectExists(face_name))
					{
						var face = PolyCube.Active_Polycube.Get_Face(face_name)
	
						that.hovering_over_face = true
						that.hover_over_face = face
	
						if(!that.face_graphs_out)
						{
							if(that.holding_down_control)
							{
								for(var n in face.neighbors)
								{
									HighlightParts(that.rotate_mode_scene.getObjectByName(n), that.second_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
								}

								HighlightParts(that.rotate_mode_scene.getObjectByName(face.name), that.prime_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
							}
							else
								HighlightParts(that.rotate_mode_scene.getObjectByName(face.name), that.holding_down_shift ? that.mouse_over_hinge_highlight : that.prime_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
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

						if(that.holding_down_control)
						{
							for(var n in edge_2_data.neighbors)
							{
								HighlightParts(that.rotate_mode_scene.getObjectByName(n), that.second_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
							}

							HighlightParts(that.rotate_mode_scene.getObjectByName(edge_2_data.name), that.prime_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)

						}
						else
							HighlightParts(that.rotate_mode_scene.getObjectByName(edge_2_data.name), that.holding_down_shift ? that.mouse_over_hinge_highlight : that.prime_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
					}
	
					that.hovering_over_hinge = true
					that.hover_over_hinge = that.rotate_mode_scene.getObjectByName(edge_data.name)

					if(that.holding_down_control)
					{
						for(var n in edge_data.neighbors)
						{
							HighlightParts(that.rotate_mode_scene.getObjectByName(n), that.second_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
						}

						HighlightParts(that.rotate_mode_scene.getObjectByName(edge_data.name), that.prime_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)

					}
					else
						HighlightParts(that.rotate_mode_scene.getObjectByName(edge_data.name), that.holding_down_shift ? that.mouse_over_hinge_highlight : that.prime_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)

					HighlightParts(that.rotate_mode_scene.getObjectByName(edge_data.name), that.holding_down_shift ? that.mouse_over_hinge_highlight : that.prime_highlight, 'hinge', that.edge_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
				}
	
			}]
	
			that.Mouse_Up_Funcs = [function(){
	
				if(that.accum_mouse_delta <= 5)
				{
					if(that.arrows_out)
					{
						that.scene_handler.RequestSwitchToPickingScene(that.arrow_pick_scene)
						var color = that.scene_handler.Pick(that.mouse_pos)

						if(color == 0xFF0000)
						{
							that.data_processor.RotateSubGraph(that.active_subgraph, that.hinge_to_rotate_around, that.last_hover_over_poly, DEG2RAD(90), that)

							that.cuts_need_update = true
							that.hinges_need_update = true
						}
						else if(color == 0x00FF00)
						{
							that.data_processor.RotateSubGraph(that.active_subgraph, that.hinge_to_rotate_around, that.last_hover_over_poly, DEG2RAD(-90), that)
							that.cuts_need_update = true
							that.hinges_need_update = true
						}
						else
						{
							if(!that.face_graphs_out)
							{
								that.Switch_Context('edit-context')
							}
						}

						ClearJunk(that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
						that.face_graphs_out = false
						that.arrow_pair.visible = false
						that.arrows_out = false
						that.data_processor.FadeFaces(PolyCube.Active_Polycube.id, .5)

						return
					}

					if(that.hovering_over_hinge)
					{
						if(!that.holding_down_shift)
						{
							if(!PolyCube.Active_Polycube.Is_Cut(that.hover_over_hinge.name))
								PolyCube.Active_Polycube.Cut_Edge(that.hover_over_hinge.name)
		
							that.cuts_need_update = true
							that.hinges_need_update = true
						}
						else if(that.holding_down_shift)
						{
							ClearJunk(that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
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

							var obj_1 = that.rotate_mode_scene.getObjectByName(subgraphs[0][0].name)
							var obj_2 = that.rotate_mode_scene.getObjectByName(subgraphs[1][0].name)
		
							for(var tindex in subgraphs[0])
							{
								var face = subgraphs[0][tindex]
		
								HighlightParts(that.rotate_mode_scene.getObjectByName(face.name), that.prime_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
							}
		
							for(var tindex in subgraphs[1])
							{
								var face = subgraphs[1][tindex]
		
								HighlightParts(that.rotate_mode_scene.getObjectByName(face.name), that.second_highlight, 'face', that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
							}
							
							that.data_processor.FadeFaces(PolyCube.Active_Polycube.id, 0)
						}
					}
					else if(that.hovering_over_face)
					{
						if(that.face_graphs_out)
						{
							//var polycube = that.data_processor.rotate_polycubes[PolyCube.Active_Polycube.id]

							var face_name = that.hover_over_face.name

							var subgraph_index = that.face2graph_map[face_name]

							that.active_subgraph = that.subgraphs[subgraph_index]

							that.arrow_pair.visible = true

							var face_data = PolyCube.Active_Polycube.Get_Face_Data(face_name)

							var face_obj = that.data_processor.rotate_polycubes[PolyCube.Active_Polycube.id].getObjectByName(face_name)

							that.arrow_pair.position.copy(face_obj.getWorldPosition())
							that.pick_arrow_pair.position.copy(face_obj.getWorldPosition())

							var normal = face_data.normal.clone()

							if(normal.equals(new THREE.Vector3(-1, 0, 0)))
							{
								that.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(180))
								that.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(180))
							}
							else if(normal.equals(new THREE.Vector3(0, 1, 0)))
							{
								that.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(90))
								that.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(90))
							}
							else if(normal.equals(new THREE.Vector3(0, -1, 0)))
							{
								that.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(-90))
								that.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(-90))
							}
							else if(normal.equals(new THREE.Vector3(0, 0, 1)))
							{
								that.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(-90))
								that.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(-90))
							}
							else if(normal.equals(new THREE.Vector3(0, 0, -1)))
							{
								that.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(90))
								that.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(90))
							}
							else
							{
								that.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), DEG2RAD(90))
								that.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), DEG2RAD(90))
							}

							that.arrows_out = true

							//ClearJunk(that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
						}
						else if(that.holding_down_shift)
						{
							//The user is going to tape two faces together
							
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
									}
								}

								that.tape.face_1 = null
								that.tape.face_2 = null
							}
						}	
					}
					else
					{
						that.data_processor.FadeFaces(PolyCube.Active_Polycube.id, .5)
						if(!that.face_graphs_out)
						{
							that.Switch_Context('edit-context')
						}
						else
						{
							
							ClearJunk(that.face_junk[PolyCube.Active_Polycube.id], that.rotate_mode_scene)
						}

						that.face_graphs_out = false
						that.arrow_pair.visible = false
						that.arrows_out = false
						
					}
				}
			}]
	
			that.Mouse_Down_Funcs = [function(){				
			}]
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
	
			that.scene_handler.RequestSwitchToPickingScene(that.rotate_mode_poly_cube_picking_scene)
			var id = that.scene_handler.Pick(that.mouse_pos)
	
			var p_cube = PolyCube.ID2Poly[id]

			if(ObjectExists(p_cube))
			{
				that.hover_over_poly = p_cube
				that.last_hover_over_poly = p_cube
			}
			else
			{

				if(ObjectExists(that.hover_over_poly))
				{
					ClearJunk(that.edge_junk[that.hover_over_poly.id], that.rotate_mode_scene)
					ClearJunk(that.face_junk[that.hover_over_poly.id], that.rotate_mode_scene)
				}

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
	
			that.rotate_mode_scene.add(that.data_processor.rotate_polycubes[polycube.id])
	
			that.rotate_mode_poly_cube_picking_scene.add(that.data_processor.rotate_pick_polycubes[polycube.id])
	
			that.rotate_mode_edge_picking_scene.add(that.data_processor.rotate_hinge_polycubes[polycube.id])
	
			that.rotate_mode_face_picking_scene.add(that.data_processor.rotate_face_polycubes[polycube.id])
		}
	
		function UpdateCuts(polycube, scene, junk_collector)
		{
			ClearJunk(junk_collector, scene)
			
			if(!ObjectExists(polycube))
				return
			
			var cuts = polycube.Get_Cuts()
	
			for(var bindex in cuts)
			{
				var edge = scene.getObjectByName(cuts[bindex].name)
	
				HighlightParts(edge, that.cut_highlight, 'hinge', junk_collector, scene)
			}
		}
	
		function UpdateHinges(polycube, scene, junk_collector)
		{
			ClearJunk(junk_collector, scene)
	
			if(!ObjectExists(polycube))
				return
	
			var l_hinges = polycube.Get_Rotation_Lines()
	
			for(var lindex in l_hinges)
			{
				var line  = l_hinges[lindex]
				for(var gindex in line)
				{
					var edge_1 = scene.getObjectByName(line[gindex].name)
	
					var edge_2 = scene.getObjectByName(line[gindex]['incidentEdge'].name)
	
					HighlightParts(edge_1, that.hinge_highlight, 'hinge', junk_collector, scene)
					HighlightParts(edge_2, that.hinge_highlight, 'hinge', junk_collector, scene)
				}
			}
		}
	
		function ClearJunk(junk_collector, scenes)
		{
			for(var jindex in junk_collector)
			{
				if(Array.isArray(scenes))
				{
					for(var windex in scenes)
					{
						scenes[windex].remove(scenes[windex].getObjectById(junk_collector[jindex].id))
					}
				}
				else if(ObjectExists(scenes))
				{
					scenes.remove(scenes.getObjectById(junk_collector[jindex].id))
				}
	
			}
	
			junk_collector = []
		}
	
		function HighlightParts(package, color, context, junk_collector, scenes = null)
		{	
			if(!ObjectExists(package) || !ObjectExists(color) || !ObjectExists(context) || !ObjectExists(junk_collector))
				return
		
			var highlight = context == 'hinge' ? Cube_Template.highlightEdge.clone() : Cube_Template.highlightFace.clone()
		
			highlight.material = new THREE.MeshBasicMaterial()
			highlight.material.color.copy(color)
			highlight.material.transparent = true
			highlight.material.opacity = .5
		
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
								highlight.position.copy(part.getWorldPosition())
								highlight.rotation.copy(part.getWorldRotation())
							}
							else
							{
								highlight.position.copy(scenes[windex].getObjectByName(part.name).getWorldPosition())
								highlight.rotation.copy(scenes[windex].getObjectByName(part.name).getWorldRotation())
							}
							
							var h = highlight.clone()
							h.updateMatrix()
							scenes[windex].add(h)
	
							junk_collector.push(h)
						}
					}
					else if(ObjectExists(scenes))
					{
						highlight.position.copy(part.getWorldPosition())
						highlight.rotation.copy(part.getWorldRotation())
						var h = highlight.clone()
						h.updateMatrix()
						scenes.add(h)
	
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
							that.scene_handler.SwitchToDefaultScene()
	
							highlight.position.copy(part.getWorldPosition())
							highlight.rotation.copy(part.getWorldRotation())
						}
						else
						{
							highlight.position.copy(scenes[windex].getObjectByName(part.name).getWorldPosition())
							highlight.rotation.copy(scenes[windex].getObjectByName(part.name).getWorldRotation())
						}
	
						var h = highlight.clone()
						h.updateMatrix()
						scenes[windex].add(h)
					}
	
					junk_collector.push(h)
				}
				else if(ObjectExists(scenes))
				{
					highlight.position.copy(part.getWorldPosition())
					highlight.rotation.copy(part.getWorldRotation())
	
					var h = highlight.clone()

					h.updateMatrix()
					scenes.add(h)
	
					junk_collector.push(h)
				}		
			}
		}
	
		function CreateTrashCollectors(polycube)
		{
			that.face_junk[polycube.id] = []
	
			that.rotate_hinge_junk[polycube.id] = []
	
			that.rotate_cut_junk[polycube.id] = []
	
			that.edge_junk[polycube.id] = []
		}
	
		$('canvas').on('mousemove', onMouseMove)
		$('canvas').on('mousedown', onMouseDown)
		$('canvas').on('mouseup', onMouseUp)
	
		//The update function
		this.update = function(){
	
			that.scene_handler.Draw()
	
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
						that.data_processor.ProcessPolycubeAfterNewCube(that.Load_Polycube_Handler_List[c].my_polycube, that.Load_Polycube_Handler_List[c].newest_cube)
				}
			}
			
			if(that.cuts_need_update)
			{
				UpdateCuts(that.last_hover_over_poly, that.rotate_mode_scene, that.rotate_cut_junk[that.last_hover_over_poly.id])
	
				cuts_need_update = false			
			}
	
			if(that.hinges_need_update)
			{
				UpdateHinges(that.last_hover_over_poly, that.rotate_mode_scene, that.rotate_hinge_junk[that.last_hover_over_poly.id])
	
				hinges_need_update = false
			}
			
			requestAnimationFrame(that.update)
		}
}