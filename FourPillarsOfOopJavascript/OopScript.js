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
        return "Vrrooommm! Splash!";
    }
}

class Airplane extends Vehicle {
    constructor(serialNumber) {
        super(serialNumber);
    }
    // Polymorphic behavior
    makeSound() {
        return "Brrrrr!! Swoosh!";
    }
}

//const vehicle = new Vehicle("42"); // Error

const boat = new Boat("42");
const airplane = new Airplane("1337");

// Log object
console.log(boat);
console.log(airplane);

// Log object sound
console.log(boat.makeSound());
console.log(airplane.makeSound());

// Accessing private member returns error
//console.log(boat.#serialNumber); // Error
//console.log(airplane.#serialNumber); // Error
