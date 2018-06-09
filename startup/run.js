import { Cubies } from '/startup/Cubies.js';

$(document).ready(function(){
	var hasFace, hasEdge, hasArrow = false;

	var importManager = new THREE.LoadingManager();
	var objLoader = new THREE.OBJLoader(importManager);

	var cubeFaceTemplate, cubeEdgeTemplate, cubeTemplate, arrowTemplate = null;

	var faceMesh, edgeMesh, arrowMesh = null;

	var runCubiesInterval = setInterval(() => {
		if(hasFace && hasEdge && hasArrow)
		{
			clearInterval(runCubiesInterval);

			let cubiesMain = new Cubies();
		}
	}, 10)

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
})