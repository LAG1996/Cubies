function Scene(controller, scene_handle = null){

	this.controller = controller
	this.scene_handler = scene_handle != null ? scene_handle : new SceneHandler()

	//Add a grid to the scene so we can orient ourselves
	grid = GenerateGrid(100, 2, 0x000000)
	grid.position.x = -1
	grid.position.y = -1
	grid.position.z = -1

	var grid_axis = new THREE.AxisHelper(50)
	grid_axis.position.copy(grid.position)

	//PostMessage(['ADD_TO_SCENE', scene_handler, grid])
	//PostMessage(['ADD_TO_SCENE', scene_handler, grid_axis])

	this.scene_handler.RequestAddToScene(grid)
	this.scene_handler.RequestAddToScene(grid_axis)

	this.StoreMouseVals = function(event){
		old_mouse_pos.copy(scene_handler.GetMousePos())
	}

	this.HandlePick = function(scene = null){

		if(scene == null)
			this.scene_handler.SwitchToDefaultPickingScene()
		else
			this.scene_handler.RequestSwitchToPickingScene(scene)

		return this.scene_handler.Pick()
	}
}