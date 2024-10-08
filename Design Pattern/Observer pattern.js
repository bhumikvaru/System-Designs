/* 
!!! its like a notification system, when one object changes, all the objects that
!!! depend on it(observers) are automatically updated
 */

class Subject {
  constructor() {
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }
  notify() {
    this.observers.forEach((observer) => observer.update());
  }
}

class Observer {
  update() {
    console.log("observer notified");
  }
}

const subject = new Subject();
const observer1 = new Observer();
const observer2 = new Observer();

subject.subscribe(observer1);
subject.subscribe(observer2);

subject.notify();
