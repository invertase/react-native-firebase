---
title: iOS Installation
description: Manually integrate ML Kit Natural Language APIs into your iOS application.
next: /ml-natural-language/usage/installation/android
previous: /ml-natural-language/usage
---

# iOS Manual Installation

The following steps are only required if your environment does not have access to React Native
auto-linking.

## 1. Add the Pod

Add the `RNFBMLNaturalLanguage` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  # ...
  pod 'RNFBMLNaturalLanguage', :path => '../node_modules/@react-native-firebase/ml-natural-language'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBMLNaturalLanguage` Pod to be installed in your project:

```bash
$ cd ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```
