// This code example does not follow the four pillars of OOP design principles
// How do We implement Encapsulation, Inheritance, Abstraction, Polymorphism?

let vehicleSerialNumber = "Please only read this if you are allowed to! Seriously! Here it is: 42";
function VehicleSound() {""};
let boatSerialNumber = vehicleSerialNumber;
function BoatSound() {"Vrrooommm"};

// Abstraction
class Vehicle {
    #serialNumber // Encapsulation
    constructor(serialNumber) {
        if (this.constructor === Vehicle) {
            throw new Error("Cant instantiate abstract class");
        }
        this.#serialNumber = serialNumber;
    }
    makeSound() {
        throw new Error("Cant call abstract method");
    }
}

// Inheritance
class Boat extends Vehicle {
    constructor(serialNumber) {
        super(serialNumber);
    }
    // Polymorphic behavior
    makeSound() {
        return "Vrrooommm!"
    }
}

//const vehicle = new Vehicle("42"); // Error

const boat = new Boat("42");

console.log(boat);
console.log(boat.makeSound());

//console.log(boat.#serialNumber); // Error
