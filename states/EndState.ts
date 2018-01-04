class EndState extends BaseState {
    gameOverSound: Phaser.Sound;

    create() {
        this.addText(12, 12, 'THE END');
        this.gameOverSound = this.game.add.audio('gameOver');
        this.gameOverSound.onStop.add(() => {
            this.game.state.start('menu');
        });

        this.gameOverSound.play();
    }
}