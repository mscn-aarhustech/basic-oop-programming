class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    subtract(v)  {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    multiply(s) {
        return new Vector2(this.x * s, this.y * s);
    }
    divide(s) {
        return new Vector2(this.x / s, this.y / s);
    }
}

class Planet {
    constructor(posx, posy, mass = 1.0) {
       this.position = new Vector2(posx, posy);
       this.velocity = new Vector2();
       this.force = new Vector2();
       this.mass = mass;
       this.density = 0.5;
       this.radius = Math.sqrt(this.mass / (this.density * Math.PI));
       const r = Math.floor(Math.random() * 256);
       const g = Math.floor(Math.random() * 256);
       const b = Math.floor(Math.random() * 256);
       this.color = `rgb(${r}, ${g}, ${b})`;

       // Add dummy properties to bloat the class
       // This prevents a class instances from fitting into the cache and forces heap allocation
        for (let i = 0; i < 10; i++) {
            this[`dummy_property_${i}`] = Math.random();
        }
    }
}

class World {
    constructor(width, height, numPlanets) {
        this.width = width;
        this.height = height;
        this.gravitationalConst = 10.0;
        this.timeStep = 0.01;
        this.planets = [];
        for(let p = 0; p < numPlanets; p++) {
            const planet = new Planet(Math.random() * this.width, Math.random() * this.height, 10 + Math.random() * 90);
            this.planets.push(planet);
        }
    }
    run() {
        this.calculateGravity();
        this.integrate();
        //this.render();
        //requestAnimationFrame(() => this.run());
    }
    calculateGravity() {
        for(let i = 0; i < this.planets.length - 1; i++) {
            for(let j = i + 1; j < this.planets.length; j++) {
                const planet_i = this.planets[i];
                const planet_j = this.planets[j];
                
                const distanceVector = new Vector2(
                    planet_j.position.x - planet_i.position.x, 
                    planet_j.position.y - planet_i.position.y
                );

                const distanceSquared = distanceVector.x * distanceVector.x + distanceVector.y * distanceVector.y;

                const sumRadiiSquared = (planet_i.radius + planet_j.radius) ** 2;

                if(distanceSquared < sumRadiiSquared) { continue };

                const distance = Math.sqrt(distanceSquared);

                const unitVector = distanceVector.divide(distance);

                const gravityForce = (this.gravitationalConst * planet_i.mass * planet_j.mass) / distanceSquared;

                const forceVector = unitVector.multiply(gravityForce);

                planet_i.force = planet_i.force.add(forceVector);
                planet_j.force = planet_j.force.subtract(forceVector);
            }
        }
    }
    integrate() {
        for(let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];

            planet.velocity = planet.velocity.add(planet.force.divide(planet.mass).multiply(this.timeStep));
            planet.position = planet.position.add(planet.velocity.multiply(this.timeStep));

            planet.force = new Vector2();
        }
    }
    render() {
        // Clear screen
        context.resetTransform();
        //ctx.fillStyle = "rgb(32,96,32)";
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        for(let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            context.fillStyle = planet.color;
            context.beginPath();
			context.arc(planet.position.x, planet.position.y, planet.radius, 0, Math.PI * 2);
			context.fill();
			context.closePath();
        }

        requestAnimationFrame(() => this.render());
    }
}

let canvas = document.querySelector("#simulationCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let context = canvas.getContext("2d");

const world = new World(canvas.width, canvas.height, 1000);

console.log(world);

requestAnimationFrame(() => world.render());
setInterval(() => world.run(), 0);
