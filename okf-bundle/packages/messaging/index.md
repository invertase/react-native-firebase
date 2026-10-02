# @react-native-firebase/messaging

Knowledge for FCM messaging native behavior: the iOS `UNUserNotificationCenter` delegate-forwarding chain shared with the host app's `AppDelegate`, APNs registration on Simulator, and Firebase Installation ID (FID) registration.

## Documents

* [iOS UNUserNotificationCenter delegate forwarding](ios-notification-delegate-forwarding.md) — `completionHandler` exactly-once contract, delegate chaining design, regression history (#8754 → #8786 → #9049 / #9050)
* Native integration probes (`completesNonFCMRemoteNotification` / `serializeMessagingUserInfo` via `NativeRNFBTesting`; `messagingPreservesExistingDelegate` via `RNFBTestingMessaging`; `messagingStoreSupportsDisabledStorage` via `NativeRNFBTesting`) — [running e2e § test-app native modules](../../testing/running-e2e.md#test-app-native-modules); product-line hits — [coverage design § test native modules](../../testing/coverage-design.md#test-native-modules)
* [iOS APNs registration on Simulator](ios-apns-simulator-registration.md) — intentional ARM64 Simulator skip of UIKit register + global-queue `registration-timeout`

<a id="installation-id-messaging"></a>

## Installation ID (FID) messaging

`register`, `unregister`, `onRegistered`, and `onUnregistered` use the Firebase Installation ID instead of an FCM registration token. User-facing setup, opt-in snippets, and usage: [Installation ID messaging](../../../docs/messaging/server-integration.mdx#installation-id-messaging) (also [usage § Installation ID messaging](../../../docs/messaging/usage/index.mdx#installation-id-messaging-optional)).

| Item | Value |
|------|-------|
| **Opt-in flag** | Android manifest meta-data `firebase_messaging_installation_id_enabled`; iOS `Info.plist` `FirebaseMessagingInstallationIdEnabled`; Expo plugin prop `installationIdEnabled` (writes both). **Off by default**; the library does not set it. |
| **Native → JS** | `getConstants().isInstallationIdEnabled`, read once when the JS module is created ([`lib/index.ts`](../../../packages/messaging/lib/index.ts)) |
| **Flag off** | `register` / `unregister` reject and `onRegistered` / `onUnregistered` throw `messaging/installation-id-not-enabled`. Token APIs keep working. |
| **Flag on** | Token APIs (`getToken`, `deleteToken`, `onTokenRefresh`) reject or throw `messaging/token-api-disabled`. |
| **Error owners** | [`lib/installationIdMode.ts`](../../../packages/messaging/lib/installationIdMode.ts) (codes, messages) |
| **Events** | Native emits `messaging_registered` / `messaging_unregistered` with `installationId`; `onRegistered` replays the cached FID to a new subscriber while registered. It subscribes first, then replays; a replay callback that throws is rethrown on `setTimeout(..., 0)` (where a throwing live listener ends up) so the caller still receives a working unsubscribe function |

`register()` does not perform APNs registration on iOS; `registerDeviceForRemoteMessages` remains separate ([APNs on Simulator](ios-apns-simulator-registration.md)).

<a id="unit-tests"></a>

## Unit tests

Detox e2e runs with the FID flag **off** (`messaging.e2e.js` asserts the `messaging/installation-id-not-enabled` paths only), so flag-on native behavior is **not** covered by e2e. It is covered by:

| Layer | Location | Scope |
|-------|----------|-------|
| **JS (Jest)** | [`__tests__/messaging.test.ts`](../../../packages/messaging/__tests__/messaging.test.ts), [`plugin/__tests__/`](../../../packages/messaging/plugin/__tests__) | Flag-on/off mode checks and cached-FID replay in `lib/`. Expo plugin: [`androidPlugin.test.ts`](../../../packages/messaging/plugin/__tests__/androidPlugin.test.ts) covers the Android `firebase_messaging_installation_id_enabled` meta-data (written once when `true`, nothing when omitted or `false`); [`iosPlugin.test.ts`](../../../packages/messaging/plugin/__tests__/iosPlugin.test.ts) covers `plugin/src/ios/setupInstallationId.ts` (`true` writes `FirebaseMessagingInstallationIdEnabled`, omitted or `false` write nothing, existing `Info.plist` keys are preserved) and that the plugin index composes the iOS and Android steps |
| **iOS XCTest** | [`ios/RNFBMessagingUnitTests/`](../../../packages/messaging/ios/RNFBMessagingUnitTests) | Real `RNFBMessagingModule.mm` and `RNFBMessaging+FIRMessagingDelegate.m` (`register` / `unregister`, constants, `didReceiveRegistration` / `didUnregister` event emit and delegate forwarding) compiled on macOS against hand-written stub headers and test doubles for React, Firebase, and UIKit; see [stub-header projects](../../testing/ios-architecture-decisions.md#iostest-ad-1-stub-headers). Run via `yarn tests:ios:unit`; LCOV merges into `coverage/ios-native/lcov.info` ([coverage design](../../testing/coverage-design.md#ios-xctest-unit-lcov)). `RNFBMessaging.podspec` excludes `ios/*UnitTests/**/*` so nested stub headers stay out of the pod ([podspec exclude](../../testing/ios-architecture-decisions.md#iostest-ad-1-stub-headers)). |
| **Android JVM** | [`android/src/test/java/io/invertase/firebase/messaging/`](../../../packages/messaging/android/src/test/java/io/invertase/firebase/messaging) (`NativeRNFBTurboMessagingInstallationIdTest`, `ReactNativeFirebaseMessagingInstallationIdEventsTest`) | Manifest flag constant, `register` / `unregister`, FID event builders and service callbacks. Robolectric + Mockito per [AndroidTest-AD-1](../../testing/android-architecture-decisions.md#androidtest-ad-1); `NativeRNFBTurboMessaging.firebaseMessaging()` is the package-private test seam. Run via `yarn tests:android:unit`. |

Neither native unit layer replaces platform e2e for module load and native↔JS delivery ([platform coverage gate](../../testing/running-e2e.md#platform-coverage-gate-blocking)).

<a id="known-coverage-limits"></a>

### Known coverage limits

Two maintainer-accepted [exceptions](../../testing/change-authoring-workflow.md#acceptable-exceptions) apply to the FID flag-on paths. Both stay tracked here until resolved.

* **Generated `register` / `unregister` JSI glue (iOS).** `__hostFunction_NativeRNFBTurboMessagingSpecJSI_register` and `__hostFunction_NativeRNFBTurboMessagingSpecJSI_unregister` in [`RNFBMessagingTurboModules-generated.mm`](../../../packages/messaging/ios/generated/RNFBMessagingTurboModules/RNFBMessagingTurboModules-generated.mm) are codegen output with no hand-written logic. The e2e app runs flag-off, so these flag-on entry points never execute on device, and the native unit tests bypass JSI. The hand-written bridge they forward to (`RNFBMessagingModule.mm`) is covered by `RNFBMessagingUnitTests`. This exception covers only this module's `register` / `unregister` glue, not generated code in general.
* **Flag-on paths verified against mocks only (deferral).** `register`, `unregister`, `onRegistered`, and `onUnregistered` with the flag on are verified by mocked-SDK unit tests (Jest, `RNFBMessagingUnitTests`, Android Robolectric/Mockito), not against the real Firebase SDK on a device. The shared e2e app cannot turn the flag on app-wide without breaking the existing `getToken` / `deleteToken` / `onTokenRefresh` e2e. Mocked unit coverage is accepted for now. On-device verification is manual: build a test app with the opt-in keys set ([user docs](../../../docs/messaging/server-integration.mdx#installation-id-messaging)) and exercise `register` and `onRegistered`.

## Related repository files

* [`packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m) — foreground `willPresentNotification` / `didReceiveNotificationResponse` delegate forwarding
* [`packages/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+AppDelegate.m) — background/remote-notification `AppDelegate` swizzling
* [`packages/messaging/ios/RNFBMessaging/RNFBMessaging+FIRMessagingDelegate.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+FIRMessagingDelegate.m): FID `didReceiveRegistration` / `didUnregister` event emit and delegate forwarding
* [`packages/messaging/lib/index.ts`](../../../packages/messaging/lib/index.ts) — JS entry, headless task registration, FID mode gating
