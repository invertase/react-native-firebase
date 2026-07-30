# @react-native-firebase/messaging

Knowledge for FCM messaging native behavior, primarily the iOS `UNUserNotificationCenter` delegate-forwarding chain shared with the host app's `AppDelegate`.

## Documents

* [iOS UNUserNotificationCenter delegate forwarding](ios-notification-delegate-forwarding.md) — `completionHandler` exactly-once contract, delegate chaining design, regression history (#8754 → #8786 → #9049 / #9050)
* [iOS APNs registration on Simulator](ios-apns-simulator-registration.md) — intentional ARM64 Simulator skip of UIKit register + global-queue `registration-timeout`

## Related repository files

* [`packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m) — foreground `willPresentNotification` / `didReceiveNotificationResponse` delegate forwarding
* [`packages/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m) — background/remote-notification `AppDelegate` swizzling
* [`packages/messaging/lib/index.ts`](../../../packages/messaging/lib/index.ts) — JS entry, headless task registration
