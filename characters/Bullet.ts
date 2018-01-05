class Bullet {
    level: Level1;
    layer: Phaser.TilemapLayer;
    sprite: Phaser.Sprite;
    spriteBody: Phaser.Physics.Arcade.Body;
    player: Player;
    game: Phaser.Game;
    velocity: number;
    destroyed: boolean;

    constructor(level: Level1, layer: Phaser.TilemapLayer) {
        this.level = level;
        this.game = level.game;
        this.layer = layer;
        //this.boss = boss;
        this.destroyed = false;
    }

    setup() {
        let playerPos:Phaser.Point = this.level.getPlayerPosition();
        this.sprite = this.game.add.sprite(playerPos.x, playerPos.y - 32, 'bullet');

        this.sprite.animations.add('bullet', [0, 1, 2, 3, 4, 5, 6, 7], 24, true);
        this.sprite.animations.play('bullet');

        this.velocity = 250;
        this.game.physics.arcade.enable(this.sprite);
        this.spriteBody = this.sprite.body;
        this.spriteBody.collideWorldBounds = true;
        this.spriteBody.setSize(16, 16, 8, 16);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.spriteBody.velocity.y = -this.velocity;
    }

    update() {
        // The bullet cannot be destroyed with sprite.destroy inside of the 
        // collide functions when the collision is with a TileMap
        this.game.physics.arcade.collide(this.sprite, this.layer, () => {
            this.sprite.position.setTo(0, 0);
            this.level.evtBulletHit(this, null);
        });

        if (this.sprite.position.equals(new Phaser.Point(0,0))) {
            this.sprite.destroy();
        }
    }

}