interface IStatusBar {
    flash();
    moveBy(offsetX: number, offsetY: number);
}

class StatusBar implements IStatusBar {
    game: Phaser.Game;

    powerBar: Phaser.Graphics;
    powerText: Phaser.BitmapText;
    
    fullScale: number;

    x: number;
    y: number;
    w: number;
    h: number;

    constructor(game: Phaser.Game, x: number, y: number, w: number, h: number, fullScale: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.fullScale = fullScale;
    }

    setup() {
        this.powerBar = this.game.add.graphics(0, 0);
        this.powerText = UI.addText(this.game, this.x + 4, this.y + (this.h - Geometry.BITMAP_FONT_SIZE)/2, 'POWER');
    }

    update(level: number) {
        let barPos: Phaser.Point = new Phaser.Point(this.powerText.right + 10, this.y);

        this.powerBar.beginFill(0);
        this.powerBar.lineStyle(2, UI.COLOR_BLACK, 1);
        this.powerBar.drawRect(0, barPos.y, Geometry.GAME_WIDTH_IN_PX, Geometry.STATUSBAR_HEIGHT_IN_PX);
        this.powerBar.endFill();

        this.powerBar.lineStyle(2, UI.COLOR_WHITE, 2);
        this.powerBar.drawRect(barPos.x, barPos.y, Geometry.GAME_WIDTH_IN_PX - barPos.x - 1, 
            Geometry.STATUSBAR_HEIGHT_IN_PX - 1);

        let color: number = 0;

        if (level > 0.75 * this.fullScale) {
            color = UI.COLOR_GREEN;    
        } else if (level > 0.35 * this.fullScale) {
            color = UI.COLOR_BLUE;
        } else {
            color = UI.COLOR_RED;
        }

        this.powerBar.beginFill(color);
        this.powerBar.lineStyle(2, UI.COLOR_WHITE, 0);
        this.powerBar.drawRect(barPos.x + 1, barPos.y + 1, 
            (level / this.fullScale) * (Geometry.GAME_WIDTH_IN_PX - barPos.x - 3), 
            Geometry.STATUSBAR_HEIGHT_IN_PX - 3);
        this.powerBar.endFill();
    }

    //
    // INTERFACE IStatusBar
    // 

    flash() {

    }

    moveBy(offsetX: number, offsetY: number) {
        this.powerText.position.add(offsetX, offsetY);
        this.powerBar.position.add(offsetX, offsetY);
    }
}