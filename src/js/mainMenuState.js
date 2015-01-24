var MainMenuState = {

    preload: function() { 
        game.stage.backgroundColor = '#232325';
    },

    update: function() {
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function(){changeState('Gameplay')}, this);  
    },

};
