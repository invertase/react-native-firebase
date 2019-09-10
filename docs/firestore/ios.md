---
title: Firestore iOS Initialization
description: Firestore initialization with iOS.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.


#### Add Firestore to Podfile
**`ios/Podfile`**

```ruby
platform :ios, '9.0'
//...

target 'yourApp' do
    //...
    pod 'RNFBFirestore', :path => '../node_modules/@react-native-firebase/firestore'
end

```

Run `pod install` and rebuild your iOS project.