function HingeAnimationHandler(face_list, edge, polycube, visualizer, controller, rads, duration){

	this.finished = false

	var polycube_visualizer = visualizer
	var cont = controller

	var hinge = edge
	var real_f_list = face_list
	var fake_f_list = []
	var fake_h_list = []
	var max_angle = rads
	var dur = duration
	var total_rot = 0
	var total_time = 0
	var p_cube = polycube


	var that = this

	RenderDummyMeshes()

	this.RotateFaces = function(deltaTime)
	{

		let percentage = total_time / dur
		let rotStep = SmoothStep(percentage) * max_angle * deltaTime

		total_rot += Math.abs(rotStep)
		total_time += deltaTime

		if(total_rot >= Math.abs(max_angle))
		{
			CleanUp()
			polycube_visualizer.RotateFaces(real_f_list, hinge, p_cube, max_angle, cont)
			
			this.finished = true
		}
		else
		{
			RotateMeshes(fake_f_list, fake_h_list, hinge, p_cube, rotStep)
		}
	}

	function RotateMeshes(face_list, highlight_list, hinge_object, polycube, rads)
	{
		//Get the axis we are going to rotate around
		let edge_pos = new THREE.Vector3().copy(polycube_visualizer.view_polycubes[polycube.id].getObjectByName(hinge_object.name).getWorldPosition())
		let axis = polycube.Get_Edge_Data(hinge_object.name).axis

		let q = new THREE.Quaternion(); // create once and reuse

		q.setFromAxisAngle( axis, rads ); // axis must be normalized, angle in radians

		for(var f in face_list)
		{
			let f_mesh = face_list[f]

			var dir_from_hinge = new THREE.Vector3().subVectors(f_mesh.getWorldPosition(), edge_pos)
			dir_from_hinge.applyQuaternion(q)
			dir_from_hinge.add(edge_pos)

			f_mesh.position.copy(dir_from_hinge)
			f_mesh.quaternion.premultiply(q)
			f_mesh.updateMatrix()
		}

		
		for(var h in highlight_list)
		{
			let h_mesh = fake_h_list[h]

			var dir_from_hinge = new THREE.Vector3().subVectors(h_mesh.getWorldPosition(), edge_pos)
			dir_from_hinge.applyQuaternion(q)
			dir_from_hinge.add(edge_pos)

			h_mesh.position.copy(dir_from_hinge)
			h_mesh.quaternion.premultiply(q)
			h_mesh.updateMatrix()
		}
		
	}

	function RenderDummyMeshes()
	{ 
		for(var f in real_f_list)
		{
			let f_obj = polycube_visualizer.GetViewFaceMesh(p_cube.id, real_f_list[f].name)
			
			fake_f_list.push(f_obj.clone())

			let highlight_list = polycube_visualizer.GetAllHighlights(p_cube.id, real_f_list[f].name)

			for(var h in highlight_list)
			{
				let fake_h = highlight_list[h].clone()
				fake_h.material = new THREE.MeshBasicMaterial()

				fake_h.material.color = highlight_list[h].material.color
				fake_h.material.transparent = true
				fake_h.material.opacity = highlight_list[h].material.opacity

				fake_h.position.copy(highlight_list[h].getWorldPosition())
				fake_h.rotation.copy(highlight_list[h].getWorldRotation())

				fake_h_list.push(fake_h)

				polycube_visualizer.AddObjectToViewPolycube(p_cube.id, fake_h)
			}

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

		for(var h in fake_h_list)
		{
			polycube_visualizer.RemoveObjectFromViewPolycube(p_cube.id, fake_h_list[h])

			delete fake_h_list[h]
		}

		delete fake_h_list
		delete fake_f_list
		
	}

	function SmoothStep(t)
	{
		return (3*t*t) + (2*t*t)
	}
}