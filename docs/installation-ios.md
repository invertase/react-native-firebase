# iOS Installation

## 1) Setup `GoogleService-Info.plist`
Setup the `GoogleService-Info.plist` file by following the instructions and adding it to the root of your project at `ios/[YOUR APP NAME]/GoogleService-Info.plist` [here](https://firebase.google.com/docs/ios/setup#add_firebase_to_your_app).

### 1.1) Initialisation
Make sure you've added the following to the top of your `ios/[YOUR APP NAME]]/AppDelegate.m` file:

`#import <Firebase.h>`

and this to the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method before the `return` statement:

`[FIRApp configure];`

## 2) Link RNFirebase

Unfortunately, due to the fact that Firebase is much easier to setup using Cocoapods, `react-native link` is not recommended as it is not customisable enough for our needs and we have had numerous problems reported.

### 2.0) If you don't already have Cocoapods set up
Follow the instructions to install Cocoapods and create your Podfile [here](https://firebase.google.com/docs/ios/setup#add_the_sdk).

### 2.1) Add the required pods
Simply add the following to your `Podfile`:

```ruby
# Required by RNFirebase
pod 'Firebase/Auth'
pod 'Firebase/Analytics'
pod 'Firebase/AppIndexing'
pod 'Firebase/Core'
pod 'Firebase/Crash'
pod 'Firebase/Database'
pod 'Firebase/DynamicLinks'
pod 'Firebase/Messaging'
pod 'Firebase/RemoteConfig'
pod 'Firebase/Storage'
pod 'RNFirebase', :path => '../node_modules/react-native-firebase'
```

If you are new to Cocoapods do not already have React installed as a pod, then add Yoga and React to your `Podfile` as follows:

```ruby
pod "Yoga", :path => "../node_modules/react-native/ReactCommon/yoga"
pod 'React', :path => '../node_modules/react-native', :subspecs => [
  'BatchedBridge', # For React Native 0.45.0+
  'Core',
  # Add any other subspecs you want to use in your project
]
```

**NOTE: You need to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on.**

## 3) Cloud Messaging (optional)

If you plan on using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/) then, you need to:

**NOTE: FCM does not work on the iOS simulator, you must test is using a real device.  This is a restriction enforced by Apple for some unknown reason.**

### 3.1) Set up certificates

Follow the instructions at https://firebase.google.com/docs/cloud-messaging/ios/certs

### 3.2) Enable capabilities

In Xcode, enable the following capabilities:

1) Push Notifications
2) Background modes > Remote notifications

### 3.3) Update `AppDelegate.h`

Add the following import:

`@import UserNotifications;`

Change the interface descriptor to:

`@interface AppDelegate : UIResponder <UIApplicationDelegate,UNUserNotificationCenterDelegate>`

### 3.4) Update `AppDelegate.m`

Add the following import:

`#import "RNFirebaseMessaging.h"`

Add the following to the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method after `[FIRApp Configure]`:

`[[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];`

Add the following methods:

```objectivec
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  [RNFirebaseMessaging willPresentNotification:notification withCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)())completionHandler
{
  [RNFirebaseMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}

-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [RNFirebaseMessaging didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
                                                       fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [RNFirebaseMessaging didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
```
