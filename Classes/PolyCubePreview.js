/*
*	The purpose of this module is to create scenes in which basic polycubes are drawn and previewed, and then send them
*	to the previewer cards in the DOM.
*/


function PolyCubePreview(controller){

	var myController = controller

	//Array of polycube enumerations. To be populated by the 
	var polycube_enumerations = new Array(7)

	//Array of indices that will keep track of which polycube the asynchronous loops are looking at.
	//Indices match with the indices we give each enumeration in their respective LoadEnumeration procedures.

	var p_cube_index = [0, 0, 0, 0, 0, 0, 0]

	//Array of asynchronous loops
	var asyncs = []

	//Load up the following text files and give them each index
	LoadEnumeration("dicube", 0)
	LoadEnumeration("tricubes", 1)
	LoadEnumeration("tetracubes", 2)
	LoadEnumeration("pentacubes", 3)
	LoadEnumeration("hexacubes", 4)
	LoadEnumeration("heptacubes", 5)
	LoadEnumeration("octocubes", 6)

	/*
	//Generate all other types of polycubes using an asyncronous loop.
	asyncs.push(setInterval(function() {

		//There are 8 enumerations to deal with
		for(let enum_index = 0 ; enum_index < 7 ; enum_index+=1)
		{
			if(localStorage["poly_enum" + enum_index])
			{
				delete polycube_enumerations[enum_index]
				continue
			}

			//Check if the array contains those enumerations
			if(polycube_enumerations[enum_index])
			{
				//Send the cube positions to the control for processing
				controller.Alert("LOAD_POLYCUBE", polycube_enumerations[enum_index][p_cube_index[enum_index]], true, true)

				//Increment the index for the polycube enumeration we just looked at.
				p_cube_index[enum_index] += 1

				//If that index reached a number that is greater than the amount of polycubes with the current enumeration,
				//free up that space.
				if(p_cube_index[enum_index] >= polycube_enumerations[enum_index].length)
				{
					delete polycube_enumerations[enum_index]

					controller.Alert("SAVE_ENUM", enum_index)

					console.log(polycube_enumerations)
					//Once we've looked through all enumerations, free up the space held by this object, and end the asyncronous loop.
					if(Object.keys(polycube_enumerations).length == 0)
					{
						//Put polycube enumerations up for garbage collection
						polycube_enumerations = null

						clearInterval(asyncs[0])

						asyncs = null

					}
				}
			}
		}
	 }))*/

	//Read files and parse them into arrays of cube positions.
	function LoadEnumeration(enumeration_name, enumeration_index){

		var xhttp = new XMLHttpRequest()

		if(localStorage.getItem(enumeration_name))
			return

		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){

				//console.log(JSON.parse(this.responseText))
				//polycube_enumerations[enumeration_index] = JSON.parse(this.responseText)
				localStorage.setItem(enumeration_name, this.responseText)
			}
		}

		xhttp.open("GET", "./Classes/PolyCube_Templates/polycube_enumerations/"+enumeration_name+".txt", true)
		xhttp.send()

	}

}