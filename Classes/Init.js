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
			console.log("I do have my parts")
		 clearInterval(has_parts_interv)
		}
		else
		{
			console.log("I do not have parts")
		}
		}, 10)

	var is_complete_interv = setInterval(function(){
		if(CheckIfComplete()){
		 console.log("I am complete")
		 clearInterval(is_complete_interv)
		}
		else
		{
			console.log("I am not complete")
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
					console.log(Math.round(percentComplete, 2) + '% downloaded')
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
					console.log(Math.round(percentComplete, 2) + '% downloaded')
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
			Cube.GenerateCube(that.cubeFace, that.cubeHinge)
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