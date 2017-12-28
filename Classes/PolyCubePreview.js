/*
*	The purpose of this module is to create scenes in which basic polycubes are drawn and previewed, and then send them
*	to the previewer cards in the DOM.
*/


function PolyCubePreview(controller){


	var myController = controller

	//Array of polycube enumerations. To be populated by the 
	var polycube_enumerations = new Array(8)

	//Array of indices that will keep track of which polycube the asynchronous loops are looking at.
	//Indices match with the indices we give each enumeration in their respective LoadEnumeration procedures.

	var p_cube_index = [0, 0, 0, 0, 0, 0, 0]

	//Array of asynchronous loops
	var asyncs = []

	LoadEnumeration("dicube", 0)
	LoadEnumeration("tricubes", 1)
	LoadEnumeration("tetracubes", 2)
	LoadEnumeration("pentacubes", 3)
	LoadEnumeration("hexacubes", 4)
	LoadEnumeration("heptacubes", 5)
	LoadEnumeration("octocubes", 6)

	console.log(polycube_enumerations)

	//Send the dicube to draw

	//Send the tricubes to draw

	//Generate the tetracubes
	asyncs.push(setInterval(function() {

		let enum_index = 2

		controller.Alert("LOAD_POLYCUBE", polycube_enumerations[enum_index][p_cube_index[enum_index]], true, true)

		console.log("Sending tetracube #" + p_cube_index[enum_index])

		p_cube_index[enum_index] += 1

		if(p_cube_index[enum_index] >= polycube_enumerations[enum_index].length)
		{
			console.log("Done generating tetracubes...")
			clearInterval(asyncs[0])
		}

	 }))

	//Generate the pentacubes
	asyncs.push(setInterval(function() { 

		let enum_index = 3


	}))

	//Generate the hexacubes
	asyncs.push(setInterval(function(){

		let enum_index = 4

	}))

	//Generate the heptacubes
	asyncs.push(setInterval(function() {

		let enum_index = 5

	 }))

	//Generate the octocubes
	asyncs.push(setInterval(function() { }))

	console.log(asyncs)

	//Read files and parse them into arrays of cube positions.
	function LoadEnumeration(enumeration_name, enumeration_index){

		var xhttp = new XMLHttpRequest()

		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){

				polycube_enumerations[enumeration_index] = JSON.parse(this.responseText)

			}
		}

		xhttp.open("GET", "./Classes/PolyCube_Templates/polycube_enumerations/"+enumeration_name+".txt", true)
		xhttp.send()

	}

}