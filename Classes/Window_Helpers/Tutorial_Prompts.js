function Tutorial_Prompts()
{
	this.tutorial_prompts = []
	this.tutorial_parts = []

	this.create_new_poly_index = -1
	this.add_cube_index = -1
	this.add_cuts_index = -1
	this.click_white_arrow = -1
	this.click_black_arrow = -1

	this.face_graph_clicked_1 = -1
	this.face_graph_clicked_2 = -1



	//Create tutorial prompts
	this.tutorial_prompts.push("Hello! Welcome to the Polycube Project! I'm going to step you through the basics of how this app works. It's really simple. You'll get it in no time.")
	this.tutorial_prompts.push("With this application, you will be able to build, cut, and unfold polycubes.")

	this.tutorial_prompts.push("Okay. Let's start. Go ahead and create a New Polycube by pressing the button labeled New Polycube.")
	this.create_new_poly_index = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("Nice! The first polycube's been created. Well, actually, a single cube isn't really a polycube. Let's make it one. Add a New Cube by pressing the button labeled Add Cube, and then click on a face to add a cube there.")
	this.add_cube_index = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("Add more cubes if you'd like. Press Next when you're done.")

	this.tutorial_prompts.push("Alright. Now we have a polycube. Let's start cutting. Hover over one of the edges and cut by clicking on the edge.")
	this.add_cuts_index = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("Nice. A red highlight means that the edge is cut. Note that you can't add anymore cubes when you have a cut. Now try to make a square of cuts.")

	this.tutorial_prompts.push("A new blue highlight appeared. You can't cut that part, but you can unfold around it.")
	this.unfold_index = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("A blue edge is a crease like on a piece of folded paper. Hover the blue edge and press Shift. It turns yellow. Keep Shift pressed and click on the edge.")

	this.tutorial_prompts.push("The polycube's now two different colors. This is where you get to 'pick a side' to fold around the crease. Click on either the blue or red faces.")

	this.tutorial_prompts.push("Now you're ready to unfold! Click on the White Arrow.")
	this.click_white_arrow = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("This is the core of this application. You cut and unfold. Now, what if you made a mistake and didn't want to unfold that face? Well, try reversing what you just did. Select the crease, select the same color that you picked last time, and then fold! Hint: Remember that you need to hold shift over a crease to fold.")
	this.click_black_arrow = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("The polycube should look just the way it did before you did any unfolding. Let's tape the faces back together. Follow these steps: 1. Hover over a face and press Shift. It turns yellow. Keep Shift pressed and click on the face. 2. Then, while still holding Shift, press on another face that shares a cut (a red edge with it). 3. If you let go of Shift at any point, just start from step 1.")

	this.tutorial_prompts.push("Now those two faces have been taped back together. That's basically how this all works! Press Exit Tutorial to go back to the main application. Happy folding!")

	//Create tutorial parts
	this.tutorial_parts.push("Hello")
	this.tutorial_parts.push("What does this do?")
	this.tutorial_parts.push("The First Polycube")
	this.tutorial_parts.push("Add a Cube")
	this.tutorial_parts.push("Add More Cubes")
	this.tutorial_parts.push("The First Cut")
	this.tutorial_parts.push("Cut Some More")
	this.tutorial_parts.push("An Crease")
	this.tutorial_parts.push("Pick a Crease")
	this.tutorial_parts.push("Choose a Side")
	this.tutorial_parts.push("Unfold!")
	this.tutorial_parts.push("Fold!")
	this.tutorial_parts.push("Taping Faces Together")
	this.tutorial_parts.push("All Done")
}