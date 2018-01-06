/// <reference path="../characters/Player.ts"/>
/// <reference path="../characters/Bullet.ts"/>
/// <reference path="../characters/Enemy.ts"/>
/// <reference path="../characters/Battery.ts"/>
/// <reference path="../ui/StatusBar.ts"/>



interface ILevel {
    //bulletHit();
    //bulletFire();
    //playerChangeState();
    getPlayerPosition(): Phaser.Point;
}

abstract class BaseLevelState extends BaseState implements ILevel {
    levelNum: number;

    cursors: Phaser.CursorKeys;

    tileSprite: Phaser.TileSprite;
    map: Phaser.Tilemap;
    layer: Phaser.TilemapLayer;

    statusBar: StatusBar;

    player: Player;
    bullets: Bullet[];
    enemies: BaseEnemy[];
    batteries: Battery[];

    volume: number;
    levelMusic: Phaser.Sound;
    bulletSound: Phaser.Sound;
    playerDiedSound: Phaser.Sound;

    statusBarNeedsUpdate: boolean;

    PWR_INITAL: number = 100;
    PWR_DECR_PER_BULLET: number = 1;
    PWR_DECR_PER_HIT: number = 5;
    PWR_INCR_PER_BATTERY: number = 10;

    //
    // LEVEL CREATION
    //

    create() {
        this.setupAudio();
        this.setupMap();
        this.setupCamera();
        this.setupKeyboard();
        this.setupStatusBar();
        this.setupPlayer();
        this.setupBullets();

        this.statusBarNeedsUpdate = true;

        this.startMapScroll();
    }

    setupAudio() {
        this.volume = 2;
        
        this.levelMusic = this.game.add.audio('music');
        this.levelMusic.volume = this.volume;
        this.levelMusic.loopFull();

        this.bulletSound = this.game.add.audio('bullet');
        this.bulletSound.volume = this.volume;

        this.playerDiedSound = this.game.add.audio('playerDied');
        this.playerDiedSound.onStop.add(this.playerDeathSoundStopped.bind(this));
    }

    setupBullets() {
        this.bullets = [];
    }

    setupCamera() {
        this.game.camera.y = this.map.height * this.map.tileHeight;
    }

