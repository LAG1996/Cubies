var scene_handler = null
var toolbar_handler = null
var p_cube_pick_context = null

var old_mouse_pos = new THREE.Vector2()

var parentHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0xDD0000})
var childrenHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0x001AAA})
var cutEdgeHighlightMaterial = new THREE.MeshBasicMaterial({'color':0xFFFF00})
var invalidEdgeHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0xAAAAAA})

var highlights_are_on = false
var pick_mode = 'nada'
var junk = []
var edge_junk = []
var cut_edges = {}
var invalid_cut_edges = {}

$(document).ready(function(){
	Initialize() //Load the cube part models and then initialize the cube class with said models
	scene_handler = new SceneHandler() //Initialize the scene

	//Add a grid to the scene so we can orient ourselves
	var gridHelper = new THREE.GridHelper(1000, 500, 0x0000FF, 0x020202)
	gridHelper.position.y = -1
	gridHelper.position.x = -1
	gridHelper.position.z = -1
	scene_handler.RequestAddToScene(gridHelper)

	//Add the toolbars and their functionality
	toolbar_handler = new Toolbar_Handler()
	toolbar_handler.Switch_Context_H('world-context')

	//Add a couple of events that'll help in mouse picking
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
						if(pick_mode == 'adj')
						{
							ShowFaceAdjacency(data)
						}
						else if(pick_mode == 'rem')
						{
							p_cube.RemoveFace(data["parent"]["face"])
						}
					}
					else if(p_cube.context_name == 'hinge')
					{
						if(pick_mode == 'adj')
						{
							ShowHingeAdjacency(data)
						}
						else if(pick_mode == 'cut')
						{
							p_cube.CutEdge(data["parent"][0])
						}
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

		if(pick_mode == 'cut' && ObjectExists(PolyCube.Active_Polycube))
		{
			var edge_data = {"cuts" : PolyCube.Active_Polycube.GetCutEdges(), "invalids" : PolyCube.Active_Polycube.GetInvalidEdges()}
			UpdateCutEdgeData(edge_data)
			ShowCutEdgeData()
		}
	}
}

function ShowFaceAdjacency(data){
	var parentHighlight = Cube.highlightFace.clone()
	parentHighlight.position.copy(data["parent"]['face'].getWorldPosition())
	parentHighlight.rotation.copy(data["parent"]['face'].getWorldRotation())
	parentHighlight.material = parentHighlightMaterial.clone()
	scene_handler.RequestAddToScene(parentHighlight)
	junk.push(parentHighlight)

	var index = 0
	var childrenHighlight = []
	for(var faceName in data["children"])
	{
		childrenHighlight[index] = Cube.highlightFace.clone()
		childrenHighlight[index].position.copy(data["children"][faceName]["face"].getWorldPosition())
		childrenHighlight[index].rotation.copy(data["children"][faceName]["face"].getWorldRotation())
		childrenHighlight[index].material = childrenHighlightMaterial.clone()
		junk.push(childrenHighlight[index])
		scene_handler.RequestAddToScene(childrenHighlight[index])
		index++
	}
}

function ShowHingeAdjacency(data){
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

function UpdateCutEdgeData(data){
	for(var E in cut_edges)
	{
		delete cut_edges[E]
	}

	for(var E in invalid_cut_edges)
	{
		delete invalid_cut_edges[E]
	}

	var cut_data = data['cuts']
	var invalid_cut_data = data['invalids']

	for(var E in cut_data)
	{
		cut_edges[E] = cut_data[E]['edge']
	}

	for(var E in invalid_cut_data)
	{
		invalid_cut_edges[E] = invalid_cut_data[E]['edge']
	}
}

function ShowCutEdgeData(){
	ClearEdgeJunk()
	for(var E in cut_edges)
	{
		var cutHighlight = Cube.highlightEdge.clone()
		cutHighlight.position.copy(cut_edges[E].getWorldPosition())
		cutHighlight.rotation.copy(cut_edges[E].getWorldRotation())
		cutHighlight.material = cutEdgeHighlightMaterial.clone()
		scene_handler.RequestAddToScene(cutHighlight)
		edge_junk.push(cutHighlight)
	}

	for(var E in invalid_cut_edges)
	{
		var invalidHighlight = Cube.highlightEdge.clone()
		invalidHighlight.position.copy(invalid_cut_edges[E].getWorldPosition())
		invalidHighlight.rotation.copy(invalid_cut_edges[E].getWorldRotation())
		invalidHighlight.material = invalidEdgeHighlightMaterial.clone()
		scene_handler.RequestAddToScene(invalidHighlight)
		edge_junk.push(invalidHighlight)
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

function ClearEdgeJunk(){
	for(var i = 0; i < edge_junk.length; i++)
	{
		scene_handler.RequestRemoveFromScene(edge_junk[i])
		delete edge_junk[i]
	}
	edge_junk = []
}