function Cube_Add_Handler(list_of_cubes, polycube, time = 10)
{
	this.interval_ID
	this.p_cube = polycube
	var l_cubes = list_of_cubes
	var that = this

	function Add_Another_Cube(){
		if(l_cubes.length > 0)
		{
			var cube = list_of_cubes.pop()
			this.p_cube.AddCube(new THREE.Vector3(cube[0], cube[1], cube[3]))
		}
		else
		{
			StopMe()
		}
	}

	function StopMe()
	{
		clearInterval(that.interval_ID)
		delete that
	}
}