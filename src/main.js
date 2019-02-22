function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y);
};

Background.prototype.update = function () {
};

// Main code begins here

var AM = new AssetManager();

AM.queueDownload("./img/Background.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    //ctx.imageSmoothingEnabled = false; //disables pixel smoothing

    var gameEngine = new GameEngine();

    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/Background.png")));

    var star = new Star(gameEngine, 400, 350);
    gameEngine.addEntity(star);

    var planet = new Planet(gameEngine, 700, 600);
    gameEngine.addEntity(planet);

    /*
    var blackhole = new BlackHole(gameEngine, 100, 100);
    gameEngine.addEntity(blackhole);
    */

    console.log("All Done!");
});
