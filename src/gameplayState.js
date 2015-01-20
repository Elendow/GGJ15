var ball;
var playerOne;
var playerTwo;

var GameplayState = {
    
    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';
    },

    create: function() { 
        game.world.setBounds(0,0,width,height);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.initPadOne(20, (height/2)-50);
        this.initPadTwo(width-40, (height/2)-50);
        this.initBall();

        var wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
        wKey.onDown.add(function(){this.movePad(playerOne, -400);}, this);  
        wKey.onUp.add(function(){this.movePad(playerOne, 0);}, this)

        var sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        sKey.onDown.add(function(){this.movePad(playerOne, 400);}, this);  
        sKey.onUp.add(function(){this.movePad(playerOne, 0);}, this)
    },

    update: function() {
        game.physics.arcade.overlap(ball, playerOne, this.changeBallSpeed, null, this); 
        game.physics.arcade.overlap(ball, playerTwo, this.changeBallSpeed, null, this); 
        this.updateIA();
    },

    updateIA: function() {
        if(ball.x > width / 2 && ball.body.velocity.x > 0) {
            if(ball.y > playerTwo.y)
                this.movePad(playerTwo, 400);
            else
                this.movePad(playerTwo, -400);
        } else {
                this.movePad(playerTwo, 0);
        }
    },

    changeBallSpeed: function() {
        ball.body.velocity.set(ball.body.velocity.x * -1, ball.body.velocity.y);
    },

    movePad: function(pad, speed) {
        pad.body.velocity.set(0, speed);
    },

    initPadOne: function(x, y) {
        sprite = game.add.bitmapData(20, 100);
        sprite.ctx.fillStyle = "#232325";
        sprite.ctx.beginPath();
        sprite.ctx.rect(0, 0, 20, 100);
        sprite.ctx.closePath();
        sprite.ctx.fill();

        playerOne = game.add.sprite(x, y, sprite);

        game.physics.enable(playerOne);
        playerOne.body.collideWorldBounds = true;
    },

    initPadTwo: function(x, y) {
        sprite = game.add.bitmapData(20, 100);
        sprite.ctx.fillStyle = "#232325";
        sprite.ctx.beginPath();
        sprite.ctx.rect(0, 0, 20, 100);
        sprite.ctx.closePath();
        sprite.ctx.fill();

        playerTwo = game.add.sprite(x, y, sprite);

        game.physics.enable(playerTwo);
        playerTwo.body.collideWorldBounds = true;
    },

    initBall: function() {
        sprite = game.add.bitmapData(20,20);
        sprite.ctx.fillStyle = '#000000';
        sprite.ctx.beginPath();
        sprite.ctx.arc(10, 10, 10, 0, Math.PI*2, true); 
        sprite.ctx.closePath();
        sprite.ctx.fill();

        ball = game.add.sprite(((width/2)-5),(height/2)-5, sprite);

        game.physics.enable(ball);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);
        ball.body.velocity.set(300, 300);
    },

};