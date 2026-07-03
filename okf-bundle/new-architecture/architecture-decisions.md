---
type: Reference
title: New Architecture decisions (ADR)
description: Canonical owner of durable architectural decisions for the React Native Firebase TurboModule migration — the "what we decided and why". Other new-architecture docs reference this; they do not restate decisions.
tags: [new-architecture, turbomodule, architecture, decisions, adr]
timestamp: 2026-06-29T00:00:00Z
---

# New Architecture decisions (ADR)

**Canonical owner of durable architectural decisions** for the TurboModule migration. Each entry is a decision plus a brief rationale. Procedure lives in [implementation workflow](turbomodule-implementation-workflow.md); ephemeral phase/gate state lives in the [migration work queue](migration-work-queue.md). Those docs **link here** for the "why" — they do not copy decisions.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md). Durable decisions belong here; never in the ephemeral work queue.

## Decision ID convention

All decisions in this document use the **`NewArch-AD-<n>`** prefix (e.g. `NewArch-AD-7`, `NewArch-AD-14a`, `NewArch-AD-17.1`) so TurboModule migration ADRs are unambiguous from other architectural decision records elsewhere in the monorepo. Use this prefix in durable code comments and docs that cite these decisions — not bare `AD-<n>`.

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decided; implement to this. |
| **Proposed** | Recommended, awaiting maintainer sign-off; safe to plan around. |
| **Open** | Under analysis; do not lock in code until resolved. |

---

## NewArch-AD-1 — New Architecture only — **Accepted**

One coordinated semver major across the monorepo. No dual old/new bridge per package (`functions` precedent: v24). The legacy bridge interop layer remains available to consumers via RN itself, but RNFB ships TurboModule-only.

**Why:** A per-package dual-bridge would multiply native surface and testing. A single coordinated break is cheaper to build and reason about.

---

## NewArch-AD-2 — Naming: `NativeRNFBTurbo*` — **Accepted**

Codegen spec/module names use the `NativeRNFBTurbo*` prefix (`NativeRNFBTurboAuth`, `NativeRNFBTurboFirestore`, …). Spec files must be prefixed `Native` per RN Codegen.

**Why:** Disambiguates from legacy `RNFB*` module names during transition; satisfies Codegen's `Native*` spec-file requirement.

---

## NewArch-AD-3 — Strong Codegen typing — **Accepted**

Strong Codegen types wherever the API allows. Source of truth: `packages/*/lib/types/internal.ts`, native method inventories, firebase-js-sdk shapes. Use `Object` / open maps only where payloads are genuinely dynamic.

