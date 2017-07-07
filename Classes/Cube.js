function Cube(latt_pos, polycube, setupPickingCube = true){
		this.ID = Object.keys(polycube.Get_Cubes()).length
		this.Polycube = polycube

		this.Obj = Cube.new_cube.clone()
		this.Obj.name = this.ID
		this.Obj.position.copy(LatticeToReal(latt_pos))
		
		this.polycube_picking_cube = null
		this.face_picking_cube = null
		this.cube_picking_cube = null
		this.hinge_picking_cube = null

		this.setupPickingCube = setupPickingCube

		this.faceColors = {}

		this.edges = {}

		var missing_face = {"front" : false, "back" : false, "left" : false, "right" : false, "up" : false, "down" : false}
		var lattice_position = latt_pos

		var that = this

		CalculateEdgeData()

		this.RemoveFace = function(name)
		{
			if(!missing_face[name])
			{
				var face = this.Obj.getObjectByName(name)
				var pick_face = this.face_picking_cube.getObjectByName(name)
				this.Obj.remove(face)

				if(ObjectExists(this.face_picking_cube))
				{
					this.face_picking_cube.remove(pick_face)
				}

				if(ObjectExists(this.hinge_picking_cube))
				{
					this.hinge_picking_cube.remove(pick_face)
				}

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

		this.SetUpPickingCubes = function()
		{
			if(ObjectExists(this.face_picking_cube)){
				delete this.face_picking_cube
			}

			this.face_picking_cube = this.Obj.clone()

			SetUpFaceColor()

			if(!ObjectExists(this.cube_picking_cube))
			{
				this.cube_picking_cube = this.Obj.clone()
				SetUpCubeColor()
			}

			if(!ObjectExists(this.polycube_picking_cube))
			{
				this.polycube_picking_cube = this.Obj.clone()

				for(faceNum = 0; faceNum < this.polycube_picking_cube.children.length; faceNum++)
				{
					var face = this.polycube_picking_cube.children[faceNum]

					for(meshNum = 0; meshNum < face.children.length; meshNum++)
					{
						face.children[meshNum].material = new THREE.MeshBasicMaterial({'color' : this.Polycube.id})
					}
				}
			}
		}

		function SetUpFaceColor()
		{
			//Set up face colors
			for(faceNum = 0; faceNum < that.face_picking_cube.children.length; faceNum++)
			{
				var color = that.ID + faceNum + that.ID*6
				var face = that.face_picking_cube.children[faceNum]
				that.faceColors[face.name] = color

				for(meshNum = 0; meshNum < face.children.length; meshNum++)
				{
					face.children[meshNum].material = new THREE.MeshBasicMaterial({'color' : color})
				}
			}
		}

		function SetUpCubeColor()
		{
			var color = that.ID

			for(faceNum = 0; faceNum < that.face_picking_cube.children.length; faceNum++)
			{
				var face = that.cube_picking_cube.children[faceNum]
				for(meshNum = 0; meshNum < face.children.length; meshNum++)
				{
					face.children[meshNum].material = new THREE.MeshBasicMaterial({'color' : color})
				}
			}
		}

		function CalculateEdgeData()
		{
			var pos = lattice_position

			var up = new THREE.Vector3(0, .5, 0)
			var down = new THREE.Vector3(0, -.5, 0)
			var left = new THREE.Vector3(-.5, 0, 0)
			var right = new THREE.Vector3(.5, 0, 0)
			var back = new THREE.Vector3(0, 0, -.5)
			var front = new THREE.Vector3(0, 0, .5)

			//The front edges
			that.edges["front_up"] = {}
			that.edges["front_up"]["position"] = SumOfVectors([pos, up, front])
			that.edges["front_up"]["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, front, right])]

			that.edges["front_right"] = {}
			that.edges["front_right"]["position"] = SumOfVectors([pos, right, front])
			that.edges["front_right"]["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, down, front, right])]

			that.edges["front_left"] = {}
			that.edges["front_left"]["position"] = SumOfVectors([pos, left, front])
			that.edges["front_left"]["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, down, front, left])]

			that.edges["front_down"] = {}
			that.edges["front_down"]["position"] = SumOfVectors([pos, down, front])
			that.edges["front_down"]["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, front, right])]

			//The top edges
			that.edges["up_up"] = {}
			that.edges["up_up"]["position"] = SumOfVectors([pos, back, up])
			that.edges["up_up"]["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, up, back, right])]

			that.edges["up_right"] = {}
			that.edges["up_right"]["position"] = SumOfVectors([pos, right, up])
			that.edges["up_right"]["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, up, back, right])]

			that.edges["up_left"] = {}
			that.edges["up_left"]["position"] = SumOfVectors([pos, left, up])
			that.edges["up_left"]["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, back, left])]

			that.edges["up_down"] = {}
			that.edges["up_down"]["position"] = SumOfVectors([pos, front, up])
			that.edges["up_down"]["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, front, right])]

			//The back edges
			that.edges["back_up"] = {}
			that.edges["back_up"]["position"] = SumOfVectors([pos, down, back])
			that.edges["back_up"]["endPoints"] = [SumOfVectors([pos, down, back, left]), SumOfVectors([pos, down, back, right])]

			that.edges["back_right"] = {}
			that.edges["back_right"]["position"] = SumOfVectors([pos, left, back])
			that.edges["back_right"]["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, down, back, left])]

			that.edges["back_left"] = {}
			that.edges["back_left"]["position"] = SumOfVectors([pos, right, back])
			that.edges["back_left"]["endPoints"] = [SumOfVectors([pos, up, back, right]), SumOfVectors([pos, down, back, right])]

			that.edges["back_down"] = {}
			that.edges["back_down"]["position"] = SumOfVectors([pos, up, back])
			that.edges["back_down"]["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, up, back, right])]

			//The bottom edges
			that.edges["down_up"] = {}
			that.edges["down_up"]["position"] = SumOfVectors([pos, front, down])
			that.edges["down_up"]["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, front, right])]

			that.edges["down_right"] = {}
			that.edges["down_right"]["position"] = SumOfVectors([pos, left, down])
			that.edges["down_right"]["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, back, left])]

			that.edges["down_left"] = {}
			that.edges["down_left"]["position"] = SumOfVectors([pos, right, down])
			that.edges["down_left"]["endPoints"] = [SumOfVectors([pos, down, front, right]), SumOfVectors([pos, down, back, right])]

			that.edges["down_down"] = {}
			that.edges["down_down"]["position"] = SumOfVectors([pos, back, down])
			that.edges["down_down"]["endPoints"] = [SumOfVectors([pos, down, back, left]), SumOfVectors([pos, down, back, right])]

			//The left edges
			that.edges["left_up"] = {}
			that.edges["left_up"]["position"] = SumOfVectors([pos, down, left])
			that.edges["left_up"]["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, back, left])]

			that.edges["left_right"] = {}
			that.edges["left_right"]["position"] = SumOfVectors([pos, front, left])
			that.edges["left_right"]["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, down, back, left])]

			that.edges["left_left"] = {}
			that.edges["left_left"]["position"] = SumOfVectors([pos, back, left])
			that.edges["left_left"]["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, down, front, left])]

			that.edges["left_down"] = {}
			that.edges["left_down"]["position"] = SumOfVectors([pos, up, left])
			that.edges["left_down"]["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, back, left])]

			//The right edges
			that.edges["right_up"] = {}
			that.edges["right_up"]["position"] = SumOfVectors([pos, up, right])
			that.edges["right_up"]["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, up, back, right])]

			that.edges["right_right"] = {}
			that.edges["right_right"]["position"] = SumOfVectors([pos, back, right])
			that.edges["right_right"]["endPoints"] = [SumOfVectors([pos, up, back, right]), SumOfVectors([pos, down, back, right])]

			that.edges["right_left"] = {}
			that.edges["right_left"]["position"] = SumOfVectors([pos, front, right])
			that.edges["right_left"]["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, down, front, right])]

			that.edges["right_down"] = {}
			that.edges["right_down"]["position"] = SumOfVectors([pos, down, right])
			that.edges["right_down"]["endPoints"] = [SumOfVectors([pos, down, front, right]), SumOfVectors([pos, down, back, right])]
		}

		var ResetCube = function()
		{
			console.log("To be written later")
		}
}

Cube.new_cube = new THREE.Group()
Cube.face = null //A bit of a misnomer here. Cube.face is really the body of a face on the surface of a cube
Cube.hinge = null //Similarly, this is just an edge, not really a hinge. A hinge is two incident faces

Cube.highlightHinge = null
Cube.highlightFace = null

//Function that generates a cube object that can be cloned when needed. This function should only be called only when the program is instantiated, since
//the template for the cube object is stored as Cube.new_cube.
/*
	There's this rather unintuitive winding system going on here. To make hinge rotation less of a headache later on down the line, I have the faces
	rotated to make this winding pattern.
	This is how it works:

		-Start at the front face. This is the only face that works the way you expect (which, I'll admit is already confusing, but if the logic is consistent, it does
		not matter). By start at the front face, I mean pretend you are standing on the front face's surface parallel with the face's normal direction (which would be <0, 0, 1>),
		facing the world's up direction, <0, 1, 0>.
		Now, walk forward. You will cross the front's top edge, which is incident to the top's bottom edge. The top's top edge is incident to the back's bottom edge, and the bottom's
		top edge is incident to the front's bottom edge.

		-Similarly, if you were to start at the front face again, but this time facing the world's right direction <1, 0, 0>, then you will eventually cross to the right face,
		whose left edge is incident to the front's right edge. The back face's left edge is incident to the right's right edge, and the left face's left edge is incident to the back's right edge.
		Then, the left's right edge is incident to the front's left edge.

	Now, that explains how the winding from front-top-back-down-front and front-right-back-left-front work, but what about, for instance top-right-bottom-left-top?
	This is how it works:

		-Start at the top, facing the world's right direction. Then, the top's right side is incident to the right's top side, the right's bottom side is incident to the bottom's left side, 
		and the left's top side should be incident to the bottom's right side.

	This third winding pattern may require tweaking, but we'll see when we get there.
*/
Cube.GenerateCube = function(cubeFaceMesh, cubeHingeMesh)
{
	//Scale up the cube hinge mesh a bit
	var face_names = ["front", "back", "left", "right", "up", "down"]
	var ninety_deg = DEG2RAD(90)

	Cube.face = cubeFaceMesh.clone()
	Cube.hinge = cubeHingeMesh.clone()

	Cube.hinge.scale.set(1.25, 1, 1.25)

	var body = Cube.face.clone()
	body.name = "body"

	var top_hinge = Cube.hinge.clone()
	top_hinge.rotateZ(ninety_deg)
	top_hinge.position.y += 1
	top_hinge.name = "up"

	var down_hinge = Cube.hinge.clone()
	down_hinge.rotateZ(ninety_deg)
	down_hinge.position.y -= 1
	down_hinge.name = "down"

	var right_hinge = Cube.hinge.clone()
	right_hinge.position.x += 1
	right_hinge.name = "right"

	var left_hinge = Cube.hinge.clone()
	left_hinge.position.x -= 1
	left_hinge.name = "left"
	left_hinge.rotateZ(2*ninety_deg)

	Cube.highlightFace = new THREE.Group()

	Cube.highlightFace.add(body.clone())
	Cube.highlightFace.add(top_hinge.clone())
	Cube.highlightFace.add(down_hinge.clone())
	Cube.highlightFace.add(right_hinge.clone())
	Cube.highlightFace.add(left_hinge.clone())

	Cube.highlightHinge = Cube.hinge.clone()
	Cube.highlightHinge.scale.set(1.2, 1.2, 1.2)

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
			new_face.rotateX(2*ninety_deg)
			new_face.rotateY(2*ninety_deg)
		}
		else if(face_names[i] == "down")
		{
			new_face.position.y = -1
			new_face.rotateX(-ninety_deg)
			new_face.rotateZ(2*ninety_deg)
		}
		else if(face_names[i] == "up")
		{
			new_face.position.y = 1
			new_face.rotateX(-ninety_deg)
		}
		else if(face_names[i] == "left")
		{
			new_face.position.x = -1
			new_face.rotateY(-ninety_deg)
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