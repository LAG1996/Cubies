//Flags for the tutorial
export const TutorialFlags = {
	inCreatePoly: false,
	inAddCube: false,
	inCut: false,
	inHinge: false,
	inUnfold: false,
	inFold: false,
	inTape: false
};

export const TutorialCache = {

};

export const PromptNameToIndex = {}

const _tutorialPrompts = [];
let _currentPromptIndex = 0;

class TutorialPrompt{
	constructor(promptTitle, promptText, flag, showNext){
		this.title = promptTitle;
		this.prompt = promptText;
		this.flag = flag;
		this.showNext = showNext;
	}
}

const promptTextList = [
	"Hello! Welcome to Cubies! I'm going to step you through hte basics of how this app works.",
	"With this application, you will be able to build, cut, and unfold polycubes.",
	"Okay. Let's start. Go ahead and create a New Polycube by pressing the button labeled \"New Polycube\"",
	"The first polycube's been created. Let's add cubes to it by pressing \"Add Cube\" and choosing a face to place the cube over.",
	"Add more cubes if you'd like. Press \"Next\" when you're done.",
	"Let's start cutting. Hover over one of the edges and cut by clicking it.",
	"A red highlight means that the edge is cut. Note that you can't add anymore cubes when you have a cut. Try to make a square of cuts.",
	"A blue highlight means line you can unfold faces around. It's like a crease on a piece of folded paper. Hover over the blue edge. While holding \"Shift\" on your keyboard, click the edge.",
	"The polycube is now in multiple different colors. This is where you get to \"pick a side\" to fold around the blue crease.",
	"Click on the white arrow to unfold that side of the polycube",
	"Now, let's try folding back that part of the polycube. Pick the crease again the same way you did before and pick the side you did previously. Click on the black arrow instead of the white one.",
	"Now the polycube should look the way it did before. You can tape faces back together by holding down \"Shift\" on your keyboard and then clicking on a face. With \"Shift\" still held down, pick another face that shares a cut edge with the first face.",
	"Now those faces have been taped back together. Thanks for going through this tutorial. Press \"Exit Tutorial\" to return to Cubies"
]

const promptTitleList = [
	"Welcome",
	"Welcome",
	"Create a Polycube",
	"Add a Cube",
	"Add More Cubes",
	"Cutting",
	"More Cuts",
	"Hinging",
	"Unfolding",
	"Folding",
	"Taping",
	"All Done"
]

const activatedFlags = [
	"",
	"",
	"inCreatePoly",
	"inAddCube",
	"inAddCube",
	"inCut",
	"inCut",
	"inHinge",
	"inUnfold",
	"inFold",
	"inTape"
]

const showNextBtn = [
	true,
	true,
	false,
	false,
	true,
	false,
	false,
	false,
	false,
	false,
	false,
	false
]

for(var index in promptTextList)
{
	_tutorialPrompts.push(new TutorialPrompt(promptTitleList[index], promptTextList[index], activatedFlags[index], showNextBtn[index]));
}


export const TutorialHandler = {
	startTutorial: () => {
		_currentPromptIndex = 0;

		let firstPrompt = _tutorialPrompts[0];

		setPromptGUI(firstPrompt.title, firstPrompt.prompt, firstPrompt.showNext);

		$("#tutorial-gui").show();

	},
	goToNextPrompt: () => {
		_currentPromptIndex += 1;

		let nextPrompt = _tutorialPrompts[_currentPromptIndex];

		setPromptGUI(nextPrompt.title, nextPrompt.prompt, nextPrompt.showNext);

		for(var flag in TutorialFlags){
			TutorialFlags[flag] = false;
		}

		TutorialFlags[nextPrompt.flag] = true;
	},
	stopTutorial: () => {
		$("#tutorial-gui").hide();
	}
}

$("#tutorial-next-btn").on("click", () => {
	TutorialHandler.goToNextPrompt();
});

function setPromptGUI(promptTitle, promptText, showsNextBtn){

	$("#tutorial-title").text(promptTitle);
	$("#tutorial-prompt").text(promptText);

	if(showsNextBtn)
		$("#tutorial-next-btn").show();
	else
		$("#tutorial-next-btn").hide();
}