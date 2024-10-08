/* 
!!! Its like a machine that creates objects,
!!! The Factory pattern helps you centralize the object creation without having to know the details of the notification classes.

 */
class Notification {
  sendNotification(message) {
    throw new Error("This method should be overridden!");
  }
}
//Email Notififaction
class EmailNotification extends Notification {
  sendNotification(message) {
    console.log(`sending Email Notification ${message}`);
  }
}

class SMSNotifaction extends Notification {
  sendNotification(message) {
    console.log(`sending SMS Notification ${message}`);
  }
}

class PushNotification extends Notification {
  sendNotification(message) {
    console.log(`Sending Push Notification ${message}`);
  }
}

class NotificationFactory {
  static createNotifaction(type) {
    switch (type) {
      case "email":
        return new EmailNotification();
      case "sms":
        return new SMSNotifaction();
      case "push":
        return new PushNotification();
      default:
        throw new Error("Unknown notification type");
    }
  }
}

const notification1 = NotificationFactory.createNotifaction("email");
notification1.sendNotification("Email Notifaction");

const notification2 = NotificationFactory.createNotifaction("sms");
notification2.sendNotification("SMS Notifaction, your OTP is 1234");

const notification3 = NotificationFactory.createNotifaction("push");
notification3.sendNotification("Push Notification you have");
