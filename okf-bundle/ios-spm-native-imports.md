---
type: Reference
title: iOS SPM native integration decisions
description: Why RNFB uses dual imports, Objective-C helpers for Swift Firebase products, and an app framework-embedding phase.
tags: [ios, spm, cocoapods, imports, firebase, cxx-modules]
timestamp: 2026-08-06T16:00:00Z
---

# iOS SPM native integration decisions

This is the canonical maintainer record for native constraints discovered while
adding Firebase SPM dependency resolution. It records decisions and invariants,
not consumer setup. Consumer configuration and troubleshooting live in
[`docs/ios-spm.mdx`](../docs/ios-spm.mdx). Podspec RNCore /
`use_frameworks!` Clang flags:
[iOS RNCore podspec invariants](ios-rncore-podspec.md).

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

When neither the CocoaPods umbrella nor the SPM product header is present, a
`.mm` TurboModule must compile a stub that rejects at runtime with a clear
unsupported/unavailable error. Falling through to `@import` is never allowed;
do not enable `-fcxx-modules` to make the module import work.

### Mac Catalyst stubs (mirroring upstream `Package.swift` gates)

This is **not** an SPM integration bug in RNFB. Upstream
`firebase-ios-sdk` `Package.swift` wrap targets omit `.macCatalyst` for some
products, so Catalyst + SPM links only the empty `SwiftPM-PlatformExclude/*Wrap`
dummies and never builds the real modules. CocoaPods-era Catalyst builds
compiled through the `Firebase/Firebase.h` umbrella and therefore masked the
same platform exclusion.

