var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(5, 10, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

var scene = new THREE.Scene();

/*
This part creates some geometry for the line. Of course, we'd want BufferGeometry since it is much more performant than regular geometry.
var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
geometry.vertices.push(new THREE.Vector3(0, 10, 0));
geometry.vertices.push(new THREE.Vector3(10, 0, 0));
*/

/*
The buffer geometry version of what you see above

var geometry = new THREE.BufferGeometry();
var vertices = new Float32Array(
[
-10, 0, 0,
0, 10, 0,
10, 0, 0
])
*/

/*
Now we take the concept above with the buffer geometry and create a grid of lines
*/

var geometry = new THREE.BufferGeometry();

var geometries = []

var vertices = [], colors = []
//We'll say we want a grid of size 10 with a spacing of two units for now
var size = 20
var spacing = 2
var halfway = size/2
//We'll also say that we want the color of the central lines to be red, and the other lines would be off-white
var central_color = new THREE.Color(0xFF0000)
var other_color = new THREE.Color(0xAAAAAA)

var color_index = 0
//Draw the grid
for(var i = -halfway, k = -halfway; i <= halfway; i += spacing, k+=spacing)
{
	vertices.push(i, 0, halfway, i, 0, -halfway)
	vertices.push(-halfway, 0, k, halfway, 0, k)

	other_color.toArray(colors, color_index); color_index+=3;
	other_color.toArray(colors, color_index); color_index+=3;
	other_color.toArray(colors, color_index); color_index+=3;
	other_color.toArray(colors, color_index); color_index+=3;
}
var f32Positions = new Float32Array(vertices)
var f32Colors = new Float32Array(colors)

geometry.addAttribute('position', new THREE.BufferAttribute(f32Positions, 3))
geometry.addAttribute('color', new THREE.BufferAttribute(f32Colors, 3))

var material = new THREE.LineDashedMaterial({vertexColors: THREE.VertexColors});

var lines = new THREE.LineSegments(geometry, material);

scene.add(lines)

requestAnimationFrame(update)

function update(){
	renderer.render(scene, camera)

	requestAnimationFrame(update)
}