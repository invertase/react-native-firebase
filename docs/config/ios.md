---
title: iOS Setup
description: Manually integrate Remote Config into your iOS application. 
---

# iOS Setup

## Manual iOS Integration via CocoaPods

> The following steps are only required if your environment does not have access to React Native
auto-linking.

#### Add Remote Config Pod

**`ios/Podfile`**:
```ruby{4}
// ..
target 'app' do
  // ..
  pod 'RNFBConfig', :path => '../node_modules/@react-native-firebase/config/ios'
end
```

## Manual iOS Integration via Frameworks

*TODO*
