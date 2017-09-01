function BuildPolyTest(){


	this.Test1 = function(){

		var p_cube = PolyCube.GenerateNewPolyCube(new THREE.Vector3(0, 0, 0))

		if(p_cube.name != PolyCube.Next_ID - 1)
		{
			throw "TEST 1: INCORRECT NAME"
		}


		var p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))

		if(Object.keys(p_cube.Map_Cubes).length != 1)
		{
			throw "TEST 1: CUBE ADDING ERROR"
		}

		for(var w_1 in PolyCube.direction_words)
		{
			var face_name_1 = "c0"+w_1

			var face_1 = p_cube.Get_Face(face_name_1)

			if(!p_cube.GetCubeAtPosition(new Vector3(0, 0, 0)).has_faces[w_1])
			{
				throw "TEST 1: CUBE MISSING FACES"
			}

			for(var w_2 in PolyCube.direction_words)
			{
				var face_name_2 = "c0"+w_2

				if(face_name_1 == face_name_2 && ObjectExists(face_1.neighbors[face_name_2]))
				{
					throw "TEST 1: IDENTICAL NEIGHBOR"
				}

				if(w_1 == PolyCube.direction_words_to_opposites[w_2] && ObjectExists(face_1.neighbors[face_name_2])) 
				{
					throw "TEST 2: OPPOSITE NEIGHBORS"
				}
			}
		}

		console.log("Test 1 passed!")

	}

	this.Test2 = function(){}

	this.Test3 = function(){}

	this.Test4 = function(){}

	this.Test6 = function(){}


}