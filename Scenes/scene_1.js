var scene_handler = null
var toolbar_handler = null
var p_cube_pick_context = null

var old_mouse_pos = new THREE.Vector2()

$(document).ready(function(){
	Initialize()
	scene_handler = new SceneHandler()

	var gridHelper = new THREE.GridHelper(1000, 500, 0x0000FF, 0x020202)
	gridHelper.position.y = -1
	gridHelper.position.x = -1
	gridHelper.position.z = -1

	toolbar_handler = new Toolbar_Handler()
	toolbar_handler.Switch_Context_H('world-context')

	scene_handler.RequestAddToScene(gridHelper)
	scene_handler.SetViewportOffset(0, toolbar_handler.Obj.innerHeight())

	$('#container').on('mousedown', StoreMouseVals)
	$('#container').on('mouseup', HandlePick)
})

function StoreMouseVals(event){
	old_mouse_pos.copy(scene_handler.GetMousePos())
}

function HandlePick() {
	var pick_val = scene_handler.Pick()
	var p_cube = PolyCube.ID2Poly[pick_val]

	if(ObjectExists(p_cube))
	{
		if(!ObjectExists(PolyCube.Active_Polycube))
		{
			PolyCube.SwitchToNewActive(p_cube)
			toolbar_handler.Switch_Context_H('poly-context', p_cube)
		}
		else if(p_cube.id != PolyCube.Active_Polycube.id)
		{
			PolyCube.SwitchToNewActive(p_cube)
			toolbar_handler.Switch_Context_H('poly-context', p_cube)
		}
		else
		{
			console.log("Looking at " + p_cube.context_name + " context")
			scene_handler.RequestSwitchToPickingScene(p_cube.pick_context)
			var id = scene_handler.Pick()
			scene_handler.SwitchToDefaultPickingScene()
			p_cube.HandlePick(id)
		}	
	}
	else
	{
		if(old_mouse_pos.distanceTo(scene_handler.GetMousePos()) == 0)
		{
			PolyCube.SwitchToNewActive(null)
			toolbar_handler.Switch_Context_H('world-context')
		}	
	}
}