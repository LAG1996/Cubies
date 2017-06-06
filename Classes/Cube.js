function Cube(scene, material = new THREE.MeshBasicMaterial({color:0x0000FF})){

		this.Obj = new THREE.Group()
		this.material = material

		var _VisibleFaces = []

		var that = this

		_GenerateFaces(scene)

		function _GenerateFaces(scene)
		{
			var manager = new THREE.LoadingManager()
			var loader = new THREE.OBJLoader(manager)

			var face = new THREE.Object3D()
			var hinge = new THREE.Object3D()

			loader.load('./Models/cubeFace.obj', function (object) {
				
				object.traverse(function(child){
					
					if(child instanceof THREE.Mesh){
						child.material = that.material
					}

				})

				face.add(object)

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

				hinge.add(object)

			}, function(xhr){
				if(xhr.lengthComputable) {
					var percentComplete = xhr.loaded/xhr.total * 100
					console.log(Math.round(percentComplete, 2) + '% downloaded')
				}

			}, function(xhr) {
				console.log("File cannot be read")
			})

			that.Obj.add(face)
			that.Obj.add(hinge)
			hinge.position.x += 1
		}
}