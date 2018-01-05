class UI {
    static COLOR_WHITE: number = Phaser.Color.createColor(255, 255, 255).color;
    static COLOR_BLACK: number = Phaser.Color.createColor(0, 0, 0).color;
    static COLOR_GREEN: number = Phaser.Color.createColor(0, 255, 0).color;
    static COLOR_BLUE: number  = Phaser.Color.createColor(0, 0, 255).color;
    static COLOR_RED: number  = Phaser.Color.createColor(255, 0, 0).color;
  

    static addText(game: Phaser.Game, x: number, y: number, text: string): Phaser.BitmapText {
        return game.add.bitmapText(x, y, 'bitmapfont', text, Geometry.BITMAP_FONT_SIZE);
    }
}