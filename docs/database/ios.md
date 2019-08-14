---
title: iOS Setup
description: Manually integrate Realtime Database into your iOS application.
---

# iOS Manual Linking

## Manual iOS Integration via CocoaPods

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add Realtime Database Pod

**`ios/Podfile`**:

```ruby{4}
// ..
target 'app' do
  // ..
  pod 'RNFBDatabase', :path => '../node_modules/@react-native-firebase/database/ios'
end
```

## Manual iOS Integration via Frameworks

_TODO_
