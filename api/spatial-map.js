export class SpatialMap{
	constructor(){
		this.map = [];
	}

	getData(position){
		if(this.hasDataAtPosition(position)){
			return this.map[position.x][position.y][position.z];
		}

		return null;
	}

	hasDataAtPosition(position){
		return this.map[position.x] !== undefined && this.map[position.x][position.y] !== undefined && this.map[position.x][position.y][position.z] !== undefined;
	}

	addToMap(data, position){
		if(this.map[position.x] === undefined){
			this.map[position.x] = [];
			this.map[position.x][position.y] = [];
		}
		else if(this.map[position.x][position.y] === undefined){
			this.map[position.x][position.y] = [];
		}

		this.map[position.x][position.y][position.z] = data;
	}
}