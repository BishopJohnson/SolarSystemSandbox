/**
 * 
 */
class Entity {

    /**
     * 
     * 
     * @param {GameEngine} game
     * @param {number} x
     * @param {number} y
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
     * 
     */
    update() {
    }

    /**
     * 
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
 * 
 */
class CelestialBody extends Entity {

    /**
     *
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
     * 
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
     * 
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
     * 
     * 
     * @param {CelestialBody} other The other 
     */
    impact(other) {
        if (Number.isFinite(this.mass + other.mass)) { // Checks if sum of masses is finite

            /* TODO: Determine which new body should be spawned in based on the input bodies.
             */

            if (this.mass >= other.mass) { // Determines which body gains mass
                this.mass += other.mass;
                other.removeFromWorld = true;
            } else {
                other.mass += this.mass;
                this.removeFromWorld = true;
            }
        } else { // Creates a black hole
            if (this.mass >= other.mass) { // Determines where to spawn the black hole
                this.game.addEntity(new BlackHole(this.game, this.x, this.y));
            } else {
                this.game.addEntity(new BlackHole(this.game, other.x, other.y));
            }

            // Marks both bodies for deletion
            this.removeFromWorld = true;
            other.removeFromWorld = true;
        }
    }
}

/**
 * 
 */
class Star extends CelestialBody {

    /**
     *
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
     * 
     */
    draw() {
        super.draw("white", "white"); // Call to super method
    }
}

/**
 * 
 */
class Planet extends CelestialBody {

    /**
     *
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
     * 
     */
    draw() {
        super.draw("orange", "orange"); // Call to super method
    }
}

/**
 * 
 */
class BlackHole extends CelestialBody {

    /**
     * 
     * 
     * @param {GameEngine} game The game engine the black hole is in.
     * @param {number} x The x coordinate of the black hole.
     * @param {number} y The y coordinate of the black hole.
     * @param {number} mass (Optional) The mass of the black hole.
     * @param {number} radius (Optional) The radius of the black hole.
     */
    constructor(game, x, y, mass = Infinity, radius = 20) {
        super(game, x, y, mass, radius, BLACK_HOLE); // Call to super constructor
    }

    /**
     * 
     */
    draw() {
        super.draw("red", "white"); // Call to super method
    }
}
