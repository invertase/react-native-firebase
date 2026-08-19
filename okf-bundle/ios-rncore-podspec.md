---
type: Reference
title: iOS RNCore podspec invariants
description: Clang non-modular-includes flag and pod_target_xcconfig order for RNFB CocoaPods specs under use_frameworks!.
tags: [ios, podspec, rncore, cocoapods]
timestamp: 2026-08-18T00:00:00Z
---

# iOS RNCore podspec invariants

Canonical owner for RNFB **handwritten** `RNFB*.podspec` xcconfig around React
Native's prebuilt RNCore and `use_frameworks!`. Not consumer setup.

Two independent RNCore problems. This file is **Issue 1** (compile-time,
inside RNFB pods), GitHub #9200.
**Issue 2** (link-time, `tests/` only: third-party dynamic pods vs prebuilt
RNCore) is owned by
[test app dependency pins](testing/test-app-dependency-pins.md). Firebase SPM
imports and embed: [iOS SPM native integration decisions](ios-spm-native-imports.md).

**Policy:** [OKF documentation and commit policy](documentation-policy.md).

## Decision summary

1. Set `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` on
   `pod_target_xcconfig` so RNFB umbrellas that re-export `<React/...>`
   validate as framework modules under `use_frameworks!`.
2. Assign that hash (plus any pod-local `HEADER_SEARCH_PATHS`) **before**
   `install_modules_dependencies`. Reassigning afterwards overwrites
   helper-injected `HEADER_SEARCH_PATHS` and
   `CLANG_CXX_LANGUAGE_STANDARD=c++20`, which breaks from-source RNCore
   (`react/timing/primitives.h` → `react/debug/flags.h`).
3. Live New Architecture pods call `install_modules_dependencies`, which
   already calls `add_rncore_dependency` (RN 0.84+
   `new_architecture.rb`). Do not call `add_rncore_dependency` again on
   those specs.
4. Specs that do **not** call `install_modules_dependencies` (the package
   template) must call `add_rncore_dependency(s)` themselves, guarded by
   `defined?`.

## Why not an extra `add_rncore_dependency` on live pods

RN's `NewArchitectureHelper.install_modules_dependencies` writes
`pod_target_xcconfig` then calls `add_rncore_dependency(spec)` so the
helper's xcconfig assignment cannot wipe RNCore search paths. A second
call from the podspec duplicates VFS overlay flags. The RNFB-specific
work is the Clang flag and the order of our hash assignment.

## Review invariants

When RNFB podspecs change:

- `pod_target_xcconfig` is assigned before `install_modules_dependencies`;
  no second hash afterwards;
- `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` is present;
- live pods do not call `add_rncore_dependency` after
  `install_modules_dependencies`;
- [`scripts/_TEMPLATE_/RNFB_Template_.podspec`](../scripts/_TEMPLATE_/RNFB_Template_.podspec)
  still calls `add_rncore_dependency` while it lacks
  `install_modules_dependencies`.

Expo `forceStaticLinking` / `$RNFirebaseAsStaticFramework` consumer
guidance stays in [`docs/index.mdx`](../docs/index.mdx) until a
consumer-side proof exists. Related compile reports:
[GitHub #8883](https://github.com/invertase/react-native-firebase/issues/8883).
