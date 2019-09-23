---
title: iOS Setup
description: Manually integrate Performance Monitoring into your iOS application.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

### Add the RNFBPerf Pod

Add the `RNFBPerf` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBPerf', :path => '../node_modules/@react-native-firebase/perf/ios'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBPerf` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
react-native run-ios
```
