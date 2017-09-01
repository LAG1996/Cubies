function BuildPolyTest(){

	this.Test1 = function(){

		var p_cube = PolyCube.GenerateNewPolyCube(new THREE.Vector3(0, 0, 0))

		if(p_cube.name != "PolyCube_" + (PolyCube.Next_ID - 1))
		{
			throw "TEST 1: INCORRECT NAME::POLYCUBE NAME IS " + p_cube.name + "::SHOULD BE PolyCube_"+ (PolyCube.Next_ID-1)
		}


		p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))

		if(Object.keys(p_cube.Cube_Map).length != 1)
		{
			throw "TEST 1: CUBE ADDING ERROR"
		}

		for(var w_1 in PolyCube.direction_words)
		{
			var face_name_1 = "c0"+PolyCube.direction_words[w_1]

			var face_1 = p_cube.Get_Face(face_name_1)

			if(!p_cube.GetCubeAtPosition(new THREE.Vector3(0, 0, 0)).has_faces[PolyCube.direction_words[w_1]])
			{
				throw "TEST 1: CUBE MISSING FACE " + PolyCube.direction_words[w_1]
			}

			for(var w_2 in PolyCube.direction_words)
			{
				var face_name_2 = "c0"+PolyCube.direction_words[w_2]

				if(face_name_1 == face_name_2 && ObjectExists(face_1.neighbors[face_name_2]))
				{
					throw "TEST 1: IDENTICAL NEIGHBOR"
				}

				if(PolyCube.direction_words[w_1] == PolyCube.direction_words_to_opposites[PolyCube.direction_words[w_2]] && ObjectExists(face_1.neighbors[face_name_2])) 
				{
					throw "TEST 2: OPPOSITE NEIGHBORS"
				}
			}
		}

		var edge = p_cube.Get_Edge("c0right_up")

		if(edge.incidentEdge.name != "c0up_right")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0right_right")

		if(edge.incidentEdge.name != "c0back_left")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0right_down")

		if(edge.incidentEdge.name != "c0down_left")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}
		
		edge = p_cube.Get_Edge("c0right_left")

		if(edge.incidentEdge.name != "c0front_right")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0front_up")

		if(edge.incidentEdge.name != "c0up_down")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0front_down")

		if(edge.incidentEdge.name != "c0down_up")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0front_left")

		if(edge.incidentEdge.name != "c0left_right")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0left_up")

		if(edge.incidentEdge.name != "c0down_right")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0left_down")

		if(edge.incidentEdge.name != "c0up_left")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0left_left")

		if(edge.incidentEdge.name != "c0back_right")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0back_up")

		if(edge.incidentEdge.name != "c0down_down")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}

		edge = p_cube.Get_Edge("c0back_down")

		if(edge.incidentEdge.name != "c0up_up")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE"
		}
	}

	this.Test2 = function(){

		var p_cube = PolyCube.GenerateNewPolyCube(new THREE.Vector3(0, 0, 0))

		if(p_cube.name != "PolyCube_" + (PolyCube.Next_ID - 1))
		{
			throw "TEST 2: INCORRECT NAME::POLYCUBE NAME IS " + p_cube.name + "::SHOULD BE PolyCube_"+ (PolyCube.Next_ID-1)
		}


		p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 1, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 2, 0))


		if(Object.keys(p_cube.Cube_Map).length != 3)
		{
			throw "TEST 2: CUBE ADDING ERROR"
		}

		for(var key in p_cube.Cube_Map)
		{
			if(p_cube.Cube_Map[key].position.equals(new THREE.Vector3(0, 2, 0)))
			{
				if(p_cube.Cube_Map[key].has_faces["down"])
				{
					throw "TEST 2: INCORRECT FACES::TOP CUBE HAS BOTTOM FACE" 
				}
			}
			else if(p_cube.Cube_Map[key].position.equals(new THREE.Vector3(0, 2, 0)))
			{
				if(p_cube.Cube_Map[key].has_faces["up"])
				{
					throw "TEST 2: INCORRECT FACES::MIDDLE CUBE HAS TOP FACE"
				}

				if(p_cube.Cube_Map[key].has_faces["down"])
				{
					throw "TEST 2: INCORRECT FACES::MIDDLE CUBE HAS BOTTOM FACE"
				}
			}
			else
			{
				if(p_cube.Cube_Map[key].has_faces["up"])
				{
					throw "TEST 2: INCORRECT FACES::BOTTOM CUBE HAS TOP FACE"
				}

			}
		}

		edge = p_cube.Get_Edge("c0left_down")

		if(edge.incidentEdge.name != "c1left_up")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c0front_up")

		if(edge.incidentEdge.name != "c1front_down")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c0right_up")

		if(edge.incidentEdge.name != "c1right_down")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c0back_down")

		if(edge.incidentEdge.name != "c1back_up")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}


		edge = p_cube.Get_Edge("c1left_down")

		if(edge.incidentEdge.name != "c2left_up")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1front_up")

		if(edge.incidentEdge.name != "c2front_down")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1right_up")

		if(edge.incidentEdge.name != "c2right_down")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1back_down")

		if(edge.incidentEdge.name != "c2back_up")
		{
			throw "TEST 1: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

	}

	this.Test3 = function(){

		var p_cube = PolyCube.GenerateNewPolyCube(new THREE.Vector3(0, 0, 0))

		if(p_cube.name != "PolyCube_" + (PolyCube.Next_ID - 1))
		{
			throw "TEST 2: INCORRECT NAME::POLYCUBE NAME IS " + p_cube.name + "::SHOULD BE PolyCube_"+ (PolyCube.Next_ID-1)
		}


		p_cube.Add_Cube(new THREE.Vector3(0, 0, 0)) //New cube c0
		p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 1, 0)) //New cube c1
		p_cube.Add_Cube(new THREE.Vector3(0, 2, 0)) //New cube c2
		p_cube.Add_Cube(new THREE.Vector3(0, 1, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 2, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))
		p_cube.Add_Cube(new THREE.Vector3(0, 2, 0))

		p_cube.Add_Cube(new THREE.Vector3(1, 1, 0)) //New cube c3
		p_cube.Add_Cube(new THREE.Vector3(-1, 2, 0)) //New cube c4
		p_cube.Add_Cube(new THREE.Vector3(1, 2, 0)) //New cube c5
		p_cube.Add_Cube(new THREE.Vector3(0, 2, -1)) //New cube c6
		p_cube.Add_Cube(new THREE.Vector3(0, 2, -1))


		if(Object.keys(p_cube.Cube_Map).length != 7)
		{
			throw "TEST 3: CUBE ADDING ERROR"
		}

		for(var key in p_cube.Cube_Map)
		{
			if(p_cube.Cube_Map[key].position.equals(new THREE.Vector3(0, 2, 0)))
			{
				if(p_cube.Cube_Map[key].has_faces["down"])
				{
					throw "TEST 3: INCORRECT FACES::TOP CUBE HAS BOTTOM FACE" 
				}

				if(p_cube.Cube_Map[key].has_faces["left"])
				{
					throw "TEST 3: INCORRECT FACES::TOP CUBE HAS LEFT FACE" 
				}

				if(p_cube.Cube_Map[key].has_faces["right"])
				{
					throw "TEST 3: INCORRECT FACES::TOP CUBE HAS RIGHT FACE" 
				}

				if(p_cube.Cube_Map[key].has_faces["back"])
				{
					throw "TEST 3: INCORRECT FACES::TOP CUBE HAS BACK FACE" 
				}
			}
			else if(p_cube.Cube_Map[key].position.equals(new THREE.Vector3(0, 2, 0)))
			{
				if(p_cube.Cube_Map[key].has_faces["up"])
				{
					throw "TEST 3: INCORRECT FACES::MIDDLE CUBE HAS TOP FACE"
				}

				if(p_cube.Cube_Map[key].has_faces["down"])
				{
					throw "TEST 3: INCORRECT FACES::MIDDLE CUBE HAS BOTTOM FACE"
				}

				if(p_cube.Cube_Map[key].has_faces["right"])
				{
					throw "TEST 3: INCORRECT FACES::MIDDLE CUBE HAS RIGHT FACE" 
				}
			}
			else if(p_cube.Cube_Map[key].position.equals(new THREE.Vector3(0, 0, 0)))
			{
				if(p_cube.Cube_Map[key].has_faces["up"])
				{
					throw "TEST 3: INCORRECT FACES::BOTTOM CUBE HAS TOP FACE"
				}
			}
			else if(p_cube.Cube_Map[key].position.equals(new THREE.Vector3(1, 1, 0)))
			{
				if(p_cube.Cube_Map[key].has_faces["up"])
				{
					throw "TEST 3: INCORRECT FACES::CUBE HAS TOP FACE"
				}

				if(p_cube.Cube_Map[key].has_faces["left"])
				{
					throw "TEST 3: INCORRECT FACES::CUBE HAS TOP FACE"
				}
			}
		}

		edge = p_cube.Get_Edge("c0left_down")

		if(edge.incidentEdge.name != "c1left_up")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c0front_up")

		if(edge.incidentEdge.name != "c1front_down")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c0right_up")

		if(edge.incidentEdge.name != "c3down_right")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c0back_down")

		if(edge.incidentEdge.name != "c1back_up")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}


		edge = p_cube.Get_Edge("c1left_down")

		if(edge.incidentEdge.name != "c4down_left")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1front_right")

		if(edge.incidentEdge.name != "c3front_left")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1back_left")

		if(edge.incidentEdge.name != "c3back_right")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1front_up")

		if(edge.incidentEdge.name != "c2front_down")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}

		edge = p_cube.Get_Edge("c1back_down")

		if(edge.incidentEdge.name != "c6down_up")
		{
			throw "TEST 3: INCORRECT INCIDENT EDGE::NAME OF THIS EDGE " + edge.incidentEdge.name
		}
	}


	this.Test1()
	this.Test2()
	this.Test3()


}