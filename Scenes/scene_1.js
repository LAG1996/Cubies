var scene_handler
$(document).ready(function(){
	Initialize()
	scene_handler = new SceneHandler()

	var gridHelper = new THREE.GridHelper(1000, 500, 0x0000FF, 0x020202)
	gridHelper.position.y = -1
	gridHelper.position.x = -1
	gridHelper.position.z = -1

	var toolbarHandler = new Toolbar_Handler()
	toolbarHandler.Switch_Context_H('poly-view')

	scene_handler.RequestAddToScene(gridHelper)
})