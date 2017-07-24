function FaceEdgeDualGraph(){
	var Faces = []
	var Edges = []

	var Cut_Edges = []
	var Invalid_Edges = []

	var Visited_Faces = []
	var Visited_Edges = []

	var Edge2CutPath = {} //An object that maps each edge to a path
	var L_CutPaths = []

	var PerpendicularCuts = {}//An object that maps each edge to perpendicular edges
	var ParallelCuts = {} //An object that maps each edge to parallel edges
	var CollinearCuts = {} //An object that maps each edge to collinear edges

	var that = this

	this.AddNeighboringFaces = function(name_1, face_1, name_2, face_2)
	{
		var new_face_1
		var new_face_2

		if(!(name_1 in Faces))
		{
			new_face_1 = {"name": name_1, "face": face_1, "neighbors": [], "visited" : false}
			Faces[name_1] = new_face_1
		}
		else
		{
			new_face_1 = Faces[name_1]
		}

		if(!(name_2 in Faces))
		{
			new_face_2 = {"name": name_2, "face": face_2, "neighbors": [], "visited" : false}
			Faces[name_2] = new_face_2
		}
		else
		{
			new_face_2 = Faces[name_2]
		}

		new_face_1["neighbors"][name_2] = new_face_2
		new_face_2["neighbors"][name_1] = new_face_1
	}

	this.GetNeighboringFaces = function(name){
		return Faces[name]["neighbors"]
	}

	this.AddNeighboringEdges = function(name_1, edge_1, endPoints_1, name_2, edge_2, endPoints_2)
	{
		var new_edge_1
		var new_edge_2

		if(!(name_1 in Edges))
		{
			new_edge_1 = {"name": name_1, "edge": edge_1, "endPoints" : endPoints_1, "neighbors": [], "cut" : true, "invalid": false, "visited": false}
			Edges[name_1] = new_edge_1
		}
		else
		{
			new_edge_1 = Edges[name_1]
		}

		if(!(name_2 in Edges))
		{
			new_edge_2 = {"name": name_2, "edge": edge_2, "neighbors": [], "endPoints" : endPoints_2, "cut" : true, "invalid": false, "visited": false}
			Edges[name_2] = new_edge_2
		}
		else
		{
			new_edge_2 = Edges[name_2]
		}

		if(ObjectExists(new_edge_1["incidentEdge"]))
		{
			if(!ObjectExists(new_edge_1["incidentEdge"]["neighbors"][name_2])){
				new_edge_1["neighbors"][name_2] = new_edge_2
			}
		}
		else
		{
				new_edge_1["neighbors"][name_2] = new_edge_2
		}

		if(ObjectExists(new_edge_2["incidentEdge"]))
		{
			if(!ObjectExists(new_edge_2["incidentEdge"]["neighbors"][name_1])){
				new_edge_2["neighbors"][name_1] = new_edge_1
			}
		}
		else
		{
			new_edge_2["neighbors"][name_1] = new_edge_1
		}		
	}

	this.GetNeighboringEdges = function(name){
		var list = []
		for(var N in Edges[name]["neighbors"])
		{
			list.push(Edges[name]["neighbors"][N])
		}

		if(ObjectExists(Edges[name]["incidentEdge"])){

			for(var N in Edges[name]["incidentEdge"]["neighbors"])
			{
				list.push(Edges[name]["incidentEdge"]["neighbors"][N])
			}
		}

		return list
	}

	this.AddIncidentEdges = function(name_1, edge_1, endPoints_1, name_2, edge_2, endPoints_2)
	{
		var new_edge_1
		var new_edge_2

		if(!(name_1 in Edges))
		{
			new_edge_1 = {"name": name_1, "edge": edge_1, "endPoints" : endPoints_1, "neighbors": [], "cut" : false, "invalid": false, "visited": false}
			Edges[name_1] = new_edge_1
		}
		else
		{
			new_edge_1 = Edges[name_1]
			new_edge_1["cut"] = false
			new_edge_1["invalid"] = false
		}

		if(!(name_2 in Edges))
		{
			new_edge_2 = {"name": name_2, "edge": edge_2, "endPoints" : endPoints_2, "neighbors": [], "cut" : false, "invalid": false, "visited": false}
			Edges[name_2] = new_edge_2
		}
		else
		{
			new_edge_2 = Edges[name_2]
			new_edge_2["cut"] = false
			new_edge_2["invalid"] = false
		}

		new_edge_1["incidentEdge"] = new_edge_2
		new_edge_2["incidentEdge"] = new_edge_1

		delete Cut_Edges[new_edge_1['name']]
		delete Cut_Edges[new_edge_2['name']]

		//Now clean up their neighbor data to ensure that there is no redundancy

		for(var N in new_edge_1["neighbors"])
		{
			if(ObjectExists(new_edge_2["neighbors"][N]))
				delete new_edge_2["neighbors"][N]
		}
	}

	this.GetIncidentEdge = function(name)
	{
		if(ObjectExists(Edges[name]["incidentEdge"]))
		{
			return Edges[name]["incidentEdge"]
		}
		else
			return null
	}

	this.HandleCut = function(edge)
	{
		if(edge['cut'])
		{
			var edge_1 = Edges[edge.name]

			var edge_2 = edge_1["incidentEdge"]

			edge_1["cut"] = true
			edge_2["cut"] = true

			Cut_Edges[edge_1.name] = edge_1
			Cut_Edges[edge_2.name] = edge_2

			var v_face_1 = edge_1["edge"].parent
			var v_face_2 = edge_2["edge"].parent

			var face_1 = Faces[v_face_1.name]
			var face_2 = Faces[v_face_2.name]

			UndoCut(edge_1, edge_2, face_1, face_2)
		}
		else if(!edge['invalid'])
		{
			var otherPartsInspected = CutHinge(edge)

			//Check if the edge cut causes the graph to be disconnected
			var disc = CheckIfGloballyDisconnected(otherPartsInspected[1], otherPartsInspected[2])
			ClearVisitedFaces()
	
			if(disc)
			{
				UndoCut(edge_1, edge_2, otherPartsInspected[1], otherPartsInspected[2])
			}
		}

		//Check all neighbors of all cut edges in the polycube. If cutting them disconnects the face dual graph, then mark them as invalid

		//First clear the invalid neighbors list
		Invalid_Edges = {}

		//Now check the neighbors to se if they can be cut
		for(var E in Cut_Edges)
		{
			for(var N in Cut_Edges[E]['neighbors'])
			{
				var neighbor = Cut_Edges[E]['neighbors'][N]

				if(!neighbor['cut'])
				{
					var otherPartsInspected = CutHinge(neighbor)

					var disc = CheckIfGloballyDisconnected(otherPartsInspected[1], otherPartsInspected[2])
					ClearVisitedFaces()
					UndoCut(neighbor, otherPartsInspected[0], otherPartsInspected[1], otherPartsInspected[2])
	
					if(disc)
					{
						neighbor['invalid'] = true
						otherPartsInspected[0]['invalid'] = true

						Invalid_Edges[neighbor['name']] = neighbor
						Invalid_Edges[otherPartsInspected[0]['name']] = otherPartsInspected[0]
					}
					else
					{
						neighbor['invalid'] = false
						otherPartsInspected[0]['invalid'] = false
					}			
				}	
			}
		}

		BuildCutPaths()
		BuildHingePaths()
	}

	this.RemoveFace = function(name){
		var face = Faces[name]

		if(ObjectExists(face))
		{
			for(var N in face["neighbors"])
			{
				var neighbor = face["neighbors"][N]
				delete neighbor["neighbors"][name]
			}

			delete Faces[name]
		}
	}

	//Function to remove an edge from the edge dual graph. Edges would be removed if a face is removed, but this removal is handled separately by the function RemoveFace.
	this.RemoveEdge = function(name){
		var edge = Edges[name]
		var return_data = {}

		//Check if the edge name is valid
		if(ObjectExists(edge))
		{
			//Update all of the edge's neighbors to remove this edge from their list of neighbors
			for(var N in edge["neighbors"])
			{
				var neighbor = edge["neighbors"][N]
				delete neighbor["neighbors"][name]
			}

			//Check if this edge has an incident edge
			if(ObjectExists(edge["incidentEdge"]))
			{
				//Update all the incident edge's neighbors to remove this edge from their list of neighbors
				for(var N in edge["incidentEdge"]["neighbors"])
				{
					var neighbor = edge["incidentEdge"]["neighbors"][N]
					if(ObjectExists(neighbor["neighbors"][name]))
					{
						delete neighbor["neighbors"][name]
					}
				}

				//Update the incident edge to have the neighbors that this edge has.
				//This is because we want to ensure that there is no redundancy in the data.
				for(var N in edge["neighbors"])
				{
					var neighbor = edge["neighbors"][N]
					edge["incidentEdge"]["neighbors"][neighbor["name"]] = neighbor
				}

				edge["incidentEdge"]["cut"] = true
				Cut_Edges[edge["incidentEdge"]["name"]] = edge["incidentEdge"]
				
				delete edge["incidentEdge"]["incidentEdge"]
			}
			
			if(edge["cut"])
			{
				delete Cut_Edges[name]
			}

			delete Edges[name]
		}
		else
		{
			return null
		}
	}

	this.GetFace = function(name){
		return Faces[name]
	}

	this.GetEdge = function(name){
		return Edges[name]
	}

	this.GetCutEdges = function(){
		return Cut_Edges
	}

	this.GetInvalidEdges = function(){
		return Invalid_Edges
	}

	this.GetCutPaths = function(){
		return L_CutPaths
	}

	this.GetCollinearCuts = function(edgeName){
		var l_1 = CollinearCuts[edgeName]

		if(!ObjectExists(l_1))
		{
			l_1 = []
		}

		var i_edge = Edges[edgeName]['incidentEdge']

		if(ObjectExists(i_edge))
		{
			var l_2 = CollinearCuts[i_edge['name']]

			if(ObjectExists(l_2))
			{
				l_1 =  l_1.concat(CollinearCuts[i_edge['name']])
			}
		}

		return l_1
	}

	this.GetPerpendicularCuts = function(edgeName){
		var l_1 = PerpendicularCuts[edgeName]

		if(!ObjectExists(l_1))
		{
			l_1 = []
		}

		var i_edge = Edges[edgeName]['incidentEdge']

		if(ObjectExists(i_edge))
		{
			var l_2 = PerpendicularCuts[i_edge['name']]

			if(ObjectExists(l_2))
			{
				l_1 =  l_1.concat(PerpendicularCuts[i_edge['name']])
			}
		}

		return l_1
	}

	this.GetParallelCuts = function(edgeName){
		var l_1 = ParallelCuts[edgeName]

		if(!ObjectExists(l_1))
		{
			l_1 = []
		}

		var i_edge = Edges[edgeName]['incidentEdge']

		if(ObjectExists(i_edge))
		{
			var l_2 = ParallelCuts[i_edge['name']]

			if(ObjectExists(l_2))
			{
				l_1 =  l_1.concat(ParallelCuts[i_edge['name']])
			}
		}

		return l_1
	}

	function BuildCutPaths(){
		var start_cut
		var path_num = 0
		//Clear the cut path list
		//MEMO: This is a slow grow. I'm pretty sure I can do this faster with some preprocessing. We'll come back to this later.
		Edge2CutPath = {}
		L_CutPaths = []

		//Get the first edge in the cut list. Start growing greedily, getting all cuts in the path
		for(var E in Cut_Edges)
		{
			if(Object.keys(Edge2CutPath).length == Object.keys(Cut_Edges).length)
			{
				break
			}

			var new_cut_path = []
			start_cut = Cut_Edges[E]
			
			if(!start_cut['visited'])
			{
				start_cut = Cut_Edges[E]
				start_cut['visited'] = true
				start_cut['incidentEdge']['visited'] = true

				Visited_Edges.push(start_cut)
				Visited_Edges.push(start_cut['incidentEdge'])

				new_cut_path.push(start_cut)
				new_cut_path.push(start_cut['incidentEdge'])

				Edge2CutPath[start_cut['name']] = path_num
				Edge2CutPath[start_cut['incidentEdge']['name']] = path_num

				GreedyPathGrow(start_cut)
				GreedyPathGrow(start_cut['incidentEdge'])

				L_CutPaths[path_num] = new_cut_path

				path_num+=1
			}
		}

		ClearVisitedEdges()

		function GreedyPathGrow(cut){
			for(var N in cut['neighbors'])
			{
				var neighbor = cut['neighbors'][N]
				
				if(!neighbor['visited'] && neighbor['cut'])
				{
					Edge2CutPath[neighbor['name']] = path_num
					Edge2CutPath[neighbor['incidentEdge']['name']] = path_num

					neighbor['visited'] = true
					neighbor['incidentEdge']['visited'] = true

					Visited_Edges.push(neighbor)
					Visited_Edges.push(neighbor['incidentEdge'])

					new_cut_path.push(neighbor)
					new_cut_path.push(neighbor['incidentEdge'])

					GreedyPathGrow(neighbor)
					GreedyPathGrow(neighbor['incidentEdge'])
				}
			}
		}
	}

	function BuildHingePaths(){

		for(var index in L_CutPaths)
		{
			for(var edge in L_CutPaths[index])
			{
				var edge_1 = L_CutPaths[index][edge]

				CollinearCuts[edge_1.name] = []
				ParallelCuts[edge_1.name] = []
				PerpendicularCuts[edge_1.name] = []

				for(var other_edge in L_CutPaths[index])
				{
					var edge_2 = L_CutPaths[index][other_edge]

					if(edge_1['name'] != edge_2['name'])
					{

						if(ObjectExists(edge_1['incidentEdge']) && edge_1['incidentEdge']['name'] == edge_2['name'])
							continue

						if(AreCollinear(edge_1, edge_2))
						{
							CollinearCuts[edge_1['name']].push(edge_2)
						}
						else if(ArePerpendicular(edge_1, edge_2))
						{
							PerpendicularCuts[edge_1['name']].push(edge_2)
						}
						else if(AreParallel(edge_1, edge_2))
						{
							ParallelCuts[edge_1['name']].push(edge_2)
						}
					}

				}
			}
		}

		function AreCollinear(edge_1, edge_2)
		{
			//Get the direction between the edge_1's endpoints, normalize it, and then make it point to a positive direction
			var dir_1 = new THREE.Vector3().copy(edge_1['endPoints'][0])
			dir_1.sub(edge_1['endPoints'][1])

			//Make all axes of this vector positive
			dir_1 = MakePositiveVector(dir_1)
			dir_1.normalize()

			//Same as above, but with edge_2
			var dir_2 = new THREE.Vector3().copy(edge_2['endPoints'][0])
			dir_2.sub(edge_2['endPoints'][1])

			dir_2 = MakePositiveVector(dir_2)
			dir_2.normalize()


			//Check if the two directions point to the same direction
			if(dir_1.equals(dir_2))
			{
				if(ObjectExists(edge_1['neighbors'][edge_2.name]))
					return true

				//If they do, we now have to check if we can draw a line between an endpoint from edge_1 to an endpoint from edge_2. If the direction that line is pointing is 
				//the same as the dir_1 (and, by equivalence, dir_2), then the edges are collinear. If not, they may be parallel, but that's a different check entirely.
				var dir_3 = new THREE.Vector3().copy(edge_1['endPoints'][0])
				dir_3.sub(edge_2['endPoints'][0])
				dir_3 = MakePositiveVector(dir_3)
				dir_3.normalize()

				if(dir_3.equals(dir_1))
					return true
				else
				{
					//There is a second check to be made because the two edges may be neighbors. Since they may be neighbors, the first check may yield a dir_3 of zero, since the two endpoints used in the check may
					//be at the same point.
					dir_3 = new THREE.Vector3().copy(edge_1['endPoints'][0])
					dir_3.sub(edge_2['endPoints'][1])
					dir_3 = MakePositiveVector(dir_3)
					dir_3.normalize()

					if(dir_3.equals(dir_1))
						return true
				}
			}

			return false
		}

		function ArePerpendicular(edge_1, edge_2)
		{
			//HACK: If the two edges are neighbors, they must be perpendicular. This is only true if the collinearity check is made FIRST.
			if(ObjectExists(edge_1['neighbors'][edge_2['name']]))
			{
				return true
			}
			else if(ObjectExists(edge_1['incidentEdge']) && ObjectExists(edge_1['incidentEdge']['neighbors'][edge_2['name']]))
			{
				return true
			}

			//Get the direction between the edge_1's endpoints, normalize it, and then make it point to a positive direction
			var dir_1 = new THREE.Vector3().copy(edge_1['endPoints'][0])
			dir_1.sub(edge_1['endPoints'][1])

			//Make all axes of this vector positive
			dir_1 = MakePositiveVector(dir_1)
			dir_1.normalize()

			//Same as above, but with edge_2
			var dir_2 = new THREE.Vector3().copy(edge_2['endPoints'][0])
			dir_2.sub(edge_2['endPoints'][1])

			dir_2 = MakePositiveVector(dir_2)
			dir_2.normalize()

			//The two vectors should not be equal. If they are, they may be parallel or collinear, but not perpendicular.
			if(!dir_1.equals(dir_2))
			{
				//Now check between endPoint_1 of edge_1 and the endpoints of edge_2.
				//If the direction between endPoint_1 and one endpoint of edge_2 is equal to the direction edge_1 is pointing, and the direction between endPoint_2 and the other endpoint of edge_2
				//is not equal to the direction edge_1 is pointing in, then the edges are collinear.

				var dir_3 = new THREE.Vector3().copy(edge_1['endPoints'][0])
				dir_3.sub(edge_2['endPoints'][0])
				dir_3 = MakePositiveVector(dir_3)
				dir_3.normalize()

				var dir_4 = new THREE.Vector3().copy(edge_1['endPoints'][0])
				dir_4.sub(edge_2['endPoints'][1])
				dir_4 = MakePositiveVector(dir_4)
				dir_4.normalize()

				if(dir_3.equals(dir_4))
				{
					return true
				}
				
				if((dir_3.equals(dir_1) && !dir_4.equals(dir_1)) || (!dir_3.equals(dir_1) && dir_4.equals(dir_1)))
				{
					return true
				}
				else if((dir_3.equals(dir_2) && !dir_4.equals(dir_2)) || (!dir_3.equals(dir_2) && dir_4.equals(dir_2)))
				{
					return true
				}

				dir_3 = new THREE.Vector3().copy(edge_1['endPoints'][1])
				dir_3.sub(edge_2['endPoints'][0])
				dir_3 = MakePositiveVector(dir_3)
				dir_3.normalize()
				
				dir_4 = new THREE.Vector3().copy(edge_1['endPoints'][1])
				dir_4.sub(edge_2['endPoints'][1])
				dir_4 = MakePositiveVector(dir_4)
				dir_4.normalize()

				if(dir_3.equals(dir_4))
				{
					return true
				}

				if((dir_3.equals(dir_1) && !dir_4.equals(dir_1)) || (!dir_3.equals(dir_1) && dir_4.equals(dir_1)))
				{
					return true
				}
				else if((dir_3.equals(dir_2) && !dir_4.equals(dir_2)) || (!dir_3.equals(dir_2) && dir_4.equals(dir_2)))
				{
					return true
				}
			}

			return false
		}

		function AreParallel(edge_1, edge_2)
		{
			//Get the direction between the edge_1's endpoints, normalize it, and then make it point to a positive direction
			var dir_1 = new THREE.Vector3().copy(edge_1['endPoints'][0])
			dir_1.sub(edge_1['endPoints'][1])

			//Make all axes of this vector positive
			dir_1 = MakePositiveVector(dir_1)
			dir_1.normalize()

			//Same as above, but with edge_2
			var dir_2 = new THREE.Vector3().copy(edge_2['endPoints'][0])
			dir_2.sub(edge_2['endPoints'][1])

			dir_2 = MakePositiveVector(dir_2)
			dir_2.normalize()


			//Check if the two directions point to the same direction
			if(dir_1.equals(dir_2))
			{
				//If they do, then we first check between endPoint_1 of edge_1 and the endpoints of edge_2. If the direction between endPoint_1 and one of the endpoints of edge_2
				//is a normalized basis vector in R^3 (that is, <1, 0, 0>, <0, 1, 0>, or <0, 0, 1>), but the direction between endPoint_1 and the other endpoint is different, 
				//then we do the next check. Let endPoint_21 and endPoint_22 be the endpoints of edge_2, where endPoint_21 is the endPoint, that, when calculating the direction from
				//endPoint_1 of edge_1 to it, we get a normalized basis vector. Then, our check needs to see if the direction between endPoint_2 of edge_1 and endPoint_22 is the same
				//normalized basis vector.

				var dir_3 = new THREE.Vector3().copy(edge_1['endPoints'][0])
				dir_3.sub(edge_2['endPoints'][0])
				dir_3 = MakePositiveVector(dir_3)
				dir_3.normalize()

				var dir_4 = new THREE.Vector3().copy(edge_1['endPoints'][0])
				dir_4.sub(edge_2['endPoints'][1])
				dir_4 = MakePositiveVector(dir_4)
				dir_4.normalize()

				if(!dir_3.equals(dir_4))
				{
					var dir_5

					if(dir_3.equals(new THREE.Vector3(1, 0, 0)) || dir_3.equals(new THREE.Vector3(0, 1, 0)) || dir_3.equals(new THREE.Vector3(0, 0, 1)))
					{	
						dir_5 = new THREE.Vector3().copy(edge_1['endPoints'][1])
						dir_5.sub(edge_2['endPoints'][1])
						dir_5 = MakePositiveVector(dir_5)
						dir_5.normalize()

						if(dir_5.equals(dir_3))
							return true
					}
					else if(dir_4.equals(new THREE.Vector3(1, 0, 0)) || dir_4.equals(new THREE.Vector3(0, 1, 0)) || dir_4.equals(new THREE.Vector3(0, 0, 1)))
					{
						dir_5 = new THREE.Vector3().copy(edge_1['endPoints'][1])
						dir_5.sub(edge_2['endPoints'][0])
						dir_5 = MakePositiveVector(dir_5)
						dir_5.normalize()

						if(dir_5.equals(dir_4))
							return true
					}
				}
			}

			return false
		}
	}

	function CheckIfGloballyDisconnected(part_1, part_2){
		var disc = true

		if(part_1['name'] == part_2['name'])
		{
			return false
		}
		else
		{
			part_1['visited'] = true
			Visited_Faces.push(part_1)
			for(var N in part_1['neighbors'])
			{
				if(!part_1['neighbors'][N]['visited'] && disc)
				{	
					disc = CheckIfGloballyDisconnected(part_1['neighbors'][N], part_2)
				}

				if(!disc)
					break
			}
		}

		return disc
	}

	function ClearVisitedFaces()
	{
		for(var index in Visited_Faces)
		{
			Visited_Faces[index]['visited'] = false
		}

		Visited_Faces = []
	}

	function ClearVisitedEdges()
	{
		for(var index in Visited_Edges)
		{
			Visited_Edges[index]['visited'] = false
		}

		Visited_Edges = []
	}

	var UndoCut = function(edge_1, edge_2, face_1, face_2)
	{
		that.AddNeighboringFaces(face_1['name'], face_1, face_2['name'], face_2)

		delete Cut_Edges[edge_1.name]
		delete Cut_Edges[edge_2.name]

		edge_1['cut'] = false
		edge_2['cut'] = false
	}

	var CutHinge = function(edge)
	{
		if(!ObjectExists(Edges[edge.name]))
			return

		//TODO: Add verification here to make sure that the face dual graph would not be disconnected by the cutting here.
		var edge_1 = Edges[edge.name]

		var edge_2 = edge_1["incidentEdge"]

		edge_1["cut"] = true
		edge_2["cut"] = true

		Cut_Edges[edge_1.name] = edge_1
		Cut_Edges[edge_2.name] = edge_2

		var v_face_1 = edge_1["edge"].parent
		var v_face_2 = edge_2["edge"].parent

		var face_1 = Faces[v_face_1.name]
		var face_2 = Faces[v_face_2.name]

		delete face_1["neighbors"][face_2["name"]]
		delete face_2["neighbors"][face_1["name"]]

		return [edge_2, face_1, face_2]
	}
}