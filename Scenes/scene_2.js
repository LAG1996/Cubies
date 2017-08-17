var SCENE

$(document).ready(function(){
	
	var scene_handler = new SceneHandler()

	SCENE = new Scene(scene_handler)

	//Dynamically add some variables so that we can manipulate the scene more freely
	SCENE.toolbar_handler = new Toolbar_Handler(scene_handler)
	SCENE.toolbar_handler.Switch_Context_H('edit-context')

	SCENE.current_context = SCENE.toolbar_handler.context

	SCENE.pick_mode = 'poly'

	SCENE.junk = []
	SCENE.face_graph_junk = []
	SCENE.cut_junk = []
	SCENE.hinge_junk = []

	SCENE.prime_highlight = new THREE.Color(0xFF0000)
	SCENE.second_highlight = new THREE.Color(0x0000FF)
	SCENE.cut_highlight = new THREE.Color(0x22EEDD)
	SCENE.rot_highlight = new THREE.Color(0xAA380F)

	SCENE.ClearJunk = function(trash_collector, scenes = [null]){

		for(var index = 0; index < trash_collector.length; index++)
		{
			if(!Array.isArray(scenes))
			{
				scenes = [scenes]
			}

			for(var bindex in scenes)
			{
				PostUrgentMessage(["REMOVE_FROM_SCENE", this.scene_handler, trash_collector[index], scenes[bindex]])
			}

			delete trash_collector[index]
		}

		trash_collector = []
	}

	//Add some stuff to the scene handler's update function
	SCENE.scene_handler.AddUpdateFunction('draw_cuts', function(){

		if(SCENE.current_context == 'rot-context')
			return

		SCENE.ClearJunk(SCENE.cut_junk, [null])

		for(var p_name in PolyCube.L_Polycubes)
		{
			var p_cube = PolyCube.L_Polycubes[p_name]

			var cuts = p_cube.GetCutEdges()

			for(var kindex in cuts)
			{
				HighlightParts(cuts[kindex], SCENE.cut_highlight, 'hinge', SCENE.cut_junk)
			}
		}
	})

	SCENE.scene_handler.AddUpdateFunction('draw_hinges', function(){

		SCENE.ClearJunk(SCENE.hinge_junk, SCENE.current_context == 'rotate-context' ? [PolyCube.Rotation_Scene] : [null])

		for(var p_name in PolyCube.L_Polycubes)
		{
			var p_cube = PolyCube.L_Polycubes[p_name]

			var rot_lines = p_cube.GetRotationLines()

			for(var kindex in rot_lines)
			{
				for(var windex in rot_lines[kindex])
				{
					HighlightParts(rot_lines[kindex][windex], SCENE.rot_highlight, 'hinge', SCENE.hinge_junk, SCENE.current_context == 'rotate-context' ? [PolyCube.Rotation_Scene] : [null])
					HighlightParts(rot_lines[kindex][windex]['incidentEdge'], SCENE.rot_highlight, 'hinge', SCENE.hinge_junk, SCENE.current_context == 'rotate-context' ? [PolyCube.Rotation_Scene] : [null])
				}
			}
		}
	})

	SCENE.scene_handler.AddUpdateFunction('mouse_hover', function(){
		MouseHover()
	})

	SCENE.scene_handler.AddUpdateFunction('update_context', function(){
		SCENE.current_context = SCENE.toolbar_handler.context
	})

	$('#canvas').on('mousedown', MouseClick)
	$("#canvas").on('mouseup', MouseUp)

	$('#cut_action').on('click', function(){
		PostUrgentMessage(['CUT_EDGE', SCENE.selected_object, SCENE.current_poly])
	})
})

function MouseHover()
{
	if(ObjectExists(SCENE.selected_object) && SCENE.selected_object['cut'])
	{
		$("#cut_action").text("Undo Cut")
	}
	else
		$("#cut_action").text("Cut")

	if(ObjectExists(SCENE.current_poly) && $("#poly_cube_options_"+SCENE.current_poly.context_name).is(":visible"))
	{
		if(SCENE.scene_handler.GetMousePos().distanceTo(SCENE.toolbar_handler.options_dialogue_pos) > 150)
		{
			$('.poly_cube_options').hide()
		}
	}
	else
	{
		SCENE.ClearJunk(SCENE.junk)

		var id = SCENE.HandlePick()
	
		var mouse_pos = SCENE.scene_handler.GetMousePos()
	
		$('#poly_cube_name_only').css("top", "" + mouse_pos.y + "px")
		$('#poly_cube_name_only').css("left", "" + (mouse_pos.x + 10) + "px")
	
		if((SCENE.current_context == 'edit-context' || SCENE.current_context == 'poly-context') && !$('#poly_cube_options').is(":visible"))
		{
			if(id != SCENE.scene_handler.background_color.getHex())
			{
				var p_cube = PolyCube.ID2Poly[id]
	
				SCENE.current_poly = p_cube
	
				if(ObjectExists(PolyCube.ID2Poly[id]))
				{
					$('#poly_cube_name_only').show()
					$('.tooltip_text').text("" + p_cube.name)
	
					if(ObjectExists(PolyCube.Active_Polycube) && p_cube.name == PolyCube.Active_Polycube.name)
					{
						id = SCENE.HandlePick(p_cube.pick_context)
						var package = p_cube.HandlePick(id)
	
						if(ObjectExists(package))
						{
							if(Array.isArray(package['parent']))
							{
								$(".tooltip_text_1").text(package['parent'][0].name + ' | ' + package['parent'][1].name)
								SCENE.selected_object = package['parent'][0]
							}
							else
							{
								$(".tooltip_text_1").text(package['parent'].name)
								SCENE.selected_object = package['parent']
							}
	
							$("#polycube_part").show()
	
							HighlightParts(package['parent'], SCENE.prime_highlight, p_cube.context_name, SCENE.junk)
						}
						else
						{
							$("#polycube_part").hide()
						}
					}
					else
					{
						$("#polycube_part").hide()
					}
				}
			}
			else
			{
				SCENE.current_poly = null
				$('#poly_cube_name_only').hide()
			}
		}
	}
}

