var CONTROL = new Controller()

$(document).ready(function(){
	var INIT = new Initialize() //Load the cube part models and then initialize the cube class with said models

	var wait_for_int = setInterval(function(){

		if(INIT.flags["IS_COMPLETE"]){

			clearInterval(wait_for_int)

			console.log("Completed loading models")
			FinishInitialization()
		}	
	}, 10)

	function FinishInitialization(){

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
		CONTROL.last_hover_over_poly = null
		CONTROL.subgraphs = []
		CONTROL.active_subgraph = null
		CONTROL.face2graph_map = null

		//Keyboard commands
		CONTROL.holding_down_shift = false
		CONTROL.holding_down_control = false

		CONTROL.tape = {'face_1' : null, 'face_2': null}
	
		//Highlights
		CONTROL.mouse_over_hinge_highlight = new THREE.Color(0xFFFF00)
		CONTROL.prime_highlight = new THREE.Color(0xFF0000)
		CONTROL.second_highlight = new THREE.Color(0x0000FF)
		CONTROL.cut_highlight = new THREE.Color(0x22EEDD)
		CONTROL.hinge_highlight = new THREE.Color(0xAA380F)
	
		//The scenes that the viewer will see
		CONTROL.rotate_mode_scene = new THREE.Scene()
		CONTROL.rotate_mode_scene.name = "rotate_view"
	
		//Some picking scenes that we're going to use
		CONTROL.rotate_mode_poly_cube_picking_scene = new THREE.Scene()
		CONTROL.rotate_mode_poly_cube_picking_scene.name = "rotate_poly_pick"
		CONTROL.rotate_mode_edge_picking_scene = new THREE.Scene()
		CONTROL.rotate_mode_edge_picking_scene.name = "rotate_edge_pick"
		CONTROL.rotate_mode_face_picking_scene = new THREE.Scene()
		CONTROL.rotate_mode_face_picking_scene.name = "rotate_face_pick"

		CONTROL.arrow_pick_scene = new THREE.Scene()
		CONTROL.arrow_pick_scene.name = "arrow_pick"
	
		//An object for a pair of arrows
		CONTROL.arrow_pair = new THREE.Group()
		CONTROL.arrow_1 = Arrow_Template.arrow.clone()

		CONTROL.arrow_2 = Arrow_Template.arrow.clone()
		CONTROL.arrow_2.children[0].material = new THREE.MeshBasicMaterial({'color':0x000000})
		CONTROL.arrow_2.children[1].material = new THREE.MeshBasicMaterial({'color':0xFFFFFF})
		CONTROL.arrow_2.children[1].material.side = THREE.BackSide
		CONTROL.arrow_2.rotateY(DEG2RAD(180))

		CONTROL.arrow_1.position.x += 1.25
		CONTROL.arrow_2.position.x -= 1.25

		CONTROL.arrow_pair.add(CONTROL.arrow_1)
		CONTROL.arrow_pair.add(CONTROL.arrow_2)
		CONTROL.arrow_pair.visible = false
		CONTROL.rotate_mode_scene.add(CONTROL.arrow_pair)

		CONTROL.pick_arrow_pair = CONTROL.arrow_pair.clone()
		CONTROL.pick_arrow_pair.children[0].children[1].material = new THREE.MeshBasicMaterial({'color' : 0xFF0000})
		CONTROL.pick_arrow_pair.children[1].children[1].material = new THREE.MeshBasicMaterial({'color' : 0x00FF00})
		CONTROL.pick_arrow_pair.children[0].remove(CONTROL.pick_arrow_pair.children[0].children[0])
		CONTROL.pick_arrow_pair.children[1].remove(CONTROL.pick_arrow_pair.children[1].children[0])
		CONTROL.pick_arrow_pair.visible = true
		CONTROL.arrow_pick_scene.add(CONTROL.pick_arrow_pair)
	
		//CONTROL.rotate_arrow_scene.add(CONTROL.arrow_1.clone())
	
		//Junk collectors
		CONTROL.face_junk = [[]]
		CONTROL.edit_hinge_junk = [[]]
		CONTROL.edge_junk = [[]]
		CONTROL.edit_cut_junk = [[]]
	
		CONTROL.rotate_cut_junk = [[]]
		CONTROL.rotate_hinge_junk = [[]]
	
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
		CONTROL.arrows_out = false
	
		CONTROL.cuts_need_update = false
		CONTROL.hinges_need_update = false
	
		//Add a grid to the default scene
		var grid = GenerateGrid(100, 2, 0x000000)
		grid.position.y = -1
		grid.add(new THREE.AxisHelper(50))
		CONTROL.rotate_mode_scene.add(grid)
	
		//Create some variables and functions for the polycube class	PolyCube.Rotation_Scene = new Scene()
		PolyCube.Active_Polycube = null
		PolyCube.SwitchToNewActive = function(polycube)
		{
			PolyCube.Active_Polycube = polycube
		}
	
		CONTROL.Switch_To_Edit = function(){
	
			$('#poly_cube_name_only').hide()
	
			CONTROL.scene_handler.RequestSwitchToScene(CONTROL.rotate_mode_scene)
			CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.rotate_mode_poly_cube_picking_scene)
	
			PolyCube.SwitchToNewActive(null)
	
			CONTROL.toolbar_handler.ActivePolyCubeObjectView(null)
	
			CONTROL.context = 'edit'
	
			CONTROL.Mouse_Hover_Funcs = [function(){

				if(ObjectExists(CONTROL.last_hover_over_poly))
					CONTROL.ClearJunk(CONTROL.face_junk[CONTROL.last_hover_over_poly.id], CONTROL.rotate_mode_scene)

				if(CONTROL.hover_over_poly)
				{
					$('#poly_cube_name_only').show()
					$('.tooltip_text').text("Edit " + CONTROL.hover_over_poly.name)

					var faces = CONTROL.hover_over_poly.Get_Faces()

					for(var fName in faces)
					{
						CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(fName), CONTROL.prime_highlight, 'face', CONTROL.face_junk[CONTROL.hover_over_poly.id], CONTROL.rotate_mode_scene)
					}
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
						CONTROL.ClearJunk(CONTROL.face_junk[CONTROL.last_hover_over_poly.id], CONTROL.rotate_mode_scene)

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
	
			CONTROL.scene_handler.RequestSwitchToScene(CONTROL.rotate_mode_scene)
			CONTROL.scene_handler.SwitchToDefaultPickingScene(CONTROL.rotate_mode_poly_cube_picking_scene)
	
			for(var key in PolyCube.ID2Poly)
			{
				CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.ID2Poly.id], CONTROL.rotate_mode_scene)
			}
			
	
			CONTROL.Mouse_Hover_Funcs = [function(){
		
				if(!ObjectExists(PolyCube.Active_Polycube))
				{
					if(ObjectExists(CONTROL.last_hover_over_poly))
						CONTROL.ClearJunk(CONTROL.edge_junk[CONTROL.last_hover_over_poly.id], CONTROL.rotate_mode_scene)
	
					return
				}
				else
				{
					CONTROL.ClearJunk(CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
				}
	
				if(!CONTROL.face_graphs_out)
					CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)

				if(!CONTROL.hover_over_poly)
					return

				if(PolyCube.Active_Polycube.name != CONTROL.hover_over_poly.name)
					return
	
				CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.rotate_mode_edge_picking_scene)
				var id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)
	
				var hinge_name = CONTROL.data_processor.Color2Hinge[PolyCube.Active_Polycube.id][id]
	
				if(!ObjectExists(hinge_name))
				{
					CONTROL.hovering_over_hinge = false
					CONTROL.hover_over_hinge = null
	
					CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.rotate_mode_face_picking_scene)
					id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)
	
					var face_name = CONTROL.data_processor.Color2Face[PolyCube.Active_Polycube.id][id]
	
					if(ObjectExists(face_name))
					{
						var face = PolyCube.Active_Polycube.Get_Face(face_name)
	
						CONTROL.hovering_over_face = true
						CONTROL.hover_over_face = face
	
						if(!CONTROL.face_graphs_out)
						{
							if(CONTROL.holding_down_control)
							{
								for(var n in face.neighbors)
								{
									CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(n), CONTROL.second_highlight, 'face', CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
								}

								CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(face.name), CONTROL.prime_highlight, 'face', CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
							}
							else
								CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(face.name), CONTROL.holding_down_shift ? CONTROL.mouse_over_hinge_highlight : CONTROL.prime_highlight, 'face', CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
						}
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
	
					if(ObjectExists(edge_data.incidentEdge))
					{
						var edge_2_data = edge_data.incidentEdge

						if(CONTROL.holding_down_control)
						{
							for(var n in edge_2_data.neighbors)
							{
								CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(n), CONTROL.second_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
							}

							CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(edge_2_data.name), CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)

						}
						else
							CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(edge_2_data.name), CONTROL.holding_down_shift ? CONTROL.mouse_over_hinge_highlight : CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
					}
	
					CONTROL.hovering_over_hinge = true
					CONTROL.hover_over_hinge = CONTROL.rotate_mode_scene.getObjectByName(edge_data.name)

					if(CONTROL.holding_down_control)
					{
						for(var n in edge_data.neighbors)
						{
							CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(n), CONTROL.second_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
						}

						CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(edge_data.name), CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)

					}
					else
						CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(edge_data.name), CONTROL.holding_down_shift ? CONTROL.mouse_over_hinge_highlight : CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)

					CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(edge_data.name), CONTROL.holding_down_shift ? CONTROL.mouse_over_hinge_highlight : CONTROL.prime_highlight, 'hinge', CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
				}
	
			}]
	
			CONTROL.Mouse_Up_Funcs = [function(){
	
				if(CONTROL.accum_mouse_delta <= 5)
				{
					if(CONTROL.arrows_out)
					{
						CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.arrow_pick_scene)
						var color = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)

						if(color == 0xFF0000)
						{
							CONTROL.data_processor.RotateSubGraph(CONTROL.active_subgraph, CONTROL.hinge_to_rotate_around, CONTROL.last_hover_over_poly, DEG2RAD(90), CONTROL)

							CONTROL.cuts_need_update = true
							CONTROL.hinges_need_update = true
						}
						else if(color == 0x00FF00)
						{
							CONTROL.data_processor.RotateSubGraph(CONTROL.active_subgraph, CONTROL.hinge_to_rotate_around, CONTROL.last_hover_over_poly, DEG2RAD(-90), CONTROL)
							CONTROL.cuts_need_update = true
							CONTROL.hinges_need_update = true
						}
						else
						{
							if(!CONTROL.face_graphs_out)
							{
								CONTROL.Switch_Context('edit-context')
							}
						}

						CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
						CONTROL.face_graphs_out = false
						CONTROL.arrow_pair.visible = false
						CONTROL.arrows_out = false
						CONTROL.data_processor.FadeFaces(PolyCube.Active_Polycube.id, .5)

						return
					}

					if(CONTROL.hovering_over_hinge)
					{
						if(!CONTROL.holding_down_shift)
						{
							if(!PolyCube.Active_Polycube.Is_Cut(CONTROL.hover_over_hinge.name))
								PolyCube.Active_Polycube.Cut_Edge(CONTROL.hover_over_hinge.name)
							//if(PolyCube.Active_Polycube.Cut_Edge(CONTROL.hover_over_hinge.name))
								//CONTROL.ResetRotationPolycubes(PolyCube.Active_Polycube)
		
							CONTROL.cuts_need_update = true
							CONTROL.hinges_need_update = true
						}
						else if(CONTROL.holding_down_shift)
						{
							CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
							var data = PolyCube.Active_Polycube.Get_Face_Graphs(CONTROL.hover_over_hinge.name)
		
							var subgraphs = data['subgraphs']
		
							if(!ObjectExists(subgraphs))
							{
								return
							}
		
							CONTROL.face_graphs_out = true
		
							CONTROL.subgraphs[0] = subgraphs[0]
							CONTROL.subgraphs[1] = subgraphs[1]
							CONTROL.hinge_to_rotate_around = CONTROL.hover_over_hinge
							CONTROL.face2graph_map = data['face2graph_map']

							var obj_1 = CONTROL.rotate_mode_scene.getObjectByName(subgraphs[0][0].name)
							var obj_2 = CONTROL.rotate_mode_scene.getObjectByName(subgraphs[1][0].name)
		
							for(var tindex in subgraphs[0])
							{
								var face = subgraphs[0][tindex]
		
								CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(face.name), CONTROL.prime_highlight, 'face', CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
							}
		
							for(var tindex in subgraphs[1])
							{
								var face = subgraphs[1][tindex]
		
								CONTROL.HighlightParts(CONTROL.rotate_mode_scene.getObjectByName(face.name), CONTROL.second_highlight, 'face', CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
							}
							
							CONTROL.data_processor.FadeFaces(PolyCube.Active_Polycube.id, 0)
						}
					}
					else if(CONTROL.hovering_over_face)
					{
						if(CONTROL.face_graphs_out)
						{
							//var polycube = CONTROL.data_processor.rotate_polycubes[PolyCube.Active_Polycube.id]

							var face_name = CONTROL.hover_over_face.name

							var subgraph_index = CONTROL.face2graph_map[face_name]

							CONTROL.active_subgraph = CONTROL.subgraphs[subgraph_index]

							CONTROL.arrow_pair.visible = true

							var face_data = PolyCube.Active_Polycube.Get_Face_Data(face_name)

							var face_obj = CONTROL.data_processor.rotate_polycubes[PolyCube.Active_Polycube.id].getObjectByName(face_name)

							CONTROL.arrow_pair.position.copy(face_obj.getWorldPosition())
							CONTROL.pick_arrow_pair.position.copy(face_obj.getWorldPosition())

							var normal = face_data.normal.clone()

							if(normal.equals(new THREE.Vector3(-1, 0, 0)))
							{
								CONTROL.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(180))
								CONTROL.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(180))
							}
							else if(normal.equals(new THREE.Vector3(0, 1, 0)))
							{
								CONTROL.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(90))
								CONTROL.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(90))
							}
							else if(normal.equals(new THREE.Vector3(0, -1, 0)))
							{
								CONTROL.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(-90))
								CONTROL.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), DEG2RAD(-90))
							}
							else if(normal.equals(new THREE.Vector3(0, 0, 1)))
							{
								CONTROL.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(-90))
								CONTROL.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(-90))
							}
							else if(normal.equals(new THREE.Vector3(0, 0, -1)))
							{
								CONTROL.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(90))
								CONTROL.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), DEG2RAD(90))
							}
							else
							{
								CONTROL.pick_arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), DEG2RAD(90))
								CONTROL.arrow_pair.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), DEG2RAD(90))
							}

							CONTROL.arrows_out = true

							//CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
						}
						else if(CONTROL.holding_down_shift)
						{
							//The user is going to tape two faces together
							
							//Save face 1 if there is no face_1
								
							if(!ObjectExists(CONTROL.tape.face_1))
								CONTROL.tape.face_1 = CONTROL.hover_over_face
							else
							{
								//Save face 2
								CONTROL.tape.face_2 = CONTROL.hover_over_face

								if(CONTROL.tape.face_1.name != CONTROL.tape.face_2.name)
								{
									var packet = PolyCube.Active_Polycube.Have_Common_Edge(CONTROL.tape.face_1.name, CONTROL.tape.face_2.name)
									if(packet.common && PolyCube.Active_Polycube.Is_Cut(packet.edge_1) && PolyCube.Active_Polycube.Is_Cut(packet.edge_2))
									{

										CONTROL.tape.face_1.neighbors[CONTROL.tape.face_2.name] = CONTROL.tape.face_2
										CONTROL.tape.face_2.neighbors[CONTROL.tape.face_1.name] = CONTROL.tape.face_1

										PolyCube.Active_Polycube.Recalculate_Edge_Neighbors(CONTROL.tape.face_1.name, CONTROL.tape.face_2.name)
										
										PolyCube.Active_Polycube.Cut_Edge(packet.edge_1)

										CONTROL.cuts_need_update = true
										CONTROL.hinges_need_update = true
									}
								}

								CONTROL.tape.face_1 = null
								CONTROL.tape.face_2 = null
							}
						}	
					}
					else
					{
						CONTROL.data_processor.FadeFaces(PolyCube.Active_Polycube.id, .5)
						if(!CONTROL.face_graphs_out)
						{
							CONTROL.Switch_Context('edit-context')
						}
						else
						{
							
							CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
						}

						CONTROL.face_graphs_out = false
						CONTROL.arrow_pair.visible = false
						CONTROL.arrows_out = false
						
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
	
		CONTROL.Alert_Funcs['RESET_ROTATIONS'] = function(){
			var args = Array.prototype.slice.call(arguments[0], 1)
	
			CONTROL.ResetRotationPolycubes(args[0])
		}
	
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
	
			CONTROL.CreateTrashCollectors(new_p_cube)
	
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
				if(PolyCube.Active_Polycube.Add_Cube(args[0]))
					CONTROL.data_processor.ProcessPolycubeAfterNewCube(PolyCube.Active_Polycube, PolyCube.Active_Polycube.GetCubeAtPosition(args[0]))
			}
		}
	
		CONTROL.Alert_Funcs['DESTROY_POLYCUBE'] = function(){
	
			var args = Array.prototype.slice.call(arguments[0], 1)
	
			var p_cube = ObjectExists(args[0]) ? args[0] : PolyCube.Active_Polycube
	
			if(ObjectExists(p_cube))
			{
				$("#" + p_cube.name + "_data").remove()
	
				CONTROL.ClearJunk(CONTROL.edge_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
				CONTROL.ClearJunk(CONTROL.face_junk[PolyCube.Active_Polycube.id], CONTROL.rotate_mode_scene)
	
	
				CONTROL.UpdateCuts(null, CONTROL.rotate_mode_scene, CONTROL.rotate_cut_junk[PolyCube.Active_Polycube.id])
	
				CONTROL.UpdateHinges(null, CONTROL.rotate_mode_scene, CONTROL.rotate_hinge_junk[PolyCube.Active_Polycube.id])
	
	
				CONTROL.last_hover_over_poly = null
				CONTROL.face_graphs_out = false
				CONTROL.arrow_pair.visible = false
				CONTROL.arrows_out = false
	
	
				CONTROL.data_processor.DestroyPolycube(p_cube)
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
	
				CONTROL.CreateTrashCollectors(p)
	
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

		CONTROL.Alert_Funcs['ROTATE_FACE_ROUND_EDGE'] = function(){

			var args = Array.prototype.slice.call(arguments[0], 1)


			PolyCube.Active_Polycube.Rotate_Data(args[0], args[1], args[2], args[3])

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
	
	
			CONTROL.scene_handler.RequestSwitchToPickingScene(CONTROL.rotate_mode_poly_cube_picking_scene)
			var id = CONTROL.scene_handler.Pick(CONTROL.mouse_pos)
	
			var p_cube = PolyCube.ID2Poly[id]
			if(ObjectExists(p_cube))
			{
				CONTROL.hover_over_poly = p_cube
				CONTROL.last_hover_over_poly = p_cube
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

		$(window).on('keydown', function(event){

			if(event.key == "Shift")
			{
				CONTROL.holding_down_shift = true
			}

			if(event.key == "Control")
			{
				CONTROL.holding_down_control = true
			}

			for(var index in CONTROL.Mouse_Hover_Funcs)
			{
				CONTROL.Mouse_Hover_Funcs[index]()
			}

		})

		$(window).on("keyup", function(event){

			if(event.key =="Shift")
			{
				CONTROL.holding_down_shift = false
			}

			if(event.key == "Control")
			{
				CONTROL.holding_down_control = false
			}

			CONTROL.tape.face_1 = null
			CONTROL.tape.face_2 = null

			for(var index in CONTROL.Mouse_Hover_Funcs)
			{
				CONTROL.Mouse_Hover_Funcs[index]()
			}

		})
	
		//Utility functions
		CONTROL.ResetRotationPolycubes = function(polycube)
		{
			//CONTROL.FaceName2SubGraphObjects[polycube.id] = {}
	
			CONTROL.rotate_mode_scene.remove(CONTROL.data_processor.rotate_polycubes[polycube.id])		
			CONTROL.rotate_mode_poly_cube_picking_scene.remove(CONTROL.data_processor.rotate_pick_polycubes[polycube.id])
			CONTROL.rotate_mode_edge_picking_scene.remove(CONTROL.data_processor.rotate_hinge_polycubes[polycube.id])
			CONTROL.rotate_mode_face_picking_scene.remove(CONTROL.data_processor.rotate_face_polycubes[polycube.id])
	
			CONTROL.data_processor.ResetRotationPolycube(polycube)
	
			CONTROL.rotate_mode_scene.add(CONTROL.data_processor.rotate_polycubes[polycube.id])		
			CONTROL.rotate_mode_poly_cube_picking_scene.add(CONTROL.data_processor.rotate_pick_polycubes[polycube.id])
			CONTROL.rotate_mode_edge_picking_scene.add(CONTROL.data_processor.rotate_hinge_polycubes[polycube.id])
			CONTROL.rotate_mode_face_picking_scene.add(CONTROL.data_processor.rotate_face_polycubes[polycube.id])

			polycube.Reset_Data()
		}
	
		CONTROL.VisualizePolycube = function(polycube)
		{
	
			CONTROL.rotate_mode_scene.add(CONTROL.data_processor.rotate_polycubes[polycube.id])
	
			CONTROL.rotate_mode_poly_cube_picking_scene.add(CONTROL.data_processor.rotate_pick_polycubes[polycube.id])
	
			CONTROL.rotate_mode_edge_picking_scene.add(CONTROL.data_processor.rotate_hinge_polycubes[polycube.id])
	
			CONTROL.rotate_mode_face_picking_scene.add(CONTROL.data_processor.rotate_face_polycubes[polycube.id])
		}
	
		CONTROL.UpdateCuts = function(polycube, scene, junk_collector)
		{
			CONTROL.ClearJunk(junk_collector, scene)
			
			if(!ObjectExists(polycube))
				return
			
			var cuts = polycube.Get_Cuts()
	
			for(var bindex in cuts)
			{
				var edge = scene.getObjectByName(cuts[bindex].name)
	
				CONTROL.HighlightParts(edge, CONTROL.cut_highlight, 'hinge', junk_collector, scene)
			}
		}
	
		CONTROL.UpdateHinges = function(polycube, scene, junk_collector)
		{
			CONTROL.ClearJunk(junk_collector, scene)
	
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
	
					CONTROL.HighlightParts(edge_1, CONTROL.hinge_highlight, 'hinge', junk_collector, scene)
					CONTROL.HighlightParts(edge_2, CONTROL.hinge_highlight, 'hinge', junk_collector, scene)
				}
			}
		}
	
		CONTROL.ClearJunk = function(junk_collector, scenes)
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
	
		CONTROL.HighlightParts = function(package, color, context, junk_collector, scenes = null)
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
							CONTROL.scene_handler.SwitchToDefaultScene()
	
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
	
		CONTROL.CreateTrashCollectors = function(polycube)
		{
			CONTROL.face_junk[polycube.id] = []
	
			CONTROL.edit_hinge_junk[polycube.id] = []
	
			CONTROL.edit_cut_junk[polycube.id] = []
	
			CONTROL.rotate_hinge_junk[polycube.id] = []
	
			CONTROL.rotate_cut_junk[polycube.id] = []
	
			CONTROL.edge_junk[polycube.id] = []
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
				console.log("loading cubes")
				if(CONTROL.Load_Polycube_Handler_List[c].finished)
				{
					delete CONTROL.Load_Polycube_Handler_List[c]
				}
				else
				{
					CONTROL.Load_Polycube_Handler_List[c].Add_Another_Cube()
	
					if(ObjectExists(CONTROL.Load_Polycube_Handler_List[c].newest_cube))
						CONTROL.data_processor.ProcessPolycubeAfterNewCube(CONTROL.Load_Polycube_Handler_List[c].my_polycube, CONTROL.Load_Polycube_Handler_List[c].newest_cube)
				}
			}
			
			if(CONTROL.cuts_need_update)
			{
				CONTROL.UpdateCuts(CONTROL.last_hover_over_poly, CONTROL.rotate_mode_scene, CONTROL.rotate_cut_junk[CONTROL.last_hover_over_poly.id])
	
				CONTROL.cuts_need_update = false			
			}
	
			if(CONTROL.hinges_need_update)
			{
				CONTROL.UpdateHinges(CONTROL.last_hover_over_poly, CONTROL.rotate_mode_scene, CONTROL.rotate_hinge_junk[CONTROL.last_hover_over_poly.id])
	
				CONTROL.hinges_need_update = false
			}
			
			requestAnimationFrame(CONTROL.update)
		}
	
		CONTROL.Switch_Context('edit-context')
	
		requestAnimationFrame(CONTROL.update)
	}
})