---
type: Reference
title: iOS SPM native dual-import pattern — ccache-masked latent bug
description: Canonical owner of the SPM/CocoaPods dual-import ("3-path") pattern for native iOS files — the ccache-masked ObjC++ `@import` build failure found via CI, the fix, the follow-on discovery that pure-Swift SPM products can't use the 3-path pattern at all, and the Objective-C helper-class fix for those.
tags: [ios, spm, cocoapods, imports, ccache, firebase, ci, cxx-modules]
timestamp: 2026-07-10T00:00:00Z
---

# iOS SPM native dual-import pattern

**Canonical owner** of the native-file side of iOS SPM support: why the "3-path" `__has_include` pattern exists, the ccache-masked build failure that revealed 30 files were missing it, why that pattern is structurally insufficient for pure-Swift SPM products (Storage, Remote Config, Database, In-App Messaging), and the current per-file audit. [`docs/ios-spm.md`](../docs/ios-spm.md) is the public/contributor-facing doc (architecture, integration guide, glossary) — this page is the durable OKF record of the bug investigation and fix; it does not restate the public doc.

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
| auth | `RNFBAuthModule.h` |

**Superseded — `#elif` branch alone doesn't fix it; needed the helper-class delegation ([above](#fix----objective-c-helper-class-swift-shim-delegation)) because these four are pure-Swift SPM products:**

| Package | `.mm` file(s) | New helper(s) |
|---------|---------------|----------------|
| in-app-messaging | `RNFBFiamModule.mm` | `RNFBFiamHelper` |
| remote-config | `RNFBConfigModule.mm` | `RNFBConfigHelper` |
| database | `RNFBDatabaseModule.mm`, `RNFBDatabaseReferenceModule.mm`, `RNFBDatabaseOnDisconnectModule.mm`, `RNFBDatabaseTransactionModule.mm`, `RNFBDatabaseQueryModule.mm` | `RNFBDatabaseModuleHelper`, `RNFBDatabaseReferenceHelper`, `RNFBDatabaseOnDisconnectHelper`, `RNFBDatabaseTransactionHelper`, `RNFBDatabaseQueryHelper` |
| storage | `RNFBStorageModule.mm` | `RNFBStorageHelper` |

The `#elif __has_include(<Module/Module-Swift.h>)` branch already added to the files above is harmless dead code for these four packages (the condition is always false per [the deeper failure mode](#deeper-failure-mode----pure-swift-spm-products-cant-satisfy-path-2-at-all) above) but is left in place — it's a correct guard in general and costs nothing.

**Already safe — module-header-first 2-path variant, no change needed:**

| File | Header checked |
|------|-----------------|
| `packages/app/ios/RNFBApp/RCTConvert+FIRApp.h` | `FirebaseCore/FirebaseCore.h` |
| `packages/app/ios/RNFBApp/RCTConvert+FIROptions.h` | `FirebaseCore/FirebaseCore.h` |
| `packages/app/ios/RNFBApp/RNFBSharedUtils.h` | `FirebaseCore/FirebaseCore.h` |
| `packages/crashlytics/ios/RNFBCrashlytics/RNFBCrashlyticsInitProvider.h` | `FirebaseCoreExtension/FIRLibrary.h` |
| `packages/functions/ios/RNFBFunctions/RNFBFunctionsCallHandler.swift` | N/A — Swift `import`, not subject to this bug class |

**Outstanding — still unsafe, not yet fixed:**

| File | Status |
|------|--------|
| `packages/auth/ios/RNFBAuth/RNFBAuthModule.mm` | Blocked — every edit attempt (`StrReplace`) on this specific ~2000-line file has been rejected by local write hooks (`doc-file-warning`, `governance-capture`, `config-protection`, `mcp-health-check`) returning "invalid JSON"; environmental, not content-related (ruled out secret-pattern false positives). Needs a maintainer or a different tool/session to apply the same `#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)` branch used in `RNFBAuthModule.h`. |

## Verifying no regressions

Re-run both checks after any new native Firebase import is added.

**Check 1 — unsafe 2-path pattern** (files falling back to Clang-module import with no SPM per-module `#elif`):

```bash
for f in $(grep -rl "@import Firebase" packages/*/ios 2>/dev/null); do
  case "$f" in *.swift) continue ;; esac
  grep -q "elif __has_include" "$f" || echo "UNSAFE: $f"
done
```

A clean run should print nothing once `RNFBAuthModule.mm` above is fixed.

**Check 2 — pure-Swift SPM products imported directly from a `.mm` file** (the deeper failure mode above — no `#elif` wording fixes this, only the helper-class delegation does):

```bash
for f in $(grep -rl "FirebaseStorage\|FirebaseRemoteConfig\|FirebaseDatabase\|FirebaseInAppMessaging" packages/*/ios/**/*.mm 2>/dev/null); do
  echo "CHECK: $f — must delegate to a plain .m helper, not import Firebase directly"
done
```

A clean run should print nothing; every `.mm` file for these four packages should only import its package's `*Helper.h` (plus `RNFBDatabaseQueue.h`/`RNFBDatabaseConstants.h` for database), never Firebase headers.

## Related

* [`docs/ios-spm.md`](../docs/ios-spm.md) — public architecture/integration doc; §3.5 dual-import pattern, §6.6 tvOS TestFlight symbol-stripping crash (separate issue, same SPM effort)
* [CI workflows — iOS](ci-workflows/ios.md) — general iOS CI troubleshooting (simulator, Detox/Jet); this SPM build failure is a compile-time issue, not covered there
