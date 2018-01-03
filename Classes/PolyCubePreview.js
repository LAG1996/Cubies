/*
*	The purpose of this module is to create scenes in which basic polycubes are drawn and previewed, and then send them
*	to the previewer cards in the DOM.
*	We can think of this module as a part of the controller, so it'll be able to access all of the controller's stuff for simplicity.
*/


function PolyCubePreview(controller){

	//Save the controller
	var myController = controller
	//Limit our maximum renderer count to 50. Unique renderers have to be made for each preview polycube.
	//We probably won't use 50 in the case of the hand-made templates, but if we were to use auto-generated enumerations,
	//we need to put a cap to limit performance.
	var max_renderers = 50

	//Array of polycube templates. We get these from the visualizer
	var polycube_templates = []

	//Array of polycube preview cards. We get these from the toolbar handler
	var prev_cards = []

	//Array of polycube preview handlers. We get these from the scene handler script.
	var previews = []

	//Array of indices that will keep track of which polycube the asynchronous loops are looking at.
	//Indices match with the indices we give each enumeration in their respective LoadEnumeration procedures.

	var p_cube_index = []

	//Array of asynchronous loops
	var asyncs = []

	var preview_open = false

	//Load up the following text files and give them each index
	LoadTemplate("donut", 0)
	LoadTemplate("dali cross", 1)
	LoadTemplate("rubix cube", 2)
	LoadTemplate("2x2x2", 3)

	//Listen in on the modal. When it opens, attach the renderers to cards.
	$("#add_polycube_modal").on("show.bs.modal", function(){

		preview_open = true


		update()

	})

	$("#add_polycube_modal").on("hide.bs.modal", function(){

		preview_open = false

	})

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

				let data = JSON.parse(this.responseText)
				
				//Get the polycube template
				let p_cube = myController.visualizer.GeneratePreviewPolycube(data.cubes)
				p_cube.name = data.name

				polycube_templates.push(p_cube)

				//If we have not exceeded our renderer count, make a new card and renderer.
				if(prev_cards.length < max_renderers)
				{
					let context_data = myController.toolbar_handler.GeneratePreviewCard(p_cube.name)
					

					let preview = new PreviewHandler(myController.scene_handler.background_color, p_cube)

					preview.AttachToContext(context_data.card)

					prev_cards.push(context_data.card)
					previews.push(preview)
				}
			}
		}

		xhttp.open("GET", "./Classes/PolyCube_Templates/selected_templates/"+template_name+".txt", true)
		xhttp.send()

	}

	function update()
	{
		if(preview_open)
		{
			for(var i in previews)
				previews[i].Draw()


			requestAnimationFrame(update)
		}
	}
}

function PreviewHandler(bg_color = 0xFFFFE6, polycube){

	var myScene = null
	var background_color = bg_color
	var renderer = null
	var orbiter = null
	var camera = null
	var myContext = null
	var myPolycube = polycube

	var that = this

	initScene()

	function initScene(){
		//Create a renderer
		renderer = new THREE.WebGLRenderer()

		//Create a scene
		defaultScene = new THREE.Scene()

		//Start up that renderer
		renderer.domElement.id = polycube.name + "_renderer"
		renderer.setClearColor(background_color.getHex(), 1)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.sortObjects = true

		//$("#container").append(renderer.domElement)

		//Create a camera and add it to the scene
		VIEW_ANGLE = 45 //Viewing angle for the perspective camera
		NEAR = 0.1 //The near clipping plane
		FAR = 10000 //The far clipping plane

		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, 0, NEAR, FAR)
		camera.position.z = 15
		camera.position.y = 15
		camera.position.x = -15

		orbiter = new THREE.OrbitControls(camera, renderer.domElement)
		orbiter.autoRotate = true

		//Create the scene, add a grid, add the polycube
		myScene = new THREE.Scene()

		let grid = GenerateGrid(20, 2, 0x000000)
		grid.position.y = -1
		grid.add(new THREE.AxisHelper(50))

		myScene.add(grid)
		myScene.add(myPolycube)
	}

	this.Draw = function(){
		
		orbiter.update()
		renderer.render(myScene, camera)

	}

	this.AttachToContext = function(context){

		let width = context.parent().parent().width() * 2.3

		camera.aspect = (width) / (width * 1.5)
		camera.updateProjectionMatrix()

		renderer.setSize(width, width * 1.5)

		context.append(renderer.domElement)

		myContext = context

		this.Draw()
	}

	this.DetachFromcontext = function(){

		myContext.empty()

	}

	this.GetRenderer = function(){

		return renderer

	}

	this.GetPolyCube = function(){

		return myScene.children[1]
	}
}