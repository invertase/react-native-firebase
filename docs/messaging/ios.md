---
title: iOS Setup
description: Manually integrate Messaging into your iOS application.
---

# iOS Manual Linking

## Before you begin

These guides makes the following assumptions:

- you have an active [Apple Developer account](https://developer.apple.com/membercenter/index.action)
- you have an active Firebase project
- you have a physical device to test your integration on
  - Firebase Cloud Messaging uses the [Apple Push Notification service (APNs)](https://developer.apple.com/notifications/) to send messages; therefore to test FCM on iOS you'll need **a real device** - FCM will not work on a iOS simulator

Add the following to your `Podfile`:

```ruby{3}
$ pod 'Firebase/Messaging', '~> 6.13.0'
```

Run this from the command line in the `ios` directory of your project:

```bash
$ pod update
```

### Integration steps

To integrate FCM for iOS, the following integration steps must be followed;

<Grid>
  <Block
		title="Configure Apple Push Notification service for FCM"
		to="/ios-configure-apns"
		icon="tool"
		color="#2196F3"
	>
		Create an Apple Push Notification authentication key, a provisioning profile and an App ID to use with FCM on iOS.
  	</Block>
	<Block
		title="Configure Xcode Project notification capabilities"
		to="/ios-xcode-project-capabilities"
		icon="tool"
		color="#2196F3"
	>
		Configure your Xcode Project capabilities to support Remote Notifications for FCM.
  	</Block>
</Grid>

---

## iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

### Add the RNFBMessaging Pod

Add the `RNFBMessaging` Pod to your projects `/ios/Podfile`:

```ruby{3}
target 'app' do
  ...
  pod 'RNFBMessaging', :path => '../node_modules/@react-native-firebase/messaging'
end
```

### Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBMessaging` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```
