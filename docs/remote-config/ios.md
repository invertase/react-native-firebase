---
title: iOS Setup
description: Manually integrate Remote Config into your iOS application.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

### Add the RNFBConfig Pod

Add the `RNFBConfig` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBConfig', :path => '../node_modules/@react-native-firebase/remote-config/ios'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBConfig` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
react-native run-ios
```
