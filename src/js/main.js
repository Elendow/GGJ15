var width   = 800;
var height  = 600;
var game    = new Phaser.Game(width, height, Phaser.AUTO, 'canvas');

function changeState(state) {
    game.state.start(state);
}

game.state.add('MainMenu', MainMenuState);  
game.state.add('Gameplay', GameplayState);  
game.state.add('EndOfGame', EndOfGameState); 

game.state.start('MainMenu'); 