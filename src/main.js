var width   = 800;
var height  = 600
var game    = new Phaser.Game(width, height, Phaser.AUTO, 'canvas');
var bird;

var physicSytem = Phaser.Physics.ARCADE

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('bird', 'assets/pipe.png');
        game.load.image('pipe', 'assets/pipe.png');  
    },

    create: function() { 
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.pipes = game.add.group(); // Create a group  
        this.pipes.enableBody = true;  // Add physics to the group  
        this.pipes.createMultiple(40, 'pipe'); // Create 20 pipes  

        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);  

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);  

        this.score = 0;  
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 
    },

    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false)
            this.restartGame();

        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this); 
    },

    // Make the bird jump 
    jump: function() {  
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
    },

    // Restart the game
    restartGame: function() {  
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function(x, y) {  
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 

        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {  
        // Pick where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        for (var i = 0; i < 10; i++)
            if (i != hole && i != hole + 1) 
                this.addOnePipe(width, i * 60 + 10);

        this.score += 1;  
        this.labelScore.text = this.score;    
    },
};

game.state.add('main', mainState);  
game.state.start('main'); 