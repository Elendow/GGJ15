var tilespriteEnd;
var gameWinned;

var EndOfGameState = {

    preload: function() { 
        this.stage.backgroundColor = '#000000';
        this.load.spritesheet('button-restart', 'assets/gui/replay.png', 160, 32);
        this.load.image('bg', 'assets/sprites/background.png');
        this.load.image('lose', 'assets/gui/logoLose.png');
        this.load.image('win', 'assets/gui/logoWin.png');
        this.load.audio('metalClip', 'assets/sounds/metalClick.ogg');
    },

    create: function() {
        tilespriteEnd=this.add.tileSprite(0, 0, 800, 600, 'bg');

        // Audio
        fx = this.add.audio('metalClip');
        fx.allowMultiple = true;
        fx.addMarker('metalClip', 0, 1);
        music = this.add.audio('bgMusic');
        music.play();

        if(gameWinned){
            this.add.sprite(250, 100, 'win');
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
