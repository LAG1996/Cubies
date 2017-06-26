function Cube(scene, lattice_position, polycube, material = new THREE.MeshBasicMaterial({color:0x0000FF})){
		this.ID = Cube.ID++
		this.Polycube = polycube

		this.faceMaterial = material
		this.hingeMaterial = material
		this.scene = scene

		this.lattice_position = lattice_position

		this.Obj = Cube.new_cube.clone()
		this.Obj.name = "Cube_" + this.ID
		this.Obj.position.copy(LatticeToReal(this.lattice_position))

		this.missing_face = {"front" : false, "back" : false, "left" : false, "right" : false, "up" : false, "down" : false}

		this.RemoveFace = function(name)
		{
			if(!this.missing_face[name])
			{
				var face = this.Obj.getObjectByName(name)
				this.Obj.remove(face)
				delete face

				this.missing_face[name] = true
			}
		}

		this.RepairCube = function()
		{
			for(var names in this.missing_face)
			{
				if(this.missing_face[names])
				{
					this.Obj.add(Cube.new_cube.getObjectByName(names).clone())
					this.missing_face[names] = false
				}
			}
		}

		this.ToIDString = function()
		{
			return "c"+this.ID
		}
}

Cube.ID = 0
Cube.new_cube = new THREE.Group()
Cube.face = null
Cube.hinge = null

Cube.GenerateCube = function(cubeFaceMesh, cubeHingeMesh)
{
	//Scale up the cube hinge mesh a bit
	var face_names = ["front", "back", "left", "right", "up", "down"]
	var ninety_deg = DEG2RAD(90)

	Cube.face = new THREE.Group()
	Cube.hinge = new THREE.Group()

	Cube.face = cubeFaceMesh.clone()
	Cube.hinge = cubeHingeMesh.clone()

	Cube.hinge.scale.set(1.25, 1, 1.25)

	var body = Cube.face.clone()
	body.name = "body"

	var top_hinge = Cube.hinge.clone()
	top_hinge.rotateZ(ninety_deg)
	top_hinge.position.y += 1
	top_hinge.name = "hinge"

	var down_hinge = Cube.hinge.clone()
	down_hinge.rotateZ(ninety_deg)
	down_hinge.position.y -= 1
	down_hinge.name = "hinge"

	var right_hinge = Cube.hinge.clone()
	right_hinge.position.x += 1
	right_hinge.name = "hinge"

	var left_hinge = Cube.hinge.clone()
	left_hinge.position.x -= 1
	left_hinge.name = "hinge"

	for(i = 0; i < 6; i++)
	{
		var new_face = new THREE.Group()
		new_face.add(body.clone())
		new_face.add(top_hinge.clone())
		new_face.add(down_hinge.clone())
		new_face.add(right_hinge.clone())
		new_face.add(left_hinge.clone())
		new_face.name = face_names[i]

		if(face_names[i] == "front")
		{
			new_face.position.z = 1
		}
		else if(face_names[i] == "back")
		{
			new_face.position.z = -1
		}
		else if(face_names[i] == "down")
		{
			new_face.position.y = -1
			new_face.rotateX(ninety_deg)
		}
		else if(face_names[i] == "up")
		{
			new_face.position.y = 1
			new_face.rotateX(ninety_deg)
		}
		else if(face_names[i] == "left")
		{
			new_face.position.x = -1
			new_face.rotateY(ninety_deg)
		}
		else if(face_names[i] == "right")
		{
			new_face.position.x = 1
			new_face.rotateY(ninety_deg)
		}

		Cube.new_cube.add(new_face)
	}

	Cube.new_cube.scale.set(0.9, 0.9, 0.9)
}