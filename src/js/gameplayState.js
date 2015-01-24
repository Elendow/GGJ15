// Grid variables
var grid;
var gridOffset      = 50;
var gridX           = 10;
var gridY           = 8;
var cellSize        = 192;

// Board variables
var board;
var boardInfo;
var maxCells        = 30;
var canUseCell      = false;

// Camera and drag variables
var dragX           = -1;
var dragY           = -1;
var draggin         = false;
var cameraSpeed     = 15;

// GUI variables
var turnTime        = 1000;   // Seconds
var turnElapsedTime = 0;    // Seconds
var timeBar;
var timeFill;

var GameplayState = {
    
    preload: function() { 
        game.stage.backgroundColor = '#000000';
        game.load.image('grid', 'assets/grid.png'); 
        game.load.image('devCell', 'assets/room1.png');

        game.load.image('timeBar', 'assets/gui/timeBar.png');
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
                cell.scale.x = 1.5;
                cell.scale.y = 1.5;
                // Add event listeners to every cell
                cell.inputEnabled = true
                cell.events.onInputOver.add(this.cellOver, this);
                cell.events.onInputOut.add(this.cellOut, this);
                cell.events.onInputDown.add(this.cellClick, this);
            }
        }

        // Prepare board
        board = game.add.group();

        boardInfo = new Array(gridX);
        for(var i = 0; i < gridX; i++){
            boardInfo[i] = new Array(gridY);
            for(var j = 0; j < gridY; j++){
                boardInfo[i][j] = new Cell(i,j,true,true,true,true);
            }
        }

        // First Cell
        this.putCell(gridOffset + (gridX/2) * cellSize, gridOffset + (gridY/2) * cellSize);

        // Create GUI
        timeBar                 = this.game.add.sprite(20, 20, 'timeBar');
        timeFill                = this.game.add.sprite(20, 20, 'timeBar');
        timeBar.fixedToCamera   = true;
        timeFill.fixedToCamera  = true;
        timeFill.tint           = 0xcccccc;
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

        // Update time bar if cannot put cell on board
        if(!canUseCell){
            turnElapsedTime += game.time.totalElapsedSeconds();

            timeFill.scale.x = 1 - (turnElapsedTime / turnTime);

            if(timeFill.scale.x < 0){
                timeFill.scale.x = 0;
                canUseCell = true;   
            }
        } else {
            // Look for correct cells and highlight them
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
        var cellX = Math.trunc(e.x/cellSize);
        var cellY = Math.trunc(e.y/cellSize);
        var canPut = false;

        for(var i = cellX - 1; i > cellX + 2; i++){
            for(var j = cellY - 1; j > cellY + 2; j++){
                if(i != cellX && j != cellY){
                    if(boardInfo[i][j].used)
                        canPut = true;
                }
            } 
        }

        if(canPut){
            this.putCell(e.x, e.y);
        }
    },

    putCell: function(x, y){
        var cellX = Math.trunc(x/cellSize);
        var cellY = Math.trunc(y/cellSize);
        boardInfo[cellX][cellY].used = true;
        console.log(boardInfo[cellX][cellY]);
        var cell = board.create(x, y, "devCell");
    }
};