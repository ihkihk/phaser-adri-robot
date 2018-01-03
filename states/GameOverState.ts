class GameOverState extends BaseState {
    gameOverSound: Phaser.Sound;

    create() {
        this.addText(12, 12, 'GAME OVER');
        this.gameOverSound = this.game.add.audio('gameOver');
        this.gameOverSound.volume = 2;
        this.gameOverSound.onStop.add(function() {
            this.game.state.start('menu');
        }.bind(this));

        this.gameOverSound.play();
    }
}