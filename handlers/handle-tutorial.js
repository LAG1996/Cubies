//Flags for the tutorial
export const TutorialStateFlags = {
	inCreatePoly: false,
	inAddCube: false,
	inCut: false,
	inHinge: false,
	inPickDecomp: false,
	inUnfold: false,
	inFold: false,
	inTape: false
};

export const TutorialConditionCache = {
	chosenDecompIndex: null,
};

export const TutorialConditionFlags = {
	didCreatePoly: false,
	didAddCube: false,
	didCut: false,
	didHinge: false,
	didPickHinge: false,
	didPickDecomp: false,
	didPickWhite: false,
	didPickBlack: false,
	didTape: false
}

export const PromptNameToIndex = {}

const _tutorialPrompts = [];
let _currentPromptIndex = 0;

class TutorialPrompt{
	constructor(promptTitle, promptText, flag, showNext, videoLink, startFunc, conditionFunc){
		this.title = promptTitle;
		this.prompt = promptText;
		this.flag = flag;
		this.showNext = showNext;
		this.onStartPrompt = startFunc;
		this.isConditionSatisfied = conditionFunc;
		this.videoLink = videoLink;
	}

	onStartPrompt(){}
	isConditionSatisfied(){}
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
	"Picking a Side",
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
	"inPickDecomp",
	"inUnfold",
	"inFold",
	"inTape",
	""
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
	false,
	false
]

const promptVidLinks = [
	"",
	"",
	"https://www.youtube.com/embed/wHrjtLwg9HI",
	"https://www.youtube.com/embed/wE2twl3uUIs",
	"https://www.youtube.com/embed/wE2twl3uUIs",
	"https://www.youtube.com/embed/AjvPU5pNs6w",
	"https://www.youtube.com/embed/AjvPU5pNs6w",
	"https://www.youtube.com/embed/Gybbu--Otik",
	"https://www.youtube.com/embed/Gybbu--Otik",
	"https://www.youtube.com/embed/yyIBv2EsYTM",
	"https://www.youtube.com/embed/yyIBv2EsYTM",
	"https://www.youtube.com/embed/qSTWIABPV6o",
	""
]

const promptStartFuncs = [
	() => { $("#add-polycube").hide(); },
	() => {},
	() => { $("#add-polycube").show(); },
	() => { $("#save-polycube").hide(); $("#delete-polycube").hide(); },
	() => { },
	() => { },
	() => { },
	() => { },
	() => { },
	() => { },
	() => { },
	() => { },
	() => { },
]

const promptConditionFuncs = [
	() => { return true; },
	() => { return true; },
	() => { return TutorialConditionFlags.didCreatePoly; },
	() => { return TutorialConditionFlags.didAddCube; },
	() => { return true; },
	() => { return TutorialConditionFlags.didCut; },
	() => { return TutorialConditionFlags.didHinge; },
	() => { return TutorialConditionFlags.didPickHinge; },
	() => { return TutorialConditionFlags.didPickDecomp; },
	() => { return TutorialConditionFlags.didPickWhite; },
	() => { return TutorialConditionFlags.didPickBlack; },
	() => { return TutorialConditionFlags.didTape; }
]

for(var index in promptTextList)
{
	_tutorialPrompts.push(new TutorialPrompt(promptTitleList[index], promptTextList[index], activatedFlags[index], showNextBtn[index], 
		promptVidLinks[index], promptStartFuncs[index], promptConditionFuncs[index]));
}


export const TutorialHandler = {
	startTutorial: () => {
		_currentPromptIndex = 0;

		let firstPrompt = _tutorialPrompts[0];

		setPromptGUI(firstPrompt.title, firstPrompt.prompt, firstPrompt.showNext);

		$("#tutorial-gui").show();
		$("#tutorial-example-btn").hide();
		firstPrompt.onStartPrompt();

	},

	tryGoToNextPrompt: () => {

		//Check the current prompt. If it's condition is satisfied, continue. Otherwise, return false.
		if(!_tutorialPrompts[_currentPromptIndex].isConditionSatisfied()){
			return false;
		}

		_currentPromptIndex += 1;

		let nextPrompt = _tutorialPrompts[_currentPromptIndex];

		setPromptGUI(nextPrompt.title, nextPrompt.prompt, nextPrompt.showNext, nextPrompt.videoLink);

		for(var flag in TutorialStateFlags){
			TutorialStateFlags[flag] = false;
		}

		TutorialStateFlags[nextPrompt.flag] = true;
		nextPrompt.onStartPrompt();

		return true;
	},
	stopTutorial: () => {
		$("#tutorial-gui").hide();

		for(var flag in TutorialConditionFlags){
			TutorialConditionFlags[flag] = false;
		}

		for(var obj in TutorialConditionCache){
			TutorialConditionCache[obj] = null;
		}
	}
}

$("#tutorial-next-btn").on("click", () => {
	TutorialHandler.tryGoToNextPrompt();
});

function setPromptGUI(promptTitle, promptText, showsNextBtn, videoLink){

	$("#tutorial-title").text(promptTitle);
	$("#tutorial-prompt").text(promptText);

	if(showsNextBtn)
		$("#tutorial-next-btn").show();
	else
		$("#tutorial-next-btn").hide();

	/*if(videoLink !== ""){
		$("#tutorial-example-btn").show();
		$("#example-vid").attr("src", videoLink);
	}
	else{
		$("#tutorial-example-btn").hide();
	}*/
}