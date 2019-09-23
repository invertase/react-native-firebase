---
title: iOS Setup
description: Manually integrate ML Kit Natural Language APIs into your iOS application.
---

# iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

### Add the RNFBMLNaturalLanguage Pod

Add the `RNFBMLNaturalLanguage` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBMLNaturalLanguage', :path => '../node_modules/@react-native-firebase/ml-natural-language/ios'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBMLNaturalLanguage` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
react-native run-ios
```
