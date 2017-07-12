function Cube_Add_Handler(list_of_cubes, polycube)
{
	this.finished = false
	var l_cubes = list_of_cubes
	var p_cube = polycube
	var that = this

	this.Add_Another_Cube = function(){
		if(l_cubes.length > 0)
		{
			var cube = list_of_cubes.pop()
			p_cube.Add_Cube(new THREE.Vector3(cube[0], cube[1], cube[2]))
		}
		else
		{
			StopMe()
		}
	}

	function StopMe(){
		that.finished = true
	}
}