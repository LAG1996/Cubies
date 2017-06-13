function Camera_Handler(camera){

	this.camera = camera
	this.floater = new THREE.Object3D()
	this.floater.position.copy(new THREE.Vector3(0, 0, 0))
	this.floater.add(this.camera)

	var phi = 60
	var theta = 60
	var that = this

	this.HandlePan = function(deltaX, deltaY, deltaTime){
		that.camera.translateX(-1*deltaX*deltaTime)
		that.camera.translateY(deltaY*deltaTime)

		that.camera.updateProjectionMatrix()
	}

	this.HandleRotate = function(deltaX, deltaY, deltaTime){
		that.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1*deltaX*deltaTime)
		that.camera.rotation.x += deltaY*deltaTime
		that.camera.updateProjectionMatrix()
	}

	this.HandleZoom = function(delta, deltaTime)
	{
		that.camera.translateZ(-1*delta*deltaTime)
	}
}