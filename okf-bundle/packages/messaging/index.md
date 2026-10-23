# @react-native-firebase/messaging

Knowledge for FCM messaging native behavior: the iOS `UNUserNotificationCenter` delegate-forwarding chain shared with the host app's `AppDelegate`, APNs registration on Simulator, Firebase Installation ID (FID) registration, and Android background-message delivery during a React Native cold start.

## Documents

* [iOS UNUserNotificationCenter delegate forwarding](ios-notification-delegate-forwarding.md) — `completionHandler` exactly-once contract, delegate chaining design, regression history (#8754 → #8786 → #9049 / #9050)
* Native integration probes (`completesNonFCMRemoteNotification` / `serializeMessagingUserInfo` via `NativeRNFBTesting`; `messagingPreservesExistingDelegate` via `RNFBTestingMessaging`; `messagingStoreSupportsDisabledStorage` via `NativeRNFBTesting`) — [running e2e § test-app native modules](../../testing/running-e2e.md#test-app-native-modules); product-line hits — [coverage design § test native modules](../../testing/coverage-design.md#test-native-modules)
* [iOS APNs registration on Simulator](ios-apns-simulator-registration.md) — intentional ARM64 Simulator skip of UIKit register + global-queue `registration-timeout`

<a id="installation-id-messaging"></a>

## Installation ID (FID) messaging

`register`, `unregister`, `onRegistered`, and `onUnregistered` use the Firebase Installation ID instead of an FCM registration token. User-facing setup, opt-in snippets, and usage: [Installation ID messaging](../../../docs/messaging/server-integration.mdx#installation-id-messaging) (also [usage § Installation ID messaging](../../../docs/messaging/usage/index.mdx#installation-id-messaging-optional)).

| Item | Value |
|------|-------|
| **Opt-in flag** | `firebase.json` `messaging_installation_id_enabled` (preferred bare RN; Android `build.gradle` → manifest placeholder, iOS `ios_config.sh` → Info.plist); or Android manifest meta-data `firebase_messaging_installation_id_enabled`; iOS `Info.plist` `FirebaseMessagingInstallationIdEnabled`; Expo plugin prop `installationIdEnabled` (writes both). **Off by default**. |
| **Native → JS** | `getConstants().isInstallationIdEnabled`, read once when the JS module is created ([`lib/index.ts`](../../../packages/messaging/lib/index.ts)) |
| **Flag off** | `register` / `unregister` reject and `onRegistered` / `onUnregistered` throw `messaging/installation-id-not-enabled`. Token APIs keep working. |
| **Flag on** | Token APIs (`getToken`, `deleteToken`, `onTokenRefresh`) reject or throw `messaging/token-api-disabled`. |
| **Error owners** | [`lib/installationIdMode.ts`](../../../packages/messaging/lib/installationIdMode.ts) (codes, messages) |
| **Events** | Native emits `messaging_registered` / `messaging_unregistered` with `installationId`; `onRegistered` replays the cached FID to a new subscriber while registered. It subscribes first, then replays; a replay callback that throws removes the subscription and the error is rethrown from `onRegistered`, so no unreachable listener is left attached |

`register()` does not perform APNs registration on iOS; `registerDeviceForRemoteMessages` remains separate ([APNs on Simulator](ios-apns-simulator-registration.md)).

<a id="android-headless-cold-start"></a>

## Android background messages during cold start

[`ReactNativeFirebaseMessagingHeadlessService`](../../../packages/messaging/android/src/main/java/io/invertase/firebase/messaging/ReactNativeFirebaseMessagingHeadlessService.java) runs each background message as the headless JS task `ReactNativeFirebaseMessagingHeadlessTask`.

| Item | Value |
|------|-------|
| **Race** | Bridgeless `ReactHostImpl` publishes its `ReactContext` before it attaches the `ReactInstance`. Stock `HeadlessJsTaskService.startTask` only waits when the context is `null`; with a context but `hasActiveReactInstance() == false`, `HeadlessJsTaskContext.startTask` logs the soft exception `Cannot start headless task, CatalystInstance not available`, still registers the task and its timeout, and the JS handler never runs. |
| **Fix** | The service overrides `onStartCommand` (RN `startTask` is final and `invokeStartTask` is private) and queues task configs. They start in arrival order once the instance is active. It picks `ReactHost` (bridgeless) or `ReactInstanceManager` (bridge) with `ReactNativeNewArchitectureFeatureFlags.enableBridgelessArchitecture()`, the same check `HeadlessJsTaskService.getReactContext` uses, and reads the context from that same host. If the instance is not active, it registers one `ReactInstanceEventListener` there and starts React only when there is no context yet. After `onReactContextInitialized` it hops through `runOnJSQueueThread` (the react-native-background-fetch pattern; if that returns `false` it posts straight to the UI thread), then back to the UI thread, and checks the instance again before it starts the tasks. Draining the queue removes the listener and cancels the wait timeout. |
| **Bound** | The wait is limited by `messaging_android_headless_task_timeout` (the deadline uses the oldest queued task's timeout when the wait starts; `<= 0` means no limit; every message task carries the same configured value). On expiry the queue is dropped, the listener is removed, and the service stops itself when none of its tasks are running. `onDestroy` releases the wake lock. |
| **Lifecycle** | The service tracks its own task ids and stops only when its own tasks have finished and nothing is queued. It calls `stopSelfResult` with the latest `startId`, so a start already on its way to `onStartCommand` keeps the service alive. |

<a id="android-headless-cold-start-repro"></a>

### Reproducing on an emulator

The emulator and `adb` commands below are **not** on the [agent command allowlist](../../testing/agent-command-policy.md). Agents need explicit user authorization to run them.

1. Install the `tests/` app on an emulator, and open it so it registers an FCM token.
2. From the app, call the live testing project's `sendFCM` callable (`.github/workflows/scripts/functions/src/sendFCM.ts`, `{ message, delay }`) several times with data-only, `priority: "high"` messages to that token and the **same** `delay`, so they arrive together. The callable never resolves, so call it without awaiting the result. One message on its own is a clean cold start and is delivered; only a burst exposes the race.
3. Before the delay elapses, send the app to the background (press Home) and kill the process with `adb shell am kill com.invertase.testing`. `am kill` only kills a backgrounded process. Do **not** use `am force-stop`: a force-stopped package receives no FCM broadcasts until it is launched again.
4. Watch `adb logcat`. The first broadcast starts React. Messages whose broadcasts land between `Creating BridgelessReactContext` and `Loading JS Bundle` (both logged under the `BridgelessReact` logcat tag as `ReactHost{N}.getOrCreateReactInstanceTask(): ...`; the instance is attached just before `Loading JS Bundle`) are lost on unfixed code: each loss logs one `Cannot start headless task` soft exception and its handler never runs. With the fix, all messages reach the handler and that soft exception is absent.

The JVM proof of the ordering is `ReactNativeFirebaseMessagingHeadlessServiceTest` ([§ unit tests](#unit-tests)).

<a id="unit-tests"></a>

## Unit tests

Detox e2e runs with the FID flag **off** (`messaging.e2e.js` asserts the `messaging/installation-id-not-enabled` paths only), so flag-on native behavior is **not** covered by e2e. It is covered by:

| Layer | Location | Scope |
|-------|----------|-------|
| **JS (Jest)** | [`__tests__/messaging.test.ts`](../../../packages/messaging/__tests__/messaging.test.ts), [`plugin/__tests__/`](../../../packages/messaging/plugin/__tests__) | Flag-on/off mode checks and cached-FID replay in `lib/`. Expo plugin: [`androidPlugin.test.ts`](../../../packages/messaging/plugin/__tests__/androidPlugin.test.ts) covers the Android `firebase_messaging_installation_id_enabled` meta-data (written once when `true`, nothing when omitted or `false`); [`iosPlugin.test.ts`](../../../packages/messaging/plugin/__tests__/iosPlugin.test.ts) covers `plugin/src/ios/setupInstallationId.ts` (`true` writes `FirebaseMessagingInstallationIdEnabled`, omitted or `false` write nothing, existing `Info.plist` keys are preserved) and that the plugin index composes the iOS and Android steps |
| **iOS XCTest** | [`ios/RNFBMessagingUnitTests/`](../../../packages/messaging/ios/RNFBMessagingUnitTests) | Real `RNFBMessagingModule.mm` and `RNFBMessaging+FIRMessagingDelegate.m` (`register` / `unregister`, constants, `didReceiveRegistration` / `didUnregister` event emit and delegate forwarding) compiled on macOS against hand-written stub headers and test doubles for React, Firebase, and UIKit; see [stub-header projects](../../testing/ios-architecture-decisions.md#iostest-ad-1-stub-headers). Run via `yarn tests:ios:unit`; LCOV merges into `coverage/ios-native/lcov.info` ([coverage design](../../testing/coverage-design.md#ios-xctest-unit-lcov)). `RNFBMessaging.podspec` excludes `ios/*UnitTests/**/*` so nested stub headers stay out of the pod ([podspec exclude](../../testing/ios-architecture-decisions.md#iostest-ad-1-stub-headers)). |
| **Android JVM** | [`android/src/test/java/io/invertase/firebase/messaging/`](../../../packages/messaging/android/src/test/java/io/invertase/firebase/messaging) (`NativeRNFBTurboMessagingInstallationIdTest`, `ReactNativeFirebaseMessagingInstallationIdEventsTest`, `ReactNativeFirebaseMessagingHeadlessServiceTest`) | Manifest flag constant, `register` / `unregister`, FID event builders and service callbacks. Headless cold-start scheduling ([§ cold start](#android-headless-cold-start)) runs against the real `HeadlessJsTaskContext` with mocked hosts, context and `AppRegistry`: no context, context without an instance, ready instance, FIFO, timeout, leftover listener after a drain, `runOnJSQueueThread` returning `false`, `stopSelfResult` start id, bridge path. Architecture selection is driven by mocking `ReactNativeNewArchitectureFeatureFlags.enableBridgelessArchitecture()`. Robolectric + Mockito per [AndroidTest-AD-1](../../testing/android-architecture-decisions.md#androidtest-ad-1); `NativeRNFBTurboMessaging.firebaseMessaging()` is the package-private test seam. Run via `yarn tests:android:unit`. |

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
