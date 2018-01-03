abstract class BaseSplashState extends BaseState {
    introSound: Phaser.Sound;
    static firstTime: boolean;
    levelNum: number;

    constructor() {
        super();
        Splash1.firstTime = true;
    }

    create() {
        this.addText(12, 11, 'LEVEL ' + this.levelNum);

        if (Splash1.firstTime) {
            Splash1.firstTime = false;
            this.introSound = this.game.add.audio('intro');
            this.introSound.volume = 2;
            this.introSound.onStop.add(this.resumeGame.bind(this));
            this.introSound.play();
        } else {
            this.game.time.events.add(Phaser.Timer.SECOND, this.resumeGame, this);
        }
    }

    resumeGame() {
        this.game.state.start('level' + this.levelNum);
    }
}

class Splash1 extends BaseSplashState {
    constructor() {
        super();
        this.levelNum = 1;
    }
}