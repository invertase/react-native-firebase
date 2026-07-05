---
type: Reference
title: TurboModule migration implementation workflow
description: New Architecture–specific artifacts for Codegen specs, native module conversion, area harness setup, and coordinated break validation — extends the cross-package change authoring workflow.
tags: [new-architecture, turbomodule, codegen, workflow, migration]
timestamp: 2026-06-26T00:00:00Z
---

# TurboModule migration implementation workflow

Requirements for migrating **one package** (or one legacy native module within a multi-module package) from legacy `NativeModules` to Codegen TurboModules. **Shared loop:** [change authoring workflow](../testing/change-authoring-workflow.md).

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Read first

| Topic | Document |
|-------|----------|
| **Change authoring loop** | [change-authoring-workflow.md](../testing/change-authoring-workflow.md) |
| **Architectural decisions (why)** | [architecture-decisions.md](architecture-decisions.md) — canonical owner; this doc is the *how* |
| Live phase/gate snapshots | [migration-work-queue.md](migration-work-queue.md) |
| Inventory, phase order | [migration-work-queue.md](migration-work-queue.md) |
| Work types, tiers, gates | [change-authoring-workflow.md](../testing/change-authoring-workflow.md); term ids: [iteration-vocabulary.md](../testing/iteration-vocabulary.md) |
| E2e commands | [running-e2e.md](../testing/running-e2e.md) |
| Validation commands | [validation-checklist.md](../testing/validation-checklist.md) |
| Reference implementation | [`packages/functions`](../../../packages/functions/) ([PR #8603](https://github.com/invertase/react-native-firebase/pull/8603)) |

## TurboModule hard gates

In addition to [change authoring gates](../testing/change-authoring-workflow.md#gates):

| Gate | Requirement |
|------|-------------|
| Spec inventory | Native methods inventoried from Java/ObjC; mapped to typed spec using `packages/<pkg>/lib/types/internal.ts` where available |
| Codegen | `specs/NativeRNFBTurbo*.ts` + `codegenConfig`; generated android/ios artifacts **committed** (`includesGeneratedCode: true`) |
| Native shell | Android `NativeRNFBTurbo*` extends generated `*Spec`; iOS spec protocol + `getTurboModule()` |
| JS wiring | `nativeModuleName` → `NativeRNFBTurbo*`; `turboModule: true`; web shims via `setReactNativeModule` unchanged |
| Podspec / package | New-arch guard; exclude duplicate RN generated providers (see [`RNFBFunctions.podspec`](../../../packages/functions/RNFBFunctions.podspec)) |
| Implementation | Package Jest + **unit-focused** e2e on New Architecture build on **every required platform** ([platform coverage gate](../testing/running-e2e.md#platform-coverage-gate-blocking)). Native bridge / codegen / podspec / `build.gradle` touched → **blocking** before handoff; Jest-only does not close `implementation_gate`. Build or env failure keeps the gate open — handoff must include a platform matrix (exit code + pass counts + log path) or an explicit env blocker, not “Jest green”. |
| Review | Package e2e **area-focused** tier on frozen tree; no `.only`; native lint rows from [validation checklist](../testing/validation-checklist.md) where touched |
| Event deferral | Legacy event proxy retained unless [queue deferral discriminator](migration-work-queue.md#deferred-cleanup-phase-eventemitter) triggers escalation |

### Multi-module packages

One TurboModule spec **per legacy native module** — do not consolidate the *specs* in the first pass (database ×5, firestore ×4); each legacy module keeps its own `NativeRNFBTurbo*` spec and shell.

**Commit granularity: one commit per package, not per spec.** Splitting a multi-module package across several commits adds little value and is often impractical — the specs share `codegenConfig`, generated artifacts, podspec/`build.gradle` guards, and JS wiring that only compile and pass e2e together. Convert the whole package (all its legacy modules → all its specs) in a single `implementation` → `independent-review` → `commit` loop and land it as **one** `feat(<pkg>)!: migrate <pkg> to TurboModules` commit (breaking: New Architecture required). Per-spec commits are only warranted if a single legacy module is genuinely independently shippable and reviewable, which is rare. Multiple specs ≠ multiple commits.

### Multi-spec packages (`app` precedent)

Phase 0 `app` is the first package with **two TurboModule specs in one `codegenConfig`**: `NativeRNFBTurboApp` + `NativeRNFBTurboUtils`. Modular type parity is tracked separately in [Phase 0.1](migration-work-queue.md#phase-01-app-comparetypes) (`configs/app.ts`). Single `codegenConfig.name` = the **aggregate library name** `RNFBAppTurboModules` (not a module name; decision [NewArch-AD-7](architecture-decisions.md#newarch-ad-7--codegenconfigname--aggregate-library-name-one-codegenconfig-per-package--accepted)); iOS **`modulesProvider`** maps each spec name to its ObjC shell (`RNFBAppModule`, `RNFBUtilsModule`). Android registers both shells in the package class. Method names must be unique across the package's specs ([NewArch-AD-11](architecture-decisions.md#newarch-ad-11--multi-module-method-names-are-merged-uniqueness-enforced-by-test--accepted)). Reference: [`packages/app/package.json`](../../../packages/app/package.json), [`ReactNativeFirebaseAppPackage.java`](../../../packages/app/android/src/reactnative/java/io/invertase/firebase/app/ReactNativeFirebaseAppPackage.java).

## Spec authoring (`gap-analysis` / pre-`implementation`)

1. Inventory `@ReactMethod` / `RCT_EXPORT_METHOD` from existing Java/ObjC sources.
2. Draft `specs/NativeRNFBTurbo*.ts` — strong types from `lib/types/internal.ts` and firebase-js-sdk shapes; `Object` / open maps only for genuinely dynamic payloads. Follow [Codegen-safe names and types](#codegen-safe-names-and-types-blocking) before running codegen.
3. Naming: `NativeRNFBTurbo*` prefix (decision [NewArch-AD-2](architecture-decisions.md#newarch-ad-2--naming-nativernfbturbo--accepted)).
4. Regenerate codegen output; commit under `android/.../generated` and `ios/generated` — [§ Running codegen](#running-codegen-canonical).
5. For Phase 0 (`app`): include unified module resolver work in `packages/app` ([queue § reference pattern](migration-work-queue.md#reference-pattern-functions)).
6. **NewArch-AD-18 raw-resolver audit:** `grep` product code for `getReactNativeModule(` (exclude `packages/app/lib/internal/nativeModule*.ts` infrastructure). For each hit, compare against the [NewArch-AD-18 canonical exception table](architecture-decisions.md#canonical-exception-table): existing row → confirm turbo module name + in-code `// NewArch-AD-18 E<n>:` comment; unlisted → bug (legacy name / should be wrapped) or new exception (add ADR row + rationale **before** merge). Every package migration PR must leave no unlisted raw call sites in that package's scope.

### Phase 0 re-implementation must-fix checklist

Phase 0 is a **re-implementation pass** under the matured ADRs — light in line count but necessary for correctness. Full checklist (also in [queue P0 row](migration-work-queue.md#current-snapshot)):

| # | ADR / item | Work |
|---|------------|------|
| 1 | **NewArch-AD-7** | Rename `functions` `codegenConfig.name` → `RNFBFunctionsTurboModules`; regen + commit generated artifacts (do **first** — prevents wrong precedent for single-spec packages). Module name `NativeRNFBTurboFunctions` unchanged. |
| 2 | **NewArch-AD-9** | iOS `RNFBAppModule` + `RNFBUtilsModule`: `requiresMainQueueSetup` → `NO`. |
| 3 | **NewArch-AD-19** | Remove `methodQueue = dispatch_get_main_queue()` from both shells unless on-device validation proves a specific method needs it. |
| 4 | **NewArch-AD-14 / NewArch-AD-14a** | Replace eager wrap + flatten-onto-`{}`+`Object.freeze` with memoizing lazy Proxy + routing composite Proxy in [`nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts). Drop dead `multiModuleRoot[moduleName]` boolean flags. |
| 5 | **NewArch-AD-15** | Stop calling `getConstants()` on every resolve in `withTurboConstants`; memoize static constants only; Play Services → dynamic method (remove from utils constants typing when converted). |
| 6 | **NewArch-AD-18 E6** | Fix `messaging.isSupported()`: `NativeRNFBTurboUtils` + `androidGetPlayServicesStatus()`. |
| 7 | **NewArch-AD-18 E5, E7** | `UtilsStatics.FilePath`: memoized static utils accessor; `app/lib/modular.ts` meta/json/preferences → `getAppModule()`. |
| 8 | **NewArch-AD-13** | Harness overrides: `.gitignore` `tests/harness.overrides.js` first, then `harness.overrides.example.js` + read hook in `tests/app.js` / `tests/globals.js`. |
| 9 | **NewArch-AD-17.1** | Jest TurboModule enumeration/Proxy contract test **including 2-host merge fixture** — file [`packages/app/__tests__/nativeModuleContract.test.ts`](../../../packages/app/__tests__/nativeModuleContract.test.ts); scoped run: `yarn tests:jest -- packages/app/__tests__/nativeModuleContract.test.ts` ([ADR §17.1](architecture-decisions.md#newarch-ad-171--jest-turbomodule-contract-test--accepted)). |
| 10 | **Keep** | NewArch-AD-8 `for...in`/`Object.create`, NewArch-AD-10 `authDomains` centralization, `tests/globals.js` `NativeRNFBTurbo*` proxy (E4). |

**Out of scope for Phase 0 (deferred):** NewArch-AD-18 E8–E10 (firestore/database/pnv until those packages migrate); dead legacy Java shells; iOS `customAuthDomains` rename.

## TurboModule `implementation`

Per package, repeat the [`functions`](../../../packages/functions/) shape:

1. **`specs/NativeRNFBTurbo*.ts`** — extends `TurboModule`.
2. **`package.json` `codegenConfig`** — `jsSrcsDir: "specs"`, android `javaPackageName`, ios `modulesProvider` (one entry per spec; see [multi-spec packages](#multi-spec-packages-app-precedent)).
3. **Android codegen wiring** — `react-native.config.js` → `platforms.android.cmakeListsPath` pointing at the **committed** generated JNI `CMakeLists.txt` (app package path differs from [`functions`](../../../packages/functions/react-native.config.js): under `src/reactnative/java/.../generated/jni/`). After `yarn codegen`, verify CMake uses the compile macro for the monorepo React Native version: **`target_compile_options`** on RN **0.78** (current test app), **`target_compile_reactnative_options`** on RN **0.81+** (current `@react-native/codegen` default).

   **Forward compatibility:** this is **not** a permanent fork. The committed generated `CMakeLists.txt` is reproduced by `yarn codegen` against whatever `@react-native/codegen` the monorepo resolves — when the test app moves to RN 0.81+, re-running codegen emits `target_compile_reactnative_options` and the artifact updates with it. There is no hand-maintained macro choice: the macro only has to match the RN version that generated it, and `functions` already proves the same pipeline regenerates cleanly across versions. Treat a macro mismatch as a *stale committed artifact* (re-run codegen), not as a code change to maintain.
4. **Android** — `NativeRNFBTurbo*` extends generated `*Spec`; register in package class.
5. **iOS** — `.mm` implements spec; `- (std::shared_ptr<TurboModule>)getTurboModule:` returns generated JSI class.
6. **JS** — update namespace config; no public API changes unless unavoidable.
7. **Native business logic** — prefer keeping ObjC++/Java shell + existing Swift helpers; language modernization is out of scope ([queue rationale](migration-work-queue.md#reference-pattern-functions)).

### Codegen-safe names and types (blocking)

React Native Codegen turns `specs/NativeRNFBTurbo*.ts` into TypeScript, C++, Java, and ObjC++ artifacts. A name or type that is legal in TypeScript can still break generated native code. Check this list during **spec authoring** and before `yarn codegen`.

| Category | Do not use | Use instead | Why |
|----------|------------|-------------|-----|
| Method names | `delete` | `deleteUser`, `deleteToken`, `deleteItem`, etc. | `delete` collides with generated C++ / native language keywords. |
| Type annotations | `object` | A shaped object type, `Object` for truly dynamic Codegen maps, or a named interface | RN Codegen rejects TypeScript `object` (`TSObjectKeyword`) in NativeModule specs. |
| Dynamic maps | Unshaped catch-all payloads when fields are known | A named `interface` with explicit fields | Strong typed specs are easier to review and catch native/JS drift. |
| Any generated symbol | Language keywords / reserved identifiers (`class`, `default`, `new`, `switch`, `case`, `try`, `catch`, `return`, `void`, `static`, `public`, `private`, `protected`, `namespace`, `operator`, `template`, `this`, `self`) | A domain-specific method or field name | Codegen emits bindings in multiple languages; avoid words reserved in any generated target. |

If Codegen requires a wrapper-object type such as `Object`, add a narrow lint disable in the spec file with a comment or local scope; do **not** "fix" it to primitive `object`, because that breaks Codegen. If a legacy method already uses a reserved word, rename the TurboModule spec method and keep the public JS API stable via the wrapper layer.

### TurboModule native registration checklist (blocking)

Repeat for **every** package migration. Skipping any row is the usual cause of `TypeError: new Proxy target must be an Object` (Android) or `Native module NativeRNFBTurbo* is not registered` (iOS/macOS) at runtime.

| # | Layer | Requirement | Reference |
|---|-------|-------------|-----------|
| 1 | **Spec** | `specs/NativeRNFBTurbo*.ts`; module name = `TurboModuleRegistry.get` key. When JS reads `this.native.<constant>` (e.g. `perf`, `in-app-messaging`, `app`, `utils`), declare **`getConstants(): { … }`** in the spec — without it, codegen omits `getConstants` from the JSI method map and `withTurboConstants` has nothing to merge (runtime **`undefined`** on both platforms). | [`app/specs/NativeRNFBTurboApp.ts`](../../../packages/app/specs/NativeRNFBTurboApp.ts) |
| 2 | **codegenConfig** | `name` = aggregate library `RNFB<Package>TurboModules` (not the module name); `includesGeneratedCode: true`; `ios.modulesProvider` maps spec name → ObjC shell class | [`firestore/package.json`](../../../packages/firestore/package.json) |
| 3 | **codegen output** | Regenerate and commit `android/.../generated/` + `ios/generated/` — see [§ Running codegen](#running-codegen-canonical) | [NewArch-AD-5](architecture-decisions.md#newarch-ad-5--commit-generated-code--accepted) |
| 4 | **react-native.config.js** | `platforms.android.cmakeListsPath` → committed `generated/jni/CMakeLists.txt` — path is **relative to package root** and must match `android:codegen` `outputPath` (no duplicate `android/` prefix) | [`firestore/react-native.config.js`](../../../packages/firestore/react-native.config.js) |
| 5 | **CMake macro** | Generated `CMakeLists.txt` must use the macro for the **test app's RN version** (`tests/package.json`): **`target_compile_options`** on RN **0.78**; **`target_compile_reactnative_options`** on RN **0.81+**. Wrong macro → Android CMake configure fails or JNI never links. After `yarn codegen`, diff against [`functions`](../../../packages/functions/android/src/main/java/io/invertase/firebase/functions/generated/jni/CMakeLists.txt) (0.78) or re-run codegen when the test app upgrades. | [§ Android codegen wiring](#turbomodule-implementation) step 3 |
| 6 | **Android shell** | `NativeRNFBTurbo*` extends generated `*Spec`; **only** turbo shells registered in `ReactPackage.createNativeModules`. When the spec declares `getConstants`, implement **`protected getTypedExportedConstants()`** (generated `*Spec` owns `public getConstants()`), not a standalone `public getConstants()` override. | [`perf/.../NativeRNFBTurboPerf.java`](../../../packages/perf/android/src/reactnative/java/io/invertase/firebase/perf/NativeRNFBTurboPerf.java) |
| 7 | **Android build.gradle** | New-arch guard (`newArchEnabled`); `sourceSets { java.excludes = ['**/generated/jni/**'] }` when jni lives under `java.srcDirs` | [`firestore/android/build.gradle`](../../../packages/firestore/android/build.gradle) |
| 8 | **iOS shell** | `.mm`: `RCT_EXPORT_MODULE(NativeRNFBTurbo*)` (exact spec name); `getTurboModule:` → `NativeRNFBTurbo*SpecJSI`; `.h` imports `RNFB<Package>TurboModules.h` and conforms to `NativeRNFBTurbo*Spec` (class extension or header — see [`functions`](../../../packages/functions/ios/RNFBFunctions/RNFBFunctionsModule.h)). **Constants:** when the spec declares `getConstants`, use **typed** `facebook::react::ModuleConstants<JS::NativeRNFBTurbo*::Constants::Builder>` + `[_RCTTypedModuleConstants newWithUnsafeDictionary:…]` — **not** legacy `- (NSDictionary *)getConstants` / `constantsToExport` (JSI never surfaces those to `TurboModuleRegistry.get`). | [`app/.../RNFBAppModule.mm`](../../../packages/app/ios/RNFBApp/RNFBAppModule.mm) |
| 9 | **Podspec** | `install_modules_dependencies(s)`; new-arch guard; `exclude_files` for duplicate RN codegen providers (`RCTModuleProviders.*`, etc.). Add `pod_target_xcconfig` `HEADER_SEARCH_PATHS` → `ios/generated/RNFB<Package>TurboModules` + `ios/generated` when Xcode cannot find generated spec headers (see [`firestore/RNFBFirestore.podspec`](../../../packages/firestore/RNFBFirestore.podspec)). | [`functions/RNFBFunctions.podspec`](../../../packages/functions/RNFBFunctions.podspec) |
| 10 | **JS** | `nativeModuleName` → turbo name; `turboModule: true`; web shim registers turbo name | [`firestore/lib/FirestoreModule.ts`](../../../packages/firestore/lib/FirestoreModule.ts) |
| 11 | **jest.setup.ts** | Mock `NativeRNFBTurbo*` (not legacy `RNFB*Module`) with methods on the correct host; include `getConstants: () => ({ … })` when the package reads constants | [`jest.setup.ts`](../../../jest.setup.ts) |
| 12 | **Native rebuild** | After steps 1–11: **`yarn tests:android:build`** and/or **`yarn tests:ios:build`** — Jest green alone does **not** prove native registration. **Android:** `autolinkLibrariesFromCommand` caches `tests/android/build/generated/autolinking/autolinking.json` keyed only on `tests/{package.json,yarn.lock,react-native.config.js}` — adding or changing a **package** `react-native.config.js` does **not** invalidate the cache; delete `autolinking.json` + `*.sha` under that folder (or touch `tests/package.json`) then rebuild, or JNI never links (`Proxy target must be an Object`). **iOS:** `yarn tests:ios:build` runs `pod install` + Xcode compile; required after codegen / `modulesProvider` / podspec changes. | [`tests/android/settings.gradle`](../../../tests/android/settings.gradle) |

**Symptom → likely miss:** Android `Proxy target must be an object` → rows **4–7** or **12** (CMake not linked / **stale autolinking cache**). JS reads **`undefined`** for `this.native.isFoo` / constant-backed getters on **either platform** → row **1** (spec missing `getConstants`), row **6** (Android `getTypedExportedConstants`), row **8** (iOS still using `NSDictionary` constants). Metro redbox **`Requiring unknown module "undefined"`** at app load (before Jet connects) → **not** a registration miss — [stale JS/native toolchain](../testing/running-e2e.md#turbomodule-stale-toolchain-blocking); run checklist row **12** + Metro reset-cache; escalate to [full toolchain refresh](../testing/running-e2e.md#turbomodule-full-toolchain-refresh) if it persists. iOS `Native module NativeRNFBTurbo* is not registered` → rows **2**, **8**, **9**, **12**. iOS `unrecognized selector` on turbo method → row **8** (legacy `RCT_EXPORT_METHOD` signatures instead of spec protocol). iOS build missing generated header → row **9** (`HEADER_SEARCH_PATHS`).

### Running codegen (canonical)

Package `package.json` scripts (`yarn android:codegen` / `yarn ios:codegen`) are convenience wrappers; **`cd packages/<pkg> && yarn ios:codegen` often fails** after a clean install (`unknown command 'codegen'`) because `@react-native-community/cli` resolves from the **test app** workspace, not the library package cwd.

**Canonical** — from repo root, `cd tests`, one platform at a time; `--outputPath` must match the package's `android:codegen` / `ios:codegen` script (paths differ per package — copy from [`functions/package.json`](../../../packages/functions/package.json)):

```bash
cd tests
npx @react-native-community/cli codegen \
  --path ../packages/<pkg> \
  --platform android \
  --source library \
  --outputPath ../packages/<pkg>/<android:codegen outputPath from package.json>

npx @react-native-community/cli codegen \
  --path ../packages/<pkg> \
  --platform ios \
  --source library \
  --outputPath ../packages/<pkg>/ios/generated
```

Example (`perf` Android): `--outputPath ../packages/perf/android/src/reactnative/java/io/invertase/firebase/perf/generated`.

After regen: commit generated dirs, then [checklist row **12**](#turbomodule-native-registration-checklist-blocking) (`:build` + Metro reset-cache before `:test-cover`).

**Unit-focused** tier per [change authoring § implementation inner loop](../testing/change-authoring-workflow.md#implementation-inner-loop) and [TurboModule area harness](#turbomodule-area-harness) below.

Shared infrastructure (already landed for `functions`):

* [`packages/app/lib/internal/registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts) — `turboModule` flag, iOS null encoding
* [`packages/app/lib/internal/nullSerialization.ts`](../../../packages/app/lib/internal/nullSerialization.ts) + native interceptor

## TurboModule `independent-review`

On a **frozen tree** — full [change authoring § independent-review](../testing/change-authoring-workflow.md#independent-review), plus:

* New Architecture build on each touched platform (native bridge change).
* Package e2e at **area-focused** tier with [area harness](#turbomodule-area-harness) applied locally before first `:test-cover`.
* iOS: exercise null-in-object payloads where the package passes option maps ([RN #52802](https://github.com/facebook/react-native/issues/52802)) — highest risk: `auth`, `firestore`, `database`, `storage`.

## TurboModule area harness

Extends [change authoring § harness narrowing](../testing/change-authoring-workflow.md#harness-narrowing).

**Area setup (required for `unit-focused` and `area-focused` tiers):** copy [`tests/harness.overrides.example.js`](../../../tests/harness.overrides.example.js) to gitignored `tests/harness.overrides.js` — set `modules` to the package under migration and `RNFBDebug: true`. Load that package's full `packages/<pkg>/e2e/*.e2e.js` specs via committed `require.context` ([running e2e § local overrides](../testing/running-e2e.md#local-harness-overrides-harnessoverridesjs)).

| Package | Harness `modules` key | Typical e2e entry |
|---------|----------------------|-------------------|
| `app` | `app` | `packages/app/e2e/` |
| `auth` | `auth` | `packages/auth/e2e/` |
| `firestore` | `firestore` | `packages/firestore/e2e/` (may coexist with Pipeline specs — load package module only) |
| `functions` | `functions` | `packages/functions/e2e/` (reference; already migrated) |
| `in-app-messaging` | `inAppMessaging` | `packages/in-app-messaging/e2e/` |
| `app-distribution` | `appDistribution` | `packages/app-distribution/e2e/` |
| `installations` | `installations` | `packages/installations/e2e/` |
| `perf` | `perf` | `packages/perf/e2e/` |
| `ml` | `ml` | `packages/ml/e2e/` |
| Others | match `platformSupportedModules` key in [`tests/app.js`](../../../tests/app.js) | `packages/<pkg>/e2e/` |

**Harness key ≠ npm folder name** for camelCase entries (`inAppMessaging`, `appDistribution`, `remoteConfig`, …). Always copy the string from `tests/app.js` `platformSupportedModules` — wrong keys load zero specs or the wrong package ([Phase 2 review pitfall](migration-work-queue.md#current-snapshot)).

**Sanity check:** pass counts must match loaded scope — not full-app totals ([running e2e § gate](../testing/running-e2e.md#harness-narrowing-gate-blocking)).

**TurboModule `NativeModules` proxy:** package e2e that reads turbo shells directly (e.g. [`events.e2e.js`](../../../packages/app/e2e/events.e2e.js) → `NativeModules.NativeRNFBTurboApp`) requires the harness proxy in [`tests/globals.js`](../../../tests/globals.js) to route **`NativeRNFBTurbo*`** names through [`getReactNativeModule()`](../../../packages/app/lib/internal/nativeModuleAndroidIos.ts), not only the legacy `RNF*` prefix. Without that, the proxy returns a no-op stub and event tests hang. Durable committed wiring — not part of overrides narrowing ([NewArch-AD-13](architecture-decisions.md#newarch-ad-13)).

**Push state (committed):** full test app remains default for CI. Local `:test-cover` during migration uses area narrowing even when git has full harness.

**Phase R / coordinated break:** revert all narrowing; **full** tier 3-platform run before monorepo major ships ([change authoring § pre-merge-validation](../testing/change-authoring-workflow.md#work-types)).

## Phase S: sync conversion (forced-async → sync)

Runs **after** every native package is on TurboModules (Phases 0–5), **before** [Phase R](migration-work-queue.md#phase-table). Queue rationale and scope discriminator: [migration work queue § Phase S](migration-work-queue.md#phase-s-sync-conversion-forced-async--sync). This section owns the **procedure**.

**What it fixes:** Some RNFB methods are typed `Promise<T>` only because the legacy bridge made every call async — firebase-js-sdk's equivalent is synchronous. TurboModules support sync JSI methods, so those return to sync parity. These deltas are visible in `compare:types` configs as async-vs-sync differences.

**Per-package loop** (same [change authoring](../testing/change-authoring-workflow.md) work types; one focused commit per package):

1. **`gap-analysis`** — Read the package's `compare:types` config (`.github/scripts/compare-types/configs/<pkg>.ts`) for documented async-vs-sync differences. For each, apply the [scope discriminator](migration-work-queue.md#phase-s-sync-conversion-forced-async--sync): keep `Promise<T>` if the native work has real latency (network/disk/keychain/token); only convert pure bridge-forced async.
2. **`implementation`** — Declare the spec method sync (drop `Promise`) in `specs/NativeRNFBTurbo*.ts`; re-run `yarn codegen`; update the native shell to return synchronously (no resolver); update JS (`modular.ts`) to call sync; update types in `lib/`. **Unit-focused** tier.
3. **`independent-review`** — **area-focused** tier on a frozen tree; verify no consumer-visible behavior regressions beyond the intended async→sync change.
4. **`documentation`** — Remove the now-resolved entry from the package's `compare:types` config (the difference is gone); note the API change in the migration guide for the coordinated major.
5. **`commit`** — `refactor(<pkg>): return sync parity for bridge-forced async APIs` (or `feat(<pkg>):` if the public type change is the headline). One commit per package.

**Completion signal (per package):** the corresponding async-vs-sync entry is removed from the package's `compare:types` config and `yarn compare:types` is clean for that package ([validation checklist § type parity](../testing/validation-checklist.md#api-reference-and-type-parity)).

**Caution:** sync across JSI runs on the JS thread — never convert a method that does real I/O. When unsure, keep it async: over-converting is a perf/ANR risk; under-converting keeps the correct async signature but leaves a documented async→sync parity gap tracked in `compare:types` until resolved.

## TurboModule `documentation`

Per package (or per phase batch), same commit when user-facing:

**User docs**

* Migration guide update for coordinated New Architecture break (final phase only unless package already ships new-arch-only like `functions`)
* Package install notes if podspec/build requirements change

**OKF bundle maintenance**

* Update [migration work queue](migration-work-queue.md) gate rows when items close
* Record non-obvious codegen or null-serialization choices here or in queue historical notes — not only commit messages

## TurboModule `commit`

```text
feat(<pkg>)!: migrate <module-or-package> to TurboModules
```

Breaking change (`!`): TurboModule migration requires New Architecture; legacy bridge is removed per package.

**Never stage:** `tests/harness.overrides.js`, any `.only`, temporary sub-suite edits in `tests/app.js`.

Before `git commit`: [validation evidence package](../../testing/validation-checklist.md#validation-evidence-package) recorded; [coverage evidence package](../../testing/coverage-design.md#coverage-evidence-package) when lib/native bridge touched ([change authoring § commit](../../testing/change-authoring-workflow.md#commit)).

## Gotchas

* **macOS / web turbo name registration** — [`nativeModuleWeb.ts`](../../../packages/app/lib/internal/nativeModuleWeb.ts) registers JS-SDK shims by module name in the **registry object initializer** (not deferred to bottom-of-file calls) so `NativeRNFBTurbo*` names exist before `RNFBNativeEventEmitter` instantiates during circular imports. When [`APP_NATIVE_MODULE`](../../../packages/app/lib/internal/constants.ts) changes ([NewArch-AD-2](architecture-decisions.md#newarch-ad-2--naming-nativernfbturbo--accepted)), register **both** legacy `RNFBAppModule` and turbo keys. Missing registration → macOS **blank window** / `Native module NativeRNFBTurboApp is not registered` in `com.facebook.react.log:javascript`.
* **Events deferred** ([NewArch-AD-4](architecture-decisions.md#newarch-ad-4--events-deferred-to-phase-c--accepted)) — keep `RNFBRCTEventEmitter` / `nativeEvents` fan-out unless testing forces escalation.
* **Swift / ObjC interop** — TurboModule shell stays ObjC++; follow functions podspec patterns for `use_frameworks!` and non-framework builds.
* **Unified resolver** ([NewArch-AD-6](architecture-decisions.md#newarch-ad-6--unified-native-module-resolver--accepted)) — `TurboModuleRegistry.get` with `NativeModules` fallback in `packages/app`; fallback removed at Phase R.
* **`requiresMainQueueSetup` = `NO`** ([NewArch-AD-9](architecture-decisions.md#newarch-ad-9--requiresmainqueuesetup-returns-no--accepted)) — iOS shells must return `NO`; `YES` blocks sync methods and risks main-thread deadlock under TurboModules. Audit `getConstants`/init/`methodQueue` for genuine main-thread work as part of gap-analysis; dispatch only that work explicitly.
* **TurboModule JS enumeration & wrapping** ([NewArch-AD-8](architecture-decisions.md#newarch-ad-8--turbomodule-js-enumeration-forin--objectcreate--accepted) + [NewArch-AD-14](architecture-decisions.md#newarch-ad-14--native-module-wrapper-memoizing-lazy-proxy--accepted)) — prototype lazy loading means **`Object.keys` / spread / `Object.assign({}, host)` break method access** (`XYZ is not a function`). Enumerate with **`for...in`**; the module surface is a **memoizing lazy `Proxy`** (NewArch-AD-14), and multi-module packages use the **routing composite Proxy** ([NewArch-AD-14a](architecture-decisions.md#newarch-ad-14a--multi-host-merge-routing-composite-proxy-required-for-multi-module)) — **not** a flattened-onto-`{}` + `Object.freeze` object. Do not copy TurboModule hosts into `{}`. Use the wrapped surface by default; raw `getReactNativeModule` only per [NewArch-AD-18](architecture-decisions.md#newarch-ad-18--raw-vs-wrapped-resolver-policy--accepted).
* **Android cross-module native shared state** ([NewArch-AD-10](architecture-decisions.md#newarch-ad-10--cross-package-native-state-is-centralized-in-app-with-testable-apis--accepted)) — turbo shells may expose **`public static` fields** read by other packages' native code. Phase 0: **`NativeRNFBTurboApp.authDomains`** (populated on `initializeApp`; read by [`RCTConvertFirebase`](../../../packages/app/android/src/reactnative/java/io/invertase/firebase/common/RCTConvertFirebase.java) and [`ReactNativeFirebaseAuthModule`](../../../packages/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java)). Unregistered legacy bridge classes may **delegate** to the turbo shell — do not duplicate the map on legacy classes.
* **iOS auth-domain naming** — iOS keeps historical **`customAuthDomains`** + `getCustomDomain:` on the turbo shell ([`RNFBAppModule.mm`](../../../packages/app/ios/RNFBApp/RNFBAppModule.mm)); Android uses **`authDomains`** on [`NativeRNFBTurboApp`](../../../packages/app/android/src/reactnative/java/io/invertase/firebase/app/NativeRNFBTurboApp.java). Same semantics; intentional cross-platform naming carry-over.
* **Spec Promise typing (Android)** — Codegen Android methods take **`Promise` args** even when the legacy bridge was sync void. Example: Play Services helpers in [`NativeRNFBTurboUtils`](../../../packages/app/specs/NativeRNFBTurboUtils.ts) — declare `Promise<PlayServicesAvailability>` / `Promise<void>`; native resolves the promise.
* **Android codegen output path families** — always copy `android:codegen` `outputPath` from the target `package.json` (do not assume one layout). **`src/reactnative/java/.../generated`**: `app`, `firestore`, `perf`, `in-app-messaging`, `ml`. **`src/main/java/.../generated`**: `functions`, `installations`, `app-distribution`. `react-native.config.js` `cmakeListsPath` must match the same tree.
* **Duplicate generated trees** — a wrong initial `outputPath` or regen into a second folder leaves **two** `generated/` trees (e.g. `src/main/java` + `src/reactnative/java`, or `fiam/` + `in_app_messaging/`). Android then fails with `duplicate class: NativeRNFBTurbo*Spec`. Keep **one** canonical tree; delete stale dirs; align shell imports, `build.gradle` `sourceSets`, and `cmakeListsPath`.
* **Dead legacy shells** — unregistered legacy Java modules (e.g. [`ReactNativeFirebaseAppModule`](../../../packages/app/android/src/reactnative/java/io/invertase/firebase/app/ReactNativeFirebaseAppModule.java)) may remain temporarily when the package registers turbo shells only. **Not a Phase 0 blocker** — track deletion as follow-on cleanup once the turbo path is verified.
* **CMake macro vs test-app RN version** — see [registration checklist § row 5](#turbomodule-native-registration-checklist-blocking). `yarn codegen` uses root `@react-native/codegen`; if it emits `target_compile_reactnative_options` but the test app is still RN 0.78, replace with `target_compile_options` (copy from [`functions` CMakeLists](../../../packages/functions/android/src/main/java/io/invertase/firebase/functions/generated/jni/CMakeLists.txt)) before first `:test-cover`.
* **TurboModule constants (both platforms)** — legacy bridge exposed constants as enumerable keys on the module object. TurboModules require the full chain in [checklist rows 1, 6, 8](#turbomodule-native-registration-checklist-blocking): spec `getConstants()` → codegen → Android `getTypedExportedConstants` → iOS typed `ModuleConstants` + `_RCTTypedModuleConstants` → `withTurboConstants` in [`nativeModuleAndroidIos.ts`](../../../packages/app/lib/internal/nativeModuleAndroidIos.ts). Skipping the spec or leaving iOS on `NSDictionary *` produces **`undefined`** in constructors like `this._foo = this.native.isFoo` even when methods work. Packages without constants (`functions`, `installations`, …) skip the constants rows.
* **Android autolinking cache** — see checklist row **12**. `npx react-native config` can show the correct `cmakeListsPath` while `tests/android/build/generated/autolinking/autolinking.json` is still stale.
* **Metro `Requiring unknown module "undefined"`** — Metro runtime error when `require()` gets module id `undefined`. **Not** the same as native constant `undefined` or `Proxy target must be an Object`. Usually **stale Metro cache and/or partial refresh** after spec/codegen/`lib/**`/podspec changes while iOS/Android debug still loads a **live** bundle from `:8081` ([running e2e § stale toolchain](../testing/running-e2e.md#turbomodule-stale-toolchain-blocking)). A static `index.bundle` fetch can succeed while the simulator still shows the redbox — treat as toolchain staleness, not a missing `import`. Escalation: [full toolchain refresh](../testing/running-e2e.md#turbomodule-full-toolchain-refresh).
* **Codegen CLI cwd** — see [§ Running codegen](#running-codegen-canonical). Do not debug `unknown command 'codegen'` by patching package scripts; run from `tests/`.
* **phone-number-verification** — bypasses `createModuleNamespace`; wire spec + resolver directly in `modular.ts`.

Live phase status and arbiter gates: [migration work queue](migration-work-queue.md) (ephemeral).
