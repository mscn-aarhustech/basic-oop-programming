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

        // for (let i = 0; i < 30; i++) {
        //     this[`dummy_property_${i}`] = Math.random(); //new Float32Array(maxObjects);
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
            this.planets.density[i] = 2.0;
            this.planets.radius[i] = Math.sqrt(this.planets.mass[i] / (this.planets.density[i] * Math.PI));
            const r = 64 + Math.floor(Math.random() * 192);
            const g = 64 + Math.floor(Math.random() * 192);
            const b = 64 + Math.floor(Math.random() * 192);
            this.planets.color[i * 3] = r;
            this.planets.color[i * 3 + 1] = g;
            this.planets.color[i * 3 + 2] = b;
        }
    }
    run() {
        let startTime = performance.now();

        this.calculateGravity();
        this.integrate();

        let endTime = performance.now();
        timeSum += endTime - startTime;
        timeFrames++;

        if (timeSum > 100) {
            timeSum /= timeFrames;
            document.getElementById("ms").innerHTML = timeSum.toFixed(3) + " ms";
            timeFrames = 0;
            timeSum = 0;
        }
    }
    calculateGravity() {
        
        const n = this.planets.maxObjects;
        const G = this.gravitationalConst;

        for(let i = 0; i < n - 1; i++) {
            
            const iPosX = this.planets.positionX[i];
            const iPosY = this.planets.positionY[i];
            const iMass = this.planets.mass[i];
            const iRadius = this.planets.radius[i];
            // let iForceX = this.planets.forceX[i];
            // let iForceY = this.planets.forceY[i];

            for(let j = i + 1; j < n; j++) {
                const distanceX = this.planets.positionX[j] - iPosX;
                const distanceY = this.planets.positionY[j] - iPosY;

                const distanceSquared = distanceX * distanceX + distanceY * distanceY;

                const sumRadii = iRadius + this.planets.radius[j];
                const sumRadiiSquared = sumRadii * sumRadii;

                if(distanceSquared < sumRadiiSquared * 0.5) { continue; }
                //if(distanceSquared < 2.0) { continue; }

                const distance = Math.sqrt(distanceSquared);

                const unitX = distanceX / distance;
                const unitY = distanceY / distance;

                const gravityForce = (G * iMass * this.planets.mass[j]) / distanceSquared;
                const fx = gravityForce * unitX;
                const fy = gravityForce * unitY;

                // iForceX += fx;
                // iForceY += fy;

                this.planets.forceX[i] += fx;
                this.planets.forceY[i] += fy;

                this.planets.forceX[j] -= fx;
                this.planets.forceY[j] -= fy;
            }
            
            // this.planets.forceX[i] += iForceX;
            // this.planets.forceY[i] += iForceY;
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

const ms = document.createElement('ms');
ms.id = 'ms';
document.body.appendChild(ms);
const content = document.createElement('div');
document.body.appendChild(content);
content.innerHTML = '<canvas id="simulationCanvas"></canvas>';

// canvas
canvas = document.querySelector("#simulationCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let context = canvas.getContext("2d");

let timeFrames = 0;
let timeSum = 0;
let iterations = 0;

const world = new World(canvas.width, canvas.height, 1000);
console.log(world);

requestAnimationFrame(() => world.render());
setInterval(() => world.run(), 0);