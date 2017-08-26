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

	this.AddNeighboringFaces = function(name_1, name_2)
	{
		var new_face_1
		var new_face_2

		if(!(name_1 in Faces))
		{
			new_face_1 = {"name": name_1, "neighbors": {}, "visited" : false}
			Faces[name_1] = new_face_1
		}
		else
		{
			new_face_1 = Faces[name_1]
		}

		if(!(name_2 in Faces))
		{
			new_face_2 = {"name": name_2, "neighbors": {}, "visited" : false}
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

	this.AddNeighboringEdges = function(name_1, endPoints_1, name_2, endPoints_2)
	{
		var new_edge_1
		var new_edge_2

		if(!(name_1 in Edges))
		{
			new_edge_1 = {"name": name_1, "endPoints" : endPoints_1, "neighbors": {}, 'collinearNeighbors': {}, "cut" : true, "invalid": false, "visited": false}
			Edges[name_1] = new_edge_1
		}
		else
		{
			new_edge_1 = Edges[name_1]
		}

		if(!(name_2 in Edges))
		{
			new_edge_2 = {"name": name_2, "neighbors": {}, "endPoints" : endPoints_2, 'collinearNeighbors': {}, "cut" : true, "invalid": false, "visited": false}
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

	this.AddIncidentEdges = function(name_1, endPoints_1, name_2, endPoints_2)
	{
		var new_edge_1
		var new_edge_2

		if(!(name_1 in Edges))
		{
			new_edge_1 = {"name": name_1, "endPoints" : endPoints_1, "neighbors": {}, "cut" : false, "invalid": false, "visited": false}
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
			new_edge_2 = {"name": name_2, "endPoints" : endPoints_2, "neighbors": {}, "cut" : false, "invalid": false, "visited": false}
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
	this.HandleCut = function(edge_name)
	{
		var edge_1 = Edges[edge_name]
		if(!ObjectExists(edge_1))
			return

		//There is nothing to do with this edge, since it is a cut that cannot be undone
		if(!ObjectExists(edge_1['incidentEdge']))
			return

		if(edge['cut'])
		{

			var edge_2 = edge_1["incidentEdge"]

			edge_1["cut"] = true
			edge_2["cut"] = true

			Cut_Edges[edge_1.name] = edge_1
			Cut_Edges[edge_2.name] = edge_2

			var face_1 = Faces[Cube.EdgeNameToFaceName(edge_1.name)]
			var face_2 = Faces[Cube.EdgeNameToFaceName(edge_2.name)]

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
		//BuildSubGraphs()
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

	this.GetFaces = function(){
		return Faces
	}

	this.GetEdges = function(){
		return Edges
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
			subgraphs = GenerateSubGraphs(rotation_line)
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

	function BuildHingePaths(){
		var EdgePartners = {}
		L_RotationLines = []
		var rotation_line_index = -1
		var EdgePartners = {}
		var Line_Queue = []
		var Total_Line_Queue = []
		var origin
		var cut_found = false
		var invalid_line = false

		var AlreadyDrawnFrom = {}

		for(var E in Cut_Edges)
		{
			Line_Queue = []

			var edge = Cut_Edges[E]

			if(AlreadyDrawnFrom[edge['name']])
				continue

			MarkAsVisited(edge)
			AlreadyDrawnFrom[edge['name']] = true

			if(ObjectExists(edge['incidentEdge']))
				AlreadyDrawnFrom[edge['incidentEdge']['name']] = true

			origin = edge

			//Combine the neighbors of this edge and its incident edge
			var neighbors = GetCombinedNeighbors(Cut_Edges[E])

			//Now for each neighbor, generate a line until you find a cut that is part of this path
			for(var N in neighbors)
			{
				Line_Queue = []
				cut_found = false
				invalid_line = false

				//Set this neighbor and its incident edge as visited
				var neighbor = neighbors[N]
				//If the neighbor is cut, skip it
				if(neighbor['cut'] || neighbor['visited'])
					continue
				
				//Otherwise, draw a line from this neighbor
				GenerateLineFrom(neighbor, origin)

				if(Line_Queue.length > 0 && cut_found && !invalid_line)
				{
					rotation_line_index += 1
					L_RotationLines[rotation_line_index] = []

					for(var index in Line_Queue)
					{
						L_RotationLines[rotation_line_index].push(Line_Queue[index])
						Edge2RotationLine[Line_Queue[index]['name']] = rotation_line_index
						Edge2RotationLine[Line_Queue[index]['incidentEdge']['name']] = rotation_line_index
					}
					
				}
			}

			ClearVisitedEdges()
		}

		function GenerateLineFrom(edge, parent)
		{
			if(cut_found || invalid_line)
				return

			MarkAsVisited(edge)
			
			//This check should never be valid
			if(edge['cut'] && Edge2CutPath[origin['name']] == Edge2CutPath[edge['name']])
			{
				console.log("uh oh")

				if(!AlreadyDrawnFrom[edge['name']])
					cut_found = true

				return
			}

			if(!edge['cut'])
			{
				Line_Queue.push(edge)
			}

			var n_neighbors = GetCombinedNeighbors(edge)

			//First, search through this edge's neighbors to see if any were cut. 
			for(var N in n_neighbors)
			{
				if(cut_found || invalid_line)
					return

				var n_neighbor = n_neighbors[N]

				//If the neighbor has been visited before, do not consider it
				if(n_neighbor['visited'])
					continue

				if(n_neighbor['cut'])
				{
					if(ObjectExists(origin['neighbors'][n_neighbor['name']]))
					{
						continue //If this neighbor is neighbors with the origin, do not consider it
					}
					else if(ObjectExists(n_neighbor['incidentEdge']) && ObjectExists(origin['neighbors'][n_neighbor['incidentEdge']['name']]))
					{
						continue //If this neighbor's incident edge is neighbors with the origin, do not consider it
					}
					else if(Edge2CutPath[n_neighbor['name']] != Edge2CutPath[origin['name']])
					{
						continue //If this neighbor is actually the origin, do not consider it
					}
					else if(ObjectExists(n_neighbor['incidentEdge']) && Edge2CutPath[n_neighbor['incidentEdge']['name']] != Edge2CutPath[origin['name']])
					{
						continue //If this neighbor is actually the origin's incident edge, do not consider it
					}
					else if(ObjectExists(origin['incidentEdge']) && (ObjectExists(origin['incidentEdge']['neighbors'][n_neighbor['name']]) || origin['incidentEdge']['name'] == n_neighbor['name']))
					{
						continue //If this neighbor is actually the origin, do not consider it
					}
					else if(ObjectExists(n_neighbor['incidentEdge']) && ObjectExists(origin['incidentEdge']) && (ObjectExists(origin['incidentEdge']['neighbors'][n_neighbor['incidentEdge']['name']]) || origin['incidentEdge']['name'] == n_neighbor['incidentEdge']['name']))
					{
						continue
					}
					else
					{	
						if(!AlreadyDrawnFrom[n_neighbor['name']])
							cut_found = true
						else
							invalid_line = true

						return
					}
				}
			}

			for(var N in n_neighbors)
			{
				var n_neighbor = n_neighbors[N]
				if(!n_neighbor['visited'] && AreCollinear(edge, n_neighbor))
				{

					//If this neighbor is the neighbor of the edge we just came from, we don't want to move backwards in the line. Skip this edge
					if(ObjectExists(parent['neighbors'][n_neighbor['name']]) || ObjectExists(parent['neighbors'][n_neighbor['incidentEdge']['name']])
						|| (ObjectExists(parent['incidentEdge']) && (ObjectExists(parent['incidentEdge']['neighbors'][n_neighbor['name']]) || ObjectExists(parent['incidentEdge']['neighbors'][n_neighbor['incidentEdge']['name']]))))
						continue

					GenerateLineFrom(n_neighbor, edge)

					if(!cut_found || invalid_line)
						Line_Queue = []
				}
			}
		}
	}

	function GetCombinedNeighbors(edge)
	{
		var neighbors = []
		for(var N in edge['neighbors'])
		{
			neighbors.push(edge['neighbors'][N])
		}

		if(ObjectExists(edge['incidentEdge']))
		{
			for(var N in edge['incidentEdge']['neighbors'])
			{
				neighbors.push(edge['incidentEdge']['neighbors'][N])
			}
		}

		return neighbors
	}

	function MarkAsVisited(edge)
	{
		edge['visited'] = true
		Visited_Edges.push(edge)

		if(ObjectExists(edge['incidentEdge']))
		{
			edge['incidentEdge']['visited'] = true
			Visited_Edges.push(edge['incidentEdge'])
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

	//Build the sub graphs in the face dual graph formed by the rotation lines.
	//Essentially, finding the sub graphs means temporarily cutting the rotation lines, picking a face on either side of the line (that is, each parent face of any two incident edges),
	//and then doing a greedy grow search of the part of the adjacency graph containing it. We then put the edges back together.
	function GenerateSubGraphs(rotation_line_index)
	{
		var Edge_Queue = []
		var sub_graphs = []
		var sub_graph_index = []

		rot_line = L_RotationLines[rotation_line_index]

		
		ClearVisitedEdges()
		ClearVisitedFaces()

		sub_graphs[0] = []
		sub_graphs[1] = []
		var jindex = 0
			

		for(var kindex in rot_line)
		{
			var edge = rot_line[kindex]
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

		GreedyPathGrow(Faces[Cube.EdgeNameToFaceName(rot_line[0].name)])
		jindex = 1
		GreedyPathGrow(Faces[Cube.EdgeNameToFaceName(rot_line[0]['incidentEdge'].name)])

		ClearVisitedFaces()

		for(var index in Edge_Queue)
		{
			var edge_1 = Edge_Queue[index]
			var edge_2 = edge_1['incidentEdge']

			var face_1 = Faces[Cube.EdgeNameToFaceName(edge_1.name)]
			var face_2 = Faces[Cube.EdgeNameToFaceName(edge_2.name)]

			//Clear the visited flags for both edges here to avoid doing a second O(n) operation later
			edge_1['visited'] = false
			edge_2['visited'] = false

			UndoCut(edge_1, edge_2, face_1, face_2)
		}

		Visited_Edges = []
		return sub_graphs

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

		var face_1 = Faces[Cube.EdgeNameToFaceName(edge_1.name)]
		var face_2 = Faces[Cube.EdgeNameToFaceName(edge_2.name)]

		delete face_1["neighbors"][face_2["name"]]
		delete face_2["neighbors"][face_1["name"]]

		return [edge_2, face_1, face_2]
	}
}