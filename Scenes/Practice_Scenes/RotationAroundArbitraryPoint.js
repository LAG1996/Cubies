console.log("INSTRUCTIONS: Type \'setup_1()\' or \'setup_2()\' to change between setup types")

var sh = new SceneHandler()
var origin = new THREE.Object3D()
var default_position = new THREE.Vector3(0, 1, 0)

squares = []

AddASquare()

var clock = new THREE.Clock()
var rotateSpeed = 2
var rotationAxis = new THREE.Vector3(1, 0, 0)

sh.RequestAddToScene(GenerateGrid(100, 2, 0x000000))
sh.RequestAddToScene(origin)

var interval_1
var interval_2


function setup_1(){
	console.log('Parent the practice square to the empty origin object and then rotate that origin')
	console.log('Note that the origin is at <0, 0, 0>. Change the square\'s position to see how it rotates with respects to the origin')
	clearInterval(interval_2)
	

	origin.rotation.x = 0
	origin.rotation.y = 0
	origin.rotation.z = 0

	var z = 0
	for(var index in squares)
	{
		origin.add(squares[index])
	}

	

	interval_1 = setInterval(function(){update_1()})
}

function setup_2(){
	console.log('Parent the practice square to the scene and rotate it using matrices around the origin')
	console.log('Note that the origin is at <0, 0, 0>. Change the square\'s position to see how it rotates with respects to the origin')
	clearInterval(interval_1)
	
	var z = 0
	for(var index in squares)
	{
		var s = squares[index]
		s.position.copy(default_position)
		s.position.z += z

		z -= 2

		sh.RequestAddToScene(s)
	}

	interval_2 = setInterval(function(){update_2()})	
}

function update_1(){
	rotationAxis.normalize()
	origin.rotateOnAxis(rotationAxis, DEG2RAD(9 * clock.getDelta() * rotateSpeed))
}

function update_2(){
	rotationAxis.normalize()
	for(var index in squares)
	{
		var s = squares[index]

		var practiceSquare_dir = new THREE.Vector3().subVectors(s.position, origin.position)
		practiceSquare_dir.applyAxisAngle(rotationAxis, DEG2RAD(9 * clock.getDelta() * rotateSpeed))
		s.position.copy(practiceSquare_dir)
	
		s.lookAt(origin.position)
	}
}

function stop(){

	clearInterval(interval_1)
	clearInterval(interval_2)
}

function AddASquare(){
	var s = GenerateGrid(2, 1, 0xFF0000)

	s.position.copy(default_position)

	s.position.y += squares.length * 2

	s.rotateX(DEG2RAD(90))

	squares.push(s)

	stop()
}

function ChangeDefaultPosition(x, y, z)
{
	default_position.x = x
	default_position.y = y
	default_position.z = z

	for(var index in squares)
	{
		var s = squares[index]

		s.position.copy(default_position)

		s.position.y += index*2
	}

	stop()
}