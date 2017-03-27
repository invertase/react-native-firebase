# iOS Installation

Setup the Firebase ios frameworks first; check out the relevant Firebase docs [here](https://firebase.google.com/docs/ios/setup#frameworks).

## cocoapods

Since we're dependent upon cocoapods (or at least the Firebase libraries being available at the root project -- i.e. your application), we have to make them available for RNFirebase to find them.

As such, using cocoapods is the easiest way to get started. Add or update a `Podfile` at `ios/Podfile` in your app with the following:

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

Then you can run `(cd ios && pod install)` to get the pods installed.

**Remember to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on**.

## AppDelegate.m

You need to add the following to the top of `ios/[YOUR APP NAME]]/AppDelegate.m`:

`#import <Firebase.h>`

and this to the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method:

`[FIRApp configure];`
