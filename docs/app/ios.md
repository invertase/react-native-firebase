---
title: iOS Initialization
description: Initialization Firebase with iOS.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.


#### Add on Podfile.lock
**`ios/Podfile`**

 We recommend using a minimum platform version of at least 9.0 for your application to ensure that the correct version of the Firebase libraries are used, so make sure `platform :ios, '9.0` is present at the top of your file. Also add `RNFBApp` pods inside your target.

```ruby
platform :ios, '9.0'
//...

target 'yourApp' do
    //...
    pod 'RNFBApp', :path => '../node_modules/@react-native-firebase/app/ios' 
end


```

Run `pod install`

> You need to use the `ios/[YOUR APP NAME].xcworkspace` instead of the `ios/[YOUR APP NAME].xcproj` file from now on.

#### Add App to AppDelegate.m

**`ios/{yourApp}/AppDelegate.m`**

A) At the top of the file:

```objectivec
#import <Firebase.h>
```

B) At the beginning of the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method add the following line:

```objectivec
[FIRApp configure];
```