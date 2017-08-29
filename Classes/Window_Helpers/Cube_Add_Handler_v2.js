function Cube_Add_Handler(list_of_cubes, polycube)
{
	this.finished = false
	this.newest_cube = null
	this.my_polycube = polycube
	var l_cubes = list_of_cubes
	var that = this

	this.Add_Another_Cube = function(){
		if(l_cubes.length > 0)
		{
			var cube = list_of_cubes.pop()
			this.my_polycube.Add_Cube(new THREE.Vector3(cube[0], cube[1], cube[2]))

			this.newest_cube = this.my_polycube.GetCubeAtPosition(new THREE.Vector3(cube[0], cube[1], cube[2]))
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