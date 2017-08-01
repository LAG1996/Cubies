function FaceEdgeDualGraph(){
	var Faces = []
	var Edges = []

	var Cut_Edges = []
	var Invalid_Edges = []

	var Visited_Faces = []
	var Visited_Edges = []

	var Edge2CutPath = {} //An object that maps each edge to a path
	var Edge2RotationLine = {} //An object that maps each edge to a rotation line
	var RotationLine2SubGraph = {} //An object that maps each rotation line index to two subgraphs
	var RotationLine2ParentEdge = {} //An object that maps each rotation line index to a pair of parent edges

	var L_CutPaths = []
	var L_RotationLines = []

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
			new_face_1 = {"name": name_1, "face": face_1, "neighbors": {}, "visited" : false}
			Faces[name_1] = new_face_1
		}
		else
		{
			new_face_1 = Faces[name_1]
		}

		if(!(name_2 in Faces))
		{
			new_face_2 = {"name": name_2, "face": face_2, "neighbors": {}, "visited" : false}
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
			new_edge_1 = {"name": name_1, "edge": edge_1, "endPoints" : endPoints_1, "neighbors": {}, "cut" : true, "invalid": false, "visited": false}
			Edges[name_1] = new_edge_1
		}
		else
		{
			new_edge_1 = Edges[name_1]
		}

		if(!(name_2 in Edges))
		{
			new_edge_2 = {"name": name_2, "edge": edge_2, "neighbors": {}, "endPoints" : endPoints_2, "cut" : true, "invalid": false, "visited": false}
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
			new_edge_1 = {"name": name_1, "edge": edge_1, "endPoints" : endPoints_1, "neighbors": {}, "cut" : false, "invalid": false, "visited": false}
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
			new_edge_2 = {"name": name_2, "edge": edge_2, "endPoints" : endPoints_2, "neighbors": {}, "cut" : false, "invalid": false, "visited": false}
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

	//Function that handles cutting hinges, and also the undoing of these cuts. 
	//The keyword here is "hinges". A hinge is two incident edges. If an edge without an incident partner is passed in the parameter, then there is nothing to do
	//since it is already cut and there is not incident edge to "stick back together" with it.
	this.HandleCut = function(edge)
	{
		//There is nothing to do with this edge, since it is a cut that cannot be undone
		if(!ObjectExists(edge['incidentEdge']))
			return

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

			/*
			//Check if the edge cut causes the graph to be disconnected
			var disc = CheckIfGloballyDisconnected(otherPartsInspected[1], otherPartsInspected[2])
			ClearVisitedFaces()
	
			if(disc)
			{
				UndoCut(edge_1, edge_2, otherPartsInspected[1], otherPartsInspected[2])
			}
			*/
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
		BuildSubGraphs()
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

	this.GetRotationLines = function(){
		return L_RotationLines
	}

	this.GetRotationLineFromIndex = function(index){
		return L_RotationLines[index]
	}

	this.GetRotationLineIndex = function(edgeName){
		return Edge2RotationLine[edgeName]
	}

	//Returns a data packet containing the subgraphs and the hinge line dividing them
	this.GetSubGraphs = function(edgeName){
		var rotation_line = -1
		rotation_line =  Edge2RotationLine[edgeName]
		var subgraphs = undefined
		if(rotation_line > -1){
			subgraphs = RotationLine2SubGraph[rotation_line]
		}

		return {'subgraphs' : subgraphs, 'rotation_line_index' : rotation_line} 
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
			var new_cut_path = []
			start_cut = Cut_Edges[E]
			
			if(!start_cut['visited'])
			{
				start_cut = Cut_Edges[E]
				start_cut['visited'] = true
				

				Visited_Edges.push(start_cut)
						

				Edge2CutPath[start_cut['name']] = path_num
				

				if(Object.keys(start_cut['neighbors']).length > 0)
				{
					new_cut_path.push(start_cut)
					GreedyPathGrow(start_cut)
				}

				if(ObjectExists(start_cut['incidentEdge']))
				{
					Edge2CutPath[start_cut['incidentEdge']['name']] = path_num
					start_cut['incidentEdge']['visited'] = true
					Visited_Edges.push(start_cut['incidentEdge'])

					if(Object.keys(start_cut['incidentEdge']['neighbors']).length > 0)
					{
						new_cut_path.push(start_cut['incidentEdge'])
						GreedyPathGrow(start_cut['incidentEdge'])
					}
				}
				

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
					neighbor['visited'] = true
					Visited_Edges.push(neighbor)

					if(Object.keys(neighbor['neighbors']).length > 0)
					{
						new_cut_path.push(neighbor)
						GreedyPathGrow(neighbor)
					}

					if(ObjectExists(neighbor['incidentEdge']))
					{
						Edge2CutPath[neighbor['incidentEdge']['name']] = path_num
						neighbor['incidentEdge']['visited'] = true
						Visited_Edges.push(neighbor['incidentEdge'])

						if(Object.keys(neighbor['incidentEdge']['neighbors']).length > 0)
						{
							new_cut_path.push(neighbor['incidentEdge'])
							GreedyPathGrow(neighbor['incidentEdge'])
						}
					}
				}
			}
		}
	}

	//In this function, we build rotation lines between cuts.
	//The search is optimized in several ways.
	//First of all, cut edges check only with cut edges that are on the same path as them.
	//Second, edges that are checked together are marked as partners. Their incident edges are also marked as partners. Partners that have already been marked are not checked against each other ever again.
	//Third, only edges that are collinear, parallel, and perpendicular can have lines in between them.
	//Fourth, if the first edge found on the line is a cut, then we don't bother building a hinge line from the origin. This makes it so we avoid redundancies.
	function BuildHingePaths(){
		Edge2RotationLine = {}
		L_RotationLines = []
		var rotation_line_index = -1
		var EdgePartners = {}

		CollinearCuts = []
		ParallelCuts = []
		PerpendicularCuts = []

		//We search through all cuts in the map and build rotation lines out of them.
		for(var index in L_CutPaths)
		{
			for(var edge in L_CutPaths[index])
			{
				var edge_1 = L_CutPaths[index][edge]

				//If we haven't found the collinear, perpendicular, and parallel cuts for this edge already, then generate an empty list for them.
				if(!ObjectExists(CollinearCuts[edge_1.name]))
					CollinearCuts[edge_1.name] = []

				if(!ObjectExists(ParallelCuts[edge_1.name]))
					ParallelCuts[edge_1.name] = []

				if(!ObjectExists(PerpendicularCuts[edge_1.name]))
					PerpendicularCuts[edge_1.name] = []

				for(var other_edge in L_CutPaths[index])
				{
					var edge_2 = L_CutPaths[index][other_edge]

					//If the two edges we are comparing aren't the same edge...
					if(edge_1['name'] != edge_2['name'])
					{
						//...AND the edges are not incident partners
						if(ObjectExists(edge_1['incidentEdge']) && edge_1['incidentEdge']['name'] == edge_2['name'])
							continue

						//...AND the edges have not been compared to each other already
						if(EdgePartners[edge_1['name'] + edge_2['name']] || EdgePartners[edge_2['name'] + edge_1['name']])
							continue

						//---------------------
						//	Mark the edges as being compared already.
						//	This includes marking their incident edges as well, since we might be pooling from their list of neighbors in an attempt to generate a rotation line
						//---------------------
						EdgePartners[edge_1['name'] + edge_2['name']] = true
						EdgePartners[edge_2['name'] + edge_1['name']] = true

						if(ObjectExists(edge_1['incidentEdge']))
						{
							EdgePartners[edge_1['incidentEdge']['name'] + edge_2['name']] = true
							EdgePartners[edge_2['name'] + edge_1['incidentEdge']['name']] = true
						}
				
						if(ObjectExists(edge_2['incidentEdge']))
						{
							EdgePartners[edge_2['incidentEdge']['name'] + edge_1['name']] = true
							EdgePartners[edge_1['name'] + edge_2['incidentEdge']['name']] = true
						}
						
						if(ObjectExists(edge_1['incidentEdge']) && ObjectExists(edge_2['incidentEdge']))
						{
							EdgePartners[edge_2['incidentEdge']['name'] + edge_1['incidentEdge']['name']] = true
							EdgePartners[edge_1['incidentEdge']['name'] + edge_2['incidentEdge']['name']] = true
						}
						//------------------
						//	End marking the edges
						//------------------

						//If the edges are collinear...
						if(AreCollinear(edge_1, edge_2))
						{
							//----------------
							//Record that relation in their respective Collinear Cut lists
							//----------------
							CollinearCuts[edge_1['name']].push(edge_2)

							if(ObjectExists(edge_1['incidentEdge']))
							{
								if(!ObjectExists(CollinearCuts[edge_1['incidentEdge']['name']]))
									CollinearCuts[edge_1['incidentEdge']['name']] = []

								CollinearCuts[edge_1['incidentEdge']['name']].push(edge_2)
							}

							if(!ObjectExists(CollinearCuts[edge_2['name']]))
								CollinearCuts[edge_2['name']] = []
							
							CollinearCuts[edge_2['name']].push(edge_1)

							if(ObjectExists(edge_1['incidentEdge']))
								CollinearCuts[edge_2['name']].push(edge_1['incidentEdge'])
							//-----------
							//	End of marking collinearity
							//-----------

							//Now find a closer collinear neighbor between them
							var start_of_line = GetCloserCollinearNeighbor(edge_1, edge_2)

							if(!ObjectExists(start_of_line))
							{	
								//Make a second check with the incident edge in case the first check was not working
								start_of_line = GetCloserCollinearNeighbor(edge_1['incidentEdge'], edge_2)
							}

							//If we found a closer neighbor...
							if(ObjectExists(start_of_line))
							{
								GenerateLine(start_of_line, edge_2)
							}
								
						}
						else if(ArePerpendicular(edge_1, edge_2))
						{
							//----------------
							//Record that relation in their respective Collinear Cut lists
							//----------------
							PerpendicularCuts[edge_1['name']].push(edge_2)

							if(ObjectExists(edge_1['incidentEdge']))
							{
								if(!ObjectExists(PerpendicularCuts[edge_1['incidentEdge']['name']]))
									PerpendicularCuts[edge_1['incidentEdge']['name']] = []

								PerpendicularCuts[edge_1['incidentEdge']['name']].push(edge_2)
							}

							if(!ObjectExists(PerpendicularCuts[edge_2['name']]))
								PerpendicularCuts[edge_2['name']] = []
							
							PerpendicularCuts[edge_2['name']].push(edge_1)

							if(ObjectExists(edge_1['incidentEdge']))
								PerpendicularCuts[edge_2['name']].push(edge_1['incidentEdge'])

							//----------------
							// End of marking perpendicularity
							//---------------

							//Find a closer perpendicular neighbor between the two edges.
							//The way we find this is explained in the actual function
							var data = GetCloserPerpendicularNeighbor(edge_1, edge_2)

							if(!ObjectExists(data['closer']))
							{
								data = GetCloserPerpendicularNeighbor(edge_1['incidentEdge'], edge_2)
							}

							if(ObjectExists(data['closer']))
								GenerateLine(data['closer'], data['to'])
						}
						else
						{
							var data = AreParallel(edge_1, edge_2)
							if(data['para'])
							{
								ParallelCuts[edge_1['name']].push(edge_2)

								if(ObjectExists(edge_1['incidentEdge']))
								{
									if(!ObjectExists(ParallelCuts[edge_1['incidentEdge']['name']]))
										ParallelCuts[edge_1['incidentEdge']['name']] = []
	
									ParallelCuts[edge_1['incidentEdge']['name']].push(edge_2)
								}
	
								if(!ObjectExists(ParallelCuts[edge_2['name']]))
									ParallelCuts[edge_2['name']] = []
								
								ParallelCuts[edge_2['name']].push(edge_1)
	
								if(ObjectExists(edge_1['incidentEdge']))
									ParallelCuts[edge_2['name']].push(edge_1['incidentEdge'])

								var data = GetCloserParallelNeighbor(edge_1, edge_2)

								if(!ObjectExists(data['closer_1']))
								{
									data = GetCloserParallelNeighbor(edge_1['incidentEdge'], edge_2)
								}

								if(ObjectExists(data['closer_1']))
								{
									GenerateLine(data['closer_1'], data['to_1'])
									GenerateLine(data['closer_2'], data['to_2'])
								}
							}
						}
					}
				}
			}
		}

		//We find the closer neighbor between the edge marked as from and to (assuming from and to are parallel)
		function GetCloserParallelNeighbor(from, to)
		{
			//Unlike the other two checks for neighbors, the parallel check will have two parallel, closer edges.
			var closer_neighbor_1 = undefined
			var closer_neighbor_2 = undefined

			var closer_end_1 = undefined
			var closer_end_2 = undefined

			var distance_1 = from['endPoints'][0].distanceTo(to['endPoints'][0])
			var distance_2 = from['endPoints'][1].distanceTo(to['endPoints'][0])

			for(var N in from['neighbors'])
			{
				var neighbor = from['neighbors'][N]

				//Only check the perpendicular neighbors of from
				if(ArePerpendicular(neighbor, from))
				{
					//If this neighbor is attached to the first endpoint of from...
					if(neighbor['endPoints'][0].equals(from['endPoints'][0]) || neighbor['endPoints'][1].equals(from['endPoints'][0]))
					{
						//...if we have a closer neighbor, don't bother.
						if(ObjectExists(closer_neighbor_1))
							continue

						//...check if this neighbor's other endpoint is closer to "to" than the first endpoint of from
						var neighbor_endpoint = (!neighbor['endPoints'][0].equals(from['endPoints'][0])) ? neighbor['endPoints'][0] : neighbor['endPoints'][1]
						var distance_3 = neighbor_endpoint.distanceTo(to['endPoints'][0])

						if(distance_3 < distance_1)
						{
							//If the check succeeds, then find the closest point from "to" to this neighbor
							var data = GetCloserPerpendicularNeighbor(to, neighbor)
							if(!ObjectExists(data['closer']))
							{
								data = GetCloserPerpendicularNeighbor(to['incidentEdge'], neighbor)
							}

							if(ObjectExists(data['closer']))
							{
								closer_neighbor_1 = neighbor
								closer_end_1 = data['closer']
							}
						}
					}
					else
					{
						//If not, then it's the other endpoint that we're checking against
						//...if we have a closer neighbor, don't bother.
						if(ObjectExists(closer_neighbor_2))
							continue

						//...check if this neighbor's other endpoint is closer to "to" than the second endpoint of from
						var neighbor_endpoint = (!neighbor['endPoints'][0].equals(from['endPoints'][1])) ? neighbor['endPoints'][0] : neighbor['endPoints'][1]
						var distance_3 = neighbor_endpoint.distanceTo(to['endPoints'][0])

						if(distance_3 < distance_2)
						{
							//If the check succeeds, then find the closest point from "to" to this neighbor
							var data = GetCloserPerpendicularNeighbor(to, neighbor)

							if(!ObjectExists(data['closer']))
							{
								data = GetCloserPerpendicularNeighbor(to['incidentEdge'], neighbor)
							}

							if(ObjectExists(data['closer']))
							{
								closer_neighbor_2 = neighbor
								closer_end_2 = data['closer']
							}
						}
					}
				}
			}

			return {'closer_1' : closer_neighbor_1, 'closer_2' : closer_neighbor_2, 'to_1' : closer_end_1, 'to_2' : closer_end_2}
		}

		//We find the closer neighbor between the edge marked as from and to (assuming from and to are perpendicular)
		function GetCloserPerpendicularNeighbor(from, to)
		{
			var closest_neighbor = undefined
			var closest_endpoint = undefined

			var distance_1 = from['endPoints'][0].distanceTo(to['endPoints'][0])

			//Check all neighbors of "from"
			for(var N in from['neighbors'])
			{
				var neighbor = from['neighbors'][N]

				//If the neighbor of "from" and "to" are collinear, then see if it is closer to "to"
				if(AreCollinear(neighbor, to))
				{
					var neighbor_endpoint = (!neighbor['endPoints'][0].equals(from['endPoints'][0]) && !neighbor['endPoints'][0].equals(from['endPoints'][1])) ? neighbor['endPoints'][0] : neighbor['endPoints'][1]
					var distance_2 = neighbor_endpoint.distanceTo(to['endPoints'][0])

					if(!ObjectExists(closest_neighbor))
					{
						if(distance_2 < distance_1)
						{
							closest_neighbor = neighbor
							closest_endpoint = neighbor_endpoint.clone()
						}
					}
					else if(distance_2 < closest_endpoint.distanceTo(to['endPoints'][0]))
					{
						closest_neighbor = neighbor
						closest_endpoint = neighbor_endpoint.clone()
					}
				}
			}

			//If we found a closer neighbor, then send a data packet that contains the following information:
			//-the closer neighbor that we use to start the line
			//-the endpoint that we want to reach.
			//This seems pointless here, but it'll make sense in the next step, should this check fail
			if(ObjectExists(closest_neighbor))
				return {'closer' : closest_neighbor, 'to' : to}

			//Check all neighbors of "to"
			for(var N in to['neighbors'])
			{
				var neighbor = to['neighbors'][N]

				//If the neighbor of "from" and "to" are collinear, then see if it is closer to "to"
				if(AreCollinear(neighbor, from))
				{
					var neighbor_endpoint = (!neighbor['endPoints'][0].equals(to['endPoints'][0]) && !neighbor['endPoints'][0].equals(to['endPoints'][1])) ? neighbor['endPoints'][0] : neighbor['endPoints'][1]
					var distance_2 = neighbor_endpoint.distanceTo(from['endPoints'][0])

					if(!ObjectExists(closest_neighbor))
					{
						if(distance_2 < distance_1)
						{
							closest_neighbor = neighbor
							closest_endpoint = neighbor_endpoint.clone()
						}
					}
					else if(distance_2 < closest_endpoint.distanceTo(from['endPoints'][0]))
					{
						closest_neighbor = neighbor
						closest_endpoint = neighbor_endpoint.clone()
					}
				}
			}

			//Start the line at the neighbor to 'to', and set the endpoint as 'from'. This reverses the direction our rotation line will be drawn
			if(ObjectExists(closest_neighbor))
				return {'closer' : closest_neighbor, 'to' : from}

			return {'closer' : null} //Return this if we haven't found a closer neighbor
		}

		//We find the closer collinear neighbor between the edge marked as from and to (assuming from and to are also collinear)
		function GetCloserCollinearNeighbor(from, to)
		{
			var closest_neighbor = undefined
			var closest_endpoint = undefined

			var distance_1 = from['endPoints'][0].distanceTo(to['endPoints'][0])

			for(var N in from['neighbors'])
			{
				var neighbor = from['neighbors'][N]

				//If the neighbor and from are collinear, then there is a chance that this neighbor is closer to "to"
				if(AreCollinear(from, neighbor))
				{
					var neighbor_endpoint = (!neighbor['endPoints'][0].equals(from['endPoints'][0]) && !neighbor['endPoints'][0].equals(from['endPoints'][1])) ? neighbor['endPoints'][0] : neighbor['endPoints'][1]
					var distance_2 = neighbor_endpoint.distanceTo(to['endPoints'][0])

					if(!ObjectExists(closest_neighbor))
					{
						if(distance_2 < distance_1)
						{
							closest_neighbor = neighbor
							closest_endpoint = neighbor_endpoint.clone()
						}
					}
					else if(distance_2 < closest_endpoint.distanceTo(to['endPoints'][0]))
					{
						closest_neighbor = neighbor
						closest_endpoint = neighbor_endpoint.clone()
					}
				}
			}

			return closest_neighbor
		}

		function GenerateLine(start, end)
		{
			var Line_Queue = [] //A queue that stores the edges that we found
			while(ObjectExists(start))
			{
				//if start is not a cut, then add it to the queue
				if(!start['cut'])
				{
					Line_Queue.push(start)
				}

				//if start and end are the same edge, then stop.
				if(start['name'] == end['name'])
					break

				//If start and end are neighbors, then we're at the end of our line. Set start as end, and then skip to the next iteration. This is done
				//to account for a line drawn between parallel neighbors, where end is not necessarily a cut.
				if(ObjectExists(start['neighbors'][end['name']]))
				{
					start = end
					continue
				}
				else if(ObjectExists(start['incidentEdge']) && ObjectExists(start['incidentEdge']['neighbors'][end['name']]))
				{
					start = end
					continue
				}

				//Now find a closer neighbor between them.
				var next_edge = GetCloserCollinearNeighbor(start, end)

				if(!ObjectExists(next_edge))
					next_edge = GetCloserCollinearNeighbor(start['incidentEdge'], end)

				start = next_edge
			}

			//If the line queue has edges in it, then...
			if(Line_Queue.length > 0)
			{
				//...set the next rotation line. A rotation line is simply a list of connected edges that form a line between two cut edges in the edge dual graph.
				rotation_line_index+=1
				L_RotationLines[rotation_line_index] = []

				for(var windex in Line_Queue)
				{
					var edge = Line_Queue[windex]

					//If the edge is already part of a line, check if the edge is part of a shorter line.
					if(ObjectExists(Edge2RotationLine[edge['name']]))
					{
						var line = L_RotationLines[Edge2RotationLine[edge['name']]]

						//if it turns out that the line the edge was already a part of is larger than the current queue, we'll have to destroy the old line.
						//If it turns out the older line is shorter, do nothing. In fact, just skip to the next iteration of the loop
						if(line.length > Line_Queue)
						{
							delete L_RotationLines[Edge2RotationLine[edge['name']]]
							delete Edge2RotationLine[edge['name']]
						}
						else
							continue
					}

					//Add the edge to this rotation line.
					Edge2RotationLine[edge['name']] = rotation_line_index
					Edge2RotationLine[edge['incidentEdge']['name']] = rotation_line_index
					L_RotationLines[rotation_line_index].push(edge)
				}

				if(L_RotationLines[rotation_line_index].length == 0)
				{
					var new_array = []
					for(var windex = 0; windex < rotation_line_index; windex++)
					{
						new_array[windex] = L_RotationLines[windex]
					}

					rotation_line_index -= 1
					L_RotationLines = new_array
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

		//Compare the endpoints of these edges and return data pertaining to whether the two edges are parallel and what endpoints line up
		function AreParallel(edge_1, edge_2)
		{
			var data = {'para' : false, 'corresponding_endpoint_data': 
				{
					0 : {'other_endpoint' : null},
					1 : {'other_endpoint': null}
				}
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

					if(IsBasisVector(dir_3))
					{	
						dir_5 = new THREE.Vector3().copy(edge_1['endPoints'][1])
						dir_5.sub(edge_2['endPoints'][1])
						dir_5 = MakePositiveVector(dir_5)
						dir_5.normalize()

						if(dir_5.equals(dir_3))
						{
							data['para'] = true

							data['corresponding_endpoint_data'][0]['other_endpoint'] = edge_2['endPoints'][0]
							data['corresponding_endpoint_data'][1]['other_endpoint'] = edge_2['endPoints'][1]
						}
					}
					else if(IsBasisVector(dir_4))
					{
						dir_5 = new THREE.Vector3().copy(edge_1['endPoints'][1])
						dir_5.sub(edge_2['endPoints'][0])
						dir_5 = MakePositiveVector(dir_5)
						dir_5.normalize()

						if(dir_5.equals(dir_4))
						{
							data['para'] = true
							data['corresponding_endpoint_data'][0]['other_endpoint'] = edge_2['endPoints'][1]
							data['corresponding_endpoint_data'][1]['other_endpoint'] = edge_2['endPoints'][0]
						}
					}
				}
			}

			return data
		}
	}

	//Build the sub graphs in the face dual graph formed by the rotation lines.
	//Essentially, finding the sub graphs means temporarily cutting the rotation lines, picking a face on either side of the line (that is, each parent face of any two incident edges),
	//and then doing a greedy grow search of the part of the adjacency graph containing it. We then put the edges back together.
	function BuildSubGraphs()
	{
		var Edge_Queue = []
		var sub_graphs = []
		var sub_graph_index = []

		var jindex
		ClearVisitedEdges()
		ClearVisitedFaces()
		
		for(var index in L_RotationLines)
		{
			var line = L_RotationLines[index]

			jindex = 0
			sub_graphs[0] = []
			sub_graphs[1] = []

			for(var kindex in line)
			{
				var edge = line[kindex]
				if(!edge['visited'])
				{
					//Set the edge and its incident edge as being visited so that we don't do redundant greedy grows later.
					//No need to check for the existence of an incident edge since a rotation hinge cannot be a cut, and
					//partner-less edges are already considered cuts.
					edge['visited'] = true
					Visited_Edges.push(edge)
						
					edge['incidentEdge']['visited'] = true
					Visited_Edges.push(edge['incidentEdge'])

					CutHinge(edge)
					Edge_Queue.push(edge)
				}
			}

			GreedyPathGrow(Faces[line[0]['edge'].parent.name])
			jindex = 1
			GreedyPathGrow(Faces[line[0]['incidentEdge']['edge'].parent.name])

			RotationLine2SubGraph[index] = [sub_graphs[0], sub_graphs[1]]

			for(var index in Edge_Queue)
			{
				var edge_1 = Edge_Queue[index]
				var edge_2 = edge_1['incidentEdge']
	
				var face_1 = edge_1['edge'].parent
				var face_2 = edge_2['edge'].parent
	
				//Clear the visited flags for both edges here to avoid doing a second O(n) operation later
				edge_1['visited'] = false
				edge_2['visited'] = false
	
				UndoCut(edge_1, edge_2, face_1, face_2)
			}

			ClearVisitedFaces()
		}

		Visited_Edges = []

		//Copy-pasted from the build cut path algorithm above. There may be a way to make this function work for faces and edges alike.
		//Of course reconciling the difference may be overall less performant, since the function above was built with incident edges in mind.
		//Not really a concern, though.
		function GreedyPathGrow(face){

			sub_graphs[jindex].push(face)
			face['visited'] = true
			Visited_Faces.push(face)
			for(var N in face['neighbors'])
			{
				var neighbor = face['neighbors'][N]
				
				if(!neighbor['visited'])
				{
					GreedyPathGrow(neighbor)
				}
			}
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
		that.AddNeighboringFaces(face_1.name, face_1, face_2.name, face_2)

		delete Cut_Edges[edge_1.name]
		delete Cut_Edges[edge_2.name]

		edge_1['cut'] = false
		edge_2['cut'] = false
	}

	var CutHinge = function(edge)
	{
		//If this is an invalid edge, then don't bother
		if(!ObjectExists(Edges[edge.name]))
			return

		//If this edge has no partner, then don't bother since it's already considered a boundary, which is a permanent cut
		if(!ObjectExists(edge['incidentEdge']))
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