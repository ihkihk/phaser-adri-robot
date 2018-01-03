/// <reference path="states/BaseState.ts" />
/// <reference path="states/MenuState.ts" />
/// <reference path="states/SplashState.ts" />
/// <reference path="states/LevelState.ts" />

class Geometry {
    static GAME_WIDTH_IN_PX: number = 512;
    static GAME_HEIGHT_IN_PX: number = 512;

    static TILE_WIDTH_IN_PX: number = 32;
    static TILE_HEIGHT_IN_PX: number = 32;

    static SPRITE_WIDTH_IN_PX: number = 32;
    static SPRITE_HEIGHT_IN_PX: number = 32;

    static WORLD_WIDTH_IN_TILES: number = Geometry.GAME_WIDTH_IN_PX / Geometry.TILE_WIDTH_IN_PX;
    static WORLD_HEIGHT_IN_TILES: number = 3776 / Geometry.TILE_HEIGHT_IN_PX;

    static WORLD_WIDTH_IN_PX: number = Geometry.WORLD_WIDTH_IN_TILES * Geometry.TILE_WIDTH_IN_PX;
    static WORLD_HEIGHT_IN_PX: number = Geometry.WORLD_HEIGHT_IN_TILES * Geometry.TILE_HEIGHT_IN_PX;

    static STATUSBAR_WIDTH_IN_PX: number = Geometry.GAME_WIDTH_IN_PX;
    static STATUSBAR_HEIGHT_IN_PX: number = Geometry.TILE_HEIGHT_IN_PX;

    static VIEW_WIDTH_IN_PX: number = Geometry.GAME_WIDTH_IN_PX;
    static VIEW_HEIGHT_IN_PX: number = Geometry.GAME_HEIGHT_IN_PX - Geometry.STATUSBAR_HEIGHT_IN_PX;
}

class AdriTheRobot {
    game: Phaser.Game;

    constructor() {
        this.game = new Phaser.Game(Geometry.GAME_WIDTH_IN_PX, Geometry.GAME_HEIGHT_IN_PX, 
            Phaser.AUTO, 'content', 
            {preload: this.preload, create: this.create});
    }

    preload() {
        // menu & splash screen images
        this.game.load.spritesheet('menu', 'assets/backgrounds/menu.png', Geometry.GAME_WIDTH_IN_PX, Geometry.GAME_HEIGHT_IN_PX-128);
        //this.game.load.spritesheet('splash', 'assets/backgrounds/splash1.png', Geometry.GAME_WIDTH_IN_PX, Geometry.GAME_HEIGHT_IN_PX-128);

        // level intro images
        this.game.load.image('level1', 'assets/backgrounds/level01.jpg');
        this.game.load.image('level2', 'assets/backgrounds/level02.jpg');
        this.game.load.image('level3', 'assets/backgrounds/level03.jpg');

        // spritesheets for every character in the game
        this.game.load.spritesheet('player', 'assets/sprites/player.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('bullet', 'assets/sprites/bullet.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('battery', 'assets/sprites/battery.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('enemyA', 'assets/sprites/enemy1.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('enemyB', 'assets/sprites/enemy2.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('enemyC', 'assets/sprites/enemy3.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('enemyD', 'assets/sprites/enemy4.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        this.game.load.spritesheet('enemyE', 'assets/sprites/enemy5.png', Geometry.SPRITE_WIDTH_IN_PX, Geometry.SPRITE_HEIGHT_IN_PX);
        
        // fonts
        this.game.load.bitmapFont('bitmapfont', 'assets/fonts/bitmapfont.png', 'assets/fonts/bitmapfont.xml');

        // sounds
        this.game.load.audio('start', 'assets/audio/start-level.wav');
        this.game.load.audio('intro', 'assets/audio/sound-intro.wav');
        this.game.load.audio('music', 'assets/audio/game-sound.wav');
        this.game.load.audio('bullet', 'assets/audio/bullet.wav');
        this.game.load.audio('died', 'assets/audio/died.wav');
        this.game.load.audio('playerDied', 'assets/audio/died.wav');
        this.game.load.audio('gameOver', 'assets/audio/died.wav');
        this.game.load.audio('damage', 'assets/audio/energy-down.wav');
        this.game.load.audio('recharge', 'assets/audio/energy-up.wav');

        // scripts
        this.game.load.script('baseState', 'states/BaseState.js');
        this.game.load.script('menuState', 'states/MenuState.js');
        this.game.load.script('splash', 'states/SplashState.js');
        this.game.load.script('level', 'states/LevelState.js');
        this.game.load.script('gameOver', 'states/GameOverState.js');
        this.game.load.script('player', 'characters/Player.js');
        this.game.load.script('bullet', 'characters/Bullet.js');
        this.game.load.script('enemy', 'characters/Enemy.js');
        this.game.load.script('battery', 'characters/Battery.js');
    }

    create() {
        this.game.state.add('menu', MenuState);
        this.game.state.add('splash1', Splash1);
        this.game.state.add('level1', Level1);
        this.game.state.add('gameover', GameOverState);
        this.game.state.start('menu');
    }
}

window.onload = () => {
    let game: AdriTheRobot = new AdriTheRobot();
}
