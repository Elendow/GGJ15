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

function Person (health, sprite, cell){
	this.health 	= health;
	this.sprite 	= sprite;
	this.cell 		= cell;
	this.movements 	= 3;
}

function Soldat (health, damage, sprite){
	this.health = health;
	this.sprite = sprite;
	this.damage = damage;
}

function Alien (health, damage, sprite){
	this.health = health;
	this.sprite = sprite;
	this.damage = damage;
}