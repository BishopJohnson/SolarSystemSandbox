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

function startSystem(game) {
    game.entities = []; // Clears entities array

    // Adds background
    game.addEntity(new Background(game, AM.getAsset("./SolarSystemSandbox/img/Background.png")));

    var starone = new Star(game, 350, 350);
    game.addEntity(starone);
    starone.velocity = new Vector(0, -0.4);

    var startwo = new Star(game, 480, 350, 5000, 20);
    game.addEntity(startwo);
    startwo.velocity = new Vector(0, 0.8);

    var planetone = new Planet(game, 550, 350);
    game.addEntity(planetone);
    planetone.velocity = new Vector(0, -1.2);

    var planettwo = new Planet(game, 100, 200, 8, 8);
    game.addEntity(planettwo);
    planettwo.velocity = new Vector(-1.5, 2.5);

    var planetthree = new Planet(game, 200, 200, 10, 4);
    game.addEntity(planetthree);
    planetthree.velocity = new Vector(-1.5, 1.5);

    var planetthree = new Planet(game, 100, 600, 1, 2);
    game.addEntity(planetthree);
    planetthree.velocity = new Vector(1, 1);
};

// Main code begins here

var AM = new AssetManager();

AM.queueDownload("./SolarSystemSandbox/img/Background.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    const restartbtn = document.getElementById("restart_btn");
    const blkholebtn = document.getElementById("blkhole_btn");

    //ctx.imageSmoothingEnabled = false; //disables pixel smoothing

    var gameEngine = new GameEngine();

    gameEngine.init(ctx);
    gameEngine.start();

    restartbtn.addEventListener('click', function (e) {
        startSystem(gameEngine);
    });

    blkholebtn.addEventListener('click', function (e) {
        var blackhole = new BlackHole(gameEngine, 100, 100);
        gameEngine.addEntity(blackhole);
    });

    startSystem(gameEngine);

    console.log("All Done!");
});