**Codegen-safe naming:** Spec methods and generated symbols must avoid language keywords or reserved identifiers across TypeScript, C++, Java, and ObjC++ targets. Known blockers from this migration: `delete` as a method name breaks generated native code, and TypeScript primitive `object` is rejected by RN Codegen for NativeModule specs (`TSObjectKeyword`). Procedure and the current reserved-word checklist live in [implementation workflow § Codegen-safe names and types](turbomodule-implementation-workflow.md#codegen-safe-names-and-types-blocking).

---

## NewArch-AD-4 — Events deferred to Phase C — **Accepted**

Keep the legacy event path (`RNFBNativeEventEmitter` → app-module proxy → `RNFBRCTEventEmitter` / `ReactNativeFirebaseEventEmitter` → `SharedEventEmitter` fan-out) under TurboModules. Defer Codegen EventEmitter cutover to [Phase C](migration-work-queue.md#deferred-cleanup-phase-eventemitter).

**Deferral discriminator:** if area-focused e2e or device testing shows a package's events cannot work over the legacy proxy under TurboModules, escalate that package's event path into its own migration PR rather than waiting for Phase C. **Highest risk:** `messaging` (background/iOS AppDelegate, headless JS task).

### messaging — defer EventEmitter cutover; migrate shell only in Phase 4

**Decision:** Phase 4 `messaging` migrates the **method-call TurboModule shell** only. Event emit/subscribe stays on the legacy proxy until [Phase C](migration-work-queue.md#deferred-cleanup-phase-eventemitter).

| Assertion | Primary source |
|-----------|----------------|
| Native emit sites do not use the messaging module bridge | iOS categories/delegates (`RNFBMessaging+AppDelegate.m`, `+UNUserNotificationCenter.m`, `+FIRMessagingDelegate.m`) call `RNFBRCTEventEmitter`; Android receiver/service/module call `ReactNativeFirebaseEventEmitter` |
| JS subscribes via the app-module proxy, not the messaging shell | `packages/messaging/lib/index.ts` — `nativeEvents` array → `RNFBNativeEventEmitter` → `NativeRNFBTurboApp` ([NewArch-AD-18 E1](architecture-decisions.md#newarch-ad-18--raw-vs-wrapped-resolver-policy--accepted)) |
| Android background (quit/killed) is outside the event-proxy path | `ReactNativeFirebaseMessagingHeadlessService` (`HeadlessJsTaskService`); `AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', …)` in `packages/messaging/lib/index.ts` |
| iOS background data messages couple shell method + event proxy | `RNFBMessaging+AppDelegate.m` — `signalBackgroundMessageHandlerSet` on shell, then `RNFBRCTEventEmitter` for `messaging_message_received_background` |
| iOS emitter implementation is legacy bridge API (Phase C debt) | `packages/app/ios/RNFBApp/RNFBRCTEventEmitter.m` — `bridge enqueueJSCall:@"RCTDeviceEventEmitter"` |

The deferral discriminator is **not** satisfied by structure alone: nothing in the messaging native tree requires EventEmitter cutover when the shell becomes a TurboModule.

**Testing requirement (Phase 4 review gate):** Messaging is the highest-risk legacy-proxy package. Area-focused e2e must be designed deliberately for **event delivery**, not only turbo method calls — foreground message receipt, token refresh, notification-opened, and (on iOS) background handler timing against `signalBackgroundMessageHandlerSet`. Device validation is required where the harness cannot automate FCM delivery or AppDelegate background races. Escalate event cutover into Phase 4 **only** if that testing proves the proxy fails. iOS `RCTRootView` / `addCustomPropsToUserProps` headless wiring is a separate shell implementation concern, not an event-path escalation trigger.

---

## NewArch-AD-5 — Commit generated code — **Accepted**

`includesGeneratedCode: true`; commit Codegen output under `android/.../generated` and `ios/generated`, mirroring `packages/functions`.

**Guard (NewArch-AD-17.3):** CI runs `yarn codegen:verify` — re-running `yarn codegen` for every migrated package then `git diff --exit-code` on `**/generated/**` — so committed artifacts can't go stale.

---

## NewArch-AD-6 — Unified native module resolver — **Accepted**

`packages/app/lib/internal/nativeModuleAndroidIos.ts` resolves `TurboModuleRegistry.get(name) ?? NativeModules[name]`.

**Why / semantics (researched, scope-limited):** In **bridgeless** mode with the **unified native-module proxy** (RN ≥ 0.74 New Architecture default; the repo's test app is RN 0.78 + `newArchEnabled`), both `TurboModuleRegistry.get(name)` and `NativeModules[name]` route through one unified, **cached** `nativeModuleProxy` (`BridgelessNativeModuleProxy` backing `global.nativeModuleProxy`, which *is* `NativeModules`) — so they return the **same instance** for a migrated module; the `??` cannot hand back two divergent wrappers. **Scope caveat (verified by design review):** this identity is confirmed for **bridgeless + unified proxy**; the bridged-New-Architecture path (`__turboModuleProxy` set without bridgeless) is a *different* lookup from bridged `NativeModules` lazy config and is **not verified** to share identity — RNFB targets bridgeless NA, so this is an untested edge, not a supported config. The `NativeModules` fallback is **load-bearing during Phases 1–5**: an unmigrated package's legacy module is null in `TurboModuleRegistry.get` and resolves via the interop-backed `NativeModules` (`legacyBinding_`).

**Phase R action:** remove the `NativeModules` fallback once all packages are migrated, so a missing module throws instead of returning soft-undefined.

---

## NewArch-AD-7 — `codegenConfig.name` = aggregate library name; one `codegenConfig` per package — **Accepted**

Each package has **one** `codegenConfig` whose `name` is an **aggregate library name** of the form `RNFB<Package>TurboModules` (e.g. `RNFBAppTurboModules`, `RNFBFunctionsTurboModules`, `RNFBFirestoreTurboModules`), **not** a module name. Multiple TurboModules in a package are listed under iOS `modulesProvider` (spec name → ObjC class) and live in the `specs/` dir; Android registers each shell in the package class. **One rule for every package**, single- and multi-spec alike — no degenerate exceptions.

**Why:** Multi-module packages (database ×5, firestore ×4) cannot name the library after one module, so the aggregate-library shape is mandatory for them; applying it everywhere gives a single rule reviewers can apply without thinking about spec count. The aggregate-library shape is the one RN documents and the one that generalizes.

**`functions` correction (one-time):** `functions` shipped with `codegenConfig.name: "NativeRNFBTurboFunctions"` (the *module* name). Rename to `RNFBFunctionsTurboModules` for consistency. **Downside: effectively none.** `codegenConfig.name` is the *generated-library* identifier (drives generated file/JNI/CMake target names) — it is **internal**, not a public/consumer symbol, and is **distinct from the module name** `NativeRNFBTurboFunctions` (the `RCT_EXPORT_MODULE` / `TurboModuleRegistry.get('NativeRNFBTurboFunctions')` key), which **stays unchanged**. The rename is mechanical: change `name`, re-run `yarn codegen`, delete the old generated files, update `react-native.config.js` `cmakeListsPath` if it embeds the old name, commit. Only risk is a build-wiring reference to the old library name; a clean codegen + build catches it. Track as a small standalone follow-up (low risk, no consumer impact).

**Gate:** every spec name appears as a `modulesProvider` key (iOS) and is registered in the package class (Android); `codegenConfig.name` matches `RNFB<Package>TurboModules`.

Reference: [`packages/app/package.json`](../../../packages/app/package.json) `codegenConfig`.

---

## NewArch-AD-8 — TurboModule JS enumeration: `for...in` + `Object.create` — **Accepted**

When wrapping or extending a native module, enumerate methods with **`for...in`** (not `Object.keys`) and extend with **`Object.create(host, descriptors)`** (never copy the host into a plain `{}` / spread / `Object.assign({}, host)`).

**Why:** TurboModules expose methods lazily on the **prototype**, which are non-own; `Object.keys`/spread see nothing and produce `XYZ is not a function`. Codegen methods **are** enumerable via `for...in` (confirmed), so `for...in` + `Object.create` both finds them and preserves the prototype. Reference: [RN enable-libraries § "XYZ is not a function"](https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-libraries.md#javascript-xyz--is-not-a-function-it-is-undefined), [facebook/react-native#43221](https://github.com/facebook/react-native/issues/43221).

Code: [`registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts), [`nativeModuleAndroidIos.ts`](../../../packages/app/lib/internal/nativeModuleAndroidIos.ts).

---

## NewArch-AD-9 — `requiresMainQueueSetup` returns `NO` — **Accepted**

iOS TurboModule shells return `NO` from `+ requiresMainQueueSetup`. Any genuinely main-thread/UIKit work in `getConstants`/init is dispatched explicitly to the main queue, not by forcing whole-module main-queue setup.

**Why:** Under TurboModules, `requiresMainQueueSetup = YES` makes the lazy module load run setup **synchronously on the main thread** — the JS thread blocks on main (deadlock risk under fling) **and synchronous methods are blocked** (which would block [NewArch-AD-16 Phase S](#newarch-ad-16--phase-s-asyncsync-conversion--open)). Reference: [RN #49957](https://github.com/facebook/react-native/pull/49957), [RN commit d7ac21c](https://github.com/facebook/react-native/commit/d7ac21cec5492e180fbf3817af7be64ab121cb75) (under TurboModules `getConstants` runs on the JS thread, not the main queue).

**Per-package audit (part of gap-analysis):** inventory each shell's `getConstants`/init and any `methodQueue` override for genuine main-thread/UIKit dependencies; default to `NO`; dispatch only the specific main-thread work that needs it.

**Phase 0 status — implemented (2026-06-29 re-implementation pass).** Both shells return `NO`; legacy `methodQueue = dispatch_get_main_queue()` overrides removed per [NewArch-AD-19](#newarch-ad-19--turbomodule-methodqueue-policy--accepted). Validate on-device during area-focused e2e if any method regresses.

---

## NewArch-AD-10 — Cross-package native state is centralized in `app`, with testable APIs — **Accepted**

`packages/app` is the home of cross-package native APIs and shared state (it always has been). This is acceptable; the goal is to **formalize** it: prefer explicit, testable accessors over bare `public static` fields, and ensure any inter-module state really is routed through `app` rather than duplicated per package.

**Known shared state to keep centralized:** `authDomains` / iOS `customAuthDomains` (read by `auth` + `RCTConvertFirebase`); `ReactNativeFirebaseJSON` / `Meta` / `Preferences` / `UniversalFirebasePreferences` (read by database, firestore, messaging, crashlytics, app-check); the event emitters (NewArch-AD-4 / Phase C). When a package migrates, it must keep reaching these `app`-owned singletons; do not fork a second copy.

**Direction:** treat the current `public static` maps as tolerated legacy carryover; a new cross-package channel should be an explicit app-owned API/singleton with tests, not a new public static.

**Encapsulation cleanup ([Phase E](migration-work-queue.md#phase-e-shared-state-encapsulation-optional), optional):** a post-migration pass that refactors the un-encapsulated shared-state items (bare `public static` maps such as `authDomains`) behind explicit, testable `app`-owned accessor methods, and audits that all inter-module state is genuinely centralized in `app`. Optional and deferrable — it does not block the coordinated break — but the canonical home for that work.

---

## NewArch-AD-11 — Multi-module method names are merged; uniqueness enforced by test — **Accepted**

Multiple specs/modules in one package are **merged flat** into a single resolved native object (so JS keeps calling `native.documentGet(...)` etc.). Method names must therefore be **globally unique across a package's specs**. Follow the existing `<area><Verb>` naming already in use (`documentGet`, `collectionGet`, `transactionBegin`, `aggregateQuery`, …) — which is why there are zero collisions today.

**Enforcement:** a build/test-time uniqueness assertion (part of NewArch-AD-17's contract test) asserts the union of method names across a package's specs has no duplicates. Optional `__DEV__` runtime guard in the merge loop warns on overwrite. We do **not** namespace sub-modules on the wire (would churn every call site).

---

## NewArch-AD-12 — One commit per package — **Accepted**

Convert a whole package (all its legacy modules → all its specs) in one `implementation → independent-review → commit` loop; land it as one `feat(<pkg>)!: migrate <pkg> to TurboModules` (breaking: New Architecture required). Multiple specs ≠ multiple commits — they share `codegenConfig`, generated artifacts, podspec/gradle guards, and JS wiring that only build and pass e2e together.

---

## NewArch-AD-13 — Test harness: committed defaults + gitignored local overrides — **Accepted**

`tests/globals.js` and `tests/app.js` keep the **committed defaults** (`RNFBDebug = false`, full `platformSupportedModules`, durable product wiring such as the `NativeRNFBTurbo*` resolver routing). Local per-run choices (`RNFBDebug = true`, a focused module list) live in a small **gitignored overrides file** that the harness reads if present.

**Why:** Durable product wiring (e.g. routing `NativeRNFBTurbo*` through the resolver) currently shares files with ephemeral narrowing, so a `git checkout` revert of narrowing also drops product wiring — this already happened once. It also bites human developers who narrow locally and then lose or accidentally commit it. Separating committed defaults from a gitignored overrides file makes the durable wiring un-revertable and the local narrowing impossible to commit.

**Mechanism:**

- Committed **`tests/harness.overrides.example.js`** — the shape demonstrator. Heavily commented for a human or agent: what each field means, valid values, and exactly what to paste to narrow modules / enable `RNFBDebug`. Exports an empty/no-op override so copying it changes nothing until edited.
- Gitignored **`tests/harness.overrides.js`** — the real local file; developers/agents copy the example to this name and edit it.
- `tests/globals.js` / `tests/app.js` read `harness.overrides.js` if present, else fall back to committed defaults. Because `tests/app.js` uses `require.context` (Metro static analysis), the override must express module narrowing as a **filter list the harness applies to the static set**, not a dynamic `require`.

**Ordering caution (do this in order):** add `tests/harness.overrides.js` to `.gitignore` **first** and verify it is ignored (`git check-ignore`), **then** create the local file — so the real overrides file can never be accidentally tracked. The committed example file (`harness.overrides.example.js`) must **not** be ignored.

### NewArch-AD-13a — Optional overrides need a resolver stub (Metro dependency-map integrity) — **Accepted**

The optional `require('./harness.overrides.js')` in `tests/app.js` / `tests/globals.js` sits in a `try/catch`, so Metro treats it as an **optional dependency**. When the gitignored file is **absent** (the default), Metro 0.81.x (RN 0.78) **omits the unresolved optional dependency from the requiring module's serialized dependency-id array** instead of inserting a placeholder. That shifts every later dependency index down by one and drops the module's **final** dependency — surfacing at runtime, during the very first `App()` render, as `Requiring unknown module "undefined"`. It is deterministic and independent of caches, `node_modules`, `lazy` bundling, and RN version; it was masked whenever a developer happened to have a local `harness.overrides.js` present, and it breaks any clean checkout / CI that runs e2e without one.

**Decision:** `tests/metro.config.js` `resolveRequest` resolves `./harness.overrides.js` to a **committed empty stub** (`tests/harness.overrides.stub.js` → `module.exports = {}`) whenever the local file does not exist; a present local override resolves normally. The dependency then always resolves, so the dependency map stays intact.

**Why not just commit a real `harness.overrides.js`:** keeping the override gitignored (AD-13) preserves "local narrowing can never be committed"; the resolver stub restores Metro integrity without giving that up. Keep the `try/catch` as defense-in-depth. The stub must never carry overrides.

---

## NewArch-AD-14 — Native-module wrapper: memoizing lazy `Proxy` — **Accepted**

The wrapper gives every native method: (1) **arg prepending** (`appName`, region/databaseId — the native bridge argument injection that lets product code call `firestore().collection(...)` without passing `appName`), (2) **error mapping** (native rejections → `NativeFirebaseError`), (3) **iOS null-encoding** for TurboModule object args. These responsibilities are mandatory product behavior.

**Decision:** wrap via a **memoizing lazy `Proxy`** — each method is wrapped+bound **on first call** and cached, instead of eagerly materializing every method at first touch.

**Why over eager:** eager builds all closures up front (auth ≈ 59, firestore ≈ 31 per cache key) and **defeats TurboModule prototype lazy loading**; the lazy Proxy preserves laziness (only pay for methods actually called), removes the eager `getConstants` rebuild on hot paths ([NewArch-AD-15](#newarch-ad-15--constant-memoization-scope-static-only--accepted)), and lets the `app`-path and `FirebaseModule`-path wrapping converge on one shape. The Proxy must enumerate via `for...in` and preserve the host prototype ([NewArch-AD-8](#newarch-ad-8--turbomodule-js-enumeration-forin--objectcreate--accepted)) — it must **not** flatten onto a frozen `{}` (that is the eager pattern being replaced).

**Coupling note:** the current `initialiseNativeModule` flatten-onto-`{}` + `Object.freeze` only works because eager wrapping pre-materializes own-enumerable methods. Moving to the Proxy means returning the Proxy (or a Proxy-backed object), **not** an `Object.assign`-ed frozen plain object. Update both the multi-module merge and the single-module path together.

### NewArch-AD-14a — Multi-host merge: routing composite Proxy (required for multi-module)

A single `Proxy` has **one** target/`[[Prototype]]`, so it cannot represent N independent TurboModule hosts (firestore ×4, database ×5) whose lazy methods live on **separate** prototype chains. The single-host Proxy is insufficient for multi-module packages, which **Phase 1 hits immediately** (`FirestoreStatics`, `DatabaseSyncTree`). Design the merge as a **routing composite Proxy**, not a flattened object:

1. **At init (metadata only, cheap):** `for...in` each raw host to build a `methodName → { host, key }` routing map. No wrapping/binding yet — just discover which host owns each name. (Method names are unique across a package's specs by [NewArch-AD-11](#newarch-ad-11--multi-module-method-names-are-merged-uniqueness-enforced-by-test--accepted), so the map has no collisions.)
2. **`get(name)` trap:** on first access, look up `{ host, key }`, wrap+bind from the **correct** host (arg-prepend + error-map + iOS null-encode), memoize the wrapped fn, return it. Preserves per-host prototype/laziness.
3. **`has` / `ownKeys` / `getOwnPropertyDescriptor`:** answer from the routing map (so `in`, `for...in`, and `Object.keys` over the merged surface behave).
4. **Drop the dead `multiModuleRoot[moduleName] = !!nativeModule` boolean flags** — they are written but never read in product code; if optional-module presence is ever needed, keep it in a side table, not on the callable surface.
5. **No `Object.freeze`** on the composite — immutability is provided by the Proxy traps (no `set`), not by freezing.

The single-module path is the degenerate N=1 case of the same composite (one host in the routing map). Implement both through the one mechanism. **NewArch-AD-17.1's contract test must include a 2-host merge fixture** even before firestore ships, since Phase 0 (`app`/`utils` are resolved as *separate* single-host surfaces) does **not** exercise this path.

---

## NewArch-AD-15 — Constant memoization scope: static only — **Accepted**

Memoize constants that are **static after init** (e.g. app `NATIVE_FIREBASE_APPS`, `FIREBASE_RAW_JSON`; iOS/file-path constants). Do **not** memoize constants that can change at runtime; expose those as **methods**, not cached constants.

**Why / coherency:** Memoization is JS-layer caching. For static native state a cached snapshot can't drift; for **dynamic** native state it can, with no native→JS invalidation signal.

**Constant taxonomy (classify each before caching):**

| Class | Examples | Caching rule |
|-------|----------|--------------|
| **bootstrap-only** | `NATIVE_FIREBASE_APPS` | Snapshot at bootstrap. JS never re-reads it today, so memoizing preserves current semantics — but document it as a bootstrap snapshot; runtime `initializeApp`/`deleteApp` will **not** be reflected (already true). |
| **build-time static** | `FIREBASE_RAW_JSON`, path constants (`DOCUMENT_DIRECTORY`, …) | Safe to memoize indefinitely. |
| **session-static** | `isRunningInTestLab` | Safe to memoize. |
| **dynamic** | `androidPlayServices` | **Never cache as a constant.** Expose as a method (`androidGetPlayServicesStatus()`); remove from the spec's `getConstants` typing when converted. |

**Hot-path bug to fix in the same pass:** `withTurboConstants` calls `getConstants()` on **every** `getReactNativeModule()` resolve — the exact rebuild NewArch-AD-14/NewArch-AD-15 target. And `messaging.isSupported()` currently reads the Play Services value via the **legacy** module name `RNFBUtilsModule` and the static constant — under turbo-only resolution that name returns nothing, so `isSupported()` breaks. Fix it to resolve `NativeRNFBTurboUtils` **and** read via the dynamic method, not the constant.

---

## NewArch-AD-16 — Phase S (async→sync conversion) — **Open**

Some RNFB methods are `Promise<T>` only because the legacy bridge forced async, while firebase-js-sdk is synchronous. TurboModules support sync JSI methods, so those can return to sync parity. Scope, discriminator, and the required gap-analysis live in [migration work queue § Phase S](migration-work-queue.md#phase-s-sync-conversion-forced-async--sync) and [implementation workflow § Phase S](turbomodule-implementation-workflow.md#phase-s-sync-conversion-forced-async--sync).

**Open question driving the gap-analysis:** the "keep async if it does network/IO/disk" rule assumes firebase-js-sdk's sync methods do **not** do blocking IO for the same functionality. That must be verified per method (does the web SDK do the work in-memory, or defer it?), because if web is genuinely sync-and-non-blocking, RNFB may be able to be sync too. Do not lock the conversion list until that inventory exists. Blocked by NewArch-AD-9 (`requiresMainQueueSetup = NO`) — sync methods require it.

---

## NewArch-AD-17 — Spec contract + parity tests — **Accepted**

Jest-level tests, reused across packages:

1. **Resolution/enumeration contract** — **Accepted.** A fixture that models a TurboModule (methods **non-own on the prototype**, constants own; `Object.keys(raw) === []`) and asserts every spec method is callable through the **real wrapper** (`getNativeModule`/`getAppModule`). Catches the NewArch-AD-8 enumeration class — and now the NewArch-AD-14 Proxy behavior — in sub-second Jest instead of 30-minute e2e. Build alongside the Phase 0 re-implementation. **Must include a 2-host merge fixture** (two mock TurboModule hosts, disjoint method sets) that exercises the [NewArch-AD-14a routing composite Proxy](#newarch-ad-14a--multi-host-merge-routing-composite-proxy-required-for-multi-module) — because Phase 0 (`app`/`utils` resolved as separate single-host surfaces) does not, yet Phase 1 (firestore/database) depends on it.

<a id="newarch-ad-171--jest-turbomodule-contract-test--accepted"></a>

### NewArch-AD-17.1 — Jest TurboModule contract test — **Accepted**

**Canonical file:** [`packages/app/__tests__/nativeModuleContract.test.ts`](../../../packages/app/__tests__/nativeModuleContract.test.ts)

**Describe block (grep anchor):** `TurboModule wrapper contract (NewArch-AD-17.1)`

**Scoped Jest command (review / implementer handoff):**

```bash
yarn tests:jest -- packages/app/__tests__/nativeModuleContract.test.ts
```

**Full suite** (`yarn tests:jest`) must also stay green — the contract test is part of the global Jest run, not a separate harness.

**Fixtures required in that file:**

| Case | Asserts |
|------|---------|
| TurboModule host shape | Methods non-own on prototype; `Object.keys(raw) === []` |
| Single-host wrapper | Every spec method callable via `getNativeModule()` |
| 2-host merge (NewArch-AD-14a) | Routing composite Proxy dispatches to the correct host per method name |

**When required:** any change to [`nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts), `withTurboConstants`, or TurboModule wrapper behavior — re-run the scoped command above before closing `implementation_gate` or `review_gate`.
2. **Spec↔native parity** — **Accepted.** Assert each package's spec method-name set equals the union of Android `@ReactMethod` (generated Java spec) and iOS TurboModule protocol methods (generated ObjC spec header), and (NewArch-AD-11) the union across a package's specs has no duplicate names.

<a id="newarch-ad-172--spec-native-parity-test--accepted"></a>

### NewArch-AD-17.2 — Spec↔native parity test — **Accepted**

**Canonical file:** [`packages/app/__tests__/turboModuleSpecNativeParity.test.ts`](../../../packages/app/__tests__/turboModuleSpecNativeParity.test.ts)

**Describe block (grep anchor):** `Spec↔native parity (NewArch-AD-17.2)`

**Scoped Jest command:**

```bash
yarn tests:jest -- packages/app/__tests__/turboModuleSpecNativeParity.test.ts
```

**Helper:** [`specNativeParityHelper.ts`](../../../packages/app/__tests__/specNativeParityHelper.ts) — parses TS spec interfaces, Android generated `*Spec.java` `@ReactMethod` names, and iOS generated `@protocol NativeRNFBTurbo*Spec` method names.

3. **Codegen-up-to-date CI** — **Accepted.** Root `yarn codegen:verify` runs [`scripts/codegen-verify.mjs`](../../../scripts/codegen-verify.mjs) (codegen for all 13 migrated packages via the `@react-native-firebase/app` React Native CLI context) then `git diff --exit-code` on `packages/*/android/**/generated/**` and `packages/*/ios/generated/**` (NewArch-AD-5 guard). Wired in the CI lint job ([`.github/workflows/linting.yml`](../../../.github/workflows/linting.yml)).

<a id="newarch-ad-173--codegen-verify-ci--accepted"></a>

### NewArch-AD-17.3 — Codegen verify CI — **Accepted**

**Command:** `yarn codegen:verify`

**When required:** any change to `packages/*/specs/**` or Codegen/RN version bumps that could regenerate native artifacts — run before closing `implementation_gate` or `review_gate`.

**Why:** The current Jest mocks are plain enumerable objects and structurally cannot reproduce the enumeration bug that already cost an iteration; these tests close that blind spot and make iterations faster and higher quality.

**Determinism requirement:** `codegen:verify` is only meaningful if `yarn codegen` is reproducible. It resolves the RN/Codegen toolchain at run time, so the toolchain **must** be pinned to the app's RN line ([NewArch-AD-20](#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted)); otherwise a host/CI with a drifted `@react-native/codegen` or `react-native` emits spurious drift (0.82/0.80 macros, podspec path changes) or masks real drift.

---

## NewArch-AD-18 — Raw vs wrapped resolver policy — **Accepted**

Two resolution surfaces exist and must be used deliberately:

- **Wrapped** (`getNativeModule(module)` / `getAppModule()` → the [NewArch-AD-14](#newarch-ad-14--native-module-wrapper-memoizing-lazy-proxy--accepted) Proxy): the **default** for all product calls. Gives arg-prepend, error mapping, iOS null-encoding.
- **Raw** (`getReactNativeModule(name)`): the **bare** native object from the unified resolver — no wrapping.

**Default rule:** new product code uses the **wrapped** surface. Raw access is allowed **only** when listed in the canonical exception table below (or after a gap-analysis finds a new legitimate case, documents it here, and adds an in-code rationale comment). Raw callers must use the **turbo** module name ([NewArch-AD-2](#newarch-ad-2--naming-nativernfbturbo--accepted)). Raw callers do **not** get error mapping — they must handle native errors themselves.

**Gap-analysis gate (every package):** as part of spec authoring, `grep` the repo for `getReactNativeModule(` in product code. For each hit: (1) is it already in the table below? (2) if not, is it a bug (legacy module name, should be wrapped)? (3) if genuinely new, add a row here with policy rationale **before** landing the PR. See [workflow § gap-analysis](turbomodule-implementation-workflow.md#spec-authoring-gap-analysis--pre-implementation).

### Canonical exception table

| # | Call site | Module name | Category | Why raw (policy) | Action |
|---|-----------|---------------|----------|------------------|--------|
| E1 | [`RNFBNativeEventEmitter.ts`](../../../packages/app/lib/internal/RNFBNativeEventEmitter.ts) (constructor, `addListener`, `removeAllListeners`, `removeSubscription`) | `NativeRNFBTurboApp` | **Permanent** | React Native's `NativeEventEmitter` must receive the **same raw host object** that implements `addListener` / `removeListeners` on the native side. Wrapping would break event subscription identity and the RN event-bridge contract. Deferred to [Phase C](migration-work-queue.md#deferred-cleanup-phase-eventemitter) for a typed Codegen event path. | Keep raw; turbo name. |
| E2 | [`nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts) `initialiseNativeModule` / `getAppModule` bootstrap | any | **Infrastructure** | The wrapper factory itself must read the bare host to build the [NewArch-AD-14](#newarch-ad-14--native-module-wrapper-memoizing-lazy-proxy--accepted) Proxy/composite. Not a product bypass. | N/A |
| E3 | [`nativeModuleAndroidIos.ts`](../../../packages/app/lib/internal/nativeModuleAndroidIos.ts) unified resolver | any | **Infrastructure** | Defines `getReactNativeModule`; applies `withTurboConstants` before returning. Not a product bypass. | N/A |
| E4 | [`tests/globals.js`](../../../tests/globals.js) `NativeModules` proxy getter | `RNF*` / `NativeRNFBTurbo*` | **Infrastructure** | E2e harness routes RNFB module names through the real unified resolver so specs that read `NativeModules.NativeRNFBTurboApp` (e.g. [`events.e2e.js`](../../../packages/app/e2e/events.e2e.js)) get a live module, not a stub. Durable product wiring — not harness narrowing. | Keep; part of Phase 0. |
| E5 | [`UtilsStatics.ts`](../../../packages/app/lib/utils/UtilsStatics.ts) `FilePath` getter | `NativeRNFBTurboUtils` | **Phase 0 fix** | Reads path **constants** synchronously from the utils host without a `FirebaseModule` instance (static getter on `Utils.Statics`). Raw was acceptable pre-turbo; under [NewArch-AD-15](#newarch-ad-15--constant-memoization-scope-static-only--accepted) migrate to a dedicated wrapped utils accessor (or memoized static read via resolver) so constants are not rebuilt per access. Turbo name is already correct. | Fix in Phase 0 re-implementation. |
| E6 | [`messaging/lib/index.ts`](../../../packages/messaging/lib/index.ts) `isSupported()` | ~~`RNFBUtilsModule`~~ → `NativeRNFBTurboUtils` | **Phase 0 fix (bug)** | Cross-package read of Play Services availability. Was using **legacy module name** (returns `undefined` under turbo-only) and a **dynamic constant** (`androidPlayServices`) that can go stale. Must use turbo name + **dynamic method** `androidGetPlayServicesStatus()` per [NewArch-AD-15](#newarch-ad-15--constant-memoization-scope-static-only--accepted). | **Must-fix** in Phase 0. |
| E7 | [`app/lib/modular.ts`](../../../packages/app/lib/modular.ts) `metaGetAll`, `jsonGetAll`, `preferences*` | `NativeRNFBTurboApp` | **Not an exception — migrate** | No policy reason for raw; these are app-module method calls with no arg-prepend skip. Should use **`getAppModule()`** (wrapped) for error mapping consistency. Listed here so gap-analysis catches them. | Migrate to `getAppModule()` in Phase 0. |
| E8 | [`FirestoreStatics.ts`](../../../packages/firestore/lib/FirestoreStatics.ts) `setLogLevel` | `NativeRNFBTurboFirestore` | **Phase 1 fix** | Cross-package static helper bypasses `FirebaseModule`/`getNativeModule`. Uses turbo main host via [`getStaticFirestoreMainModule()`](../../../packages/firestore/lib/internal/staticNativeModule.ts) (NewArch-AD-18 E8). Raw access retained — no wrapped surface for static helpers. | Done — firestore Phase 1. |
| E9 | [`DatabaseSyncTree.ts`](../../../packages/database/lib/DatabaseSyncTree.ts) `native` getter | `RNFBDatabaseQueryModule` | **Deferred — Phase 4** | Internal sync listener tree calls query module directly for low-latency sync ops, bypassing the merged multi-module surface. Acceptable until database migrates; then turbo name + evaluate whether wrapped merge surface suffices. | Fix when `database` migrates. |
| E10 | [`phone-number-verification/lib/index.ts`](../../../packages/phone-number-verification/lib/index.ts) `getNativeModule()` | `RNFBPnvModule` | **Deferred — Phase 5** | Package bypasses `createModuleNamespace` by design ([workflow § gotchas](turbomodule-implementation-workflow.md#gotchas)). Direct resolver is intentional; update to `NativeRNFBTurboPnv` on migration. | Fix when `phone-number-verification` migrates. |

**Adding a new exception:** gap-analysis must justify why wrapping breaks (not merely "it's convenient"). Update this table and add a one-line `// NewArch-AD-18 E<n>: <reason>` comment at the call site.

---

## NewArch-AD-19 — TurboModule `methodQueue` policy — **Accepted**

Default: **do not override `methodQueue`.** Remove legacy `- (dispatch_queue_t)methodQueue { return dispatch_get_main_queue(); }` overrides (present on `RNFBAppModule` and `RNFBUtilsModule`) unless a specific method genuinely needs the main thread — in which case dispatch *that method's* main-thread work explicitly (the `RCTUnsafeExecuteOnMainQueueSync` pattern already used in `initializeApp`), rather than forcing the whole module onto main.

**Why:** A module-wide `methodQueue = main_queue` couples every async method to the main thread (jank/contention) and is inconsistent with [NewArch-AD-9](#newarch-ad-9--requiresmainqueuesetup-returns-no--accepted) (`requiresMainQueueSetup = NO`). **Caveat (unverified):** how TurboModule JSI honors `methodQueue` for sync vs async methods is not documented; treat removal as a native change to validate on-device during Phase 0 re-implementation, not a blind delete. Keep explicit main dispatch only where UI (e.g. Play Services resolution dialogs) requires it.

---

## NewArch-AD-20 — Pin the RN/Codegen toolchain; RN bumps are coordinated breaking changes — **Accepted**

Committed generated native artifacts ([NewArch-AD-5](#newarch-ad-5--commit-generated-code--accepted)) are **RN-version-specific templates**: CMake `target_compile_options` vs `target_compile_reactnative_options`, podspec `RCT_SCRIPT_RN_DIR` paths / `add_rncore_dependency`, and JSI/spec signatures all change across RN releases. `yarn codegen` stamps whatever `@react-native/codegen` + `react-native` the toolchain resolves **at run time**. If that diverges from the test app's RN, codegen emits artifacts that mismatch the app → the native build breaks and [`codegen:verify`](#newarch-ad-173--codegen-verify-ci--accepted) becomes environment-nondeterministic.

**This happened:** root `"@react-native-community/cli": "latest"` hoisted `@react-native/codegen@0.82` (and pulled `react-native@0.82`), while `packages/functions` carried a stray `"react-native": "^0.80.1"` devDep — together producing spurious 0.82/0.80 drift (CMake macro flip, functions podspec path/`add_rncore_dependency` changes) that would break the RN 0.78 build if committed.

**Decision:**

- Pin the RN/Codegen toolchain to the app's RN line via root `resolutions` — `react-native`, `@react-native/codegen`, and `@react-native-community/cli` fixed to the app's line (currently `0.78.3` / `0.78.3` / `15.1.3`).
- **No floating specifiers** (`latest`, `*`, `^0.80`, …) for the RN toolchain in any workspace `package.json`. Individual packages must **not** declare their own `react-native` devDependency — rely on the hoisted, pinned version (as `app-check` / `storage` do).
- Treat a React Native upgrade as **one coordinated breaking change**: bump the app RN **and** the pinned `resolutions` together, regenerate all `generated/**`, rebuild native on iOS + Android, and re-run `codegen:verify` — in a single change. See the **Updating React Native** checklist in [CONTRIBUTING.md](../../CONTRIBUTING.md).

**Why:** makes generated output reproducible everywhere (local + CI), prevents silent native-build breaks, and makes the RN coupling explicit and auditable.

---

## Related docs

| Topic | Document |
|-------|----------|
| Procedure / how-to | [turbomodule-implementation-workflow.md](turbomodule-implementation-workflow.md) |
| Phase/gate/ephemeral state | [migration-work-queue.md](migration-work-queue.md) |
| Index | [index.md](index.md) |
| Change loop, gates, tiers | [change-authoring-workflow.md](../testing/change-authoring-workflow.md) |
| Doc/commit policy | [documentation-policy.md](../documentation-policy.md) |
