---
title: iOS Setup
description: Manually integrate ML Kit Vision APIs into your iOS application.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

### Add the RNFBMLVision Pod

Add the `RNFBMLVision` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBMLVision', :path => '../node_modules/@react-native-firebase/ml-vision'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBMLVision` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

