---
title: iOS Manual Installation
description: Manually integrate Crashlytics into your iOS application.
---

# iOS Manual Installation

The following steps are only required if your environment does not have access to React Native auto-linking (<= 0.59).

## CocoaPods Installation

### Add the RNFBCrashlytics Pod

Add the `RNFBCrashlytics` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  # Add the RNFBCrashlytics podspec to your app target:
  pod 'RNFBCrashlytics', :path => '../node_modules/@react-native-firebase/crashlytics'
end
```

### Add the Crashlytics run script

Crashlytics for iOS requires an additional manual step once the NPM package has been installed.
You'll need XCode for the following steps.

Open your project in XCode, and select the project file in the Navigator. Select the 'Build Phases' tab &
add a 'New Run Script Phase':

![Run Script](https://prismic-io.s3.amazonaws.com/invertase%2F96f32c96-0aca-4054-bf30-bd2448ca2462_new+project.png)

In the new build phase, add a new script into the text box:

```
"${PODS_ROOT}/Fabric/run"
```

![Script](https://prismic-io.s3.amazonaws.com/invertase%2Ff06cf5b3-884e-4cbc-8c3d-81072a254f1d_new+project+%281%29.png)


### Update Pods & rebuild the project

You may need to update your local Pods repo in order for the Pods to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```
