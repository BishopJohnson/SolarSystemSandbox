/**
 * Entity to be placed in the game world.
 */
class Entity {

    /**
     * The constructor for the Entity.
     * 
     * @param {GameEngine} game The game engine.
     * @param {number} x The x position of the entity.
     * @param {number} y The y position of the entity.
     */
    constructor(game, x, y) {
        this.game = game;
        this.ctx = game.ctx;
        this.x = x;
        this.y = y;
        this.velocity = new Vector();
        this.removeFromWorld = false;
    }

    /**
     * Returns the attributes that are necessary for the Entity.
     * 
     * @return {string} The relavent attributes that make up the Entity.
     */
    save() {
        var data = [];

        data.push(this.x);
        data.push(this.y);
        data.push(this.velocity.toString());

        return data.join();
    }

    /**
     * Update method of the Entity.
     */
    update() {
    }

    /**
     * Draw method of the Entity.
     */
    draw() {
        if (this.game.showOutlines && this.radius) {
            this.game.ctx.beginPath();
            this.game.ctx.strokeStyle = "green";
            this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
        }
    }

    /**
     * 
     * 
     * @param {any} image
     * @param {any} angle
     */
    rotateAndCache(image, angle) {
        var offscreenCanvas = document.createElement('canvas');
        var size = Math.max(image.width, image.height);
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        var offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.save();
        offscreenCtx.translate(size / 2, size / 2);
        offscreenCtx.rotate(angle);
        offscreenCtx.translate(0, 0);
        offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
        offscreenCtx.restore();
        //offscreenCtx.strokeStyle = "red";
        //offscreenCtx.strokeRect(0,0,size,size);
        return offscreenCanvas;
    }
}

/**
 * Class for CelestialBody that interact in the simulation with other bodies.
 */
class CelestialBody extends Entity {

    /**
     * The constructor for the CelestialBody.
     * 
     * @param {GameEngine} game The game engine the body is in.
     * @param {number} x The x coordinate of the body.
     * @param {number} y The y coordinate of the body.
     * @param {number} mass (Optional) The mass of the body.
     * @param {number} radius (Optional) The radius of the body.
     * @param {number} tag (Optional)
     */
    constructor(game, x, y, mass, radius, tag = EMPTY) {
        super(game, x, y); // Call to super constructor

        this.mass = mass;
        this.radius = radius;
        this.collider = new Collider(x, y, radius, tag);
    }

    /**
     * Returns the attributes that are necessary for the CelestialBody.
     * 
     * @return {string} The relavent attributes that make up the body.
     */
    save() {
        var data = [];

        data.push(super.save()); // Gets super save data
        data.push(this.mass);
        data.push(this.radius);

        return data.join();
    }

    /**
     * Update method of the CelestialBody.
     * 
     * <p>Pulls other bodies towards it and checks for impacts.</p>
     */
    update() {
        if (!this.removeFromWorld) { // Checks if body is marked for deletion
            super.update(); // Call to super method;

            // Updates position
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // Updates collider
            this.updateCollider();

            // Iterates over game entities to check for collision
            for (var i = 0; i < this.game.entities.length; i++) {
                var entity = this.game.entities[i];

                if (entity instanceof CelestialBody && !entity.removeFromWorld) { // Checks if entity uses CelestialBody class and is not marked for removal
                    var collision = this.collider.collide(entity.collider);

                    if (this !== entity && collision.collided) { // Checks if a collision occured
                        this.impact(entity);
                    } else if (this !== entity) { // Pulls objects together
                        var dx = this.x + entity.x;
                        var dy = this.y + entity.y;
                        var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                        // The force of the pull from the other body
                        var force = (/*G * */entity.mass) / Math.pow(distance, 2);

                        // The direction towards the other body to pull to
                        var direction = new Vector(entity.x - this.x, entity.y - this.y).normalize();

                        // The pull
                        var pull = direction.multiply(force);

                        // Updates velocity
                        this.velocity.x += pull.x;
                        this.velocity.y += pull.y
                    }
                }
            }
        }
    }

    /**
     * Updates the collider with the new position and radius.
     */
    updateCollider() {
        this.collider = new Collider(this.x, this.y, this.radius, this.collider.tag);
    }

    /**
     * Draws the body with a fill and outline.
     * 
     * @param {string} fillColor The fill color of the body. Default is white.
     * @param {string} strokeColor The outline color of the body. Default is white.
     */
    draw(fillStyle = "white", strokeStyle = "white") {
        super.draw(); // Call to super method

        this.game.ctx.fillStyle = fillStyle;
        this.game.ctx.strokeStyle = strokeStyle;

        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

        this.game.ctx.fill();
        this.game.ctx.stroke();

        if (this.game.showOutlines) { // Draws bounding box for debugging
            this.game.ctx.strokeStyle = "green";

            this.game.ctx.beginPath();
            this.game.ctx.arc(this.collider.x, this.collider.y, this.collider.radius, 0, 2 * Math.PI);
            this.game.ctx.stroke();
        }
    }

