---
title: Firestore iOS Initialization
description: Firestore initialization with iOS.
---

# iOS Manual Linking

> The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.


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