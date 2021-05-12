---
title: iOS Notification Images
description: Displaying an image in an iOS notification.
next: /messaging/server-integration
previous: /messaging/notifications
---

This is a quick guide to display an image in an incoming notification. Android handles this out of the box so this extra setup is **only necessary for iOS**.

> If you want to know more about the specifics of this setup read the [official Firebase docs](https://firebase.google.com/docs/cloud-messaging/ios/send-image).

**🚨 Before you start**
Be sure you already have Cloud Messaging installed and set up. In case you don't [get started here](/messaging/usage).

**🏁 Ready to start**
The following steps will guide you through how to add a new target to your application to support payloads with an image. Open Xcode and let's get started.

### Step 1 - Add a notification service extension

- From Xcode top menu go to: **File > New > Target...**
- A modal will present a list of possible targets, scroll down or use the filter to select `Notification Service Extension`. Press **Next**.
- Add a product name (use `ImageNotification` to follow along) and click **Finish**
- Enable the scheme by clicking **Activate**

![step-1](/assets/docs/messaging/ios-notification-images-step-1.gif)

### Step 2 - Add target to the Podfile

Ensure that your new extension has access to Firebase/Messaging pod by adding it in the Podfile:

- From the Navigator open the Podfile: **Pods > Podfile**
- Scroll down to the bottom of the file and add

```Ruby
target 'ImageNotification' do
  pod 'Firebase/Messaging', '~> VERSION_NUMBER' # eg 6.31.0
end
```

- Make sure to change the version number `VERSION_NUMBER` with the currently installed version (check your Podfile.lock)
- Install or update your pods using `pod install` from the `ios` folder

![step-2](/assets/docs/messaging/ios-notification-images-step-2.gif)

### Step 3 - Use the extension helper

At this point everything should still be running normally. This is the final step which is invoking the extension helper.

- From the navigator select your `ImageNotification` extension
- Open the `NotificationService.m` file
- At the top of the file import `FirebaseMessaging.h` right after the `NotificationService.h` as shown below

```diff
#import "NotificationService.h"
+ #import "FirebaseMessaging.h"
```

- then replace everything from line 25 to 28 with the extension helper

```diff
- // Modify the notification content here...
- self.bestAttemptContent.title = [NSString stringWithFormat:@"%@ [modified]", self.bestAttemptContent.title];

- self.contentHandler(self.bestAttemptContent);
+ [[FIRMessaging extensionHelper] populateNotificationContent:self.bestAttemptContent withContentHandler:contentHandler];
```

![step-3](/assets/docs/messaging/ios-notification-images-step-3.gif)

## All done

Run the app and check it builds successfully – **make sure you have the correct target selected**. Now you can use the [Notifications composer](https://console.firebase.google.com/u/0/project/_/notification) to test sending notifications with an image (`300KB` max size). You can also create custom notifications via [`FCM HTTP`](https://firebase.google.com/docs/cloud-messaging/http-server-ref) or [`firebase-admin`](https://www.npmjs.com/package/firebase-admin). Read this page to send [messages from a server](/messaging/server-integration).