    /**
     * Calculates the volume of a celestial body.
     * 
     * @return {number} The volume of the body.
     */
    volume() {
        return (4 / 3) * Math.PI * Math.pow(radius, 3); // 4/3 * PI * r^3
    }

    /**
     * Calculates the density of a celestial body.
     * 
     * @return {number} The density of the body.
     */
    density() {
        return this.mass / this.volume;
    }

    /**
     * Simulates an impact event between two bodies.
     * 
     * @param {CelestialBody} other The other body in the impact.
     */
    impact(other) {
        if (other && !other.removeFromWorld) { // Asserts other is defined and not marked for deletion
            var direction = new Vector(this.x - other.x, this.y - other.y).normalize(); // The direction the force is applied against this body

            let force;

            if (Number.isFinite(this.mass + other.mass)) { // Checks if sum of masses is finite

                /* TODO: Determine which new body should be spawned in based on the input bodies.
                 */

                if (this.mass >= other.mass) { // Determines which body gains mass
                    this.mass += other.mass;
                    //force = other.mass * ;

                    other.removeFromWorld = true;
                } else {
                    other.mass += this.mass;
                    /*other.velocity = */

                    this.removeFromWorld = true;
                }
            } else { // Creates a black hole
                let blackhole;

                if (this.mass >= other.mass) { // Determines where to spawn the black hole
                    blackhole = new BlackHole(this.game, this.x, this.y);
                    this.game.addEntity(blackhole);
                } else {
                    blackhole = new BlackHole(this.game, other.x, other.y);
                    this.game.addEntity(blackhole);
                }

                /*blackhole.velocity = */

                // Marks both bodies for deletion
                this.removeFromWorld = true;
                other.removeFromWorld = true;
            }
        }
    }
}

/**
 * Large body with a lot of mass.
 */
class Star extends CelestialBody {

    /**
     * The constructor for the Star.
     * 
     * @param {GameEngine} game The game engine the star is in.
     * @param {number} x The x coordinate of the star.
     * @param {number} y The y coordinate of the star.
     * @param {number} mass (Optional) The mass of the star.
     * @param {number} radius (Optional) The radius of the star.
     */
    constructor(game, x, y, mass = 10000, radius = 40) {
        super(game, x, y, mass, radius, STAR); // Call to super constructor
    }

    /**
     * Returns the attributes that are necessary for the Star.
     * 
     * @return {string} The relavent attributes that make up the Star.
     */
    save() {
        var data = [];

        data.push(STAR); // Saves the tag
        data.push(super.save()); // Gets super save data

        return data.join();
    }

    /**
     * Draw method for the Star.
     */
    draw() {
        super.draw("white", "white"); // Call to super method
    }
}

/**
 * Small body with not a lot of mass.
 */
class Planet extends CelestialBody {

    /**
     * The constructor for the Planet.
     * 
     * @param {GameEngine} game The game engine the planet is in.
     * @param {number} x The x coordinate of the planet.
     * @param {number} y The y coordinate of the planet.
     * @param {number} mass (Optional) The mass of the planet.
     * @param {number} radius (Optional) The radius of the planet.
     */
    constructor(game, x, y, mass = 4, radius = 4) {
        super(game, x, y, mass, radius, TERRESTRIAL_PLANET); // Call to super constructor
    }

    /**
     * Returns the attributes that are necessary for the Planet.
     * 
     * @return {string} The relavent attributes that make up the Planet.
     */
    save() {
        var data = [];

        data.push(TERRESTRIAL_PLANET); // Saves the tag
        data.push(super.save()); // Gets super save data

        return data.join();
    }

    /**
     * Draw method for the Planet.
     */
    draw() {
        super.draw("orange", "orange"); // Call to super method
    }
}

/**
 * Small body with an extreme amount of mass.
 */
class BlackHole extends CelestialBody {

    /**
     * The constructor for the BlackHole.
     * 
     * @param {GameEngine} game The game engine the black hole is in.
     * @param {number} x The x coordinate of the black hole.
     * @param {number} y The y coordinate of the black hole.
     * @param {number} mass (Optional) The mass of the black hole.
     * @param {number} radius (Optional) The radius of the black hole.
     */
    constructor(game, x, y, mass = 100000/* Infinity */, radius = 10) {
        super(game, x, y, mass, radius, BLACK_HOLE); // Call to super constructor
    }

    /**
     * Returns the attributes that are necessary for the BlackHole.
     * 
     * @return {string} The relavent attributes that make up the BlackHole.
     */
    save() {
        var data = [];

        data.push(BLACK_HOLE); // Saves the tag
        data.push(super.save()); // Gets super save data

        return data.join();
    }

    /**
     * Draw method for the BlackHole.
     */
    draw() {
        super.draw("black", "white"); // Call to super method
    }
}
