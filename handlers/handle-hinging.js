//Module that handles rotations in Cubies

const _animations = new Map(); 	//Maps an animation index (i.e. the polycube being manipulated) to an animation object

const A_PRIVATES = new WeakMap(); //Map of private variables for animations					
class Animation{
	constructor(faces, hingeData, radsToRotateBy){
		A_PRIVATES.set(this, {
			isDone: false,
			faces: faces,
			correctedFaceData: new WeakMap(),
			hingeData: hingeData,
			timeElapsed: 0,
			duration: .5,
			totalRot: 0,
			rads: radsToRotateBy,
		});

		//Simulate a finished rotation and store the data for later.
		let q = new THREE.Quaternion();
		q.setFromAxisAngle(hingeData.axis, radsToRotateBy);
		faces.map((face) => {
			let faceClone = face.clone();

			let sepVec = new THREE.Vector3().subVectors(faceClone.position, hingeData.position);
			sepVec.applyQuaternion(q);
			sepVec.add(hingeData.position);
			sepVec = toLatticeVector(sepVec);

			faceClone.position.copy(sepVec);
			faceClone.quaternion.premultiply(q);

			faceClone.updateMatrix();

			A_PRIVATES.get(this).correctedFaceData.set(face, {position: faceClone.position, rotation: faceClone.rotation});
		})
	}

	//getters
	get isDone(){
		return A_PRIVATES.get(this).isDone;
	}

	//Continues the animation
	continue(deltaTime){

		//Check if we've rotated enough. If so, correct the face objects' data (making them orthogonally aligned)
		if(Math.abs(A_PRIVATES.get(this).totalRot) >= THREE.Math.degToRad(90)){
			A_PRIVATES.get(this).isDone = true;
			correctFaces(A_PRIVATES.get(this).correctedFaceData, A_PRIVATES.get(this).faces);
			return;
		}
			
		//If we haven't rotated enough, take the next step in the rotation
		let percentage = A_PRIVATES.get(this).timeElapsed / A_PRIVATES.get(this).duration;
		let rotStep = SmoothStep(percentage) * A_PRIVATES.get(this).rads * deltaTime;

		A_PRIVATES.get(this).totalRot += rotStep;
		A_PRIVATES.get(this).timeElapsed += deltaTime;

		rotateFaces(A_PRIVATES.get(this).faces, A_PRIVATES.get(this).hingeData, rotStep);
	}
}

function SmoothStep(t){
	return (3*t*t) + (2*t*t);
}

//Using the data we precomputed in the constructor, we simply copy it over to corresponding faces.
//This is done to make faces snap to the correct orientation.
function correctFaces(correctedFaceData, rotatedFaces){
	rotatedFaces.map((face) => {
		let correctFaceData = correctedFaceData.get(face);

		face.position.copy(correctFaceData.position);
		face.rotation.copy(correctFaceData.rotation);

		face.updateMatrix();
	});
}

//Rotate the faces a step
function rotateFaces(facesToRotate, hingeData, rads){
	let q = new THREE.Quaternion();

	q.setFromAxisAngle(hingeData.axis, rads);

	facesToRotate.map((face) => {
		let sepVec = new THREE.Vector3().subVectors(face.position, hingeData.position);
		sepVec.applyQuaternion(q);
		sepVec.add(hingeData.position);

		face.position.copy(sepVec);
		face.quaternion.premultiply(q);
		face.updateMatrix();
	}) 
}

//Object representing the animation handler. Simply creates and stops animation instances
export const HingeAnimHandler = {
	startAnimation: (animIndex, facesToRotate, hingeData, radsToRotateBy) => {
		_animations.set(animIndex, new Animation(facesToRotate, hingeData, radsToRotateBy));
	},
	continueAnimations: (deltaTime) => {
		let finishedAnimations = [];
		_animations.forEach((anim, index) => {

			if(anim.isDone){
				finishedAnimations.push(index);
			}
			else{
				anim.continue(deltaTime);
			}
		})

		finishedAnimations.map((animIndex) => {
			_animations.delete(animIndex);
		})
	},
	stopAnimation: (animIndex) => {
		_animations.delete(animIndex);
	},
	hasAnimationIndex: (animIndex) => {
		return _animations.has(polycubeIndex);
	}
}