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
var turnNum         = 0;
var clicked;
var unitSelected    = "";

// Camera and drag variables
var dragX           = -1;
var dragY           = -1;
var draggin         = false;
var cameraSpeed     = 15;

// GUI variables
var turnTime        = 2500;
var turnElapsedTime = 99999;
var timeBar;
var timeFill;
var turnText;
var copText;
var alienText;
var pplText;
var hud;
var pplCounter      = 0;
var copCounter      = 0;
var alienCounter    = 0;
var uiGroup;

// Characters variables
var people      = [100];
var cops        = [100];
var aliens      = [100];
var roomSelected;
var gameGroup;

var GameplayState = {
    
    preload: function() { 
        // Preload all assets
        game.stage.backgroundColor = '#000000';
        game.load.image('grid'              , 'assets/grid.png'); 
        game.load.image('room1'             , 'assets/room1.png');
        game.load.image('timeBar'           , 'assets/gui/timeBar.png');
        game.load.image('hud'               , 'assets/gui/hud.png');
        game.load.image('bg'                , 'assets/background.png');
        game.load.spritesheet("pj"          , 'assets/nino1_spritesheet.png', 23, 40, 9);
        game.load.spritesheet("cop"         , 'assets/police_spritesheet.png', 23, 40, 9);
        game.load.spritesheet("alien"       , 'assets/alien.png', 27, 51, 3);
        game.load.bitmapFont('PixelFont'    ,'assets/font/font.png', 'assets/font/font.fnt');
    },

    create: function() {
        // Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Use world bounds in order to set limits to the camera
        game.world.setBounds(0, 0, (gridOffset*2)+gridX*cellSize, (gridOffset*2)+gridY*cellSize);

        // Camera to the world center
        game.camera.x = (((gridOffset*2)+gridX*cellSize) / 2) - (game.width / 2);
        game.camera.y = (((gridOffset*2)+gridY*cellSize) / 2) - (game.height / 2);

        // Background
        bg = game.add.tileSprite(0, 0,(gridOffset*2)+gridX*cellSize, (gridOffset*2)+gridY*cellSize, 'bg');

        // Create grid
        grid = game.add.group();

        gridInfo = new Array(gridX);
        for(var i = 0; i <= gridX; i++){
            gridInfo[i] = new Array(gridY);
            for(var j = 0; j <= gridY; j++){
                gridInfo[i][j] = new GridCell(0);
            }
        }

        for(var i = 0; i < gridX; i++){
            for(var j = 0; j < gridY; j++){
                var cell = grid.create(gridOffset+i*cellSize,gridOffset+j*cellSize,"grid");
                // Add event listeners to every grid cell
                cell.inputEnabled = true;
                cell.events.onInputOver.add(this.cellOver, this);
                cell.events.onInputOut.add(this.cellOut, this);
                cell.events.onInputDown.add(this.cellClick, this);
                cell.tint = 0x1ABBB4;
                gridInfo[i][j].sprite = cell;
            }
        }

        // Prepare board
        board = game.add.group();

        boardInfo = new Array(gridX);
        for(var i = 0; i <= gridX; i++){
            boardInfo[i] = new Array(gridY);
            for(var j = 0; j <= gridY; j++){
                boardInfo[i][j] = new Cell(i,j);
            }
        }

        // Characters group
        gameGroup = game.add.group();

        // Create GUI
        this.drawUI();

        // First Cell
        var firstCell = this.putCell(gridOffset + (gridX/2) * cellSize, gridOffset + (gridY/2) * cellSize);
        
        // Create First Characters
        this.addPeople(firstCell);

        // Reset initial values
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
                timeFill.tint       = 0xACD372;
            }
        }

        // Detect click
        if(clicked != null) 
            this.addCellOnClick();

        // Set up UI values
        turnText.setText("Turn " + turnNum);
        copText.setText(copCounter+"");
        alienText.setText(alienCounter+"");
        pplText.setText(pplCounter+"");

    },

    drag: function(){
        // Compare actual input position with last input position
        if(game.input.y > dragY + 5 || game.input.y > (height - 30)){
            game.camera.y += cameraSpeed; 
            clicked = null;
        }
        else if(game.input.y < dragY - 5 || game.input.y < 30){
            game.camera.y -= cameraSpeed; 
            clicked = null;
        }
        
        if(game.input.x > dragX + 5 || game.input.x > (width - 30)){
            game.camera.x += cameraSpeed; 
            clicked = null;
        }
        else if(game.input.x < dragX - 5 || game.input.x < 30){
            game.camera.x -= cameraSpeed; 
            clicked = null;
        }

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
        // Save cell for next frame (no click when drag)
        clicked = e;
    },

    roomOver: function(e){
        e.alpha = 0.5;
    },

    roomOut: function(e){
        e.alpha = 1;
    },

    roomClick: function(e){
        var cellX = Math.trunc(e.x / cellSize);
        var cellY = Math.trunc(e.y / cellSize);
        if(roomSelected == null){
            this.resetSelection();
            // Character recount
            var ppl = 0;
            var cop = 0;
            for(var i = 0; i < people.length; i++){
                if(people[i].cell){
                    if(people[i].cell.x == cellX && people[i].cell.y == cellY && people[i].movements >= 0)
                        ppl++; 
                }
            }
            for(var i = 0; i < cops.length; i++){
                if(cops[i].cell){
                    if(cops[i].cell.x == cellX && cops[i].cell.y == cellY && cops[i].movements >= 0)
                        cop++;       
                }
            }

            // Change color logic
            if(boardInfo[cellX][cellY].sprite.tint == 0xffffff){
                // Change color to major population
                if(ppl == 0 && cop == 0){
                    roomSelected = null;
                } else if(cop > ppl){
                    boardInfo[cellX][cellY].sprite.tint = 0xb6b6ff;
                    unitSelected = "cop";
                } else {
                    boardInfo[cellX][cellY].sprite.tint = 0xffb6b6;
                    unitSelected = "ppl";
                }
            } else {
                // Change to the other color
                switch(boardInfo[cellX][cellY].sprite.tint){
                    case 0xb6b6ff: 
                        boardInfo[cellX][cellY].sprite.tint = 0xffb6b6;
                        unitSelected = "ppl";
                        break;
                    case 0xffb6b6: 
                        boardInfo[cellX][cellY].sprite.tint = 0xb6b6ff;
                        unitSelected = "cop";
                        break;
                }
            }
            console.log(unitSelected);
            roomSelected = e;

        } else {
            var lastCellX = Math.trunc(roomSelected.x / cellSize);
            var lastCellY = Math.trunc(roomSelected.y / cellSize);

            if(this.detectCellProximity(cellX, cellY, lastCellX, lastCellY)){
                if(cellX != lastCellX || cellY != lastCellY){
                    this.movePeople(roomSelected, e);
                }
                this.resetSelection(); 
                unitSelection = "";
            } else {
                roomSelected = e;
                boardInfo[cellX][cellY].sprite.tint = 0xffffff;
                unitSelection = "";
            }
        }
    },

    detectCellProximity: function(cellX, cellY, toCellX, toCellY){

        if(cellX == toCellX && cellY == toCellY){
            this.resetSelection();
            return false;
        }

        if(cellX == toCellX){
            if(toCellY == cellY - 1 || toCellY == cellY + 1){
                return true;
            }
        }

        if (cellY == toCellY){
            if(toCellX == cellX - 1 || toCellX == cellX + 1){
                return true;
            }
        }
        return false;
    },

    movePeople: function(cellFrom, cellTo){
        var cellFromX   = Math.trunc(cellFrom.x / cellSize);
        var cellFromY   = Math.trunc(cellFrom.y / cellSize);
        var cellToX     = Math.trunc(cellTo.x / cellSize);
        var cellToY     = Math.trunc(cellTo.y / cellSize);

        if(unitSelected == "ppl"){
            for(var i = 0; i < people.length; i++){
                if(people[i].cell && people[i].sprite){
                    if(people[i].cell.x == cellFromX && people[i].cell.y == cellFromY && people[i].movements >= 0){  
                        if(cellTo.x > cellFrom.x){
                            people[i].sprite.animations.play('right');
                        }
                        else if(cellTo.x < cellFrom.x){
                            people[i].sprite.animations.play('left');     
                        }

                        var tween = this.game.add.tween(people[i].sprite).to({x: cellFrom.x + (cellSize / 2) - (people[i].sprite.width / 2), y: cellFrom.y + (cellSize / 2) - (people[i].sprite.height / 2)}, 600, Phaser.Easing.Linear.None)
                                    .to({x: cellTo.x + (cellSize / 2) - (people[i].sprite.width / 2), y: cellTo.y + (cellSize / 2) - (people[i].sprite.height / 2)}, 1200, Phaser.Easing.Linear.None)
                                    .to({x: cellTo.x + game.rnd.integerInRange(20,cellSize - 20 - people[i].sprite.width) , y: cellTo.y + game.rnd.integerInRange(20,cellSize-people[i].sprite.height - 20)}, 600, Phaser.Easing.Linear.None)
                                    .start();
                        tween.onComplete.add(function(){this.backToIdle(cellToX,cellToY);}, this);
                    }  
                }
            }
        }
        else if(unitSelected == "cop"){
             for(var i = 0; i < cops.length; i++){
                if(cops[i].cell && cops[i].sprite){
                    if(cops[i].cell.x == cellFromX && cops[i].cell.y == cellFromY && cops[i].movements >= 0){  
                        if(cellTo.x > cellFrom.x){
                            cops[i].sprite.animations.play('right');
                        }
                        else if(cellTo.x < cellFrom.x){
                            cops[i].sprite.animations.play('left');     
                        }

                        var tween = this.game.add.tween(cops[i].sprite).to({x: cellFrom.x + (cellSize / 2) - (cops[i].sprite.width / 2), y: cellFrom.y + (cellSize / 2) - (cops[i].sprite.height / 2)}, 600, Phaser.Easing.Linear.None)
                                    .to({x: cellTo.x + (cellSize / 2) - (cops[i].sprite.width / 2), y: cellTo.y + (cellSize / 2) - (cops[i].sprite.height / 2)}, 1200, Phaser.Easing.Linear.None)
                                    .to({x: cellTo.x + game.rnd.integerInRange(20,cellSize - 20 - cops[i].sprite.width) , y: cellTo.y + game.rnd.integerInRange(20,cellSize-cops[i].sprite.height - 20)}, 600, Phaser.Easing.Linear.None)
                                    .start();
                        tween.onComplete.add(function(){this.backToIdle(cellToX,cellToY);}, this);
                    }  
                }
            }
        }
        
        unitSelected = "";
    },

    moveAliens: function(){
        for(var i = 0; i < aliens.length; i++){
             
        }
    }

    backToIdle: function(x,y){
        for(var i = 0; i < people.length; i++){
            if(people[i].cell){
                if(people[i].sprite.animations.currentAnim != "idle"){
                    people[i].sprite.animations.play('idle');
                    people[i].cell.x = x;
                    people[i].cell.y = y; 
                    people[i].movements -= 1;       
                }
            }
        }

        for(var i = 0; i < cops.length; i++){
            if(cops[i].cell){
                if(cops[i].sprite.animations.currentAnim != "idle"){
                    cops[i].sprite.animations.play('idle');
                    cops[i].cell.x = x;
                    cops[i].cell.y = y; 
                    cops[i].movements -= 1;       
                }
            }
        }
    },

    addCellOnClick: function(){
       if(!draggin){
            var cellX   = Math.trunc(clicked.x / cellSize);
            var cellY   = Math.trunc(clicked.y / cellSize);
            var canPut  = false;
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
                    if(roomSelected != null)
                        this.resetSelection();
                    var newCell = this.putCell(clicked.x, clicked.y);

                    // Let's summon some things  
                    var rand = game.rnd.integerInRange(0,101);

                    if(rand < 25){
                        // Tripulants!
                        this.addPeople(newCell);
                    }
                    else if (rand < 55){
                        // Cops!
                        this.addCops(newCell);
                    }
                    else if (rand < 85){
                        // Aliens!
                        this.addAliens(newCell);
                    }

                    // Reset character movements
                    for(var i = 0; i < people.length; i++){
                        if(people[i])
                            people[i].movements = people[i].maxMovements;
                    }

                    for(var i = 0; i < cops.length; i++){
                        if(cops[i])
                            cops[i].movements   = cops[i].maxMovements;
                    }

                    for(var i = 0; i < aliens.length; i++){
                        if(aliens[i])
                            aliens[i].movements = aliens[i].maxMovements;
                    }
                } 
            }
            clicked = null;
        } 
    },

    resetSelection: function(){
        roomSelected    = null;
        for(var i = 0; i < gridX; i++){
            for(var j = 0; j < gridY; j++){
                if(boardInfo[i][j].sprite)
                    boardInfo[i][j].sprite.tint = 0xffffff; 
            }
        }
        unitSelection = "";
    },

    putCell: function(x, y){
        var cellX                           = Math.trunc(x/cellSize);
        var cellY                           = Math.trunc(y/cellSize);
        var cell                            = board.create(x, y, "room1");
        boardInfo[cellX][cellY].used        = true;
        boardInfo[cellX][cellY].sprite      = cell;
        turnElapsedTime                     = 0;
        canUseCell                          = false;
        timeFill.tint                       = 0xf0f28b;
        gridInfo[cellX][cellY].sprite.tint  = 0x1ABBB4;
        this.highlightCells();

        // Prepare new cell inputs
        cell.inputEnabled = true;
        cell.events.onInputOver.add(this.roomOver, this);
        cell.events.onInputOut.add(this.roomOut, this);
        cell.events.onInputDown.add(this.roomClick, this);

        turnNum++;
        return boardInfo[cellX][cellY];
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
                                        // This cell is fucking available 
                                        gridInfo[i][j].sprite.tint   = 0xFFF467;
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
        uiGroup                 = game.add.group();
        timeBar                 = uiGroup.create(137, 9, 'timeBar');
        timeFill                = uiGroup.create(137, 9, 'timeBar');
        hud                     = uiGroup.create(0, 0, 'hud');
        turnText                = game.add.bitmapText(25, 8, 'PixelFont','Turn '+ turnNum,16);
        copText                 = game.add.bitmapText(625, 49, 'PixelFont','0',16);
        alienText               = game.add.bitmapText(722, 49, 'PixelFont','0',16);
        pplText                 = game.add.bitmapText(527, 49, 'PixelFont','0',16);
        timeBar.fixedToCamera   = true;
        timeFill.fixedToCamera  = true;
        alienText.fixedToCamera = true;
        pplText.fixedToCamera   = true;
        copText.fixedToCamera   = true;
        hud.fixedToCamera       = true;
        bg.fixedToCamera        = true;
        turnText.fixedToCamera  = true;
        timeBar.tint            = 0x232324;
        timeFill.tint           = 0xf0f28b;    

        uiGroup.add(turnText);
        uiGroup.add(copText);
        uiGroup.add(alienText);
        uiGroup.add(pplText);
    },

    addPeople: function(cell){
        var rnd = game.rnd.integerInRange(2,4);
        for(var i = 1; i < rnd; i++){
            var sprite  = game.add.sprite((cell.x * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2) , (cell.y * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2), 'pj');
            var last    = people.push(new Character(sprite, cell));
            people[last - 1].sprite.animations.add('idle',   [0, 1, 2]   ,  5, true);
            people[last - 1].sprite.animations.add('right',  [3, 4, 3, 5], 10, true);
            people[last - 1].sprite.animations.add('left',   [6, 7, 6, 8], 10, true);
            people[last - 1].sprite.animations.play('idle');
            people[last - 1].cell.x = cell.x;
            people[last - 1].cell.y = cell.y; 
            pplCounter++;
            gameGroup.add(sprite);
        }
    },

    addAliens: function(cell){
        var rnd = game.rnd.integerInRange(2,4);
        for(var i = 1; i < rnd; i++){
            var sprite  = game.add.sprite((cell.x * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2) , (cell.y * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2), 'alien');
            var last    = aliens.push(new Character(sprite, cell));
            aliens[last - 1].sprite.animations.add('idle',[0, 1, 2],8,true);
            aliens[last - 1].sprite.animations.play('idle');
            aliens[last - 1].cell.x = cell.x;
            aliens[last - 1].cell.y = cell.y; 
            alienCounter++;
            gameGroup.add(sprite);
        }
    },

    addCops: function(cell){
        var rnd = game.rnd.integerInRange(2,4);
        for(var i = 1; i < rnd; i++){
            var sprite  = game.add.sprite((cell.x * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2) , (cell.y * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2), 'cop');
            var last    = cops.push(new Character(sprite, cell));
            cops[last - 1].sprite.animations.add('idle',   [0, 1, 2]   ,  5, true);
            cops[last - 1].sprite.animations.add('right',  [3, 4, 3, 5], 10, true);
            cops[last - 1].sprite.animations.add('left',   [6, 7, 6, 8], 10, true);
            cops[last - 1].sprite.animations.play('idle');
            cops[last - 1].cell.x = cell.x;
            cops[last - 1].cell.y = cell.y; 
            copCounter++;
            gameGroup.add(sprite);
        }
    },
};