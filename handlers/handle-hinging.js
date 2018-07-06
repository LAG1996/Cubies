const _animations = new WeakMap();
const _activeAnimationIndices = [];

const A_PRIVATES = new WeakMap();
class Animation{
	constructor(faces, hingeData, radsToRotateBy){
		A_PRIVATES.set(this, {
			isDone: false,
			faces: faces,
			hingeData: hingeData,
			timeElapsed: 0,
			duration: 2,
			rads: radsToRotateBy
		});
	}

	get isDone(){
		return A_PRIVATES.get(this).isDone;
	}

	continue(deltaTime){
		
		let percentage = A_PRIVATES.get(this).timeElapsed / A_PRIVATES.get(this).duration;
		let rotStep = SmoothStep(percentage) * A_PRIVATES.get(this).rads * deltaTime;

		if(Math.abs(rotStep) >= THREE.Math.degToRad(90)){
			A_PRIVATES.get(this).isDone = true;
		}
		else{
			rotateFaces(faces, hingeData, rotStep);
		}
	}
}

function SmoothStep(t){
	return (3*t*t) + (2*t*t);
}

function rotateFaces(facesToRotate, hingeData, rads){
	let q = new THREE.Quaternion();

	q.setFromAxisAngle(hingeData.axis, rads);

	facesToRotate.map((face) => {
		let dirRelativeToHinge = new THREE.Vector3().subVectors(face.position, hingeData.position);
		dirRelativeToHinge.applyQuaternion(q);
		dirRelativeToHinge.add(hingeData.position);

		face.position.copy(dirRelativeToHinge);
		face.position.quaternion.premultiply(q);
		face.updateMatrix();
	}) 
}

export const HingeAnimHandler = {
	startAnimation: (polycubeIndex, facesToRotate, hingeData, radsToRotateBy) => {
		_animations.set(polycubeIndex, new Animation(facesToRotate, hingeData, radsToRotateBy));
		_activeAnimationIndices.push(polycubeIndex);
	},
	continueAnimations: (deltaTime) => {
		_activeAnimationIndices.map((index) => {
			let anim = _animations.get(index);

			if(anim.isDone){
				stopAnimation(index);
			}
			else{
				anim.continue(deltaTime);
			}
		})
	},
	stopAnimation: (animIndex) => {
		_activeAnimationIndices.splice(_activeAnimationIndices.indexOf(animIndex), 1);
		_animations.delete(animIndex);
	}
}