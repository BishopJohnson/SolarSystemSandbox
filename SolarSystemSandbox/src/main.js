function Background(game, spritesheet = AM.getAsset("./SolarSystemSandbox/img/Background.png")) {
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

AM.queueDownload("./SolarSystemSandbox/img/Background.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var socket = io.connect("http://24.16.255.56:8888"); // Connects to the server
    const restartbtn = document.getElementById("restart_btn");
    const blkholebtn = document.getElementById("blkhole_btn");

    var gameEngine = new GameEngine();

    gameEngine.init(ctx);
    gameEngine.start();
    
    socket.on("load", function (data) { // Displays data loaded
        console.log(data);

        gameEngine.load(data.data);
    });

    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");

    saveButton.onclick = function () { // Save button functionality
        console.log("save");
        text.innerHTML = "Saved.";

        socket.emit("save", { studentname: "Bishop Johnson", statename: "aState", data: gameEngine.save() }); // Data for PUT request
    };

    loadButton.onclick = function () { // Load button functionality
        console.log("load");
        text.innerHTML = "Loaded.";
        socket.emit("load", { studentname: "Bishop Johnson", statename: "aState" }); // Parameters for GET request
    };
    
    restartbtn.addEventListener('click', function (e) { // Reset button functionality
        system.start();
    });

    blkholebtn.addEventListener('click', function (e) { // Blackhole button functionality
        gameEngine.addEntity(new BlackHole(gameEngine, 100, 100));
    });

    //let system = new UnarySystem(gameEngine, background);
    let system = new BinarySystem(gameEngine);

    console.log("All Done!");
});
