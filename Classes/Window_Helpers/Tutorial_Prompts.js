function Tutorial_Prompts()
{
	this.tutorial_prompts = []
	this.tutorial_parts = []

	this.create_new_poly_index = -1
	this.add_cube_index = -1


	//Create tutorial prompts
	this.tutorial_prompts.push("Hello! Welcome to the Polycube Project! I'm going to step you through the basics of how this app works. It's really simple. You'll get it in no time.")
	this.tutorial_prompts.push("The idea for this project is for users to cut and unfold polycubes.")


	this.tutorial_prompts.push("Okay. Let's start. Go ahead and create a New Polycube by pressing the button labeled New Polycube.")
	this.create_new_poly_index = this.tutorial_prompts.length-1

	this.tutorial_prompts.push("Nice! The first polycube's been created. Well, actually, a single cube isn't really a polycube. Let's make it one. Add a New Cube by pressing the button labeled Add Cube.")
	this.add_cube_index = this.tutorial_prompts.length-1

	//Create tutorial parts
	this.tutorial_parts.push("Hello")
	this.tutorial_parts.push("What does this do?")
	this.tutorial_parts.push("The First Polycube")
	this.tutorial_parts.push("Add a Cube")

}