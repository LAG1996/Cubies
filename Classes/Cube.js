$(document).ready(function(){
	Initialize() //Load the cube part models and then initialize the cube class with said models
})

function Cube(latt_pos, polycube, custom_id = -1){
		this.ID = (custom_id == -1) ? Object.keys(polycube.Get_Cubes()).length : this.ID = custom_id
		this.Polycube = polycube

		this.Obj = Cube.new_cube.clone()
		this.Obj.name = this.ID
		this.Obj.position.copy(LatticeToReal(latt_pos))
		
		this.polycube_picking_cube = null
		this.face_picking_cube = null
		this.cube_picking_cube = null
		this.hinge_picking_cube = null

		this.faceColors = {}

		this.edges = {}

		var missing_face = {"front" : false, "back" : false, "left" : false, "right" : false, "up" : false, "down" : false}
		var lattice_position = latt_pos

		var that = this

		this.RemoveFace = function(name)
		{
			if(!missing_face[name])
			{
				var face = this.Obj.getObjectByName(name)
				this.Obj.remove(face)

				if(ObjectExists(this.face_picking_cube))
				{
					var pick_face = this.face_picking_cube.getObjectByName(name)
					this.face_picking_cube.remove(pick_face)
					delete pick_face
				}

				if(ObjectExists(this.hinge_picking_cube))
				{
					var hinge_pick_face = this.hinge_picking_cube.getObjectByName(name)
					this.hinge_picking_cube.remove(hinge_pick_face)
					delete hinge_pick_face
				}

				delete face


				missing_face[name] = true
			}
		}

		this.Destroy = function()
		{
			if(ObjectExists(this.Obj.parent))
				this.Obj.parent.remove(this.Obj)
			if(ObjectExists(this.face_picking_cube.parent))
				this.face_picking_cube.parent.remove(this.face_picking_cube)
			if(ObjectExists(this.hinge_picking_cube.parent))
				this.hinge_picking_cube.parent.remove(this.hinge_picking_cube)
			if(ObjectExists(this.cube_picking_cube.parent))
				this.cube_picking_cube.parent.remove(this.cube_picking_cube)
			if(ObjectExists(this.polycube_picking_cube))
				this.polycube_picking_cube.parent.remove(this.polycube_picking_cube)

			RecurseRemoveFromCube(this.Obj)
			RecurseRemoveFromCube(this.face_picking_cube)
			RecurseRemoveFromCube(this.cube_picking_cube)
			RecurseRemoveFromCube(this.polycube_picking_cube)
			RecurseRemoveFromCube(this.hinge_picking_cube)

			delete this.Obj
			delete this.face_picking_cube
			delete this.cube_picking_cube
			delete this.polycube_picking_cube
			delete this.hinge_picking_cube
		}

		this.MoveTo = function(position)
		{
			this.Obj.position.copy(position)
			lattice_position.copy(position)
		}

		this.GetLatticePosition = function()
		{
			return lattice_position.clone()
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

		function RecurseRemoveFromCube(cube)
		{
			for(var face in cube.children)
			{
				for(var part in cube.children[face].children)
				{
					delete cube.children[face].children[part]
				}

				delete cube.children[face]
			}
		}
}

Cube.new_cube = new THREE.Group()
Cube.face = null //A bit of a misnomer here. Cube.face is really the body of a face on the surface of a cube
Cube.hinge = null //Similarly, this is just an edge, not really a hinge. A hinge is two incident faces

Cube.highlightEdge = null
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
	body.material.color.setHex(0xC0BD88)

	var top_hinge = Cube.hinge.clone()
	top_hinge.rotateZ(ninety_deg)
	top_hinge.position.y += 1
	top_hinge.name = "up"
	top_hinge.material.color.setHex(0x010101)
	top_hinge.up.set(1, 0, 0)

	var down_hinge = Cube.hinge.clone()
	down_hinge.rotateZ(ninety_deg)
	down_hinge.position.y -= 1
	down_hinge.name = "down"
	down_hinge.material.color.setHex(0x010101)
	down_hinge.up.set(-1, 0, 0)

	var right_hinge = Cube.hinge.clone()
	right_hinge.position.x += 1
	right_hinge.name = "right"
	right_hinge.material.color.setHex(0x010101)
	right_hinge.up.set(0, 1, 0)

	var left_hinge = Cube.hinge.clone()
	left_hinge.position.x -= 1
	left_hinge.name = "left"
	left_hinge.rotateZ(2*ninety_deg)
	left_hinge.material.color.setHex(0x010101)
	left_hinge.up.set(0, -1, 0)

	Cube.highlightFace = Cube.face.clone()

	Cube.highlightEdge = Cube.hinge.clone()
	Cube.highlightEdge.scale.set(1.2, 1.0, 1.2)

	for(i = 0; i < 6; i++)
	{
		var new_face = new THREE.Group()

		var b = body.clone()
		var t = top_hinge.clone()
		var d = down_hinge.clone()
		var r = right_hinge.clone()
		var l = left_hinge.clone()

		new_face.add(b)
		new_face.add(t)
		new_face.add(d)
		new_face.add(r)
		new_face.add(l)
		new_face.name = face_names[i]

		if(face_names[i] == "front")
		{
			new_face.position.z = 1
		}
		else if(face_names[i] == "back")
		{
			new_face.position.z = -1

			RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(1, 0, 0))
			RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(1, 0, 0))

			new_face.rotateX(2*ninety_deg)
			new_face.rotateY(2*ninety_deg)
		}
		else if(face_names[i] == "down")
		{
			new_face.position.y = -1

			RotateUpAxis(new_face, -ninety_deg, new THREE.Vector3(1, 0, 0))
			RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(0, 0, 1))

			new_face.rotateX(-ninety_deg)
			new_face.rotateZ(2*ninety_deg)
		}
		else if(face_names[i] == "up")
		{
			new_face.position.y = 1

			RotateUpAxis(new_face, -ninety_deg, new THREE.Vector3(1, 0, 0))

			new_face.rotateX(-ninety_deg)
		}
		else if(face_names[i] == "left")
		{
			new_face.position.x = -1

			RotateUpAxis(new_face, -ninety_deg, new THREE.Vector3(0, 1, 0))
			RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(1, 0, 0))

			new_face.rotateY(-ninety_deg)
			new_face.rotateX(ninety_deg*2)
		}
		else if(face_names[i] == "right")
		{
			new_face.position.x = 1

			RotateUpAxis(new_face, ninety_deg, new THREE.Vector3(0, 1, 0))

			new_face.rotateY(ninety_deg)
		}

		Cube.new_cube.add(new_face)
	}

	Cube.new_cube.scale.set(0.9, 0.9, 0.9)
}

