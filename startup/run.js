//import { controller } from '/view/handlers/controller.js' 

$(document).ready(function(){
	var hasFace, hasEdge, hasArrow = false;

	var importManager = new THREE.LoadingManager();
	var objLoader = new THREE.OBJLoader(importManager);

	var cubeFaceTemplate, cubeEdgeTemplate, cubeTemplate, arrowTemplate = null;

	var faceMesh, edgeMesh, arrowMesh = null;

	var initializeAsync = setInterval(() => {
		if(hasFace && hasEdge && hasArrow)
		{
			clearInterval(initializeAsync);

			startCubies();
		}
	}, 10)

	importCubeFace();
	importCubeEdge();
	importArrows();

	function importCubeFace(){
		objLoader.load('/imports/polycube-parts/cubeFace.obj', function (object) {
				faceMesh = object.children[0]
				hasFace = true
			}, 
			function(xhr){}, 
			function(xhr) {
				throw "INIT_ERROR: NO FACE OBJECT FOUND"
		})
	}

	function importCubeEdge(){
		objLoader.load('/imports/polycube-parts/cubeHinge.obj', function (object) {
				edgeMesh = object.children[0]
				hasEdge = true
			}, 
			function(xhr){}, 
			function(xhr) {
				throw "INIT_ERROR: NO HINGE OBJECT FOUND"
			})
	}

	function importArrows(){
		objLoader.load("/imports/arrow-models/Arrow.obj", function (object){

				arrowMesh = object.children[0]
				hasArrow = true
			}, 
			function(xhr){},
			function(xhr){
				throw "INIT_ERROR: NO ARROW OBJECT FOUND"
		})
	}

	function startCubies(){
		console.log("This is where I'd start cubies");
	}
})