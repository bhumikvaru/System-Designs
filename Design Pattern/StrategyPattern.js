/* 
!!! allows to change the way an operation is performed
 */
class CreditCardPayment {
  pay(amount) {
    console.log(`Paid ${amount} using Credit Card`);
  }
}
class PayPalPayment {
  pay(amount) {
    console.log(`Paid ${amount} using PayPal`);
  }
}

class Payment {
  setStrategy(paymentMethod) {
    this.paymentMethod = paymentMethod;
  }
  executePayment(amount) {
    this.paymentMethod.pay(amount);
  }
}

const payment = new Payment();
payment.setStrategy(new CreditCardPayment());
payment.executePayment(100);

payment.setStrategy(new PayPalPayment());
payment.executePayment(200);
