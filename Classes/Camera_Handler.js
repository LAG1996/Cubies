function Camera_Handler(camera){

	this.camera = camera
	this.center = new THREE.Vector3(0, 0, 0)
	this.radius = this.camera.position.sub(this.center).length()
	this.camera.position.add(this.center)

	var modes = ['tp', 'orb']
	var mode = modes[0]
	var that = this

	this.HandlePan = function(deltaX, deltaY, deltaTime){

		that.camera.translateX(-1*deltaX*deltaTime)
		that.camera.translateY(deltaY*deltaTime)

		if(that.mode == 'orb')
		{
			that.camera.lookAt(that.center)
		}

		that.camera.updateProjectionMatrix()
	}

	this.HandleRotate = function(deltaX, deltaY, deltaTime){
		if(that.mode == 'tp')
		{
			that.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1*deltaX*deltaTime)
			that.camera.rotation.x += deltaY*deltaTime
		}
		else
		{
			old_pos = new THREE.Vector3(that.camera.position.x, that.camera.position.y, that.camera.position.z)

			that.camera.translateX(-1*deltaX*deltaTime)
			that.camera.translateY(deltaY*deltaTime)

			dir = old_pos.sub(that.camera.position)
			dir.multiplyScalar(-1)

			that.center.add(dir)

			that.camera.position.clone(old_pos)
		}
		
		that.camera.updateProjectionMatrix()
	}

	this.HandleZoom = function(delta, deltaTime)
	{
		that.camera.translateZ(-1*delta*deltaTime)
		that.radius = that.camera.position.sub(that.center).length()
		that.camera.position.add(that.center)
		that.camera.updateProjectionMatrix()
	}

	this.SwitchToMode = function(mode_num)
	{
		that.mode = modes[mode_num]
		
		if(that.mode == 'orb')
		{
			that.camera.lookAt(that.center)
		}
	}
}