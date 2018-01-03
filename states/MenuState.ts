class MenuState extends BaseState {
    pushSpaceKey: Phaser.BitmapText;
    startSound: Phaser.Sound;

    create() {
        this.game.add.sprite(0, 0, 'menu');

        this.pushSpaceKey = this.addText(9, 16, "Press SPACE Key");

        this.startSound = this.game.add.audio('start');
        this.startSound.onStop.add(function () {
            this.game.state.start('splash1');
        }.bind(this));
    }

    update() {
        if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
            this.pushSpaceKey.alpha = 0;
            this.game.add.tween(this.pushSpaceKey).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true, 0, 5, true);
            this.startSound.play();
        }
    }
}