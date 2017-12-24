/*
*	The purpose of this module is to create scenes in which basic polycubes are drawn and previewed, and then send them
*	to the previewer cards in the DOM.
*/


function PolyCubePreview(controller){





	var myController = controller

	LoadTemplate("Dave")
	
	//Read files and have the controller generate them


	function LoadTemplate(template_name){
		console.log("Henlo")
		var xhttp = new XMLHttpRequest()
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){

				console.log(this.responseText)

			}
		}

		xhttp.open("GET", "./Classes/PolyCube_Templates/"+template_name+".txt", true)
		xhttp.send()

	}

}