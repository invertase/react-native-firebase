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

### Integration steps

To integrate FCM for iOS, the following integration steps must be followed;

<Grid>
	<Block
		title="Configure Xcode Project notification capabilities"
		to="/messaging/ios-xcode-project-capabilities"
		icon="tool"
		color="#2196F3"
	>
		Configure your Xcode Project capabilities to support Remote Notifications for FCM.
  	</Block>
	<Block
		title="Configure Apple Push Notification service for FCM"
		to="/messaging/ios-configure-apns"
		icon="tool"
		color="#2196F3"
	>
		Create an Apple Push Notification authentication key, a provisioning profile and an App ID to use with FCM on iOS.
  	</Block>
</Grid>

---

## iOS Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

> TODO
