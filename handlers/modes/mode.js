export class Mode{
	constructor(args){
		this.startMode = args.startMode;
		this.endMode = args.endMode;
		this.onMouseMove = args.mouseMove ? args.mouseMove : this.onMouseMove;
		this.onMouseDown = args.mouseDown ? args.mouseDown : this.onMouseDown;
		this.onMouseUp = args.mouseUp ? args.mouseUp : this.onMouseUp;
		this.onKeyDown = args.keyDown ? args.keyDown : this.onKeyDown;
		this.onKeyUp = args.keyUp ? args.keyUp : this.onKeyUp;
		this.onUpdate = args.onUpdate ? args.onUpdate : this.onUpdate;
	}

	startMode(){}

	endMode(){}

	onMouseMove(){}

	onMouseDown(){}

	onMouseUp(){}

	onKeyDown(){}

	onKeyUp(){}

	onUpdate(){}
}