//A class that handles animating folding and unfolding. Called in the controller asynchronously.
//Animation is done by manipulating copies of the faces on the polycube to smoothly transition from
//the starting orientation to their ending orientation. Once the animation is over,
//the real faces are snapped directly to the end orientation, and then shown to the user, while
//the copies are deleted.
function HingeAnimationHandler(face_list, edge, polycube, visualizer, controller, rads, duration){

	this.finished = false	//Flag for checking if the animation is finished.

	var polycube_visualizer = visualizer 	//Save a reference to the polycube visualizer
	var cont = controller					//Save a reference to the controller

	var p_cube = polycube  					//Save a refrence to the polycube
	var hinge = edge 						//Save a reference to the edge the user picked to rotate around.
	var real_f_list = face_list				//Save a reference to list of faces the user chose to rotate
	var fake_f_list = []					//A list that will hold copies of the faces
	var fake_h_list = []					//A list that will hold copies of the highlights attached to the faces
	var max_angle = rads 					//The angle in radians we will be rotating around
	var dur = duration						//The amount of time in seconds that the animation will take
	var total_rot = 0 						//The amount the faces have rotated in the animation
	var elapsed_time = 0					//The amount of time elapsed in seconds since the animation has started			


	var that = this							//Alternative reference to this object

	//Render the fake faces and highlights.
	RenderDummyMeshes()

	//Input: The amount of time since the last frame
	//Result: Rotates the chosen faces around the chosen hinge in a smooth animation. Also decides if the animation
	//is finished.
	this.RotateFaces = function(deltaTime)
	{

		//Percentage of the animation completed
		let percentage = elapsed_time / dur
		//Calculates the amount to rotate by
		let rotStep = SmoothStep(percentage) * max_angle * deltaTime

		//Accumulate the amount of rotation
		total_rot += Math.abs(rotStep)

		//Accumulate the amount of time elapsed for the animation
		elapsed_time += deltaTime


		//If the faces have rotated all the way, the animation is finished.
		//If not, interpolate.
		if(total_rot >= Math.abs(max_angle))
		{
			CleanUp()
			polycube_visualizer.RotateFaces(real_f_list, hinge, p_cube, max_angle, cont) //Snaps the real faces to the new rotated position
			
			this.finished = true
		}
		else
		{
			RotateMeshes(fake_f_list, fake_h_list, hinge, p_cube, rotStep) //Interpolates the fake faces' rotations
		}
	}

	//Input: The list of faces, the list of highlights, the hinge to rotate around, the polycube, and the amount of radians
	//we are rotating by.
	//Result: Rotates the face and highlight meshes by `rads` radians.
	function RotateMeshes(face_list, highlight_list, hinge_object, polycube, rads)
	{
		//Get the axis we are going to rotate around
		let edge_pos = new THREE.Vector3().copy(polycube_visualizer.view_polycubes[polycube.id].getObjectByName(hinge_object.name).getWorldPosition())
		
		console.log(edge_pos)

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

	//Result: 
	//-Renders copies of the faces and highlights we wish to rotate.
	//-Hides the original meshes
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

	//Result:
	//-Deletes the copies that were interpolated
	//-Shows the original meshes
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

	//Input: Time in seconds
	//Output: A point on a normalized smooth step curve
	function SmoothStep(t)
	{
		return (3*t*t) + (2*t*t)
	}
}