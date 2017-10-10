function Initialize()
{
	this.cubeFace = null
	this.cubeHinge = null
	this.arrow = null
	this.flags = []

	var that = this

	var flag_enum = [
		"HAS_PARTS",
		"HAS_FACE",
		"HAS_HINGE",
		"HAS_ARROW",
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

		}, 
		function(xhr){}, 
		function(xhr) {
			throw "INIT_ERROR: NO FACE OBJECT FOUND"
		})

		loader.load('./Models/cubeHinge.obj', function (object) {
			
			object.traverse(function(child){
				
				if(child instanceof THREE.Mesh){
					child.material = that.material
				}

			})

			that.cubeHinge = object.children[0]
			that.flags["HAS_HINGE"] = true

		}, 
		function(xhr){}, 
		function(xhr) {
			throw "INIT_ERROR: NO HINGE OBJECT FOUND"
		})

		loader.load("./Models/Arrow.obj", function (object){

			object.traverse(function(child){
				if(child instanceof THREE.Mesh){
					child.material = that.meterial
				}
			})

			that.arrow = object.children[0]
			that.flags["HAS_ARROW"] = true
		}, 
		function(xhr){},
		function(xhr){
			throw "INIT_ERROR: NO ARROW OBJECT FOUND"
		})
	}

	function CheckIfHasParts()
	{
		if(that.flags["HAS_FACE"] && that.flags["HAS_HINGE"] && that.flags["HAS_ARROW"])
		{
			that.flags["HAS_PARTS"] = true
			Arrow_Template.SetArrowObject(that.arrow)
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

var Arrow_Template = {}
Arrow_Template.arrow = null

Arrow_Template.SetArrowObject = function(arrowMesh)
{
	var obj = new THREE.Group()
	
	var main_arrow = arrowMesh.clone()
	main_arrow.name = "main"
	main_arrow.material.color.setHex(0xFFFFFF)

	var outline = arrowMesh.clone()
	outline.name = "outline"
	outline.scale.set(1.01, 1.1, 1.1)
	outline.material.color.setHex(0x000000)
	outline.material.side = THREE.BackSide

	obj.add(main_arrow)
	obj.add(outline)

	Arrow_Template.arrow = obj
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

	Cube_Template.face.material.transparent = true
	Cube_Template.hinge.material.transparent = true

	Cube_Template.face.material.opacity = 0.5
	//Cube_Template.face.material.opacity = 0.5

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

		new_face.matrixAutoUpdate = false

		if(face_names[i] == "front")
		{
			new_face.position.z = 1
			new_face.up.set(0, 0, 1)
		}
		else if(face_names[i] == "back")
		{
			new_face.position.z = -1

			RotateUpAxis(new_face, ninety_deg, new THREE.Vector3(1, 0, 0))
			//RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(1, 0, 0))
			new_face.up.set(0, 0, -1)

			new_face.rotateX(2*ninety_deg)
			new_face.rotateY(2*ninety_deg)
		}
		else if(face_names[i] == "down")
		{
			new_face.position.y = -1

			RotateUpAxis(new_face, -ninety_deg, new THREE.Vector3(1, 0, 0))
			RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(0, 0, 1))

			new_face.up.set(0, -1, 0)

			new_face.rotateX(-ninety_deg)
			new_face.rotateZ(2*ninety_deg)
		}
		else if(face_names[i] == "up")
		{
			new_face.position.y = 1

			RotateUpAxis(new_face, -ninety_deg, new THREE.Vector3(1, 0, 0))
			new_face.up.set(0, 1, 0)

			new_face.rotateX(-ninety_deg)
		}
		else if(face_names[i] == "left")
		{
			new_face.position.x = -1

			RotateUpAxis(new_face, -ninety_deg, new THREE.Vector3(0, 1, 0))
			RotateUpAxis(new_face, 2*ninety_deg, new THREE.Vector3(1, 0, 0))
			new_face.up.set(-1, 0, 0)

			new_face.rotateY(-ninety_deg)
			new_face.rotateX(ninety_deg*2)
		}
		else if(face_names[i] == "right")
		{
			new_face.position.x = 1

			RotateUpAxis(new_face, ninety_deg, new THREE.Vector3(0, 1, 0))
			new_face.up.set(1, 0, 0)

			new_face.rotateY(ninety_deg)
		}

		new_face.scale.set(.9, .9, .9)
		new_face.updateMatrix()
		Cube_Template.new_cube.add(new_face)
		Cube_Template.new_cube.updateMatrix()
	}

	Cube_Template.highlightFace = Cube_Template.face.clone()
	Cube_Template.highlightFace.material = new THREE.MeshBasicMaterial({'color' : 0x000000})
	Cube_Template.highlightFace.material.transparent = true
	Cube_Template.highlightFace.material.opacity = 0.1

	Cube_Template.highlightEdge = Cube_Template.hinge.clone()
	Cube_Template.highlightEdge.material = new THREE.MeshBasicMaterial({'color' : 0x000000})
	Cube_Template.highlightEdge.material.transparent = true
	Cube_Template.highlightEdge.material.opacity = 0.1


	Cube_Template.highlightFace.matrixAutoUpdate = false
	Cube_Template.highlightEdge.matrixAutoUpdate = false

	Cube_Template.highlightEdge.scale.set(1.3, 1.0, 1.3)
	Cube_Template.highlightFace.scale.set(.9, .9, .9)

	Cube_Template.highlightFace.updateMatrix()
	Cube_Template.highlightEdge.updateMatrix()

}