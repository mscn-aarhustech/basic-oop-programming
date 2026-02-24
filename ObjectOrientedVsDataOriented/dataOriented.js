
class Planets {
    constructor(maxObjects) {
        
        this.maxObjects = maxObjects;

        this.positionX = new Float32Array(maxObjects);
        this.positionY = new Float32Array(maxObjects);
        this.velocityX = new Float32Array(maxObjects);
        this.velocityY = new Float32Array(maxObjects);
        this.forceX = new Float32Array(maxObjects);
        this.forceY = new Float32Array(maxObjects);
        this.mass = new Float32Array(maxObjects);
        this.density = new Float32Array(maxObjects);
        this.radius = new Float32Array(maxObjects);
        this.color = new Uint8Array(maxObjects * 3);

        // for (let i = 0; i < 100; i++) {
        //     this[`dummy_property_${i}`] = new Float32Array(maxObjects);
        // }
    }
}

class World {
    constructor(width, height, numPlanets) {
        this.width = width;
        this.height = height;
        this.gravitationalConst = 10.0;
        this.timeStep = 0.01;
        this.planets = new Planets(numPlanets);

        for(let i = 0; i < numPlanets; i++) {
            this.planets.positionX[i] = Math.random() * this.width;
            this.planets.positionY[i] = Math.random() * this.height;
            this.planets.mass[i] = 10 + Math.random() * 90;
            this.planets.density[i] = 0.5;
            this.planets.radius[i] = Math.sqrt(this.planets.mass[i] / (this.planets.density[i] * Math.PI));
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            this.planets.color[i * 3] = r;
            this.planets.color[i * 3 + 1] = g;
            this.planets.color[i * 3 + 2] = b;
        }
    }
    run() {
        this.calculateGravity();
        this.integrate();
        //this.render();
        //requestAnimationFrame(() => this.run());
    }
    calculateGravity() {
        
        for(let i = 0; i < this.planets.maxObjects - 1; i++) {
            for(let j = i + 1; j < this.planets.maxObjects; j++) {

                const distanceX = this.planets.positionX[j] - this.planets.positionX[i];
                const distanceY = this.planets.positionY[j] - this.planets.positionY[i];

                const distanceSquared = distanceX * distanceX + distanceY * distanceY;

                const sumRadiiSquared = (this.planets.radius[i] + this.planets.radius[j]) ** 2;

                if(distanceSquared < sumRadiiSquared) { continue };

                const distance = Math.sqrt(distanceSquared);

                const unitX = distanceX / distance;
                const unitY = distanceY / distance;

                const gravityForce = (this.gravitationalConst * this.planets.mass[i] * this.planets.mass[j]) / distanceSquared;

                this.planets.forceX[i] += gravityForce * unitX;
                this.planets.forceY[i] += gravityForce * unitY;
                this.planets.forceX[j] -= gravityForce * unitX;
                this.planets.forceY[j] -= gravityForce * unitY;
            }
        }
    }
    integrate() {
        for(let i = 0; i < this.planets.maxObjects; i++) {

            this.planets.velocityX[i] += (this.planets.forceX[i] / this.planets.mass[i]) * this.timeStep;
            this.planets.velocityY[i] += (this.planets.forceY[i] / this.planets.mass[i]) * this.timeStep;

            this.planets.positionX[i] += this.planets.velocityX[i] * this.timeStep;
            this.planets.positionY[i] += this.planets.velocityY[i] * this.timeStep;

            this.planets.forceX[i] = 0.0;
            this.planets.forceY[i] = 0.0;
        }
    }
    render() {
        
        // Clear screen
        context.resetTransform();
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Render planets
        for(let i = 0; i < this.planets.maxObjects; i++) {
            context.fillStyle = `rgb(${this.planets.color[i * 3]}, ${this.planets.color[i * 3 + 1]}, ${this.planets.color[i * 3 + 2]})`;
            context.beginPath();
			context.arc(this.planets.positionX[i], this.planets.positionY[i], this.planets.radius[i], 0, Math.PI * 2);
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