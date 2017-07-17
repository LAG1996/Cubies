var scene_handler = null
var toolbar_handler = null
var p_cube_pick_context = null

var old_mouse_pos = new THREE.Vector2()

var parentHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0xDD0000})
var childrenHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0x001AAA})

var highlights_are_on = false
var junk = []

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
	//scene_handler.SetViewportOffset(0, toolbar_handler.Obj.innerHeight())

	$('#container').on('mousedown', StoreMouseVals)
	$('#container').on('mouseup', HandlePick)
})

function StoreMouseVals(event){
	old_mouse_pos.copy(scene_handler.GetMousePos())
}

function HandlePick() {

	if(old_mouse_pos.distanceTo(scene_handler.GetMousePos()) == 0)
	{
		ClearJunk()
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
				scene_handler.RequestSwitchToPickingScene(p_cube.pick_context)
				var id = scene_handler.Pick()
				scene_handler.SwitchToDefaultPickingScene()

				var data = p_cube.HandlePick(id)
				if(ObjectExists(data))
				{
					if(p_cube.context_name == 'face')
					{
						ShowFaceData(data)
						
					}
					else if(p_cube.context_name == 'hinge')
					{
						ShowEdgeData(data)
					}

					highlights_are_on = true
				}
			}	
		}
		else if(!highlights_are_on)
		{
				PolyCube.SwitchToNewActive(null)
				toolbar_handler.Switch_Context_H('world-context')	
		}
		else
		{
			highlights_are_on = false
		}
	}
}

function ShowFaceData(data){
	var parentHighlight = Cube.highlightFace.clone()
	parentHighlight.position.copy(data["parent"]['face'].getWorldPosition())
	parentHighlight.rotation.copy(data["parent"]['face'].getWorldRotation())

	junk.push(parentHighlight)

	var index = 0
	var childrenHighlight = []
	for(var faceName in data["children"])
	{
		childrenHighlight[index] = Cube.highlightFace.clone()
		childrenHighlight[index].position.copy(data["children"][faceName]["face"].getWorldPosition())
		childrenHighlight[index].rotation.copy(data["children"][faceName]["face"].getWorldRotation())
		junk.push(childrenHighlight[index])
		index++
	}

	for(var partNum = 0; partNum < parentHighlight.children.length; partNum++)
	{
		var part = parentHighlight.children[partNum]
		if(part.name == 'body')
		{
			part.material = parentHighlightMaterial.clone()
		}
		
		scene_handler.RequestAddToScene(parentHighlight)
	}

	for(var index = 0; index < childrenHighlight.length; index++)
	{
		for(var partNum = 0; partNum < childrenHighlight[index].children.length; partNum++)
		{
			var part = childrenHighlight[index].children[partNum]
			if(part.name == 'body')
			{
				part.material = childrenHighlightMaterial.clone()
			}
		}

		scene_handler.RequestAddToScene(childrenHighlight[index])
	}
}

function ShowEdgeData(data){
	var parentHighlight = Cube.highlightEdge.clone()
	parentHighlight.position.copy(data['parent'][0]['edge'].getWorldPosition())
	parentHighlight.rotation.copy(data['parent'][0]['edge'].getWorldRotation())
	parentHighlight.material = parentHighlightMaterial.clone()
	scene_handler.RequestAddToScene(parentHighlight)
	junk.push(parentHighlight)

	var parentHighlight = Cube.highlightEdge.clone()
	parentHighlight.position.copy(data['parent'][1]['edge'].getWorldPosition())
	parentHighlight.rotation.copy(data['parent'][1]['edge'].getWorldRotation())
	parentHighlight.material = parentHighlightMaterial.clone()
	scene_handler.RequestAddToScene(parentHighlight)
	junk.push(parentHighlight)

	var index = 0
	var childrenHighlight = []
	for(var N in data['children'])
	{
		childrenHighlight[index] = Cube.highlightEdge.clone()
		childrenHighlight[index].position.copy(data["children"][N]['edge'].getWorldPosition())
		childrenHighlight[index].rotation.copy(data["children"][N]['edge'].getWorldRotation())
		childrenHighlight[index].material = childrenHighlightMaterial.clone()
		junk.push(childrenHighlight[index])
		scene_handler.RequestAddToScene(childrenHighlight[index])
		index++
	}
}

function ClearJunk(){
	for(var i = 0; i < junk.length; i++)
	{
		scene_handler.RequestRemoveFromScene(junk[i])
		delete junk[i]
	}
	junk = []
}