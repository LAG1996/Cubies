export class SpatialMap{
	constructor(){
		this.map = [];
	}

	get length(){
		let count = 0;

		for(var i in this.map){
			for(var j in this.map[i]){
				for(var k in this.map[i][j]){
					let val = this.map[i][j][k];

					if(val !== undefined && val != null){
						count+=1;
					}
				}
			}
		}

		return count;
	}

	getData(position){
		if(this.hasDataAtPosition(position)){
			return this.map[position.x][position.y][position.z];
		}

		return null;
	}

	removeData(position){
		if(this.hasDataAtPosition(position)){
			delete this.map[position.x][position.y][position.z];
		}
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