---
type: Reference
title: iOS SPM native integration decisions
description: Why RNFB uses dual imports, Objective-C helpers for Swift Firebase products, and an app framework-embedding phase.
tags: [ios, spm, cocoapods, imports, firebase, cxx-modules]
timestamp: 2026-07-16T00:00:00Z
---

# iOS SPM native integration decisions

This is the canonical maintainer record for native constraints discovered while
adding Firebase SPM dependency resolution. It records decisions and invariants,
not consumer setup. Consumer configuration and troubleshooting live in
[`docs/ios-spm.mdx`](../docs/ios-spm.mdx).

**Policy:** [OKF documentation and commit policy](documentation-policy.md).

## Decision summary

1. Native Firebase imports must compile with both CocoaPods and SPM.
2. Objective-C++ (`.mm`) files must not import Firebase products whose usable
   Objective-C interface is generated from Swift.
3. Do not enable `-fcxx-modules`; it fixes Firebase module imports but breaks
   React Native C++/JSI headers in the same translation unit.
4. Keep Firebase-typed logic for those products in plain Objective-C helpers
   and keep TurboModule `.mm` files as Firebase-free delegators.
5. SPM-built dynamic frameworks required at runtime must be embedded by the app
   target, not declared as unrelated public Firebase products in RNFB podspecs.

## CocoaPods/SPM dual imports

CocoaPods provides the `Firebase/Firebase.h` umbrella header. SPM exposes
product modules and does not provide that umbrella. Native files that can use a
real product header follow this order:

```objc
#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)
#import <FirebaseAuth/FirebaseAuth.h>
#import <FirebaseCore/FirebaseCore.h>
#else
@import FirebaseCore;
@import FirebaseAuth;
#endif
```

A module-header-first two-path form is also valid when the same real header is
available under both dependency managers. The unsafe form is an umbrella-header
check followed immediately by `@import`: under SPM the umbrella check is false,
so Objective-C++ files reach the module import.

### Why the fallback failed

Apple Clang permits `@import` in plain Objective-C with `-fmodules`, but a C++ or
Objective-C++ translation unit also requires `-fcxx-modules`. RNFB TurboModules
are `.mm` files because their generated boundary includes C++. A cold SPM build
therefore failed with:

```text
error: use of '@import' when C++ modules are disabled
```

Earlier builds were not proof that the fallback was safe: ccache could serve an
object compiled in a different include/cache state without re-running the
failing compiler path. The durable invariant is based on the language/toolchain
contract, not cache behavior.

Adding the real per-product header branch fixes products that actually publish a
usable Objective-C header. It does not fix Firebase products whose public
Objective-C class interface is generated from Swift.

## Swift-product boundary

`FirebaseStorage`, `FirebaseRemoteConfig`, `FirebaseDatabase`, and
`FirebaseInAppMessaging` expose their public implementation through
Swift-generated Objective-C interfaces in SPM. Those generated interfaces are
module outputs, not stable `Module/Module-Swift.h` files that a pod target can
reliably discover with `__has_include`.

Auth is the less obvious case. `FirebaseAuth/FirebaseAuth.h` exists, but it does
not contain the concrete `FIRAuth` and `FIRUser` class interfaces; those core
classes are Swift and become usable through the generated module interface.
Auth's hand-written compatibility declarations also come from the
`FirebaseAuthInternal` Clang module, so the plain Objective-C helper imports both
modules.

Database's Objective-C implementation types are exposed by the transitive
`FirebaseDatabaseInternal` Clang module. Its plain Objective-C helpers import
that module, but `RNFBDatabase.podspec` declares only the public
`FirebaseDatabase` product. This is an upstream-coupled import boundary, not a
claim that the internal target is a supported standalone product.

### Rejected alternatives

- **Import `Module-Swift.h` from `.mm`:** the generated header itself uses module
  imports, so the C++-modules failure moves inside the header.
- **Enable `-fcxx-modules`:** this changes parsing for the entire translation
  unit and caused compile failures in React Native's JSI and type-safety headers.
- **Declare Firebase internal targets as products:** internal targets are not
  stable consumer products and some are not exported as SPM library products.
- **Rewrite the moved logic in Swift:** feasible, as the Functions shim shows,
  but unnecessary for this change. Moving existing Objective-C++ bodies nearly
  verbatim into `.m` helpers minimizes semantic churn; the `.mm` TurboModule
  boundary remains either way.

