/* 
!!! Add new functionality to an object without modifying the structure
 */

function coffee() {
  this.cost = function () {
    return 5;
  };
}

function Milk(coffee) {
  this.cost = function () {
    return coffee.cost() + 2;
  };
}

function Sugar(coffee) {
  this.cost = function () {
    return coffee.cost() + 2;
  };
}

let myCoffee = new coffee();
myCoffee = new Milk(myCoffee);
myCoffee = new Sugar(myCoffee);

console.log(myCoffee.cost());
