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

### 2.1) Existing Cocoapods setup, including React Native as a pod
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

### 2.2) Via react-native-cli link
React native ships with a `link` command that can be used to link the projects together, which can help automate the process of linking our package environments.

```bash
react-native link react-native-firebase
```

Update the newly installed pods once the linking is done:

```bash
cd ios && pod update --verbose
```

### cocoapods

We've automated the process of setting up with cocoapods. This will happen automatically upon linking the package with `react-native-cli`.

> Remember to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on.

### 2.3) Manually

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

Then you can run `(cd ios && pod install)` to get the pods opened. If you do use this route, remember to use the `.xcworkspace` file.
