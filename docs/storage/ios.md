---
title: iOS Setup
description: Manually integrate Cloud Storage into your iOS application. 
---

# iOS Setup

## Manual iOS Integration via CocoaPods

> The following steps are only required if your environment does not have access to React Native
auto-linking.

#### Add Cloud Storage Pod

**`ios/Podfile`**:
```ruby{4}
// ..
target 'app' do
  // ..
  pod 'RNFBStorage', :path => '../node_modules/@react-native-firebase/storage/ios'
end
```

## Manual iOS Integration via Frameworks

*TODO*
