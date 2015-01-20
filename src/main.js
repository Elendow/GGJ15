var width   = 800;
var height  = 600;
var game    = new Phaser.Game(width, height, Phaser.AUTO, 'canvas');

var ball;

var GameplayState = {
    
    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';
    },

    create: function() { 
        game.world.setBounds(0,0,width,height);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        bmd = game.add.bitmapData(20,20);
        bmd.ctx.fillStyle = '#000000';
        bmd.ctx.beginPath();
        bmd.ctx.arc(10, 10, 10, 0, Math.PI*2, true); 
        bmd.ctx.closePath();
        bmd.ctx.fill();

        ball = game.add.sprite(50, 50, bmd);

        game.physics.enable(ball);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(0.8);
        ball.body.gravity.set(0, 180);
        ball.body.velocity.setTo(200, 200);
    },

    update: function() {
                
    },

    restartGame: function() {  
        game.state.start('Gameplay');
    },

};

var MainMenuState = {

    preload: function() { 
        game.stage.backgroundColor = '#00ff00';
    },

    update: function() {
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.launchGame, this);  
    },

    launchGame: function(){
        this.game.state.start('Gameplay');
    },

};

game.state.add('MainMenu', MainMenuState);  
game.state.add('Gameplay', GameplayState);  

game.state.start('MainMenu'); 