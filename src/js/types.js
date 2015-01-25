function Cell (x, y) {
	this.x 			= x;
	this.y 			= y;
	this.used		= false;
	this.sprite 	= null;
}

function GridCell (id){
	this.sprite		= null;
}

function Character (sprite, cell){
	this.sprite 		= sprite;
	this.cell 			= cell;
	this.movements 		= 3;
	this.maxMovements 	= this.movements;
}