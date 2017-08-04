var sh = new SceneHandler()
var origin = new THREE.Object3D()
var practiceSquare = GenerateGrid(2, 1, 0xFF0000)
practiceSquare.position.y = 1

origin.add(practiceSquare)
var clock = new THREE.Clock()
var rotateSpeed = 2
var rotationAxis = new THREE.Vector3(1, 0, 0)


sh.RequestAddToScene(GenerateGrid(100, 2, 0x000000))
//sh.RequestAddToScene(practiceSquare)
sh.RequestAddToScene(origin)

requestAnimationFrame(update)

function update(){
	var practiceSquare_dir = new THREE.Vector3().subVectors(practiceSquare.position, origin)
	rotationAxis.normalize()
	//practiceSquare.rotateOnAxis(rotationAxis, DEG2RAD(9)* clock.getDelta() * rotateSpeed)
	origin.rotateOnAxis(rotationAxis, DEG2RAD(9)* clock.getDelta() * rotateSpeed)
	//console.log(practiceSquare_dir)

	requestAnimationFrame(update)
}