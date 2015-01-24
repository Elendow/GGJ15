// Grid variables
var grid;
var gridInfo;
var gridOffset      = 50;
var gridX           = 10;
var gridY           = 8;
var cellSize        = 192;

// Board variables
var board;
var boardInfo;
var maxCells        = 30;
var canUseCell      = true;

// Camera and drag variables
var dragX           = -1;
var dragY           = -1;
var draggin         = false;
var cameraSpeed     = 15;

// GUI variables
var turnTime        = 5000;
var turnElapsedTime = 99999;
var timeBar;
var timeFill;
var hud;

var GameplayState = {
    
    preload: function() { 
        game.stage.backgroundColor = '#000000';
        game.load.image('grid', 'assets/grid.png'); 
        game.load.image('room1', 'assets/room1.png');

        game.load.image('timeBar', 'assets/gui/timeBar.png');
        game.load.image('hud', 'assets/gui/hud.png');
    },

    create: function() { 
        // Use world bounds in order to set limits to the camera
        game.world.setBounds(0, 0, (gridOffset*2)+gridX*cellSize, (gridOffset*2)+gridY*cellSize);

        // Camera to the world center
        game.camera.x = (((gridOffset*2)+gridX*cellSize) / 2) - (game.width / 2);
        game.camera.y = (((gridOffset*2)+gridY*cellSize) / 2) - (game.height / 2);

        // Create grid
        grid = game.add.group();

        gridInfo = new Array(gridX);
        for(var i = 0; i < gridX; i++){
            gridInfo[i] = new Array(gridY);
            for(var j = 0; j < gridY; j++){
                gridInfo[i][j] = new GridCell(0);
            }
        }

        for(var i = 0; i < gridX; i++){
            for(var j = 0; j < gridY; j++){
                var cell = grid.create(gridOffset+i*cellSize,gridOffset+j*cellSize,"grid");
                // Add event listeners to every cell
                cell.inputEnabled = true;
                cell.events.onInputOver.add(this.cellOver, this);
                cell.events.onInputOut.add(this.cellOut, this);
                cell.events.onInputDown.add(this.cellClick, this);
                cell.tint = 0x1ABBB4;
                gridInfo[i][j].id = grid.getIndex(cell);
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

        // Create GUI
        this.drawUI();

        // First Cell
        this.putCell(gridOffset + (gridX/2) * cellSize, gridOffset + (gridY/2) * cellSize);
        canUseCell          = true;  
        timeFill.tint       = 0xACD372 
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
            turnElapsedTime += game.time.elapsed;
            timeFill.scale.x = turnElapsedTime / turnTime;

            if(timeFill.scale.x > 1){
                timeFill.scale.x = 1;
                canUseCell          = true;
                highlight           = true;
                timeFill.tint       = 0xACD372 
            }
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
        if(canUseCell){
            if(!boardInfo[cellX][cellY].used){
                for(var i = cellX - 1; i < cellX + 2; i++){
                    for(var j = cellY - 1; j < cellY + 2; j++){
                        if(i >= 0 && j >= 0 && i <= gridX && j <= gridY){
                            if(!(i == cellX && j == cellY) && !(i != cellX && j != cellY)){
                                if(boardInfo[i][j].used){
                                    canPut = true;
                                }
                            }
                        }
                    } 
                }
            }

            if(canPut){
                this.putCell(e.x, e.y);
            } 
        }
    },

    putCell: function(x, y){
        var cellX                       = Math.trunc(x/cellSize);
        var cellY                       = Math.trunc(y/cellSize);
        var cell                        = board.create(x, y, "room1");
        boardInfo[cellX][cellY].used    = true;
        turnElapsedTime                 = 0;
        canUseCell                      = false;
        timeFill.tint                   = 0xf0f28b;
        this.highlightCells();
    },

    highlightCells: function(){
        for(var x = 0; x < gridX; x++){
            for(var y = 0; y < gridY; y++){
                if(boardInfo[x][y].used){
                   for(var i = x - 1; i < x + 2; i++){
                        for(var j = y - 1; j < y + 2; j++){
                            if(i >= 0 && j >= 0 && i <= gridX && j <= gridY){
                                if(!(i == x && j == y) && !(i != x && j != y)){
                                    if(!boardInfo[i][j].used){
                                        // This cell is available 
                                        var cell    = grid.getAt(gridInfo[i][j].id);
                                        cell.tint   = 0xFFF467;
                                    }
                                }
                            }
                        } 
                    } 
                }
            } 
        }
    },

    drawUI: function(){
        timeBar                 = this.game.add.sprite(56, 3, 'timeBar');
        timeFill                = this.game.add.sprite(56, 3, 'timeBar');
        hud                     = this.game.add.sprite(0, 0, 'hud');
        timeBar.fixedToCamera   = true;
        timeFill.fixedToCamera  = true;
        hud.fixedToCamera       = true;
        timeBar.tint            = 0x232324;
        timeFill.tint           = 0xf0f28b;
    },
};