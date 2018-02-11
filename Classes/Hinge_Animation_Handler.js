function HingeAnimationHandler(face_list, edge, polycube, visualizer, controller, rads, duration){

	this.finished = false

	var p_cube = polycube
	var hinge = edge
	var f_list = face_list
	var max_angle = rads
	var dur = duration
	var total_rot = 0
	var polycube_visualizer = visualizer
	var cont = controller

	var that = this

	this.RotateFaces = function(deltaTime)
	{
		console.log("Delta time:")
		console.log(deltaTime)

		let rotStep = (max_angle / duration)*deltaTime

		total_rot += Math.abs(rotStep)

		if(total_rot >= Math.abs(max_angle))
		{
			polycube_visualizer.CorrectPosition(f_list, polycube)
			
			this.finished = true
		}
		else
		{
			console.log("Rotating!")
			polycube_visualizer.RotateSubGraph(f_list, hinge, p_cube, rotStep, cont)
		}
	}
}