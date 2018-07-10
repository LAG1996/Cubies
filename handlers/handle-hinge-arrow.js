//Module representing the handler for the white and black arrows that appear when the user is hinging polycube faces
const _viewArrowPair = new THREE.Group();
_viewArrowPair.name = "view arrows";

const _pickArrowPair = new THREE.Group();
_pickArrowPair.name = "pick arrows";

const _arrowAlignAxis = new THREE.Vector3();

export const setArrowTemplates = (arrowTemplate) => {
	let whiteArrow = new THREE.Group();
	whiteArrow.name = "white arrow";
	whiteArrow.position.x += 1.25;

	let blackArrow = new THREE.Group();
	blackArrow.name = "black arrow";
	blackArrow.position.x += -1.25;
	blackArrow.rotateY(THREE.Math.degToRad(180));

	let arrow = arrowTemplate.clone();
	arrow.name = "main"
	let outline = arrowTemplate.clone();
	outline.name = "outline";
	outline.scale.set(1.1, 1.1, 1.1);

	arrow.material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
	outline.material = new THREE.MeshBasicMaterial({color: 0x000000});
	outline.material.side = THREE.BackSide;

	whiteArrow.add(arrow.clone());
	whiteArrow.add(outline.clone());

	arrow.material = new THREE.MeshBasicMaterial({color: 0x000000});
	outline.material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
	outline.material.side = THREE.BackSide;

	blackArrow.add(arrow.clone());
	blackArrow.add(outline.clone());

	_viewArrowPair.add(whiteArrow);
	_viewArrowPair.add(blackArrow);

	let pickWhiteArrow = whiteArrow.clone();
	let pickBlackArrow = blackArrow.clone();

	pickWhiteArrow.remove(pickWhiteArrow.getObjectByName("main"));
	pickBlackArrow.remove(pickBlackArrow.getObjectByName("main"));

	pickWhiteArrow.children[0].material = new THREE.MeshBasicMaterial({color: 1});
	pickBlackArrow.children[0].material = new THREE.MeshBasicMaterial({color: 2});

	_pickArrowPair.add(pickWhiteArrow);
	_pickArrowPair.add(pickBlackArrow);

	_viewArrowPair.visible = false;

	return {viewArrowPair: _viewArrowPair, pickArrowPair: _pickArrowPair};
}

export const ArrowHandler = {
	//Given the position and normal of a face, place the arrow pair on the face with the white arrow aligned with its normal.
	showArrowsAt: (facePosition, faceNormal) => {
			
		if(faceNormal.equals(left)){
			_viewArrowPair.setRotationFromAxisAngle(up, THREE.Math.degToRad(180));
		}
		else if(faceNormal.equals(up)){
			_viewArrowPair.setRotationFromAxisAngle(front, THREE.Math.degToRad(90));
		}
		else if(faceNormal.equals(down)){
			_viewArrowPair.setRotationFromAxisAngle(front, THREE.Math.degToRad(-90));
		}
		else if(faceNormal.equals(front)){
			_viewArrowPair.setRotationFromAxisAngle(up, THREE.Math.degToRad(-90));
		}
		else if (faceNormal.equals(back)){
			_viewArrowPair.setRotationFromAxisAngle(up, THREE.Math.degToRad(90));
		}
		else if(faceNormal.equals(right)){
			_viewArrowPair.setRotationFromAxisAngle(right, THREE.Math.degToRad(90));
		}
		else{
			console.err("CAUTION: This face's normal is not orthonormal");
		}

		_pickArrowPair.rotation.copy(_viewArrowPair.rotation);

		_viewArrowPair.position.copy(facePosition);
		_pickArrowPair.position.copy(facePosition);

		_arrowAlignAxis.copy(faceNormal);

		_viewArrowPair.visible = true;
	},
	hideArrows: () => {
		_viewArrowPair.visible = false;
	},
	getChosenArrowData : (arrowPickColor) => {
		if(arrowPickColor === 1 || arrowPickColor === 2){
			return {alignAxis: _arrowAlignAxis.clone(), color: arrowPickColor === 1 ? "white" : "black"}
		}
		else{
			return null;
		}
	}
};