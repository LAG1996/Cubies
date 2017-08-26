function PolycubeDataVisualizer(cube_template)
{
	this.cube_template = cube_template

	this.edit_polycubes = {}
	this.edit_hinge_polycubes = {}
	this.edit_face_polycube = {}

	this.rotate_polycubes = {}
	this.rotate_hinge_polycubes = {}
	this.rotate_face_polycubes = {}

	var that = this

	this.ProcessPolycubeAfterNewCube = function(polycube, cube)
	{
		if(!ObjectExists(this.edit_polycubes[polycube.id]))
		{
			this.edit_polycubes[polycube.id] = new THREE.Group()
			this.edit_hinge_polycubes[polycube.id] = new THREE.Group()
			this.edit_face_polycube[polycube.id] = new THREE.Group()
			this.rotate_polycubes[polycube.id] = new THREE.Group()
			this.rotate_hinge_polycubes[polycube.id] = new THREE.Group()
			this.rotate_face_polycubes[polycube.id] = new THREE.Group()
		}

		ProcessCubeData(polycube.id, polycube, cube)

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
							v_cube.children[index].children[windex].name = Cube.GetEdgeName(cube, dir, v_cube.children[index].children[windex].name)
						}
					}
				}
			}
		}

		v_cube.name = cube.object_name

		for(var face in v_cube.children)
		{
			var f = v_cube.children[face]

			var position = new THREE.Vector3().addVectors(f.position, v_cube.position)
			var rotation = f.getWorldRotation()

			f.position.copy(position)
			f.rotation.copy(rotation)

			that.edit_polycubes[id].add(f.clone())
			that.edit_hinge_polycubes[id].add(f.clone())
			that.edit_face_polycube[id].add(f.clone())
			that.rotate_polycubes[id].add(f.clone())
			that.rotate_hinge_polycubes[id].add(f.clone())
			that.rotate_face_polycubes[id].add(f.clone())
		}
	}

	function RemoveFaces(polycube, v_cube, cube, dir, id)
	{
		var other_cube = polycube.GetCubeAtPosition(new THREE.Vector3().addVectors(cube.position, PolyCube.words2directions[dir]))
		var face_name = Cube.GetFaceName(other_cube, PolyCube.direction_words_to_opposites[dir])

		that.edit_polycubes[id].getObjectByName(face_name).visible = false
		that.edit_hinge_polycubes[id].getObjectByName(face_name).visible = false
		that.edit_face_polycube[id].getObjectByName(face_name).visible = false
		that.rotate_polycubes[id].getObjectByName(face_name).visible = false
		that.rotate_hinge_polycubes[id].getObjectByName(face_name).visible = false
		that.rotate_face_polycubes[id].getObjectByName(face_name).visible = false
		//that.edit_polycubes[id].remove(that.edit_polycubes[id].getObjectByName(face_name))
		//that.edit_hinge_polycubes[id].remove(that.edit_hinge_polycubes[id].getObjectByName(face_name))
		//that.edit_face_polycube[id].remove(that.edit_face_polycube[id].getObjectByName(face_name))
		//that.rotate_polycubes[id].remove(that.rotate_polycubes[id].getObjectByName(face_name))
		//that.rotate_hinge_polycubes[id].remove(that.rotate_hinge_polycubes[id].getObjectByName(face_name))
		//that.rotate_face_polycubes[id].remove(that.rotate_face_polycubes[id].getObjectByName(face_name))

		for(var index in v_cube.children)
		{
			if(v_cube.children[index].name == dir)
			{
				v_cube.children[index].visible = false
			}
		}
		//v_cube.remove(v_cube.getObjectByName(dir))
	}
}