    setupKeyboard() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    setupMap() {
        this.tileSprite = this.game.add.tileSprite(0, 0, Geometry.WORLD_WIDTH_IN_PX, 
            Geometry.WORLD_HEIGHT_IN_PX, 'level' + this.levelNum);
        this.game.world.setBounds(0, 0, Geometry.WORLD_WIDTH_IN_PX, Geometry.WORLD_HEIGHT_IN_PX);

        this.map = this.game.add.tilemap();

        let bitmapData = this.game.make.bitmapData(25 * Geometry.TILE_WIDTH_IN_PX, 2 * Geometry.TILE_HEIGHT_IN_PX);

        let colors = Phaser.Color.HSVColorWheel(0.5);
        let i: number = 0;


        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 25; x++) {
                //this.bitmapData.rect(x * TILE_WIDTH_IN_PX, y * TILE_HEIGHT_IN_PX, 
                //    TILE_WIDTH_IN_PX, TILE_HEIGHT_IN_PX, colors[i].rgba);
                i += 6;
            }
        }

        this.map.addTilesetImage('tiles', bitmapData);

        this.layer = this.map.create('layer' + this.levelNum, Geometry.WORLD_WIDTH_IN_TILES, Geometry.WORLD_HEIGHT_IN_TILES, 
            Geometry.TILE_WIDTH_IN_PX, Geometry.TILE_HEIGHT_IN_PX);

        let lines: string[] = this.readFile('assets/maps/Map0' + this.levelNum + '.txt').split('\n');

        this.setupMap_obstacles(lines);
        this.setupMap_enemies(lines);
        this.setupMap_batteries(lines);

        this.map.setCollisionByExclusion([0]);
    }

    setupMap_batteries(lines: string[]) {
        this.batteries = [];

        for (let y: number = 0; y < lines.length; y++) {
            let line: string = lines[y];

            for (let x: number = 0; x < line.length; x++) {
                let char: string = line[x];

                if (char == 'A') {
                    let battery: Battery = new Battery(this, this.layer, x * Geometry.TILE_WIDTH_IN_PX, y * Geometry.TILE_HEIGHT_IN_PX);
                    battery.setup();

                    this.batteries.push(battery);
                }
            }
        }        
    }

    setupMap_enemies(lines: string[]) {
        this.enemies = [];

        let enemyCodes: string = "abcde";

        for (let y: number = 0; y < lines.length; y++) {
            let line: string = lines[y];

            for (let x: number = 0; x < line.length; x++) {
                let char: string = line[x];

                if (enemyCodes.indexOf(char) >= 0) {
                    let enemy: BaseEnemy = EnemyFactory.create(char, this, this.layer, x * Geometry.TILE_WIDTH_IN_PX, y * Geometry.TILE_HEIGHT_IN_PX);
                    enemy.setup();

                    this.enemies.push(enemy);
                }
            }
        }
    }

    setupMap_obstacles(lines: string[]) {
        for (let y = 0; y < lines.length; y++) {
            let line: string = lines[y];
            for (let x = 0; x < line.length; x++) {
                let char: string = line[x];
                if (char == 'X') {
                    this.map.putTile(1, x, y, this.layer);
                }
            }
        }
    }

    setupPlayer() {
        this.player = new Player(this, this.layer, this.cursors, this.PWR_INITAL);
        this.player.setup();
    }

    setupStatusBar() {
        this.statusBar = new StatusBar(this.game, 
            0, this.tileSprite.height - Geometry.STATUSBAR_HEIGHT_IN_PX,
            Geometry.STATUSBAR_WIDTH_IN_PX, Geometry.STATUSBAR_HEIGHT_IN_PX, this.PWR_INITAL);
        this.statusBar.setup();
    }

    //
    // FRAME UPDATE
    //

    update() {
        this.game.debug.text('Bullets: ' + this.bullets.length + ', enemies: ' + this.enemies.length, 32, 32);
        this.game.input.update();
        this.player.update();
        if (this.statusBarNeedsUpdate) {
            this.statusBar.update(this.player.power);
            this.statusBarNeedsUpdate = false;
        };
        this.enemies.forEach((enemy, i) => {
            if (enemy.spriteBody.y > this.game.camera.y + this.game.camera.height + enemy.sprite.height) {
                enemy.sprite.destroy();
                this.enemies.splice(i, 1);
            } else {
                enemy.update();
            }
        });
        this.bullets.forEach((bullet, i) => {
            if (bullet.sprite.position.y + bullet.sprite.height < this.game.camera.y) {
                bullet.sprite.destroy();
                this.bullets.splice(i, 1);
            } else {
                bullet.update();
            }
        });
        this.updateCollisions();
    }

    updateCollisions() {
        // Enemy-Enemy
        for (let i: number = 0; i < this.enemies.length - 1; i++) {
            for (let j: number = i+1; j < this.enemies.length; j++) {
                this.game.physics.arcade.collide(this.enemies[i].sprite, this.enemies[j].sprite);
            }
        }

        // Enemy-Player
        for (let i: number = 0; i < this.enemies.length; i++) {
            this.game.physics.arcade.collide(this.enemies[i].sprite, this.player.sprite, () => {
                this.evtPlayerHit();
                this.enemies[i].sprite.destroy();
                this.enemies.splice(i, 1);
            });
        }

        // Bullet-Enemy
        for (let i: number = 0; i < this.enemies.length; i++) {
            for (let j: number = 0; j < this.bullets.length && this.enemies[i]; j++) {
                this.game.physics.arcade.collide(this.enemies[i].sprite, this.bullets[j].sprite, () => {
                    this.enemies[i].sprite.destroy();
                    this.enemies.splice(i, 1);
                    this.bullets[j].sprite.destroy();
                    this.bullets.splice(j, 1);
                });
            }
        }

        // Player-Battery
        for (let i: number = 0; i < this.batteries.length; i++) {
            this.game.physics.arcade.collide(this.batteries[i].sprite, this.player.sprite, () => {
                    this.batteries[i].sprite.destroy();
                    this.batteries.splice(i, 1);
                    this.player.recharge(this.PWR_INCR_PER_BATTERY);
            });
        }

        let playerPos = this.getPlayerPosition();
        if (playerPos.x > this.game.world.centerX - 30 && playerPos.x < this.game.world.centerX + 30 && playerPos.y < 50) {
            this.goNextLevel();
        }
    }


    //
    // EVENTS from Player
    //

    evtPlayerDied() {
        this.levelMusic.stop();
        this.bulletSound.stop();

        this.playerDiedSound.play();
    }

    evtPlayerFired() {
        let playerBullet: Bullet = new Bullet(this, this.layer);
        playerBullet.setup();
        this.bullets.push(playerBullet);

        this.bulletSound.play();

        this.player.decreasePower(this.PWR_DECR_PER_BULLET);
    }

    evtPlayerHit() {
        this.player.wasHit();
    }

    evtPlayerPowerChanged() {
        this.statusBarNeedsUpdate = true;
    }


    //
    // EVENTS from Bullets
    //

    evtBulletHit(bullet: Bullet, target: any) {
        this.bullets.forEach((b, i) => {
            if (b == bullet) {
                this.bullets.splice(i, 1);
            }
        });
    }


    //
    // MAP SCROLLER
    //

    scrollMap() {
        if (this.player.spriteBody.y + this.player.sprite.height > this.game.camera.y + this.game.camera.height - Geometry.STATUSBAR_HEIGHT_IN_PX
            && (this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown)) {
            this.game.time.events.add(Phaser.Timer.SECOND / 32, this.scrollMap.bind(this));
            return;
        }

        this.game.camera.y -= 1;
    
        if (this.game.camera.y > 0) {
            this.statusBar.moveBy(0, -1);
        }
         
        if (this.player.state instanceof PlayerStateRunning) {
                this.player.walk();
        }

        this.game.time.events.add(Phaser.Timer.SECOND / 32, this.scrollMap.bind(this));
    }

    startMapScroll() {
        this.game.time.events.add(Phaser.Timer.SECOND, this.scrollMap.bind(this));
    }

    //
    // CALLBACKS
    //

    playerDeathSoundStopped(sound: Phaser.Sound) {
        this.game.state.start('gameover');
    }

    //
    // LEVEL CHANGE
    //
    goNextLevel() {
        this.levelMusic.stop();
        this.bulletSound.stop();

        let nextStateName: string;
        if (this.levelNum + 1 <= 3) {
            nextStateName = 'splash' + (this.levelNum + 1);
        }
        else {
            nextStateName = 'theend';
        }

        this.game.state.start(nextStateName);
    }

    //
    // AUXILIARY
    //
    
    getPlayerPosition(): Phaser.Point {
        return this.player.sprite.position;
    }

    readFile(file: string): string {
        let req = new XMLHttpRequest();

        req.open('GET', file, false);
        req.send(null);
        
        let retVal: string = req.responseText;

        return retVal;
    }
}

class Level1 extends BaseLevelState {
    constructor() {
        super();
        this.levelNum = 1;
    }
}

class Level2 extends BaseLevelState {
    constructor() {
        super();
        this.levelNum = 2;
    }
}

class Level3 extends BaseLevelState {
    constructor() {
        super();
        this.levelNum = 3;
    }
}
