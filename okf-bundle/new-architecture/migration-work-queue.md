---
type: Reference
title: TurboModule migration work queue
description: Phase tracker for migrating React Native Firebase packages from legacy NativeModules to Codegen TurboModules under a coordinated New Architecture break.
tags: [new-architecture, turbomodule, codegen, migration, work-queue]
timestamp: 2026-06-26T00:00:00Z
---

# TurboModule migration — work queue

> **IN PROGRESS (2026-07-03):** Phase **S** — `convert` inventory complete; **S2** native-change follow-up queued ([§ Phase S2](#phase-s2-native-change-follow-up-gap-analysis-2026-07-03)). Phases 0–5, Docs/PD, and R are complete.
> **Goal/order:** app foundation → hard probe → easy wins → remaining complex → sync conversion → coordinated break → cleanup (events, shared-state encapsulation). Decisions: [architecture-decisions.md](architecture-decisions.md). Links: [implementation workflow](turbomodule-implementation-workflow.md), [change authoring](../testing/change-authoring-workflow.md), [functions reference](../../../packages/functions/) ([PR #8603](https://github.com/invertase/react-native-firebase/pull/8603)).

Ephemeral tracker; see [OKF policy](../documentation-policy.md).

---

## Locked decisions

Durable architectural decisions are owned by **[architecture-decisions.md](architecture-decisions.md)** (canonical, with rationale). Quick index of the *Accepted* ones:

| ADR | Decision |
|-----|----------|
| [NewArch-AD-1](architecture-decisions.md#newarch-ad-1--new-architecture-only--accepted) | New Architecture only — one coordinated semver major |
| [NewArch-AD-2](architecture-decisions.md#newarch-ad-2--naming-nativernfbturbo--accepted) | Naming: `NativeRNFBTurbo*` prefix |
| [NewArch-AD-3](architecture-decisions.md#newarch-ad-3--strong-codegen-typing--accepted) | Strong Codegen typing |
| [NewArch-AD-4](architecture-decisions.md#newarch-ad-4--events-deferred-to-phase-c--accepted) | Events deferred to [Phase C](#deferred-cleanup-phase-eventemitter) |
| [NewArch-AD-5](architecture-decisions.md#newarch-ad-5--commit-generated-code--accepted) | Commit generated code |
| [NewArch-AD-6](architecture-decisions.md#newarch-ad-6--unified-native-module-resolver--accepted) | Unified resolver; Phase R final state is TurboModule-only (no `NativeModules` fallback) |
| [NewArch-AD-7](architecture-decisions.md#newarch-ad-7--codegenconfigname--aggregate-library-name-one-codegenconfig-per-package--accepted) | `codegenConfig.name` = `RNFB<Package>TurboModules` (all packages) |
| [NewArch-AD-8](architecture-decisions.md#newarch-ad-8--turbomodule-js-enumeration-forin--objectcreate--accepted) | Enumerate with `for...in` + `Object.create` |
| [NewArch-AD-9](architecture-decisions.md#newarch-ad-9--requiresmainqueuesetup-returns-no--accepted) | `requiresMainQueueSetup` returns `NO` |
| [NewArch-AD-10](architecture-decisions.md#newarch-ad-10--cross-package-native-state-is-centralized-in-app-with-testable-apis--accepted) | Cross-package state centralized in `app` |
| [NewArch-AD-11](architecture-decisions.md#newarch-ad-11--multi-module-method-names-are-merged-uniqueness-enforced-by-test--accepted) | Multi-module method names unique (test-enforced) |
| [NewArch-AD-12](architecture-decisions.md#newarch-ad-12--one-commit-per-package--accepted) | One commit per package |
| [NewArch-AD-13](architecture-decisions.md#newarch-ad-13--test-harness-committed-defaults--gitignored-local-overrides--accepted) | Harness: committed defaults + gitignored overrides |
| [NewArch-AD-14](architecture-decisions.md#newarch-ad-14--native-module-wrapper-memoizing-lazy-proxy--accepted) | Memoizing lazy Proxy wrapper (+ NewArch-AD-14a composite) |
| [NewArch-AD-15](architecture-decisions.md#newarch-ad-15--constant-memoization-scope-static-only--accepted) | Memoize static constants only; dynamic → method |
| [NewArch-AD-18](architecture-decisions.md#newarch-ad-18--raw-vs-wrapped-resolver-policy--accepted) | Raw vs wrapped resolver policy |
| [NewArch-AD-19](architecture-decisions.md#newarch-ad-19--turbomodule-methodqueue-policy--accepted) | No `methodQueue` override by default |
| [NewArch-AD-13a](architecture-decisions.md#newarch-ad-13a--optional-overrides-need-a-resolver-stub-metro-dependency-map-integrity--accepted) | Harness overrides: Metro resolver stub when local file absent |
| [NewArch-AD-20](architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted) | Pin RN/Codegen toolchain to app RN; RN bump = coordinated break |

Implementation steps, harness, and commit rules: [turbomodule implementation workflow](turbomodule-implementation-workflow.md) — do not restate here.

---

## Resume checklist

Gate prerequisites before any `:test-cover` ([host rule](../testing/change-authoring-workflow.md#host-rule)):

1. [Pre-flight](../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): [host-clear probes](../testing/running-e2e.md#host-clear-probes), [services ready](../testing/running-e2e.md#2-services-ready), [harness matches validation tier](../testing/running-e2e.md#3-harness-matches-validation-tier) ([narrowing gate](../testing/running-e2e.md#harness-narrowing-gate-blocking) — required for **unit-focused** and **area-focused**; not [push harness](#harness)); [serial `:test-cover`](../testing/running-e2e.md#serialized-e2e-dispatch); [frozen tree](../testing/change-authoring-workflow.md#frozen-tree) for `independent-review`.
2. New Architecture enabled on dev host / emulator for native bridge work.
3. Per-package protocol: [Phase iteration protocol](#phase-iteration-protocol) below.

---

## What changes vs what stays

| Layer | Stays | Changes |
|-------|-------|---------|
| JS product API | `modular.ts`, web shims, `FirebaseModule` subclasses, arg prepending | `nativeModuleName` → `NativeRNFBTurbo*`; `turboModule: true` |
| Events (Phases 0–5) | Compile-time event names, `SharedEventEmitter` fan-out, `nativeEvents` | Native emitters unchanged — see [Phase C](#deferred-cleanup-phase-eventemitter) |
| Native | Firebase SDK integration, business logic | Extend generated `*Spec`; iOS `getTurboModule()`; podspec new-arch guard |
| Release | Per-package semver today | **One coordinated major** when Phases 0–5 complete |

---

## Reference pattern (`functions`)

Brief index — full checklist: [turbomodule implementation workflow](turbomodule-implementation-workflow.md).

Each migrated package repeats the [`functions`](../../../packages/functions/) shape: `specs/NativeRNFBTurbo*.ts` → `codegenConfig` + committed generated output → Android `NativeRNFBTurbo*` / iOS spec + `getTurboModule()` → JS `turboModule: true`.

**Phase 0 still required:** unified module resolver; flip `getAppModule()` turbo TODO in [`nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts).

---

## Deferred cleanup phase (EventEmitter)

Follow-on **after** Phases 0–5 and coordinated break. Not in scope unless testing blocks deferral.

| Topic | Current | Cleanup target |
|-------|---------|----------------|
| Event subscription | `RNFBNativeEventEmitter` + `RNFBAppModule` proxy | Codegen TurboModule events or RN New Architecture event emitters |
| Native emit | `RNFBRCTEventEmitter` / `ReactNativeFirebaseEventEmitter` | Align with chosen Codegen event pattern |
| JS fan-out | Fixed `nativeEvents` + `SharedEventEmitter` prefixes | Re-evaluate once native side supports typed events |

**Deferral discriminator:** if **area-focused** e2e or device testing shows TurboModule migration **cannot** work with the legacy event proxy, escalate that package's event path into the active migration PR — do not wait for Phase C.

**Messaging event-delivery e2e (Phase C — investigate before enabling):** `packages/messaging/e2e/messaging.e2e.js` foreground `onMessage()` delivery test stays **`xit`** (disabled since modular e2e consolidation, 2023). Un-skipping without a harness audit risks intermittent Android failures (`TestsAPI.messaging().sendToDevice` / FCM data payload; see [#8736](https://github.com/invertase/react-native-firebase/issues/8736), [#8670](https://github.com/invertase/react-native-firebase/issues/8670), [#8392](https://github.com/invertase/react-native-firebase/issues/8392)). Phase C must define stable pass criteria (device vs emulator, data-only vs notification+data, delegation settings) and broader event coverage (token refresh, notification-opened, iOS background timing vs `signalBackgroundMessageHandlerSet`) before re-enabling as a CI gate — per [NewArch-AD-4 § messaging testing requirement](architecture-decisions.md#messaging--defer-eventemitter-cutover-migrate-shell-only-in-phase-4).

---

## Package inventory

### No native bridge (out of scope)

| Package | Notes |
|---------|-------|
| `@react-native-firebase/ai` | Pure JS |
| `@react-native-firebase/vertexai` | Re-export over `ai` |

### Already migrated

| Package | TurboModule(s) | Status |
|---------|----------------|--------|
| `@react-native-firebase/functions` | `NativeRNFBTurboFunctions` | ✅ reference (`codegenConfig.name`: `RNFBFunctionsTurboModules` per [NewArch-AD-7](architecture-decisions.md#newarch-ad-7--codegenconfigname--aggregate-library-name-one-codegenconfig-per-package--accepted)) |

### Native packages — complexity summary

Android `@ReactMethod` counts approximate spec surface area. Multi-module: **one spec per legacy module** ([workflow § multi-module](turbomodule-implementation-workflow.md#multi-module-packages)).

#### Multi-module (Tier A)

| Package | Legacy modules | Events | Methods ≈ | Notes |
|---------|----------------|--------|-----------|-------|
| **database** | 5 modules (`RNFBDatabase*`) | 2 | ~22 | Transaction + sync listeners |
| **firestore** | 4 modules (`RNFBFirestore*`) | 4 | ~31 | Pipelines via `pipelineExecute`; listener IDs |

#### Single-module, high complexity (Tier B)

| Package | Legacy module | Events | Methods ≈ | Notes |
|---------|---------------|--------|-----------|-------|
| **auth** | `RNFBAuthModule` | 3 | **59** | Largest single spec |
| **messaging** | `RNFBMessagingModule` | 5–7 | 11 | Platform-conditional events; background iOS |

#### Single-module, moderate (Tier C)

| Package | Legacy module | Events | Methods ≈ |
|---------|---------------|--------|-----------|
| **storage** | `RNFBStorageModule` | 1 | 14 |
| **crashlytics** | `RNFBCrashlyticsModule` | 0 | 14 |
| **analytics** | `RNFBAnalyticsModule` | 0 | 11 |
| **remote-config** | `RNFBConfigModule` | 1 | 11 |
| **app-check** | `RNFBAppCheckModule` | 1 | 7 |
| **perf** | `RNFBPerfModule` | 0 | 7 |

#### Single-module, simple (Tier D)

| Package | Legacy module | Events | Methods ≈ | Notes |
|---------|---------------|--------|-----------|-------|
| **installations** | `RNFBInstallationsModule` | 0 | 3 | Smallest |
| **in-app-messaging** | `RNFBFiamModule` | 0 | 3 | |
| **app-distribution** | `RNFBAppDistributionModule` | 0 | 4 | |
| **ml** | `RNFBMLModule` | 0 | ~0 | Stub |
| **phone-number-verification** | `RNFBPnvModule` | 0 | 6 | Android-only; direct resolver |

#### Foundation (Phase 0)

| Package | Legacy modules | Notes |
|---------|----------------|-------|
| **app** | `RNFBAppModule`, `RNFBUtilsModule` (+ Android utils) | Event proxy; **blocker** for migration complete; first [multi-spec package](turbomodule-implementation-workflow.md#multi-spec-packages-app-precedent) |

---

## Phase ordering

Strategy: **foundation → hard probe → easy wins → remaining complex → sync conversion → coordinated break → cleanup (events, shared-state encapsulation)**.

Pick **one** of `firestore` or `auth` in Phase 1 (firestore = multi-module + pipelines; auth = max single-module spec).

### Phase table

| Phase | Focus | Status | Packages |
|-------|--------|--------|----------|
| **0** | App foundation + unified resolver | **done** | `app` |
| **0.1** | App modular type parity (`compare:types`) | **done** | `app` — [§ Phase 0.1](#phase-01-app-comparetypes) |
| **1** | Hard probe | **done** | `firestore` (multi-module + pipelines; NewArch-AD-14a composite) |
| **2** | Easy wins | **done** | `installations`, `perf`, `in-app-messaging`, `app-distribution`, `ml` |
| **3** | Moderate | **done** | `app-check`, `remote-config`, `analytics`, `crashlytics`, `storage` |
| **NB** | Interruption batch — JS infra/test/chore (standalone commits) | **done** | `app` resolver refactor+perf, shared contract-test helper, harness snapshot; `compare-types` **S0** — [§ interruption batch](#interruption-batch-standalone-commits) |
| **3.5** | Guardrails — spec↔native parity + codegen-drift CI (**gates 4**) | **done** | all migrated packages — [§ Phase 3.5](#phase-35-guardrails) |
| **4a** | messaging event decision — gap-analysis (**gates 4**) | **done** | `messaging` — [§ Phase 4a](#phase-4a-messaging-event-decision) |
| **Docs** | New-Architecture requirements + migration-doc consolidation | **done** | docs — [§ Phase Docs](#phase-docs-new-architecture-requirements-and-doc-consolidation) |
| **PD** | Platform-divergence documentation | **done** | multi-package JSDoc/docs — [§ Phase PD](#phase-pd-platform-divergence-documentation) |
| **4** | Remaining complex | **done** | `firestore`, `messaging`, `database`, `auth` |
| **5** | Android-only / misc | **done** | `phone-number-verification` |
| **S** | Sync conversion (forced-async → sync) | **convert done**; **S2** queued ([§ Phase S2](#phase-s2-native-change-follow-up-gap-analysis-2026-07-03)); prereq **S0** complete ([interruption batch](#interruption-batch-standalone-commits)) | [§ sync conversion](#phase-s-sync-conversion-forced-async--sync) |
| **R** | Pre-merge full validation | **done** | Revert harness narrowing; remove `NativeModules` fallback + throw test ([§ Phase R additions](#phase-r-additions)); [full tier](../testing/running-e2e.md#e2e-validation-tiers-unit-focused-area-focused-full) 3-platform before coordinated major |
| **C** | EventEmitter cleanup | deferred | All — [§ deferred cleanup](#deferred-cleanup-phase-eventemitter) |
| **E** | Shared-state encapsulation | deferred (optional) | `app` + readers — [§ Phase E](#phase-e-shared-state-encapsulation-optional) |

**Coordinated break:** consumer-facing major when Phases 0–5, **S**, and **R** complete (`functions` already new-arch-only). Phases **C** and **E** are optional post-break cleanup and do not gate the major.

---

## Phase S: sync conversion (forced-async → sync)

**Runs after Phases 0–5** (every native package on TurboModules), **before R**. Owner doc for procedure/discriminator: [implementation workflow § Phase S](turbomodule-implementation-workflow.md#phase-s-sync-conversion-forced-async--sync).

**Rationale:** Under the legacy bridge, *all* native calls were asynchronous. Some RNFB methods were therefore typed `Promise<T>` purely because the bridge forced it — even though the corresponding **firebase-js-sdk** API is **synchronous**. These show up in `compare:types` configs as documented async-vs-sync differences. TurboModules support **synchronous** methods across the JSI boundary, so those forced-async APIs can return to sync parity with firebase-js-sdk.

**Scope discriminator (only convert when ALL hold):**

1. The difference exists **solely** because the legacy bridge forced async — not because the native work is genuinely asynchronous (I/O, network, disk).
2. firebase-js-sdk's equivalent is synchronous (the `compare:types` config records the async-vs-sync delta).
3. The TurboModule spec method can be declared sync (no `Promise`) and the native shell can return synchronously on the JS thread without blocking on real I/O.

**Out of scope:** anything with real native latency (token fetches, network, disk, keychain). Forcing those sync would block JS — keep them `Promise<T>`.

**Per-package gate:** removing the corresponding `compare:types` config entry (the async-vs-sync difference is gone) is the completion signal for that package's Phase S item.

This is a **coordinated public-API change** (async→sync is observable to consumers) and ships in the same major as the migration — see [implementation workflow § Phase S](turbomodule-implementation-workflow.md#phase-s-sync-conversion-forced-async--sync).

### Gap-analysis (completed 2026-07-03)

The "keep async if it does network/IO/disk" rule in the discriminator **assumes** that where firebase-js-sdk is synchronous, the work is genuinely in-memory and non-blocking. That assumption is **unverified** and is the core thing the gap-analysis must establish. Open question to resolve:

> If firebase-js-sdk decided a method can be sync, why can't RNFB? Is it that the web SDK's sync method does **not** do blocking IO for that functionality (it works on in-memory/cached state, e.g. parsing a URL, returning a cached getter), whereas our native path would do real IO for the *same* result? Or could RNFB legitimately be sync too?

**Why sync-blocking-on-IO is still bad even if a sync API "looks" fine:** a synchronous JSI method runs **on the JS thread**. If it blocks on network/disk/keychain, it freezes JS (UI jank / ANR) — the web SDK's sync getters do not do that because they return in-memory state. So the test is not "is the web API sync" alone; it is "is the underlying work in-memory on **both** sides".

**The gap-analysis should produce, per candidate method, a table:**

| Column | What to record |
|--------|----------------|
| Method | RNFB API + package |
| compare:types signal | Is it currently recorded as an async-vs-sync delta? (note: `app` is registered as of Phase **0.1**; other packages may still be unregistered — do not treat the config list as the full candidate set) |
| firebase-js-sdk behavior | What the web SDK actually does under the hood — **in-memory/cached** vs **deferred IO**. Cite the SDK source. |
| RNFB native behavior | What our native shell does for the same result — pure in-memory (SDK getter, parse, cached field) vs real IO (network, disk, keychain, Play Services). |
| Verdict | `convert` (both in-memory) / `keep-async` (either side does real IO) / `needs-native-change` (web is in-memory but our native is needlessly IO and could be made in-memory) |

**Candidate sources:** the `compare:types` async-vs-sync entries **plus** a manual sweep of `Promise`-returning methods whose firebase-js-sdk equivalent is sync but which `compare:types` does not flag (e.g. unregistered packages or utils-only exports). The third verdict (`needs-native-change`) is the interesting one the user raised: cases where we are async only because our native implementation chose IO, not because the operation requires it.

**Inventory result (2026-07-03):**

| Verdict | Candidate(s) | Notes |
|---------|--------------|-------|
| `convert` | `app/registerVersion`; `auth/isSignInWithEmailLink`; `auth/TotpSecret.generateQrCodeUrl`; `perf` trace/http/screen `start`/`stop`; likely `database` `goOnline`/`goOffline` instance surface | Highest confidence: web/native behavior is parser, string construction, cached object, or in-memory SDK state. |
| `needs-native-change` | `analytics` fire-and-forget setters/events; `app-check/initializeAppCheck`; `firestore/initializeFirestore`; `storage` task controls; storage retry setters | Web APIs are sync or fire-and-forget, but RNFB native paths currently wrap async work or need behavior clarification before sync conversion. |
| `keep-async` | Firestore persistent cache index manager delete/enable/disable | Web returns `void` but starts real persistent-cache work; do not block JS thread. |

**Next slice:** `convert` inventory complete (2026-07-03). Remaining gap-analysis verdicts (`needs-native-change`, `keep-async`) are out of Phase S scope until native behavior is clarified or documented only.

### Phase S2: native-change follow-up (gap-analysis 2026-07-03)

Deep read-only analysis of **`needs-native-change`** and **`keep-async`** candidates after the `convert` inventory shipped. Canonical evidence table for discussion and future implementation slices. Compare-types `differentShape` entries for these methods carry **Phase S hint** phrases (short pointers only — this table holds the real state).

**Hint vocabulary (compare-types annotations):**

| Phrase | Meaning |
|--------|---------|
| *(none — entry removed)* | Phase S `convert` complete; no async-vs-sync delta |
| **Promise that could maybe sync-void+queue** | Web is sync/fire-and-forget; RN may return void after sync local state update + ordered background native dispatch |
| **Promise that could maybe sync-void+gate** | Web returns sync instance/state; RN must not return until in-memory settings visible to all later native entry points (or gate ops until background work completes) |
| **convert after native fix** | Native shell close to sync; fix semantics first (e.g. boolean return), then drop Promise |
| **keep-async: deferred persistent-cache IO** | Web `void` schedules real disk/index work; do not block JS; Promise may mean dispatch-only today |

**Executive summary:** Sync return while queueing background work is valid only when RNFB updates the same **synchronous observable state** web updates before return, or when the web API is truly fire-and-forget with no ordering dependency. Queue-only is insufficient when the next line of user code assumes the effect is visible (`initializeFirestore` settings, analytics ordering, upload retry times at task construction). Firestore persistent cache index manager methods are **`keep-async`**: web `void` schedules persistent-cache work; **`sync-void+gate`** would need a native completion signal RNFB does not expose today.

| Method | Package | compare:types | Web SDK (sync state before return?) | RNFB today | Verdict | Recommended path | Risks if forced sync void | Notes |
|--------|---------|---------------|-------------------------------------|------------|---------|------------------|---------------------------|-------|
| `logEvent` | analytics | `differentShape` | `void`; async pipeline; init/measurement ordering internal | Android `Tasks.call`; iOS direct | needs-native-change → sync-void+queue | Ordered fire-and-forget queue or direct native if SDK proven cheap | Unordered queue races with setters | Web does not expose completion |
| `setAnalyticsCollectionEnabled` | analytics | `differentShape` | `void`; ga-disable after init | Android `Tasks.call`; iOS direct | needs-native-change → sync-void+queue | Same ordered path as events | Events logged with old collection flag | |
| `setConsent` | analytics | `differentShape` | Sync init stash or immediate gtag | Android `Tasks.call`; iOS direct | needs-native-change → sync-void+queue | Serial queue shared with analytics calls | Immediate logEvent uses old consent | |
| `setDefaultEventParameters` | analytics | `differentShape` | Sync init stash or immediate gtag | Android `Tasks.call`; iOS direct | needs-native-change → sync-void+queue | **Clearest ordering requirement** | Next event misses defaults | |
| `setUserId` / `setUserProperties` | analytics | `differentShape` | Init-ordered or immediate gtag | Android `Tasks.call`; iOS direct | needs-native-change → sync-void+queue | Same analytics queue | Stale id/properties on next event | Android SDK source dive for direct-call safety |
| RNFB-only analytics helpers | analytics | `extraInRN` | N/A | Same native path | Not Phase S parity | Align if core analytics goes fire-and-forget | Public API break without web signal | Out of compare-types completion criteria |
| `initializeAppCheck` | app-check | `differentShape` | Sync provider/state install; token fetch background | JS awaits native configure | needs-native-change → sync-void+queue | Sync return after provider/refresh state installed | getToken/listeners race before provider ready | Native provider install source dive |
| `initializeFirestore` | firestore | `differentShape` | Returns instance; lazy config but ordered internally | JS awaits settings(); native prefs write async | needs-native-change → sync-void+gate | In-memory settings registry visible before return | Immediate writes/listeners with old settings | Queue-only insufficient |
| `UploadTask.pause/resume/cancel` | storage | `UploadTask` `differentShape` | Sync state machine + boolean | Android bool via Promise; iOS bool path incomplete | convert after native fix | Sync boolean from native task state | Lying about pause/cancel state | iOS shell review needed |
| `setMaxOperationRetryTime` / `setMaxUploadRetryTime` | storage | `extraInRN` + `FirebaseStorage` shape | Sync in-memory field update | JS field then native resolve | sync-void+queue / convert | Sync void; native before return | Upload task captures stale retry at construction | Upload retry stronger ordering than operation retry |
| `setMaxDownloadRetryTime` | storage | `extraInRN` | N/A (RN-only) | Same pattern | Not parity | Consistency if siblings change | RN-only API | |
| `enablePersistentCacheIndexAutoCreation` | firestore | `differentShape` | `void`; schedules persistent-cache work | Native resolves immediately; no completion hook | **keep-async** | Keep Promise or document dispatch-only | Queries/listeners race index config | |
| `disablePersistentCacheIndexAutoCreation` | firestore | `differentShape` | same | same | **keep-async** | same | Stale auto-creation until SDK finishes | |
| `deleteAllPersistentCacheIndexes` | firestore | `differentShape` | `void` + deferred disk/index work | same | **keep-async** | Do not Phase S convert | Immediate queries use old indexes | sync-void+gate needs native completion signal |

**Suggested implementation slices (when resumed):** PS-S2-storage-tasks (closest to convert) → PS-S2-analytics-queue → PS-S2-app-check-init → PS-S2-firestore-init; PS-S2-firestore-index = document/keep-async only.

---

## Phase E: shared-state encapsulation (optional)

**Optional post-break cleanup.** Decision owner: [NewArch-AD-10](architecture-decisions.md#newarch-ad-10--cross-package-native-state-is-centralized-in-app-with-testable-apis--accepted). Does **not** gate the coordinated major.

**Goal:** refactor the un-encapsulated cross-package shared-state items — bare `public static` fields read across packages — behind explicit, testable `app`-owned accessor methods, and audit that all inter-module state is genuinely centralized in `app` (not duplicated per package).

**Candidate state (from NewArch-AD-10):** `authDomains` / iOS `customAuthDomains`; and a survey of `ReactNativeFirebaseJSON` / `Meta` / `Preferences` / `UniversalFirebasePreferences` access patterns for anything that is a bare cross-package static rather than a method.

**Per-item loop:** standard [phase iteration protocol](#phase-iteration-protocol) (gap-analysis to inventory the statics + their readers → implementation to add accessors and migrate readers → independent-review → commit). Pure native refactor with no public API change; **area-focused** tier on the affected packages (`app` + each reader, e.g. `auth`). One commit per encapsulated item or per package, maintainer discretion.

**Completion signal:** no bare cross-package `public static` mutable shared state remains; every cross-package read goes through an `app`-owned accessor with a unit test.

---

## Phase 0.1: app compare:types

**Scope:** Register `@react-native-firebase/app` in [compare:types](../../../.github/scripts/compare-types/src/registry.ts); document all modular API deltas in [configs/app.ts](../../../.github/scripts/compare-types/configs/app.ts); fix reasonably fixable type drift in product code.

**Not in scope:** Phase S async→sync conversion (`registerVersion`, etc.) — document only unless trivial.

**Loop:** standard [phase iteration protocol](#phase-iteration-protocol) — `gap-analysis` (compare output) → `implementation` (config + type fixes) → `independent-review` (`yarn compare:types` green for `app`) → `commit`.

**Completion signal:** `yarn compare:types` reports zero undocumented differences for package `app`.

**Planned commit subject:** `test(app): add app module type comparison config`

---

## Interruption batch + inserted phases (2026-07-01)

Inserted before Phase 4 after a design/PR review. Ordering: **interruption batch** (standalone commits, any order — NB1 before NB2 as both touch `nativeModule.ts`) → **Phase 3.5** (gates 4) → **Phase 4a** (gates 4) → Phase 4. **Phase Docs** and **Phase PD** are opportunistic (Jest/markdown/typedoc only — no e2e host) and do **not** gate Phase 4. All items follow the [phase iteration protocol](#phase-iteration-protocol); one focused commit each ([one-commit-per-item](../testing/change-authoring-workflow.md#commit)).

### Interruption batch (standalone commits)

JS-layer / test / chore only — **no native bridge change** → `unit-focused` tier = **Jest** (+ `compare:types` for S0); **no e2e**. Run before Phase 3.5.

- **NB1 — `refactor(app): unify single-host TurboModule composite creation`.** Fold `getAppModule()`, `getStaticUtilsModule()`, and the single-host branch of `initialiseNativeModule()` in [`registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts) through one `createSingleHostComposite(namespace, moduleName)` helper (the N=1 case of the [NewArch-AD-14a](architecture-decisions.md#newarch-ad-14a--multi-host-merge-routing-composite-proxy-required-for-multi-module) routing composite). No behavior change. **Also stage the [`resource-monitor.sh`](../../../.github/workflows/scripts/resource-monitor.sh) `100644 → 100755` mode fix here** — it has no other natural home. Gate: `yarn tests:jest` (all `nativeModuleContract` + `app`) + `yarn lint:js`.
- **NB2 — `perf(app): reduce TurboModule resolver overhead`** (after NB1). In [`nativeModuleAndroidIos.ts`](../../../packages/app/lib/internal/nativeModuleAndroidIos.ts): cache the `RNFBDebug` debug `Proxy` per module instead of rebuilding it on every `getReactNativeModule()`; memoize non-function constant reads in the composite `get` trap ([`registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts)); add a comment documenting the intentional per-call `encodeNullValues` walk (leave behavior). Dev/JS-only, low-risk. Gate: Jest + `lint:js`.
- **NB3 — `refactor(app): extract shared TurboModule contract-test helper`.** New shared helper `assertTurboContract(config, methodFixtures)` (colocate in `packages/app/__tests__/` or a test-utils path) consumed by all 11 `packages/*/__tests__/nativeModuleContract.test.ts`; each package keeps only its `SPEC_METHODS` + per-method arg fixtures, with the `@react-native-firebase/app/dist/module/...` import centralized in the helper. Gate: `yarn tests:jest` — all contract tests still pass with unchanged assertions.
- **NB5 — `test: snapshot committed harness defaults`** (decision A). Jest snapshot/assertion that [`tests/globals.js`](../../../tests/globals.js) `RNFBDebug === false` and [`tests/app.js`](../../../tests/app.js) `platformSupportedModules` equals the full module set — catches committed narrowing on tracked files (`harness.overrides.js` is gitignored and cannot be committed). Confirm `mocha/no-exclusive-tests` (already active in [`eslint.config.mjs`](../../../eslint.config.mjs)) covers `.only`; only add `tests/**` to eslint scope if the snapshot alone is insufficient. Gate: `yarn tests:jest` + `yarn lint:js`.
- **S0 — `chore(compare-types): register remaining migrated packages`** (decision E). Register every unregistered package in [`registry.ts`](../../../.github/scripts/compare-types/src/registry.ts) at its **current** state — `analytics`, `crashlytics`, `in-app-messaging`, `app-distribution`, `ml`, `functions`, plus legacy-state `messaging`, `database`, `phone-number-verification` — each with a `configs/<pkg>.ts` documenting existing deltas so the run is green. Completes the Phase S candidate set ([§ Phase S gap-analysis](#gap-analysis-deferred--capture-only-do-not-size-yet)). Gate: `yarn compare:types` green.

### Phase 3.5: Guardrails

**Gates Phase 4.** Promotes [NewArch-AD-17](architecture-decisions.md#newarch-ad-17--spec-contract--parity-tests) items **#2 (spec↔native parity)** and **#3 (codegen-up-to-date)** from *Proposed* → *Accepted* (update the ADR statuses in this phase's commit).

- **Codegen-drift (decision C):** add a committed **`yarn codegen:verify`** script — runs `yarn codegen` for every migrated package then `git diff --exit-code` on `**/generated/**` — and wire it as a **new step in the existing CI lint job** (alongside `lint:js` / `lint:android` / `lint:ios:check`).
- **Spec↔native parity:** per package assert the spec method-name set equals the union of Android `@ReactMethod` + iOS `RCT_EXPORT_METHOD`, and (NewArch-AD-11) the union across a package's specs has no duplicates.
- **Commit rule (decision C — single concern):** if regenerating produces drift **or** parity finds a mismatch needing repair → **one `fix:` commit** (even across multiple modules) **with the guard test/script included**; if everything is already clean → one **`test:` commit** adding the guard. Tier: **Jest-only** for a pure test/script addition; if any package's generated code is regenerated (native artifact change), run that package's **area-focused** e2e before closing `review_gate`.

### Phase 4a: messaging event decision

Runs **immediately before** Phase 4 `messaging`. `gap-analysis` (read-only, **no commit**): determine whether `messaging` events work over the legacy `RNFBNativeEventEmitter` → app-proxy path under TurboModules — including iOS background / AppDelegate and headless JS — per the [NewArch-AD-4](architecture-decisions.md#newarch-ad-4--events-deferred-to-phase-c--accepted) deferral discriminator. **Output:** a recorded decision — *escalate messaging events into the Phase 4 PR* vs *defer to Phase C* — written into NewArch-AD-4 and the arbiter row Notes. No product edits; feeds Phase 4 scope.

### Phase Docs: New Architecture requirements and doc consolidation

Opportunistic (`documentation`; Jest/markdown only, does not gate Phase 4).

- **v26 New Architecture section:** grow [`docs/migrating-to-v26.mdx`](../../../docs/migrating-to-v26.mdx) (currently namespace-removal only) with a New Architecture section. First analyze whether a **single global notice** suffices — *"all native modules now require React Native's New Architecture; stay on the prior RNFB major if you cannot enable it"* — or whether any module needs a specific note. Include agent-usable enable steps (mirror the v24 `functions` section) and per-module notes only where a module deviates.
- **Consolidation (F5):** keep the **ADR + architecture** docs as the permanent set; consolidate the ephemeral "how-to-migrate" material where it reduces fragmentation without collapsing the durable/ephemeral split ([documentation policy](../documentation-policy.md)). One `docs:` commit. Gate: `yarn lint:markdown`, `yarn lint:spellcheck`.

### Phase PD: platform-divergence documentation

Opportunistic. `gap-analysis` → `documentation`. **Seed set (already known):** auth web-vs-native throwers + sync parsers (`getRedirectResult`, `setPersistence`, `ActionCodeURL.parseLink`, …); analytics/crashlytics **iOS-only** methods (`logTransaction`, `initiateOnDeviceConversionMeasurement*`); perf sync `initializePerformance`; database sync `goOffline`/`goOnline`/`getServerTime`. Gap-analysis completes the set across all packages. **Document each divergence in three places:** (1) JSDoc `@remarks` (flows through `yarn reference:api`), (2) the relevant migration guide, (3) the package `docs/` tree. Commit granularity: one `docs(<pkg>):` commit per package (or per batch). Gate: `yarn reference:api`, markdown lint.

### Phase R additions

Explicit Phase R gating requirements (decision B, [NewArch-AD-6](architecture-decisions.md#newarch-ad-6--unified-native-module-resolver--accepted) Phase R action):

- Remove the `?? NativeModules[moduleName]` fallback in [`nativeModuleAndroidIos.ts`](../../../packages/app/lib/internal/nativeModuleAndroidIos.ts) so a missing module **throws** instead of returning soft-`undefined`.
- **Test (both):** a **Jest** unit test asserting `getReactNativeModule` throws for an unknown name once the fallback is removed, **plus** an `app` **e2e** "unknown module throws" case. Both run at **full** tier / 3-platform as part of Phase R.

---

## Phase iteration protocol

Each package (or one legacy module within a multi-module package) follows **one** serial loop. No overlap. Work types: [change authoring workflow § work types](../testing/change-authoring-workflow.md#work-types).

| Step | Work type | Closes gate | Rules |
|------|-----------|-------------|-------|
| **1** | `gap-analysis` | — | Spec inventory + feasibility; read-only when export shape unclear |
| **2** | `baseline-capture` | — | Optional area-focused e2e baseline before large packages |
| **3** | `implementation` | `implementation` | Spec, codegen, native, JS; Jest + **unit-focused** tier on **every required platform** when native bridge touched ([platform coverage gate](../testing/running-e2e.md#platform-coverage-gate-blocking)); handoff includes e2e platform matrix or env blocker — Jest-only insufficient; `.only` / area narrowing OK locally; **no commit** |
| **4** | `independent-review` | `review` | **Frozen tree**; **area-focused** tier; no `.only`; [area harness](turbomodule-implementation-workflow.md#turbomodule-area-harness); serial [host rule](../testing/change-authoring-workflow.md#host-rule) |
| **5** | `documentation` | — | User docs + durable OKF when applicable |
| **6** | `commit` | `commit` | One focused commit only after `review_gate` closed |

Canonical commands: [validation checklist](../testing/validation-checklist.md), [serialized dispatch](../testing/running-e2e.md#serialized-e2e-dispatch).

Skip steps 1–2 when spec shape is known (most Tier D packages).

---

## Current snapshot

**Label:** `phase-s-sync-conversion` (2026-07-03)

**Next item:** Phase **S2** native-change follow-up — analysis queued; pick slice when resumed ([§ Phase S2](#phase-s2-native-change-follow-up-gap-analysis-2026-07-03))

**Current gates:** Phase S `convert` inventory **complete** (four commits on `new-architecture`). PS-S2-gap analysis **done** — implementation deferred.

**Host rule:** one `:test-cover` at a time — never parallel subagents with e2e.

**Arbiter gate:**


| Item | Code | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | `commit_subject` | Notes |
|------|------|----------------------|---------------|---------------|------------------|-------------------|------------------|-------|
| Design review | DR | n/a | n/a | n/a | done | none | none | ✅ Adversarial review complete. |
| Phase 0 `app` TurboModules | P0 | **closed** | **closed** | **closed** | done | `full` | `feat(app)!: migrate app modules to TurboModules incl general migration infra` | Committed 2026-06-30. |
| Phase 0.1 `app` compare:types | P0.1 | **closed** | **closed** | **closed** | done | `none` | `test(app): add app module type comparison config` | Committed 2026-06-30. |
| Phase 1 `firestore` TurboModules | P1 | **closed** | **closed** | **closed** | done | `area-focused` | `feat(firestore)!: migrate firestore to TurboModules` | Committed 2026-06-30. |
| Phase 2 `installations` | P2a | **closed** | **closed** | **closed** | done | `area-focused` | `feat(installations)!: migrate installations to TurboModules` | Committed 2026-06-30. Remediation: iOS `invalidate` no-op. |
| Phase 2 `perf` | P2b | **closed** | **closed** | **closed** | done | `area-focused` | `feat(perf)!: migrate perf to TurboModules` | Committed 2026-06-30. |
| Phase 2 `in-app-messaging` | P2c | **closed** | **closed** | **closed** | done | `area-focused` | `feat(in-app-messaging)!: migrate in-app-messaging to TurboModules` | Committed 2026-06-30. |
| Phase 2 `app-distribution` | P2d | **closed** | **closed** | **closed** | done | `area-focused` | `feat(app-distribution)!: migrate app-distribution to TurboModules` | Committed 2026-06-30. |
| Phase 2 `ml` | P2e | **closed** | **closed** | **closed** | done | `area-focused` | `feat(ml)!: migrate ml to TurboModules` | Committed 2026-06-30. |
| Phase 3 `app-check` | P3a | **closed** | **closed** | **closed** | done | `area-focused` | `feat(app-check)!: migrate app-check to TurboModules` | Committed 2026-06-30. |
| Phase 3 `remote-config` | P3b | **closed** | **closed** | **closed** | done | `area-focused` | `feat(remote-config)!: migrate remote-config to TurboModules` | Committed 2026-06-30. |
| Phase 3 `analytics` | P3c | **closed** | **closed** | **closed** | done | `area-focused` | `feat(analytics)!: migrate analytics to TurboModules` | Committed 2026-06-30. |
| Phase 3 `crashlytics` | P3d | **closed** | **closed** | **closed** | done | `area-focused` | `feat(crashlytics)!: migrate crashlytics to TurboModules` | Committed 2026-06-30. |
| Phase 3 `storage` | P3e | **closed** | **closed** | **closed** | done | `area-focused` | `feat(storage)!: migrate storage to TurboModules` | Committed 2026-06-30. |
| Interruption NB1 composite + mode fix | NB1 | **closed** | **closed** | **closed** | done | `unit-focused` (Jest) | `refactor(app): unify single-host TurboModule composite creation` | Committed 2026-07-01. `createSingleHostComposite`; resource-monitor 0755. Jest 41/41. |
| Interruption NB2 resolver perf | NB2 | **closed** | **closed** | **closed** | done | `unit-focused` (Jest) | `perf(app): reduce TurboModule resolver overhead` | Committed 2026-07-01. Debug proxy cache + constant memoization. Jest 41/41. |
| Interruption NB3 contract-test helper | NB3 | **closed** | **closed** | **closed** | done | `unit-focused` (Jest) | `refactor(app): extract shared TurboModule contract-test helper` | Committed 2026-07-01. `turboModuleContractHelper.ts`; 12 contract tests. Jest 15/15. |
| Interruption NB5 harness snapshot | NB5 | **closed** | **closed** | **closed** | done | `unit-focused` (Jest) | `test: snapshot committed harness defaults` | Committed 2026-07-01. `harnessCommittedDefaults.test.ts` (4 tests). |
| Phase S0 compare-types registration | S0 | **closed** | **closed** | **closed** | done | `none` (`compare:types`) | `chore(compare-types): register remaining migrated packages` | Committed 2026-07-01. 8 pkgs registered; compare:types 19/19 green. |
| Phase 3.5 guardrails | P3.5 | **closed** | **closed** | **closed** | done | `full` | `fix: add codegen verify and spec-native parity tests` | Committed `64f99c53d` 2026-07-02. |
| Phase 4a messaging event decision | P4a | n/a | n/a | n/a | done | `none` | none | **Defer** events to Phase C — [NewArch-AD-4 § messaging](architecture-decisions.md#messaging--defer-eventemitter-cutover-migrate-shell-only-in-phase-4). |
| Phase 4 `messaging` TurboModules | P4m | **closed** | **closed** | **closed** | done | `area-focused` | `feat(messaging)!: migrate messaging to TurboModules` | Turbo shell only (AD-4 event path preserved). Jest 38/38 + parity 32/32; codegen:verify incl messaging; legacy Java removed. iOS/Android area e2e green on method-call + listener-registration scope. Foreground `onMessage` delivery test **left `xit`** — flaky FCM harness; re-enable in [Phase C](#deferred-cleanup-phase-eventemitter). |
| Phase 4 `database` TurboModules | P4d | **closed** | **closed** | **closed** | done | `area-focused` | `feat(database)!: migrate database to TurboModules` | 5 Turbo specs/shells + committed codegen; Jest 49 + parity 38; area e2e macOS 213 / iOS 219 / Android 220 (delta logs `/tmp/rnfb-e2e-*-database-delta-review.log`). Remediation: invalidate/teardown parity (Reference+Transaction), onComplete guard, contract test 22 methods, jest mock cleanup. Orchestration: macOS/Android `:8090` pre-flight in `firebase.test.js` + OKF. **Deferred minor:** void spec vs Promise JS API; silent Query `RejectedExecutionException` post-invalidate. |
| Phase 4 `auth` TurboModules | P4u | **closed** | **closed** | **closed** | done | `area-focused` | `feat(auth)!: migrate auth to TurboModules` | 60-method spec + shells; review e2e macOS 171 / iOS 185 / Android 192. Follow-up committed: `fix(auth): rename delete turbo method for C++ codegen compatibility`. |
| Phase 5 `phone-number-verification` TurboModules | P5pnv | **closed** | **closed** | **closed** | done | `area-focused` | `feat(phone-number-verification)!: migrate phone-number-verification to TurboModules` | Android-only 6-method spec; AD-18 E10 direct resolver. Parity registered; later full Android Phase R proof covered the package path. |
| Phase Docs — NA reqs + consolidation | PDoc | **closed** | **closed** | **closed** | done | `none` | `docs: document all API gaps / platform divergence / migration items` | v26 NA section + platform table; lint/reference:api green. |
| Phase PD — platform divergence | PPD | **closed** | **closed** | **closed** | done | `none` | `docs: document all API gaps / platform divergence / migration items` | 19 pkg usage notes + JSDoc @remarks; serious review findings remediated in same commit. |
| Phase R — remove `NativeModules` fallback | PR-fallback | **closed** | **closed** | **closed** | done | `full` + RNFBDebug | `refactor: cleanup legacy arch native module fallback` | Proof 683/823/849 (`/tmp/rnfb-e2e-phaseR-proof-*.log`). Review 2026-07-03: no critical/serious. Android cold boot committed separately. |
| Phase S gap-analysis | PS-gap | n/a | n/a | n/a | done | `none` | none | Completed 2026-07-03. First implementation slice: `app/registerVersion`; follow-ups: auth parser/TOTP URL, then perf metric controls. |
| Phase S `app/registerVersion` sync parity | PS-app-registerVersion | **closed** | **closed** | **closed** | done | `area-focused` | `refactor(app): return sync parity for registerVersion` | Implemented 2026-07-03: `registerVersion(): void`, sync throw Jest assertion, removed stale `configs/app.ts` async-vs-sync entry. Green: `lerna:prepare`, `tsc:compile`, `tsc:compile:consumer`, focused app Jest 10/10, `reference:api`, `compare:types`, `lint:js`. Independent review: no findings; no e2e needed for type-only scope. |
| Phase S auth parser/TOTP sync parity | PS-auth-parsers | **closed** | **closed** | **closed** | done | `area-focused` | `refactor(auth): return sync parity for auth parsers` | Committed 2026-07-03. Sync `isSignInWithEmailLink` + `TotpSecret.generateQrCodeUrl`; native sync error shape; jest.setup; tests + e2e sync calls; compare-types + v26 doc. Validation: Jest 91/91, compare:types, lint, reference:api, codegen:verify exit 0. Android area e2e 159/15/0 (`/tmp/rnfb-e2e-android-auth-phaseS-final.log`). |
| Phase S perf metric controls sync parity | PS-perf-metrics | **closed** | **closed** | **closed** | done | `area-focused` | `refactor(perf): return sync parity for metric controls` | Sync trace/http/screen start/stop; Android *Sync helpers; iOS sync shells. Jest 10/10; compare:types, lint, reference:api green. Review e2e iOS/Android 60/2/0 (`/tmp/rnfb-e2e-*-perf-review.log`). macOS N/A (module skip). Remediation: perf usage docs await removed. |
| Phase S database connection sync parity | PS-database-online | **closed** | **closed** | **closed** | done | `area-focused` | `refactor(database): return sync parity for connection controls` | Sync turbo + instance goOnline/goOffline; Android direct SDK calls; e2e await removed on modular calls. Jest 52/52; codegen:verify exit 0. Review e2e macOS 181/10/0, iOS 182/9/0, Android 183/8/0 (`/tmp/rnfb-e2e-*-database-review.log`). |
| Phase S2 native-change gap-analysis | PS-S2-gap | n/a | n/a | n/a | done | `none` | none | Completed 2026-07-03. Full table [§ Phase S2](#phase-s2-native-change-follow-up-gap-analysis-2026-07-03); compare-types hint phrases updated. Implementation slices deferred (storage tasks closest). |

---

## Harness

Local `:test-cover` harness rules: [running e2e § harness + narrowing gate](../testing/running-e2e.md#harness-narrowing-gate-blocking). Push state stays full until Phase **R**.

---

## Workflow (each phase)

1. Pick package(s) for the phase from [phase table](#phase-table).
2. Follow [Phase iteration protocol](#phase-iteration-protocol) — never commit before `review_gate` closed; never overlap `:test-cover` ([host rule](../testing/change-authoring-workflow.md#host-rule)).
3. Update arbiter gate row when item closes.
4. Phase **R:** `pre-merge-validation` at **full** tier before coordinated major.

**Pitfalls:** iOS null-in-object on option maps ([workflow § gotchas](turbomodule-implementation-workflow.md#gotchas)); New Architecture must be enabled; do not combine language modernization (Kotlin/Swift) with bridge migration in the same PR.

---

## Related links

* [New Architecture index](index.md)
* [TurboModule implementation workflow](turbomodule-implementation-workflow.md)
* [Change authoring workflow](../testing/change-authoring-workflow.md)
* [Documentation policy](../documentation-policy.md)
