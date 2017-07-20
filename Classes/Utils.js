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
	if(obj)
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