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
var turnTime        = 5000;
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
var people          = [];
var cops            = [];
var aliens          = [];
var roomSelected;
var gameGroup;
var bloodGroup;
var aliensTimer     = 5000;

var GameplayState = {
    
    preload: function() { 
        // Preload all assets
        game.stage.backgroundColor = '#000000';
        game.load.image('grid'              , 'assets/sprites/grid.png'); 
        game.load.image('room1'             , 'assets/sprites/room1.png');
        game.load.image('timeBar'           , 'assets/gui/timeBar.png');
        game.load.image('hud'               , 'assets/gui/hud.png');
        game.load.image('bg'                , 'assets/sprites/background.png');
        game.load.image('blood'             , 'assets/sprites/blood.png');
        game.load.image('alienBlood'        , 'assets/sprites/bloodAlien.png');
        game.load.spritesheet("pj"          , 'assets/sprites/nino1_spritesheet.png', 23, 40, 9);
        game.load.spritesheet("cop"         , 'assets/sprites/police_spritesheet.png', 23, 40, 9);
        game.load.spritesheet("alien"       , 'assets/sprites/alien.png', 27, 51, 3);
        game.load.bitmapFont('PixelFont'    , 'assets/font/font.png', 'assets/font/font.fnt');
        game.load.audio('metalClip'         , 'assets/sounds/metalClick.ogg');
        this.restartGame();
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

        // Audio
        fx = game.add.audio('metalClip');
        fx.allowMultiple = true;
        fx.addMarker('metalClip', 0, 1);

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
        bloodGroup = game.add.group();
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

        // Aliens IA
        if(aliens.length > 0){
            aliensTimer -= game.time.elapsed;
            if(aliensTimer <= 0){
                aliensTimer = game.rnd.integerInRange(5000,8000);
                this.moveAliens();
            }
        }
        this.checkEndOfGame();
    },

    checkAlienKills: function(){
        var killed = false;
        for(var i = 0; i < aliens.length; i++){
            killed = false;
            for(var j = 0; j < people.length; j++){
                if(!killed && people[j].sprite.alive){
                    if(aliens[i].sprite.alive && aliens[i].x == people[j].x && aliens[i].y == people[j].y){
                        bloodGroup.create(people[j].sprite.x, people[j].sprite.y, 'blood');
                        people[j].sprite.kill();
                        pplCounter--;
                        killed = true;
                    } 
                }
            }
        }
    },

    checkCopsKills: function(){
        var killed = false;
        for(var i = 0; i < cops.length; i++){
            killed = false;
            for(var j = 0; j < aliens.length; j++){
                if(!killed && aliens[j].sprite.alive){
                    if(cops[i].x == aliens[j].x && cops[i].y == aliens[j].y){
                        bloodGroup.create(aliens[j].sprite.x, aliens[j].sprite.y, 'alienBlood');
                        aliens[j].sprite.kill();
                        killed = true;
                        alienCounter--;
                    } 
                }
            }
        }
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

        console.log("Click on " + cellX + "," + cellY);
        if(roomSelected == null){
            //this.resetSelection();
            // Character recount
            var ppl = 0;
            var cop = 0;
            roomSelected = e;
            for(var i = 0; i < people.length; i++){
                if(people[i].cell && people[i].sprite.alive){
                    if(people[i].x == cellX && people[i].y == cellY && people[i].movements >= 0)
                        ppl++; 
                }
            }
            for(var i = 0; i < cops.length; i++){
                if(cops[i].cell){
                    if(cops[i].x == cellX && cops[i].y == cellY && cops[i].movements >= 0)
                        cop++;       
                }
            }

            console.log(ppl + " persons on " + cellX + "," + cellY);
            console.log(cop + " cops on " + cellX + "," + cellY);

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
                if(people[i].cell && people[i].sprite && people[i].sprite.alive){
                    if(people[i].x == cellFromX && people[i].y == cellFromY && people[i].movements >= 0){  
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
                        tween.onComplete.add(
                            function(){
                                this.backToIdle(cellToX,cellToY);
                                if(i == cops.length - 1)
                                    this.checkAlienKills(); 
                                    this.checkCopsKills();
                        }, this);
                    }  
                }
            }
        }
        else if(unitSelected == "cop"){
             for(var i = 0; i < cops.length; i++){
                if(cops[i].cell && cops[i].sprite){
                    if(cops[i].x == cellFromX && cops[i].y == cellFromY && cops[i].movements >= 0){  
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
                        tween.onComplete.add(
                            function(){
                                this.backToIdle(cellToX,cellToY);
                                if(i == cops.length - 1)
                                    this.checkAlienKills(); 
                                    this.checkCopsKills();
                        }, this);
                    }  
                }
            }
        }
        
        unitSelected = "";
    },

    moveAliens: function(){
        for(var i = 0; i < aliens.length; i++){
            if(aliens[i].sprite != null && aliens[i].sprite.alive){
                if(aliens[i].movements >= 0){
                    var cellFrom = new Cell(-1,-1);
                    cellFrom.x = aliens[i].x;
                    cellFrom.y = aliens[i].y;
                    var possibleCells   = [];

                    for(var g = cellFrom.x - 1; g < cellFrom.x + 2; g++){
                        for(var j = cellFrom.y - 1; j < cellFrom.y + 2; j++){
                            if(g > 0 && j > 0 && g < gridX && j < gridY){
                                if(!(g == cellFrom.x && j == cellFrom.y) && !(g != cellFrom.x && j != cellFrom.y)){
                                    if(boardInfo[g][j].used){
                                        possibleCells.push(boardInfo[g][j]);
                                    }
                                }
                            }
                        }
                    }
                    if(possibleCells.length > 0){
                        var rand   = game.rnd.integerInRange(0,possibleCells.length - 1);
                        var cellTo = possibleCells[rand];
                        aliens[i].movements--;
                        aliens[i].x    = cellTo.x;
                        aliens[i].y    = cellTo.y;
                        aliens[i].cell = cellTo;

                        aliens[i].sprite.angle = 0;

                        if(cellTo.x > cellFrom.x){
                            aliens[i].sprite.angle = 90;
                        }
                        else if(cellTo.x < cellFrom.x){
                            aliens[i].sprite.angle = -90;    
                        }

                        if(cellTo.y > cellFrom.y){
                            aliens[i].sprite.angle = 180;
                        }

                        var tween = this.game.add.tween(aliens[i].sprite).to({x: (cellFrom.x * cellSize + gridOffset) + (cellSize / 2) - (aliens[i].sprite.width / 2), y: (cellFrom.y * cellSize + gridOffset) + (cellSize / 2) - (aliens[i].sprite.height / 2)}, 600, Phaser.Easing.Linear.None)
                                            .to({x: (cellTo.x * cellSize + gridOffset) + (cellSize / 2) - (aliens[i].sprite.width / 2), y: (cellTo.y * cellSize + gridOffset) + (cellSize / 2) - (aliens[i].sprite.height / 2)}, 1200, Phaser.Easing.Linear.None)
                                            .to({x: (cellTo.x * cellSize + gridOffset) + game.rnd.integerInRange(20,cellSize - 50) , y: (cellTo.y * cellSize + gridOffset) + game.rnd.integerInRange(20,50)}, 600, Phaser.Easing.Linear.None)
                                            .start();
                        if(i == aliens.length - 1) 
                            tween.onComplete.add(function(){this.checkAlienKills(); this.checkCopsKills();}, this);
                    }
                }
            }
        }
    },

    backToIdle: function(x,y,checkDeads){
        for(var i = 0; i < people.length; i++){
            if(people[i].cell && people[i].sprite && people[i].sprite.alive){
                if(people[i].sprite.animations.currentAnim != "idle"){
                    people[i].sprite.animations.play('idle');
                    people[i].x = x;
                    people[i].y = y; 
                    people[i].movements -= 1;       
                }
            }
        }

        for(var i = 0; i < cops.length; i++){
            if(cops[i].cell){
                if(cops[i].sprite.animations.currentAnim != "idle"){
                    cops[i].sprite.animations.play('idle');
                    cops[i].x = x;
                    cops[i].y = y; 
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
                    console.log("New cell at " + newCell.x + "," + newCell.y);
                    // Let's summon some things  
                    var rand = game.rnd.integerInRange(0,101);

                    if(turnNum == 5 && aliens.length < 3)
                        rand = 79;

                    if(rand < 30){
                        // Tripulants!
                        this.addPeople(newCell);
                    }
                    else if (rand < 50){
                        // Cops!
                        this.addCops(newCell);
                    }
                    else if (rand < 80){
                        // Aliens!
                        if(turnNum > 2)
                            this.addAliens(newCell);
                        else
                            this.addPeople(newCell);
                    }

                    // Reset character movements
                    for(var i = 0; i < people.length; i++){
                        if(people[i] && people[i].sprite.alive)
                            people[i].movements = people[i].maxMovements;
                    }

                    for(var i = 0; i < cops.length; i++){
                        if(cops[i])
                            cops[i].movements   = cops[i].maxMovements;
                    }

                    for(var i = 0; i < aliens.length; i++){
                        if(aliens[i] && aliens[i].sprite.alive)
                            aliens[i].movements = aliens[i].maxMovements;
                    }
                } 
            }
            clicked = null;
        } 
    },

    resetSelection: function(){
        roomSelected = null;
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
        boardInfo[cellX][cellY].x           = cellX;
        boardInfo[cellX][cellY].y           = cellY;
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
        fx.play("metalClip");
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
                                    if(!boardInfo[i][j].used && gridInfo[i][j].sprite){
                                        // This cell is fucking available 
                                        gridInfo[i][j].sprite.tint = 0xFFF467;
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
            var last    = people.push(new Character(sprite));
            people[last - 1].sprite = sprite;
            people[last - 1].sprite.animations.add('idle',   [0, 1, 2]   ,  5, true);
            people[last - 1].sprite.animations.add('right',  [3, 4, 3, 5], 10, true);
            people[last - 1].sprite.animations.add('left',   [6, 7, 6, 8], 10, true);
            people[last - 1].sprite.animations.play('idle');
            people[last - 1].cell   = cell;
            people[last - 1].x      = cell.x;
            people[last - 1].y      = cell.y; 
            console.log("Person at: " + people[last - 1].x + "," + people[last - 1].y );
            pplCounter++;
            gameGroup.add(sprite);
        }
    },

    addAliens: function(cell){
        var rnd = game.rnd.integerInRange(3,5);
        for(var i = 1; i < rnd; i++){
            var sprite  = game.add.sprite((cell.x * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2) , (cell.y * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2), 'alien');
            var last    = aliens.push(new Character(sprite));
            aliens[last - 1].sprite = sprite;
            aliens[last - 1].sprite.animations.add('idle',[0, 1, 2],8,true);
            aliens[last - 1].sprite.animations.play('idle');
            aliens[last - 1].sprite.anchor.setTo(0.5, 0.5);
            aliens[last - 1].cell   = cell;
            aliens[last - 1].x      = cell.x;
            aliens[last - 1].y      = cell.y; 
            alienCounter++;
            gameGroup.add(sprite);
        }
    },

    addCops: function(cell){
        console.log("Adding cop at " + cell.x + "," + cell.y);
        var rnd = game.rnd.integerInRange(2,4);
        for(var i = 1; i < rnd; i++){
            var sprite  = game.add.sprite((cell.x * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2) , (cell.y * cellSize) + (cellSize / 2) + (64 + game.rnd.integerInRange(-64,64) / 2), 'cop');
            var last    = cops.push(new Character(sprite));
            cops[last - 1].sprite = sprite;
            cops[last - 1].sprite.animations.add('idle',   [0, 1, 2]   ,  5, true);
            cops[last - 1].sprite.animations.add('right',  [3, 4, 3, 5], 10, true);
            cops[last - 1].sprite.animations.add('left',   [6, 7, 6, 8], 10, true);
            cops[last - 1].sprite.animations.play('idle');
            cops[last - 1].cell   = cell;
            cops[last - 1].x      = cell.x;
            cops[last - 1].y      = cell.y; 
            copCounter++;
            gameGroup.add(sprite);
        }
    },

    restartGame: function(){
        
        grid            = null;
        gridInfo        = null;
        gridOffset      = 50;
        gridX           = 10;
        gridY           = 8;
        cellSize        = 192;

    // Board variables
        board           = null;
        boardInfo       = null;
        maxCells        = 30;
        canUseCell      = true;
        turnNum         = 0;
        clicked         = null;
        unitSelected    = "";

    // Camera and drag variables
        dragX           = -1;
        dragY           = -1;
        draggin         = false;
        cameraSpeed     = 15

    // GUI variables
        turnTime        = 2500;
        turnElapsedTime = 99999;
        timeBar         = null;
        timeFill        = null;
        turnText        = null;
        copText         = null;
        alienText       = null;
        pplText         = null;
        hud             = null;
        pplCounter      = 0;
        copCounter      = 0;
        alienCounter    = 0;
        uiGroup         = null;

    // Characters variables
        people          = [];
        cops            = [];
        aliens          = [];
        roomSelected    = null;
        gameGroup       = null;
        aliensTimer     = 500;
    },

    checkEndOfGame: function(){
        
        if(turnNum==15){
            gameWinned=true;
            changeState('EndOfGame');
        }else if (pplCounter==0){
            gameWinned=false;
            changeState('EndOfGame');
        }       
    }
};