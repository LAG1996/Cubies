function Cube(scene, scale = 1, material = new THREE.MeshBasicMaterial({color:0x0000FF})){
		this.Obj = new THREE.Group()
		this.ID = Cube.ID++

		this.material = material
		this.scale = scale
		this.scene = scene

		this.position = function(){return this.Obj.position}
		this.rotation = function(){return this.Obj.rotation}

		this.Obj = Cube.new_cube.clone()
		this.Obj.name = "Cube_" + this.ID
}

Cube.ID = 0
Cube.new_cube = new THREE.Group()

Cube.GenerateCube = function(cubeFaceMesh, cubeHingeMesh)
{
	var face_names = ["front", "back", "left", "right", "up", "down"]
	var ninety_deg = DEG2RAD(90)

	Cube.face = cubeFaceMesh.clone()
	Cube.hinge = cubeHingeMesh.clone()
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
}