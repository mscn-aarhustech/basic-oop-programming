// This code example does not follow the four pillars of OOP design principles
// How do We implement Encapsulation, Inheritance, Abstraction, Polymorphism?

let vehicleSerialNumber = "Please don't implement this!";
function VehicleSound() {""}; // Please don't add any sound here, bro!

let boatSerialNumber = "Please only read this if you are allowed to! Seriously! Here it is: 42";
function BoatSound() { return "Vrrooommm! Splash!"};

let airplaneSerialNumber = "Please only read this if you are allowed to! Seriously! Here it is: 1337";
function AirplaneSound() { return "Brrrrr!! Swoosh!"};

console.log(boatSerialNumber); // Nooo!
console.log(BoatSound());

console.log(airplaneSerialNumber); // Nooo!
console.log(AirplaneSound());