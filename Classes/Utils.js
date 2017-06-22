var Y_OFFSET = 0.125

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
	return 2*xz
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