function Cell (x, y, top, left, bottom, right) {
	this.x 			= x;
	this.y 			= y;
	this.top 		= top;
	this.left 		= left;
	this.bottom 	= bottom;
	this.right 		= right;
	this.used		= false;
	this.sprite 	= null;
}

function GridCell (id){
	this.sprite		= null;
}

function Person (sprite, cell){
	this.sprite 		= sprite;
	this.cell 			= cell;
	this.movements 		= 3;
	this.maxMovements 	= this.movements;
}

function Cop (damage, sprite){
	this.sprite 		= sprite;
	this.damage 		= damage;
	this.movements 		= 3;
	this.maxMovements 	= this.movements;
}

function Alien (damage, sprite){
	this.sprite 		= sprite;
	this.damage 		= damage;
	this.movements 		= 3;
	this.maxMovements 	= this.movements;
}