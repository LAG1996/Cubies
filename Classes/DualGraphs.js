function FaceEdgeDualGraph(){
	var Faces = []
	var Edges = []

	this.AddNeighboringFaces = function(name_1, face_1, name_2, face_2)
	{
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
	}

	this.AddNeighboringEdges = function(name_1, edge_1, name_2, edge_2)
	{
		var new_edge_1
		var new_edge_2

		if(!(name_1 in Edges))
		{
			new_edge_1 = {"name": name_1, "edge": edge_1, "neighbors": [], "currneighbors": []}
			Edges[name_1] = new_edge_1
		}
		else
		{
			new_edge_1 = Edges[name_1]
		}

		if(!(name_2 in Edges))
		{
			new_edge_2 = {"name": name_2, "edge": edge_2, "neighbors": [], "currneighbors": []}
			Edges[name_2] = new_edge_2
		}
		else
		{
			new_edge_2 = Edges[name_2]
		}

		if(ObjectExists(new_edge_1["incidentEdge"]))
		{
			if(!ObjectExists(new_edge_1["incidentEdge"][name_2])){
				new_edge_1["neighbors"][name_2] = new_edge_2
				new_edge_1["currneighbors"][name_2] = new_edge_2
			}
		}

		if(ObjectExists(new_edge_2["incidentEdge"]))
		{
			if(!ObjectExists(new_edge_2["incidentEdge"][name_1])){
				new_edge_2["neighbors"][name_1] = new_edge_1
				new_edge_2["currneighbors"][name_1] = new_edge_1
			}
		}		
	}

	this.AddIncidentEdges = function(name_1, edge_1, name_2, edge_2)
	{
		var new_edge_1
		var new_edge_2

		if(!(name_1 in Edges))
		{
			new_edge_1 = {"name": name_1, "edge": edge_1, "neighbors": [], "currneighbors": []}
			Edges[name_1] = new_edge_1
		}
		else
		{
			new_edge_1 = Edges[name_1]
		}

		if(!(name_2 in Edges))
		{
			new_edge_2 = {"name": name_2, "edge": edge_2, "neighbors": [], "currneighbors": []}
			Edges[name_2] = new_edge_2
		}
		else
		{
			new_edge_2 = Edges[name_2]
		}

		new_edge_1["incidentEdge"] = new_edge_2
		new_edge_2["incidentEdge"] = new_edge_1
	}

	this.RemoveFace = function(name){
		var face = Faces[name]

		if(ObjectExists(face))
		{
			for(var N in face["neighbors"])
			{
				var neighbor = face["neighbors"][N]
				delete neighbor["currneighbors"][name]
				delete neighbor["neighbors"][name]
			}

			delete Faces[name]
		}
	}

	this.RemoveEdge = function(name){
		var edge = Edges[name]

		if(ObjectExists(edge))
		{
			for(var N in edge["neighbors"])
			{
				var neighbor = edge["neighbors"][N]
				delete neighbor["currneighbors"][name]
				delete neighbor["neighbors"][name]
			}

			if(ObjectExists(edge["incidentEdge"]))
			{
				delete edge["incidentEdge"]["incidentEdge"]
			}

			delete Edges[name]
		}
	}	
}