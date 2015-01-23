var width   = 800;
var height  = 600;
var game    = new Phaser.Game(width, height, Phaser.AUTO, 'canvas');

function ChangeState(state) {
    game.state.start(state);
}

game.state.add('MainMenu', MainMenuState);  
game.state.add('Gameplay', GameplayState);  

game.state.start('MainMenu'); 