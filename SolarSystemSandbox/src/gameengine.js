// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        //console.log(getXandY(e));
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        //console.log(getXandY(e));
        that.click = getXandY(e);
    }, false);
    /*
    this.ctx.canvas.addEventListener("wheel", function (e) {
        //console.log(getXandY(e));
        that.wheel = e;
        //console.log(e.wheelDelta);
        e.preventDefault();
    }, false);*/

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        //console.log(getXandY(e));
        that.rightclick = getXandY(e);
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    //console.log('added entity');

    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        //this.entities[i].draw(this.ctx);
        this.entities[i].draw();
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

/**
 * Saves the current game state.
 * 
 * @return {string} The data of the current save state.
 */
GameEngine.prototype.save = function () {
    var data = [];

    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];

        if (entity instanceof Entity) { // Checks if entity inherits from Entity class
            data.push(entity.save());
        }
    }

    return data.join();
}

/**
 * Loads a game state using imported data.
 * 
 * @param {string} data The data being loaded.
 */
GameEngine.prototype.load = function (data) {
    this.entities = []; // Clears entities
    this.addEntity(new Background(this));

    var array = data.split(","); // Array with entity data

    for (var i = 0; i < array.length; i++) {
        var tag = Number(array[i++]);                                      // tag
        var x = Number(array[i++]);                                        // x
        var y = Number(array[i++]);                                        // y
        var velocity = new Vector(Number(array[i++]), Number(array[i++])); // velocity
        var mass = Number(array[i++]);                                     // mass
        var radius = Number(array[i]);                                     // radius

        let constr; // The constructor
        switch (tag) { // Determines which type of constructor is needed
            case STAR:
                constr = Star;
                break;
            case TERRESTRIAL_PLANET:
                constr = Planet;
                break;
            case BLACK_HOLE:
                constr = BlackHole;
                break;
            default:
                throw "Could not determine object type!";
        }

        // Creates the Entity and adds it to the game
        var entity = new constr(this, x, y, mass, radius);
        entity.velocity = velocity;

        this.addEntity(entity);
    }
}

/**
 * A 2D Vector class
 */
class Vector {

    /**
     * The constructor for the Vector.
     * 
     * @param {number} x (Optional) The vector in the x direction. Default is 0.
     * @param {number} y (Optional) The vector in the y direction. Default is 0.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Converts the Vector into a string.
     * 
     * @return {string} The Vector in string format.
     */
    toString() {
        return this.x + "," + this.y;
    }

    /**
     * Determines the magnitude of this Vector.
     * 
     * @return {number} The magnitude of the Vector.
     */
    magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));;
    }

    /**
     * Produces a normalized Vector in the same direction as this Vector.
     * 
     * <p>Normalized vectors have a magnitude of 1.</p>
     * 
     * @return {Vector} The normalized Vector.
     */
    normalize() {
        var magnitude = this.magnitude();

        var nx = this.x * Math.pow(magnitude, -1);
        var ny = this.y * Math.pow(magnitude, -1);

        return new Vector(nx, ny);
    }

    /**
     * Adds another Vector to this Vector and returns the new Vector.
     * 
     * @param {Vector} other The other Vector.
     * @return {Vector} The resulting Vector.
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Multiplies the scalar to this Vector and returns the new Vector.
     * 
     * @param {number} scalar The scalar.
     * @return {Vector} The resulting Vector.
     */
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
}

/**
 * A circle Collider for collision between bodies.
 */
class Collider {

    /**
     * The constructor for the Collider.
     * 
     * @param {number} x The x position of the collider.
     * @param {number} y The y position of the collider.
     * @param {number} radius The radius of the collider.
     * @param {number} tag (Optional) The tag of the collider. Default is EMPTY value.
     */
    constructor(x, y, radius, tag = EMPTY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    /**
     * Checks if a collision occured between this collider and another collider.
     * 
     * @param {Collider} other The other Collider.
     * @return {tag: string, collided: boolean} Returns a tag and a boolean with the result of the collision check.
     */
    collide(other) {
        var collision = { tag: EMPTY, collided: false };

        if (other) { // Asserts other is defined

            // Gets the distance between the two colliders
            var dx = this.x - other.x;
            var dy = this.y - other.y;
            var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            if (this.radius + other.radius >= distance) // Checks if colliders collided with each other
                collision.collided = true;

            if (collision.collided) // Sets tag
                collision.tag = other.tag;
        }

        return collision;
    }
}
