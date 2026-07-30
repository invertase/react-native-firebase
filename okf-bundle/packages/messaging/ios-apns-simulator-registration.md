---
type: Reference
title: iOS APNs registration on Simulator
description: Intentional ARM64 Simulator skip of UIKit registerForRemoteNotifications and global-queue registration-timeout.
tags: [messaging, ios, apns, simulator, platform]
timestamp: 2026-07-26T00:00:00Z
---

# iOS APNs registration on Simulator

Stable platform fact for `@react-native-firebase/messaging` native iOS.

## ARM64 Simulator (Apple Silicon)

Calling UIKit `-[UIApplication registerForRemoteNotifications]` on ARM64 iOS Simulator can **wedge the main thread** indefinitely. A timeout scheduled on the main queue never fires in that state; even a timeout on a **global** queue that rejects the JS promise may not be observable while main remains stuck.

**Product policy (intentional):**

1. Schedule a **10s** `registration-timeout` reject on a **global** queue before any UIKit work on the TurboModule `registerDeviceForRemoteMessages` path (also generation-safe supersede for overlapping register calls).
2. On **ARM64 Simulator**, **do not** call UIKit `registerForRemoteNotifications` from:
   - the TurboModule `register` path (`registerDeviceForRemoteMessages`)
   - `requestPermission`'s APNs side-effect path (permission Promise still resolves; it does **not** reject with `registration-timeout`)
   - native **auto-registration** on app launch (`messaging_ios_auto_register_for_remote_messages`) and the background remote-notification launch re-register path
3. **Physical devices** (and Intel Simulator early-resolve path) still call UIKit
   `registerForRemoteNotifications` as appropriate.

User docs: [Auto Registration (iOS)](../../../docs/messaging/usage/index.mdx#auto-registration-ios), [iOS Messaging Setup](../../../docs/messaging/usage/ios-setup.mdx), [Migrating to v26 — iOS APNs registration](../../../docs/migrating-to-v26.mdx#ios-apns-registration-arm64-simulator--new-promise-rejections).

## Related sources

* [`RNFBMessagingModule.mm`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessagingModule.mm) — `registerForRemoteNotifications:reject:` / `requestPermission`
* [`RNFBMessaging+NSNotificationCenter.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+NSNotificationCenter.m) — auto-register / background launch register
* [`RNFBMessaging+AppDelegate.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m) — `beginRegisterPromise…` / generation claim
* E2e: `packages/messaging/e2e/z-apns-registration-timeout.e2e.js`