| Product | Upstream SPM Catalyst gate | RNFB stub | Notes |
| --- | --- | --- | --- |
| App Distribution | `FirebaseAppDistributionTarget` is `.iOS` only | `RNFBAppDistributionModule.mm` (`RNFB_APP_DISTRIBUTION_SDK_AVAILABLE`) | Intentionally iOS-tester-only; not proposed for Catalyst |
| Performance | `FirebasePerformanceTarget` omits `.macCatalyst` | `RNFBPerfModule.mm` (`RNFB_PERF_SDK_AVAILABLE`) | Speculative enablement: [firebase-ios-sdk#16468](https://github.com/firebase/firebase-ios-sdk/pull/16468) |
| In-App Messaging | `FirebaseInAppMessagingTarget` omits `.macCatalyst` | `RNFBFiamHelper.m` (`RNFB_FIAM_SDK_AVAILABLE`; Catalyst skips `@import`) | Same speculative PR; helper stays plain `.m` so iOS/tvOS SPM can `@import` |

Until/unless #16468 lands (or upstream declines and the stubs become permanent),
RNFB must compile on Catalyst SPM without those product headers/modules. Do not
stub Auth, Analytics, Crashlytics, Messaging, or other products that upstream
already includes for Catalyst under SPM.

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

## Crashlytics dSYM upload under SPM

`packages/crashlytics/ios_config.sh` (the dSYM/symbol-upload script consumers
wire into an Xcode "Run Script" build phase) only knew two locations for
Crashlytics' `upload-symbols`/`run` tool: `$PODS_ROOT/FirebaseCrashlytics/run`
and a manually-vendored `FirebaseCrashlytics.framework/run`. Neither path
exists under SPM, so symbol upload silently no-opped for SPM users.

SPM checks out `upload-symbols` under
`DerivedData/<Project>/SourcePackages/checkouts/firebase-ios-sdk/Crashlytics/upload-symbols`.
`BUILD_DIR` is typically `.../DerivedData/<Project>/Build/Products`, so the
script strips from `/Build` onward to reach the `SourcePackages` checkout
root and calls that binary directly (`chmod +x` first if the checkout didn't
preserve the executable bit). If none of the three paths resolve, the script
warns and lists every path it checked rather than failing silently.

## Automatic SPM products and multi-pod FirebaseCore sharing

firebase-ios-sdk `Package.swift` declares products as plain `.library(...)`
with no `type: .dynamic` (confirmed on current tags, including 12.17.0).
Automatic SPM libraries are linked statically into each consumer.

React Native's `spm_dependency` attaches those products to **each pod target**.
With `use_frameworks! :linkage => :dynamic` (required for RNFB SPM mode):

- each dynamic pod framework embeds a private FirebaseCore (and related)
  copy;
- the app target may also get a `PackageFrameworks/*_PackageProduct.framework`
  via `rnfirebase_add_spm_core_to_app_target`;
- runtime can log duplicate `FIRApp` / related classes;
- `FirebaseApp.configure()` in the app does not configure another pod's copy.

| RNFB                                       | Other native dependency | Shared FirebaseCore? |
| ------------------------------------------ | ----------------------- | -------------------- |
| SPM                                        | SPM (`spm_dependency`)  | No                   |
| SPM                                        | CocoaPods Firebase pods | No (dual resolution) |
| CocoaPods (`$RNFirebaseDisableSPM = true`) | CocoaPods Firebase pods | Yes                  |

SPM + static pods is rejected by `rnfirebase_fail_if_spm_static_linkage!`:
per-pod copies collide at link time (`duplicate symbol`). Static linkage is
not a sharing path under SPM.

This is a packaging limitation of automatic SPM libraries + per-pod
attachment, not a Data Connect-specific bug. Consumer-facing guidance:
[`docs/ios-spm.mdx`](../docs/ios-spm.mdx#sharing-firebasecore-with-other-native-pods).
Tracked from GitHub
[#9140](https://github.com/invertase/react-native-firebase/issues/9140) /
Linear CPRN-292.

Do **not** reintroduce comments or docs that claim firebase-ios-sdk products
use `.library(type: .dynamic)`. That claim is false and misled debugging of
the multi-pod sharing failure.

## App target FirebaseCore link: package dependency alone is not enough

`rnfirebase_add_spm_core_to_app_target` exists for the case in the table above
where the app's own native code (not just a pod) calls `FIRApp`/`FIROptions`
APIs directly, most commonly Expo's config plugin injecting
`[FIRApp configure];` into the generated `AppDelegate`. Declaring the
`FirebaseCore` product on `target.package_product_dependencies` is necessary
but not sufficient: Xcode only actually links a Swift package product into a
target's binary if a matching `PBXBuildFile` (with `product_ref` pointing at
that dependency) also exists on the target's `PBXFrameworksBuildPhase`. A
dependency declared without that build file compiles (the app target can see
the product's headers/module) but fails at the link step:

```text
Undefined symbols for architecture arm64: "_OBJC_CLASS_$_FIRApp"
```

This shipped for a period without the `PBXBuildFile` step, so every dynamic
SPM app whose own target called Firebase APIs directly hit this at link time,
while apps that only reached Firebase through a pod (no direct `FIRApp` call
in app code) never noticed, since a pod target's `PBXFrameworksBuildPhase`
already gets a matching build file via SPM's own attach path. Tracked from
GitHub [#9158](https://github.com/invertase/react-native-firebase/issues/9158)
/ Linear CPRN-301.

### Idempotency guard must distinguish "declared" from "linked"

`rnfirebase_add_spm_core_to_app_target` runs on every `pod install`, so its
early-exit guard must be re-entrant. A guard that only checks
"does `package_product_dependencies` already contain `FirebaseCore`" is not
enough once the fix adds a second, independent artifact (the `PBXBuildFile`):
a project built by a pre-fix RNFB version already has the dependency declared
but never the build file, and a naive existence-only guard would treat that
broken state as done and skip forever, silently never healing an existing
consumer's checked-in `.pbxproj`. The guard must check both artifacts and,
when the dependency exists but the build file doesn't, reuse the existing
dependency object (do not create a second `package_product_dependencies`
entry, and do not create a second `package_references` entry either) and add
only the missing build file.

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

### Archive `UninstalledProducts` filter (dynamic Mach-O only)

Regular (simulator/device) builds populate
`$(BUILT_PRODUCTS_DIR)/PackageFrameworks` with Swift Package products. Xcode's
Archive action does not; it stages products under
`${OBJROOT}/UninstalledProducts/${PLATFORM_NAME}` instead. The embed script
therefore has an Archive-only fallback that also calls
`embed_frameworks_from` on that directory.

That folder is not SPM-only. Archive stages every `SKIP_INSTALL=YES` product
there, including CocoaPods frameworks built under `use_frameworks!` (required
for SPM mode). Static frameworks (Expo modules, the always-static
`Pods_<target>` umbrella, and similar) land alongside real dynamic SPM
products. Copying a static framework into the app `Frameworks/` directory
fails App Store validation with "Invalid bundle structure ... binary file is
not permitted".

`embed_frameworks_from` therefore filters before `rsync`:

- derives the internal binary as `"${framework_name%.framework}"` (folder
  name minus `.framework`), which holds for every CocoaPods/SPM-built
  framework this script handles;
- runs `file -b` on that binary and requires the prose substring
  `dynamically linked` (intentional string match on Apple's `file` output,
  not a Mach-O magic-byte parse);
- skips missing or non-dynamic binaries with a logged line
  (`Skipping … binary missing or not dynamically linked`).

Tracked from GitHub
[#9154](https://github.com/invertase/react-native-firebase/issues/9154) /
Linear CPRN-295.

## Archive signature-copy collision

Real `xcodebuild archive` builds (not simulator builds) can fail with:

```text
"GoogleAppMeasurementIdentitySupport.xcframework-ios.signature" couldn't be
copied to "Signatures" because an item with the same name already exists.
```

This is a long-standing Xcode Archive bug (present since Xcode 15, still
reproducing on Xcode 26), not specific to react-native-firebase: a Swift
Package binary target's `.signature` provenance file gets staged into more
than one target's build directory when multiple targets in the workspace
transitively depend on the same binary artifact, and Xcode's Archive action
then collides copying every staged copy into the shared
`<Archive>.xcarchive/Signatures/` directory. The same class of bug, with the
same fix, has been reported for other CocoaPods+SPM binary xcframeworks
(Mapbox: CocoaPods/CocoaPods#12022; MapLibre: maplibre-react-native#1489;
Lottie).

It can hit *any* binary xcframework in the resolved graph, not just the one
named in the first error. Google's own `google/GoogleAppMeasurement.git` SPM
package unconditionally links `GoogleAdsOnDeviceConversion` (from the
*separate* `googleads/google-ads-on-device-conversion-ios-sdk` package) as a
dependency of `GoogleAppMeasurementTarget`, completely independent of
RNFBAnalytics's own *optional* `spm_dependency` call for it (gated behind
`$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion`, which turns out
to only matter for CocoaPods-only resolution). None of this shows up as a
reference in our own podspecs or pbxprojs — it only turned up by inspecting
the actual checked-out `Package.swift` manifests under
`DerivedData/.../SourcePackages/checkouts`. Fixing one binary artifact just
surfaces the collision on the next one on a subsequent archive run.

### Chosen fix

`packages/app/firebase_spm.rb` enumerates every known `.binaryTarget`
xcframework name reachable in the resolved SPM package graph
(`RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES`, sourced from
`SourcePackages/workspace-state.json`'s `artifacts` list after a clean
`-resolvePackageDependencies` run, not guessed) and adds
`[RNFB] Remove duplicate Firebase/Google SPM binary xcframework signature
files` to application targets that already have `[CP] Embed Pods Frameworks`.
The phase deletes each named artifact's stale `.signature` file from
`$(CONFIGURATION_BUILD_DIR)` before Xcode's Archive action tries to copy it,
so only one copy is ever staged.

Deliberately scoped to this known artifact-name list rather than a bare
`*.signature` glob — broad enough to cover this whole binary family without
also silently masking an unrelated, legitimate "file already exists" failure
from some other SPM package in a consumer's own app.

The hook is guarded the same way as the embed phase: a failure to add the
build phase warns via `Pod::UI` with the manual fallback command instead of
failing `pod install` outright.

## Review invariants

When native Firebase imports or SPM products change, review the diff for these
invariants:

- no umbrella-header-to-`@import` fallback without a real product-header branch;
- when product headers/modules are absent on a platform because upstream SPM
  wrap targets omit `.macCatalyst` (App Distribution, Performance, In-App
  Messaging — see table above), stub/reject — never `@import` from `.mm` and
  never `-fcxx-modules`;
- no direct Swift-product Firebase import, Firebase-typed declaration, or
  Firebase-bearing shared header in a `.mm` translation unit;
- no `-fcxx-modules` build setting;
- no private/transitive Firebase target added as if it were a public product;
- SPM mode still adds exactly one app framework-embedding phase and CocoaPods
  mode does not require it;
- `rnfirebase_add_spm_core_to_app_target`'s guard still checks for a matching
  `PBXBuildFile`/`product_ref` on the Frameworks build phase, not just a
  `package_product_dependencies` entry, so it self-heals a pre-fix
  consumer's checked-in `.pbxproj` instead of treating a declared-but-unlinked
  dependency as already done; and `rnfirebase_remove_spm_core_from_app_target`
  removes both artifacts symmetrically;
- `embed_frameworks_from`'s Archive `UninstalledProducts` path still skips
  frameworks whose internal binary is missing or not `dynamically linked`
  (`file -b`), so static CocoaPods products are never copied into the app
  `Frameworks/` directory;
- docs/comments must not claim firebase-ios-sdk SPM products use
  `.library(type: .dynamic)`; products are automatic libraries, and multi-pod
  FirebaseCore sharing under SPM is unsupported (CocoaPods mode is the
  supported path when another native pod must share `FirebaseApp`);
- if a Firebase/Google SPM package adds a new `.binaryTarget` xcframework to
  the resolved graph (e.g. a firebase-ios-sdk version bump),
  `RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES` is re-checked against a clean
  `-resolvePackageDependencies` run rather than assumed still complete;
- Debug and Release builds cover SPM and CocoaPods, and the real-device archive
  job verifies that every `@rpath` framework dependency is embedded.

The bullets above are the SPM-specific review checklist. General build, lint,
and evidence requirements are owned by the
[validation checklist](testing/validation-checklist.md) and
[change authoring workflow](testing/change-authoring-workflow.md). The archive
job's purpose and limitations are owned by
[iOS CI workflows](ci-workflows/ios.md#ios-release-archive-job--real-device-archive-validation).
