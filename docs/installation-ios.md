# iOS Installation

## 1) Setup google-services.plist and dependencies
Setup the `google-services.plist` file and Firebase ios frameworks first; check out the relevant Firebase docs [here](https://firebase.google.com/docs/ios/setup#frameworks).

### 1.1) Initialisation
Make sure you've added the following to the top of your `ios/[YOUR APP NAME]]/AppDelegate.m` file:

`#import <Firebase.h>`

and this to the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method:

`[FIRApp configure];`

## 2) Link RNFirebase

There are multiple ways to install RNFirebase depending on how your project is currently setup:

### 2.1) You already use Cocoapods and have React Native installed as a pod
Simply add the following to your `Podfile`:

```ruby
# Required by RNFirebase - you should already have some of these from step 1.
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

### 2.2) You're not using Cocoapods or don't have React Native installed as a pod (Automatic install)

React native ships with a `link` command that can be used to link the projects together, which can help automate the process of linking our package environments.

```bash
react-native link react-native-firebase
```

#### cocoapods

We've automated the process of setting up with cocoapods. This will happen automatically upon linking the package with `react-native-cli`.

Update the newly installed pods once the linking is done:

```bash
cd ios && pod update --verbose
```

**NOTE: You need to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on.**

### 2.3) You're not using Cocoapods or don't have React Native installed as a pod (Manual install)

If you prefer not to use `react-native link`, we can manually link the package together with the following steps, after `npm install`:

**A.** In XCode, right click on `Libraries` and find the `Add Files to [project name]`.
![Firebase.xcodeproj add to files](https://cloud.githubusercontent.com/assets/5347038/24249673/0fccdbec-0fcc-11e7-83eb-c058f8898525.png)

**B.** Add the `node_modules/react-native-firebase/ios/Firebase.xcodeproj`

![Firebase.xcodeproj in Libraries listing](https://cloud.githubusercontent.com/assets/21329063/24249440/9494e19c-0fd3-11e7-95c0-c2baa85092e8.png)

**C.** Ensure that the `Build Settings` of the `RNFirebase.xcodeproj` project is ticked to _All_ and it's `Header Search Paths` include both of the following paths _and_ are set to _recursive_:

  1. `$(SRCROOT)/../../react-native/React`
  2. `$(SRCROOT)/../node_modules/react-native/React`
  3. `${PROJECT_DIR}/../../../ios/Pods`

![Recursive paths](https://cloud.githubusercontent.com/assets/21329063/24250349/da91284c-0fd6-11e7-8328-6008e462039e.png)

**D.** Setting up cocoapods

Since we're dependent upon cocoapods (or at least the Firebase libraries being available at the root project -- i.e. your application), we have to make them available for RNFirebase to find them.

Using cocoapods is the easiest way to get started with this linking. Add or update a `Podfile` at `ios/Podfile` in your app with the following:

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
```

Then you can run `(cd ios && pod install)` to get the pods opened.

**NOTE: You need to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on.**

## 3) Cloud Messaging (optional)

If you plan on using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/) then, you need to:

**NOTE: FCM does not work on the iOS simulator, you must test is using a real device.  This is a restriction enforced by Apple for some unknown reason.**

### 3.1) Set up certificates

Follow the instructions at https://firebase.google.com/docs/cloud-messaging/ios/certs

### 3.2) Enable capabilities

In Xcode, enable the following capabilities:

1) Push Notifications
2) Background modes > Remove notifications

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