Cube.CubeDataCalculator = function(){
	var up = new THREE.Vector3(0, .5, 0)
	var down = new THREE.Vector3(0, -.5, 0)
	var left = new THREE.Vector3(-.5, 0, 0)
	var right = new THREE.Vector3(.5, 0, 0)
	var back = new THREE.Vector3(0, 0, -.5)
	var front = new THREE.Vector3(0, 0, .5)

	this.CalculateEdgeData = function(cube, dir_word){
		var pos = cube.GetLatticePosition()
		var edge = {"name": null, "position": null, "endPoints": null}

		switch(dir_word)
		{
			case "front_up":
				edge["name"] = "front_up"
				edge["position"] = SumOfVectors([pos, up, front])
				edge["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, front, right])]
				break;
			case "front_right":
				edge["name"] = "front_right"
				edge["position"] = SumOfVectors([pos, right, front])
				edge["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, down, front, right])]
				break;
			case "front_left":
				edge["name"] = "front_left"
				edge["position"] = SumOfVectors([pos, left, front])
				edge["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, down, front, left])]
				break;
			case "front_down":
				edge["name"] = "front_down"
				edge["position"] = SumOfVectors([pos, down, front])
				edge["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, front, right])]
			break;
			case "up_up":
				edge["name"] = "up_up"
				edge["position"] = SumOfVectors([pos, back, up])
				edge["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, up, back, right])]
				break;
			case "up_right":
				edge["name"] = "up_right"
				edge["position"] = SumOfVectors([pos, right, up])
				edge["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, up, back, right])]
			break;
			case "up_left":
				edge["name"] = "up_left"
				edge["position"] = SumOfVectors([pos, left, up])
				edge["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, back, left])]
			break;
			case "up_down":
				edge["name"] = "up_down"
				edge["position"] = SumOfVectors([pos, front, up])
				edge["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, front, right])]
			break;
			case "back_up":
				edge["name"] = "back_up"
				edge["position"] = SumOfVectors([pos, down, back])
				edge["endPoints"] = [SumOfVectors([pos, down, back, left]), SumOfVectors([pos, down, back, right])]
			break;
			case "back_right":
				edge["name"] = "back_right"
				edge["position"] = SumOfVectors([pos, left, back])
				edge["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, down, back, left])]
			break;
			case "back_left":
				edge["name"] = "back_left"
				edge["position"] = SumOfVectors([pos, right, back])
				edge["endPoints"] = [SumOfVectors([pos, up, back, right]), SumOfVectors([pos, down, back, right])]
			break;
			case "back_down":
				edge["name"] = "back_down"
				edge["position"] = SumOfVectors([pos, up, back])
				edge["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, up, back, right])]
			break;
			case "down_up":
				edge["name"] = "down_up"
				edge["position"] = SumOfVectors([pos, front, down])
				edge["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, front, right])]
			break;
			case "down_right":
				edge["name"] = "down_right"
				edge["position"] = SumOfVectors([pos, left, down])
				edge["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, back, left])]
			break;
			case "down_left":
				edge["name"] = "down_left"
				edge["position"] = SumOfVectors([pos, right, down])
				edge["endPoints"] = [SumOfVectors([pos, down, front, right]), SumOfVectors([pos, down, back, right])]
			break;
			case "down_down":
				edge["name"] = "down_left"
				edge["position"] = SumOfVectors([pos, back, down])
				edge["endPoints"] = [SumOfVectors([pos, down, back, left]), SumOfVectors([pos, down, back, right])]
			break;
			case "left_up":
				edge["name"] = "left_up"
				edge["position"] = SumOfVectors([pos, down, left])
				edge["endPoints"] = [SumOfVectors([pos, down, front, left]), SumOfVectors([pos, down, back, left])]
			break;
			case "left_right":
				edge["name"] = "left_right"
				edge["position"] = SumOfVectors([pos, front, left])
				edge["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, down, front, left])]
			break;
			case "left_left":
				edge["name"] = "left_left"
				edge["position"] = SumOfVectors([pos, back, left])
				edge["endPoints"] = [SumOfVectors([pos, up, back, left]), SumOfVectors([pos, down, back, left])]
			break;
			case "left_down":
				edge["name"] = "left_down"
				edge["position"] = SumOfVectors([pos, up, left])
				edge["endPoints"] = [SumOfVectors([pos, up, front, left]), SumOfVectors([pos, up, back, left])]
			break;
			case "right_up":
				edge["name"] = "right_up"
				edge["position"] = SumOfVectors([pos, up, right])
				edge["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, up, back, right])]
			break;
			case "right_right":
				edge["name"] = "right_right"
				edge["position"] = SumOfVectors([pos, back, right])
				edge["endPoints"] = [SumOfVectors([pos, up, back, right]), SumOfVectors([pos, down, back, right])]
			break;
			case "right_left":
				edge["name"] = "right_left"
				edge["position"] = SumOfVectors([pos, front, right])
				edge["endPoints"] = [SumOfVectors([pos, up, front, right]), SumOfVectors([pos, down, front, right])]
			break;
			case "right_down":
				edge["name"] = "right_down"
				edge["position"] = SumOfVectors([pos, down, right])
				edge["endPoints"] = [SumOfVectors([pos, down, front, right]), SumOfVectors([pos, down, back, right])]
			break;
			default: console.log("This shouldn't be happening")
		}

		return edge
	}

	this.GetRotationAxis = function(dir_word)
	{


		return edge
	}
}