### Chosen shape

Plain `.m` helpers own Firebase imports and Firebase-typed work. TurboModule
`.mm` files import only Firebase-free helper headers and delegate. Shared headers
used by `.mm` files must also remain Firebase-free; Database therefore separates
its queue and constants from `RNFBDatabaseCommon`.

| Package | Plain Objective-C owner |
| --- | --- |
| Auth | `RNFBAuthHelper` |
| Storage | `RNFBStorageHelper` |
| Remote Config | `RNFBConfigHelper` |
| In-App Messaging | `RNFBFiamHelper` |
| Database | `RNFBDatabase*Helper` classes, plus Firebase-free queue/constants headers |

This is a compile-boundary decision, not a TurboModule bridge API decision, so
it does not use a `NewArch-AD-*` identifier.

## Crashlytics transitive-header boundary

Crashlytics exposed a different failure. `FirebaseCoreExtension` is a real
Objective-C target, but it is transitive in the Firebase SPM graph and is not a
public SPM library product RNFB can declare directly. Its header was therefore
not visible to `RNFBCrashlyticsInitProvider.h`.

The public header only needed to expose three plain `BOOL` methods to RNFB. The
`FIRLibrary` conformance and `+componentsToRegister` members are used by
Firebase's component runtime, so they were moved to a private class extension in
`RNFBCrashlyticsInitProvider.m`. This keeps the header imported by `.mm` code
Firebase-free without inventing a dependency on a private/transitive target.

## Runtime framework embedding

React Native's `spm_dependency` integration attaches SPM products to pod
targets, which is sufficient to compile and link the pods. CocoaPods'
`[CP] Embed Pods Frameworks` phase knows only about CocoaPods-built frameworks,
so it does not automatically copy dynamic frameworks built under Xcode's
`PackageFrameworks` directory into the app bundle.

The failure appeared only at launch:

```text
Library not loaded: @rpath/FirebaseAppCheckInterop.framework/FirebaseAppCheckInterop
Referenced from: RNFBStorage.framework/RNFBStorage
```

Adding unrelated public products to an RNFB podspec does not solve this general
app-bundle problem, and internal interop targets are not public products.

### Chosen integration

`packages/app/firebase_spm.rb` tracks whether any RNFB dependency selected SPM.
It wraps CocoaPods'
`Pod::Installer#run_podfile_post_install_hooks` and adds
`[RNFB] Embed Firebase SPM Frameworks` to application targets that already have
`[CP] Embed Pods Frameworks`.

The phase:

- copies missing frameworks from `$(BUILT_PRODUCTS_DIR)/PackageFrameworks` to
  `$(TARGET_BUILD_DIR)/$(FRAMEWORKS_FOLDER_PATH)`;
- does not overwrite frameworks already embedded by CocoaPods;
- removes headers/modules from copied bundles and signs them when required.

The hook is guarded and idempotent. If CocoaPods changes the integration point,
`pod install` warns with the explicit
`rnfirebase_add_spm_embed_phase(installer)` fallback instead of allowing a
silent launch failure. The fallback is documented for consumers in
[`docs/ios-spm.mdx`](../docs/ios-spm.mdx#framework-embedding-fallback).

## Review invariants

When native Firebase imports or SPM products change, review the diff for these
invariants:

- no umbrella-header-to-`@import` fallback without a real product-header branch;
- no direct Swift-product Firebase import, Firebase-typed declaration, or
  Firebase-bearing shared header in a `.mm` translation unit;
- no `-fcxx-modules` build setting;
- no private/transitive Firebase target added as if it were a public product;
- SPM mode still adds exactly one app framework-embedding phase and CocoaPods
  mode does not require it;
- Debug and Release builds cover SPM and CocoaPods, and the real-device archive
  job verifies that every `@rpath` framework dependency is embedded.

The bullets above are the SPM-specific review checklist. General build, lint,
and evidence requirements are owned by the
[validation checklist](testing/validation-checklist.md) and
[change authoring workflow](testing/change-authoring-workflow.md). The archive
job's purpose and limitations are owned by
[iOS CI workflows](ci-workflows/ios.md#ios-release-archive-job--real-device-archive-validation).
