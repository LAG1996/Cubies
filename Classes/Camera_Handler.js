function Camera_Handler(camera, renderer){

	this.camera = camera
	this.center = new THREE.Vector3(0, 0, 0)

	this.pan_speed = 2
	this.orbit_speed = 4
	this.rotation_speed = 0.1

	var modes = ['orb', 'tp']
	var mode = 'orb'

	var orbit_control = new THREE.OrbitControls(this.camera, renderer.domElement)

	var that = this

	this.HandlePan = function(deltaX, deltaY, deltaTime){
		
		if(mode == 'tp')
		{
			that.camera.translateX(-1*deltaX*that.pan_speed*deltaTime)
			that.camera.translateY(deltaY*that.pan_speed*deltaTime)
		}

		that.camera.updateProjectionMatrix()
	}

	this.HandleRotate = function(deltaX, deltaY, deltaTime){
		if(mode == 'tp')
		{
			that.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1*deltaX*that.rotation_speed*deltaTime)
			that.camera.rotation.x += deltaY*deltaTime*that.rotation_speed
		}
		
		that.camera.updateProjectionMatrix()
	}

	this.HandleZoom = function(delta, deltaTime)
	{
		that.camera.translateZ(-1*delta*deltaTime)
		Calculate_Radius()
		that.camera.updateProjectionMatrix()
	}

	this.SwitchToMode = function(mode_num)
	{
		mode = modes[mode_num]
		
		if(mode == 'orb')
		{
			that.camera.lookAt(that.center)
			orbit_control.enabled = true
		}
		else if(mode == 'tp')
		{
			orbit_control.enabled = false
		}
	}

	function Calculate_Radius()
	{
		return that.camera.position.distanceTo(that.center)
	}

	function Calculate_Phi()
	{
		return Math.atan2(that.camera.position.y - that.center.y, that.camera.position.x - that.center.x)
	}

	function Calculate_Theta(radius)
	{
		return Math.acos((that.camera.position.z - that.center.z) / radius)
	}
}