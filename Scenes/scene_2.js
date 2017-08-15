var SCENE
var highlight_color_1 = new THREE.Color(0xFF0000)
var highlight_color_2 = new THREE.Color(0x0000FF)

$(document).ready(function(){
	
	var scene_handler = new SceneHandler()

	SCENE = new Scene(scene_handler)

	//Dynamically add some variables so that we can manipulate the scene more freely
	SCENE.toolbar_handler = new Toolbar_Handler(scene_handler)
	SCENE.toolbar_handler.Switch_Context_H('edit-context')

	SCENE.current_context = SCENE.toolbar_handler.context

	SCENE.pick_mode = 'poly'

	SCENE.junk = []
	SCENE.ClearJunk = function(){

		for(var index = 0; index < SCENE.junk.length; index++)
		{
			SCENE.scene_handler.RequestRemoveFromScene(SCENE.junk[index])
			delete SCENE.junk[index]
		}

		SCENE.junk = []
	}

	requestAnimationFrame(MouseHover)

	$('#canvas').on('mousedown', MouseClick)
	$("#canvas").on('mouseup', MouseUp)
})

function MouseHover()
{
	if(ObjectExists(SCENE.current_poly) && $("#poly_cube_options_"+SCENE.current_poly.context_name).is(":visible"))
	{
		if(SCENE.scene_handler.GetMousePos().distanceTo(SCENE.toolbar_handler.options_dialogue_pos) > 150)
		{
			$('.poly_cube_options').hide()
		}
	}
	else
	{
		SCENE.ClearJunk()
	
		var id = SCENE.HandlePick()
	
		var mouse_pos = SCENE.scene_handler.GetMousePos()
	
		$('#poly_cube_name_only').css("top", "" + mouse_pos.y + "px")
		$('#poly_cube_name_only').css("left", "" + (mouse_pos.x + 10) + "px")
	
		if(SCENE.current_context == 'edit-context' && !$('#poly_cube_options').is(":visible"))
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
							}
							else
							{
								$(".tooltip_text_1").text(package['parent'].name)
							}
	
							$("#polycube_part").show()
	
							HighlightParts(package['parent'], highlight_color_1, p_cube.context_name)
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

	requestAnimationFrame(MouseHover)
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
		if(SCENE.click_mouse_pos.equals(SCENE.scene_handler.GetMousePos()) && !SCENE.just_switch_active && !ObjectExists(SCENE.current_poly))
			PostMessage(['SWITCH_ACTIVE_POLYCUBE', null])
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

	if(SCENE.current_context == 'edit-context')
	{
		if(ObjectExists(SCENE.current_poly))
		{
			var p_cube = SCENE.current_poly

			if(!ObjectExists(PolyCube.Active_Polycube) || PolyCube.Active_Polycube.name != p_cube.name)
			{
				PostMessage(['SWITCH_ACTIVE_POLYCUBE', p_cube.name])
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

function HighlightParts(package, color, context)
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

			var h = highlight.clone()
			PostMessage(['ADD_TO_SCENE', SCENE.scene_handler, h])
			SCENE.junk.push(h)
		}
	}
	else
	{
		var part = ObjectExists(package.face) ? package.face : package.edge

		highlight.position.copy(part.getWorldPosition())
		highlight.rotation.copy(part.getWorldRotation())

		var h = highlight.clone()
		PostMessage(['ADD_TO_SCENE', SCENE.scene_handler, h])
		SCENE.junk.push(h)
	}
}