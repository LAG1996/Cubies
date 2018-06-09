//Class representing the handler for the GUI.
//This class handles changes to the DOM using JQUERY.
//We use the ES5 approach to creating the class since we
//aren't going to make more than one instance.
const GUIHandler = function(_tutorialMode){
	//Private properties
	let _showAddCube = true;

	//Public functions
	//Hides the add cube, save polycube and delete polycube buttons 
	//and exposes the add polycube and delete polycube buttons
	this.switchToCreatePolycubeView = function(){
		$("#add-cube-active").hide();
		$("#add-cube-inactive").hide();
		$("#save-polycube").hide();
		$("#delete-polycube").hide();

		$("#add-polycube").show();
	}

	this.switchToPolycubeView = function(polycubeName){
		$("#add-cube-active").show();
		$("#add-cube-inactive").show();
		$("#save-polycube").show();
		$("#delete-polycube").show();
		
		$("#add-polycube").hide();
	}

	this.switchCursor = function(cursorType){
		switch(cursorType){
			case "cell" : $("#container").css("cursor", "cell"); break;
			case "crosshair" : $("#container").css("cursor", "crosshair"); break;
			default: $("#container").css("cursor", "default");
		}
	}

	this.toggleAddCubeButton = function(){
		$("#add-cube-active").toggle();
		$("#add-cube-inactive").toggle();
	}

	//Bind all of these functions to this instance
	this.switchToCreatePolycubeView = this.switchToCreatePolycubeView.bind(this);
	this.switchToPolycubeView = this.switchToPolycubeView.bind(this);
	this.switchCursor = this.switchCursor.bind(this);
	this.toggleAddCubeButton = this.toggleAddCubeButton.bind(this);

	//private functions
	let handleAddCube = function(){
		console.log("Add Cube function fired");
	}

	let handleAddPolycube = function(){
		console.log("Add Polycube function fired");
	}

	let handleLoadPolycube = function(){
		console.log("Load Polycube function fired");
	}

	let handleSavePolycube = function(){
		console.log("Save Polycube function fired");
	}

	let handleDeletePolycube = function(){
		console.log("Delete Polycube function fired");
	}

	//bind these functions to this instance
	handleAddCube = handleAddCube.bind(this);
	handleAddPolycube = handleAddPolycube.bind(this);
	handleLoadPolycube = handleLoadPolycube.bind(this);
	handleDeletePolycube = handleDeletePolycube.bind(this);

	//bind events to buttons
	$("#add-polycube").on("click", function(){handleAddPolycube();});
	$("#load-polycube").on("click", function(){handleLoadPolycube();});
	$("#delete-polycube").on("click", function(){handleDeletePolycube();});
	$("#add-cube-active").on("click", function(){handleAddCube();});

}

//export an instance of the guiHandler (we'd only need one)
export const guiHandler = new GUIHandler(false);
