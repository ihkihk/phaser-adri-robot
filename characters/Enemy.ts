interface IEnemy {

}

abstract class BaseEnemy implements IEnemy {
    game: Phaser.Game;
    level: BaseLevelState;
    layer: Phaser.TilemapLayer;

    sprite: Phaser.Sprite;
    spriteBody: Phaser.Physics.Arcade.Body;
    spriteName: string;

    velocity: number;

    x: number;
    y: number;

    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number) {
        this.game = level.game;
        this.level = level;
        this.layer = layer;

        this.x = x;
        this.y = y;

        this.velocity = 16;
    }

    setup() {
        this.sprite = this.game.add.sprite(this.x, this.y, this.spriteName);

        this.sprite.animations.add('run', [0, 1, 2, 3, 4, 5, 6, 7], 4, true);
        this.sprite.animations.play('run');

        this.game.physics.arcade.enable(this.sprite);
        this.spriteBody = this.sprite.body;
        this.spriteBody.collideWorldBounds = true;
        this.spriteBody.setSize(32, 32, 0, 0);
    }

    update() {

    }
}

class EnemyA extends BaseEnemy {
    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number) {
        super(level, layer, x, y);
        this.spriteName = 'enemyA';
    }

    update() {
        super.update();

        if (this.sprite.inCamera) {
            this.spriteBody.velocity.y = this.velocity;
            this.spriteBody.velocity.x = this.velocity * 
                ((this.game.time.totalElapsedSeconds() % 2) - 1); 
        }
    }
}

class EnemyB extends BaseEnemy {
    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number) {
        super(level, layer, x, y);
        this.spriteName = 'enemyB';
    }

    update() {
        super.update();

        if (this.sprite.inCamera) {
            let direction: number;

            if (this.spriteBody.position.x > this.level.getPlayerPosition().x) {
                direction = -1;
            } else {
                direction = 1;
            }
            this.spriteBody.velocity.x = direction * this.velocity * 
                (this.game.time.totalElapsedSeconds() % 4);
        }
    }
}

class EnemyC extends BaseEnemy {
    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number) {
        super(level, layer, x, y);
        this.spriteName = 'enemyC';
    }

    update() {
        super.update();

        if (this.sprite.inCamera) {
            this.spriteBody.velocity.x = this.velocity *
                ((this.game.time.totalElapsedSeconds() % 4) - 2);
        }
    }
}

class EnemyD extends BaseEnemy {
    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number) {
        super(level, layer, x, y);
        this.spriteName = 'enemyD';
    }

    update() {
        super.update();

        if (this.sprite.inCamera) {
            this.spriteBody.velocity.y = this.velocity;
            this.spriteBody.velocity.x = this.velocity * 
                ((this.game.time.totalElapsedSeconds() % 4) - 2);
        }
    }
}

class EnemyE extends BaseEnemy {
    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number) {
        super(level, layer, x, y);
        this.spriteName = 'enemyE';
    }

    update() {
        super.update();

        if (this.sprite.inCamera) {
            this.spriteBody.velocity.y = this.velocity * 2;
        }
    }
}

class EnemyFactory {
    static create(name: string, level: BaseLevelState, layer: Phaser.TilemapLayer, x: number, y: number): BaseEnemy {
        switch (name.toUpperCase()) {
            case 'A':
                return new EnemyA(level, layer, x, y);
            case 'B':
                return new EnemyB(level, layer, x, y);
            case 'C':
                return new EnemyC(level, layer, x, y);
            case 'D':
                return new EnemyD(level, layer, x, y);
            case 'E':
                return new EnemyE(level, layer, x, y); 
            default:
                throw "Unknown Enemy type";
        }
    }
}