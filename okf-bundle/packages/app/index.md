---
type: Reference
title: "@react-native-firebase/app"
description: Knowledge index for the core app package — Firebase app lifecycle, Expo config plugin, and iOS SPM / CocoaPods integration helpers.
tags: [app, expo, ios, spm, cocoapods, firebase, integration, test-expo, test-rn-bare]
timestamp: 2026-09-03T00:00:00Z
---

# @react-native-firebase/app

Knowledge for the core app package: Firebase app lifecycle, Expo config plugin, and iOS SPM / CocoaPods integration helpers.

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md). Agent shell commands: [agent command policy](../../testing/agent-command-policy.md) only.

The workspace Expo documented-path iOS **link** fixture (`test-expo/`) is not Detox e2e. Canonical command: `yarn test-expo:ios:link` ([agent command policy](../../testing/agent-command-policy.md)). App-target FirebaseCore linking and CocoaPods hook order: [iOS SPM native integration](../../ios-spm-native-imports.md#app-target-firebasecore-link-package-dependency-alone-is-not-enough). Expo precompiled RNCore linkage repair and duplicate-symbol regression: [iOS SPM native integration § Expo precompiled module linkage repair](../../ios-spm-native-imports.md#expo-precompiled-module-linkage-repair).

The workspace RN CLI prebuilt RNCore iOS **build** fixture (`test-rn-bare/`) is not Detox e2e and is not the Expo link closer. Canonical command: `yarn test-rn-bare:ios:build` ([agent command policy](../../testing/agent-command-policy.md)). Consumer compile (GitHub #8883) is this fixture; producer podspecs stay in [iOS RNCore podspec invariants](../../ios-rncore-podspec.md). Issue 2 pin stays on `tests/` ([test app dependency pins](../../testing/test-app-dependency-pins.md)).

## Documents

* Cross-cutting durable SPM decisions: [iOS SPM native integration](../../ios-spm-native-imports.md) ([app-target FirebaseCore link](../../ios-spm-native-imports.md#app-target-firebasecore-link-package-dependency-alone-is-not-enough); [Expo precompiled linkage repair](../../ios-spm-native-imports.md#expo-precompiled-module-linkage-repair))

## Related repository files

* [`packages/app/firebase_spm.rb`](../../../packages/app/firebase_spm.rb) — SPM activation, embed phase, `rnfirebase_add_spm_core_to_app_target`
* [`packages/app/__tests__/`](../../../packages/app/__tests__/) — Ruby SPM unit tests
* [`packages/app/plugin/src/ios/appDelegate.ts`](../../../packages/app/plugin/src/ios/appDelegate.ts) — Expo AppDelegate `FirebaseApp.configure()` injection
* [`test-expo/`](../../../test-expo/) — workspace Expo documented-path iOS link fixture
* [`test-rn-bare/`](../../../test-rn-bare/) — workspace RN CLI prebuilt RNCore iOS compile fixture (not Detox)
* Consumer Expo linkage: [`docs/ios-spm.mdx`](../../../docs/ios-spm.mdx) (config plugins; no agent `expo prebuild` / `xcodebuild` steps)
