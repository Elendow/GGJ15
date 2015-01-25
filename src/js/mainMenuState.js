var tilesprite;

var MainMenuState = {

    preload: function() { 
        this.stage.backgroundColor = '#000000';
        this.load.spritesheet('button-start', 'assets/gui/btnew-game.png', 160, 32);
        this.load.image('bg', 'assets/sprites/background.png');
        this.load.image('logo', 'assets/gui/logo.png');
        this.load.audio('metalClip', 'assets/sounds/metalClick.ogg');
        this.load.audio('bgMusic', 'assets/sounds/bgMusic.mp3');
    },

    create: function() {
        tilesprite=this.add.tileSprite(0, 0, 800, 600, 'bg');
        // Audio
        fx = this.add.audio('metalClip');
        fx.allowMultiple = true;
        fx.addMarker('metalClip', 0, 1);
        music = this.add.audio('bgMusic');
        music.play();

        this.add.sprite(250, 100, 'logo');
        this.add.button(320, 450, 'button-start', function(){ fx.play("metalClip"); changeState('Gameplay'); }, this, 0, 1, 2);
    },

    update: function() {
        tilesprite.tilePosition.x += 1;
        tilesprite.tilePosition.y += 1;

        /*var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function(){changeState('Gameplay')}, this); */
    }

};
