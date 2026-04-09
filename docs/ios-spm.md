# iOS SPM (Swift Package Manager) Support for Firebase Dependencies

> **Firebase SDK:** 12.10.0
> **Minimum React Native for SPM:** 0.75+

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture](#2-architecture)
3. [Changes Made](#3-changes-made)
4. [Function Reference](#4-function-reference)
5. [Integration Guide — Legacy Projects](#5-integration-guide--legacy-projects)
6. [Integration Guide — Upgrading to SPM](#6-integration-guide--upgrading-to-spm)
7. [Glossary](#7-glossary)

---

## 1. Executive Summary

### What problem does this solve?

When Apple released **Xcode 26** (2026), it introduced a significant change: the Swift compiler now uses **"explicit modules"** by default. This means the compiler needs to know exactly where every module (every library) is located before compiling.

The problem is that **Firebase iOS SDK**, when installed via **CocoaPods** (the traditional iOS dependency manager), has internal modules (`FirebaseCoreInternal`, `FirebaseSharedSwift`) that **are not exposed as public products**. In Xcode 16, this was not a problem because the compiler found them automatically. In Xcode 26, the compiler no longer searches for them on its own and throws compilation errors.

**The solution:** Use **Swift Package Manager (SPM)** as the primary method for resolving Firebase dependencies. SPM is Apple's native package manager and correctly handles internal module visibility. As an alternative, CocoaPods is maintained for projects that need it, with a workaround (`SWIFT_ENABLE_EXPLICIT_MODULES=NO`).

### What was implemented

A **dual dependency resolution system** that allows choosing between SPM and CocoaPods for Firebase, transparently, without changing app code. The system:

1. **Automatically detects** if SPM is available (React Native >= 0.75)
2. **Uses SPM by default** when available
3. **Falls back to CocoaPods** when SPM is not available or explicitly disabled
4. **Requires no changes** to JavaScript/TypeScript app code
5. **Requires no changes** to native (Objective-C/Swift) app code

### Critical points before integrating

| Point | Detail |
|-------|--------|
| **Linkage** | SPM requires **dynamic linkage**. CocoaPods requires **static linkage**. They cannot be mixed. |
| **Xcode 26** | If using CocoaPods with Xcode 26, you MUST add `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` in your Podfile post_install. |
| **React Native < 0.75** | Only works with CocoaPods (SPM is not available in earlier versions). |
| **Duplicate symbols** | If using SPM with `static linkage`, each pod embeds Firebase SPM products → linker error from duplicate symbols. That's why SPM = dynamic. |
| **FirebaseCoreExtension** | Some packages (Messaging, Crashlytics) need `FirebaseCoreExtension` as an explicit dependency in CocoaPods, but SPM resolves it automatically as a transitive dependency. |

---

## 2. Architecture

### 2.1 Decision Flow Diagram

```
                    ┌─────────────────────────┐
                    │    pod install / build   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  Podspec loads            │
                    │  firebase_spm.rb          │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ Is spm_dependency()       │
                    │  defined? (RN >= 0.75)    │
                    └──────┬──────────┬─────────┘
                           │          │
                          YES         NO
                           │          │
              ┌────────────▼──┐   ┌──▼──────────────────┐
              │ Is $RNFirebase│   │ Use CocoaPods        │
              │  DisableSPM   │   │ spec.dependency()    │
              │  set?         │   └─────────────────────┘
              └───┬───────┬───┘
                  │       │
                 YES      NO
                  │       │
     ┌────────────▼──┐  ┌─▼──────────────────┐
     │ Use CocoaPods │  │ Use SPM            │
     │ (forced)      │  │ spm_dependency()   │
     └───────────────┘  └────────────────────┘
```

### 2.2 System Components

The system has **5 components** that interact with each other:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CENTRAL COMPONENT                             │
│  packages/app/firebase_spm.rb                                    │
│  → Defines the firebase_dependency() function                    │
│  → Reads the SPM URL from package.json                           │
│  → Automatically decides: SPM or CocoaPods                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ required by
          ┌──────────────────┼────────────────┐
          │                  │                │
  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
  │  16 Podspecs │  │ package.json │  │  43 native   │
  │  (*.podspec) │  │  sdkVersions │  │  iOS files   │
  │              │  │              │  │  (.h, .m)    │
  │ Each one     │  │ Defines:     │  │              │
  │ calls        │  │ - Firebase   │  │ Use #if      │
  │ firebase_    │  │   version    │  │ __has_include│
  │ dependency() │  │ - SPM URL    │  │ for dual     │
  └──────────────┘  └──────────────┘  │ imports      │
          │                           └──────────────┘
          │
  ┌───────▼──────────────────────────────────────────┐
  │  CI/CD: tests_e2e_ios.yml                        │
  │  → Tests BOTH modes on every PR                  │
  │  → Matrix: spm × cocoapods × debug × release     │
  └──────────────────────────────────────────────────┘
```

### 2.3 Design Decisions and Rationale

| Decision | Rationale |
|----------|-----------|
| **SPM as default** | Apple promotes SPM as the standard. Xcode 26 works best with SPM. The iOS community is migrating to SPM. |
| **Keep CocoaPods as fallback** | Many legacy projects depend on CocoaPods. React Native < 0.75 does not support SPM. Some setups (static frameworks) need CocoaPods. |
| **Single helper function** | Instead of modifying each podspec individually, the logic is centralized in `firebase_dependency()`. If the logic changes, it changes in one place. |
| **SPM URL in package.json** | Single source of truth: the Firebase version and SPM URL are in a single file. Prevents desynchronization between packages. |
| **`$RNFirebaseDisableSPM` flag** | Escape hatch: if something fails with SPM, users can revert to CocoaPods with a single line in the Podfile. |
| **Dynamic linkage for SPM** | Prevents each pod from embedding a copy of Firebase SPM products (which causes "duplicate symbols" in static). |
| **`SWIFT_ENABLE_EXPLICIT_MODULES=NO` for CocoaPods** | Allows the Swift compiler to use implicit module discovery (like Xcode 16), avoiding errors with Firebase's internal modules. |
| **`#if __has_include` in native code** | Allows the same .m/.h file to compile with both SPM (framework headers) and CocoaPods (@import). No changes needed in app code. |

---

## 3. Changes Made

### 3.1 `packages/app/firebase_spm.rb` — The Core Logic

- **What it is:** A Ruby file defining a helper function
- **Where:** `packages/app/firebase_spm.rb`
- **Why it exists:** Because each react-native-firebase package (auth, analytics, messaging, etc.) has a `.podspec` file that declares its iOS dependencies. Previously, each called `s.dependency 'Firebase/Auth', version` directly. Now, they all call `firebase_dependency()` which decides whether to use SPM or CocoaPods.
- **Purpose:** Centralize SPM vs CocoaPods decision logic in a single place

```ruby
# STEP 1: Read the Firebase SPM repository URL from package.json
# This runs ONCE when the file is loaded
$firebase_spm_url ||= begin
  app_package_path = File.join(__dir__, 'package.json')
  app_package = JSON.parse(File.read(app_package_path))
  app_package['sdkVersions']['ios']['firebaseSpmUrl']
  # Result: "https://github.com/firebase/firebase-ios-sdk.git"
end

# STEP 2: Function called by each podspec
def firebase_dependency(spec, version, spm_products, pods)
  # Condition 1: Does the spm_dependency function exist?
  #   → YES if React Native >= 0.75 (they added it)
  #   → NO if React Native < 0.75
  #
  # Condition 2: Did the user NOT define $RNFirebaseDisableSPM?
  #   → If the user added $RNFirebaseDisableSPM = true in their Podfile,
  #     this variable EXISTS and the condition is false

  if defined?(spm_dependency) && !defined?($RNFirebaseDisableSPM)
    # SPM PATH: Register dependency via Swift Package Manager
    spm_dependency(spec,
      url: $firebase_spm_url,
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: version },
      products: spm_products
    )
  else
    # COCOAPODS PATH: Register dependency via traditional CocoaPods
    pods = [pods] unless pods.is_a?(Array)  # Normalize to array
    pods.each do |pod|
      spec.dependency pod, version
    end
  end
end
```

### 3.2 `packages/app/__tests__/firebase_spm_test.rb` — Unit Tests

- **What it is:** Ruby test file using the Minitest framework
- **Where:** `packages/app/__tests__/firebase_spm_test.rb`
- **Why it exists:** To verify SPM vs CocoaPods decision logic works correctly in CI without needing a real iOS project
- **Purpose:** Detect regressions if someone modifies `firebase_spm.rb`

**The 5 tests:**

| Test | What it verifies |
|------|-----------------|
| `test_cocoapods_single_pod` | When SPM is NOT available, CocoaPods is used with a single pod |
| `test_cocoapods_multiple_pods` | When SPM is NOT available, multiple pods are registered |
| `test_spm_single_product` | When SPM IS available, `spm_dependency` is called with correct parameters |
| `test_spm_multiple_products_ignores_cocoapods_extras` | SPM only uses SPM products, not the extra CocoaPods pods |
| `test_reads_spm_url_from_package_json` | The URL is correctly read from package.json |

### 3.3 `packages/app/package.json` — Source of Truth

A `firebaseSpmUrl` field was added inside `sdkVersions.ios`:

```json
{
  "sdkVersions": {
    "ios": {
      "firebase": "12.10.0",
      "firebaseSpmUrl": "https://github.com/firebase/firebase-ios-sdk.git",
      "iosTarget": "15.0",
      "macosTarget": "10.15",
      "tvosTarget": "15.0"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `firebase` | String | Firebase iOS SDK version. Used by all podspecs. |
| `firebaseSpmUrl` | String | Git repository URL for Firebase SPM. |
| `iosTarget` | String | Minimum supported iOS version. |
| `macosTarget` | String | Minimum supported macOS version. |
| `tvosTarget` | String | Minimum supported tvOS version. |

### 3.4 The 16 `.podspec` Files — Helper Consumers

Every react-native-firebase package has a `.podspec` file. **All were modified** to use `firebase_dependency()` instead of direct `s.dependency`.

**Before (original):**
```ruby
# In RNFBAuth.podspec
s.dependency 'Firebase/Auth', firebase_sdk_version
```

**After (with SPM support):**
```ruby
# In RNFBAuth.podspec
require '../app/firebase_spm'  # Load the helper
firebase_dependency(s, firebase_sdk_version, ['FirebaseAuth'], 'Firebase/Auth')
```

**Complete table of all 16 packages:**

| Package | Podspec | SPM Products | CocoaPods Pods | Notes |
|---------|---------|--------------|----------------|-------|
| **app** | `RNFBApp.podspec` | `['FirebaseCore']` | `'Firebase/CoreOnly'` | Base package, required by all |
| **auth** | `RNFBAuth.podspec` | `['FirebaseAuth']` | `'Firebase/Auth'` | Authentication |
| **analytics** | `RNFBAnalytics.podspec` | `['FirebaseAnalytics']` | `'FirebaseAnalytics/Core'` | Has extra logic for IdentitySupport |
| **messaging** | `RNFBMessaging.podspec` | `['FirebaseMessaging']` | `['Firebase/Messaging', 'FirebaseCoreExtension']` | Needs 2 pods in CocoaPods |
| **crashlytics** | `RNFBCrashlytics.podspec` | `['FirebaseCrashlytics']` | `['Firebase/Crashlytics', 'FirebaseCoreExtension']` | Needs 2 pods in CocoaPods |
| **firestore** | `RNFBFirestore.podspec` | `['FirebaseFirestore']` | `'Firebase/Firestore'` | NoSQL database |
| **database** | `RNFBDatabase.podspec` | `['FirebaseDatabase']` | `'Firebase/Database'` | Realtime Database |
| **storage** | `RNFBStorage.podspec` | `['FirebaseStorage']` | `'Firebase/Storage'` | File storage |
| **functions** | `RNFBFunctions.podspec` | `['FirebaseFunctions']` | `'Firebase/Functions'` | Cloud Functions |
| **perf** | `RNFBPerf.podspec` | `['FirebasePerformance']` | `'Firebase/Performance'` | Performance Monitoring |
| **app-check** | `RNFBAppCheck.podspec` | `['FirebaseAppCheck']` | `'Firebase/AppCheck'` | App integrity verification |
| **installations** | `RNFBInstallations.podspec` | `['FirebaseInstallations']` | `'Firebase/Installations'` | Installation IDs |
| **remote-config** | `RNFBRemoteConfig.podspec` | `['FirebaseRemoteConfig']` | `'Firebase/RemoteConfig'` | Remote configuration |
| **in-app-messaging** | `RNFBInAppMessaging.podspec` | `['FirebaseInAppMessaging-Beta']` | `'Firebase/InAppMessaging'` | In-app messages |
| **app-distribution** | `RNFBAppDistribution.podspec` | `['FirebaseAppDistribution-Beta']` | `'Firebase/AppDistribution'` | App distribution |
| **ml** | `RNFBML.podspec` | *(disabled)* | *(disabled)* | Machine Learning (commented out) |

**Why do Messaging and Crashlytics need 2 pods in CocoaPods but only 1 SPM product?**

Because `FirebaseCoreExtension` is a **transitive** dependency in SPM — when you install `FirebaseMessaging` via SPM, SPM automatically includes `FirebaseCoreExtension`. But in CocoaPods, each dependency must be declared explicitly.

### 3.5 The 43 Native iOS Files — Dual Imports

- **What they are:** `.h` (header) and `.m`/`.mm` (implementation) files in Objective-C
- **Where:** Inside `packages/*/ios/RNFB*/`
- **Why they were modified:** Because SPM and CocoaPods expose Firebase headers differently
- **Purpose:** Allow the same code to compile with both SPM and CocoaPods

**Dual import pattern:**

```objc
// BEFORE (CocoaPods only):
#import <Firebase/Firebase.h>  // Umbrella header that includes everything

// AFTER (SPM + CocoaPods):
#if __has_include(<Firebase/Firebase.h>)
  // Path 1: CocoaPods — the umbrella header exists
  #import <Firebase/Firebase.h>
#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)
  // Path 2: SPM — each module has its own header
  #import <FirebaseAuth/FirebaseAuth.h>
  #import <FirebaseCore/FirebaseCore.h>
#else
  // Path 3: @import (Clang modules) — final fallback
  @import FirebaseCore;
  @import FirebaseAuth;
#endif
```

**Pattern explanation:**

| Directive | What it does | When it's used |
|-----------|-------------|----------------|
| `#if __has_include(<Firebase/Firebase.h>)` | Asks the compiler: "does this header exist in the project?" | At compile time. If CocoaPods installed Firebase, this header exists. |
| `#import <Firebase/Firebase.h>` | Imports the Firebase umbrella header (includes EVERYTHING) | Only with CocoaPods, because CocoaPods creates this header that bundles everything. |
| `#elif __has_include(<FirebaseAuth/FirebaseAuth.h>)` | Asks: "does the individual module header exist?" | At compile time. If SPM installed FirebaseAuth, this header exists. |
| `#import <FirebaseAuth/FirebaseAuth.h>` | Imports the module-specific header | With SPM, because each SPM product has its own namespace. |
| `@import FirebaseAuth;` | Clang module import (Objective-C modules) | Fallback: works in both modes but requires modules to be enabled. |

**Files modified by package:**

| Package | Files | Imported Headers |
|---------|-------|-----------------|
| auth | `RNFBAuthModule.h`, `RNFBAuthModule.m` | `FirebaseCore`, `FirebaseAuth` |
| analytics | `RNFBAnalyticsModule.m` | `FirebaseCore`, `FirebaseAnalytics` |
| messaging | `RNFBMessagingModule.m`, `RNFBMessagingSerializer.m` | `FirebaseCore`, `FirebaseMessaging` |
| crashlytics | `RNFBCrashlyticsModule.m`, `RNFBCrashlyticsInitProvider.h`, `RNFBCrashlyticsInitProvider.m`, `RNFBCrashlyticsNativeHelper.m` | `FirebaseCore`, `FirebaseCrashlytics`, `FirebaseCoreExtension` |
| firestore | `RNFBFirestoreCommon.h`, `RNFBFirestoreCollectionModule.h`, `RNFBFirestoreSerialize.h`, `RNFBFirestoreSerialize.m`, `RNFBFirestoreQuery.h` | `FirebaseCore`, `FirebaseFirestore` |
| database | `RNFBDatabaseCommon.h`, `RNFBDatabaseQuery.h`, `RNFBDatabaseQueryModule.h`, `RNFBDatabaseReferenceModule.m`, `RNFBDatabaseOnDisconnectModule.m` | `FirebaseCore`, `FirebaseDatabaseInternal` |
| storage | `RNFBStorageModule.m`, `RNFBStorageCommon.h` | `FirebaseCore`, `FirebaseStorage` |
| functions | `RNFBFunctionsModule.mm` | `FirebaseCore`, `FirebaseFunctions` |
| perf | `RNFBPerfModule.m` | `FirebaseCore`, `FirebasePerformance` |
| app-check | `RNFBAppCheckProvider.h`, `RNFBAppCheckModule.m` | `FirebaseCore`, `FirebaseAppCheck` |
| installations | `RNFBInstallationsModule.m` | `FirebaseCore`, `FirebaseInstallations` |
| remote-config | `RNFBRemoteConfigModule.m` | `FirebaseCore`, `FirebaseRemoteConfig` |
| in-app-messaging | `RNFBInAppMessagingModule.m` | `FirebaseCore`, `FirebaseInAppMessaging` |
| app-distribution | `RNFBAppDistributionModule.m` | `FirebaseCore`, `FirebaseAppDistribution` |
| app | `RNFBUtilsModule.m`, `RNFBJSON.m`, `RNFBMeta.m`, `RNFBPreferences.m`, `RNFBSharedUtils.m`, `RNFBRCTAppDelegate.m` | `FirebaseCore` |

### 3.6 `.github/workflows/tests_e2e_ios.yml` — CI with Dual Matrix

The CI E2E workflow was extended to test **both modes** (SPM and CocoaPods) on every Pull Request.

**Key change 1 — Expanded matrix:**

```yaml
# BEFORE: only tested debug and release
let buildmode = ['debug', 'release'];

# AFTER: also tests SPM and CocoaPods
let buildmode = ['debug', 'release'];
let depResolution = ['spm', 'cocoapods'];  // NEW
```

This generates **4 E2E job combinations**:
- `iOS (debug, spm, 0)`
- `iOS (debug, cocoapods, 0)`
- `iOS (release, spm, 0)`
- `iOS (release, cocoapods, 0)`

**Key change 2 — "Configure Dependency Resolution Mode" step:**

```yaml
- name: Configure Dependency Resolution Mode
  run: |
    if [[ "${{ matrix.dep-resolution }}" == "cocoapods" ]]; then
      echo "Configuring CocoaPods-only mode (disabling SPM)"
      cd tests/ios

      # 1. Switch linkage from dynamic to static
      sed -i '' "s/^linkage = 'dynamic'/linkage = 'static'/" Podfile

      # 2. Inject $RNFirebaseDisableSPM = true at the top of the Podfile
      printf '%s\n' '$RNFirebaseDisableSPM = true' | cat - Podfile > Podfile.tmp && mv Podfile.tmp Podfile

      # 3. Remove SWIFT_ENABLE_EXPLICIT_MODULES (not needed without SPM in CI)
      sed -i '' "/SWIFT_ENABLE_EXPLICIT_MODULES/d" Podfile

      echo "Podfile configured for CocoaPods-only mode"
    else
      echo "Using default SPM mode (dynamic linkage)"
    fi
```

### 3.7 `tests/ios/Podfile` — Test Podfile with Xcode 26 Workaround

**Key lines:**

```ruby
# Dynamic linkage for SPM (CI switches to 'static' for CocoaPods mode)
linkage = 'dynamic'

# Xcode 26 workaround
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
  end
end
```

**What is `SWIFT_ENABLE_EXPLICIT_MODULES`?**

An Xcode build setting that controls how the Swift compiler discovers modules:
- `YES` (default in Xcode 26): The compiler ONLY finds modules that are explicitly declared. If a module is not listed as "public", it won't be found.
- `NO` (default in Xcode 16): The compiler searches for modules automatically in all search paths. More permissive but less strict.

Firebase has internal modules that are not public. With `YES`, Xcode 26 can't find them → compilation error. With `NO`, it works as before.

---

## 4. Function Reference

### 4.1 `firebase_dependency(spec, version, spm_products, pods)`

**Purpose:** Register a Firebase dependency in a podspec, automatically choosing between SPM and CocoaPods.

**Parameters:**

| Parameter | Ruby Type | Required | Description | Example |
|-----------|-----------|----------|-------------|---------|
| `spec` | `Pod::Specification` | Yes | The podspec object (the `s` in podspec DSL). Represents the package being configured. | `s` (from podspec context) |
| `version` | `String` | Yes | Firebase iOS SDK version to use. Must match the version in package.json. | `'12.10.0'` |
| `spm_products` | `Array<String>` | Yes | List of Firebase SPM product names. These names are the ones in the firebase-ios-sdk `Package.swift`. | `['FirebaseAuth']` or `['FirebaseCrashlytics']` |
| `pods` | `String` or `Array<String>` | Yes | CocoaPods dependency name(s). Can be a string (1 dependency) or array (multiple). These are the names from Firebase's Podspec. | `'Firebase/Auth'` or `['Firebase/Messaging', 'FirebaseCoreExtension']` |

**Return value:** `nil` — The function has no return value. Its effect is a side-effect: it registers the dependency in the system (SPM or CocoaPods).

**Usage example in a podspec:**

```ruby
# RNFBAuth.podspec
require '../app/firebase_spm'

Pod::Spec.new do |s|
  # ... podspec configuration ...

  firebase_sdk_version = appPackage['sdkVersions']['ios']['firebase']

  # Register FirebaseAuth as a dependency
  # - If SPM: calls spm_dependency(s, url: "...", products: ['FirebaseAuth'])
  # - If CocoaPods: calls s.dependency('Firebase/Auth', '12.10.0')
  firebase_dependency(s, firebase_sdk_version, ['FirebaseAuth'], 'Firebase/Auth')
end
```

**Example with multiple CocoaPods dependencies:**

```ruby
# RNFBCrashlytics.podspec
firebase_dependency(s, firebase_sdk_version,
  ['FirebaseCrashlytics'],                            # SPM: only needs this
  ['Firebase/Crashlytics', 'FirebaseCoreExtension']   # CocoaPods: needs both
)
```

### 4.2 Global Variable `$firebase_spm_url`

**Purpose:** Stores the Firebase iOS SDK git repository URL for SPM.

| Property | Value |
|----------|-------|
| **Type** | `String` (Ruby global variable) |
| **Default value** | `nil` (assigned when `firebase_spm.rb` is loaded) |
| **Value after loading** | `'https://github.com/firebase/firebase-ios-sdk.git'` |
| **Can be overridden** | Yes. If you define `$firebase_spm_url = 'other-url'` BEFORE loading `firebase_spm.rb`, it will use your URL. |

**Override use case:**

```ruby
# In your Podfile, before any pod install:
$firebase_spm_url = 'https://github.com/my-company/firebase-ios-sdk-fork.git'
# Now all RNFB packages will use your Firebase fork
```

### 4.3 Global Variable `$RNFirebaseDisableSPM`

**Purpose:** Flag to force CocoaPods usage and disable SPM.

| Property | Value |
|----------|-------|
| **Type** | Any (checked with `defined?()`, not by value) |
| **Default value** | Not defined (SPM enabled) |
| **How to activate** | `$RNFirebaseDisableSPM = true` in your Podfile |
| **Effect** | `firebase_dependency()` will always use CocoaPods |

**IMPORTANT:** The function checks `defined?($RNFirebaseDisableSPM)`, NOT the value. This means even `$RNFirebaseDisableSPM = false` DISABLES SPM, because the variable is "defined". To enable SPM, simply don't define this variable.

### 4.4 `spm_dependency` Function (provided by React Native)

**NOT defined in this project.** It is a function that React Native (>= 0.75) injects during the `pod install` process. If it exists, it means the environment supports SPM.

| Parameter | Type | Description |
|-----------|------|-------------|
| `spec` | `Pod::Specification` | Podspec to add the dependency to |
| `url:` | `String` | Git repository URL of the Swift package |
| `requirement:` | `Hash` | Version constraint. Format: `{ kind: 'upToNextMajorVersion', minimumVersion: '12.10.0' }` |
| `products:` | `Array<String>` | List of SPM products to include |

---

## 5. Integration Guide — Legacy Projects

> **Legacy project** = A project using React Native with CocoaPods that does NOT have SPM support.

### 5.1 Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| React Native | 0.73+ | 0.75+ (for SPM) |
| Xcode | 15.0 | 26+ |
| CocoaPods | 1.14+ | 1.16+ |
| iOS target | 15.0+ | 15.1+ |
| Ruby | 2.7+ | 3.0+ |

### 5.2 Step by step

#### Step 1: Update `@react-native-firebase` to the version with SPM support

```bash
# In your React Native project
yarn add @react-native-firebase/app@latest
yarn add @react-native-firebase/auth@latest
# ... repeat for each module you use
```

#### Step 2: Decide — SPM or CocoaPods?

**Use SPM if:**
- React Native >= 0.75
- Xcode 26+
- You don't have dependencies requiring static linkage
- You want the Apple-recommended approach

**Use CocoaPods if:**
- React Native < 0.75
- You have `use_frameworks! :linkage => :static` in your Podfile
- You have other dependencies incompatible with SPM
- You prefer not to change anything (legacy mode)

#### Step 3A: Configuration for SPM (recommended)

```ruby
# ios/Podfile

# Make sure you have dynamic linkage
linkage = 'dynamic'
use_frameworks! :linkage => linkage.to_sym

target 'YourApp' do
  # ... your pods ...

  post_install do |installer|
    # REQUIRED for Xcode 26+
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end
    end
  end
end
```

Then:
```bash
cd ios && pod install
```

You should see messages like:
```
[react-native-firebase] RNFBApp: Using SPM for Firebase dependency resolution (products: FirebaseCore)
[react-native-firebase] RNFBAuth: Using SPM for Firebase dependency resolution (products: FirebaseAuth)
```

#### Step 3B: Configuration for CocoaPods (legacy)

```ruby
# ios/Podfile — BEFORE target declarations

$RNFirebaseDisableSPM = true  # Force CocoaPods

# Static linkage (required for CocoaPods)
linkage = 'static'
use_frameworks! :linkage => linkage.to_sym

target 'YourApp' do
  # ... your pods ...

  post_install do |installer|
    # REQUIRED if using Xcode 26+
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end
    end
  end
end
```

You should see:
```
[react-native-firebase] RNFBApp: SPM disabled ($RNFirebaseDisableSPM = true), using CocoaPods for Firebase dependencies
```

#### Step 4: Verify it compiles

```bash
cd ios && xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -sdk iphonesimulator build
```

### 5.3 Common conflicts

| Conflict | Symptom | Solution |
|----------|---------|----------|
| **Duplicate symbols** | `duplicate symbol '_FIRApp' in ...` | You're using SPM with static linkage. Switch to `dynamic` or enable `$RNFirebaseDisableSPM` |
| **Module not found** | `No such module 'FirebaseAuth'` | Missing `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` in Xcode 26 |
| **Header not found** | `'Firebase/Firebase.h' file not found` | The current mode (SPM) doesn't generate that umbrella header. Native files already use `#if __has_include` to handle this. |
| **Pod::UI undefined** | `NameError: uninitialized constant Pod` | You're running `firebase_spm.rb` outside CocoaPods (in tests). The `defined?(Pod)` guard already handles this. |
| **Version mismatch** | `unable to satisfy version requirement` | Make sure the version in `@react-native-firebase/app` package.json matches your pods. |

### 5.4 Post-integration checklist

- [ ] `pod install` completes without errors
- [ ] Log messages show the correct mode (SPM or CocoaPods)
- [ ] Project compiles in Xcode without errors
- [ ] App launches and `Firebase.configure()` executes
- [ ] Firebase features (auth, analytics, etc.) work
- [ ] Existing tests pass

---

## 6. Integration Guide — Upgrading to SPM

### 6.1 What is SPM?

**Swift Package Manager (SPM)** is Apple's native package manager, integrated into Xcode. Unlike CocoaPods (a third-party tool), SPM is built into Xcode and Swift.

| Aspect | CocoaPods | SPM |
|--------|-----------|-----|
| **Installation** | `gem install cocoapods` | Comes with Xcode |
| **Config file** | `Podfile` | `Package.swift` |
| **Lock file** | `Podfile.lock` | `Package.resolved` |
| **Resolution** | Centralized (trunk server) | Decentralized (git repos) |
| **Type** | External Ruby gem | Native Apple tool |

### 6.2 Dependencies and minimum versions

| Dependency | Minimum Version | Reason |
|------------|----------------|--------|
| `react-native` / `react-native-tvos` | 0.75.0 | First version that exposes `spm_dependency()` in the CocoaPods runtime |
| `@react-native-firebase/app` | Version with SPM support (this PR) | Needs `firebase_spm.rb` |
| Xcode | 15.0 (functional), 26+ (recommended) | SPM has been integrated since Xcode 11, but Xcode 26 changes the compiler |
| Firebase iOS SDK | 12.10.0+ | Version tested with this system |
| CocoaPods | 1.14+ | For `spm_dependency()` to work correctly in the pod install context |

### 6.3 Step-by-step instructions

#### Step 1: Verify React Native version

```bash
node -p "require('./package.json').dependencies['react-native']"
# or for tvOS:
node -p "require('./package.json').dependencies['react-native-tvos']"
```

If it's < 0.75, you need to upgrade React Native first. SPM is not available in earlier versions.

#### Step 2: Verify linkage in your Podfile

Open `ios/Podfile` and look for:
```ruby
use_frameworks! :linkage => :static
```

If you have `:static`, you need to change it to `:dynamic` for SPM:
```ruby
use_frameworks! :linkage => :dynamic
```

**WARNING:** Switching from static to dynamic may affect other dependencies. Verify that all your dependencies support dynamic linkage.

#### Step 3: Remove `$RNFirebaseDisableSPM` if present

If your Podfile has this line, remove it:
```ruby
$RNFirebaseDisableSPM = true  # REMOVE THIS LINE
```

#### Step 4: Add Xcode 26 workaround (if applicable)

In your Podfile `post_install`:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
    end
  end
end
```

#### Step 5: Clean and reinstall

```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
```

#### Step 6: Verify in pod install output

Look for these lines:
```
[react-native-firebase] RNFBApp: Using SPM for Firebase dependency resolution (products: FirebaseCore)
```

If you see "Using SPM", SPM mode is active.

If you see "SPM not available", your React Native version doesn't support SPM.

### 6.4 Common errors and solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `duplicate symbol` during linking | SPM + static linkage | Switch to `dynamic` linkage |
| `No such module 'FirebaseCore'` | Xcode 26 with explicit modules | Add `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` |
| `spm_dependency is not defined` | RN < 0.75 | Update React Native to >= 0.75 or use CocoaPods with `$RNFirebaseDisableSPM = true` |
| `multiple commands produce Firebase.framework` | Conflict between SPM and CocoaPods for Firebase | Make sure you DON'T have a manual `pod 'Firebase/Core'` in your Podfile if SPM is active |
| `unable to resolve package` | Incorrect SPM URL | Check `firebaseSpmUrl` in `packages/app/package.json` |
| Pod install loop / version conflict | Firebase version mismatch between SPM and CocoaPods | Make sure you use the same version in `package.json` and any manual pods |

### 6.5 Rollback to CocoaPods

If SPM doesn't work, you can revert to CocoaPods in 30 seconds:

```ruby
# Add to the top of your Podfile:
$RNFirebaseDisableSPM = true

# Change linkage to static:
use_frameworks! :linkage => :static
```

```bash
cd ios && rm -rf Pods && pod install
```

---

## 7. Glossary

| Term | Definition |
|------|-----------|
| **SPM (Swift Package Manager)** | Apple's tool for managing dependencies in iOS/macOS projects. Comes integrated with Xcode. The modern replacement for CocoaPods. |
| **CocoaPods** | Third-party tool (written in Ruby) for managing iOS dependencies. Was the standard for years. Uses a `Podfile` to declare dependencies. |
| **Podspec (.podspec)** | Configuration file describing a library distributed via CocoaPods. Defines name, version, source files, dependencies, etc. |
| **Podfile** | File in the `ios/` directory root that declares what dependencies your project needs. CocoaPods reads it during `pod install`. |
| **Linkage (static vs dynamic)** | Defines how libraries are linked to the final binary. **Static**: the library code is copied into your app. **Dynamic**: the library is a separate file loaded at runtime. |
| **Framework** | In iOS, a way to package a library with its headers, resources, and metadata. Can be static or dynamic. |
| **Header (.h)** | File declaring the public interface of an Objective-C/C library. Tells the compiler what functions/classes exist. |
| **Implementation (.m, .mm)** | File with the actual code (implementation) in Objective-C (.m) or Objective-C++ (.mm). |
| **`#if __has_include`** | C/Objective-C preprocessor directive that asks: "does this file exist in the search paths?" Returns true/false. Evaluated at compile time. |
| **`@import`** | Modern way to import a module in Objective-C. Equivalent to `#import` but more efficient (uses Clang modules). |
| **Explicit modules** | Xcode 26 feature: the compiler only recognizes modules that are explicitly declared. Internal/transitive modules are not found automatically. |
| **Implicit modules** | Pre-Xcode 26 behavior: the compiler searches for modules automatically in all search paths, including transitive ones. |
| **Transitive dependency** | A dependency you don't declare directly, but is required by a dependency you did declare. Example: if you use `FirebaseMessaging` and it needs `FirebaseCoreExtension`, then `FirebaseCoreExtension` is transitive. |
| **`defined?()` (Ruby)** | Ruby operator that checks if an expression is defined. Returns a description string or `nil`. Does NOT raise an error if undefined. |
| **Ruby global variable (`$var`)** | Variable starting with `$` in Ruby. Accessible from anywhere in the program. Used here for shared configuration between files. |
| **`spm_dependency()`** | Function that React Native (>= 0.75) injects into the CocoaPods context during `pod install`. Allows a podspec to declare an SPM dependency. |
| **YAML block scalar (`|`)** | In YAML files, `|` indicates a multiline text block where line breaks are preserved. Used in GitHub Actions for multiline scripts. |
| **Umbrella header** | A `.h` file that imports all headers of a framework. CocoaPods creates `Firebase/Firebase.h` which includes everything. SPM does not generate this file. |
| **Xcode build setting** | Configuration that controls how Xcode compiles your project. Defined in the `.xcodeproj` file or via CocoaPods `post_install`. Example: `SWIFT_ENABLE_EXPLICIT_MODULES`. |
| **CI/CD** | Continuous Integration / Continuous Deployment. Automated system that compiles, tests, and deploys code on every change. GitHub Actions is used here. |
| **Matrix (CI)** | GitHub Actions strategy to run the same job with different parameter combinations. Example: `buildmode: [debug, release]` × `dep-resolution: [spm, cocoapods]` = 4 runs. |
| **Interop layer** | Compatibility layer that allows old code to work with new APIs. React Native 0.81 with Old Architecture uses interop so Objective-C bridges work with the new system. |
| **react-native-firebase** | Open-source library providing Firebase modules for React Native. Each Firebase service (Auth, Analytics, etc.) is a separate package. Original repo: `invertase/react-native-firebase`. |
