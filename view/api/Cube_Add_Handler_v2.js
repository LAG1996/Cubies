function Cube_Add_Handler(list_of_cubes, polycube)
{
	this.finished = false
	this.newest_cube = null
	this.my_polycube = polycube

	var rejected_cubes = []
	var l_cubes_index = 0
	var l_cubes = list_of_cubes
	var that = this

	this.Add_Another_Cube = function(){
		if(l_cubes_index < l_cubes.length)
		{
			var cube = list_of_cubes[l_cubes_index]
			
			if(!this.my_polycube.Add_Cube(new THREE.Vector3(cube[0], cube[1], cube[2])))
			{
				rejected_cubes.push(new THREE.Vector3(cube[0], cube[1], cube[2]))
				this.newest_cube = null
			}
			else
				this.newest_cube = this.my_polycube.GetCubeAtPosition(new THREE.Vector3(cube[0], cube[1], cube[2]))

			l_cubes_index+=1
		}
		else if(rejected_cubes.length > 0)
		{
			var cube_pos = rejected_cubes.shift()

			if(!this.my_polycube.Add_Cube(cube_pos))
			{
				rejected_cubes.push(cube_pos)
				this.newest_cube = null
			}
			else
				this.newest_cube = this.my_polycube.GetCubeAtPosition(cube_pos)
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