//import handlers
import { guiHandler } from '/view/handlers/handler-gui.js';
import { sceneHandler } from '/view/handlers/handler-scene.js';

//import common utility stuff
import { NTY_RAD } from '/api/utils.js';

//import polycube class and interface
import { Polycube } from '/api/polycube.js';
import { existsPolycubeName } from '/api/polycube.js';


let cubeFaceTemplate, cubeEdgeTemplate, cubeTemplate, arrowTemplate = null;

//The main Cubies function - Represents the core function of our program.
const Cubies = function(){

	console.log("Cubies has started!");

	//Default to the create polycube view on the gui
	guiHandler.switchToCreatePolycubeView();

	//Start the main loop
	requestAnimationFrame(update);

	//Update is called at every frame. Handles drawing 
	function update(){
		sceneHandler.draw();
		requestAnimationFrame(update);
	}
}

//Load the 3D meshes
loadModels();
//Run cubies
Cubies();

runTests();

//Function to load cube parts and the arrows
function loadModels(){
	//Create an import manager and loader. These automatically set meshes
	//as THREE meshes, so we can use its members.
	var importManager = new THREE.LoadingManager();
	var objLoader = new THREE.OBJLoader(importManager);

	let hasFace, hasEdge, hasArrow = false;
	var faceMesh, edgeMesh, arrowMesh = null;

	var cubeBuildInterval = setInterval(function(){
		if(hasFace && hasEdge){
			clearInterval(cubeBuildInterval);
			assembleCubeTemplate();
		}
	}, 10)

	importCubeFace();
	importCubeEdge();
	importArrows();

	function importCubeFace(){
		objLoader.load('/imports/polycube-parts/cubeFace.obj', function (object) {
				cubeFaceTemplate = object.children[0];
				cubeFaceTemplate.material.transparent = true;
				cubeFaceTemplate.material.opacity = 0.5;
				cubeFaceTemplate.matrixAutoUpdate = false;
				hasFace = true;
			}, 
			function(xhr){}, 
			function(xhr) {
				throw "INIT_ERROR: NO FACE OBJECT FOUND"
		})
	}

	function importCubeEdge(){
		objLoader.load('/imports/polycube-parts/cubeHinge.obj', function (object) {
				cubeEdgeTemplate = object.children[0];
				cubeEdgeTemplate.scale.set(1.25, 1.25, 1.25); //Scale up the edges a bit to make them easy to pick
				cubeEdgeTemplate.matrixAutoUpdate = false;
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
		let obj = new THREE.Group();
				
		let main_arrow = arrowMesh.clone();
		main_arrow.name = "main";
		main_arrow.material.color.setHex(0xFFFFFF);

		let outline = arrowMesh.clone();
		outline.name = "outline";
		outline.scale.set(1.01, 1.1, 1.1);
		outline.material.color.setHex(0x000000);
		outline.material.side = THREE.BackSide;

		obj.add(main_arrow);
		obj.add(outline);

		arrowTemplate = obj;
		arrowTemplate.matrixAutoUpdate = false;
	}

	function assembleCubeTemplate(){

		let face_names = ["front", "back", "left", "right", "up", "down"];

		let body = cubeFaceTemplate.clone();
		body.name = "body";
		body.material.color.setHex(0xC0BD88);

		let topEdge = cubeEdgeTemplate.clone();
		topEdge.rotateZ(NTY_RAD);
		topEdge.position.y += 1;
		topEdge.name = "up";
		topEdge.material.color.setHex(0x010101);
		topEdge.up.set(1, 0, 0);

		let bottomEdge = cubeEdgeTemplate.clone();
		bottomEdge.rotateZ(NTY_RAD);
		bottomEdge.position.y -= 1;
		bottomEdge.name = "down";
		bottomEdge.material.color.setHex(0x010101);
		bottomEdge.up.set(-1, 0, 0);

		let rightEdge = cubeEdgeTemplate.clone();
		rightEdge.position.x += 1;
		rightEdge.name = "right";
		rightEdge.material.color.setHex(0x010101);
		rightEdge.up.set(0, 1, 0);

		let leftEdge = cubeEdgeTemplate.clone();
		leftEdge.position.x -= 1;
		leftEdge.name = "left";
		leftEdge.rotateZ(2*NTY_RAD);
		leftEdge.material.color.setHex(0x010101);
		leftEdge.up.set(0, -1, 0);

		//Set the cube template as a new group
		cubeTemplate = new THREE.Group();
		cubeTemplate.matrixAutoUpdate = false;

		//Assemble the faces and add them to the cube template
		//Faces are rotated appropriately
		for(let i = 0; i < 6; i++)
		{
			let new_face = new THREE.Group();

			new_face.add(body.clone());
			new_face.add(topEdge.clone());
			new_face.add(bottomEdge.clone());
			new_face.add(rightEdge.clone());
			new_face.add(leftEdge.clone());
			new_face.name = face_names[i];

			new_face.matrixAutoUpdate = false;

			if(face_names[i] === "front")
			{
				new_face.position.z = 1;
				new_face.up.set(0, 0, 1);
			}
			else if(face_names[i] === "back")
			{
				new_face.position.z = -1;

				//RotateUpAxis(new_face, NTY_RAD, new THREE.Vector3(1, 0, 0));
				//RotateUpAxis(new_face, 2*NTY_RAD, new THREE.Vector3(1, 0, 0))
				new_face.up.set(0, 0, -1);

				new_face.rotateX(2*NTY_RAD);
				new_face.rotateY(2*NTY_RAD);
			}
			else if(face_names[i] === "down")
			{
				new_face.position.y = -1;

				//RotateUpAxis(new_face, -NTY_RAD, new THREE.Vector3(1, 0, 0));
				//RotateUpAxis(new_face, 2*NTY_RAD, new THREE.Vector3(0, 0, 1));

				new_face.up.set(0, -1, 0);

				new_face.rotateX(-NTY_RAD);
				new_face.rotateZ(2*NTY_RAD);
			}
			else if(face_names[i] === "up")
			{
				new_face.position.y = 1;

				//RotateUpAxis(new_face, -NTY_RAD, new THREE.Vector3(1, 0, 0));
				new_face.up.set(0, 1, 0);

				new_face.rotateX(-NTY_RAD);
			}
			else if(face_names[i] === "left")
			{
				new_face.position.x = -1;

				//RotateUpAxis(new_face, -NTY_RAD, new THREE.Vector3(0, 1, 0));
				//RotateUpAxis(new_face, 2*NTY_RAD, new THREE.Vector3(1, 0, 0));
				new_face.up.set(-1, 0, 0);

				new_face.rotateY(-NTY_RAD);
				new_face.rotateX(NTY_RAD*2);
			}
			else if(face_names[i] === "right")
			{
				new_face.position.x = 1;

				//RotateUpAxis(new_face, NTY_RAD, new THREE.Vector3(0, 1, 0));
				new_face.up.set(1, 0, 0);

				new_face.rotateY(NTY_RAD);
			}

			new_face.scale.set(.9, .9, .9);
			new_face.updateMatrix();

			cubeTemplate.add(new_face);
			cubeTemplate.updateMatrix();
		}
	}
}

//some functions for testing
function runTests(){
	polycubeTest();
}

function polycubeTest(){
	let pCube = null;
	try{
		pCube = new Polycube();

		if(pCube.id){ failedTest("Private polycube property was accessed illegally.");}

		if(pCube === undefined){ failedTest("Polycube was not created successfully"); }

		if(pCube.addCube(new THREE.Vector3(0, 0, 0))){ failedTest("Illegal cube addition: cube added where a cube already exists."); }

		if(!pCube.addCube(new THREE.Vector3(0, 1, 0))){ failedTest("Failed to add cube at 0, 1, 0"); }

		if(pCube.faceCount !== 10){ failedTest("Incorrect face count."); }

		if(pCube.addCube(new THREE.Vector3(0, 3, 0))){ failedTest("Illegal cube addition: cube added without adjacent cubes."); }

		if(!pCube.addCube(new THREE.Vector3(0, -1, 0))){ failedTest("Failed to add cube at 0, -1, 0"); }

		if(!pCube.addCube(new THREE.Vector3(0, 2, 0))){ failedTest("Failed to add cube at 0, 2, 0"); }

		if(pCube.cubeCount !== 4){ failedTest("Incorrect number of cubes"); }

		pCube.name = "Peter";

		if(pCube.name !== "Peter"){ failedTest("Name change failed"); }

		let pCube2 = new Polycube();
		pCube2.name = "Peter";

		if(pCube2.name === "Peter"){ failedTest("Duplicate names"); }
	}
	catch(err){
		console.error(err);
	}
	finally{
		if(pCube)
			pCube.destroy();
	}
}

function failedTest(message){
	throw "Test failed: " + message;
}