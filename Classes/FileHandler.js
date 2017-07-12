function SaveObjectAsFile(json_object, name = "New Polycube")
{
	saveTextAs(JSON.stringify(json_object), name) //Thank you Eli Grey
}

function ReadFileAsText(file, data){
	var reader = new FileReader()
	
	reader.onload = function(){
		data = reader.result
	}
	reader.onerror = function(){
	}
	reader.onabort = function(){
		data = ""
	}

	reader.readAsText(file)
}