//Module representing the GUI Handler. This handles the nav and modal.
export const GUIHandler = {
	callbacks: {
		onCreatePolycube: () => {},
		onAddCube: () => {},
		onSavePolycube: () => {},
		onTutorialClick: () => {},
		onDeletePolycube: () => {},
		onLoadPolycube: () => {}
	},
	switchToCreatePolycubeView: () => {
		$("#add-cube-active").hide();
		$("#add-cube-inactive").hide();
		$("#save-polycube").hide();
		$("#delete-polycube").hide();

		$("#add-polycube").show();		
	},
	switchToPolycubeView: (isAddCubeDisabled, polycubeName) => {
		if(isAddCubeDisabled){
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
	enableAddCubeButton: () => {
		$("#add-cube-inactive").hide();
		$("#add-cube-active").show();
	},
	disableAddCubeButton: () => {
		$("#add-cube-inactive").show();
		$("#add-cube-active").hide();
	},
	displayGUI: (display) => {
		if(display){
			$("#gui").show();
		}
		else{
			$("#gui").hide();
		}
	},
	inTutorial: false
}

//Bind events to buttons
$("#create-polycube").on("click", function(){ GUIHandler.callbacks.onCreatePolycube();});
$("#add-cube-active").on("click", function(){ GUIHandler.callbacks.onAddCube();});
$("#load-polycube").on("change", function(evt){ 
	GUIHandler.callbacks.onLoadPolycube(event.target.files[0], false);

	$("#load-polycube").val("");
	$("#modalAddPolycube").modal("hide"); 
});
$(".tutorial-btn").on("click", function(){

	GUIHandler.inTutorial = !GUIHandler.inTutorial;

	if(GUIHandler.inTutorial){
		$("#enter-tutorial-btn").hide();
		$("#exit-tutorial-btn").show();
	}
	else{
		$("#exit-tutorial-btn").hide();
		$("#enter-tutorial-btn").show();
	}

	GUIHandler.callbacks.onTutorialClick(GUIHandler.inTutorial);
});
$("#delete-polycube").on("click", function(){ GUIHandler.callbacks.onDeletePolycube();});