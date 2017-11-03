var CONTROL

$(document).ready(function(){
	var INIT = new Initialize() //Load the cube part models and then initialize the cube class with said models

	var wait_for_int = setInterval(function(){

		if(INIT.flags["IS_COMPLETE"]){

			clearInterval(wait_for_int)

			console.log("Completed loading models")
			FinishInitialization()
		}	
	}, 10)

	function FinishInitialization(){
		CONTROL = new Controller()
		//Add a grid to the default scene
		var grid = GenerateGrid(100, 2, 0x000000)
		grid.position.y = -1
		grid.add(new THREE.AxisHelper(50))
		CONTROL.rotate_mode_scene.add(grid)
		
		//Create some variables and functions for the polycube class	PolyCube.Rotation_Scene = new Scene()
		PolyCube.Active_Polycube = null
		PolyCube.SwitchToNewActive = function(polycube)
		{
			PolyCube.Active_Polycube = polycube
		}
		
		CONTROL.Switch_Context('edit-context')
		CONTROL.update()
	}
})