const Y_OFFSET = -0.115
const XZ_OFFSET = 0

function DEG2RAD(degrees)
{
	return degrees * Math.PI/180
}

function LatticeToReal(coord)
{
	return new THREE.Vector3(LatticeToRealXZ(coord.x), LatticeToRealY(coord.y), LatticeToRealXZ(coord.z))
}

function LatticeToRealXZ(xz)
{
	xz = 2*xz
	if(xz != 0)
	{
		if(xz < 0)
			return xz - XZ_OFFSET
		else
			return xz + XZ_OFFSET
	}
	
}

function LatticeToRealY(y)
{
	if(y != 0)
	{
		if(y < 0)
		{
			return 2*y - Y_OFFSET
		}
		else
		{
			return 2*y + Y_OFFSET
		}
	}
	else
		return y
}


function WorldToPolycube(coord, polycoord)
{
	var vec = new THREE.Vector3().copy(coord)
	vec.add(polycoord)
	return vec
}

function ObjectExists(obj)
{
	if(obj && obj !== null && obj !== undefined)
		return true
	else
		return false
}

function SumOfVectors(l_vectors)
{
	var vec = new THREE.Vector3()
	for(index = 0; index < l_vectors.length; index++)
	{
		vec.add(l_vectors[index])
	}

	return vec
}

function MakePositiveVector(vector)
{
	var new_vec = vector.clone()

	if(new_vec.x < 0)
	{
		new_vec.x *= -1
	}

	if(new_vec.y < 0)
	{
		new_vec.y *= -1
	}

	if(new_vec.z < 0)
	{
		new_vec.z *= -1
	}

	return new_vec.clone()
}

function VectorToString(vector)
{
	return vector.x.toFixed(1)+","+vector.y.toFixed(1)+","+vector.z.toFixed(1)
}

function IsBasisVector(vector)
{
	var vectorString = VectorToString(vector)
	var up = VectorToString(new THREE.Vector3(0, 1, 0))
	var right = VectorToString(new THREE.Vector3(1, 0, 0))
	var front = VectorToString(new THREE.Vector3(0, 0, 1))

	return (vectorString == up || vectorString == right || vectorString == front)
}

function GenerateGrid(size, spacing, color)
{
	var geometry = new THREE.BufferGeometry();

	var geometries = []
	
	var vertices = [], colors = []
	//We'll say we want a grid of size 10 with a spacing of two units for now
	var size = size
	var spacing = spacing
	var halfway = size/2
	//We'll also say that we want the color of the central lines to be red, and the other lines would be off-white
	var line_color = new THREE.Color(color)
	
	var color_index = 0
	//Draw the grid
	for(var i = -halfway, k = -halfway; i <= halfway; i += spacing, k+=spacing)
	{
		vertices.push(i, 0, halfway, i, 0, -halfway)
		vertices.push(-halfway, 0, k, halfway, 0, k)
	
		line_color.toArray(colors, color_index); color_index+=3;
		line_color.toArray(colors, color_index); color_index+=3;
		line_color.toArray(colors, color_index); color_index+=3;
		line_color.toArray(colors, color_index); color_index+=3;
	}
	var f32Positions = new Float32Array(vertices)
	var f32Colors = new Float32Array(colors)
	
	geometry.addAttribute('position', new THREE.BufferAttribute(f32Positions, 3))
	geometry.addAttribute('color', new THREE.BufferAttribute(f32Colors, 3))
	
	var material = new THREE.LineDashedMaterial({vertexColors: THREE.VertexColors});

	var lines = new THREE.LineSegments(geometry, material);

	return lines
}