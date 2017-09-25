function FlexibleDualGraph()
{
	var Loc2Face_Map = {}
	var Face2Loc_Map = {}

	var Loc2Edge_Map = {}
	var Edge2Loc_Map = {}

	var that = this



	this.AddFace = function(face_name, location)
	{
		var s = location.x.toString() + "," + location.y.toString() + "," + location.z.toString()

		Loc2Face_Map[s] = face_name
		Face2Loc_Map[face_name] = location
	}

	this.AddEdge = function()
	{
		var s = location.x.toString() + "," + location.y.toString() + "," + location.z.toString()

		Loc2Face_Map[s] = face_name
		Face2Loc_Map[face_name] = location
	}

}