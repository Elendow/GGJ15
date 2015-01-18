var width   = 800;
var height  = 600
var game    = new Phaser.Game(width, height, Phaser.AUTO, 'canvas');
var bird;

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('spriteSheet', 'assets/flappy.png');
    },

    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);    
    
        //bird.physicsBodyType = Phaser.Physics.ARCADE;
        //bird.create(200, 200, 'spriteSheet');
    },

    update: function() {

    },
};

game.state.add('main', mainState);  
game.state.start('main'); 