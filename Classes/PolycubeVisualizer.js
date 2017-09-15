function PolycubeDataVisualizer(cube_template)
{
	this.cube_template = cube_template

	this.edit_polycubes = {}
	this.edit_hinge_polycubes = {}
	this.edit_face_polycube = {}
	this.edit_pick_polycubes = {}

	this.rotate_polycubes = {}
	this.rotate_hinge_polycubes = {}
	this.rotate_face_polycubes = {}
	this.rotate_pick_polycubes = {}

	this.Color2Hinge = []
	this.Color2Face = []

	this.Color2Poly = {}

	var that = this

	this.ResetRotationPolycube = function(polycube)
	{
		this.rotate_polycubes[polycube.id] = this.edit_polycubes[polycube.id].clone()
		this.rotate_hinge_polycubes[polycube.id]  = this.edit_hinge_polycubes[polycube.id].clone()
		this.rotate_face_polycubes[polycube.id]  = this.edit_face_polycube[polycube.id].clone() 
		this.rotate_pick_polycubes[polycube.id]  = this.edit_pick_polycubes[polycube.id].clone()
	}

	this.ProcessPolycube = function(polycube)
	{
		if(!ObjectExists(this.edit_polycubes[polycube.id]))
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
		if(!ObjectExists(this.edit_polycubes[polycube.id]))
		{
			InitializePolyCubeObjects(polycube)
		}

		ProcessCubeData(polycube.id, polycube, cube)
	}

	this.DestroyPolycube = function(polycube)
	{

		this.edit_polycubes[polycube.id].parent.remove(this.edit_polycubes[polycube.id])
		this.edit_hinge_polycubes[polycube.id].parent.remove(this.edit_hinge_polycubes[polycube.id])
		this.edit_face_polycube[polycube.id].parent.remove(this.edit_face_polycube[polycube.id])
		this.edit_pick_polycubes[polycube.id].parent.remove(this.edit_pick_polycubes[polycube.id])
		this.rotate_polycubes[polycube.id].parent.remove(this.rotate_polycubes[polycube.id])
		this.rotate_hinge_polycubes[polycube.id].parent.remove(this.rotate_hinge_polycubes[polycube.id])
		this.rotate_face_polycubes[polycube.id].parent.remove(this.rotate_face_polycubes[polycube.id])
		this.rotate_pick_polycubes[polycube.id].parent.remove(this.rotate_pick_polycubes[polycube.id])

		delete this.edit_polycubes[polycube.id]
		delete this.edit_hinge_polycubes[polycube.id]
		delete this.edit_face_polycube[polycube.id]
		delete this.edit_pick_polycubes[polycube.id]
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

	this.RotateSubGraph = function(face_subgraph, edge_object, polycube, rads)
	{
		var edge_pos = edge_object.getWorldPosition()
	
		var cube = polycube.ID2Cube[Cube.PartNameToCubeID(edge_object.name)]
		//var axis = MakePositiveVector(new THREE.Vector3().copy(cube.edgeEndpoints[edge_object.name][0]).sub(cube.edgeEndpoints[edge_object.name][1]).normalize())

		//Get the axis we are going to rotate around
		var axis = new THREE.Vector3().copy(MakePositiveVector(edge_object.up).normalize())

		axis.y = Math.round(axis.y)
		axis.z = Math.round(axis.z)
		axis.x = Math.round(axis.x)

		console.log("axis is: ")
		console.log(axis)

		//Calculate the angle we want to rotate
		var f = this.rotate_polycubes[polycube.id].getObjectByName(face_subgraph[0].name)
		var dir_from_edge = new THREE.Vector3().copy(f.position)
		dir_from_edge.sub(edge_pos)

		dir_from_edge.x = Math.round(dir_from_edge.x)
		dir_from_edge.y = Math.round(dir_from_edge.y)
		dir_from_edge.z = Math.round(dir_from_edge.z)

		var cross = new THREE.Vector3().crossVectors(f.up, axis)

		cross.x = Math.round(cross.x)
		cross.y = Math.round(cross.y)
		cross.z = Math.round(cross.z)

		rads = cross.equals(dir_from_edge) ? rads : -1*rads

		console.log("cross product is: ")
		console.log(cross)

		var q = new THREE.Quaternion(); // create once and reuse

		q.setFromAxisAngle( axis, rads ); // axis must be normalized, angle in radians

		for(var f in face_subgraph)
		{
			var face_1 = this.rotate_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)
			var face_2 = this.rotate_face_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)
			var face_3 = this.rotate_hinge_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)
			var face_4 = this.rotate_pick_polycubes[polycube.id].getObjectByName(face_subgraph[f].name)

			var rot_pos = new THREE.Vector3().copy(face_1.position)
			rot_pos.sub(edge_pos)
			rot_pos.applyAxisAngle(axis, rads)
			rot_pos.add(edge_pos)

			face_1.position.copy(rot_pos)
			face_2.position.copy(rot_pos)
			face_3.position.copy(rot_pos)
			face_4.position.copy(rot_pos)

			face_1.quaternion.premultiply( q );
			face_2.quaternion.premultiply( q );
			face_3.quaternion.premultiply( q );
			face_4.quaternion.premultiply( q );

			RotateUpAxis(face_1, rads, axis)
			RotateUpAxis(face_2, rads, axis)
			RotateUpAxis(face_3, rads, axis)
			RotateUpAxis(face_4, rads, axis)
		}

	}

	function ProcessCubeData(id, polycube, cube)
	{
		var v_cube = that.cube_template.clone()
		v_cube.position.copy(cube.position).multiplyScalar(2 + 0.12)
	
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
		for(var face_num in v_cube.children)
		{
			var f = v_cube.children[face_num]

			var position = new THREE.Vector3().addVectors(f.position, v_cube.position)
			var rotation = f.getWorldRotation()

			f.position.copy(position)
			f.rotation.copy(rotation)

			that.edit_polycubes[id].add(f.clone())

			var f_clone = f.clone()

			//Coloring the picking polycubes
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()
				p.material.color = new THREE.Color(polycube.id)
			}

			that.edit_pick_polycubes[id].add(f_clone.clone())

			//Coloring the face picking polycubes
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()
				p.material.color = new THREE.Color(f_number)

			}

			that.edit_face_polycube[id].add(f_clone.clone())

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
			that.edit_hinge_polycubes[id].add(f_clone.clone())

			f_number++;
		}

		that.Color2Poly[id] = that.edit_polycubes[id]

		CONTROL.Alert("RESET_ROTATIONS", polycube)
	}

	function RemoveFaces(polycube, v_cube, cube, dir, id)
	{
		var other_cube = polycube.GetCubeAtPosition(new THREE.Vector3().addVectors(cube.position, PolyCube.words2directions[dir]))
		var face_name = Cube.GetFaceName(other_cube, PolyCube.direction_words_to_opposites[dir])

		that.edit_polycubes[id].remove(that.edit_polycubes[id].getObjectByName(face_name))
		that.edit_hinge_polycubes[id].remove(that.edit_hinge_polycubes[id].getObjectByName(face_name))
		that.edit_face_polycube[id].remove(that.edit_face_polycube[id].getObjectByName(face_name))
		that.rotate_polycubes[id].remove(that.rotate_polycubes[id].getObjectByName(face_name))
		that.rotate_hinge_polycubes[id].remove(that.rotate_hinge_polycubes[id].getObjectByName(face_name))
		that.rotate_face_polycubes[id].remove(that.rotate_face_polycubes[id].getObjectByName(face_name))

		for(var index in v_cube.children)
		{
			if(v_cube.children[index].name == dir)
			{
				v_cube.remove(v_cube.children[index])
				//v_cube.children[index].visible = false
			}
		}
	}

	function InitializePolyCubeObjects(polycube)
	{
		that.edit_polycubes[polycube.id] = new THREE.Group()
		that.edit_hinge_polycubes[polycube.id] = new THREE.Group()
		that.edit_face_polycube[polycube.id] = new THREE.Group()
		that.edit_pick_polycubes[polycube.id] = new THREE.Group()

		that.rotate_polycubes[polycube.id] = new THREE.Group()
		that.rotate_hinge_polycubes[polycube.id] = new THREE.Group()
		that.rotate_face_polycubes[polycube.id] = new THREE.Group()
		that.rotate_pick_polycubes[polycube.id] = new THREE.Group()

		that.Color2Hinge[polycube.id] = {}
		that.Color2Face[polycube.id] = {}

		that.edit_polycubes[polycube.id].position.copy(polycube.position)
		that.edit_hinge_polycubes[polycube.id].position.copy(polycube.position)
		that.edit_face_polycube[polycube.id].position.copy(polycube.position)
		that.edit_pick_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_hinge_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_face_polycubes[polycube.id].position.copy(polycube.position)
		that.rotate_pick_polycubes[polycube.id].position.copy(polycube.position)

		that.edit_polycubes[polycube.id].position.multiplyScalar(2)
		that.edit_hinge_polycubes[polycube.id].position.multiplyScalar(2)
		that.edit_face_polycube[polycube.id].position.multiplyScalar(2)
		that.edit_pick_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_hinge_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_face_polycubes[polycube.id].position.multiplyScalar(2)
		that.rotate_pick_polycubes[polycube.id].position.multiplyScalar(2)

		that.edit_polycubes[polycube.id].name = polycube.name
		that.edit_hinge_polycubes[polycube.id].name = polycube.name
		that.edit_face_polycube[polycube.id].name = polycube.name
		that.edit_pick_polycubes[polycube.id].name = polycube.name
		that.rotate_polycubes[polycube.id].name = polycube.name
		that.rotate_hinge_polycubes[polycube.id].name = polycube.name
		that.rotate_face_polycubes[polycube.id].name = polycube.name
		that.rotate_pick_polycubes[polycube.id].name = polycube.name
	}
}