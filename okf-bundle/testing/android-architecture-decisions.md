---
type: Reference
title: Android unit testing decisions (ADR)
description: Canonical owner of durable decisions for Android JVM unit tests (JUnit-first, Robolectric when Android APIs are required, Mockito, Jacoco *.exec).
tags: [testing, android, unit, junit, robolectric, mockito, jacoco, adr]
timestamp: 2026-07-22T00:00:00Z
---

# Android unit testing decisions (ADR)

**Canonical owner** of durable decisions for Android **JVM** unit tests under `packages/*/android/src/test/java`. Commands: [agent command policy](agent-command-policy.md), [validation checklist](validation-checklist.md). Coverage contract: [coverage design](coverage-design.md). CI shape: [Android CI workflows](../ci-workflows/android.md). iOS counterpart: [IosTest-AD-1](ios-architecture-decisions.md#iostest-ad-1).

**Policy:** [OKF documentation policy](../documentation-policy.md). Do not duplicate these decisions in work queues.

## Decision ID convention

Use the **`AndroidTest-AD-<n>`** prefix when citing these decisions in code or docs.

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decided; CI and local yarn scripts enforce this. |
| **Proposed** | Planned; not yet enforced. |

---

<a id="androidtest-ad-1"></a>
<a id="androidtest-ad-1--junit-first-android-jvm-unit-tests--accepted"></a>
<a id="androidtest-ad-1--robolectric--mockito-for-android-jvm-unit-tests--accepted"></a>

## AndroidTest-AD-1 — JUnit-first Android JVM unit tests — **Accepted**

Prefer **plain JUnit4** for Android Java state-machine / bridge logic that e2e cannot synthesize. Use **Robolectric** only when the class under test needs Android framework APIs that cannot be replaced by a very small (about 1–5 line) mock or test double.

| Aspect | Decision |
|--------|----------|
| Location | `packages/*/android/src/test/java/**` |
| Default runner | Plain JUnit4 — when the class under test does not need Android APIs, or those APIs can be replaced by a ~1–5 line mock |
| Robolectric | `@RunWith(RobolectricTestRunner.class)` only when Android APIs are necessary (Handler/Looper, Application, PackageInfo, and similar) |
| `@Config` | Omit unless the test **fails without it**. Keep the smallest working annotation (for example `application = …` when a custom `Application` is required). **Never pin `sdk` unless that test fails without the pin** — an `sdk` pin triggers a large on-demand Robolectric `android-all` download. Do not treat an `sdk` pin as a general requirement. |
| Doubles | Mockito (`mock`, `mockStatic`, etc.) for RN host/context APIs; prefer a small mock over pulling in Robolectric |
| Entry command | `yarn tests:android:unit` → `tests/android` `./gradlew rnfbDebugUnitTests` |
| Coverage artifact | Module Jacoco `*.exec` (merged into Codecov via `jacocoTestReport` — [coverage design](coverage-design.md)) |

**Why:** Detox/Jet e2e loads one live React Native generation and cannot reliably drive overlapping context generations, synthetic host wiring, or precise looper scheduling needed for some bridge state machines. JVM tests prove those contracts without an emulator. Plain JUnit4 is enough for logic that does not need the Android framework; Robolectric stays reserved for Handler/Looper, Application, PackageInfo, and similar APIs.

Existing tests that still need Robolectric include `ReactNativeFirebaseEventEmitter`, `NativeRNFBTurboApp`, and `NativeRNFBTurboUtils`. **Omit `@Config` unless a test fails without it. Never pin `sdk` unless that test fails.** EventEmitter and TurboApp require `application = HostApplication` (without it, `@Before` fails with `ClassCastException` when casting `RuntimeEnvironment.getApplication()`). Utils has no `@Config`.

Do **not** put the test-app `targetSdk` **36** on `rootProject.ext.targetSdkVersion` in `tests/android/build.gradle`. Invertase `applyAndroidVersions()` treats that property as a library override (`android.targetSdk using custom value: 36`). Libraries must keep `packages/*/package.json` `sdkVersions.android.targetSdk` (**34** for `@react-native-firebase/app`). Overlaying 36 makes Robolectric **4.14.1** `DefaultSdkPicker` reject the package:

```
java.lang.IllegalArgumentException: Package targetSdkVersion=36 > maxSdkVersion=35
    at org.robolectric.plugins.DefaultSdkPicker.configuredSdks(DefaultSdkPicker.java:119)
```

That exception is a reason **not** to inherit test-app targetSdk on libraries — not a reason to pin `@Config(sdk = 34)` on every Robolectric class. The test **application** named `app` stays at 36 via `ext.appTargetSdkVersion` (a name `applyAndroidVersions()` does not consume). The `subprojects` overlay may still align library `compileSdk` / `minSdk` with the test app so the composite project compiles; it must **not** assign `targetSdkVersion` on those libraries.

**Not a substitute for area e2e:** JVM tests do **not** replace [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) delivery/integration e2e on platforms where the module loads. Multi-generation races may be proven **primarily** via JVM tests; e2e remains required for load, flush, and native↔JS delivery on those platforms.

**Formatting:** Java under `packages/*/android/src` uses **`yarn lint:android` only** — [agent command policy](agent-command-policy.md).
