function Cell (x, y) {
	this.x 			= x;
	this.y 			= y;
	this.used		= false;
	this.sprite 	= null;
}

function GridCell (id){
	this.sprite		= null;
}

function Character (){
	this.sprite 		= null;
	this.cell 			= null;
	this.x				= -1;
	this.y				= -1;
	this.movements 		= 3;
	this.maxMovements 	= this.movements;
}