/// <reference path="../states/LevelState.ts"/>

interface IPlayer {
    sprite: Phaser.Sprite;
    velocity: number;
    isWeaponLoaded: boolean;

    recharge(charge: number);
    runDown();
    runLeft();
    runRight();
    runUp();
    shoot();
    walk();
    wasHit();
}

class Player implements IPlayer {
    level: BaseLevelState;
    game: Phaser.Game;
    layer: Phaser.TilemapLayer;

    sprite: Phaser.Sprite;
    spriteBody: Phaser.Physics.Arcade.Body;
    
    cursors: Phaser.CursorKeys
    
    velocity: number;
    walkingVelocity: number;
    
    power: number;
    initialPower: number;
    
    state: IPlayerState;
    isWeaponLoaded: boolean;

    damageSound: Phaser.Sound;
    rechargeSound: Phaser.Sound;

    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, cursors: Phaser.CursorKeys, 
        initialPower: number) {
        this.level = level;
        this.game = level.game;
        this.layer = layer;
        this.cursors = cursors;

        this.power = initialPower;
        this.initialPower = initialPower;

        this.isWeaponLoaded = false;
    }

    setup() {
        this.damageSound = this.game.add.audio('damage');
        this.rechargeSound = this.game.add.audio('recharge');

        this.sprite = this.game.add.sprite(this.game.world.centerX - 16, this.game.world.height - 64, 'player');

        this.sprite.animations.add('run', [0, 1, 2, 3], 4, true);
        this.sprite.animations.add('hit', [4, 5, 6, 7], 10, false);
        this.sprite.animations.add('die', [4, 5, 6, 7, 4, 5, 6, 7], 10, true);
        this.sprite.animations.play('run');

        this.game.physics.arcade.enable(this.sprite);
        this.spriteBody = this.sprite.body;
        this.spriteBody.collideWorldBounds = true;
        this.spriteBody.setSize(32, 32, 0, 0);
        this.sprite.anchor.setTo(0.5, 0.5);

        this.isWeaponLoaded = true;

        this.state = new PlayerStateRunning(this);
    }

    update() {
        this.game.physics.arcade.collide(this.sprite, this.layer);

        this.spriteBody.velocity.set(0);

        this.velocity = 150;
        this.walkingVelocity = 60;

        switch(this.sprite.animations.currentFrame.index) {
            case 0:
                this.sprite.rotation = -0.1;
                break;
            case 1:
                this.sprite.rotation = 0;
                break;
            case 2:
                this.sprite.rotation = 0.1;
                break;
            case 3:
                this.sprite.rotation = 0;
                break;
            default:
                this.sprite.rotation = 0;
                break;
        }

       // this.decreasePower(0.05);

        this.state.update(this.cursors, this.game.input.keyboard, this.game.camera);
    }

    recharge(charge: number) {
        this.rechargeSound.play();
        this.increasePower(charge);
    }

    shoot() {
        this.level.evtPlayerFired();
    }

    walk() {
        //if (this.noCursorKeyDown()) {
            this.spriteBody.velocity.y = - this.walkingVelocity;
        //}
    }

    wasHit() {
        this.damageSound.onStop.add(function() {
            this.sprite.animations.play('run');
        }.bind(this));
        this.damageSound.play();
        this.sprite.animations.play('hit');
        this.decreasePower(1);
    }

    noCursorKeyDown(): boolean {
        return !this.cursors.down.isDown
            && !this.cursors.up.isDown
            && !this.cursors.left.isDown
            && !this.cursors.right.isDown;
    }

    runUp() {
        this.spriteBody.velocity.y = -this.velocity;
    }

    runDown() {
        this.spriteBody.velocity.y = this.velocity;
    }

    runLeft() {
        this.spriteBody.velocity.x = -this.velocity;
    }

    runRight() {
        this.spriteBody.velocity.x = this.velocity;
    }

    decreasePower(energyAmount: number): boolean {
        if (this.power - energyAmount > 0) {
            this.power -= energyAmount;
            this.level.evtPlayerPowerChanged();
            return true;
        }
        else {
            this.power = 0;
            this.level.evtPlayerPowerChanged();
            this.state = new PlayerStateDying(this);
            this.level.evtPlayerDied();
            return false;
        }
    }

    increasePower(energyAmount: number): boolean {
        if (this.power + energyAmount < this.initialPower) {
            this.power += energyAmount;
            this.level.evtPlayerPowerChanged();
            return true;
        }
        else {
            this.power = this.initialPower;
            this.level.evtPlayerPowerChanged();
            return false;
        }
    }
}


interface IPlayerState {
    update(cursors: Phaser.CursorKeys, keyboard: Phaser.Keyboard, camera: Phaser.Camera);
}

class PlayerStateRunning implements IPlayerState {
    player: IPlayer;

    constructor(player: Player) {
        this.player = player;
    }

    update(cursors: Phaser.CursorKeys, keyboard: Phaser.Keyboard, camera: Phaser.Camera) {
        if (cursors.up.isDown) {
            this.player.runUp();
        } else if (cursors.down.isDown) {
            if ((<Phaser.Physics.Arcade.Body>this.player.sprite.body).y <
                camera.y + camera.height
                - (<Phaser.Physics.Arcade.Body>this.player.sprite.body).height) {
                this.player.runDown();
            }
        }

        if (cursors.left.isDown) {
            this.player.runLeft();
        } else if (cursors.right.isDown) {
            this.player.runRight();
        }

        if (this.player.isWeaponLoaded && keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
            this.player.isWeaponLoaded = false;
            this.player.shoot();
        } else if (!keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
            this.player.isWeaponLoaded = true;
        }
    }
}

class PlayerStateDying implements IPlayerState {
    player: IPlayer;

    constructor(player: Player) {
        this.player = player;
    }

    update(cursors: Phaser.CursorKeys, keyboard: Phaser.Keyboard, camera: Phaser.Camera) {
        if (this.player.sprite.animations.currentAnim.name != 'die') {
            this.player.sprite.animations.play('die');
        }
    }
}