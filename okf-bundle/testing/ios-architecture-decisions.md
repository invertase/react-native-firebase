---
type: Reference
title: iOS unit testing decisions (ADR)
description: Canonical owner of durable decisions for in-package iOS XCTest (macOS/host first, Simulator only if UIKit required).
tags: [testing, ios, unit, xctest, lcov, adr]
timestamp: 2026-10-01T00:00:00Z
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

Prefer a tiny **in-package xcodeproj** that compiles the real production sources and runs XCTest on a **macOS destination**. Most projects compile Foundation-only sources (registries, handle maps). When a production file must import React, Firebase, or UIKit, the project still stays on macOS: it compiles that file unchanged against **hand-written stub headers and test doubles** kept inside the unit project directory (see [stub-header projects](#iostest-ad-1-stub-headers)). Use an iOS Simulator destination only when the class under test needs UIKit (or other iOS-only frameworks) that cannot be replaced by a very small stub or double.

| Aspect | Decision |
|--------|----------|
| Location | **One xcodeproj per package**, not per class: `packages/<pkg>/ios/RNFB<Package>UnitTests/` (examples: `RNFBAppUnitTests`, `RNFBFunctionsUnitTests`) next to production `packages/*/ios/**` sources. Discovery glob stays `packages/*/ios/*UnitTests/*.xcodeproj`. Test **sources** keep the class name as the **final path segment** (e.g. `RNFBHandleMapTests.m`). **Not** CocoaPods `test_spec`. **Not** the Detox host (`tests/ios/testingTests`). |
| Default destination | `platform=macOS` for Foundation logic |
| Simulator | Only when UIKit / iOS-only APIs are required |
| Entry command | `yarn tests:ios:unit` → `tests/scripts/run-ios-unit-tests.js` (discovers `*UnitTests.xcodeproj`) |
| Coverage artifact | `coverage/ios-unit/lcov.info`, **merged into** `coverage/ios-native/lcov.info` so XCTest hits **count** toward the 100% touched-line bar — [coverage design](coverage-design.md) |
| CI | `tests_e2e_ios.yml` after `yarn`, analogous to `yarn tests:android:unit` on the Android e2e workflow |

**Why:** Detox/Jet e2e cannot reliably drive lock-only pointer maps, unique-put collisions, `takeAll` invalidate paths, or native paths gated behind a flag the test app leaves off. Host XCTest proves those contracts without a simulator. CocoaPods `test_spec` would pull the real React/Firebase pods into the unit graph; the Detox test app is an integration host, not a package unit harness.

**Do not** add a production `*Bridge` type solely so those tests can compile TurboModule collision/invalidate branches. Registry/HandleMap-style projects stay Foundation-only. TurboModule/Helper lines that only call Registry/HandleMap may stay uncovered — [coverage design](coverage-design.md#coverage-expectations-policy) (user-accepted exception).

<a id="iostest-ad-1-stub-headers"></a>

### Stub-header projects

A package whose logic lives in TurboModule or delegate files (not a separable Registry) may compile those production `.m`/`.mm` files directly instead:

| Aspect | Decision |
|--------|----------|
| Production sources | Referenced from `../<Package>/` (for example `RNFBMessagingModule.mm`); never copied or edited for the test |
| Stubs | `Stubs/` under the unit project: minimal headers for React, Firebase, GoogleUtilities, RNFBApp, UIKit, and the codegen'd TurboModule header; added to `HEADER_SEARCH_PATHS` ahead of the package sources |
| Generated-header stub | Name the stub file distinctly (for example `RNFBMessagingTurboModulesStub.h`, not `RNFBMessagingTurboModules.h`) and expose it under the name production imports through a clang VFS overlay (`Stubs/rnfb-messaging-vfs-overlay.yaml`, passed as `-ivfsoverlay` plus `-I/<virtual-dir>` in the project's `OTHER_CFLAGS`). Never copy a stub into any directory under a package's `ios/` tree under the generated header's name, including `build/` output |
| Doubles | One test-doubles `.mm` implements the stubbed classes (recording emitter, fake SDK object, UIKit shims) with `*ForTesting` hooks; no real SDK or React framework is linked |
| Scope | Stubs declare only the symbols the compiled production files reference; keep them as small as possible |
| Coverage | Same `coverage/ios-unit/lcov.info` path as every other unit project; real production lines get hits |

**Why the distinct name:** `packages/app/__tests__/specNativeParityHelper.ts` (`findSingleMatch`) walks `packages/<pkg>/ios` for `/^RNFB.*TurboModules\.h$/` and throws on more than one match. A second physical file with a generated header's name anywhere under `ios/` (gitignored `build/` included) makes `turboModuleSpecNativeParity.test.ts` run 0 tests and fails the full `yarn tests:jest`.

Example: `RNFBMessagingUnitTests`, see [messaging index](../packages/messaging/index.md#unit-tests).

**Not a substitute for area e2e:** In-package XCTest does **not** replace [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) delivery/integration e2e on platforms where the module loads.

**Podspec:** Exclude `ios/*UnitTests/**/*` from package `source_files` so XCTest sources are not compiled into the production pod. A trailing `**` alone only matches one directory level, so files in nested folders (for example stub headers under `Stubs/`) leak into the pod target. Messaging uses `**/*`. The other packages with `*UnitTests` dirs still use the one-level `ios/*UnitTests/**` glob, which is only safe while those dirs have no nested folders.

**Pack / attw:** nested XCTest `build/` trees — [Types-AD-5](architecture-decisions.md#types-ad-5--pack-ignores-nested-ios-unit-build-trees--accepted).
