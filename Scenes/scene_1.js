var scene_handler = null
var toolbar_handler = null
var p_cube_pick_context = null

var old_mouse_pos = new THREE.Vector2()

var parentHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0xDD0000})
var childrenHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0x001AAA})
var cutEdgeHighlightMaterial = new THREE.MeshBasicMaterial({'color':0xFFFF00})
var invalidEdgeHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0xAAAAAA})
var rotationEdgeHighlightMaterial = new THREE.MeshBasicMaterial({'color': 0xDD00FF})

var highlights_are_on = false
var pick_mode = 'nada'
var junk = []
var edge_junk = []
var cut_edges = {}
var invalid_cut_edges = {}
var rotation_edges = {}
var grid

$(document).ready(function(){
	Initialize() //Load the cube part models and then initialize the cube class with said models
	scene_handler = new SceneHandler() //Initialize the scene

	//Add a grid to the scene so we can orient ourselves
	grid = GenerateGrid(100, 2, 0x000000)
	grid.position.x = -1
	grid.position.y = -1
	grid.position.z = -1

	var grid_axis = new THREE.AxisHelper(50)
	grid_axis.position.copy(grid.position)

	var grid_axis_2 = grid_axis.clone()

	scene_handler.RequestAddToScene(grid)
	scene_handler.RequestAddToScene(grid_axis)
	scene_handler.RequestAddToScene(grid_axis_2)


	//Add the toolbars and their functionality
	toolbar_handler = new Toolbar_Handler()
	toolbar_handler.Switch_Context_H('world-context')

	//Add a couple of events that'll help in mouse picking
	$('#container').on('mousedown', StoreMouseVals)
	$('#container').on('mouseup', HandlePick)
})

function GenerateGrid(size, spacing, color)
{
	var geometry = new THREE.BufferGeometry();

	var geometries = []
	
	var vertices = [], colors = []
	//We'll say we want a grid of size 10 with a spacing of two units for now
	var size = size
	var spacing = spacing
	var halfway = size/2
	//We'll also say that we want the color of the central lines to be red, and the other lines would be off-white
	var line_color = new THREE.Color(color)
	
	var color_index = 0
	//Draw the grid
	for(var i = -halfway, k = -halfway; i <= halfway; i += spacing, k+=spacing)
	{
		vertices.push(i, 0, halfway, i, 0, -halfway)
		vertices.push(-halfway, 0, k, halfway, 0, k)
	
		line_color.toArray(colors, color_index); color_index+=3;
		line_color.toArray(colors, color_index); color_index+=3;
		line_color.toArray(colors, color_index); color_index+=3;
		line_color.toArray(colors, color_index); color_index+=3;
	}
	var f32Positions = new Float32Array(vertices)
	var f32Colors = new Float32Array(colors)
	
	geometry.addAttribute('position', new THREE.BufferAttribute(f32Positions, 3))
	geometry.addAttribute('color', new THREE.BufferAttribute(f32Colors, 3))
	
	var material = new THREE.LineDashedMaterial({vertexColors: THREE.VertexColors});

	var lines = new THREE.LineSegments(geometry, material);

	return lines
}

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
							ShowFaceData(data)
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
							ShowHingeData(data)
						}
						else if(pick_mode == 'cut')
						{
							p_cube.CutEdge(data["parent"][0])
						}
						else if(pick_mode == 'col')
						{
							data = p_cube.GetCollinearCuts(data['parent'][0])
							ShowHingeData(data)
						}
						else if(pick_mode == 'perp')
						{
							data = p_cube.GetPerpendicularCuts(data['parent'][0])
							ShowHingeData(data)
						}
						else if(pick_mode == 'para')
						{
							data = p_cube.GetParallelCuts(data['parent'][0])
							ShowHingeData(data)
						}
						else if(pick_mode == 'hinge')
						{
							data = p_cube.GetSubGraphs(data['parent'][0])
							ShowFaceGraphs(data)
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
			var edge_data = {"cuts" : PolyCube.Active_Polycube.GetCutEdges(), "rotations" : PolyCube.Active_Polycube.GetRotationLines()}
			UpdateCutEdgeData(edge_data)
			ShowCutEdgeData()
		}
	}
}

function ShowFaceData(data){
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

function ShowHingeData(data){
	var parentHighlight = Cube.highlightEdge.clone()
	parentHighlight.position.copy(data['parent'][0]['edge'].getWorldPosition())
	parentHighlight.rotation.copy(data['parent'][0]['edge'].getWorldRotation())
	parentHighlight.material = parentHighlightMaterial.clone()
	scene_handler.RequestAddToScene(parentHighlight)
	junk.push(parentHighlight)

	if(ObjectExists(data['parent'][1]))
	{
		var parentHighlight = Cube.highlightEdge.clone()
		parentHighlight.position.copy(data['parent'][1]['edge'].getWorldPosition())
		parentHighlight.rotation.copy(data['parent'][1]['edge'].getWorldRotation())
		parentHighlight.material = parentHighlightMaterial.clone()
		scene_handler.RequestAddToScene(parentHighlight)
		junk.push(parentHighlight)
	}
	
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

	for(var E in rotation_edges)
	{
		delete rotation_edges[E]
	}

	var cut_data = data['cuts']
	var rotation_data = data['rotations']

	for(var E in cut_data)
	{
		cut_edges[E] = cut_data[E]['edge']
	}

	for(var i = 0; i < rotation_data.length; i++)
	{
		for(var j = 0; j < rotation_data[i].length; j++)
		{
			if(ObjectExists(rotation_data[i][j]))
			{
				rotation_edges[rotation_data[i][j]['name']] = rotation_data[i][j]['edge']
				rotation_edges[rotation_data[i][j]['incidentEdge']['name']] = rotation_data[i][j]['incidentEdge']['edge']
			}
		}
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

	for(var E in rotation_edges)
	{
		var rotationHighlight = Cube.highlightEdge.clone()
		rotationHighlight.position.copy(rotation_edges[E].getWorldPosition())
		rotationHighlight.rotation.copy(rotation_edges[E].getWorldRotation())
		rotationHighlight.material = rotationEdgeHighlightMaterial.clone()
		scene_handler.RequestAddToScene(rotationHighlight)
		edge_junk.push(rotationHighlight)
	}
}

function ShowFaceGraphs(data){
	for(var index in data)
	{
		for(var kindex in data[index])
		{
			var face = data[index][kindex]['face']
			var faceHighlight = Cube.highlightFace.clone()
			faceHighlight.position.copy(face.getWorldPosition())
			faceHighlight.rotation.copy(face.getWorldRotation())
			faceHighlight.material = index == 0 ? parentHighlightMaterial.clone() : childrenHighlightMaterial.clone()
			scene_handler.RequestAddToScene(faceHighlight)
			junk.push(faceHighlight)
		}
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