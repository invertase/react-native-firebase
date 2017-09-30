# iOS Installation

Please note that there is a known issue when using Cocoapods with the `use_frameworks!` enabled.  This is explained [here](https://github.com/invertase/react-native-firebase/issues/252#issuecomment-316340974).  Unfortunately we don't currently have a workaround, but are engaging with Firebase directly to try and resolve the problem.

## 1) Setup GoogleService-Info.plist
Setup the `GoogleService-Info.plist` file by following the instructions and adding it to the root of your project at `ios/[YOUR APP NAME]/GoogleService-Info.plist` [here](https://firebase.google.com/docs/ios/setup#add_firebase_to_your_app).

### 1.1) Initialisation
Make sure you've added the following to the top of your `ios/[YOUR APP NAME]]/AppDelegate.m` file:

`#import <Firebase.h>`

and this to the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method before the `return` statement:

`[FIRApp configure];`

## 2) Setup RNFirebase

Unfortunately, due to the fact that Firebase is much easier to setup using Cocoapods, *we do not recommend* `react-native link` as it is not customisable enough for our needs and we have had numerous problems reported.

### 2.0) If you don't already have Cocoapods set up
Follow the instructions to install Cocoapods and create your Podfile [here](https://firebase.google.com/docs/ios/setup#add_the_sdk).

**NOTE: The Podfile needs to be initialised in the `ios` directory of your project. Make sure to update cocoapods libs first by running `pod update`**

#### Troubleshooting
1) When running `pod install` you may encounter an error saying that a `tvOSTests` target is declared twice. This appears to be a bug with `pod init` and the way that react native is set up.

**Resolution:**
- Open your Podfile
- Remove the duplicate `tvOSTests` target nested within the main project target
- Re-run `pod install`.

2) When running `pod install` you may encounter a number of warnings relating to `target overrides 'OTHER_LDFLAGS'`.

**Resolution:**
- Open Xcode
- Select your project
- For each target:
-- Select the target
-- Click Build settings
-- Search for `other linker flags`
-- Add `$(inherited)` as the top line if it doesn't already exist
- Re-run `pod install`

3) When running `pod install` you may encounter a warning that a default iOS platform has been assigned.  If you wish to specify a different minimum version:

**Resolution**
- Open your Podfile
- Uncomment the `# platform :ios, '9.0'` line by removing the `#` character
- Change the version as required

### 2.1) Add the required pods
Simply add the following to your `Podfile` either at the top level, or within the main project target:

```ruby
# Required by RNFirebase
pod 'Firebase/Core'
pod 'RNFirebase', :path => '../node_modules/react-native-firebase'

# [OPTIONAL PODS] - comment out pods for firebase products you won't be using.
pod 'Firebase/AdMob'
pod 'Firebase/Auth'
pod 'Firebase/Crash'
pod 'Firebase/Database'
pod 'Firebase/DynamicLinks'
pod 'Firebase/Messaging'
pod 'Firebase/RemoteConfig'
pod 'Firebase/Storage'
```

If you do not already have React and Yoga installed as pods, then add Yoga and React to your `Podfile` as follows:

```ruby
pod "Yoga", :path => "../node_modules/react-native/ReactCommon/yoga"
pod 'React', :path => '../node_modules/react-native', :subspecs => [
  'BatchedBridge', # Required For React Native 0.45.0+
  'Core',
  # Add any other subspecs you want to use in your project
]
```

Run `pod install`.

**NOTE: You need to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on.**

#### Troubleshooting
1) You receive an error `No podspec found for 'RNFirebase'`

**Resolution**
- Run `npm install --save react-native-firebase` from the root of your project

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
-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [RNFirebaseMessaging didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
  [RNFirebaseMessaging didReceiveRemoteNotification:userInfo];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [RNFirebaseMessaging didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  [RNFirebaseMessaging willPresentNotification:notification withCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)())completionHandler {
  [RNFirebaseMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}
```

### 3.5) Debugging

If you're having problems with messages not being received, check out the following blog post for help:

https://firebase.googleblog.com/2017/01/debugging-firebase-cloud-messaging-on.html
