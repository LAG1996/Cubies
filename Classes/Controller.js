function Controller(){

	this.Alert_Funcs = {}

	this.Alert = function(alert_word){
		this.Alert_Funcs[alert_word](arguments)
	}
}