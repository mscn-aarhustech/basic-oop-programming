// OOP
class Vehicle {
    #serialNumber;
    constructor(serialNumber) {
        if (this.constructor === Vehicle) {
            throw new Error("Can't instantiate abstract class!")
        }
        this.#serialNumber = serialNumber;
    }
    makeSound() {
        throw new Error("Can't call abstract method!");
    }
}

class Boat extends Vehicle {
    constructor(serialNumber) {
        super(serialNumber) 
    }
    makeSound() {
        return "Vrrooommm! Splash!";
    }
}

class Airplane extends Vehicle {
    constructor(serialNumber) {
        super(serialNumber) 
    }
    makeSound() {
        return "Brrrrr!! Swoosh!";
    }
}

//const vehicle = new Vehicle(42); // Error
const boat = new Boat(1337);
console.log(boat.serialNumber);
console.log(boat.makeSound());

const airplane = new Airplane(5318008);
console.log(airplane.serialNumber);
console.log(airplane.makeSound());


// Non OOP
let vehicleSerialNumber = "Please don't implement this!";
function VehicleSound() {""}; // Please don't add any sound here, bro!

let boatSerialNumber = "Please only read this if you are allowed to! Seriously! Here it is: 42";
function BoatSound() { return "Vrrooommm! Splash!"};

let airplaneSerialNumber = "Please only read this if you are allowed to! Seriously! Here it is: 1337";
function AirplaneSound() { return "Brrrrr!! Swoosh!"};

// console.log(boatSerialNumber); // Nooo!
// console.log(BoatSound());

// console.log(airplaneSerialNumber); // Nooo!
// console.log(AirplaneSound());