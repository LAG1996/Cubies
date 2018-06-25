export let areModelsLoaded = false;

//Function to load cube parts and the arrows
export const loadModels = function(templates){
	//Create an import manager and loader. These automatically set meshes
	//as THREE meshes, so we can use its members.
	var importManager = new THREE.LoadingManager();
	var objLoader = new THREE.OBJLoader(importManager);

	var faceMesh, edgeMesh, arrowMesh = null;
	let hasFace, hasEdge, hasArrow = false;

	var cubeBuildInterval = setInterval(function(){
		if(hasFace && hasEdge){
			clearInterval(cubeBuildInterval);
			assembleCubeTemplate();
		}
	}, 10)

	var hasModelsInterval = setInterval(function(){
		if(hasFace && hasEdge && hasArrow){
			clearInterval(hasModelsInterval);
			areModelsLoaded = true;
		}
	}, 10)

	importCubeFace();
	importCubeEdge();
	importArrows();

	function importCubeFace(){
		objLoader.load('./imports/polycube-parts/cubeFace.obj', function (object) {
				templates.face = object.children[0];
				templates.face.material.transparent = true;
				hasFace = true;
			}, 
			function(xhr){}, 
			function(xhr) {
				throw "INIT_ERROR: NO FACE OBJECT FOUND"
		})
	}

	function importCubeEdge(){
		objLoader.load('./imports/polycube-parts/cubeHinge.obj', function (object) {
				templates.edge = object.children[0];
				templates.edge.scale.set(1.25, 1, 1.25); //Scale up the edges a bit to make them easy to pick
				hasEdge = true;
			}, 
			function(xhr){}, 
			function(xhr) {
				throw "INIT_ERROR: NO HINGE OBJECT FOUND"
			})
	}

	function importArrows(){
		objLoader.load("./imports/arrow-models/Arrow.obj", function (object){
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

		templates.arrow = obj;
		templates.arrow.matrixAutoUpdate = false;
	}

	function assembleCubeTemplate(){

		let face_names = ["front", "back", "left", "right", "up", "down"];

		let faceBodyMaterial = new THREE.MeshBasicMaterial({"color" : 0xC0BD88});
		faceBodyMaterial.transparent = true;
		faceBodyMaterial.opacity = 0.5;

		let edgeMaterial = new THREE.MeshBasicMaterial({"color" : 0x010101});

		let body = templates.face.clone();
		body.name = "body";
		body.material = faceBodyMaterial;

		let topEdge = templates.edge.clone();
		topEdge.rotateZ(NTY_RAD);
		topEdge.position.y += 1;
		topEdge.name = "up";
		topEdge.material = edgeMaterial;
		topEdge.up.set(1, 0, 0);

		let bottomEdge = templates.edge.clone();
		bottomEdge.rotateZ(NTY_RAD);
		bottomEdge.position.y -= 1;
		bottomEdge.name = "down";
		bottomEdge.material = edgeMaterial;
		bottomEdge.up.set(-1, 0, 0);

		let rightEdge = templates.edge.clone();
		rightEdge.position.x += 1;
		rightEdge.name = "right";
		rightEdge.material = edgeMaterial;
		rightEdge.up.set(0, 1, 0);

		let leftEdge = templates.edge.clone();
		leftEdge.position.x -= 1;
		leftEdge.name = "left";
		leftEdge.rotateZ(2*NTY_RAD);
		leftEdge.material = edgeMaterial;
		leftEdge.up.set(0, -1, 0);

		//Set the cube template as a new group
		templates.cube = new THREE.Group();
		templates.cube.matrixAutoUpdate = false;

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

			templates.cube.add(new_face);
			templates.cube.updateMatrix();
		}
	}
}