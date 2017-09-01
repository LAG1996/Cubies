function Initialize()
{
	this.cubeFace = null
	this.cubeHinge = null
	this.flags = []

	var that = this

	var flag_enum = [
		"HAS_PARTS",
		"HAS_FACE",
		"HAS_HINGE",
		"IS_COMPLETE"
	]

	for(i = 0; i < flag_enum.length; i++)
	{
		this.flags[flag_enum[i]] = false
	}

	var has_parts_interv = setInterval(function(){
		if(CheckIfHasParts()){
		 clearInterval(has_parts_interv)
		}
		}, 10)

	var is_complete_interv = setInterval(function(){
		if(CheckIfComplete()){
		 clearInterval(is_complete_interv)
		}
		}, 10)


	ImportCubeParts()

	function ImportCubeParts()
	{
		var manager = new THREE.LoadingManager()
		var loader = new THREE.OBJLoader(manager)

		loader.load('./Models/cubeFace.obj', function (object) {
				
				object.traverse(function(child){
					
					if(child instanceof THREE.Mesh){
						child.material = that.material
					}

				})

				that.cubeFace = object.children[0]
				that.flags["HAS_FACE"] = true

			}, function(xhr){
				if(xhr.lengthComputable) {
					var percentComplete = xhr.loaded/xhr.total * 100
					console.log(Math.round(percentComplete, 2) + '% uploaded')
				}

			}, function(xhr) {
				console.log("File cannot be read")
			})

			loader.load('./Models/cubeHinge.obj', function (object) {
				
				object.traverse(function(child){
					
					if(child instanceof THREE.Mesh){
						child.material = that.material
					}

				})

				that.cubeHinge = object.children[0]
				that.flags["HAS_HINGE"] = true

			}, function(xhr){
				if(xhr.lengthComputable) {
					var percentComplete = xhr.loaded/xhr.total * 100
					console.log(Math.round(percentComplete, 2) + '% uploaded')
				}

			}, function(xhr) {
				console.log("File cannot be read")
			})
	}

	function CheckIfHasParts()
	{
		if(that.flags["HAS_FACE"] && that.flags["HAS_HINGE"])
		{
			that.flags["HAS_PARTS"] = true
			Cube_Template.GenerateCube(that.cubeFace, that.cubeHinge)
		}

		return that.flags["HAS_PARTS"]
	}

	function CheckIfComplete()
	{
		for(var key in that.flags)
		{
			if(!that.flags[key] && key!= "IS_COMPLETE")
			{
				return false
			}
		}

		that.flags["IS_COMPLETE"] = true
		return true
	}
}

var Cube_Template = {}
Cube_Template.highlightFace = null
Cube_Template.highlightEdge = null
Cube_Template.new_cube = new THREE.Group()
Cube_Template.face = null
Cube_Template.hinge = null

Cube_Template.GenerateCube = function(cubeFaceMesh, cubeHingeMesh)
{
	//Scale up the cube hinge mesh a bit
	var face_names = ["front", "back", "left", "right", "up", "down"]
	var ninety_deg = DEG2RAD(90)

	Cube_Template.face = cubeFaceMesh.clone()
	Cube_Template.hinge = cubeHingeMesh.clone()

	Cube_Template.hinge.scale.set(1.25, 1, 1.25)

	var body = Cube_Template.face.clone()
	body.name = "body"
	body.material.color.setHex(0xC0BD88)

	var top_hinge = Cube_Template.hinge.clone()
	top_hinge.rotateZ(ninety_deg)
	top_hinge.position.y += 1
	top_hinge.name = "up"
	top_hinge.material.color.setHex(0x010101)
	top_hinge.up.set(1, 0, 0)

	var down_hinge = Cube_Template.hinge.clone()
	down_hinge.rotateZ(ninety_deg)
	down_hinge.position.y -= 1
	down_hinge.name = "down"
	down_hinge.material.color.setHex(0x010101)
	down_hinge.up.set(-1, 0, 0)

	var right_hinge = Cube_Template.hinge.clone()
	right_hinge.position.x += 1
	right_hinge.name = "right"
	right_hinge.material.color.setHex(0x010101)
	right_hinge.up.set(0, 1, 0)

	var left_hinge = Cube_Template.hinge.clone()
	left_hinge.position.x -= 1
	left_hinge.name = "left"
	left_hinge.rotateZ(2*ninety_deg)
	left_hinge.material.color.setHex(0x010101)
	left_hinge.up.set(0, -1, 0)

	Cube_Template.highlightFace = Cube_Template.face.clone()

	Cube_Template.highlightEdge = Cube_Template.hinge.clone()
	Cube_Template.highlightEdge.scale.set(1.3, 1.0, 1.3)

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

		Cube_Template.new_cube.add(new_face)
	}

	Cube_Template.new_cube.scale.set(0.9, 0.9, 0.9)
}