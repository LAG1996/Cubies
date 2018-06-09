//import handlers
import { guiHandler } from '/view/handlers/handler-gui.js';
import { sceneHandler } from '/view/handlers/handler-scene.js';

const Cubies = (function(){

	console.log("Cubies has started!");
	let cubeFaceTemplate, cubeEdgeTemplate, cubeTemplate, arrowTemplate = null;
	let hasFace, hasEdge, hasArrow = false;

	//initialize Cubies
	loadModels();

	guiHandler.switchToCreatePolycubeView();

	requestAnimationFrame(update);


	function loadModels(){
		var importManager = new THREE.LoadingManager();
		var objLoader = new THREE.OBJLoader(importManager);

		var faceMesh, edgeMesh, arrowMesh = null;

		importCubeFace();
		importCubeEdge();
		importArrows();

		function importCubeFace(){
			objLoader.load('/imports/polycube-parts/cubeFace.obj', function (object) {
					faceMesh = object.children[0];
					hasFace = true;
				}, 
				function(xhr){}, 
				function(xhr) {
					throw "INIT_ERROR: NO FACE OBJECT FOUND"
			})
		}

		function importCubeEdge(){
			objLoader.load('/imports/polycube-parts/cubeHinge.obj', function (object) {
					edgeMesh = object.children[0];
					hasEdge = true;
				}, 
				function(xhr){}, 
				function(xhr) {
					throw "INIT_ERROR: NO HINGE OBJECT FOUND"
				})
		}

		function importArrows(){
			objLoader.load("/imports/arrow-models/Arrow.obj", function (object){
					arrowMesh = object.children[0];
					hasArrow = true;
				}, 
				function(xhr){},
				function(xhr){
					throw "INIT_ERROR: NO ARROW OBJECT FOUND"
			})
		}

		function assembleArrows(){
			let obj = new THREE.Group()
					
			let main_arrow = arrowMesh.clone()
			main_arrow.name = "main"
			main_arrow.material.color.setHex(0xFFFFFF)

			let outline = arrowMesh.clone()
			outline.name = "outline"
			outline.scale.set(1.01, 1.1, 1.1)
			outline.material.color.setHex(0x000000)
			outline.material.side = THREE.BackSide

			obj.add(main_arrow)
			obj.add(outline)

			arrowTemplate = obj
		}

		function assembleCubeTemplate(){}
	}

	function update(){
		sceneHandler.draw();
		requestAnimationFrame(update);
	}

});

//Run cubies
Cubies();