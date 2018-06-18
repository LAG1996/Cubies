//Module representing the GUI Handler. This handles the nav and modal.
export const GUIHandler = {
	callbacks: {
		onCreatePolycube: () => {},
		onAddCube: () => {},
		onSavePolycube: () => {},
		onDeletePolycube: () => {}
	},
	switchToCreatePolycubeView: () => {
		$("#add-cube-active").hide();
		$("#add-cube-inactive").hide();
		$("#save-polycube").hide();
		$("#delete-polycube").hide();

		$("#add-polycube").show();		
	},
	switchToPolycubeView: (_isAddCubeDisabled, polycubeName) => {
		if(_isAddCubeDisabled){
			$("#add-cube-inactive").show();
		}
		else{
			$("#add-cube-active").show();
		}
		
		$("#save-polycube").show();
		$("#delete-polycube").show();
		
		$("#add-polycube").hide();		
	},
	switchCursor: (cursorType) => {
		switch(cursorType){
			case "cell" : $("#main-canvas").css("cursor", "cell"); break;
			case "crosshair" : $("#main-canvas").css("cursor", "crosshair"); break;
			default: $("#main-canvas").css("cursor", "default");
		}	
	},
	toggleAddCubeButton: () => {
		$("#add-cube-inactive").toggle();
		$("#add-cube-active").toggle();
	},
	displayGUI: (display) => {
		if(display){
			$("#gui").show();
		}
		else{
			$("#gui").hide();
		}
	}
}

//Bind events to buttons
$("#create-polycube").on("click", function(){ GUIHandler.callbacks.onCreatePolycube();});
$("#add-cube-active").on("click", function(){ GUIHandler.callbacks.onAddCube();});
$("#load-polycube").on("click", function(){});
$("#delete-polycube").on("click", function(){ GUIHandler.callbacks.onDeletePolycube();});