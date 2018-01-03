/// <reference path="../characters/Player.ts"/>
/// <reference path="../characters/Bullet.ts"/>
/// <reference path="../characters/Enemy.ts"/>
/// <reference path="../characters/Battery.ts"/>
/// <reference path="../states/GameOverState.ts"/>



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

    powerBar: Phaser.Graphics;
    powerText: Phaser.BitmapText;
    
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
        this.powerBar = this.game.add.graphics(0, 0);
        this.powerText = this.addText(0, this.game.camera.y / 16 + 30.25, "POWER");
    }

    //
    // FRAME UPDATE
    //

    update() {
        this.game.input.update();
        this.player.update();
        this.updateStatusBar();
        this.enemies.forEach(enemy => {
            enemy.update();
        })
        this.bullets.forEach(bullet => {
            bullet.update();
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
            for (let j: number = 0; j < this.bullets.length; j++) {
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
    }

    updateStatusBar() {
        //return;
        if (! this.statusBarNeedsUpdate) {
            return;
        }

        let COLOR_WHITE: number = Phaser.Color.createColor(255, 255, 255).color;

        this.statusBarNeedsUpdate = false;

        let barPos: Phaser.Point = new Phaser.Point(this.powerText.width + 10, 
            this.tileSprite.height - Geometry.STATUSBAR_HEIGHT_IN_PX);

        this.powerBar.beginFill(0);
        this.powerBar.lineStyle(2, 0, 1);
        this.powerBar.drawRect(0, barPos.y, Geometry.GAME_WIDTH_IN_PX, Geometry.STATUSBAR_HEIGHT_IN_PX);
        this.powerBar.endFill();

        this.powerBar.lineStyle(2, COLOR_WHITE, 2);
        this.powerBar.drawRect(barPos.x, barPos.y, Geometry.GAME_WIDTH_IN_PX - barPos.x - 1, 
            Geometry.STATUSBAR_HEIGHT_IN_PX - 1);

        let color: number = 0;

        if (this.player.power > 0.75 * this.PWR_INITAL) {
            color = 0x00ff00;    
        } else if (this.player.power > 0.35 * this.PWR_INITAL) {
            color = 0x0000ff;
        } else {
            color = 0xff0000;
        }

        this.powerBar.beginFill(color);
        this.powerBar.lineStyle(2, COLOR_WHITE, 0);
        this.powerBar.drawRect(barPos.x + 1, barPos.y + 1, 
            (this.player.power / this.PWR_INITAL) * (Geometry.GAME_WIDTH_IN_PX - barPos.x - 3), 
            Geometry.STATUSBAR_HEIGHT_IN_PX - 3);
        this.powerBar.endFill();
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
        this.game.camera.y -= 1;
    
        if (this.game.camera.y > 0) {
            this.powerText.position.y -= 1;
            this.powerBar.position.y -= 1;
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
