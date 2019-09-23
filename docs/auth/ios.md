---
title: iOS Setup
description: Manually integrate Authentication into your iOS application.
---

# iOS Manual Installation

The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.

Installation can be done via CocoaPods (recommended) or via Frameworks:

## CocoaPods Installation

### Add the RNFBAuth Pod

Add the `RNFBAuth` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBAuth', :path => '../node_modules/@react-native-firebase/auth/ios'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBAuth` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

