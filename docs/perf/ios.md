---
title: iOS Setup
description: Manually integrate Performance Monitoring into your iOS application. 
---

# iOS Manual Linking

## Manual iOS Integration via CocoaPods

> The following steps are only required if your environment does not have access to React Native
auto-linking.

#### Add Performance Monitoring Pod

**`ios/Podfile`**:
```ruby{4}
// ..
target 'app' do
  // ..
  pod 'RNFBPerf', :path => '../node_modules/@react-native-firebase/perf/ios'
end
```

## Manual iOS Integration via Frameworks

*TODO*
