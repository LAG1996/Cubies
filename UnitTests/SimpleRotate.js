//A script that generates a simple polycube (1 cube), cuts three edges, and then tries to rotate

function SimpleRotateTest()
{
	CONTROL.Alert('NEW_POLYCUBE', new THREE.Vector3(0, 0, 0), "Test_Poly_1")

	var p_cube = PolyCube.L_Polycubes["Test_Poly_1"]

	p_cube.Add_Cube(new THREE.Vector3(0, 0, 0))
	
	p_cube.CutEdge(p_cube.Obj.getObjectByName('c0front_up'))
	p_cube.CutEdge(p_cube.Obj.getObjectByName('c0right_up'))
	p_cube.CutEdge(p_cube.Obj.getObjectByName('c0up_up'))

}