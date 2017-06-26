function DualGraph()
{
	var Faces = []
	var Edges = []

	this.AddNeighboringFaces = function(name_1, face_1, name_2, face_2)
	{
		console.log("Adding faces: " + name_1 + " | " + name_2 + " to face graph")
		var new_face_1
		var new_face_2

		if(!(name_1 in Faces))
		{
			new_face_1 = {"name": name_1, "face": face_1, "neighbors": [], "currneighbors": []}
			Faces[name_1] = new_face_1
		}
		else
		{
			new_face_1 = Faces[name_1]
		}

		if(!(name_2 in Faces))
		{
			new_face_2 = {"name": name_2, "face": face_2, "neighbors": [], "currneighbors": []}
			Faces[name_2] = new_face_2
		}
		else
		{
			new_face_2 = Faces[name_2]
		}

		new_face_1["neighbors"][name_2] = new_face_2
		new_face_2["neighbors"][name_1] = new_face_1

		new_face_1["currneighbors"][name_2] = new_face_2
		new_face_2["currneighbors"][name_1] = new_face_1


		console.log(Faces)
	}

	this.RemoveFace = function(name){
		var face = Faces[name]

		if(ObjectExists(face))
		{
			for(var N in face["neighbors"])
			{
				delete face["neighbors"][N]["neighbors"][name]
				delete face["neighbors"][N]["currneighbors"][name]
			}

			delete Faces[name]
		}
	}
}