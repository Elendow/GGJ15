// Grid variables
var grid;
var gridOffset      = 50;
var gridX           = 10;
var gridY           = 7;
var cellSize        = 128;

// Board variables
var board;
var maxCells = 30;

// Camera and drag variables
var dragX           = -1;
var dragY           = -1;
var draggin         = false;
var cameraSpeed     = 15;

var GameplayState = {
    
    preload: function() { 
        game.stage.backgroundColor = '#000000';
        game.load.image('grid', 'assets/grid.png'); 
        game.load.image('devCell', 'assets/room1.png');
    },

    create: function() { 
        // Use world bounds in order to set limits to the camera
        game.world.setBounds(0, 0, (gridOffset*2)+gridX*cellSize, (gridOffset*2)+gridY*cellSize);

        // Camera to the world center
        game.camera.x = (((gridOffset*2)+gridX*cellSize) / 2) - (game.width / 2);
        game.camera.y = (((gridOffset*2)+gridY*cellSize) / 2) - (game.height / 2);

        // Create grid
        grid = game.add.group();
        for(var i = 0; i < gridX; i++){
            for(var j = 0; j < gridY; j++){
                var cell = grid.create(gridOffset+i*cellSize,gridOffset+j*cellSize,"grid");

                // Add event listeners to every cell
                cell.inputEnabled = true
                cell.events.onInputOver.add(this.cellOver, this);
                cell.events.onInputOut.add(this.cellOut, this);
                cell.events.onInputDown.add(this.cellClick, this);
            }
        }

        // Prepare board
        board = game.add.group();
    },

    update: function() {
        if(game.input.activePointer.isDown){
            // On first click we take mouse position
            if(!draggin){
                dragY = game.input.y;
                dragX = game.input.x;
            }
            draggin = true;
            this.drag();
        } else {
            draggin = false;
        }
    },

    drag: function(){
        // Compare actual input position with last input position
        if(game.input.y > dragY+5)
            game.camera.y += cameraSpeed;
        else if(game.input.y < dragY-5)
            game.camera.y -= cameraSpeed;

       if(game.input.x > dragX+5)
            game.camera.x += cameraSpeed;
        else if(game.input.x < dragX-5)
            game.camera.x -= cameraSpeed;

        // Save last input position
        dragY = game.input.y;
        dragX = game.input.x;
    },

    cellOver: function(e){
        e.alpha = 0.5;
    },

    cellOut: function(e){
        e.alpha = 1;
    },

    cellClick: function(e){
        board.create(e.x, e.y, "devCell");
    },
};