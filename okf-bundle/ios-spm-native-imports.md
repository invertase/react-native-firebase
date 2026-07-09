---
type: Reference
title: iOS SPM native dual-import pattern — ccache-masked latent bug
description: Canonical owner of the SPM/CocoaPods dual-import ("3-path") pattern for native iOS files — the ccache-masked ObjC++ `@import` build failure found via CI, the fix, and the current per-file audit.
tags: [ios, spm, cocoapods, imports, ccache, firebase, ci]
timestamp: 2026-07-09T00:00:00Z
---

# iOS SPM native dual-import pattern

**Canonical owner** of the native-file side of iOS SPM support: why the "3-path" `__has_include` pattern exists, the ccache-masked build failure that revealed 30 files were missing it, and the current per-file audit. [`docs/ios-spm.md`](../docs/ios-spm.md) is the public/contributor-facing doc (architecture, integration guide, glossary) — this page is the durable OKF record of the bug investigation and fix; it does not restate the public doc.

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
| in-app-messaging | `RNFBFiamModule.mm` |
| installations | `RNFBInstallationsModule.mm` |
| messaging | `RNFBMessaging+AppDelegate.m`, `RNFBMessaging+FIRMessagingDelegate.h`, `RNFBMessaging+NSNotificationCenter.m`, `RNFBMessagingModule.mm`, `RNFBMessagingSerializer.h` |
| perf | `RNFBPerfModule.mm` |
| remote-config | `RNFBConfigModule.mm` |
| storage | `RNFBStorageCommon.m`, `RNFBStorageModule.mm` |
| auth | `RNFBAuthModule.h` |

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

Re-run this audit after any new native Firebase import is added:

```bash
# Files still using the unsafe umbrella-first + @import fallback pattern,
# with no SPM per-module #elif branch
for f in $(grep -rl "@import Firebase" packages/*/ios 2>/dev/null); do
  case "$f" in *.swift) continue ;; esac
  grep -q "elif __has_include" "$f" || echo "UNSAFE: $f"
done
```

A clean run should print nothing once `RNFBAuthModule.mm` above is fixed.

## Related

* [`docs/ios-spm.md`](../docs/ios-spm.md) — public architecture/integration doc; §3.5 dual-import pattern, §6.6 tvOS TestFlight symbol-stripping crash (separate issue, same SPM effort)
* [CI workflows — iOS](ci-workflows/ios.md) — general iOS CI troubleshooting (simulator, Detox/Jet); this SPM build failure is a compile-time issue, not covered there
