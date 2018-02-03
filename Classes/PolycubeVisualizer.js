function PolycubeDataVisualizer(cube_temp, arrow_temp)
{
	var cube_template = cube_temp
	var arrow_template = arrow_temp

	this.rotate_polycubes = {}
	this.rotate_hinge_polycubes = {}
	this.rotate_face_polycubes = {}
	this.rotate_pick_polycubes = {}

	this.Color2Hinge = []
	this.Color2Face = []

	this.Color2Poly = {}

	//HIGHLIGHTS
	//The primary way we convey information to users in this app is through the highlights.

	//Mouse over highlights
	this.special_mouse_highlight = new THREE.Color(0xFFFF00) //When the user presses an action button (on default, this is 'Shift')
	this.regular_mouse_highlight = new THREE.Color(0x00FF00)

	//Face highlight colors for when the user sees the two halves of a dual graph around a rotation hinge 
	this.prime_face_highlight = new THREE.Color(0xFF0000)
	this.second_face_highlight = new THREE.Color(0x0000FF)

	this.cut_highlight = new THREE.Color(0xFF0000) //Color for cut highlights
	this.hinge_highlight = new THREE.Color(0x22EEDD) //Color for hinge highlights

	//A cache for the actual 3-d meshes that will highlight parts of polycubes
	//We cache the meshes to save on rendering costs.
	//The cache is mainly manipulated in the `HashEdge` and `HashFace` methods, which
	//as the name implies, hash edges and faces into the cache for linear insertion
	//and fast retrieval.
	//The hashing scheme is as follows:
	/*
		Faces and edges each have 4 keys that uniquely identify them.

		-Key 1 is the id of the polycube that they belong to.
		-Key 2 is the type of part. Edges are denoted with a `0` and faces are denoted with a `1`
		-Key 3 is the color of the object as it appears in its respective picking scene. 
		Edges have unique colors in the `hinge_polycubes` scene, while faces have unique colors in the `face_polycubes` scene.
		-Key 4 is the 'action' the user makes upon the part. For example, users can cut edges, or simply hover over them.
	*/
	//Because 4 keys are being used, the cache is really a 4-dimensional array.

	var part_highlights_cache = []
	var hasIncidentEdge = false
	var incidentEdgeHighlightMesh


	//An object for a pair of arrows
	this.arrow_pair = new THREE.Group()
	let arrow_1 = arrow_template.clone()

	//TODO: The following variables need to be private
	this.white_arrow_pick_color = 0xFF0000
	this.black_arrow_pick_color = 0x00FF00

	let arrow_2 = arrow_template.clone()
	arrow_2.children[0].material = new THREE.MeshBasicMaterial({'color':0x000000})
	arrow_2.children[1].material = new THREE.MeshBasicMaterial({'color':0xFFFFFF})
	arrow_2.children[1].material.side = THREE.BackSide
	arrow_2.rotateY(DEG2RAD(180))

	arrow_1.position.x += 1.25
	arrow_2.position.x -= 1.25

	this.arrow_pair.add(arrow_1)
	this.arrow_pair.add(arrow_2)
	this.arrow_pair.visible = false

	this.pick_arrow_pair = this.arrow_pair.clone()
	this.pick_arrow_pair.children[0].children[1].material = new THREE.MeshBasicMaterial({'color' : 0xFF0000})
	this.pick_arrow_pair.children[1].children[1].material = new THREE.MeshBasicMaterial({'color' : 0x00FF00})
	this.pick_arrow_pair.children[0].remove(this.pick_arrow_pair.children[0].children[0])
	this.pick_arrow_pair.children[1].remove(this.pick_arrow_pair.children[1].children[0])
	this.pick_arrow_pair.visible = true

	var that = this

	this.ProcessPolycube = function(polycube)
	{
		if(!ObjectExists(this.rotate_polycubes[polycube.id]))
		{
			InitializePolyCubeObjects(polycube)
		}

		for(var cube_pos in polycube.Cube_Map)
		{
			this.ProcessPolycubeAfterNewCube(polycube, polycube.Cube_Map[cube_pos])
		}
	}

	this.ProcessPolycubeAfterNewCube = function(polycube, cube)
	{
		if(!ObjectExists(this.rotate_polycubes[polycube.id]))
		{
			InitializePolyCubeObjects(polycube)
		}

		ProcessCubeData(polycube.id, polycube, cube)
	}

	this.GeneratePreviewPolycube = function(cube_positions)
	{
		let p_cube = new THREE.Group()

		for(var i in cube_positions)
		{
			let new_cube = cube_template.clone()
			new_cube.matrixAutoUpdate = false

			p_cube.add(new_cube)

			new_cube.position.copy(new THREE.Vector3(cube_positions[i][0]*2, cube_positions[i][1]*2, cube_positions[i][2]*2))
			new_cube.updateMatrix()
		}

		return p_cube
	}

	this.DestroyPolycube = function(polycube)
	{

		this.rotate_polycubes[polycube.id].parent.remove(this.rotate_polycubes[polycube.id])
		this.rotate_hinge_polycubes[polycube.id].parent.remove(this.rotate_hinge_polycubes[polycube.id])
		this.rotate_face_polycubes[polycube.id].parent.remove(this.rotate_face_polycubes[polycube.id])
		this.rotate_pick_polycubes[polycube.id].parent.remove(this.rotate_pick_polycubes[polycube.id])

		delete this.rotate_polycubes[polycube.id]
		delete this.rotate_hinge_polycubes[polycube.id]
		delete this.rotate_face_polycubes[polycube.id]
		delete this.rotate_pick_polycubes[polycube.id]

		for(var key in this.Color2Hinge[polycube.id])
			delete this.Color2Hinge[polycube.id][key]
		for(var key in this.Color2Hinge[polycube.id])
			delete this.Color2Face[polycube.id][key]

		delete this.Color2Poly[polycube.id]
	}

	this.RotateSubGraph = function(face_subgraph, edge_object, polycube, rads, controller)
	{
		var edge_data = polycube.Get_Edge_Data(edge_object.name)
	
		//Get the axis we are going to rotate around
		//var axis = new THREE.Vector3().copy(MakePositiveVector(edge_object.up).normalize())
		var axis = edge_data.axis
		var edge_pos = new THREE.Vector3().copy(edge_data.position)

		axis.y = Math.round(axis.y)
		axis.z = Math.round(axis.z)
		axis.x = Math.round(axis.x)

		//Calculate the angle we want to rotate
		var f = this.rotate_polycubes[polycube.id].getObjectByName(face_subgraph[0].name)

		var face_data  = polycube.Get_Face_Data(f.name)
		var dir_from_edge = new THREE.Vector3().copy(face_data.position)
		dir_from_edge.sub(edge_pos)

		dir_from_edge.x = Math.round(dir_from_edge.x)
		dir_from_edge.y = Math.round(dir_from_edge.y)
		dir_from_edge.z = Math.round(dir_from_edge.z)

		var cross = new THREE.Vector3().crossVectors(face_data.normal, axis)

		cross.x = Math.round(cross.x)
		cross.y = Math.round(cross.y)
		cross.z = Math.round(cross.z)

		rads = cross.equals(dir_from_edge) ? rads : -1*rads

		var q = new THREE.Quaternion(); // create once and reuse

		q.setFromAxisAngle( axis, rads ); // axis must be normalized, angle in radians

		for(var f in face_subgraph)
		{
			var face_1 = this.rotate_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)
			var face_2 = this.rotate_face_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)
			var face_3 = this.rotate_hinge_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)
			var face_4 = this.rotate_pick_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)

			face_data = polycube.Get_Face_Data(face_1.name)
			var rot_pos = new THREE.Vector3().copy(face_data.position)
			rot_pos.sub(edge_pos)
			rot_pos.applyAxisAngle(axis, rads)
			rot_pos.add(edge_pos)
			//rot_pos.add(polycube.position)

			face_1.position.copy(rot_pos)
			face_2.position.copy(rot_pos)
			face_3.position.copy(rot_pos)
			face_4.position.copy(rot_pos)

			face_1.quaternion.premultiply( q )
			face_2.quaternion.premultiply( q )
			face_3.quaternion.premultiply( q )
			face_4.quaternion.premultiply( q )

			face_1.position.x = Math.round(face_1.position.x)
			face_1.position.y = Math.round(face_1.position.y)
			face_1.position.z = Math.round(face_1.position.z)

			face_2.position.x = Math.round(face_2.position.x)
			face_2.position.y = Math.round(face_2.position.y)
			face_2.position.z = Math.round(face_2.position.z)

			face_3.position.x = Math.round(face_3.position.x)
			face_3.position.y = Math.round(face_3.position.y)
			face_3.position.z = Math.round(face_3.position.z)

			face_4.position.x = Math.round(face_4.position.x)
			face_4.position.y = Math.round(face_4.position.y)
			face_4.position.z = Math.round(face_4.position.z)

			face_1.updateMatrix()
			face_2.updateMatrix()
			face_3.updateMatrix()
			face_4.updateMatrix()

			for(var e in face_1.children)
			{
				var part = face_1.children[e]

				if(part.name == "body")
				{
					var highlight_hash = HashObject(polycube.id, "face", face_1.name, "dual_half_1")
					var highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]

					if(ObjectExists(highlight))
					{
						highlight.position.copy(face_1.getWorldPosition())
						highlight.rotation.copy(face_1.getWorldRotation())
						highlight.updateMatrix()
					}

					var highlight_hash = HashObject(polycube.id, "face", face_1.name, "dual_half_2")
					var highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]

					if(ObjectExists(highlight))
					{
						highlight.position.copy(face_1.getWorldPosition())
						highlight.rotation.copy(face_1.getWorldRotation())
						highlight.updateMatrix()
					}
				}
				else
				{
					var highlight_hash = HashObject(polycube.id, "edge", part.name, "cut")
					var highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]

					if(ObjectExists(highlight))
					{
						highlight.position.copy(part.getWorldPosition())
						highlight.rotation.copy(part.getWorldRotation())
						highlight.updateMatrix()
					}

					var highlight_hash = HashObject(polycube.id, "edge", part.name, "hinge")
					var highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]

					if(ObjectExists(highlight))
					{
						highlight.position.copy(part.getWorldPosition())
						highlight.rotation.copy(part.getWorldRotation())
						highlight.updateMatrix()
					}
				}
			}

			controller.Alert('ROTATE_FACE_ROUND_EDGE', edge_object.name, face_1.name, rads, axis)
		}

	}

	this.FadeFaces = function(id, fade)
	{
		var p_cube = this.rotate_polycubes[id]

		p_cube.children[0].children[0].material.opacity = fade
	}

	this.HighlightObject = function(object_type, object_name, polycube_id, action)
	{
		if(object_type == "edge")
		{
			HighlightEdge(object_name, polycube_id, action)
		}
		else if(object_type == "face")
		{
			HighlightFace(object_name, polycube_id, action)
		}
	}

	this.UnHighlightObject = function(polycube_id, object_type, object_name, action)
	{
		let highlight_name = object_name + action
		let highlight_hash = HashObject(polycube_id, object_type, object_name, action)

		let highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]

		if(ObjectExists(highlight))
		{
			highlight.visible = false

			if(ObjectExists(incidentEdgeHighlightMesh))
				incidentEdgeHighlightMesh.visible = false

			hasIncidentEdge = false
		}
	}

	this.SaveIncidentEdge = function(incidentEdgeName, polycube_id, action)
	{
		//If this is the first incident edge we're saving, we don't have an incident edge highlight mesh to use.
		//Render a new highlight mesh for this edge.

		let edge = that.rotate_polycubes[polycube_id].getObjectByName(incidentEdgeName)
		if(!ObjectExists(incidentEdgeHighlightMesh))
		{
			incidentEdgeHighlightMesh = Cube_Template.highlightEdge.clone()
			incidentEdgeHighlightMesh.material = new THREE.MeshBasicMaterial()

			RenderHighlight(edge, action, incidentEdgeHighlightMesh)
			that.rotate_polycubes[polycube_id].children.unshift(incidentEdgeHighlightMesh)
		}

		incidentEdgeHighlightMesh.material.color.copy(action == "mouse_over_1" ? that.regular_mouse_highlight : that.special_mouse_highlight)

		incidentEdgeHighlightMesh.position.copy(edge.getWorldPosition())
		incidentEdgeHighlightMesh.rotation.copy(edge.getWorldRotation())

		incidentEdgeHighlightMesh.updateMatrix()

		hasIncidentEdge = true
	}

	function HashObject(polycube_id, object_type, object_name, action)
	{
		var highlight_hash = undefined

		if(object_type == "edge")
		{
			highlight_hash = HashEdge(polycube_id, object_name, action)
		}
		else if(object_type == "face")
		{
			highlight_hash = HashFace(polycube_id, object_name, action)
		}

		if(!Array.isArray(part_highlights_cache[highlight_hash[0]]))
		{
			part_highlights_cache[highlight_hash[0]] = []
			part_highlights_cache[highlight_hash[0]][highlight_hash[1]] = []
			part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]] = []
		}
		else if(!Array.isArray(part_highlights_cache[highlight_hash[0]][highlight_hash[1]]))
		{
			part_highlights_cache[highlight_hash[0]][highlight_hash[1]] = []
			part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]] = []
		}
		else if(!Array.isArray(part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]]))
		{
			part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]] = []
		}

		return highlight_hash
	}

	function HashEdge(polycube_id, object_name, action)
	{
		var index_1 = polycube_id

		var index_2 = 0

		var index_3 = (action == "mouse_over_1" || action == "mouse_over_2") ?  0 : that.rotate_hinge_polycubes[polycube_id].getObjectByName(object_name).material.color.getHex()

		var index_4 = -1

		if(action == "mouse_over_1")
		{
			index_4 = 0
		}
		else if(action == "mouse_over_2")
		{
			index_4 = 1
		}
		else if(action == "cut")
		{
			index_4 = 0
		}
		else if(action == "hinge")
		{
			index_4 = 1
		}


		return [index_1, index_2, index_3, index_4]
	}

	function HashFace(polycube_id, object_name, action)
	{
		var index_1 = polycube_id

		var index_2 = 1

		var index_3 = (action == "mouse_over_1" || action == "mouse_over_2") ?  0 : that.rotate_face_polycubes[polycube_id].getObjectByName(object_name).children[0].material.color.getHex() + 2

		var index_4 = -1

		if(action == "mouse_over_1")
		{
			index_4 = 0
		}
		else if(action == "mouse_over_2")
		{
			index_4 = 1
		}
		else if(action == "dual_half_1")
		{
			index_4 = 0
		}
		else if(action == "dual_half_2")
		{
			index_4 = 1
		}

		return [index_1, index_2, index_3, index_4]
	}

	function HighlightEdge(name, polycube_id, action)
	{
		var highlight_hash = HashObject(polycube_id, "edge", name, action)

		var highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]
		
		if(!ObjectExists(highlight))
		{
			highlight = Cube_Template.highlightEdge.clone()
			highlight.material = new THREE.MeshBasicMaterial()

			RenderHighlight(that.rotate_polycubes[polycube_id].getObjectByName(name), action, highlight, highlight_hash)

			that.rotate_polycubes[polycube_id].children.unshift(highlight)
		}

		ShowHighlight(name, polycube_id, highlight, action)
	}

	function HighlightFace(name, polycube_id, action)
	{
		var highlight_hash = HashObject(polycube_id, "face", name, action)
		var highlight = part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]]

		if(ObjectExists(highlight))
		{
			ShowHighlight(name, polycube_id, highlight, action)
		}
		else
		{
			highlight = Cube_Template.highlightFace.clone()
			highlight.material = new THREE.MeshBasicMaterial()

			RenderHighlight(that.rotate_polycubes[polycube_id].getObjectByName(name), action, highlight, highlight_hash)

			that.rotate_polycubes[polycube_id].children.unshift(highlight)
		}
	}

	function RenderHighlight(obj, action, highlightMesh, highlight_hash = null)
	{
		if(action == "cut")
		{
			color = that.cut_highlight.clone()
		}
		else if(action == "hinge")
		{
			color = that.hinge_highlight.clone()
		}
		else if(action == "mouse_over_1")
		{
			color = that.regular_mouse_highlight.clone()

		}
		else if(action == "mouse_over_2")
		{
			color = that.special_mouse_highlight.clone()
		}
		else if(action == "dual_half_1")
		{
			color = that.prime_face_highlight.clone()
		}
		else if(action == "dual_half_2")
		{
			color = that.second_face_highlight.clone()
		}

		highlightMesh.material.color.copy(color)
		highlightMesh.material.transparent = true
		highlightMesh.material.opacity = .5

		highlightMesh.position.copy(obj.getWorldPosition())
		highlightMesh.rotation.copy(obj.getWorldRotation())

		highlightMesh.updateMatrix()

		if(highlight_hash)
			part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]] = highlightMesh
	}
	/*
	function RenderHighlight(name, polycube_id, color, highlight, highlight_hash)
	{
		highlight.material.color.copy(color)
		highlight.material.transparent = true
		highlight.material.opacity = .5

		var p_cube = that.rotate_polycubes[polycube_id]
		var obj = p_cube.getObjectByName(name)

		highlight.position.copy(obj.getWorldPosition())
		highlight.rotation.copy(obj.getWorldRotation())

		p_cube.children.unshift(highlight)

		highlight.updateMatrix()

		part_highlights_cache[highlight_hash[0]][highlight_hash[1]][highlight_hash[2]][highlight_hash[3]] = highlight
	}
*/
	function ShowHighlight(name, polycube_id, highlight, action)
	{
		if(action == "mouse_over_1" || action == "mouse_over_2")
		{
			var obj = that.rotate_polycubes[polycube_id].getObjectByName(name)
			highlight.position.copy(obj.getWorldPosition())
			highlight.rotation.copy(obj.getWorldRotation())
			highlight.updateMatrix()
		}


		highlight.visible = true
		if(hasIncidentEdge)
			incidentEdgeHighlightMesh.visible = true
	}

	function ProcessCubeData(id, polycube, cube)
	{
		var v_cube = cube_template.clone()
		v_cube.position.copy(cube.position).multiplyScalar(2)
	
		for(var dir in cube.has_faces)
		{
			if(!cube.has_faces[dir])
			{
				RemoveFaces(polycube, v_cube, cube, dir, id)
			}
			else
			{
				for(var index in v_cube.children)
				{
					if(v_cube.children[index].name == dir)
					{
						v_cube.children[index].name = Cube.GetFaceName(cube, dir)

						for(var windex in v_cube.children[index].children)
						{
							if(v_cube.children[index].children[windex].name != 'body')
								v_cube.children[index].children[windex].name = Cube.GetEdgeName(cube, dir, v_cube.children[index].children[windex].name)
						}
					}
				}
			}
		}

		v_cube.name = cube.object_name

		var f_number = cube.id * 6
		var material = new THREE.MeshBasicMaterial({color: 0xC0BD88})
		material.transparent = true
		material.opacity = 0.5
		for(var face_num in v_cube.children)
		{
			var f = v_cube.children[face_num]

			var position = new THREE.Vector3().addVectors(f.position, v_cube.position)
			var rotation = f.getWorldRotation()

			f.position.copy(position)
			f.rotation.copy(rotation)

			f.position.x = Math.round(f.position.x)
			f.position.y = Math.round(f.position.y)
			f.position.z = Math.round(f.position.z)

			f.children[0].material = material.clone()

			f.updateMatrix()

			that.rotate_polycubes[id].add(f.clone())

			var f_clone = f.clone()

			//Coloring the picking polycubes
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()
				p.material.color = new THREE.Color(polycube.id)
			}

			that.rotate_pick_polycubes[id].add(f_clone.clone())

			//Coloring the face picking polycubes
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()
				p.material.color = new THREE.Color(f_number)

			}

			that.rotate_face_polycubes[id].add(f_clone.clone())

			that.Color2Face[id][f_number] = f.name

			//Coloring the hinge picking polycubes
			var hinge_num = 1
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()

				if(p.name == 'body')
				{	
					p.material.color = new THREE.Color(0x000000)
				}
				else
				{
					p.material.color = new THREE.Color(f_number * 4 + hinge_num)

					that.Color2Hinge[polycube.id][f_number * 4 + hinge_num++] = p.name
				}
			}
			that.rotate_hinge_polycubes[id].add(f_clone.clone())

			f_number++;
		}

		that.Color2Poly[id] = that.rotate_polycubes[id]
	}

	function RemoveFaces(polycube, v_cube, cube, dir, id)
	{
		var other_cube = polycube.GetCubeAtPosition(new THREE.Vector3().addVectors(cube.position, PolyCube.words2directions[dir]))
		var face_name = Cube.GetFaceName(other_cube, PolyCube.direction_words_to_opposites[dir])

		that.rotate_polycubes[id].remove(that.rotate_polycubes[id].getObjectByName(face_name))
		that.rotate_hinge_polycubes[id].remove(that.rotate_hinge_polycubes[id].getObjectByName(face_name))
		that.rotate_face_polycubes[id].remove(that.rotate_face_polycubes[id].getObjectByName(face_name))

		for(var index in v_cube.children)
		{
			if(v_cube.children[index].name == dir)
			{
				v_cube.remove(v_cube.children[index])
			}
		}
	}

	function InitializePolyCubeObjects(polycube)
	{

		that.rotate_polycubes[polycube.id] = new THREE.Group()
		that.rotate_hinge_polycubes[polycube.id] = new THREE.Group()
		that.rotate_face_polycubes[polycube.id] = new THREE.Group()
		that.rotate_pick_polycubes[polycube.id] = new THREE.Group()

		that.rotate_polycubes[polycube.id].matrixAutoUpdate = false
		that.rotate_hinge_polycubes[polycube.id].matrixAutoUpdate = false
		that.rotate_face_polycubes[polycube.id].matrixAutoUpdate = false
		that.rotate_pick_polycubes[polycube.id].matrixAutoUpdate = false

		that.Color2Hinge[polycube.id] = {}
		that.Color2Face[polycube.id] = {}

		that.rotate_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_hinge_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_face_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_pick_polycubes[polycube.id].position.copy(polycube.position)

		UpdatePolycubeMatrices(polycube)

		that.rotate_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_hinge_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_face_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_pick_polycubes[polycube.id].position.multiplyScalar(2)

		UpdatePolycubeMatrices(polycube)

		that.rotate_polycubes[polycube.id].name = polycube.name
		that.rotate_hinge_polycubes[polycube.id].name = polycube.name
		that.rotate_face_polycubes[polycube.id].name = polycube.name
		that.rotate_pick_polycubes[polycube.id].name = polycube.name
	}


	function UpdatePolycubeMatrices(polycube)
	{
		that.rotate_polycubes[polycube.id].updateMatrix()
		that.rotate_hinge_polycubes[polycube.id].updateMatrix()
		that.rotate_face_polycubes[polycube.id].updateMatrix()
		that.rotate_pick_polycubes[polycube.id].updateMatrix()
	}
}