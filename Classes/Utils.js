function DEG2RAD(degrees)
{
	return degrees * Math.PI/180
}

function LatticeToReal(coord)
{
	return new THREE.Vector3(coord.x, coord.y + 0.125, coord.z)
}

function WorldToPolycube(coord, polycoord)
{
	var vec = new THREE.Vector3(coord.x, coord.y, coord.z)
	vec.add(polycoord)
	return vec
}