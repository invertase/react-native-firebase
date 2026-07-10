---
type: Reference
title: iOS SPM native dual-import pattern — ccache-masked latent bug
description: Canonical owner of the SPM/CocoaPods dual-import ("3-path") pattern for native iOS files — the ccache-masked ObjC++ `@import` build failure found via CI, the fix, the follow-on discovery that pure-Swift-core SPM products (Storage, Remote Config, Database, In-App Messaging, and Auth's core `FIRAuth`/`FIRUser` classes) can't use the 3-path pattern at all, the Objective-C helper-class fix for those, and the separate transitive-SPM-product header-visibility bug found in Crashlytics.
tags: [ios, spm, cocoapods, imports, ccache, firebase, ci, cxx-modules]
timestamp: 2026-07-10T00:00:00Z
---

# iOS SPM native dual-import pattern

**Canonical owner** of the native-file side of iOS SPM support: why the "3-path" `__has_include` pattern exists, the ccache-masked build failure that revealed 30 files were missing it, why that pattern is structurally insufficient for pure-Swift-core SPM products (Storage, Remote Config, Database, In-App Messaging, and — less obviously — Auth), and the current per-file audit. [`docs/ios-spm.md`](../docs/ios-spm.md) is the public/contributor-facing doc (architecture, integration guide, glossary) — this page is the durable OKF record of the bug investigation and fix; it does not restate the public doc.

**Policy:** [OKF documentation and commit policy](documentation-policy.md).

## Background — why native files need a 3-path guard

Every native iOS `.h`/`.m`/`.mm` file that imports Firebase must compile under **both** dependency managers:

- **CocoaPods** exposes an umbrella header, `Firebase/Firebase.h`, that pulls in every subspec.
- **SPM** does not generate that umbrella — each Firebase product only exposes its own module header (e.g. `FirebaseAuth/FirebaseAuth.h`).

The canonical pattern ([`docs/ios-spm.md` §3.5](../docs/ios-spm.md#35-the-43-native-ios-files--dual-imports)) is:

```objc
#if __has_include(<Firebase/Firebase.h>)
  // Path 1: CocoaPods — umbrella header
  #import <Firebase/Firebase.h>
#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)
  // Path 2: SPM — per-module header
  #import <FirebaseAuth/FirebaseAuth.h>
  #import <FirebaseCore/FirebaseCore.h>
#else
  // Path 3: Clang module fallback (should not normally be reached)
  @import FirebaseCore;
  @import FirebaseAuth;
#endif
```

A **safe 2-path variant** also exists and needs no `#elif`: files that check a **module-specific** header first instead of the umbrella (e.g. `__has_include(<FirebaseCore/FirebaseCore.h>)`) already resolve under both CocoaPods and SPM, because CocoaPods generates per-module headers too — the umbrella is only needed when a file wants everything via one include. `RCTConvert+FIRApp.h`, `RCTConvert+FIROptions.h`, `RNFBSharedUtils.h`, `RNFBCrashlyticsInitProvider.h` use this variant deliberately and are **not** bugs.

The bug class covered here is the **unsafe 2-path** variant: `#if __has_include(<Firebase/Firebase.h>)` → `#else @import Module;`, with **no SPM per-module `#elif`**. Under SPM the umbrella check fails, so these files fall straight to `@import`, which is the failure mode below.

## The latent bug — ccache-masked `@import` failure under SPM

**Discovered via:** iOS debug SPM CI run failure (tail-end logs showed `BUILD FAILED`).

### Symptom

```
error: use of '@import' when C++ modules are disabled
error: expected a type
warning: 'FirebaseAuth' is missing a dependency on 'FirebaseAuthInternal'
Explicit modules is enabled but could not resolve libclang.dylib
```

First surfaced in `RNFBStorageModule.mm`, but the same root cause applied repo-wide.

### Root cause

1. `.mm` (Objective-C++) files compile with C++ modules **disabled** by default (no `-fcxx-modules`). `@import` for a Clang module inside a `.mm` file under these conditions is a compile error, not just a warning.
2. Every file using the **unsafe 2-path** pattern (see above) falls back to `@import` under SPM, because `Firebase/Firebase.h` does not exist in SPM builds.
3. This has been broken since the SPM support was added, but **`ccache` was masking it**: once one `.mm` translation unit compiled successfully in a given cache state, subsequent CI runs served the cached object file instead of re-invoking the compiler, so the `@import`-under-C++-modules failure only surfaces on a cache-cold path (exactly what an "iOS debug SPM" CI leg with a fresh/rotated cache hits).
4. Because the fallback path is silent until the cache misses, the bug affected essentially every package with native iOS code, not just storage.

### Fix

Add the missing SPM per-module `#elif __has_include(<Module/Module.h>)` branch (the canonical 3-path pattern above) to every file using the unsafe variant. No behavior change for CocoaPods (path 1 unchanged); SPM builds now resolve path 2 instead of falling through to `@import` path 3.

**This fix is necessary but not sufficient for every package** - see the next section.

## Deeper failure mode -- pure-Swift SPM products can't satisfy path 2 at all

**Discovered via:** re-running `yarn tests:ios:build` locally after the 3-path fix above; `RNFBStorageModule.mm`, `RNFBConfigModule.mm`, the five `RNFBDatabase*Module.mm` files, and `RNFBFiamModule.mm` still failed with the same `@import` error even though each already had (or was given) a `#elif __has_include(<Module/Module-Swift.h>)` branch.

### Why path 2 never resolves for these four packages

`FirebaseStorage`, `FirebaseRemoteConfig`, `FirebaseDatabase`, and `FirebaseInAppMessaging` are **pure-Swift SPM products** -- there is no `Module/Module.h`. The only ObjC-visible surface is a **compiler-generated** interop header, `Module-Swift.h`, and Xcode's SPM build places it in a flat per-target intermediate directory (`GeneratedModuleMaps-PLATFORM/Module-Swift.h`), never under a `Module/` subdirectory. So the module-header `__has_include` check is **always false** -- path 2 can never be taken for these products, no matter how the `#elif` is worded, and every one of these files falls straight through to path 3 (`@import`).

### How we confirmed this (primary-source evidence)

The claim above is verifiable directly against Firebase's own `Package.swift` (checked out locally under `SourcePackages/checkouts/firebase-ios-sdk/Package.swift` by Xcode/SPM). The public target that RNFB depends on (via `firebase_dependency` in each podspec, matching the exact SPM product name) has a different `path:` for the four affected products versus a normal one:

| SPM product (RNFB depends on this exact name) | Target `path:` | Contents |
|---|---|---|
| `FirebaseStorage` | `FirebaseStorage/Sources` | 24 `.swift` files, **0** `.m`/`.mm`, **0** `.h` |
| `FirebaseRemoteConfig` | `FirebaseRemoteConfig/Swift` | Swift only; depends on a separate `FirebaseRemoteConfigInternal` ObjC target for the actual SDK logic |
| `FirebaseInAppMessaging` | `FirebaseInAppMessaging/Swift/Source` | Swift only; depends on `FirebaseInAppMessagingInternal` |
| `FirebaseDatabase` | `FirebaseDatabase/Swift/Sources` | Swift only; depends on `FirebaseDatabaseInternal` |
| `FirebaseAuth` (contrast — unaffected) | `FirebaseAuth/Sources` (excludes `Swift`) | Depends on `FirebaseAuthInternal`, which sets `publicHeadersPath: "Public"` — and `Public/FirebaseAuth/FirebaseAuth.h` physically exists on disk, so `__has_include(<FirebaseAuth/FirebaseAuth.h>)` finds a real file there. |

The pattern: for Auth (and every other unaffected package), the SPM product's dependency graph ends in an ObjC target that ships a real header rooted at a `Module/` subdirectory matching the product's own name. For Storage/RemoteConfig/Database/InAppMessaging, the equivalent ObjC internals (`*Internal` targets) exist and have real headers too, but RNFB doesn't — and shouldn't — depend on `FirebaseDatabaseInternal` etc. directly: those `*Internal` targets are explicitly Firebase's private implementation detail (undocumented, unversioned API surface), not a product we're meant to import. The only Firebase-sanctioned integration point for the public, pure-Swift product name is the Swift-generated interop header, which (per above) `__has_include` can never locate. That's the concrete, falsifiable reason these four — and *only* these four — needed the helper-class rewrite.

Two follow-on attempts to fix this **without** restructuring the module also failed:

1. **Import the generated header directly**, unconditionally, bypassing `__has_include` -- the generated header itself contains its own internal Foundation/ObjectiveC module imports guarded by `__has_feature(modules)`, so including it from a `.mm` file just relocates the same C++-modules failure one level deeper.
2. **Force `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'`** on the app project to match the Pods project (see `tests/ios/Podfile`) -- ruled out module-graph mismatch as the cause, but did not fix the `@import` error, confirming the problem is the `-fcxx-modules` requirement itself, not module discovery.

### Why C++ modules are disabled (and why we don't just turn them on)

`-fmodules` (Clang module import) has been enabled for this project throughout. But Apple Clang requires a **separate** flag, `-fcxx-modules`, before Clang-module import syntax is usable inside a **C++ or Objective-C++ (`.mm`) translation unit** -- and Clang does not enable it by default even with `-fmodules` on. Every RNFB native module that talks to Firebase is a `.mm` file (TurboModule/JSI codegen requires C++), so any such file that falls through to the Clang-module-import fallback hits:

    error: use of '@import' when C++ modules are disabled, consider using -fmodules and -fcxx-modules

We tried the flag the error message suggests: adding `-fcxx-modules` to `OTHER_CPLUSPLUSFLAGS`, per-podspec, on `RNFBStorage`, `RNFBRemoteConfig`, `RNFBDatabase`, `RNFBInAppMessaging`. It fixed the Firebase import, but broke React Native's own C++ core headers in the same translation units -- cascading compile failures in `jsi.h` and `RCTTypeSafety` -- because those headers are not structured to be safely reparsed under Clang's C++-modules machinery. The flag affects how an *entire translation unit* is parsed, not just one import statement, so there is no way to scope it to only the Firebase import. **Decision: do not enable `-fcxx-modules` anywhere in this repo.** The flag was reverted from all four podspecs.

### Fix -- Objective-C helper-class ("Swift shim") delegation

Since plain Objective-C (`.m`) files only need `-fmodules` (already on) for Clang-module import -- never `-fcxx-modules` -- the fix is structural: move every call that touches the Swift-only SPM product into a new plain `.m`/`.h` helper class, and make the `.mm` TurboModule a thin delegator that never imports Firebase directly.

Shape: `RNFBFooHelper.m` (plain Objective-C) keeps the 3-path Firebase import block and all `FIRFoo`-typed logic behind `@objc`-visible class methods; `RNFBFooModule.mm` (Objective-C++) imports only the helper's header and the TurboModule spec, and each method body becomes a single delegating call into the helper.

**Corollary -- any shared header touched by both `.m` helpers and `.mm` modules must itself stay Firebase-free.** `RNFBDatabaseCommon.h` declares Firebase-typed method signatures (`FIRDatabase *`, `FIRDatabaseReference *`, ...) and therefore carries the same 3-path import block at its top; once no `.mm` file may import it anymore, two small Firebase-free headers were split out so `.mm` files can still get what they need without pulling in Firebase transitively:

| New header | Purpose |
|------------|---------|
| `RNFBDatabaseQueue.h`/`.m` | Shared `methodQueue` dispatch queue -- previously obtained from `RNFBDatabaseCommon`, which required importing the Firebase-laden header. |
| `RNFBDatabaseConstants.h` | `extern NSString *const DATABASE_*` preference keys -- previously declared inside `RNFBDatabaseCommon.h`. |

**Helper classes added (this fix, per package):**

| Package | `.mm` module(s) | New plain-ObjC helper(s) |
|---------|-----------------|---------------------------|
| in-app-messaging | `RNFBFiamModule.mm` | `RNFBFiamHelper` |
| remote-config | `RNFBConfigModule.mm` | `RNFBConfigHelper` |
| database | `RNFBDatabaseModule.mm`, `RNFBDatabaseReferenceModule.mm`, `RNFBDatabaseOnDisconnectModule.mm`, `RNFBDatabaseTransactionModule.mm`, `RNFBDatabaseQueryModule.mm` | `RNFBDatabaseModuleHelper`, `RNFBDatabaseReferenceHelper`, `RNFBDatabaseOnDisconnectHelper`, `RNFBDatabaseTransactionHelper`, `RNFBDatabaseQueryHelper` |
| storage | `RNFBStorageModule.mm` | `RNFBStorageHelper` |

`RNFBDatabaseCommon`/`RNFBDatabaseQuery` and `RNFBStorageCommon` (pre-existing, already plain `.m` files) are unaffected in shape -- they keep the Firebase-typed method signatures, and are now imported **only** by the new `.m` helpers, never by any `.mm` file.

**Why this isn't recorded as a `NewArch-AD-*` entry:** [architecture-decisions.md](new-architecture/architecture-decisions.md) is scoped to TurboModule *migration* decisions (JS/native bridging shape) and uses the `NewArch-AD-<n>` ID convention for that migration specifically. This is a build-toolchain/dependency-manager compilation constraint, unrelated to that migration -- its canonical home is this document (per [documentation policy](documentation-policy.md) -- one owning doc per topic).

## File audit (packages/*/ios)

**Fixed — added the missing `#elif` branch (30 files):**

| Package | Files |
|---------|-------|
| analytics | `RNFBAnalyticsModule.mm` |
| app | `RNFBAppModule.mm` |
| app-distribution | `RNFBAppDistributionModule.mm` |
| crashlytics | `RNFBCrashlyticsModule.mm`, `RNFBCrashlyticsInitProvider.m`, `RNFBCrashlyticsNativeHelper.m` |
| database | `RNFBDatabaseCommon.h`, `RNFBDatabaseModule.mm`, `RNFBDatabaseOnDisconnectModule.mm`, `RNFBDatabaseQuery.h`, `RNFBDatabaseQueryModule.h`, `RNFBDatabaseReferenceModule.mm`, `RNFBDatabaseTransactionModule.mm` |
| firestore | `RCTConvert+FIRLoggerLevel.h`, `RNFBFirestoreCollectionModule.h`, `RNFBFirestoreCommon.h`, `RNFBFirestoreDocumentModule.h`, `RNFBFirestoreModule.h`, `RNFBFirestoreQuery.h`, `RNFBFirestoreSerialize.h`, `RNFBFirestoreTransactionModule.h` |
| in-app-messaging | `RNFBFiamModule.mm` (superseded — see below) |
| installations | `RNFBInstallationsModule.mm` |
| messaging | `RNFBMessaging+AppDelegate.m`, `RNFBMessaging+FIRMessagingDelegate.h`, `RNFBMessaging+NSNotificationCenter.m`, `RNFBMessagingModule.mm`, `RNFBMessagingSerializer.h` |
| perf | `RNFBPerfModule.mm` |
| remote-config | `RNFBConfigModule.mm` (superseded — see below) |
| storage | `RNFBStorageCommon.m`, `RNFBStorageModule.mm` (`.mm` superseded — see below) |
| auth | `RNFBAuthModule.h` (superseded — see below; also had a bogus `FirebaseAuthInternal` import removed, see [Auth](#firebaseauths-hidden-pure-swift-core) below) |

**Superseded — `#elif` branch alone doesn't fix it; needed the helper-class delegation ([above](#fix----objective-c-helper-class-swift-shim-delegation)) because these are pure-Swift-core SPM products:**

| Package | `.mm` file(s) | New helper(s) |
|---------|---------------|----------------|
| in-app-messaging | `RNFBFiamModule.mm` | `RNFBFiamHelper` |
| remote-config | `RNFBConfigModule.mm` | `RNFBConfigHelper` |
| database | `RNFBDatabaseModule.mm`, `RNFBDatabaseReferenceModule.mm`, `RNFBDatabaseOnDisconnectModule.mm`, `RNFBDatabaseTransactionModule.mm`, `RNFBDatabaseQueryModule.mm` | `RNFBDatabaseModuleHelper`, `RNFBDatabaseReferenceHelper`, `RNFBDatabaseOnDisconnectHelper`, `RNFBDatabaseTransactionHelper`, `RNFBDatabaseQueryHelper` |
| storage | `RNFBStorageModule.mm` | `RNFBStorageHelper` |
| auth | `RNFBAuthModule.mm` | `RNFBAuthHelper` |

The `#elif __has_include(<Module/Module-Swift.h>)` branch already added to the files above (where present) is harmless dead code for these packages (the condition is always false per [the deeper failure mode](#deeper-failure-mode----pure-swift-spm-products-cant-satisfy-path-2-at-all) above) but is left in place — it's a correct guard in general and costs nothing.

**Already safe — module-header-first 2-path variant, no change needed:**

| File | Header checked |
|------|-----------------|
| `packages/app/ios/RNFBApp/RCTConvert+FIRApp.h` | `FirebaseCore/FirebaseCore.h` |
| `packages/app/ios/RNFBApp/RCTConvert+FIROptions.h` | `FirebaseCore/FirebaseCore.h` |
| `packages/app/ios/RNFBApp/RNFBSharedUtils.h` | `FirebaseCore/FirebaseCore.h` |
| `packages/functions/ios/RNFBFunctions/RNFBFunctionsCallHandler.swift` | N/A — Swift `import`, not subject to this bug class |

**Fixed — Crashlytics (header-slimming, not helper-class):**

`RNFBCrashlyticsInitProvider.h`'s `__has_include(<FirebaseCoreExtension/FIRLibrary.h>)` was false in this repo's hybrid SPM+CocoaPods build, for a *different* reason than the pure-Swift packages above: `FirebaseCoreExtension` is a real ObjC target with real headers, but it's only reachable 2 levels deep in the SPM graph (`FirebaseCrashlytics` -> `FirebaseSessions` -> `FirebaseCoreExtension`) and can't be declared as its own explicit SPM product -- Firebase's `Package.swift` only exposes it as an internal `.target`, never as a `.library` product (confirmed: adding it to `spm_dependency(products: [...])` fails with "Missing package product `FirebaseCoreExtension`"). So the header search path never includes it for the RNFBCrashlytics pod target, and the file fell to `@import`, which fails to compile from the `.mm` module. Fix: rather than a helper class, the public header was slimmed to be Firebase-free. `RNFBCrashlyticsModule.mm` (the only external consumer) only ever calls three plain `BOOL` class methods; the `<FIRLibrary>` conformance and `+componentsToRegister` (the only members needing `FirebaseCoreExtension` types) are only invoked by Firebase's own component/DI runtime via reflection, never by RNFB code directly, so they were moved into a private class-extension declared solely in `RNFBCrashlyticsInitProvider.m` (which already partially did this for a different protocol). No Firebase types are left in the header at all now.

**Fixed — Auth (helper-class delegation, largest instance):** see "`FirebaseAuth`'s hidden pure-Swift core" below for the full writeup.

### `FirebaseAuth`'s hidden pure-Swift core

**Discovered via:** re-running `yarn tests:ios:build` after removing the dead `FirebaseAuthInternal` import above; `RNFBAuthModule.mm` now fails with `receiver 'FIRAuth' for class message is a forward declaration` / `no known class method for selector 'authWithApp:'` on every `FIRAuth`-typed call, even though `#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)` succeeds and `#import <FirebaseAuth/FirebaseAuth.h>` compiles without error.

This package was previously assumed safe because a real `FirebaseAuth/FirebaseAuth.h` header does exist (contrast evidence in the table above). That's true, but incomplete: that header, and the entire `Public/FirebaseAuth/` directory it lives in, contains only forward declarations (`@class FIRAuth;`), typedefs, error codes, and provider/protocol headers -- **not** the actual `FIRAuth`/`FIRUser` class interfaces. Verified directly against the checked-out SDK: no header anywhere under `FirebaseAuth/` declares `@interface FIRAuth : NSObject`, while `FirebaseAuth/Sources/Swift/Auth/Auth.swift` does define the real `Auth` class (exposed to ObjC as `FIRAuth` via `@objc`/`NS_SWIFT_NAME`). In other words, `FirebaseAuth` has the *same* pure-Swift-core structure as Storage/RemoteConfig/Database/InAppMessaging for its main class -- it just also happens to ship a partial, legitimate ObjC header directory for auxiliary types, which is what let it slip through the `__has_include` check undetected until now.

Net effect: `@import FirebaseAuth;` is the only way to get the real `FIRAuth` interface (same as the four confirmed pure-Swift products), which again fails to compile from a `.mm` file with C++ modules disabled.

**Fixed** with the same helper-class delegation pattern as the four packages above -- the largest instance of it, since `RNFBAuthModule.mm` was ~2050 lines. `RNFBAuthHelper.h`/`.m` now own every `FIRAuth`/`FIRUser`-typed call; `RNFBAuthModule.mm` is a pure delegation layer (plus the handful of TurboModule methods that never touched Firebase types at all: `constantsToExport`, `getConstants`, `getTurboModule`, `requiresMainQueueSetup`, `dealloc`, and two no-op stubs). The `AuthErrorCode_toJSErrorCode` array (indexed by `FIRAuthErrorCode`, Firebase-typed) moved out of `RNFBAuthModule.h` into `RNFBAuthHelper.m` -- it can't stay in a header that `RNFBAuthModule.mm` imports.

One extra wrinkle beyond the other four packages: `@import FirebaseAuth;` alone was not enough. It exposes the Swift-generated interop header (the real `FIRAuth`/`FIRUser` classes), but not the hand-written ObjC compatibility headers under `Public/FirebaseAuth/` (typedefs like `FIRAuthStateDidChangeListenerHandle`, error `userInfo` key constants like `FIRAuthErrorUserInfoUpdatedCredentialKey`) -- those are vended by the separate `FirebaseAuthInternal` Clang module (confirmed via `Package.swift`: `FirebaseAuth` depends directly on `FirebaseAuthInternal`, which sets `publicHeadersPath: "Public"` at `FirebaseAuth/Sources/Public`). A Clang module's dependencies aren't automatically re-exported through `@import`, even for a direct (not transitive) SPM dependency, so `RNFBAuthHelper.m` explicitly does `@import FirebaseAuthInternal;` alongside `@import FirebaseAuth;` in its fallback branch. `FirebaseAuthInternal` did **not** need to be added to `RNFBAuth.podspec`'s `spm_products` list -- unlike Crashlytics/`FirebaseCoreExtension`, a direct `@import` (module-graph based) resolves it fine without an explicit product declaration; only `__has_include` (header-search based) needed that.

Along the way, a second, unrelated bug was found and fixed in `RNFBAuthModule.mm`/`.h`: both files unconditionally `#import <FirebaseAuthInternal/FirebaseAuthInternal.h>` in their path-2 branch. That header does not exist anywhere in the SDK, under any dependency manager -- `FirebaseAuthInternal` is an internal `.target`, never a `.library` product, so there's no product-rooted umbrella header for it. This line had never actually been exercised (CocoaPods always short-circuits to path 1 via `Firebase/Firebase.h`; SPM was broken for unrelated reasons until this investigation), so it silently shipped broken. Removed; nothing in either file used internal-only Auth APIs.

## Verifying no regressions

Re-run both checks after any new native Firebase import is added.

**Check 1 — unsafe 2-path pattern** (files falling back to Clang-module import with no SPM per-module `#elif`):

```bash
for f in $(grep -rl "@import Firebase" packages/*/ios 2>/dev/null); do
  case "$f" in *.swift) continue ;; esac
  grep -q "elif __has_include" "$f" || echo "UNSAFE: $f"
done
```

A clean run should print nothing.

**Check 2 — pure-Swift-core SPM products imported directly from a `.mm` file** (the deeper failure mode above — no `#elif` wording fixes this, only the helper-class delegation does):

```bash
for f in $(grep -rl "FirebaseStorage\|FirebaseRemoteConfig\|FirebaseDatabase\|FirebaseInAppMessaging\|FirebaseAuth" packages/*/ios/**/*.mm 2>/dev/null); do
  echo "CHECK: $f — must delegate to a plain .m helper, not import Firebase directly"
done
```

A clean run should print nothing; every `.mm` file for these five packages (the four above, plus Auth per [above](#firebaseauths-hidden-pure-swift-core)) should only import its package's `*Helper.h` (plus `RNFBDatabaseQueue.h`/`RNFBDatabaseConstants.h` for database), never Firebase headers.

## Unrelated linker bug found along the way — missing `Photos.framework` declaration

**Not part of the SPM dual-import bug class above** — recorded here because it was found while validating the Auth fix and blocked the same `yarn tests:ios:build` command. Once every native-import fix above was in place, the debug SPM build progressed past compilation into linking and failed with:

```
Undefined symbols for architecture arm64:
  "_OBJC_CLASS_$_PHAsset", referenced from:
       in RNFBUtilsModule.o
ld: symbol(s) not found for architecture arm64
```

**Root cause:** `packages/app/ios/RNFBApp/RNFBUtilsModule.{h,mm}` and `packages/storage/ios/RNFBStorage/RNFBStorageCommon.{h,m}` both `#import <Photos/Photos.h>` and use `PHAsset`/`PHAssetResource`, but neither `RNFBApp.podspec` nor `RNFBStorage.podspec` ever declared `s.frameworks = 'Photos'` (confirmed absent on `main` too — this is not an SPM regression). That was never a problem for CocoaPods-only static-library builds, where the final app-level link resolves all pods' symbols together in one pass. But this repo's `Podfile` uses `use_frameworks!` with dynamic linkage, so each pod compiles to its own standalone dynamic framework (`clang++ -dynamiclib ...`) that must resolve **all** of its own undefined symbols at its own link step -- it can't defer to the app target. CocoaPods populates each pod's `OTHER_LDFLAGS` (`-framework X` per framework) directly from the podspec's declared `s.frameworks`/dependency graph, not from scanning source for `#import`/Clang-module autolink info, so an undeclared system framework silently has no `-framework` flag no matter how the header is imported.

**Fix:** declared `s.ios.frameworks = 'Photos'` / `s.osx.frameworks = 'Photos'` (iOS + macOS only -- PhotoKit doesn't exist on tvOS, even though these files currently have no tvOS guard either; that's a pre-existing, separate gap left untouched here) in both podspecs, matching the existing `s.frameworks = 'AdSupport'` convention already used in `RNFBAnalytics.podspec`. Verified the regenerated `RNFBApp.debug.xcconfig`/`RNFBStorage.debug.xcconfig` `OTHER_LDFLAGS` now include `-framework "Photos"`, and `yarn tests:ios:build` succeeds end-to-end.

## Related

* [`docs/ios-spm.md`](../docs/ios-spm.md) — public architecture/integration doc; §3.5 dual-import pattern, §6.6 tvOS TestFlight symbol-stripping crash (separate issue, same SPM effort)
* [CI workflows — iOS](ci-workflows/ios.md) — general iOS CI troubleshooting (simulator, Detox/Jet); this SPM build failure is a compile-time issue, not covered there
