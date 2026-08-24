---
type: Reference
title: "@react-native-firebase/app"
description: Knowledge index for the core app package — Firebase app lifecycle, Expo config plugin, and iOS SPM / CocoaPods integration helpers.
tags: [app, expo, ios, spm, cocoapods, firebase, integration, test-expo]
timestamp: 2026-08-21T00:00:00Z
---

# @react-native-firebase/app

Knowledge for the core app package: Firebase app lifecycle, Expo config plugin, and iOS SPM / CocoaPods integration helpers.

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md). Agent shell commands: [agent command policy](../../testing/agent-command-policy.md) only.

The workspace Expo documented-path iOS **link** fixture (`test-expo/`) is not Detox e2e. Canonical command: `yarn test-expo:ios:link` ([agent command policy](../../testing/agent-command-policy.md)). App-target FirebaseCore linking and CocoaPods hook order: [iOS SPM native integration](../../ios-spm-native-imports.md#app-target-firebasecore-link-package-dependency-alone-is-not-enough). Do not treat duplicate `_FIRFirebaseVersion` ([#9202](https://github.com/invertase/react-native-firebase/issues/9202)) as that closer.

## Documents

* Cross-cutting durable SPM decisions: [iOS SPM native integration](../../ios-spm-native-imports.md) ([app-target FirebaseCore link](../../ios-spm-native-imports.md#app-target-firebasecore-link-package-dependency-alone-is-not-enough))

## Related repository files

* [`packages/app/firebase_spm.rb`](../../../packages/app/firebase_spm.rb) — SPM activation, embed phase, `rnfirebase_add_spm_core_to_app_target`
* [`packages/app/__tests__/`](../../../packages/app/__tests__/) — Ruby SPM unit tests
* [`packages/app/plugin/src/ios/appDelegate.ts`](../../../packages/app/plugin/src/ios/appDelegate.ts) — Expo AppDelegate `FirebaseApp.configure()` injection
* [`test-expo/`](../../../test-expo/) — workspace Expo documented-path iOS link fixture
* Consumer Expo linkage: [`docs/ios-spm.mdx`](../../../docs/ios-spm.mdx) (config plugins; no agent `expo prebuild` / `xcodebuild` steps)
