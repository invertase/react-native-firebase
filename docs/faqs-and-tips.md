---
title: FAQs and Tips
description: Learn about top tips from and common problems faced by the React Native Firebase community.
next: /releases
previous: /migrating-to-v6
---

Over the years, there’s been a lot of discussions on our [GitHub](https://github.com/invertase/react-native-firebase) and [Discord](https://invertase.link/discord). Many of them have been about common problems developers face when using our package, and some of them resulted in very good advice being given.

In order to save others time and frustration, this page has been created to document some of these common problems and good pieces of advice.
If you come across a discussion that results in great advice that can benefit many developers, or a discussion that resolves a problem that many developers encounter, please do add it here! Someone will definitely be grateful.

# FAQs

### I need help with [anything regarding <= v5 of React Native Firebase]. Where could I get help with that?

React Native Firebase v5 is now deprecated and unsupported. There's been over a year's grace period provided to migrate to v6, so moving forward maintainers probably won't pay much attention to issues regarding v5. Understandably, upgrading to v6 can take some effort, but staying on v5 probably isn't a great choice for the long-term health of your project.
Lots of the breaking changes that were introduced were either due to upstream deprecations in the official SDKs, or to simply make the package more stable and more representative of how the actual SDKs work.
The longer you stay on v5, the more your project will be out of sync with the official SDKs, unfortunately. Couple that with the fact that it's no longer actively supported, and that's trouble looming over the horizon for your project.

We highly recommend taking the necessary pains to update to v6.

### My CI build hangs at the "Running script '[CP-User] [RNFB] Core Configuration'" step.

This may be fixed by creating a `firebase.json` file at the root of your project if it's not there already. If you don't want to change any of the default React Native Firebase configurations, you can leave it empty in the following way:

```
{
  "react-native": {
  }
}
```

### I have a custom Analytics parameter called 'items' and it's not showing up on the Firebase console. How come?

This happens to be a known problem with the upstream Analytics SDKs. The Firebase team doesn't have any plans to fix it soon. More information about this can be found [here](https://github.com/invertase/react-native-firebase/issues/4018#issuecomment-682174087).

### I'm receiving `InternalFirebaseAuth.FIREBASE_AUTH_API is not available on this device`. How do I fix this?

To use some Firebase services (like auth) in an emulator, you need an Android virtual device with Google Play services installed. Check this [Stack Overflow post](https://stackoverflow.com/a/46246782/2275865) for instructions on creating a new Android virtual device with the necessary APIs installed.

### I'm getting an SIGABRT error in Xcode when faking a crash on iOS. How do I fix this?

When you get an error on this line when faking a crash on iOS:

```
RCT_EXPORT_METHOD(crash) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    assert(NO);
  }
}
```

Just disable your debugger in Xcode. 'Project name' -> 'Edit Scheme...' -> 'Run' -> deselect "Debug executable"

### I have the latest SDK installed, but I can't send a test in app message from the console. How do I fix this?

Sometimes when building an in-app-message in the console, sending a test to a device is not possible, as the "Test on device" button is grayed out. This can be very annoying, but have found a "work around" that enables the button:

1. Make sure to fill out all fields in the first step of the form. If that doesn't enable the button:
1. Make sure to click inside every field, even if the field does not need to be updated (specially the "Text color" ones). If that doesn't enable the button:
1. Change between the "Message layout" options (Card, Modal, Image only and Top banner).

Sometimes, after step 3, you have to click inside a "Text color" field, but this should enable the "Test on device" option. After that you add the device Install ID, make sure to quit the app before the actual test, and then I wait for the confirmation toast to open the app up again. As long as the ID is 100% correct, the test should work as intended.

### On iOS, when the app is in quit state, the setBackgroundMessageHandler is never invoked even when I receive the notification. How can I fix this?

When the app is closed/quit, this can happen even when you are getting notifications and even when you are able to invoke the app in a headless state.

To fix this:

1. You first need to send the payload with "content-available: 1" in the `apns` section of the message payload so the app gets invoked in a headless state.
2. On the `index.js` page, if the app is invoked in headless mode, instead of returning null, return a simple component that does nothing and renders nothing. Otherwise, return the actual `App` component.

To view the complete detail for this solution, please refer to this page: [#5656](https://github.com/invertase/react-native-firebase/issues/5656)

# Tips

- Whenever you face a strange issue (or an issue that causes build errors), there are two things you should always consider.
  - Build processes are costly and complex, so caching is used a lot. As a result, certain changes that you make in your app can cause cache conflicts in subsequent builds. Deal with this via `npx react-native-clean-project`. This does solve a lot of problems.
  - Try an isolate the problem with a template React Native Firebase app. This [bash script](https://github.com/mikehardy/rnfbdemo/blob/master/make-demo.sh) is particularly helpful in making an empty template app.
- Advice on supporting multiple environments (for example, dev, prod, maybe also staging, qa) for your React Native Firebase App: [#3504](https://github.com/invertase/react-native-firebase/issues/3504)
- Using [Fastlane for iOS deployment](https://docs.fastlane.tools/getting-started/ios) together with [RN Firebase Crashlytics](https://rnfirebase.io/crashlytics/usage) within CI has been observed to cause builds that hang indefinitely. Using `setup_ci(force: true)` before building the application may solve the issue.: [#3706](https://github.com/invertase/react-native-firebase/issues/3706)
- Be careful if you are using a VPN, Google blocks many VPN IPs causing "unavailable" errors for various firebase API calls, and on an Android emulator it might completely mess up the network adapter causing network calls to never return, not only on firebase but on the entire emulated phone.
