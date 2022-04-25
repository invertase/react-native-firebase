---
title: iOS Messaging Setup
description: iOS requires additional configuration steps to be completed before you can receive messages.
next: /messaging/ios-permissions
previous: /messaging/usage
---

Integrating the Cloud Messaging module on iOS devices requires additional setup before your devices receive messages.
There are also a number of prerequisites which are required to enable messaging:

- You must have an active [Apple Developer Account](https://developer.apple.com/membercenter/index.action).
- You must have a physical iOS device to receive messages.
  - Firebase Cloud Messaging integrates with the [Apple Push Notification service (APNs)](https://developer.apple.com/notifications/),
    however APNs only works with real devices.

## Configuring your app

Before your application can start to receive messages, you must explicitly enable "Push Notifications" and "Background Modes"
within Xcode.

Open your project's workspace file via Xcode (found within the `/ios` directory). The file name is prefixed with your project name,
for example `/ios/myapp.xcworkspace`. Once open, follow the steps below:

1. Select your project.
2. Select the project target.
3. Select the "Signing & Capabilities" tab.

![Example with Steps](https://images.prismic.io/invertase/c954c8ed-a6bf-42f3-9b1d-c9eac937f9ec_xcode-signing-tab.png?auto=format)

### Enable Push Notifications

Next the "Push Notifications" capability needs to be added to the project. This can be done via the "Capability" option on the
"Signing & Capabilities" tab:

1. Click on the "+ Capabilities" button.
2. Search for "Push Notifications".

![Enabling the Push Notification capability](https://images.prismic.io/invertase/d682a40c-07ab-4fce-90a7-fb4278643323_xcode-enable-push-notification.png?auto=format)

Once selected, the capability will be shown below the other enabled capabilities. If no option appears when searching, the
capability may already be enabled.

### Enable Background Modes

Next the "Background Modes" capability needs to be enabled, along with both the "Background fetch" and "Remote notifications" sub-modes.
This can be added via the "Capability" option on the "Signing & Capabilities" tab:

1. Click on the "+ Capabilities" button.
2. Search for "Background Modes".

![Enabling the Background Modes capability](https://images.prismic.io/invertase/517e18ad-37a7-4f44-a89e-c5947ea3742e_xcode-enable-background-modes-capability.png?auto=compress,format)

Once selected, the capability will be shown below the other enabled capabilities. If no option appears when searching, the
capability may already be enabled.

Now ensure that both the "Background fetch" and the "Remote notifications" sub-modes are enabled:

![Enabling the sub-modes](https://images.prismic.io/invertase/3a618574-dd9f-4478-9f39-9834d142b2e5_xcode-background-modes-check.gif?auto=compress,format)

## Linking APNs with FCM (iOS)

> Note: APNs is now required for both `foreground` and `background` messaging to function correctly on iOS.

A few steps are required:

1. [Registering a key](#1-registering-a-key).
2. [Registering an App Identifier](#2-registering-an-app-identifier).
3. [Generating a provisioning profile](#3-generating-a-provisioning-profile).

All of these steps require you to have access to your [Apple Developer](https://developer.apple.com/membercenter/index.action) account.
Once on the account, navigate to the [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
tab on the account sidebar:

![Certificates, Identifiers & Profiles menu item](https://images.prismic.io/invertase/c0a795c8-ebca-41c3-9a8d-23f09deb625f_apple-dev-tab.png?auto=format)

### 1. Registering a key

A key can be generated which gives the FCM full access over the Apple Push Notification service (APNs). On the "Keys" menu item,
register a new key. The name of the key can be anything, however you must ensure the APNs service
is enabled:

![Enable "Apple Push Notification (APNs)"](https://images.prismic.io/invertase/01fefe19-132f-4b88-8c17-9dc40357e4ce_apple-key.png?auto=format)

Click "Continue" & then "Save". Once saved, you will be presented with a screen displaying the private "Key ID" & the ability
to download the key. Copy the ID, and download the file to your local machine:

![Copy Key ID & Download File](https://images.prismic.io/invertase/2c7f194c-10a9-4011-8f80-78b8fc521af8_app-key-final.png?auto=format)

The file & Key ID can now be added to your Firebase Project. On the [Firebase Console](https://console.firebase.google.com/project/_/settings/cloudmessaging),
navigate to the "Project settings" and select the "Cloud Messaging" tab. Select your iOS application under the "iOS app configuration" heading.

Upload the downloaded file and enter the Key ID:

![Upload the key & Key ID](https://images.prismic.io/invertase/74bd1df4-c9e9-465c-9e0f-cacf6e26d68c_7539b8ec-c310-40dd-91e5-69f19009786f_apple-fcm-upload-key.gif?auto=compress,format)

### 2. Registering an App Identifier

For messaging to work when your app is built for production, you must create a new App Identifier which is linked to the
application that you're developing.

On the "Identifiers" menu item, register a App Identifier. Select the "App IDs" option and click "Continue".

The following screen enables you to link the identifier to your application via the "Bundle ID". This is a unique string
which was generated when starting your new React Native project. Your Bundle ID can be obtained within Xcode, under the
"General" tab for your project target:

![Project Bundle ID](https://images.prismic.io/invertase/7108ff7f-ce94-4452-851d-fa5dde668a9a_xcode-bundle-id.png?auto=compress,format)

Next, follow these steps:

1. Enter a description for the identifier.
2. Enter the "Bundle ID" copied from Xcode.
3. Scroll down and enable the "Push Notifications" capability (along with any others your app uses).

![Create an identifier](https://images.prismic.io/invertase/0e711691-ccd2-43ab-9c0c-7696b6790153_apple-identifier.gif?auto=format)

Save the identifier, it'll be used when creating a provisioning profile in the next step.

### 3. Generating a provisioning profile

A provisioning profile enables signed communicate between Apple and your application. Since messaging can only be used on
real devices, a signed certificate ensures that the app being installed on a device is genuine and has the correct
permissions enabled.

On the "Profiles" menu item, register a new Profile. Select the "iOS App Development" checkbox and click "Continue".

If you followed [Step 2](#2-registering-an-app-identifier) correctly, your App Identifier will be available in the drop down
provided:

![Select the App Identifier](https://images.prismic.io/invertase/9fd060fa-4afa-4dfe-8eaa-4b1156cdd912_apple-select-app-id.png?auto=format)

Click "Continue". On the next screen you will be presented with the Certificates on your Apple account. Select the user
certificates that you wish to assign this provisioning profile too. If you have not yet created a Certificate, you must set
one up on your account.

To create a new Certificate, follow the [Apple documentation](https://help.apple.com/developer-account/#/devbfa00fef7). Once
the Certificate has been downloaded, upload it to the Apple Developer console via the "Certificates" menu item.

The created provisioning profile can now be used when building your application (in both debug and release mode) onto a
real device (using Xcode). Back within Xcode, select your project target and select the "Signing & Capabilities" tab.
If Xcode (via Preferences) is linked to your Apple Account, Xcode can automatically sync the profile created above. Otherwise,
you must manually add the profile from the Apple Developer console:

1. Select the project.
2. Select the project target.
3. Assign the provisioning profile.

![Assign the provisioning profile via Xcode](https://images.prismic.io/invertase/50349f49-19a0-45f4-b899-e6bc3015c509_xcode-assign-profile.png?auto=format)

## Next steps

Once the above has been completed, you're ready to get started receiving messages on your iOS device for both
testing and production. To rebuild your app, run the following command:

```bash
npx react-native run-ios
```
