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
		
		//Create some variables and functions for the polycube class
		PolyCube.Active_Polycube = null
		PolyCube.SwitchToNewActive = function(polycube)
		{
			PolyCube.Active_Polycube = polycube
		}
		
		CONTROL.Switch_Context('world')
		CONTROL.update()
	}
})