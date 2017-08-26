var scene = new SceneHandler()


var big_adjacency_graph = []

for(var i = 0; i < 1000; i++)
{
	big_adjacency_graph[i] = []

	for(var j = 0; j < 1000; j++)
		big_adjacency_graph[i][j] = false
}

var big_grid = GenerateGrid(50, 2, 0x000000)


var polyomino = new THREE.Group()
var square = GenerateGrid(2, 2, Math.floor(Math.random() * 0xFFFFFF))
square.rotation.x = DEG2RAD(90)

var last_pos = new THREE.Vector3().copy(square.position)

polyomino.add(square)

polyomino.position.y += 1

scene.RequestAddToScene(big_grid)
scene.RequestAddToScene(polyomino)

$(window).on("keyup", function(event){

	var key = String.fromCharCode(event.which)
	square = GenerateGrid(2, 2, Math.floor(Math.random() * 0xFFFFFF))
	square.rotation.x = DEG2RAD(90)
	square.position.copy(last_pos)
	square.position.multiplyScalar(2)

	if(key == "W")
	{
		if(!big_adjacency_graph[last_pos.x][last_pos.y + 1])
			big_adjacency_graph[last_pos.x][last_pos.y + 1] = true

		square.position.y = (last_pos.y += 1)*2

		polyomino.add(square)
	}
	else if(key == "D")
	{
		if(!big_adjacency_graph[last_pos.x + 1][last_pos.y])
			big_adjacency_graph[last_pos.x + 1][last_pos.y] = true

		square.position.x = (last_pos.x += 1)*2
		
		polyomino.add(square)
	}
	else if(key == "S")
	{
		if(last_pos.y == 0)
			return

		if(!big_adjacency_graph[last_pos.x][last_pos.y - 1])
			big_adjacency_graph[last_pos.x][last_pos.y - 1] = true

		square.position.y = (last_pos.y -= 1)*2
		
		polyomino.add(square)
	}
	else if(key == "A")
	{
		if(last_pos.x == 0)
			return

		if(!big_adjacency_graph[last_pos.x - 1][last_pos.y])
			big_adjacency_graph[last_pos.x - 1][last_pos.y] = true

		square.position.x = (last_pos.x -= 1)*2
		
		polyomino.add(square)
	}

})

requestAnimationFrame(update)

function update()
{
	scene.Draw()

	requestAnimationFrame(update)
}