var tilespriteEnd;
var gameWinned;

var EndOfGameState = {

    preload: function() { 
        this.stage.backgroundColor = '#000000';
        this.load.spritesheet('button-restart', 'assets/gui/replay.png', 160, 32);
        this.load.image('bg', 'assets/sprites/background.png');
        this.load.image('lose', 'assets/gui/logoLose.png');
        this.load.image('win', 'assets/gui/logoWin.png');
        this.load.image('statistics', 'assets/gui/results.png');
        this.load.audio('metalClip', 'assets/sounds/metalClick.ogg');
    },

    create: function() {
        tilespriteEnd=this.add.tileSprite(0, 0, 800, 600, 'bg');

        // Audio
        fx = this.add.audio('metalClip');
        fx.allowMultiple = true;
        fx.addMarker('metalClip', 0, 1);
        music.play();

        if(gameWinned){
            this.add.sprite(250, 50, 'win');
            this.add.sprite(250, 250, 'statistics');
            this.add.bitmapText(290, 355, 'PixelFont',pplCounter+"",16);
            this.add.bitmapText(390, 355, 'PixelFont',copCounter+"",16);
            this.add.bitmapText(490, 355, 'PixelFont',alienCounter+"",16);       

        }else{
            this.add.sprite(250, 100, 'lose');
        }

        this.add.button(320, 450, 'button-restart', function(){ fx.play("metalClip"); changeState('Gameplay'); }, this, 0, 1, 2);
    },

    update: function() {
        tilespriteEnd.tilePosition.x += 1;
        tilespriteEnd.tilePosition.y += 1;
    }

};
