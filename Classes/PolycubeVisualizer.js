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
			that.rotate_polycubes[id] = that.edit_polycubes[id].clone()

			var f_clone = f.clone()

			//Coloring the picking polycubes
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()
				p.material.color = new THREE.Color(polycube.id)
			}

			that.edit_pick_polycubes[id].add(f_clone.clone())
			that.rotate_pick_polycubes[id] = that.edit_pick_polycubes[id].clone()

			//Coloring the face picking polycubes
			for(var part_num in f_clone.children)
			{
				var p = f_clone.children[part_num]

				p.material = new THREE.MeshBasicMaterial()
				p.material.color = new THREE.Color(f_number)

			}

			that.edit_face_polycube[id].add(f_clone.clone())
			that.rotate_face_polycubes[id] = that.edit_face_polycube[id].clone()

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
			that.rotate_hinge_polycubes[id] = that.edit_hinge_polycubes[id].clone()

			f_number++;
		}

		that.Color2Poly[id] = that.edit_polycubes[id]
	}

	function RemoveFaces(polycube, v_cube, cube, dir, id)
	{
		var other_cube = polycube.GetCubeAtPosition(new THREE.Vector3().addVectors(cube.position, PolyCube.words2directions[dir]))
		var face_name = Cube.GetFaceName(other_cube, PolyCube.direction_words_to_opposites[dir])

/*
		that.edit_polycubes[id].getObjectByName(face_name).visible = false
		that.edit_hinge_polycubes[id].getObjectByName(face_name).visible = false
		that.edit_face_polycube[id].getObjectByName(face_name).visible = false
		that.rotate_polycubes[id].getObjectByName(face_name).visible = false
		that.rotate_hinge_polycubes[id].getObjectByName(face_name).visible = false
		that.rotate_face_polycubes[id].getObjectByName(face_name).visible = false*/
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