/*
*	The purpose of this module is to create scenes in which basic polycubes are drawn and previewed, and then send them
*	to the previewer cards in the DOM.
*/


function PolyCubePreview(controller){

	var myController = controller

	//Array of polycube enumerations. To be populated by the 
	var polycube_templates = new Array()

	//Array of indices that will keep track of which polycube the asynchronous loops are looking at.
	//Indices match with the indices we give each enumeration in their respective LoadEnumeration procedures.

	var p_cube_index = new Array()

	//Array of asynchronous loops
	var asyncs = []

	//Load up the following text files and give them each index
	LoadTemplate("donut", 0)
	LoadTemplate("dali cross", 1)
	LoadTemplate("rubix cube", 2)
	LoadTemplate("2x2x2", 3)

/*
	//Generate all of the templates
	asyncs.push(setInterval(function() {

		//There are 8 enumerations to deal with
		for(let enum_index = 0 ; enum_index < polycube_templates.length; enum_index+=1)
		{
			//Check if the array contains those enumerations
			if(polycube_templates[enum_index])
			{
				//Send the cube positions to the control for processing
				controller.Alert("LOAD_POLYCUBE", polycube_templates[enum_index][p_cube_index[enum_index]], true, true)

				//Increment the index for the polycube enumeration we just looked at.
				p_cube_index[enum_index] += 1

				//If that index reached a number that is greater than the amount of polycubes with the current enumeration,
				//free up that space.
				if(p_cube_index[enum_index] >= polycube_templates[enum_index].length)
				{
					delete polycube_templates[enum_index]

					controller.Alert("SAVE_ENUM", enum_index)

					console.log(polycube_templates)
					//Once we've looked through all enumerations, free up the space held by this object, and end the asyncronous loop.
					if(Object.keys(polycube_templates).length == 0)
					{
						//Put polycube enumerations up for garbage collection
						polycube_templates = null

						clearInterval(asyncs[0])

						asyncs = null

					}
				}
			}
		}
	 }))*/

	//Read files and parse them into arrays of cube positions.
	function LoadTemplate(template_name, template_index){

		var xhttp = new XMLHttpRequest()

		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){
				controller.Alert("LOAD_POLYCUBE", JSON.parse(this.responseText), true, true)
			}
		}

		xhttp.open("GET", "./Classes/PolyCube_Templates/selected_templates/"+template_name+".txt", true)
		xhttp.send()

	}

}