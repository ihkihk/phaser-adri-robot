class Battery {
    level: BaseLevelState;
    game: Phaser.Game;
    layer: Phaser.TilemapLayer;

    sprite: Phaser.Sprite;
    spriteBody: Phaser.Physics.Arcade.Body;

    x: number;
    y: number;

    constructor(level: BaseLevelState, layer: Phaser.TilemapLayer, x:number, y:number) {
        this.level = level;
        this.game = this.level.game;
        this.layer = layer;

        this.x = x;
        this.y = y;
    }

    setup() {
        this.sprite = this.game.add.sprite(this.x, this.y, 'battery');

        this.game.physics.arcade.enable(this.sprite);
        this.spriteBody = this.sprite.body;

        this.spriteBody.immovable = true;
    }

    update() {

    }
}