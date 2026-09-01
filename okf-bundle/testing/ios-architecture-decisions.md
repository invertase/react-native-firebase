---
type: Reference
title: iOS unit testing decisions (ADR)
description: Canonical owner of durable decisions for in-package iOS XCTest (macOS/host first, Simulator only if UIKit required).
tags: [testing, ios, unit, xctest, lcov, adr]
timestamp: 2026-08-20T00:00:00Z
---

# iOS unit testing decisions (ADR)

**Canonical owner** of durable decisions for **in-package iOS XCTest** under `packages/*/ios/*UnitTests/*.xcodeproj`. Commands: [agent command policy](agent-command-policy.md), [validation checklist](validation-checklist.md). Coverage contract: [coverage design](coverage-design.md). CI shape: [iOS CI workflows](../ci-workflows/ios.md).

Host-first preference is the iOS counterpart of [AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1) (JUnit over Robolectric unless Android APIs are required). Do not duplicate that Android table here.

**Policy:** [OKF documentation policy](../documentation-policy.md). Do not duplicate these decisions in work queues.

## Decision ID convention

Use the **`IosTest-AD-<n>`** prefix when citing these decisions in code or docs.

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decided; CI and local yarn scripts enforce this. |
| **Proposed** | Planned; not yet enforced. |

---

<a id="iostest-ad-1"></a>
<a id="iostest-ad-1--macos-host-first-in-package-xctest--accepted"></a>

## IosTest-AD-1 — macOS/host-first in-package XCTest — **Accepted**

Prefer a tiny **in-package xcodeproj** that compiles Foundation-only sources and runs XCTest on a **macOS destination**. Use an iOS Simulator destination only when the class under test needs UIKit (or other iOS-only frameworks) that cannot be replaced by a very small mock.

| Aspect | Decision |
|--------|----------|
| Location | **One xcodeproj per package**, not per class: `packages/<pkg>/ios/RNFB<Package>UnitTests/` (examples: `RNFBAppUnitTests`, `RNFBFunctionsUnitTests`) next to production `packages/*/ios/**` sources. Discovery glob stays `packages/*/ios/*UnitTests/*.xcodeproj`. Test **sources** keep the class name as the **final path segment** (e.g. `RNFBHandleMapTests.m`). **Not** CocoaPods `test_spec`. **Not** the Detox host (`tests/ios/testingTests`). |
| Default destination | `platform=macOS` for Foundation logic |
| Simulator | Only when UIKit / iOS-only APIs are required |
| Entry command | `yarn tests:ios:unit` → `tests/scripts/run-ios-unit-tests.js` (discovers `*UnitTests.xcodeproj`) |
| Coverage artifact | `coverage/ios-unit/lcov.info`, **merged into** `coverage/ios-native/lcov.info` so XCTest hits **count** toward the 100% touched-line bar — [coverage design](coverage-design.md) |
| CI | `tests_e2e_ios.yml` after `yarn`, analogous to `yarn tests:android:unit` on the Android e2e workflow |

**Why:** Detox/Jet e2e cannot reliably drive lock-only pointer maps, unique-put collisions, or `takeAll` invalidate paths. Host XCTest proves those contracts without a simulator. CocoaPods `test_spec` would pull React/Firebase into the unit graph; the Detox test app is an integration host, not a package unit harness.

**Do not** add a production `*Bridge` type solely so those tests can compile TurboModule collision/invalidate branches. XCTest stays Foundation-only (Registry + HandleMap). TurboModule/Helper lines that only call Registry/HandleMap may stay uncovered — [coverage design](coverage-design.md#coverage-expectations-policy) (user-accepted exception).

**Not a substitute for area e2e:** In-package XCTest does **not** replace [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) delivery/integration e2e on platforms where the module loads.

**Podspec:** Exclude `ios/*UnitTests/**` from package `source_files` so XCTest sources are not compiled into the production pod.

**Pack / attw:** nested XCTest `build/` trees — [Types-AD-5](architecture-decisions.md#types-ad-5--pack-ignores-nested-ios-unit-build-trees--accepted).