function MouseClick(event)
{
	var btn = event.button

	SCENE.click_mouse_pos = new THREE.Vector2().copy(SCENE.scene_handler.GetMousePos())

	if(btn == 0)
		OnLeftMouseClick()
	else if(btn == 2)
		OnRightMouseClick_1()
}

function MouseUp(event)
{
	if(!ObjectExists(SCENE.click_mouse_pos))
		return

	var btn = event.button

	if(btn == 0)
	{
		if(SCENE.current_context != "rotate-context" && SCENE.click_mouse_pos.equals(SCENE.scene_handler.GetMousePos()) && !SCENE.just_switch_active && !ObjectExists(SCENE.current_poly))
			PostMessage(['SWITCH_ACTIVE_POLYCUBE', null, SCENE.toolbar_handler])
	}
	else if(btn == 2)
	{
		if(SCENE.click_mouse_pos.equals(SCENE.scene_handler.GetMousePos()))
		{
			if(ObjectExists(SCENE.current_poly))
				OnRightMouseClick_2()
			else
				OnRightMouseClick_3()
		}

		SCENE.right_click_1 = false
	}
}

function OnLeftMouseClick(){
	$(".mouse_tooltip").hide()

	SCENE.just_switch_active = false

	if((SCENE.current_context == 'edit-context' || SCENE.current_context == 'poly-context'))
	{
		if(ObjectExists(SCENE.current_poly))
		{
			var p_cube = SCENE.current_poly

			if(!ObjectExists(PolyCube.Active_Polycube) || PolyCube.Active_Polycube.name != p_cube.name)
			{
				PostMessage(['SWITCH_ACTIVE_POLYCUBE', p_cube.name, SCENE.toolbar_handler])
				SCENE.just_switch_active = true
			}
			else
			{
				if(p_cube.context_name == 'face')
				{
					console.log("face")
				}
				else if(p_cube.context_name == 'hinge')
				{
					console.log("hinge")
				}
			}
		}
	}
}

function OnRightMouseClick_1(){
	SCENE.right_click_1 = true
	SCENE.click_mouse_pos = new THREE.Vector2().copy(SCENE.scene_handler.GetMousePos())
}

function OnRightMouseClick_2(){
	if(!SCENE.right_click_1)
		return

	$("#poly_cube_name_only").hide()

	var mouse_pos = SCENE.scene_handler.GetMousePos()

	SCENE.toolbar_handler.options_dialogue_pos = new THREE.Vector3(mouse_pos.x + 10, mouse_pos.y)

	$('.poly_cube_options').css("top", "" + SCENE.toolbar_handler.options_dialogue_pos.y + "px")
	$('.poly_cube_options').css("left", "" + SCENE.toolbar_handler.options_dialogue_pos.x + "px")

	$('#poly_cube_options_' + SCENE.current_poly.context_name).show()
}

function OnRightMouseClick_3(){
	if(!SCENE.right_click_1)
		return
}

function HighlightParts(package, color, context, junk_collector, scenes = [null])
{
	var highlight = context == 'hinge' ? Cube.highlightEdge.clone() : Cube.highlightFace.clone()

	highlight.material = new THREE.MeshBasicMaterial()
	highlight.material.color.copy(color)

	if(Array.isArray(package))
	{
		for(var index = 0; index < package.length; index++)
		{
			var part = ObjectExists(package[index].face) ? package[index].face : package[index].edge

			highlight.position.copy(part.getWorldPosition())
			highlight.rotation.copy(part.getWorldRotation())

			if(!Array.isArray(scenes))
			{
				scenes = [scenes]
			}

			for(var rindex in scenes)
			{
				var h = highlight.clone()
				PostUrgentMessage(['ADD_TO_SCENE', SCENE.scene_handler, h, scenes[rindex]])
			}
			

			junk_collector.push(h)
		}
	}
	else
	{
		var part = ObjectExists(package.face) ? package.face : package.edge

		highlight.position.copy(part.getWorldPosition())
		highlight.rotation.copy(part.getWorldRotation())

		if(!Array.isArray(scenes))
		{
			scenes = [scenes]
		}

		for(var rindex in scenes)
		{
			var h = highlight.clone()
			PostUrgentMessage(['ADD_TO_SCENE', SCENE.scene_handler, h, scenes[rindex]])
		}

		junk_collector.push(h)
	}
}