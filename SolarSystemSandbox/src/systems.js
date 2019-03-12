/**
 * 
 */
class System {

    /**
     * 
     * 
     * @param {GameEngine} game
     * @param {string} background
     */
    constructor(game) {
        this.game = game;
        this.background = AM.getAsset("./SolarSystemSandbox/img/Background.png");

        this.start();
    }

    /**
     * 
     */
    start() {
        this.game.entities = [];

        // Adds background
        this.game.addEntity(new Background(this.game, this.background));
    }
}

/**
 * 
 */
class BinarySystem extends System {

    /**
     * 
     * 
     * @param {GameEngine} game
     * @param {string} background
     */
    constructor(game) {
        super(game); // Call to super constructor
    }

    /**
     * 
     */
    start() {
        super.start();

        var starone = new Star(this.game, 350, 350);
        this.game.addEntity(starone);
        starone.velocity = new Vector(0, -0.4);

        var startwo = new Star(this.game, 480, 350, 5000, 20);
        this.game.addEntity(startwo);
        startwo.velocity = new Vector(0, 0.8);

        var planetone = new Planet(this.game, 550, 350);
        this.game.addEntity(planetone);
        planetone.velocity = new Vector(0, -1.2);

        var planettwo = new Planet(this.game, 100, 200, 8, 8);
        this.game.addEntity(planettwo);
        planettwo.velocity = new Vector(-1.5, 2.5);

        var planetthree = new Planet(this.game, 200, 200, 10, 4);
        this.game.addEntity(planetthree);
        planetthree.velocity = new Vector(-1.5, 1.5);

        var planetthree = new Planet(this.game, 100, 600, 1, 2);
        this.game.addEntity(planetthree);
        planetthree.velocity = new Vector(1, 1);
    }
}

/**
 * 
 */
class UnarySystem extends System {

    /**
     * 
     * 
     * @param {GameEngine} game
     * @param {string} background
     */
    constructor(game) {
        super(game); // Call to super constructor
    }

    /**
     * 
     */
    start() {
        super.start();

        var star = new Star(this.game, 400, 350);
        this.game.addEntity(star);
        
        var planetone = new Planet(this.game, 200, 350);
        this.game.addEntity(planetone);
        planetone.velocity = new Vector(0, 1.0);
        
        var planettwo = new Planet(this.game, 100, 200, 100, 10);
        this.game.addEntity(planettwo);
        planettwo.velocity = new Vector(-1.2, 1.2);
        /*
        var planetthree = new Planet(this.game, 200, 200, 10, 4);
        this.game.addEntity(planetthree);
        planetthree.velocity = new Vector(-1.5, 1.5);

        var planetthree = new Planet(this.game, 100, 600, 1, 2);
        this.game.addEntity(planetthree);
        planetthree.velocity = new Vector(1, 1);
        */
    }
}
