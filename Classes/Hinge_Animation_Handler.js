function HingeAnimationHandler(face_list, edge, polycube, visualizer, controller, rads, duration){

	this.finished = false

	var polycube_visualizer = visualizer
	var cont = controller

	var hinge = edge
	var real_f_list = face_list
	var fake_f_list = []
	var max_angle = rads
	var dur = duration
	var max_speed = (max_angle / duration)
	var total_rot = 0
	var total_time = 0

	var ease_max = Ease(1) 

	var p_cube = polycube

	var that = this

	GenerateAndRenderFakeFaces()

	this.RotateFaces = function(deltaTime)
	{

		let percentage = total_time / duration
		let rotStep = (Ease(percentage) / ease_max) * max_speed * deltaTime

		console.log(ease_max)

		total_rot += Math.abs(rotStep)
		total_time += deltaTime

		if(total_rot >= Math.abs(max_angle))
		{
			CleanUp()
			polycube_visualizer.RotateAllFaces(real_f_list, hinge, p_cube, max_angle, cont)
			
			this.finished = true
		}
		else
		{
			polycube_visualizer.RotateOnlyViewFaces(fake_f_list, hinge, p_cube, rotStep)
		}
	}

	function GenerateAndRenderFakeFaces()
	{ 
		for(var f in real_f_list)
		{
			let f_obj = polycube_visualizer.GetViewFaceMesh(p_cube.id, real_f_list[f].name)
			
			fake_f_list.push(f_obj.clone())
			polycube_visualizer.AddObjectToViewPolycube(p_cube.id, fake_f_list[f])

			polycube_visualizer.HideFace(p_cube.id, real_f_list[f].name)
		}
	}

	function CleanUp()
	{
		for(var f in fake_f_list)
		{
			polycube_visualizer.RemoveObjectFromViewPolycube(p_cube.id, fake_f_list[f])
			polycube_visualizer.ShowFace(p_cube.id, fake_f_list[f].name)

			delete fake_f_list[f]
		}

		delete fake_f_list
		
	}

	function Ease(t)
	{
		return 1 - (1 / ((t + 1) * (t + 1) * (t + 1) * (t + 1)))
	}
}