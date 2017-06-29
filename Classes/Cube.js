function Cube(latt_pos, polycube, setupPickingCube = true){
		this.ID = Object.keys(polycube.Get_Cubes()).length
		this.Polycube = polycube

		this.Obj = Cube.new_cube.clone()
		this.Obj.name = "Cube_" + this.ID
		this.Obj.position.copy(LatticeToReal(latt_pos))
		
		this.polycube_picking_cube = null
		this.face_picking_cube = null
		this.cube_picking_cube = null

		this.setupPickingCube = setupPickingCube

		var missing_face = {"front" : false, "back" : false, "left" : false, "right" : false, "up" : false, "down" : false}
		var lattice_position = latt_pos

		var that = this

		if(this.setupPickingCube)
			SetUpPickingCube()

		this.RemoveFace = function(name)
		{
			if(!missing_face[name])
			{
				var face = this.Obj.getObjectByName(name)
				var pick_face = this.face_picking_cube.getObjectByName(name)
				this.Obj.remove(face)
				this.face_picking_cube.remove(pick_face)
				delete face
				delete pick_face

				missing_face[name] = true
			}
		}

		this.RepairCube = function()
		{
			for(var names in this.missing_face)
			{
				if(missing_face[names])
				{
					this.Obj.add(Cube.new_cube.getObjectByName(names).clone())
					missing_face[names] = false
				}
			}
		}

		this.MoveTo = function(position)
		{
			this.Obj.position.copy(position)
			lattice_position.copy(position)
		}

		this.GetLatticePosition = function()
		{
			return lattice_position
		}

		this.ToIDString = function()
		{
			return "c"+this.ID
		}

		function SetUpPickingCube()
		{
			if(ObjectExists(that.face_picking_cube)){
				delete that.face_picking_cube
			}

			that.face_picking_cube = that.Obj.clone()

			SetUpFaceColor()

			if(!ObjectExists(that.cube_picking_cube))
			{
				that.cube_picking_cube = that.Obj.clone()
				SetUpCubeColor()
			}

			if(!ObjectExists(that.polycube_picking_cube))
			{
				that.polycube_picking_cube = that.Obj.clone()

				for(faceNum = 0; faceNum < that.polycube_picking_cube.children.length; faceNum++)
				{
					var face = that.polycube_picking_cube.children[faceNum]

					for(meshNum = 0; meshNum < face.children.length; meshNum++)
					{
						face.children[meshNum].material = new THREE.MeshBasicMaterial({'color' : that.Polycube.id})
					}
				}
			}
		}

		function SetUpFaceColor()
		{
			//Set up face colors
			for(faceNum = 0; faceNum < that.face_picking_cube.children.length; faceNum++)
			{
				var color = that.ID + faceNum + that.ID*18
				var face = that.face_picking_cube.children[faceNum]

				for(meshNum = 0; meshNum < face.children.length; meshNum++)
				{
					face.children[meshNum].material = new THREE.MeshBasicMaterial({'color' : color})
				}
			}
		}

		function SetUpCubeColor()
		{
			var color = that.ID * 10

			for(faceNum = 0; faceNum < that.face_picking_cube.children.length; faceNum++)
			{
				var face = that.cube_picking_cube.children[faceNum]
				for(meshNum = 0; meshNum < face.children.length; meshNum++)
				{
					face.children[meshNum].material = new THREE.MeshBasicMaterial({'color' : color})
				}
			}
		}

		var ResetCube = function()
		{
			console.log("To be written later")
		}
}

Cube.new_cube = new THREE.Group()
Cube.cube_placeholder = null
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

	var picking_geom = new THREE.BufferGeometry()

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

		for(k = 0; k < new_face.children.length; k++)
		{
			picking_geom.merge(new_face.children[k].geometry)
		}

		Cube.new_cube.add(new_face)
	}

	Cube.cube_placeholder = new THREE.Mesh(picking_geom)

	Cube.new_cube.scale.set(0.9, 0.9, 0.9)
}